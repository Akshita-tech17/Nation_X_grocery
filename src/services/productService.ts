import { MasterProduct, ShopProductOffering, Product, BulkTier, AvailabilityStatus } from '../types';
import {
  MASTER_PRODUCTS,
  SHOP_OFFERINGS,
  enrichProductFromOffering,
  resolveAvailabilityStatus,
  isStockStale,
  DEFAULT_FRESHNESS_HOURS_THRESHOLD
} from '../data/products';

export interface PriceCalculationResult {
  unitPrice: number;
  originalUnitPrice: number;
  totalPrice: number;
  originalTotalPrice: number;
  savings: number;
  discountPercent: number;
  appliedTier?: BulkTier;
  isWholesaleSlabApplied: boolean;
  moqSatisfied: boolean;
  minWholesaleQty: number;
}

export interface StockValidationResult {
  isValid: boolean;
  currentStatus: AvailabilityStatus;
  availableStock: number;
  isStale: boolean;
  lastUpdated: string;
  message?: string;
}

export class ProductService {
  /**
   * Retrieves all master products in the system
   */
  static getAllMasterProducts(): MasterProduct[] {
    return MASTER_PRODUCTS;
  }

  /**
   * Finds a master product by ID
   */
  static getMasterProductById(id: string): MasterProduct | undefined {
    return MASTER_PRODUCTS.find(p => p.id === id);
  }

  /**
   * Returns all active shop offerings for a master product across all merchants
   */
  static getOfferingsForMasterProduct(masterProductId: string): ShopProductOffering[] {
    return SHOP_OFFERINGS.filter(
      o => o.masterProductId === masterProductId && o.visibilityStatus === 'active'
    );
  }

  /**
   * Finds a specific shop offering by its unique ID
   */
  static getOfferingById(offeringId: string): ShopProductOffering | undefined {
    return SHOP_OFFERINGS.find(o => o.id === offeringId);
  }

  /**
   * Returns composite products filtered or prioritized by store
   */
  static getCompositeProducts(selectedStoreId?: string): Product[] {
    return MASTER_PRODUCTS.map(master => {
      const offerings = this.getOfferingsForMasterProduct(master.id);
      
      let matched = offerings[0];
      if (selectedStoreId) {
        const storeMatch = offerings.find(o => o.merchantId === selectedStoreId);
        if (storeMatch) matched = storeMatch;
      }

      if (!matched) {
        matched = {
          id: `off-temp-${master.id}`,
          masterProductId: master.id,
          merchantId: selectedStoreId || 'store-sharma-kirana',
          merchantName: 'Local Kirana Partner',
          sellingPrice: 100,
          mrp: 100,
          stockQuantity: 0,
          stockUpdatedAt: new Date().toISOString(),
          availabilityStatus: 'unavailable',
          fulfilmentOptions: ['standard'],
          visibilityStatus: 'active',
          rating: 4.5,
          reviewCount: 0
        };
      }

      return enrichProductFromOffering(master, matched, offerings);
    });
  }

  /**
   * Returns enriched products offered specifically by a single merchant
   */
  static getProductsByMerchant(merchantId: string): Product[] {
    const merchantOfferings = SHOP_OFFERINGS.filter(
      o => o.merchantId === merchantId && o.visibilityStatus === 'active'
    );

    return merchantOfferings.map(offering => {
      const master = this.getMasterProductById(offering.masterProductId);
      if (!master) {
        throw new Error(`Master product not found for offering ${offering.id}`);
      }
      const allOfferings = this.getOfferingsForMasterProduct(master.id);
      return enrichProductFromOffering(master, offering, allOfferings);
    });
  }

