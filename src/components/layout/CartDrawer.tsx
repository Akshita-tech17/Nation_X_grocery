import React from 'react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Plus, Minus, Store, AlertTriangle } from 'lucide-react';
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
  const deliveryFee = subtotal >= freeDeliveryThreshold || subtotal === 0 ? 0 : 39;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-card shadow-soft-lg flex flex-col border-l border-border">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-card">
                <ShoppingBag className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-foreground text-base">Your Basket</h2>
                <p className="text-xs text-muted-foreground">
                  Delivering to {currentLocation.area} ({currentLocation.eta})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors p-1 cursor-pointer"
                  title="Clear basket"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Delivery Progress Bar */}
          {cart.length > 0 && (
            <div className="px-4 py-2.5 bg-brand-soft border-b border-primary/20">
              <div className="flex items-center justify-between text-xs mb-1.5">
                {amountNeededForFreeDelivery > 0 ? (
                  <span className="text-foreground font-medium">
                    Add <strong className="font-bold">₹{amountNeededForFreeDelivery}</strong> more for{' '}
                    <span className="text-primary font-semibold">FREE Delivery</span>
                  </span>
                ) : (
                  <span className="text-primary font-bold flex items-center gap-1">
                    🎉 Yay! You unlocked FREE Delivery
                  </span>
                )}
                <span className="text-[11px] font-bold text-primary">{progressPercent}%</span>
              </div>
              <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Multi-Shop Notice */}
          {merchantGroups.length > 1 && (
            <div className="mx-4 mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-800 shrink-0" />
              <span>
                <strong>Multi-Shop Order:</strong> Items from {merchantGroups.length} local shops will be fulfilled as separate coordinated suborders.
              </span>
            </div>
          )}

          {/* Cart Items List Grouped by Merchant */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">Your basket is empty</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
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
                <div key={group.merchantId} className="space-y-3">
                  {/* Merchant Shop Header */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-border">
                    <div className="flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-primary" />
                      <span className="font-bold text-xs text-foreground">{group.merchantName}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      Subtotal: <strong className="font-mono text-foreground font-bold">₹{group.subtotal}</strong>
                    </span>
                  </div>

                  {/* Items from this shop */}
                  <div className="space-y-3">
                    {group.items.map(item => (
                      <div
                        key={item.offeringId}
                        className="p-3 bg-muted/40 rounded-xl border border-border flex flex-col gap-2"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-14 h-14 rounded-lg object-cover bg-card border border-border shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <div>
                                <h4 className="font-semibold text-xs text-foreground line-clamp-1">
                                  {item.product.name}
                                </h4>
                                <span className="text-[11px] text-muted-foreground">
                                  {item.product.packSize || item.product.unit} • {item.mode === 'wholesale' ? 'Wholesale Tier' : 'Retail'}
                                </span>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.offeringId)}
                                className="text-muted-foreground hover:text-destructive p-0.5 cursor-pointer"
                                title="Remove item"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Stock and Freshness Status Badges */}
                            <div className="flex items-center gap-1.5 mt-1">
                              {item.availabilityStatus === 'low_stock' && (
                                <Badge variant="amber" size="sm">Low Stock</Badge>
                              )}
                              {item.availabilityStatus === 'unconfirmed' && (
                                <Badge variant="stone" size="sm">Call to confirm</Badge>
                              )}
                              {item.isStaleInventory && (
                                <span className="text-[10px] text-amber-800 flex items-center gap-0.5">
                                  <AlertTriangle className="w-3 h-3 text-amber-700" /> Stock unconfirmed (3d+)
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-2.5">
                              <div className="text-xs">
                                <span className="font-bold text-foreground">
                                  ₹{item.unitPrice}
                                </span>{' '}
                                <span className="text-[11px] text-muted-foreground">/unit</span>
                                {item.mrp > item.unitPrice && (
                                  <span className="text-[11px] line-through text-muted-foreground ml-1.5">
                                    ₹{item.mrp}
                                  </span>
                                )}
                              </div>

                              {/* Stepper */}
                              <div className="flex items-center border border-border bg-card rounded-lg shadow-card">
                                <button
                                  onClick={() => updateQuantity(item.offeringId, item.quantity - 1)}
                                  className="p-1 hover:bg-muted text-foreground rounded-l-lg transition-colors cursor-pointer"
                                  title="Decrease quantity"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="px-2.5 py-0.5 text-xs font-bold text-foreground font-mono">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.offeringId, item.quantity + 1)}
                                  className="p-1 hover:bg-muted text-foreground rounded-r-lg transition-colors cursor-pointer"
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
            <div className="p-4 border-t border-border bg-card space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Items MRP Total</span>
                  <span className="font-medium text-foreground">₹{originalTotal}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-primary font-medium">
                    <span>Wholesale & Store Savings</span>
                    <span>-₹{totalSavings}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Partner Fee ({merchantGroups.length} Shop{merchantGroups.length > 1 ? 's' : ''})</span>
                  <span>{deliveryFee === 0 ? <strong className="text-primary">FREE</strong> : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-foreground pt-1.5 border-t border-border">
                  <span>To Pay ({cart.length} items)</span>
                  <span className="text-primary text-base">₹{subtotal + deliveryFee}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-card"
                onClick={() => {
                  setIsCartOpen(false);
                  setCheckoutModalOpen(true);
                }}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Proceed to Checkout • ₹{subtotal + deliveryFee}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Verified Local FMCG • Distinct Merchant Auditability</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
