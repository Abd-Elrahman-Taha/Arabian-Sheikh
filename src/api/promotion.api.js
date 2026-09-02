import apiClient from './client';
import ENDPOINTS from './endpoints';
import {
  normalizePromotion,
  normalizePromotionList,
  normalizeBundle,
  normalizePromotionAnalytics
} from './normalizers';

/**
 * Arabian Sheikh - Admin Promotions & Bundles API
 * 
 * Centralized API module for all 12 Admin Promotion & Bundle endpoints:
 * 1. GET /api/admin/promotions
 * 2. POST /api/admin/promotions
 * 3. GET /api/admin/promotions/{id}
 * 4. PUT /api/admin/promotions/{id}
 * 5. DELETE /api/admin/promotions/{id}
 * 6. POST /api/admin/promotions/{id}/activate
 * 7. POST /api/admin/promotions/{id}/deactivate
 * 8. GET /api/admin/promotions/{id}/analytics
 * 9. POST /api/admin/promotions/{id}/bundles
 * 10. GET /api/admin/promotions/{id}/bundles/{bundleId}
 * 11. PUT /api/admin/promotions/{id}/bundles/{bundleId}
 * 12. DELETE /api/admin/promotions/{id}/bundles/{bundleId}
 * 
 * Plus Customer Storefront endpoints:
 * - GET /api/promotions
 * - GET /api/promotions/{id}
 * - GET /api/promotions/bundles
 */
