import apiClient from './client';
import ENDPOINTS from './endpoints';
import { normalizeOrder, normalizeReturn, normalizeObjectKeys } from './normalizers';

export const orderApi = {
  // ==========================================
  // CUSTOMER STOREFRONT ENDPOINTS
  // ==========================================

  /**
   * Create Order after successful payment / checkout
   * POST /api/orders
   */
  async createOrder({ addressId, currency = 'EUR' }) {
    const response = await apiClient.post(ENDPOINTS.ORDERS.CREATE, {
      addressId: Number(addressId),
      currency
    });
    return normalizeOrder(response);
  },

  /**
   * List Customer's own orders
   * GET /api/orders
   */
  async getMyOrders(params = {}) {
    const response = await apiClient.get(ENDPOINTS.ORDERS.LIST, { params });
    const rawList = response?.items || (Array.isArray(response) ? response : []);
    return {
      items: rawList.map(normalizeOrder),
      page: response?.page || 1,
      pageSize: response?.pageSize || 20,
      totalCount: response?.totalCount || rawList.length,
      totalPages: response?.totalPages || 1
    };
  },

  /**
   * Get single order details
   * GET /api/orders/{id}
   */
  async getOrderById(id) {
    const response = await apiClient.get(ENDPOINTS.ORDERS.DETAILS(id));
    return normalizeOrder(response);
  },

  /**
   * Track order shipment
   * GET /api/orders/{id}/tracking
   */
  async trackOrder(id) {
    const response = await apiClient.get(ENDPOINTS.ORDERS.TRACKING(id));
    return normalizeObjectKeys(response);
  },

  /**
   * Cancel Order (Only Pending or Processing)
   * POST /api/orders/{id}/cancel
   */
  async cancelOrder(id, reason = '') {
    const response = await apiClient.post(ENDPOINTS.ORDERS.CANCEL(id), { reason });
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
    const response = await apiClient.get(ENDPOINTS.ADMIN.ORDERS.DETAILS(id), { requiresAuth: true });
    return normalizeOrder(response);
  },

  /**
   * Admin: Update order fulfillment status with optional note
   * PATCH /api/admin/orders/{id}/status
   */
  async adminUpdateOrderStatus(id, status, note = '') {
    const response = await apiClient.patch(
      ENDPOINTS.ADMIN.ORDERS.UPDATE_STATUS(id),
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
    const response = await apiClient.post(
      ENDPOINTS.ADMIN.ORDERS.CANCEL(id),
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
    const response = await apiClient.get(ENDPOINTS.ADMIN.ORDERS.STATUS_HISTORY(id), { requiresAuth: true });
    const rawList = Array.isArray(response) ? response : (response?.items || []);
    return rawList.map(normalizeObjectKeys);
  },

  /**
   * Admin: Get order tracking and courier milestone events
   * GET /api/admin/orders/{id}/tracking
   */
  async adminGetOrderTracking(id) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.ORDERS.TRACKING(id), { requiresAuth: true });
    return normalizeObjectKeys(response);
  },

  /**
   * Admin: Retry failed order compensation
   * POST /api/admin/orders/{id}/compensation/retry
   */
  async adminRetryCompensation(id) {
    const response = await apiClient.post(ENDPOINTS.ADMIN.ORDERS.COMPENSATION_RETRY(id), {}, { requiresAuth: true });
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
