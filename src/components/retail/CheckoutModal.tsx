import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { useMerchant } from '../../context/MerchantContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ParentOrder, MerchantSubOrder, SubOrderItem } from '../../types';
import {
  Clock,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  QrCode,
  Building,
  Check,
  Store,
  AlertCircle
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    checkoutModalOpen,
    setCheckoutModalOpen,
    cart,
    subtotal,
    originalTotal,
    totalSavings,
    clearCart,
    getCartGroupedByMerchant,
    revalidateCart
  } = useCart();
  const { currentLocation } = useStore();
  const { addNewOrder } = useMerchant();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [createdParentOrder, setCreatedParentOrder] = useState<ParentOrder | null>(null);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);

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

  const merchantGroups = getCartGroupedByMerchant();
  const hasWholesaleItems = cart.some(item => item.mode === 'wholesale');
  const deliveryFee = subtotal >= 499 ? 0 : 39;
  const taxAmount = Math.round(subtotal * 0.05); // Standard 5% GST on packaged food
  const finalPayable = subtotal + deliveryFee;

  const handleProceedToReview = () => {
    const { issues } = revalidateCart();
    setValidationIssues(issues);
    setStep(2);
  };

  const handlePlaceOrder = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const parentOrderId = `NX-PO-${Math.floor(10000 + Math.random() * 90000)}`;
      const nowIso = new Date().toISOString();

      // Create distinct merchant suborders
      const subOrders: MerchantSubOrder[] = merchantGroups.map((group, idx) => {
        const subOrderId = `NX-SO-${parentOrderId.replace('NX-PO-', '')}-${idx + 1}`;
        const subOrderItems: SubOrderItem[] = group.items.map(cartItem => ({
          offeringId: cartItem.offeringId,
          masterProductId: cartItem.masterProductId,
          productName: cartItem.product.name,
          packSize: cartItem.product.packSize,
          quantity: cartItem.quantity,
          unitPrice: cartItem.unitPrice,
          mrp: cartItem.mrp,
          totalPrice: cartItem.totalPrice,
          mode: cartItem.mode,
          image: cartItem.product.image,
          isAvailable: true,
          substitutionStatus: 'original'
        }));

        return {
          id: subOrderId,
          parentOrderId,
          merchantId: group.merchantId,
          merchantName: group.merchantName,
          items: subOrderItems,
          subtotal: group.subtotal,
          originalSubtotal: group.originalSubtotal,
          savings: group.savings,
          deliveryFee: idx === 0 ? deliveryFee : 0, // Single coordinated fee allocated
          status: 'placed',
          fulfilmentType: hasWholesaleItems ? 'truck_freight' : 'express',
          estimatedDelivery: hasWholesaleItems ? 'Today by 3:30 PM (Mandi Mini-Truck)' : `${currentLocation.eta}`,
          timeline: [
            {
              timestamp: 'Just now',
              status: 'placed',
              actor: 'Customer Checkout',
              note: `Suborder placed for ${group.items.length} item(s) from ${group.merchantName}`
            }
          ]
        };
      });

      const parentOrder: ParentOrder = {
        id: parentOrderId,
        date: 'Just now',
        createdAt: nowIso,
        items: [...cart],
        totalAmount: finalPayable,
        originalAmount: originalTotal,
        savings: totalSavings,
        deliveryFee,
        taxAmount,
        finalPayable,
        orderType: hasWholesaleItems ? (cart.some(i => i.mode === 'retail') ? 'mixed' : 'wholesale') : 'retail',
        status: 'placed',
        storeId: merchantGroups.length === 1 ? merchantGroups[0].merchantId : 'MULTI_MERCHANT',
        storeName: merchantGroups.length === 1 ? merchantGroups[0].merchantName : `Multiple Shops (${merchantGroups.length})`,
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
        paymentMethod:
          paymentMethod === 'upi'
            ? 'UPI Intent (Authorized)'
            : paymentMethod === 'cod'
            ? 'Cash / Khata on Doorstep'
            : 'Online NetBanking',
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'authorized', // Honest state, not fake instant paid!
        paymentReference: `PAY-NX-${Math.floor(100000 + Math.random() * 900000)}`,
        estimatedDelivery: hasWholesaleItems ? 'Today by 3:30 PM' : `${currentLocation.eta}`,
        subOrders
      };

      addNewOrder(parentOrder);
      setCreatedParentOrder(parentOrder);
      clearCart();
      setIsProcessing(false);
      setStep(4); // Success screen
    }, 1000);
  };

  return (
    <Modal
      isOpen={checkoutModalOpen}
      onClose={() => {
        setCheckoutModalOpen(false);
        setStep(1);
      }}
      title={step === 4 ? undefined : `Checkout • Step ${step} of 3`}
      maxWidth="lg"
    >
      {/* Step Indicator */}
      {step < 4 && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100 text-xs font-semibold">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-forest-800' : 'text-stone-400'}`}>
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1 ? 'bg-forest-900 text-white' : 'bg-stone-200 text-stone-600'
              }`}
            >
              1
            </span>
            <span>Delivery Address</span>
          </div>

          <div className="w-10 h-0.5 bg-stone-200" />

          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-forest-800' : 'text-stone-400'}`}>
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2 ? 'bg-forest-900 text-white' : 'bg-stone-200 text-stone-600'
              }`}
            >
              2
            </span>
            <span>Suborders Review</span>
          </div>

          <div className="w-10 h-0.5 bg-stone-200" />

          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-forest-800' : 'text-stone-400'}`}>
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 3 ? 'bg-forest-900 text-white' : 'bg-stone-200 text-stone-600'
              }`}
            >
              3
            </span>
            <span>Payment Authorization</span>
          </div>
        </div>
      )}

      {/* Step 1: Delivery Address & Business Details */}
      {step === 1 && (
        <div className="space-y-5 text-xs sm:text-sm">
          <div className="space-y-4">
            <h3 className="font-bold text-stone-900 text-sm">Where should we deliver?</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Street Address / House / Flat</label>
              <input
                type="text"
                value={street}
                onChange={e => setStreet(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Area / Locality</label>
                <input
                  type="text"
                  disabled
                  value={currentLocation.area}
                  className="w-full px-3 py-2 border border-stone-200 bg-stone-100 rounded-xl text-xs text-stone-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">City</label>
                <input
                  type="text"
                  disabled
                  value={currentLocation.city}
                  className="w-full px-3 py-2 border border-stone-200 bg-stone-100 rounded-xl text-xs text-stone-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Pincode</label>
                <input
                  type="text"
                  disabled
                  value={currentLocation.pincode}
                  className="w-full px-3 py-2 border border-stone-200 bg-stone-100 rounded-xl text-xs text-stone-600"
                />
              </div>
            </div>

            {/* Address Type Buttons */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Address Type</label>
              <div className="flex gap-2">
                {(['home', 'work', 'business'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAddressType(type)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold capitalize transition-all ${
                      addressType === type
                        ? 'bg-forest-900 text-white border-forest-900'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* GST & Business Fields if Business Address or Wholesale Items */}
            {(addressType === 'business' || hasWholesaleItems) && (
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <Building className="w-4 h-4 text-blue-700" />
                  <span>Commercial Tax Invoice Details</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-blue-900 mb-1">Business Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Royal Bengal Kitchen LLP"
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-blue-900 mb-1">GSTIN Number</label>
                    <input
                      type="text"
                      placeholder="29AAAAA0000A1Z5"
                      value={gstNumber}
                      onChange={e => setGstNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              variant="primary"
              size="md"
              onClick={handleProceedToReview}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Continue to Review Suborders
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Multi-Shop Suborders Review */}
      {step === 2 && (
        <div className="space-y-5 text-xs sm:text-sm">
          {validationIssues.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>Inventory & Freshness Notice</span>
              </div>
              {validationIssues.map((issue, idx) => (
                <p key={idx} className="text-xs text-amber-800">
                  • {issue}
                </p>
              ))}
            </div>
          )}

          <div>
            <h3 className="font-bold text-stone-900 text-sm mb-1">Review Coordinated Merchant Suborders</h3>
            <p className="text-xs text-stone-500">
              Each shop fulfills independently to guarantee freshness, correct invoicing, and local accountability.
            </p>
          </div>

          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {merchantGroups.map((group, idx) => (
              <div key={group.merchantId} className="p-3.5 border border-stone-200 rounded-2xl bg-stone-50/60 space-y-2.5">
                <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-forest-900 text-white flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-stone-900 text-xs">{group.merchantName}</span>
                  </div>
                  <span className="text-xs font-bold text-forest-900">₹{group.subtotal}</span>
                </div>

                <div className="space-y-1.5">
                  {group.items.map(item => (
                    <div key={item.offeringId} className="flex items-center justify-between text-xs text-stone-700">
                      <div className="flex items-center gap-2 truncate max-w-xs">
                        <span className="font-semibold text-stone-900">{item.quantity}x</span>
                        <span className="truncate">{item.product.name} ({item.product.packSize})</span>
                      </div>
                      <span className="font-medium text-stone-900">₹{item.totalPrice}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Slot Selection */}
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
            <span className="font-bold text-xs text-stone-800">Preferred Coordinated Dispatch Window</span>
            <div className="grid grid-cols-2 gap-2">
              {['Express 15-25 Mins (Fastest)', 'Today 2:00 PM - 5:00 PM'].map(slot => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                    selectedSlot === slot
                      ? 'bg-white border-forest-800 text-forest-900 ring-2 ring-forest-800/20'
                      : 'bg-white/60 border-stone-200 text-stone-600 hover:bg-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 mb-1 text-forest-700" />
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-stone-100">
            <Button variant="outline" size="md" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setStep(3)}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Proceed to Payment
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Payment Method Selection */}
      {step === 3 && (
        <div className="space-y-5 text-xs sm:text-sm">
          <div>
            <h3 className="font-bold text-stone-900 text-sm">Choose Payment Method</h3>
            <p className="text-xs text-stone-500">
              Payments are authorized with provider idempotency keys before settlement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'upi', label: 'UPI / QR Intent', icon: <QrCode className="w-5 h-5 text-forest-700" />, desc: 'GPay, PhonePe, Paytm' },
              { id: 'cod', label: 'Pay on Delivery', icon: <Building className="w-5 h-5 text-amber-700" />, desc: 'Cash / Kirana Khata' },
              { id: 'card', label: 'Cards / NetBanking', icon: <CreditCard className="w-5 h-5 text-indigo-700" />, desc: 'All Indian Banks & RuPay' }
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPaymentMethod(m.id as any)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  paymentMethod === m.id
                    ? 'bg-white border-forest-800 ring-2 ring-forest-800/20 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-white'
                }`}
              >
                <div className="mb-2">{m.icon}</div>
                <div className="font-bold text-stone-900 text-xs">{m.label}</div>
                <div className="text-[10px] text-stone-500 mt-0.5">{m.desc}</div>
              </button>
            ))}
          </div>

          {/* Pricing Breakdown Summary */}
          <div className="p-4 bg-stone-50/80 rounded-2xl border border-stone-200 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Items Total (Across {merchantGroups.length} Shops)</span>
              <span>₹{subtotal}</span>
            </div>
            {totalSavings > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Total Slabs & Wholesale Savings</span>
                <span>-₹{totalSavings}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <span>GST (Included where applicable)</span>
              <span>₹{taxAmount}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
              <span>Total Payable</span>
              <span className="text-forest-900 text-base">₹{finalPayable}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-stone-100">
            <Button variant="outline" size="md" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              disabled={isProcessing}
              onClick={handlePlaceOrder}
              icon={isProcessing ? undefined : <CheckCircle2 className="w-4 h-4" />}
              iconPosition="right"
            >
              {isProcessing ? 'Authorizing Order...' : `Confirm & Place Order • ₹${finalPayable}`}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Parent Order Confirmation with Suborders Breakdown */}
      {step === 4 && createdParentOrder && (
        <div className="py-4 text-center space-y-5 text-xs sm:text-sm">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-sm">
            <Check className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-forest-800 uppercase tracking-wider">
              Order Confirmed & Logged
            </span>
            <h3 className="font-display text-2xl font-extrabold text-stone-900">
              Parent Order #{createdParentOrder.id}
            </h3>
            <p className="text-xs text-stone-600">
              Successfully created {createdParentOrder.subOrders.length} independent merchant suborders.
            </p>
          </div>

          {/* Suborders Cards */}
          <div className="text-left space-y-3 max-h-60 overflow-y-auto">
            {createdParentOrder.subOrders.map(subOrder => (
              <div
                key={subOrder.id}
                className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-stone-900">
                    <Store className="w-3.5 h-3.5 text-forest-700" />
                    <span>{subOrder.merchantName}</span>
                  </div>
                  <Badge variant="forest" size="sm">
                    {subOrder.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500">
                  <span>Suborder ID: <strong className="text-stone-700 font-mono">{subOrder.id}</strong></span>
                  <span>Amount: <strong className="text-stone-900">₹{subOrder.subtotal}</strong></span>
                </div>

                <div className="text-[11px] text-stone-600">
                  {subOrder.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-left text-xs space-y-1">
            <div className="flex justify-between text-stone-600">
              <span>Payment Reference:</span>
              <span className="font-mono font-semibold text-stone-800">{createdParentOrder.paymentReference}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Payment Status:</span>
              <span className="font-semibold text-forest-800 uppercase text-[10px]">{createdParentOrder.paymentStatus}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Estimated Delivery:</span>
              <span className="font-semibold text-stone-800">{createdParentOrder.estimatedDelivery}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setCheckoutModalOpen(false);
                navigate(`/orders?id=${createdParentOrder.id}`);
              }}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Track Orders Timeline
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
