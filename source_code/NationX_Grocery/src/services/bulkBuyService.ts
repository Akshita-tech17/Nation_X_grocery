// ============================================================================
// NATIONX GROCERY — BULKBUY THREE MANDATORY PATHS (Spec §7, Tests 14–18)
// ============================================================================

import { QuotationRequest, ParsedPurchaseItem, Product } from '../types';

// In-memory RFQ & Quotation repository
const rfqStore = new Map<string, QuotationRequest>();
const acceptedOrderMappings = new Map<string, string>(); // quotationId -> orderId (prevents duplicate orders, Test 16)

/**
 * PATH B: Submit a commercial RFQ (Spec §7.2)
 */
export function submitQuotationRequest(req: Omit<QuotationRequest, 'id' | 'status' | 'date'>): QuotationRequest {
  const id = `RFQ-${Math.floor(1000 + Math.random() * 9000)}`;
  const quotationRequest: QuotationRequest = {
    ...req,
    id,
    rfqNumber: id,
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    status: 'submitted'
  };

  rfqStore.set(id, quotationRequest);
  return quotationRequest;
}

/**
 * PATH B: Merchant responds with itemized counter-quote (Spec §7.2)
 */
export function provideMerchantQuotation(
  rfqId: string,
  quotedPrice: number,
  validUntil: string,
  mandiNotes: string,
  tareWeightKg?: number,
  freightTerms: string = 'EX_WAREHOUSE'
): { success: boolean; rfq?: QuotationRequest; error?: string } {
  const rfq = rfqStore.get(rfqId);
  if (!rfq) return { success: false, error: 'RFQ not found' };

  rfq.status = 'quoted';
  rfq.quotedPrice = quotedPrice;
  rfq.validUntil = validUntil;
  rfq.mandiNotes = mandiNotes;
  rfq.tareWeightKg = tareWeightKg;
  rfq.freightTerms = freightTerms;

  return { success: true, rfq };
}

/**
 * PATH B: Customer explicitly accepts a valid quotation (Spec §7.2, Test 16 & 18)
 * Rules:
 * 1. A quotation is not a confirmed order until explicit acceptance and checkout confirmation.
 * 2. Prevent acceptance of expired quotations.
 * 3. Prevent duplicate orders from repeated acceptance requests.
 */
export function acceptQuotation(
  rfqId: string
): { success: boolean; error?: string; orderId?: string } {
  const rfq = rfqStore.get(rfqId);
  if (!rfq) return { success: false, error: 'Quotation request not found' };

  if (rfq.status !== 'quoted') {
    return { success: false, error: `Cannot accept quotation in "${rfq.status}" status.` };
  }

  // Expiry check (Spec §7.2, Test 16)
  if (rfq.validUntil) {
    const expiry = new Date(rfq.validUntil);
    if (expiry < new Date()) {
      rfq.status = 'expired';
      return { success: false, error: 'Quotation has expired. Please request an updated quotation from the merchant.' };
    }
  }

  // Duplicate check (Spec §7.2, Test 16: "Prevent duplicate orders from repeated acceptance requests")
  if (acceptedOrderMappings.has(rfqId)) {
    return { 
      success: true, 
      orderId: acceptedOrderMappings.get(rfqId),
      error: 'Quotation has already been accepted and converted to order.' 
    };
  }

  const generatedOrderId = `NX-BULK-${rfq.id}`;
  rfq.status = 'accepted';
  rfq.acceptedOrderId = generatedOrderId;
  acceptedOrderMappings.set(rfqId, generatedOrderId);

  return { success: true, orderId: generatedOrderId };
}

/**
 * PATH C: Assisted Purchase List Parser with Uncertainty Flagging (Spec §7.3, Test 17)
 * Rules:
 * 1. All extracted information must remain reviewable and correctable by the customer.
 * 2. Flag uncertain matches rather than guessing. Do not fabricate products or stock.
 * 3. The list itself must remain distinct from a confirmed order.
 */
export function parseAssistedPurchaseList(
  rawInput: string,
  catalogProducts: Product[]
): ParsedPurchaseItem[] {
  const lines = rawInput.split('\n').filter(l => l.trim().length > 0);

  return lines.map(line => {
    const trimmed = line.trim();

    // Match quantity and units (e.g., "5kg", "25 kg", "10 packets", "2 L")
    const qtyMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(kg|g|l|ml|packet|packets|bag|bags|quintal|quintals)?\s*(.*)$/i);

    let quantity = 1;
    let unit = 'pack';
    let commodityName = trimmed;

    if (qtyMatch) {
      quantity = parseFloat(qtyMatch[1]) || 1;
      unit = qtyMatch[2] ? qtyMatch[2].toLowerCase() : 'pack';
      commodityName = qtyMatch[3]?.trim() || trimmed;
    }

    // Attempt catalogue match
    const lowerQuery = commodityName.toLowerCase();
    const matched = catalogProducts.find(p => 
      p.name.toLowerCase().includes(lowerQuery) || 
      lowerQuery.includes(p.name.toLowerCase()) ||
      p.category.toLowerCase().includes(lowerQuery) ||
      (p.teluguName && lowerQuery.includes(p.teluguName))
    );

    const confidence = matched ? 0.92 : 0.45;
    const isUncertain = confidence < 0.85; // Flagged for customer review (Spec §7.3)

    return {
      rawLine: trimmed,
      matchedProduct: matched,
      quantity,
      unit,
      confidence,
      isUncertain,
      userCorrected: false
    };
  });
}

export function getRfq(id: string): QuotationRequest | undefined {
  return rfqStore.get(id);
}

export function getAllRfqs(): QuotationRequest[] {
  return Array.from(rfqStore.values());
}
