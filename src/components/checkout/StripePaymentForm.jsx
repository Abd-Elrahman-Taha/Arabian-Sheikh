import React, { useState, Component } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  getStripePromise,
  getStripePublishableKey,
  setCustomStripePublishableKey
} from '../../services/paymentService';
import { Lock, ShieldCheck, CreditCard, Loader2, AlertCircle, RefreshCw, Key, Banknote } from 'lucide-react';

/**
 * Error boundary for catching Stripe Elements loading and runtime errors
 */
class StripeErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[StripeErrorBoundary] Caught error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error?.message || 'Payment form initialization failed.');
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.state.error, () => this.setState({ hasError: false, error: null }));
    }
    return this.props.children;
  }
}

/**
 * Inner form component that uses Stripe hooks (must be inside <Elements>)
 */
function CheckoutForm({ returnUrl, onConfirmed, onError, processing, setProcessing, onLoadError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [stripeError, setStripeError] = useState(null);
  const [elementReady, setElementReady] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements || processing) return;

    setProcessing(true);
    setStripeError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    // If we reach here, it means NO redirect happened.
    // A redirect would have navigated away from the page entirely.
    if (error) {
      // Inline error (e.g. card declined, incomplete details)
      // Show the error, stay on the form, let the customer correct and re-confirm
      const errorMsg = error.message || 'Payment could not be confirmed.';
      setStripeError(errorMsg);
      setProcessing(false);
      if (onError) onError(errorMsg);
      return;
    }

    // No redirect and no error: the result still needs backend confirmation.
    // Start polling — this point is NOT payment success.
    // Only GET /api/payments/{id} → status Paid authorizes the success screen.
    setProcessing(false);
    if (onConfirmed) onConfirmed();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Stripe PaymentElement — renders the secure card form */}
      <div className="bg-white/[0.03] border border-[#D4AF37]/20 rounded-xl p-4 min-h-[220px] relative">
        {!elementReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl z-10">
            <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" />
          </div>
        )}
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
          onReady={() => setElementReady(true)}
          onLoadError={(err) => {
            console.error('[PaymentElement] Load error:', err);
            const msg = err?.error?.message || err?.message || 'Failed to load Stripe card input.';
            setStripeError(msg);
            if (onLoadError) onLoadError(err);
          }}
        />
      </div>

      {/* Stripe inline error */}
      {stripeError && (
        <div role="alert" className="p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{stripeError}</span>
        </div>
      )}

      {/* Security badges */}
      <div className="flex items-center gap-3 text-[10px] text-[#D8BE99]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span>256-bit encrypted • Powered by Stripe • PCI DSS Level 1</span>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={!stripe || processing || !elementReady}
        className="group/btn relative w-full px-8 py-4 rounded-full bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-white hover:text-black border border-[#F2D675]/50 hover:border-white font-cinzel font-bold text-xs uppercase tracking-[0.22em] transition-all duration-400 shadow-[0_10px_30px_rgba(140,98,57,0.45)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.65)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 overflow-hidden cursor-pointer"
      >
        {/* Light Glint */}
        <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        {processing ? (
          <span className="relative z-10 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing Payment...</span>
          </span>
        ) : (
          <span className="relative z-10 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Pay Securely</span>
          </span>
        )}
      </button>
    </form>
  );
}

/**
 * StripePaymentForm — Mounts Stripe Elements with the clientSecret
 * and renders the PaymentElement card form.
 * 
 * Props:
 *  - clientSecret: string — from POST /api/payments/stripe/payment-intent
 *  - orderId: number — for building the return URL
 *  - paymentId: number — for recovery after redirect
 *  - onConfirmed: () => void — called when confirmation succeeds (no redirect); start polling
 *  - onError: (message: string) => void — called on inline Stripe errors
 *  - onSwitchToCod?: () => void — optional callback to switch to Cash on Delivery
 */
