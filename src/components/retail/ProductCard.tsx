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
    <div className="group bg-card rounded-2xl border border-border hover:border-primary/40 shadow-card hover:shadow-soft transition-all duration-200 flex flex-col justify-between overflow-hidden h-full">
      {/* Product Image Area */}
      <div className="relative pt-[80%] bg-muted/40 overflow-hidden shrink-0">
        <Link to={`/product/${product.id}`} className="absolute inset-0 block">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* Top Tag */}
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
          {product.isOrganic ? (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-brand-soft text-primary border border-primary/20 tracking-wide shadow-card">
              Organic
            </span>
          ) : product.badge ? (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-card text-foreground border border-border tracking-wide shadow-card">
              {product.badge}
            </span>
          ) : product.isGiTagged ? (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-900 border border-blue-500/20 tracking-wide shadow-card">
              GI Tagged
            </span>
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10">
          <button
            onClick={() => setSelectedProductQuickView(product.id)}
            aria-label={`Preview ${product.name}`}
            className="p-1.5 rounded-full bg-card/90 text-muted-foreground hover:text-foreground hover:bg-card shadow-card transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Quick preview"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => toggleWishlist(product.id)}
            aria-label={isWishlisted ? `Remove ${product.name} from saved` : `Save ${product.name}`}
            className={`p-1.5 rounded-full shadow-card transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isWishlisted
                ? 'bg-rose-50 text-rose-600'
                : 'bg-card/90 text-muted-foreground hover:text-rose-600 hover:bg-card'
            }`}
            title="Save for later"
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content & Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          {/* Brand & Pack size */}
          <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
            <span className="uppercase tracking-wider font-semibold text-foreground/80">{product.brand}</span>
            <span className="text-muted-foreground font-medium">{product.packSize || product.unit}</span>
          </div>

          {/* Title */}
          <Link
            to={`/product/${product.id}`}
            className="block text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 cursor-pointer leading-snug min-h-[2.5rem]"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Origin & Availability Meta */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
            <span className="truncate max-w-[140px] text-muted-foreground" title={product.origin}>
              {product.origin.split(',')[0]}
            </span>
            {isAvailable ? (
              <span className={isLowStock ? 'text-amber-800 font-medium' : 'text-primary font-medium'}>
                {isLowStock ? `Only ${product.stockQuantity} left` : `In stock (${product.stockQuantity})`}
              </span>
            ) : (
              <span className="text-destructive font-medium">Out of stock</span>
            )}
          </div>
        </div>

        {/* Pricing & Add to Basket Button */}
        <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
          {/* Price Block */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold font-mono text-foreground">
                ₹{product.retailPrice}
              </span>
              {product.originalPrice > product.retailPrice && (
                <span className="text-xs text-muted-foreground line-through font-mono">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            {discountPercent > 0 && (
              <span className="text-[10px] font-semibold text-primary">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Cart Stepper or Tactile Add Button */}
          {currentQuantity > 0 ? (
            <div className="flex items-center bg-primary text-primary-foreground rounded-xl px-2 py-1 gap-2 shadow-card">
              <button
                onClick={() => updateQuantity(product.id, currentQuantity - 1)}
                aria-label={`Decrease quantity of ${product.name}`}
                className="hover:opacity-80 p-0.5 transition-opacity focus-visible:outline-none"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold font-mono min-w-[1.2rem] text-center">
                {currentQuantity}
              </span>
              <button
                onClick={() => updateQuantity(product.id, currentQuantity + 1)}
                aria-label={`Increase quantity of ${product.name}`}
                className="hover:opacity-80 p-0.5 transition-opacity focus-visible:outline-none"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product, 1, mode)}
              disabled={!isAvailable}
              aria-label={isAvailable ? `Add ${product.name} to basket` : `${product.name} out of stock`}
              className={`px-3.5 py-1.5 rounded-xl font-medium text-xs transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                isAvailable
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-card'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
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
