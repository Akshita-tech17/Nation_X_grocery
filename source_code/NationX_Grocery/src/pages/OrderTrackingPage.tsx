import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useMerchant } from '../context/MerchantContext';
import { useCart } from '../context/CartContext';
import { Order } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  CheckCircle2,
  Clock,
  Bike,
  Store,
  MapPin,
  Phone,
  FileText,
  ShieldCheck,
  RefreshCw,
  ShoppingBag,
  ArrowLeft
} from 'lucide-react';

const STATUS_STAGES: Array<{
  key: Order['status'];
  label: string;
  description: string;
  etaNote: string;
}> = [
  {
    key: 'placed',
    label: 'Order Placed',
    description: 'Received by NationX platform & routed to local merchant',
    etaNote: 'Awaiting merchant acceptance'
  },
  {
    key: 'confirmed',
    label: 'Store Accepted',
    description: 'Merchant confirmed stock availability and accepted order',
    etaNote: 'Merchant preparing bags'
  },
  {
    key: 'packing',
    label: 'Packing Items',
    description: 'Kirana staff hand-picking and quality checking items',
    etaNote: 'Rider assigned for pickup'
  },
  {
    key: 'out_for_delivery',
    label: 'Out for Delivery',
    description: 'Delivery partner on the way with insulated grocery kit',
    etaNote: 'Reaching in 12–18 mins'
  },
  {
    key: 'delivered',
    label: 'Delivered',
    description: 'Handed over at doorstep with verified one-time passcode',
    etaNote: 'Order fulfilled'
  }
];

