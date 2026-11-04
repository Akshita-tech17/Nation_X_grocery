import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QuotationRequest, QuotationItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { useMerchant } from '../../context/MerchantContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  FileText,
  Building,
  Send,
  CheckCircle2,
  Check,
  Plus,
  Trash2,
  TrendingDown,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

export const MerchantQuotationSection: React.FC = () => {
  const { showToast } = useCart();
  const { quotations, addQuotationRequest, acceptQuotation } = useMerchant();

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Bengaluru');
  const [frequency, setFrequency] = useState<'one-time' | 'weekly' | 'bi-weekly' | 'monthly'>('one-time');

  // Multi-item rows in quotation form
  const [items, setItems] = useState<QuotationItem[]>([
    { commodity: 'MP Sharbati Whole Wheat Atta', quantity: '20', unit: '5kg bags', targetPrice: 290 },
    { commodity: 'Commercial Refined Sugar', quantity: '4', unit: '50kg sacks', targetPrice: 2050 }
  ]);

  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [acceptingRfqId, setAcceptingRfqId] = useState<string | null>(null);
  const [currentTime] = useState<number>(() => Date.now());

  const handleAddItemRow = () => {
    setItems(prev => [...prev, { commodity: '', quantity: '10', unit: 'bags / packs', targetPrice: 0 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmitRfq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !phone) {
      alert('Please fill in business name and contact number');
      return;
    }

    const rfqId = `RFQ-${Math.floor(10000 + Math.random() * 90000)}`;
    const newRfq: QuotationRequest = {
      id: rfqId,
      date: 'Just now',
      createdAt: new Date().toISOString(),
      businessName,
      contactPerson,
      phone,
      gstNumber: gstNumber || undefined,
      deliveryCity,
      frequency,
      items: [...items],
      status: 'under_review',
      mandiNotes: 'Received at APMC Mandi Central Desk. Expected quotation within 2 hours.',
      quotations: []
    };

    addQuotationRequest(newRfq);
    showToast(`✅ RFQ #${newRfq.id} submitted to Mandi traders!`);
    setActiveTab('history');

    // Reset form
    setBusinessName('');
    setContactPerson('');
    setPhone('');
    setGstNumber('');
  };

  /**
   * Corrected Acceptance Flow (Prevents duplicate clicks, validates expiry, creates traceable order)
   */
  const handleAcceptQuotation = (rfqId: string) => {
    setAcceptingRfqId(rfqId);

    const result = acceptQuotation(rfqId);
    setAcceptingRfqId(null);

    if (result.success && result.order) {
      showToast(`🎉 Order #${result.order.id} confirmed! Quotation #${rfqId} accepted.`);
    } else {
      showToast(result.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Subheader and Tabs */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-soft text-primary border border-primary/20">
              <FileText className="w-5 h-5" />
            </span>
            <h3 className="font-heading font-bold text-lg text-foreground">
              Path B — Merchant Quotation Requests (RFQ)
            </h3>
            <Badge variant="blue">Institutional & Commercial</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            For custom volume contracts, full truckload procurements, monthly mess menus, or unlisted mandi commodities.
            Request binding prices directly from APMC mandi millers with GST input tax invoices.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-muted rounded-xl text-xs font-semibold shrink-0 border border-border">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-card text-foreground shadow-card'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Create New RFQ
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-primary text-primary-foreground shadow-card'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Active Quotations</span>
            <span className="w-4 h-4 rounded-full bg-marigold text-marigold-foreground text-[10px] font-bold flex items-center justify-center">
              {quotations.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <form onSubmit={handleSubmitRfq} className="bg-card rounded-2xl border border-border shadow-card p-6 sm:p-8 space-y-6">
          {/* Business & Logistics Details */}
          <div>
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2 mb-3">
              <Building className="w-4 h-4 text-primary" />
              1. Business & Invoicing Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">Business / Firm Name *</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g. Sagar Caterers & Banquets"
                  className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Contact Person *</label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={e => setContactPerson(e.target.value)}
                  placeholder="e.g. Anand Hegde"
                  className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Mobile / WhatsApp Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98450 00000"
                  className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">GSTIN (For 5% / 18% Tax Credit)</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={e => setGstNumber(e.target.value)}
                  placeholder="29AAAAA0000A1Z5"
                  className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">Delivery Destination / City *</label>
                <input
                  type="text"
                  required
                  value={deliveryCity}
                  onChange={e => setDeliveryCity(e.target.value)}
                  placeholder="e.g. Khammam, Telangana"
                  className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Procurement Frequency *</label>
                <select
                  value={frequency}
                  onChange={e => setFrequency(e.target.value as any)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="one-time">One-Time Bulk Order</option>
                  <option value="weekly">Weekly Recurring Standing Order</option>
                  <option value="bi-weekly">Bi-Weekly Deliveries</option>
                  <option value="monthly">Monthly Master Restock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Commodity Items Required */}
          <div className="space-y-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm text-foreground">
                2. Requested Commodities & Specifications
              </h4>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Row</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-xl bg-muted/40 border border-border items-center">
                  <div className="sm:col-span-5">
                    <label className="text-[10px] text-muted-foreground block mb-0.5">Commodity / Brand Grade</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sona Masoori Raw Rice 2-year aged"
                      value={item.commodity}
                      onChange={e => handleItemChange(index, 'commodity', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-card border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-muted-foreground block mb-0.5">Quantity</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 50"
                      value={item.quantity}
                      onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-card border border-border rounded-lg text-xs font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-muted-foreground block mb-0.5">Packing Unit</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 25kg bags"
                      value={item.unit}
                      onChange={e => handleItemChange(index, 'unit', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-card border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-muted-foreground block mb-0.5">Target Rate (₹/unit)</label>
                    <input
                      type="number"
                      placeholder="Optional (₹)"
                      value={item.targetPrice || ''}
                      onChange={e => handleItemChange(index, 'targetPrice', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-card border border-border rounded-lg text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(index)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      title="Remove row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground">
              ⚡ Mandi Central Desk automatically broadcasts your RFQ to certified APMC traders in Khammam & Hyderabad.
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              icon={<Send className="w-4 h-4" />}
            >
              Submit Commercial Mandi RFQ
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-bold text-sm text-foreground">
              Your Active Mandi Quotations ({quotations.length})
            </h4>
            <span className="text-xs text-muted-foreground">
              Click "Accept & Order" to lock in the agreed Mandi rate
            </span>
          </div>

          <div className="grid gap-4">
            {quotations.map(rfq => {
              const isQuoted = rfq.status === 'quoted';
              const isAccepted = rfq.status === 'accepted';
              const isExpired = rfq.validUntil && currentTime > 0 && new Date(rfq.validUntil).getTime() < currentTime;

              return (
                <div
                  key={rfq.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isAccepted
                      ? 'bg-brand-soft/50 border-primary/30 shadow-card'
                      : isQuoted
                      ? 'bg-card border-primary/40 shadow-card'
                      : 'bg-card border-border shadow-card'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isAccepted ? 'bg-brand-soft text-primary' : 'bg-muted text-foreground'}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-sm text-foreground">{rfq.id}</span>
                          <span className="text-xs font-semibold text-muted-foreground">• {rfq.businessName}</span>
                          {rfq.status === 'under_review' && <Badge variant="blue">Under Mandi Review</Badge>}
                          {rfq.status === 'quoted' && !isExpired && <Badge variant="saffron">Quotation Ready (Special Rate)</Badge>}
                          {rfq.status === 'quoted' && isExpired && <Badge variant="rose">Quotation Expired</Badge>}
                          {rfq.status === 'accepted' && <Badge variant="forest">Accepted & Order Created</Badge>}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Submitted: {rfq.date} • Frequency: <strong className="capitalize">{rfq.frequency}</strong> • Destination: {rfq.deliveryCity}
                        </p>
                      </div>
                    </div>

                    {rfq.quotedPrice && (
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground font-medium">Binding Mandi Quote</div>
                        <div className="text-xl font-bold font-mono text-foreground">
                          ₹{rfq.quotedPrice.toLocaleString('en-IN')}
                        </div>
                        <div className={`text-[11px] font-semibold ${isExpired ? 'text-destructive' : 'text-primary'}`}>
                          {isExpired ? 'Expired' : `Valid until ${new Date(rfq.validUntil || '').toLocaleDateString()}`}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Items summary */}
                  <div className="py-3 text-xs space-y-2">
                    <div className="font-semibold text-foreground uppercase text-[10px] tracking-wider">
                      Requested Commodities ({rfq.items.length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {rfq.items.map((it, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
                          <span className="font-medium text-foreground">{it.commodity}</span>
                          <span className="font-mono font-bold text-primary">{it.quantity} {it.unit}</span>
                        </div>
                      ))}
                    </div>

                    {rfq.mandiNotes && (
                      <div className="mt-2 p-2.5 bg-brand-soft/40 border border-primary/20 rounded-lg text-foreground text-[11px] flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-primary shrink-0" />
                        <span><strong>Mandi Trader Desk Note:</strong> {rfq.mandiNotes}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {isQuoted && !isAccepted && (
                    <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
                      {isExpired ? (
                        <div className="flex items-center gap-1.5 text-xs text-destructive font-semibold">
                          <AlertTriangle className="w-4 h-4" />
                          <span>This quote has expired. Please submit a new RFQ to receive refreshed mandi rates.</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={acceptingRfqId === rfq.id}
                          onClick={() => handleAcceptQuotation(rfq.id)}
                          icon={<Check className="w-4 h-4" />}
                        >
                          {acceptingRfqId === rfq.id ? 'Processing Order...' : 'Accept Quotation & Convert to Order'}
                        </Button>
                      )}
                    </div>
                  )}

                  {isAccepted && (
                    <div className="pt-3 border-t border-primary/20 flex items-center justify-between text-xs font-semibold text-primary">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>Order generated and transmitted to APMC Dispatch Hub.</span>
                      </div>
                      {rfq.resultingOrderId && (
                        <Link
                          to={`/orders?id=${rfq.resultingOrderId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-card"
                        >
                          <span>Track Order #{rfq.resultingOrderId}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
