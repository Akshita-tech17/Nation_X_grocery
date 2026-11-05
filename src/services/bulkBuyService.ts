/**
 * NationX Project 02: BulkBuy 3-Path Procurement Engine (§7)
 * 
 * Compliant with:
 * - Path A: Direct bulk ordering with MOQ and tiered discounts (Acceptance Tests 14 & 15)
 * - Path B: Quotation tender requests, merchant bids, expiry, and duplicate-proof acceptance (Acceptance Tests 16, 17 & 18)
 * - Path C: Assisted purchase list parsing and merchant review queue
 */

import { Product, BulkTier } from '../types';

export interface DirectBulkOrderRequest {
  product: Product;
  quantity: number;
  deliveryCity: string;
  businessGst?: string;
}

export interface DirectBulkOrderResult {
  isValid: boolean;
  appliedTier?: BulkTier;
  unitPrice: number;
  totalPrice: number;
  retailTotalPrice: number;
  savings: number;
  error?: string;
}

export interface BulkRFQItem {
  commodity: string;
  quantity: number;
  unit: string;
  targetPricePerUnit?: number;
}

export interface BulkRFQ {
  id: string;
  customerId: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  gstNumber?: string;
  deliveryCity: string;
  deliveryPincode: string;
  requiredDate: string;
  items: BulkRFQItem[];
  status: 'OPEN' | 'QUOTED' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  createdAt: number;
}

export interface BulkQuotation {
  id: string;
  rfqId: string;
  merchantId: string;
  merchantName: string;
  quotedItems: Array<{
    commodity: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalQuotedAmount: number;
  validUntil: number; // Expiry timestamp
  deliveryTimelineDays: number;
  mandiNotes?: string;
  status: 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  convertedOrderId?: string;
}

export interface CommercialOrder {
  id: string;
  rfqId: string;
  quotationId: string;
  merchantId: string;
  businessName: string;
  totalAmount: number;
  items: BulkQuotation['quotedItems'];
  status: 'CONFIRMED' | 'IN_PRODUCTION' | 'DISPATCHED' | 'DELIVERED';
  createdAt: number;
}

export class BulkBuyService {
  private rfqs: Map<string, BulkRFQ> = new Map();
  private quotations: Map<string, BulkQuotation> = new Map();
  private commercialOrders: Map<string, CommercialOrder> = new Map();
  private acceptanceIdempotencyMap: Map<string, string> = new Map(); // idempotencyKey -> orderId

  // ==========================================
  // PATH A: DIRECT BULK ORDERING (§7.1)
  // ==========================================

  /**
   * Validates Path A direct bulk order against MOQ and calculates tiered pricing (Tests 14 & 15).
   */
  public evaluateDirectBulkOrder(req: DirectBulkOrderRequest): DirectBulkOrderResult {
    const minQty = req.product.minWholesaleQty || 10;

    // Test 15: Minimum order quantity (MOQ) enforcement
    if (req.quantity < minQty) {
      return {
        isValid: false,
        unitPrice: req.product.retailPrice,
        totalPrice: req.product.retailPrice * req.quantity,
        retailTotalPrice: req.product.retailPrice * req.quantity,
        savings: 0,
        error: `Order quantity (${req.quantity} ${req.product.unit}) is below minimum wholesale order quantity (${minQty} ${req.product.unit}).`,
      };
    }

    // Test 14: Wholesale tier pricing calculation
    let appliedTier: BulkTier | undefined;
    let unitPrice = req.product.retailPrice;

    if (req.product.bulkTiers && req.product.bulkTiers.length > 0) {
      const eligibleTiers = [...req.product.bulkTiers]
        .filter((t) => req.quantity >= t.minQty)
        .sort((a, b) => b.minQty - a.minQty);

      if (eligibleTiers.length > 0) {
        appliedTier = eligibleTiers[0];
        unitPrice = appliedTier.pricePerUnit;
      }
    }

    const totalPrice = unitPrice * req.quantity;
    const retailTotalPrice = (req.product.originalPrice || req.product.retailPrice) * req.quantity;
    const savings = Math.max(0, retailTotalPrice - totalPrice);

    return {
      isValid: true,
      appliedTier,
      unitPrice,
      totalPrice,
      retailTotalPrice,
      savings,
    };
  }

  // ==========================================
  // PATH B: QUOTATIONS & TENDER BIDDING (§7.2)
  // ==========================================

