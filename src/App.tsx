import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { StoreProvider } from './context/StoreContext';
import { MerchantProvider } from './context/MerchantContext';

import { DemoBanner } from './components/common/DemoBanner';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/layout/CartDrawer';
import { LocationModal } from './components/layout/LocationModal';
import { CheckoutModal } from './components/retail/CheckoutModal';
import { ProductQuickViewModal } from './components/retail/ProductQuickViewModal';

import { HomePage } from './pages/HomePage';
import { RetailBrowsePage } from './pages/RetailBrowsePage';
import { WholesalePage } from './pages/WholesalePage';
import { MerchantStoresPage } from './pages/MerchantStoresPage';
import { MerchantDashboardPage } from './pages/MerchantDashboardPage';

const ToastContainer: React.FC = () => {
  const { quickToast } = useCart();
  if (!quickToast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none">
      <div className="px-4 py-2.5 rounded-full bg-forest-950/95 backdrop-blur-md text-white text-xs font-semibold shadow-soft-lg border border-forest-800 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>{quickToast}</span>
      </div>
    </div>
  );
};

export const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-warm-50 text-warm-900 font-sans selection:bg-forest-100 selection:text-forest-950">
      <DemoBanner />
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<RetailBrowsePage />} />
          <Route path="/wholesale" element={<WholesalePage />} />
          <Route path="/stores" element={<MerchantStoresPage />} />
          <Route path="/merchant" element={<MerchantDashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <LocationModal />
      <CheckoutModal />
      <ProductQuickViewModal />
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MerchantProvider>
        <StoreProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </StoreProvider>
      </MerchantProvider>
    </BrowserRouter>
  );
};

export default App;
