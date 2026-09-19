import apiClient from './client';
import ENDPOINTS from './endpoints';
import {
  normalizeReturnEligibility,
  normalizeReturn,
  normalizeRefund,
  normalizeObjectKeys
} from './normalizers';

/**
 * Arabian Sheikh - Returns & Refunds API Client Module
 * Real Backend API: https://arabian-sheikh.runasp.net
 * Pure JavaScript & JSX - Zero Mocking
 */
export const returnsApi = {
  // ==========================================
  // CUSTOMER STOREFRONT ENDPOINTS
  // ==========================================

  /**
   * Check return eligibility for an order
   * GET /api/orders/{orderId}/return-eligibility
   * @param {number|string} orderId
   */
  async getReturnEligibility(orderId) {
    const numericId = Number(orderId);
    if (!numericId || isNaN(numericId)) {
      throw new Error('A valid numeric order ID is required to check return eligibility.');
    }
    const response = await apiClient.get(ENDPOINTS.ORDERS.RETURN_ELIGIBILITY(numericId));
    return normalizeReturnEligibility(response);
  },

  /**
   * Submit a customer return request
   * POST /api/orders/{orderId}/returns
   * @param {number|string} orderId
   * @param {object} payload { bankAccountNumber, bankAccountHolderName, bankName, items }
   */
  async createReturn(orderId, payload) {
    const numericId = Number(orderId);
    if (!numericId || isNaN(numericId)) {
      throw new Error('A valid numeric order ID is required to create a return request.');
    }

    const cleanedPayload = {
      bankAccountNumber: String(payload.bankAccountNumber || '').trim(),
      bankAccountHolderName: String(payload.bankAccountHolderName || '').trim(),
      bankName: String(payload.bankName || '').trim(),
      items: Array.isArray(payload.items)
        ? payload.items.map(item => ({
            orderItemId: Number(item.orderItemId),
            quantity: Number(item.quantity || 1),
            reason: String(item.reason || 'Other').trim(),
            reasonNote: String(item.reasonNote || '').trim(),
            photoIds: Array.isArray(item.photoIds) ? item.photoIds.filter(Boolean) : []
          }))
        : []
    };

    const response = await apiClient.post(ENDPOINTS.ORDERS.CREATE_RETURN(numericId), cleanedPayload);
    return normalizeReturn(response);
  },

  /**
   * Get all returns submitted for a specific order
   * GET /api/orders/{orderId}/returns
   * @param {number|string} orderId
   */
  async getOrderReturns(orderId) {
    const numericId = Number(orderId);
    if (!numericId || isNaN(numericId)) {
      throw new Error('A valid numeric order ID is required to fetch order returns.');
    }
    const response = await apiClient.get(ENDPOINTS.ORDERS.RETURNS(numericId));
    const rawList = response?.items || (Array.isArray(response) ? response : []);
    return rawList.map(normalizeReturn);
  },

  /**
   * Stage a photo for return evidence
   * POST /api/Returns/photos/staging
   * Multipart/form-data with key 'file'
   * @param {File} file
   * @returns {Promise<{ photoId: string, url: string, expiresAt: string }>}
   */
  async stagePhoto(file) {
    if (!file) {
      throw new Error('A file is required for photo staging.');
    }
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.upload(ENDPOINTS.RETURNS.STAGE_PHOTO, formData);
    const normalized = normalizeObjectKeys(response);
    return {
      photoId: normalized.photoId || normalized.id || '',
      url: normalized.url || normalized.photoUrl || '',
      expiresAt: normalized.expiresAt || null
    };
  },

  /**
   * Get customer return details by return ID
   * GET /api/Returns/{id}
   * @param {number|string} returnId
   */
  async getReturnDetails(returnId) {
    if (!returnId) {
      throw new Error('Return ID is required.');
    }
    const response = await apiClient.get(ENDPOINTS.RETURNS.DETAILS(returnId));
    return normalizeReturn(response);
  },

  /**
   * Cancel a pending customer return request
   * POST /api/Returns/{id}/cancel
   * @param {number|string} returnId
   */
  async cancelReturn(returnId) {
    if (!returnId) {
      throw new Error('Return ID is required.');
    }
    const response = await apiClient.post(ENDPOINTS.RETURNS.CANCEL(returnId), {});
    return normalizeReturn(response);
  },

  /**
   * Add a supplementary staged photo to an existing return item
   * POST /api/Returns/{returnId}/items/{itemId}/photos
   * @param {number|string} returnId
   * @param {number|string} itemId
   * @param {string} photoId
   */
  async addSupplementaryPhoto(returnId, itemId, photoId) {
    if (!returnId || !itemId || !photoId) {
      throw new Error('Return ID, Item ID, and Photo ID are required to add supplementary photo.');
    }
    const response = await apiClient.post(
      ENDPOINTS.RETURNS.ADD_PHOTO(returnId, itemId),
      { photoId }
    );
    return normalizeObjectKeys(response);
  },

  /**
   * Delete a supplementary photo from an existing return item
   * DELETE /api/Returns/{returnId}/items/{itemId}/photos/{photoId}
   * @param {number|string} returnId
   * @param {number|string} itemId
   * @param {string} photoId
   */
  async deleteSupplementaryPhoto(returnId, itemId, photoId) {
    if (!returnId || !itemId || !photoId) {
      throw new Error('Return ID, Item ID, and Photo ID are required to delete supplementary photo.');
    }
    return await apiClient.delete(ENDPOINTS.RETURNS.DELETE_PHOTO(returnId, itemId, photoId));
  },

  // ==========================================
  // ADMIN BACK-OFFICE ENDPOINTS
  // ==========================================

  /**
   * Admin: List returns with pagination, status & order filtering
   * GET /api/admin/returns
   * @param {object} params { page, pageSize, status, orderNumber, sortBy, sortDirection }
   */
  async getAdminReturns(params = {}) {
    const query = {};
    if (params.page) query.page = params.page;
    if (params.pageSize) query.pageSize = params.pageSize;
    if (params.status && params.status !== 'All') query.status = params.status;
    if (params.orderNumber) query.orderNumber = params.orderNumber;
    if (params.sortBy) query.sortBy = params.sortBy;
    if (params.sortDirection) query.sortDirection = params.sortDirection;

    const response = await apiClient.get(ENDPOINTS.ADMIN.RETURNS.LIST, { params: query });
    const rawList = response?.items || (Array.isArray(response) ? response : []);
    return {
      items: rawList.map(normalizeReturn),
      totalCount: Number(response?.totalCount ?? rawList.length),
      page: Number(response?.page ?? (params.page || 1)),
      pageSize: Number(response?.pageSize ?? (params.pageSize || 10)),
      totalPages: Math.ceil(Number(response?.totalCount ?? rawList.length) / Number(response?.pageSize ?? (params.pageSize || 10))) || 1
    };
  },

  /**
   * Admin: Get return details by ID
   * GET /api/admin/returns/{id}
   * @param {number|string} returnId
   */
  async getAdminReturnDetails(returnId) {
    if (!returnId) {
      throw new Error('Return ID is required.');
    }
    const response = await apiClient.get(ENDPOINTS.ADMIN.RETURNS.DETAILS(returnId));
    return normalizeReturn(response);
  },

  /**
   * Admin: Review return request (atomic: all items must have a decision)
   * POST /api/admin/returns/{id}/review
   * @param {number|string} returnId
   * @param {Array<{ itemId: number|string, decision: 'Approved'|'Rejected', refundAmount?: number, rejectionReason?: string }>} decisions
   */
  async reviewReturn(returnId, decisions) {
    if (!returnId) {
      throw new Error('Return ID is required for review.');
    }
    if (!Array.isArray(decisions) || decisions.length === 0) {
      throw new Error('Decisions array is required for return review.');
    }

    const payload = {
      decisions: decisions.map(d => ({
        itemId: d.itemId,
        decision: d.decision, // "Approved" | "Rejected"
        refundAmount: d.decision === 'Approved' ? Number(d.refundAmount || 0) : null,
        rejectionReason: d.decision === 'Rejected' ? String(d.rejectionReason || '').trim() : null
      }))
    };

    const response = await apiClient.post(ENDPOINTS.ADMIN.RETURNS.REVIEW(returnId), payload);
    return normalizeReturn(response);
  },

  /**
   * Admin: Correct refund amount on an approved return item
   * PATCH /api/admin/returns/{returnId}/items/{itemId}/correct-refund-amount
   * @param {number|string} returnId
   * @param {number|string} itemId
   * @param {object} param2 { newRefundAmount, correctionReason }
   */
  async correctRefundAmount(returnId, itemId, { newRefundAmount, correctionReason }) {
    if (!returnId || !itemId) {
      throw new Error('Return ID and Item ID are required to correct refund amount.');
    }
    const payload = {
      newRefundAmount: Number(newRefundAmount),
      correctionReason: String(correctionReason || '').trim()
    };
    const response = await apiClient.patch(
      ENDPOINTS.ADMIN.RETURNS.CORRECT_REFUND(returnId, itemId),
      payload
    );
    return normalizeObjectKeys(response);
  },

  /**
   * Admin: List refunds with pagination & status filtering
   * GET /api/admin/refunds
   * @param {object} params { page, pageSize, status }
   */
  async getAdminRefunds(params = {}) {
    const query = {};
    if (params.page) query.page = params.page;
    if (params.pageSize) query.pageSize = params.pageSize;
    if (params.status && params.status !== 'All') query.status = params.status;

    const response = await apiClient.get(ENDPOINTS.ADMIN.REFUNDS.LIST, { params: query });
    const rawList = response?.items || (Array.isArray(response) ? response : []);
    return {
      items: rawList.map(normalizeRefund),
      totalCount: Number(response?.totalCount ?? rawList.length),
      page: Number(response?.page ?? (params.page || 1)),
      pageSize: Number(response?.pageSize ?? (params.pageSize || 10)),
      totalPages: Math.ceil(Number(response?.totalCount ?? rawList.length) / Number(response?.pageSize ?? (params.pageSize || 10))) || 1
    };
  },

  /**
   * Admin: Mark refund as paid for an approved return item
   * PATCH /api/admin/refunds/{itemId}/mark-paid
   * @param {number|string} itemId
   */
  async markRefundPaid(itemId) {
    if (!itemId) {
      throw new Error('Item ID is required to mark refund as paid.');
    }
    const response = await apiClient.patch(ENDPOINTS.ADMIN.REFUNDS.MARK_PAID(itemId), {});
    return normalizeObjectKeys(response);
  }
};

export default returnsApi;
