import { INITIAL_DISCOUNTS } from './mockData';

const DISCOUNTS_STORAGE_KEY = 'arabian_sheikh_discounts';

function loadDiscounts() {
  const data = localStorage.getItem(DISCOUNTS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(DISCOUNTS_STORAGE_KEY, JSON.stringify(INITIAL_DISCOUNTS));
    return INITIAL_DISCOUNTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_DISCOUNTS;
  }
}

function saveDiscounts(discounts) {
  localStorage.setItem(DISCOUNTS_STORAGE_KEY, JSON.stringify(discounts));
}

export const discountService = {
  async getAllDiscounts() {
    return loadDiscounts();
  },

  async validateCode(codeStr, subtotal = 0) {
    if (!codeStr) throw new Error('Please enter a promotional code');
    const discounts = loadDiscounts();
    const discount = discounts.find(
      d => d.code.toUpperCase() === codeStr.toUpperCase().trim() && d.status === 'ACTIVE'
    );

    if (!discount) {
      throw new Error('Invalid or expired privilege code.');
    }

    if (discount.minSpend && subtotal < discount.minSpend) {
      throw new Error(`This privilege code requires a minimum spend of $${discount.minSpend}.`);
    }

    return discount;
  },

  async createDiscount(discountData) {
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
    let discounts = loadDiscounts();
    discounts = discounts.filter(d => d.code !== code);
    saveDiscounts(discounts);
    return true;
  }
};
