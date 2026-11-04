import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { useMerchant } from '../../context/MerchantContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Order } from '../../types';
import { MERCHANTS } from '../../data/merchants';
import { partitionCartIntoSuborders } from '../../utils/orderPartitioning';
import {
  MapPin,
  Clock,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  QrCode,
  Building,
  Check,
  Package,
  Store
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const navigate = useNavigate();
  const { checkoutModalOpen, setCheckoutModalOpen, cart, subtotal, originalTotal, totalSavings, clearCart } = useCart();
  const { currentLocation } = useStore();
  const { addNewOrder } = useMerchant();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [placedOrderId, setPlacedOrderId] = useState<string>('');

  // Form states
  const [name, setName] = useState('Ananya Sen');
  const [phone, setPhone] = useState('+91 98450 11928');
  const [street, setStreet] = useState('Flat 301, Palm Meadows, 14th Main');
  const [addressType, setAddressType] = useState<'home' | 'work' | 'business'>('home');
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');

  // Delivery slot
  const [selectedSlot, setSelectedSlot] = useState('Express 15-25 Mins (Fastest)');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!checkoutModalOpen) return null;

  const hasWholesaleItems = cart.some(item => item.mode === 'wholesale');
  const deliveryFee = subtotal >= 499 ? 0 : 39;
  const finalPayable = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const newId = `NX-${Math.floor(10000 + Math.random() * 90000)}`;
      setPlacedOrderId(newId);

      // Group items into separate merchant suborders (PDF Section 5.2)
      const suborders = partitionCartIntoSuborders(cart, {
        orderId: newId,
        defaultArea: currentLocation.area,
        defaultEta: currentLocation.eta,
        hasWholesaleItems,
        merchantsCatalog: MERCHANTS
      });

      const primaryStore = suborders[0] || {
        storeId: 'store-sharma-kirana',
        storeName: 'Sharmaji Kirana & Superstore'
      };
      const isMultiStore = suborders.length > 1;

      const newOrder: Order = {
        id: newId,
        date: 'Just now',
        items: [...cart],
        totalAmount: finalPayable,
        originalAmount: originalTotal,
        savings: totalSavings,
        orderType: hasWholesaleItems ? 'wholesale' : 'retail',
        status: 'placed',
        storeId: primaryStore.storeId,
        storeName: isMultiStore ? `Multi-Shop Order (${suborders.length} Stores)` : primaryStore.storeName,
        suborders,
        deliveryAddress: {
          name,
          phone,
          street,
          area: currentLocation.area,
          city: currentLocation.city,
          pincode: currentLocation.pincode,
          addressType,
          businessName: businessName || undefined,
          gstNumber: gstNumber || undefined
        },
        paymentMethod: paymentMethod === 'upi' ? 'UPI (Instant Demo)' : paymentMethod === 'cod' ? 'Cash/Credit on Delivery' : 'Online Banking',
        paymentStatus: 'paid',
        estimatedDelivery: hasWholesaleItems ? 'Today by 3:30 PM (Mandi Mini-Truck)' : `${currentLocation.eta}`
      };

      addNewOrder(newOrder);
      clearCart();
      setIsProcessing(false);
      setStep(4); // Success screen
    }, 1200);
  };

  return (
    <Modal
      isOpen={checkoutModalOpen}
      onClose={() => {
        setCheckoutModalOpen(false);
        setStep(1);
      }}
      title={step === 4 ? undefined : `Checkout • Step ${step} of 3`}
      subtitle={step === 4 ? undefined : 'Complete your grocery delivery with verified local kirana dispatch'}
      maxWidth={step === 4 ? 'lg' : 'xl'}
    >
      {step === 1 && (
        <div className="space-y-4">
          {new Set(cart.map(i => i.product.merchantId)).size > 1 && (
            <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-forest-700 shrink-0" />
                <span className="font-semibold text-stone-800">
                  Multi-Shop Order: <strong className="text-forest-900">{new Set(cart.map(i => i.product.merchantId)).size} stores</strong> fulfilling
                </span>
              </div>
              <Badge variant="forest" size="sm">Independent Dispatch</Badge>
            </div>
          )}

          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-forest-700" />
            1. Delivery Address & Contact
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-forest-600 focus:bg-white text-stone-900"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Mobile Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-forest-600 focus:bg-white text-stone-900"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="font-semibold text-stone-700 block mb-1">House/Flat No., Building & Street</label>
            <input
              type="text"
              value={street}
              onChange={e => setStreet(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-forest-600 focus:bg-white text-stone-900"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-stone-700">Address Label:</span>
            {(['home', 'work', 'business'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setAddressType(type)}
                className={`px-3 py-1 rounded-lg capitalize font-medium border transition-colors ${
                  addressType === type
                    ? 'bg-forest-900 text-white border-forest-900'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Area Pincode Locked to Header Selection */}
          <div className="p-3 bg-forest-50/70 rounded-xl border border-forest-200 text-xs flex items-center justify-between">
            <div>
              <span className="font-bold text-forest-950">
                {currentLocation.area}, {currentLocation.city}
              </span>
              <div className="text-stone-500 font-mono text-[11px]">PIN: {currentLocation.pincode} • {currentLocation.eta}</div>
            </div>
            <Badge variant="forest">Selected Zone</Badge>
          </div>

          {/* Business GSTIN option if wholesale */}
          <div className="pt-2 border-t border-stone-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-700" />
                GST Invoice for Tax Credit (Optional)
              </span>
              {hasWholesaleItems && (
                <Badge variant="blue" size="sm">Recommended for BulkBuy</Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="Business / Restaurant Name"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
              />
              <input
                type="text"
                value={gstNumber}
                onChange={e => setGstNumber(e.target.value)}
                placeholder="15-digit GSTIN (e.g. 29AAAAA0000A1Z5)"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 uppercase font-mono"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              variant="primary"
              size="md"
              onClick={() => setStep(2)}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Continue to Delivery Slot
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-forest-700" />
            2. Choose Delivery Slot & Logistics
          </h4>

          <div className="space-y-2.5">
            {[
              {
                title: '⚡ Express Kirana Delivery',
                desc: `Direct from nearest verified shop (${currentLocation.eta})`,
                badge: 'Recommended'
              },
              {
                title: '📦 Scheduled Evening Slot (06:00 PM - 09:00 PM)',
                desc: 'Consolidated drop after work hours',
                badge: 'Standard'
              },
              {
                title: '🚚 Mandi Bulk Mini-Truck Freight (Next Morning 08:00 AM)',
                desc: 'Dedicated tailgate loading for 25kg+ bags and restaurant cartons',
                badge: hasWholesaleItems ? 'B2B Default' : 'Heavy Packs'
              }
            ].map(slot => (
              <label
                key={slot.title}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedSlot === slot.title
                    ? 'border-forest-600 bg-forest-50/70 text-forest-950 font-semibold shadow-sm'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/40 text-stone-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="deliverySlot"
                    checked={selectedSlot === slot.title}
                    onChange={() => setSelectedSlot(slot.title)}
                    className="mt-1 text-forest-700 focus:ring-forest-600"
                  />
                  <div>
                    <div className="text-xs font-bold text-stone-900">{slot.title}</div>
                    <div className="text-[11px] text-stone-500">{slot.desc}</div>
                  </div>
                </div>
                <Badge variant={slot.badge === 'Recommended' ? 'forest' : 'stone'} size="sm">
                  {slot.badge}
                </Badge>
              </label>
            ))}
          </div>

          <div className="pt-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
              Back to Address
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setStep(3)}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Continue to Payment
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-forest-700" />
            3. Payment Method (Interactive Demo)
          </h4>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setPaymentMethod('upi')}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all ${
                paymentMethod === 'upi'
                  ? 'border-forest-600 bg-forest-50/70 font-semibold text-forest-950'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                <QrCode className="w-4 h-4 text-forest-700" />
                <span>UPI (GPay / PhonePe)</span>
              </div>
              <span className="text-[10px] text-stone-500">Zero surcharge • Instant</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all ${
                paymentMethod === 'card'
                  ? 'border-forest-600 bg-forest-50/70 font-semibold text-forest-950'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                <CreditCard className="w-4 h-4 text-forest-700" />
                <span>Credit / Debit Cards</span>
              </div>
              <span className="text-[10px] text-stone-500">Visa, Mastercard, RuPay</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('netbanking')}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all ${
                paymentMethod === 'netbanking'
                  ? 'border-forest-600 bg-forest-50/70 font-semibold text-forest-950'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                <Building className="w-4 h-4 text-forest-700" />
                <span>Net Banking / RTGS</span>
              </div>
              <span className="text-[10px] text-stone-500">Corporate & B2B transfers</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('cod')}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all ${
                paymentMethod === 'cod'
                  ? 'border-forest-600 bg-forest-50/70 font-semibold text-forest-950'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-forest-700" />
                <span>Cash on Delivery</span>
              </div>
              <span className="text-[10px] text-stone-500">Pay cash or UPI at door</span>
            </button>
          </div>

          {/* Order Summary Pill */}
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Items Total ({cart.length} types)</span>
              <span>₹{subtotal}</span>
            </div>
            {totalSavings > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Wholesale & Promo Savings</span>
                <span>-₹{totalSavings}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <span>Delivery Charges</span>
              <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-stone-900 pt-1.5 border-t border-stone-200">
              <span>Final Payable</span>
              <span className="text-forest-900 font-mono text-base">₹{finalPayable}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              loading={isProcessing}
              onClick={handlePlaceOrder}
              icon={<ShieldCheck className="w-4 h-4" />}
            >
              Place Order • ₹{finalPayable}
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="text-center py-6 px-2 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-sm">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-forest-50 text-forest-900 font-mono font-bold text-xs mb-2">
              Order ID: #{placedOrderId}
            </span>
            <h3 className="text-xl font-bold text-stone-900">
              Order Confirmed & Sent to Kirana!
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Your order has been routed to <strong>Sharmaji Kirana & Superstore</strong>.
              Estimated delivery: <strong>{currentLocation.eta}</strong>.
            </p>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-left max-w-sm mx-auto space-y-1">
            <div className="font-semibold text-stone-800">Dispatch Summary:</div>
            <div className="text-stone-600">• Destination: {name}, {street}, {currentLocation.pincode}</div>
            <div className="text-stone-600">• Slot: {selectedSlot}</div>
            <div className="text-forest-800 font-bold">• Check Order Tracking or Merchant Hub to watch real-time fulfillment!</div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setCheckoutModalOpen(false);
                setStep(1);
                navigate(`/orders?id=${placedOrderId}`);
              }}
              icon={<Package className="w-4 h-4" />}
            >
              Track Order Live
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                setCheckoutModalOpen(false);
                setStep(1);
              }}
            >
              Done Shopping
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
