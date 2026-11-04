// ============================================================================
// NATIONX GROCERY — INVENTORY & CONCURRENCY SERVICE (Spec §4.3, §5.4, §9)
// ============================================================================

import { InventoryReservation, InventoryLedgerEntry } from '../types';

export interface StockReservationRequest {
  storeId: string;
  productId: string;
  quantity: number;
}

export interface ReservationResult {
  success: boolean;
  token?: string;
  error?: string;
  availableStock?: number;
}

// In-memory runtime reservation store synchronized with Supabase schema
const activeReservations = new Map<string, InventoryReservation>();
const inventoryLedger: InventoryLedgerEntry[] = [];
// Store real-time available stock
const stockLevels = new Map<string, number>(); // key: `${storeId}:${productId}`

function getStockKey(storeId: string, productId: string): string {
  return `${storeId}:${productId}`;
}

export function setInitialStock(storeId: string, productId: string, stock: number) {
  stockLevels.set(getStockKey(storeId, productId), stock);
}

export function getAvailableStock(storeId: string, productId: string): number {
  return stockLevels.get(getStockKey(storeId, productId)) ?? 0;
}

/**
 * Atomically reserves stock with SLA timeout to prevent concurrent overselling (Spec §5.4, Test 9)
 */
export function reserveStock(
  requests: StockReservationRequest[],
  ttlMinutes: number = 15
): ReservationResult {
  const token = `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

  // First pass: Verify all items have sufficient available stock
  for (const req of requests) {
    const key = getStockKey(req.storeId, req.productId);
    const currentStock = stockLevels.get(key) ?? 0;

    if (currentStock < req.quantity) {
      return {
        success: false,
        error: `Insufficient stock for product. Available: ${currentStock}, Requested: ${req.quantity}`,
        availableStock: currentStock
      };
    }
  }

  // Second pass: Atomically deduct stock and register reservations
  for (const req of requests) {
    const key = getStockKey(req.storeId, req.productId);
    const currentStock = stockLevels.get(key) ?? 0;
    const newBalance = currentStock - req.quantity;
    stockLevels.set(key, newBalance);

    const reservation: InventoryReservation = {
      id: `res_id_${Math.random().toString(36).substring(2, 9)}`,
      token,
      storeId: req.storeId,
      productId: req.productId,
      quantity: req.quantity,
      status: 'RESERVED',
      expiresAt
    };

    activeReservations.set(`${token}_${req.productId}`, reservation);

    // Append to authoritative inventory ledger (Spec §9)
    inventoryLedger.push({
      id: `leg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      storeId: req.storeId,
      productId: req.productId,
      movementType: 'ONLINE_RESERVED',
      quantityDelta: -req.quantity,
      resultingBalance: newBalance,
      referenceType: 'RESERVATION',
      referenceId: token,
      createdAt: new Date().toISOString()
    });
  }

  return { success: true, token };
}

/**
 * Consumes reserved stock upon payment confirmation (Spec §5.4)
 */
export function consumeReservation(token: string): boolean {
  let found = false;

  for (const [key, res] of activeReservations.entries()) {
    if (res.token === token && res.status === 'RESERVED') {
      res.status = 'CONSUMED';
      found = true;

      const stockKey = getStockKey(res.storeId, res.productId);
      const currentStock = stockLevels.get(stockKey) ?? 0;

      inventoryLedger.push({
        id: `leg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        storeId: res.storeId,
        productId: res.productId,
        movementType: 'ONLINE_CONSUMED',
        quantityDelta: 0, // already deducted at reservation
        resultingBalance: currentStock,
        referenceType: 'RESERVATION',
        referenceId: token,
        createdAt: new Date().toISOString()
      });
    }
  }

  return found;
}

/**
 * Releases reserved stock if checkout fails, customer abandons, or reservation expires (Spec §5.4, Test 10)
 */
export function releaseReservation(token: string, reason: 'EXPIRED' | 'CANCELLED' = 'CANCELLED'): boolean {
  let found = false;

  for (const [key, res] of activeReservations.entries()) {
    if (res.token === token && res.status === 'RESERVED') {
      res.status = reason === 'EXPIRED' ? 'EXPIRED' : 'RELEASED';
      found = true;

      // Restore stock
      const stockKey = getStockKey(res.storeId, res.productId);
      const currentStock = stockLevels.get(stockKey) ?? 0;
      const newBalance = currentStock + res.quantity;
      stockLevels.set(stockKey, newBalance);

      inventoryLedger.push({
        id: `leg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        storeId: res.storeId,
        productId: res.productId,
        movementType: 'ONLINE_RELEASED',
        quantityDelta: res.quantity,
        resultingBalance: newBalance,
        referenceType: 'RESERVATION',
        referenceId: token,
        createdAt: new Date().toISOString()
      });
    }
  }

  return found;
}

/**
 * Reconciles physical POS sales directly from the Smart POS machine (Spec §9, Test 21)
 */
export function processPosSale(
  storeId: string, 
  productId: string, 
  quantity: number, 
  posBillId: string
): { success: boolean; newBalance: number; error?: string } {
  const key = getStockKey(storeId, productId);
  const currentStock = stockLevels.get(key) ?? 0;

  if (currentStock < quantity) {
    return {
      success: false,
      newBalance: currentStock,
      error: `POS Sale failed: Physical stock deficit. Current: ${currentStock}, Sale: ${quantity}`
    };
  }

  const newBalance = currentStock - quantity;
  stockLevels.set(key, newBalance);

  inventoryLedger.push({
    id: `leg_pos_${Date.now()}`,
    storeId,
    productId,
    movementType: 'POS_SALE',
    quantityDelta: -quantity,
    resultingBalance: newBalance,
    referenceType: 'POS_BILL',
    referenceId: posBillId,
    createdAt: new Date().toISOString()
  });

  return { success: true, newBalance };
}

/**
 * Scans and releases expired reservations (runs periodically or on checkout evaluation)
 */
export function sweepExpiredReservations(): number {
  const now = new Date();
  let expiredCount = 0;

  for (const [key, res] of activeReservations.entries()) {
    if (res.status === 'RESERVED' && new Date(res.expiresAt) < now) {
      releaseReservation(res.token, 'EXPIRED');
      expiredCount++;
    }
  }

  return expiredCount;
}

export function getLedgerHistory(storeId: string): InventoryLedgerEntry[] {
  return inventoryLedger.filter(entry => entry.storeId === storeId);
}
