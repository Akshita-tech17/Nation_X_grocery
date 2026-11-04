import { describe, it, expect } from 'vitest';
import { partitionCartIntoSuborders } from './orderPartitioning';
import { CartItem, Product } from '../types';

const productSharma: Product = {
  id: 'prod-atta',
  name: 'Aashirvaad Atta 5kg',
  brand: 'Aashirvaad',
  category: 'staples-atta',
  subCategory: 'Atta',
  unit: '5kg bag',
  packSize: '5kg',
  retailPrice: 285,
  originalPrice: 310,
  image: '/atta.jpg',
  rating: 4.8,
  reviewCount: 100,
  inStock: true,
  stockQuantity: 50,
  origin: 'MP',
  description: 'Atta',
  tags: ['staples'],
  merchantId: 'store-sharma-kirana',
  merchantName: 'Sharmaji Kirana & Superstore'
};

const productAnnapurna: Product = {
  id: 'prod-ghee',
  name: 'Pure Desi Gir Cow Vedic Ghee',
  brand: 'Vedic Cow',
  category: 'oils-ghee',
  subCategory: 'Ghee',
  unit: '1L glass jar',
  packSize: '1L',
  retailPrice: 1650,
  originalPrice: 1800,
  image: '/ghee.jpg',
  rating: 4.9,
  reviewCount: 88,
  inStock: true,
  stockQuantity: 20,
  origin: 'Gujarat',
  description: 'Bilona ghee',
  tags: ['organic', 'dairy'],
  merchantId: 'store-annapurna-organic',
  merchantName: 'Annapurna Organic Depot & Farm Fresh'
};

describe('Multi-Shop Suborder Partitioning Engine (PDF Section 5.2)', () => {
  it('creates a single suborder when all items belong to one kirana', () => {
    const singleStoreCart: CartItem[] = [
      {
        product: productSharma,
        quantity: 2,
        mode: 'retail',
        unitPrice: 285,
        totalPrice: 570
      }
    ];

    const suborders = partitionCartIntoSuborders(singleStoreCart, {
      orderId: 'NX-10001',
      defaultArea: 'Indiranagar',
      defaultEta: '18 mins'
    });

    expect(suborders).toHaveLength(1);
    expect(suborders[0].id).toBe('SUB-NX-10001-1');
    expect(suborders[0].storeId).toBe('store-sharma-kirana');
    expect(suborders[0].items).toHaveLength(1);
    expect(suborders[0].subtotal).toBe(570);
    expect(suborders[0].status).toBe('placed');
  });

  it('partitions a multi-shop cart into distinct, independent fulfilling suborders', () => {
    const multiStoreCart: CartItem[] = [
      {
        product: productSharma,
        quantity: 3,
        mode: 'retail',
        unitPrice: 285,
        totalPrice: 855
      },
      {
        product: productAnnapurna,
        quantity: 1,
        mode: 'retail',
        unitPrice: 1650,
        totalPrice: 1650
      }
    ];

    const suborders = partitionCartIntoSuborders(multiStoreCart, {
      orderId: 'NX-89214',
      defaultArea: 'Indiranagar',
      defaultEta: '20 mins',
      hasWholesaleItems: false
    });

    expect(suborders).toHaveLength(2);

    const sharmaSub = suborders.find(s => s.storeId === 'store-sharma-kirana');
    const annapurnaSub = suborders.find(s => s.storeId === 'store-annapurna-organic');

    expect(sharmaSub).toBeDefined();
    expect(sharmaSub?.subtotal).toBe(855);
    expect(sharmaSub?.items[0].product.name).toBe('Aashirvaad Atta 5kg');

    expect(annapurnaSub).toBeDefined();
    expect(annapurnaSub?.subtotal).toBe(1650);
    expect(annapurnaSub?.items[0].product.name).toBe('Pure Desi Gir Cow Vedic Ghee');

    // Total subtotal sum equals overall cart sum
    const totalPartitioned = suborders.reduce((acc, sub) => acc + sub.subtotal, 0);
    expect(totalPartitioned).toBe(2505);
  });

  it('sets mandi logistics delivery slot when wholesale items are present', () => {
    const wholesaleCart: CartItem[] = [
      {
        product: productSharma,
        quantity: 25,
        mode: 'wholesale',
        unitPrice: 230,
        totalPrice: 5750
      }
    ];

    const suborders = partitionCartIntoSuborders(wholesaleCart, {
      orderId: 'NX-99999',
      defaultArea: 'Yeshwanthpur',
      hasWholesaleItems: true
    });

    expect(suborders[0].estimatedDelivery).toContain('Mandi Mini-Truck');
  });
});

