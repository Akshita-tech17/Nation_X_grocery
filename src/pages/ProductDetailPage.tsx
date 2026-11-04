import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import { MERCHANTS } from '../data/merchants';
import { ProductService } from '../services/productService';
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
  Layers,
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

  const masterProductId = product.masterProductId || product.id;
  const otherOfferings = ProductService.getOfferingsForMasterProduct(masterProductId)
    .filter(o => o.merchantId !== product.merchantId);

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
    <div className="space-y-8 pb-16">
      {/* Back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to products</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleWishlist(product.id)}
            aria-label={isWishlisted ? 'Saved in wishlist' : 'Save to wishlist'}
            className={`p-2 rounded-xl border border-border hover:bg-muted transition-colors ${
              isWishlisted ? 'text-rose-600 bg-rose-50' : 'text-muted-foreground'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            aria-label="Share product"
            className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Product Showcase Card */}
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-10 shadow-card">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Product Image */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted/40 border border-border">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                {product.isOrganic && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-brand-soft text-primary border border-primary/20 shadow-card">
                    100% Organic
                  </span>
                )}
                {product.isGiTagged && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-900 border border-blue-500/20 shadow-card">
                    GI Tagged Heritage
                  </span>
                )}
                {product.badge && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-card text-foreground border border-border shadow-card">
                    {product.badge}
                  </span>
                )}
              </div>
            </div>

            {/* Sourcing & Origin Card */}
            <div className="p-4 bg-muted/40 rounded-xl border border-border space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>Geographic Origin: {product.origin}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Direct aggregation from regional farmer collectives to retain unpolished nutrition and authentic aroma.
              </p>
            </div>
          </div>

          {/* Right: Specifications, Pricing, Mode & Tiers */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Brand, Hindi Name, Rating */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span className="uppercase tracking-wider font-semibold text-foreground">{product.brand}</span>
                  <div className="flex items-center gap-1 text-foreground font-semibold">
                    <Star className="w-4 h-4 text-marigold fill-marigold" />
                    <span>{product.rating}</span>
                    <span className="text-muted-foreground font-normal">({product.reviewCount} customer reviews)</span>
                  </div>
                </div>

                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                  {product.name}
                </h1>
                {product.hindiName && (
                  <p className="text-sm font-medium text-muted-foreground">{product.hindiName}</p>
                )}
              </div>

              {/* Price & Savings */}
              <div className="p-4 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {purchaseMode === 'wholesale' ? 'Wholesale Tier Unit Rate' : 'Retail Selling Price'}
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
                      ₹{currentUnitPrice}
                    </span>
                    {product.originalPrice > currentUnitPrice && (
                      <span className="text-sm line-through text-muted-foreground">
                        MRP ₹{product.originalPrice}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-primary bg-brand-soft border border-primary/20 px-2 py-0.5 rounded-full">
                      Save {discountPercent}%
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-medium text-foreground bg-card border border-border px-3 py-1 rounded-xl">
                    Pack: {product.packSize || product.unit}
                  </span>
                  <div className="text-[11px] text-primary font-medium mt-1">
                    In Stock ({product.stockQuantity} units)
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              {/* Nutrition Facts */}
              {product.nutrition && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                    Nutrition Breakdown (per 100g)
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center bg-muted/40 p-3 rounded-xl border border-border text-xs">
                    <div>
                      <div className="text-muted-foreground text-[11px]">Energy</div>
                      <div className="font-bold text-foreground mt-0.5">{product.nutrition.energy}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-[11px]">Protein</div>
                      <div className="font-bold text-foreground mt-0.5">{product.nutrition.protein}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-[11px]">Carbs</div>
                      <div className="font-bold text-foreground mt-0.5">{product.nutrition.carbs}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-[11px]">Fat</div>
                      <div className="font-bold text-foreground mt-0.5">{product.nutrition.fat}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* BulkBuy Tier Pricing Matrix if applicable */}
              {product.bulkTiers && product.bulkTiers.length > 0 && (
                <div className="p-4 bg-brand-soft/40 rounded-xl border border-primary/20 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-primary" />
                      BulkBuy Wholesale Tier Discounts
                    </span>
                    <span className="text-[11px] font-semibold text-primary">
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
                              ? 'bg-primary text-primary-foreground border-primary shadow-card'
                              : 'bg-card hover:bg-muted border-border text-foreground'
                          }`}
                        >
                          <div className="font-semibold">{tier.minQty}+ units</div>
                          <div className="text-sm font-bold font-mono">₹{tier.pricePerUnit}/unit</div>
                          <div className="text-[10px] text-marigold">Save ₹{product.retailPrice - tier.pricePerUnit} ({tier.discountPercent}%)</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Mode Selector & Add to Cart Controls */}
            <div className="space-y-4 pt-4 border-t border-border">
              {/* Mode Toggle */}
              <div className="flex items-center gap-2 p-1 bg-muted rounded-xl border border-border w-fit text-xs font-semibold">
                <button
                  onClick={() => {
                    setPurchaseMode('retail');
                    setQuantity(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    purchaseMode === 'retail'
                      ? 'bg-card text-foreground shadow-card'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Standard Retail
                </button>
                <button
                  onClick={() => {
                    setPurchaseMode('wholesale');
                    setQuantity(minWholesale);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    purchaseMode === 'wholesale'
                      ? 'bg-primary text-primary-foreground shadow-card'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  BulkBuy Wholesale
                </button>
              </div>

              {/* Quantity Stepper & Add Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">Quantity:</span>
                  <div className="flex items-center border border-border rounded-xl bg-card p-1 shadow-card">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      aria-label="Decrease quantity"
                      className="p-1.5 hover:bg-muted rounded-lg text-foreground transition-colors cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-sm font-mono font-bold text-foreground">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      aria-label="Increase quantity"
                      className="p-1.5 hover:bg-muted rounded-lg text-foreground transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs text-muted-foreground font-medium">
                    Total: <strong className="text-foreground font-bold font-mono">₹{totalPrice}</strong>
                    {savings > 0 && (
                      <span className="ml-1 text-primary font-semibold">(Saved ₹{savings})</span>
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
      <div className="bg-card rounded-2xl border border-border p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={merchant.image}
            alt={merchant.name}
            className="w-14 h-14 rounded-xl object-cover border border-border shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground text-sm">{merchant.name}</span>
              <Badge variant="forest" size="sm">Verified Kirana</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
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

      {/* Other Stores Offering This Same Product */}
      {otherOfferings.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Available at Other Local Stores
              </h3>
              <p className="text-xs text-muted-foreground">
                Independent pricing and stock for the same master item across local kiranas
              </p>
            </div>
            <Badge variant="amber" size="sm">
              {otherOfferings.length} Other {otherOfferings.length === 1 ? 'Store' : 'Stores'}
            </Badge>
          </div>

          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
            {otherOfferings.map(offering => {
              const offMerchant = MERCHANTS.find(m => m.id === offering.merchantId);
              const offProduct = PRODUCTS.find(p => p.offeringId === offering.id || p.id === offering.id);
              return (
                <div key={offering.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-soft text-primary border border-primary/20 flex items-center justify-center font-bold text-sm">
                      <Store className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{offering.merchantName}</span>
                        {offering.availabilityStatus === 'low_stock' && (
                          <Badge variant="amber" size="sm">Low Stock</Badge>
                        )}
                        {offering.availabilityStatus === 'unconfirmed' && (
                          <Badge variant="stone" size="sm">Call to confirm</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {offMerchant?.deliveryTime || '25-35 mins'} • Stock: {offering.stockQuantity} units available
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <div className="text-base font-bold font-mono text-foreground">₹{offering.sellingPrice}</div>
                      <div className="text-xs text-muted-foreground line-through">MRP ₹{offering.mrp}</div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (offProduct) {
                          addToCart(offProduct, 1, 'retail');
                          showToast(`Added from ${offering.merchantName} to cart!`);
                        } else {
                          navigate(`/browse?store=${offering.merchantId}`);
                        }
                      }}
                    >
                      Buy from {offering.merchantName.split(' ')[0]}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
