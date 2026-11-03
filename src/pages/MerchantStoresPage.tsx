import React, { useState } from 'react';
import { MERCHANTS } from '../data/merchants';
import { MerchantCard } from '../components/storefronts/MerchantCard';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { CheckCircle2, UserPlus } from 'lucide-react';

export const MerchantStoresPage: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);

  // Partner Form State
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');

  const filteredStores = MERCHANTS.filter(m => {
    if (filterType === 'all') return true;
    return m.type === filterType;
  });

  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPartnerSubmitted(true);
    setTimeout(() => {
      setPartnerSubmitted(false);
      setPartnerModalOpen(false);
      setStoreName('');
      setOwnerName('');
      setPhone('');
      setArea('');
    }, 2000);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header Banner */}
      <section className="bg-forest-950 text-white rounded-3xl p-6 sm:p-10 border border-forest-900 shadow-soft-lg space-y-4">
        <div className="max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              Hyperlocal Kirana Network
            </span>
            <span className="text-xs text-warm-300">Indiranagar • Jayanagar • Koramangala</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Shop From Your Trusted Local Neighborhood Kiranas
          </h1>

          <p className="text-xs sm:text-sm text-warm-200/90 leading-relaxed">
            Support local Indian shopkeepers. Get your staples packed with personal care,
            authentic grain selection, express 15-30 minute doorstep delivery, and kirana khata credit.
          </p>

          <div className="pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPartnerModalOpen(true)}
              icon={<UserPlus className="w-4 h-4" />}
            >
              List Your Kirana Store on NationX
            </Button>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Partner Stores' },
            { id: 'kirana', label: '🏪 Neighborhood Kiranas' },
            { id: 'organic_depot', label: '🌿 Organic Depots' },
            { id: 'wholesale_hub', label: '🚚 Wholesale Mandi Hubs' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === tab.id
                  ? 'bg-forest-900 text-white shadow-sm'
                  : 'bg-white border border-warm-200 text-warm-700 hover:border-warm-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-warm-500">
          Showing <strong className="font-semibold text-warm-800">{filteredStores.length}</strong> verified shops
        </span>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map(store => (
          <MerchantCard key={store.id} store={store} />
        ))}
      </div>

      {/* Partner Registration Modal */}
      <Modal
        isOpen={partnerModalOpen}
        onClose={() => setPartnerModalOpen(false)}
        title="Partner with NationX Grocery"
        subtitle="Digitize your neighborhood kirana with zero setup cost and express delivery integration"
        maxWidth="md"
      >
        {partnerSubmitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-warm-900">Application Submitted!</h4>
            <p className="text-xs text-warm-500 max-w-xs mx-auto">
              Welcome to the family! A local field officer will visit your store within 24 hours to set up your barcode scanner and inventory tablet.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePartnerSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-warm-700 block mb-1">Kirana / Store Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                placeholder="e.g. Mahadev Provision Store"
                className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl focus:ring-1 focus:ring-forest-600 focus:bg-white text-warm-900"
              />
            </div>

            <div>
              <label className="font-semibold text-warm-700 block mb-1">Owner / Manager Name</label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={e => setOwnerName(e.target.value)}
                placeholder="e.g. Suresh Patel"
                className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl focus:ring-1 focus:ring-forest-600 focus:bg-white text-warm-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-warm-700 block mb-1">Mobile Phone (for OTP)</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98..."
                  className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl focus:ring-1 focus:ring-forest-600 focus:bg-white text-warm-900"
                />
              </div>

              <div>
                <label className="font-semibold text-warm-700 block mb-1">Neighborhood Area</label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  placeholder="e.g. Indiranagar, Bengaluru"
                  className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl focus:ring-1 focus:ring-forest-600 focus:bg-white text-warm-900"
                />
              </div>
            </div>

            <div className="p-3 bg-forest-50/70 rounded-xl border border-forest-200 space-y-1 text-forest-900">
              <div className="font-bold text-[11px]">Partner Benefits:</div>
              <div className="text-[11px] text-forest-700">• Instant 15-30m rider pickup for neighborhood orders</div>
              <div className="text-[11px] text-forest-700">• Direct B2B access to Mandi wholesale sacks at distributor rate</div>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" size="md" className="w-full font-bold">
                Submit Kirana Partner Application
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
