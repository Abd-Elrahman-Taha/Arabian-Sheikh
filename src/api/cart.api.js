import apiClient from './client';
import ENDPOINTS from './endpoints';
import { normalizeCart } from './normalizers';

export const cartApi = {
  /**
   * Get Shopping Cart
   * GET /api/cart
   */
  async getCart() {
    const response = await apiClient.get(ENDPOINTS.CART.GET);
    return normalizeCart(response);
  },

  /**
   * Clear Shopping Cart
   * DELETE /api/cart
   */
  async clearCart() {
    await apiClient.delete(ENDPOINTS.CART.CLEAR);
    return true;
  },

  /**
   * Add Item to Cart
   * POST /api/cart/items
   */
  async addItem(productId, quantity = 1) {
    const response = await apiClient.post(ENDPOINTS.CART.ADD_ITEM, {
      productId: Number(productId),
      quantity: Number(quantity)
    });
    return normalizeCart(response);
  },

  /**
   * Update Cart Item Quantity
   * PUT /api/cart/items/{itemId}
   */
  async updateItem(itemId, quantity) {
    const response = await apiClient.put(ENDPOINTS.CART.UPDATE_ITEM(itemId), {
      quantity: Number(quantity)
    });
    return normalizeCart(response);
  },

  /**
   * Remove Item from Cart
   * DELETE /api/cart/items/{itemId}
   */
  async removeItem(itemId) {
    await apiClient.delete(ENDPOINTS.CART.REMOVE_ITEM(itemId));
    return true;
  },

  /**
   * Remove Applied Coupon from Cart
   * DELETE /api/cart/coupon
   */
  async removeCoupon() {
    await apiClient.delete(ENDPOINTS.CART.REMOVE_COUPON);
    return true;
  }
};

export default cartApi;
