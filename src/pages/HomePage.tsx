import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { PRODUCTS } from '../data/products';
import { MERCHANTS } from '../data/merchants';
import { CategoryRail } from '../components/retail/CategoryRail';
import { ProductCard } from '../components/retail/ProductCard';
import { MerchantCard } from '../components/storefronts/MerchantCard';
import { BulkTierCalculator } from '../components/wholesale/BulkTierCalculator';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Sparkles,
  Boxes,
  Store,
  ArrowRight,
  ShieldCheck,
  Truck,
  Award,
  Clock
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { currentLocation, setActiveMode } = useStore();
  const navigate = useNavigate();

  const retailBestsellers = PRODUCTS.slice(0, 4);
  const spotlightBulkProduct = PRODUCTS.find(p => p.id === 'prod-aashirvaad-sharbati') || PRODUCTS[0];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-forest-950 text-white p-6 sm:p-10 lg:p-14 shadow-soft-lg border border-forest-800/80">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Integrated Indian Grocery Module
            </span>
            <span className="inline-flex items-center gap-1 text-warm-300 text-xs">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Express Delivery in {currentLocation.eta} to {currentLocation.area}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
            Daily Retail, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-amber-300">
              Wholesale BulkBuy
            </span>{' '}
            & Local Kiranas.
          </h1>

          <p className="text-sm sm:text-base text-warm-200/90 leading-relaxed max-w-2xl font-normal">
            Procure fresh MP Sharbati chakki atta, aged Punjab basmati, Vedic cow ghee and APMC wholesale gunny sacks.
            Order single units for home or 25kg-50kg slabs for catering with verified GST invoicing.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              size="lg"
              variant="amber"
              className="font-bold shadow-soft"
              onClick={() => {
                setActiveMode('retail');
                navigate('/browse');
              }}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Shop Retail Basket (15-30m)
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40"
              onClick={() => {
                setActiveMode('wholesale');
                navigate('/wholesale');
              }}
              icon={<Boxes className="w-4 h-4 text-amber-300" />}
            >
              Wholesale & BulkBuy (B2B)
            </Button>

            <Link
              to="/stores"
              className="text-xs font-semibold text-emerald-300 hover:text-white px-3 py-2 flex items-center gap-1.5 transition-colors"
            >
              <Store className="w-4 h-4" />
              <span>Browse Nearby Kiranas</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Category Rail */}
      <CategoryRail />

      {/* Retail Bestsellers Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="forest">Express Daily Dispatch</Badge>
              <span className="text-xs text-warm-500">• Delivered from {currentLocation.area} Kirana</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight mt-1">
              Pantry Essentials & Pure Staples
            </h2>
            <p className="text-xs sm:text-sm text-warm-500 mt-0.5">
              Top-rated unpolished pulses, stone-ground chakki flours & pure A2 cow ghee
            </p>
          </div>

          <Link
            to="/browse"
            className="text-xs sm:text-sm font-semibold text-forest-800 hover:text-forest-950 flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>Explore All Retail Items</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {retailBestsellers.map(product => (
            <ProductCard key={product.id} product={product} mode="retail" />
          ))}
        </div>
      </section>

      {/* Wholesale BulkBuy Interactive Spotlight */}
      <section className="bg-gradient-to-br from-warm-100/90 to-warm-200/60 rounded-3xl p-6 sm:p-8 lg:p-10 border border-warm-300/80 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge variant="blue" size="md">
                B2B BulkBuy Advantage
              </Badge>
              <span className="text-xs font-semibold text-indigo-950 font-mono">
                Tiered Pricing Active
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-warm-900 tracking-tight">
              Volume Slabs for Restaurants, Caterers & Kiranas
            </h2>
            <p className="text-xs sm:text-sm text-warm-600 leading-relaxed">
              Order beyond retail packaging. Unlock automatic volume slabs up to 25% off with instant GST input tax credit and pallet freight.
            </p>
          </div>

          <Link to="/wholesale">
            <Button variant="primary" size="md" icon={<Boxes className="w-4 h-4" />}>
              Open B2B Procurement Portal
            </Button>
          </Link>
        </div>

        {/* Embedded Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-warm-200 shadow-soft space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={spotlightBulkProduct.image}
                  alt={spotlightBulkProduct.name}
                  className="w-16 h-16 object-cover rounded-xl border border-warm-200"
                />
                <div>
                  <Badge variant="saffron" size="sm">Featured Bulk Item</Badge>
                  <h4 className="font-bold text-sm text-warm-900 line-clamp-1 mt-1">
                    {spotlightBulkProduct.name}
                  </h4>
                  <p className="text-xs text-warm-500">{spotlightBulkProduct.origin} • {spotlightBulkProduct.unit}</p>
                </div>
              </div>
              <p className="text-xs text-warm-600 leading-relaxed">
                Test the dynamic tier pricing engine on the right. Increasing quantity will automatically recalculate unit cost, direct savings, and GST input credit.
              </p>
            </div>

            <div className="space-y-2 text-xs text-warm-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Verified APMC Yard Mandi Mills</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span>Dedicated mini-truck freight dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>Clean FSSAI certified batch lab testing</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <BulkTierCalculator product={spotlightBulkProduct} />
          </div>
        </div>
      </section>

      {/* Local Kirana Storefronts Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="forest">Neighborhood Commerce</Badge>
              <span className="text-xs text-warm-500">• Supporting Local Kirana Ecosystem</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight mt-1">
              Shop Your Trusted Neighborhood Storefronts
            </h2>
            <p className="text-xs sm:text-sm text-warm-500 mt-0.5">
              Verified local shops offering 15-25 min delivery, custom spice grinding, and kirana khata
            </p>
          </div>

          <Link
            to="/stores"
            className="text-xs sm:text-sm font-semibold text-forest-800 hover:text-forest-950 flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>View All Partner Stores</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MERCHANTS.slice(0, 3).map(store => (
            <MerchantCard key={store.id} store={store} />
          ))}
        </div>
      </section>

      {/* Regional GI-Tagged Agricultural Heritage Banner */}
      <section className="bg-white rounded-3xl border border-warm-200/90 shadow-soft p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <Badge variant="blue" size="md">
            Geographical Indication (GI) Certified
          </Badge>
          <h3 className="font-display text-xl sm:text-2xl font-extrabold text-warm-900">
            India's Agricultural Heritage, Direct to Your Kitchen
          </h3>
          <p className="text-xs sm:text-sm text-warm-600 leading-relaxed">
            Every grain tells a story. From the fertile black soils of Sehore MP for Sharbati wheat,
            to the rainforest estates of Wayanad for Tellicherry black pepper and Pampore Kashmir for saffron.
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          onClick={() => {
            setActiveMode('retail');
            navigate('/browse');
          }}
          icon={<Award className="w-4 h-4 text-forest-700" />}
        >
          Discover GI Heritage Staples
        </Button>
      </section>
    </div>
  );
};