  /**
   * Calculates pricing respecting MOQ, retail prices, and wholesale slabs.
   * Ensures purchase costs are NEVER exposed to customer calculations.
   */
  static calculatePrice(
    offering: ShopProductOffering,
    quantity: number,
    mode: 'retail' | 'wholesale' = 'retail'
  ): PriceCalculationResult {
    const originalUnitPrice = offering.mrp;
    const baseSellingPrice = offering.sellingPrice;
    const minQty = offering.minWholesaleQty || 1;

    if (mode === 'wholesale') {
      const tiers = offering.wholesaleTiers || [];
      // Sort tiers descending by minQty to find the highest qualified discount
      const sortedTiers = [...tiers].sort((a, b) => b.minQty - a.minQty);
      const matchedTier = sortedTiers.find(t => quantity >= t.minQty);

      if (matchedTier) {
        const unitPrice = matchedTier.pricePerUnit;
        const totalPrice = unitPrice * quantity;
        const originalTotalPrice = originalUnitPrice * quantity;
        return {
          unitPrice,
          originalUnitPrice,
          totalPrice,
          originalTotalPrice,
          savings: Math.max(0, originalTotalPrice - totalPrice),
          discountPercent: matchedTier.discountPercent,
          appliedTier: matchedTier,
          isWholesaleSlabApplied: true,
          moqSatisfied: quantity >= minQty,
          minWholesaleQty: minQty
        };
      }

      // If wholesale mode requested but no tier met or under MOQ:
      const unitPrice = baseSellingPrice;
      const totalPrice = unitPrice * quantity;
      const originalTotalPrice = originalUnitPrice * quantity;
      return {
        unitPrice,
        originalUnitPrice,
        totalPrice,
        originalTotalPrice,
        savings: Math.max(0, originalTotalPrice - totalPrice),
        discountPercent: Math.round(((originalUnitPrice - unitPrice) / originalUnitPrice) * 100),
        appliedTier: undefined,
        isWholesaleSlabApplied: false,
        moqSatisfied: quantity >= minQty,
        minWholesaleQty: minQty
      };
    }

    // Default Retail Mode
    const unitPrice = baseSellingPrice;
    const totalPrice = unitPrice * quantity;
    const originalTotalPrice = originalUnitPrice * quantity;
    return {
      unitPrice,
      originalUnitPrice,
      totalPrice,
      originalTotalPrice,
      savings: Math.max(0, originalTotalPrice - totalPrice),
      discountPercent: Math.round(((originalUnitPrice - unitPrice) / originalUnitPrice) * 100),
      appliedTier: undefined,
      isWholesaleSlabApplied: false,
      moqSatisfied: true,
      minWholesaleQty: 1
    };
  }

  /**
   * Revalidates inventory stock and freshness before checkout or cart addition.
   */
  static validateStock(
    offeringId: string,
    requestedQty: number,
    thresholdHours = DEFAULT_FRESHNESS_HOURS_THRESHOLD
  ): StockValidationResult {
    const offering = this.getOfferingById(offeringId);
    if (!offering) {
      return {
        isValid: false,
        currentStatus: 'unavailable',
        availableStock: 0,
        isStale: true,
        lastUpdated: new Date().toISOString(),
        message: 'Product offering no longer available.'
      };
    }

    const isStale = isStockStale(offering.stockUpdatedAt, thresholdHours);
    const status = resolveAvailabilityStatus(offering, thresholdHours);

    if (isStale || status === 'unconfirmed') {
      return {
        isValid: false,
        currentStatus: 'unconfirmed',
        availableStock: offering.stockQuantity,
        isStale: true,
        lastUpdated: offering.stockUpdatedAt,
        message: `Inventory status for ${offering.merchantName} is older than ${thresholdHours}h. Call shopkeeper to confirm stock before checkout.`
      };
    }

    if (offering.stockQuantity <= 0 || status === 'unavailable') {
      return {
        isValid: false,
        currentStatus: 'unavailable',
        availableStock: 0,
        isStale: false,
        lastUpdated: offering.stockUpdatedAt,
        message: `Item is currently out of stock at ${offering.merchantName}.`
      };
    }

    if (requestedQty > offering.stockQuantity) {
      return {
        isValid: false,
        currentStatus: 'low_stock',
        availableStock: offering.stockQuantity,
        isStale: false,
        lastUpdated: offering.stockUpdatedAt,
        message: `Only ${offering.stockQuantity} units available at ${offering.merchantName} (requested ${requestedQty}).`
      };
    }

    return {
      isValid: true,
      currentStatus: status,
      availableStock: offering.stockQuantity,
      isStale: false,
      lastUpdated: offering.stockUpdatedAt
    };
  }
}
