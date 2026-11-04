import React from 'react';
import { Store } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';

interface MerchantCardProps {
  store: Store;
}

export const MerchantCard: React.FC<MerchantCardProps> = ({ store }) => {
  const { setSelectedStoreId } = useStore();
  const navigate = useNavigate();

  const handleEnterStore = () => {
    setSelectedStoreId(store.id);
    navigate(`/browse?store=${store.id}`);
  };

  const typeLabels = {
    kirana: 'Neighborhood Kirana',
    supermarket: 'Supermarket',
    organic_depot: 'Organic & Farm Depot',
    wholesale_hub: 'APMC Mandi Wholesale Hub'
  };

  return (
    <div className="bg-card rounded-2xl border border-border hover:border-primary/40 shadow-card hover:shadow-soft transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      {/* Top Banner Image */}
      <div className="relative h-44 bg-muted overflow-hidden">
        <img
          src={store.image}
          alt={store.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

        <div className="absolute top-3 left-3">
          <Badge variant="gray" size="sm" className="bg-card/90 text-foreground font-medium shadow-card border border-border">
            {typeLabels[store.type]}
          </Badge>
        </div>

        {store.verified && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-brand-soft text-primary text-[11px] font-semibold border border-primary/20 shadow-card">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Kirana
            </span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="font-heading font-bold text-base sm:text-lg tracking-tight leading-tight">
            {store.name}
          </h3>
          <p className="text-xs text-white/80 mt-0.5 line-clamp-1">{store.tagline}</p>
        </div>
      </div>

      {/* Details & Features */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          {/* Key Metrics */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <div className="flex items-center gap-1 font-semibold text-foreground">
              <Star className="w-4 h-4 text-marigold fill-marigold" />
              <span>{store.rating}</span>
              <span className="text-muted-foreground font-normal">({store.reviewsCount})</span>
            </div>

            <div className="flex items-center gap-1 font-medium text-foreground/80">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>{store.deliveryTime}</span>
            </div>

            <div className="flex items-center gap-1 font-medium text-foreground/80">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{store.distance}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Managed by <strong className="font-semibold text-foreground">{store.ownerName}</strong> • {store.area}
          </p>

          {/* Features pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {store.features.map(feat => (
              <span
                key={feat}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted border border-border text-[11px] text-foreground/80 font-medium"
              >
                <CheckCircle2 className="w-3 h-3 text-primary" />
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Enter Store Action */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <div className="text-[11px] text-muted-foreground">
            Min Order: <strong className="font-semibold text-foreground">₹{store.minOrder}</strong>
          </div>

          <button
            onClick={handleEnterStore}
            className="px-3.5 py-1.5 rounded-xl bg-brand-soft hover:bg-primary text-primary hover:text-primary-foreground font-semibold text-xs border border-primary/20 hover:border-primary transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Enter Shop</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
