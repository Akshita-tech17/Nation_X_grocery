/**
 * NationX Project 02: Merchant Fulfilment Pipeline & Substitution State Machine (§5.6, §5.7)
 * 
 * Compliant with:
 * - Suborder state machine: PLACED -> CONFIRMED -> PACKING -> READY_FOR_PICKUP -> OUT_FOR_DELIVERY -> DELIVERED
 * - Acceptance Test 12: Item unavailable, merchant proposes substitution, customer approves, totals updated
 * - Acceptance Test 19: Partial fulfilment: Customer rejects substitution, item refunded, remaining items fulfilled
 */

import { CartItem } from '../types';

export type SuborderStatus =
  | 'placed'
  | 'confirmed'
  | 'packing'
  | 'awaiting_substitution_approval'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'rejected'
  | 'cancelled';

export interface ProposedSubstitution {
  suborderId: string;
  originalItemId: string;
  originalItemName: string;
  originalUnitPrice: number;
  originalQuantity: number;
  originalTotalPrice: number;
  replacementItemId: string;
  replacementItemName: string;
  replacementUnitPrice: number;
  replacementTotalPrice: number;
  priceDelta: number; // replacementTotalPrice - originalTotalPrice
  merchantReason: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED_ORDER';
}

export interface FulfillableSuborder {
  id: string;
  parentOrderId: string;
  merchantId: string;
  merchantName: string;
  items: CartItem[];
  subtotal: number;
  status: SuborderStatus;
  rejectionReason?: string;
  activeSubstitution?: ProposedSubstitution;
  fulfilledItems: CartItem[];
  refundedItems: Array<{
    item: CartItem;
    refundAmount: number;
    reason: string;
  }>;
  readyForPickupTimestamp?: number;
}

export class FulfilmentService {
  private suborders: Map<string, FulfillableSuborder> = new Map();

  /**
   * Registers a newly placed suborder in the fulfilment engine
   */
  public registerSuborder(suborder: {
    id: string;
    parentOrderId: string;
    merchantId: string;
    merchantName: string;
    items: CartItem[];
    subtotal: number;
    status?: SuborderStatus;
  }): FulfillableSuborder {
    const record: FulfillableSuborder = {
      ...suborder,
      status: suborder.status || 'placed',
      fulfilledItems: [...suborder.items],
      refundedItems: [],
    };
    this.suborders.set(suborder.id, record);
    return record;
  }

  public getSuborder(suborderId: string): FulfillableSuborder | undefined {
    return this.suborders.get(suborderId);
  }

  /**
   * Merchant confirms acceptance of incoming suborder
   */
  public acceptSuborder(suborderId: string): { success: boolean; suborder?: FulfillableSuborder; error?: string } {
    const sub = this.suborders.get(suborderId);
    if (!sub) return { success: false, error: 'SUBORDER_NOT_FOUND' };
    if (sub.status !== 'placed') return { success: false, error: `CANNOT_ACCEPT_FROM_${sub.status.toUpperCase()}` };

    sub.status = 'confirmed';
    return { success: true, suborder: sub };
  }

  /**
   * Merchant rejects suborder with required reason
   */
  public rejectSuborder(suborderId: string, reason: string): { success: boolean; suborder?: FulfillableSuborder; error?: string } {
    const sub = this.suborders.get(suborderId);
    if (!sub) return { success: false, error: 'SUBORDER_NOT_FOUND' };
    if (sub.status !== 'placed' && sub.status !== 'confirmed') {
      return { success: false, error: 'CANNOT_REJECT_AT_THIS_STAGE' };
    }

    sub.status = 'rejected';
    sub.rejectionReason = reason;
    return { success: true, suborder: sub };
  }

  /**
   * Merchant starts packing items
   */
  public startPacking(suborderId: string): { success: boolean; suborder?: FulfillableSuborder; error?: string } {
    const sub = this.suborders.get(suborderId);
    if (!sub) return { success: false, error: 'SUBORDER_NOT_FOUND' };
    if (sub.status !== 'confirmed') return { success: false, error: 'SUBORDER_MUST_BE_CONFIRMED_FIRST' };

    sub.status = 'packing';
    return { success: true, suborder: sub };
  }

  /**
   * Merchant marks an item as unavailable and proposes an approved substitute (§5.7, Acceptance Test 12)
   */
  public proposeSubstitution(
    suborderId: string,
    originalItemId: string,
    replacement: {
      id: string;
      name: string;
      unitPrice: number;
    },
    reason: string = 'Stock depleted; offering premium equal replacement'
  ): { success: boolean; substitution?: ProposedSubstitution; error?: string } {
    const sub = this.suborders.get(suborderId);
    if (!sub) return { success: false, error: 'SUBORDER_NOT_FOUND' };
    if (sub.status !== 'packing') return { success: false, error: 'SUBSTITUTIONS_ALLOWED_ONLY_DURING_PACKING' };

    const original = sub.fulfilledItems.find((i) => i.product.id === originalItemId);
    if (!original) return { success: false, error: 'ORIGINAL_ITEM_NOT_IN_SUBORDER' };

    const replacementTotalPrice = replacement.unitPrice * original.quantity;
    const priceDelta = replacementTotalPrice - original.totalPrice;

    const substitution: ProposedSubstitution = {
      suborderId,
      originalItemId,
      originalItemName: original.product.name,
      originalUnitPrice: original.unitPrice,
      originalQuantity: original.quantity,
      originalTotalPrice: original.totalPrice,
      replacementItemId: replacement.id,
      replacementItemName: replacement.name,
      replacementUnitPrice: replacement.unitPrice,
      replacementTotalPrice,
      priceDelta,
      merchantReason: reason,
      status: 'PENDING',
    };

    sub.activeSubstitution = substitution;
    sub.status = 'awaiting_substitution_approval';

    return { success: true, substitution };
  }

