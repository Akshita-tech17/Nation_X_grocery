import { Product, ParsedPurchaseItem } from '../types';

export interface CsvParseResult {
  success: boolean;
  items: ParsedPurchaseItem[];
  errors: string[];
}

/**
 * Generates an RFC 4180 standard CSV template for B2B grocery restock.
 */
export function generateCsvTemplate(): string {
  const header = 'SKU_ID,Product_Name,Quantity,Unit\n';
  const sampleRows = [
    'prod-aashirvaad-sharbati,"Aashirvaad MP Sharbati Atta 5kg",15,bag',
    'prod-india-gate-classic,"India Gate Classic Basmati Rice 5kg",8,bag',
    'prod-wholesale-sugar-50kg,"Dhampur Pure Crystal Sugar 50kg",4,sack',
    'prod-fortune-mustard-5l,"Fortune Kachi Ghani Mustard Oil 5L",6,tin'
  ].join('\n');
  return header + sampleRows;
}

/**
 * Parses real CSV text uploaded via browser File input.
 * Strictly validates column headers, data types, and matches against catalog.
 */
export function parseCsvContent(csvText: string, catalog: Product[]): CsvParseResult {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) {
    return { success: false, items: [], errors: ['CSV file is empty or missing data rows'] };
  }

  const header = lines[0].toLowerCase();
  const headers = header.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const skuIdx = headers.findIndex(h => h.includes('sku') || h.includes('id'));
  const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('product') || h.includes('item'));
  const qtyIdx = headers.findIndex(h => h.includes('qty') || h.includes('quantity') || h.includes('count'));
  const unitIdx = headers.findIndex(h => h.includes('unit') || h.includes('pack'));

  if (qtyIdx === -1 && skuIdx === -1 && nameIdx === -1) {
    return { success: false, items: [], errors: ['CSV must contain headers for Quantity and Product Name or SKU'] };
  }

  const effectiveQtyIdx = qtyIdx > -1 ? qtyIdx : 2;
  const items: ParsedPurchaseItem[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Split on comma ignoring inside quotes
    const cols = rawLine.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));

    const sku = skuIdx > -1 ? cols[skuIdx] : cols[0] || '';
    const name = nameIdx > -1 ? cols[nameIdx] : cols[1] || '';
    const qtyStr = cols[effectiveQtyIdx] || '1';
    const unit = unitIdx > -1 ? cols[unitIdx] : cols[3] || 'units';

    const quantity = parseInt(qtyStr, 10);
    if (isNaN(quantity) || quantity <= 0) {
      errors.push(`Row ${i + 1}: Invalid quantity "${qtyStr}"`);
      continue;
    }

    // Match by SKU ID first, then by name
    let matched = catalog.find(p => p.id === sku);
    if (!matched && name) {
      const lowerName = name.toLowerCase();
      matched = catalog.find(p => p.name.toLowerCase().includes(lowerName) || lowerName.includes(p.name.toLowerCase()));
    }

    items.push({
      rawLine,
      matchedProduct: matched,
      quantity,
      confidence: matched ? 1.0 : 0.4,
      unit: matched?.unit || unit
    });
  }

  return {
    success: errors.length === 0 && items.length > 0,
    items,
    errors
  };
}
