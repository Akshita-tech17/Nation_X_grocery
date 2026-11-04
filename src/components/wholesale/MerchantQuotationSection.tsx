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
  Clock,
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
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-900">
              <FileText className="w-5 h-5" />
            </span>
            <h3 className="font-display font-extrabold text-lg text-stone-900">
              Path B — Merchant Quotation Requests (RFQ)
            </h3>
            <Badge variant="blue">Institutional & Commercial</Badge>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            For custom volume contracts, full truckload procurements, monthly mess menus, or unlisted mandi commodities.
            Request binding prices directly from APMC mandi millers with GST input tax invoices.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-xl text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'create'
                ? 'bg-white text-indigo-950 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Create New RFQ
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-indigo-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Active Quotations</span>
            <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[10px] font-bold flex items-center justify-center">
              {quotations.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <form onSubmit={handleSubmitRfq} className="bg-white rounded-3xl border border-stone-200 shadow-soft p-6 sm:p-8 space-y-6">
          {/* Business & Logistics Details */}
          <div>
            <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 mb-3">
              <Building className="w-4 h-4 text-indigo-700" />
              1. Business & Invoicing Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Business / Firm Name *</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g. Sagar Caterers & Banquets"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Contact Person *</label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={e => setContactPerson(e.target.value)}
                  placeholder="e.g. Anand Hegde"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Mobile / WhatsApp Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98450 00000"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">GSTIN (For 5% / 18% Tax Credit)</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={e => setGstNumber(e.target.value)}
                  placeholder="29AAAAA0000A1Z5"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Delivery Destination / City *</label>
                <input
                  type="text"
                  required
                  value={deliveryCity}
                  onChange={e => setDeliveryCity(e.target.value)}
                  placeholder="e.g. Bengaluru (Peenya Industrial Area)"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Procurement Frequency</label>
                <select
                  value={frequency}
                  onChange={e => setFrequency(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white"
                >
                  <option value="one-time">One-time Spot Order</option>
                  <option value="weekly">Weekly Recurring Standing Order</option>
                  <option value="bi-weekly">Bi-Weekly Contract</option>
                  <option value="monthly">Monthly Standing Supply</option>
                </select>
              </div>
            </div>
          </div>

          {/* Commodities Requirements */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-700" />
                2. Commodities & Requested Lots
              </h4>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-950 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Commodity</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-3.5 bg-stone-50/70 border border-stone-200 rounded-2xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                >
                  <div className="sm:col-span-5">
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                      Commodity Name / Specification
                    </label>
                    <input
                      type="text"
                      required
                      value={item.commodity}
                      onChange={e => handleItemChange(index, 'commodity', e.target.value)}
                      placeholder="e.g. Aged Basmati, Sharbati Atta, Yellow Toor Dal"
                      className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                      Quantity
                    </label>
                    <input
                      type="text"
                      required
                      value={item.quantity}
                      onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                      placeholder="e.g. 20"
                      className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-mono text-stone-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                      Pack / Unit
                    </label>
                    <input
                      type="text"
                      required
                      value={item.unit}
                      onChange={e => handleItemChange(index, 'unit', e.target.value)}
                      placeholder="e.g. 50kg sacks, 5kg bags"
                      className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                      Target Price (₹)
                    </label>
                    <input
                      type="number"
                      value={item.targetPrice || ''}
                      onChange={e => handleItemChange(index, 'targetPrice', Number(e.target.value))}
                      placeholder="Optional"
                      className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-mono text-stone-900"
                    />
                  </div>

                  <div className="sm:col-span-1 flex items-end justify-center pt-2 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(index)}
                      disabled={items.length <= 1}
                      className="p-2 text-stone-400 hover:text-rose-600 disabled:opacity-30 transition-colors"
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
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-stone-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Quotes typically finalized by Mandi Desk in 2-4 business hours</span>
            </div>

            <Button
              type="submit"
              variant="amber"
              size="lg"
              className="font-bold shadow-soft w-full sm:w-auto"
              icon={<Send className="w-4 h-4" />}
            >
              Submit Commercial Mandi RFQ
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-stone-900">
              Your Active Mandi Quotations ({quotations.length})
            </h4>
            <span className="text-xs text-stone-500">
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
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : isQuoted
                      ? 'bg-white border-indigo-300 shadow-soft-md'
                      : 'bg-white border-stone-200 shadow-soft'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isAccepted ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-900'}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-sm text-stone-900">{rfq.id}</span>
                          <span className="text-xs font-semibold text-stone-600">• {rfq.businessName}</span>
                          {rfq.status === 'under_review' && <Badge variant="blue">Under Mandi Review</Badge>}
                          {rfq.status === 'quoted' && !isExpired && <Badge variant="saffron">Quotation Ready (Special Rate)</Badge>}
                          {rfq.status === 'quoted' && isExpired && <Badge variant="rose">Quotation Expired</Badge>}
                          {rfq.status === 'accepted' && <Badge variant="forest">Accepted & Order Created</Badge>}
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Submitted: {rfq.date} • Frequency: <strong className="capitalize">{rfq.frequency}</strong> • Destination: {rfq.deliveryCity}
                        </p>
                      </div>
                    </div>

                    {rfq.quotedPrice && (
                      <div className="text-right">
                        <div className="text-xs text-stone-500 font-medium">Binding Mandi Quote</div>
                        <div className="text-xl font-bold font-mono text-forest-950">
                          ₹{rfq.quotedPrice.toLocaleString('en-IN')}
                        </div>
                        <div className={`text-[11px] font-semibold ${isExpired ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {isExpired ? 'Expired' : `Valid until ${new Date(rfq.validUntil || '').toLocaleDateString()}`}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Items summary */}
                  <div className="py-3 text-xs space-y-2">
                    <div className="font-semibold text-stone-700 uppercase text-[10px] tracking-wider">
                      Requested Commodities ({rfq.items.length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {rfq.items.map((it, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                          <span className="font-medium text-stone-900">{it.commodity}</span>
                          <span className="font-mono font-bold text-indigo-950">{it.quantity} {it.unit}</span>
                        </div>
                      ))}
                    </div>

                    {rfq.mandiNotes && (
                      <div className="mt-2 p-2.5 bg-blue-50/60 border border-blue-200 rounded-lg text-indigo-900 text-[11px] flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span><strong>Mandi Trader Desk Note:</strong> {rfq.mandiNotes}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {isQuoted && !isAccepted && (
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
                      {isExpired ? (
                        <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold">
                          <AlertTriangle className="w-4 h-4" />
                          <span>This quote has expired. Please submit a new RFQ to receive refreshed mandi rates.</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="amber"
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
                    <div className="pt-3 border-t border-emerald-100 flex items-center justify-between text-xs font-semibold text-emerald-800">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Order generated and transmitted to APMC Dispatch Hub.</span>
                      </div>
                      {rfq.resultingOrderId && (
                        <Link
                          to={`/orders?id=${rfq.resultingOrderId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-forest-900 text-white font-bold hover:bg-forest-950 transition-colors"
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
