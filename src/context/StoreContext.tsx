import React, { createContext, useContext, useState } from 'react';
import { ShoppingMode } from '../types';
import { LocationInfo, POPULAR_LOCATIONS } from '../data/locations';
export type { LocationInfo };


interface StoreContextType {
  activeMode: ShoppingMode;
  setActiveMode: (mode: ShoppingMode) => void;
  currentLocation: LocationInfo;
  setCurrentLocation: (loc: LocationInfo) => void;
  selectedStoreId: string | null;
  setSelectedStoreId: (storeId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  selectedProductQuickView: string | null;
  setSelectedProductQuickView: (prodId: string | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeMode, setActiveMode] = useState<ShoppingMode>('retail');
  const [currentLocation, setCurrentLocation] = useState<LocationInfo>(POPULAR_LOCATIONS[0]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedProductQuickView, setSelectedProductQuickView] = useState<string | null>(null);

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nationx_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const next = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      localStorage.setItem('nationx_wishlist', JSON.stringify(next));
      return next;
    });
  };

  return (
    <StoreContext.Provider
      value={{
        activeMode,
        setActiveMode,
        currentLocation,
        setCurrentLocation,
        selectedStoreId,
        setSelectedStoreId,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        isLocationModalOpen,
        setIsLocationModalOpen,
        wishlist,
        toggleWishlist,
        selectedProductQuickView,
        setSelectedProductQuickView
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};

