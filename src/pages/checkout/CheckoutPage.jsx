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
import { cartApi } from '../../api/cart.api';
import { normalizeShippingOption } from '../../api/normalizers';
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
  Loader2,
  AlertTriangle,
  MapPin,
  ChevronDown,
  Home,
  Briefcase,
  Phone,
  Globe,
  Building,
  ShoppingBag
} from 'lucide-react';

export const COUNTRIES = [
  { code: 'BG', name: 'Bulgaria', dialCode: '+359', flag: '🇧🇬', placeholder: '888123456' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', placeholder: '501234567' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', placeholder: '501234567' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼', placeholder: '91234567' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦', placeholder: '33123456' },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭', placeholder: '36123456' },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲', placeholder: '91234567' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬', placeholder: '1001234567' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', placeholder: '7911123456' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', placeholder: '2025550123' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', placeholder: '15112345678' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', placeholder: '612345678' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', placeholder: '3123456789' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸', placeholder: '612345678' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭', placeholder: '781234567' },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷', placeholder: '5321234567' },
  { code: 'GR', name: 'Greece', dialCode: '+30', flag: '🇬🇷', placeholder: '6912345678' },
  { code: 'RO', name: 'Romania', dialCode: '+40', flag: '🇷🇴', placeholder: '712345678' },
];

