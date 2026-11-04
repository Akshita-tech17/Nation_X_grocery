// ============================================================================
// NATIONX GROCERY — MASTER TYPESCRIPT DEFINITIONS (Spec §1-§15)
// ============================================================================

export type ShoppingMode = 'retail' | 'wholesale' | 'stores';

// --- 1. Master Product Identity (Spec §3.1) ---
export interface CatalogProduct {
  id: string;
  name: string;
  teluguName?: string;
  hindiName?: string;
  brand: string;
  category: string;
  subCategory: string;
  variant?: string;
  packSize: string;
  unit: string;
  barcode?: string;
  hsnCode?: string;
  imageUrl: string;
  description: string;
}

// --- 2. Wholesale Price Tier (Spec §4.1, §6, §7.1 Path A) ---
export interface BulkTier {
  minQty: number;
  pricePerUnit: number;
  label: string;
  discountPercent: number;
}

// --- 3. Shop-Specific Product Offer (Spec §3.2, §4.1) ---
export interface MerchantOffer {
  id: string;
  storeId: string;
  productId: string;
  sellingPrice: number;
  mrp?: number;
  purchaseCost: number; // Restricted to authorized merchant users only (Spec §3.2, §12)
  availableStock: number;
  lowStockThreshold: number;
  minOrderQty: number;
  maxOrderQty?: number;
  isActive: boolean;
  isVisible: boolean;
  retailAvailable: boolean;
  wholesaleAvailable: boolean;
  bulkTiers?: BulkTier[];
}

// Consolidated UI Product (combines CatalogProduct + MerchantOffer for customer browsing)
export interface Product {
  id: string;
  name: string;
  teluguName?: string;
  hindiName?: string;
  brand: string;
  category: string;
  subCategory: string;
  unit: string;
  packSize: string;
  retailPrice: number;
  originalPrice: number;
  image: string;
  barcode?: string;
  inStock: boolean;
  stockQuantity: number;
  minOrderQty?: number;
  isOrganic?: boolean;
  isBestseller?: boolean;
  isLocalFarm?: boolean;
  isGiTagged?: boolean;
  origin: string;
  description: string;
  tags: string[];
  bulkTiers?: BulkTier[];
  minWholesaleQty?: number;
  merchantId: string;
  merchantName: string;
  badge?: string;
  purchaseCost?: number; // Masked for non-merchants
  rating?: number;
  reviewCount?: number;
  nutrition?: {
    energy: string;
    protein: string;
    carbs: string;
    fat: string;
  };
}

// --- 4. Merchant Store Profile (Spec §1, §3.2) ---
export interface Store {
  id: string;
  name: string;
  legalName?: string;
  gstin?: string;
  tagline: string;
  ownerName: string;
  type: 'kirana' | 'supermarket' | 'organic_depot' | 'wholesale_hub';
  distance: string;
  deliveryTime: string;
  minOrder: number;
  address: string;
  area: string;
  city: string;
  pincode: string;
  phone: string;
  image: string;
  isOpen: boolean;
  verified: boolean;
  features: string[];
  categoriesOffered: string[];
  isKhataEnabled?: boolean; // Spec §10
  isDeliveryEnabled?: boolean;
  isPickupEnabled?: boolean;
  rating?: number;
  reviewsCount?: number;
}

// --- 5. Cart Item (Spec §5.1) ---
export interface CartItem {
  product: Product;
  quantity: number;
  mode: 'retail' | 'wholesale';
  appliedTier?: BulkTier;
  unitPrice: number;
  totalPrice: number;
}

export interface DeliveryAddress {
  name: string;
  phone: string;
  street: string;
  area: string;
  city: string;
  pincode: string;
  addressType: 'home' | 'work' | 'business';
  businessName?: string;
  gstNumber?: string;
}

// --- 6. Parent Order and Suborders (Spec §5.2) ---
export type SubOrderStatus = 
  | 'RECEIVED'            // Incoming to merchant
  | 'ACCEPTED'            // Merchant confirmed
  | 'REJECTED'            // Merchant rejected
  | 'PACKING'             // Preparing items
  | 'READY_FOR_PICKUP'    // Staged for delivery / customer
  | 'HANDED_TO_DELIVERY'  // Dispatched to Shared Delivery
  | 'DELIVERED'           // Completed
  | 'CANCELLED';

