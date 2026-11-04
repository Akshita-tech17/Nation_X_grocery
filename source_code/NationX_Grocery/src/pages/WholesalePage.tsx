import React, { useState } from 'react';
import { PRODUCTS } from '../data/products';
import { Product } from '../types';
import { BulkTierCalculator } from '../components/wholesale/BulkTierCalculator';
import { MerchantQuotationSection } from '../components/wholesale/MerchantQuotationSection';
import { AssistedPurchaseListSection } from '../components/wholesale/AssistedPurchaseListSection';
import { ProductCard } from '../components/retail/ProductCard';
import { Badge } from '../components/common/Badge';
import {
  Boxes,
  FileText,
  ListPlus,
  ShieldCheck,
  Building,
  Truck
} from 'lucide-react';

export const WholesalePage: React.FC = () => {
  const [activeBulkPath, setActiveBulkPath] = useState<'direct' | 'quotation' | 'assisted'>('direct');

  const wholesaleProducts = PRODUCTS.filter(p => p.bulkTiers && p.bulkTiers.length > 0);
  const [selectedProduct, setSelectedProduct] = useState<Product>(wholesaleProducts[0]);

  return (
    <div className="space-y-10 pb-16">
      {/* B2B Hero Banner */}
      <section className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden border border-indigo-900/60 shadow-soft-lg">
        <div className="relative max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
              ⚡ NationX B2B Mandi Wholesale
            </span>
            <span className="text-xs text-indigo-200">APMC Direct Logistics & GST Credit</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Integrated B2B BulkBuy Portal. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-emerald-200">
              Procure in Bulk With 3 Flexible Paths.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed max-w-2xl">
            Empowering restaurants, caterers, cloud kitchens, and neighborhood kiranas.
            Choose between immediate tiered ordering, tailored mandi quotation requests, or rapid purchase list pasting.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-300 pt-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified FSSAI Commercial Mill Batches
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-400" />
              Tailgate Mini-truck Freight
            </span>
            <span className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-400" />
              100% Tax Credit Compliant
            </span>
          </div>
        </div>
      </section>

      {/* 3 Core Bulk Paths Selector Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Path A Card */}
        <button
          type="button"
          onClick={() => setActiveBulkPath('direct')}
          className={`p-4.5 rounded-2xl border text-left transition-all ${
            activeBulkPath === 'direct'
              ? 'bg-white border-indigo-600 shadow-soft-md ring-2 ring-indigo-600/20'
              : 'bg-white/80 border-warm-200 hover:border-warm-300 shadow-soft'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-900 font-bold">
              <Boxes className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
              Path 7.1
            </span>
          </div>
          <h3 className="font-bold text-sm text-warm-900">
            Path A — Direct Bulk Ordering
          </h3>
          <p className="text-xs text-warm-500 mt-1 leading-relaxed">
            Instant catalog checkout with tiered price slabs (5+, 15+, 40+ bags) & live volume savings.
          </p>
        </button>

        {/* Path B Card */}
        <button
          type="button"
          onClick={() => setActiveBulkPath('quotation')}
          className={`p-4.5 rounded-2xl border text-left transition-all ${
            activeBulkPath === 'quotation'
              ? 'bg-white border-indigo-600 shadow-soft-md ring-2 ring-indigo-600/20'
              : 'bg-white/80 border-warm-200 hover:border-warm-300 shadow-soft'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-900 font-bold">
              <FileText className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              Path 7.2
            </span>
          </div>
          <h3 className="font-bold text-sm text-warm-900">
            Path B — Merchant Quotation Requests
          </h3>
          <p className="text-xs text-warm-500 mt-1 leading-relaxed">
            Request custom binding quotes for truckloads, standing contracts, or specific APMC Mandi rates.
          </p>
        </button>

        {/* Path C Card */}
        <button
          type="button"
          onClick={() => setActiveBulkPath('assisted')}
          className={`p-4.5 rounded-2xl border text-left transition-all ${
            activeBulkPath === 'assisted'
              ? 'bg-white border-indigo-600 shadow-soft-md ring-2 ring-indigo-600/20'
              : 'bg-white/80 border-warm-200 hover:border-warm-300 shadow-soft'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-900 font-bold">
              <ListPlus className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Path 7.3
            </span>
          </div>
          <h3 className="font-bold text-sm text-warm-900">
            Path C — Assisted Purchase-List Entry
          </h3>
          <p className="text-xs text-warm-500 mt-1 leading-relaxed">
            Paste WhatsApp grocery lists, rapid multi-row SKU matrix, or CSV template upload in seconds.
          </p>
        </button>
      </div>

      {/* Path A View */}
      {activeBulkPath === 'direct' && (
        <div className="space-y-10">
          {/* Section Subheader */}
          <div className="bg-white rounded-2xl border border-warm-200/90 p-5 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-900">
                  <Boxes className="w-5 h-5" />
                </span>
                <h2 className="font-display font-extrabold text-lg text-warm-900">
                  Path A — Direct Bulk Ordering with Tiered Slabs
                </h2>
                <Badge variant="blue">Instant Checkout</Badge>
              </div>
              <p className="text-xs text-warm-500 mt-1">
                Prices drop automatically based on the quantity ordered. Select any product below to simulate volume slabs.
              </p>
            </div>

            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shrink-0">
              ⚡ Up to 25% Off Mandi Slabs
            </span>
          </div>

          {/* Interactive Slab Simulation Workspace */}
          <section className="bg-warm-100/60 rounded-3xl p-6 sm:p-8 border border-warm-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-bold text-warm-900">
                  Live Volume Discount Simulator
                </h3>
                <p className="text-xs text-warm-500">
                  Adjust order quantity to see dynamic unit price reduction and input tax credit calculation
                </p>
              </div>

              {/* Product selector buttons */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {wholesaleProducts.slice(0, 5).map(p => (
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
                Commercial Wholesale Sacks & Packs (Direct Order)
              </h3>
              <p className="text-xs sm:text-sm text-warm-500 mt-0.5">
                Heavy duty 25kg - 50kg gunny bags, master tins, and restaurant bulk cartons with Minimum Order Quantities
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {wholesaleProducts.map(product => (
                <ProductCard key={product.id} product={product} mode="wholesale" />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Path B View */}
      {activeBulkPath === 'quotation' && (
        <MerchantQuotationSection />
      )}

      {/* Path C View */}
      {activeBulkPath === 'assisted' && (
        <AssistedPurchaseListSection />
      )}
    </div>
  );
};
