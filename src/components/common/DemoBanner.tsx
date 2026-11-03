import React, { useState } from 'react';
import { Info, X, ShieldCheck } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-forest-950 text-warm-100 text-xs px-4 py-2 border-b border-forest-900/60">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="leading-tight">
            <strong className="font-semibold text-emerald-300">NationX Grocery Interactive Prototype:</strong>{' '}
            Demonstrating Retail, Wholesale BulkBuy & Local Kirana Storefronts. All products, prices & merchants are curated demo data.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1 text-warm-400 text-[11px]">
            <Info className="w-3.5 h-3.5" /> No real transactions processed
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="text-warm-400 hover:text-white transition-colors p-0.5"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

