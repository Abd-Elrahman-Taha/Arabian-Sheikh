import apiClient from './client';
import ENDPOINTS from './endpoints';

export const wishlistApi = {
  async getWishlist() {
    const response = await apiClient.get(ENDPOINTS.WISHLIST.GET);
    return response?.items || response?.wishlist || response?.data || [];
  },

  async syncWishlist(itemIds) {
    const response = await apiClient.post(ENDPOINTS.WISHLIST.SYNC, { itemIds });
    return response?.items || response?.wishlist || response?.data || [];
  },

  async toggleWishlist(productId) {
    const response = await apiClient.post(ENDPOINTS.WISHLIST.TOGGLE, { productId });
    return response?.items || response?.wishlist || response?.data || [];
  }
};

export default wishlistApi;
