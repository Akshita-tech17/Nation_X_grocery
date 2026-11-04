import React from 'react';
import { useMerchant } from '../../context/MerchantContext';
import { IndianRupee, ShoppingBag, AlertTriangle, Star, TrendingUp, Users } from 'lucide-react';

export const MetricsBar: React.FC = () => {
  const { totalRevenue, activeOrdersCount, outOfStockCount, merchants, activeMerchantId } = useMerchant();
  const currentStore = merchants.find(m => m.id === activeMerchantId) || merchants[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Gross Revenue */}
      <div className="bg-white p-4.5 rounded-2xl border border-warm-200/90 shadow-soft flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-warm-500 uppercase tracking-wider">
            Total Gross Sales
          </span>
          <div className="text-2xl font-bold font-mono text-warm-900 mt-1">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% vs last week</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <IndianRupee className="w-6 h-6" />
        </div>
      </div>

      {/* Active Orders */}
      <div className="bg-white p-4.5 rounded-2xl border border-warm-200/90 shadow-soft flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-warm-500 uppercase tracking-wider">
            Active Orders
          </span>
          <div className="text-2xl font-bold font-mono text-forest-900 mt-1">
            {activeOrdersCount}
          </div>
          <div className="text-[11px] text-warm-500 mt-1">
            In packing & dispatch stage
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-900 flex items-center justify-center">
          <ShoppingBag className="w-6 h-6" />
        </div>
      </div>

      {/* Stock Alerts */}
      <div className="bg-white p-4.5 rounded-2xl border border-warm-200/90 shadow-soft flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-warm-500 uppercase tracking-wider">
            Stock Attention
          </span>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
            {outOfStockCount} items
          </div>
          <div className="text-[11px] text-warm-500 mt-1">
            Requires restock or mandi PO
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
      </div>

      {/* Kirana Rating & Khata */}
      <div className="bg-white p-4.5 rounded-2xl border border-warm-200/90 shadow-soft flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-warm-500 uppercase tracking-wider">
            Store Rating
          </span>
          <div className="text-2xl font-bold text-warm-900 mt-1 flex items-center gap-1.5">
            <span>{currentStore.rating}</span>
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-[11px] text-warm-500 mt-1">
            Based on {currentStore.reviewsCount} customer ratings
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
          <Users className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

