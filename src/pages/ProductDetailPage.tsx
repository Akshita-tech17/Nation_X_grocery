import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import { MERCHANTS } from '../data/merchants';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  ArrowLeft,
  MapPin,
  Star,
  Plus,
  Minus,
  ShoppingBag,
  Store,
  Boxes,
  Heart,
  Share2
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, showToast } = useCart();
  const { wishlist, toggleWishlist } = useStore();

  const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
  const merchant = MERCHANTS.find(m => m.id === product.merchantId) || MERCHANTS[0];

  const [quantity, setQuantity] = useState(1);
  const [purchaseMode, setPurchaseMode] = useState<'retail' | 'wholesale'>('retail');

  const isWishlisted = wishlist.includes(product.id);
  const minWholesale = product.minWholesaleQty || 5;

  // Calculate pricing based on quantity and wholesale tiers
  const activeTier = product.bulkTiers
    ?.filter(t => quantity >= t.minQty)
    .sort((a, b) => b.minQty - a.minQty)[0];

  const currentUnitPrice = purchaseMode === 'wholesale' && activeTier
    ? activeTier.pricePerUnit
    : product.retailPrice;

  const totalPrice = currentUnitPrice * quantity;
  const standardTotal = product.originalPrice * quantity;
  const savings = Math.max(0, standardTotal - totalPrice);
  const discountPercent = Math.round(
    ((product.originalPrice - product.retailPrice) / product.originalPrice) * 100
  );

  const handleAdd = () => {
    addToCart(product, quantity, purchaseMode);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('🔗 Product link copied to clipboard!');
  };

  return (
    <div className="space-y-8 pb-24 sm:pb-16">
      {/* Back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to products</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleWishlist(product.id)}
            aria-label={isWishlisted ? 'Saved in wishlist' : 'Save to wishlist'}
            className={`p-2 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors ${
              isWishlisted ? 'text-rose-600 bg-rose-50' : 'text-stone-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            aria-label="Share product"
            className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Product Showcase Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Product Image */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-50 border border-stone-200">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                {product.isOrganic && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-800 text-white shadow-sm">
                    100% Organic
                  </span>
                )}
                {product.isGiTagged && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-800 text-white shadow-sm">
                    GI Tagged Heritage
                  </span>
                )}
                {product.badge && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-stone-900 text-white shadow-sm">
                    {product.badge}
                  </span>
                )}
              </div>
            </div>

            {/* Sourcing & Origin Card */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                <MapPin className="w-4 h-4 text-forest-700 shrink-0" />
                <span>Geographic Origin: {product.origin}</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Direct aggregation from regional farmer collectives to retain unpolished nutrition and authentic aroma.
              </p>
            </div>
          </div>

          {/* Right: Specifications, Pricing, Mode & Tiers */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Brand, Hindi Name, Rating */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-stone-600">
                  <span className="uppercase tracking-wider font-extrabold text-stone-800">{product.brand}</span>
                  <div className="flex items-center gap-1 text-stone-800 font-semibold">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{product.rating}</span>
                    <span className="text-stone-500 font-normal">({product.reviewCount} customer reviews)</span>
                  </div>
                </div>

                <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-950 leading-tight">
                  {product.name}
                </h1>
                {product.hindiName && (
                  <p className="text-sm font-medium text-stone-500">{product.hindiName}</p>
                )}
              </div>

              {/* Price & Savings */}
              <div className="p-4 bg-stone-50/70 rounded-2xl border border-stone-200 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    {purchaseMode === 'wholesale' ? 'Wholesale Tier Unit Rate' : 'Retail Selling Price'}
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-stone-950">
                      ₹{currentUnitPrice}
                    </span>
                    {product.originalPrice > currentUnitPrice && (
                      <span className="text-sm line-through text-stone-500">
                        MRP ₹{product.originalPrice}
                      </span>
                    )}
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Save {discountPercent}%
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-stone-600 bg-white border border-stone-200 px-3 py-1 rounded-xl">
                    Pack: {product.packSize || product.unit}
                  </span>
                  <div className="text-[11px] text-emerald-800 font-medium mt-1">
                    In Stock ({product.stockQuantity} units)
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {product.description}
              </p>

              {/* Nutrition Facts */}
              {product.nutrition && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    Nutrition Breakdown (per 100g)
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs">
                    <div>
                      <div className="text-stone-500 text-[11px]">Energy</div>
                      <div className="font-bold text-stone-900 mt-0.5">{product.nutrition.energy}</div>
                    </div>
                    <div>
                      <div className="text-stone-500 text-[11px]">Protein</div>
                      <div className="font-bold text-stone-900 mt-0.5">{product.nutrition.protein}</div>
                    </div>
                    <div>
                      <div className="text-stone-500 text-[11px]">Carbs</div>
                      <div className="font-bold text-stone-900 mt-0.5">{product.nutrition.carbs}</div>
                    </div>
                    <div>
                      <div className="text-stone-500 text-[11px]">Fat</div>
                      <div className="font-bold text-stone-900 mt-0.5">{product.nutrition.fat}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* BulkBuy Tier Pricing Matrix if applicable */}
              {product.bulkTiers && product.bulkTiers.length > 0 && (
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-forest-900 flex items-center gap-1.5">
                      <Boxes className="w-4 h-4 text-forest-700" />
                      BulkBuy Wholesale Tier Discounts
                    </span>
                    <span className="text-[11px] font-semibold text-forest-700">
                      MOQ: {minWholesale} units
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {product.bulkTiers.map(tier => {
                      const isSelectedTier = quantity >= tier.minQty;
                      return (
                        <div
                          key={tier.minQty}
                          onClick={() => {
                            setPurchaseMode('wholesale');
                            setQuantity(tier.minQty);
                          }}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelectedTier && purchaseMode === 'wholesale'
                              ? 'bg-forest-900 text-white border-forest-900 shadow-sm'
                              : 'bg-white text-stone-800 border-stone-200 hover:border-forest-600'
                          }`}
                        >
                          <div className="font-bold">{tier.label.split(' (')[0]}</div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-mono font-extrabold">₹{tier.pricePerUnit}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                isSelectedTier && purchaseMode === 'wholesale'
                                  ? 'bg-forest-800 text-emerald-200'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              Save {tier.discountPercent}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Stepper & Add to Basket Row */}
            <div className="pt-4 border-t border-stone-100 space-y-4">
              {/* Mode switch */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl text-xs font-semibold max-w-sm">
                <button
                  type="button"
                  onClick={() => setPurchaseMode('retail')}
                  className={`py-1.5 rounded-lg transition-all ${
                    purchaseMode === 'retail'
                      ? 'bg-white text-stone-900 shadow-sm font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Retail Single Units
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPurchaseMode('wholesale');
                    if (quantity < minWholesale) setQuantity(minWholesale);
                  }}
                  className={`py-1.5 rounded-lg transition-all ${
                    purchaseMode === 'wholesale'
                      ? 'bg-forest-900 text-white shadow-sm font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Wholesale BulkBuy
                </button>
              </div>

              {/* Quantity Stepper & Add Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-stone-600">Quantity:</span>
                  <div className="flex items-center border border-stone-200 rounded-xl bg-white p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      aria-label="Decrease quantity"
                      className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-700 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-sm font-mono font-bold text-stone-950">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      aria-label="Increase quantity"
                      className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs text-stone-500 font-medium">
                    Total: <strong className="text-stone-950 font-bold font-mono">₹{totalPrice}</strong>
                    {savings > 0 && (
                      <span className="ml-1 text-emerald-800 font-semibold">(Saved ₹{savings})</span>
                    )}
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAdd}
                  icon={<ShoppingBag className="w-4 h-4" />}
                >
                  Add {quantity} to Basket • ₹{totalPrice}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sourced Merchant Kirana Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={merchant.image}
            alt={merchant.name}
            className="w-14 h-14 rounded-2xl object-cover border border-stone-200 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900 text-sm">{merchant.name}</span>
              <Badge variant="forest" size="sm">Verified Kirana</Badge>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              {merchant.area}, {merchant.city} • Express delivery in {merchant.deliveryTime}
            </p>
          </div>
        </div>

        <Link to={`/browse?store=${merchant.id}`}>
          <Button variant="outline" size="sm" icon={<Store className="w-4 h-4" />}>
            Visit Storefront
          </Button>
        </Link>
      </div>

      {/* Mobile Sticky Bottom Bar (Visible on mobile viewports only) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 px-4 py-3 sm:hidden shadow-soft-lg flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Total Price</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold font-mono text-stone-900 leading-tight">₹{totalPrice}</span>
            {savings > 0 && (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded">Save ₹{savings}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 h-10 px-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              aria-label="Decrease quantity"
              className="min-w-[32px] min-h-[32px] flex items-center justify-center text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs font-mono font-bold text-stone-900 min-w-[1.2rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              aria-label="Increase quantity"
              className="min-w-[32px] min-h-[32px] flex items-center justify-center text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleAdd}
            icon={<ShoppingBag className="w-4 h-4" />}
            className="min-h-[42px] px-3.5 text-xs font-bold"
          >
            Add • ₹{totalPrice}
          </Button>
        </div>
      </div>
    </div>
  );
};
