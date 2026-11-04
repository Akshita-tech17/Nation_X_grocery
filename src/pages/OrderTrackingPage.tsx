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
        <div className="w-16 h-16 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-heading font-bold text-foreground">No Orders Found</h2>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link to="/" className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Live Order Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground tracking-tight">
            Order Tracking & Delivery Status
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track real-time dispatch, coordinated merchant preparation, and proof of delivery.
          </p>
        </div>

        {/* Quick Order Switcher if multiple exist */}
        {orders.length > 1 && (
          <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-xl border border-border shadow-card text-xs">
            <span className="text-muted-foreground font-medium">Viewing Order:</span>
            <select
              value={selectedOrderId}
              onChange={e => setSelectedOrderId(e.target.value)}
              className="bg-muted border border-border rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-card space-y-3">
          <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
            <span>Material Change / Substitution Proposed by Merchant</span>
          </div>

          <div className="space-y-3">
            {pendingSubstitutions.map(({ subOrderId, proposal, merchantName }) => (
              <div
                key={proposal.id}
                className="p-3.5 rounded-xl bg-card border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-foreground">
                    <strong>{merchantName}</strong> proposes replacing:
                  </div>
                  <div className="text-muted-foreground mt-0.5">
                    Original: <strong className="line-through text-muted-foreground/60">{proposal.originalQuantity}x {proposal.originalProductName} (₹{proposal.originalPrice})</strong>
                    {' ➔ '}
                    Substitute: <strong className="text-primary">{proposal.substituteQuantity}x {proposal.substituteProductName} (₹{proposal.substitutePrice})</strong>
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
          <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-base text-foreground">
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
                <div className="text-xs text-muted-foreground mt-0.5">
                  Placed on {activeOrder.date} • Reference: {activeOrder.paymentReference || 'N/A'} • {activeOrder.paymentMethod}
                </div>
              </div>

              {/* Simulation control for demo/review purposes */}
              {activeOrder.status !== 'delivered' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSimulateNextStep}
                  icon={<RefreshCw className="w-3.5 h-3.5 text-primary" />}
                >
                  Simulate Next Live Step
                </Button>
              )}
            </div>

            {/* Estimated Delivery Callout */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-soft text-primary border border-primary/20 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Promised Delivery Window
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    {activeOrder.estimatedDelivery}
                  </div>
                </div>
              </div>
              <Badge variant="amber" size="md">
                Active Coordinated Dispatch
              </Badge>
            </div>

            {/* Timeline Milestones */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Live Fulfillment Lifecycle
              </h3>

              <div className="space-y-3">
                {STATUS_STAGES.map((stage, idx) => {
                  const isDone = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div
                      key={stage.key}
                      className={`flex items-start gap-3.5 p-3 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-brand-soft/50 border-primary/30 shadow-card'
                          : isDone
                          ? 'bg-card border-border'
                          : 'bg-muted/20 border-border/40 opacity-60'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : isCurrent ? (
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center animate-pulse">
                            <Clock className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-border text-muted-foreground flex items-center justify-center text-xs font-mono">
                            {idx + 1}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs font-bold ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                            {stage.label}
                          </h4>
                          <span className="text-[11px] font-medium text-muted-foreground">
                            {stage.etaNote}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {stage.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Suborders Details (Independent Shopkeeper Execution) */}
          {activeOrder.subOrders && activeOrder.subOrders.length > 0 && (
            <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="font-heading font-bold text-sm text-foreground">
                    Merchant Suborders ({activeOrder.subOrders.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Each merchant independently fulfills, packs, and dispatches their assigned suborder.
                  </p>
                </div>
                <Badge variant="stone" size="sm">Independent Auditability</Badge>
              </div>

              <div className="space-y-4">
                {activeOrder.subOrders.map(subOrder => (
                  <div
                    key={subOrder.id}
                    className="p-4 rounded-xl border border-border bg-muted/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-primary" />
                        <span className="font-bold text-xs text-foreground">{subOrder.merchantName}</span>
                        <span className="text-[11px] font-mono text-muted-foreground">({subOrder.id})</span>
                      </div>
                      <Badge variant="forest" size="sm">{subOrder.status.toUpperCase()}</Badge>
                    </div>

                    <div className="divide-y divide-border text-xs">
                      {subOrder.items.map(item => (
                        <div key={item.offeringId} className="py-2 flex items-center justify-between">
                          <div>
                            <div className="font-medium text-foreground">{item.productName}</div>
                            <div className="text-[11px] text-muted-foreground">{item.packSize} • Qty: {item.quantity}</div>
                          </div>
                          <div className="font-mono font-bold text-foreground">₹{item.totalPrice}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between text-xs pt-2 border-t border-border font-semibold text-foreground">
                      <span>Suborder Subtotal:</span>
                      <span className="font-mono font-bold text-primary">₹{subOrder.subtotal}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary, Invoice, Customer Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Order Bill Summary */}
          <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-4">
            <h3 className="font-heading font-bold text-sm text-foreground border-b border-border pb-3">
              Payment & Commercial Ledger
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Items Original MRP Total</span>
                <span className="font-medium text-foreground">₹{activeOrder.originalAmount}</span>
              </div>

              {activeOrder.savings > 0 && (
                <div className="flex justify-between text-primary font-medium">
                  <span>Store & Wholesale Savings</span>
                  <span>-₹{activeOrder.savings}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Partner Fee</span>
                <span>{activeOrder.deliveryFee === 0 ? <strong className="text-primary">FREE</strong> : `₹${activeOrder.deliveryFee}`}</span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Estimated GST Tax (5%)</span>
                <span>₹{activeOrder.taxAmount}</span>
              </div>

              <div className="flex justify-between text-base font-bold text-foreground pt-3 border-t border-border">
                <span>Final Paid Total</span>
                <span className="text-primary font-mono text-lg">₹{activeOrder.finalPayable}</span>
              </div>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl border border-border text-xs space-y-1">
              <div className="font-semibold text-foreground">Payment Information:</div>
              <div className="text-muted-foreground">Method: <strong className="text-foreground">{activeOrder.paymentMethod}</strong></div>
              <div className="text-muted-foreground">Status: <Badge variant="forest" size="sm">{activeOrder.paymentStatus.toUpperCase()}</Badge></div>
              <div className="text-muted-foreground">Ref: <span className="font-mono">{activeOrder.paymentReference || 'N/A'}</span></div>
            </div>

            <Button
              variant="outline"
              size="md"
              className="w-full text-xs font-semibold"
              icon={<FileText className="w-4 h-4 text-primary" />}
              onClick={() => showToast(`Downloaded GST Tax Invoice for Order #${activeOrder.id}`)}
            >
              Download GST Tax Invoice (PDF)
            </Button>
          </div>

          {/* Delivery Destination Card */}
          <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-3">
            <h3 className="font-heading font-bold text-sm text-foreground border-b border-border pb-3">
              Delivery Address
            </h3>

            <div className="text-xs space-y-1.5 text-muted-foreground">
              <div className="font-bold text-foreground">{activeOrder.deliveryAddress.name}</div>
              <div>{activeOrder.deliveryAddress.street}</div>
              <div>{activeOrder.deliveryAddress.area}, {activeOrder.deliveryAddress.city} - {activeOrder.deliveryAddress.pincode}</div>
              <div className="pt-1 text-foreground font-medium">Phone: {activeOrder.deliveryAddress.phone}</div>
            </div>
          </div>

          {/* Customer Actions */}
          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              icon={<ShoppingBag className="w-4 h-4" />}
              onClick={() => handleReorder(activeOrder)}
            >
              Reorder All Items Again
            </Button>

            <Link to="/browse" className="block text-center">
              <span className="text-xs font-semibold text-primary hover:text-primary/80">
                Continue Browsing Groceries →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
