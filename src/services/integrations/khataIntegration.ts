/**
 * NationX Project 02: Digital Khata Credit Check & Ledger Contract (§10, Acceptance Tests 22 & 23)
 * 
 * Compliant with:
 * - Customer credit eligibility check before checkout
 * - Exactly-once ledger posting protected by idempotency key (Test 22)
 * - Reversing credit entry for cancelled or returned orders (Test 23)
 */

export interface KhataAccount {
  customerId: string;
  merchantId: string;
  isEnabled: boolean;
  creditLimit: number;
  currentBalance: number; // positive = amount owed by customer
}

export interface KhataLedgerEntry {
  id: string;
  idempotencyKey: string;
  customerId: string;
  merchantId: string;
  orderId: string;
  entryType: 'DEBIT' | 'CREDIT'; // DEBIT = purchase on credit; CREDIT = repayment or refund
  amount: number;
  balanceAfter: number;
  note: string;
  timestamp: number;
}

export class KhataIntegrationService {
  private accounts: Map<string, KhataAccount> = new Map(); // key: customerId:merchantId
  private ledgerEntries: Map<string, KhataLedgerEntry> = new Map(); // key: entryId
  private idempotencyIndex: Map<string, string> = new Map(); // key: idempotencyKey -> entryId

  private getAccountKey(customerId: string, merchantId: string): string {
    return `${customerId}:${merchantId}`;
  }

  /**
   * Configures or updates a customer's Khata credit account with a merchant
   */
  public setupAccount(customerId: string, merchantId: string, creditLimit: number, isEnabled: boolean = true): KhataAccount {
    const key = this.getAccountKey(customerId, merchantId);
    const existing = this.accounts.get(key);
    const account: KhataAccount = {
      customerId,
      merchantId,
      isEnabled,
      creditLimit,
      currentBalance: existing ? existing.currentBalance : 0,
    };
    this.accounts.set(key, account);
    return account;
  }

  /**
   * Verifies if customer has sufficient Khata credit limit available for a purchase
   */
  public verifyCreditAvailability(
    customerId: string,
    merchantId: string,
    requiredAmount: number
  ): { isEligible: boolean; availableCredit: number; error?: string } {
    const key = this.getAccountKey(customerId, merchantId);
    const account = this.accounts.get(key);

    if (!account || !account.isEnabled) {
      return {
        isEligible: false,
        availableCredit: 0,
        error: 'KHATA_NOT_ENABLED_FOR_THIS_MERCHANT',
      };
    }

    const availableCredit = Math.max(0, account.creditLimit - account.currentBalance);
    if (availableCredit < requiredAmount) {
      return {
        isEligible: false,
        availableCredit,
        error: `INSUFFICIENT_CREDIT_LIMIT: Available ₹${availableCredit}, required ₹${requiredAmount}`,
      };
    }

    return {
      isEligible: true,
      availableCredit,
    };
  }

  /**
   * Records a Khata purchase debit.
   * Acceptance Test 22: Exactly-once ledger posting. If the same idempotency key is submitted twice,
   * the duplicate is ignored and the original entry is returned.
   */
  public recordPurchaseDebit(
    customerId: string,
    merchantId: string,
    orderId: string,
    amount: number,
    idempotencyKey: string
  ): { success: boolean; entry?: KhataLedgerEntry; isDuplicate?: boolean; error?: string } {
    // Idempotency check (Test 22)
    if (this.idempotencyIndex.has(idempotencyKey)) {
      const existingId = this.idempotencyIndex.get(idempotencyKey)!;
      return {
        success: true,
        entry: this.ledgerEntries.get(existingId),
        isDuplicate: true,
      };
    }

    const check = this.verifyCreditAvailability(customerId, merchantId, amount);
    if (!check.isEligible) {
      return { success: false, error: check.error };
    }

    const key = this.getAccountKey(customerId, merchantId);
    const account = this.accounts.get(key)!;

    account.currentBalance += amount;

    const entryId = `khata_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const entry: KhataLedgerEntry = {
      id: entryId,
      idempotencyKey,
      customerId,
      merchantId,
      orderId,
      entryType: 'DEBIT',
      amount,
      balanceAfter: account.currentBalance,
      note: `Online Grocery Order ${orderId}`,
      timestamp: Date.now(),
    };

    this.ledgerEntries.set(entryId, entry);
    this.idempotencyIndex.set(idempotencyKey, entryId);

    return { success: true, entry, isDuplicate: false };
  }

  /**
   * Records a Khata refund / reversal credit for cancelled items or returns (Test 23)
   */
  public recordRefundCredit(
    customerId: string,
    merchantId: string,
    orderId: string,
    amount: number,
    idempotencyKey: string,
    reason: string = 'Item refund'
  ): { success: boolean; entry?: KhataLedgerEntry; isDuplicate?: boolean } {
    if (this.idempotencyIndex.has(idempotencyKey)) {
      const existingId = this.idempotencyIndex.get(idempotencyKey)!;
      return {
        success: true,
        entry: this.ledgerEntries.get(existingId),
        isDuplicate: true,
      };
    }

    const key = this.getAccountKey(customerId, merchantId);
    const account = this.accounts.get(key);
    if (account) {
      account.currentBalance = Math.max(0, account.currentBalance - amount);
    }

    const entryId = `khata_ref_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const entry: KhataLedgerEntry = {
      id: entryId,
      idempotencyKey,
      customerId,
      merchantId,
      orderId,
      entryType: 'CREDIT',
      amount,
      balanceAfter: account ? account.currentBalance : 0,
      note: `Refund for Order ${orderId}: ${reason}`,
      timestamp: Date.now(),
    };

    this.ledgerEntries.set(entryId, entry);
    this.idempotencyIndex.set(idempotencyKey, entryId);

    return { success: true, entry, isDuplicate: false };
  }

  public getAccount(customerId: string, merchantId: string): KhataAccount | undefined {
    return this.accounts.get(this.getAccountKey(customerId, merchantId));
  }
}

export const khataIntegrationService = new KhataIntegrationService();
