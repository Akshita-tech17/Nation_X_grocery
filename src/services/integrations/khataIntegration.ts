/**
 * NationX Khata (Credit Ledger) Integration Contract
 *
 * Where merchant credit sales are enabled, Grocery integrates with Khata.
 * Enforces transaction idempotency to guarantee an authorized credit sale
 * creates exactly one debit ledger entry without duplication on retries.
 */

export interface KhataCreditSaleRequest {
  idempotencyKey: string;
  merchantId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  parentOrderId: string;
  subOrderId: string;
  creditAmount: number;
  creditDaysTerms: number; // e.g. 7, 15, or 30 days
  description: string;
}

export interface KhataLedgerEntry {
  transactionId: string;
  idempotencyKey: string;
  merchantId: string;
  customerId: string;
  entryType: 'DEBIT_PURCHASE' | 'CREDIT_REPAYMENT' | 'REFUND_CREDIT';
  amount: number;
  runningBalance: number;
  createdAt: string;
  dueDate: string;
  status: 'POSTED' | 'DISPUTED' | 'CLEARED';
}

export interface KhataClient {
  recordCreditSale(req: KhataCreditSaleRequest): Promise<{
    success: boolean;
    ledgerEntry: KhataLedgerEntry;
  }>;
  getCustomerBalance(merchantId: string, customerId: string): Promise<{
    currentOutstanding: number;
    creditLimit: number;
    availableCredit: number;
    isEligible: boolean;
  }>;
}

/**
 * Mock Khata Client Adapter
 * Clearly labeled as client mock until authenticated Supabase microservice is bound.
 */
export class MockKhataClient implements KhataClient {
  private postedEntries = new Map<string, KhataLedgerEntry>();

  async recordCreditSale(req: KhataCreditSaleRequest) {
    // Idempotency check: prevent duplicate ledger entries
    if (this.postedEntries.has(req.idempotencyKey)) {
      console.warn(`[MockKhataClient] Duplicate idempotencyKey ${req.idempotencyKey} detected. Returning cached entry.`);
      return {
        success: true,
        ledgerEntry: this.postedEntries.get(req.idempotencyKey)!
      };
    }

    const dueDate = new Date(Date.now() + req.creditDaysTerms * 24 * 3600 * 1000).toISOString();
    const entry: KhataLedgerEntry = {
      transactionId: `TX-KHATA-${Date.now()}`,
      idempotencyKey: req.idempotencyKey,
      merchantId: req.merchantId,
      customerId: req.customerId,
      entryType: 'DEBIT_PURCHASE',
      amount: req.creditAmount,
      runningBalance: 3200 + req.creditAmount,
      createdAt: new Date().toISOString(),
      dueDate,
      status: 'POSTED'
    };

    this.postedEntries.set(req.idempotencyKey, entry);
    console.info('[MockKhataClient] Recorded credit sale:', entry);
    return { success: true, ledgerEntry: entry };
  }

  async getCustomerBalance(_merchantId: string, _customerId: string) {
    return {
      currentOutstanding: 3200,
      creditLimit: 10000,
      availableCredit: 6800,
      isEligible: true
    };
  }
}
