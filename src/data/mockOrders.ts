import { ParentOrder, CartItem, MerchantSubOrder } from '../types';
import { PRODUCTS } from './products';

// Seed Item 1
const item1: CartItem = {
  offeringId: 'off-sharma-atta',
  masterProductId: PRODUCTS[0].id,
  product: PRODUCTS[0],
  merchantId: 'store-sharma-kirana',
  merchantName: 'Sharmaji Kirana & Superstore',
  quantity: 2,
  mode: 'retail',
  unitPrice: 345,
  mrp: 385,
  totalPrice: 690,
  availabilityStatus: 'available',
  stockUpdatedAt: new Date().toISOString()
};

const item2: CartItem = {
  offeringId: 'off-sharma-toor',
  masterProductId: PRODUCTS[2].id,
  product: PRODUCTS[2],
  merchantId: 'store-sharma-kirana',
  merchantName: 'Sharmaji Kirana & Superstore',
  quantity: 2,
  mode: 'retail',
  unitPrice: 172,
  mrp: 195,
  totalPrice: 344,
  availabilityStatus: 'available',
  stockUpdatedAt: new Date().toISOString()
};

const item3: CartItem = {
  offeringId: 'off-sharma-paneer',
  masterProductId: PRODUCTS[8].id,
  product: PRODUCTS[8],
  merchantId: 'store-sharma-kirana',
  merchantName: 'Sharmaji Kirana & Superstore',
  quantity: 1,
  mode: 'retail',
  unitPrice: 420,
  mrp: 460,
  totalPrice: 420,
  availabilityStatus: 'available',
  stockUpdatedAt: new Date().toISOString()
};

const subOrder1: MerchantSubOrder = {
  id: 'NX-SO-89214-1',
  parentOrderId: 'NX-89214',
  merchantId: 'store-sharma-kirana',
  merchantName: 'Sharmaji Kirana & Superstore',
  items: [
    {
      offeringId: item1.offeringId,
      masterProductId: item1.masterProductId,
      productName: item1.product.name,
      packSize: item1.product.packSize,
      quantity: 2,
      unitPrice: 345,
      mrp: 385,
      totalPrice: 690,
      mode: 'retail',
      image: item1.product.image,
      isAvailable: true,
      substitutionStatus: 'original'
    },
    {
      offeringId: item2.offeringId,
      masterProductId: item2.masterProductId,
      productName: item2.product.name,
      packSize: item2.product.packSize,
      quantity: 2,
      unitPrice: 172,
      mrp: 195,
      totalPrice: 344,
      mode: 'retail',
      image: item2.product.image,
      isAvailable: true,
      substitutionStatus: 'original'
    },
    {
      offeringId: item3.offeringId,
      masterProductId: item3.masterProductId,
      productName: item3.product.name,
      packSize: item3.product.packSize,
      quantity: 1,
      unitPrice: 420,
      mrp: 460,
      totalPrice: 420,
      mode: 'retail',
      image: item3.product.image,
      isAvailable: true,
      substitutionStatus: 'original'
    }
  ],
  subtotal: 1454,
  originalSubtotal: 1600,
  savings: 146,
  deliveryFee: 0,
  status: 'packing',
  fulfilmentType: 'express',
  estimatedDelivery: 'In 18 minutes',
  timeline: [
    {
      timestamp: 'Today, 08:30 AM',
      status: 'placed',
      actor: 'Customer Checkout',
      note: 'Order confirmed and routed to Sharmaji Kirana'
    },
    {
      timestamp: 'Today, 08:33 AM',
      status: 'confirmed',
      actor: 'Ramesh Sharma (Owner)',
      note: 'Stock confirmed; order accepted'
    },
    {
      timestamp: 'Today, 08:40 AM',
      status: 'packing',
      actor: 'Kirana Staff',
      note: 'Handpicking items into eco-friendly bag'
    }
  ]
};

// Seed Wholesale B2B Item 4 & 5
const b2bItem1: CartItem = {
  offeringId: 'off-mandi-basmati',
  masterProductId: PRODUCTS[1].id,
  product: PRODUCTS[1],
  merchantId: 'store-yeshwanthpur-wholesale',
  merchantName: 'Mandi Direct Wholesale Traders',
  quantity: 10,
  mode: 'wholesale',
  appliedTier: PRODUCTS[1].bulkTiers?.[1],
  unitPrice: 685,
  mrp: 920,
  totalPrice: 6850,
  availabilityStatus: 'available',
  stockUpdatedAt: new Date().toISOString()
};

const b2bItem2: CartItem = {
  offeringId: 'off-mandi-sugar-50kg',
  masterProductId: PRODUCTS[9].id,
  product: PRODUCTS[9],
  merchantId: 'store-yeshwanthpur-wholesale',
  merchantName: 'Mandi Direct Wholesale Traders',
  quantity: 4,
  mode: 'wholesale',
  appliedTier: PRODUCTS[9].bulkTiers?.[0],
  unitPrice: 2150,
  mrp: 2450,
  totalPrice: 8600,
  availabilityStatus: 'available',
  stockUpdatedAt: new Date().toISOString()
};

