import { CartItem, MerchantSuborder, Store } from '../types';
import { MERCHANTS } from '../data/merchants';

export interface PartitionOptions {
  orderId: string;
  defaultArea: string;
  defaultEta?: string;
  hasWholesaleItems?: boolean;
  merchantsCatalog?: Store[];
}

/**
 * Groups cart items by merchant and generates independent fulfilling suborders (PDF Section 5.2).
 */
export function partitionCartIntoSuborders(
  cart: CartItem[],
  options: PartitionOptions
): MerchantSuborder[] {
  const {
    orderId,
    defaultArea,
    defaultEta = '20 mins',
    hasWholesaleItems = false,
    merchantsCatalog = MERCHANTS
  } = options;

  const merchantMap = new Map<
    string,
    { merchantId: string; merchantName: string; items: CartItem[]; subtotal: number }
  >();

  cart.forEach(item => {
    const mId = item.product.merchantId || 'store-sharma-kirana';
    const mName = item.product.merchantName || 'Neighborhood Kirana';

    if (!merchantMap.has(mId)) {
      merchantMap.set(mId, {
        merchantId: mId,
        merchantName: mName,
        items: [],
        subtotal: 0
      });
    }
    const group = merchantMap.get(mId)!;
    group.items.push(item);
    group.subtotal += item.totalPrice;
  });

  return Array.from(merchantMap.values()).map((g, index) => {
    const storeMatch = merchantsCatalog.find(m => m.id === g.merchantId);
    return {
      id: `SUB-${orderId}-${index + 1}`,
      storeId: g.merchantId,
      storeName: g.merchantName,
      storeArea: storeMatch?.area || defaultArea,
      items: g.items,
      subtotal: g.subtotal,
      status: 'placed',
      estimatedDelivery: hasWholesaleItems
        ? 'Today by 3:30 PM (Mandi Mini-Truck)'
        : storeMatch?.deliveryTime || defaultEta
    };
  });
}

/**
 * Convenient alias for partitioning cart into merchant suborders.
 */
export function partitionCartByMerchant(
  cart: CartItem[],
  orderId: string = 'ORD-PARTITION-DEFAULT',
  defaultArea: string = 'Central Market'
): MerchantSuborder[] {
  return partitionCartIntoSuborders(cart, {
    orderId,
    defaultArea,
  });
}

