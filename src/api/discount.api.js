import apiClient from './client';
import ENDPOINTS from './endpoints';
import { normalizeObjectKeys } from './normalizers';

export const discountApi = {
  async validateCoupon(code, subtotal) {
    const response = await apiClient.post(ENDPOINTS.DISCOUNTS.VALIDATE, { code, subtotal });
    return normalizeObjectKeys(response?.discount || response?.data || response);
  },

  async getDiscounts() {
    const response = await apiClient.get(ENDPOINTS.DISCOUNTS.LIST);
    const rawList = Array.isArray(response) ? response : (response?.discounts || response?.data || []);
    return rawList.map(normalizeObjectKeys);
  },

  async createDiscount(discountPayload) {
    const response = await apiClient.post(ENDPOINTS.DISCOUNTS.CREATE, discountPayload);
    return normalizeObjectKeys(response?.discount || response?.data || response);
  },

  async deleteDiscount(id) {
    const response = await apiClient.delete(ENDPOINTS.DISCOUNTS.DELETE(id));
    return response?.success || true;
  }
};

export default discountApi;
