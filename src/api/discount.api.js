import apiClient from './client';
import ENDPOINTS from './endpoints';
import {
  normalizeCouponValidation,
  normalizeCoupon,
  normalizeCouponList,
  normalizeCouponAnalytics,
  normalizeObjectKeys
} from './normalizers';

/**
 * Formats coupon payload strictly conforming to ASP.NET DTO contract:
 * {
 *   "code": "string",
 *   "type": "Percentage" | "Fixed",
 *   "value": 0,
 *   "startDate": "2026-09-23T20:41:33.876Z",
 *   "endDate": "2026-09-23T20:41:33.876Z",
 *   "usageLimit": 0,
 *   "minOrderAmount": 0,
 *   "maxDiscountAmount": 0,
 *   "allowOnDiscountedItems": true,
 *   "isActive": true,
 *   "applicability": [
 *     {
 *       "targetType": "Product",
 *       "targetId": 0,
 *       "isExcluded": true
 *     }
 *   ]
 * }
 */
export function formatCouponPayload(payload = {}) {
  const code = String(payload.code || '').trim().toUpperCase();
  const type = payload.type === 'Fixed' ? 'Fixed' : 'Percentage';
  const value = Number(payload.value !== undefined && payload.value !== null ? payload.value : 0);

  let startDate = new Date().toISOString();
  if (payload.startDate) {
    try {
      startDate = new Date(payload.startDate).toISOString();
    } catch {
      startDate = new Date().toISOString();
    }
  }

  let endDate = new Date(Date.now() + 90 * 86400000).toISOString();
  if (payload.endDate) {
    try {
      endDate = new Date(payload.endDate).toISOString();
    } catch {
      endDate = new Date(Date.now() + 90 * 86400000).toISOString();
    }
  }

  const usageLimit = Number(payload.usageLimit !== undefined && payload.usageLimit !== null ? payload.usageLimit : 0);
  const minOrderAmount = Number(payload.minOrderAmount !== undefined && payload.minOrderAmount !== null ? payload.minOrderAmount : 0);
  const maxDiscountAmount = Number(payload.maxDiscountAmount !== undefined && payload.maxDiscountAmount !== null ? payload.maxDiscountAmount : 0);
  const allowOnDiscountedItems = Boolean(payload.allowOnDiscountedItems !== undefined ? payload.allowOnDiscountedItems : true);
  const isActive = Boolean(payload.isActive !== undefined ? payload.isActive : true);

  const rawApplicability = Array.isArray(payload.applicability)
    ? payload.applicability
    : (Array.isArray(payload.applicabilities) ? payload.applicabilities : []);

  const applicability = rawApplicability.map(item => ({
    targetType: String(item.targetType || 'Product'),
    targetId: Number(item.targetId || 0),
    isExcluded: Boolean(item.isExcluded)
  }));

  return {
    code,
    type,
    value,
    startDate,
    endDate,
    usageLimit,
    minOrderAmount,
    maxDiscountAmount,
    allowOnDiscountedItems,
    isActive,
    applicability
  };
}

export const discountApi = {
  // ==========================================
  // 1. CUSTOMER STOREFRONT COUPONS
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
  // 2. ADMIN COUPONS MANAGEMENT
  // ==========================================

  /**
   * Admin: List coupons with search, status filtering, sorting, pagination
   * GET /api/admin/coupons
   */
  async adminGetCoupons(params = {}) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.COUPONS.LIST, { params });
    return normalizeCouponList(response);
  },

  /**
   * Admin: Get single coupon details with applicability rules
   * GET /api/admin/coupons/{id}
   */
  async adminGetCouponById(id) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.COUPONS.DETAILS(id));
    return normalizeCoupon(response);
  },

  /**
   * Admin: Create coupon
   * POST /api/admin/coupons
   */
  async adminCreateCoupon(payload) {
    const formatted = formatCouponPayload(payload);
    const response = await apiClient.post(ENDPOINTS.ADMIN.COUPONS.CREATE, formatted);
    return normalizeCoupon(response);
  },

  /**
   * Admin: Update coupon
   * PUT /api/admin/coupons/{id}
   */
  async adminUpdateCoupon(id, payload) {
    const formatted = formatCouponPayload(payload);
    const response = await apiClient.put(ENDPOINTS.ADMIN.COUPONS.UPDATE(id), formatted);
    return normalizeCoupon(response);
  },

  /**
   * Admin: Delete coupon
   * DELETE /api/admin/coupons/{id}
   */
  async adminDeleteCoupon(id) {
    return await apiClient.delete(ENDPOINTS.ADMIN.COUPONS.DELETE(id));
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
   * Admin: Get coupon analytics (total orders, total discount given)
   * GET /api/admin/coupons/{id}/analytics
   */
  async adminGetCouponAnalytics(id) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.COUPONS.ANALYTICS(id));
    return normalizeCouponAnalytics(response);
  },

  // ==========================================
  // 3. ADMIN PROMOTIONS
  // ==========================================

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
