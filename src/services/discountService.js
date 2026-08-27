import { INITIAL_DISCOUNTS } from './mockData';
import { discountApi } from '../api/discount.api';
import { apiClient } from '../api/client';

const DISCOUNTS_STORAGE_KEY = 'arabian_sheikh_discounts';
let inMemoryDiscounts = null;

function loadDiscounts() {
  if (inMemoryDiscounts && inMemoryDiscounts.length > 0) {
    return inMemoryDiscounts;
  }

  const data = typeof window !== 'undefined' ? localStorage.getItem(DISCOUNTS_STORAGE_KEY) : null;
  if (!data) {
    inMemoryDiscounts = [...INITIAL_DISCOUNTS];
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISCOUNTS_STORAGE_KEY, JSON.stringify(INITIAL_DISCOUNTS));
    }
    return inMemoryDiscounts;
  }
  try {
    inMemoryDiscounts = JSON.parse(data);
    return inMemoryDiscounts;
  } catch {
    inMemoryDiscounts = [...INITIAL_DISCOUNTS];
    return inMemoryDiscounts;
  }
}

function saveDiscounts(discounts) {
  inMemoryDiscounts = discounts;
  if (typeof window !== 'undefined') {
    localStorage.setItem(DISCOUNTS_STORAGE_KEY, JSON.stringify(discounts));
  }
}

export const discountService = {
  getAllDiscountsSync() {
    return loadDiscounts();
  },

  async getAllDiscounts() {
    const result = this.getAllDiscountsSync();

    if (!apiClient.isMockEnabled()) {
      discountApi.getDiscounts().then(remote => {
        if (Array.isArray(remote) && remote.length > 0) {
          saveDiscounts(remote);
        }
      }).catch(() => {});
    }

    return result;
  },

  async validateCode(codeStr, subtotal = 0) {
    if (!codeStr) throw new Error('Please enter a promotional code');

    if (!apiClient.isMockEnabled()) {
      try {
        return await discountApi.validateCoupon(codeStr, subtotal);
      } catch (e) {
        if (e.status === 400 || e.status === 404 || e.status === 422) {
          throw e;
        }
        console.warn('Real API validate coupon fallback:', e.message);
      }
    }

    const discounts = loadDiscounts();
    const discount = discounts.find(
      d => d.code.toUpperCase() === codeStr.toUpperCase().trim() && d.status === 'ACTIVE'
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
    if (!apiClient.isMockEnabled()) {
      try {
        return await discountApi.createDiscount(discountData);
      } catch (e) {
        console.warn('Real API create discount fallback:', e.message);
      }
    }

    const discounts = loadDiscounts();
    const cleanCode = discountData.code.toUpperCase().trim();

    if (discounts.some(d => d.code === cleanCode)) {
      throw new Error('A privilege code with this code already exists.');
    }

    const newDiscount = {
      ...discountData,
      code: cleanCode,
      status: discountData.status || 'ACTIVE',
      usedCount: 0,
      validUntil: discountData.validUntil || '2027-12-31'
    };

    discounts.unshift(newDiscount);
    saveDiscounts(discounts);
    return newDiscount;
  },

  async updateDiscount(code, updateData) {
    const discounts = loadDiscounts();
    const index = discounts.findIndex(d => d.code === code);
    if (index === -1) throw new Error('Privilege code not found');

    discounts[index] = { ...discounts[index], ...updateData };
    saveDiscounts(discounts);
    return discounts[index];
  },

  async deleteDiscount(code) {
    if (!apiClient.isMockEnabled()) {
      try {
        return await discountApi.deleteDiscount(code);
      } catch (e) {
        console.warn('Real API delete discount fallback:', e.message);
      }
    }

    let discounts = loadDiscounts();
    discounts = discounts.filter(d => d.code !== code);
    saveDiscounts(discounts);
    return true;
  }
};

export default discountService;
