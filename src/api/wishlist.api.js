import apiClient from './client';
import ENDPOINTS from './endpoints';
import { normalizeObjectKeys } from './normalizers';

export const wishlistApi = {
  /**
   * Get Customer Wishlist
   * GET /api/wishlist
   */
  async getWishlist(page = 1, pageSize = 50) {
    const response = await apiClient.get(ENDPOINTS.WISHLIST.GET, {
      params: { page, pageSize }
    });
    const items = response?.items || (Array.isArray(response) ? response : []);
    return items.map(normalizeObjectKeys);
  },

  /**
   * Add Item to Wishlist
   * POST /api/wishlist/items
   */
  async addItem(productId) {
    const response = await apiClient.post(ENDPOINTS.WISHLIST.ADD, {
      productId: Number(productId)
    });
    return normalizeObjectKeys(response);
  },

  /**
   * Remove Item from Wishlist
   * DELETE /api/wishlist/items/{productId}
   */
  async removeItem(productId) {
    await apiClient.delete(ENDPOINTS.WISHLIST.REMOVE(productId));
    return true;
  },

  /**
   * Move Item to Cart
   * POST /api/wishlist/move-to-cart/{productId}
   */
  async moveToCart(productId) {
    const response = await apiClient.post(ENDPOINTS.WISHLIST.MOVE_TO_CART(productId));
    return normalizeObjectKeys(response);
  }
};

export default wishlistApi;
