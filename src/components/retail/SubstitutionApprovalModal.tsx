import React from 'react';
import { AlertCircle, Check, X } from 'lucide-react';
import { ProposedSubstitution } from '../../services/fulfilmentService';

interface SubstitutionApprovalModalProps {
  isOpen: boolean;
  substitution: ProposedSubstitution | null;
  onAccept: () => void;
  onRejectAndRefund: () => void;
  onCancelSuborder: () => void;
}

export const SubstitutionApprovalModal: React.FC<SubstitutionApprovalModalProps> = ({
  isOpen,
  substitution,
  onAccept,
  onRejectAndRefund,
  onCancelSuborder,
}) => {
  if (!isOpen || !substitution) return null;

  const isPriceHigher = substitution.priceDelta > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all"
        role="dialog"
        aria-labelledby="substitution-dialog-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-amber-500/10 border-b border-amber-200/60 p-5 flex items-start gap-3">
          <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 id="substitution-dialog-title" className="text-lg font-bold text-gray-900 leading-snug">
              Item Substitution Required
            </h3>
            <p className="text-xs text-amber-900/80 mt-0.5">
              The merchant ran out of stock for one item and proposes a replacement for your approval.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Reason Box */}
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 flex items-start gap-2">
            <span className="font-semibold text-gray-800 shrink-0">Merchant Note:</span>
            <span>{substitution.merchantReason}</span>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
            {/* Original Item */}
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 relative">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider bg-rose-100 px-2 py-0.5 rounded-full inline-block mb-1.5">
                Unavailable
              </span>
              <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{substitution.originalItemName}</h4>
              <p className="text-xs text-gray-500 mt-1">Qty: {substitution.originalQuantity}</p>
              <p className="text-sm font-bold text-gray-800 mt-2">₹{substitution.originalTotalPrice}</p>
            </div>

            {/* Replacement Item */}
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 relative shadow-sm">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-full inline-block mb-1.5">
                Proposed Match
              </span>
              <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{substitution.replacementItemName}</h4>
              <p className="text-xs text-gray-500 mt-1">Qty: {substitution.originalQuantity}</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-sm font-bold text-emerald-800">₹{substitution.replacementTotalPrice}</span>
                {substitution.priceDelta !== 0 && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isPriceHigher ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isPriceHigher ? `+₹${substitution.priceDelta}` : `-₹${Math.abs(substitution.priceDelta)}`}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Price Delta Explanation */}
          <div className="text-xs text-gray-600 bg-blue-50/60 p-3 rounded-lg border border-blue-100 flex items-center justify-between">
            <span>Net Order Difference:</span>
            <span className="font-bold text-gray-900">
              {substitution.priceDelta === 0
                ? 'No price change'
                : isPriceHigher
                ? `You will pay +₹${substitution.priceDelta}`
                : `You will be refunded ₹${Math.abs(substitution.priceDelta)}`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 bg-gray-50/80 border-t border-gray-100 space-y-2.5">
          <button
            type="button"
            onClick={onAccept}
            className="w-full min-h-[48px] px-4 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Accept Replacement</span>
          </button>

          <button
            type="button"
            onClick={onRejectAndRefund}
            className="w-full min-h-[48px] px-4 py-3 bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-800 border border-gray-300 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-rose-500" />
            <span>Reject & Refund Item (₹{substitution.originalTotalPrice})</span>
          </button>

          <button
            type="button"
            onClick={onCancelSuborder}
            className="w-full py-2 text-center text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
          >
            Cancel entire store order
          </button>
        </div>
      </div>
    </div>
  );
};
