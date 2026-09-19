import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '../../router/RouterContext';
import { paymentService, clearPaymentSession, clearCheckoutOrder, isTerminalStatus, getCurrentCheckoutOrderId } from '../../services/paymentService';
import { orderService } from '../../services/orderService';
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

/**
 * PaymentReturn — handles the Stripe 3DS / redirect return flow.
 * 
 * After stripe.confirmPayment() redirects to the bank and back,
 * the customer lands here at /payment/return?orderId=…&paymentId=…
 * 
 * This page:
 * 1. Recovers orderId and paymentId from URL params or sessionStorage
 * 2. Ignores redirect_status (per docs — backend is authoritative)
 * 3. Polls GET /api/payments/{id} until terminal
 * 4. Routes to success/failure/pending based on backend status
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
    if (!paymentId) {
      setStatus('error');
      setErrorMessage('Payment reference not found. Please check your order in My Orders.');
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    async function poll() {
      try {
        const result = await paymentService.pollUntilTerminal(Number(paymentId), {
          signal: controller.signal,
          orderId: orderId ? Number(orderId) : undefined,
          onStatusUpdate: (p) => setPayment(p),
        });

        setPayment(result);

        if (result.status === 'Paid') {
          setStatus('paid');
          clearPaymentSession(orderId);
          clearCheckoutOrder();
          // Record the placed order
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
        if (err.message === 'PAYMENT_POLL_TIMEOUT') {
          setStatus('timeout');
        } else if (err.message === 'PAYMENT_POLL_AUTH_ERROR') {
          setStatus('unverified');
          setErrorMessage('Your payment was submitted to Stripe, but final status could not be verified automatically due to session expiration. If your card was charged, your order has been received.');
        } else if (err.message === 'PAYMENT_NOT_FOUND') {
          setStatus('unverified');
          setErrorMessage('Payment record is taking longer to register. Please check your order in My Orders.');
        } else if (err.message !== 'PAYMENT_POLL_ABORTED') {
          setStatus('error');
          setErrorMessage(err.message || 'An unexpected error occurred.');
        }
      }
    }

    poll();
    return () => controller.abort();
  }, [paymentId, orderId]);

  // Manual re-check for timeout/pending states
  async function handleRecheck() {
    setStatus('polling');
    try {
      let result = null;
      if (paymentId) {
        try {
          result = await paymentService.getPaymentStatus(Number(paymentId));
        } catch (pErr) {
          console.warn('[PaymentReturn] Direct payment recheck error:', pErr?.message);
        }
      }
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
          <div className="rounded-2xl bg-[#0B0A08]/90 border border-emerald-500/30 p-10 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-full border-2 border-emerald-400 bg-emerald-950/50 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="font-cinzel text-xl font-bold text-[#F3E6D0]">
              Payment Successful
            </h1>
            <p className="text-xs text-[#D8BE99]">
              Your order has been confirmed. Thank you for your purchase.
            </p>
            {payment?.amount && (
              <div className="text-sm font-mono text-[#D4AF37] font-bold">
                {payment.currency?.toUpperCase()} {Number(payment.amount).toFixed(2)}
              </div>
            )}
            <button
              onClick={() => navigate(`/order-confirmation/${orderId}`)}
              className="px-8 py-3 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-full hover:bg-[#F2D675] transition-colors cursor-pointer"
            >
              View Order Confirmation
            </button>
          </div>
        )}

        {/* Failed */}
        {status === 'failed' && (
          <div className="rounded-2xl bg-[#0B0A08]/90 border border-red-500/30 p-10 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-full border-2 border-red-400 bg-red-950/50 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="font-cinzel text-xl font-bold text-[#F3E6D0]">
              Payment Failed
            </h1>
            <p className="text-xs text-[#D8BE99]">
              {errorMessage || 'Your payment could not be processed. Please try again with another card.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/checkout')}
                className="px-8 py-3 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-full hover:bg-[#F2D675] transition-colors cursor-pointer"
              >
                Try Again
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
