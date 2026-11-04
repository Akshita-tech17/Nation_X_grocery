/**
 * NationX Shared Delivery Integration Contract (Project 03 Integration Boundary)
 *
 * Grocery does NOT build its own delivery dispatch engine.
 * It transmits confirmed merchant suborders to Shared Delivery for batching,
 * route coordination, partner assignment, and Proof-of-Delivery tracking.
 */

export interface SharedDeliveryPickupStop {
  merchantId: string;
  merchantName: string;
  pickupAddress: string;
  locality: string;
  contactPhone: string;
  subOrderId: string;
  packageCount: number;
  totalWeightKg: number;
  readyForPickupAt?: string;
  handoverOtpRequired: boolean;
}

export interface SharedDeliveryDropStop {
  parentOrderId: string;
  subOrderId: string;
  customerName: string;
  customerPhone: string;
  dropAddress: string;
  locality: string;
  pincode: string;
  promisedWindowStart: string;
  promisedWindowEnd: string;
  deliveryOtp: string;
  requiresPodSignature: boolean;
}

export interface SharedDeliveryRegistrationPayload {
  parentOrderId: string;
  subOrders: Array<{
    subOrderId: string;
    merchantId: string;
    merchantName: string;
    itemsSummary: string;
    weightKg: number;
    pickupLocality: string;
    destinationLocality: string;
    promisedDispatchTime: string;
  }>;
  totalAmountPayable: number;
  paymentType: 'PREPAID' | 'COD' | 'CREDIT_KHATA';
  customerContact: {
    name: string;
    phone: string;
    address: string;
    area: string;
  };
}

export interface SharedDeliveryStatusUpdate {
  subOrderId: string;
  batchId?: string;
  partnerId?: string;
  partnerName?: string;
  partnerPhone?: string;
  vehicleType?: 'TWO_WHEELER' | 'ELECTRIC_BIKE' | 'MINI_TRUCK';
  currentStage: 'UNASSIGNED' | 'BATCHED' | 'PARTNER_ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
  proofOfDeliveryRecorded: boolean;
  timestamp: string;
  notes?: string;
}

export interface SharedDeliveryClient {
  registerSubordersForDelivery(payload: SharedDeliveryRegistrationPayload): Promise<{
    success: boolean;
    batchCandidateId: string;
    status: string;
  }>;
  getDeliveryTrackingStatus(subOrderId: string): Promise<SharedDeliveryStatusUpdate>;
}

/**
 * Mock Shared Delivery Adapter
 * Clearly marked as client-side mock until live backend microservice is reachable.
 */
export class MockSharedDeliveryClient implements SharedDeliveryClient {
  async registerSubordersForDelivery(payload: SharedDeliveryRegistrationPayload) {
    console.info('[MockSharedDeliveryClient] Transmitted suborders to Shared Delivery queue:', payload);
    return {
      success: true,
      batchCandidateId: `BATCH-CANDIDATE-${Date.now()}`,
      status: 'QUEUED_FOR_LOCALITY_BATCHING'
    };
  }

  async getDeliveryTrackingStatus(subOrderId: string): Promise<SharedDeliveryStatusUpdate> {
    return {
      subOrderId,
      batchId: 'KHM-BATCH-0042',
      partnerId: 'RIDER-9921',
      partnerName: 'Ramesh K.',
      partnerPhone: '+91 98450 11920',
      vehicleType: 'ELECTRIC_BIKE',
      currentStage: 'IN_TRANSIT',
      proofOfDeliveryRecorded: false,
      timestamp: new Date().toISOString()
    };
  }
}
