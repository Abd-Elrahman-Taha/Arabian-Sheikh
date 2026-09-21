import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '../../router/RouterContext';
import { paymentService, clearPaymentSession, clearCheckoutOrder, isTerminalStatus, getCurrentCheckoutOrderId, getStripePromise } from '../../services/paymentService';
import { orderService } from '../../services/orderService';
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

/**
 * PaymentReturn — handles the Stripe 3DS / redirect return flow.
 * 
 * After stripe.confirmPayment() redirects to the bank and back,
 * the customer lands here at /payment/return?orderId=…&paymentId=…
 */
export default function PaymentReturn() {
  const { navigate, queryParams } = useRouter();
  const [status, setStatus] = useState('polling'); // polling | paid | failed | timeout | error
  const [payment, setPayment] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const abortRef = useRef(null);

  // Recover identifiers
  const orderId = queryParams.get('orderId') || getCurrentCheckoutOrderId();
  const paymentIdParam = queryParams.get('paymentId');
  const redirectStatus = queryParams.get('redirect_status');
  const clientSecretParam = queryParams.get('payment_intent_client_secret');

  // Try URL params first, then sessionStorage fallback
  const paymentId = paymentIdParam || (() => {
    try {
      if (orderId) {
        const raw = sessionStorage.getItem(`arabian_sheikh_pay:${orderId}`);
        if (raw) return JSON.parse(raw).paymentId;
      }
    } catch {}
    return null;
  })();

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();
    abortRef.current = controller;

    async function evaluatePayment() {
      // 1. Instant resolution if Stripe redirected with succeeded status
      if (redirectStatus === 'succeeded') {
        setStatus('paid');
        clearPaymentSession(orderId);
        clearCheckoutOrder();
        if (orderId) {
          orderService.recordPlacedOrderId(orderId);
        }

        // Fetch payment details directly from Stripe to show amount
        if (clientSecretParam) {
          try {
            const stripe = await getStripePromise();
            if (stripe) {
              const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecretParam);
              if (paymentIntent && !isCancelled) {
                setPayment({
                  amount: (paymentIntent.amount || 0) / 100,
                  currency: paymentIntent.currency || 'EUR',
                  providerPaymentId: paymentIntent.id,
                  status: 'Paid'
                });
              }
            }
          } catch {}
        }
        return;
      }

      if (redirectStatus === 'failed') {
        setStatus('failed');
        setErrorMessage('Your payment was declined or could not be completed. Please try another card.');
        clearPaymentSession(orderId);
        return;
      }

      if (!paymentId && !orderId && !clientSecretParam) {
        setStatus('error');
        setErrorMessage('Payment reference not found. Please check your order in My Orders.');
        return;
      }

      // 2. Poll until terminal with fast cycle and direct Stripe check
      try {
        const result = await paymentService.pollUntilTerminal(paymentId ? Number(paymentId) : undefined, {
          signal: controller.signal,
          orderId: orderId ? Number(orderId) : undefined,
          clientSecret: clientSecretParam,
          onStatusUpdate: (p) => {
            if (!isCancelled) setPayment(p);
          },
        });

        if (isCancelled) return;
        setPayment(result);

        if (result.status === 'Paid') {
          setStatus('paid');
          clearPaymentSession(orderId);
          clearCheckoutOrder();
          if (orderId) {
            orderService.recordPlacedOrderId(orderId);
          }
        } else if (result.status === 'Failed') {
          setStatus('failed');
          clearPaymentSession(orderId);
        } else if (result.status === 'Cancelled') {
          setStatus('failed');
          setErrorMessage('This order has been cancelled.');
        } else {
          setStatus('timeout');
        }
      } catch (err) {
        if (isCancelled) return;
        if (err.message === 'PAYMENT_POLL_TIMEOUT') {
          setStatus('timeout');
        } else if (err.message === 'PAYMENT_POLL_AUTH_ERROR') {
          setStatus('unverified');
          setErrorMessage('Your payment was submitted to Stripe, but final status could not be verified automatically. If your card was charged, your order has been received.');
        } else if (err.message === 'PAYMENT_NOT_FOUND') {
          setStatus('unverified');
          setErrorMessage('Payment record is taking longer to register. Please check your order in My Orders.');
        } else if (err.message !== 'PAYMENT_POLL_ABORTED') {
          setStatus('error');
          setErrorMessage(err.message || 'An unexpected error occurred.');
        }
      }
    }

    evaluatePayment();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [paymentId, orderId, redirectStatus, clientSecretParam]);

  // Manual re-check for timeout/pending states
  async function handleRecheck() {
    setStatus('polling');
    try {
      let result = null;

      // 1. Direct Stripe retrieval if client secret is present
      if (clientSecretParam) {
        try {
          const stripe = await getStripePromise();
          if (stripe) {
            const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecretParam);
            if (paymentIntent?.status === 'succeeded') {
              result = {
                status: 'Paid',
                amount: (paymentIntent.amount || 0) / 100,
                currency: (paymentIntent.currency || 'EUR').toUpperCase(),
                providerPaymentId: paymentIntent.id
              };
            } else if (paymentIntent?.status === 'requires_payment_method') {
              result = { status: 'Failed' };
            }
          }
        } catch {}
      }

      // 2. Direct backend payment status
      if (!result && paymentId) {
        try {
          result = await paymentService.getPaymentStatus(Number(paymentId));
        } catch (pErr) {
          console.warn('[PaymentReturn] Direct payment recheck error:', pErr?.message);
        }
      }

      // 3. Fallback to order verification
      if (!result && orderId) {
        const order = await orderService.getOrderById(orderId);
        if (order) {
          result = {
            status: order.paymentStatus === 'Paid' ? 'Paid' : order.paymentStatus,
            amount: order.total,
            currency: order.currency
          };
        }
      }

      if (result && isTerminalStatus(result.status)) {
        setPayment(result);
        if (result.status === 'Paid') {
          setStatus('paid');
          clearPaymentSession(orderId);
          clearCheckoutOrder();
          if (orderId) orderService.recordPlacedOrderId(orderId);
        } else {
          setStatus('failed');
        }
      } else {
        setStatus('timeout');
      }
    } catch {
      setStatus('timeout');
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-[#F3E6D0] pt-36 pb-12">
      <div className="max-w-lg mx-auto px-4 space-y-6">

        {/* Polling / Processing */}
        {status === 'polling' && (
          <div className="rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 p-10 text-center space-y-5 shadow-2xl">
            <Loader2 className="w-12 h-12 animate-spin text-[#D4AF37] mx-auto" />
            <h1 className="font-cinzel text-xl font-bold text-[#F3E6D0]">
              Confirming Your Payment
            </h1>
            <p className="text-xs text-[#D8BE99]">
              Verifying with your bank... This usually takes a few seconds.
            </p>
            <div className="w-48 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-[#D4AF37] rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        )}

        {/* Success — Paid */}
        {status === 'paid' && (
          <div className="rounded-2xl bg-[#0B0A08]/90 border border-emerald-500/40 p-10 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 rounded-full border-2 border-emerald-400 bg-emerald-950/60 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(52,211,153,0.35)]">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <div className="space-y-1.5">
              <span className="font-cinzel text-xs uppercase tracking-[0.25em] text-emerald-400 font-bold">
                Royal Order Confirmed
              </span>
              <h1 className="font-cinzel text-2xl font-bold text-[#F3E6D0]">
                Payment Successful
              </h1>
              <p className="text-xs text-[#D8BE99] max-w-sm mx-auto">
                Your payment was verified by Stripe and settled successfully. Your order is confirmed.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/60 border border-emerald-500/25 flex items-center justify-around text-xs font-mono">
              <div>
                <span className="text-neutral-400 block text-[10px]">Order Ref</span>
                <span className="text-[#F2D675] font-bold">#{orderId}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px]">Payment Status</span>
                <span className="text-emerald-400 font-bold">PAID & VERIFIED</span>
              </div>
              {payment?.amount && (
                <div>
                  <span className="text-neutral-400 block text-[10px]">Amount</span>
                  <span className="text-[#F3E6D0] font-bold">{payment.currency?.toUpperCase() || 'EUR'} {Number(payment.amount).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => navigate(`/order-confirmation/${orderId}`)}
                className="px-8 py-3 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-full hover:bg-[#F2D675] transition-colors cursor-pointer shadow-lg"
              >
                View Order Confirmation
              </button>
              <button
                onClick={() => navigate('/account/orders')}
                className="px-8 py-3 border border-[#D4AF37]/40 bg-black/50 text-[#F3E6D0] font-cinzel font-bold text-xs uppercase tracking-wider rounded-full hover:border-[#D4AF37] cursor-pointer"
              >
                My Orders
              </button>
            </div>
          </div>
        )}

        {/* Failed */}
        {status === 'failed' && (
          <div className="rounded-2xl bg-[#0B0A08]/90 border border-rose-500/40 p-10 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 rounded-full border-2 border-rose-400 bg-rose-950/60 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(244,63,94,0.35)]">
              <XCircle className="w-10 h-10 text-rose-400" />
            </div>
            <div className="space-y-1.5">
              <span className="font-cinzel text-xs uppercase tracking-[0.25em] text-rose-400 font-bold">
                Authorization Declined
              </span>
              <h1 className="font-cinzel text-2xl font-bold text-[#F3E6D0]">
                Payment Failed
              </h1>
              <p className="text-xs text-[#D8BE99] max-w-sm mx-auto">
                {errorMessage || 'Your payment was declined by your bank or card issuer. No funds were captured.'}
              </p>
            </div>

            {orderId && (
              <div className="p-3 rounded-xl bg-black/60 border border-rose-500/25 text-xs font-mono">
                <span className="text-neutral-400">Order Reference: </span>
                <span className="text-rose-300 font-bold">#{orderId}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => navigate('/checkout')}
                className="px-8 py-3 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-full hover:bg-[#F2D675] transition-colors cursor-pointer shadow-lg"
              >
                Try Again with Another Card
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="px-8 py-3 border border-white/20 bg-black/50 text-[#F3E6D0] font-cinzel font-bold text-xs uppercase tracking-wider rounded-full hover:border-white cursor-pointer"
              >
                Return to Cart
              </button>
            </div>
          </div>
        )}

        {/* Unverified / Auth Issue but Payment Submitted */}
        {status === 'unverified' && (
          <div className="rounded-2xl bg-[#0B0A08]/90 border border-amber-500/40 p-10 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-full border-2 border-amber-400 bg-amber-950/50 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="font-cinzel text-xl font-bold text-[#F3E6D0]">
              Payment Submitted — Verification Needed
            </h1>
            <p className="text-xs text-[#D8BE99] max-w-md mx-auto leading-relaxed">
              {errorMessage || 'Your payment was submitted to Stripe. We could not verify the final status automatically. If your card was charged, your order has been received.'}
            </p>
            {(orderId || paymentId) && (
              <p className="text-[11px] font-mono text-[#D4AF37]">
                {orderId ? `Order Reference: #${orderId}` : ''} {paymentId ? `(Payment #${paymentId})` : ''}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => navigate('/account/orders')}
                className="px-8 py-3 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-full hover:bg-[#F2D675] transition-colors cursor-pointer"
              >
                View My Orders
              </button>
              <button
                onClick={handleRecheck}
                className="px-8 py-3 border border-[#D4AF37]/40 bg-black/50 text-[#F3E6D0] font-cinzel font-bold text-xs uppercase tracking-wider rounded-full hover:border-[#D4AF37] transition-colors cursor-pointer"
              >
                Check Again
              </button>
            </div>
          </div>
        )}

        {/* Timeout / Still Pending */}
        {status === 'timeout' && (
          <div className="rounded-2xl bg-[#0B0A08]/90 border border-amber-500/30 p-10 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-full border-2 border-amber-400 bg-amber-950/50 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="font-cinzel text-xl font-bold text-[#F3E6D0]">
              Still Confirming
            </h1>
            <p className="text-xs text-[#D8BE99]">
              We're still confirming with your bank. This may take a moment.
            </p>
            {paymentId && (
              <p className="text-[10px] font-mono text-[#D8BE99]">
                Payment Reference: #{paymentId}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleRecheck}
                className="px-8 py-3 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-full hover:bg-[#F2D675] transition-colors cursor-pointer"
              >
                Check Again
              </button>
              <button
                onClick={() => navigate('/account/orders')}
                className="px-8 py-3 border border-[#D4AF37]/40 bg-black/50 text-[#F3E6D0] font-cinzel font-bold text-xs uppercase tracking-wider rounded-full cursor-pointer"
              >
                My Orders
              </button>
            </div>
          </div>
        )}

        {/* Error — can't recover paymentId */}
        {status === 'error' && (
          <div className="rounded-2xl bg-[#0B0A08]/90 border border-red-500/30 p-10 text-center space-y-5 shadow-2xl">
            <XCircle className="w-10 h-10 text-red-400 mx-auto" />
            <h1 className="font-cinzel text-xl font-bold text-[#F3E6D0]">
              Something Went Wrong
            </h1>
            <p className="text-xs text-[#D8BE99]">
              {errorMessage || 'Unable to verify payment status.'}
            </p>
            <button
              onClick={() => navigate('/account/orders')}
              className="px-8 py-3 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-full cursor-pointer"
            >
              View My Orders
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
