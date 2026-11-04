export type ShoppingMode = 'retail' | 'wholesale' | 'stores';

export interface BulkTier {
  minQty: number;
  pricePerUnit: number;
  label: string;
  discountPercent: number;
}

export interface Product {
  id: string;
  name: string;
  hindiName?: string;
  brand: string;
  category: string;
  subCategory: string;
  unit: string;
  packSize: string;
  retailPrice: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockQuantity: number;
  isOrganic?: boolean;
  isBestseller?: boolean;
  isLocalFarm?: boolean;
  isGiTagged?: boolean;
  origin: string;
  description: string;
  nutrition?: {
    energy: string;
    protein: string;
    carbs: string;
    fat: string;
  };
  tags: string[];
  bulkTiers?: BulkTier[];
  minWholesaleQty?: number;
  merchantId: string;
  merchantName: string;
  badge?: string;
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

export interface MerchantSuborder {
  id: string;
  storeId: string;
  storeName: string;
  storeArea?: string;
  items: CartItem[];
  subtotal: number;
  status: 'placed' | 'confirmed' | 'packing' | 'out_for_delivery' | 'delivered';
  estimatedDelivery?: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
  originalAmount: number;
  savings: number;
  orderType: 'retail' | 'wholesale';
  status: 'placed' | 'confirmed' | 'packing' | 'out_for_delivery' | 'delivered';
  storeId: string;
  storeName: string;
  suborders?: MerchantSuborder[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending';
  estimatedDelivery: string;
}

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

export interface QuotationRequest {
  id: string;
  date: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  gstNumber?: string;
  deliveryCity: string;
  frequency: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly';
  items: QuotationItem[];
  status: 'submitted' | 'under_review' | 'quoted' | 'accepted' | 'rejected';
  quotedPrice?: number;
  validUntil?: string;
  mandiNotes?: string;
}

export interface ParsedPurchaseItem {
  rawLine: string;
  matchedProduct?: Product;
  quantity: number;
  confidence: number;
  unit: string;
}
