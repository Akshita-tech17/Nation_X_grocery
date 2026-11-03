import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { PRODUCTS } from '../data/products';
import { CATEGORIES } from '../data/categories';
import { MERCHANTS } from '../data/merchants';
import { ProductCard } from '../components/retail/ProductCard';
import { Button } from '../components/common/Button';
import { Search, Store, X, RotateCcw } from 'lucide-react';

export const RetailBrowsePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const storeParam = searchParams.get('store');

  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStoreId,
    setSelectedStoreId
  } = useStore();

  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'organic' | 'gi' | 'farm'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'rating'>('popular');

  const activeStoreId = storeParam || selectedStoreId;
  const activeStore = activeStoreId ? MERCHANTS.find(m => m.id === activeStoreId) : null;

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

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.origin.toLowerCase().includes(q) ||
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

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight">
          Browse Grocery Catalog
        </h1>
        <p className="text-xs sm:text-sm text-warm-500">
          Chakki flours, aged basmati, unpolished pulses & pure ghee with realistic pricing
        </p>
      </div>

      {/* Active Store Filter Banner if filtered by store */}
      {activeStore && (
        <div className="p-3.5 bg-forest-50 border border-forest-200 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-forest-900 text-white rounded-lg">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-forest-950">
                Shopping from: {activeStore.name} ({activeStore.area})
              </span>
              <p className="text-forest-700 text-[11px]">
                Showing inventory verified by {activeStore.ownerName} • {activeStore.deliveryTime}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedStoreId(null);
              setSearchParams({});
            }}
            className="flex items-center gap-1 text-forest-900 hover:text-rose-600 font-semibold px-2.5 py-1 rounded-lg hover:bg-forest-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Show all stores</span>
          </button>
        </div>
      )}

      {/* Categories Filter Rail */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === null
              ? 'bg-forest-900 text-white shadow-sm'
              : 'bg-white border border-warm-200 text-warm-700 hover:border-warm-300'
          }`}
        >
          All Items ({PRODUCTS.length})
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-forest-900 text-white shadow-sm'
                : 'bg-white border border-warm-200 text-warm-700 hover:border-warm-300'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Secondary Controls Bar: Dietary Pills + Sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-warm-200/90 shadow-soft">
        {/* Dietary and Heritage Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'organic', label: '🌿 100% Organic' },
            { id: 'gi', label: '🏷️ GI Tagged Origin' },
            { id: 'farm', label: '🚜 Direct Farm Gate' }
          ].map(pill => (
            <button
              key={pill.id}
              onClick={() => setDietaryFilter(pill.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                dietaryFilter === pill.id
                  ? 'bg-warm-100 text-warm-900 font-bold border border-warm-300'
                  : 'text-warm-500 hover:text-warm-800'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-warm-400 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-warm-50 border border-warm-200 rounded-xl px-2.5 py-1.5 text-xs text-warm-800 font-medium focus:outline-none focus:ring-1 focus:ring-forest-600 cursor-pointer"
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
        <div className="bg-white rounded-3xl border border-warm-200 p-12 text-center space-y-4 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-warm-100 flex items-center justify-center text-warm-400 mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-warm-900">No matching items found</h3>
            <p className="text-xs text-warm-500 mt-1 max-w-sm mx-auto">
              We couldn't find items matching your search criteria. Try removing filters or searching for staples like Atta, Basmati or Ghee.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleClearFilters}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs text-warm-400 font-medium">
            Showing <strong className="text-warm-800 font-semibold">{filteredProducts.length}</strong> grocery items
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} mode="retail" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
