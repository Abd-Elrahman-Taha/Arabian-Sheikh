import apiClient from './client';
import ENDPOINTS from './endpoints';
import { normalizeObjectKeys } from './normalizers';

export const cartApi = {
  async getCart() {
    const response = await apiClient.get(ENDPOINTS.CART.GET);
    return normalizeObjectKeys(response?.cart || response?.data || response);
  },

  async syncCart(cartState) {
    const response = await apiClient.post(ENDPOINTS.CART.SYNC, { cart: cartState });
    return normalizeObjectKeys(response?.cart || response?.data || response);
  },

  async addItem(product, size, quantity) {
    const response = await apiClient.post(ENDPOINTS.CART.ADD_ITEM, {
      productId: product.id,
      size,
      quantity
    });
    return normalizeObjectKeys(response?.cart || response?.data || response);
  },

  async updateItem(productId, size, quantity) {
    const response = await apiClient.put(ENDPOINTS.CART.UPDATE_ITEM, {
      productId,
      size,
      quantity
    });
    return normalizeObjectKeys(response?.cart || response?.data || response);
  },

  async removeItem(productId, size) {
    const response = await apiClient.delete(ENDPOINTS.CART.REMOVE_ITEM(productId, size));
    return normalizeObjectKeys(response?.cart || response?.data || response);
  },

  async clearCart() {
    const response = await apiClient.post(ENDPOINTS.CART.CLEAR);
    return normalizeObjectKeys(response?.cart || response?.data || response);
  }
};

export default cartApi;
