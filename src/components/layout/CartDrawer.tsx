import React from 'react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Plus, Minus, Store, AlertTriangle } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    originalTotal,
    totalSavings,
    setCheckoutModalOpen,
    getCartGroupedByMerchant
  } = useCart();

  const { currentLocation } = useStore();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 499;
  const merchantGroups = getCartGroupedByMerchant();
  // Multi-shop delivery fee: base delivery fee per merchant unless threshold met
  const deliveryFee = subtotal >= freeDeliveryThreshold || subtotal === 0 ? 0 : 39;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-soft-lg flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-forest-900 text-white flex items-center justify-center shadow-sm">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="font-bold text-stone-900 text-base">Your Basket</h2>
                <p className="text-xs text-stone-500">
                  Delivering to {currentLocation.area} ({currentLocation.eta})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-stone-400 hover:text-rose-600 transition-colors p-1"
                  title="Clear basket"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Delivery Progress Bar */}
          {cart.length > 0 && (
            <div className="px-4 py-2.5 bg-forest-50/80 border-b border-forest-100">
              <div className="flex items-center justify-between text-xs mb-1.5">
                {amountNeededForFreeDelivery > 0 ? (
                  <span className="text-forest-900 font-medium">
                    Add <strong className="font-bold">₹{amountNeededForFreeDelivery}</strong> more for{' '}
                    <span className="text-forest-700 font-semibold">FREE Delivery</span>
                  </span>
                ) : (
                  <span className="text-forest-800 font-bold flex items-center gap-1">
                    🎉 Yay! You unlocked FREE Delivery
                  </span>
                )}
                <span className="text-[11px] font-bold text-forest-700">{progressPercent}%</span>
              </div>
              <div className="w-full bg-forest-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-forest-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Multi-Shop Notice */}
          {merchantGroups.length > 1 && (
            <div className="mx-4 mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Multi-Shop Order:</strong> Items from {merchantGroups.length} local shops will be fulfilled as separate coordinated suborders.
              </span>
            </div>
          )}

          {/* Cart Items List Grouped by Merchant */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 text-base">Your basket is empty</h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs">
                    Explore fresh chakki atta, pulses, pure cow ghee and wholesale sacks with direct farmer pricing.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsCartOpen(false)}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Start Shopping
                </Button>
              </div>
            ) : (
              merchantGroups.map(group => (
                <div
                  key={group.merchantId}
                  className="border border-stone-200/90 rounded-2xl overflow-hidden bg-stone-50/40 shadow-xs space-y-2"
                >
                  {/* Merchant Shop Header */}
                  <div className="px-3.5 py-2.5 bg-stone-100/70 border-b border-stone-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-stone-800">
                      <Store className="w-3.5 h-3.5 text-forest-700" />
                      <span>{group.merchantName}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-stone-500">
                      Subtotal: <strong className="text-stone-900">₹{group.subtotal}</strong>
                    </span>
                  </div>

                  {/* Items in this shop */}
                  <div className="p-3 space-y-3">
                    {group.items.map(item => (
                      <div
                        key={item.offeringId}
                        className="p-3 bg-white border border-stone-200/80 rounded-xl space-y-2 hover:border-stone-300 transition-colors"
                      >
                        <div className="flex gap-3">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-14 h-14 object-cover rounded-lg shrink-0 border border-stone-200"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="text-xs font-semibold text-stone-900 truncate">
                                {item.product.name}
                              </h4>
                              <button
                                onClick={() => removeFromCart(item.offeringId)}
                                className="text-stone-400 hover:text-rose-600 p-0.5 transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <p className="text-[11px] text-stone-500">
                              {item.product.unit} • {item.product.brand}
                            </p>

                            {/* Mode & Tier Badge */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              {item.mode === 'wholesale' ? (
                                <Badge variant="blue" size="sm" icon={<Tag className="w-3 h-3" />}>
                                  {item.appliedTier?.label || 'B2B Wholesale'}
                                </Badge>
                              ) : null}

                              {/* Stock Freshness / Availability status */}
                              {item.availabilityStatus === 'low_stock' && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                  Low Stock
                                </span>
                              )}
                              {item.availabilityStatus === 'unconfirmed' && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-stone-100 text-stone-700 border border-stone-300 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  Call to confirm
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-2.5">
                              <div className="text-xs">
                                <span className="font-bold text-forest-900">
                                  ₹{item.unitPrice}
                                </span>{' '}
                                <span className="text-[11px] text-stone-400">/unit</span>
                                {item.mrp > item.unitPrice && (
                                  <span className="text-[11px] line-through text-stone-400 ml-1.5">
                                    ₹{item.mrp}
                                  </span>
                                )}
                              </div>

                              {/* Stepper */}
                              <div className="flex items-center border border-stone-200 bg-stone-50 rounded-lg shadow-2xs">
                                <button
                                  onClick={() => updateQuantity(item.offeringId, item.quantity - 1)}
                                  className="p-1 hover:bg-stone-200 text-stone-700 rounded-l-lg transition-colors"
                                  title="Decrease quantity"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="px-2.5 py-0.5 text-xs font-bold text-stone-900 font-mono">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.offeringId, item.quantity + 1)}
                                  className="p-1 hover:bg-stone-200 text-stone-700 rounded-r-lg transition-colors"
                                  title="Increase quantity"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-stone-200 bg-stone-50/90 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Items MRP Total</span>
                  <span className="font-medium text-stone-800">₹{originalTotal}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Wholesale & Store Savings</span>
                    <span>-₹{totalSavings}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Delivery Partner Fee ({merchantGroups.length} Shop{merchantGroups.length > 1 ? 's' : ''})</span>
                  <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-1.5 border-t border-stone-200">
                  <span>To Pay ({cart.length} items)</span>
                  <span className="text-forest-900 text-base">₹{subtotal + deliveryFee}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-soft"
                onClick={() => {
                  setIsCartOpen(false);
                  setCheckoutModalOpen(true);
                }}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Proceed to Checkout • ₹{subtotal + deliveryFee}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
                <span>Verified Local FMCG • Distinct Merchant Auditability</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