  /**
   * Customer responds to proposed substitution (Acceptance Tests 12 & 19)
   * action: 'ACCEPT' | 'REJECT_AND_REFUND' | 'CANCEL_ORDER'
   */
  public customerResolveSubstitution(
    suborderId: string,
    action: 'ACCEPT' | 'REJECT_AND_REFUND' | 'CANCEL_ORDER'
  ): {
    success: boolean;
    suborder?: FulfillableSuborder;
    refundAmount?: number;
    updatedSubtotal?: number;
    error?: string;
  } {
    const sub = this.suborders.get(suborderId);
    if (!sub) return { success: false, error: 'SUBORDER_NOT_FOUND' };
    if (sub.status !== 'awaiting_substitution_approval' || !sub.activeSubstitution) {
      return { success: false, error: 'NO_PENDING_SUBSTITUTION' };
    }

    const subProposal = sub.activeSubstitution;

    if (action === 'ACCEPT') {
      // Acceptance Test 12: Item replaced, total adjusted, resumes to packing
      subProposal.status = 'ACCEPTED';

      const itemIdx = sub.fulfilledItems.findIndex((i) => i.product.id === subProposal.originalItemId);
      if (itemIdx >= 0) {
        const orig = sub.fulfilledItems[itemIdx];
        const replacedItem: CartItem = {
          ...orig,
          product: {
            ...orig.product,
            id: subProposal.replacementItemId,
            name: subProposal.replacementItemName,
            retailPrice: subProposal.replacementUnitPrice,
          },
          unitPrice: subProposal.replacementUnitPrice,
          totalPrice: subProposal.replacementTotalPrice,
        };
        sub.fulfilledItems[itemIdx] = replacedItem;
      }

      // Adjust suborder subtotal
      sub.subtotal += subProposal.priceDelta;
      sub.status = 'packing';
      sub.activeSubstitution = undefined;

      return {
        success: true,
        suborder: sub,
        updatedSubtotal: sub.subtotal,
        refundAmount: 0,
      };
    }

    if (action === 'REJECT_AND_REFUND') {
      // Acceptance Test 19: Partial Fulfilment. Unavailable item removed and refunded; remaining fulfilled
      subProposal.status = 'REJECTED';

      const itemIdx = sub.fulfilledItems.findIndex((i) => i.product.id === subProposal.originalItemId);
      let refundAmount = 0;
      if (itemIdx >= 0) {
        const removedItem = sub.fulfilledItems[itemIdx];
        refundAmount = removedItem.totalPrice;
        sub.refundedItems.push({
          item: removedItem,
          refundAmount,
          reason: 'Customer rejected substitution for unavailable item',
        });
        sub.fulfilledItems.splice(itemIdx, 1);
        sub.subtotal = Math.max(0, sub.subtotal - refundAmount);
      }

      sub.status = 'packing';
      sub.activeSubstitution = undefined;

      return {
        success: true,
        suborder: sub,
        refundAmount,
        updatedSubtotal: sub.subtotal,
      };
    }

    if (action === 'CANCEL_ORDER') {
      subProposal.status = 'CANCELLED_ORDER';
      sub.status = 'cancelled';
      sub.activeSubstitution = undefined;
      return {
        success: true,
        suborder: sub,
        refundAmount: sub.subtotal,
        updatedSubtotal: 0,
      };
    }

    return { success: false, error: 'INVALID_ACTION' };
  }

  /**
   * Merchant marks suborder as ready for pickup.
   * Emits handover event to Shared Delivery (§8, Acceptance Test 20).
   */
  public markReadyForPickup(suborderId: string): {
    success: boolean;
    suborder?: FulfillableSuborder;
    dispatchPayload?: any;
    error?: string;
  } {
    const sub = this.suborders.get(suborderId);
    if (!sub) return { success: false, error: 'SUBORDER_NOT_FOUND' };
    if (sub.status !== 'packing') return { success: false, error: 'MUST_BE_IN_PACKING_STAGE' };

    sub.status = 'ready_for_pickup';
    sub.readyForPickupTimestamp = Date.now();

    const dispatchPayload = {
      suborderId: sub.id,
      parentOrderId: sub.parentOrderId,
      merchantId: sub.merchantId,
      merchantName: sub.merchantName,
      readyTime: new Date(sub.readyForPickupTimestamp).toISOString(),
      itemCount: sub.fulfilledItems.length,
      packageValue: sub.subtotal,
      deliveryStatus: 'QUEUED_FOR_DRIVER_ASSIGNMENT',
    };

    return { success: true, suborder: sub, dispatchPayload };
  }
}

export const fulfilmentService = new FulfilmentService();