export default function CheckoutPage() {
  const { navigate } = useRouter();
  const { t, isRtl } = useTranslation();
  const { items, totals, cart, clearCart, applyDiscount, removeDiscount, refreshCart } = useCart();
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
  const quoteAbortRef = useRef(null);
  const quoteRequestIdRef = useRef(0);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const code = couponCode.trim();
    if (!code) return;
    setCouponLoading(true);
    try {
      await applyDiscount(code);
      setCouponCode('');
      
      if (addressId) {
        const currentMethodId = Number(selectedQuote?.shippingMethodId || selectedQuote?.id) || undefined;
        // Section 4 - Option 1: Re-fetch Checkout Summary with applied promo code
        const summary = await syncCheckoutWithBackend(addressId, currentMethodId, code);
        if (!summary || !summary.shippingOptions || summary.shippingOptions.length === 0) {
          await fetchQuotesForAddress(addressId, code);
        }
      }
    } catch {
      // Toast notification handled by CartContext
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    removeDiscount();
    if (addressId) {
      const currentMethodId = Number(selectedQuote?.shippingMethodId || selectedQuote?.id) || undefined;
      // Section 4 - Option 1: Re-fetch Checkout Summary without promo code
      const summary = await syncCheckoutWithBackend(addressId, currentMethodId, '');
      if (!summary || !summary.shippingOptions || summary.shippingOptions.length === 0) {
        await fetchQuotesForAddress(addressId, null);
      }
    }
  };

  // Country code helper for backend addresses
  function getCountryCode(val) {
    if (!val) return 'BG';
    const c = String(val).trim().toUpperCase();
    const found = COUNTRIES.find(x => x.code === c || x.name.toUpperCase() === c);
    if (found) return found.code;
    return c.length === 2 ? c : 'BG';
  }

  // Form State with ECONT Bulgaria test defaults matching exact user specification
  const [formData, setFormData] = useState({
    label: 'Home',
    customLabel: 'Test Home',
    fullName: user?.name || 'ECONT Test Customer',
    email: user?.email || 'patron@arabiansheikh.com',
    countryCode: 'BG',
    phone: '+359888123456',
    region: 'Sofia City',
    city: 'Sofia',
    addressLine1: 'bul. Vitosha 1',
    addressLine2: '',
    address: 'bul. Vitosha 1',
    postalCode: '1000',
    shippingMethod: '',
    paymentMethod: 'COD',  // 'COD' or 'CreditCard' (UI display values)
  });

  const selectedCountry = COUNTRIES.find(c => c.code === (formData.countryCode || 'BG')) || COUNTRIES[0];

  const handleCountryCodeChange = (newCode) => {
    const newCountry = COUNTRIES.find(c => c.code === newCode) || COUNTRIES[0];
    const oldCountry = COUNTRIES.find(c => c.code === formData.countryCode);

    setAddressId(null);
    setShippingQuotes([]);
    setSelectedQuote(null);
    setQuotesError(null);
    setAddressError(null);

    let nationalNumber = '';
    const currentPhone = (formData.phone || '').trim();
    if (oldCountry && currentPhone.startsWith(oldCountry.dialCode)) {
      nationalNumber = currentPhone.slice(oldCountry.dialCode.length).trim();
    } else {
      const matched = COUNTRIES.find(c => currentPhone.startsWith(c.dialCode));
      if (matched) {
        nationalNumber = currentPhone.slice(matched.dialCode.length).trim();
      } else {
        nationalNumber = currentPhone.replace(/^\+?[0-9]{1,4}/, '').trim() || currentPhone.replace(/^0+/, '');
      }
    }

    if (!nationalNumber) {
      nationalNumber = newCountry.placeholder.replace(/\s+/g, '');
    }

    const updatedPhone = `${newCountry.dialCode}${nationalNumber.replace(/\s+/g, '')}`;

    setFormData(prev => ({
      ...prev,
      countryCode: newCountry.code,
      country: newCountry.name,
      phone: updatedPhone,
      shippingMethod: ''
    }));
  };

  const handlePhoneInputChange = (e) => {
    let inputVal = e.target.value;
    if (inputVal.startsWith('+')) {
      const matched = COUNTRIES.find(c => inputVal.startsWith(c.dialCode));
      if (matched) {
        inputVal = inputVal.slice(matched.dialCode.length);
      }
    }
    const digitsOnly = inputVal.replace(/[^\d]/g, '');
    const fullPhone = `${selectedCountry.dialCode}${digitsOnly}`;
    handleAddressFieldChange('phone', fullPhone);
  };

  // Saved Addresses & Delivery State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressId, setAddressId] = useState(null);
  const [addressError, setAddressError] = useState(null);
  const [quotesError, setQuotesError] = useState(null);

  // Shipping Quotes State
  const [shippingQuotes, setShippingQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);

  // Centralized Quote Fetching with In-Flight Cancellation and Race-Condition Protection
  const fetchQuotesForAddress = async (targetAddrId, currentCouponCode) => {
    const rawId = Number(targetAddrId);
    if (!rawId || isNaN(rawId) || rawId <= 0) {
      setShippingQuotes([]);
      setSelectedQuote(null);
      return null;
    }

    // Cancel any previous in-flight quote request
    if (quoteAbortRef.current) {
      quoteAbortRef.current.abort();
    }
    const abortController = new AbortController();
    quoteAbortRef.current = abortController;
    quoteRequestIdRef.current += 1;
    const thisRequestId = quoteRequestIdRef.current;

    setLoadingQuotes(true);
    setQuotesError(null);

    try {
      // 1. Fetch authoritative address snapshot from backend for stable destination parameters
      let destCountry = formData.countryCode || 'BG';
      let destPostal = formData.postalCode || '';
      let destCity = formData.city || '';

      try {
        const snapshot = await addressApi.getAddressSnapshot(rawId);
        if (snapshot) {
          destCountry = snapshot.countryCode || destCountry;
          destPostal = snapshot.postalCode || destPostal;
          destCity = snapshot.city || destCity;
        }
      } catch (snapErr) {
        const savedMatch = savedAddresses.find(a => Number(a.id) === rawId);
        if (savedMatch) {
          destCountry = savedMatch.countryCode || destCountry;
          destPostal = savedMatch.postalCode || destPostal;
          destCity = savedMatch.city || destCity;
        }
      }

      // 2. Ensure cart state is synchronized on backend before quoting
      if (Array.isArray(items) && items.length > 0) {
        await cartApi.syncCart(items).catch(err => {
          console.warn('[Checkout] Cart sync before quotes notice:', err?.message || err);
        });
      }

      const coupon = currentCouponCode !== undefined
        ? (currentCouponCode || undefined)
        : (cart?.discountCode || undefined);

      // 3. Query GET /api/checkout?addressId={id}&couponCode={coupon} without shippingMethodId
      // The backend returns the authoritative list of shippingOptions available for this address
      let validOpts = [];
      let topQuoteId = null;

      try {
        const summary = await checkoutApi.getCheckout({
          addressId: rawId,
          couponCode: coupon
        });
        topQuoteId = summary?.quoteId || summary?.selectedShippingMethod?.quoteId || null;
        const summaryOpts = (Array.isArray(summary?.shippingOptions) ? summary.shippingOptions : [])
          .map(normalizeShippingOption)
          .filter(opt => opt && opt.shippingMethodId && Number(opt.shippingMethodId) > 0);

        if (summaryOpts.length > 0) {
          validOpts = summaryOpts.map(opt => ({
            ...opt,
            quoteId: opt.quoteId || (topQuoteId ? String(topQuoteId) : opt.quoteId)
          }));
        }
      } catch (sumErr) {
        console.warn('[Checkout] getCheckout options notice:', sumErr?.message || sumErr);
      }

      // 4. Fallback to shippingService.getQuotes if getCheckout returned no options
      if (validOpts.length === 0) {
        const quoteParams = {
          addressId: rawId,
          countryCode: destCountry || formData.countryCode || 'BG',
          postalCode: destPostal || formData.postalCode || '1000',
          city: destCity || formData.city || 'Sofia',
          couponCode: coupon,
          items: items.map(it => ({
            productId: it.productId || it.numericId || it.id,
            quantity: it.quantity || 1
          }))
        };

        const res = await shippingService.getQuotes(quoteParams, { signal: abortController.signal });
        const rawOpts = res?.options || [];
        validOpts = rawOpts.filter(opt => {
          const mid = Number(opt.shippingMethodId || opt.id);
          return mid && !isNaN(mid) && mid > 0;
        });
      }

      // If a newer request was dispatched while this was in-flight, discard
      if (thisRequestId !== quoteRequestIdRef.current) {
        return null;
      }

      if (validOpts.length === 0) {
        setShippingQuotes([]);
        setSelectedQuote(null);
        setFormData(prev => ({ ...prev, shippingMethod: '' }));
        setQuotesError('No shipping methods are available for the selected address. Please choose a different delivery address.');
        return [];
      }

      setShippingQuotes(validOpts);

      // Preserve previous selection if still available in valid options, otherwise select first valid option
      setSelectedQuote(prevSelected => {
        let chosen = validOpts[0];
        if (prevSelected) {
          const prevId = Number(prevSelected.shippingMethodId || prevSelected.id);
          const matched = validOpts.find(o => Number(o.shippingMethodId || o.id) === prevId && (!prevSelected.carrier || o.carrier === prevSelected.carrier));
          if (matched) chosen = matched;
        }
        setFormData(prev => ({
          ...prev,
          shippingMethod: chosen.shippingMethod || chosen.methodName || 'Standard Delivery'
        }));
        return chosen;
      });

      return validOpts;
    } catch (err) {
      if (abortController.signal.aborted || thisRequestId !== quoteRequestIdRef.current) {
        return null;
      }
      console.error('[Checkout] Shipping quote fetch error:', err);
      const errMsg = err?.message || '';
      if (err?.code === 'CART_EMPTY' || errMsg.toLowerCase().includes('empty')) {
        setQuotesError('Your cart is empty. Please add products before continuing to checkout.');
      } else {
        setQuotesError(errMsg || 'Failed to load shipping quotes. Please check your address details.');
      }
      setShippingQuotes([]);
      setSelectedQuote(null);
      setFormData(prev => ({ ...prev, shippingMethod: '' }));
      return null;
    } finally {
      if (thisRequestId === quoteRequestIdRef.current) {
        setLoadingQuotes(false);
      }
    }
  };

  // Authoritative sync with backend GET /api/checkout (Section 4 - Option 1)
  // Refreshes totals and retrieves fresh QuoteId matching current cart + promo state
  const syncCheckoutWithBackend = async (targetAddrId, targetMethodId, currentCouponCode) => {
    const rawId = Number(targetAddrId || addressId);
    if (!rawId || isNaN(rawId) || rawId <= 0) {
      return null;
    }

    try {
      const coupon = currentCouponCode !== undefined
        ? (currentCouponCode ? String(currentCouponCode).trim() : undefined)
        : (cart?.discountCode ? String(cart.discountCode).trim() : undefined);

      // Query GET /api/checkout WITHOUT shippingMethodId first to avoid 400 if method is invalid for address
      const summary = await checkoutApi.getCheckout({
        addressId: rawId,
        couponCode: coupon
      });

      if (!summary) return null;

      // Extract fresh shipping options from summary
      const rawOptions = summary.shippingOptions || [];
      const validOptions = (Array.isArray(rawOptions) ? rawOptions : [])
        .map(normalizeShippingOption)
        .filter(opt => opt && opt.shippingMethodId && Number(opt.shippingMethodId) > 0);

      if (validOptions.length > 0) {
        setShippingQuotes(validOptions);
      }

      const chosenMethodId = targetMethodId || Number(selectedQuote?.shippingMethodId || selectedQuote?.id);

      const matchingOpt = (chosenMethodId ? validOptions.find(o => Number(o.shippingMethodId || o.id) === Number(chosenMethodId)) : null)
        || validOptions[0]
        || (summary.selectedShippingMethod ? normalizeShippingOption(summary.selectedShippingMethod) : null)
        || selectedQuote;

      const freshQuoteId = matchingOpt?.quoteId
        || summary?.selectedShippingMethod?.quoteId
        || (summary.quoteId ? String(summary.quoteId) : null);

      if (matchingOpt) {
        const updatedOpt = {
          ...matchingOpt,
          carrier: matchingOpt.carrier || selectedQuote?.carrier || matchingOpt.shippingMethod || 'Carrier',
          quoteId: freshQuoteId || matchingOpt.quoteId
        };
        setSelectedQuote(updatedOpt);
        setFormData(prev => ({
          ...prev,
          shippingMethod: updatedOpt.shippingMethod || updatedOpt.methodName || prev.shippingMethod
        }));
      }

      return summary;
    } catch (err) {
      console.warn('[Checkout] Failed to sync checkout with backend:', err);
      return null;
    }
  };

  // Load authenticated patron saved addresses if available
  useEffect(() => {
    let active = true;
    async function loadSavedAddresses() {
      if (!user) return;
      try {
        const list = await addressApi.getAddresses();
        if (!active) return;
        if (Array.isArray(list) && list.length > 0) {
          setSavedAddresses(list);
          const defaultAddr = list.find(a => a.isDefaultShipping || a.isDefault) || list[0];
          setAddressId(defaultAddr.id);
          const cCode = defaultAddr.countryCode || 'BG';
          setFormData(prev => ({
            ...prev,
            label: defaultAddr.label || prev.label || 'Home',
            customLabel: defaultAddr.customLabel || '',
            fullName: defaultAddr.fullName || prev.fullName,
            phone: defaultAddr.phone || prev.phone,
            countryCode: cCode,
            region: defaultAddr.region || prev.region || 'Sofia City',
            city: defaultAddr.city || prev.city,
            addressLine1: defaultAddr.addressLine1 || defaultAddr.address || prev.addressLine1,
            addressLine2: defaultAddr.addressLine2 || '',
            address: defaultAddr.addressLine1 || defaultAddr.address || prev.address,
            postalCode: defaultAddr.postalCode || prev.postalCode,
            shippingMethod: ''
          }));
          setShippingQuotes([]);
          setSelectedQuote(null);
          if (import.meta.env.DEV) {
            console.log('[Checkout] Loaded saved addresses:', list);
          }
          fetchQuotesForAddress(defaultAddr.id, cart?.discountCode);
        }
      } catch (e) {
        // guest or unauthenticated
      }
    }
    loadSavedAddresses();
    return () => { active = false; };
  }, [user]);

  // Sync with authenticated user whenever auth state changes/finishes loading
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName === 'ECONT Test Customer' && user.name ? user.name : prev.fullName,
        email: prev.email === 'patron@arabiansheikh.com' && user.email ? user.email : prev.email,
      }));
    }
  }, [user]);

  // Refresh backend cart on mount to ensure synchrony across devices/tabs
  useEffect(() => {
    if (user && typeof refreshCart === 'function') {
      refreshCart().catch(() => {});
    }
  }, [user, refreshCart]);

  // Invalidate quotes and reset to Step 1 only if cart items actually change (deep fingerprint check)
  const getCartFingerprint = (cartItems) => {
    if (!Array.isArray(cartItems)) return '';
    return cartItems.map(i => `${i.id || i.productId}:${i.quantity}`).sort().join('|');
  };

  const prevItemsFingerprintRef = useRef(getCartFingerprint(items));
  useEffect(() => {
    const currentFingerprint = getCartFingerprint(items);
    if (prevItemsFingerprintRef.current !== currentFingerprint) {
      prevItemsFingerprintRef.current = currentFingerprint;
      setShippingQuotes([]);
      setSelectedQuote(null);
      setQuotesError(null);
      setFormData(prev => ({ ...prev, shippingMethod: '' }));
      if (step > 1) {
        setStep(1);
      }
    }
  }, [items, step]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollAbortRef.current) {
        pollAbortRef.current.abort();
      }
      if (quoteAbortRef.current) {
        quoteAbortRef.current.abort();
      }
    };
  }, []);

  // Handle saved address selection
  const handleSelectSavedAddress = (addr) => {
    setAddressId(addr.id);
    const addrCountryCode = addr.countryCode || 'BG';
    setFormData(prev => ({
      ...prev,
      label: addr.label || 'Home',
      customLabel: addr.customLabel || '',
      fullName: addr.fullName || prev.fullName,
      phone: addr.phone || prev.phone,
      countryCode: addrCountryCode,
      region: addr.region || '',
      city: addr.city || prev.city,
      addressLine1: addr.addressLine1 || addr.address || prev.addressLine1,
      addressLine2: addr.addressLine2 || '',
      address: addr.addressLine1 || addr.address || prev.address,
      postalCode: addr.postalCode || prev.postalCode,
      shippingMethod: ''
    }));
    // Invalidate previous quotes and errors
    setShippingQuotes([]);
    setSelectedQuote(null);
    setQuotesError(null);
    setAddressError(null);
    if (step > 1) {
      setStep(1);
    }
    if (import.meta.env.DEV) {
      console.log('[Checkout] Selected saved address:', addr.id, addr);
    }
    // Fetch quotes immediately for the newly selected address
    fetchQuotesForAddress(addr.id, cart?.discountCode);
  };

  // Handle manual address input changes
  const handleAddressFieldChange = (field, value) => {
    // Editing address fields invalidates the previously assigned addressId and quotes
    setAddressId(null);
    setShippingQuotes([]);
    setSelectedQuote(null);
    setQuotesError(null);
    setAddressError(null);
    setFormData(prev => ({
      ...prev,
      shippingMethod: '',
      [field]: value,
      ...(field === 'addressLine1' ? { address: value } : {}),
      ...(field === 'address' ? { addressLine1: value } : {})
    }));
  };

  if (items.length === 0) {
    return (
      <div className="relative min-h-screen text-[#F3E6D0] pt-36 pb-24 flex items-center justify-center overflow-hidden">
        {/* Grand Sovereign Palace Background Image */}
        <div className="fixed inset-0 z-0 select-none pointer-events-none overflow-hidden">
          <picture className="w-full h-full">
            <source media="(max-width: 767px)" type="image/webp" srcSet="/editorial/arabian_palace_phone_opt.webp" />
            <source type="image/webp" srcSet="/editorial/arabian_palace_desktop_opt.webp" />
            <img
              src="/editorial/arabian_palace_desktop_opt.jpg"
              alt="Arabian Palace"
              className="w-full h-full object-cover filter brightness-[0.88] contrast-[1.05]"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(242,214,117,0.25),transparent_70%)] pointer-events-none" />
        </div>
        <div className="relative z-10 text-center max-w-md mx-auto px-8 py-12 rounded-2xl bg-[#0B0A08]/80 backdrop-blur-2xl border border-[#D4AF37]/40 space-y-5 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(212,175,55,0.15)]">
          <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37]/50 bg-[#D4AF37]/10 flex items-center justify-center mx-auto text-[#D4AF37]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-cinzel text-2xl font-bold text-[#F3E6D0]">Your Shopping Bag is Empty</h2>
          <p className="text-xs text-[#D8BE99]">Add your desired flacons before proceeding to royal checkout.</p>
          <Link to="/shop" className="px-8 py-3 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel text-xs uppercase font-bold tracking-wider inline-block rounded-full shadow-lg transition-colors cursor-pointer">
            Return to Boutique
          </Link>
        </div>
      </div>
    );
  }

  const isBulgaria = (formData.countryCode || 'BG').toUpperCase() === 'BG';
  const qualifiesForBulgariaFreeShipping = isBulgaria && totals.subtotal > 49;

  const dynamicShippingCost = selectedQuote
    ? (qualifiesForBulgariaFreeShipping ? 0 : (Number(selectedQuote.cost) || 0))
    : 0;
  const shippingCost = dynamicShippingCost;
  const grandTotal = Math.max(0, totals.subtotal - (totals.discountAmount || 0) + dynamicShippingCost);

  // ─── STEP 1: Address submission & quote fetching ───────────────
  const handleAddressSubmit = async (e) => {
    if (e) e.preventDefault();
    setAddressError(null);
    setQuotesError(null);
    setProcessing(true);

    try {
      let currentAddrId = addressId;

      // 1. If no addressId exists, create address on backend
      if (!currentAddrId) {
        const countryCode = formData.countryCode || getCountryCode(formData.countryCode);
        const addressPayload = {
          label: ['Home', 'Work', 'Other'].includes(formData.label) ? formData.label : 'Home',
          customLabel: formData.customLabel !== undefined && formData.customLabel !== null ? String(formData.customLabel).trim() : '',
          fullName: String(formData.fullName || '').trim(),
          phone: String(formData.phone || '').trim(),
          countryCode,
          region: String(formData.region || formData.city || 'Sofia City').trim(),
          city: String(formData.city || '').trim(),
          addressLine1: String(formData.addressLine1 || formData.address || '').trim(),
          addressLine2: String(formData.addressLine2 || '').trim(),
          postalCode: String(formData.postalCode || '').trim()
        };

        if (import.meta.env.DEV) {
          console.log('[Checkout] Creating address on backend:', addressPayload);
        }
        try {
          const createdAddr = await addressApi.createAddress(addressPayload);
          if (!createdAddr?.id) {
            throw new Error('Address creation failed: Backend did not return an address ID.');
          }
          currentAddrId = createdAddr.id;
          setAddressId(createdAddr.id);
          if (import.meta.env.DEV) {
            console.log('[Checkout] Address created successfully:', currentAddrId);
          }
        } catch (addrErr) {
          console.error('[Checkout] Address creation error:', addrErr);
          const errorMsg = addrErr?.message || 'Failed to save shipping address. Please verify your address details.';
          setAddressError(errorMsg);
          error(errorMsg);
          setProcessing(false);
          return; // STOP! Never proceed if address creation fails!
        }
      } else {
        if (import.meta.env.DEV) {
          console.log('[Checkout] Using existing address ID:', currentAddrId);
        }
      }

      // 2. Set checkout address via PUT /api/checkout/address
      await checkoutApi.setCheckoutAddress({ addressId: currentAddrId }).catch(err => {
        console.warn('[Checkout] Checkout address sync notice:', err?.message || err);
      });

      // 3. Fetch fresh quotes for this address
      const opts = await fetchQuotesForAddress(currentAddrId, cart?.discountCode);

      if (!opts || opts.length === 0) {
        setProcessing(false);
        return; // STOP! fetchQuotesForAddress already sets quotesError
      }

      // 4. Valid quotes returned: advance to Step 2
      setStep(2);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } catch (generalErr) {
      console.error('[Checkout] Error preparing shipping options:', generalErr);
      const msg = generalErr?.message || 'An unexpected error occurred. Please try again.';
      setAddressError(msg);
      error(msg);
    } finally {
      setProcessing(false);
    }
  };

  // Helper to determine if a shipping quote option is currently selected
  const isOptionSelected = (opt) => {
    if (!selectedQuote || !opt) return false;
    if (selectedQuote === opt) return true;
    const selMethodId = Number(selectedQuote.shippingMethodId || selectedQuote.id);
    const optMethodId = Number(opt.shippingMethodId || opt.id);
    if (selMethodId && optMethodId && selMethodId === optMethodId) {
      if (selectedQuote.carrier && opt.carrier) {
        return String(selectedQuote.carrier).trim().toLowerCase() === String(opt.carrier).trim().toLowerCase();
      }
      return true;
    }
    const selMethod = String(selectedQuote.shippingMethod || selectedQuote.methodName || '').trim().toLowerCase();
    const optMethod = String(opt.shippingMethod || opt.methodName || '').trim().toLowerCase();
    const selCarrier = String(selectedQuote.carrier || '').trim().toLowerCase();
    const optCarrier = String(opt.carrier || '').trim().toLowerCase();
    return selMethod === optMethod && selCarrier === optCarrier;
  };

  const handleSelectShippingQuote = (opt) => {
    if (!opt) return;
    setSelectedQuote(opt);
    setFormData(prev => ({
      ...prev,
      shippingMethod: opt.shippingMethod || opt.methodName || 'Standard Delivery'
    }));
    setQuotesError(null);
    if (import.meta.env.DEV) {
      console.log('[Checkout] Selected shipping option:', opt);
    }
  };

  // ─── STEP 2: Shipping method selection submit ─────────────────
  const handleShippingSubmit = async (e) => {
    if (e) e.preventDefault();
    const resolvedMethodId = Number(selectedQuote?.shippingMethodId || selectedQuote?.id);
    let resolvedQuoteId = selectedQuote?.quoteId;

    if (!resolvedMethodId || isNaN(resolvedMethodId)) {
      const err = 'Please select a valid shipping method before proceeding.';
      setQuotesError(err);
      error(err);
      return;
    }

    setProcessing(true);
    try {
      const currentCoupon = cart?.discountCode ? String(cart.discountCode).trim() : undefined;

      // 1. Commit shipping selection via PUT /api/checkout/shipping (Section 4 - Option 2)
      await checkoutApi.setCheckoutShipping({
        shippingMethodId: resolvedMethodId,
        quoteId: resolvedQuoteId
      }, {
        addressId: addressId || undefined,
        couponCode: currentCoupon
      }).catch(syncErr => {
        console.warn('[Checkout] Checkout shipping sync notice:', syncErr?.message || syncErr);
      });

      // 2. Re-fetch checkout summary (Section 4 - Option 1) to obtain fresh QuoteId bound to net balance
      const summary = await syncCheckoutWithBackend(addressId, resolvedMethodId, currentCoupon);
      if (summary?.selectedShippingMethod?.quoteId) {
        resolvedQuoteId = summary.selectedShippingMethod.quoteId;
      }

      if (import.meta.env.DEV) {
        console.log('[Checkout] Confirmed shipping selection:', {
          shippingMethodId: resolvedMethodId,
          quoteId: resolvedQuoteId,
          carrier: selectedQuote?.carrier
        });
      }

      setStep(3);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } catch (err) {
      console.error('[Checkout] Shipping confirmation error:', err);
      const msg = err?.message || 'Failed to select shipping method.';
      setQuotesError(msg);
      error(msg);
    } finally {
      setProcessing(false);
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

    if (!addressId) {
      throw new Error('A valid delivery address is required.');
    }

    const currentCoupon = cart?.discountCode ? String(cart.discountCode).trim() : undefined;

    // 1. Fetch fresh checkout state without shippingMethodId to obtain valid available options and fresh quote
    let verifiedMethodId = Number(selectedQuote?.shippingMethodId || selectedQuote?.id);
    let activeQuoteId = selectedQuote?.quoteId;

    try {
      const summary = await checkoutApi.getCheckout({
        addressId,
        couponCode: currentCoupon
      });

      const rawOptions = summary?.shippingOptions || [];
      const validOptions = (Array.isArray(rawOptions) ? rawOptions : [])
        .map(normalizeShippingOption)
        .filter(opt => opt && opt.shippingMethodId && Number(opt.shippingMethodId) > 0);

      if (validOptions.length > 0) {
        setShippingQuotes(validOptions);
        const matchingOpt = (verifiedMethodId ? validOptions.find(o => Number(o.shippingMethodId) === Number(verifiedMethodId)) : null)
          || validOptions[0];

        if (matchingOpt) {
          verifiedMethodId = Number(matchingOpt.shippingMethodId);
          activeQuoteId = matchingOpt.quoteId || summary?.selectedShippingMethod?.quoteId || activeQuoteId;
          setSelectedQuote(matchingOpt);
          setFormData(prev => ({
            ...prev,
            shippingMethod: matchingOpt.shippingMethod || matchingOpt.methodName || prev.shippingMethod
          }));
        }
      } else if (summary?.selectedShippingMethod?.quoteId) {
        activeQuoteId = summary.selectedShippingMethod.quoteId;
      }
    } catch (syncErr) {
      console.warn('[Checkout] Pre-order checkout summary refresh notice:', syncErr?.message || syncErr);
    }

    if (!verifiedMethodId || isNaN(verifiedMethodId)) {
      throw new Error('A valid shipping method must be selected. Please recalculate shipping options.');
    }

    if (!activeQuoteId) {
      throw new Error('A valid shipping quote is required before creating an order. Please recalculate shipping.');
    }

    // Lock session with verified shipping selection (Section 4 - Option 2)
    await checkoutApi.setCheckoutShipping({
      shippingMethodId: verifiedMethodId,
      quoteId: String(activeQuoteId).trim()
    }, {
      addressId,
      couponCode: currentCoupon
    }).catch(lockErr => {
      console.warn('[Checkout] Pre-order setCheckoutShipping notice:', lockErr?.message || lockErr);
    });

    const orderShippingCost = qualifiesForBulgariaFreeShipping ? 0 : (Number(selectedQuote?.cost) || 0);

    // Retrieve authoritative address snapshot from backend for order record
    let authoritativeAddress = {
      label: formData.label || 'Home',
      customLabel: formData.customLabel || '',
      fullName: finalName,
      phone: formData.phone,
      countryCode: formData.countryCode || 'BG',
      country: selectedCountry?.name || 'Bulgaria',
      region: formData.region || formData.city || 'Sofia City',
      city: formData.city,
      addressLine1: formData.addressLine1 || formData.address,
      addressLine2: formData.addressLine2 || '',
      address: formData.addressLine1 || formData.address,
      postalCode: formData.postalCode,
    };

    try {
      const snapshot = await addressApi.getAddressSnapshot(addressId);
      if (snapshot) {
        authoritativeAddress = {
          ...authoritativeAddress,
          fullName: snapshot.fullName || authoritativeAddress.fullName,
          phone: snapshot.phone || authoritativeAddress.phone,
          countryCode: snapshot.countryCode || authoritativeAddress.countryCode,
          region: snapshot.region || authoritativeAddress.region,
          city: snapshot.city || authoritativeAddress.city,
          addressLine1: snapshot.addressLine1 || authoritativeAddress.addressLine1,
          addressLine2: snapshot.addressLine2 || authoritativeAddress.addressLine2,
          address: snapshot.addressLine1 || authoritativeAddress.address,
          postalCode: snapshot.postalCode || authoritativeAddress.postalCode,
        };
      }
    } catch (snapErr) {
      console.warn('[Checkout] Failed to fetch snapshot for order creation, using form data:', snapErr);
    }

    if (import.meta.env.DEV) {
      console.log('[Checkout] Creating order with verified parameters:', {
        addressId,
        shippingMethodId: verifiedMethodId,
        quoteId: activeQuoteId,
        paymentMethod: getApiPaymentMethod(),
        couponCode: currentCoupon || null
      });
    }

    const newOrder = await orderService.createOrder({
      addressId,
      userId: user?.id || null,
      customerEmail: finalEmail,
      customerName: finalName,
      customerPhone: authoritativeAddress.phone,
      items,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      discountCode: currentCoupon || null,
      shipping: orderShippingCost,
      shippingCost: orderShippingCost,
      total: grandTotal,
      quoteId: String(activeQuoteId).trim(),
      shippingMethodId: verifiedMethodId,
      carrier: selectedQuote?.carrier || selectedQuote?.carrierName || selectedQuote?.shippingMethod || 'Carrier',
      shippingAddress: authoritativeAddress,
      paymentMethod: getApiPaymentMethod()
    });

    if (import.meta.env.DEV) {
      console.log('[Checkout] Order created successfully:', newOrder);
    }

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
      if (import.meta.env.DEV) {
        console.log('[Checkout] Placing COD order...');
      }
      const newOrder = await createBackendOrder();
      const createdOrderId = newOrder.id || newOrder.numericId;
      
      clearPaymentSession(createdOrderId);
      clearCheckoutOrder();
      decrementStock();
      clearCart();

      // Record placed order so reviews & account order history see it
      orderService.recordPlacedOrderId(createdOrderId);

      if (import.meta.env.DEV) {
        console.log('[Checkout] COD order successfully placed:', createdOrderId);
      }

      success('Order placed successfully! Pay in cash on delivery.');
      navigate(`/order-confirmation/${createdOrderId}`);
    } catch (err) {
      console.error('[Checkout] COD order placement error:', err);
      const msg = err?.message || 'Failed to place order. Please try again.';
      if (
        err?.code === 'INVALID_SHIPPING_METHOD' ||
        err?.code === 'SHIPPING_QUOTE_MISMATCH' ||
        err?.code === 'QUOTE_MISMATCH' ||
        msg.includes('INVALID_SHIPPING_METHOD') ||
        msg.includes('SHIPPING_QUOTE_MISMATCH') ||
        msg.includes('Quote no longer matches')
      ) {
        setQuotesError('Shipping quote expired or no longer matches order parameters. Please re-select your delivery method.');
        await fetchQuotesForAddress(addressId, cart?.discountCode);
        setStep(2);
      }
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
      if (import.meta.env.DEV) {
        console.log('[Checkout] Initiating Stripe flow: creating backend order first...');
      }

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

      if (import.meta.env.DEV) {
        console.log('[Checkout] Order created. Initializing Stripe payment intent for order:', createdOrderId, 'IdempotencyKey:', payKey);
      }

      const intent = await paymentService.createPaymentIntent(createdOrderId, payKey);

      if (import.meta.env.DEV) {
        console.log('[Checkout] Stripe payment intent created:', intent);
      }

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
      console.error('[Checkout] Stripe payment setup error:', err);
      const msg = err?.message || 'Failed to prepare payment. Please try again.';
      if (
        err?.code === 'INVALID_SHIPPING_METHOD' ||
        err?.code === 'SHIPPING_QUOTE_MISMATCH' ||
        err?.code === 'QUOTE_MISMATCH' ||
        msg.includes('INVALID_SHIPPING_METHOD') ||
        msg.includes('SHIPPING_QUOTE_MISMATCH') ||
        msg.includes('Quote no longer matches')
      ) {
        setQuotesError('Shipping quote expired or no longer matches order parameters. Please re-select your delivery method.');
        await fetchQuotesForAddress(addressId, cart?.discountCode);
        setStep(2);
      }
      setPaymentError(msg);
      setPaymentStatus(null);
      error(msg);
    } finally {
      setProcessing(false);
    }
  };

  // ─── Start polling for payment result ────────────────────────
  function startPolling(paymentId, orderId, customClientSecret) {
    setPaymentStatus('polling');

    // Abort any existing poll
    if (pollAbortRef.current) {
      pollAbortRef.current.abort();
    }
    const controller = new AbortController();
    pollAbortRef.current = controller;

    paymentService.pollUntilTerminal(paymentId, {
      signal: controller.signal,
      orderId: orderId || orderIdState,
      clientSecret: customClientSecret || clientSecret,
    }).then(result => {
      handlePaymentResult(result, orderId);
    }).catch(err => {
      if (err.message === 'PAYMENT_POLL_TIMEOUT') {
        setPaymentStatus('timeout');
      } else if (err.message === 'PAYMENT_POLL_AUTH_ERROR') {
        setPaymentStatus('unverified');
        setPaymentError('Payment was submitted to Stripe, but status could not be verified automatically. If your card was charged, your order is recorded.');
      } else if (err.message === 'PAYMENT_NOT_FOUND') {
        setPaymentStatus('unverified');
        setPaymentError('Payment record is taking longer to register. Please check your order in My Orders.');
      } else if (err.message !== 'PAYMENT_POLL_ABORTED') {
        setPaymentError(err.message || 'Payment confirmation error.');
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
      setPaymentStatus('paid');
      setPaymentError(null);
      success('Payment successful! Your order has been placed.');
    } else if (result.status === 'Failed') {
      clearPaymentSession(oid);
      setPaymentStatus('failed');
      setPaymentError(result?.message || 'Payment failed or was declined. Please try another card.');
    } else {
      setPaymentStatus('timeout');
    }
  }

  // ─── Stripe form callbacks ───────────────────────────────────
  function handleStripeConfirmed(result) {
    const status = result?.status;
    const oid = orderIdState;

    // IMMEDIATE RESOLUTION: If Stripe Elements already verified Paid, transition instantly
    if (status === 'Paid') {
      clearPaymentSession(oid);
      clearCheckoutOrder();
      decrementStock();
      clearCart();
      orderService.recordPlacedOrderId(oid);
      setPaymentStatus('paid');
      setPaymentError(null);
      success('Payment successful! Your order has been placed.');
      return;
    }

    if (status === 'Failed') {
      clearPaymentSession(oid);
      setPaymentStatus('failed');
      setPaymentError(result?.message || 'Payment was declined. Please try another card.');
      return;
    }

    // Only start polling if status is genuinely pending / processing
    if (paymentIdState && orderIdState) {
      startPolling(paymentIdState, orderIdState, clientSecret);
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
    <div className="relative min-h-screen text-[#F3E6D0] pt-28 sm:pt-32 pb-16 overflow-hidden">
      {/* Grand Sovereign Palace Background Image from Landing Page */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none overflow-hidden">
        <picture className="w-full h-full">
          <source
            media="(max-width: 767px)"
            type="image/webp"
            srcSet="/editorial/arabian_palace_phone_opt.webp"
          />
          <source
            media="(max-width: 767px)"
            srcSet="/editorial/arabian_palace_phone_opt.jpg"
          />
          <source
            type="image/webp"
            srcSet="/editorial/arabian_palace_desktop_opt.webp"
          />
          <img
            src="/editorial/arabian_palace_desktop_opt.jpg"
            alt="The Grand Sovereign Palace of Arabian Sheikh"
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.88] contrast-[1.05]"
            loading="eager"
            fetchPriority="high"
          />
        </picture>

        {/* Cheerful Golden Radiant Bloom & Ambient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/75 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(242,214,117,0.25),transparent_65%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(212,175,55,0.18),transparent_50%)] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/45 text-xs uppercase tracking-[0.25em] text-[#F2D675] font-cinzel backdrop-blur-md shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>256-Bit Encrypted Sovereign Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-cinzel font-bold text-[#F3E6D0] drop-shadow-md">
            Complete Your Royal Acquisition
          </h1>
          <p className="text-xs text-[#D8BE99] font-cinzel tracking-wider">
            Experience the pinnacle of Arabian haute perfumerie
          </p>
        </div>

        {/* Multi-step Header */}
        <div className="max-w-2xl mx-auto mb-10 px-6 py-3.5 rounded-full bg-[#0B0A08]/60 backdrop-blur-xl border border-[#D4AF37]/30 shadow-lg flex items-center justify-between text-xs font-cinzel uppercase tracking-wider">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#D4AF37] font-bold' : 'text-neutral-500'}`}>
            <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] ${step >= 1 ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#F2D675]' : 'border-neutral-600'}`}>1</span>
            <span>Contact & Shipping</span>
          </div>
          <div className="w-8 sm:w-12 h-px bg-white/10" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#D4AF37] font-bold' : 'text-neutral-500'}`}>
            <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] ${step >= 2 ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#F2D675]' : 'border-neutral-600'}`}>2</span>
            <span>Delivery</span>
          </div>
          <div className="w-8 sm:w-12 h-px bg-white/10" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#D4AF37] font-bold' : 'text-neutral-500'}`}>
            <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] ${step >= 3 ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#F2D675]' : 'border-neutral-600'}`}>3</span>
            <span>Payment</span>
          </div>
          {step === 4 && (
            <>
              <div className="w-8 sm:w-12 h-px bg-white/10" />
              <div className="flex items-center gap-2 text-[#D4AF37] font-bold">
                <span className="w-6 h-6 rounded-full border border-[#D4AF37] bg-[#D4AF37]/20 flex items-center justify-center text-[10px] text-[#F2D675]">4</span>
                <span>Confirm</span>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Form Area */}
          <div className="lg:col-span-7 bg-[#0B0A08]/75 backdrop-blur-2xl border border-[#D4AF37]/35 p-6 sm:p-8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_30px_rgba(212,175,55,0.12)] space-y-6">
            
            {/* STEP 1: Contact & Address */}
            {step === 1 && (
              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <h2 className="font-cinzel text-base font-bold text-[#D4AF37] uppercase tracking-wider pb-3 border-b border-white/10">
                  1. Contact & Delivery Destination
                </h2>

                {/* Bulgaria Free Delivery Notice */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#0B0A08] to-[#1A1208] border border-[#D4AF37]/35 text-xs flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-2 text-[#D4AF37]">
                    <Truck className="w-4 h-4 shrink-0" />
                    <span className="font-cinzel font-bold text-[11px] uppercase tracking-wider">Bulgaria Delivery Privilege</span>
                  </div>
                  <span className="text-[11px] text-[#D8BE99]">
                    {totals.subtotal > 49 ? (
                      <span className="text-emerald-400 font-bold">✓ Free Delivery Unlocked for Bulgaria (Orders &gt; €49)</span>
                    ) : (
                      <span>Orders above €49 receive <strong>Free Delivery in Bulgaria</strong> (Exclusive option)</span>
                    )}
                  </span>
                </div>

                {/* Saved Palace Addresses (if authenticated patron has saved addresses) */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-2 pb-2">
                    <label className="text-[#D8BE99] uppercase text-[11px] font-cinzel font-bold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Saved Palace Addresses</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {savedAddresses.map((addr) => {
                        const isSelected = addressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectSavedAddress(addr)}
                            className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#F2D675]'
                                : 'bg-black/40 border-white/10 text-[#D8BE99] hover:border-white/30'
                            }`}
                          >
                            <div className="font-bold font-cinzel flex items-center justify-between">
                              <span>{addr.label || 'Delivery Address'}</span>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />}
                            </div>
                            <p className="line-clamp-1 text-[11px] text-[#F3E6D0]">{addr.addressLine1}</p>
                            <p className="text-[10px] text-neutral-400">{addr.city}, {addr.countryCode || addr.country}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Address Category */}
                <div className="space-y-2">
                  <label className="text-[#D8BE99] uppercase text-[11px] font-cinzel font-bold">
                    Address Category *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Home', label: 'Home', icon: Home },
                      { id: 'Work', label: 'Office', icon: Briefcase },
                      { id: 'Other', label: 'Other', icon: MapPin }
                    ].map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = formData.label === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleAddressFieldChange('label', cat.id)}
                          className={`py-2 px-3 rounded border flex items-center justify-center gap-2 font-cinzel text-xs uppercase font-bold tracking-wider transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#D4AF37] bg-[#D4AF37] text-black shadow-md'
                              : 'border-[#D4AF37]/25 bg-black/40 text-[#D8BE99] hover:border-[#D4AF37]/50 hover:text-white'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Label */}
                <div className="space-y-1">
                  <label className="text-[#D8BE99] uppercase text-[11px] font-bold">
                    Custom Label {formData.label === 'Other' && <span className="text-rose-400">*</span>}
                  </label>
                  <input
                    type="text"
                    value={formData.customLabel}
                    onChange={(e) => handleAddressFieldChange('customLabel', e.target.value)}
                    placeholder="e.g. Test Home, Royal Villa, Diplomatic Salon"
                    className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2.5 rounded text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-[#D8BE99] uppercase text-[11px] font-bold">Recipient Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleAddressFieldChange('fullName', e.target.value)}
                      placeholder="e.g. ECONT Test Customer"
                      className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2.5 rounded text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[#D8BE99] uppercase text-[11px] font-bold">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleAddressFieldChange('email', e.target.value)}
                      placeholder="patron@arabiansheikh.com"
                      className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2.5 rounded text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  {/* Country Selection */}
                  <div className="space-y-1">
                    <label className="text-[#D8BE99] uppercase text-[11px] font-bold flex items-center justify-between">
                      <span>Country / Destination *</span>
                      <span className="text-[10px] text-[#D4AF37] font-mono">Code: {selectedCountry.code}</span>
                    </label>
                    <div className="relative">
                      <Globe className="w-3.5 h-3.5 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={formData.countryCode}
                        onChange={(e) => handleCountryCodeChange(e.target.value)}
                        className="w-full bg-black/60 border border-[#D4AF37]/30 pl-9 pr-8 py-2.5 rounded text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none appearance-none cursor-pointer"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code} className="bg-[#0B0A08] text-[#F3E6D0]">
                            {c.flag} {c.name} ({c.code}) — {c.dialCode}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#D4AF37] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Courier Phone Number matching country */}
                  <div className="space-y-1">
                    <label className="text-[#D8BE99] uppercase text-[11px] font-bold flex items-center justify-between">
                      <span>Phone Number *</span>
                      <span className="text-[10px] text-[#D4AF37] font-mono">Dial Code: {selectedCountry.dialCode}</span>
                    </label>
                    <div className="flex rounded bg-black/60 border border-[#D4AF37]/30 focus-within:border-[#D4AF37] transition-all overflow-hidden">
                      <div className="flex items-center gap-1.5 px-3 py-2.5 bg-[#D4AF37]/10 border-r border-[#D4AF37]/20 text-[#F2D675] font-mono text-xs font-bold shrink-0 select-none">
                        <span>{selectedCountry.flag}</span>
                        <span>{selectedCountry.dialCode}</span>
                      </div>
                      <input
                        type="tel"
                        required
                        value={
                          formData.phone.startsWith(selectedCountry.dialCode)
                            ? formData.phone.slice(selectedCountry.dialCode.length)
                            : formData.phone.replace(/^\+\d+/, '')
                        }
                        onChange={handlePhoneInputChange}
                        placeholder={selectedCountry.placeholder}
                        className="w-full bg-transparent px-3 py-2.5 text-xs text-[#F3E6D0] focus:outline-none font-mono"
                      />
                    </div>
                    <p className="text-[10px] text-neutral-400">
                      International: <span className="text-[#D4AF37] font-mono">{formData.phone}</span>
                    </p>
                  </div>

                  {/* Street Address Line 1 */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[#D8BE99] uppercase text-[11px] font-bold">Address Line 1 / Street Address *</label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={formData.addressLine1}
                        onChange={(e) => handleAddressFieldChange('addressLine1', e.target.value)}
                        placeholder="e.g. bul. Vitosha 1"
                        className="w-full bg-black/60 border border-[#D4AF37]/30 pl-9 pr-3 py-2.5 rounded text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Address Line 2 */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[#D8BE99] uppercase text-[11px] font-bold">Address Line 2 / Suite / Floor (Optional)</label>
                    <input
                      type="text"
                      value={formData.addressLine2}
                      onChange={(e) => handleAddressFieldChange('addressLine2', e.target.value)}
                      placeholder="e.g. Apt 4B, Level 2 (optional)"
                      className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2.5 rounded text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-1">
                    <label className="text-[#D8BE99] uppercase text-[11px] font-bold">City / Municipality *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => handleAddressFieldChange('city', e.target.value)}
                      placeholder="e.g. Sofia"
                      className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2.5 rounded text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  {/* Region */}
                  <div className="space-y-1">
                    <label className="text-[#D8BE99] uppercase text-[11px] font-bold">Region / State / Province *</label>
                    <input
                      type="text"
                      required
                      value={formData.region}
                      onChange={(e) => handleAddressFieldChange('region', e.target.value)}
                      placeholder="e.g. Sofia City"
                      className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2.5 rounded text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  {/* Postal Code */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[#D8BE99] uppercase text-[11px] font-bold">Postal / ZIP Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) => handleAddressFieldChange('postalCode', e.target.value)}
                      placeholder="e.g. 1000"
                      className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2.5 rounded text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Step 1 Error Alerts */}
                {addressError && (
                  <div role="alert" className="p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    <span>{addressError}</span>
                  </div>
                )}

                {quotesError && (
                  <div role="alert" className="p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    <span>{quotesError}</span>
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={processing || loadingQuotes}
                    className="px-8 py-3 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider hover:bg-[#F2D675] disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    {processing || loadingQuotes ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying & Quoting...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue to Shipping Options</span>
                        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Shipping Method Selection */}
            {step === 2 && (
              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h2 className="font-cinzel text-base font-bold text-[#D4AF37] uppercase tracking-wider">
                    2. Select Insured Shipping Method
                  </h2>
                  <span className="text-[11px] font-mono text-[#D8BE99]">
                    {shippingQuotes.length} Options Available
                  </span>
                </div>

                {quotesError && (
                  <div role="alert" className="p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    <span>{quotesError}</span>
                  </div>
                )}

                {qualifiesForBulgariaFreeShipping && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs flex items-center gap-2.5 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      <strong>Bulgaria Free Delivery Applied:</strong> Your order qualifies for 100% complimentary delivery (orders over €49).
                    </span>
                  </div>
                )}

                {loadingQuotes ? (
                  <div className="p-8 text-center space-y-2 bg-black/40 border border-white/10 rounded-xl">
                    <Truck className="w-5 h-5 animate-pulse text-[#D4AF37] mx-auto" />
                    <p className="text-xs font-cinzel text-[#D8BE99]">Calculating real-time carrier quotes...</p>
                  </div>
                ) : shippingQuotes.length === 0 ? (
                  <div className="space-y-4 p-6 bg-black/40 border border-white/10 rounded-xl text-center">
                    <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto" />
                    <p className="text-xs font-cinzel text-[#F3E6D0]">
                      No shipping methods are available for the selected address. Please choose a different delivery address.
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-2.5 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
                    >
                      Return to Address Details
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shippingQuotes.map((opt, idx) => {
                      const isSelected = isOptionSelected(opt);
                      const carrierUpper = String(opt.carrier || '').toUpperCase();
                      const isEcont = carrierUpper.includes('ECONT');
                      const isSpeedy = carrierUpper.includes('SPEEDY');
                      const isDhl = carrierUpper.includes('DHL');
                      const optionKey = `shipping-quote-${opt.shippingMethodId ?? opt.id ?? idx}-${idx}`;
                      const inputId = `shipping-radio-${opt.shippingMethodId ?? opt.id ?? idx}-${idx}`;

                      return (
                        <div
                          key={optionKey}
                          onClick={() => handleSelectShippingQuote(opt)}
                          className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-300 select-none ${
                            isSelected
                              ? 'bg-black/80 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]/50'
                              : 'bg-black/50 border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              id={inputId}
                              name="shippingMethodSelection"
                              checked={isSelected}
                              onChange={() => handleSelectShippingQuote(opt)}
                              onClick={(e) => e.stopPropagation()}
                              className="accent-[#D4AF37] w-4 h-4 cursor-pointer"
                            />
                            <label htmlFor={inputId} className="space-y-0.5 cursor-pointer">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded border ${
                                  isEcont
                                    ? 'bg-amber-950/80 text-[#F2D675] border-[#D4AF37]/40'
                                    : isSpeedy
                                    ? 'bg-blue-950/80 text-blue-300 border-blue-500/40'
                                    : isDhl
                                    ? 'bg-yellow-950/80 text-yellow-300 border-yellow-500/40'
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
                            </label>
                          </div>
                          <div className="text-right">
                            {qualifiesForBulgariaFreeShipping ? (
                              <div className="space-y-0.5">
                                <span className="font-mono text-xs font-bold text-emerald-400">
                                  FREE
                                </span>
                                {Number(opt.cost) > 0 && (
                                  <span className="block font-mono text-[10px] text-neutral-400 line-through">
                                    €{Number(opt.cost).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="font-mono text-xs font-bold text-[#D4AF37]">
                                €{Number(opt.cost).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
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
                  {shippingQuotes.length > 0 && (
                    <button
                      type="submit"
                      disabled={processing || !selectedQuote}
                      className="px-8 py-3 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider hover:bg-[#F2D675] disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue to Payment</span>
                          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                        </>
                      )}
                    </button>
                  )}
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
                    onSwitchToCod={() => {
                      setFormData(prev => ({ ...prev, paymentMethod: 'COD' }));
                      setPaymentStatus(null);
                      setClientSecret(null);
                      setStep(3);
                    }}
                  />
                )}

                {/* Payment Successful / Paid */}
                {paymentStatus === 'paid' && (
                  <div className="p-8 rounded-2xl bg-[#0B0A08]/90 border border-emerald-500/40 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
                    <div className="w-16 h-16 rounded-full border-2 border-emerald-400 bg-emerald-950/60 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.3)]">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-cinzel text-lg font-bold text-emerald-300 uppercase tracking-wider">
                        Payment Successful & Confirmed
                      </p>
                      <p className="text-xs text-[#D8BE99]">
                        Your transaction has been verified and settled. Your order has been placed successfully.
                      </p>
                    </div>

                    {orderIdState && (
                      <div className="p-3 rounded-xl bg-black/60 border border-emerald-500/25 flex items-center justify-around text-xs font-mono">
                        <div>
                          <span className="text-neutral-400 block text-[10px]">Order Ref</span>
                          <span className="text-[#F2D675] font-bold">#ORD-{orderIdState}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[10px]">Payment Status</span>
                          <span className="text-emerald-400 font-bold">PAID</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[10px]">Total Paid</span>
                          <span className="text-[#F3E6D0] font-bold">€{grandTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                      <button
                        onClick={() => navigate(`/order-confirmation/${orderIdState}`)}
                        className="px-8 py-3 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-full hover:bg-[#F2D675] transition-all cursor-pointer shadow-lg"
                      >
                        View Order Confirmation
                      </button>
                      <button
                        onClick={() => navigate('/account/orders')}
                        className="px-6 py-3 border border-[#D4AF37]/30 bg-black/50 text-[#F3E6D0] font-cinzel font-bold text-xs uppercase tracking-wider rounded-full hover:border-[#D4AF37] cursor-pointer"
                      >
                        My Orders
                      </button>
                    </div>
                  </div>
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
                  <div className="p-8 rounded-2xl bg-[#0B0A08]/90 border border-rose-500/40 text-center space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
                    <div className="w-16 h-16 rounded-full border-2 border-rose-400 bg-rose-950/60 flex items-center justify-center mx-auto text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.3)]">
                      <XCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-cinzel text-lg font-bold text-rose-300 uppercase tracking-wider">
                        Payment Failed / Declined
                      </p>
                      <p className="text-xs text-[#D8BE99] max-w-md mx-auto">
                        {paymentError || 'Your card was declined or could not be processed by your bank. Please try another card or switch to Cash on Delivery.'}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                      <button
                        onClick={handleRetryPayment}
                        className="px-6 py-3 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-full hover:bg-[#F2D675] transition-all cursor-pointer shadow-lg"
                      >
                        Try Another Card
                      </button>
                      <button
                        onClick={() => {
                          setFormData(prev => ({ ...prev, paymentMethod: 'COD' }));
                          setPaymentStatus(null);
                          setClientSecret(null);
                          setStep(3);
                        }}
                        className="px-6 py-3 border border-white/20 bg-black/50 text-[#F3E6D0] font-cinzel font-bold text-xs uppercase tracking-wider rounded-full hover:border-white transition-all cursor-pointer"
                      >
                        Pay with Cash on Delivery
                      </button>
                    </div>
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

                {/* Unverified / Auth Issue but Payment Submitted */}
                {paymentStatus === 'unverified' && (
                  <div className="p-8 rounded-xl bg-[#0B0A08]/90 border border-amber-500/40 text-center space-y-5 shadow-2xl">
                    <div className="w-16 h-16 rounded-full border-2 border-amber-400 bg-amber-950/50 flex items-center justify-center mx-auto">
                      <AlertTriangle className="w-8 h-8 text-amber-400" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-cinzel text-base font-bold text-[#F3E6D0]">
                        Payment Submitted — Verification Needed
                      </h3>
                      <p className="text-xs text-[#D8BE99] max-w-md mx-auto leading-relaxed">
                        {paymentError || 'Your payment was submitted to Stripe. We could not verify the final status automatically. If your card was charged, your order has been received.'}
                      </p>
                    </div>
                    {orderIdState && (
                      <p className="text-[11px] font-mono text-[#D4AF37]">
                        Order Reference: #{orderIdState}
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => navigate('/account/orders')}
                        className="px-6 py-2.5 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-full hover:bg-[#F2D675] transition-colors cursor-pointer"
                      >
                        View My Orders
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (paymentIdState || orderIdState) {
                            startPolling(paymentIdState, orderIdState);
                          }
                        }}
                        className="px-6 py-2.5 border border-[#D4AF37]/40 bg-black/50 text-[#F3E6D0] font-cinzel font-bold text-xs uppercase tracking-wider rounded-full hover:border-[#D4AF37] transition-colors cursor-pointer"
                      >
                        Check Again
                      </button>
                    </div>
                  </div>
                )}

                {/* Stripe inline error on form */}
                {paymentError && paymentStatus === 'ready' && (
                  <div role="alert" className="p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 text-xs">
                    {paymentError}
                  </div>
                )}

                {/* Back button (only if form is showing or unverified/failed/timeout, not during active polling) */}
                {(paymentStatus === 'ready' || paymentStatus === 'failed' || paymentStatus === 'unverified' || paymentStatus === 'timeout') && (
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
          <div className="lg:col-span-5 bg-[#0B0A08]/75 backdrop-blur-2xl border border-[#D4AF37]/35 p-6 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_30px_rgba(212,175,55,0.12)] space-y-6 sticky top-32">
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
                    onClick={handleRemoveCoupon}
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
                <span>{selectedQuote ? (selectedQuote.shippingMethod || selectedQuote.carrier || 'Shipping') : 'Shipping'}</span>
                <span className="font-mono text-[#F3E6D0]">
                  {selectedQuote ? (
                    qualifiesForBulgariaFreeShipping ? (
                      <span className="text-emerald-400 font-bold">FREE (Bulgaria &gt; €49)</span>
                    ) : (
                      `€${Number(shippingCost).toFixed(2)}`
                    )
                  ) : (
                    'Calculated at step 2'
                  )}
                </span>
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
