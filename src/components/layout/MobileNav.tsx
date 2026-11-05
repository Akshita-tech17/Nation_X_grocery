import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Home, Compass, Boxes, Clock, ShoppingBag } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { totalItems, subtotal, setIsCartOpen } = useCart();

  const isMerchantRoute = location.pathname.startsWith('/merchant');

  // If in merchant route, provide a quick return to customer shop
  if (isMerchantRoute) {
    return (
      <nav
        aria-label="Mobile Merchant Navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 py-2 px-4 lg:hidden shadow-soft-lg flex items-center justify-between"
      >
        <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Merchant Management Mode
        </span>
        <Link
          to="/"
          className="px-3.5 py-1.5 rounded-xl bg-forest-900 text-white text-xs font-bold shadow-sm"
        >
          Exit to Customer Shop
        </Link>
      </nav>
    );
  }

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Shop', path: '/browse', icon: Compass },
    { label: 'BulkBuy', path: '/wholesale', icon: Boxes, badge: 'B2B' },
    { label: 'Orders', path: '/orders', icon: Clock }
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 py-1 px-2 lg:hidden shadow-soft-lg safe-area-pb"
    >
      <div className="grid grid-cols-5 items-center justify-around">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 relative transition-colors focus-visible:outline-none ${
                isActive
                  ? 'text-forest-900 font-bold'
                  : 'text-stone-500 hover:text-stone-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-forest-900' : 'text-stone-600'}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3 text-[9px] font-extrabold bg-amber-500 text-white px-1 rounded-full leading-tight">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight leading-none mt-0.5">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-forest-800 -mb-0.5 mt-0.5" />
              )}
            </Link>
          );
        })}

        {/* 5th Tab: Basket Action */}
        <button
          onClick={() => setIsCartOpen(true)}
          aria-label={`Open basket, ${totalItems} items, total ₹${subtotal}`}
          className="min-h-[48px] flex flex-col items-center justify-center gap-0.5 relative text-stone-600 hover:text-forest-900 transition-colors focus-visible:outline-none"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-stone-700" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 text-[10px] font-bold bg-forest-900 text-white rounded-full flex items-center justify-center px-1 shadow-xs">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight text-stone-800 leading-none mt-0.5">
            ₹{subtotal}
          </span>
        </button>
      </div>
    </nav>
  );
};

