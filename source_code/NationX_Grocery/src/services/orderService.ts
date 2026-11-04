// ============================================================================
// NATIONX GROCERY — MULTI-SHOP ORDER & SUBORDER SERVICE (Spec §5.2, §5.6, Tests 7, 12, 19)
// ============================================================================

import { CartItem, Order, SubOrder, OrderItemRecord, SubOrderStatus, DeliveryAddress } from '../types';
import { calculateOrderTotals } from './pricingService';
import { consumeReservation } from './inventoryService';

// In-memory runtime order store
const parentOrders = new Map<string, Order>();
const subOrders = new Map<string, SubOrder>();

export interface CreateOrderParams {
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: DeliveryAddress;
  cartItems: CartItem[];
  paymentMethod: string;
  paymentReference: string;
  reservationToken?: string;
}

/**
 * Creates one parent customer order and splits it into per-merchant suborders (Spec §5.2, Tests 7 & 8)
 */
export function createMultiShopOrder(params: CreateOrderParams): { parentOrder: Order; subOrders: SubOrder[] } {
  const { itemsTotal, originalTotal, totalSavings, taxAmount, deliveryFee, platformFee, finalPayableAmount, priceSnapshot } = 
    calculateOrderTotals(params.cartItems);

  const parentOrderId = `NX-${Math.floor(10000 + Math.random() * 90000)}`;
  const now = new Date().toISOString();

  // Group items by storeId (Spec §5.2: Separate merchant suborders for the relevant shops)
  const itemsByStore = new Map<string, CartItem[]>();
  params.cartItems.forEach(item => {
    const storeId = item.product.merchantId;
    const existing = itemsByStore.get(storeId) || [];
    existing.push(item);
    itemsByStore.set(storeId, existing);
  });

  const createdSubOrders: SubOrder[] = [];

  itemsByStore.forEach((storeItems, storeId) => {
    const subOrderId = `SUB-${parentOrderId}-${storeId.substring(0, 8)}`;
    const storeName = storeItems[0]?.product.merchantName || 'Local Kirana Store';

    let subtotal = 0;
    const itemRecords: OrderItemRecord[] = storeItems.map(item => {
      const lineTotal = item.unitPrice * item.quantity;
      subtotal += lineTotal;

      return {
        id: `item_${Math.random().toString(36).substring(2, 9)}`,
        subOrderId,
        productId: item.product.id,
        productName: item.product.name,
        brand: item.product.brand,
        packSize: item.product.packSize,
        unit: item.product.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        mrp: item.product.originalPrice,
        totalPrice: lineTotal,
        fulfillmentStatus: 'CONFIRMED'
      };
    });

    const subOrderTax = Math.round(subtotal * 0.05 * 100) / 100;

    const subOrder: SubOrder = {
      id: subOrderId,
      subOrderNumber: subOrderId,
      parentOrderId,
      storeId,
      storeName,
      items: itemRecords,
      subtotalAmount: subtotal,
      taxAmount: subOrderTax,
      status: 'RECEIVED', // Initial merchant incoming status (Spec §5.6)
      deliveryPartnerReference: `DEL-${subOrderId}`,
      sharedDeliveryStatus: 'PENDING_MERCHANT_ACCEPTANCE',
      createdAt: now
    };

    subOrders.set(subOrderId, subOrder);
    createdSubOrders.push(subOrder);
  });

  const primaryStore = params.cartItems[0]?.product.merchantId || 'multi-shop';
  const primaryStoreName = createdSubOrders.length === 1 
    ? createdSubOrders[0].storeName 
    : `${createdSubOrders.length} Local Merchant Stores`;

  const hasWholesale = params.cartItems.some(i => i.mode === 'wholesale');

  const parentOrder: Order = {
    id: parentOrderId,
    orderNumber: parentOrderId,
    date: 'Just now',
    items: [...params.cartItems],
    subOrders: createdSubOrders,
    totalAmount: finalPayableAmount,
    originalAmount: originalTotal,
    savings: totalSavings,
    deliveryFee,
    platformFee,
    orderType: hasWholesale ? 'wholesale' : 'retail',
    status: 'confirmed',
    storeId: primaryStore,
    storeName: primaryStoreName,
    deliveryAddress: params.deliveryAddress,
    paymentMethod: params.paymentMethod,
    paymentStatus: 'paid',
    paymentReference: params.paymentReference,
    estimatedDelivery: hasWholesale ? 'Today by 3:30 PM (Mandi Mini-Truck)' : 'Within 30-45 mins',
    priceSnapshot
  };

  parentOrders.set(parentOrderId, parentOrder);

  // Consume stock reservation if provided (Spec §5.4)
  if (params.reservationToken) {
    consumeReservation(params.reservationToken);
  }

  return { parentOrder, subOrders: createdSubOrders };
}

/**
 * Merchant updates fulfillment status of their suborder (Spec §5.6, Test 12)
 */
export function updateSubOrderStatus(
  subOrderId: string, 
  newStatus: SubOrderStatus, 
  rejectionReason?: string
): { success: boolean; subOrder?: SubOrder; error?: string } {
  const subOrder = subOrders.get(subOrderId);
  if (!subOrder) {
    return { success: false, error: 'Suborder not found' };
  }

  subOrder.status = newStatus;
  if (rejectionReason) {
    subOrder.rejectionReason = rejectionReason;
  }

  if (newStatus === 'READY_FOR_PICKUP') {
    subOrder.sharedDeliveryStatus = 'DISPATCH_READY';
  } else if (newStatus === 'HANDED_TO_DELIVERY') {
    subOrder.sharedDeliveryStatus = 'ON_ROUTE';
  } else if (newStatus === 'DELIVERED') {
    subOrder.sharedDeliveryStatus = 'DELIVERED';
  }

  return { success: true, subOrder };
}

/**
 * Merchant proposes product substitution requiring customer approval (Spec §5.6, Test 19)
 */
export function proposeItemSubstitution(
  subOrderId: string,
  itemId: string,
  substituteProductId: string,
  substituteProductName: string,
  newPrice: number
): { success: boolean; error?: string } {
  const subOrder = subOrders.get(subOrderId);
  if (!subOrder) return { success: false, error: 'Suborder not found' };

  const item = subOrder.items.find(i => i.id === itemId);
  if (!item) return { success: false, error: 'Item not found in suborder' };

  item.fulfillmentStatus = 'SUBSTITUTED';
  item.substitutedProductId = substituteProductId;
  item.customerApprovedSubstitution = false; // requires explicit customer approval

  return { success: true };
}

/**
 * Customer approves or rejects merchant substitution (Spec §5.6)
 */
export function handleCustomerSubstitutionDecision(
  subOrderId: string,
  itemId: string,
  approved: boolean
): boolean {
  const subOrder = subOrders.get(subOrderId);
  if (!subOrder) return false;

  const item = subOrder.items.find(i => i.id === itemId);
  if (!item) return false;

  if (approved) {
    item.customerApprovedSubstitution = true;
  } else {
    item.fulfillmentStatus = 'UNAVAILABLE';
    // Deduct unavailable item from suborder total
    subOrder.subtotalAmount -= item.totalPrice;
  }

  return true;
}

export function getAllParentOrders(): Order[] {
  return Array.from(parentOrders.values());
}

export function getSubOrdersForStore(storeId: string): SubOrder[] {
  return Array.from(subOrders.values()).filter(so => so.storeId === storeId);
}
