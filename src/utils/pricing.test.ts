import { describe, it, expect } from 'vitest';
import { getEffectiveTierAndPrice, calculateCartTotals } from './pricing';
import { Product } from '../types';

const mockProductWithTiers: Product = {
  id: 'prod-atta',
  name: 'Aashirvaad Superior MP Sharbati Atta',
  brand: 'Aashirvaad',
  category: 'staples-atta',
  subCategory: 'Atta & Flours',
  unit: '5kg bag',
  packSize: '5kg',
  retailPrice: 285,
  originalPrice: 310,
  image: '/atta.jpg',
  rating: 4.8,
  reviewCount: 420,
  inStock: true,
  stockQuantity: 100,
  origin: 'Sehore, Madhya Pradesh',
  description: '100% MP Sharbati wheat flour',
  tags: ['staples'],
  merchantId: 'store-sharma-kirana',
  merchantName: 'Sharmaji Kirana',
  minWholesaleQty: 5,
  bulkTiers: [
    { minQty: 5, pricePerUnit: 260, label: '5-9 bags (Kirana)', discountPercent: 8.8 },
    { minQty: 10, pricePerUnit: 245, label: '10-24 bags (Wholesale)', discountPercent: 14.0 },
    { minQty: 25, pricePerUnit: 230, label: '25+ bags (Mandi Slab)', discountPercent: 19.3 }
  ]
};

const mockProductWithoutTiers: Product = {
  id: 'prod-salt',
  name: 'Tata Salt Vacuum Evaporated',
  brand: 'Tata Salt',
  category: 'staples-atta',
  subCategory: 'Salt & Sugar',
  unit: '1kg packet',
  packSize: '1kg',
  retailPrice: 28,
  originalPrice: 30,
  image: '/salt.jpg',
  rating: 4.9,
  reviewCount: 890,
  inStock: true,
  stockQuantity: 200,
  origin: 'Mithapur, Gujarat',
  description: 'Iodized salt',
  tags: ['staples'],
  merchantId: 'store-sharma-kirana',
  merchantName: 'Sharmaji Kirana'
};

describe('Pricing Engine (PDF Section 6.1 & 7.1)', () => {
  it('applies standard retail price when quantity is below minimum tier threshold in retail mode', () => {
    const result = getEffectiveTierAndPrice(mockProductWithTiers, 2, 'retail');
    expect(result.unitPrice).toBe(285);
    expect(result.tier).toBeUndefined();
    expect(result.effectiveMode).toBe('retail');
  });

  it('automatically unlocks Tier 1 wholesale price when retail quantity reaches 5 bags', () => {
    const result = getEffectiveTierAndPrice(mockProductWithTiers, 5, 'retail');
    expect(result.unitPrice).toBe(260);
    expect(result.tier?.minQty).toBe(5);
    expect(result.tier?.discountPercent).toBe(8.8);
    expect(result.effectiveMode).toBe('wholesale');
  });

  it('unlocks highest eligible volume slab when quantity satisfies higher threshold', () => {
    const result = getEffectiveTierAndPrice(mockProductWithTiers, 30, 'retail');
    expect(result.unitPrice).toBe(230);
    expect(result.tier?.minQty).toBe(25);
    expect(result.effectiveMode).toBe('wholesale');
  });

  it('applies lowest wholesale tier price if wholesale mode requested even if qty is below tier min', () => {
    const result = getEffectiveTierAndPrice(mockProductWithTiers, 1, 'wholesale');
    expect(result.unitPrice).toBe(260);
    expect(result.tier?.minQty).toBe(5);
    expect(result.effectiveMode).toBe('wholesale');
  });

  it('falls back to retail price gracefully for products without bulk tiers', () => {
    const result = getEffectiveTierAndPrice(mockProductWithoutTiers, 10, 'retail');
    expect(result.unitPrice).toBe(28);
    expect(result.tier).toBeUndefined();
    expect(result.effectiveMode).toBe('retail');
  });

  it('correctly calculates cart totals, subtotal, and savings', () => {
    const cart = [
      {
        product: mockProductWithTiers,
        quantity: 10,
        unitPrice: 245,
        totalPrice: 2450
      },
      {
        product: mockProductWithoutTiers,
        quantity: 2,
        unitPrice: 28,
        totalPrice: 56
      }
    ];

    const totals = calculateCartTotals(cart);
    expect(totals.totalItems).toBe(12);
    expect(totals.subtotal).toBe(2506);
    // original: (310 * 10) + (30 * 2) = 3100 + 60 = 3160
    expect(totals.originalTotal).toBe(3160);
    expect(totals.totalSavings).toBe(654);
  });
});

