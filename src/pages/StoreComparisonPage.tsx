import React, { useState } from 'react';
import { MERCHANTS } from '../data/merchants';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import {
  Star,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Scale
} from 'lucide-react';

export const StoreComparisonPage: React.FC = () => {
  const { currentLocation, setSelectedStoreId } = useStore();
  const navigate = useNavigate();

  const [selectedStores, setSelectedStores] = useState<string[]>(
    MERCHANTS.slice(0, 3).map(m => m.id)
  );

  const toggleSelectStore = (id: string) => {
    setSelectedStores(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 2) return prev; // Keep at least 2 for comparison
        return prev.filter(sId => sId !== id);
      } else {
        if (prev.length >= 4) return prev; // Max 4 side-by-side
        return [...prev, id];
      }
    });
  };

  const storesToCompare = MERCHANTS.filter(m => selectedStores.includes(m.id));

  const handleSelectShop = (storeId: string) => {
    setSelectedStoreId(storeId);
    navigate(`/browse?store=${storeId}`);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-soft text-primary">
              <Scale className="w-4 h-4" />
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Compare Neighborhood Storefronts
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Compare delivery speed, minimum orders, ratings, and special services for delivery to <strong>{currentLocation.area}</strong>
          </p>
        </div>

        {/* Store Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="font-semibold text-muted-foreground mr-1">Select Stores:</span>
          {MERCHANTS.map(m => {
            const isChecked = selectedStores.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => toggleSelectStore(m.id)}
                className={`px-3 py-1.5 rounded-xl border font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isChecked
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-card text-foreground border-border hover:border-primary/40'
                }`}
              >
                {m.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Table / Matrix */}
      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="py-4 px-5 font-bold text-muted-foreground uppercase tracking-wider text-[11px] w-48">
                  Feature / Store
                </th>
                {storesToCompare.map(store => (
                  <th key={store.id} className="py-4 px-5 text-foreground w-64 align-top">
                    <div className="space-y-2">
                      <img
                        src={store.image}
                        alt={store.name}
                        className="w-full h-28 object-cover rounded-xl border border-border"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-foreground line-clamp-1">{store.name}</span>
                          {store.verified && <ShieldCheck className="w-4 h-4 text-primary shrink-0" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{store.area}, {store.city}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleSelectShop(store.id)}
                        className="w-full font-bold"
                        icon={<ArrowRight className="w-3.5 h-3.5" />}
                        iconPosition="right"
                      >
                        Shop This Store
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {/* Store Type */}
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="py-3.5 px-5 font-semibold text-muted-foreground">Store Classification</td>
                {storesToCompare.map(s => (
                  <td key={s.id} className="py-3.5 px-5 font-bold text-foreground capitalize">
                    {s.type.replace('_', ' ')}
                  </td>
                ))}
              </tr>

              {/* Delivery ETA */}
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="py-3.5 px-5 font-semibold text-muted-foreground">Express Delivery Time</td>
                {storesToCompare.map(s => (
                  <td key={s.id} className="py-3.5 px-5">
                    <span className="inline-flex items-center gap-1 text-primary bg-brand-soft border border-primary/20 px-2 py-0.5 rounded-md font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      {s.deliveryTime}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Distance */}
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="py-3.5 px-5 font-semibold text-muted-foreground">Distance from Destination</td>
                {storesToCompare.map(s => (
                  <td key={s.id} className="py-3.5 px-5 font-bold text-foreground font-mono">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>{s.distance}</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Customer Rating */}
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="py-3.5 px-5 font-semibold text-muted-foreground">Customer Rating</td>
                {storesToCompare.map(s => (
                  <td key={s.id} className="py-3.5 px-5">
                    <div className="flex items-center gap-1 font-bold text-foreground">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>{s.rating}</span>
                      <span className="text-muted-foreground font-normal">({s.reviewsCount} reviews)</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Min Order */}
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="py-3.5 px-5 font-semibold text-muted-foreground">Minimum Order Amount</td>
                {storesToCompare.map(s => (
                  <td key={s.id} className="py-3.5 px-5 font-bold font-mono text-foreground">
                    ₹{s.minOrder}
                  </td>
                ))}
              </tr>

              {/* Store Services & Features */}
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="py-3.5 px-5 font-semibold text-muted-foreground align-top">Services & Highlights</td>
                {storesToCompare.map(s => (
                  <td key={s.id} className="py-3.5 px-5 align-top">
                    <ul className="space-y-1.5">
                      {s.features.map(f => (
                        <li key={f} className="flex items-center gap-1.5 text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
