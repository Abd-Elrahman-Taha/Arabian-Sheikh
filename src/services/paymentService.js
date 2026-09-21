import { loadStripe } from '@stripe/stripe-js';
import { paymentApi } from '../api/payment.api';
import { orderApi } from '../api/order.api';

/**
 * Arabian Sheikh - Payment Service
 * 
 * Real Stripe integration with:
 * - Payment intent creation via backend API
 * - Payment status polling (fast 2.5s x 60s, slow 10s x 6min)
 * - Idempotency key management
 * - Stripe.js singleton loader
 */

// ─── Stripe.js Dynamic Singleton ───────────────────────────────
// Caches loadStripe promises per publishable key, allowing runtime updates
const stripePromiseCache = new Map();

export function getStripePublishableKey() {
  const envKey = (import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY || '').trim();
  if (envKey) return envKey;
  try {
    const saved = localStorage.getItem('arabian_sheikh_stripe_pub_key');
    if (saved && saved.trim()) return saved.trim();
  } catch {}
  return '';
}

export function setCustomStripePublishableKey() {
  // Deprecated: Stripe key is configured strictly via Vercel environment variables or code
}

export function getStripePromise(customKey) {
  const key = (customKey || getStripePublishableKey()).trim();
  if (!key) return null;
  if (!stripePromiseCache.has(key)) {
    stripePromiseCache.set(key, loadStripe(key));
  }
  return stripePromiseCache.get(key);
}

export const stripePromise = getStripePromise();

// ─── Idempotency Key Helpers ───────────────────────────────────

/** Generate a fresh UUID for order creation idempotency */
export function newOrderKey() {
  return crypto.randomUUID();
}

/** Generate a fresh UUID for payment intent idempotency */
export function newPaymentKey() {
  return crypto.randomUUID();
}

/** Store checkout order context so refresh/remount can recover */
export function setCurrentCheckoutOrderId(orderId) {
  sessionStorage.setItem('arabian_sheikh_current_order', String(orderId));
}

