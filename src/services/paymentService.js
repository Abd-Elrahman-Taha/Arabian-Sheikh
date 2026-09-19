import { loadStripe } from '@stripe/stripe-js';
import { paymentApi } from '../api/payment.api';

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
  try {
    const saved = localStorage.getItem('arabian_sheikh_stripe_pub_key');
    if (saved && saved.trim()) return saved.trim();
  } catch {}
  return (import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY || '').trim();
}

export function setCustomStripePublishableKey(key) {
  try {
    if (key && key.trim()) {
      localStorage.setItem('arabian_sheikh_stripe_pub_key', key.trim());
    } else {
      localStorage.removeItem('arabian_sheikh_stripe_pub_key');
    }
  } catch {}
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

const TERMINAL_STATUSES = ['Paid', 'Failed', 'Cancelled', 'Refunded'];

export function isTerminalStatus(status) {
  return TERMINAL_STATUSES.includes(status);
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
   * Strategy per §12:
   * - Fast phase: every 2.5s for the first 60s
   * - Slow phase: every 10s for up to ~6 more minutes
   * - Terminal states: Paid, Failed, Cancelled, Refunded
   * 
   * @param {number} paymentId
   * @param {object} [options]
   * @param {AbortSignal} [options.signal] - Optional abort signal to cancel polling
   * @param {function} [options.onStatusUpdate] - Called with each poll result
   * @returns {Promise<{id, orderId, provider, providerPaymentId, amount, currency, status, paidAt}>}
   * @throws {Error} with message 'PAYMENT_POLL_TIMEOUT' if budget exceeded
   * @throws {Error} with message 'PAYMENT_POLL_ABORTED' if signal aborted
   */
  async pollUntilTerminal(paymentId, options = {}) {
    const { signal, onStatusUpdate } = options;
    const started = Date.now();
    const FAST_PHASE_MS = 60_000;
    const TOTAL_BUDGET_MS = FAST_PHASE_MS + 360_000; // 7 minutes total

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
        const payment = await this.getPaymentStatus(paymentId);
        
        if (onStatusUpdate) {
          onStatusUpdate(payment);
        }

        if (isTerminalStatus(payment.status)) {
          return payment;
        }
      } catch (err) {
        // On network errors during polling, keep trying (don't break the loop)
        console.warn('Payment poll error (will retry):', err.message);
      }

      const elapsed = Date.now() - started;
      if (elapsed > TOTAL_BUDGET_MS) {
        throw new Error('PAYMENT_POLL_TIMEOUT');
      }

      await sleep(elapsed < FAST_PHASE_MS ? 2_500 : 10_000);
    }
  }
};

export default paymentService;
