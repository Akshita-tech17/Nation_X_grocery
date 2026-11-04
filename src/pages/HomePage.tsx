import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { PRODUCTS } from '../data/products';
import { MERCHANTS } from '../data/merchants';
import { CategoryRail } from '../components/retail/CategoryRail';
import { ProductCard } from '../components/retail/ProductCard';
import { MerchantCard } from '../components/storefronts/MerchantCard';
import { Button } from '../components/common/Button';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  Truck,
  FileText,
  Sparkles,
  ListPlus
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { currentLocation, setActiveMode } = useStore();
  const navigate = useNavigate();

  const retailBestsellers = PRODUCTS.slice(0, 4);

  return (
    <div className="space-y-16 pb-16">
      {/* Clean, Spacious Editorial Hero Section */}
      <section className="bg-card rounded-2xl border border-border p-6 sm:p-10 lg:p-12 shadow-card relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-soft border border-primary/20 text-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Express Delivery in {currentLocation.eta} to {currentLocation.area}</span>
            </div>

            <div className="space-y-3">
              <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
                Everyday Groceries & <br />
                <span className="text-primary">Direct Mandi Wholesale.</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl font-normal">
                Fresh stone-ground MP Sharbati atta, aged basmati rice, pure desi cow ghee, and APMC commercial 25kg–50kg sacks with instant GST invoicing.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                size="lg"
                variant="primary"
                onClick={() => {
                  setActiveMode('retail');
                  navigate('/browse');
                }}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Shop Daily Groceries
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  setActiveMode('wholesale');
                  navigate('/wholesale');
                }}
                icon={<Layers className="w-4 h-4 text-primary" />}
              >
                Wholesale BulkBuy (B2B)
              </Button>
            </div>

            {/* Quick Trust Meta */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground border-t border-border">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                100% Authentic Quality
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-primary" />
                Verified Local Kirana Dispatch
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                GST Input Tax Invoices
              </span>
            </div>
          </div>

          {/* Hero Right Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-xl overflow-hidden bg-muted border border-border aspect-[4/3] shadow-card">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80"
                alt="Fresh grocery market produce"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-marigold">
                  Regional Heritage
                </span>
                <p className="text-xs font-semibold text-white mt-0.5">
                  Direct farm gate aggregation from MP, Punjab, Wayanad & Kashmir
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Category Rail */}
      <CategoryRail />

      {/* Everyday Pantry Essentials */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Pantry Essentials
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Top-rated stone-ground flours, unpolished pulses, and farm-fresh staples
            </p>
          </div>

          <Link
            to="/browse"
            className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 group transition-colors"
          >
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {retailBestsellers.map(product => (
            <ProductCard key={product.id} product={product} mode="retail" />
          ))}
        </div>
      </section>

      {/* Wholesale BulkBuy 3-Pathways Feature Section */}
      <section className="bg-card rounded-2xl border border-border p-6 sm:p-10 shadow-card space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Institutional & Catering Procurement
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Procure in Bulk. Choose Your Preferred Path.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Tailored workflows for hotels, catering kitchens, hostel messes, and kirana restockers.
            </p>
          </div>

          <Link to="/wholesale">
            <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
              Open B2B Procurement Portal
            </Button>
          </Link>
        </div>

        {/* 3 Pathway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Path A */}
          <div className="p-5 rounded-xl border border-border bg-muted/40 hover:bg-muted/70 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-soft text-primary border border-primary/20 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Path 7.1</span>
              <h3 className="font-semibold text-sm text-foreground mt-0.5">Direct Bulk Ordering</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Order 25kg–50kg sacks directly with automatic volume discount slabs up to 25% off.
              </p>
            </div>
          </div>

          {/* Path B */}
          <div className="p-5 rounded-xl border border-border bg-muted/40 hover:bg-muted/70 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-900 border border-amber-500/20 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Path 7.2</span>
              <h3 className="font-semibold text-sm text-foreground mt-0.5">Merchant Quotation Requests</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Request binding mandi rates for truckload volumes, unlisted commodities, or recurring contracts.
              </p>
            </div>
          </div>

          {/* Path C */}
          <div className="p-5 rounded-xl border border-border bg-muted/40 hover:bg-muted/70 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-900 border border-blue-500/20 flex items-center justify-center font-bold">
              <ListPlus className="w-5 h-5 text-blue-800" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Path 7.3</span>
              <h3 className="font-semibold text-sm text-foreground mt-0.5">Assisted Purchase-List Entry</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Paste raw grocery lists or use our rapid spreadsheet SKU entry grid to add items in 1 click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Local Kirana Storefronts */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Verified Neighborhood Stores
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Support local Kiranas and specialized organic depots with 15-30m delivery
            </p>
          </div>

          <Link
            to="/stores"
            className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 group transition-colors"
          >
            <span>View All Stores</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MERCHANTS.slice(0, 3).map(store => (
            <MerchantCard key={store.id} store={store} />
          ))}
        </div>
      </section>
    </div>
  );
};
