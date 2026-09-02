import { promotionApi } from '../api/promotion.api';

/**
 * Arabian Sheikh - Admin Promotion & Bundle Service
 * 
 * Business logic layer for promotions and bundles management:
 * - Direct real backend API communication
 * - Client-side validation for promotions and bundles
 * - Contextual error parsing (409 conflict, 422 date range, 403 permission)
 */
export const promotionService = {
  // ==========================================
  // 1. PROMOTIONS CRUD & LIFECYCLE
  // ==========================================

  /**
   * Get paginated promotions list with search, status, type, and sort
   */
  async getPromotions(params = {}) {
    try {
      return await promotionApi.adminGetPromotions(params);
    } catch (err) {
      console.warn('[promotionService] Error fetching promotions:', err.message);
      throw err;
    }
  },

  /**
   * Get single promotion details with applicabilities and bundles
   */
  async getPromotionById(id) {
    try {
      return await promotionApi.adminGetPromotionById(id);
    } catch (err) {
      console.warn(`[promotionService] Error fetching promotion #${id}:`, err.message);
      throw err;
    }
  },

  /**
   * Create new promotion
   */
  async createPromotion(payload) {
    this.validatePromotionData(payload);
    try {
      return await promotionApi.adminCreatePromotion(payload);
    } catch (err) {
      this.handleApiError(err);
    }
  },

  /**
   * Update existing promotion
   */
  async updatePromotion(id, payload) {
    this.validatePromotionData(payload);
    try {
      return await promotionApi.adminUpdatePromotion(id, payload);
    } catch (err) {
      this.handleApiError(err);
    }
  },

  /**
   * Delete promotion
   */
  async deletePromotion(id) {
    try {
      return await promotionApi.adminDeletePromotion(id);
    } catch (err) {
      this.handleApiError(err);
    }
  },

  /**
   * Activate promotion
   */
  async activatePromotion(id) {
    try {
      return await promotionApi.adminActivatePromotion(id);
    } catch (err) {
      this.handleApiError(err);
    }
  },

  /**
   * Deactivate promotion (with optional reason)
   */
  async deactivatePromotion(id, reason = '') {
    try {
      return await promotionApi.adminDeactivatePromotion(id, reason);
    } catch (err) {
      this.handleApiError(err);
    }
  },

  /**
   * Get promotion analytics
   */
  async getPromotionAnalytics(id) {
    try {
      return await promotionApi.adminGetPromotionAnalytics(id);
    } catch (err) {
      console.warn(`[promotionService] Error fetching analytics for #${id}:`, err.message);
      throw err;
    }
  },

  // ==========================================
  // 2. BUNDLES MANAGEMENT
  // ==========================================

  /**
   * Create bundle under a promotion
   */
  async createBundle(promotionId, payload) {
    this.validateBundleData(payload);
    try {
      return await promotionApi.adminCreateBundle(promotionId, payload);
    } catch (err) {
      this.handleApiError(err);
    }
  },

  /**
   * Get bundle details
   */
  async getBundleById(promotionId, bundleId) {
    try {
      return await promotionApi.adminGetBundleById(promotionId, bundleId);
    } catch (err) {
      console.warn(`[promotionService] Error fetching bundle #${bundleId}:`, err.message);
      throw err;
    }
  },

  /**
   * Update bundle
   */
  async updateBundle(promotionId, bundleId, payload) {
    this.validateBundleData(payload);
    try {
      return await promotionApi.adminUpdateBundle(promotionId, bundleId, payload);
    } catch (err) {
      this.handleApiError(err);
    }
  },

  /**
   * Delete bundle
   */
  async deleteBundle(promotionId, bundleId) {
    try {
      return await promotionApi.adminDeleteBundle(promotionId, bundleId);
    } catch (err) {
      this.handleApiError(err);
    }
  },

  // ==========================================
  // 3. VALIDATION & ERROR HELPERS
  // ==========================================

  /**
   * Client-side validation for promotions
   */
  validatePromotionData(data) {
    const errors = {};

    if (!data.name || !data.name.trim()) {
      errors.name = 'Promotion campaign name is required.';
    }

    if (!data.type || !['Discount', 'Bundle'].includes(data.type)) {
      errors.type = 'Promotion type must be Discount or Bundle.';
    }

    if (data.type === 'Discount') {
      if (!data.discountType || !['Percentage', 'Fixed'].includes(data.discountType)) {
        errors.discountType = 'Discount type must be Percentage or Fixed.';
      }
      const val = Number(data.discountValue);
      if (isNaN(val) || val <= 0) {
        errors.discountValue = 'Discount value must be greater than 0.';
      } else if (data.discountType === 'Percentage' && val > 100) {
        errors.discountValue = 'Percentage discount cannot exceed 100%.';
      }
    }

    if (!data.startDate) {
      errors.startDate = 'Start date is required.';
    }

    if (!data.endDate) {
      errors.endDate = 'End date is required.';
    } else if (data.startDate && new Date(data.endDate) <= new Date(data.startDate)) {
      errors.endDate = 'End date must be after the start date.';
    }

    if (Object.keys(errors).length > 0) {
      const first = Object.values(errors)[0];
      const err = new Error(first);
      err.errors = errors;
      throw err;
    }

    return true;
  },

  /**
   * Client-side validation for bundles
   */
  validateBundleData(data) {
    const errors = {};

    if (!data.name || !data.name.trim()) {
      errors.name = 'Bundle pack name is required.';
    }

    const price = Number(data.bundlePrice);
    if (isNaN(price) || price <= 0) {
      errors.bundlePrice = 'Bundle price must be greater than $0.';
    }

    if (!Array.isArray(data.items) || data.items.length === 0) {
      errors.items = 'Please add at least one product to the bundle.';
    } else {
      const seen = new Set();
      for (const item of data.items) {
        if (!item.productId || Number(item.productId) <= 0) {
          errors.items = 'All bundle items must have a valid product selected.';
          break;
        }
        if (seen.has(Number(item.productId))) {
          errors.items = 'Each product can only appear once in a bundle. Increase quantity instead.';
          break;
        }
        seen.add(Number(item.productId));
        if (!item.quantity || Number(item.quantity) < 1) {
          errors.items = 'Product quantity must be at least 1.';
          break;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      const first = Object.values(errors)[0];
      const err = new Error(first);
      err.errors = errors;
      throw err;
    }

    return true;
  },

  /**
   * Contextual API Error Formatter
   */
  handleApiError(err) {
    const status = err.response?.status || err.status;
    const data = err.response?.data || err.data;
    const code = data?.code || '';
    const msg = data?.message || err.message || 'Operation failed.';

    if (status === 409 || code === 'PROMOTION_HAS_USAGE_HISTORY') {
      const conflictErr = new Error(msg || 'This promotion has historical orders and cannot be deleted.');
      conflictErr.isConflict = true;
      conflictErr.code = 'PROMOTION_HAS_USAGE_HISTORY';
      throw conflictErr;
    }

    if (status === 422 || code === 'INVALID_PROMOTION_DATE_RANGE') {
      throw new Error(msg || 'End date must be later than the start date.');
    }

    if (status === 403 || code === 'FORBIDDEN') {
      throw new Error('You do not have permission to manage promotions (CatalogAdmin role required).');
    }

    if (status === 404) {
      throw new Error(msg || 'Promotion or bundle not found.');
    }

    throw new Error(msg);
  }
};

export default promotionService;

