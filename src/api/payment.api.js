import apiClient from './client';
import ENDPOINTS from './endpoints';

/**
 * Arabian Sheikh - Payment API Client
 * 
 * Stripe payment integration endpoints:
 * - POST /api/payments/stripe/payment-intent — create/replay a Stripe payment intent
 * - GET  /api/payments/{paymentId}           — read payment status (polling)
 * 
 * Admin payment endpoints:
 * - GET  /api/admin/payments                          — list payments
 * - GET  /api/admin/payments/{id}                     — payment details
 * - GET  /api/admin/payments/{id}/audit               — audit trail
 * - GET  /api/admin/payments/{id}/attempts            — paged attempts
 * - GET  /api/admin/payment-webhooks                  — webhook ledger
 * - POST /api/admin/payments/{id}/manual-review       — flag for manual review
 */
export const paymentApi = {
  // ==========================================
  // CUSTOMER PAYMENT ENDPOINTS
  // ==========================================

  /**
   * Create or replay a Stripe payment intent
   * POST /api/payments/stripe/payment-intent
   * 
   * @param {object} payload { orderId: number }
   * @param {string} idempotencyKey - Unique key per payment operation (letters, digits, -, _, .; max 255 chars)
   * @returns {{ paymentId, provider, providerPaymentId, clientSecret, amount, currency, status }}
   */
  async createPaymentIntent(payload, idempotencyKey) {
    const response = await apiClient.post(
      ENDPOINTS.PAYMENTS.STRIPE_PAYMENT_INTENT,
      { orderId: Number(payload.orderId) },
      {
        headers: { 'Idempotency-Key': idempotencyKey },
        requiresAuth: true
      }
    );
    return response;
  },

  /**
   * Get payment status (polling endpoint)
   * GET /api/payments/{paymentId}
   * 
   * @param {number} paymentId
   * @returns {{ id, orderId, provider, providerPaymentId, amount, currency, status, paidAt }}
   */
  async getPaymentStatus(paymentId) {
    const response = await apiClient.get(
      ENDPOINTS.PAYMENTS.DETAILS(paymentId),
      { requiresAuth: true }
    );
    return response;
  },

  // ==========================================
  // ADMIN PAYMENT ENDPOINTS
  // ==========================================

  /**
   * Admin: List payments with filters
   * GET /api/admin/payments
   */
  async adminListPayments(filters = {}) {
    const params = {};
    if (filters.paymentId) params.PaymentId = Number(filters.paymentId);
    if (filters.orderId) params.OrderId = Number(filters.orderId);
    if (filters.provider) params.Provider = String(filters.provider);
    if (filters.status) params.Status = String(filters.status);
    if (filters.manualReviewRequired !== undefined) params.ManualReviewRequired = Boolean(filters.manualReviewRequired);
    if (filters.from) params.From = String(filters.from);
    if (filters.to) params.To = String(filters.to);
    if (filters.page) params.Page = Number(filters.page);
    if (filters.pageSize) params.PageSize = Number(filters.pageSize);

    return await apiClient.get(ENDPOINTS.ADMIN.PAYMENTS.LIST, { params, requiresAuth: true });
  },

  /**
   * Admin: Get payment details
   * GET /api/admin/payments/{id}
   */
  async adminGetPaymentDetails(paymentId) {
    return await apiClient.get(ENDPOINTS.ADMIN.PAYMENTS.DETAILS(paymentId), { requiresAuth: true });
  },

  /**
   * Admin: Get payment audit trail
   * GET /api/admin/payments/{id}/audit
   */
  async adminGetPaymentAudit(paymentId) {
    return await apiClient.get(ENDPOINTS.ADMIN.PAYMENTS.AUDIT(paymentId), { requiresAuth: true });
  },

  /**
   * Admin: Get paged payment attempts
   * GET /api/admin/payments/{id}/attempts
   */
  async adminGetPaymentAttempts(paymentId, params = {}) {
    const query = {};
    if (params.page) query.Page = Number(params.page);
    if (params.pageSize) query.PageSize = Number(params.pageSize);
    return await apiClient.get(ENDPOINTS.ADMIN.PAYMENTS.ATTEMPTS(paymentId), { params: query, requiresAuth: true });
  },

  /**
   * Admin: Get webhook ledger
   * GET /api/admin/payment-webhooks
   */
  async adminGetWebhooks(filters = {}) {
    const params = {};
    if (filters.provider) params.Provider = String(filters.provider);
    if (filters.eventType) params.EventType = String(filters.eventType);
    if (filters.status) params.Status = String(filters.status);
    if (filters.from) params.From = String(filters.from);
    if (filters.to) params.To = String(filters.to);
    if (filters.page) params.Page = Number(filters.page);
    if (filters.pageSize) params.PageSize = Number(filters.pageSize);

    return await apiClient.get(ENDPOINTS.ADMIN.PAYMENTS.WEBHOOKS, { params, requiresAuth: true });
  },

  /**
   * Admin: Flag payment for manual review
   * POST /api/admin/payments/{id}/manual-review
   * Sends no body. Returns 204 No Content.
   */
  async adminFlagManualReview(paymentId) {
    return await apiClient.post(ENDPOINTS.ADMIN.PAYMENTS.MANUAL_REVIEW(paymentId), null, { requiresAuth: true });
  }
};

export default paymentApi;
