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
   * Admin: List all orders
   * GET /api/admin/orders
   */
  async adminGetOrders(params = {}) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.ORDERS.LIST, { params });
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
   * Admin: Get order details
   * GET /api/admin/orders/{id}
   */
  async adminGetOrderDetails(id) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.ORDERS.DETAILS(id));
    return normalizeOrder(response);
  },

  /**
   * Admin: Update order status
   * PATCH /api/admin/orders/{id}/status
   */
  async adminUpdateOrderStatus(id, status, note = '') {
    const response = await apiClient.patch(ENDPOINTS.ADMIN.ORDERS.UPDATE_STATUS(id), {
      status,
      note
    });
    return normalizeObjectKeys(response);
  },

  /**
   * Admin: Cancel order
   * POST /api/admin/orders/{id}/cancel
   */
  async adminCancelOrder(id, reason = '') {
    const response = await apiClient.post(ENDPOINTS.ADMIN.ORDERS.CANCEL(id), { reason });
    return normalizeObjectKeys(response);
  },

  /**
   * Admin: Get order status history
   * GET /api/admin/orders/{id}/status-history
   */
  async adminGetOrderStatusHistory(id) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.ORDERS.STATUS_HISTORY(id));
    return response?.items || (Array.isArray(response) ? response : []);
  },

  /**
   * Admin: List customer return requests
   * GET /api/admin/returns
   */
  async adminGetReturns(params = {}) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.RETURNS.LIST, { params });
    const rawList = response?.items || (Array.isArray(response) ? response : []);
    return rawList.map(normalizeReturn);
  },

  /**
   * Admin: Approve return
   * POST /api/admin/returns/{id}/approve
   */
  async adminApproveReturn(id, note = '') {
    return await apiClient.post(ENDPOINTS.ADMIN.RETURNS.APPROVE(id), { note });
  },

  /**
   * Admin: Reject return
   * POST /api/admin/returns/{id}/reject
   */
  async adminRejectReturn(id, reason) {
    return await apiClient.post(ENDPOINTS.ADMIN.RETURNS.REJECT(id), { reason });
  }
};

export default orderApi;
