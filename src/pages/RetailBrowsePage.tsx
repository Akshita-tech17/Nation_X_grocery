import React, { useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { PRODUCTS } from '../data/products';
import { CATEGORIES } from '../data/categories';
import { MERCHANTS } from '../data/merchants';
import { ProductCard } from '../components/retail/ProductCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Search,
  Store,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';

const POPULAR_SEARCH_TERMS = [
  'MP Sharbati Atta',
  'Basmati Rice',
  'A2 Cow Ghee',
  'Toor Dal',
  'Mustard Oil',
  '50kg Sugar Sack',
  'Tellicherry Pepper',
  'Amul Paneer',
  'California Almonds'
];

export const RetailBrowsePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const storeParam = searchParams.get('store');

  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStoreId,
    setSelectedStoreId,
    currentLocation,
    setCurrentLocation,
    setIsLocationModalOpen
  } = useStore();

  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'organic' | 'gi' | 'farm' | 'bestseller'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'rating'>('popular');

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const activeStoreId = storeParam || selectedStoreId;
  const activeStore = activeStoreId ? MERCHANTS.find(m => m.id === activeStoreId) : null;

  // Determine delivery compatibility between selected location and store
  const locationCompatibility = useMemo(() => {
    if (!activeStore) return null;

    const isSameCity = activeStore.city.toLowerCase() === currentLocation.city.toLowerCase();
    const isSameArea =
      activeStore.pincode === currentLocation.pincode ||
      activeStore.area.toLowerCase().includes(currentLocation.area.toLowerCase()) ||
      currentLocation.area.toLowerCase().includes(activeStore.area.toLowerCase());

    if (isSameArea) {
      return {
        status: 'instant',
        label: 'Direct Neighborhood Partner',
        message: `This store is in your delivery neighborhood (${currentLocation.area}). Estimated express dispatch: 15-25 mins.`,
        canSwitch: false
      };
    } else if (isSameCity) {
      return {
        status: 'inter-area',
        label: 'Nearby City Depot',
        message: `Store located in ${activeStore.area} (${activeStore.distance} away). Standard city transit: ${activeStore.deliveryTime}.`,
        canSwitch: false
      };
    } else {
      return {
        status: 'out-of-zone',
        label: 'Different City / Zone',
        message: `Store is located in ${activeStore.area}, ${activeStore.city}. Your active address is in ${currentLocation.city} (${currentLocation.pincode}).`,
        canSwitch: true
      };
    }
  }, [activeStore, currentLocation]);

  // Handle category rail horizontal scrolling
  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Matching merchants based on search
  const matchingMerchants = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return MERCHANTS.filter(
      m =>
        m.name.toLowerCase().includes(q) ||
        m.area.toLowerCase().includes(q) ||
        m.ownerName.toLowerCase().includes(q) ||
        m.tagline.toLowerCase().includes(q) ||
        m.categoriesOffered.some(cat => cat.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // Filter by specific store if selected
    if (activeStoreId) {
      result = result.filter(p => p.merchantId === activeStoreId);
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Filter by search query across multiple fields (name, hindi, brand, category, tags, origin, desc)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          (p.hindiName && p.hindiName.toLowerCase().includes(q)) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subCategory.toLowerCase().includes(q) ||
          p.origin.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Filter by dietary / origin
    if (dietaryFilter === 'organic') {
      result = result.filter(p => p.isOrganic);
    } else if (dietaryFilter === 'gi') {
      result = result.filter(p => p.isGiTagged);
    } else if (dietaryFilter === 'farm') {
      result = result.filter(p => p.isLocalFarm);
    } else if (dietaryFilter === 'bestseller') {
      result = result.filter(p => p.isBestseller);
    }

    // Sort
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.retailPrice - b.retailPrice);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.retailPrice - a.retailPrice);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      // popular
      result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }

    return result;
  }, [activeStoreId, selectedCategory, searchQuery, dietaryFilter, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setDietaryFilter('all');
    setSelectedStoreId(null);
    setSearchParams({});
  };

  const handleSwitchToStoreLocation = () => {
    if (activeStore) {
      setCurrentLocation({
        city: activeStore.city,
        area: activeStore.area,
        pincode: activeStore.pincode,
        eta: activeStore.deliveryTime
      });
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header & Location Context Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Browse Grocery Catalog
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Verified FMCG staples, unpolished pulses, pure cow ghee & commercial bulk packs
          </p>
        </div>

        {/* Current Location Badge */}
        <div className="flex items-center gap-2 bg-secondary/60 border border-border px-3 py-1.5 rounded-xl text-xs text-foreground self-start md:self-auto">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block leading-tight">
              Delivery Destination (Demo)
            </span>
            <span className="font-bold text-foreground">
              {currentLocation.area}, {currentLocation.city} ({currentLocation.pincode})
            </span>
          </div>
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="ml-2 text-primary hover:text-primary/80 font-bold hover:underline text-xs cursor-pointer"
          >
            Change
          </button>
        </div>
      </div>

      {/* Location Consistency Notice if filtered by Store */}
      {activeStore && locationCompatibility && (
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            locationCompatibility.status === 'instant'
              ? 'bg-brand-soft border-primary/25 text-primary'
              : locationCompatibility.status === 'inter-area'
              ? 'bg-secondary/70 border-border text-foreground'
              : 'bg-amber-500/10 border-amber-500/25 text-amber-900 dark:text-amber-300'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-card border border-border shadow-xs shrink-0 mt-0.5">
              <Store className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-bold">
                <span className="text-sm text-foreground">{activeStore.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-card font-semibold border border-current">
                  {locationCompatibility.label}
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  (Simulated Demo Availability)
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {locationCompatibility.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {locationCompatibility.canSwitch && (
              <button
                onClick={handleSwitchToStoreLocation}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Set Location to {activeStore.area}
              </button>
            )}
            <button
              onClick={() => {
                setSelectedStoreId(null);
                setSearchParams({});
              }}
              className="flex items-center gap-1 text-muted-foreground hover:text-destructive font-bold px-2.5 py-1.5 rounded-xl bg-card border border-border hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Store Filter</span>
            </button>
          </div>
        </div>
      )}

      {/* Search Input Bar with Suggestions */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-card space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search groceries (e.g. Sharbati Atta, Basmati Rice, Desi Ghee, Sugar 50kg, Turmeric)..."
            className="w-full pl-10 pr-10 py-2.5 bg-muted/40 border border-input rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-card transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search input"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Search Suggestion Pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Popular:
          </span>
          {POPULAR_SEARCH_TERMS.map(term => (
            <button
              key={term}
              onClick={() => setSearchQuery(term)}
              className="px-2.5 py-1 rounded-lg bg-secondary/50 hover:bg-brand-soft border border-border hover:border-primary/40 text-foreground hover:text-primary text-[11px] font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary cursor-pointer"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Matching Shops Row (if search matches stores as well as items) */}
      {matchingMerchants.length > 0 && (
        <div className="p-4 bg-card rounded-2xl border border-border shadow-card space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Store className="w-4 h-4 text-primary" />
              Matching Neighborhood Partner Shops ({matchingMerchants.length})
            </span>
            <span className="text-muted-foreground text-[11px]">Click to shop strictly from this store</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {matchingMerchants.map(m => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedStoreId(m.id);
                  setSearchParams({ store: m.id });
                }}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  activeStoreId === m.id
                    ? 'border-primary bg-brand-soft text-primary font-bold shadow-xs'
                    : 'border-border hover:border-primary/40 bg-card text-foreground'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-foreground">{m.name}</div>
                  <div className="text-[11px] text-muted-foreground">{m.area} • {m.deliveryTime}</div>
                </div>
                <Badge variant="forest" size="sm">Enter Store</Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Navigation with Visual Scrolling Affordances */}
      <div className="relative bg-card p-3 rounded-2xl border border-border shadow-card">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border text-xs">
          <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">
            Categories ({CATEGORIES.length})
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => scrollCategories('left')}
              aria-label="Scroll categories left"
              className="p-1 rounded-lg border border-border hover:bg-muted/40 text-foreground transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollCategories('right')}
              aria-label="Scroll categories right"
              className="p-1 rounded-lg border border-border hover:bg-muted/40 text-foreground transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable container with snap */}
        <div
          ref={categoryScrollRef}
          className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth"
        >
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer ${
              selectedCategory === null
                ? 'bg-primary text-primary-foreground shadow-card'
                : 'bg-card border border-border text-foreground hover:border-primary/40'
            }`}
          >
            All Categories ({PRODUCTS.length})
          </button>

          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-card font-bold'
                    : 'bg-card border border-border hover:border-primary/40 text-foreground'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {cat.itemCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Controls Bar: Dietary Pills + Sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3.5 rounded-2xl border border-border shadow-card">
        {/* Dietary and Heritage Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'bestseller', label: '⭐ Bestsellers' },
            { id: 'organic', label: '🌿 100% Organic' },
            { id: 'gi', label: '🏷️ GI Tagged' },
            { id: 'farm', label: '🚜 Farm Fresh' }
          ].map(pill => (
            <button
              key={pill.id}
              onClick={() => setDietaryFilter(pill.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary cursor-pointer ${
                dietaryFilter === pill.id
                  ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border hover:border-primary/40'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 text-xs shrink-0">
          <label htmlFor="sort-dropdown" className="text-muted-foreground font-semibold flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
            Sort by:
          </label>
          <select
            id="sort-dropdown"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-card border border-input rounded-xl px-3 py-1.5 text-xs text-foreground font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Customer Rating</option>
          </select>
        </div>
      </div>

      {/* Product Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center space-y-4 shadow-card max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">No grocery products matched</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
              We couldn't find items matching "{searchQuery || dietaryFilter}". Try clearing your filters or selecting another category.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleClearFilters}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset All Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium px-1">
            <span>
              Showing <strong className="text-foreground font-bold">{filteredProducts.length}</strong> items
              {selectedCategory && ` in ${CATEGORIES.find(c => c.id === selectedCategory)?.name}`}
            </span>
            <span className="text-[11px] text-muted-foreground">All prices in Indian Rupees (₹)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 items-stretch">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} mode="retail" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
