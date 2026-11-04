import React from 'react';
import { useMerchant } from '../../context/MerchantContext';
import { IndianRupee, ShoppingBag, AlertTriangle, Star, TrendingUp } from 'lucide-react';

export const MetricsBar: React.FC = () => {
  const { totalRevenue, activeOrdersCount, outOfStockCount, merchants, activeMerchantId } = useMerchant();
  const currentStore = merchants.find(m => m.id === activeMerchantId) || merchants[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Gross Revenue */}
      <div className="bg-card p-4.5 rounded-2xl border border-border shadow-card flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Gross Sales
          </span>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-primary mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% vs last week</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-brand-soft text-primary border border-primary/20 flex items-center justify-center">
          <IndianRupee className="w-6 h-6" />
        </div>
      </div>

      {/* Active Orders */}
      <div className="bg-card p-4.5 rounded-2xl border border-border shadow-card flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Active Orders
          </span>
          <div className="text-2xl font-bold font-mono text-primary mt-1">
            {activeOrdersCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            In packing & dispatch stage
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-brand-soft text-primary border border-primary/20 flex items-center justify-center">
          <ShoppingBag className="w-6 h-6" />
        </div>
      </div>

      {/* Stock Alerts */}
      <div className="bg-card p-4.5 rounded-2xl border border-border shadow-card flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Stock Attention
          </span>
          <div className="text-2xl font-bold font-mono text-amber-800 mt-1">
            {outOfStockCount} items
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Requires restock or mandi PO
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-900 border border-amber-500/20 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
      </div>

      {/* Kirana Rating & Khata */}
      <div className="bg-card p-4.5 rounded-2xl border border-border shadow-card flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Store Rating
          </span>
          <div className="text-2xl font-bold text-foreground mt-1 flex items-center gap-1.5">
            <span>{currentStore.rating}</span>
            <Star className="w-5 h-5 text-marigold fill-marigold" />
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Based on {currentStore.reviewsCount} customer ratings
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-muted text-muted-foreground border border-border flex items-center justify-center">
          <Star className="w-6 h-6 text-marigold" />
        </div>
      </div>
    </div>
  );
};
