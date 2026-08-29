import { discountApi } from '../api/discount.api';
import { INITIAL_DISCOUNTS } from './mockData';

const DISCOUNTS_STORAGE_KEY = 'arabian_sheikh_discounts';
let inMemoryDiscounts = null;

function loadDiscounts() {
  if (inMemoryDiscounts && inMemoryDiscounts.length > 0) {
    return inMemoryDiscounts;
  }
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(DISCOUNTS_STORAGE_KEY);
      if (raw) {
        inMemoryDiscounts = JSON.parse(raw);
        return inMemoryDiscounts;
      }
    } catch {}
  }
  inMemoryDiscounts = [...(INITIAL_DISCOUNTS || [])];
  return inMemoryDiscounts;
}

function saveDiscounts(list) {
  inMemoryDiscounts = list;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(DISCOUNTS_STORAGE_KEY, JSON.stringify(list));
    } catch {}
  }
}

export const discountService = {
  getAllDiscountsSync() {
    return loadDiscounts();
  },

  async getAllDiscounts() {
    const localList = loadDiscounts();
    try {
      const response = await discountApi.adminGetCoupons();
      const items = response?.items || (Array.isArray(response) ? response : []);
      if (items.length > 0) {
        const mapped = items.map(c => ({
          id: c.id,
          code: c.code,
          type: (c.type || c.discountType || 'percentage').toLowerCase(),
          value: c.value || c.discountValue || 0,
          minSpend: c.minOrderAmount || c.minSpend || 0,
          description: c.description || c.name || '',
          validUntil: c.endDate ? c.endDate.split('T')[0] : (c.validUntil || '2027-12-31'),
          usedCount: c.usageCount || c.usedCount || 0,
          status: c.isActive !== false ? 'ACTIVE' : 'INACTIVE',
          isActive: c.isActive !== false
        }));
        saveDiscounts(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Coupons API sync (using cached/stored coupons):', err.message);
    }
    return localList;
  },

  async validateCode(codeStr, subtotal = 0) {
    if (!codeStr) throw new Error('Please enter a promotional code');
    const cleanCode = codeStr.toUpperCase().trim();

    try {
      const remote = await discountApi.validateCoupon(cleanCode, subtotal);
      if (remote) return remote;
    } catch (e) {
      if (e.status === 400 || e.status === 404 || e.status === 422) {
        throw e;
      }
    }

    const discounts = loadDiscounts();
    const discount = discounts.find(
      d => d.code.toUpperCase() === cleanCode && (d.status === 'ACTIVE' || d.isActive !== false)
    );

    if (!discount) {
      throw new Error('Invalid or expired privilege code.');
    }

    if (discount.minSpend && subtotal < discount.minSpend) {
      throw new Error(`This privilege code requires a minimum spend of €${discount.minSpend}.`);
    }

    return discount;
  },

  async createDiscount(discountData) {
    const cleanCode = (discountData.code || '').toUpperCase().trim();
    if (!cleanCode) throw new Error('Code is required');

    const newDiscount = {
      id: `coupon-${Date.now()}`,
      code: cleanCode,
      type: discountData.type === 'fixed' ? 'fixed' : 'percentage',
      value: Number(discountData.value) || 0,
      minSpend: Number(discountData.minSpend) || 0,
      description: discountData.description || '',
      validUntil: discountData.validUntil || '2027-12-31',
      usedCount: 0,
      status: 'ACTIVE',
      isActive: true
    };

    // Attempt remote creation if API is reachable
    try {
      const payload = {
        code: cleanCode,
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
      await discountApi.adminCreateCoupon(payload);
    } catch (e) {
      console.warn('API coupon creation fallback to local store:', e.message);
    }

    const discounts = loadDiscounts().filter(d => d.code !== cleanCode);
    discounts.unshift(newDiscount);
    saveDiscounts(discounts);
    return newDiscount;
  },

  async updateDiscount(code, updateData) {
    const discounts = loadDiscounts();
    const index = discounts.findIndex(d => d.code === code);
    if (index > -1) {
      discounts[index] = { ...discounts[index], ...updateData };
      saveDiscounts(discounts);
    }
    return discounts[index] || null;
  },

  async deleteDiscount(codeOrId) {
    const discounts = loadDiscounts().filter(d => d.code !== codeOrId && d.id !== codeOrId);
    saveDiscounts(discounts);

    const numId = Number(codeOrId);
    if (!isNaN(numId) && numId > 0) {
      discountApi.adminDeactivateCoupon(numId).catch(() => {});
    }
    return true;
  }
};

export default discountService;
