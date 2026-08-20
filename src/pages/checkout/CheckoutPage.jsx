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
  Sparkles
} from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../../components/common/ScrollReveal';

export default function CheckoutPage() {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const { items, totals, cart, clearCart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Info
    fullName: user?.name || 'Sheikh Tariq Al-Fassi',
    email: user?.email || 'sheikh.user@luxury.com',
    phone: user?.phone || '+971 50 123 4567',

    // Step 2: Shipping
    country: 'United Arab Emirates',
    city: 'Dubai',
    address: 'Downtown Dubai Boulevard, Villa 12',
    postalCode: '00000',

    // Step 3: Payment
    paymentType: 'card',
    cardNumber: '4000 1234 5678 4112',
    cardholderName: user?.name || 'Sheikh Tariq Al-Fassi',
    expiry: '11/28',
    cvv: '889',
    saveCard: true
  });

  if (items.length === 0) {
    return (
      <div className="pt-36 pb-24 text-center max-w-md mx-auto px-4 space-y-4 text-[var(--text-primary)]">
        <h2 className="font-cinzel text-2xl font-bold">{t('cart.emptyTitle')}</h2>
        <p className="text-xs text-[var(--text-muted)]">{t('cart.emptyDesc')}</p>
        <Link to="/shop" className="luxury-btn-gold px-6 py-2.5 text-xs inline-block cursor-pointer">
          {t('cart.startShopping')}
        </Link>
      </div>
    );
  }

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handlePlaceOrder = async () => {
    setProcessing(true);
    try {
      // 1. Process mock payment gateway authorization
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
        shipping: totals.shipping,
        total: totals.total,
        shippingAddress: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          postalCode: formData.postalCode,
          phone: formData.phone
        },
        paymentMethod: {
          type: 'card',
          last4: formData.cardNumber.slice(-4),
          brand: formData.cardNumber.startsWith('4') ? 'Visa' : 'Mastercard'
        }
      });

      // 3. Clear shopping bag and navigate
      clearCart();
      success('Your royal order has been authorized and dispatched to the atelier.');
      navigate(`/order-confirmation?orderId=${newOrder.id}`);
    } catch (err) {
      error(err.message || 'Payment authorization failed.');
      setProcessing(false);
    }
  };

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in text-[var(--color-earth-dark)]">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[var(--color-terracotta)] font-bold">
            Secure Royal Checkout
          </span>
          <h1 className="font-cinzel text-3xl sm:text-4xl font-bold uppercase text-[var(--color-earth-dark)]">
            {t('checkout.title')}
          </h1>
        </div>
      </ScrollReveal>

      {/* Checkout Steps Progress Indicator */}
      <ScrollReveal delay={0.1}>
        <div className="max-w-3xl mx-auto grid grid-cols-4 gap-2 text-center text-xs font-cinzel uppercase tracking-wider">
          {[
            { num: 1, label: 'Contact' },
            { num: 2, label: 'Shipping' },
            { num: 3, label: 'Payment' },
            { num: 4, label: 'Review' }
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => s.num < step && setStep(s.num)}
              className={`py-3 border-b-2 transition-all cursor-pointer ${
                step === s.num
                  ? 'border-[var(--color-terracotta)] text-[var(--color-terracotta)] font-bold bg-[var(--color-desert-light)]'
                  : step > s.num
                  ? 'border-[var(--color-terracotta)]/50 text-[var(--color-terracotta-deep)]'
                  : 'border-[var(--color-terracotta-deep)]/20 text-[var(--color-terracotta-deep)]/60'
              }`}
            >
              <span className="block text-sm font-bold">{s.num}</span>
              <span className="text-[11px] hidden sm:block">{s.label}</span>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Main Grid: Form Steps + Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Step Form (7 cols) */}
        <ScrollReveal direction="left" delay={0.2} className="lg:col-span-7 bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-6 sm:p-8 shadow-xl space-y-6">
          {/* STEP 1: INFORMATION */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-4 animate-fade-in text-xs font-sans">
              <h3 className="font-cinzel text-base font-bold uppercase text-[var(--color-earth-dark)] border-b border-[var(--color-terracotta-deep)]/20 pb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-[var(--color-terracotta)]" />
                <span>{t('checkout.step1')}</span>
              </h3>

              <div>
                <label className="block text-[var(--color-terracotta-deep)] mb-1 uppercase tracking-wider font-semibold">
                  {t('checkout.fullName')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Sultan Tariq Al-Fassi"
                  className="w-full bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/25 p-3 text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--color-terracotta-deep)] mb-1 uppercase tracking-wider font-semibold">
                  {t('checkout.email')}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@palace.com"
                  className="w-full bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/25 p-3 text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--color-terracotta-deep)] mb-1 uppercase tracking-wider font-semibold">
                  {t('checkout.phone')}
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+971 50 123 4567"
                  className="w-full bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/25 p-3 text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full luxury-btn-gold py-3.5 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-md"
              >
                <span>{t('checkout.continue')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: SHIPPING */}
          {step === 2 && (
            <form onSubmit={handleNextStep} className="space-y-4 animate-fade-in text-xs font-sans">
              <h3 className="font-cinzel text-base font-bold uppercase text-[var(--color-earth-dark)] border-b border-[var(--color-terracotta-deep)]/20 pb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[var(--color-terracotta)]" />
                <span>{t('checkout.step2')}</span>
              </h3>

              <div>
                <label className="block text-[var(--color-terracotta-deep)] mb-1 uppercase tracking-wider font-semibold">
                  {t('checkout.country')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/25 p-3 text-[var(--color-earth-dark)] focus:border-[var(--color-terracotta)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--color-terracotta-deep)] mb-1 uppercase tracking-wider font-semibold">
                  {t('checkout.address')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, Villa or Apartment Number"
                  className="w-full bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/25 p-3 text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--color-terracotta-deep)] mb-1 uppercase tracking-wider font-semibold">
                    {t('checkout.city')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/25 p-3 text-[var(--color-earth-dark)] focus:border-[var(--color-terracotta)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-terracotta-deep)] mb-1 uppercase tracking-wider font-semibold">
                    {t('checkout.postalCode')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/25 p-3 text-[var(--color-earth-dark)] focus:border-[var(--color-terracotta)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 luxury-btn-outline py-3 text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('checkout.back')}</span>
                </button>
                <button
                  type="submit"
                  className="w-2/3 luxury-btn-gold py-3 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>{t('checkout.continue')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: PAYMENT */}
          {step === 3 && (
            <form onSubmit={handleNextStep} className="space-y-4 animate-fade-in text-xs font-sans">
              <h3 className="font-cinzel text-base font-bold uppercase text-[var(--color-earth-dark)] border-b border-[var(--color-terracotta-deep)]/20 pb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[var(--color-terracotta)]" />
                <span>{t('checkout.step3')}</span>
              </h3>

              {/* Notice */}
              <div className="p-3 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta)]/40 text-[11px] text-[var(--color-terracotta)] flex items-center gap-2 font-medium">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>{t('checkout.mockNotice')}</span>
              </div>

              <div>
                <label className="block text-[var(--color-terracotta-deep)] mb-1 uppercase tracking-wider font-semibold">
                  {t('checkout.cardholderName')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.cardholderName}
                  onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                  placeholder="Full Name as appears on Card"
                  className="w-full bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/25 p-3 text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--color-terracotta-deep)] mb-1 uppercase tracking-wider font-semibold">
                  {t('checkout.cardNumber')}
                </label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  placeholder="4000 1234 5678 9010"
                  className="w-full bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/25 p-3 text-[var(--color-earth-dark)] font-mono focus:border-[var(--color-terracotta)] focus:outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--color-terracotta-deep)] mb-1 uppercase tracking-wider font-semibold">
                    {t('checkout.expiry')}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={formData.expiry}
                    onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                    placeholder="12/28"
                    className="w-full bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/25 p-3 text-[var(--color-earth-dark)] font-mono focus:border-[var(--color-terracotta)] focus:outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-terracotta-deep)] mb-1 uppercase tracking-wider font-semibold">
                    {t('checkout.cvv')}
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                    placeholder="•••"
                    className="w-full bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/25 p-3 text-[var(--color-earth-dark)] font-mono focus:border-[var(--color-terracotta)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 luxury-btn-outline py-3 text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('checkout.back')}</span>
                </button>
                <button
                  type="submit"
                  className="w-2/3 luxury-btn-gold py-3 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>{t('checkout.continue')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: REVIEW & AUTHORIZE */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in text-xs font-sans">
              <h3 className="font-cinzel text-base font-bold uppercase text-[var(--color-earth-dark)] border-b border-[var(--color-terracotta-deep)]/20 pb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--color-terracotta)]" />
                <span>{t('checkout.step4')}</span>
              </h3>

              <div className="p-4 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 space-y-2">
                <div className="flex justify-between items-center border-b border-[var(--color-terracotta-deep)]/20 pb-2">
                  <strong className="text-[var(--color-terracotta)] font-cinzel font-bold">Contact & Dispatch</strong>
                  <button onClick={() => setStep(1)} className="text-[var(--color-terracotta)] underline cursor-pointer font-semibold">Edit</button>
                </div>
                <p className="text-[var(--color-earth-dark)] font-semibold">{formData.fullName}</p>
                <p className="text-[var(--color-terracotta-deep)]">{formData.email} • {formData.phone}</p>
              </div>

              <div className="p-4 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 space-y-2">
                <div className="flex justify-between items-center border-b border-[var(--color-terracotta-deep)]/20 pb-2">
                  <strong className="text-[var(--color-terracotta)] font-cinzel font-bold">Delivery Destination</strong>
                  <button onClick={() => setStep(2)} className="text-[var(--color-terracotta)] underline cursor-pointer font-semibold">Edit</button>
                </div>
                <p className="text-[var(--color-terracotta-deep)]">{formData.address}, {formData.city}, {formData.postalCode}, {formData.country}</p>
              </div>

              <div className="p-4 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 space-y-2">
                <div className="flex justify-between items-center border-b border-[var(--color-terracotta-deep)]/20 pb-2">
                  <strong className="text-[var(--color-terracotta)] font-cinzel font-bold">Payment Method</strong>
                  <button onClick={() => setStep(3)} className="text-[var(--color-terracotta)] underline cursor-pointer font-semibold">Edit</button>
                </div>
                <p className="text-[var(--color-terracotta-deep)]">Card ending in •••• {formData.cardNumber.slice(-4)} (Expiry: {formData.expiry})</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={processing}
                  className="w-1/3 luxury-btn-outline py-3.5 text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('checkout.back')}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={processing}
                  className="w-2/3 luxury-btn-gold py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>{processing ? t('checkout.processing') : t('checkout.placeOrder')}</span>
                </button>
              </div>
            </div>
          )}
        </ScrollReveal>

        {/* Right: Order Summary (5 cols) */}
        <ScrollReveal direction="right" delay={0.3} className="lg:col-span-5 bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-6 space-y-4 shadow-xl">
          <h3 className="font-cinzel text-base font-bold uppercase text-[var(--color-earth-dark)] border-b border-[var(--color-terracotta-deep)]/20 pb-3">
            {t('checkout.orderSummary')}
          </h3>

          <div className="divide-y divide-[var(--color-terracotta-deep)]/20 max-h-72 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <ScrollRevealItem key={idx} index={idx} desktopDirection="right" className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-14 object-cover bg-[var(--color-desert-primary)] border border-[var(--color-terracotta-deep)]/30 shrink-0" />
                  <div>
                    <h4 className="font-cinzel font-bold text-[var(--color-earth-dark)]">{item.name}</h4>
                    <p className="text-[var(--color-terracotta)] font-mono text-[11px] font-semibold">{item.size} • Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-cinzel font-bold text-[var(--color-terracotta)]">
                  ${item.price * item.quantity}
                </span>
              </ScrollRevealItem>
            ))}
          </div>

          <div className="space-y-2 pt-3 border-t border-[var(--color-terracotta-deep)]/20 text-xs text-[var(--color-terracotta-deep)] font-medium">
            <div className="flex justify-between">
              <span>{t('cart.subtotal')}</span>
              <span className="font-mono text-[var(--color-earth-dark)] font-bold">${totals.subtotal}</span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-[var(--color-terracotta)] font-bold">
                <span>{t('cart.discount')}</span>
                <span className="font-mono">-${totals.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>{t('cart.shipping')}</span>
              <span className="font-mono text-[var(--color-terracotta)] font-bold uppercase">{t('cart.freeShipping')}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-[var(--color-earth-dark)] pt-2 border-t border-[var(--color-terracotta-deep)]/20 font-cinzel">
              <span>{t('cart.total')}</span>
              <span className="text-[var(--color-terracotta)] font-mono font-bold">${totals.total}</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
