import React, { useState } from 'react';
import { useMerchant } from '../../context/MerchantContext';
import { useCart } from '../../context/CartContext';
import { QuotationRequest } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  Clock,
  Send,
  Building
} from 'lucide-react';

export const BulkBuyQuotationsTable: React.FC = () => {
  const { quotations, submitQuotationResponse } = useMerchant();
  const { showToast } = useCart();

  const [activeQuotation, setActiveQuotation] = useState<QuotationRequest | null>(null);
  const [quotePrice, setQuotePrice] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenQuoteModal = (q: QuotationRequest) => {
    setActiveQuotation(q);
    // Suggest a default quotation based on items target price or estimated total
    const estimatedSum = q.items.reduce((sum, item) => {
      const target = item.targetPrice || 500;
      const qty = parseInt(item.quantity) || 10;
      return sum + (target * qty);
    }, 0);
    setQuotePrice(q.quotedPrice || Math.round(estimatedSum * 0.95));
    setNotes(q.mandiNotes || 'Dispatched via APMC wholesale mini-truck with verified tare weight slip.');
    setIsModalOpen(true);
  };

  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuotation || quotePrice <= 0) return;

    submitQuotationResponse(activeQuotation.id, quotePrice, notes);
    showToast(`Quotation of ₹${quotePrice.toLocaleString('en-IN')} sent to ${activeQuotation.businessName}!`);
    setIsModalOpen(false);
  };

  const getStatusBadge = (status: QuotationRequest['status']) => {
    switch (status) {
      case 'submitted':
      case 'under_review':
        return <Badge variant="amber">Awaiting Merchant Quote</Badge>;
      case 'quoted':
        return <Badge variant="forest">Quote Sent to Buyer</Badge>;
      case 'accepted':
        return <Badge variant="forest">Accepted & Converted to Order</Badge>;
      case 'rejected':
        return <Badge variant="rose">Declined</Badge>;
      default:
        return <Badge variant="stone">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-stone-900 text-base">
            BulkBuy & Mandi Quotation Requests (B2B RFQs)
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Incoming wholesale requirements from catering firms, hotels, cloud kitchens, and institutional buyers
          </p>
        </div>
        <span className="text-xs font-semibold text-stone-700 bg-stone-100 px-3 py-1 rounded-full">
          {quotations.length} Active RFQ Enquiries
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {quotations.map(q => {
          const isQuoted = q.status === 'quoted' || q.status === 'accepted';
          return (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-5 space-y-4 hover:border-forest-600/50 transition-colors"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-forest-50 text-forest-900">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900">
                        {q.businessName}
                      </span>
                      <span className="font-mono text-xs font-semibold text-stone-500">
                        #{q.id}
                      </span>
                      {getStatusBadge(q.status)}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
                      <span>Contact: <strong>{q.contactPerson}</strong></span>
                      <span>•</span>
                      <span className="font-mono">{q.phone}</span>
                      <span>•</span>
                      <span>{q.deliveryCity}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-stone-500">Frequency: <strong className="capitalize text-stone-800">{q.frequency}</strong></div>
                  <div className="text-[11px] text-stone-400 mt-0.5">Received {q.date}</div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Requested Commodity Lots
                </span>
                <div className="bg-stone-50 rounded-xl border border-stone-200/70 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100/70 border-b border-stone-200/70 text-stone-600 uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="py-2 px-3">Commodity Specification</th>
                        <th className="py-2 px-3">Quantity</th>
                        <th className="py-2 px-3">Pack Unit</th>
                        <th className="py-2 px-3 text-right">Target Price (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200/50">
                      {q.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-semibold text-stone-900">
                            {item.commodity}
                          </td>
                          <td className="py-2 px-3 font-bold font-mono text-forest-900">
                            {item.quantity}
                          </td>
                          <td className="py-2 px-3 text-stone-600">
                            {item.unit}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-stone-700">
                            {item.targetPrice ? `₹${item.targetPrice}` : 'Open to quote'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quotation Status or Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-100">
                {isQuoted ? (
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-stone-500 font-medium">Your Quoted Price:</span>
                      <span className="font-mono font-extrabold text-sm text-forest-950">
                        ₹{q.quotedPrice?.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                        {q.validUntil}
                      </span>
                    </div>
                    {q.mandiNotes && (
                      <p className="text-[11px] text-stone-500 italic">
                        "{q.mandiNotes}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-amber-700 flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4" />
                    <span>Buyer is waiting for your mandi counter-quote.</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isQuoted ? 'ghost' : 'primary'}
                    onClick={() => handleOpenQuoteModal(q)}
                    icon={<Send className="w-3.5 h-3.5" />}
                  >
                    {isQuoted ? 'Update Quotation' : 'Submit Mandi Quotation'}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quotation Submission Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={activeQuotation ? `Quote for ${activeQuotation.businessName}` : 'Quotation Counter-Offer'}
        subtitle="Specify all-inclusive mandi bulk pricing, logistics terms, and valid duration"
        maxWidth="md"
      >
        <form onSubmit={handleSendQuote} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-stone-700 block mb-1">
              Total Quoted Amount (₹ All Inclusive) *
            </label>
            <input
              type="number"
              required
              min="1000"
              value={quotePrice}
              onChange={e => setQuotePrice(Number(e.target.value))}
              placeholder="e.g. 32000"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono font-bold text-base text-stone-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
            />
            <span className="text-[11px] text-stone-500 mt-1 block">
              Includes commodity lot price, loading at mandi, and local mini-truck freight.
            </span>
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">
              Dispatch & Mandi Terms Note
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Fresh stock from APMC depot with verified moisture < 12%. Delivery within 24 hours."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" icon={<Send className="w-3.5 h-3.5" />}>
              Send Quotation to Buyer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
