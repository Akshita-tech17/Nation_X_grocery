import React, { useState } from 'react';
import { PRODUCTS } from '../data/products';
import { Product } from '../types';
import { BulkTierCalculator } from '../components/wholesale/BulkTierCalculator';
import { MerchantQuotationSection } from '../components/wholesale/MerchantQuotationSection';
import { AssistedPurchaseListSection } from '../components/wholesale/AssistedPurchaseListSection';
import { ProductCard } from '../components/retail/ProductCard';
import { Badge } from '../components/common/Badge';
import {
  Layers,
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
      <section className="bg-card rounded-2xl p-6 sm:p-10 text-foreground relative overflow-hidden border border-border shadow-card">
        <div className="relative max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-brand-soft text-primary border border-primary/20 text-xs font-semibold">
              ⚡ NationX B2B Mandi Wholesale
            </span>
            <span className="text-xs text-muted-foreground">APMC Direct Logistics & GST Credit</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-foreground">
            Integrated B2B BulkBuy Portal. <br />
            <span className="text-primary">
              Procure in Bulk With 3 Flexible Paths.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Empowering restaurants, caterers, cloud kitchens, and neighborhood kiranas.
            Choose between immediate tiered ordering, tailored mandi quotation requests, or rapid purchase list pasting.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Verified FSSAI Commercial Mill Batches
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-primary" />
              Tailgate Mini-truck Freight
            </span>
            <span className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-primary" />
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
          className={`p-4.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeBulkPath === 'direct'
              ? 'bg-card border-primary shadow-card ring-2 ring-primary/20'
              : 'bg-card border-border hover:border-border/80 shadow-card'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-brand-soft text-primary font-bold border border-primary/20">
              <Layers className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary bg-brand-soft px-2 py-0.5 rounded-md border border-primary/20">
              Path 7.1
            </span>
          </div>
          <h3 className="font-semibold text-sm text-foreground">
            Path A — Direct Bulk Ordering
          </h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Instant catalog checkout with tiered price slabs (5+, 15+, 40+ bags) & live volume savings.
          </p>
        </button>

        {/* Path B Card */}
        <button
          type="button"
          onClick={() => setActiveBulkPath('quotation')}
          className={`p-4.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeBulkPath === 'quotation'
              ? 'bg-card border-primary shadow-card ring-2 ring-primary/20'
              : 'bg-card border-border hover:border-border/80 shadow-card'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-900 font-bold border border-amber-500/20">
              <FileText className="w-5 h-5 text-amber-800" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              Path 7.2
            </span>
          </div>
          <h3 className="font-semibold text-sm text-foreground">
            Path B — Merchant Quotation Requests
          </h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Request custom binding quotes for truckloads, standing contracts, or specific APMC Mandi rates.
          </p>
        </button>

        {/* Path C Card */}
        <button
          type="button"
          onClick={() => setActiveBulkPath('assisted')}
          className={`p-4.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeBulkPath === 'assisted'
              ? 'bg-card border-primary shadow-card ring-2 ring-primary/20'
              : 'bg-card border-border hover:border-border/80 shadow-card'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-900 font-bold border border-blue-500/20">
              <ListPlus className="w-5 h-5 text-blue-800" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-800 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
              Path 7.3
            </span>
          </div>
          <h3 className="font-semibold text-sm text-foreground">
            Path C — Assisted Purchase-List Entry
          </h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Paste grocery lists, rapid multi-row SKU matrix, or CSV template upload in seconds.
          </p>
        </button>
      </div>

      {/* Path A View */}
      {activeBulkPath === 'direct' && (
        <div className="space-y-10">
          {/* Section Subheader */}
          <div className="bg-card rounded-2xl border border-border p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-brand-soft text-primary border border-primary/20">
                  <Layers className="w-5 h-5" />
                </span>
                <h2 className="font-heading font-bold text-lg text-foreground">
                  Path A — Direct Bulk Ordering with Tiered Slabs
                </h2>
                <Badge variant="blue">Instant Checkout</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Prices drop automatically based on the quantity ordered. Select any product below to simulate volume slabs.
              </p>
            </div>

            <span className="text-xs font-semibold text-primary bg-brand-soft px-3 py-1 rounded-full border border-primary/20 shrink-0">
              ⚡ Up to 25% Off Mandi Slabs
            </span>
          </div>

          {/* Interactive Slab Simulation Workspace */}
          <section className="bg-muted/30 rounded-2xl p-6 sm:p-8 border border-border space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-heading text-xl font-bold text-foreground">
                  Live Volume Discount Simulator
                </h3>
                <p className="text-xs text-muted-foreground">
                  Adjust order quantity to see dynamic unit price reduction and input tax credit calculation
                </p>
              </div>

              {/* Product selector buttons */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {wholesaleProducts.slice(0, 5).map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      selectedProduct.id === p.id
                        ? 'bg-primary text-primary-foreground shadow-card'
                        : 'bg-card text-foreground border border-border hover:bg-muted'
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
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                Commercial Wholesale Sacks & Packs (Direct Order)
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
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
