import { Product, BulkTier } from '../types';

export interface EffectivePricingResult {
  unitPrice: number;
  tier?: BulkTier;
  effectiveMode: 'retail' | 'wholesale';
}

/**
 * Calculates effective unit price, applied bulk tier, and mode for a product given desired quantity.
 * Automatically triggers volume discounts when quantity >= tier.minQty (PDF Section 6 & 7.1).
 */
export function getEffectiveTierAndPrice(
  product: Product,
  qty: number,
  mode: 'retail' | 'wholesale' = 'retail'
): EffectivePricingResult {
  if (product.bulkTiers && product.bulkTiers.length > 0) {
    // Find highest tier matched based on volume threshold
    const eligibleTiers = product.bulkTiers
      .filter(t => qty >= t.minQty)
      .sort((a, b) => b.minQty - a.minQty);

    if (eligibleTiers.length > 0) {
      return {
        unitPrice: eligibleTiers[0].pricePerUnit,
        tier: eligibleTiers[0],
        effectiveMode: 'wholesale'
      };
    }
    // If below lowest tier but user explicitly selected wholesale mode, default to first tier price
    if (mode === 'wholesale') {
      return {
        unitPrice: product.bulkTiers[0].pricePerUnit,
        tier: product.bulkTiers[0],
        effectiveMode: 'wholesale'
      };
    }
  }
  return { unitPrice: product.retailPrice, effectiveMode: mode };
}

/**
 * Calculates cart totals including items count, subtotal, original price, and savings.
 */
export function calculateCartTotals(
  cart: Array<{ product: Product; quantity: number; unitPrice: number; totalPrice: number }>
) {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const originalTotal = cart.reduce((sum, item) => sum + (item.product.originalPrice * item.quantity), 0);
  const totalSavings = Math.max(0, originalTotal - subtotal);
  return { totalItems, subtotal, originalTotal, totalSavings };
}
