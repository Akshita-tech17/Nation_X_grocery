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
        return <Badge variant="forest">Store Accepted</Badge>;
      case 'packing':
        return <Badge variant="amber">Packing Items</Badge>;
      case 'ready_for_pickup':
        return <Badge variant="forest">Ready for Pickup</Badge>;
      case 'out_for_delivery':
        return <Badge variant="blue">Out for Delivery</Badge>;
      case 'delivered':
        return <Badge variant="forest">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="red">Declined / Cancelled</Badge>;
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
        return 'Handover to Delivery Partner';
      case 'out_for_delivery':
        return 'Confirm Delivery (Proof of Delivery)';
      default:
        return null;
    }
  };

  const handleOpenSubstitutionModal = (subOrderId: string, item: SubOrderItem) => {
    setActiveSubOrderId(subOrderId);
    setSelectedItemToSub(item);
    setSubstituteName(item.productName + ' (Alternate Brand)');
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
      <div className="bg-card rounded-2xl border border-border p-5 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-bold text-foreground text-base">
              {currentStore.name} — Orders Pipeline
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
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
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-primary text-primary-foreground font-semibold shadow-card'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filterStatus === tab.id ? 'bg-primary-foreground text-primary font-bold' : 'bg-muted text-muted-foreground'
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
          <div className="bg-card rounded-2xl border border-border p-8 text-center text-xs text-muted-foreground shadow-card">
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
                className={`p-5 rounded-2xl border transition-all ${
                  isDelivered || isCancelled
                    ? 'bg-muted/30 border-border opacity-80'
                    : 'bg-card border-border shadow-card hover:border-primary/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-soft text-primary border border-primary/20 flex items-center justify-center font-bold">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground font-mono">
                          Suborder #{subOrder.id}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          (Parent Order: #{parentOrderId})
                        </span>
                        {getStatusBadge(subOrder.status)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Received: {parentDate} • Dispatch Method: <strong className="capitalize text-foreground">{subOrder.fulfilmentType}</strong> • {subOrder.estimatedDelivery}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold text-foreground font-mono">
                      ₹{subOrder.subtotal}
                    </div>
                    <div className="text-[11px] font-semibold text-primary">
                      Store Margin: ₹{Math.round(subOrder.subtotal * 0.12)}
                    </div>
                  </div>
                </div>

                {/* Suborder Items and Propose Substitution Options */}
                <div className="py-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                      Suborder Items ({subOrder.items.length})
                    </span>
                    <div className="space-y-2">
                      {subOrder.items.map((item: SubOrderItem, idx: number) => (
                        <div
                          key={idx}
                          className="p-2 rounded-xl bg-muted/40 border border-border flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold text-foreground">
                              {item.quantity}x {item.productName}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              Pack: {item.packSize} • Unit: ₹{item.unitPrice}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-foreground">
                              ₹{item.totalPrice}
                            </span>
                            {!isDelivered && !isCancelled && (
                              <button
                                type="button"
                                onClick={() => handleOpenSubstitutionModal(subOrder.id, item)}
                                className="px-2 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-500/20 text-[10px] font-semibold transition-colors cursor-pointer"
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
                  <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-1.5">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Customer & Delivery Destination
                    </span>
                    <div className="font-bold text-foreground">
                      {customerAddress.name}
                      {customerAddress.businessName && (
                        <span className="text-muted-foreground font-normal"> ({customerAddress.businessName})</span>
                      )}
                    </div>
                    <div className="text-muted-foreground flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{customerAddress.street}, {customerAddress.area}, {customerAddress.pincode}</span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{customerAddress.phone}</span>
                    </div>

                    {/* Pending Substitution Alert Callout */}
                    {hasPendingSubstitutions && (
                      <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>Awaiting customer approval for proposed product substitution.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Suborder Actions Toolbar */}
                <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-muted-foreground">
                    Current Fulfillment Status: <strong className="text-foreground uppercase">{subOrder.status.replace('_', ' ')}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isDelivered && !isCancelled && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenRejectModal(subOrder.id)}
                        className="text-xs text-destructive border-border hover:bg-destructive/10"
                        icon={<XCircle className="w-3.5 h-3.5" />}
                      >
                        Decline Suborder
                      </Button>
                    )}

                    {getNextActionLabel(subOrder.status) && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => advanceSubOrderStatus(subOrder.id)}
                        icon={<ArrowRight className="w-3.5 h-3.5" />}
                        iconPosition="right"
                      >
                        {getNextActionLabel(subOrder.status)}
                      </Button>
                    )}

                    {isDelivered && (
                      <span className="text-xs font-semibold text-primary flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Fulfilled Successfully
                      </span>
                    )}

                    {isCancelled && (
                      <span className="text-xs font-semibold text-destructive flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Declined: {subOrder.rejectionReason || 'Declined by merchant'}
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
          <p className="text-muted-foreground">
            If an item is out of stock or partially available, propose an alternate brand, variant, or quantity for explicit customer approval.
          </p>

          {selectedItemToSub && (
            <div className="p-3 rounded-xl bg-muted/40 border border-border text-foreground space-y-1">
              <div><strong>Original Item:</strong> {selectedItemToSub.productName}</div>
              <div><strong>Original Quantity:</strong> {selectedItemToSub.quantity} @ ₹{selectedItemToSub.unitPrice}</div>
            </div>
          )}

          <div>
            <label className="font-semibold text-foreground block mb-1">Proposed Substitute Product Name</label>
            <input
              type="text"
              required
              value={substituteName}
              onChange={e => setSubstituteName(e.target.value)}
              placeholder="e.g. Aashirvaad Select 1kg x 5 packs"
              className="w-full px-3 py-2 border border-border bg-card rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-foreground block mb-1">Substitute Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={substituteQty}
                onChange={e => setSubstituteQty(Number(e.target.value))}
                className="w-full px-3 py-2 border border-border bg-card rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="font-semibold text-foreground block mb-1">Substitute Unit Price (₹)</label>
              <input
                type="number"
                min="1"
                required
                value={substitutePrice}
                onChange={e => setSubstitutePrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-border bg-card rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">Reason for Substitution</label>
            <textarea
              rows={2}
              value={substituteReason}
              onChange={e => setSubstituteReason(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-card rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
          <p className="text-muted-foreground">
            Please record an explicit rationale for declining this suborder. This will be audited in the order history.
          </p>

          <div>
            <label className="font-semibold text-foreground block mb-1">Rejection Rationale</label>
            <textarea
              rows={3}
              required
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-card rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="e.g. Insufficient inventory and distributor delivery delayed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setRejectModalOpen(false)}>
              Cancel
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
