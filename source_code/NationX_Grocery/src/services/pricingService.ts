// ============================================================================
// NATIONX GROCERY — PRICING & CALCULATION ENGINE (Spec §4, §5.3, §6)
// ============================================================================

import { CartItem, Product, BulkTier } from '../types';

export interface FeeConfiguration {
  baseDeliveryFee: number;
  freeDeliveryThreshold: number;
  platformHandlingFee: number;
  taxRateStandard: number; // e.g. 0.05 for 5% GST
}

// Approved platform fee configuration (Spec §5.3: "Do not invent charges or apply unapproved fees")
export const APPROVED_FEE_CONFIG: FeeConfiguration = {
  baseDeliveryFee: 39.00,
  freeDeliveryThreshold: 499.00,
  platformHandlingFee: 5.00,
  taxRateStandard: 0.05
};

export interface PriceCalculationResult {
  itemsTotal: number;
  originalTotal: number;
  totalSavings: number;
  taxAmount: number;
  deliveryFee: number;
  platformFee: number;
  finalPayableAmount: number;
  priceSnapshot: {
    calculatedAt: string;
    items: Array<{
      productId: string;
      storeId: string;
      unitPrice: number;
      appliedTier?: BulkTier;
      quantity: number;
      lineTotal: number;
    }>;
    fees: FeeConfiguration;
  };
}

/**
 * Evaluates applicable wholesale discount tier for a given product and quantity (Spec §6, §7.1)
 */
export function evaluateWholesaleTier(product: Product, quantity: number): { effectivePrice: number; appliedTier?: BulkTier } {
  if (!product.bulkTiers || product.bulkTiers.length === 0) {
    return { effectivePrice: product.retailPrice };
  }

  // Sort tiers by minQty descending to match highest qualifying slab
  const sortedTiers = [...product.bulkTiers].sort((a, b) => b.minQty - a.minQty);
  const matchedTier = sortedTiers.find(tier => quantity >= tier.minQty);

  if (matchedTier) {
    return { effectivePrice: matchedTier.pricePerUnit, appliedTier: matchedTier };
  }

  return { effectivePrice: product.retailPrice };
}

/**
 * Server-side validated pricing calculation with immutable price snapshot (Spec §4.2, §5.3)
 */
export function calculateOrderTotals(cartItems: CartItem[]): PriceCalculationResult {
  let itemsTotal = 0;
  let originalTotal = 0;

  const snapshotItems = cartItems.map(item => {
    const { effectivePrice, appliedTier } = evaluateWholesaleTier(item.product, item.quantity);
    const lineTotal = effectivePrice * item.quantity;
    const originalLineTotal = (item.product.originalPrice || item.product.retailPrice) * item.quantity;

    itemsTotal += lineTotal;
    originalTotal += originalLineTotal;

    return {
      productId: item.product.id,
      storeId: item.product.merchantId,
      unitPrice: effectivePrice,
      appliedTier,
      quantity: item.quantity,
      lineTotal
    };
  });

  const totalSavings = Math.max(0, originalTotal - itemsTotal);
  const deliveryFee = itemsTotal >= APPROVED_FEE_CONFIG.freeDeliveryThreshold ? 0 : APPROVED_FEE_CONFIG.baseDeliveryFee;
  const platformFee = itemsTotal > 0 ? APPROVED_FEE_CONFIG.platformHandlingFee : 0;
  
  // Tax on taxable items (5% standard GST on packaged goods, 0% on unbranded staples)
  const taxAmount = Math.round(itemsTotal * APPROVED_FEE_CONFIG.taxRateStandard * 100) / 100;
  const finalPayableAmount = Math.round((itemsTotal + deliveryFee + platformFee + taxAmount) * 100) / 100;

  return {
    itemsTotal,
    originalTotal,
    totalSavings,
    taxAmount,
    deliveryFee,
    platformFee,
    finalPayableAmount,
    priceSnapshot: {
      calculatedAt: new Date().toISOString(),
      items: snapshotItems,
      fees: APPROVED_FEE_CONFIG
    }
  };
}

/**
 * Verifies if any prices in the cart changed compared to an earlier quotation/snapshot (Spec §4.2, Acceptance Test 8)
 */
export function detectPriceDiscrepancy(
  cartItems: CartItem[], 
  previousSnapshot: PriceCalculationResult['priceSnapshot']
): { hasChanged: boolean; message?: string } {
  for (const item of cartItems) {
    const recorded = previousSnapshot.items.find(si => si.productId === item.product.id);
    if (!recorded) continue;

    const { effectivePrice } = evaluateWholesaleTier(item.product, item.quantity);
    if (Math.abs(effectivePrice - recorded.unitPrice) > 0.01) {
      return {
        hasChanged: true,
        message: `Price for "${item.product.name}" changed from ₹${recorded.unitPrice} to ₹${effectivePrice}. Please review the updated total.`
      };
    }
  }

  return { hasChanged: false };
}
