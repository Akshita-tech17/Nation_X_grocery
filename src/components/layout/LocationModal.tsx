import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useStore, POPULAR_LOCATIONS, LocationInfo } from '../../context/StoreContext';
import { MapPin, Navigation, Check } from 'lucide-react';
import { Button } from '../common/Button';

export const LocationModal: React.FC = () => {
  const { isLocationModalOpen, setIsLocationModalOpen, currentLocation, setCurrentLocation } = useStore();
  const [customPin, setCustomPin] = useState('');
  const [pinError, setPinError] = useState('');

  const handleSelectLocation = (loc: LocationInfo) => {
    setCurrentLocation(loc);
    setIsLocationModalOpen(false);
  };

  const handleCustomPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPin.length !== 6 || !/^\d+$/.test(customPin)) {
      setPinError('Please enter a valid 6-digit Indian PIN code');
      return;
    }
    const newLoc: LocationInfo = {
      city: 'Custom Location',
      area: `PIN ${customPin} Area`,
      pincode: customPin,
      eta: '20-30 mins'
    };
    setCurrentLocation(newLoc);
    setIsLocationModalOpen(false);
    setPinError('');
    setCustomPin('');
  };

  return (
    <Modal
      isOpen={isLocationModalOpen}
      onClose={() => setIsLocationModalOpen(false)}
      title="Choose Delivery Location"
      subtitle="Select your delivery neighborhood to see instant kirana availability & delivery ETAs"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Custom Pincode Form */}
        <form onSubmit={handleCustomPinSubmit} className="space-y-2">
          <label className="text-xs font-semibold text-warm-700 block">
            Enter Indian Pincode
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={customPin}
              onChange={e => {
                setCustomPin(e.target.value);
                setPinError('');
              }}
              placeholder="e.g. 560038"
              className="flex-1 px-3.5 py-2 text-sm bg-warm-50 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white text-warm-900 font-mono tracking-wider"
            />
            <Button type="submit" size="sm" variant="primary">
              Apply
            </Button>
          </div>
          {pinError && <p className="text-xs text-rose-600 font-medium">{pinError}</p>}
        </form>

        <div className="pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-warm-400 mb-2.5">
            Popular Neighborhoods & Wholesale Hubs
          </p>
          <div className="grid gap-2">
            {POPULAR_LOCATIONS.map(loc => {
              const isSelected = loc.pincode === currentLocation.pincode;
              return (
                <button
                  key={loc.pincode}
                  type="button"
                  onClick={() => handleSelectLocation(loc)}
                  className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-forest-600 bg-forest-50/70 text-forest-950 font-semibold'
                      : 'border-warm-200 hover:border-warm-300 hover:bg-warm-50 text-warm-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? 'bg-forest-600 text-white' : 'bg-warm-100 text-warm-600'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm">
                        {loc.area}, <span className="text-warm-500 font-normal">{loc.city}</span>
                      </div>
                      <div className="text-xs text-warm-500 font-mono">PIN: {loc.pincode}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ⚡ {loc.eta}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-forest-700 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2 border-t border-warm-100">
          <button
            type="button"
            onClick={() => {
              handleSelectLocation(POPULAR_LOCATIONS[0]);
            }}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-forest-800 hover:text-forest-950 p-2 rounded-lg hover:bg-forest-50 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-forest-600" />
            Use current GPS device location
          </button>
        </div>
      </div>
    </Modal>
  );
};
