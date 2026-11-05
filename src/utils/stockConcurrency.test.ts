import { describe, it, expect, beforeEach } from 'vitest';
import { StockReservationService } from '../services/stockReservationService';

describe('Stock Reservation & Concurrency Engine (Spec §4.3, §5.4, Tests 9 & 10)', () => {
  let stockService: StockReservationService;

  beforeEach(() => {
    stockService = new StockReservationService();
    // Initialize offering 'rice_sona_1' with 1 unit of stock
    stockService.setInventory('rice_sona_1', 'merchant_101', 1);
  });

  it('Acceptance Test 9: Concurrent stock reservation - exactly 1 customer succeeds for last unit, others fail', async () => {
    // 10 simultaneous requests attempting to reserve the last 1 unit of rice
    const customerAttempts = Array.from({ length: 10 }, (_, i) =>
      stockService.reserveStock('rice_sona_1', 1, {
        idempotencyKey: `customer_req_${i}`,
      })
    );

    const results = await Promise.all(customerAttempts);

    const successful = results.filter((r) => r.success);
    const rejected = results.filter((r) => !r.success);

    // Exactly one reservation must succeed
    expect(successful).toHaveLength(1);
    expect(successful[0].reservationId).toBeDefined();

    // The other 9 must fail with INSUFFICIENT_STOCK
    expect(rejected).toHaveLength(9);
    rejected.forEach((r) => {
      expect(r.error).toBe('INSUFFICIENT_STOCK');
      expect(r.remainingStock).toBe(0);
    });

    // Available stock must be 0
    const stock = stockService.getStock('rice_sona_1');
    expect(stock.availableStock).toBe(0);
    expect(stock.reservedStock).toBe(1);
  });

  it('Acceptance Test 10: Expired reservation release - abandoned checkout releases stock after 5-minute TTL', async () => {
    const now = Date.now();
    const TTL_5_MIN = 5 * 60 * 1000;

    // Customer 1 reserves the last unit
    const res1 = await stockService.reserveStock('rice_sona_1', 1, {
      ttlMs: TTL_5_MIN,
      idempotencyKey: 'customer_1_abandon',
    });
    expect(res1.success).toBe(true);

    // Immediate attempt by Customer 2 fails because stock is reserved
    const res2Immediate = await stockService.reserveStock('rice_sona_1', 1, {
      idempotencyKey: 'customer_2_immediate',
    });
    expect(res2Immediate.success).toBe(false);
    expect(res2Immediate.error).toBe('INSUFFICIENT_STOCK');

    // Fast-forward time past 5-minute TTL
    const afterExpiry = now + TTL_5_MIN + 1000;
    const releasedCount = stockService.cleanExpiredReservations(afterExpiry);
    expect(releasedCount).toBe(1);

    // After expiration, available stock is restored to 1
    const stockAfter = stockService.getStock('rice_sona_1');
    expect(stockAfter.availableStock).toBe(1);
    expect(stockAfter.reservedStock).toBe(0);

    // Customer 2 can now successfully purchase the item
    const res2After = await stockService.reserveStock('rice_sona_1', 1, {
      idempotencyKey: 'customer_2_retry',
    });
    expect(res2After.success).toBe(true);
    expect(res2After.reservationId).toBeDefined();
  });

  it('Idempotent reservation requests return the existing reservation without double-decrementing stock', async () => {
    stockService.setInventory('atta_ashirvaad_5kg', 'merchant_101', 5);

    const idempotencyKey = 'unique_checkout_session_999';

    // First attempt
    const resA = await stockService.reserveStock('atta_ashirvaad_5kg', 2, { idempotencyKey });
    expect(resA.success).toBe(true);

    // Immediate retry with identical idempotency key (e.g. network glitch or double-click)
    const resB = await stockService.reserveStock('atta_ashirvaad_5kg', 2, { idempotencyKey });
    expect(resB.success).toBe(true);
    expect(resB.reservationId).toBe(resA.reservationId);

    // Stock reserved should only be 2, not 4
    const stock = stockService.getStock('atta_ashirvaad_5kg');
    expect(stock.reservedStock).toBe(2);
    expect(stock.availableStock).toBe(3);
  });

  it('Permanent commit on checkout confirmation decrements totalStock permanently', async () => {
    stockService.setInventory('dal_toor_1kg', 'merchant_101', 10);

    const res = await stockService.reserveStock('dal_toor_1kg', 3);
    expect(res.success).toBe(true);

    const committed = await stockService.commitReservation(res.reservationId!);
    expect(committed).toBe(true);

    const stock = stockService.getStock('dal_toor_1kg');
    expect(stock.totalStock).toBe(7);
    expect(stock.reservedStock).toBe(0);
    expect(stock.availableStock).toBe(7);
  });

  it('POS sale directly decrements total inventory ledger (§9)', async () => {
    stockService.setInventory('sugar_madhur_1kg', 'merchant_101', 20);

    const posResult = await stockService.recordPOSSale('sugar_madhur_1kg', 5);
    expect(posResult.success).toBe(true);
    expect(posResult.remaining).toBe(15);

    const stock = stockService.getStock('sugar_madhur_1kg');
    expect(stock.totalStock).toBe(15);
    expect(stock.availableStock).toBe(15);
  });
});
