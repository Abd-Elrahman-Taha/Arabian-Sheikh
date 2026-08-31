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

  async validateCode(codeStr, subtotal = 0) {
    if (!codeStr) throw new Error('Please enter a promotional code');
    const cleanCode = codeStr.toUpperCase().trim();

    try {
      const remote = await discountApi.validateCoupon(cleanCode);
      if (remote && remote.valid) {
        return {
          code: remote.code,
          type: remote.type.toLowerCase(),
          value: remote.value,
          discountAmount: remote.discountAmount,
          message: remote.message
        };
      }
      throw new Error(remote?.message || 'Invalid or expired privilege code.');
    } catch (e) {
      throw e;
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
