import React, { useState } from 'react';
import { useMerchant } from '../context/MerchantContext';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';
import { MetricsBar } from '../components/merchant/MetricsBar';
import { ProductManagementTable } from '../components/merchant/ProductManagementTable';
import { InventoryTable } from '../components/merchant/InventoryTable';
import { OrderPipeline } from '../components/merchant/OrderPipeline';
import { BulkBuyQuotationsTable } from '../components/merchant/BulkBuyQuotationsTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  FileText,
  PlusCircle
} from 'lucide-react';

export const MerchantDashboardPage: React.FC = () => {
  const { merchants, activeMerchantId, setActiveMerchantId, addNewOrder, orders, quotations } = useMerchant();
  const { showToast } = useCart();

  // 5 Merchant Screens Tab Navigation
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'inventory' | 'orders' | 'quotations'
  >('dashboard');

  const currentStore = merchants.find(m => m.id === activeMerchantId) || merchants[0];

  const handleSimulateIncomingOrder = () => {
    const id = `NX-LIVE-${Math.floor(1000 + Math.random() * 9000)}`;
    const subOrderId = `NX-SO-${id.replace('NX-LIVE-', '')}-1`;
    const itemProduct = PRODUCTS[0];

    const subOrder = {
      id: subOrderId,
      parentOrderId: id,
      merchantId: currentStore.id,
      merchantName: currentStore.name,
      items: [
        {
          offeringId: itemProduct.offeringId || 'off-sharma-atta',
          masterProductId: itemProduct.id,
          productName: itemProduct.name,
          packSize: itemProduct.packSize,
          quantity: 2,
          unitPrice: 345,
          mrp: 385,
          totalPrice: 690,
          mode: 'retail' as const,
          image: itemProduct.image,
          isAvailable: true,
          substitutionStatus: 'original' as const
        }
      ],
      subtotal: 690,
      originalSubtotal: 770,
      savings: 80,
      deliveryFee: 0,
      status: 'placed' as const,
      fulfilmentType: 'express' as const,
      estimatedDelivery: 'In 20 mins',
      timeline: [
        {
          timestamp: 'Just now',
          status: 'placed' as const,
          actor: 'Customer Simulated Order',
          note: `Incoming retail express order for 2x ${itemProduct.name}`
        }
      ]
    };

    addNewOrder({
      id,
      date: 'Just Now',
      createdAt: new Date().toISOString(),
      items: [
        {
          offeringId: itemProduct.offeringId || 'off-sharma-atta',
          masterProductId: itemProduct.id,
          product: itemProduct,
          merchantId: currentStore.id,
          merchantName: currentStore.name,
          quantity: 2,
          mode: 'retail',
          unitPrice: 345,
          mrp: 385,
          totalPrice: 690,
          availabilityStatus: 'available',
          stockUpdatedAt: new Date().toISOString()
        }
      ],
      totalAmount: 690,
      originalAmount: 770,
      savings: 80,
      deliveryFee: 0,
      taxAmount: 35,
      finalPayable: 690,
      orderType: 'retail',
      status: 'placed',
      storeId: currentStore.id,
      storeName: currentStore.name,
      deliveryAddress: {
        name: 'Siddharth Rao',
        phone: '+91 99450 77312',
        street: 'Flat 102, Shanti Nivas, 5th Cross',
        area: currentStore.area,
        city: currentStore.city,
        pincode: currentStore.pincode,
        addressType: 'home'
      },
      paymentMethod: 'UPI (PhonePe)',
      paymentStatus: 'authorized',
      paymentReference: `PAY-NX-${Math.floor(100000 + Math.random() * 900000)}`,
      estimatedDelivery: 'In 20 mins',
      subOrders: [subOrder]
    });

    showToast(`Ding! New incoming suborder #${subOrderId} received for ${currentStore.name}!`);
  };

  const pendingOrdersCount = orders.filter(o => o.status !== 'delivered').length;
  const pendingQuotationsCount = quotations.filter(q => q.status === 'under_review' || q.status === 'submitted').length;

  return (
    <div className="space-y-8 pb-16">
      {/* Merchant Header Bar */}
      <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentStore.image}
            alt={currentStore.name}
            className="w-16 h-16 rounded-xl object-cover border border-border shadow-card shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-lg sm:text-xl text-foreground">
                {currentStore.name}
              </span>
              <Badge variant="forest" size="sm">Verified Kirana Merchant</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Owner: <strong className="text-foreground">{currentStore.ownerName}</strong> • {currentStore.address}
            </p>
          </div>
        </div>

        {/* Store Switcher & Simulated Order Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium">Switch Store:</span>
            <select
              value={activeMerchantId}
              onChange={e => setActiveMerchantId(e.target.value)}
              className="bg-muted border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {merchants.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.area})
                </option>
              ))}
            </select>
          </div>

          <Button
            size="sm"
            variant="amber"
            onClick={handleSimulateIncomingOrder}
            icon={<PlusCircle className="w-4 h-4" />}
          >
            Simulate Incoming Order
          </Button>
        </div>
      </div>

      {/* 5 Main Merchant Screens Tab Bar */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto no-scrollbar">
        {/* Screen 1: Dashboard Overview */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-primary text-primary-foreground shadow-card'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>1. Merchant Dashboard</span>
        </button>

        {/* Screen 2: Product Management */}
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'bg-primary text-primary-foreground shadow-card'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>2. Product Management</span>
        </button>

        {/* Screen 3: Inventory & Pricing */}
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-primary text-primary-foreground shadow-card'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3. Inventory & Pricing</span>
        </button>

        {/* Screen 4: Order Management */}
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-primary text-primary-foreground shadow-card'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>4. Order Management</span>
          {pendingOrdersCount > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'orders' ? 'bg-primary-foreground text-primary' : 'bg-brand-soft text-primary'
            }`}>
              {pendingOrdersCount}
            </span>
          )}
        </button>

        {/* Screen 5: BulkBuy Quotations */}
        <button
          onClick={() => setActiveTab('quotations')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'quotations'
              ? 'bg-primary text-primary-foreground shadow-card'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>5. BulkBuy Quotations</span>
          {pendingQuotationsCount > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'quotations' ? 'bg-marigold text-marigold-foreground' : 'bg-amber-500/10 text-amber-900'
            }`}>
              {pendingQuotationsCount}
            </span>
          )}
        </button>
      </div>

      {/* Screen 1: Merchant Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <MetricsBar />

          {/* Quick Action Matrix & Store Operations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Store Status Card */}
            <div className="bg-card rounded-2xl border border-border p-5 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live Operating Status</span>
                <span className="text-xs font-semibold text-primary bg-brand-soft px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border border-primary/20">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  Store Open & Accepting
                </span>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Delivery Coverage:</span>
                  <strong className="text-foreground">{currentStore.distance} radius ({currentStore.deliveryTime})</strong>
                </div>
                <div className="flex justify-between">
                  <span>Avg Order Packing Time:</span>
                  <strong className="text-foreground">8.4 minutes</strong>
                </div>
                <div className="flex justify-between">
                  <span>Store Contact:</span>
                  <strong className="text-foreground font-mono">{currentStore.phone}</strong>
                </div>
              </div>
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Fast Kirana Dispatch:</span>
                <Badge variant="forest" size="sm">Active</Badge>
              </div>
            </div>

            {/* Quick Short-cut to Fulfillment */}
            <div className="bg-card rounded-2xl border border-border p-5 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Orders Queue</span>
                <span className="font-mono font-bold text-sm text-primary">{pendingOrdersCount} Active</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You have orders currently waiting in the acceptance and packing queue. Review customer items and initiate rider dispatch.
              </p>
              <div className="pt-2 border-t border-border">
                <Button
                  size="sm"
                  variant="primary"
                  className="w-full"
                  onClick={() => setActiveTab('orders')}
                >
                  Open Order Pipeline
                </Button>
              </div>
            </div>

            {/* Quick Short-cut to B2B Quotations */}
            <div className="bg-card rounded-2xl border border-border p-5 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mandi RFQs</span>
                <span className="font-mono font-bold text-sm text-marigold">{quotations.length} Total</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Review incoming bulk procurement RFQs from restaurants and caterers, quote mandi prices, and secure bulk lots.
              </p>
              <div className="pt-2 border-t border-border">
                <Button
                  size="sm"
                  variant="amber"
                  className="w-full"
                  onClick={() => setActiveTab('quotations')}
                >
                  Review Bulk RFQs
                </Button>
              </div>
            </div>
          </div>

          {/* Embedded Live Pipeline preview */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="font-heading font-bold text-foreground text-sm">Recent Store Orders</h4>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                View all in Order Management →
              </button>
            </div>
            <OrderPipeline />
          </div>
        </div>
      )}

      {/* Screen 2: Product Management */}
      {activeTab === 'products' && <ProductManagementTable />}

      {/* Screen 3: Inventory & Pricing */}
      {activeTab === 'inventory' && <InventoryTable />}

      {/* Screen 4: Order Management */}
      {activeTab === 'orders' && <OrderPipeline />}

      {/* Screen 5: BulkBuy Quotations */}
      {activeTab === 'quotations' && <BulkBuyQuotationsTable />}
    </div>
  );
};
