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
    <div className="bg-white rounded-2xl border border-warm-200/90 hover:border-forest-400 shadow-soft hover:shadow-soft-md transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      {/* Top Banner Image */}
      <div className="relative h-44 bg-warm-100 overflow-hidden">
        <img
          src={store.image}
          alt={store.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-warm-950/80 via-warm-950/20 to-transparent" />

        <div className="absolute top-3 left-3">
          <Badge variant="gray" size="sm" className="backdrop-blur-md bg-white/90 text-warm-900 font-bold">
            {typeLabels[store.type]}
          </Badge>
        </div>

        {store.verified && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold backdrop-blur-md shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Kirana
            </span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="font-bold text-base sm:text-lg tracking-tight leading-tight">
            {store.name}
          </h3>
          <p className="text-xs text-warm-200 mt-0.5 line-clamp-1">{store.tagline}</p>
        </div>
      </div>

      {/* Details & Features */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          {/* Key Metrics */}
          <div className="flex items-center justify-between text-xs text-warm-600 pt-1">
            <div className="flex items-center gap-1 font-bold text-warm-900">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{store.rating}</span>
              <span className="text-warm-400 font-normal">({store.reviewsCount})</span>
            </div>

            <div className="flex items-center gap-1 font-medium text-warm-700">
              <Clock className="w-3.5 h-3.5 text-forest-700" />
              <span>{store.deliveryTime}</span>
            </div>

            <div className="flex items-center gap-1 font-medium text-warm-700">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{store.distance}</span>
            </div>
          </div>

          <p className="text-xs text-warm-500">
            Managed by <strong className="font-semibold text-warm-800">{store.ownerName}</strong> • {store.area}
          </p>

          {/* Features pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {store.features.map(feat => (
              <span
                key={feat}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-warm-50 border border-warm-200 text-[11px] text-warm-700 font-medium"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Enter Store Action */}
        <div className="pt-3 border-t border-warm-100 flex items-center justify-between">
          <div className="text-[11px] text-warm-500">
            Min Order: <strong className="font-semibold text-warm-800">₹{store.minOrder}</strong>
          </div>

          <button
            onClick={handleEnterStore}
            className="px-3.5 py-1.5 rounded-xl bg-forest-50 hover:bg-forest-900 text-forest-900 hover:text-white font-bold text-xs border border-forest-300 hover:border-forest-900 transition-all flex items-center gap-1.5 group-hover:bg-forest-900 group-hover:text-white"
          >
            <span>Enter Shop</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

