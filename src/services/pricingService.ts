/**
 * NationX Project 02: Server-Side Pricing, Validation & Snapshot Engine (§4, §6)
 * 
 * Compliant with:
 * - Retail price validation against MRP (cannot exceed MRP) (§4.1)
 * - Purchase cost privacy / RLS data masking (§4.2)
 * - Dynamic system fees and taxes configuration (§5)
 * - Price fluctuation detection at checkout confirmation (Acceptance Test 8)
 * - Immutable price snapshots locked onto order records (§6)
 */

import { CartItem } from '../types';

export interface SystemConfig {
  freeDeliveryThresholdPerStore: number;
  standardDeliveryFee: number;
  platformFee: number;
  freePlatformFeeThreshold: number;
  defaultTaxRatePercent: number; // e.g. 5% GST for groceries
}

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  freeDeliveryThresholdPerStore: 299,
  standardDeliveryFee: 29,
  platformFee: 5,
  freePlatformFeeThreshold: 500,
  defaultTaxRatePercent: 0, // Fresh vegetables and unbranded staples are 0% GST in India
};

export interface PriceValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PriceDelta {
  productId: string;
  productName: string;
  storeId: string;
  oldUnitPrice: number;
  newUnitPrice: number;
  quantity: number;
  difference: number; // positive = increased, negative = decreased
}

export interface CartVerificationResult {
  hasPriceChanged: boolean;
  priceDeltas: PriceDelta[];
  updatedCartItems: CartItem[];
  previousSubtotal: number;
  updatedSubtotal: number;
  requiresCustomerReconfirmation: boolean;
}

export interface OrderItemPriceSnapshot {
  productId: string;
  productName: string;
  unitPrice: number;
  mrp: number;
  quantity: number;
  totalPrice: number;
  appliedTierLabel?: string;
  taxRatePercent: number;
  taxAmount: number;
  snapshotTimestamp: number;
}

export class PricingService {
  private config: SystemConfig;

  constructor(config: SystemConfig = DEFAULT_SYSTEM_CONFIG) {
    this.config = { ...config };
  }

  /**
   * Validates product offering prices against statutory rules (Spec §4.1).
   * 1. Retail price cannot exceed MRP.
   * 2. Wholesale tier unit prices must not exceed retail price.
   */
  public validateOfferingPricing(
    retailPrice: number,
    mrp: number,
    bulkTiers?: Array<{ minQty: number; pricePerUnit: number }>
  ): PriceValidationResult {
    const errors: string[] = [];

    if (retailPrice < 0) {
      errors.push('Retail price cannot be negative.');
    }
    if (mrp < 0) {
      errors.push('MRP cannot be negative.');
    }
    if (retailPrice > mrp) {
      errors.push(`Retail price (₹${retailPrice}) cannot exceed MRP (₹${mrp}).`);
    }

    if (bulkTiers && bulkTiers.length > 0) {
      for (const tier of bulkTiers) {
        if (tier.pricePerUnit > retailPrice) {
          errors.push(
            `Wholesale tier price (₹${tier.pricePerUnit}) for qty ${tier.minQty} cannot exceed retail price (₹${retailPrice}).`
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitizes merchant offering before serializing to public API / customer view (§4.2).
   * Strips purchase_cost to enforce Row-Level Security requirements.
   */
  public maskOfferingForCustomer<T extends { purchase_cost?: number; purchaseCost?: number }>(
    offering: T
  ): Omit<T, 'purchase_cost' | 'purchaseCost'> {
    const sanitized = { ...offering };
    delete (sanitized as any).purchase_cost;
    delete (sanitized as any).purchaseCost;
    return sanitized;
  }

  /**
   * Detects price changes between cart creation and checkout confirmation (Acceptance Test 8).
   * If any merchant adjusted prices in the interim, alerts the customer and calculates new totals.
   */
  public verifyCartPricesAtCheckout(
    cartItems: CartItem[],
    currentStoreCatalog: Map<string, { retailPrice: number; mrp: number }>
  ): CartVerificationResult {
    const priceDeltas: PriceDelta[] = [];
    let previousSubtotal = 0;
    let updatedSubtotal = 0;

    const updatedCartItems = cartItems.map((item) => {
      previousSubtotal += item.totalPrice;

      const currentLivePriceInfo = currentStoreCatalog.get(item.product.id);
      if (!currentLivePriceInfo) {
        // Product no longer offered
        updatedSubtotal += item.totalPrice;
        return item;
      }

      const currentLivePrice = currentLivePriceInfo.retailPrice;

      if (currentLivePrice !== item.unitPrice && item.mode === 'retail') {
        const difference = (currentLivePrice - item.unitPrice) * item.quantity;
        priceDeltas.push({
          productId: item.product.id,
          productName: item.product.name,
          storeId: item.product.merchantId,
          oldUnitPrice: item.unitPrice,
          newUnitPrice: currentLivePrice,
          quantity: item.quantity,
          difference,
        });

        const newTotalPrice = currentLivePrice * item.quantity;
        updatedSubtotal += newTotalPrice;

        return {
          ...item,
          unitPrice: currentLivePrice,
          totalPrice: newTotalPrice,
          product: {
            ...item.product,
            retailPrice: currentLivePrice,
          },
        };
      }

      updatedSubtotal += item.totalPrice;
      return item;
    });

    return {
      hasPriceChanged: priceDeltas.length > 0,
      priceDeltas,
      updatedCartItems,
      previousSubtotal,
      updatedSubtotal,
      requiresCustomerReconfirmation: priceDeltas.length > 0,
    };
  }

  /**
   * Creates an immutable order item price snapshot for historical integrity (§6).
   */
  public createItemSnapshot(item: CartItem, taxRatePercent: number = this.config.defaultTaxRatePercent): OrderItemPriceSnapshot {
    const taxAmount = (item.totalPrice * taxRatePercent) / 100;
    return {
      productId: item.product.id,
      productName: item.product.name,
      unitPrice: item.unitPrice,
      mrp: item.product.originalPrice || item.product.retailPrice,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      appliedTierLabel: item.appliedTier?.label,
      taxRatePercent,
      taxAmount,
      snapshotTimestamp: Date.now(),
    };
  }

  /**
   * Dynamic delivery fee calculation per merchant suborder (§5).
   */
  public calculateSuborderDeliveryFee(subtotal: number): number {
    if (subtotal >= this.config.freeDeliveryThresholdPerStore) {
      return 0;
    }
    return this.config.standardDeliveryFee;
  }

  /**
   * Dynamic platform fee calculation.
   */
  public calculatePlatformFee(grandSubtotal: number): number {
    if (grandSubtotal >= this.config.freePlatformFeeThreshold) {
      return 0;
    }
    return this.config.platformFee;
  }
}

export const pricingService = new PricingService();
