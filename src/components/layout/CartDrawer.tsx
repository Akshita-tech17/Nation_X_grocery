import React from 'react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Plus, Minus } from 'lucide-react';
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
    setCheckoutModalOpen
  } = useCart();

  const { currentLocation } = useStore();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 499;
  const deliveryFee = subtotal >= freeDeliveryThreshold || subtotal === 0 ? 0 : 39;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  const retailItems = cart.filter(item => item.mode === 'retail');
  const wholesaleItems = cart.filter(item => item.mode === 'wholesale');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-warm-950/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-white shadow-soft-lg flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-warm-100 flex items-center justify-between bg-warm-50/60 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-forest-900 text-white flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-warm-900 text-base leading-tight">Your Basket</h2>
                <p className="text-xs text-warm-500">
                  Delivering to {currentLocation.area} ({currentLocation.eta})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="min-w-[36px] min-h-[36px] flex items-center justify-center text-xs text-warm-400 hover:text-rose-600 transition-colors rounded-lg"
                  title="Clear basket"
                  aria-label="Clear basket"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                aria-label="Close basket"
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-warm-500 hover:text-warm-800 hover:bg-warm-100 transition-colors"
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

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-warm-100 flex items-center justify-center text-warm-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-warm-800 text-base">Your basket is empty</h3>
                  <p className="text-xs text-warm-500 mt-1 max-w-xs">
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
              <>
                {/* Wholesale Section */}
                {wholesaleItems.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                        <Badge variant="blue" size="sm">B2B Wholesale / BulkBuy</Badge>
                      </span>
                      <span className="text-xs text-warm-400">{wholesaleItems.length} item(s)</span>
                    </div>

                    {wholesaleItems.map(item => (
                      <div
                        key={item.product.id}
                        className="p-3 bg-warm-50/70 border border-warm-200/90 rounded-xl space-y-2 hover:border-warm-300 transition-colors"
                      >
                        <div className="flex gap-3">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-14 h-14 object-cover rounded-lg shrink-0 border border-warm-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-warm-900 truncate">
                              {item.product.name}
                            </h4>
                            <p className="text-[11px] text-warm-500">{item.product.unit} • {item.product.brand}</p>
                            
                            {item.appliedTier && (
                              <div className="mt-1">
                                <Badge variant="blue" size="sm" icon={<Tag className="w-3 h-3" />}>
                                  {item.appliedTier.label}
                                </Badge>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-2">
                              <div className="text-xs">
                                <span className="font-bold text-forest-900">
                                  ₹{item.unitPrice}
                                </span>{' '}
                                <span className="text-[11px] text-warm-400">/unit</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => removeFromCart(item.product.id)}
                                  className="text-warm-400 hover:text-rose-600 p-1 transition-colors"
                                  title="Remove item"
                                  aria-label={`Remove ${item.product.name} from basket`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                {/* Stepper */}
                                <div className="flex items-center border border-warm-200 bg-white rounded-xl shadow-sm overflow-hidden">
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                    aria-label={`Decrease quantity of ${item.product.name}`}
                                    className="min-w-[34px] min-h-[34px] flex items-center justify-center hover:bg-warm-100 text-warm-700 transition-colors"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="px-2.5 py-0.5 text-xs font-bold text-warm-900 font-mono min-w-[1.5rem] text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                    aria-label={`Increase quantity of ${item.product.name}`}
                                    className="min-w-[34px] min-h-[34px] flex items-center justify-center hover:bg-warm-100 text-warm-700 transition-colors"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Retail Section */}
                {retailItems.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-forest-900 flex items-center gap-1.5">
                        <Badge variant="forest" size="sm">Daily Retail Basket</Badge>
                      </span>
                      <span className="text-xs text-warm-400">{retailItems.length} item(s)</span>
                    </div>

                    {retailItems.map(item => (
                      <div
                        key={item.product.id}
                        className="p-3 bg-white border border-warm-200 rounded-xl space-y-2 hover:border-warm-300 transition-colors"
                      >
                        <div className="flex gap-3">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-14 h-14 object-cover rounded-lg shrink-0 border border-warm-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-warm-900 truncate">
                              {item.product.name}
                            </h4>
                            <p className="text-[11px] text-warm-500">{item.product.unit} • {item.product.brand}</p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="text-xs">
                                <span className="font-bold text-warm-900">
                                  ₹{item.unitPrice}
                                </span>{' '}
                                {item.product.originalPrice > item.unitPrice && (
                                  <span className="text-[11px] line-through text-warm-400">
                                    ₹{item.product.originalPrice}
                                  </span>
                                )}
                              </div>

                              {/* Stepper */}
                              <div className="flex items-center border border-warm-200 bg-warm-50 rounded-xl shadow-sm overflow-hidden">
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  aria-label={`Decrease quantity of ${item.product.name}`}
                                  className="min-w-[34px] min-h-[34px] flex items-center justify-center hover:bg-warm-200/70 text-warm-700 transition-colors"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="px-2.5 py-0.5 text-xs font-bold text-warm-900 font-mono min-w-[1.5rem] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  aria-label={`Increase quantity of ${item.product.name}`}
                                  className="min-w-[34px] min-h-[34px] flex items-center justify-center hover:bg-warm-200/70 text-warm-700 transition-colors"
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
                )}
              </>
            )}
          </div>

          {/* Footer & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-warm-200 bg-warm-50/80 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-warm-600">
                  <span>Items MRP Total</span>
                  <span className="font-medium text-warm-800">₹{originalTotal}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Wholesale & Retail Savings</span>
                    <span>-₹{totalSavings}</span>
                  </div>
                )}
                <div className="flex justify-between text-warm-600">
                  <span>Delivery Partner Fee</span>
                  <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-warm-900 pt-1.5 border-t border-warm-200">
                  <span>To Pay</span>
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

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-warm-500">
                <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
                <span>100% Authentic FMCG • GST Invoicing on request</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
