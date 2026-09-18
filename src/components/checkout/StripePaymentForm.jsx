import React, { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../services/paymentService';
import { Lock, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';

/**
 * Inner form component that uses Stripe hooks (must be inside <Elements>)
 */
function CheckoutForm({ returnUrl, onConfirmed, onError, processing, setProcessing }) {
  const stripe = useStripe();
  const elements = useElements();
  const [stripeError, setStripeError] = useState(null);

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
      setStripeError(error.message || 'Payment could not be confirmed.');
      setProcessing(false);
      if (onError) onError(error.message);
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
      <div className="bg-white/[0.03] border border-[#D4AF37]/20 rounded-xl p-4">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Stripe inline error */}
      {stripeError && (
        <div role="alert" className="p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
          <span className="shrink-0 mt-0.5">⚠</span>
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
        disabled={!stripe || processing}
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
 */
export default function StripePaymentForm({ clientSecret, orderId, paymentId, onConfirmed, onError }) {
  const [processing, setProcessing] = useState(false);

  if (!stripePromise) {
    return (
      <div className="p-6 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs text-center">
        <p className="font-bold mb-1">Stripe Configuration Error</p>
        <p>Missing VITE_STRIPE_PUBLISHABLE_KEY in environment configuration.</p>
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[#D4AF37] pb-3 border-b border-white/10">
        <CreditCard className="w-4 h-4" />
        <span className="font-cinzel font-bold text-xs uppercase tracking-wider">Secure Card Payment</span>
      </div>

      <Elements
        stripe={stripePromise}
        options={{ clientSecret, appearance }}
      >
        <CheckoutForm
          returnUrl={returnUrl}
          onConfirmed={onConfirmed}
          onError={onError}
          processing={processing}
          setProcessing={setProcessing}
        />
      </Elements>
    </div>
  );
}
