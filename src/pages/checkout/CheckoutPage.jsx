import React, { useState } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import { useToast } from '../../context/ToastContext';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  User,
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function CheckoutPage() {
  const { navigate } = useRouter();
  const { t, isRtl } = useTranslation();
  const { items, totals, cart, clearCart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.name || 'Tariq Al-Hashemi',
    email: user?.email || 'tariq.alhashemi@example.com',
    phone: user?.phone || '+971 50 123 4567',
    country: 'United Arab Emirates',
    city: 'Dubai',
    address: 'Downtown Dubai Boulevard, Royal Suite 40',
    postalCode: '00000',
    shippingMethod: 'dhl-express',
    paymentType: 'card',
    cardNumber: '4242 •••• •••• 4242',
    cardholderName: user?.name || 'Tariq Al-Hashemi',
    expiry: '12/28',
    cvv: '888'
  });

  if (items.length === 0) {
    return (
      <div className="pt-36 pb-24 text-center max-w-md mx-auto px-4 space-y-4 text-[#F3E6D0]">
        <h2 className="font-cinzel text-2xl font-bold">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-[#D8BE99]">Add your desired flacons before proceeding to royal checkout.</p>
        <Link to="/shop" className="px-6 py-2.5 bg-[#D4AF37] text-black font-cinzel text-xs uppercase font-bold tracking-wider inline-block">
          Return to Boutique
        </Link>
      </div>
    );
  }

  const shippingCost = totals.subtotal >= 100 ? 0 : 15;
  const grandTotal = totals.subtotal - totals.discountAmount + shippingCost;

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handlePlaceOrder = async () => {
    setProcessing(true);
    try {
      // 1. Process Stripe mock gateway authorization
      await paymentService.processPayment({
        cardNumber: formData.cardNumber,
        cardholderName: formData.cardholderName,
        expiry: formData.expiry,
        cvv: formData.cvv
      });

      // 2. Create official order record
      const newOrder = await orderService.createOrder({
        userId: user?.id || 'guest-' + Date.now(),
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        items,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        discountCode: cart.discountCode,
        shipping: shippingCost,
        total: grandTotal,
        shippingAddress: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          postalCode: formData.postalCode
        },
        paymentMethod: 'Stripe Test Card (•••• 4242)',
        dhlTrackingNumber: 'DHL-EXP-' + Math.floor(1000000000 + Math.random() * 9000000000)
      });

      clearCart();
      success('Order placed successfully via Stripe test mode.');
      navigate(`/order-confirmation/${newOrder.id}`);
    } catch (err) {
      error('Failed to process payment. Please verify your details.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#F3E6D0] pt-28 sm:pt-32 pb-6">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-cinzel">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit Encrypted Royal Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-cinzel font-bold text-[#F3E6D0]">
            Complete Your Sovereign Acquisition
          </h1>
        </div>

        {/* Multi-step Header */}
        <div className="max-w-2xl mx-auto mb-12 flex items-center justify-between text-xs font-cinzel uppercase tracking-wider">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#D4AF37] font-bold' : 'text-neutral-600'}`}>
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
            <span>Contact & Shipping</span>
          </div>
          <div className="w-12 h-px bg-white/10" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#D4AF37] font-bold' : 'text-neutral-600'}`}>
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
            <span>DHL Delivery</span>
          </div>
          <div className="w-12 h-px bg-white/10" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#D4AF37] font-bold' : 'text-neutral-600'}`}>
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
            <span>Stripe Payment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Form Area */}
          <div className="lg:col-span-7 bg-[#0B0A08] border border-[#D4AF37]/20 p-8 shadow-2xl space-y-6">
            
            {/* STEP 1: Contact & Address */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-4">
                <h2 className="font-cinzel text-base font-bold text-[#D4AF37] uppercase tracking-wider pb-3 border-b border-white/10">
                  1. Contact & Delivery Destination
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[#D8BE99] uppercase">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2.5 rounded text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#D8BE99] uppercase">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2.5 rounded text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#D8BE99] uppercase">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2.5 rounded text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[#D8BE99] uppercase">Street Address / Palace Villa</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2.5 rounded text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#D8BE99] uppercase">City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2.5 rounded text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#D8BE99] uppercase">Country</label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2.5 rounded text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider hover:bg-[#F2D675] transition-colors flex items-center gap-2"
                  >
                    <span>Continue to DHL Shipping</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: DHL Shipping Selection */}
            {step === 2 && (
              <form onSubmit={handleNextStep} className="space-y-4">
                <h2 className="font-cinzel text-base font-bold text-[#D4AF37] uppercase tracking-wider pb-3 border-b border-white/10">
                  2. Select DHL Express Method
                </h2>

                <div className="space-y-3">
                  <label className="p-4 bg-black/60 border border-[#D4AF37] rounded flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input type="radio" checked readOnly className="accent-[#D4AF37]" />
                      <div>
                        <div className="font-cinzel font-bold text-xs text-[#F3E6D0]">DHL Express Royal Air Delivery</div>
                        <p className="text-[11px] text-[#D8BE99]">2-4 business days • Full temperature-controlled vault transport</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#D4AF37]">
                      {shippingCost === 0 ? 'FREE' : '€15.00'}
                    </span>
                  </label>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-2.5 bg-white/5 border border-white/10 text-xs font-cinzel text-[#F3E6D0]"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider hover:bg-[#F2D675] transition-colors flex items-center gap-2"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Stripe Payment */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h2 className="font-cinzel text-base font-bold text-[#D4AF37] uppercase tracking-wider">
                    3. Stripe Payment Gateway (Sandbox Mode)
                  </h2>
                  <div className="px-2.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono">
                    Test Mode Active
                  </div>
                </div>

                <div className="p-4 bg-black/50 border border-white/10 rounded space-y-4 text-xs">
                  <div className="flex items-center gap-2 text-[#D4AF37]">
                    <CreditCard className="w-4 h-4" />
                    <span className="font-cinzel font-bold">Credit / Debit Card (Stripe Elements)</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[#D8BE99] text-[10px] uppercase">Card Number</label>
                      <input
                        type="text"
                        value={formData.cardNumber}
                        readOnly
                        className="w-full bg-black/80 border border-[#D4AF37]/30 px-3 py-2 text-xs font-mono text-[#F3E6D0] rounded"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[#D8BE99] text-[10px] uppercase">Expiration Date</label>
                        <input
                          type="text"
                          value={formData.expiry}
                          readOnly
                          className="w-full bg-black/80 border border-[#D4AF37]/30 px-3 py-2 text-xs font-mono text-[#F3E6D0] rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[#D8BE99] text-[10px] uppercase">CVC / CVV</label>
                        <input
                          type="text"
                          value={formData.cvv}
                          readOnly
                          className="w-full bg-black/80 border border-[#D4AF37]/30 px-3 py-2 text-xs font-mono text-[#F3E6D0] rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-2.5 bg-white/5 border border-white/10 text-xs font-cinzel text-[#F3E6D0]"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={processing}
                    className="group/btn relative px-8 py-4 rounded-full bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-white hover:text-black border border-[#F2D675]/50 hover:border-white font-cinzel font-bold text-xs uppercase tracking-[0.22em] transition-all duration-400 shadow-[0_10px_30px_rgba(140,98,57,0.45)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.65)] hover:scale-[1.02] flex items-center gap-2.5 overflow-hidden cursor-pointer"
                  >
                    {/* Light Glint */}
                    <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

                    {processing ? (
                      <span className="relative z-10">Authorizing Stripe...</span>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 relative z-10" />
                        <span className="relative z-10 drop-shadow-sm">Authorize Payment (€{grandTotal.toFixed(2)})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-5 bg-[#0B0A08] border border-[#D4AF37]/20 p-6 shadow-2xl space-y-6">
            <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#D4AF37] pb-3 border-b border-white/10">
              Order Summary ({items.length} Flacons)
            </h3>

            {/* Items List */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-3 text-xs pb-3 border-b border-white/5">
                  <img
                    src={item.image || '/products/luxury_designs/07_arabian_gold.webp'}
                    alt={item.name}
                    className="w-12 h-14 object-contain bg-black/40 p-1 border border-white/10"
                  />
                  <div className="flex-1">
                    <h4 className="font-cinzel font-bold text-[#F3E6D0] line-clamp-1">{item.name}</h4>
                    <p className="text-[11px] text-[#D8BE99]">{item.size || '60 ml'} • Qty: {item.quantity}</p>
                  </div>
                  <span className="font-mono font-bold text-[#D4AF37]">€{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 text-xs pt-2 border-t border-white/10">
              <div className="flex justify-between text-[#D8BE99]">
                <span>Subtotal</span>
                <span className="font-mono text-[#F3E6D0]">€{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#D8BE99]">
                <span>DHL Express Shipping</span>
                <span className="font-mono text-[#F3E6D0]">{shippingCost === 0 ? 'Complimentary' : `€${shippingCost.toFixed(2)}`}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Privilege Discount</span>
                  <span>-€{totals.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-cinzel font-bold text-[#F3E6D0] pt-3 border-t border-white/10">
                <span>Grand Total</span>
                <span className="text-[#D4AF37]">€{grandTotal.toFixed(2)}</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
