import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import {
  ShoppingBag,
  MapPin,
  Search,
  Store,
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
    <header className="sticky top-0 z-40 bg-background border-b border-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 sm:gap-6">
          {/* Left: Brand & Location */}
          <div className="flex items-center gap-5 shrink-0">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-xl"
            >
              <svg viewBox="0 0 32 32" aria-hidden="true" className="w-8 h-8 shrink-0">
                <rect width="32" height="32" rx="9" fill="#007a75"></rect>
                <path d="M9 9 L23 23" stroke="#fdfaf3" strokeWidth="3.4" strokeLinecap="round"></path>
                <path d="M23 9 L9 23" stroke="#f7b828" strokeWidth="3.4" strokeLinecap="round"></path>
              </svg>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-xl tracking-tight text-foreground flex items-center gap-1.5">
                  Nation<span className="text-primary">X</span>
                  <span className="text-[10px] font-semibold text-primary bg-brand-soft px-1.5 py-0.5 rounded border border-primary/20 uppercase tracking-wide">
                    Grocery
                  </span>
                </span>
                <span className="text-[10px] font-medium text-muted-foreground -mt-0.5">
                  Retail • Wholesale • Kirana
                </span>
              </div>
            </Link>

            {/* Location Selector Pill */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              aria-label={`Delivery location: ${currentLocation.area}, ${currentLocation.city}. Click to change`}
              className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border hover:border-input bg-card hover:bg-muted text-left transition-colors shadow-card focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 leading-tight">
                  Delivering to <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="text-xs font-semibold text-foreground truncate max-w-[130px]">
                  {currentLocation.area}
                </div>
              </div>
            </button>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-xs xl:max-w-sm hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search atta, basmati, ghee..."
                aria-label="Search groceries"
                className="w-full pl-10 pr-10 py-2 bg-card border border-border hover:border-input rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-card shadow-card transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* Center-Right: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'text-primary bg-brand-soft font-semibold'
                      : 'text-foreground/80 hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.2 rounded-full">
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
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border border-border hover:border-primary/40 text-foreground hover:text-primary bg-card hover:bg-brand-soft/40 shadow-card transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-primary" />
              <span>Merchant Hub</span>
            </Link>

            {/* Wishlist */}
            <Link
              to="/browse"
              aria-label="Saved items"
              className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-muted relative transition-colors"
              title="Saved Items"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-marigold text-marigold-foreground text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open basket, ${totalItems} items`}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs shadow-card transition-all active:scale-[0.98]"
            >
              <ShoppingBag className="w-4 h-4 text-primary-foreground/90" />
              <span className="font-mono font-bold">₹{subtotal}</span>
              {totalItems > 0 && (
                <span className="bg-primary-foreground text-primary text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="p-2 rounded-xl text-foreground hover:bg-muted border border-border lg:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border space-y-3">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </form>

            <button
              onClick={() => {
                setIsLocationModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-xl border border-border bg-card text-xs font-medium text-foreground flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Deliver to: {currentLocation.area}</span>
              </div>
              <span className="text-primary text-[11px] font-bold">Change</span>
            </button>

            <div className="grid gap-1 pt-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl text-xs font-medium text-foreground hover:bg-muted flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] font-semibold text-primary bg-brand-soft border border-primary/20 px-2 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
              <Link
                to="/merchant"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl text-xs font-semibold text-primary bg-brand-soft flex items-center gap-2"
              >
                <Store className="w-4 h-4 text-primary" />
                <span>Merchant Hub Portal</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
