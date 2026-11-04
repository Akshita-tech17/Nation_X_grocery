import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { Plus, Minus, Heart, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  mode?: 'retail' | 'wholesale';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, mode = 'retail' }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const { wishlist, toggleWishlist, setSelectedProductQuickView } = useStore();

  const cartItem = cart.find(item => item.product.id === product.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;
  const isWishlisted = wishlist.includes(product.id);

  const discountPercent = Math.round(
    ((product.originalPrice - product.retailPrice) / product.originalPrice) * 100
  );

  const isAvailable = product.inStock && product.stockQuantity > 0;
  const isLowStock = isAvailable && product.stockQuantity <= 5;

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/80 hover:border-forest-600/60 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden h-full">
      {/* Product Image Area */}
      <div className="relative pt-[80%] bg-stone-50 overflow-hidden shrink-0">
        <Link to={`/product/${product.id}`} className="absolute inset-0 block">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* Top Tag: Only 1 primary badge if applicable */}
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
          {product.isOrganic ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-800 text-white tracking-wide shadow-sm">
              Organic
            </span>
          ) : product.badge ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-900 text-white tracking-wide shadow-sm">
              {product.badge}
            </span>
          ) : product.isGiTagged ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-800 text-white tracking-wide shadow-sm">
              GI Tagged
            </span>
          ) : null}
        </div>

        {/* Subtle Action Buttons with Accessible Touch Targets */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10">
          <button
            onClick={() => setSelectedProductQuickView(product.id)}
            aria-label={`Preview ${product.name}`}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full bg-white/95 text-stone-600 hover:text-stone-900 hover:bg-white shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 active:scale-95"
            title="Quick preview"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleWishlist(product.id)}
            aria-label={isWishlisted ? `Remove ${product.name} from saved` : `Save ${product.name}`}
            className={`min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 active:scale-95 ${
              isWishlisted
                ? 'bg-rose-50 text-rose-600'
                : 'bg-white/95 text-stone-500 hover:text-rose-600 hover:bg-white'
            }`}
            title="Save for later"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content & Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          {/* Brand & Pack size */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600">
            <span className="uppercase tracking-wider font-bold text-stone-700">{product.brand}</span>
            <span className="text-stone-700 font-medium">{product.packSize || product.unit}</span>
          </div>

          {/* Title */}
          <Link
            to={`/product/${product.id}`}
            className="block text-xs sm:text-sm font-bold text-stone-900 group-hover:text-forest-900 transition-colors line-clamp-2 cursor-pointer leading-snug min-h-[2.5rem]"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Origin & Availability Meta */}
          <div className="flex items-center justify-between text-[11px] text-stone-600 pt-0.5">
            <span className="truncate max-w-[140px] text-stone-600 font-medium" title={product.origin}>
              {product.origin.split(',')[0]}
            </span>
            {isAvailable ? (
              <span className={isLowStock ? 'text-amber-800 font-medium' : 'text-emerald-800 font-medium'}>
                {isLowStock ? `Only ${product.stockQuantity} left` : `In stock (${product.stockQuantity})`}
              </span>
            ) : (
              <span className="text-rose-700 font-medium">Out of stock</span>
            )}
          </div>
        </div>

        {/* Pricing & Add to Basket Button */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          {/* Price Block */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold font-mono text-stone-900">
                ₹{product.retailPrice}
              </span>
              {product.originalPrice > product.retailPrice && (
                <span className="text-xs text-stone-600 line-through font-mono">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            {discountPercent > 0 && (
              <span className="text-[10px] font-bold text-emerald-800">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Cart Stepper or Tactile Add Button */}
          {currentQuantity > 0 ? (
            <div className="flex items-center bg-forest-900 text-white rounded-xl shadow-sm h-9 px-1">
              <button
                onClick={() => updateQuantity(product.id, currentQuantity - 1)}
                aria-label={`Decrease quantity of ${product.name}`}
                className="min-w-[32px] min-h-[32px] flex items-center justify-center hover:text-emerald-300 transition-colors focus-visible:outline-none"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold font-mono min-w-[1.4rem] text-center px-1">
                {currentQuantity}
              </span>
              <button
                onClick={() => updateQuantity(product.id, currentQuantity + 1)}
                aria-label={`Increase quantity of ${product.name}`}
                className="min-w-[32px] min-h-[32px] flex items-center justify-center hover:text-emerald-300 transition-colors focus-visible:outline-none"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product, 1, mode)}
              disabled={!isAvailable}
              aria-label={isAvailable ? `Add ${product.name} to basket` : `${product.name} out of stock`}
              className={`min-h-[36px] px-4 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 ${
                isAvailable
                  ? 'bg-forest-900 hover:bg-forest-950 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 cursor-not-allowed'
              }`}
            >
              {isAvailable ? 'Add' : 'Sold Out'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
