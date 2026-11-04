import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { getEffectiveTierAndPrice, calculateCartTotals } from '../utils/pricing';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, mode?: 'retail' | 'wholesale') => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  originalTotal: number;
  totalSavings: number;
  checkoutModalOpen: boolean;
  setCheckoutModalOpen: (open: boolean) => void;
  quickToast: string | null;
  showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('nationx_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [quickToast, setQuickToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('nationx_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  const showToast = (msg: string) => {
    setQuickToast(msg);
    setTimeout(() => {
      setQuickToast(prev => (prev === msg ? null : prev));
    }, 2800);
  };

  const addToCart = (product: Product, quantity = 1, mode: 'retail' | 'wholesale' = 'retail') => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      
      const newQty = existingIndex > -1 ? prev[existingIndex].quantity + quantity : quantity;
      const { unitPrice, tier, effectiveMode } = getEffectiveTierAndPrice(product, newQty, mode);

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          unitPrice,
          appliedTier: tier,
          totalPrice: unitPrice * newQty,
          mode: effectiveMode
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            quantity: newQty,
            mode: effectiveMode,
            appliedTier: tier,
            unitPrice,
            totalPrice: unitPrice * newQty
          }
        ];
      }
    });

    const isBulkUnlocked = product.bulkTiers && product.bulkTiers.some(t => quantity >= t.minQty);
    showToast(
      isBulkUnlocked
        ? `🎉 Added ${quantity}x ${product.name.slice(0, 20)}... with wholesale discount!`
        : `Added ${quantity}x ${product.name.slice(0, 24)}... to basket`
    );
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const { unitPrice, tier, effectiveMode } = getEffectiveTierAndPrice(item.product, quantity, item.mode);
          return {
            ...item,
            quantity,
            unitPrice,
            appliedTier: tier,
            totalPrice: unitPrice * quantity,
            mode: effectiveMode
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const { totalItems, subtotal, originalTotal, totalSavings } = calculateCartTotals(cart);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        originalTotal,
        totalSavings,
        checkoutModalOpen,
        setCheckoutModalOpen,
        quickToast,
        showToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

