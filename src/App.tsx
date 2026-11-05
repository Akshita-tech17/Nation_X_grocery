import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { StoreProvider } from './context/StoreContext';
import { MerchantProvider } from './context/MerchantContext';

import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { CartDrawer } from './components/layout/CartDrawer';
import { LocationModal } from './components/layout/LocationModal';
import { CheckoutModal } from './components/retail/CheckoutModal';
import { ProductQuickViewModal } from './components/retail/ProductQuickViewModal';

import { HomePage } from './pages/HomePage';
import { RetailBrowsePage } from './pages/RetailBrowsePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { StoreComparisonPage } from './pages/StoreComparisonPage';
import { WholesalePage } from './pages/WholesalePage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { MerchantStoresPage } from './pages/MerchantStoresPage';
import { MerchantDashboardPage } from './pages/MerchantDashboardPage';

const ToastContainer: React.FC = () => {
  const { quickToast } = useCart();
  if (!quickToast) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none">
      <div className="px-4 py-2.5 rounded-full bg-forest-950/95 backdrop-blur-md text-white text-xs font-semibold shadow-soft-lg border border-forest-800 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>{quickToast}</span>
      </div>
    </div>
  );
};

export const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50/60 text-stone-900 font-sans selection:bg-forest-100 selection:text-forest-950">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 lg:pb-0 w-full">
        <Routes>
          {/* Customer Screens */}
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<RetailBrowsePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/compare" element={<StoreComparisonPage />} />
          <Route path="/wholesale" element={<WholesalePage />} />
          <Route path="/orders" element={<OrderTrackingPage />} />
          <Route path="/stores" element={<MerchantStoresPage />} />

          {/* Merchant Screens */}
          <Route path="/merchant" element={<MerchantDashboardPage />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Global Modals, Drawers & Mobile Nav */}
      <MobileNav />
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
