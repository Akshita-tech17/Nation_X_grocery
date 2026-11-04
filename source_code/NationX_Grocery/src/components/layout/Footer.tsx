import React from 'react';
import { Link } from 'react-router-dom';
import { Boxes, ShieldCheck, Truck, Award, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-forest-950 text-warm-200 pt-16 pb-12 border-t border-forest-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Props Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-forest-900/80">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-forest-900 text-emerald-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Hyperlocal 15-30m Delivery</h4>
              <p className="text-xs text-warm-400 mt-1 leading-relaxed">
                Dispatched from nearby verified kirana partners and temperature-controlled hubs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-forest-900 text-emerald-400 shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Wholesale BulkBuy Tiers</h4>
              <p className="text-xs text-warm-400 mt-1 leading-relaxed">
                25kg-50kg sacks, volume slabs & GST credit invoicing for caterers and restaurants.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-forest-900 text-emerald-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">GI Tagged & Direct Mandi</h4>
              <p className="text-xs text-warm-400 mt-1 leading-relaxed">
                MP Sharbati, Tellicherry Bold, Gir Cow Vedic Bilona and Kashmiri saffron origins.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-forest-900 text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Quality Guaranteed</h4>
              <p className="text-xs text-warm-400 mt-1 leading-relaxed">
                Hassle-free replacement at your doorstep if grains or produce don't meet your standard.
              </p>
            </div>
          </div>
        </div>

        {/* Links & Brand Section */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-forest-950 flex items-center justify-center font-bold font-display">
                <Boxes className="w-5 h-5" />
              </div>
              <span className="font-display font-extrabold text-xl text-white">
                Nation<span className="text-emerald-400">X</span> Grocery
              </span>
            </div>
            <p className="text-xs text-warm-300 leading-relaxed max-w-sm">
              NationX Grocery is India's premier integrated commerce platform empowering neighborhood kiranas,
              organic depots, and mandi bulk traders with modern omnichannel logistics and real-time inventory.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Serving Bengaluru, Mumbai & Delhi NCR hubs
            </div>
          </div>

          {/* Column 1 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-warm-100 mb-3">
              Daily Retail
            </h5>
            <ul className="space-y-2 text-xs text-warm-400">
              <li><Link to="/browse" className="hover:text-white transition-colors">Chakki Fresh Atta</Link></li>
              <li><Link to="/browse" className="hover:text-white transition-colors">Aged Basmati & Rice</Link></li>
              <li><Link to="/browse" className="hover:text-white transition-colors">Unpolished Dals & Pulses</Link></li>
              <li><Link to="/browse" className="hover:text-white transition-colors">A2 Desi Cow Bilona Ghee</Link></li>
              <li><Link to="/browse" className="hover:text-white transition-colors">Kachi Ghani Mustard Oil</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-warm-100 mb-3">
              BulkBuy Wholesale
            </h5>
            <ul className="space-y-2 text-xs text-warm-400">
              <li><Link to="/wholesale" className="hover:text-white transition-colors">25kg & 50kg Rice Sacks</Link></li>
              <li><Link to="/wholesale" className="hover:text-white transition-colors">Commercial Sugar Gunny</Link></li>
              <li><Link to="/wholesale" className="hover:text-white transition-colors">Restaurant Catering Tiers</Link></li>
              <li><Link to="/wholesale" className="hover:text-white transition-colors">GST Tax Credit Invoices</Link></li>
              <li><Link to="/wholesale" className="hover:text-white transition-colors">Pallet Freight Estimator</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-warm-100 mb-3">
              Kirana Partners
            </h5>
            <ul className="space-y-2 text-xs text-warm-400">
              <li><Link to="/stores" className="hover:text-white transition-colors">Neighborhood Storefronts</Link></li>
              <li><Link to="/merchant" className="hover:text-white transition-colors">Merchant Portal Login</Link></li>
              <li><Link to="/merchant" className="hover:text-white transition-colors">Digital Khata Register</Link></li>
              <li><Link to="/merchant" className="hover:text-white transition-colors">List Your Superstore</Link></li>
              <li><span className="text-emerald-400 font-medium">Partner Support: 1800-NX-GROCERY</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & demo disclaimer */}
        <div className="pt-8 border-t border-forest-900 flex flex-col sm:flex-row items-center justify-between text-xs text-warm-400 gap-4">
          <p>© 2026 NationX Grocery Technologies India Pvt. Ltd. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-[11px] text-warm-400">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Indian Kiranas & Smart Consumers
          </p>
        </div>
      </div>
    </footer>
  );
};
