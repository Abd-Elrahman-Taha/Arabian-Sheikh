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

// ─── In-Memory Session Stores (Zero localStorage / sessionStorage persistence) ───
const inMemoryPaymentKeys = new Map();
const inMemoryPaymentIds = new Map();
let inMemoryCurrentOrderId = null;

/** Store checkout order context so refresh/remount can recover */
export function setCurrentCheckoutOrderId(orderId) {
  inMemoryCurrentOrderId = orderId ? Number(orderId) : null;
}

export function getCurrentCheckoutOrderId() {
  return inMemoryCurrentOrderId;
}

export function clearCheckoutOrder() {
  inMemoryCurrentOrderId = null;
}

/** Store payment idempotency key per order */
export function getPaymentKey(orderId) {
  if (!orderId) return null;
  return inMemoryPaymentKeys.get(String(orderId)) || null;
}

export function setPaymentKey(orderId, key) {
  if (orderId && key) {
    inMemoryPaymentKeys.set(String(orderId), key);
  }
}

/** Store paymentId in memory for recovery */
export function setPaymentId(orderId, paymentId) {
  if (orderId && paymentId) {
    inMemoryPaymentIds.set(String(orderId), Number(paymentId));
  }
}

export function getPaymentId(orderId) {
  if (!orderId) return null;
  return inMemoryPaymentIds.get(String(orderId)) || null;
}

/** Clear all payment session data for an order once payment is final */
export function clearPaymentSession(orderId) {
  if (orderId) {
    inMemoryPaymentKeys.delete(String(orderId));
    inMemoryPaymentIds.delete(String(orderId));
  }
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
  /**
   * Poll payment status strictly from backend API until it reaches a terminal state.
   * 
   * Strategy:
   * - Polls GET /api/payments/{paymentId} every 2s
   * - Fallback: Polls GET /api/Orders/{orderId}
   * - The backend is the ONLY authority for payment status
   * - Terminal states: Paid / Succeeded, Failed, Cancelled, Refunded
   * 
   * @param {number} paymentId
   * @param {object} [options]
   * @param {AbortSignal} [options.signal] - Optional abort signal to cancel polling
   * @param {function} [options.onStatusUpdate] - Called with each poll result
   * @param {number} [options.orderId] - Optional customer order ID for fallback verification
   * @returns {Promise<{id, orderId, provider, providerPaymentId, amount, currency, status, paidAt}>}
   */
  async pollUntilTerminal(paymentId, options = {}) {
    const { signal, onStatusUpdate, orderId } = options;
    const started = Date.now();
    const TOTAL_BUDGET_MS = 90_000; // 90 seconds max

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

    for (;;) {
      if (signal?.aborted) {
        throw new Error('PAYMENT_POLL_ABORTED');
      }

      try {
        // 1. Query Backend Payment Status: GET /api/payments/{paymentId}
        let payment = null;
        let isAuthError = false;

        if (paymentId) {
          try {
            payment = await this.getPaymentStatus(Number(paymentId));
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

        // 2. Fallback: Check backend customer order state: GET /api/Orders/{id}
        if (orderId && (!payment || isAuthError || !isTerminalStatus(payment?.status))) {
          try {
            const order = await orderApi.getOrderById(orderId);
            if (order) {
              const payStatus = order.paymentStatus;
              const ordStatus = order.orderStatus || order.status;

              const isPaid = isSuccessStatus(payStatus) || ['Processing', 'Confirmed', 'Shipped', 'Delivered'].includes(ordStatus);
              const isFailed = isFailedStatus(payStatus) || ordStatus === 'Cancelled';

              if (isPaid || isFailed) {
                const synthesizedPayment = {
                  id: paymentId || order.payments?.[0]?.id || orderId,
                  orderId: order.id || orderId,
                  provider: 'stripe',
                  providerPaymentId: order.payments?.[0]?.providerPaymentId || null,
                  amount: order.total,
                  currency: order.currency || 'EUR',
                  status: isPaid ? 'Paid' : 'Failed',
                  paidAt: isPaid ? (order.paidAt || new Date().toISOString()) : null
                };

                if (onStatusUpdate) {
                  onStatusUpdate(synthesizedPayment);
                }

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

      await sleep(2000);
    }
  }
};

export function getPayment(paymentId) {
  return paymentApi.getPaymentStatus(paymentId);
}

export default paymentService;
