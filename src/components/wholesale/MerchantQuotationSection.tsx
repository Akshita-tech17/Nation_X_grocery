import React, { useState } from 'react';
import { QuotationRequest, QuotationItem } from '../../types';
import { MERCHANTS } from '../../data/merchants';
import { useCart } from '../../context/CartContext';
import { useMerchant } from '../../context/MerchantContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  FileText,
  Building,
  Calendar,
  Send,
  CheckCircle2,
  Clock,
  Check,
  Plus,
  Trash2,
  TrendingDown
} from 'lucide-react';

export const MerchantQuotationSection: React.FC = () => {
  const { showToast } = useCart();
  const { quotations, addQuotationRequest, submitQuotationResponse } = useMerchant();

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Bengaluru');
  const [frequency, setFrequency] = useState<'one-time' | 'weekly' | 'bi-weekly' | 'monthly'>('one-time');
  const [preferredMerchant, setPreferredMerchant] = useState('store-yeshwanthpur-wholesale');

  // Multi-item rows in quotation form
  const [items, setItems] = useState<QuotationItem[]>([
    { commodity: 'MP Sharbati Whole Wheat Atta', quantity: '20', unit: '5kg bags', targetPrice: 290 },
    { commodity: 'Commercial Refined Sugar', quantity: '4', unit: '50kg sacks', targetPrice: 2050 }
  ]);

  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

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

    const newRfq: QuotationRequest = {
      id: `RFQ-${Math.floor(10000 + Math.random() * 90000)}`,
      date: 'Just now',
      businessName,
      contactPerson,
      phone,
      gstNumber: gstNumber || undefined,
      deliveryCity,
      frequency,
      items: [...items],
      status: 'under_review',
      mandiNotes: 'Received at APMC Mandi Central Desk. Expected quotation within 2 hours.'
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

  const handleAcceptQuotation = (rfqId: string) => {
    const matching = quotations.find(q => q.id === rfqId);
    submitQuotationResponse(
      rfqId,
      matching?.quotedPrice || 30000,
      'Accepted by institutional buyer. Preparing dispatch slip.'
    );
    showToast(`🎉 Quotation #${rfqId} accepted! Converted to confirmed order.`);
  };

  return (
    <div className="space-y-6">
      {/* Subheader and Tabs */}
      <div className="bg-white rounded-2xl border border-warm-200/90 p-5 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-900">
              <FileText className="w-5 h-5" />
            </span>
            <h3 className="font-display font-extrabold text-lg text-warm-900">
              Path B — Merchant Quotation Requests (RFQ)
            </h3>
            <Badge variant="blue">Institutional & Commercial</Badge>
          </div>
          <p className="text-xs text-warm-500 mt-1 max-w-2xl">
            For custom volume contracts, full truckload procurements, monthly mess menus, or unlisted mandi commodities.
            Request binding prices directly from APMC mandi millers with GST input tax invoices.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-warm-100 rounded-xl text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'create'
                ? 'bg-white text-indigo-950 shadow-sm'
                : 'text-warm-600 hover:text-warm-900'
            }`}
          >
            Create New RFQ
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-indigo-900 text-white shadow-sm'
                : 'text-warm-600 hover:text-warm-900'
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
        <form onSubmit={handleSubmitRfq} className="bg-white rounded-3xl border border-warm-200 shadow-soft p-6 sm:p-8 space-y-6">
          {/* Business & Logistics Details */}
          <div>
            <h4 className="font-bold text-sm text-warm-900 flex items-center gap-2 mb-3">
              <Building className="w-4 h-4 text-indigo-700" />
              1. Business & Invoicing Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-semibold text-warm-700 block mb-1">Business / Firm Name *</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g. Sagar Caterers & Banquets"
                  className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl text-warm-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-warm-700 block mb-1">Contact Person *</label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={e => setContactPerson(e.target.value)}
                  placeholder="e.g. Anand Hegde"
                  className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl text-warm-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-warm-700 block mb-1">Mobile / WhatsApp Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98450 00000"
                  className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl text-warm-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-warm-700 block mb-1">GSTIN (For 5% / 18% Tax Credit)</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={e => setGstNumber(e.target.value)}
                  placeholder="29AAAAA0000A1Z5"
                  className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl text-warm-900 uppercase font-mono focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Delivery Parameters & Mandi Selection */}
          <div className="pt-4 border-t border-warm-100">
            <h4 className="font-bold text-sm text-warm-900 flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-indigo-700" />
              2. Procurement Frequency & Mandi Partner
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-semibold text-warm-700 block mb-1">Delivery Destination Area</label>
                <input
                  type="text"
                  value={deliveryCity}
                  onChange={e => setDeliveryCity(e.target.value)}
                  placeholder="e.g. Yeshwanthpur Industrial Area, Bengaluru"
                  className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl text-warm-900"
                />
              </div>

              <div>
                <label className="font-semibold text-warm-700 block mb-1">Requirement Frequency</label>
                <select
                  value={frequency}
                  onChange={e => setFrequency(e.target.value as any)}
                  className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl text-warm-900 cursor-pointer"
                >
                  <option value="one-time">One-Time Bulk Purchase</option>
                  <option value="weekly">Weekly Recurring Drop</option>
                  <option value="bi-weekly">Bi-Weekly Contract</option>
                  <option value="monthly">Monthly Standing Supply</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-warm-700 block mb-1">Preferred Mandi / Kirana Depot</label>
                <select
                  value={preferredMerchant}
                  onChange={e => setPreferredMerchant(e.target.value)}
                  className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl text-warm-900 cursor-pointer"
                >
                  {MERCHANTS.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.area})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Required Commodities List Builder */}
          <div className="pt-4 border-t border-warm-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-warm-900">
                  3. Commodities & Estimated Target Quantities
                </h4>
                <p className="text-[11px] text-warm-500">
                  Add lines for each grain, pulse, oil, or sugar requirement you want quoted
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-900 hover:bg-indigo-100 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-indigo-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Line</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center p-3 bg-warm-50/70 border border-warm-200 rounded-xl"
                >
                  <div className="sm:col-span-5">
                    <label className="text-[10px] uppercase font-bold text-warm-400 block mb-1">
                      Commodity / Variety
                    </label>
                    <input
                      type="text"
                      required
                      value={item.commodity}
                      onChange={e => handleItemChange(index, 'commodity', e.target.value)}
                      placeholder="e.g. Sharbati Atta / Sona Masoori Rice"
                      className="w-full px-3 py-1.5 bg-white border border-warm-200 rounded-lg text-xs text-warm-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-warm-400 block mb-1">
                      Target Volume
                    </label>
                    <input
                      type="text"
                      required
                      value={item.quantity}
                      onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                      placeholder="e.g. 20"
                      className="w-full px-3 py-1.5 bg-white border border-warm-200 rounded-lg text-xs font-mono font-bold text-warm-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-warm-400 block mb-1">
                      Packaging Unit
                    </label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={e => handleItemChange(index, 'unit', e.target.value)}
                      placeholder="e.g. 25kg sacks"
                      className="w-full px-3 py-1.5 bg-white border border-warm-200 rounded-lg text-xs text-warm-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-warm-400 block mb-1">
                      Target Price (₹)
                    </label>
                    <input
                      type="number"
                      value={item.targetPrice || ''}
                      onChange={e => handleItemChange(index, 'targetPrice', Number(e.target.value))}
                      placeholder="Optional"
                      className="w-full px-3 py-1.5 bg-white border border-warm-200 rounded-lg text-xs font-mono text-warm-900"
                    />
                  </div>

                  <div className="sm:col-span-1 flex items-end justify-center pt-2 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(index)}
                      disabled={items.length <= 1}
                      className="p-2 text-warm-400 hover:text-rose-600 disabled:opacity-30 transition-colors"
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
          <div className="pt-4 border-t border-warm-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-warm-500 flex items-center gap-2">
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
            <h4 className="font-bold text-sm text-warm-900">
              Your Active Mandi Quotations ({quotations.length})
            </h4>
            <span className="text-xs text-warm-500">
              Click "Accept & Order" to lock in the agreed Mandi rate
            </span>
          </div>

          <div className="grid gap-4">
            {quotations.map(rfq => {
              const isQuoted = rfq.status === 'quoted';
              const isAccepted = rfq.status === 'accepted';
              return (
                <div
                  key={rfq.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isAccepted
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : isQuoted
                      ? 'bg-white border-indigo-300 shadow-soft-md'
                      : 'bg-white border-warm-200 shadow-soft'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-warm-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isAccepted ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-900'}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-sm text-warm-900">{rfq.id}</span>
                          <span className="text-xs font-semibold text-warm-600">• {rfq.businessName}</span>
                          {rfq.status === 'under_review' && <Badge variant="blue">Under Mandi Review</Badge>}
                          {rfq.status === 'quoted' && <Badge variant="saffron">Quotation Ready (Special Rate)</Badge>}
                          {rfq.status === 'accepted' && <Badge variant="forest">Accepted & Order Created</Badge>}
                        </div>
                        <p className="text-[11px] text-warm-400 mt-0.5">
                          Submitted: {rfq.date} • Frequency: <strong className="capitalize">{rfq.frequency}</strong> • Destination: {rfq.deliveryCity}
                        </p>
                      </div>
                    </div>

                    {rfq.quotedPrice && (
                      <div className="text-right">
                        <div className="text-xs text-warm-500 font-medium">Binding Mandi Quote</div>
                        <div className="text-xl font-bold font-mono text-forest-950">
                          ₹{rfq.quotedPrice.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-semibold">{rfq.validUntil}</div>
                      </div>
                    )}
                  </div>

                  {/* Items summary */}
                  <div className="py-3 text-xs space-y-2">
                    <div className="font-semibold text-warm-700 uppercase text-[10px] tracking-wider">
                      Requested Commodities ({rfq.items.length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {rfq.items.map((it, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-warm-50 border border-warm-200/80 flex items-center justify-between">
                          <span className="font-medium text-warm-900">{it.commodity}</span>
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
                  {isQuoted && (
                    <div className="pt-3 border-t border-warm-100 flex items-center justify-end gap-3">
                      <Button
                        size="sm"
                        variant="amber"
                        onClick={() => handleAcceptQuotation(rfq.id)}
                        icon={<Check className="w-4 h-4" />}
                      >
                        Accept Quotation & Convert to Order
                      </Button>
                    </div>
                  )}

                  {isAccepted && (
                    <div className="pt-2 text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Order generated and transmitted to APMC Dispatch Hub. Check Merchant / Orders view.</span>
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
