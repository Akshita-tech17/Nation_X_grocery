import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { PRODUCTS } from '../../data/products';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  MapPin,
  Star,
  Boxes,
  ShoppingBag,
  Plus,
  Minus
} from 'lucide-react';

export const ProductQuickViewModal: React.FC = () => {
  const { selectedProductQuickView, setSelectedProductQuickView } = useStore();
  const { addToCart } = useCart();
  const [selectedQty, setSelectedQty] = useState(1);
  const [purchaseMode, setPurchaseMode] = useState<'retail' | 'wholesale'>('retail');

  if (!selectedProductQuickView) return null;

  const product = PRODUCTS.find(p => p.id === selectedProductQuickView);
  if (!product) return null;

  const minWholesale = product.minWholesaleQty || 5;

  // Calculate pricing based on quantity and tiers
  const activeTier = product.bulkTiers
    ?.filter(t => selectedQty >= t.minQty)
    .sort((a, b) => b.minQty - a.minQty)[0];

  const currentUnitPrice = purchaseMode === 'wholesale' && activeTier
    ? activeTier.pricePerUnit
    : product.retailPrice;

  const totalPrice = currentUnitPrice * selectedQty;
  const standardTotal = product.originalPrice * selectedQty;
  const savings = Math.max(0, standardTotal - totalPrice);

  const handleAdd = () => {
    addToCart(product, selectedQty, purchaseMode);
    setSelectedProductQuickView(null);
  };

  return (
    <Modal
      isOpen={Boolean(selectedProductQuickView)}
      onClose={() => setSelectedProductQuickView(null)}
      maxWidth="2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Image & Origin */}
        <div className="space-y-3">
          <div className="relative pt-[85%] rounded-2xl overflow-hidden bg-warm-100 border border-warm-200">
            <img
              src={product.image}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.badge && <Badge variant="saffron">{product.badge}</Badge>}
              {product.isGiTagged && <Badge variant="blue">GI Tagged Origin</Badge>}
              {product.isOrganic && <Badge variant="forest">Organic Certified</Badge>}
            </div>
          </div>

          <div className="p-3 bg-warm-50 rounded-xl border border-warm-200/80 space-y-1.5 text-xs text-warm-700">
            <div className="flex items-center gap-1.5 font-semibold text-warm-900">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Sourced From: {product.origin}</span>
            </div>
            <p className="text-[11px] text-warm-500 leading-relaxed">
              Direct farm gate aggregation to preserve natural aroma, unpolished nutrition, and farm-fresh freshness.
            </p>
          </div>
        </div>

        {/* Right: Specs, Pricing & Wholesale Tiers */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-warm-500">
              <span className="font-bold uppercase tracking-wider text-warm-600">{product.brand}</span>
              {product.reviewCount && product.reviewCount > 0 ? (
                <div className="flex items-center gap-1 font-semibold text-warm-800">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{product.rating}</span>
                  <span className="text-warm-400">({product.reviewCount} reviews)</span>
                </div>
              ) : (
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified Lot
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-lg font-bold text-warm-900 leading-snug">
              {product.name}
            </h2>

            {product.hindiName && (
              <p className="text-xs text-warm-500 font-medium">{product.hindiName}</p>
            )}

            <p className="text-xs text-warm-600 leading-relaxed pt-1">
              {product.description}
            </p>

            {/* Nutrition breakdown pill if available */}
            {product.nutrition && (
              <div className="pt-2 grid grid-cols-4 gap-1.5 text-center bg-warm-50 p-2 rounded-xl border border-warm-200/80 text-[11px]">
                <div>
                  <div className="text-warm-400">Energy</div>
                  <div className="font-bold text-warm-800">{product.nutrition.energy}</div>
                </div>
                <div>
                  <div className="text-warm-400">Protein</div>
                  <div className="font-bold text-warm-800">{product.nutrition.protein}</div>
                </div>
                <div>
                  <div className="text-warm-400">Carbs</div>
                  <div className="font-bold text-warm-800">{product.nutrition.carbs}</div>
                </div>
                <div>
                  <div className="text-warm-400">Fat</div>
                  <div className="font-bold text-warm-800">{product.nutrition.fat}</div>
                </div>
              </div>
            )}

            {/* Wholesale Tiers Table if available */}
            {product.bulkTiers && product.bulkTiers.length > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-indigo-600" />
                    Wholesale BulkBuy Tiers
                  </span>
                  <span className="text-[11px] text-indigo-700 font-medium">
                    MOQ: {minWholesale} units
                  </span>
                </div>

                <div className="grid gap-1.5">
                  {product.bulkTiers.map(tier => {
                    const isTierActive = selectedQty >= tier.minQty;
                    return (
                      <div
                        key={tier.minQty}
                        onClick={() => {
                          setPurchaseMode('wholesale');
                          setSelectedQty(tier.minQty);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          isTierActive && purchaseMode === 'wholesale'
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-warm-800 border-blue-200 hover:border-indigo-400'
                        }`}
                      >
                        <span className="font-medium text-[11px]">{tier.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono">₹{tier.pricePerUnit}/unit</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                              isTierActive && purchaseMode === 'wholesale'
                                ? 'bg-indigo-500 text-white'
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

          {/* Stepper & Add To Cart Bar */}
          <div className="pt-3 border-t border-warm-200 space-y-3">
            {/* Purchase Mode Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-warm-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPurchaseMode('retail')}
                className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  purchaseMode === 'retail'
                    ? 'bg-white text-forest-900 shadow-sm'
                    : 'text-warm-600 hover:text-warm-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-forest-600" />
                <span>Retail (1x - 4x)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPurchaseMode('wholesale');
                  if (selectedQty < minWholesale) setSelectedQty(minWholesale);
                }}
                className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  purchaseMode === 'wholesale'
                    ? 'bg-indigo-900 text-white shadow-sm'
                    : 'text-warm-600 hover:text-warm-900'
                }`}
              >
                <Boxes className="w-3.5 h-3.5 text-amber-300" />
                <span>BulkBuy Tier</span>
              </button>
            </div>

            {/* Quantity Stepper & Total */}
            <div className="flex items-center justify-between">
              <div className="flex items-center border border-warm-300 rounded-xl bg-warm-50 p-1">
                <button
                  type="button"
                  onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                  aria-label="Decrease quantity"
                  className="p-1.5 hover:bg-white rounded-lg text-warm-700 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-sm font-bold font-mono text-warm-900">
                  {selectedQty}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedQty(selectedQty + 1)}
                  aria-label="Increase quantity"
                  className="p-1.5 hover:bg-white rounded-lg text-warm-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-forest-950 font-mono">
                  ₹{totalPrice}
                </div>
                {savings > 0 && (
                  <div className="text-[11px] font-bold text-emerald-700">
                    Total Savings: ₹{savings}
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-soft"
              onClick={handleAdd}
              icon={<ShoppingBag className="w-4 h-4" />}
            >
              Add {selectedQty} to Basket • ₹{totalPrice}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
