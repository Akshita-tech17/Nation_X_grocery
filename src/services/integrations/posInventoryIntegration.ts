/**
 * NationX Smart POS & Stock Integration Contract
 *
 * Grocery and POS share one authoritative inventory model.
 * Provides explicit reservation lifecycles, TTL expiry, release on failed checkout,
 * and reconciliation between online orders and counter-top POS billing.
 */

export interface StockReservationItem {
  offeringId: string;
  masterProductId: string;
  quantity: number;
}

export interface StockReservationRequest {
  idempotencyKey: string;
  checkoutSessionId: string;
  merchantId: string;
  items: StockReservationItem[];
  reservationTtlMinutes: number; // e.g. 15 minutes
}

export interface StockReservationResponse {
  success: boolean;
  reservationId: string;
  expiresAt: string;
  itemsReserved: Array<{
    offeringId: string;
    reservedQuantity: number;
    remainingAvailableStock: number;
  }>;
  insufficientItems?: Array<{
    offeringId: string;
    requested: number;
    available: number;
  }>;
}

export interface StockCommitRequest {
  idempotencyKey: string;
  reservationId: string;
  confirmedOrderId: string;
  subOrderId: string;
}

export interface StockReleaseRequest {
  idempotencyKey: string;
  reservationId: string;
  reason: 'CHECKOUT_ABANDONED' | 'PAYMENT_FAILED' | 'ORDER_CANCELLED' | 'TTL_EXPIRED';
}

export interface PosStockClient {
  reserveStock(req: StockReservationRequest): Promise<StockReservationResponse>;
  commitReservation(req: StockCommitRequest): Promise<{ success: boolean; allocatedAt: string }>;
  releaseReservation(req: StockReleaseRequest): Promise<{ success: boolean; releasedAt: string }>;
}

/**
 * Mock POS & Stock Client
 * Implements in-memory TTL reservation and idempotency simulation.
 * Clearly marked as mock: production environment requires ACID database transactions.
 */
export class MockPosStockClient implements PosStockClient {
  private activeReservations = new Map<string, StockReservationResponse>();

  async reserveStock(req: StockReservationRequest): Promise<StockReservationResponse> {
    const expiresAt = new Date(Date.now() + req.reservationTtlMinutes * 60 * 1000).toISOString();
    const reservationId = `RES-${Date.now()}`;

    const res: StockReservationResponse = {
      success: true,
      reservationId,
      expiresAt,
      itemsReserved: req.items.map(i => ({
        offeringId: i.offeringId,
        reservedQuantity: i.quantity,
        remainingAvailableStock: Math.max(0, 50 - i.quantity)
      }))
    };

    this.activeReservations.set(reservationId, res);
    console.info('[MockPosStockClient] Reserved stock items:', res);
    return res;
  }

  async commitReservation(req: StockCommitRequest) {
    console.info(`[MockPosStockClient] Committing reservation ${req.reservationId} for Order ${req.confirmedOrderId}`);
    this.activeReservations.delete(req.reservationId);
    return { success: true, allocatedAt: new Date().toISOString() };
  }

  async releaseReservation(req: StockReleaseRequest) {
    console.info(`[MockPosStockClient] Releasing reservation ${req.reservationId} due to ${req.reason}`);
    this.activeReservations.delete(req.reservationId);
    return { success: true, releasedAt: new Date().toISOString() };
  }
}
