import { describe, it, expect } from 'vitest';
import { parsePurchaseList } from './whatsappParser';
import { Product } from '../types';

const catalog: Product[] = [
  {
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
    origin: 'MP',
    description: 'Atta',
    tags: ['staples'],
    merchantId: 'store-sharma-kirana',
    merchantName: 'Sharmaji Kirana'
  },
  {
    id: 'prod-sugar',
    name: 'Dhampur Pure Crystal Sugar 50kg Bag',
    brand: 'Dhampur',
    category: 'staples-atta',
    subCategory: 'Salt & Sugar',
    unit: '50kg sack',
    packSize: '50kg',
    retailPrice: 2150,
    originalPrice: 2300,
    image: '/sugar.jpg',
    rating: 4.8,
    reviewCount: 156,
    inStock: true,
    stockQuantity: 50,
    origin: 'UP',
    description: 'Wholesale sugar',
    tags: ['wholesale'],
    merchantId: 'store-yeshwanthpur-wholesale',
    merchantName: 'Mandi Direct'
  },
  {
    id: 'prod-basmati',
    name: 'India Gate Classic Aged Basmati Rice',
    brand: 'India Gate',
    category: 'rice-pulses',
    subCategory: 'Basmati Rice',
    unit: '5kg bag',
    packSize: '5kg',
    retailPrice: 620,
    originalPrice: 699,
    image: '/basmati.jpg',
    rating: 4.9,
    reviewCount: 310,
    inStock: true,
    stockQuantity: 60,
    origin: 'Punjab',
    description: 'Aged basmati',
    tags: ['rice'],
    merchantId: 'store-sharma-kirana',
    merchantName: 'Sharmaji Kirana'
  }
];

describe('WhatsApp Purchase-List Parser (PDF Section 6.3)', () => {
  it('parses typical unstructured WhatsApp restock messages with quantities', () => {
    const rawText = `
      Aashirvaad MP Sharbati Atta - 15 bags
      Dhampur Sugar 50kg - 4 sacks
      India Gate Classic Basmati Rice - 8 bags
    `;

    const parsed = parsePurchaseList(rawText, catalog);

    expect(parsed).toHaveLength(3);

    // Line 1: Atta
    expect(parsed[0].quantity).toBe(15);
    expect(parsed[0].matchedProduct?.id).toBe('prod-atta');
    expect(parsed[0].confidence).toBeGreaterThanOrEqual(0.95);

    // Line 2: Sugar
    expect(parsed[1].quantity).toBe(4);
    expect(parsed[1].matchedProduct?.id).toBe('prod-sugar');
    expect(parsed[1].confidence).toBeGreaterThanOrEqual(0.95);

    // Line 3: Basmati
    expect(parsed[2].quantity).toBe(8);
    expect(parsed[2].matchedProduct?.id).toBe('prod-basmati');
    expect(parsed[2].confidence).toBeGreaterThanOrEqual(0.95);
  });

  it('handles lines without explicit quantity by defaulting safely', () => {
    const rawText = `MP Sharbati Atta`;
    const parsed = parsePurchaseList(rawText, catalog);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].matchedProduct?.id).toBe('prod-atta');
    expect(parsed[0].quantity).toBe(5); // Default bulk batch
  });

  it('ignores empty lines and whitespace', () => {
    const rawText = `

      Dhampur Sugar 10 sacks

      
    `;
    const parsed = parsePurchaseList(rawText, catalog);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].quantity).toBe(10);
    expect(parsed[0].matchedProduct?.id).toBe('prod-sugar');
  });
});

