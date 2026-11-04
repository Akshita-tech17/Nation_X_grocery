import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Award, Heart, Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary/50 text-foreground pt-16 pb-12 border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Props Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-border">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-brand-soft text-primary shrink-0 border border-primary/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm">Hyperlocal 15-30m Delivery</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Dispatched from nearby verified kirana partners and local fulfillment hubs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-brand-soft text-primary shrink-0 border border-primary/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm">Wholesale BulkBuy Tiers</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                25kg-50kg sacks, volume slabs & GST credit invoicing for caterers and retailers.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-brand-soft text-primary shrink-0 border border-primary/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm">GI Tagged & Direct Mandi</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                MP Sharbati, Tellicherry Bold, Gir Cow Vedic Bilona and Kashmiri saffron origins.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-brand-soft text-primary shrink-0 border border-primary/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm">100% Quality Guaranteed</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Doorstep replacement guarantee if grains or produce don't meet your quality standard.
              </p>
            </div>
          </div>
        </div>

        {/* Links & Brand Section */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 outline-none">
              <svg viewBox="0 0 32 32" aria-hidden="true" className="w-8 h-8 shrink-0">
                <rect width="32" height="32" rx="9" fill="#007a75"></rect>
                <path d="M9 9 L23 23" stroke="#fdfaf3" strokeWidth="3.4" strokeLinecap="round"></path>
                <path d="M23 9 L9 23" stroke="#f7b828" strokeWidth="3.4" strokeLinecap="round"></path>
              </svg>
              <span className="font-heading font-bold text-xl text-foreground tracking-tight">
                Nation<span className="text-primary">X</span>
                <span className="ml-1.5 text-xs font-semibold text-primary bg-brand-soft px-2 py-0.5 rounded border border-primary/20 uppercase tracking-wide">
                  Grocery
                </span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              NationX Grocery is India's premier integrated commerce platform empowering neighborhood kiranas,
              organic depots, and mandi bulk traders with modern omnichannel logistics and real-time inventory.
            </p>
            <div className="flex items-center gap-2 text-xs text-primary font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
              Serving Khammam, Telangana & Bengaluru hubs
            </div>
          </div>

          {/* Column 1 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
              Daily Retail
            </h5>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link to="/browse" className="hover:text-primary transition-colors">Chakki Fresh Atta</Link></li>
              <li><Link to="/browse" className="hover:text-primary transition-colors">Aged Basmati & Rice</Link></li>
              <li><Link to="/browse" className="hover:text-primary transition-colors">Unpolished Dals & Pulses</Link></li>
              <li><Link to="/browse" className="hover:text-primary transition-colors">A2 Desi Cow Bilona Ghee</Link></li>
              <li><Link to="/browse" className="hover:text-primary transition-colors">Kachi Ghani Mustard Oil</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
              BulkBuy Wholesale
            </h5>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link to="/wholesale" className="hover:text-primary transition-colors">25kg & 50kg Rice Sacks</Link></li>
              <li><Link to="/wholesale" className="hover:text-primary transition-colors">Commercial Sugar Gunny</Link></li>
              <li><Link to="/wholesale" className="hover:text-primary transition-colors">Restaurant Catering Tiers</Link></li>
              <li><Link to="/wholesale" className="hover:text-primary transition-colors">GST Tax Credit Invoices</Link></li>
              <li><Link to="/wholesale" className="hover:text-primary transition-colors">Mandi Quotations & RFQ</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
              Kirana Partners
            </h5>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link to="/stores" className="hover:text-primary transition-colors">Neighborhood Storefronts</Link></li>
              <li><Link to="/merchant" className="hover:text-primary transition-colors">Merchant Portal Login</Link></li>
              <li><Link to="/merchant" className="hover:text-primary transition-colors">Digital Khata Register</Link></li>
              <li><Link to="/merchant" className="hover:text-primary transition-colors">List Your Superstore</Link></li>
              <li><span className="text-primary font-medium">Partner Support: 1800-NX-GROCERY</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & demo disclaimer */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© 2026 NationX Grocery Technologies India Pvt. Ltd. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Indian Kiranas & Smart Consumers
          </p>
        </div>
      </div>
    </footer>
  );
};