export const promotionApi = {
  // ==========================================
  // 1. ADMIN PROMOTIONS
  // ==========================================

  /**
   * Admin: List promotions with pagination, search, status, type, sort
   * GET /api/admin/promotions
   */
  async adminGetPromotions(params = {}) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.PROMOTIONS.LIST, { params });
    return normalizePromotionList(response);
  },

  /**
   * Admin: Get single promotion details with rules and bundles
   * GET /api/admin/promotions/{id}
   */
  async adminGetPromotionById(id) {
    const targetId = Number(id);
    if (!targetId || isNaN(targetId)) throw new Error('Valid promotion ID is required.');
    const response = await apiClient.get(ENDPOINTS.ADMIN.PROMOTIONS.DETAILS(targetId));
    return normalizePromotion(response);
  },

  /**
   * Admin: Create promotion (Discount or Bundle)
   * POST /api/admin/promotions
   */
  async adminCreatePromotion(payload) {
    const isDiscount = (payload.type || 'Discount').toLowerCase() === 'discount';

    const body = {
      name: String(payload.name || '').trim(),
      type: isDiscount ? 'Discount' : 'Bundle',
      discountType: isDiscount ? (payload.discountType === 'Fixed' ? 'Fixed' : 'Percentage') : null,
      discountValue: isDiscount ? (Number(payload.discountValue) || 0) : null,
      startDate: payload.startDate ? new Date(payload.startDate).toISOString() : new Date().toISOString(),
      endDate: payload.endDate ? new Date(payload.endDate).toISOString() : '2027-12-31T23:59:59Z',
      minOrderAmount: payload.minOrderAmount !== null && payload.minOrderAmount !== undefined && payload.minOrderAmount !== ''
        ? Number(payload.minOrderAmount)
        : null,
      maxDiscountAmount: payload.maxDiscountAmount !== null && payload.maxDiscountAmount !== undefined && payload.maxDiscountAmount !== ''
        ? Number(payload.maxDiscountAmount)
        : null,
      usageLimit: payload.usageLimit !== null && payload.usageLimit !== undefined && payload.usageLimit !== ''
        ? Number(payload.usageLimit)
        : null,
      applicability: Array.isArray(payload.applicability)
        ? payload.applicability.map(rule => ({
            targetType: rule.targetType,
            targetId: Number(rule.targetId),
            isExcluded: Boolean(rule.isExcluded)
          }))
        : []
    };

    const response = await apiClient.post(ENDPOINTS.ADMIN.PROMOTIONS.CREATE, body);
    return normalizePromotion(response);
  },

  /**
   * Admin: Update promotion
   * PUT /api/admin/promotions/{id}
   */
  async adminUpdatePromotion(id, payload) {
    const targetId = Number(id);
    if (!targetId || isNaN(targetId)) throw new Error('Valid promotion ID is required.');
    const isDiscount = (payload.type || 'Discount').toLowerCase() === 'discount';

    const body = {
      name: String(payload.name || '').trim(),
      type: isDiscount ? 'Discount' : 'Bundle',
      discountType: isDiscount ? (payload.discountType === 'Fixed' ? 'Fixed' : 'Percentage') : null,
      discountValue: isDiscount ? (Number(payload.discountValue) || 0) : null,
      startDate: payload.startDate ? new Date(payload.startDate).toISOString() : new Date().toISOString(),
      endDate: payload.endDate ? new Date(payload.endDate).toISOString() : '2027-12-31T23:59:59Z',
      minOrderAmount: payload.minOrderAmount !== null && payload.minOrderAmount !== undefined && payload.minOrderAmount !== ''
        ? Number(payload.minOrderAmount)
        : null,
      maxDiscountAmount: payload.maxDiscountAmount !== null && payload.maxDiscountAmount !== undefined && payload.maxDiscountAmount !== ''
        ? Number(payload.maxDiscountAmount)
        : null,
      usageLimit: payload.usageLimit !== null && payload.usageLimit !== undefined && payload.usageLimit !== ''
        ? Number(payload.usageLimit)
        : null,
      applicability: Array.isArray(payload.applicability)
        ? payload.applicability.map(rule => ({
            targetType: rule.targetType,
            targetId: Number(rule.targetId),
            isExcluded: Boolean(rule.isExcluded)
          }))
        : []
    };

    const response = await apiClient.put(ENDPOINTS.ADMIN.PROMOTIONS.UPDATE(targetId), body);
    return normalizePromotion(response);
  },

  /**
   * Admin: Delete promotion
   * DELETE /api/admin/promotions/{id}
   */
  async adminDeletePromotion(id) {
    const targetId = Number(id);
    if (!targetId || isNaN(targetId)) throw new Error('Valid promotion ID is required.');
    await apiClient.delete(ENDPOINTS.ADMIN.PROMOTIONS.DELETE(targetId));
    return true;
  },

  /**
   * Admin: Activate promotion
   * POST /api/admin/promotions/{id}/activate
   */
  async adminActivatePromotion(id) {
    const targetId = Number(id);
    if (!targetId || isNaN(targetId)) throw new Error('Valid promotion ID is required.');
    await apiClient.post(ENDPOINTS.ADMIN.PROMOTIONS.ACTIVATE(targetId));
    return true;
  },

  /**
   * Admin: Deactivate promotion (with optional reason)
   * POST /api/admin/promotions/{id}/deactivate
   */
  async adminDeactivatePromotion(id, reason = '') {
    const targetId = Number(id);
    if (!targetId || isNaN(targetId)) throw new Error('Valid promotion ID is required.');
    const payload = reason && reason.trim() ? { reason: reason.trim() } : {};
    await apiClient.post(ENDPOINTS.ADMIN.PROMOTIONS.DEACTIVATE(targetId), payload);
    return true;
  },

  /**
   * Admin: Get promotion analytics
   * GET /api/admin/promotions/{id}/analytics
   */
  async adminGetPromotionAnalytics(id) {
    const targetId = Number(id);
    if (!targetId || isNaN(targetId)) throw new Error('Valid promotion ID is required.');
    const response = await apiClient.get(ENDPOINTS.ADMIN.PROMOTIONS.ANALYTICS(targetId));
    return normalizePromotionAnalytics(response);
  },

  // ==========================================
  // 2. ADMIN BUNDLES (Under a Promotion)
  // ==========================================

  /**
   * Admin: Create bundle under a promotion
   * POST /api/admin/promotions/{promotionId}/bundles
   */
  async adminCreateBundle(promotionId, payload) {
    const promoId = Number(promotionId);
    if (!promoId || isNaN(promoId)) throw new Error('Valid promotion ID is required.');

    const body = {
      name: String(payload.name || '').trim(),
      bundlePrice: Number(payload.bundlePrice || 0),
      items: Array.isArray(payload.items)
        ? payload.items.map(i => ({
            productId: Number(i.productId),
            quantity: Math.max(1, Number(i.quantity) || 1)
          }))
        : []
    };

    const response = await apiClient.post(ENDPOINTS.ADMIN.PROMOTIONS.CREATE_BUNDLE(promoId), body);
    return normalizeBundle(response);
  },

  /**
   * Admin: Get bundle details by ID
   * GET /api/admin/promotions/{promotionId}/bundles/{bundleId}
   */
  async adminGetBundleById(promotionId, bundleId) {
    const promoId = Number(promotionId);
    const bId = Number(bundleId);
    if (!promoId || !bId || isNaN(promoId) || isNaN(bId)) {
      throw new Error('Valid promotion and bundle IDs are required.');
    }
    const response = await apiClient.get(ENDPOINTS.ADMIN.PROMOTIONS.BUNDLE_DETAILS(promoId, bId));
    return normalizeBundle(response);
  },

  /**
   * Admin: Update bundle
   * PUT /api/admin/promotions/{promotionId}/bundles/{bundleId}
   */
  async adminUpdateBundle(promotionId, bundleId, payload) {
    const promoId = Number(promotionId);
    const bId = Number(bundleId);
    if (!promoId || !bId || isNaN(promoId) || isNaN(bId)) {
      throw new Error('Valid promotion and bundle IDs are required.');
    }

    const body = {
      name: String(payload.name || '').trim(),
      bundlePrice: Number(payload.bundlePrice || 0),
      items: Array.isArray(payload.items)
        ? payload.items.map(i => ({
            productId: Number(i.productId),
            quantity: Math.max(1, Number(i.quantity) || 1)
          }))
        : []
    };

    const response = await apiClient.put(ENDPOINTS.ADMIN.PROMOTIONS.BUNDLE_UPDATE(promoId, bId), body);
    return normalizeBundle(response);
  },

  /**
   * Admin: Delete bundle
   * DELETE /api/admin/promotions/{promotionId}/bundles/{bundleId}
   */
  async adminDeleteBundle(promotionId, bundleId) {
    const promoId = Number(promotionId);
    const bId = Number(bundleId);
    if (!promoId || !bId || isNaN(promoId) || isNaN(bId)) {
      throw new Error('Valid promotion and bundle IDs are required.');
    }
    await apiClient.delete(ENDPOINTS.ADMIN.PROMOTIONS.BUNDLE_DELETE(promoId, bId));
    return true;
  },

  // ==========================================
  // 3. STOREFRONT PUBLIC PROMOTIONS
  // ==========================================

  async getPromotions(params = {}) {
    const response = await apiClient.get(ENDPOINTS.PROMOTIONS.LIST, { params });
    return normalizePromotionList(response);
  },

  async getPromotionById(id) {
    const response = await apiClient.get(ENDPOINTS.PROMOTIONS.DETAILS(id));
    return normalizePromotion(response);
  },

  async getBundles(params = {}) {
    const response = await apiClient.get(ENDPOINTS.PROMOTIONS.BUNDLES, { params });
    return Array.isArray(response) ? response.map(normalizeBundle).filter(Boolean) : [];
  }
};

export default promotionApi;

