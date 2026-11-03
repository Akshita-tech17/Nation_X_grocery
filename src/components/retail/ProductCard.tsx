import React from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { Plus, Minus, Heart, Eye, MapPin, Tag, Star, PackageCheck, AlertCircle } from 'lucide-react';
import { Badge } from '../common/Badge';

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

  const lowestBulkPrice = product.bulkTiers && product.bulkTiers.length > 0
    ? Math.min(...product.bulkTiers.map(t => t.pricePerUnit))
    : null;

  const isAvailable = product.inStock && product.stockQuantity > 0;
  const isLowStock = isAvailable && product.stockQuantity <= 5;

  return (
    <div className="group bg-white rounded-2xl border border-warm-200/90 hover:border-forest-400 shadow-soft hover:shadow-soft-md transition-all duration-200 flex flex-col justify-between overflow-hidden h-full">
      {/* Top Image & Badges */}
      <div className="relative pt-[75%] bg-warm-100 overflow-hidden shrink-0">
        <img
          src={product.image}
          alt={`${product.brand} - ${product.name}`}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10 pointer-events-none">
          {product.badge && (
            <Badge variant="saffron" size="sm" className="shadow-sm font-semibold">
              {product.badge}
            </Badge>
          )}
          {product.isGiTagged && (
            <Badge variant="blue" size="sm" className="shadow-sm font-semibold">
              GI Tagged Origin
            </Badge>
          )}
          {product.isOrganic && (
            <Badge variant="forest" size="sm" className="shadow-sm font-semibold">
              100% Organic
            </Badge>
          )}
        </div>

        {/* Quick View & Wishlist Actions */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          <button
            onClick={() => toggleWishlist(product.id)}
            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            className={`p-2 rounded-full backdrop-blur-md shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 ${
              isWishlisted
                ? 'bg-rose-50 text-rose-600'
                : 'bg-white/90 text-warm-700 hover:text-rose-600 hover:bg-white'
            }`}
            title={isWishlisted ? 'Saved in wishlist' : 'Save to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
          </button>

          <button
            onClick={() => setSelectedProductQuickView(product.id)}
            aria-label={`Quick preview for ${product.name}`}
            className="p-2 rounded-full bg-white/90 backdrop-blur-md text-warm-700 hover:text-forest-900 hover:bg-white shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600"
            title="Quick preview & specifications"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Origin Pill at bottom of image */}
        <div className="absolute bottom-2 left-2.5 right-2.5 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-warm-950/80 backdrop-blur-md text-[10px] font-semibold text-warm-100 truncate max-w-full">
            <MapPin className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
            <span className="truncate">{product.origin}</span>
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Brand & Hindi Name */}
          <div className="flex items-center justify-between text-xs font-bold text-warm-700">
            <span className="uppercase tracking-wider text-warm-800">{product.brand}</span>
            {product.hindiName && (
              <span className="text-warm-500 font-normal truncate max-w-[120px]" title={product.hindiName}>
                {product.hindiName}
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3
            onClick={() => setSelectedProductQuickView(product.id)}
            className="text-xs sm:text-sm font-bold text-warm-950 group-hover:text-forest-900 transition-colors line-clamp-2 cursor-pointer leading-snug min-h-[2.5rem]"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Pack Size & Unit Specs */}
          <div className="flex items-center justify-between text-xs text-warm-700 pt-0.5">
            <span className="font-semibold bg-warm-100/90 text-warm-800 px-2 py-0.5 rounded-md border border-warm-200/80 text-[11px]">
              {product.packSize || product.unit}
            </span>
            <div className="flex items-center gap-1 font-semibold text-warm-800">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{product.rating}</span>
              <span className="text-warm-500 text-[11px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Demo Availability State */}
          <div className="pt-1">
            {isAvailable ? (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                  isLowStock
                    ? 'text-amber-800 bg-amber-50 border border-amber-200'
                    : 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                } px-2 py-0.5 rounded-md`}
              >
                {isLowStock ? (
                  <>
                    <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>Demo Low Stock: {product.stockQuantity} left</span>
                  </>
                ) : (
                  <>
                    <PackageCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Demo Stock: {product.stockQuantity} units</span>
                  </>
                )}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                <span>Demo Out of Stock</span>
              </span>
            )}
          </div>

          {/* Bulk Tier Hint if available */}
          {lowestBulkPrice && (
            <div className="mt-1 text-[11px] text-indigo-950 bg-blue-50/80 border border-blue-200 px-2 py-1 rounded-lg flex items-center justify-between font-medium">
              <span className="flex items-center gap-1 text-indigo-800">
                <Tag className="w-3 h-3 text-indigo-600" />
                Bulk Tier:
              </span>
              <span className="font-bold text-indigo-950">From ₹{lowestBulkPrice}/unit</span>
            </div>
          )}
        </div>

        {/* Pricing & Add to Basket Button */}
        <div className="pt-2.5 border-t border-warm-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-extrabold text-warm-950 font-mono">
                ₹{product.retailPrice}
              </span>
              {product.originalPrice > product.retailPrice && (
                <span className="text-xs line-through text-warm-500 font-medium">
                  MRP ₹{product.originalPrice}
                </span>
              )}
            </div>
            {discountPercent > 0 && (
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {/* Action Button */}
          {!isAvailable ? (
            <button
              disabled
              className="px-3 py-1.5 rounded-xl bg-warm-100 text-warm-500 font-semibold text-xs border border-warm-200 cursor-not-allowed select-none"
            >
              Sold Out (Demo)
            </button>
          ) : currentQuantity === 0 ? (
            <button
              onClick={() => addToCart(product, 1, mode)}
              aria-label={`Add ${product.name} to basket`}
              className="px-3.5 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-950 text-white font-bold text-xs shadow-sm hover:shadow active:scale-95 transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>ADD</span>
            </button>
          ) : (
            <div className="flex items-center border border-forest-800 bg-forest-900 text-white rounded-xl shadow-sm">
              <button
                onClick={() => updateQuantity(product.id, currentQuantity - 1)}
                aria-label={`Decrease quantity of ${product.name}`}
                className="p-1.5 hover:bg-forest-800 rounded-l-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400"
              >
                <Minus className="w-3 h-3 stroke-[2.5]" />
              </button>
              <span className="px-2.5 py-0.5 text-xs font-bold font-mono min-w-6 text-center">
                {currentQuantity}
              </span>
              <button
                onClick={() => updateQuantity(product.id, currentQuantity + 1)}
                aria-label={`Increase quantity of ${product.name}`}
                className="p-1.5 hover:bg-forest-800 rounded-r-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
