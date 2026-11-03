import React, { useState } from 'react';
import { useMerchant } from '../../context/MerchantContext';
import { Order } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Package, Phone, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';

export const OrderPipeline: React.FC = () => {
  const { orders, advanceOrderStatus } = useMerchant();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredOrders = orders.filter(o => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return o.status === 'placed' || o.status === 'confirmed';
    if (filterStatus === 'packing') return o.status === 'packing';
    if (filterStatus === 'dispatch') return o.status === 'out_for_delivery';
    if (filterStatus === 'delivered') return o.status === 'delivered';
    return true;
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'placed':
        return <Badge variant="blue">New Order Placed</Badge>;
      case 'confirmed':
        return <Badge variant="purple">Store Confirmed</Badge>;
      case 'packing':
        return <Badge variant="amber">Packing Items</Badge>;
      case 'out_for_delivery':
        return <Badge variant="blue">Out for Delivery</Badge>;
      case 'delivered':
        return <Badge variant="forest">Delivered & Fulfilled</Badge>;
    }
  };

  const getNextActionLabel = (status: Order['status']) => {
    switch (status) {
      case 'placed':
        return 'Accept & Confirm Order';
      case 'confirmed':
        return 'Start Packing Items';
      case 'packing':
        return 'Handover to Rider';
      case 'out_for_delivery':
        return 'Mark Successfully Delivered';
      case 'delivered':
        return 'Order Completed';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter Tabs */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-stone-900 text-base">Live Orders Fulfillment Pipeline</h3>
          <p className="text-xs text-stone-500">
            Real-time incoming retail and B2B wholesale orders for your store
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'All Orders', count: orders.length },
            { id: 'pending', label: 'Incoming', count: orders.filter(o => o.status === 'placed' || o.status === 'confirmed').length },
            { id: 'packing', label: 'Packing', count: orders.filter(o => o.status === 'packing').length },
            { id: 'dispatch', label: 'On Route', count: orders.filter(o => o.status === 'out_for_delivery').length },
            { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length }
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
      <div className="grid grid-cols-1 gap-3.5">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-xs text-stone-500">
            No orders match the selected filter.
          </div>
        ) : (
          filteredOrders.map(order => {
            const isDelivered = order.status === 'delivered';
            return (
              <div
                key={order.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isDelivered
                    ? 'bg-stone-50/60 border-stone-200 opacity-80'
                    : 'bg-white border-stone-200/90 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-forest-50 text-forest-900">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-900 font-mono">
                          {order.id}
                        </span>
                        {order.orderType === 'wholesale' ? (
                          <Badge variant="blue" size="sm">B2B Wholesale</Badge>
                        ) : (
                          <Badge variant="forest" size="sm">Retail Express</Badge>
                        )}
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        Placed on: {order.date} • {order.estimatedDelivery}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold text-forest-950 font-mono">
                      ₹{order.totalAmount}
                    </div>
                    <div className="text-[11px] text-stone-500">{order.paymentMethod}</div>
                  </div>
                </div>

                {/* Order Items Summary */}
                <div className="py-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                      Items Ordered ({order.items.length})
                    </span>
                    <div className="space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1 border-b border-stone-50">
                          <span className="text-stone-800 font-medium truncate max-w-[260px]">
                            {item.quantity}x {item.product.name}
                          </span>
                          <span className="font-mono text-stone-600 font-semibold">
                            ₹{item.totalPrice}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Delivery Details */}
                  <div className="bg-stone-50/80 p-3 rounded-xl border border-stone-200/70 space-y-1">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                      Customer & Delivery Destination
                    </span>
                    <div className="font-bold text-stone-900">
                      {order.deliveryAddress.name}
                      {order.deliveryAddress.businessName && (
                        <span className="text-stone-500 font-normal"> ({order.deliveryAddress.businessName})</span>
                      )}
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

                {/* Status Advancement Action */}
                <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-[11px] text-stone-500">
                    Payment Status: <strong className="text-emerald-700 uppercase font-semibold">{order.paymentStatus}</strong>
                  </div>

                  {!isDelivered && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => advanceOrderStatus(order.id)}
                      icon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      {getNextActionLabel(order.status)}
                    </Button>
                  )}
                  {isDelivered && (
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Fulfilled and Delivered
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
