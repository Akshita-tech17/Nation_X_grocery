/**
 * NationX Project 02: Stock Reservation & Concurrency Engine (§4.3, §5.4)
 * 
 * Compliant with Acceptance Tests 9 & 10:
 * - 5-minute TTL stock reservation with idempotency keys
 * - Atomic reservation check preventing overselling under concurrent load
 * - Automatic expiration and manual release back to inventory pool
 * - Shared inventory ledger entry support for POS reconciliation (§9)
 */

export interface StockReservation {
  id: string;
  offeringId: string;
  merchantId: string;
  quantity: number;
  idempotencyKey: string;
  createdAt: number;
  expiresAt: number;
  status: 'PENDING' | 'COMMITTED' | 'RELEASED' | 'EXPIRED';
}

export interface InventoryItem {
  offeringId: string;
  merchantId: string;
  totalStock: number;
  reservedStock: number;
}

export class StockReservationService {
  private inventory: Map<string, InventoryItem> = new Map();
  private reservations: Map<string, StockReservation> = new Map();
  private idempotencyIndex: Map<string, string> = new Map(); // idempotencyKey -> reservationId
  private lockMap: Map<string, Promise<void>> = new Map(); // Mutex per offeringId

  private static DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Initializes or updates inventory stock for an offering
   */
  public setInventory(offeringId: string, merchantId: string, totalStock: number): void {
    const existing = this.inventory.get(offeringId);
    this.inventory.set(offeringId, {
      offeringId,
      merchantId,
      totalStock,
      reservedStock: existing ? existing.reservedStock : 0,
    });
  }

  /**
   * Returns current stock metrics for an offering
   */
  public getStock(offeringId: string): { totalStock: number; reservedStock: number; availableStock: number } {
    this.cleanExpiredReservations();
    const item = this.inventory.get(offeringId);
    if (!item) {
      return { totalStock: 0, reservedStock: 0, availableStock: 0 };
    }
    const availableStock = Math.max(0, item.totalStock - item.reservedStock);
    return {
      totalStock: item.totalStock,
      reservedStock: item.reservedStock,
      availableStock,
    };
  }

  /**
   * Acquires a fine-grained mutex for an offeringId to simulate atomic row-level locks
   */
  private async acquireLock(offeringId: string): Promise<() => void> {
    while (this.lockMap.has(offeringId)) {
      await this.lockMap.get(offeringId);
    }
    let resolveLock!: () => void;
    const lockPromise = new Promise<void>((resolve) => {
      resolveLock = resolve;
    });
    this.lockMap.set(offeringId, lockPromise);

    return () => {
      this.lockMap.delete(offeringId);
      resolveLock();
    };
  }

  /**
   * Atomically reserves stock for an offering with a 5-minute TTL.
   * If an idempotency key is repeated, returns the existing active reservation.
   * Acceptance Test 9: Concurrent requests for final unit -> exactly 1 succeeds.
   */
  public async reserveStock(
    offeringId: string,
    quantity: number,
    options?: { ttlMs?: number; idempotencyKey?: string }
  ): Promise<{ success: boolean; reservationId?: string; remainingStock?: number; error?: string }> {
    const releaseLock = await this.acquireLock(offeringId);

    try {
      this.cleanExpiredReservations();

      const idempotencyKey = options?.idempotencyKey || `auto_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Check idempotency
      if (options?.idempotencyKey && this.idempotencyIndex.has(idempotencyKey)) {
        const existingId = this.idempotencyIndex.get(idempotencyKey)!;
        const existing = this.reservations.get(existingId);
        if (existing && existing.status === 'PENDING') {
          const item = this.inventory.get(offeringId)!;
          return {
            success: true,
            reservationId: existing.id,
            remainingStock: item.totalStock - item.reservedStock,
          };
        }
      }

      const item = this.inventory.get(offeringId);
      if (!item) {
        return { success: false, error: 'ITEM_NOT_FOUND' };
      }

      const available = item.totalStock - item.reservedStock;
      if (available < quantity) {
        return {
          success: false,
          remainingStock: Math.max(0, available),
          error: 'INSUFFICIENT_STOCK',
        };
      }

      // Reserve stock atomically
      item.reservedStock += quantity;

      const ttlMs = options?.ttlMs ?? StockReservationService.DEFAULT_TTL_MS;
      const reservationId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const reservation: StockReservation = {
        id: reservationId,
        offeringId,
        merchantId: item.merchantId,
        quantity,
        idempotencyKey,
        createdAt: Date.now(),
        expiresAt: Date.now() + ttlMs,
        status: 'PENDING',
      };

      this.reservations.set(reservationId, reservation);
      this.idempotencyIndex.set(idempotencyKey, reservationId);

      return {
        success: true,
        reservationId,
        remainingStock: item.totalStock - item.reservedStock,
      };
    } finally {
      releaseLock();
    }
  }

  /**
   * Releases an unconfirmed or abandoned reservation back to inventory.
   */
  public async releaseReservation(reservationId: string): Promise<boolean> {
    const res = this.reservations.get(reservationId);
    if (!res || res.status !== 'PENDING') {
      return false;
    }

    const releaseLock = await this.acquireLock(res.offeringId);
    try {
      const item = this.inventory.get(res.offeringId);
      if (item) {
        item.reservedStock = Math.max(0, item.reservedStock - res.quantity);
      }
      res.status = 'RELEASED';
      return true;
    } finally {
      releaseLock();
    }
  }

  /**
   * Permanently commits stock on payment confirmation.
   * Decrements totalStock and releases reservedStock.
   */
  public async commitReservation(reservationId: string): Promise<boolean> {
    const res = this.reservations.get(reservationId);
    if (!res || res.status !== 'PENDING') {
      return false;
    }

    const releaseLock = await this.acquireLock(res.offeringId);
    try {
      const item = this.inventory.get(res.offeringId);
      if (item) {
        item.totalStock = Math.max(0, item.totalStock - res.quantity);
        item.reservedStock = Math.max(0, item.reservedStock - res.quantity);
      }
      res.status = 'COMMITTED';
      return true;
    } finally {
      releaseLock();
    }
  }

  /**
   * Checks and releases all expired reservations (Acceptance Test 10).
   * Returns count of expired reservations released.
   */
  public cleanExpiredReservations(now: number = Date.now()): number {
    let releasedCount = 0;
    for (const res of this.reservations.values()) {
      if (res.status === 'PENDING' && res.expiresAt <= now) {
        const item = this.inventory.get(res.offeringId);
        if (item) {
          item.reservedStock = Math.max(0, item.reservedStock - res.quantity);
        }
        res.status = 'EXPIRED';
        releasedCount++;
      }
    }
    return releasedCount;
  }

  /**
   * Direct ledger adjustment for POS sales (§9).
   */
  public async recordPOSSale(offeringId: string, quantitySold: number): Promise<{ success: boolean; remaining: number }> {
    const releaseLock = await this.acquireLock(offeringId);
    try {
      const item = this.inventory.get(offeringId);
      if (!item) return { success: false, remaining: 0 };
      const available = item.totalStock - item.reservedStock;
      if (available < quantitySold) return { success: false, remaining: available };
      
      item.totalStock -= quantitySold;
      return { success: true, remaining: item.totalStock - item.reservedStock };
    } finally {
      releaseLock();
    }
  }
}

export const stockReservationService = new StockReservationService();
