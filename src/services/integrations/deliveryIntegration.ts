/**
 * NationX Project 02: Shared Delivery Integration (§8, Acceptance Test 20)
 * 
 * Compliant with:
 * - Suborder handoff upon READY_FOR_PICKUP event
 * - Read-only mirror of delivery status (Delivery updates do not mutate business logic)
 */

export type DeliveryStatus =
  | 'QUEUED'
  | 'ASSIGNED'
  | 'ARRIVED_AT_STORE'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED_DELIVERY';

export interface DeliveryHandOffPayload {
  suborderId: string;
  parentOrderId: string;
  merchantId: string;
  merchantName: string;
  pickupAddress: {
    street: string;
    area: string;
    city: string;
    pincode: string;
    phone: string;
  };
  deliveryAddress: {
    name: string;
    phone: string;
    street: string;
    area: string;
    city: string;
    pincode: string;
  };
  itemCount: number;
  packageValue: number;
  isColdChainRequired: boolean;
  cashToCollect: number; // 0 for prepaid/Khata
  handOffTimestamp: number;
}

export interface DeliveryMirrorRecord {
  deliveryTrackingId: string;
  suborderId: string;
  riderName?: string;
  riderPhone?: string;
  status: DeliveryStatus;
  lastUpdated: number;
  history: Array<{ status: DeliveryStatus; timestamp: number; note?: string }>;
}

export class DeliveryIntegrationService {
  private dispatches: Map<string, DeliveryHandOffPayload> = new Map();
  private deliveryMirrors: Map<string, DeliveryMirrorRecord> = new Map();

  /**
   * Transmits suborder to Delivery Queue upon ready for pickup (Test 20)
   */
  public dispatchToDelivery(payload: DeliveryHandOffPayload): { success: boolean; trackingId: string } {
    const trackingId = `del_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.dispatches.set(payload.suborderId, payload);

    const mirror: DeliveryMirrorRecord = {
      deliveryTrackingId: trackingId,
      suborderId: payload.suborderId,
      status: 'QUEUED',
      lastUpdated: Date.now(),
      history: [{ status: 'QUEUED', timestamp: Date.now(), note: 'Package ready at merchant store' }],
    };

    this.deliveryMirrors.set(payload.suborderId, mirror);
    return { success: true, trackingId };
  }

  /**
   * Receives status mirror update from Delivery Module (Project 03).
   * Note: This operates strictly as a read-only mirror and does not alter store payment or catalogue.
   */
  public ingestDeliveryStatusUpdate(
    suborderId: string,
    status: DeliveryStatus,
    details?: { riderName?: string; riderPhone?: string; note?: string }
  ): boolean {
    const record = this.deliveryMirrors.get(suborderId);
    if (!record) return false;

    record.status = status;
    record.lastUpdated = Date.now();
    if (details?.riderName) record.riderName = details.riderName;
    if (details?.riderPhone) record.riderPhone = details.riderPhone;
    record.history.push({
      status,
      timestamp: Date.now(),
      note: details?.note,
    });

    return true;
  }

  public getDeliveryStatusMirror(suborderId: string): DeliveryMirrorRecord | undefined {
    return this.deliveryMirrors.get(suborderId);
  }
}

export const deliveryIntegrationService = new DeliveryIntegrationService();
