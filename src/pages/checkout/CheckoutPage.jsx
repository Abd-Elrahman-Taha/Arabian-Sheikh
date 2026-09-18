import React, { useState, useEffect, useRef } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import {
  paymentService,
  newOrderKey,
  newPaymentKey,
  setCurrentCheckoutOrderId,
  getCurrentCheckoutOrderId,
  clearCheckoutOrder,
  getPaymentKey,
  setPaymentKey,
  setPaymentId,
  clearPaymentSession,
  isTerminalStatus
} from '../../services/paymentService';
import { productService } from '../../services/productService';
import { shippingService } from '../../services/shippingService';
import { checkoutApi } from '../../api/checkout.api';
import { addressApi } from '../../api/address.api';
import { useToast } from '../../context/ToastContext';
import StripePaymentForm from '../../components/checkout/StripePaymentForm';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  User,
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles,
  CheckCircle2,
  Tag,
  Loader2
} from 'lucide-react';

export default function CheckoutPage() {
  const { navigate } = useRouter();
  const { t, isRtl } = useTranslation();
  const { items, totals, cart, clearCart, applyDiscount, removeDiscount } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Stripe payment state
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIdState, setPaymentIdState] = useState(null);
  const [orderIdState, setOrderIdState] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'preparing' | 'ready' | 'polling' | 'paid' | 'failed' | 'timeout'
  const [paymentError, setPaymentError] = useState(null);
  const pollAbortRef = useRef(null);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      await applyDiscount(couponCode.trim());
      setCouponCode('');
    } catch {
      // Toast notification handled by CartContext
    } finally {
      setCouponLoading(false);
    }
  };

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
    paymentMethod: 'COD',  // 'COD' or 'CreditCard' (UI display values)
  });

  // Shipping Quotes State
  const [shippingQuotes, setShippingQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [addressId, setAddressId] = useState(null);
  const [quotesFromBackend, setQuotesFromBackend] = useState(false);

  // Load authenticated patron saved addresses if available
  useEffect(() => {
    async function loadSavedAddresses() {
      try {
        const list = await addressApi.getAddresses();
        if (Array.isArray(list) && list.length > 0) {
          const defaultAddr = list.find(a => a.isDefaultShipping || a.isDefault) || list[0];
          setAddressId(defaultAddr.id);
          setFormData(prev => ({
            ...prev,
            fullName: defaultAddr.fullName || prev.fullName,
            phone: defaultAddr.phone || prev.phone,
            country: defaultAddr.countryCode === 'BG' ? 'Bulgaria' : (defaultAddr.country || prev.country),
            city: defaultAddr.city || prev.city,
            address: defaultAddr.addressLine1 || defaultAddr.address || prev.address,
            postalCode: defaultAddr.postalCode || prev.postalCode
          }));
        }
      } catch (e) {
        // guest or unauthenticated
      }
    }
    loadSavedAddresses();
  }, [user]);

  useEffect(() => {
    let active = true;
    async function fetchQuotes() {
      if (!addressId) return;
      setLoadingQuotes(true);
      try {
        const res = await shippingService.getQuotes({
          addressId: addressId || null,
        });
        if (!active) return;
        const opts = res?.options || [];
        setShippingQuotes(opts);
        setQuotesFromBackend(Boolean(res?.fromBackend));
        if (opts.length > 0) {
          setSelectedQuote(curr => {
            if (!curr || curr.isMockFallback || !curr.quoteId) return opts[0];
            const matching = opts.find(o => o.shippingMethodId === curr.shippingMethodId);
            return matching || opts[0];
          });
          setFormData(prev => ({ ...prev, shippingMethod: opts[0].shippingMethod }));
        }
      } catch (err) {
        console.warn('Failed to load shipping quotes:', err);
      } finally {
        if (active) setLoadingQuotes(false);
      }
    }
    fetchQuotes();
    return () => { active = false; };
  }, [formData.country, formData.postalCode, items.length, addressId]);

  // Sync with authenticated user whenever auth state changes/finishes loading
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName === 'Tariq Al-Hashemi' && user.name ? user.name : prev.fullName,
        email: prev.email === 'tariq.alhashemi@example.com' && user.email ? user.email : prev.email,
      }));
    }
  }, [user]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollAbortRef.current) {
        pollAbortRef.current.abort();
      }
    };
  }, []);

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

  const dynamicShippingCost = selectedQuote ? selectedQuote.cost : (totals.shipping !== undefined ? totals.shipping : 0);
  const shippingCost = dynamicShippingCost;
  const grandTotal = Math.max(0, totals.subtotal - (totals.discountAmount || 0) + dynamicShippingCost);

  const handleNextStep = async (e) => {
    e.preventDefault();
    if (step === 1) {
      let currentAddrId = addressId;
      try {
        if (!currentAddrId) {
          const createdAddr = await addressApi.createAddress({
            fullName: formData.fullName,
            phone: formData.phone,
            countryCode: formData.country === 'Bulgaria' ? 'BG' : 'AE',
            region: formData.city || 'Dubai',
            city: formData.city,
            addressLine1: formData.address,
            postalCode: formData.postalCode || '00000'
          }).catch(() => null);
          if (createdAddr?.id) {
            currentAddrId = createdAddr.id;
            setAddressId(createdAddr.id);
          }
        }
        if (currentAddrId) {
          await checkoutApi.setCheckoutAddress({ addressId: currentAddrId }).catch((err) => {
            console.warn('Checkout address sync notice:', err.message);
          });
          // Immediately fetch real quotes for this valid addressId so step 2 has real quotes
          try {
            const res = await shippingService.getQuotes({ addressId: currentAddrId });
            const opts = res?.options || [];
            if (opts.length > 0) {
              setShippingQuotes(opts);
              setQuotesFromBackend(Boolean(res?.fromBackend));
              setSelectedQuote(opts[0]);
              setFormData(prev => ({ ...prev, shippingMethod: opts[0].shippingMethod }));
            }
          } catch (e) {
            console.warn('Error pre-fetching quotes on step advance:', e);
          }
        }
      } catch (err) {
        console.warn('Address sync error:', err.message);
      }
    } else if (step === 2) {
      if (selectedQuote?.shippingMethodId) {
        await checkoutApi.setCheckoutShipping({
          shippingMethodId: selectedQuote.shippingMethodId,
          quoteId: selectedQuote.quoteId
        }, {
          addressId: addressId || undefined,
          couponCode: cart?.discountCode || undefined
        }).catch((err) => {
          console.warn('Checkout shipping sync notice:', err.message);
        });
      }
    }
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  // ─── Map UI payment method to API value ──────────────────────
  function getApiPaymentMethod() {
    return formData.paymentMethod === 'CreditCard' ? 'stripe' : 'cod';
  }

  // ─── Create the order on the backend ─────────────────────────
  async function createBackendOrder() {
    const finalEmail = (user?.email || formData.email || '').trim();
    const finalName = (formData.fullName || user?.name || 'Valued Patron').trim();

    let currentAddrId = addressId;
    if (!currentAddrId) {
      try {
        const created = await addressApi.createAddress({
          fullName: finalName,
          phone: formData.phone || '+971 50 123 4567',
          countryCode: formData.country === 'Bulgaria' ? 'BG' : 'AE',
          region: formData.city || 'Dubai',
          city: formData.city || 'Dubai',
          addressLine1: formData.address || 'Royal Suite',
          postalCode: formData.postalCode || '00000'
        });
        if (created?.id) {
          currentAddrId = created.id;
          setAddressId(created.id);
        }
      } catch (e) {
        console.warn('Address creation fallback in createBackendOrder:', e);
      }
    }

    // Ensure we have a real backend quote with valid UUID quoteId
    let currentQuote = selectedQuote;
    const isUuid = (val) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val?.trim());

    if ((!currentQuote || !isUuid(currentQuote.quoteId)) && currentAddrId) {
      try {
        const res = await shippingService.getQuotes({ addressId: currentAddrId });
        const realOpt = res?.options?.find(o => isUuid(o.quoteId)) || res?.options?.[0];
        if (realOpt) {
          currentQuote = realOpt;
          setSelectedQuote(realOpt);
        }
      } catch (err) {
        console.warn('Failed to fetch real quote in createBackendOrder:', err);
      }
    }

    const orderShippingCost = currentQuote ? currentQuote.cost : dynamicShippingCost;
    const isMockQuote = !quotesFromBackend || Boolean(currentQuote?.isMockFallback) || !currentQuote?.quoteId;

    const newOrder = await orderService.createOrder({
      addressId: currentAddrId || undefined,
      userId: user?.id || null,
      customerEmail: finalEmail,
      customerName: finalName,
      customerPhone: formData.phone,
      items,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      discountCode: cart.discountCode,
      shipping: orderShippingCost,
      shippingCost: orderShippingCost,
      total: grandTotal,
      quoteId: currentQuote?.quoteId || undefined,
      isMockQuote,
      shippingMethodId: currentQuote?.shippingMethodId || 1,
      carrier: currentQuote?.carrier || 'ECONT',
      shippingAddress: {
        fullName: finalName,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        postalCode: formData.postalCode,
        phone: formData.phone
      },
      paymentMethod: getApiPaymentMethod(),
      dhlTrackingNumber: `${currentQuote?.carrier || 'ECONT'}-${Math.floor(100000000 + Math.random() * 900000000)}`
    });

    return newOrder;
  }

  // ─── Decrement stock helper ──────────────────────────────────
  function decrementStock() {
    if (Array.isArray(items) && items.length > 0) {
      items.forEach(item => {
        if (item.isBundle && Array.isArray(item.bundleItems)) {
          item.bundleItems.forEach(bi => {
            const product = productService.getProductByIdSync(bi.productId);
            if (product) {
              const currentStock = product.stock ?? 0;
              const qty = (bi.quantity || 1) * (item.quantity || 1);
              const newStock = Math.max(0, currentStock - qty);
              productService.updateStock(product.id, newStock).catch(() => {});
            }
          });
        } else {
          const product = productService.getProductByIdSync(item.id || item.productId);
          if (product) {
            const currentStock = product.stock ?? 0;
            const qty = item.quantity ?? 1;
            const newStock = Math.max(0, currentStock - qty);
            productService.updateStock(product.id, newStock).catch(() => {});
          }
        }
      });
    }
  }

  // ─── COD: Place order directly ───────────────────────────────
  const handlePlaceCodOrder = async () => {
    setProcessing(true);
    setPaymentError(null);
    try {
      const newOrder = await createBackendOrder();
      const createdOrderId = newOrder.id || newOrder.numericId;
      
      clearPaymentSession(createdOrderId);
      clearCheckoutOrder();
      decrementStock();
      clearCart();

      // Record placed order so reviews & account order history see it
      orderService.recordPlacedOrderId(createdOrderId);

      success('Order placed successfully! Pay in cash on delivery.');
      navigate(`/order-confirmation/${createdOrderId}`);
    } catch (err) {
      console.error('COD order placement error:', err);
      const msg = err?.message || 'Failed to place order. Please try again.';
      setPaymentError(msg);
      error(msg);
    } finally {
      setProcessing(false);
    }
  };

  // ─── Stripe: Create order → Create intent → Show form ───────
  const handleStartStripePayment = async () => {
    setProcessing(true);
    setPaymentError(null);
    setPaymentStatus('preparing');

    try {
      // Step 1: Create the order (freezes totals and payment method = 'stripe')
      const newOrder = await createBackendOrder();
      const createdOrderId = newOrder.id || newOrder.numericId;
      setOrderIdState(createdOrderId);
      setCurrentCheckoutOrderId(createdOrderId);
      orderService.recordPlacedOrderId(createdOrderId);

      // Step 2: Create or replay the Stripe payment intent
      let payKey = getPaymentKey(createdOrderId);
      if (!payKey) {
        payKey = newPaymentKey();
        setPaymentKey(createdOrderId, payKey);
      }

      const intent = await paymentService.createPaymentIntent(createdOrderId, payKey);

      // Step 3: Route by intent result
      if (intent.status === 'Paid') {
        // Already paid (replay of a completed payment)
        clearPaymentSession(createdOrderId);
        clearCheckoutOrder();
        decrementStock();
        clearCart();
        orderService.recordPlacedOrderId(createdOrderId);
        success('Payment confirmed!');
        navigate(`/order-confirmation/${createdOrderId}`);
        return;
      }

      if (!intent.clientSecret) {
        // No secret + not paid → go to pending
        setPaymentIdState(intent.paymentId);
        setPaymentStatus('polling');
        startPolling(intent.paymentId, createdOrderId);
        return;
      }

      // Step 4: Mount Stripe Elements with the clientSecret
      setPaymentIdState(intent.paymentId);
      setPaymentId(createdOrderId, intent.paymentId);
      setClientSecret(intent.clientSecret);
      setPaymentStatus('ready');
      setStep(4); // Show the Stripe payment form step
    } catch (err) {
      console.error('Stripe payment setup error:', err);
      const msg = err?.message || 'Failed to prepare payment. Please try again.';
      setPaymentError(msg);
      setPaymentStatus(null);
      error(msg);
    } finally {
      setProcessing(false);
    }
  };

  // ─── Start polling for payment result ────────────────────────
  function startPolling(paymentId, orderId) {
    setPaymentStatus('polling');

    // Abort any existing poll
    if (pollAbortRef.current) {
      pollAbortRef.current.abort();
    }
    const controller = new AbortController();
    pollAbortRef.current = controller;

    paymentService.pollUntilTerminal(paymentId, {
      signal: controller.signal,
    }).then(result => {
      handlePaymentResult(result, orderId);
    }).catch(err => {
      if (err.message === 'PAYMENT_POLL_TIMEOUT') {
        setPaymentStatus('timeout');
      } else if (err.message !== 'PAYMENT_POLL_ABORTED') {
        setPaymentError(err.message);
        setPaymentStatus('failed');
      }
    });
  }

  // ─── Handle terminal payment result ──────────────────────────
  function handlePaymentResult(result, orderId) {
    const oid = orderId || orderIdState;
    if (result.status === 'Paid') {
      clearPaymentSession(oid);
      clearCheckoutOrder();
      decrementStock();
      clearCart();
      orderService.recordPlacedOrderId(oid);
      success('Payment successful!');
      navigate(`/order-confirmation/${oid}`);
    } else if (result.status === 'Failed') {
      clearPaymentSession(oid);
      setPaymentStatus('failed');
      setPaymentError('Payment failed. Please try again with another card.');
    } else {
      setPaymentStatus('timeout');
    }
  }

  // ─── Stripe form callbacks ───────────────────────────────────
  function handleStripeConfirmed() {
    // confirmPayment succeeded without redirect → start polling
    if (paymentIdState && orderIdState) {
      startPolling(paymentIdState, orderIdState);
    }
  }

  function handleStripeError(message) {
    setPaymentError(message);
  }

  // ─── Retry payment with new key ──────────────────────────────
  function handleRetryPayment() {
    if (orderIdState) {
      clearPaymentSession(orderIdState);
    }
    setClientSecret(null);
    setPaymentIdState(null);
    setPaymentStatus(null);
    setPaymentError(null);
    setStep(3);
  }

  // ─── Handle Place Order button (step 3) ──────────────────────
  const handlePlaceOrder = async () => {
    if (formData.paymentMethod === 'COD') {
      await handlePlaceCodOrder();
    } else {
      // CreditCard → Stripe
      await handleStartStripePayment();
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
            <span>Delivery</span>
          </div>
          <div className="w-12 h-px bg-white/10" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#D4AF37] font-bold' : 'text-neutral-600'}`}>
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
            <span>Payment</span>
          </div>
          {step === 4 && (
            <>
              <div className="w-12 h-px bg-white/10" />
              <div className="flex items-center gap-2 text-[#D4AF37] font-bold">
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px]">4</span>
                <span>Confirm</span>
              </div>
            </>
          )}
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
                    <span>Continue to Shipping Options</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Shipping Method Selection */}
            {step === 2 && (
              <form onSubmit={handleNextStep} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h2 className="font-cinzel text-base font-bold text-[#D4AF37] uppercase tracking-wider">
                    2. Select Insured Shipping Method
                  </h2>
                  <span className="text-[11px] font-mono text-[#D8BE99]">
                    {shippingQuotes.length} Options Available
                  </span>
                </div>

                {loadingQuotes ? (
                  <div className="p-8 text-center space-y-2 bg-black/40 border border-white/10 rounded-xl">
                    <Truck className="w-5 h-5 animate-pulse text-[#D4AF37] mx-auto" />
                    <p className="text-xs font-cinzel text-[#D8BE99]">Calculating real-time carrier quotes...</p>
                  </div>
                ) : shippingQuotes.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-400 bg-black/40 border border-white/10 rounded-xl">
                    Unable to load carrier rates. Defaulting to insured royal delivery.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shippingQuotes.map((opt) => {
                      const isSelected = selectedQuote?.quoteId === opt.quoteId || selectedQuote?.shippingMethodId === opt.shippingMethodId;
                      const isEcont = String(opt.carrier || '').toUpperCase().includes('ECONT');
                      return (
                        <label
                          key={opt.quoteId || opt.shippingMethodId}
                          onClick={() => {
                            setSelectedQuote(opt);
                            setFormData(prev => ({ ...prev, shippingMethod: opt.shippingMethod }));
                          }}
                          className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? 'bg-black/80 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]/50'
                              : 'bg-black/50 border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shippingMethod"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedQuote(opt);
                                setFormData(prev => ({ ...prev, shippingMethod: opt.shippingMethod }));
                              }}
                              className="accent-[#D4AF37] w-4 h-4 cursor-pointer"
                            />
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded border ${
                                  isEcont
                                    ? 'bg-amber-950/80 text-[#F2D675] border-[#D4AF37]/40'
                                    : 'bg-neutral-900 text-neutral-300 border-neutral-600/40'
                                }`}>
                                  {opt.carrier}
                                </span>
                                <span className="font-cinzel font-bold text-xs text-[#F3E6D0]">
                                  {opt.shippingMethod}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#D8BE99]">
                                {opt.estimatedDeliveryDays
                                  ? `${opt.estimatedDeliveryDays} business days • Insured temperature-controlled transport`
                                  : '2-4 business days • Insured temperature-controlled transport'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`font-mono text-xs font-bold ${
                              opt.isFree || opt.cost === 0 ? 'text-emerald-400' : 'text-[#D4AF37]'
                            }`}>
                              {opt.isFree || opt.cost === 0 ? 'FREE' : `€${Number(opt.cost).toFixed(2)}`}
                            </span>
                            {opt.rateSource && (
                              <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider">
                                {opt.rateSource}
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-2.5 bg-white/5 border border-white/10 text-xs font-cinzel text-[#F3E6D0] hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider hover:bg-[#F2D675] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Payment Method Selection */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h2 className="font-cinzel text-base font-bold text-[#D4AF37] uppercase tracking-wider">
                    3. Payment Selection & Authorization
                  </h2>
                  <div className="px-2.5 py-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F2D675] text-[10px] font-mono">
                    Official Carrier COD Ready
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'COD' }))}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${formData.paymentMethod === 'COD' ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#F2D675] shadow-lg shadow-[#D4AF37]/10' : 'bg-black/50 border-white/10 text-[#D8BE99] hover:border-[#D4AF37]/40'}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#D4AF37]" />
                        <span className="font-cinzel font-bold text-xs">Cash On Delivery (COD)</span>
                      </div>
                      {formData.paymentMethod === 'COD' && <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />}
                    </div>
                    <p className="text-[11px] text-[#D8BE99]">Pay courier upon arrival at your doorstep in cash or by courier POS terminal.</p>
                  </div>

                  <div
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'CreditCard' }))}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${formData.paymentMethod === 'CreditCard' ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#F2D675] shadow-lg shadow-[#D4AF37]/10' : 'bg-black/50 border-white/10 text-[#D8BE99] hover:border-[#D4AF37]/40'}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                        <span className="font-cinzel font-bold text-xs">Credit / Debit Card</span>
                      </div>
                      {formData.paymentMethod === 'CreditCard' && <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />}
                    </div>
                    <p className="text-[11px] text-[#D8BE99]">Secure payment via Stripe — Visa, Mastercard, and more.</p>
                  </div>
                </div>

                {/* Payment error display */}
                {paymentError && (
                  <div role="alert" className="p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">⚠</span>
                    <span>{paymentError}</span>
                  </div>
                )}

                {/* Preparing payment indicator */}
                {paymentStatus === 'preparing' && (
                  <div className="p-6 rounded-xl bg-black/40 border border-white/10 text-center space-y-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37] mx-auto" />
                    <p className="text-xs font-cinzel text-[#D8BE99]">Creating your order and preparing secure payment...</p>
                  </div>
                )}

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
                    disabled={processing || paymentStatus === 'preparing'}
                    className="group/btn relative px-8 py-4 rounded-full bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-white hover:text-black border border-[#F2D675]/50 hover:border-white font-cinzel font-bold text-xs uppercase tracking-[0.22em] transition-all duration-400 shadow-[0_10px_30px_rgba(140,98,57,0.45)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.65)] hover:scale-[1.02] flex items-center gap-2.5 overflow-hidden cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

                    {processing || paymentStatus === 'preparing' ? (
                      <span className="relative z-10 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{formData.paymentMethod === 'COD' ? 'Placing Order...' : 'Preparing Payment...'}</span>
                      </span>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 relative z-10" />
                        <span className="relative z-10 drop-shadow-sm">
                          {formData.paymentMethod === 'COD'
                            ? `Place Order (€${grandTotal.toFixed(2)})`
                            : `Continue to Payment (€${grandTotal.toFixed(2)})`
                          }
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Stripe Payment Form / Polling / Result */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h2 className="font-cinzel text-base font-bold text-[#D4AF37] uppercase tracking-wider">
                    4. Complete Payment
                  </h2>
                </div>

                {/* Stripe card form */}
                {paymentStatus === 'ready' && clientSecret && (
                  <StripePaymentForm
                    clientSecret={clientSecret}
                    orderId={orderIdState}
                    paymentId={paymentIdState}
                    onConfirmed={handleStripeConfirmed}
                    onError={handleStripeError}
                  />
                )}

                {/* Polling / Processing */}
                {paymentStatus === 'polling' && (
                  <div className="p-8 rounded-xl bg-black/40 border border-white/10 text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mx-auto" />
                    <p className="font-cinzel text-sm font-bold text-[#F3E6D0]">Confirming Payment...</p>
                    <p className="text-xs text-[#D8BE99]">Verifying with your bank. This usually takes a few seconds.</p>
                  </div>
                )}

                {/* Payment failed */}
                {paymentStatus === 'failed' && (
                  <div className="p-8 rounded-xl bg-red-950/20 border border-red-500/30 text-center space-y-4">
                    <p className="font-cinzel text-sm font-bold text-red-300">Payment Failed</p>
                    <p className="text-xs text-[#D8BE99]">{paymentError || 'Your card was declined. Please try another card.'}</p>
                    <button
                      onClick={handleRetryPayment}
                      className="px-6 py-2.5 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-full cursor-pointer"
                    >
                      Try Another Card
                    </button>
                  </div>
                )}

                {/* Timeout / still pending */}
                {paymentStatus === 'timeout' && (
                  <div className="p-8 rounded-xl bg-amber-950/20 border border-amber-500/30 text-center space-y-4">
                    <p className="font-cinzel text-sm font-bold text-amber-300">Still Confirming</p>
                    <p className="text-xs text-[#D8BE99]">We're still confirming with your bank. This may take a moment.</p>
                    {paymentIdState && (
                      <p className="text-[10px] font-mono text-[#D8BE99]">Payment Ref: #{paymentIdState}</p>
                    )}
                    <button
                      onClick={() => {
                        if (paymentIdState) startPolling(paymentIdState, orderIdState);
                      }}
                      className="px-6 py-2.5 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-full cursor-pointer"
                    >
                      Check Again
                    </button>
                  </div>
                )}

                {/* Stripe inline error on form */}
                {paymentError && paymentStatus === 'ready' && (
                  <div role="alert" className="p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 text-xs">
                    {paymentError}
                  </div>
                )}

                {/* Back button (only if form is showing, not during polling) */}
                {(paymentStatus === 'ready' || paymentStatus === 'failed') && (
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleRetryPayment}
                      className="px-6 py-2.5 bg-white/5 border border-white/10 text-xs font-cinzel text-[#F3E6D0] cursor-pointer"
                    >
                      ← Back to Payment Selection
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-5 bg-[#0B0A08] border border-[#D4AF37]/20 p-6 shadow-2xl space-y-6">
            <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#D4AF37] pb-3 border-b border-white/10">
              Order Summary ({items.length} {items.some(i => i.isBundle) ? 'Creations & Suites' : 'Flacons'})
            </h3>

            {/* Items List */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item, i) => {
                const isBundle = Boolean(item.isBundle);
                return (
                  <div key={i} className="flex items-center justify-between gap-3 text-xs pb-3 border-b border-white/5">
                    <img
                      src={item.image || '/products/luxury_designs/07_arabian_gold.webp'}
                      alt={item.name}
                      className={`w-12 h-14 object-contain bg-black/40 p-1 border shrink-0 rounded ${
                        isBundle ? 'border-purple-500/50' : 'border-white/10'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      {isBundle && (
                        <span className="text-[9px] uppercase font-cinzel font-bold text-purple-400 block mb-0.5">
                          🎁 Curated Suite
                        </span>
                      )}
                      <h4 className="font-cinzel font-bold text-[#F3E6D0] line-clamp-1">{item.name}</h4>
                      <p className="text-[11px] text-[#D8BE99]">
                        {isBundle ? item.size : `${item.size || '60 ml'} • Qty: ${item.quantity}`}
                        {isBundle && ` • Qty: ${item.quantity}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-[#D4AF37] block">
                        €{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coupon / Privilege Code Box */}
            <div className="pt-3 pb-1 border-t border-white/10 space-y-2">
              <label className="text-[11px] font-cinzel font-bold uppercase tracking-wider text-[#D8BE99] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Privilege / Promo Code</span>
              </label>

              {cart.discountCode ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#F2D675] tracking-widest uppercase">
                      {cart.discountCode}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">(Applied)</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeDiscount}
                    className="text-[11px] text-red-400 hover:text-red-300 underline font-medium cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Privilege Code (e.g. SHEIKH10)"
                    className="flex-1 bg-black/80 border border-[#D4AF37]/30 focus:border-[#D4AF37] px-3 py-2 text-xs font-mono uppercase text-[#F3E6D0] rounded-lg focus:outline-none placeholder:text-neutral-500"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 bg-[#D4AF37] hover:bg-[#F2D675] disabled:opacity-50 text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer shrink-0 shadow-md"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </form>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-2 text-xs pt-2 border-t border-white/10">
              <div className="flex justify-between text-[#D8BE99]">
                <span>Subtotal</span>
                <span className="font-mono text-[#F3E6D0]">€{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#D8BE99]">
                <span>{selectedQuote?.shippingMethod || selectedQuote?.carrier || 'Shipping'}</span>
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
