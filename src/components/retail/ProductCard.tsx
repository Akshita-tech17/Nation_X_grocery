import React from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { Plus, Minus, Heart, Eye, MapPin, Tag, Star } from 'lucide-react';
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

  return (
    <div className="group bg-white rounded-2xl border border-warm-200/90 hover:border-forest-300 shadow-soft hover:shadow-soft-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Top Image & Badges */}
      <div className="relative pt-[80%] bg-warm-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
          {product.badge && (
            <Badge variant="saffron" size="sm" className="shadow-sm">
              {product.badge}
            </Badge>
          )}
          {product.isGiTagged && (
            <Badge variant="blue" size="sm" className="shadow-sm">
              GI Tagged
            </Badge>
          )}
          {product.isOrganic && (
            <Badge variant="forest" size="sm" className="shadow-sm">
              100% Organic
            </Badge>
          )}
        </div>

        {/* Quick View & Wishlist Actions */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`p-1.5 rounded-full backdrop-blur-md shadow-sm transition-all ${
              isWishlisted
                ? 'bg-rose-50 text-rose-600'
                : 'bg-white/85 text-warm-500 hover:text-rose-500 hover:bg-white'
            }`}
            title="Save to wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
          </button>

          <button
            onClick={() => setSelectedProductQuickView(product.id)}
            className="p-1.5 rounded-full bg-white/85 backdrop-blur-md text-warm-600 hover:text-forest-900 hover:bg-white shadow-sm transition-all"
            title="Quick preview"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Origin Pill at bottom of image */}
        <div className="absolute bottom-2 left-2.5 right-2.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-warm-900/75 backdrop-blur-md text-[10px] font-medium text-warm-100 truncate max-w-full">
            <MapPin className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
            <span className="truncate">{product.origin}</span>
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Brand & Hindi Name */}
          <div className="flex items-center justify-between text-[11px] text-warm-400 font-medium">
            <span className="uppercase tracking-wider text-warm-500 font-bold">{product.brand}</span>
            {product.hindiName && (
              <span className="text-warm-400 truncate max-w-[120px]">{product.hindiName}</span>
            )}
          </div>

          {/* Product Name */}
          <h3
            onClick={() => setSelectedProductQuickView(product.id)}
            className="text-xs sm:text-sm font-bold text-warm-900 group-hover:text-forest-900 transition-colors line-clamp-2 mt-1 cursor-pointer leading-snug"
          >
            {product.name}
          </h3>

          {/* Unit & Rating */}
          <div className="flex items-center justify-between mt-2 text-xs text-warm-500">
            <span className="font-semibold text-warm-700 bg-warm-100 px-2 py-0.5 rounded-md">
              {product.unit}
            </span>
            <div className="flex items-center gap-1 font-semibold text-warm-800">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{product.rating}</span>
              <span className="text-warm-400 text-[11px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Bulk Tier Hint if available */}
          {lowestBulkPrice && (
            <div className="mt-2 text-[11px] text-indigo-900 bg-blue-50/70 border border-blue-100 px-2 py-1 rounded-lg flex items-center justify-between">
              <span className="flex items-center gap-1 font-medium">
                <Tag className="w-3 h-3 text-indigo-600" />
                Bulk Tier:
              </span>
              <span className="font-bold">From ₹{lowestBulkPrice}/unit</span>
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="pt-2 border-t border-warm-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-warm-900 font-mono">
                ₹{product.retailPrice}
              </span>
              {product.originalPrice > product.retailPrice && (
                <span className="text-xs line-through text-warm-400">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            {discountPercent > 0 && (
              <span className="text-[10px] font-bold text-emerald-700 uppercase">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Action Button */}
          {currentQuantity === 0 ? (
            <button
              onClick={() => addToCart(product, 1, mode)}
              className="px-3.5 py-1.5 rounded-xl bg-forest-50 hover:bg-forest-900 text-forest-900 hover:text-white font-bold text-xs border border-forest-300 hover:border-forest-900 transition-all flex items-center gap-1 active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD</span>
            </button>
          ) : (
            <div className="flex items-center border border-forest-600 bg-forest-900 text-white rounded-xl shadow-sm">
              <button
                onClick={() => updateQuantity(product.id, currentQuantity - 1)}
                className="p-1.5 hover:bg-forest-800 rounded-l-xl transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="px-2 py-0.5 text-xs font-bold font-mono">
                {currentQuantity}
              </span>
              <button
                onClick={() => updateQuantity(product.id, currentQuantity + 1)}
                className="p-1.5 hover:bg-forest-800 rounded-r-xl transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

