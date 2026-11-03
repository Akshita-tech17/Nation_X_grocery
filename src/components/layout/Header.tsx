import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import {
  ShoppingBag,
  MapPin,
  Search,
  Store,
  Boxes,
  Heart,
  Store as KiranaIcon,
  ChevronDown,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const Header: React.FC = () => {
  const { totalItems, subtotal, setIsCartOpen } = useCart();
  const {
    activeMode,
    setActiveMode,
    currentLocation,
    setIsLocationModalOpen,
    searchQuery,
    setSearchQuery,
    wishlist
  } = useStore();

  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.pathname !== '/browse') {
      navigate('/browse');
    }
  };

  const handleModeChange = (mode: 'retail' | 'wholesale' | 'stores') => {
    setActiveMode(mode);
    if (mode === 'wholesale') {
      navigate('/wholesale');
    } else if (mode === 'stores') {
      navigate('/stores');
    } else {
      navigate('/browse');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-warm-200/90 shadow-sm transition-all">
      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 rounded-xl">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-forest-900 to-forest-950 text-white flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform">
                <Boxes className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-xl tracking-tight text-forest-950 flex items-center gap-1.5">
                  Nation<span className="text-forest-600">X</span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-forest-100 text-forest-800 tracking-normal uppercase">
                    Grocery
                  </span>
                </span>
                <span className="text-[11px] font-semibold text-warm-600 tracking-wide">
                  Retail • Wholesale • Kirana
                </span>
              </div>
            </Link>

            {/* Location Selector Button */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              aria-label={`Change delivery location, currently set to ${currentLocation.area}, ${currentLocation.city}`}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-warm-200 hover:border-warm-300 hover:bg-warm-50 text-left transition-all max-w-[220px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600"
            >
              <div className="p-1.5 rounded-lg bg-forest-50 text-forest-800 shrink-0">
                <MapPin className="w-4 h-4 text-forest-700" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-warm-600 flex items-center gap-1">
                  Deliver to <ChevronDown className="w-3 h-3 text-warm-500" />
                </div>
                <div className="text-xs font-bold text-warm-950 truncate">
                  {currentLocation.area}
                </div>
              </div>
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-2 hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Search grocery products, brands, or regional commodities"
                placeholder="Search Chakki Atta, Basmati Rice, Desi Ghee, 25kg Sacks..."
                className="w-full pl-10 pr-12 py-2.5 bg-warm-50/90 border border-warm-300 rounded-xl text-xs sm:text-sm text-warm-950 placeholder:text-warm-500 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search input"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-500 hover:text-warm-900 text-xs px-1.5 py-0.5 rounded font-bold"
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          {/* Action Icons & Cart */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Merchant Dashboard Hub Link */}
            <Link
              to="/merchant"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-warm-300 hover:border-forest-700 text-warm-800 hover:text-forest-900 bg-warm-50 hover:bg-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600"
            >
              <Store className="w-4 h-4 text-forest-700" />
              <span>Merchant Hub</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </Link>

            {/* Wishlist Link */}
            <Link
              to="/browse"
              aria-label="View saved items in wishlist"
              className="p-2.5 rounded-xl border border-warm-200 hover:border-warm-300 hover:bg-warm-50 text-warm-700 relative transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600"
              title="Saved Items"
            >
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Basket Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open shopping basket, ${totalItems} items for total ₹${subtotal}`}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-forest-900 hover:bg-forest-950 text-white shadow-soft transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-emerald-300" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[10px] uppercase font-bold text-forest-200 tracking-wider">
                  Basket
                </div>
                <div className="text-xs font-bold font-mono">₹{subtotal}</div>
              </div>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="p-2 rounded-xl border border-warm-200 md:hidden text-warm-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Commerce Mode Navigation Bar */}
        <div className="hidden md:flex items-center justify-between pb-3 pt-1 border-t border-warm-100">
          <div className="flex items-center gap-1.5 bg-warm-100/80 p-1 rounded-xl">
            <button
              onClick={() => handleModeChange('retail')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 ${
                activeMode === 'retail' && location.pathname !== '/wholesale' && location.pathname !== '/stores'
                  ? 'bg-white text-forest-950 shadow-sm'
                  : 'text-warm-700 hover:text-warm-950'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-forest-600" />
              <span>Retail Superstore (15-30m)</span>
            </button>

            <button
              onClick={() => handleModeChange('wholesale')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 ${
                location.pathname === '/wholesale'
                  ? 'bg-forest-900 text-white shadow-sm'
                  : 'text-warm-700 hover:text-warm-950'
              }`}
            >
              <Boxes className="w-3.5 h-3.5 text-amber-400" />
              <span>Wholesale BulkBuy (B2B)</span>
              <Badge variant="saffron" size="sm" className="ml-1 text-[10px]">
                Up to 25% Off
              </Badge>
            </button>

            <button
              onClick={() => handleModeChange('stores')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 ${
                location.pathname === '/stores'
                  ? 'bg-white text-forest-950 shadow-sm'
                  : 'text-warm-700 hover:text-warm-950'
              }`}
            >
              <KiranaIcon className="w-3.5 h-3.5 text-forest-700" />
              <span>Local Kirana Storefronts</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-warm-700">
            <Link to="/browse" className="hover:text-forest-900 transition-colors">
              All Categories
            </Link>
            <Link to="/wholesale" className="hover:text-forest-900 transition-colors flex items-center gap-1">
              <span>Bulk Gunny Sacks</span>
              <span className="w-1.5 h-1.5 rounded-full bg-forest-600" />
            </Link>
            <Link to="/merchant" className="text-forest-800 font-bold hover:underline">
              Partner With Us (List Kirana)
            </Link>
          </div>
        </div>

        {/* Mobile Search & Mode bar */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-warm-200 space-y-3">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands, sacks..."
                  className="w-full pl-10 pr-4 py-2 bg-warm-50 border border-warm-300 rounded-xl text-xs text-warm-900"
                />
              </div>
            </form>

            <div className="grid grid-cols-1 gap-2 pt-2">
              <button
                onClick={() => {
                  handleModeChange('retail');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-lg border border-warm-200 bg-white text-xs font-bold text-forest-900"
              >
                Retail Supermarket
              </button>
              <button
                onClick={() => {
                  handleModeChange('wholesale');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-lg border border-warm-200 bg-warm-50 text-xs font-bold text-warm-900"
              >
                Wholesale BulkBuy (B2B Tiers)
              </button>
              <button
                onClick={() => {
                  handleModeChange('stores');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-lg border border-warm-200 bg-warm-50 text-xs font-bold text-warm-900"
              >
                Local Kirana Storefronts
              </button>
              <Link
                to="/merchant"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-left p-2.5 rounded-lg border border-forest-300 bg-forest-50 text-xs font-bold text-forest-900"
              >
                Merchant Dashboard Hub
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
