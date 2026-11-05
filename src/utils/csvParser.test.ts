import { describe, it, expect } from 'vitest';
import { parseCsvContent, generateCsvTemplate } from './csvParser';
import { Product } from '../types';

const mockCatalog: Product[] = [
  {
    id: 'prod-atta',
    name: 'Aashirvaad MP Sharbati Atta 5kg',
    brand: 'Aashirvaad',
    category: 'staples-atta',
    subCategory: 'Atta',
    unit: '5kg bag',
    packSize: '5kg',
    retailPrice: 285,
    originalPrice: 310,
    image: '/atta.jpg',
    rating: 0,
    reviewCount: 0,
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
    name: 'Dhampur Pure Crystal Sugar 50kg',
    brand: 'Dhampur',
    category: 'staples-atta',
    subCategory: 'Sugar',
    unit: '50kg sack',
    packSize: '50kg',
    retailPrice: 2150,
    originalPrice: 2300,
    image: '/sugar.jpg',
    rating: 0,
    reviewCount: 0,
    inStock: true,
    stockQuantity: 40,
    origin: 'UP',
    description: 'Sugar',
    tags: ['staples'],
    merchantId: 'store-sharma-kirana',
    merchantName: 'Sharmaji Kirana'
  }
];

describe('Real Browser CSV Parser (Spec §13)', () => {
  it('generates an RFC 4180 compliant CSV template with required headers', () => {
    const template = generateCsvTemplate();
    expect(template).toContain('SKU_ID,Product_Name,Quantity,Unit');
    expect(template).toContain('prod-aashirvaad-sharbati');
  });

  it('correctly parses valid CSV rows and matches SKUs against catalog', () => {
    const validCsv = `SKU_ID,Product_Name,Quantity,Unit
prod-atta,"Aashirvaad MP Sharbati Atta 5kg",20,bag
prod-sugar,"Dhampur Pure Crystal Sugar 50kg",5,sack`;

    const result = parseCsvContent(validCsv, mockCatalog);
    expect(result.success).toBe(true);
    expect(result.items).toHaveLength(2);
    expect(result.items[0].matchedProduct?.id).toBe('prod-atta');
    expect(result.items[0].quantity).toBe(20);
    expect(result.items[1].matchedProduct?.id).toBe('prod-sugar');
    expect(result.items[1].quantity).toBe(5);
  });

  it('reports descriptive errors for invalid quantities without crashing', () => {
    const invalidCsv = `SKU_ID,Product_Name,Quantity,Unit
prod-atta,Aashirvaad Atta,INVALID_NUM,bag`;

    const result = parseCsvContent(invalidCsv, mockCatalog);
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Row 2: Invalid quantity');
  });

  it('rejects empty or corrupt CSV files', () => {
    const result = parseCsvContent('', mockCatalog);
    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('CSV file is empty');
  });
});
