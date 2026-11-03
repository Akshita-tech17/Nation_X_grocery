import React, { useState } from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Boxes, FileText, TrendingDown, ArrowRight } from 'lucide-react';

interface BulkTierCalculatorProps {
  product: Product;
}

export const BulkTierCalculator: React.FC<BulkTierCalculatorProps> = ({ product }) => {
  const { addToCart } = useCart();
  const tiers = product.bulkTiers || [];
  const minQty = product.minWholesaleQty || (tiers[0]?.minQty ?? 5);

  const [quantity, setQuantity] = useState(minQty);
  const [includeGstInvoice, setIncludeGstInvoice] = useState(true);

  // Find matched tier
  const activeTier = tiers
    .filter(t => quantity >= t.minQty)
    .sort((a, b) => b.minQty - a.minQty)[0] || tiers[0];

  const unitPrice = activeTier ? activeTier.pricePerUnit : product.retailPrice;
  const totalPrice = unitPrice * quantity;
  const retailEquivalentTotal = product.retailPrice * quantity;
  const totalVolumeSavings = Math.max(0, retailEquivalentTotal - totalPrice);
  const discountPercent = activeTier ? activeTier.discountPercent : 0;

  // Estimated GST credit savings (approx 5% for essentials or 12/18%)
  const gstCreditEstimated = Math.round(totalPrice * 0.05);

  const handleAddBulk = () => {
    addToCart(product, quantity, 'wholesale');
  };

  return (
    <div className="bg-white rounded-2xl border border-warm-200/90 shadow-soft p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-warm-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-900">
              <Boxes className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-warm-900 text-base">
              Wholesale Slabs & Volume Calculator
            </h3>
          </div>
          <p className="text-xs text-warm-500 mt-1">
            Dynamic volume discounting for mess owners, caterers, kiranas and restaurants
          </p>
        </div>
        <Badge variant="blue" size="md">
          MOQ: {minQty} {product.unit}s
        </Badge>
      </div>

      {/* Available Tiers Visual Slabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tiers.map((t, idx) => {
          const isSelected = activeTier?.minQty === t.minQty;
          return (
            <div
              key={t.minQty}
              onClick={() => setQuantity(t.minQty)}
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/80 shadow-sm ring-1 ring-indigo-600'
                  : 'border-warm-200 hover:border-warm-300 bg-warm-50/50'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-warm-500 mb-1">
                <span className="font-semibold text-warm-700">Tier {idx + 1}</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 text-[10px]">
                  Save {t.discountPercent}%
                </span>
              </div>
              <div className="text-base font-bold text-warm-900 font-mono">
                ₹{t.pricePerUnit} <span className="text-xs font-normal text-warm-500">/unit</span>
              </div>
              <div className="text-[11px] text-warm-600 mt-1 font-medium">
                {t.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Slider & Stepper */}
      <div className="bg-warm-50/80 p-4 rounded-xl border border-warm-200/80 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-warm-800">
          <span>Order Quantity:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold font-mono text-indigo-950 px-2 py-0.5 bg-white border border-warm-300 rounded-lg">
              {quantity} {product.unit}s
            </span>
          </div>
        </div>

        <input
          type="range"
          min={minQty}
          max={Math.max(50, minQty * 5)}
          step={1}
          value={quantity}
          onChange={e => setQuantity(Number(e.target.value))}
          className="w-full accent-indigo-600 cursor-pointer"
        />

        <div className="flex justify-between text-[11px] text-warm-400 font-mono">
          <span>Min: {minQty} units</span>
          <span>50+ units (Pallet freight available)</span>
        </div>
      </div>

      {/* Live Financial Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-forest-950 text-white">
        <div>
          <div className="text-xs text-warm-300 font-medium">Total Bulk Amount</div>
          <div className="text-xl font-bold font-mono text-white mt-0.5">
            ₹{totalPrice}
          </div>
          <div className="text-[11px] text-warm-300">@ ₹{unitPrice} / {product.unit}</div>
        </div>

        <div>
          <div className="text-xs text-emerald-300 font-medium flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            Direct Volume Savings
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
            ₹{totalVolumeSavings}
          </div>
          <div className="text-[11px] text-emerald-300/80">({discountPercent}% cheaper than retail)</div>
        </div>

        <div>
          <div className="text-xs text-amber-300 font-medium flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            Input Tax Credit (GST)
          </div>
          <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">
            ₹{gstCreditEstimated}
          </div>
          <div className="text-[11px] text-amber-200/80">Claimable with GSTIN</div>
        </div>
      </div>

      {/* GST Invoicing Toggle */}
      <label className="flex items-center gap-2.5 text-xs text-warm-700 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={includeGstInvoice}
          onChange={e => setIncludeGstInvoice(e.target.checked)}
          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
        />
        <span>
          Generate <strong className="font-semibold text-warm-900">B2B Commercial Tax Invoice</strong> with GSTIN credit claim
        </span>
      </label>

      {/* Action Button */}
      <Button
        variant="amber"
        size="lg"
        className="w-full font-bold shadow-soft"
        onClick={handleAddBulk}
        icon={<ArrowRight className="w-4 h-4" />}
        iconPosition="right"
      >
        Add {quantity}x Wholesale Units to Basket (₹{totalPrice})
      </Button>
    </div>
  );
};