export default function StripePaymentForm({
  clientSecret,
  orderId,
  paymentId,
  onConfirmed,
  onError,
  onSwitchToCod
}) {
  const [processing, setProcessing] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [keyInput, setKeyInput] = useState(() => getStripePublishableKey());
  const [activeKey, setActiveKey] = useState(() => getStripePublishableKey());

  const currentStripePromise = getStripePromise(activeKey);

  const handleSaveKey = (e) => {
    e?.preventDefault();
    const trimmed = keyInput.trim();
    if (!trimmed) return;
    setCustomStripePublishableKey(trimmed);
    setActiveKey(trimmed);
    setLoadError(null);
    setShowKeyConfig(false);
  };

  if (!currentStripePromise || !activeKey) {
    return (
      <div className="p-6 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs space-y-3">
        <div className="flex items-center gap-2 text-red-400 font-bold">
          <AlertCircle className="w-4 h-4" />
          <span>Stripe Configuration Error</span>
        </div>
        <p>Missing or invalid Stripe Publishable Key in environment configuration.</p>
        <div className="pt-2">
          <form onSubmit={handleSaveKey} className="space-y-2">
            <label className="block text-[11px] text-[#D8BE99] uppercase">
              Enter Stripe Publishable Key (pk_test_...):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="pk_test_..."
                className="flex-1 bg-black/60 border border-white/15 px-3 py-2 rounded text-xs font-mono text-[#F3E6D0] focus:border-[#D4AF37]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="p-6 rounded-xl bg-black/40 border border-white/10 text-center">
        <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37] mx-auto mb-2" />
        <p className="text-xs font-cinzel text-[#D8BE99]">Preparing secure payment...</p>
      </div>
    );
  }

  // Persist paymentId BEFORE mounting Elements so it survives 3DS redirects
  // Never persist clientSecret per Section 14
  if (paymentId && orderId) {
    try {
      sessionStorage.setItem(`arabian_sheikh_pay:${orderId}`, JSON.stringify({ paymentId }));
    } catch {}
  }

  const returnUrl = `${window.location.origin}/payment/return?orderId=${orderId}&paymentId=${paymentId}`;

  // Stripe Elements appearance matching the dark luxury theme
  const appearance = {
    theme: 'night',
    variables: {
      colorPrimary: '#D4AF37',
      colorBackground: '#0B0A08',
      colorText: '#F3E6D0',
      colorDanger: '#ef4444',
      fontFamily: '"Cinzel", serif',
      borderRadius: '8px',
    },
    rules: {
      '.Input': {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        color: '#F3E6D0',
      },
      '.Input:focus': {
        border: '1px solid #D4AF37',
        boxShadow: '0 0 0 1px #D4AF37',
      },
      '.Label': {
        color: '#D8BE99',
        fontSize: '11px',
        textTransform: 'uppercase',
      },
    },
  };

  // Render error card if Stripe failed to load
  if (loadError) {
    return (
      <div className="p-6 rounded-2xl bg-[#0B0A08] border border-amber-500/40 text-xs space-y-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-950/60 border border-amber-500/40 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="space-y-1">
            <h4 className="font-cinzel font-bold text-sm text-[#F3E6D0]">
              Stripe Payment Form Unavailable
            </h4>
            <p className="text-[#D8BE99] leading-relaxed">
              The card payment form could not be initialized by Stripe. This typically occurs when the Stripe Publishable Key is invalid or belongs to a different Stripe account than the backend.
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
          {onSwitchToCod && (
            <button
              type="button"
              onClick={onSwitchToCod}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#F2D675] transition-colors cursor-pointer"
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Pay with Cash on Delivery</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowKeyConfig(!showKeyConfig)}
            className="flex items-center gap-1.5 px-3 py-2 border border-[#D4AF37]/30 bg-black/40 text-[#D4AF37] font-cinzel text-xs uppercase tracking-wider rounded-lg hover:border-[#D4AF37] transition-colors cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{showKeyConfig ? 'Hide Key Config' : 'Update Publishable Key'}</span>
          </button>

          <button
            type="button"
            onClick={() => setLoadError(null)}
            className="flex items-center gap-1.5 px-3 py-2 border border-white/20 bg-black/40 text-[#F3E6D0] font-cinzel text-xs uppercase tracking-wider rounded-lg hover:border-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>

        {/* Inline key configurator */}
        {showKeyConfig && (
          <form onSubmit={handleSaveKey} className="p-4 rounded-xl bg-black/80 border border-white/15 space-y-3">
            <label className="block text-[11px] text-[#D8BE99] uppercase font-bold">
              Stripe Publishable Key (pk_test_...):
            </label>
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="pk_test_..."
              className="w-full bg-black border border-white/20 p-2.5 rounded font-mono text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded cursor-pointer"
              >
                Save & Reload Form
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-[#D4AF37]">
          <CreditCard className="w-4 h-4" />
          <span className="font-cinzel font-bold text-xs uppercase tracking-wider">Secure Card Payment</span>
        </div>
        <button
          type="button"
          onClick={() => setShowKeyConfig(!showKeyConfig)}
          className="text-[10px] text-[#D8BE99] hover:text-[#D4AF37] transition-colors flex items-center gap-1 cursor-pointer"
          title="Configure Stripe Publishable Key"
        >
          <Key className="w-3 h-3" />
          <span>Stripe Key</span>
        </button>
      </div>

      {showKeyConfig && (
        <form onSubmit={handleSaveKey} className="p-3 rounded-xl bg-black/80 border border-white/15 space-y-2 text-xs">
          <label className="block text-[10px] text-[#D8BE99] uppercase">
            Stripe Publishable Key:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="pk_test_..."
              className="flex-1 bg-black border border-white/20 px-2.5 py-1.5 rounded font-mono text-[11px] text-[#F3E6D0] focus:border-[#D4AF37]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#D4AF37] text-black font-cinzel font-bold text-[10px] uppercase rounded cursor-pointer"
            >
              Apply
            </button>
          </div>
        </form>
      )}

      <StripeErrorBoundary
        onError={(err) => {
          setLoadError(err);
          if (onError) onError(err);
        }}
        fallback={(err, retry) => (
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs space-y-2">
            <p className="font-bold">Failed to render card form: {err?.message || 'Error loading Stripe'}</p>
            <button
              type="button"
              onClick={retry}
              className="px-3 py-1 bg-red-800 text-white rounded text-xs cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}
      >
        <Elements
          key={activeKey}
          stripe={currentStripePromise}
          options={{ clientSecret, appearance }}
        >
          <CheckoutForm
            returnUrl={returnUrl}
            onConfirmed={onConfirmed}
            onError={onError}
            processing={processing}
            setProcessing={setProcessing}
            onLoadError={(err) => {
              setLoadError(err?.error?.message || 'Stripe card form failed to load.');
              if (onError) onError(err?.error?.message || 'Stripe card form failed to load.');
            }}
          />
        </Elements>
      </StripeErrorBoundary>
    </div>
  );
}
