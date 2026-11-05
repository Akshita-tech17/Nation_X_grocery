import React, { createContext, useContext, useState } from 'react';
import { Product, Order, Store, QuotationRequest } from '../types';
import { PRODUCTS } from '../data/products';
import { MERCHANTS } from '../data/merchants';
import { INITIAL_ORDERS } from '../data/mockOrders';

const INITIAL_RFQS: QuotationRequest[] = [
  {
    id: 'RFQ-84920',
    date: 'Today, 07:15 AM',
    businessName: 'Annapurna Catering & Banquet Pvt Ltd',
    contactPerson: 'Vikram Joshi',
    phone: '+91 99002 88471',
    gstNumber: '29AABCA9012F1Z4',
    deliveryCity: 'Bengaluru (Peenya Industrial Area)',
    frequency: 'weekly',
    items: [
      { commodity: 'Aashirvaad MP Sharbati Atta', quantity: '30', unit: '5kg bags', targetPrice: 280 },
      { commodity: 'BPT 5204 Andhra Sona Masoori Rice', quantity: '10', unit: '25kg sacks', targetPrice: 1350 },
      { commodity: 'Dhampur Refined Sugar', quantity: '5', unit: '50kg gunny sacks', targetPrice: 2000 }
    ],
    status: 'quoted',
    quotedPrice: 31800,
    validUntil: 'Valid for 48 hours',
    mandiNotes: 'Direct Yeshwanthpur APMC Mandi discount of 21.5% applied. Free tailgate mini-truck freight included.'
  },
  {
    id: 'RFQ-84105',
    date: 'Yesterday, 03:30 PM',
    businessName: 'Udupi Krishna Grand Restaurant',
    contactPerson: 'Prabhakar Rao',
    phone: '+91 98451 22910',
    gstNumber: '29AADCK4481E1Z8',
    deliveryCity: 'Bengaluru (Indiranagar)',
    frequency: 'monthly',
    items: [
      { commodity: 'Pure Desi Gir Cow Vedic Bilona Ghee', quantity: '20', unit: '1L jars', targetPrice: 1100 },
      { commodity: 'Tata Sampann Unpolished Toor Dal', quantity: '60', unit: '1kg packs', targetPrice: 135 }
    ],
    status: 'under_review',
    mandiNotes: 'Mandi pricing desk is reviewing batch lot availability at APMC depot.'
  }
];

interface MerchantContextType {
  products: Product[];
  orders: Order[];
  merchants: Store[];
  quotations: QuotationRequest[];
  activeMerchantId: string;
  setActiveMerchantId: (id: string) => void;
  toggleStockStatus: (productId: string) => void;
  updateProductStock: (productId: string, quantity: number) => void;
  updateProductPrice: (productId: string, retailPrice: number) => void;
  addProduct: (product: Product) => void;
  editProduct: (productId: string, updated: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  advanceOrderStatus: (orderId: string, suborderId?: string) => void;
  addNewOrder: (order: Order) => void;
  addQuotationRequest: (rfq: QuotationRequest) => void;
  submitQuotationResponse: (rfqId: string, quoteAmount: number, notes: string) => void;
  totalRevenue: number;
  activeOrdersCount: number;
  outOfStockCount: number;
}

const MerchantContext = createContext<MerchantContextType | undefined>(undefined);

export const MerchantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [merchants] = useState<Store[]>(MERCHANTS);
  const [quotations, setQuotations] = useState<QuotationRequest[]>(INITIAL_RFQS);
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

  const addProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const editProduct = (productId: string, updated: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, ...updated } : p))
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const advanceOrderStatus = (orderId: string, suborderId?: string) => {
    const statusFlow: Order['status'][] = ['placed', 'confirmed', 'packing', 'ready_for_pickup', 'out_for_delivery', 'delivered'];
    setOrders(prev =>
      prev.map(order => {
        if (order.id === orderId) {
          if (suborderId && order.suborders && order.suborders.length > 0) {
            const updatedSuborders = order.suborders.map(sub => {
              if (sub.id === suborderId) {
                const cIdx = statusFlow.indexOf(sub.status);
                const nIdx = Math.min(statusFlow.length - 1, cIdx + 1);
                return { ...sub, status: statusFlow[nIdx] };
              }
              return sub;
            });
            const lowestIdx = Math.min(
              ...updatedSuborders.map(s => statusFlow.indexOf(s.status))
            );
            return {
              ...order,
              status: statusFlow[lowestIdx],
              suborders: updatedSuborders
            };
          } else {
            const currentIndex = statusFlow.indexOf(order.status);
            const nextIndex = Math.min(statusFlow.length - 1, currentIndex + 1);
            const nextStatus = statusFlow[nextIndex];
            const updatedSuborders = order.suborders?.map(s => ({
              ...s,
              status: nextStatus
            }));
            return {
              ...order,
              status: nextStatus,
              suborders: updatedSuborders || order.suborders
            };
          }
        }
        return order;
      })
    );
  };

  const addNewOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
  };

  const addQuotationRequest = (rfq: QuotationRequest) => {
    setQuotations(prev => [rfq, ...prev]);
  };

  const submitQuotationResponse = (rfqId: string, quoteAmount: number, notes: string) => {
    setQuotations(prev =>
      prev.map(q => {
        if (q.id === rfqId) {
          return {
            ...q,
            status: 'quoted',
            quotedPrice: quoteAmount,
            validUntil: 'Valid for 48 hours',
            mandiNotes: notes || 'Direct mandi trade quotation with freight dispatched.'
          };
        }
        return q;
      })
    );
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
        quotations,
        activeMerchantId,
        setActiveMerchantId,
        toggleStockStatus,
        updateProductStock,
        updateProductPrice,
        addProduct,
        editProduct,
        deleteProduct,
        advanceOrderStatus,
        addNewOrder,
        addQuotationRequest,
        submitQuotationResponse,
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
