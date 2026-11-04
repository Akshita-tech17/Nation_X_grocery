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
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

export const Header: React.FC = () => {
  const { totalItems, subtotal, setIsCartOpen } = useCart();
  const {
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

  const navLinks = [
    { label: 'Shop Groceries', path: '/browse' },
    { label: 'Compare Stores', path: '/compare' },
    { label: 'BulkBuy (B2B)', path: '/wholesale', badge: 'Tier Savings' },
    { label: 'Order Tracking', path: '/orders' },
    { label: 'Kirana Stores', path: '/stores' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 sm:gap-6">
          {/* Left: Brand & Location */}
          <div className="flex items-center gap-5 shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 rounded-xl"
            >
              <div className="w-10 h-10 rounded-xl bg-forest-900 text-white flex items-center justify-center shadow-sm group-hover:bg-forest-950 transition-colors">
                <Boxes className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-xl tracking-tight text-stone-900 flex items-center gap-1">
                  Nation<span className="text-forest-700">X</span>
                  <span className="text-[11px] font-semibold text-forest-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 uppercase tracking-normal">
                    Grocery
                  </span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsLocationModalOpen(true);
                  }}
                  className="sm:hidden flex items-center gap-1 text-[11px] font-semibold text-forest-800 -mt-0.5 text-left truncate max-w-[140px] active:opacity-70"
                  aria-label={`Delivery location: ${currentLocation.area}. Tap to change`}
                >
                  <MapPin className="w-3 h-3 text-forest-700 shrink-0" />
                  <span className="truncate">{currentLocation.area}</span>
                  <ChevronDown className="w-2.5 h-2.5 text-stone-500 shrink-0" />
                </button>
                <span className="hidden sm:block text-[10px] font-medium text-stone-600 -mt-0.5">
                  Retail • Wholesale • Kirana
                </span>
              </div>
            </Link>

            {/* Location Selector Pill (Tablet & Desktop) */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              aria-label={`Delivery location: ${currentLocation.area}, ${currentLocation.city}. Click to change`}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-stone-300 bg-stone-50/80 hover:bg-stone-100/70 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600"
            >
              <MapPin className="w-4 h-4 text-forest-700 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] font-semibold text-stone-600 flex items-center gap-1 leading-tight">
                  Delivering to <ChevronDown className="w-3 h-3 text-stone-600" />
                </div>
                <div className="text-xs font-bold text-stone-900 truncate max-w-[130px]">
                  {currentLocation.area}
                </div>
              </div>
            </button>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-xs xl:max-w-sm hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search atta, basmati, ghee..."
                aria-label="Search groceries"
                className="w-full pl-10 pr-10 py-2 bg-stone-50 border border-stone-200 hover:border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-600 hover:text-stone-900 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* Center-Right: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'text-forest-900 bg-emerald-50/80 font-bold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Merchant Hub Direct Access */}
            <Link
              to="/merchant"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-200 hover:border-forest-700 text-stone-700 hover:text-forest-900 bg-white hover:bg-forest-50/40 transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-forest-700" />
              <span>Merchant Hub</span>
            </Link>

            {/* Wishlist */}
            <Link
              to="/browse"
              aria-label="Saved items"
              className="p-2 rounded-lg text-stone-600 hover:text-rose-600 hover:bg-stone-50 relative transition-colors"
              title="Saved Items"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open basket, ${totalItems} items`}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-forest-900 hover:bg-forest-950 text-white font-semibold text-xs shadow-sm transition-all active:scale-[0.98]"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-300" />
              <span className="font-mono font-bold">₹{subtotal}</span>
              {totalItems > 0 && (
                <span className="bg-emerald-500 text-forest-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="p-2 rounded-lg text-stone-700 hover:bg-stone-100 lg:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-stone-200 space-y-3">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                />
              </div>
            </form>

            <button
              onClick={() => {
                setIsLocationModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-lg border border-stone-200 bg-stone-50 text-xs font-semibold text-stone-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-forest-700" />
                <span>Deliver to: {currentLocation.area}</span>
              </div>
              <span className="text-forest-700 text-[11px] font-bold">Change</span>
            </button>

            <div className="grid gap-1 pt-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg text-xs font-semibold text-stone-800 hover:bg-stone-50 flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
              <Link
                to="/merchant"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg text-xs font-bold text-forest-900 bg-emerald-50 flex items-center gap-2"
              >
                <Store className="w-4 h-4 text-forest-700" />
                <span>Merchant Hub Portal</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
