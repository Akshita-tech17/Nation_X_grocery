import React, { useState } from 'react';
import { useMerchant } from '../context/MerchantContext';
import { useCart } from '../context/CartContext';
import { MetricsBar } from '../components/merchant/MetricsBar';
import { OrderPipeline } from '../components/merchant/OrderPipeline';
import { InventoryTable } from '../components/merchant/InventoryTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Package,
  Layers,
  Settings,
  PlusCircle,
  Check
} from 'lucide-react';

export const MerchantDashboardPage: React.FC = () => {
  const { merchants, activeMerchantId, setActiveMerchantId, addNewOrder } = useMerchant();
  const { showToast } = useCart();
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'profile'>('orders');

  const currentStore = merchants.find(m => m.id === activeMerchantId) || merchants[0];

  const handleSimulateIncomingOrder = () => {
    const id = `NX-LIVE-${Math.floor(1000 + Math.random() * 9000)}`;
    addNewOrder({
      id,
      date: 'Just Now',
      items: [
        {
          product: {
            id: 'prod-aashirvaad-sharbati',
            name: 'Aashirvaad Select 100% MP Sharbati Whole Wheat Atta',
            hindiName: 'आशीर्वाद सेलेक्ट शरबती गेहूं आटा',
            brand: 'Aashirvaad',
            category: 'staples-atta',
            subCategory: 'Atta',
            unit: '5 kg',
            packSize: '5 kg bag',
            retailPrice: 345,
            originalPrice: 385,
            image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
            rating: 4.8,
            reviewCount: 1420,
            inStock: true,
            stockQuantity: 48,
            origin: 'Sehore, MP',
            description: 'Sharbati atta.',
            tags: ['Sharbati'],
            merchantId: currentStore.id,
            merchantName: currentStore.name
          },
          quantity: 2,
          mode: 'retail',
          unitPrice: 345,
          totalPrice: 690
        }
      ],
      totalAmount: 690,
      originalAmount: 770,
      savings: 80,
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
      paymentStatus: 'paid',
      estimatedDelivery: 'In 20 mins'
    });

    showToast(`🔔 Ding! New order #${id} received!`);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Merchant Header Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-warm-200 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentStore.image}
            alt={currentStore.name}
            className="w-16 h-16 rounded-2xl object-cover border border-warm-200 shadow-sm shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg sm:text-xl text-warm-900">
                {currentStore.name}
              </span>
              <Badge variant="forest" size="sm">Verified Merchant</Badge>
            </div>
            <p className="text-xs text-warm-500 mt-0.5">
              Owner: <strong className="text-warm-700">{currentStore.ownerName}</strong> • {currentStore.address}
            </p>
          </div>
        </div>

        {/* Store Switcher & Test Order Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-warm-400 font-medium">Switch Store:</span>
            <select
              value={activeMerchantId}
              onChange={e => setActiveMerchantId(e.target.value)}
              className="bg-warm-50 border border-warm-200 rounded-xl px-3 py-2 text-xs font-semibold text-warm-800 focus:outline-none focus:ring-1 focus:ring-forest-600"
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

      {/* Real-time Business Metrics */}
      <MetricsBar />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-warm-200 pb-1">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'orders'
              ? 'bg-forest-900 text-white shadow-sm'
              : 'text-warm-600 hover:text-warm-900 hover:bg-warm-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Live Orders Pipeline</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'inventory'
              ? 'bg-forest-900 text-white shadow-sm'
              : 'text-warm-600 hover:text-warm-900 hover:bg-warm-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Inventory & Slabs</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'profile'
              ? 'bg-forest-900 text-white shadow-sm'
              : 'text-warm-600 hover:text-warm-900 hover:bg-warm-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Kirana Khata & Settings</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'orders' && <OrderPipeline />}

      {activeTab === 'inventory' && <InventoryTable />}

      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-warm-200 p-6 sm:p-8 space-y-6 shadow-soft max-w-2xl">
          <div className="space-y-1">
            <h3 className="font-bold text-warm-900 text-base">Store Profile & Digital Khata Register</h3>
            <p className="text-xs text-warm-500">Configure your store opening hours, contact number, and credit ledger settings</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-warm-700 block mb-1">Store Name</label>
                <input
                  type="text"
                  readOnly
                  value={currentStore.name}
                  className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl text-warm-900 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-warm-700 block mb-1">Registered Phone</label>
                <input
                  type="text"
                  readOnly
                  value={currentStore.phone}
                  className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl text-warm-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-warm-700 block mb-1">Store Address</label>
              <input
                type="text"
                readOnly
                value={currentStore.address}
                className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl text-warm-900"
              />
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <Check className="w-4 h-4 text-emerald-700" />
                <span>Active Features for this Kirana</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {currentStore.features.map(f => (
                  <span key={f} className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 text-[11px] font-medium">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-warm-50 border border-warm-200 rounded-2xl space-y-2">
              <h5 className="font-bold text-warm-900 text-xs">Digital Khata (Customer Credit Ledger)</h5>
              <p className="text-[11px] text-warm-500 leading-relaxed">
                Allow trusted neighborhood residents to purchase on monthly credit terms up to ₹5,000 per household.
                Payment reminder SMS is sent on the 1st of every month automatically with UPI pay link.
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px] font-semibold text-warm-800">
                <span>Active Khata Accounts: <strong>48 Families</strong></span>
                <span>Outstanding Dues: <strong>₹34,820</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
