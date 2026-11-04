export type ShoppingMode = 'retail' | 'wholesale' | 'stores';

export type AvailabilityStatus = 'available' | 'low_stock' | 'unavailable' | 'unconfirmed';

export interface BulkTier {
  minQty: number;
  pricePerUnit: number;
  label: string;
  discountPercent: number;
}

/**
 * Master Product Identity (Shared across all merchants/shops)
 * Represents the universal canonical item, e.g. Aashirvaad 5kg Sharbati Atta
 */
export interface MasterProduct {
  id: string;
  name: string;
  hindiName?: string;
  brand: string;
  category: string;
  subCategory: string;
  variant?: string;
  unit: string;
  packSize: string;
  image: string;
  barcode?: string;
  description: string;
  nutrition?: {
    energy: string;
    protein: string;
    carbs: string;
    fat: string;
  };
  origin: string;
  isOrganic?: boolean;
  isBestseller?: boolean;
  isLocalFarm?: boolean;
  isGiTagged?: boolean;
  tags: string[];
}

/**
 * Shop-Specific Product Offering
 * One MasterProduct can have multiple offerings from different Kiranas / Mandi Hubs
 * with independent prices, stock, wholesale slabs and availability.
 */
export interface ShopProductOffering {
  id: string; // Offering ID (e.g. 'off-sharma-aashirvaad-5kg')
  masterProductId: string;
  merchantId: string;
  merchantName: string;
  sellingPrice: number; // Customer retail selling price
  mrp: number; // Maximum Retail Price printed on pack
  purchaseCost?: number; // Restricted to authorized merchant view only!
  stockQuantity: number;
  stockUpdatedAt: string; // ISO timestamp or formatted time
  availabilityStatus: AvailabilityStatus;
  freshnessHoursThreshold?: number; // Configurable threshold (e.g. 72h) before marked unconfirmed
  wholesaleTiers?: BulkTier[];
  minWholesaleQty?: number;
  promotion?: {
    discountPercent?: number;
    description?: string;
    validUntil?: string;
  };
  fulfilmentOptions: Array<'express' | 'standard' | 'pickup' | 'truck_freight'>;
  visibilityStatus: 'active' | 'hidden';
  rating: number;
  reviewCount: number;
}

/**
 * Composite Product Model
 * Enriched view combining MasterProduct details with active ShopProductOffering.
 * Maintains complete backwards compatibility with existing UI components.
 */
export interface Product extends MasterProduct {
  offeringId?: string;
  masterProductId?: string;
  retailPrice: number; // Current shop's selling price
  originalPrice: number; // Current shop's MRP
  purchaseCost?: number; // Authorized merchant-only!
  inStock: boolean;
  stockQuantity: number;
  availabilityStatus: AvailabilityStatus;
  stockUpdatedAt?: string;
  isStaleInventory?: boolean;
  merchantId: string;
  merchantName: string;
  minWholesaleQty?: number;
  bulkTiers?: BulkTier[];
  badge?: string;
  rating: number;
  reviewCount: number;
  allOfferings?: ShopProductOffering[]; // Other merchants selling this master product
}

export interface Store {
  id: string;
  name: string;
  tagline: string;
  ownerName: string;
  type: 'kirana' | 'supermarket' | 'organic_depot' | 'wholesale_hub';
  rating: number;
  reviewsCount: number;
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
}

/**
 * Multi-Shop Cart Item
 * Retains exact offering reference, merchant details, unit price and confirmed price.
 */