export function getCurrentCheckoutOrderId() {
  const raw = sessionStorage.getItem('arabian_sheikh_current_order');
  const id = raw !== null ? Number(raw) : NaN;
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function clearCheckoutOrder() {
  sessionStorage.removeItem('arabian_sheikh_current_order');
}

/** Store payment idempotency key per order */
export function getPaymentKey(orderId) {
  return sessionStorage.getItem(`arabian_sheikh_paykey:${orderId}`) || null;
}

export function setPaymentKey(orderId, key) {
  sessionStorage.setItem(`arabian_sheikh_paykey:${orderId}`, key);
}

/** Store paymentId for recovery after 3DS redirects */
export function setPaymentId(orderId, paymentId) {
  sessionStorage.setItem(`arabian_sheikh_pay:${orderId}`, JSON.stringify({ paymentId }));
}

export function getPaymentId(orderId) {
  try {
    const raw = sessionStorage.getItem(`arabian_sheikh_pay:${orderId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.paymentId || null;
    }
  } catch {}
  return null;
}

/** Clear all payment session data for an order once payment is final */
export function clearPaymentSession(orderId) {
  sessionStorage.removeItem(`arabian_sheikh_paykey:${orderId}`);
  sessionStorage.removeItem(`arabian_sheikh_pay:${orderId}`);
}

// ─── Terminal Status Check ─────────────────────────────────────

// ─── Terminal Status Check ─────────────────────────────────────

const TERMINAL_STATUSES = ['paid', 'succeeded', 'failed', 'cancelled', 'canceled', 'refunded'];

export function isTerminalStatus(status) {
  if (!status) return false;
  return TERMINAL_STATUSES.includes(String(status).toLowerCase());
}

export function isSuccessStatus(status) {
  if (!status) return false;
  const s = String(status).toLowerCase();
  return s === 'paid' || s === 'succeeded';
}

export function isFailedStatus(status) {
  if (!status) return false;
  const s = String(status).toLowerCase();
  return s === 'failed' || s === 'cancelled' || s === 'canceled';
}

// ─── Payment Service ───────────────────────────────────────────

export const paymentService = {
  /**
   * Create or replay a Stripe payment intent
   * @param {number} orderId
   * @param {string} idempotencyKey
   * @returns {Promise<{paymentId, provider, providerPaymentId, clientSecret, amount, currency, status}>}
   */
  async createPaymentIntent(orderId, idempotencyKey) {
    return await paymentApi.createPaymentIntent({ orderId }, idempotencyKey);
  },

  /**
   * Get current payment status
   * @param {number} paymentId
   * @returns {Promise<{id, orderId, provider, providerPaymentId, amount, currency, status, paidAt}>}
   */
  async getPaymentStatus(paymentId) {
    return await paymentApi.getPaymentStatus(paymentId);
  },

  /**
   * Poll payment status until it reaches a terminal state.
   * 
   * Strategy:
   * - Fast phase: every 1.5s for immediate responsiveness
   * - Parallel Stripe.js check when clientSecret is provided
   * - Fallback to customer order verification
   * - Terminal states: Paid / Succeeded, Failed, Cancelled, Refunded
   * 
   * @param {number} paymentId
   * @param {object} [options]
   * @param {AbortSignal} [options.signal] - Optional abort signal to cancel polling
   * @param {function} [options.onStatusUpdate] - Called with each poll result
   * @param {number} [options.orderId] - Optional customer order ID for fallback verification
   * @param {string} [options.clientSecret] - Stripe client secret for direct verification
   * @returns {Promise<{id, orderId, provider, providerPaymentId, amount, currency, status, paidAt}>}
   */
  async pollUntilTerminal(paymentId, options = {}) {
    const { signal, onStatusUpdate, orderId, clientSecret } = options;
    const started = Date.now();
    const FAST_PHASE_MS = 30_000;
    const TOTAL_BUDGET_MS = 120_000; // 2 minutes max

    const sleep = (ms) => new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new Error('PAYMENT_POLL_ABORTED'));
        return;
      }
      const timer = setTimeout(resolve, ms);
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new Error('PAYMENT_POLL_ABORTED'));
        }, { once: true });
      }
    });

    let stripeInstance = null;
    if (clientSecret) {
      try {
        stripeInstance = await getStripePromise();
      } catch {}
    }

    for (;;) {
      if (signal?.aborted) {
        throw new Error('PAYMENT_POLL_ABORTED');
      }

      try {
        // 1. Direct Stripe.js verification (Instant check)
        if (stripeInstance && clientSecret) {
          try {
            const { paymentIntent } = await stripeInstance.retrievePaymentIntent(clientSecret);
            if (paymentIntent) {
              const piStatus = paymentIntent.status;
              if (piStatus === 'succeeded') {
                const result = {
                  id: paymentId,
                  orderId: orderId || null,
                  provider: 'stripe',
                  providerPaymentId: paymentIntent.id,
                  amount: (paymentIntent.amount || 0) / 100,
                  currency: (paymentIntent.currency || 'EUR').toUpperCase(),
                  status: 'Paid',
                  paidAt: new Date().toISOString()
                };
                if (onStatusUpdate) onStatusUpdate(result);
                return result;
              }
              if (piStatus === 'requires_payment_method' || piStatus === 'canceled') {
                const result = {
                  id: paymentId,
                  orderId: orderId || null,
                  provider: 'stripe',
                  providerPaymentId: paymentIntent.id,
                  amount: (paymentIntent.amount || 0) / 100,
                  currency: (paymentIntent.currency || 'EUR').toUpperCase(),
                  status: 'Failed',
                  paidAt: null
                };
                if (onStatusUpdate) onStatusUpdate(result);
                return result;
              }
            }
          } catch (stripeErr) {
            console.warn('[paymentService] Direct Stripe verification notice:', stripeErr?.message);
          }
        }

        // 2. Query Backend Payment Status
        let payment = null;
        let isAuthError = false;

        if (paymentId) {
          try {
            payment = await this.getPaymentStatus(paymentId);
          } catch (err) {
            const status = err?.status;
            const code = err?.code;
            const msg = err?.message || '';

            if (status === 401 || status === 403 || code === 'UNAUTHORIZED' || msg.includes('Admin authentication is required')) {
              isAuthError = true;
              console.warn('[paymentService] Auth notice on payment endpoint:', msg);
            } else if (status === 404 || code === 'PAYMENT_NOT_FOUND') {
              console.warn('[paymentService] Payment ID not found on backend:', paymentId);
            } else {
              console.warn('[paymentService] Transient payment poll error (will retry):', msg);
            }
          }
        }

        // Check if backend payment returned a terminal state
        if (payment) {
          const rawStatus = payment.status || '';
          const normalizedStatus = isSuccessStatus(rawStatus)
            ? 'Paid'
            : isFailedStatus(rawStatus)
              ? 'Failed'
              : rawStatus;

          const normalizedPayment = {
            ...payment,
            status: normalizedStatus
          };

          if (onStatusUpdate) {
            onStatusUpdate(normalizedPayment);
          }

          if (isTerminalStatus(normalizedPayment.status)) {
            return normalizedPayment;
          }
        }

        // 3. Fallback: Check customer order state
        if (orderId && (!payment || isAuthError || !isTerminalStatus(payment?.status))) {
          try {
            const order = await orderApi.getOrderById(orderId);
            if (order) {
              const payStatus = order.paymentStatus;
              const ordStatus = order.orderStatus || order.status;

              const isPaid = isSuccessStatus(payStatus) || ['Processing', 'Confirmed', 'Shipped', 'Delivered'].includes(ordStatus);
              const isFailed = isFailedStatus(payStatus) || ordStatus === 'Cancelled';

              const synthesizedPayment = {
                id: paymentId || order.payments?.[0]?.id || orderId,
                orderId: order.id || orderId,
                provider: 'stripe',
                providerPaymentId: order.payments?.[0]?.providerPaymentId || null,
                amount: order.total,
                currency: order.currency || 'EUR',
                status: isPaid ? 'Paid' : (isFailed ? 'Failed' : (payStatus || 'Pending')),
                paidAt: isPaid ? (order.paidAt || new Date().toISOString()) : null
              };

              if (onStatusUpdate) {
                onStatusUpdate(synthesizedPayment);
              }

              if (isTerminalStatus(synthesizedPayment.status)) {
                return synthesizedPayment;
              }
            }
          } catch (orderErr) {
            console.warn('[paymentService] Order fallback check notice:', orderErr?.message);
          }
        }

      } catch (err) {
        if (err.message === 'PAYMENT_POLL_ABORTED') {
          throw err;
        }
        console.warn('[paymentService] Payment poll cycle notice (will retry):', err.message);
      }

      const elapsed = Date.now() - started;
      if (elapsed > TOTAL_BUDGET_MS) {
        throw new Error('PAYMENT_POLL_TIMEOUT');
      }

      await sleep(elapsed < FAST_PHASE_MS ? 1_500 : 3_000);
    }
  }
};

export default paymentService;