const subOrder2: MerchantSubOrder = {
  id: 'NX-SO-B2B1049-1',
  parentOrderId: 'NX-B2B-1049',
  merchantId: 'store-yeshwanthpur-wholesale',
  merchantName: 'Mandi Direct Wholesale Traders',
  items: [
    {
      offeringId: b2bItem1.offeringId,
      masterProductId: b2bItem1.masterProductId,
      productName: b2bItem1.product.name,
      packSize: b2bItem1.product.packSize,
      quantity: 10,
      unitPrice: 685,
      mrp: 920,
      totalPrice: 6850,
      mode: 'wholesale',
      image: b2bItem1.product.image,
      isAvailable: true,
      substitutionStatus: 'original'
    },
    {
      offeringId: b2bItem2.offeringId,
      masterProductId: b2bItem2.masterProductId,
      productName: b2bItem2.product.name,
      packSize: b2bItem2.product.packSize,
      quantity: 4,
      unitPrice: 2150,
      mrp: 2450,
      totalPrice: 8600,
      mode: 'wholesale',
      image: b2bItem2.product.image,
      isAvailable: true,
      substitutionStatus: 'original'
    }
  ],
  subtotal: 15450,
  originalSubtotal: 18000,
  savings: 2550,
  deliveryFee: 150,
  status: 'out_for_delivery',
  fulfilmentType: 'truck_freight',
  estimatedDelivery: 'Today by 2:00 PM (Mini-truck)',
  timeline: [
    {
      timestamp: 'Yesterday, 04:15 PM',
      status: 'placed',
      actor: 'Annapurna Caterers',
      note: 'B2B commercial bulk order placed'
    },
    {
      timestamp: 'Yesterday, 04:45 PM',
      status: 'confirmed',
      actor: 'Mandi Direct Yard Manager',
      note: 'Verified mill sacks; GST input tax invoice issued'
    },
    {
      timestamp: 'Today, 09:30 AM',
      status: 'ready_for_pickup',
      actor: 'Mandi Dispatch Team',
      note: 'Loaded on pallet; mini-truck freight partner assigned'
    },
    {
      timestamp: 'Today, 10:15 AM',
      status: 'out_for_delivery',
      actor: 'Freight Logistics Partner',
      note: 'Out for delivery to Peenya Industrial Area'
    }
  ]
};

export const INITIAL_ORDERS: ParentOrder[] = [
  {
    id: 'NX-89214',
    date: 'Today, 08:30 AM',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    items: [item1, item2, item3],
    totalAmount: 1454,
    originalAmount: 1600,
    savings: 146,
    deliveryFee: 0,
    taxAmount: 73,
    finalPayable: 1454,
    orderType: 'retail',
    status: 'packing',
    storeId: 'store-sharma-kirana',
    storeName: 'Sharmaji Kirana & Superstore',
    deliveryAddress: {
      name: 'Priya Sundaram',
      phone: '+91 98451 44521',
      street: 'Flat 402, Green Glen Layout, Outer Ring Road',
      area: 'Indiranagar',
      city: 'Bengaluru',
      pincode: '560038',
      addressType: 'home'
    },
    paymentMethod: 'UPI (Google Pay)',
    paymentStatus: 'paid',
    paymentReference: 'PAY-NX-882194',
    estimatedDelivery: 'In 18 minutes',
    subOrders: [subOrder1]
  },
  {
    id: 'NX-B2B-1049',
    date: 'Yesterday, 04:15 PM',
    createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    items: [b2bItem1, b2bItem2],
    totalAmount: 15600,
    originalAmount: 18000,
    savings: 2550,
    deliveryFee: 150,
    taxAmount: 772,
    finalPayable: 15600,
    orderType: 'wholesale',
    status: 'out_for_delivery',
    storeId: 'store-yeshwanthpur-wholesale',
    storeName: 'Mandi Direct Wholesale Traders',
    deliveryAddress: {
      name: 'Vikram Joshi (Annapurna Caterers)',
      phone: '+91 99002 88471',
      street: 'Plot 18, Phase 2, Peenya Industrial Area',
      area: 'Peenya',
      city: 'Bengaluru',
      pincode: '560058',
      addressType: 'business',
      businessName: 'Annapurna Catering & Banquet Pvt Ltd',
      gstNumber: '29AABCA9012F1Z4'
    },
    paymentMethod: 'Net Banking (RTGS) / 15-Day Credit',
    paymentStatus: 'authorized',
    paymentReference: 'PAY-NX-991204',
    estimatedDelivery: 'Today by 2:00 PM (Mini-truck)',
    subOrders: [subOrder2]
  }
];