export interface CartItem {
  offeringId: string;
  masterProductId: string;
  product: Product;
  merchantId: string;
  merchantName: string;
  quantity: number;
  mode: 'retail' | 'wholesale';
  appliedTier?: BulkTier;
  unitPrice: number;
  mrp: number;
  totalPrice: number;
  availabilityStatus: AvailabilityStatus;
  stockUpdatedAt?: string;
  isStaleInventory?: boolean;
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

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'packing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'partially_fulfilled'
  | 'delivered'
  | 'cancelled';

export type ParentOrderStatus = OrderStatus;

export interface OrderTimelineEvent {
  timestamp: string;
  status: OrderStatus;
  actor: string;
  note: string;
}

export interface SubstitutionProposal {
  id: string;
  originalItemId: string;
  originalProductName: string;
  originalQuantity: number;
  originalPrice: number;
  substituteOfferingId?: string;
  substituteProductName: string;
  substituteQuantity: number;
  substitutePrice: number;
  reason: string;
  status: 'pending_customer_approval' | 'approved' | 'rejected';
  proposedAt: string;
  respondedAt?: string;
}

export interface SubOrderItem {
  offeringId: string;
  masterProductId: string;
  productName: string;
  packSize: string;
  quantity: number;
  unitPrice: number;
  mrp: number;
  totalPrice: number;
  mode: 'retail' | 'wholesale';
  image?: string;
  isAvailable: boolean;
  substitutionStatus?: 'original' | 'substituted' | 'removed';
  substitutionDetails?: SubstitutionProposal;
}

/**
 * Merchant Suborder
 * Fulfillable by an individual shopkeeper. Tracks independent lifecycle.
 */
export interface MerchantSubOrder {
  id: string; // e.g. 'NX-SO-1001-SHARMA'
  parentOrderId: string;
  merchantId: string;
  merchantName: string;
  items: SubOrderItem[];
  subtotal: number;
  originalSubtotal: number;
  savings: number;
  deliveryFee: number;
  status: OrderStatus;
  fulfilmentType: 'express' | 'standard' | 'pickup' | 'truck_freight';
  estimatedDelivery: string;
  substitutionsProposed?: SubstitutionProposal[];
  timeline: OrderTimelineEvent[];
  rejectionReason?: string;
}

/**
 * Parent Order (Customer Order)
 * Represents the overall checkout containing one or more merchant suborders.
 */
export interface ParentOrder {
  id: string; // e.g. 'NX-PO-20261104-1001'
  date: string;
  createdAt: string;
  items: CartItem[]; // Consolidated items for customer view
  totalAmount: number;
  originalAmount: number;
  savings: number;
  deliveryFee: number;
  taxAmount: number;
  finalPayable: number;
  orderType: 'retail' | 'wholesale' | 'mixed';
  status: OrderStatus;
  storeId: string; // Primary store or 'MULTI_MERCHANT'
  storeName: string;
  deliveryAddress: DeliveryAddress;
  paymentMethod: string;
  paymentStatus: 'pending' | 'authorized' | 'paid' | 'failed' | 'refunded';
  paymentReference?: string;
  estimatedDelivery: string;
  subOrders: MerchantSubOrder[];
}

/**
 * Alias for backward compatibility with existing components
 */
export type Order = ParentOrder;

export interface Category {
  id: string;
  name: string;
  hindiName?: string;
  icon: string;
  image: string;
  itemCount: number;
  description: string;
}

export interface QuotationItem {
  commodity: string;
  quantity: string;
  unit: string;
  targetPrice?: number;
}

export interface QuotationOffer {
  id: string;
  quotationRequestId: string;
  merchantId: string;
  merchantName: string;
  items: Array<{
    commodity: string;
    quantity: string;
    unit: string;
    quotedUnitPrice: number;
    lineTotal: number;
    notes?: string;
  }>;
  totalQuotedPrice: number;
  validUntil: string; // ISO date string
  paymentTerms: string;
  deliveryTerms: string;
  mandiNotes?: string;
  status: 'active' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
}

export interface QuotationRequest {
  id: string;
  customerId?: string;
  date: string;
  createdAt: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  gstNumber?: string;
  deliveryCity: string;
  frequency: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly';
  items: QuotationItem[];
  status: 'submitted' | 'under_review' | 'quoted' | 'accepted' | 'rejected' | 'expired';
  quotations: QuotationOffer[];
  acceptedQuotationId?: string;
  resultingOrderId?: string;
  // Legacy fields for backward compatibility
  quotedPrice?: number;
  validUntil?: string;
  mandiNotes?: string;
}

export interface ParsedPurchaseItem {
  id: string;
  rawLine: string;
  matchedMasterProductId?: string;
  matchedOfferingId?: string;
  matchedProduct?: Product;
  matchedShopId?: string;
  matchedShopName?: string;
  quantity: number;
  unit: string;
  packSize?: string;
  confidence: number;
  isUncertain: boolean;
  manualCorrectionNeeded: boolean;
  userConfirmed: boolean;
}