export interface OrderItemRecord {
  id: string;
  subOrderId: string;
  productId: string;
  productName: string;
  brand: string;
  packSize: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  mrp?: number;
  totalPrice: number;
  fulfillmentStatus: 'CONFIRMED' | 'UNAVAILABLE' | 'SUBSTITUTED' | 'REJECTED';
  substitutedProductId?: string;
  customerApprovedSubstitution?: boolean;
}

export interface SubOrder {
  id: string;
  subOrderNumber: string;
  parentOrderId: string;
  storeId: string;
  storeName: string;
  items: OrderItemRecord[];
  subtotalAmount: number;
  taxAmount: number;
  status: SubOrderStatus;
  rejectionReason?: string;
  deliveryPartnerReference?: string;
  sharedDeliveryStatus?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  date: string;
  items: CartItem[];
  subOrders?: SubOrder[]; // Spec §5.2: Per-merchant suborders
  totalAmount: number;
  originalAmount: number;
  savings: number;
  deliveryFee?: number;
  platformFee?: number;
  orderType: 'retail' | 'wholesale';
  status: 'placed' | 'confirmed' | 'packing' | 'out_for_delivery' | 'delivered';
  storeId: string;
  storeName: string;
  deliveryAddress: DeliveryAddress;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentReference?: string;
  estimatedDelivery: string;
  priceSnapshot?: Record<string, unknown>;
}

export interface Category {
  id: string;
  name: string;
  teluguName?: string;
  hindiName?: string;
  icon: string;
  image: string;
  itemCount: number;
  description: string;
}

// --- 7. BulkBuy B2B Quotations (Spec §7.2 Path B) ---
export interface QuotationItem {
  commodity: string;
  quantity: string;
  unit: string;
  targetPrice?: number;
}

export interface QuotationRequest {
  id: string;
  rfqNumber?: string;
  date: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  gstNumber?: string;
  deliveryCity: string;
  deliveryPincode?: string;
  frequency: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly';
  items: QuotationItem[];
  status: 'submitted' | 'under_review' | 'quoted' | 'accepted' | 'rejected' | 'expired';
  quotedPrice?: number;
  validUntil?: string;
  mandiNotes?: string;
  tareWeightKg?: number;
  freightTerms?: string;
  acceptedOrderId?: string; // Spec §7.2: Prevents duplicate orders on repeated acceptance (Test 16)
}

// --- 8. Path C Assisted Purchase List Entry (Spec §7.3) ---
export interface ParsedPurchaseItem {
  rawLine: string;
  matchedProduct?: Product;
  quantity: number;
  confidence: number;
  unit: string;
  isUncertain?: boolean; // Flagged for customer review
  userCorrected?: boolean;
}

// --- 9. Authoritative Inventory Ledger & Reservation (Spec §4.3, §5.4, §9) ---
export interface InventoryReservation {
  id: string;
  token: string;
  storeId: string;
  productId: string;
  quantity: number;
  status: 'RESERVED' | 'CONSUMED' | 'RELEASED' | 'EXPIRED';
  expiresAt: string;
}

export interface InventoryLedgerEntry {
  id: string;
  storeId: string;
  productId: string;
  movementType: 
    | 'PURCHASE_RECEIPT'
    | 'POS_SALE'
    | 'ONLINE_RESERVED'
    | 'ONLINE_CONSUMED'
    | 'ONLINE_RELEASED'
    | 'RETURN_RESTOCK'
    | 'DAMAGED_EXPIRED'
    | 'RECONCILIATION_ADJUSTMENT';
  quantityDelta: number;
  resultingBalance: number;
  referenceType: 'SUB_ORDER' | 'RESERVATION' | 'POS_BILL' | 'MANUAL_AUDIT';
  referenceId: string;
  createdAt: string;
}

// --- 10. Payment Transaction & Idempotency (Spec §5.5) ---
export interface PaymentTransaction {
  id: string;
  transactionReference: string;
  parentOrderId: string;
  amount: number;
  currency: string;
  idempotencyKey: string;
  status: 'INITIATED' | 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REFUNDED';
  failureCode?: string;
  failureMessage?: string;
  retryCount: number;
  createdAt: string;
}
