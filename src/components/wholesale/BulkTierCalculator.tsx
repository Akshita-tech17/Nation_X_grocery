import React, { useState } from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { ProductService } from '../../services/productService';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Boxes, FileText, TrendingDown, ArrowRight, AlertTriangle, Truck, ShieldCheck } from 'lucide-react';

interface BulkTierCalculatorProps {
  product: Product;
}

export const BulkTierCalculator: React.FC<BulkTierCalculatorProps> = ({ product }) => {
  const { addToCart } = useCart();
  const tiers = product.bulkTiers || [];
  const minQty = product.minWholesaleQty || (tiers[0]?.minQty ?? 5);

  const [quantity, setQuantity] = useState(minQty);
  const [includeGstInvoice, setIncludeGstInvoice] = useState(true);

  // Authoritative calculation via ProductService
  const offering = ProductService.getOfferingById(product.offeringId || '') || {
    id: product.offeringId || `off-${product.id}`,
    masterProductId: product.id,
    merchantId: product.merchantId,
    merchantName: product.merchantName,
    sellingPrice: product.retailPrice,
    mrp: product.originalPrice,
    stockQuantity: product.stockQuantity,
    stockUpdatedAt: product.stockUpdatedAt || '2026-11-04T12:00:00.000Z',
    availabilityStatus: product.availabilityStatus,
    wholesaleTiers: product.bulkTiers,
    minWholesaleQty: minQty,
    fulfilmentOptions: ['truck_freight', 'standard'],
    visibilityStatus: 'active',
    rating: product.rating,
    reviewCount: product.reviewCount
  };

  const pricing = ProductService.calculatePrice(offering, quantity, 'wholesale');
  const stockCheck = ProductService.validateStock(offering.id, quantity);

  // Estimated 5% GST credit
  const gstCreditEstimated = Math.round(pricing.totalPrice * 0.05);

  const isMoqViolated = quantity < minQty;
  const isOutOfStock = !stockCheck.isValid && stockCheck.currentStatus === 'unavailable';
  const isInsufficientStock = quantity > offering.stockQuantity;

  const handleAddBulk = () => {
    if (isMoqViolated || isOutOfStock || isInsufficientStock) return;
    addToCart(product, quantity, 'wholesale', offering);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-soft p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-900">
              <Boxes className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-stone-900 text-base">
              Wholesale Slabs & Volume Calculator
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Dynamic volume discounting for mess owners, caterers, kiranas and restaurants fulfilled by <strong>{product.merchantName}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="blue" size="md">
            MOQ: {minQty} {product.unit}s
          </Badge>
          <span className="text-xs font-semibold text-stone-600">
            Available: <strong>{offering.stockQuantity} units</strong>
          </span>
        </div>
      </div>

      {/* Available Tiers Visual Slabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tiers.map((t, idx) => {
          const isSelected = pricing.appliedTier?.minQty === t.minQty;
          return (
            <button
              type="button"
              key={t.minQty}
              onClick={() => setQuantity(t.minQty)}
              className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/80 shadow-xs ring-2 ring-indigo-600/30'
                  : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                <span className="font-semibold text-stone-700">Tier {idx + 1} (Min {t.minQty}+)</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                  Save {t.discountPercent}%
                </span>
              </div>
              <div className="text-base font-bold text-stone-900 font-mono">
                ₹{t.pricePerUnit} <span className="text-xs font-normal text-stone-500">/unit</span>
              </div>
              <div className="text-[11px] text-stone-600 mt-1 font-medium truncate">
                {t.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Slider & Stepper */}
      <div className="bg-stone-50/80 p-4 rounded-2xl border border-stone-200/80 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
          <span>Order Quantity (Enforces MOQ):</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold font-mono text-indigo-950 px-2.5 py-0.5 bg-white border border-stone-300 rounded-lg">
              {quantity} {product.unit}s
            </span>
          </div>
        </div>

        <input
          type="range"
          min={minQty}
          max={Math.max(50, offering.stockQuantity)}
          step={1}
          value={quantity}
          onChange={e => setQuantity(Math.max(minQty, Number(e.target.value)))}
          className="w-full accent-indigo-600 cursor-pointer"
        />

        <div className="flex justify-between text-[11px] text-stone-500 font-mono">
          <span>Min MOQ: {minQty} units</span>
          <span>Max Yard Stock: {offering.stockQuantity} units</span>
        </div>
      </div>

      {/* Stock & MOQ Validation Warnings */}
      {isInsufficientStock && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Requested {quantity} units exceeds available merchant stock of {offering.stockQuantity} units.</span>
        </div>
      )}

      {/* Financial Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-stone-950 text-white">
        <div>
          <div className="text-xs text-stone-300 font-medium">Total Bulk Amount</div>
          <div className="text-xl font-bold font-mono text-white mt-0.5">
            ₹{pricing.totalPrice}
          </div>
          <div className="text-[11px] text-stone-300">@ ₹{pricing.unitPrice} / {product.unit}</div>
        </div>

        <div>
          <div className="text-xs text-emerald-300 font-medium flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            Direct Volume Savings
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
            ₹{pricing.savings}
          </div>
          <div className="text-[11px] text-emerald-300/80">({pricing.discountPercent}% off MRP)</div>
        </div>

        <div>
          <div className="text-xs text-amber-300 font-medium flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            Input Tax Credit (GST)
          </div>
          <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">
            ₹{gstCreditEstimated}
          </div>
          <div className="text-[11px] text-amber-200/80">Tax Invoice Included</div>
        </div>
      </div>

      {/* Fulfilment Terms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200">
          <Truck className="w-4 h-4 text-forest-700" />
          <span>Palletized freight or mini-truck direct from {offering.merchantName}</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200">
          <ShieldCheck className="w-4 h-4 text-forest-700" />
          <span>FSSAI Certified Commercial Mill Batches with Moisture Testing</span>
        </div>
      </div>

      {/* GST Invoicing Toggle */}
      <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={includeGstInvoice}
          onChange={e => setIncludeGstInvoice(e.target.checked)}
          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
        />
        <span>
          Generate <strong className="font-semibold text-stone-900">B2B Commercial Tax Invoice</strong> with GSTIN credit claim
        </span>
      </label>

      {/* Action Button */}
      <Button
        variant="amber"
        size="lg"
        disabled={isMoqViolated || isOutOfStock || isInsufficientStock}
        className="w-full font-bold shadow-soft"
        onClick={handleAddBulk}
        icon={<ArrowRight className="w-4 h-4" />}
        iconPosition="right"
      >
        {isInsufficientStock
          ? 'Quantity Exceeds Available Stock'
          : `Add ${quantity}x Wholesale Units to Basket (₹${pricing.totalPrice})`}
      </Button>
    </div>
  );
};
