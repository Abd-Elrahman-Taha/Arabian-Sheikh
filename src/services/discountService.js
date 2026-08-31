import { discountApi } from '../api/discount.api';

/**
 * Calculates live usage statistics for coupons from placed store orders
 */
function getLiveCouponStats() {
  const stats = new Map(); // code -> { count, totalDiscount }
  if (typeof window === 'undefined') return stats;

  try {
    const rawOrders = localStorage.getItem('arabian_sheikh_orders');
    const orders = rawOrders ? JSON.parse(rawOrders) : [];

    const rawCloud = localStorage.getItem('arabian_sheikh_live_cloud_orders');
    const cloudOrders = rawCloud ? JSON.parse(rawCloud) : [];

    const combined = [...(Array.isArray(orders) ? orders : []), ...(Array.isArray(cloudOrders) ? cloudOrders : [])];
    const seenOrderIds = new Set();

    combined.forEach(o => {
      if (!o?.id || seenOrderIds.has(String(o.id))) return;
      seenOrderIds.add(String(o.id));

      const code = (o.discountCode || o.couponCode || '').toUpperCase().trim();
      if (code) {
        const prev = stats.get(code) || { count: 0, totalDiscount: 0 };
        prev.count += 1;
        prev.totalDiscount += Number(o.discountAmount || o.discount || 0);
        stats.set(code, prev);
      }
    });
  } catch (e) {
    // Non-blocking
  }
  return stats;
}

export const discountService = {
  // ==========================================
  // 1. ADMIN COUPON METHODS
  // ==========================================

  /**
   * Get paginated, filtered, sorted coupons list
   */
  async getCoupons(params = {}) {
    const res = await discountApi.adminGetCoupons(params);
    const liveStats = getLiveCouponStats();

    if (Array.isArray(res?.items)) {
      res.items = res.items.map(c => {
        const code = (c.code || '').toUpperCase().trim();
        const stat = liveStats.get(code);
        const orderUsage = stat ? stat.count : 0;
        const totalUsed = Math.max(Number(c.usageCount || 0), orderUsage);

        let status = c.status;
        if (c.usageLimit !== null && c.usageLimit !== undefined && totalUsed >= c.usageLimit) {
          status = 'Depleted';
        }

        return {
          ...c,
          usageCount: totalUsed,
          usedCount: totalUsed,
          status
        };
      });
    }

    return res;
  },

  /**
   * Get single coupon details with applicability rules
   */
  async getCouponById(id) {
    const coupon = await discountApi.adminGetCouponById(id);
    if (coupon) {
      const code = (coupon.code || '').toUpperCase().trim();
      const liveStats = getLiveCouponStats();
      const stat = liveStats.get(code);
      const orderUsage = stat ? stat.count : 0;
      const totalUsed = Math.max(Number(coupon.usageCount || 0), orderUsage);

      let status = coupon.status;
      if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && totalUsed >= coupon.usageLimit) {
        status = 'Depleted';
      }

      return {
        ...coupon,
        usageCount: totalUsed,
        usedCount: totalUsed,
        status
      };
    }
    return coupon;
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
    let apiAnalytics = null;
    try {
      apiAnalytics = await discountApi.adminGetCouponAnalytics(id);
    } catch (e) {
      // Non-blocking
    }

    const coupon = await this.getCouponById(id).catch(() => null);
    const code = (coupon?.code || '').toUpperCase().trim();
    const liveStats = getLiveCouponStats();
    const stat = code ? liveStats.get(code) : null;

    const totalOrders = Math.max(
      Number(apiAnalytics?.totalOrders || 0),
      stat ? stat.count : 0,
      Number(coupon?.usageCount || 0)
    );

    const totalDiscountGiven = Math.max(
      Number(apiAnalytics?.totalDiscountGiven || 0),
      stat ? stat.totalDiscount : 0
    );

    return {
      couponId: Number(id),
      code: code || apiAnalytics?.code || '',
      totalOrders,
      totalDiscountGiven
    };
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
