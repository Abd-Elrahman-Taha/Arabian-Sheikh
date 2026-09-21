import { useState, useEffect, Component } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripePromise } from '../../services/paymentService';
import { Lock, ShieldCheck, CreditCard, Loader2, AlertCircle, RefreshCw, Banknote } from 'lucide-react';

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
 * Helper to check if a Stripe response or error indicates the payment has already succeeded
 */
function isAlreadySucceeded(target) {
  if (!target) return false;
  const status = target?.payment_intent?.status || target?.status;
  if (status === 'succeeded') return true;

  const msg = String(target?.message || target?.error?.message || '').toLowerCase();
  const code = String(target?.code || target?.error?.code || '').toLowerCase();

  return (
    msg.includes('already succeeded') ||
    msg.includes('previously confirmed') ||
    (code === 'payment_intent_unexpected_state' && (status === 'succeeded' || !status))
  );
}

/**
 * Inner form component that uses Stripe hooks (must be inside <Elements>)
 */
function CheckoutForm({ clientSecret, returnUrl, onConfirmed, onError, processing, setProcessing, onLoadError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [stripeError, setStripeError] = useState(null);
  const [elementReady, setElementReady] = useState(false);

  // Pre-check on mount: If PaymentIntent is ALREADY succeeded in Stripe, transition immediately
  useEffect(() => {
    if (!stripe || !clientSecret) return;
    let cancelled = false;

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!cancelled && paymentIntent?.status === 'succeeded') {
        console.log('[CheckoutForm] Initial check: PaymentIntent already succeeded:', paymentIntent);
        setProcessing(false);
        setStripeError(null);
        if (onConfirmed) {
          onConfirmed({ status: 'Paid', paymentIntent });
        }
      }
    }).catch(err => {
      console.warn('[CheckoutForm] Initial retrievePaymentIntent notice:', err?.message);
    });

    return () => {
      cancelled = true;
    };
  }, [stripe, clientSecret, onConfirmed, setProcessing]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements || processing) return;

    setProcessing(true);
    setStripeError(null);

    try {
      // 1. Guard check: retrieve intent before confirming to prevent duplicate confirmation error
      if (clientSecret) {
        try {
          const { paymentIntent: existingIntent } = await stripe.retrievePaymentIntent(clientSecret);
          if (existingIntent?.status === 'succeeded') {
            console.log('[CheckoutForm] PaymentIntent already succeeded before confirm call:', existingIntent);
            setProcessing(false);
            setStripeError(null);
            if (onConfirmed) {
              onConfirmed({ status: 'Paid', paymentIntent: existingIntent });
            }
            return;
          }
        } catch (retrieveErr) {
          console.warn('[CheckoutForm] Pre-confirm retrieve notice:', retrieveErr?.message);
        }
      }

      // 2. Submit payment confirmation to Stripe
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: 'if_required',
      });

      const { error, paymentIntent } = result || {};

      // 3. Check if error actually indicates the PaymentIntent already succeeded
      if (isAlreadySucceeded(error)) {
        console.log('[CheckoutForm] Stripe returned already succeeded error - treating as Paid:', error);
        setProcessing(false);
        setStripeError(null);
        if (onConfirmed) {
          onConfirmed({ status: 'Paid', paymentIntent: error?.payment_intent });
        }
        return;
      }

      // If Stripe returned a real failure (card declined, invalid CVC, expired, etc.)
      if (error) {
        const errorMsg = error.message || 'Payment could not be confirmed.';
        setStripeError(errorMsg);
        setProcessing(false);
        if (onError) onError(errorMsg);
        return;
      }

      setProcessing(false);

      // 4. Handle returned paymentIntent
      if (paymentIntent) {
        if (paymentIntent.status === 'succeeded') {
          setStripeError(null);
          if (onConfirmed) {
            onConfirmed({ status: 'Paid', paymentIntent });
          }
          return;
        }

        if (paymentIntent.status === 'processing') {
          if (onConfirmed) {
            onConfirmed({ status: 'Processing', paymentIntent });
          }
          return;
        }

        if (paymentIntent.status === 'requires_payment_method') {
          const errorMsg = 'Payment was declined. Please try another card or payment method.';
          setStripeError(errorMsg);
          if (onError) onError(errorMsg);
          return;
        }
      }

      // Default: proceed with processing status so backend polling verifies
      if (onConfirmed) {
        onConfirmed({ status: 'Processing', paymentIntent });
      }
    } catch (err) {
      console.error('[CheckoutForm] confirmPayment error:', err);

      // Check if exception indicates already succeeded
      if (isAlreadySucceeded(err)) {
        console.log('[CheckoutForm] Caught already succeeded PaymentIntent error in catch block:', err);
        setProcessing(false);
        setStripeError(null);
        if (onConfirmed) {
          onConfirmed({ status: 'Paid', paymentIntent: err?.payment_intent });
        }
        return;
      }

      const msg = err?.message || 'Payment confirmation encountered an error.';
      setStripeError(msg);
      setProcessing(false);
      if (onError) onError(msg);
    }
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

  const currentStripePromise = getStripePromise();

  if (!currentStripePromise) {
    return (
      <div className="p-6 rounded-2xl bg-[#0B0A08] border border-amber-500/30 text-xs space-y-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-950/60 border border-amber-500/40 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="space-y-1">
            <h4 className="font-cinzel font-bold text-sm text-[#F3E6D0]">
              Online Payment Unavailable
            </h4>
            <p className="text-[#D8BE99] leading-relaxed">
              Card payment services are temporarily undergoing maintenance. You may complete your order seamlessly using Cash on Delivery.
            </p>
          </div>
        </div>
        {onSwitchToCod && (
          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onSwitchToCod}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#F2D675] transition-colors cursor-pointer"
            >
              <Banknote className="w-4 h-4" />
              <span>Pay with Cash on Delivery</span>
            </button>
          </div>
        )}
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
              The card payment form could not be initialized at this moment. You can retry or complete your purchase using Cash on Delivery.
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
            onClick={() => setLoadError(null)}
            className="flex items-center gap-1.5 px-3 py-2 border border-white/20 bg-black/40 text-[#F3E6D0] font-cinzel text-xs uppercase tracking-wider rounded-lg hover:border-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
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
        <div className="flex items-center gap-1.5 text-[10px] text-[#D8BE99]">
          <Lock className="w-3 h-3 text-[#D4AF37]" />
          <span>Encrypted 256-bit</span>
        </div>
      </div>

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
          key={clientSecret}
          stripe={currentStripePromise}
          options={{ clientSecret, appearance }}
        >
          <CheckoutForm
            clientSecret={clientSecret}
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
