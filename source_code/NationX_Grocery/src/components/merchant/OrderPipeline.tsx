import React, { useState } from 'react';
import { useMerchant } from '../../context/MerchantContext';
import { Order } from '../../types';
import { Package, Clock, MapPin, CheckCircle2, Phone, XCircle, Truck } from 'lucide-react';
import { Button } from '../common/Button';

export const OrderPipeline: React.FC = () => {
  const { orders, acceptSubOrder, rejectSubOrder, markReadyForPickup, handOffToDelivery } = useMerchant();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [rejectModalOrder, setRejectModalOrder] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Damaged inventory or unconfirmed stock');

  const filteredOrders = orders.filter(o => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return o.status === 'placed';
    if (filterStatus === 'packing') return o.status === 'confirmed' || o.status === 'packing';
    if (filterStatus === 'dispatch') return o.status === 'out_for_delivery';
    if (filterStatus === 'delivered') return o.status === 'delivered';
    return true;
  });

  const getStatusBadge = (status: Order['status'], paymentStatus: Order['paymentStatus']) => {
    if (paymentStatus === 'refunded') {
      return (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
          Suborder Rejected (Refunded)
        </span>
      );
    }

    switch (status) {
      case 'placed':
        return (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Incoming Review (Spec §5.6)
          </span>
        );
      case 'confirmed':
      case 'packing':
        return (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
            <Package className="w-3 h-3" /> Accepted • Staging / Packing
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
            <Truck className="w-3 h-3" /> Ready for Pickup / Shared Delivery
          </span>
        );
      case 'delivered':
        return (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Completed & Reconciled
          </span>
        );
      default:
        return null;
    }
  };

  const handleConfirmReject = () => {
    if (rejectModalOrder) {
      rejectSubOrder(rejectModalOrder, rejectReason);
      setRejectModalOrder(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
        <div>
          <h3 className="text-base font-bold text-stone-900">Authoritative Suborder Pipeline</h3>
          <p className="text-xs text-stone-500">
            Accept, reject, stage and hand off incoming merchant suborders to Shared Delivery fleet (Spec §5.6, §8)
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Suborders', count: orders.length },
            { id: 'pending', label: 'Incoming', count: orders.filter(o => o.status === 'placed').length },
            { id: 'packing', label: 'Packing', count: orders.filter(o => o.status === 'confirmed' || o.status === 'packing').length },
            { id: 'dispatch', label: 'On Route', count: orders.filter(o => o.status === 'out_for_delivery').length },
            { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                filterStatus === tab.id
                  ? 'bg-forest-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  filterStatus === tab.id ? 'bg-forest-800 text-emerald-200' : 'bg-stone-200 text-stone-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200/80 p-6 space-y-2">
            <Package className="w-8 h-8 text-stone-400 mx-auto" />
            <div className="text-sm font-semibold text-stone-700">No suborders in this status queue</div>
            <p className="text-xs text-stone-500">Incoming online orders from local shoppers will appear here in real-time.</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const isDelivered = order.status === 'delivered';
            const isIncoming = order.status === 'placed' && order.paymentStatus !== 'refunded';
            const isPacking = order.status === 'confirmed' || order.status === 'packing';
            const isReadyForDelivery = order.status === 'out_for_delivery';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-200/80 p-4 space-y-3 shadow-sm hover:border-forest-600/40 transition-colors"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-stone-900">#{order.id}</span>
                    <span className="text-xs text-stone-500">• {order.date}</span>
                    <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                      {order.orderType === 'wholesale' ? 'Commercial B2B' : 'Everyday Retail'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status, order.paymentStatus)}
                  </div>
                </div>

                {/* Items and Customer Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Left: Item List */}
                  <div className="space-y-1.5 bg-stone-50/60 p-3 rounded-xl border border-stone-100">
                    <div className="font-semibold text-stone-700 pb-1 border-b border-stone-200/60 flex justify-between">
                      <span>Ordered Commodities ({order.items.length})</span>
                      <span className="font-mono text-stone-900 font-bold">₹{order.totalAmount}</span>
                    </div>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-stone-600">
                        <span className="truncate max-w-[200px]">
                          {item.quantity} × {item.product.name} ({item.product.packSize || item.product.unit})
                        </span>
                        <span className="font-mono font-medium text-stone-800">
                          ₹{item.totalPrice}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Right: Delivery & Destination */}
                  <div className="space-y-1.5 bg-stone-50/60 p-3 rounded-xl border border-stone-100">
                    <div className="font-semibold text-stone-700 pb-1 border-b border-stone-200/60">
                      Destination & Recipient
                    </div>
                    <div className="font-bold text-stone-900">
                      {order.deliveryAddress.name}
                    </div>
                    <div className="text-stone-600 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span>{order.deliveryAddress.street}, {order.deliveryAddress.area}, {order.deliveryAddress.pincode}</span>
                    </div>
                    <div className="text-stone-500 flex items-center gap-1 font-mono pt-0.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{order.deliveryAddress.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Authoritative Merchant Actions (Spec §5.6) */}
                <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-[11px] text-stone-500">
                    Payment Status: <strong className="text-emerald-700 uppercase font-semibold">{order.paymentStatus}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Incoming Order: Accept or Reject */}
                    {isIncoming && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setRejectModalOrder(order.id)}
                          icon={<XCircle className="w-3.5 h-3.5 text-rose-600" />}
                        >
                          <span className="text-rose-600">Reject Suborder</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => acceptSubOrder(order.id)}
                          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          Accept Suborder
                        </Button>
                      </>
                    )}

                    {/* Packing Order: Stage / Mark Ready */}
                    {isPacking && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => markReadyForPickup(order.id)}
                        icon={<Package className="w-3.5 h-3.5" />}
                      >
                        Mark Ready for Pickup
                      </Button>
                    )}

                    {/* Ready for Pickup: Hand to Shared Delivery */}
                    {isReadyForDelivery && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handOffToDelivery(order.id)}
                        icon={<Truck className="w-3.5 h-3.5" />}
                      >
                        Hand to Shared Delivery
                      </Button>
                    )}

                    {isDelivered && (
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Fulfilled and Reconciled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Suborder Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <h4 className="text-base font-bold text-stone-900">Reject Suborder #{rejectModalOrder}</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Rejecting this suborder will immediately notify the customer and trigger an automated refund via the payment engine (Spec §5.6).
            </p>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Rejection Reason</label>
              <select
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
              >
                <option value="Damaged inventory or unconfirmed lot">Damaged inventory or unconfirmed lot</option>
                <option value="Item currently out of stock at store">Item currently out of stock at store</option>
                <option value="Store operating outside delivery window">Store operating outside delivery window</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="ghost" onClick={() => setRejectModalOrder(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="danger" onClick={handleConfirmReject}>
                Confirm Rejection & Refund
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