  /**
   * Submits a customer quotation request into RFQ register.
   */
  public submitRFQ(rfqData: Omit<BulkRFQ, 'id' | 'status' | 'createdAt'>): BulkRFQ {
    const id = `rfq_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const rfq: BulkRFQ = {
      ...rfqData,
      id,
      status: 'OPEN',
      createdAt: Date.now(),
    };
    this.rfqs.set(id, rfq);
    return rfq;
  }

  public getRFQ(id: string): BulkRFQ | undefined {
    return this.rfqs.get(id);
  }

  /**
   * Merchant submits an itemized quotation for an RFQ with expiry timestamp.
   */
  public submitQuotation(quoteData: Omit<BulkQuotation, 'id' | 'status'>): BulkQuotation {
    const id = `quote_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const quotation: BulkQuotation = {
      ...quoteData,
      id,
      status: 'OFFERED',
    };
    this.quotations.set(id, quotation);

    const rfq = this.rfqs.get(quoteData.rfqId);
    if (rfq && rfq.status === 'OPEN') {
      rfq.status = 'QUOTED';
    }

    return quotation;
  }

  public getQuotation(id: string): BulkQuotation | undefined {
    return this.quotations.get(id);
  }

  /**
   * Customer accepts a quotation.
   * Enforces:
   * 1. Expiry check (Test 17): expired quote rejected.
   * 2. Idempotency (Test 18): duplicate clicks return the same order without creating copies.
   */
  public acceptQuotation(
    quotationId: string,
    idempotencyKey: string,
    currentTime: number = Date.now()
  ): {
    success: boolean;
    order?: CommercialOrder;
    isDuplicateSubmission?: boolean;
    error?: string;
  } {
    // Test 18: Idempotency check for repeated acceptance
    if (this.acceptanceIdempotencyMap.has(idempotencyKey)) {
      const existingOrderId = this.acceptanceIdempotencyMap.get(idempotencyKey)!;
      const existingOrder = this.commercialOrders.get(existingOrderId);
      return {
        success: true,
        order: existingOrder,
        isDuplicateSubmission: true,
      };
    }

    const quotation = this.quotations.get(quotationId);
    if (!quotation) {
      return { success: false, error: 'QUOTATION_NOT_FOUND' };
    }

    // Check if quotation is already accepted
    if (quotation.status === 'ACCEPTED' && quotation.convertedOrderId) {
      const existingOrder = this.commercialOrders.get(quotation.convertedOrderId);
      return {
        success: true,
        order: existingOrder,
        isDuplicateSubmission: true,
      };
    }

    // Test 17: Expiry date check
    if (quotation.validUntil < currentTime) {
      quotation.status = 'EXPIRED';
      return {
        success: false,
        error: 'QUOTATION_EXPIRED',
      };
    }

    // Test 16: Successful acceptance creates confirmed order
    const rfq = this.rfqs.get(quotation.rfqId);
    const orderId = `comm_ord_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const commercialOrder: CommercialOrder = {
      id: orderId,
      rfqId: quotation.rfqId,
      quotationId: quotation.id,
      merchantId: quotation.merchantId,
      businessName: rfq?.businessName || 'Wholesale Buyer',
      totalAmount: quotation.totalQuotedAmount,
      items: quotation.quotedItems,
      status: 'CONFIRMED',
      createdAt: currentTime,
    };

    quotation.status = 'ACCEPTED';
    quotation.convertedOrderId = orderId;
    if (rfq) {
      rfq.status = 'ACCEPTED';
    }

    this.commercialOrders.set(orderId, commercialOrder);
    this.acceptanceIdempotencyMap.set(idempotencyKey, orderId);

    return {
      success: true,
      order: commercialOrder,
      isDuplicateSubmission: false,
    };
  }

  // ==========================================
  // PATH C: ASSISTED PURCHASE LIST REVIEW (§7.3)
  // ==========================================

  public createAssistedReviewQueueEntry(
    customerId: string,
    rawText: string,
    parsedLines: Array<{ rawLine: string; commodity: string; quantity: number; unit: string; matchedOfferingId?: string }>
  ) {
    const entryId = `assisted_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      id: entryId,
      customerId,
      rawText,
      parsedLines,
      status: 'DRAFT_PENDING_MERCHANT_REVIEW',
      createdAt: Date.now(),
    };
  }
}

export const bulkBuyService = new BulkBuyService();
