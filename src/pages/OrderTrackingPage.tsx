import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useMerchant } from '../context/MerchantContext';
import { useCart } from '../context/CartContext';
import { ParentOrder, OrderStatus, SubstitutionProposal } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  CheckCircle2,
  Clock,
  Store,
  FileText,
  RefreshCw,
  ShoppingBag,
  ArrowLeft,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';

const STATUS_STAGES: Array<{
  key: OrderStatus;
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
    key: 'ready_for_pickup',
    label: 'Ready for Pickup',
    description: 'Bags sealed and staged for delivery partner handover',
    etaNote: 'Rider reaching storefront'
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

  const { orders, advanceOrderStatus, customerRespondSubstitution } = useMerchant();
  const { showToast, addToCart } = useCart();

  // Selected order state: defaults to requestedId from query, or the newest active order
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    requestedId || (orders.length > 0 ? orders[0].id : '')
  );

  const activeOrder = orders.find(o => o.id === selectedOrderId) || orders[0];

  const currentStageIndex = activeOrder
    ? STATUS_STAGES.findIndex(s => s.key === activeOrder.status)
    : 0;

  const handleReorder = (order: ParentOrder) => {
    order.items.forEach(item => {
      addToCart(item.product, item.quantity, item.mode);
    });
    showToast(`Added ${order.items.length} items back to your basket!`);
  };

  const handleSimulateNextStep = () => {
    if (!activeOrder) return;
    if (activeOrder.status === 'delivered') {
      showToast('Order is already fully delivered and completed.');
      return;
    }
    advanceOrderStatus(activeOrder.id);
    showToast(`Progressed Order #${activeOrder.id} to next live fulfillment status!`);
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

  // Find any pending substitution proposals across all suborders
  const pendingSubstitutions: Array<{ subOrderId: string; proposal: SubstitutionProposal; merchantName: string }> = [];
  activeOrder.subOrders?.forEach(so => {
    so.substitutionsProposed?.forEach(p => {
      if (p.status === 'pending_customer_approval') {
        pendingSubstitutions.push({ subOrderId: so.id, proposal: p, merchantName: so.merchantName });
      }
    });
  });

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
            Track real-time dispatch, coordinated merchant preparation, and proof of delivery.
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

      {/* Pending Substitution Alert Banner for Customer Approval */}
      {pendingSubstitutions.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-300 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
            <span>Material Change / Substitution Proposed by Merchant</span>
          </div>

          <div className="space-y-3">
            {pendingSubstitutions.map(({ subOrderId, proposal, merchantName }) => (
              <div
                key={proposal.id}
                className="p-3.5 rounded-xl bg-white border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-stone-800">
                    <strong>{merchantName}</strong> proposes replacing:
                  </div>
                  <div className="text-stone-600 mt-0.5">
                    Original: <strong className="line-through text-stone-400">{proposal.originalQuantity}x {proposal.originalProductName} (₹{proposal.originalPrice})</strong>
                    {' ➔ '}
                    Substitute: <strong className="text-forest-900">{proposal.substituteQuantity}x {proposal.substituteProductName} (₹{proposal.substitutePrice})</strong>
                  </div>
                  <div className="text-[11px] text-amber-800 mt-0.5">
                    <strong>Reason:</strong> {proposal.reason}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      customerRespondSubstitution(subOrderId, proposal.id, true);
                      showToast(`Approved substitution for ${proposal.substituteProductName}`);
                    }}
                    icon={<Check className="w-3.5 h-3.5" />}
                  >
                    Approve Change
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      customerRespondSubstitution(subOrderId, proposal.id, false);
                      showToast(`Rejected substitution`);
                    }}
                    icon={<X className="w-3.5 h-3.5" />}
                  >
                    Reject Change
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Left Timeline & Live Dispatch Card, Right Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Progress Timeline & Live Status */}
        <div className="lg:col-span-7 space-y-6">
          {/* Status Highlight Banner */}
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-base text-stone-900">
                    Parent Order #{activeOrder.id}
                  </span>
                  {activeOrder.orderType === 'wholesale' ? (
                    <Badge variant="blue" size="sm">B2B Wholesale Mini-Truck</Badge>
                  ) : activeOrder.orderType === 'mixed' ? (
                    <Badge variant="purple" size="sm">Multi-Shop Combined</Badge>
                  ) : (
                    <Badge variant="forest" size="sm">Retail Express Kirana</Badge>
                  )}
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                  Placed on {activeOrder.date} • Reference: {activeOrder.paymentReference || 'N/A'} • {activeOrder.paymentMethod}
                </div>
              </div>

              {/* Simulation control for demo/review purposes */}
              {activeOrder.status !== 'delivered' && (
                <button
                  onClick={handleSimulateNextStep}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-forest-900 text-xs font-bold transition-colors border border-emerald-200"
                  title="Simulate dispatch steps in real-time"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Simulate Next Stage</span>
                </button>
              )}
            </div>

            {/* Estimated Arrival Badge */}
            <div className="p-4 rounded-2xl bg-forest-900 text-white flex items-center justify-between">
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
                  Delivery Code (OTP)
                </span>
                <span className="font-mono font-extrabold text-base text-white tracking-widest">
                  8492
                </span>
              </div>
            </div>

            {/* Step Timeline */}
            <div className="space-y-6 pt-2">
              <div className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Overall Order Milestone
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

          {/* Suborders Breakdown for Multi-Merchant Fulfillment */}
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Store className="w-4 h-4 text-forest-700" />
              <span>Independent Merchant Suborders ({activeOrder.subOrders?.length || 1})</span>
            </h3>

            <div className="space-y-3">
              {(activeOrder.subOrders || []).map(so => (
                <div key={so.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">{so.merchantName}</span>
                      <span className="font-mono text-[11px] text-stone-500">#{so.id}</span>
                    </div>
                    <Badge variant="forest" size="sm">
                      {so.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="text-xs text-stone-600">
                    {so.items.map(it => `${it.quantity}x ${it.productName}`).join(', ')}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-200/60">
                    <span>Dispatch: <strong className="capitalize">{so.fulfilmentType}</strong></span>
                    <span>Subtotal: <strong className="text-stone-900 font-mono">₹{so.subtotal}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Ordered Items & Bill Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h3 className="font-bold text-stone-900 text-sm">
                Consolidated Items ({activeOrder.items.length})
              </h3>
              <button
                onClick={() => showToast('Demo Invoice PDF generated and sent to email.')}
                className="text-xs font-semibold text-forest-700 hover:text-forest-900 flex items-center gap-1 hover:underline"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>GST Invoice</span>
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
                      {item.merchantName} • {item.product.packSize || item.product.unit}
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
                <span className="font-mono">₹{activeOrder.totalAmount - (activeOrder.deliveryFee || 0)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Doorstep Handling & Delivery</span>
                <span className="text-emerald-700 font-semibold font-mono">
                  {(activeOrder.deliveryFee || 0) === 0 ? 'FREE' : `₹${activeOrder.deliveryFee}`}
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
