import React, { useState } from 'react';
import { useMerchant } from '../../context/MerchantContext';
import { OrderStatus, SubOrderItem } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import {
  Package,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Store
} from 'lucide-react';

export const OrderPipeline: React.FC = () => {
  const {
    orders,
    activeMerchantId,
    merchants,
    advanceSubOrderStatus,
    rejectSubOrder,
    proposeSubstitution
  } = useMerchant();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [substitutionModalOpen, setSubstitutionModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [activeSubOrderId, setActiveSubOrderId] = useState<string>('');
  const [selectedItemToSub, setSelectedItemToSub] = useState<SubOrderItem | null>(null);

  // Substitution form fields
  const [substituteName, setSubstituteName] = useState('');
  const [substituteQty, setSubstituteQty] = useState(1);
  const [substitutePrice, setSubstitutePrice] = useState(0);
  const [substituteReason, setSubstituteReason] = useState('Out of requested brand pack size; offering equivalent grade');

  // Reject form fields
  const [rejectReason, setRejectReason] = useState('Stock exhausted and no suitable substitution available.');

  const currentStore = merchants.find(m => m.id === activeMerchantId) || merchants[0];

  // Extract all suborders belonging to this merchant
  const merchantSubordersWithParent: Array<{
    parentOrderId: string;
    parentDate: string;
    customerAddress: any;
    subOrder: any;
  }> = [];

  orders.forEach(parent => {
    parent.subOrders.forEach(sub => {
      if (sub.merchantId === activeMerchantId) {
        merchantSubordersWithParent.push({
          parentOrderId: parent.id,
          parentDate: parent.date,
          customerAddress: parent.deliveryAddress,
          subOrder: sub
        });
      }
    });
  });

  const filtered = merchantSubordersWithParent.filter(({ subOrder }) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return subOrder.status === 'placed' || subOrder.status === 'confirmed';
    if (filterStatus === 'packing') return subOrder.status === 'packing' || subOrder.status === 'ready_for_pickup';
    if (filterStatus === 'dispatch') return subOrder.status === 'out_for_delivery';
    if (filterStatus === 'delivered') return subOrder.status === 'delivered';
    if (filterStatus === 'cancelled') return subOrder.status === 'cancelled';
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return <Badge variant="blue">New Suborder Placed</Badge>;
      case 'confirmed':
        return <Badge variant="purple">Store Confirmed</Badge>;
      case 'packing':
        return <Badge variant="amber">Packing Items</Badge>;
      case 'ready_for_pickup':
        return <Badge variant="amber">Ready for Rider Pickup</Badge>;
      case 'out_for_delivery':
        return <Badge variant="blue">Out for Delivery</Badge>;
      case 'delivered':
        return <Badge variant="forest">Delivered & Fulfilled</Badge>;
      case 'cancelled':
        return <Badge variant="rose">Rejected / Cancelled</Badge>;
      default:
        return <Badge variant="stone">{status}</Badge>;
    }
  };

  const getNextActionLabel = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return 'Accept Suborder';
      case 'confirmed':
        return 'Start Packing Items';
      case 'packing':
        return 'Mark Ready for Pickup';
      case 'ready_for_pickup':
        return 'Handover to Delivery Rider';
      case 'out_for_delivery':
        return 'Mark Delivered';
      case 'delivered':
        return 'Fulfilled';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Advance Status';
    }
  };

  const handleOpenSubstitutionModal = (subOrderId: string, item: SubOrderItem) => {
    setActiveSubOrderId(subOrderId);
    setSelectedItemToSub(item);
    setSubstituteName(item.productName);
    setSubstituteQty(item.quantity);
    setSubstitutePrice(item.unitPrice);
    setSubstitutionModalOpen(true);
  };

  const handleSubmitSubstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemToSub || !activeSubOrderId) return;

    proposeSubstitution(activeSubOrderId, {
      originalItemId: selectedItemToSub.offeringId,
      originalProductName: selectedItemToSub.productName,
      originalQuantity: selectedItemToSub.quantity,
      originalPrice: selectedItemToSub.unitPrice,
      substituteProductName: substituteName,
      substituteQuantity: substituteQty,
      substitutePrice: substitutePrice,
      reason: substituteReason
    });

    setSubstitutionModalOpen(false);
  };

  const handleOpenRejectModal = (subOrderId: string) => {
    setActiveSubOrderId(subOrderId);
    setRejectModalOpen(true);
  };

  const handleSubmitReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubOrderId) return;
    rejectSubOrder(activeSubOrderId, rejectReason);
    setRejectModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter Tabs */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-forest-700" />
            <h3 className="font-bold text-stone-900 text-base">
              {currentStore.name} — Orders Pipeline
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Isolated merchant fulfillment: view only your shop's authorized suborders and coordinate readiness.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'All', count: merchantSubordersWithParent.length },
            { id: 'pending', label: 'Incoming', count: merchantSubordersWithParent.filter(x => x.subOrder.status === 'placed' || x.subOrder.status === 'confirmed').length },
            { id: 'packing', label: 'In Prep', count: merchantSubordersWithParent.filter(x => x.subOrder.status === 'packing' || x.subOrder.status === 'ready_for_pickup').length },
            { id: 'dispatch', label: 'On Route', count: merchantSubordersWithParent.filter(x => x.subOrder.status === 'out_for_delivery').length },
            { id: 'delivered', label: 'Delivered', count: merchantSubordersWithParent.filter(x => x.subOrder.status === 'delivered').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center gap-1.5 ${
                filterStatus === tab.id
                  ? 'bg-forest-900 text-white font-bold'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filterStatus === tab.id ? 'bg-forest-800 text-emerald-200' : 'bg-stone-200 text-stone-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center text-xs text-stone-500">
            No authorized suborders match the selected filter for {currentStore.name}.
          </div>
        ) : (
          filtered.map(({ parentOrderId, parentDate, customerAddress, subOrder }) => {
            const isDelivered = subOrder.status === 'delivered';
            const isCancelled = subOrder.status === 'cancelled';
            const hasPendingSubstitutions = subOrder.substitutionsProposed?.some(
              (p: any) => p.status === 'pending_customer_approval'
            );

            return (
              <div
                key={subOrder.id}
                className={`p-5 rounded-3xl border transition-all ${
                  isDelivered || isCancelled
                    ? 'bg-stone-50/60 border-stone-200 opacity-80'
                    : 'bg-white border-stone-200/90 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-forest-50 text-forest-900">
                      <Package className="w-5 h-5 text-forest-800" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-900 font-mono">
                          Suborder #{subOrder.id}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          (Parent Order: #{parentOrderId})
                        </span>
                        {getStatusBadge(subOrder.status)}
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        Received: {parentDate} • Dispatch Method: <strong className="capitalize">{subOrder.fulfilmentType}</strong> • {subOrder.estimatedDelivery}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold text-forest-950 font-mono">
                      ₹{subOrder.subtotal}
                    </div>
                    <div className="text-[11px] text-stone-500 font-semibold text-emerald-700">
                      Store Margin: ₹{Math.round(subOrder.subtotal * 0.12)}
                    </div>
                  </div>
                </div>

                {/* Suborder Items and Propose Substitution Options */}
                <div className="py-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-2">
                      Suborder Items ({subOrder.items.length})
                    </span>
                    <div className="space-y-2">
                      {subOrder.items.map((item: SubOrderItem, idx: number) => (
                        <div
                          key={idx}
                          className="p-2 rounded-xl bg-stone-50/80 border border-stone-200/80 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold text-stone-900">
                              {item.quantity}x {item.productName}
                            </div>
                            <div className="text-[11px] text-stone-500">
                              Pack: {item.packSize} • Unit: ₹{item.unitPrice}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-stone-800">
                              ₹{item.totalPrice}
                            </span>
                            {!isDelivered && !isCancelled && (
                              <button
                                type="button"
                                onClick={() => handleOpenSubstitutionModal(subOrder.id, item)}
                                className="px-2 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-semibold transition-colors"
                              >
                                Propose Sub
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Delivery Details */}
                  <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200/70 space-y-1.5">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                      Customer & Delivery Destination
                    </span>
                    <div className="font-bold text-stone-900">
                      {customerAddress.name}
                      {customerAddress.businessName && (
                        <span className="text-stone-500 font-normal"> ({customerAddress.businessName})</span>
                      )}
                    </div>
                    <div className="text-stone-600 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span>{customerAddress.street}, {customerAddress.area}, {customerAddress.pincode}</span>
                    </div>
                    <div className="text-stone-500 flex items-center gap-1 font-mono pt-0.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{customerAddress.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Pending Substitution Alert */}
                {hasPendingSubstitutions && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      Substitution proposal submitted to customer. Awaiting customer confirmation on revised items.
                    </span>
                  </div>
                )}

                {/* Suborder Rejection note if cancelled */}
                {isCancelled && subOrder.rejectionReason && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                    <strong>Rejection Rationale:</strong> {subOrder.rejectionReason}
                  </div>
                )}

                {/* Status Advancement & Suborder Action Buttons */}
                <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {!isDelivered && !isCancelled && subOrder.status === 'placed' && (
                      <button
                        type="button"
                        onClick={() => handleOpenRejectModal(subOrder.id)}
                        className="px-3 py-1.5 rounded-xl text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject Suborder</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isDelivered && !isCancelled && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => advanceSubOrderStatus(subOrder.id)}
                        icon={<ArrowRight className="w-3.5 h-3.5" />}
                        iconPosition="right"
                      >
                        {getNextActionLabel(subOrder.status)}
                      </Button>
                    )}
                    {isDelivered && (
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Fulfilled and Delivered
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Propose Substitution Modal */}
      <Modal
        isOpen={substitutionModalOpen}
        onClose={() => setSubstitutionModalOpen(false)}
        title="Propose Product Substitution"
        maxWidth="md"
      >
        <form onSubmit={handleSubmitSubstitution} className="space-y-4 text-xs">
          <p className="text-stone-600">
            If an item is out of stock or partially available, propose an alternate brand, variant, or quantity for explicit customer approval.
          </p>

          {selectedItemToSub && (
            <div className="p-3 rounded-xl bg-stone-100 text-stone-700 space-y-1">
              <div><strong>Original Item:</strong> {selectedItemToSub.productName}</div>
              <div><strong>Original Quantity:</strong> {selectedItemToSub.quantity} @ ₹{selectedItemToSub.unitPrice}</div>
            </div>
          )}

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Proposed Substitute Product Name</label>
            <input
              type="text"
              required
              value={substituteName}
              onChange={e => setSubstituteName(e.target.value)}
              placeholder="e.g. Aashirvaad Select 1kg x 5 packs"
              className="w-full px-3 py-2 border border-stone-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Substitute Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={substituteQty}
                onChange={e => setSubstituteQty(Number(e.target.value))}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Substitute Unit Price (₹)</label>
              <input
                type="number"
                min="1"
                required
                value={substitutePrice}
                onChange={e => setSubstitutePrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Reason for Substitution</label>
            <textarea
              rows={2}
              value={substituteReason}
              onChange={e => setSubstituteReason(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setSubstitutionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Submit to Customer for Approval
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reject Suborder Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Suborder"
        maxWidth="sm"
      >
        <form onSubmit={handleSubmitReject} className="space-y-4 text-xs">
          <p className="text-stone-600">
            Please record an explicit rationale for declining this suborder. This will be audited in the order history.
          </p>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Rejection Rationale</label>
            <textarea
              rows={3}
              required
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setRejectModalOpen(false)}>
              Back
            </Button>
            <Button variant="danger" size="sm" type="submit">
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
