import React, { useState } from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { ProductService } from '../../services/productService';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Layers,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Truck,
  FileText,
  AlertTriangle
} from 'lucide-react';

interface BulkTierCalculatorProps {
  product: Product;
}

export const BulkTierCalculator: React.FC<BulkTierCalculatorProps> = ({ product }) => {
  const { addToCart } = useCart();
  const minQty = product.minWholesaleQty || 5;
  const [quantity, setQuantity] = useState<number>(minQty);
  const [includeGstInvoice, setIncludeGstInvoice] = useState<boolean>(true);

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

  const tiers = product.bulkTiers || [
    { minQty: 5, pricePerUnit: Math.round(product.retailPrice * 0.92), label: 'Tier 1 • Catering Minimum (5+ packs)', discountPercent: 8 },
    { minQty: 15, pricePerUnit: Math.round(product.retailPrice * 0.85), label: 'Tier 2 • Semi-Wholesale (15+ packs)', discountPercent: 15 },
    { minQty: 40, pricePerUnit: Math.round(product.retailPrice * 0.76), label: 'Tier 3 • Full Mandi Lot (40+ packs)', discountPercent: 24 }
  ];

  const isMoqViolated = quantity < minQty;
  const isOutOfStock = !stockCheck.isValid || stockCheck.availableStock <= 0;
  const isInsufficientStock = quantity > offering.stockQuantity;

  const handleAddBulk = () => {
    if (isMoqViolated || isOutOfStock || isInsufficientStock) return;
    addToCart(product, quantity, 'wholesale', offering);
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-soft text-primary border border-primary/20">
              <Layers className="w-4 h-4" />
            </span>
            <h3 className="font-heading font-bold text-foreground text-base">
              Wholesale Slabs & Volume Calculator
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Dynamic volume discounting for mess owners, caterers, kiranas and restaurants fulfilled by <strong>{product.merchantName}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="blue" size="md">
            MOQ: {minQty} {product.unit}s
          </Badge>
          <span className="text-xs font-semibold text-muted-foreground">
            Available: <strong className="text-foreground">{offering.stockQuantity} units</strong>
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
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                isSelected
                  ? 'border-primary bg-brand-soft/80 shadow-card ring-2 ring-primary/30'
                  : 'border-border hover:border-input bg-card'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span className="font-semibold text-foreground">Tier {idx + 1} (Min {t.minQty}+)</span>
                <span className="font-semibold text-primary bg-brand-soft px-1.5 py-0.5 rounded border border-primary/20 text-[10px]">
                  Save {t.discountPercent}%
                </span>
              </div>
              <div className="text-base font-bold text-foreground font-mono">
                ₹{t.pricePerUnit} <span className="text-xs font-normal text-muted-foreground">/unit</span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-1 font-medium truncate">
                {t.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Slider & Stepper */}
      <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-foreground">
          <span>Order Quantity (Enforces MOQ):</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold font-mono text-primary px-2.5 py-0.5 bg-card border border-border rounded-lg">
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
          className="w-full accent-primary cursor-pointer"
        />

        <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
          <span>Min MOQ: {minQty} units</span>
          <span>Max Yard Stock: {offering.stockQuantity} units</span>
        </div>
      </div>

      {/* Stock & MOQ Validation Warnings */}
      {isInsufficientStock && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Requested {quantity} units exceeds available merchant stock of {offering.stockQuantity} units.</span>
        </div>
      )}

      {/* Financial Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-card border border-border shadow-card">
        <div>
          <div className="text-xs text-muted-foreground font-medium">Total Bulk Amount</div>
          <div className="text-xl font-bold font-mono text-foreground mt-0.5">
            ₹{pricing.totalPrice}
          </div>
          <div className="text-[11px] text-muted-foreground">@ ₹{pricing.unitPrice} / {product.unit}</div>
        </div>

        <div>
          <div className="text-xs text-primary font-medium flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            Direct Volume Savings
          </div>
          <div className="text-xl font-bold font-mono text-primary mt-0.5">
            ₹{pricing.savings}
          </div>
          <div className="text-[11px] text-primary/80">({pricing.discountPercent}% off MRP)</div>
        </div>

        <div>
          <div className="text-xs text-marigold font-medium flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            Input Tax Credit (GST)
          </div>
          <div className="text-xl font-bold font-mono text-marigold mt-0.5">
            ₹{gstCreditEstimated}
          </div>
          <div className="text-[11px] text-muted-foreground">Tax Invoice Included</div>
        </div>
      </div>

      {/* Fulfilment Terms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border">
          <Truck className="w-4 h-4 text-primary" />
          <span>Palletized freight or mini-truck direct from {offering.merchantName}</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>FSSAI Certified Commercial Mill Batches with Moisture Testing</span>
        </div>
      </div>

      {/* GST Invoicing Toggle */}
      <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
        <input
          type="checkbox"
          checked={includeGstInvoice}
          onChange={e => setIncludeGstInvoice(e.target.checked)}
          className="rounded border-border text-primary focus:ring-ring w-4 h-4"
        />
        <span>
          Generate <strong className="font-semibold text-foreground">B2B Commercial Tax Invoice</strong> with GSTIN credit claim
        </span>
      </label>

      {/* Action Button */}
      <Button
        variant="primary"
        size="lg"
        disabled={isMoqViolated || isOutOfStock || isInsufficientStock}
        className="w-full font-bold shadow-card"
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
