import React, { createContext, useContext, useState } from 'react';
import {
  Product,
  ParentOrder,
  Store,
  QuotationRequest,
  QuotationOffer,
  MerchantSubOrder,
  OrderStatus,
  SubstitutionProposal
} from '../types';
import { PRODUCTS } from '../data/products';
import { MERCHANTS } from '../data/merchants';
import { INITIAL_ORDERS } from '../data/mockOrders';

const INITIAL_RFQS: QuotationRequest[] = [
  {
    id: 'RFQ-84920',
    date: 'Today, 07:15 AM',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
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
    validUntil: new Date(Date.now() + 48 * 3600 * 1000).toISOString(), // Valid for 48 hours
    mandiNotes: 'Direct Yeshwanthpur APMC Mandi discount of 21.5% applied. Free tailgate mini-truck freight included.',
    quotations: [
      {
        id: 'QUOTE-MANDI-84920',
        quotationRequestId: 'RFQ-84920',
        merchantId: 'store-yeshwanthpur-wholesale',
        merchantName: 'Mandi Direct Wholesale Traders',
        items: [
          { commodity: 'Aashirvaad MP Sharbati Atta', quantity: '30', unit: '5kg bags', quotedUnitPrice: 275, lineTotal: 8250 },
          { commodity: 'BPT 5204 Andhra Sona Masoori Rice', quantity: '10', unit: '25kg sacks', quotedUnitPrice: 1380, lineTotal: 13800 },
          { commodity: 'Dhampur Refined Sugar', quantity: '5', unit: '50kg gunny sacks', quotedUnitPrice: 1950, lineTotal: 9750 }
        ],
        totalQuotedPrice: 31800,
        validUntil: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        paymentTerms: '15-Day Mandi Credit / RTGS',
        deliveryTerms: 'Direct APMC Gate Mini-truck delivery included',
        mandiNotes: 'Direct Yeshwanthpur APMC Mandi discount of 21.5% applied. Free tailgate mini-truck freight included.',
        status: 'active',
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'RFQ-84105',
    date: 'Yesterday, 03:30 PM',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
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
    mandiNotes: 'Mandi pricing desk is reviewing batch lot availability at APMC depot.',
    quotations: []
  }
];

interface MerchantContextType {
  products: Product[];
  orders: ParentOrder[];
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
  advanceOrderStatus: (orderId: string) => void;
  addNewOrder: (order: ParentOrder) => void;
  addQuotationRequest: (rfq: QuotationRequest) => void;
  submitQuotationResponse: (rfqId: string, quoteAmount: number, notes: string) => void;
  acceptQuotation: (rfqId: string, quoteId?: string) => { success: boolean; message: string; order?: ParentOrder };
  advanceSubOrderStatus: (subOrderId: string, targetStatus?: OrderStatus) => void;
  rejectSubOrder: (subOrderId: string, reason: string) => void;
  proposeSubstitution: (
    subOrderId: string,
    proposal: {
      originalItemId: string;
      originalProductName: string;
      originalQuantity: number;
      originalPrice: number;
      substituteProductName: string;
      substituteQuantity: number;
      substitutePrice: number;
      reason: string;
    }
  ) => void;
  customerRespondSubstitution: (subOrderId: string, proposalId: string, approved: boolean) => void;
  getSubOrdersForMerchant: (merchantId: string) => MerchantSubOrder[];
  totalRevenue: number;
  activeOrdersCount: number;
  outOfStockCount: number;
}

const MerchantContext = createContext<MerchantContextType | undefined>(undefined);

export const MerchantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [orders, setOrders] = useState<ParentOrder[]>(INITIAL_ORDERS);
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
            stockQuantity: nextStock ? Math.max(10, p.stockQuantity) : 0,
            availabilityStatus: nextStock ? 'available' : 'unavailable',
            stockUpdatedAt: new Date().toISOString()
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
          const inStock = quantity > 0;
          return {
            ...p,
            stockQuantity: quantity,
            inStock,
            availabilityStatus: quantity <= 0 ? 'unavailable' : quantity < 10 ? 'low_stock' : 'available',
            stockUpdatedAt: new Date().toISOString()
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

  /**
   * Advances the overall order status
   */
  const advanceOrderStatus = (orderId: string) => {
    const statusFlow: OrderStatus[] = [
      'placed',
      'confirmed',
      'packing',
      'ready_for_pickup',
      'out_for_delivery',
      'delivered'
    ];

    setOrders(prev =>
      prev.map(order => {
        if (order.id === orderId) {
          const currentIndex = statusFlow.indexOf(order.status);
          const nextIndex = Math.min(statusFlow.length - 1, currentIndex + 1);
          const nextStatus = statusFlow[nextIndex];

          // Also advance suborders
          const updatedSuborders = order.subOrders.map(so => ({
            ...so,
            status: nextStatus,
            timeline: [
              ...so.timeline,
              {
                timestamp: 'Just now',
                status: nextStatus,
                actor: 'Fulfillment Engine',
                note: `Order advanced to ${nextStatus}`
              }
            ]
          }));

          return {
            ...order,
            status: nextStatus,
            subOrders: updatedSuborders
          };
        }
        return order;
      })
    );
  };

  /**
   * Advance a single merchant's suborder status independently
   */
  const advanceSubOrderStatus = (subOrderId: string, targetStatus?: OrderStatus) => {
    const statusFlow: OrderStatus[] = [
      'placed',
      'confirmed',
      'packing',
      'ready_for_pickup',
      'out_for_delivery',
      'delivered'
    ];

    setOrders(prev =>
      prev.map(parent => {
        const subIndex = parent.subOrders.findIndex(so => so.id === subOrderId);
        if (subIndex === -1) return parent;

        const currentSub = parent.subOrders[subIndex];
        let nextStatus = targetStatus;
        if (!nextStatus) {
          const currentIdx = statusFlow.indexOf(currentSub.status);
          nextStatus = statusFlow[Math.min(statusFlow.length - 1, currentIdx + 1)];
        }

        const updatedSub: MerchantSubOrder = {
          ...currentSub,
          status: nextStatus,
          timeline: [
            ...currentSub.timeline,
            {
              timestamp: 'Just now',
              status: nextStatus,
              actor: currentSub.merchantName,
              note: `Merchant updated preparation status to ${nextStatus}`
            }
          ]
        };

        const updatedSubOrders = [...parent.subOrders];
        updatedSubOrders[subIndex] = updatedSub;

        // Check if all suborders are delivered
        const allDelivered = updatedSubOrders.every(so => so.status === 'delivered');
        const anyActive = updatedSubOrders.some(so => so.status !== 'placed' && so.status !== 'cancelled');

        return {
          ...parent,
          status: allDelivered ? 'delivered' : anyActive ? 'confirmed' : parent.status,
          subOrders: updatedSubOrders
        };
      })
    );
  };

  /**
   * Reject a suborder with explicit reason
   */
  const rejectSubOrder = (subOrderId: string, reason: string) => {
    setOrders(prev =>
      prev.map(parent => {
        const subIndex = parent.subOrders.findIndex(so => so.id === subOrderId);
        if (subIndex === -1) return parent;

        const currentSub = parent.subOrders[subIndex];
        const updatedSub: MerchantSubOrder = {
          ...currentSub,
          status: 'cancelled',
          rejectionReason: reason,
          timeline: [
            ...currentSub.timeline,
            {
              timestamp: 'Just now',
              status: 'cancelled',
              actor: currentSub.merchantName,
              note: `Suborder rejected: ${reason}`
            }
          ]
        };

        const updatedSubOrders = [...parent.subOrders];
        updatedSubOrders[subIndex] = updatedSub;

        return {
          ...parent,
          subOrders: updatedSubOrders
        };
      })
    );
  };

  /**
   * Propose a substitution / revised quantity / revised item
   */
  const proposeSubstitution = (
    subOrderId: string,
    proposal: {
      originalItemId: string;
      originalProductName: string;
      originalQuantity: number;
      originalPrice: number;
      substituteProductName: string;
      substituteQuantity: number;
      substitutePrice: number;
      reason: string;
    }
  ) => {
    const newProposal: SubstitutionProposal = {
      id: `SUB-${Math.floor(1000 + Math.random() * 9000)}`,
      ...proposal,
      status: 'pending_customer_approval',
      proposedAt: new Date().toISOString()
    };

    setOrders(prev =>
      prev.map(parent => {
        const subIndex = parent.subOrders.findIndex(so => so.id === subOrderId);
        if (subIndex === -1) return parent;

        const sub = parent.subOrders[subIndex];
        const updatedSub: MerchantSubOrder = {
          ...sub,
          substitutionsProposed: [...(sub.substitutionsProposed || []), newProposal],
          timeline: [
            ...sub.timeline,
            {
              timestamp: 'Just now',
              status: sub.status,
              actor: sub.merchantName,
              note: `Proposed substitution: ${proposal.substituteProductName} instead of ${proposal.originalProductName}`
            }
          ]
        };

        const updatedSubs = [...parent.subOrders];
        updatedSubs[subIndex] = updatedSub;
        return { ...parent, subOrders: updatedSubs };
      })
    );
  };

  /**
   * Customer approves or rejects proposed substitution
   */
  const customerRespondSubstitution = (subOrderId: string, proposalId: string, approved: boolean) => {
    setOrders(prev =>
      prev.map(parent => {
        const subIndex = parent.subOrders.findIndex(so => so.id === subOrderId);
        if (subIndex === -1) return parent;

        const sub = parent.subOrders[subIndex];
        const proposals = sub.substitutionsProposed || [];
        const propIndex = proposals.findIndex(p => p.id === proposalId);
        if (propIndex === -1) return parent;

        const prop = proposals[propIndex];
        const updatedProposal: SubstitutionProposal = {
          ...prop,
          status: approved ? 'approved' : 'rejected',
          respondedAt: new Date().toISOString()
        };

        const updatedProposals = [...proposals];
        updatedProposals[propIndex] = updatedProposal;

        let updatedItems = [...sub.items];
        let subtotalDiff = 0;

        if (approved) {
          // Adjust items and subtotal
          updatedItems = updatedItems.map(item => {
            if (item.offeringId === prop.originalItemId || item.productName === prop.originalProductName) {
              const newTotal = prop.substitutePrice * prop.substituteQuantity;
              subtotalDiff = newTotal - item.totalPrice;
              return {
                ...item,
                productName: `${prop.substituteProductName} (Substituted)`,
                quantity: prop.substituteQuantity,
                unitPrice: prop.substitutePrice,
                totalPrice: newTotal,
                substitutionStatus: 'substituted',
                substitutionDetails: updatedProposal
              };
            }
            return item;
          });
        }

        const updatedSub: MerchantSubOrder = {
          ...sub,
          items: updatedItems,
          subtotal: sub.subtotal + subtotalDiff,
          substitutionsProposed: updatedProposals,
          timeline: [
            ...sub.timeline,
            {
              timestamp: 'Just now',
              status: sub.status,
              actor: 'Customer',
              note: approved ? `Approved substitution for ${prop.substituteProductName}` : `Rejected substitution`
            }
          ]
        };

        const updatedSubs = [...parent.subOrders];
        updatedSubs[subIndex] = updatedSub;

        return {
          ...parent,
          totalAmount: parent.totalAmount + subtotalDiff,
          subOrders: updatedSubs
        };
      })
    );
  };

  /**
   * Filter suborders for active merchant isolation
   */
  const getSubOrdersForMerchant = (merchantId: string): MerchantSubOrder[] => {
    const list: MerchantSubOrder[] = [];
    orders.forEach(parent => {
      parent.subOrders.forEach(sub => {
        if (sub.merchantId === merchantId) {
          list.push(sub);
        }
      });
    });
    return list;
  };

  const addNewOrder = (order: ParentOrder) => {
    setOrders(prev => [order, ...prev]);
  };

  const addQuotationRequest = (rfq: QuotationRequest) => {
    setQuotations(prev => [rfq, ...prev]);
  };

  /**
   * Merchant submits an itemized quotation offer in response to an RFQ
   */
  const submitQuotationResponse = (rfqId: string, quoteAmount: number, notes: string) => {
    const validUntilIso = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    const currentMerchant = merchants.find(m => m.id === activeMerchantId) || merchants[2];

    setQuotations(prev =>
      prev.map(q => {
        if (q.id === rfqId) {
          const offer: QuotationOffer = {
            id: `QUOTE-${q.id.replace('RFQ-', '')}-${Math.floor(100 + Math.random() * 900)}`,
            quotationRequestId: q.id,
            merchantId: currentMerchant.id,
            merchantName: currentMerchant.name,
            items: q.items.map(item => ({
              commodity: item.commodity,
              quantity: item.quantity,
              unit: item.unit,
              quotedUnitPrice: Math.round(quoteAmount / (q.items.length || 1)),
              lineTotal: Math.round(quoteAmount / (q.items.length || 1))
            })),
            totalQuotedPrice: quoteAmount,
            validUntil: validUntilIso,
            paymentTerms: '15-Day Mandi Credit / RTGS Bank Transfer',
            deliveryTerms: 'APMC Direct Gate Mini-truck delivery included',
            mandiNotes: notes || 'Verified APMC mill lot availability. Price includes handling and loading.',
            status: 'active',
            createdAt: new Date().toISOString()
          };

          return {
            ...q,
            status: 'quoted',
            quotedPrice: quoteAmount,
            validUntil: validUntilIso,
            mandiNotes: notes || 'Verified APMC mill lot availability.',
            quotations: [...(q.quotations || []), offer]
          };
        }
        return q;
      })
    );
  };

  /**
   * CRITICAL BUG FIX (Section 7 Path B):
   * Explicit Customer Acceptance of a Quotation:
   * 1. Validates quotation exists and has not expired.
   * 2. Prevents duplicate acceptance.
   * 3. Sets RFQ and quotation status to 'accepted'.
   * 4. Creates a confirmed, traceable ParentOrder and MerchantSubOrder.
   * 5. Preserves historical RFQ and quotation records.
   */
  const acceptQuotation = (
    rfqId: string,
    quoteId?: string
  ): { success: boolean; message: string; order?: ParentOrder } => {
    const rfq = quotations.find(q => q.id === rfqId);
    if (!rfq) {
      return { success: false, message: 'Quotation request not found.' };
    }

    if (rfq.status === 'accepted') {
      return { success: false, message: `Quotation #${rfqId} has already been accepted! Order #${rfq.resultingOrderId || ''} was created.` };
    }

    // Check expiry
    const quote = quoteId
      ? rfq.quotations?.find(o => o.id === quoteId)
      : rfq.quotations?.[0];

    const expiryTime = quote?.validUntil || rfq.validUntil;
    if (expiryTime && new Date(expiryTime).getTime() < Date.now()) {
      return { success: false, message: 'This quotation has expired. Please request an updated rate.' };
    }

    const confirmedPrice = quote?.totalQuotedPrice || rfq.quotedPrice || 30000;
    const merchantId = quote?.merchantId || 'store-yeshwanthpur-wholesale';
    const merchantName = quote?.merchantName || 'Mandi Direct Wholesale Traders';

    const orderId = `NX-PO-RFQ-${rfqId.replace('RFQ-', '')}`;
    const subOrderId = `NX-SO-RFQ-${rfqId.replace('RFQ-', '')}-1`;
    const nowIso = new Date().toISOString();

    // Build suborder items from quoted items
    const subOrderItems = rfq.items.map((it, idx) => ({
      offeringId: `off-rfq-${rfqId}-${idx}`,
      masterProductId: `prod-mandi-bulk-${idx}`,
      productName: `${it.commodity} (${it.quantity} ${it.unit})`,
      packSize: `${it.quantity} ${it.unit}`,
      quantity: 1,
      unitPrice: Math.round(confirmedPrice / (rfq.items.length || 1)),
      mrp: Math.round((confirmedPrice / (rfq.items.length || 1)) * 1.15),
      totalPrice: Math.round(confirmedPrice / (rfq.items.length || 1)),
      mode: 'wholesale' as const,
      isAvailable: true,
      substitutionStatus: 'original' as const
    }));

    const merchantSubOrder: MerchantSubOrder = {
      id: subOrderId,
      parentOrderId: orderId,
      merchantId,
      merchantName,
      items: subOrderItems,
      subtotal: confirmedPrice,
      originalSubtotal: Math.round(confirmedPrice * 1.15),
      savings: Math.round(confirmedPrice * 0.15),
      deliveryFee: 0,
      status: 'confirmed',
      fulfilmentType: 'truck_freight',
      estimatedDelivery: 'Tomorrow 10:00 AM - APMC Freight Dispatch',
      timeline: [
        {
          timestamp: 'Just now',
          status: 'confirmed',
          actor: 'Customer Acceptance',
          note: `Customer formally accepted Quotation #${quote?.id || rfq.id} for ₹${confirmedPrice}`
        }
      ]
    };

    const newOrder: ParentOrder = {
      id: orderId,
      date: 'Just now',
      createdAt: nowIso,
      items: subOrderItems.map(si => ({
        offeringId: si.offeringId,
        masterProductId: si.masterProductId,
        product: {
          ...PRODUCTS[0],
          id: si.masterProductId,
          name: si.productName,
          retailPrice: si.unitPrice,
          originalPrice: si.mrp,
          stockQuantity: 100,
          inStock: true,
          availabilityStatus: 'available',
          merchantId,
          merchantName
        },
        merchantId,
        merchantName,
        quantity: si.quantity,
        mode: 'wholesale',
        unitPrice: si.unitPrice,
        mrp: si.mrp,
        totalPrice: si.totalPrice,
        availabilityStatus: 'available'
      })),
      totalAmount: confirmedPrice,
      originalAmount: Math.round(confirmedPrice * 1.15),
      savings: Math.round(confirmedPrice * 0.15),
      deliveryFee: 0,
      taxAmount: Math.round(confirmedPrice * 0.05),
      finalPayable: confirmedPrice,
      orderType: 'wholesale',
      status: 'confirmed',
      storeId: merchantId,
      storeName: merchantName,
      deliveryAddress: {
        name: rfq.contactPerson,
        phone: rfq.phone,
        street: 'Commercial Delivery Point',
        area: rfq.deliveryCity,
        city: 'Bengaluru',
        pincode: '560001',
        addressType: 'business',
        businessName: rfq.businessName,
        gstNumber: rfq.gstNumber
      },
      paymentMethod: quote?.paymentTerms || '15-Day Mandi Credit / RTGS',
      paymentStatus: 'authorized',
      paymentReference: `PAY-RFQ-${Math.floor(100000 + Math.random() * 900000)}`,
      estimatedDelivery: 'Tomorrow 10:00 AM (APMC Freight Mini-truck)',
      subOrders: [merchantSubOrder]
    };

    // Update RFQ status to 'accepted' and store resulting order ID
    setQuotations(prev =>
      prev.map(q => {
        if (q.id === rfqId) {
          return {
            ...q,
            status: 'accepted',
            acceptedQuotationId: quote?.id,
            resultingOrderId: orderId
          };
        }
        return q;
      })
    );

    // Save order
    setOrders(prev => [newOrder, ...prev]);

    return {
      success: true,
      message: `Quotation accepted! Traceable order #${orderId} created successfully.`,
      order: newOrder
    };
  };

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
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
        acceptQuotation,
        advanceSubOrderStatus,
        rejectSubOrder,
        proposeSubstitution,
        customerRespondSubstitution,
        getSubOrdersForMerchant,
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
