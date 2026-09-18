import apiClient from './client';
import ENDPOINTS from './endpoints';
import { normalizeOrder, normalizeReturn, normalizeObjectKeys, normalizeTrackingResponse } from './normalizers';

function toNumericId(id) {
  if (typeof id === 'number' && !isNaN(id) && id > 0) return id;
  if (typeof id === 'string') {
    const cleaned = id.trim();
    if (/^\d+$/.test(cleaned)) {
      const n = Number(cleaned);
      if (!isNaN(n) && n > 0) return n;
    }
  }
  return null;
}

export const orderApi = {
  // ==========================================
  // CUSTOMER STOREFRONT ENDPOINTS
  // ==========================================

  /**
   * Create Order after successful payment / checkout
   * POST /api/Orders
   * @param {object} payload { addressId, shippingMethodId, quoteId, paymentMethod, couponCode }
   * @param {string} idempotencyKey
   */
  async createOrder(payload = {}, idempotencyKey = null) {
    const isUuid = (val) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val.trim());

    const idempKey = (isUuid(idempotencyKey) ? idempotencyKey.trim() : null)
      || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-4000-8000-' + Math.random().toString(16).slice(2, 14).padEnd(12, '0'));

    // addressId MUST be a real backend address ID
    const resolvedAddressId = Number(payload.addressId) || null;
    if (!resolvedAddressId) {
      throw new Error('A valid addressId is required to create an order.');
    }

    // quoteId: Backend contract requires non-empty quote identifier issued by /api/shipping/quotes
    const rawQuote = payload.quoteId || payload.shippingQuoteId;
    const resolvedQuoteId = typeof rawQuote === 'string' && rawQuote.trim().length > 0
      ? rawQuote.trim()
      : (rawQuote ? String(rawQuote).trim() : null);

    if (!resolvedQuoteId) {
      throw new Error('Unable to create the order because the shipping quote is missing. Please recalculate shipping and try again.');
    }

    // shippingMethodId MUST be a valid number from the backend quote
    const resolvedShippingMethodId = payload.shippingMethodId !== undefined && payload.shippingMethodId !== null && !isNaN(Number(payload.shippingMethodId))
      ? Number(payload.shippingMethodId)
      : null;
    if (!resolvedShippingMethodId) {
      throw new Error('A shipping method must be selected.');
    }

    // paymentMethod: 'stripe' or 'cod' (case-insensitive)
    const rawMethod = String(payload.paymentMethod || 'cod').trim().toLowerCase();
    const paymentMethod = ['stripe', 'creditcard', 'card'].includes(rawMethod) ? 'stripe' : 'cod';

    // couponCode: max 50 chars, null or omitted when unused (never empty string "")
    const rawCoupon = payload.couponCode || payload.discountCode;
    const couponCode = rawCoupon && String(rawCoupon).trim() ? String(rawCoupon).trim() : null;

    // Strict compliance with CreateOrderRequest
    const body = {
      addressId: resolvedAddressId,
      shippingMethodId: resolvedShippingMethodId,
      quoteId: resolvedQuoteId,
      paymentMethod,
      couponCode
    };

    if (import.meta.env.DEV) {
      console.log('[Checkout] Submitting order payload:', body);
    }

    const response = await apiClient.post(ENDPOINTS.ORDERS.CREATE, body, {
      headers: {
        'Idempotency-Key': idempKey
      },
      requiresAuth: true
    });

    if (import.meta.env.DEV) {
      console.log('[Checkout] Order successfully created:', response);
    }

    return normalizeOrder(response);
  },

  /**
   * List Customer's own orders
   * GET /api/Orders
   * @param {object} params { Page, PageSize, Status }
   */
  async getMyOrders(params = {}) {
    const query = {};
    if (params.page || params.Page) query.Page = Number(params.page || params.Page);
    if (params.pageSize || params.PageSize) query.PageSize = Number(params.pageSize || params.PageSize);
    const statusVal = params.status || params.Status;
    if (statusVal && String(statusVal).toUpperCase() !== 'ALL') {
      query.Status = String(statusVal).trim();
    }

    const response = await apiClient.get(ENDPOINTS.ORDERS.LIST, { params: query, requiresAuth: true });
    const rawList = response?.items || (Array.isArray(response) ? response : []);
    return {
      items: rawList.map(normalizeOrder),
      page: Number(response?.page || query.Page || 1),
      pageSize: Number(response?.pageSize || query.PageSize || 20),
      totalCount: Number(response?.totalCount !== undefined ? response.totalCount : rawList.length),
      totalPages: Number(response?.totalPages || 1),
      hasPreviousPage: Boolean(response?.hasPreviousPage),
      hasNextPage: Boolean(response?.hasNextPage)
    };
  },

  /**
   * Get single order details
   * GET /api/Orders/{id}
   */
  async getOrderById(id) {
    const numericId = toNumericId(id);
    if (!numericId) return null;
    const response = await apiClient.get(ENDPOINTS.ORDERS.DETAILS(numericId), { requiresAuth: true });
    return normalizeOrder(response);
  },

  /**
   * Get order delivery status
   * GET /api/Orders/{id}/delivery-status
   */
  async getDeliveryStatus(id) {
    const numericId = toNumericId(id);
    if (!numericId) return null;
    const response = await apiClient.get(ENDPOINTS.ORDERS.DELIVERY_STATUS(numericId), { requiresAuth: true });
    return normalizeObjectKeys(response);
  },

  /**
   * Track order shipment
   * GET /api/Orders/{id}/tracking
   */
  async trackOrder(id) {
    const numericId = toNumericId(id);
    if (!numericId) return null;
    const response = await apiClient.get(ENDPOINTS.ORDERS.TRACKING(numericId), { requiresAuth: true });
    return normalizeTrackingResponse(response);
  },

  /**
   * Cancel Order (Only Pending or Processing)
   * POST /api/Orders/{id}/cancel
   */
  async cancelOrder(id, reason = '') {
    const numericId = toNumericId(id);
    if (!numericId) return { status: 'CancelPending' };
    const response = await apiClient.post(
      ENDPOINTS.ORDERS.CANCEL(numericId),
      { reason: reason || 'Customer cancellation request' },
      { requiresAuth: true }
    );
    return normalizeObjectKeys(response);
  },

  /**
   * Check Return Eligibility (Delivered within 14 days)
   * GET /api/orders/{orderId}/return-eligibility
   */
  async checkReturnEligibility(orderId) {
    const response = await apiClient.get(ENDPOINTS.ORDERS.RETURN_ELIGIBILITY(orderId));
    return normalizeObjectKeys(response);
  },

  /**
   * Create Return Request (Photo required if DefectiveProduct)
   * POST /api/orders/{orderId}/returns
   */
  async createReturnRequest(orderId, { orderItemId, reason, reasonNote, photoUrls = [] }) {
    const response = await apiClient.post(ENDPOINTS.ORDERS.CREATE_RETURN(orderId), {
      orderItemId: Number(orderItemId),
      reason,
      reasonNote,
      photoUrls
    });
    return normalizeReturn(response);
  },

  /**
   * Upload Return Evidence Photo
   * POST /api/returns/{id}/photos
   */
  async uploadReturnPhoto(returnId, file) {
    const formData = new FormData();
    formData.append('file', file);
    return await apiClient.upload(ENDPOINTS.RETURNS.UPLOAD_PHOTOS(returnId), formData);
  },

  /**
   * List Order Returns
   * GET /api/orders/{orderId}/returns
   */
  async getOrderReturns(orderId) {
    const response = await apiClient.get(ENDPOINTS.ORDERS.RETURNS(orderId));
    const rawList = response?.items || (Array.isArray(response) ? response : []);
    return rawList.map(normalizeReturn);
  },

  /**
   * List Order Refunds
   * GET /api/orders/{orderId}/refunds
   */
  async getOrderRefunds(orderId) {
    const response = await apiClient.get(ENDPOINTS.ORDERS.REFUNDS(orderId));
    return response?.items || (Array.isArray(response) ? response : []);
  },

  // ==========================================
  // ADMIN BACK-OFFICE ENDPOINTS
  // ==========================================

  /**
   * Admin: List all orders with server pagination, search & status filters
   * GET /api/admin/orders
   * @param {object} params { Page, PageSize, Search, CustomerName, CustomerEmail, OrderStatus, PaymentStatus, From, To, SortBy, SortDirection }
   */
  async adminGetOrders(params = {}) {
    const query = {};
    if (params.page || params.Page) query.Page = Number(params.page || params.Page);
    if (params.pageSize || params.PageSize) query.PageSize = Number(params.pageSize || params.PageSize);
    if (params.search || params.Search) query.Search = String(params.search || params.Search).trim();
    if (params.customerName || params.CustomerName) query.CustomerName = String(params.customerName || params.CustomerName).trim();
    if (params.customerEmail || params.CustomerEmail) query.CustomerEmail = String(params.customerEmail || params.CustomerEmail).trim();
    
    const statusVal = params.orderStatus || params.OrderStatus;
    if (statusVal && String(statusVal).toUpperCase() !== 'ALL') {
      query.OrderStatus = String(statusVal).trim();
    }

    const paymentVal = params.paymentStatus || params.PaymentStatus;
    if (paymentVal && String(paymentVal).toUpperCase() !== 'ALL') {
      query.PaymentStatus = String(paymentVal).trim();
    }

    if (params.from || params.From) query.From = String(params.from || params.From).trim();
    if (params.to || params.To) query.To = String(params.to || params.To).trim();
    if (params.sortBy || params.SortBy) query.SortBy = String(params.sortBy || params.SortBy).trim();
    if (params.sortDirection || params.SortDirection) query.SortDirection = String(params.sortDirection || params.SortDirection).trim();

    const response = await apiClient.get(ENDPOINTS.ADMIN.ORDERS.LIST, { params: query, requiresAuth: true });
    const rawList = response?.items || (Array.isArray(response) ? response : []);
    return {
      items: rawList.map(normalizeOrder).filter(Boolean),
      page: Number(response?.page || 1),
      pageSize: Number(response?.pageSize || 20),
      totalCount: Number(response?.totalCount !== undefined ? response.totalCount : rawList.length),
      totalPages: Number(response?.totalPages || 1),
      hasPreviousPage: Boolean(response?.hasPreviousPage),
      hasNextPage: Boolean(response?.hasNextPage)
    };
  },

  /**
   * Admin: Get comprehensive order details (Purchase cycle, payments, shipping, items, snapshots)
   * GET /api/admin/orders/{id}
   */
  async adminGetOrderDetails(id) {
    const numericId = toNumericId(id);
    if (!numericId) return null;
    const response = await apiClient.get(ENDPOINTS.ADMIN.ORDERS.DETAILS(numericId), { requiresAuth: true });
    return normalizeOrder(response);
  },

  /**
   * Admin: Update order fulfillment status with optional note
   * PATCH /api/admin/orders/{id}/status
   */
  async adminUpdateOrderStatus(id, status, note = '') {
    const numericId = toNumericId(id);
    if (!numericId) return null;
    const response = await apiClient.patch(
      ENDPOINTS.ADMIN.ORDERS.UPDATE_STATUS(numericId),
      { status, note },
      { requiresAuth: true }
    );
    return normalizeObjectKeys(response);
  },

  /**
   * Admin: Cancel order with explicit reason
   * POST /api/admin/orders/{id}/cancel
   */
  async adminCancelOrder(id, reason = '') {
    const numericId = toNumericId(id);
    if (!numericId) return null;
    const response = await apiClient.post(
      ENDPOINTS.ADMIN.ORDERS.CANCEL(numericId),
      { reason },
      { requiresAuth: true }
    );
    return normalizeObjectKeys(response);
  },

  /**
   * Admin: Get order status audit trail
   * GET /api/admin/orders/{id}/status-history
   */
  async adminGetOrderStatusHistory(id) {
    const numericId = toNumericId(id);
    if (!numericId) return [];
    const response = await apiClient.get(ENDPOINTS.ADMIN.ORDERS.STATUS_HISTORY(numericId), { requiresAuth: true });
    const rawList = Array.isArray(response) ? response : (response?.items || []);
    return rawList.map(normalizeObjectKeys);
  },

  /**
   * Admin: Get order tracking and courier milestone events
   * GET /api/admin/orders/{id}/tracking
   */
  async adminGetOrderTracking(id) {
    const numericId = toNumericId(id);
    if (!numericId) return null;
    const response = await apiClient.get(ENDPOINTS.ADMIN.ORDERS.TRACKING(numericId), { requiresAuth: true });
    return normalizeTrackingResponse(response);
  },

  /**
   * Admin: Retry failed order compensation
   * POST /api/admin/orders/{id}/compensation/retry
   */
  async adminRetryCompensation(id) {
    const numericId = toNumericId(id);
    if (!numericId) return null;
    const response = await apiClient.post(ENDPOINTS.ADMIN.ORDERS.COMPENSATION_RETRY(numericId), {}, { requiresAuth: true });
    return normalizeObjectKeys(response);
  },

  /**
   * Admin: List customer return requests
   * GET /api/admin/returns
   */
  async adminGetReturns(params = {}) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.RETURNS.LIST, { params, requiresAuth: true });
    const rawList = response?.items || (Array.isArray(response) ? response : []);
    return rawList.map(normalizeReturn);
  },

  /**
   * Admin: Approve return
   * POST /api/admin/returns/{id}/approve
   */
  async adminApproveReturn(id, note = '') {
    return await apiClient.post(ENDPOINTS.ADMIN.RETURNS.APPROVE(id), { note }, { requiresAuth: true });
  },

  /**
   * Admin: Reject return
   * POST /api/admin/returns/{id}/reject
   */
  async adminRejectReturn(id, reason) {
    return await apiClient.post(ENDPOINTS.ADMIN.RETURNS.REJECT(id), { reason }, { requiresAuth: true });
  }
};

export default orderApi;
