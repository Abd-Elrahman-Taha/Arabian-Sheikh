import { discountApi } from '../api/discount.api';

export const discountService = {
  // ==========================================
  // 1. ADMIN COUPON METHODS
  // ==========================================

  /**
   * Get paginated, filtered, sorted coupons list
   */
  async getCoupons(params = {}) {
    return await discountApi.adminGetCoupons(params);
  },

  /**
   * Get single coupon details with applicability rules
   */
  async getCouponById(id) {
    return await discountApi.adminGetCouponById(id);
  },

  /**
   * Create new coupon
   */
  async createCoupon(couponData) {
    return await discountApi.adminCreateCoupon(couponData);
  },

  /**
   * Update existing coupon
   */
  async updateCoupon(id, couponData) {
    return await discountApi.adminUpdateCoupon(id, couponData);
  },

  /**
   * Delete coupon
   */
  async deleteCoupon(id) {
    return await discountApi.adminDeleteCoupon(id);
  },

  /**
   * Activate coupon
   */
  async activateCoupon(id) {
    return await discountApi.adminActivateCoupon(id);
  },

  /**
   * Deactivate coupon
   */
  async deactivateCoupon(id) {
    return await discountApi.adminDeactivateCoupon(id);
  },

  /**
   * Get coupon analytics
   */
  async getCouponAnalytics(id) {
    return await discountApi.adminGetCouponAnalytics(id);
  },

  // ==========================================
  // 2. STOREFRONT & BACKWARD-COMPATIBILITY METHODS
  // ==========================================

  async getAllDiscounts() {
    try {
      const res = await discountApi.adminGetCoupons({ page: 1, pageSize: 100 });
      return res.items || [];
    } catch (err) {
      console.warn('Failed to load coupons from API:', err.message);
      return [];
    }
  },

  getAllDiscountsSync() {
    return [];
  },

  /**
   * Validate coupon code for shopping cart
   * Handles remote API validation and client-side fallback if backend cart is awaiting sync
   */
  async validateCode(codeStr, subtotal = 0, items = []) {
    if (!codeStr || !codeStr.trim()) {
      throw new Error('Please enter a privilege code.');
    }
    const cleanCode = codeStr.toUpperCase().trim();

    // Check if cart is empty before proceeding
    const totalItemsCount = Array.isArray(items) ? items.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0) : 0;
    if (totalItemsCount === 0 && subtotal <= 0) {
      throw new Error('Your shopping bag is empty. Please add a flacon before applying a code.');
    }

    try {
      // 1. Try remote validation endpoint
      const remote = await discountApi.validateCoupon(cleanCode);
      if (remote && remote.valid) {
        return {
          code: remote.code || cleanCode,
          type: (remote.type || 'percentage').toLowerCase(),
          value: Number(remote.value) || 0,
          discountAmount: Number(remote.discountAmount) || 0,
          message: remote.message || 'Privilege code applied successfully.'
        };
      }

      // If remote returned 'Cart is empty.' but the client has items in bag,
      // fallback to validating against the coupon definitions directly
      if (remote?.message?.toLowerCase()?.includes('cart is empty') && (totalItemsCount > 0 || subtotal > 0)) {
        return await this._evaluateCouponLocally(cleanCode, subtotal, items);
      }

      throw new Error(remote?.message || 'Invalid or expired privilege code.');
    } catch (err) {
      // If error is specifically 'Cart is empty' from API and client cart is not empty, evaluate locally
      if (err.message?.toLowerCase()?.includes('cart is empty') && (totalItemsCount > 0 || subtotal > 0)) {
        return await this._evaluateCouponLocally(cleanCode, subtotal, items);
      }
      throw err;
    }
  },

  /**
   * Internal helper to evaluate coupon rules when backend cart sync is pending
   */
  async _evaluateCouponLocally(codeStr, subtotal = 0, items = []) {
    try {
      const searchRes = await discountApi.adminGetCoupons({ search: codeStr, page: 1, pageSize: 20 });
      const found = (searchRes?.items || []).find(c => c.code?.toUpperCase() === codeStr.toUpperCase());
      
      if (!found) {
        throw new Error(`Privilege code '${codeStr}' was not found.`);
      }

      if (found.isActive === false) {
        throw new Error(`Privilege code '${found.code}' is currently inactive.`);
      }

      const now = new Date();
      if (found.startDate && new Date(found.startDate) > now) {
        throw new Error(`Privilege code '${found.code}' is not active yet.`);
      }

      if (found.endDate && new Date(found.endDate) < now) {
        throw new Error(`Privilege code '${found.code}' has expired.`);
      }

      if (found.usageLimit !== null && found.usageCount >= found.usageLimit) {
        throw new Error(`Privilege code '${found.code}' usage limit has been reached.`);
      }

      if (found.minOrderAmount > 0 && subtotal < found.minOrderAmount) {
        throw new Error(`Minimum spend of €${found.minOrderAmount.toFixed(2)} required for coupon '${found.code}'.`);
      }

      // Calculate discount amount
      const isPercentage = (found.type || 'percentage').toLowerCase() === 'percentage';
      let discountAmount = 0;
      if (isPercentage) {
        discountAmount = Math.round((subtotal * (Number(found.value) || 0)) / 100);
        if (found.maxDiscountAmount > 0 && discountAmount > found.maxDiscountAmount) {
          discountAmount = found.maxDiscountAmount;
        }
      } else {
        discountAmount = Math.min(subtotal, Number(found.value) || 0);
      }

      return {
        code: found.code,
        type: isPercentage ? 'percentage' : 'fixed',
        value: Number(found.value) || 0,
        discountAmount,
        message: `Privilege code '${found.code}' applied.`
      };
    } catch (evalErr) {
      throw evalErr;
    }
  },

  async createDiscount(discountData) {
    return await this.createCoupon({
      code: (discountData.code || '').toUpperCase().trim(),
      type: discountData.type === 'fixed' ? 'Fixed' : 'Percentage',
      value: Number(discountData.value) || 0,
      startDate: new Date().toISOString(),
      endDate: discountData.validUntil ? new Date(discountData.validUntil).toISOString() : '2027-12-31T23:59:59Z',
      minOrderAmount: Number(discountData.minSpend) || 0,
      maxDiscountAmount: null,
      allowOnDiscountedItems: true,
      isActive: true,
      applicability: []
    });
  },

  async deleteDiscount(codeOrId) {
    const numId = Number(codeOrId);
    if (!isNaN(numId) && numId > 0) {
      return await this.deleteCoupon(numId);
    }
    return true;
  }
};

export default discountService;
