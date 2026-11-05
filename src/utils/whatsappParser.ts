import { Product, ParsedPurchaseItem } from '../types';

/**
 * Intelligent regex and heuristic parser for unformatted WhatsApp grocery lists (PDF Section 6.3).
 * Parses quantities, product keywords, brands, and matches catalog products with confidence scores.
 */
export function parsePurchaseList(textToParse: string, catalog: Product[]): ParsedPurchaseItem[] {
  const lines = textToParse
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  return lines.map(line => {
    const lower = line.toLowerCase();

    // Extract quantity: looks for numbers
    const numMatch = lower.match(/\b(\d+)\b/);
    const quantity = numMatch ? Math.max(1, parseInt(numMatch[1], 10)) : 5;

    // Match against catalog
    let matchedProduct: Product | undefined;
    let highestScore = 0;

    for (const prod of catalog) {
      let score = 0;
      const pName = prod.name.toLowerCase();
      const pBrand = prod.brand.toLowerCase();
      const pCat = prod.category.toLowerCase();
      const pSub = prod.subCategory.toLowerCase();

      if (lower.includes(pBrand)) score += 4;
      if (lower.includes(pCat)) score += 2;

      // Keyword heuristics
      if (lower.includes('atta') && (pName.includes('atta') || pSub.includes('atta'))) score += 5;
      if (lower.includes('sharbati') && pName.includes('sharbati')) score += 6;
      if (lower.includes('basmati') && pName.includes('basmati')) score += 7;
      if (lower.includes('rice') && pName.includes('rice')) score += 4;
      if (lower.includes('sona masoori') && pName.includes('sona masoori')) score += 8;
      if (lower.includes('toor') && pName.includes('toor')) score += 7;
      if (lower.includes('dal') && pName.includes('dal')) score += 4;
      if (lower.includes('ghee') && pName.includes('ghee')) score += 7;
      if (lower.includes('mustard') && pName.includes('mustard')) score += 7;
      if (lower.includes('oil') && pName.includes('oil')) score += 3;
      if (lower.includes('sugar') && pName.includes('sugar')) score += 7;
      if (lower.includes('paneer') && pName.includes('paneer')) score += 7;
      if (lower.includes('pepper') && pName.includes('pepper')) score += 7;
      if (lower.includes('almond') && pName.includes('almond')) score += 7;
      if (lower.includes('kesar') || lower.includes('saffron')) {
        if (pName.includes('kesar') || pName.includes('saffron')) score += 8;
      }
      if (lower.includes('salt') && pName.includes('salt')) score += 7;
      if (lower.includes('cashew') && pName.includes('cashew')) score += 7;
      if (lower.includes('apple') && pName.includes('apple')) score += 7;

      if (score > highestScore) {
        highestScore = score;
        matchedProduct = prod;
      }
    }

    return {
      rawLine: line,
      matchedProduct,
      quantity,
      confidence: highestScore >= 5 ? 0.95 : highestScore > 0 ? 0.75 : 0.3,
      unit: matchedProduct?.unit || 'units'
    };
  });
}
