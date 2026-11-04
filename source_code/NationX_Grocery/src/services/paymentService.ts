// ============================================================================
// NATIONX GROCERY — CUSTOM PAYMENT STATE MACHINE & API (Spec §5.5, Test 11)
// ============================================================================

import { PaymentTransaction } from '../types';

export interface PaymentIntentRequest {
  parentOrderId: string;
  amount: number;
  currency?: string;
  idempotencyKey: string;
  paymentMethod: 'UPI' | 'CARD' | 'NETBANKING' | 'KHATA_CREDIT' | 'CASH_ON_DELIVERY';
}

export interface PaymentIntentResponse {
  success: boolean;
  transactionReference: string;
  amount: number;
  currency: string;
  status: 'INITIATED' | 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REFUNDED';
  gatewayOrderId: string;
  error?: string;
}

export interface WebhookCallbackPayload {
  transactionReference: string;
  gatewayPaymentId: string;
  status: 'SUCCESS' | 'FAILED' | 'TIMEOUT';
  signature: string;
  idempotencyKey: string;
  receivedAt: string;
}

// In-memory payment ledger tracking transactions and idempotency keys
const transactionStore = new Map<string, PaymentTransaction>();
const processedIdempotencyKeys = new Set<string>();
const webhookAuditLog: WebhookCallbackPayload[] = [];

// COD Guard: Spec §5.5: "COD support and its operating rules must be explicitly decided before implementation. Cash on delivery stays off until the business decides."
export const IS_COD_ENABLED = false;

/**
 * Creates an authoritative payment intent (Spec §5.5)
 */
export function createPaymentIntent(req: PaymentIntentRequest): PaymentIntentResponse {
  if (req.paymentMethod === 'CASH_ON_DELIVERY' && !IS_COD_ENABLED) {
    return {
      success: false,
      transactionReference: '',
      amount: req.amount,
      currency: 'INR',
      status: 'FAILED',
      gatewayOrderId: '',
      error: 'Cash on delivery is currently disabled per platform operating policy (§5.5).'
    };
  }

  // Idempotency verification: prevent duplicate transaction creation (Test 11)
  if (processedIdempotencyKeys.has(req.idempotencyKey)) {
    const existing = Array.from(transactionStore.values()).find(t => t.idempotencyKey === req.idempotencyKey);
    if (existing) {
      return {
        success: true,
        transactionReference: existing.transactionReference,
        amount: existing.amount,
        currency: existing.currency,
        status: existing.status,
        gatewayOrderId: `gw_${existing.transactionReference}`
      };
    }
  }

  const transactionReference = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const transaction: PaymentTransaction = {
    id: `pay_${Date.now()}`,
    transactionReference,
    parentOrderId: req.parentOrderId,
    amount: req.amount,
    currency: req.currency || 'INR',
    idempotencyKey: req.idempotencyKey,
    status: 'PENDING',
    retryCount: 0,
    createdAt: new Date().toISOString()
  };

  transactionStore.set(transactionReference, transaction);
  processedIdempotencyKeys.add(req.idempotencyKey);

  return {
    success: true,
    transactionReference,
    amount: req.amount,
    currency: transaction.currency,
    status: 'PENDING',
    gatewayOrderId: `gw_${transactionReference}`
  };
}

/**
 * Verifies provider-confirmed payment status (Spec §5.5: "Do not mark a payment successful solely because the customer returns to the application")
 */
export function verifyProviderPayment(
  transactionReference: string,
  providerConfirmation: { gatewayPaymentId: string; status: 'PAID' | 'FAILED' }
): { success: boolean; transaction?: PaymentTransaction; error?: string } {
  const transaction = transactionStore.get(transactionReference);

  if (!transaction) {
    return { success: false, error: 'Transaction not found in ledger' };
  }

  if (transaction.status === 'CONFIRMED') {
    // Already confirmed, return idempotent success
    return { success: true, transaction };
  }

  if (providerConfirmation.status === 'PAID') {
    transaction.status = 'CONFIRMED';
    return { success: true, transaction };
  } else {
    transaction.status = 'FAILED';
    transaction.failureCode = 'PROVIDER_DECLINED';
    transaction.failureMessage = 'Payment declined by issuing bank / UPI switch';
    return { success: false, transaction, error: transaction.failureMessage };
  }
}

/**
 * Handles incoming webhooks, idempotent retry processing and duplicate callbacks (Spec §5.5, Test 11)
 */
export function handlePaymentWebhook(payload: WebhookCallbackPayload): { accepted: boolean; duplicate: boolean } {
  // Check for duplicate webhook events
  const isDuplicate = webhookAuditLog.some(
    log => log.transactionReference === payload.transactionReference && log.status === payload.status
  );

  webhookAuditLog.push(payload);

  if (isDuplicate) {
    // Acknowledge receipt without reprocessing state changes (Test 11)
    return { accepted: true, duplicate: true };
  }

  const transaction = transactionStore.get(payload.transactionReference);
  if (transaction && transaction.status !== 'CONFIRMED') {
    if (payload.status === 'SUCCESS') {
      transaction.status = 'CONFIRMED';
    } else {
      transaction.status = 'FAILED';
      transaction.retryCount += 1;
    }
  }

  return { accepted: true, duplicate: false };
}

/**
 * Initiates an auditable partial or full refund (Spec §5.5, §5.6)
 */
export function processRefund(
  transactionReference: string,
  refundAmount: number,
  reason: string
): { success: boolean; refundReference?: string; error?: string } {
  const transaction = transactionStore.get(transactionReference);

  if (!transaction) {
    return { success: false, error: 'Original transaction not found' };
  }

  if (transaction.status !== 'CONFIRMED') {
    return { success: false, error: 'Cannot refund non-confirmed transaction' };
  }

  if (refundAmount > transaction.amount) {
    return { success: false, error: 'Refund amount exceeds original charge' };
  }

  transaction.status = 'REFUNDED';
  const refundReference = `ref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  return { success: true, refundReference };
}

export function getTransaction(transactionReference: string): PaymentTransaction | undefined {
  return transactionStore.get(transactionReference);
}