export const OrderTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const requestedId = searchParams.get('id');

  const { orders } = useMerchant();
  const { showToast, addToCart } = useCart();

  // Selected order state: defaults to requestedId from query, or the newest active order
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    requestedId || (orders.length > 0 ? orders[0].id : '')
  );

  const activeOrder = orders.find(o => o.id === selectedOrderId) || orders[0];

  const currentStageIndex = activeOrder
    ? STATUS_STAGES.findIndex(s => s.key === activeOrder.status)
    : 0;

  const handleReorder = (order: Order) => {
    order.items.forEach(item => {
      addToCart(item.product, item.quantity, item.mode);
    });
    showToast(`Added ${order.items.length} items back to your basket!`);
  };

  if (!activeOrder) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">No Orders Found</h2>
        <p className="text-xs text-stone-600 max-w-sm mx-auto">
          You have not placed any orders yet. Browse our verified grocery selection or wholesale catalog to place your first order.
        </p>
        <Link to="/browse">
          <Button variant="primary" size="md">Browse Groceries</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-600 mb-1">
            <Link to="/" className="hover:text-stone-900 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <span>/</span>
            <span className="text-stone-900 font-semibold">Live Order Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900 tracking-tight">
            Order Tracking & Delivery Status
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Track real-time dispatch, kirana packing verification, and delivery transit.
          </p>
        </div>

        {/* Quick Order Switcher if multiple exist */}
        {orders.length > 1 && (
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-stone-200 shadow-sm text-xs">
            <span className="text-stone-500 font-medium">Viewing Order:</span>
            <select
              value={selectedOrderId}
              onChange={e => setSelectedOrderId(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
            >
              {orders.map(o => (
                <option key={o.id} value={o.id}>
                  #{o.id} • {o.orderType === 'wholesale' ? 'B2B Wholesale' : 'Retail'} (₹{o.totalAmount})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Grid: Left Timeline & Live Dispatch Card, Right Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Progress Timeline & Live Status */}
        <div className="lg:col-span-7 space-y-6">
          {/* Status Highlight Banner */}
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-base text-stone-900">
                    Order #{activeOrder.id}
                  </span>
                  {activeOrder.orderType === 'wholesale' ? (
                    <Badge variant="blue" size="sm">B2B Wholesale Mini-Truck</Badge>
                  ) : (
                    <Badge variant="forest" size="sm">Retail Express Kirana</Badge>
                  )}
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                  Placed on {activeOrder.date} • Paid via {activeOrder.paymentMethod}
                </div>
              </div>


            </div>

            {/* Estimated Arrival Badge */}
            <div className="p-4 rounded-xl bg-forest-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-600/30 text-emerald-300">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-emerald-200 font-medium">Estimated Handover</div>
                  <div className="text-base sm:text-lg font-bold">
                    {activeOrder.status === 'delivered'
                      ? 'Package Delivered Successfully'
                      : activeOrder.estimatedDelivery}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-mono text-emerald-200 uppercase tracking-wider block">
                  Delivery Code
                </span>
                <span className="font-mono font-extrabold text-base text-white tracking-widest">
                  8492
                </span>
              </div>
            </div>

            {/* Step Timeline */}
            <div className="space-y-6 pt-2">
              <div className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Fulfillment Milestones
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-stone-200">
                {STATUS_STAGES.map((stage, idx) => {
                  const isCompleted = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div key={stage.key} className="relative flex items-start gap-4">
                      {/* Step Indicator Dot */}
                      <div
                        className={`absolute -left-6 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-forest-900 text-white ring-4 ring-emerald-50'
                            : 'bg-stone-100 text-stone-400 border border-stone-300'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs sm:text-sm font-bold ${
                              isCurrent
                                ? 'text-forest-900 font-extrabold'
                                : isCompleted
                                ? 'text-stone-900'
                                : 'text-stone-400'
                            }`}
                          >
                            {stage.label}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full animate-pulse">
                              In Progress
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                          {stage.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Local Partner Details Card */}
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Store className="w-4 h-4 text-forest-700" />
              <span>Assigned Merchant & Dispatch Agent</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Kirana Merchant */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">Fulfilling Kirana</span>
                  <Badge variant="forest" size="sm">Verified</Badge>
                </div>
                <div className="font-bold text-stone-900 text-sm">
                  {activeOrder.storeName}
                </div>
                <div className="text-stone-600 flex items-start gap-1.5 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                  <span>Doorstep dispatch from local hub, 500m radius</span>
                </div>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-stone-500 text-[11px]">Helpline:</span>
                  <a
                    href="tel:+919845012345"
                    className="font-semibold text-forest-800 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" /> +91 98450 12345
                  </a>
                </div>
              </div>

              {/* Delivery Rider */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">Rider / Partner</span>
                  <span className="text-[11px] font-bold text-emerald-800">4.9 ★ (840 trips)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-forest-100 text-forest-900 font-bold flex items-center justify-center shrink-0">
                    <Bike className="w-5 h-5 text-forest-700" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-900">Ramesh K.</div>
                    <div className="text-[11px] text-stone-500">Electric Two-Wheeler • KA-03-EK-9102</div>
                  </div>
                </div>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-stone-500 text-[11px]">Safety:</span>
                  <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Temperature Screened
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ordered Items & Bill Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h3 className="font-bold text-stone-900 text-sm">
                Items in This Order ({activeOrder.items.length})
              </h3>
              <button
                onClick={() => showToast('Demo Invoice PDF generated and sent to email.')}
                className="text-xs font-semibold text-forest-700 hover:text-forest-900 flex items-center gap-1 hover:underline"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Invoice</span>
              </button>
            </div>

            {/* Items list */}
            <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto pr-1">
              {activeOrder.items.map((item, i) => (
                <div key={i} className="py-3 flex items-center gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded-xl border border-stone-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-stone-900 truncate">
                      {item.product.name}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {item.product.brand} • {item.product.packSize || item.product.unit}
                    </div>
                    <div className="text-[11px] text-stone-600 mt-0.5">
                      Qty: <strong className="text-stone-900">{item.quantity}</strong> × ₹{item.unitPrice}
                    </div>
                  </div>
                  <div className="text-right text-xs font-bold text-stone-900 font-mono">
                    ₹{item.totalPrice}
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className="border-t border-stone-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal</span>
                <span className="font-mono">₹{activeOrder.totalAmount - (activeOrder.totalAmount >= 499 ? 0 : 39)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Doorstep Handling & Delivery</span>
                <span className="text-emerald-700 font-semibold font-mono">
                  {activeOrder.totalAmount >= 499 ? 'FREE' : '₹39'}
                </span>
              </div>
              {activeOrder.savings > 0 && (
                <div className="flex justify-between text-emerald-800 font-medium">
                  <span>Total Discount & Savings</span>
                  <span className="font-mono">-₹{activeOrder.savings}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-stone-200 font-bold text-stone-900 text-sm">
                <span>Final Paid Amount</span>
                <span className="font-mono text-base text-forest-950">₹{activeOrder.totalAmount}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border-t border-stone-100 pt-4 text-xs space-y-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Delivery Destination
              </span>
              <div className="font-bold text-stone-900">{activeOrder.deliveryAddress.name}</div>
              <div className="text-stone-600 leading-relaxed">
                {activeOrder.deliveryAddress.street}, {activeOrder.deliveryAddress.area}, {activeOrder.deliveryAddress.city} - {activeOrder.deliveryAddress.pincode}
              </div>
              <div className="text-stone-500 pt-0.5">Phone: {activeOrder.deliveryAddress.phone}</div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => handleReorder(activeOrder)}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Reorder These Items
              </Button>
              <Link to="/browse" className="w-full">
                <Button variant="ghost" size="md" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
