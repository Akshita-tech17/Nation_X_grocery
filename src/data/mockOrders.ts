import { Order } from '../types';
import { PRODUCTS } from './products';

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'NX-89214',
    date: 'Today, 08:30 AM',
    items: [
      {
        product: PRODUCTS[0], // Aashirvaad Atta
        quantity: 2,
        mode: 'retail',
        unitPrice: 345,
        totalPrice: 690
      },
      {
        product: PRODUCTS[2], // Tata Sampann Toor Dal
        quantity: 2,
        mode: 'retail',
        unitPrice: 172,
        totalPrice: 344
      },
      {
        product: PRODUCTS[8], // Amul Paneer
        quantity: 1,
        mode: 'retail',
        unitPrice: 420,
        totalPrice: 420
      }
    ],
    totalAmount: 1454,
    originalAmount: 1600,
    savings: 146,
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
    estimatedDelivery: 'In 18 minutes'
  },
  {
    id: 'NX-B2B-1049',
    date: 'Yesterday, 04:15 PM',
    items: [
      {
        product: PRODUCTS[1], // India Gate Basmati
        quantity: 10,
        mode: 'wholesale',
        appliedTier: PRODUCTS[1].bulkTiers?.[1],
        unitPrice: 685,
        totalPrice: 6850
      },
      {
        product: PRODUCTS[9], // Dhampur Sugar 50kg
        quantity: 4,
        mode: 'wholesale',
        appliedTier: PRODUCTS[9].bulkTiers?.[0],
        unitPrice: 2150,
        totalPrice: 8600
      }
    ],
    totalAmount: 15450,
    originalAmount: 18000,
    savings: 2550,
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
    paymentStatus: 'paid',
    estimatedDelivery: 'Today by 2:00 PM (Mini-truck)'
  }
];

