import apiClient from './client';
import ENDPOINTS from './endpoints';
import { normalizeCouponValidation, normalizeObjectKeys } from './normalizers';

export const discountApi = {
  // ==========================================
  // CUSTOMER COUPONS
  // ==========================================

  /**
   * Validate coupon code for customer cart
   * POST /api/coupons/validate
   */
  async validateCoupon(code) {
    const response = await apiClient.post(ENDPOINTS.COUPONS.VALIDATE, {
      code: code.trim().toUpperCase()
    });
    return normalizeCouponValidation(response);
  },

  // ==========================================
  // ADMIN COUPONS & PROMOTIONS
  // ==========================================

  /**
   * Admin: List coupons
   * GET /api/admin/coupons
   */
  async adminGetCoupons(params = {}) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.COUPONS.LIST, { params });
    const rawList = response?.items || (Array.isArray(response) ? response : []);
    return rawList.map(normalizeObjectKeys);
  },

  /**
   * Admin: Create coupon
   * POST /api/admin/coupons
   */
  async adminCreateCoupon(payload) {
    const response = await apiClient.post(ENDPOINTS.ADMIN.COUPONS.CREATE, payload);
    return normalizeObjectKeys(response);
  },

  /**
   * Admin: Update coupon
   * PUT /api/admin/coupons/{id}
   */
  async adminUpdateCoupon(id, payload) {
    const response = await apiClient.put(ENDPOINTS.ADMIN.COUPONS.UPDATE(id), payload);
    return normalizeObjectKeys(response);
  },

  /**
   * Admin: Activate coupon
   * POST /api/admin/coupons/{id}/activate
   */
  async adminActivateCoupon(id) {
    return await apiClient.post(ENDPOINTS.ADMIN.COUPONS.ACTIVATE(id));
  },

  /**
   * Admin: Deactivate coupon
   * POST /api/admin/coupons/{id}/deactivate
   */
  async adminDeactivateCoupon(id) {
    return await apiClient.post(ENDPOINTS.ADMIN.COUPONS.DEACTIVATE(id));
  },

  /**
   * Admin: List promotions
   * GET /api/admin/promotions
   */
  async adminGetPromotions(params = {}) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.PROMOTIONS.LIST, { params });
    const rawList = response?.items || (Array.isArray(response) ? response : []);
    return rawList.map(normalizeObjectKeys);
  },

  /**
   * Admin: Create promotion
   * POST /api/admin/promotions
   */
  async adminCreatePromotion(payload) {
    const response = await apiClient.post(ENDPOINTS.ADMIN.PROMOTIONS.CREATE, payload);
    return normalizeObjectKeys(response);
  },

  /**
   * Admin: Activate promotion
   * POST /api/admin/promotions/{id}/activate
   */
  async adminActivatePromotion(id) {
    return await apiClient.post(ENDPOINTS.ADMIN.PROMOTIONS.ACTIVATE(id));
  },

  /**
   * Admin: Deactivate promotion
   * POST /api/admin/promotions/{id}/deactivate
   */
  async adminDeactivatePromotion(id, reason = '') {
    return await apiClient.post(ENDPOINTS.ADMIN.PROMOTIONS.DEACTIVATE(id), { reason });
  }
};

export default discountApi;
