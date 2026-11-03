import React from 'react';
import { useMerchant } from '../../context/MerchantContext';
import { Order } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Package, Phone, MapPin, ArrowRight } from 'lucide-react';

export const OrderPipeline: React.FC = () => {
  const { orders, advanceOrderStatus } = useMerchant();

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'placed':
        return <Badge variant="blue">New Order Placed</Badge>;
      case 'confirmed':
        return <Badge variant="purple">Confirmed</Badge>;
      case 'packing':
        return <Badge variant="saffron">Packing at Kirana</Badge>;
      case 'out_for_delivery':
        return <Badge variant="blue">Out for Delivery</Badge>;
      case 'delivered':
        return <Badge variant="forest">Delivered & Closed</Badge>;
    }
  };

  const getNextActionLabel = (status: Order['status']) => {
    switch (status) {
      case 'placed':
        return 'Accept & Confirm Order';
      case 'confirmed':
        return 'Start Packing Items';
      case 'packing':
        return 'Handover to Delivery Agent';
      case 'out_for_delivery':
        return 'Mark Successfully Delivered';
      case 'delivered':
        return 'Order Completed';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-warm-900 text-base">Live Orders Fulfillment Pipeline</h3>
          <p className="text-xs text-warm-500">
            Real-time incoming retail and B2B wholesale orders for your store
          </p>
        </div>
        <span className="text-xs font-semibold text-warm-600 bg-warm-100 px-3 py-1 rounded-full">
          {orders.length} Total Orders
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {orders.map(order => {
          const isDelivered = order.status === 'delivered';
          return (
            <div
              key={order.id}
              className={`p-4 rounded-2xl border transition-all ${
                isDelivered
                  ? 'bg-warm-50/60 border-warm-200 opacity-80'
                  : 'bg-white border-warm-200/90 shadow-soft hover:shadow-soft-md'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-warm-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-forest-50 text-forest-900">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-warm-900 font-mono">
                        {order.id}
                      </span>
                      {order.orderType === 'wholesale' ? (
                        <Badge variant="blue" size="sm">B2B Wholesale</Badge>
                      ) : (
                        <Badge variant="forest" size="sm">Retail Express</Badge>
                      )}
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-xs text-warm-400 mt-0.5">
                      Placed on: {order.date} • {order.estimatedDelivery}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold text-forest-950 font-mono">
                    ₹{order.totalAmount}
                  </div>
                  <div className="text-[11px] text-warm-500">{order.paymentMethod}</div>
                </div>
              </div>

              {/* Order Items Summary */}
              <div className="py-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <h5 className="font-semibold text-warm-700 mb-1.5 uppercase text-[10px] tracking-wider">
                    Basket Items ({order.items.length})
                  </h5>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1 border-b border-warm-50 last:border-none"
                      >
                        <span className="text-warm-800 font-medium">
                          {item.quantity}x {item.product.name} ({item.product.unit})
                        </span>
                        <span className="font-mono text-warm-600">₹{item.totalPrice}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Customer Details */}
                <div className="bg-warm-50/70 p-3 rounded-xl border border-warm-200/70 space-y-1 text-warm-700">
                  <div className="font-bold text-warm-900 flex items-center justify-between">
                    <span>{order.deliveryAddress.name}</span>
                    <span className="text-[11px] text-warm-500 font-mono flex items-center gap-1">
                      <Phone className="w-3 h-3 text-warm-400" />
                      {order.deliveryAddress.phone}
                    </span>
                  </div>
                  <div className="text-xs text-warm-600 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-forest-600 shrink-0 mt-0.5" />
                    <span>
                      {order.deliveryAddress.street}, {order.deliveryAddress.area}, {order.deliveryAddress.pincode}
                    </span>
                  </div>
                  {order.deliveryAddress.gstNumber && (
                    <div className="text-[11px] text-indigo-900 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mt-1 inline-block">
                      GSTIN: {order.deliveryAddress.gstNumber}
                    </div>
                  )}
                </div>
              </div>

              {/* Pipeline Advance Action */}
              {!isDelivered && (
                <div className="pt-3 border-t border-warm-100 flex items-center justify-end">
                  <Button
                    size="sm"
                    variant={order.status === 'packing' ? 'amber' : 'primary'}
                    onClick={() => advanceOrderStatus(order.id)}
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    {getNextActionLabel(order.status)}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
