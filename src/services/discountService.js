import { discountApi } from '../api/discount.api';

let cachedCoupons = [];

export const discountService = {
  getAllDiscountsSync() {
    return cachedCoupons;
  },

  async getAllDiscounts() {
    try {
      const response = await discountApi.adminGetCoupons();
      const items = response?.items || (Array.isArray(response) ? response : []);
      cachedCoupons = items.map(c => ({
        id: c.id,
        code: c.code,
        type: (c.type || c.discountType || 'percentage').toLowerCase(),
        value: c.value || c.discountValue || 0,
        minSpend: c.minOrderAmount || c.minSpend || 0,
        description: c.description || c.name || '',
        validUntil: c.endDate || c.validUntil || '',
        usedCount: c.usageCount || c.usedCount || 0,
        status: c.isActive !== false ? 'ACTIVE' : 'INACTIVE',
        isActive: c.isActive !== false
      }));
      return cachedCoupons;
    } catch (err) {
      console.warn('Failed to fetch coupons from API:', err.message);
      return cachedCoupons;
    }
  },

  async validateCode(codeStr, subtotal = 0) {
    if (!codeStr) throw new Error('Please enter a promotional code');
    try {
      return await discountApi.validateCoupon(codeStr, subtotal);
    } catch (e) {
      throw e;
    }
  },

  async createDiscount(discountData) {
    try {
      const payload = {
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
      };
      const result = await discountApi.adminCreateCoupon(payload);
      cachedCoupons = []; // clear cache so next fetch gets fresh data
      return result;
    } catch (e) {
      console.warn('API create coupon error:', e.message);
      throw e;
    }
  },

  async updateDiscount(code, updateData) {
    // Find the coupon in cache to get its ID
    const existing = cachedCoupons.find(c => c.code === code);
    if (existing?.id) {
      try {
        await discountApi.adminUpdateCoupon(existing.id, updateData);
        cachedCoupons = [];
      } catch (e) {
        console.warn('API update coupon error:', e.message);
        throw e;
      }
    } else {
      throw new Error('Coupon not found');
    }
  },

  async deleteDiscount(codeOrId) {
    // Find the coupon in cache to get its ID
    const numId = Number(codeOrId);
    let targetId = null;
    if (!isNaN(numId) && numId > 0) {
      targetId = numId;
    } else {
      const existing = cachedCoupons.find(c => c.code === codeOrId);
      targetId = existing?.id;
    }

    if (targetId) {
      try {
        await discountApi.adminDeactivateCoupon(targetId);
        cachedCoupons = cachedCoupons.filter(c => c.id !== targetId && c.code !== codeOrId);
        return true;
      } catch (e) {
        console.warn('API deactivate coupon error:', e.message);
        throw e;
      }
    }
    // Remove from local cache anyway
    cachedCoupons = cachedCoupons.filter(c => c.code !== codeOrId);
    return true;
  }
};

export default discountService;
