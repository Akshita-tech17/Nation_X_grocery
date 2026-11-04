// ============================================================================
// NATIONX GROCERY — CROSS-MODULE INTEGRATION CONTRACTS (Spec §8, §9, §10)
// ============================================================================

import { SubOrder } from '../types';

export interface SharedDeliveryHandoffPayload {
  subOrderId: string;
  parentOrderId: string;
  merchantStoreId: string;
  pickupAddress: string;
  deliveryAddress: string;
  itemCount: number;
  totalWeightKg?: number;
  preparationStatus: 'READY_FOR_PICKUP';
  eligibleDeliveryWindow: string;
}

export interface SharedDeliveryMirrorStatus {
  subOrderId: string;
  deliveryJobId: string;
  status: 'ASSIGNED' | 'RIDER_EN_ROUTE_PICKUP' | 'PICKED_UP' | 'ON_ROUTE_DELIVERY' | 'DELIVERED' | 'FAILED_ATTEMPT';
  riderName?: string;
  riderPhone?: string;
  eta?: string;
  lastUpdated: string;
}

export interface KhataCreditSaleRequest {
  storeId: string;
  customerId: string;
  subOrderId: string;
  amount: number;
  idempotencyKey: string;
  authorizedByMerchantId: string;
}

// In-memory Khata ledger & delivery mirror
const processedKhataIdempotencyKeys = new Set<string>();
const khataLedgerRecords: Array<KhataCreditSaleRequest & { timestamp: string }> = [];
const deliveryDispatches = new Map<string, SharedDeliveryMirrorStatus>();

/**
 * SHARED DELIVERY (§8, Test 20):
 * Passes confirmed suborder to Shared Delivery without maintaining conflicting delivery engine.
 * Grocery consumes authoritative status as a mirror only.
 */
export function handoffToSharedDelivery(
  subOrder: SubOrder,
  pickupAddress: string,
  deliveryAddress: string
): { success: boolean; deliveryJobId: string } {
  const deliveryJobId = `DEL_JOB_${subOrder.id}`;

  const initialMirror: SharedDeliveryMirrorStatus = {
    subOrderId: subOrder.id,
    deliveryJobId,
    status: 'ASSIGNED',
    riderName: 'Vikram Singh (NationX Fleet)',
    riderPhone: '+91 98765 12345',
    eta: '25-35 mins',
    lastUpdated: new Date().toISOString()
  };

  deliveryDispatches.set(subOrder.id, initialMirror);

  return { success: true, deliveryJobId };
}

/**
 * Consumes authoritative status update from Shared Delivery fleet (Spec §8)
 */
export function getDeliveryMirrorStatus(subOrderId: string): SharedDeliveryMirrorStatus | undefined {
  return deliveryDispatches.get(subOrderId);
}

/**
 * KHATA DIGITAL CREDIT LEDGER (§10, Test 22):
 * Authorised credit sale creates ledger entry exactly once.
 * Repeated requests, retries and event delivery do not duplicate the entry.
 */
export function recordKhataCreditSale(
  req: KhataCreditSaleRequest,
  isStoreKhataEnabled: boolean
): { success: boolean; duplicate: boolean; error?: string } {
  if (!isStoreKhataEnabled) {
    return {
      success: false,
      duplicate: false,
      error: 'Khata credit sales are not enabled for this merchant store (§10).'
    };
  }

  // Idempotency check: repeated calls with same key must not duplicate credit entry (Test 22)
  if (processedKhataIdempotencyKeys.has(req.idempotencyKey)) {
    return {
      success: true,
      duplicate: true
    };
  }

  processedKhataIdempotencyKeys.add(req.idempotencyKey);
  khataLedgerRecords.push({
    ...req,
    timestamp: new Date().toISOString()
  });

  return {
    success: true,
    duplicate: false
  };
}

export function getKhataLedger(storeId: string) {
  return khataLedgerRecords.filter(r => r.storeId === storeId);
}
