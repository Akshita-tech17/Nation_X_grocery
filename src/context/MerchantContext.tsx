import React, { createContext, useContext, useState } from 'react';
import { Product, Order, Store } from '../types';
import { PRODUCTS } from '../data/products';
import { MERCHANTS } from '../data/merchants';
import { INITIAL_ORDERS } from '../data/mockOrders';

interface MerchantContextType {
  products: Product[];
  orders: Order[];
  merchants: Store[];
  activeMerchantId: string;
  setActiveMerchantId: (id: string) => void;
  toggleStockStatus: (productId: string) => void;
  updateProductStock: (productId: string, quantity: number) => void;
  updateProductPrice: (productId: string, retailPrice: number) => void;
  advanceOrderStatus: (orderId: string) => void;
  addNewOrder: (order: Order) => void;
  totalRevenue: number;
  activeOrdersCount: number;
  outOfStockCount: number;
}

const MerchantContext = createContext<MerchantContextType | undefined>(undefined);

export const MerchantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [merchants] = useState<Store[]>(MERCHANTS);
  const [activeMerchantId, setActiveMerchantId] = useState<string>('store-sharma-kirana');

  const toggleStockStatus = (productId: string) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const nextStock = !p.inStock;
          return {
            ...p,
            inStock: nextStock,
            stockQuantity: nextStock ? Math.max(10, p.stockQuantity) : 0
          };
        }
        return p;
      })
    );
  };

  const updateProductStock = (productId: string, quantity: number) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            stockQuantity: quantity,
            inStock: quantity > 0
          };
        }
        return p;
      })
    );
  };

  const updateProductPrice = (productId: string, retailPrice: number) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, retailPrice } : p))
    );
  };

  const advanceOrderStatus = (orderId: string) => {
    const statusFlow: Order['status'][] = ['placed', 'confirmed', 'packing', 'out_for_delivery', 'delivered'];
    setOrders(prev =>
      prev.map(order => {
        if (order.id === orderId) {
          const currentIndex = statusFlow.indexOf(order.status);
          const nextIndex = Math.min(statusFlow.length - 1, currentIndex + 1);
          return { ...order, status: statusFlow[nextIndex] };
        }
        return order;
      })
    );
  };

  const addNewOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
  };

  const activeOrders = orders.filter(o => o.status !== 'delivered');
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activeOrdersCount = activeOrders.length;
  const outOfStockCount = products.filter(p => !p.inStock || p.stockQuantity <= 0).length;

  return (
    <MerchantContext.Provider
      value={{
        products,
        orders,
        merchants,
        activeMerchantId,
        setActiveMerchantId,
        toggleStockStatus,
        updateProductStock,
        updateProductPrice,
        advanceOrderStatus,
        addNewOrder,
        totalRevenue,
        activeOrdersCount,
        outOfStockCount
      }}
    >
      {children}
    </MerchantContext.Provider>
  );
};

export const useMerchant = () => {
  const context = useContext(MerchantContext);
  if (!context) throw new Error('useMerchant must be used within a MerchantProvider');
  return context;
};

