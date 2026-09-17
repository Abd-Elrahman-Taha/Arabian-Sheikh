import apiClient from './client';
import ENDPOINTS from './endpoints';
import { normalizeReview } from './normalizers';

export const reviewApi = {
  /**
   * Get Product Reviews (Public, Approved-only)
   * GET /api/products/{productId}/reviews
   */
  async getProductReviews(productId, params = {}) {
    const query = {};
    if (params.page || params.Page) query.page = Number(params.page || params.Page);
    if (params.pageSize || params.PageSize) query.pageSize = Math.min(100, Math.max(1, Number(params.pageSize || params.PageSize)));
    if (params.rating || params.Rating) query.rating = Number(params.rating || params.Rating);

    const response = await apiClient.get(ENDPOINTS.PRODUCTS.REVIEWS(productId), {
      params: query,
      requiresAuth: false
    });

    const rawList = response?.items || (Array.isArray(response) ? response : []);
    return {
      items: rawList.map(normalizeReview).filter(Boolean),
      page: Number(response?.page || 1),
      pageSize: Number(response?.pageSize || (rawList.length || 20)),
      totalCount: Number(response?.totalCount !== undefined ? response.totalCount : rawList.length),
      totalPages: Number(response?.totalPages || 1),
      hasPreviousPage: Boolean(response?.hasPreviousPage),
      hasNextPage: Boolean(response?.hasNextPage)
    };
  },

  /**
   * Create Customer Review (Authenticated Customer Only)
   * POST /api/products/{productId}/reviews
   */
  async createReview(productId, { orderId, rating, comment }) {
    const numericOrderId = typeof orderId === 'number'
      ? orderId
      : Number(String(orderId).replace(/\D/g, ''));

    const body = {
      orderId: !isNaN(numericOrderId) ? numericOrderId : 0,
      rating: Math.max(1, Math.min(5, Math.round(Number(rating) || 5)))
    };
    if (comment !== undefined && comment !== null) {
      body.comment = String(comment).slice(0, 2000);
    }

    const response = await apiClient.post(ENDPOINTS.PRODUCTS.CREATE_REVIEW(productId), body, {
      requiresAuth: true
    });
    return normalizeReview(response);
  },

  /**
   * Admin: List Reviews (All statuses with filters)
   * GET /api/admin/reviews
   */
  async adminGetReviews(params = {}) {
    const query = {};
    if (params.page || params.Page) query.page = Number(params.page || params.Page);
    if (params.pageSize || params.PageSize) query.pageSize = Math.min(100, Math.max(1, Number(params.pageSize || params.PageSize)));
    if (params.status || params.Status) query.status = String(params.status || params.Status);
    if (params.rating || params.Rating) query.rating = Number(params.rating || params.Rating);
    if (params.isReported !== undefined && params.isReported !== null && params.isReported !== '') {
      query.isReported = Boolean(params.isReported);
    }
    if (params.productId || params.ProductId) query.productId = Number(params.productId || params.ProductId);
    if (params.language || params.Language) query.language = String(params.language || params.Language);

    const response = await apiClient.get(ENDPOINTS.ADMIN.REVIEWS.LIST, {
      params: query,
      requiresAuth: true
    });

    const rawList = response?.items || (Array.isArray(response) ? response : []);
    return {
      items: rawList.map(normalizeReview).filter(Boolean),
      page: Number(response?.page || 1),
      pageSize: Number(response?.pageSize || (rawList.length || 20)),
      totalCount: Number(response?.totalCount !== undefined ? response.totalCount : rawList.length),
      totalPages: Number(response?.totalPages || 1),
      hasPreviousPage: Boolean(response?.hasPreviousPage),
      hasNextPage: Boolean(response?.hasNextPage)
    };
  },

  /**
   * Admin: Approve Review (Pending -> Approved)
   * POST /api/admin/reviews/{id}/approve
   */
  async adminApproveReview(id, { note } = {}) {
    const body = {};
    if (note) body.note = String(note);
    return await apiClient.post(ENDPOINTS.ADMIN.REVIEWS.APPROVE(id), body, {
      requiresAuth: true
    });
  },

  /**
   * Admin: Reject Review (Pending -> Rejected)
   * POST /api/admin/reviews/{id}/reject
   */
  async adminRejectReview(id, { reason }) {
    if (!reason || !String(reason).trim()) {
      throw new Error('A rejection reason is required.');
    }
    return await apiClient.post(ENDPOINTS.ADMIN.REVIEWS.REJECT(id), {
      reason: String(reason).trim()
    }, {
      requiresAuth: true
    });
  },

  /**
   * Admin: Hide Review (Approved -> Hidden)
   * POST /api/admin/reviews/{id}/hide
   */
  async adminHideReview(id) {
    return await apiClient.post(ENDPOINTS.ADMIN.REVIEWS.HIDE(id), null, {
      requiresAuth: true
    });
  }
};

export default reviewApi;
