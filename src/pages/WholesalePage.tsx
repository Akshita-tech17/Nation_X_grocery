import React, { useState } from 'react';
import { PRODUCTS } from '../data/products';
import { Product } from '../types';
import { BulkTierCalculator } from '../components/wholesale/BulkTierCalculator';
import { ProductCard } from '../components/retail/ProductCard';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  Truck,
  FileText,
  ShieldCheck,
  TrendingDown,
  Building,
  CheckCircle2,
  Send
} from 'lucide-react';

export const WholesalePage: React.FC = () => {
  const wholesaleProducts = PRODUCTS.filter(p => p.bulkTiers && p.bulkTiers.length > 0);
  const [selectedProduct, setSelectedProduct] = useState<Product>(wholesaleProducts[0]);
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [rfqSubmitted, setRfqSubmitted] = useState(false);

  // RFQ Form
  const [rfqBusiness, setRfqBusiness] = useState('');
  const [rfqContact, setRfqContact] = useState('');
  const [rfqCommodity, setRfqCommodity] = useState('Whole Wheat Atta (25kg - 50kg)');
  const [rfqVolume, setRfqVolume] = useState('500 kg / month');

  const handleRfqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRfqSubmitted(true);
    setTimeout(() => {
      setRfqSubmitted(false);
      setIsRfqModalOpen(false);
      setRfqBusiness('');
      setRfqContact('');
    }, 2000);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* B2B Hero Banner */}
      <section className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden border border-indigo-900/60 shadow-soft-lg">
        <div className="relative max-w-2xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
              ⚡ NationX B2B Mandi Wholesale
            </span>
            <span className="text-xs text-indigo-200">APMC Direct Logistics</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Procure in Bulk. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-emerald-300">
              Save Up to 25% with GST Credit.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
            Standardized procurement for caterers, cloud kitchens, bakeries, hostels and kirana partners.
            Access 25kg & 50kg sacks, master cartons, verified mill batches and dedicated mini-truck tailgate drops.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="amber"
              size="md"
              onClick={() => setIsRfqModalOpen(true)}
              icon={<Send className="w-4 h-4" />}
            >
              Request Custom Mandi RFQ Quote
            </Button>
            <span className="text-xs text-indigo-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified FSSAI Commercial Mill Batches
            </span>
          </div>
        </div>
      </section>

      {/* 4 Pillars of NationX B2B */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-warm-200 shadow-soft space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-warm-900">Graduated Volume Slabs</h4>
          <p className="text-xs text-warm-500 leading-relaxed">
            Unit prices automatically decrease as your bag count rises. Clear tiers with no hidden brokerage fees.
          </p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-warm-200 shadow-soft space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-warm-900">GST Input Tax Credit</h4>
          <p className="text-xs text-warm-500 leading-relaxed">
            Receive automated 100% compliant B2B tax invoices directly into your accounting software.
          </p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-warm-200 shadow-soft space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-warm-900">Pallet & Tailgate Dispatch</h4>
          <p className="text-xs text-warm-500 leading-relaxed">
            Heavy 25kg - 50kg gunny sacks delivered directly into your basement or kitchen store room.
          </p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-warm-200 shadow-soft space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-warm-900">Kirana Restock Credit</h4>
          <p className="text-xs text-warm-500 leading-relaxed">
            Eligible local merchants get 15-day digital revolving credit lines for seasonal festive inventory.
          </p>
        </div>
      </div>

      {/* Interactive Slab Simulation Workspace */}
      <section className="bg-warm-100/60 rounded-3xl p-6 sm:p-8 border border-warm-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-warm-900">
              Interactive Bulk Volume Simulator
            </h2>
            <p className="text-xs text-warm-500">
              Select an item below to experiment with volume quantities and live per-unit discount calculations
            </p>
          </div>

          {/* Product selector buttons */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {wholesaleProducts.slice(0, 4).map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedProduct.id === p.id
                    ? 'bg-indigo-900 text-white shadow-sm'
                    : 'bg-white text-warm-700 border border-warm-200 hover:border-warm-300'
                }`}
              >
                {p.name.split(' ')[0]} {p.unit}
              </button>
            ))}
          </div>
        </div>

        <BulkTierCalculator product={selectedProduct} />
      </section>

      {/* Catalog of Wholesale Items */}
      <section className="space-y-6">
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-extrabold text-forest-950">
            Available Commercial Wholesale Sacks & Packs
          </h3>
          <p className="text-xs sm:text-sm text-warm-500 mt-0.5">
            Heavy duty bags, tins, and wholesale bulk boxes with Minimum Order Quantities
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {wholesaleProducts.map(product => (
            <ProductCard key={product.id} product={product} mode="wholesale" />
          ))}
        </div>
      </section>

      {/* Request RFQ Modal */}
      <Modal
        isOpen={isRfqModalOpen}
        onClose={() => setIsRfqModalOpen(false)}
        title="Request Commercial Mandi RFQ"
        subtitle="Submit your monthly or container requirement for custom APMC Mandi rates"
        maxWidth="md"
      >
        {rfqSubmitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-warm-900">RFQ Received!</h4>
            <p className="text-xs text-warm-500 max-w-xs mx-auto">
              Our APMC wholesale desk will review your volume requirement and connect via phone within 4 business hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleRfqSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-warm-700 block mb-1">
                Business / Restaurant / Mess Name
              </label>
              <input
                type="text"
                required
                value={rfqBusiness}
                onChange={e => setRfqBusiness(e.target.value)}
                placeholder="e.g. Udupi Grand Canteen / Annapurna Mess"
                className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl focus:ring-1 focus:ring-indigo-600 focus:bg-white text-warm-900"
              />
            </div>

            <div>
              <label className="font-semibold text-warm-700 block mb-1">
                Contact Person & Phone Number
              </label>
              <input
                type="text"
                required
                value={rfqContact}
                onChange={e => setRfqContact(e.target.value)}
                placeholder="e.g. Ramesh Hegde (+91 98450 00000)"
                className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl focus:ring-1 focus:ring-indigo-600 focus:bg-white text-warm-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-warm-700 block mb-1">Commodity Type</label>
                <select
                  value={rfqCommodity}
                  onChange={e => setRfqCommodity(e.target.value)}
                  className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl focus:ring-1 focus:ring-indigo-600 focus:bg-white text-xs text-warm-900"
                >
                  <option>Whole Wheat Atta (25kg - 50kg)</option>
                  <option>Basmati & Sona Masoori Rice Sacks</option>
                  <option>Pure Desi Cow Ghee Tins</option>
                  <option>Commercial Sugar & Jaggery Sacks</option>
                  <option>Unpolished Toor & Moong Dals</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-warm-700 block mb-1">Estimated Monthly Volume</label>
                <input
                  type="text"
                  value={rfqVolume}
                  onChange={e => setRfqVolume(e.target.value)}
                  placeholder="e.g. 20 bags / 1 ton"
                  className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl focus:ring-1 focus:ring-indigo-600 focus:bg-white text-warm-900"
                />
              </div>
            </div>

            <div className="pt-3">
              <Button type="submit" variant="amber" size="md" className="w-full font-bold">
                Submit Mandi RFQ
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
