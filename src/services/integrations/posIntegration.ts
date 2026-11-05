/**
 * NationX Project 02: POS Shared Inventory Ledger Contract (§9, Acceptance Test 21)
 * 
 * Compliant with:
 * - Real-time synchronization between in-store Smart POS and online grocery catalogue
 * - Two-way stock deductions (In-store sale reflects immediately in online stock)
 */

import { StockReservationService, stockReservationService as defaultStockReservationService } from '../stockReservationService';

export interface POSSaleEvent {
  posTerminalId: string;
  storeId: string;
  receiptNumber: string;
  itemsSold: Array<{
    offeringId: string;
    productName: string;
    quantity: number;
    salePrice: number;
  }>;
  timestamp: number;
}

export class POSIntegrationService {
  private posTransactionHistory: POSSaleEvent[] = [];
  private stockService: StockReservationService;

  constructor(stockService: StockReservationService = defaultStockReservationService) {
    this.stockService = stockService;
  }

  /**
   * Processes POS physical store sale and immediately synchronizes online inventory ledger (Test 21).
   */
  public async handlePOSSale(event: POSSaleEvent): Promise<{
    success: boolean;
    syncedItems: Array<{ offeringId: string; remainingStock: number }>;
  }> {
    this.posTransactionHistory.push(event);
    const syncedItems: Array<{ offeringId: string; remainingStock: number }> = [];

    for (const item of event.itemsSold) {
      const result = await this.stockService.recordPOSSale(item.offeringId, item.quantity);
      syncedItems.push({
        offeringId: item.offeringId,
        remainingStock: result.remaining,
      });
    }

    return {
      success: true,
      syncedItems,
    };
  }

  public getHistory(): POSSaleEvent[] {
    return [...this.posTransactionHistory];
  }
}

export const posIntegrationService = new POSIntegrationService();
