import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, ShopProductOffering } from '../types';
import { ProductService, StockValidationResult } from '../services/productService';

export interface MerchantCartGroup {
  merchantId: string;
  merchantName: string;
  items: CartItem[];
  subtotal: number;
  originalSubtotal: number;
  savings: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    mode?: 'retail' | 'wholesale',
    specificOffering?: ShopProductOffering
  ) => boolean;
  updateQuantity: (offeringIdOrProductId: string, quantity: number) => void;
  removeFromCart: (offeringIdOrProductId: string) => void;
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
  getCartGroupedByMerchant: () => MerchantCartGroup[];
  revalidateCart: () => { valid: boolean; issues: string[]; details: StockValidationResult[] };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('nationx_cart_v2');
      if (saved) return JSON.parse(saved);
      // Clean migration fallback
      const old = localStorage.getItem('nationx_cart');
      if (old) {
        localStorage.removeItem('nationx_cart');
      }
      return [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [quickToast, setQuickToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('nationx_cart_v2', JSON.stringify(cart));
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

  /**
   * Adds an item to the cart retaining its specific shop offering reference.
   * Multi-shop enabled: Products from different shops coexist with independent shop references.
   */
  const addToCart = (
    product: Product,
    quantity = 1,
    mode: 'retail' | 'wholesale' = 'retail',
    specificOffering?: ShopProductOffering
  ): boolean => {
    // Resolve offering ID
    const offeringId = specificOffering?.id || product.offeringId || `off-default-${product.id}`;
    const merchantId = specificOffering?.merchantId || product.merchantId;
    const merchantName = specificOffering?.merchantName || product.merchantName;

    // Validate stock and freshness
    const stockCheck = ProductService.validateStock(offeringId, quantity);
    if (!stockCheck.isValid && stockCheck.currentStatus === 'unavailable') {
      showToast(`Cannot add: ${product.name} is currently out of stock at ${merchantName}.`);
      return false;
    }

    if (stockCheck.currentStatus === 'unconfirmed') {
      showToast(`Notice: Inventory at ${merchantName} requires shopkeeper stock confirmation.`);
    }

    setCart(prev => {
      // Key item by unique offeringId (supports multi-shop items of same master product)
      const existingIndex = prev.findIndex(item => item.offeringId === offeringId);
      const newQty = existingIndex > -1 ? prev[existingIndex].quantity + quantity : quantity;

      // Calculate authoritative price
      const tempOffering: ShopProductOffering = specificOffering || {
        id: offeringId,
        masterProductId: product.id,
        merchantId,
        merchantName,
        sellingPrice: product.retailPrice,
        mrp: product.originalPrice,
        stockQuantity: product.stockQuantity,
        stockUpdatedAt: product.stockUpdatedAt || new Date().toISOString(),
        availabilityStatus: product.availabilityStatus || 'available',
        wholesaleTiers: product.bulkTiers,
        minWholesaleQty: product.minWholesaleQty,
        fulfilmentOptions: ['standard'],
        visibilityStatus: 'active',
        rating: product.rating,
        reviewCount: product.reviewCount
      };

      const pricing = ProductService.calculatePrice(tempOffering, newQty, mode);

      const updatedItem: CartItem = {
        offeringId,
        masterProductId: product.id,
        product,
        merchantId,
        merchantName,
        quantity: newQty,
        mode,
        appliedTier: pricing.appliedTier,
        unitPrice: pricing.unitPrice,
        mrp: pricing.originalUnitPrice,
        totalPrice: pricing.totalPrice,
        availabilityStatus: stockCheck.currentStatus,
        stockUpdatedAt: stockCheck.lastUpdated
      };

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = updatedItem;
        return next;
      } else {
        return [...prev, updatedItem];
      }
    });

    showToast(`Added ${quantity}x ${product.name.slice(0, 22)}... from ${merchantName}`);
    return true;
  };

  /**
   * Updates item quantity, dynamically recalculating tier slabs or retail pricing.
   */
  const updateQuantity = (offeringIdOrProductId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(offeringIdOrProductId);
      return;
    }

    setCart(prev =>
      prev.map(item => {
        if (item.offeringId === offeringIdOrProductId || item.product.id === offeringIdOrProductId) {
          const offering = ProductService.getOfferingById(item.offeringId) || {
            id: item.offeringId,
            masterProductId: item.masterProductId,
            merchantId: item.merchantId,
            merchantName: item.merchantName,
            sellingPrice: item.product.retailPrice,
            mrp: item.mrp,
            stockQuantity: item.product.stockQuantity,
            stockUpdatedAt: item.stockUpdatedAt || new Date().toISOString(),
            availabilityStatus: item.availabilityStatus,
            wholesaleTiers: item.product.bulkTiers,
            minWholesaleQty: item.product.minWholesaleQty,
            fulfilmentOptions: ['standard'],
            visibilityStatus: 'active',
            rating: item.product.rating,
            reviewCount: item.product.reviewCount
          };

          const pricing = ProductService.calculatePrice(offering, quantity, item.mode);

          return {
            ...item,
            quantity,
            unitPrice: pricing.unitPrice,
            appliedTier: pricing.appliedTier,
            totalPrice: pricing.totalPrice
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (offeringIdOrProductId: string) => {
    setCart(prev =>
      prev.filter(item => item.offeringId !== offeringIdOrProductId && item.product.id !== offeringIdOrProductId)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  /**
   * Groups cart items by merchant to render multi-shop breakdowns and suborders
   */
  const getCartGroupedByMerchant = (): MerchantCartGroup[] => {
    const groups: { [key: string]: MerchantCartGroup } = {};

    cart.forEach(item => {
      if (!groups[item.merchantId]) {
        groups[item.merchantId] = {
          merchantId: item.merchantId,
          merchantName: item.merchantName,
          items: [],
          subtotal: 0,
          originalSubtotal: 0,
          savings: 0
        };
      }
      groups[item.merchantId].items.push(item);
      groups[item.merchantId].subtotal += item.totalPrice;
      groups[item.merchantId].originalSubtotal += item.mrp * item.quantity;
      groups[item.merchantId].savings += Math.max(0, item.mrp * item.quantity - item.totalPrice);
    });

    return Object.values(groups);
  };

  /**
   * Pre-checkout validation of all cart items
   */
  const revalidateCart = () => {
    const issues: string[] = [];
    const details: StockValidationResult[] = [];
    let valid = true;

    cart.forEach(item => {
      const check = ProductService.validateStock(item.offeringId, item.quantity);
      details.push(check);

      if (!check.isValid) {
        valid = false;
        if (check.message) issues.push(check.message);
      } else if (check.currentStatus === 'unconfirmed') {
        issues.push(`Note: ${item.product.name} from ${item.merchantName} requires stock confirmation.`);
      }
    });

    return { valid, issues, details };
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const originalTotal = cart.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const totalSavings = Math.max(0, originalTotal - subtotal);

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
        showToast,
        getCartGroupedByMerchant,
        revalidateCart
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
