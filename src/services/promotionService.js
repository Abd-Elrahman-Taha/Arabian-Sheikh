import { promotionApi } from '../api/promotion.api';
import { isPromotionActive } from '../api/normalizers';

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
      const result = await promotionApi.adminCreatePromotion(payload);
      this.clearCache();
      return result;
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
      const result = await promotionApi.adminUpdatePromotion(id, payload);
      this.clearCache();
      return result;
    } catch (err) {
      this.handleApiError(err);
    }
  },

  /**
   * Delete promotion
   */
  async deletePromotion(id) {
    try {
      const result = await promotionApi.adminDeletePromotion(id);
      this.clearCache();
      return result;
    } catch (err) {
      this.handleApiError(err);
    }
  },

  /**
   * Activate promotion
   */
  async activatePromotion(id) {
    try {
      const result = await promotionApi.adminActivatePromotion(id);
      this.clearCache();
      return result;
    } catch (err) {
      this.handleApiError(err);
    }
  },

  /**
   * Deactivate promotion (with optional reason)
   */
  async deactivatePromotion(id, reason = '') {
    try {
      const result = await promotionApi.adminDeactivatePromotion(id, reason);
      this.clearCache();
      return result;
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
      errors.name = 'Promotion name is required.';
    }

    const isBundle = data.type === 1 || String(data.type || '').toLowerCase() === 'bundle';

    if (isBundle) {
      if (Array.isArray(data.bundles) && data.bundles.length > 0) {
        const b = data.bundles[0];
        const price = Number(b.bundlePrice);
        if (isNaN(price) || price < 0) {
          errors.bundlePrice = 'Bundle price must be greater than or equal to 0.';
        }
        if (!Array.isArray(b.items) || b.items.length === 0) {
          errors.items = 'Bundle must contain at least one item.';
        } else {
          for (const item of b.items) {
            if (!item.productId || Number(item.productId) <= 0) {
              errors.items = 'Product ID must be greater than 0.';
              break;
            }
            if (!item.quantity || Number(item.quantity) <= 0) {
              errors.items = 'Quantity must be greater than 0.';
              break;
            }
          }
        }
      }
    } else {
      const isFixed = data.discountType === 1 || String(data.discountType || '').toLowerCase() === 'fixed';
      const val = Number(data.discountValue);
      if (isNaN(val) || val <= 0) {
        errors.discountValue = 'Discount value must be greater than 0.';
      } else if (!isFixed && val > 100) {
        errors.discountValue = 'Percentage discount cannot exceed 100%.';
      }
    }

    if (!data.startDate) {
      errors.startDate = 'Start date is required.';
    }

    if (!data.endDate) {
      errors.endDate = 'End date is required.';
    } else if (data.startDate && new Date(data.endDate) <= new Date(data.startDate)) {
      errors.endDate = 'Start date must be earlier than end date.';
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
  },

  // ==========================================
  // 4. PUBLIC STOREFRONT PROMOTIONS
  // ==========================================

  clearCache() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('arabian_sheikh_promotions_updated'));
    }
  },

  /**
   * Get currently active promotions for customer storefront with full applicability rules.
   * Strictly live (zero caching in memory, zero localStorage, zero sessionStorage)
   * and strictly filtered to active promotions only.
   */
  async getActivePromotions() {
    try {
      let rawItems = [];

      // 1. Check admin promotions with Status=Active query first to get authoritative active list
      try {
        const adminRes = await promotionApi.adminGetPromotions({ Status: 'Active', page: 1, pageSize: 100 });
        const adminItems = adminRes?.items || (Array.isArray(adminRes) ? adminRes : []);
        if (Array.isArray(adminItems) && adminItems.length > 0) {
          rawItems = adminItems;
        }
      } catch (adminErr) {
        // Non-blocking fallback if patron is not admin
      }

      // 2. If no admin promotions retrieved, fetch from public storefront promotions endpoint
      if (rawItems.length === 0) {
        try {
          const publicRes = await promotionApi.getPromotions({ Status: 'Active' });
          rawItems = Array.isArray(publicRes) ? publicRes : (publicRes?.items || []);
        } catch (pubErr) {
          console.warn('[promotionService] getPromotions notice:', pubErr?.message || pubErr);
        }
      }

      // 3. Strictly filter out any inactive, scheduled, expired, or deactivated promotions
      const activeCandidates = (Array.isArray(rawItems) ? rawItems : []).filter(isPromotionActive);

      // 4. Hydrate full details (applicability rules and bundle items) for each active campaign
      const fullItems = await Promise.all(
        activeCandidates.map(async (item) => {
          try {
            if (Array.isArray(item.applicabilities) && item.applicabilities.length > 0) return item;
            if (Array.isArray(item.applicability) && item.applicability.length > 0) return item;

            let detail = null;
            try {
              detail = await promotionApi.adminGetPromotionById(item.id);
            } catch {
              detail = await promotionApi.getPromotionById(item.id).catch(() => null);
            }
            if (detail && isPromotionActive(detail)) {
              return detail;
            }
            return isPromotionActive(item) ? item : null;
          } catch {
            return isPromotionActive(item) ? item : null;
          }
        })
      );

      // Return strictly active promotions
      return fullItems.filter(p => p && isPromotionActive(p));
    } catch (err) {
      console.warn('[promotionService] Could not fetch active promotions:', err.message);
      return [];
    }
  },

  /**
   * Calculate live promotion discount for a product.
   * Priority rule: ONLY strictly active promotions are evaluated.
   * If a product qualifies for multiple active promotions, the BIGGER ACTIVE ONE (maximum savings) wins!
   */
  calculateProductPromotion(product, activePromos = []) {
    if (!product || !Array.isArray(activePromos) || activePromos.length === 0) {
      return {
        hasPromotion: false,
        discountPercent: product?.discountPercent || 0,
        price: Number(product?.price || 0),
        originalPrice: product?.originalPrice || null
      };
    }

    const basePrice = Number(product.originalPrice || product.unitBasePrice || product.basePrice || product.price || 0);
    if (isNaN(basePrice) || basePrice <= 0) {
      return {
        hasPromotion: false,
        discountPercent: 0,
        price: Number(product?.price || 0),
        originalPrice: null
      };
    }

    // Resolve authoritative numeric Product IDs (prioritize productId over cart item id)
    const candidateProdIds = [
      Number(product.productId),
      Number(product.product?.id),
      Number(product.product?.productId),
      Number(product.numericId)
    ].filter(id => !isNaN(id) && id > 0);

    // If candidateProdIds is empty, check product.id only if it's numeric and does not look like a cart item string
    if (candidateProdIds.length === 0 && !isNaN(Number(product.id)) && Number(product.id) > 0 && !String(product.id).startsWith('ci-')) {
      candidateProdIds.push(Number(product.id));
    }

    const prodId = candidateProdIds[0] || 0;

    const catId = Number(product.categoryId || product.category?.id || (typeof product.category === 'object' ? product.category?.id : 0) || (product.category === 'perfumes' ? 1 : 0));
    const brandId = Number(product.brandId || product.brand?.id || (typeof product.brand === 'object' ? product.brand?.id : 0) || 0);
    const subcatId = Number(product.subcategoryId || product.subcategory?.id || 0);
    const perfumeCatId = Number(product.perfumeCategoryId || product.perfumeCategory?.id || (product.tier === 'Standard' ? 1 : product.tier === 'Premium' ? 2 : product.tier === 'Luxury' ? 3 : 0));

    let bestPromo = null;

    for (const promo of activePromos) {
      // 1. Strictly verify the promotion is active right now
      if (!isPromotionActive(promo)) {
        continue;
      }

      // 2. Type check: Discount only (bundles are handled separately as suites)
      const isDiscountPromo = promo.type === 0 || String(promo.type || '').toLowerCase() === 'discount';
      if (!isDiscountPromo) continue;

      // 3. Check applicability rules if present
      const rules = Array.isArray(promo.applicability) ? promo.applicability : (Array.isArray(promo.applicabilities) ? promo.applicabilities : []);
      let isEligible = true;

      if (rules.length > 0) {
        let hasMatchingInclude = false;
        let isExplicitlyExcluded = false;

        for (const r of rules) {
          const targetId = Number(r.targetId !== undefined ? r.targetId : r.TargetId);
          const rawTargetType = r.targetType !== undefined ? r.targetType : r.TargetType;
          const isExcluded = Boolean(r.isExcluded !== undefined ? r.isExcluded : r.IsExcluded);

          let tType = String(rawTargetType || '').toLowerCase().trim();
          if (rawTargetType === 0 || rawTargetType === '0') tType = 'product';
          else if (rawTargetType === 1 || rawTargetType === '1') tType = 'category';
          else if (rawTargetType === 2 || rawTargetType === '2') tType = 'subcategory';
          else if (rawTargetType === 3 || rawTargetType === '3') tType = 'brand';
          else if (rawTargetType === 4 || rawTargetType === '4') tType = 'perfumecategory';

          let match = false;
          // Match candidate product IDs for single-product target rules
          if ((tType === 'product' || tType.includes('prod') || tType === '0') && (candidateProdIds.includes(targetId) || (prodId > 0 && prodId === targetId))) {
            match = true;
          }
          if ((tType === 'category' || tType.includes('cat') || tType === '1') && catId > 0 && catId === targetId) {
            match = true;
          }
          if ((tType === 'subcategory' || tType.includes('subcat') || tType === '2') && subcatId > 0 && subcatId === targetId) {
            match = true;
          }
          if ((tType === 'brand' || tType.includes('brand') || tType === '3') && brandId > 0 && brandId === targetId) {
            match = true;
          }
          if ((tType === 'perfumecategory' || tType.includes('tier') || tType.includes('perfume') || tType === '4') && perfumeCatId > 0 && perfumeCatId === targetId) {
            match = true;
          }

          if (match) {
            if (isExcluded) {
              isExplicitlyExcluded = true;
              break;
            } else {
              hasMatchingInclude = true;
            }
          }
        }

        const hasIncludeRules = rules.some(r => !(r.isExcluded !== undefined ? r.isExcluded : r.IsExcluded));
        if (isExplicitlyExcluded || (!hasMatchingInclude && hasIncludeRules)) {
          isEligible = false;
        }
      }

      if (isEligible) {
        let finalPrice = basePrice;
        let discountPercent = 0;
        const isFixed = promo.discountType === 1 || String(promo.discountType || '').toLowerCase() === 'fixed';
        const val = Number(promo.discountValue !== undefined ? promo.discountValue : (promo.DiscountValue || 0));

        if (!isFixed && val > 0) {
          discountPercent = val;
          finalPrice = Math.max(1, Math.round(basePrice * (1 - discountPercent / 100) * 100) / 100);
        } else if (isFixed && val > 0) {
          finalPrice = Math.max(1, Math.round((basePrice - val) * 100) / 100);
          discountPercent = Math.round(((basePrice - finalPrice) / basePrice) * 100);
        }

        const savings = Math.max(0, Math.round((basePrice - finalPrice) * 100) / 100);

        // Keep the BIGGER active promotion (maximum savings / discount)
        if (finalPrice < basePrice && savings > 0) {
          if (!bestPromo || savings > bestPromo.savings) {
            bestPromo = {
              hasPromotion: true,
              promotionName: promo.name || promo.Name,
              promotionId: promo.id || promo.Id,
              discountType: isFixed ? 'Fixed' : 'Percentage',
              discountValue: val,
              discountPercent,
              price: finalPrice,
              originalPrice: basePrice,
              savings
            };
          }
        }
      }
    }

    if (bestPromo) {
      return bestPromo;
    }

    return {
      hasPromotion: false,
      discountPercent: product.discountPercent || 0,
      price: Number(product.price || 0),
      originalPrice: product.originalPrice || null
    };
  },

  // ==========================================
  // 5. PUBLIC STOREFRONT PROMOTIONS & BUNDLES
  // ==========================================

  /**
   * Get active public promotions (GET /api/promotions)
   */
  async getPublicPromotions(params = {}) {
    try {
      const res = await promotionApi.getPromotions(params);
      const raw = res?.items || (Array.isArray(res) ? res : []);
      return raw.filter(isPromotionActive);
    } catch (err) {
      console.warn('[promotionService] Error fetching public promotions:', err.message);
      return [];
    }
  },

  /**
   * Get active public bundles with items and savings (GET /api/promotions/bundles)
   */
  async getPublicBundles(params = {}) {
    try {
      const res = await promotionApi.getBundles(params);
      return Array.isArray(res) ? res : [];
    } catch (err) {
      console.warn('[promotionService] Error fetching public bundles:', err.message);
      return [];
    }
  },

  /**
   * Get public promotion details by ID (GET /api/promotions/{id})
   */
  async getPublicPromotionById(id) {
    try {
      return await promotionApi.getPromotionById(id);
    } catch (err) {
      console.warn(`[promotionService] Error fetching public promotion #${id}:`, err.message);
      return null;
    }
  },

  /**
   * Get public bundle by ID (looks in active bundles, or fallback suites)
   */
  async getPublicBundleById(bundleId) {
    if (!bundleId) return null;
    const searchIdStr = String(bundleId).trim();
    const searchIdNum = Number(bundleId);

    try {
      const bundles = await this.getPublicBundles();
      const match = bundles.find(b => String(b.id) === searchIdStr || (searchIdNum > 0 && Number(b.id) === searchIdNum));
      if (match) return match;
    } catch (err) {
      console.warn(`[promotionService] Error fetching bundle by ID #${bundleId}:`, err.message);
    }

    // Check if promotion details have bundles
    if (!isNaN(searchIdNum) && searchIdNum > 0) {
      try {
        const promo = await this.getPublicPromotionById(searchIdNum);
        if (promo?.bundles && promo.bundles.length > 0) {
          const bMatch = promo.bundles.find(b => String(b.id) === searchIdStr || Number(b.id) === searchIdNum) || promo.bundles[0];
          if (bMatch) return bMatch;
        }
      } catch {
        // ignore
      }
    }

    return null;
  }
};

export default promotionService;

