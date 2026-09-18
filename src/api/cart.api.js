import apiClient from './client';
import ENDPOINTS from './endpoints';
import { normalizeCart } from './normalizers';

export const cartApi = {
  /**
   * Get Shopping Cart
   * GET /api/cart
   */
  async getCart() {
    if (import.meta.env.DEV) {
      console.log('[Cart] Fetching backend cart');
    }
    try {
      const response = await apiClient.get(ENDPOINTS.CART.GET);
      if (import.meta.env.DEV) {
        console.log('[Cart] Backend cart fetched successfully:', response);
      }
      return normalizeCart(response);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[Cart] API error fetching cart:', err);
      }
      throw err;
    }
  },

  /**
   * Clear Shopping Cart
   * DELETE /api/cart
   */
  async clearCart() {
    if (import.meta.env.DEV) {
      console.log('[Cart] Clearing backend cart');
    }
    try {
      await apiClient.delete(ENDPOINTS.CART.CLEAR);
      return true;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[Cart] API error clearing cart:', err);
      }
      throw err;
    }
  },

  /**
   * Add Item to Cart
   * POST /api/cart/items
   */
  async addItem(productId, quantity = 1) {
    const numId = Number(productId);
    const qty = Number(quantity);
    if (import.meta.env.DEV) {
      console.log('[Cart] Adding item', { productId: numId, quantity: qty });
    }
    try {
      const response = await apiClient.post(ENDPOINTS.CART.ADD_ITEM, {
        productId: numId,
        quantity: qty
      });
      if (import.meta.env.DEV) {
        console.log('[Cart] Item added successfully, updated cart:', response);
      }
      return normalizeCart(response);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[Cart] API error adding item:', err);
      }
      throw err;
    }
  },

  /**
   * Update Cart Item Quantity
   * PUT /api/cart/items/{itemId}
   */
  async updateItem(itemId, quantity) {
    const qty = Number(quantity);
    if (import.meta.env.DEV) {
      console.log('[Cart] Updating item', { itemId, quantity: qty });
    }
    try {
      const response = await apiClient.put(ENDPOINTS.CART.UPDATE_ITEM(itemId), {
        quantity: qty
      });
      if (import.meta.env.DEV) {
        console.log('[Cart] Item updated successfully, updated cart:', response);
      }
      return normalizeCart(response);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[Cart] API error updating item:', err);
      }
      throw err;
    }
  },

  /**
   * Remove Item from Cart
   * DELETE /api/cart/items/{itemId}
   */
  async removeItem(itemId) {
    if (import.meta.env.DEV) {
      console.log('[Cart] Removing item', { itemId });
    }
    try {
      const response = await apiClient.delete(ENDPOINTS.CART.REMOVE_ITEM(itemId));
      if (response && response.items) {
        return normalizeCart(response);
      }
      // If DELETE only returned success, refetch fresh cart
      return await this.getCart();
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[Cart] API error removing item:', err);
      }
      throw err;
    }
  },

  /**
   * Remove Applied Coupon from Cart
   * DELETE /api/cart/coupon
   */
  async removeCoupon() {
    if (import.meta.env.DEV) {
      console.log('[Cart] Removing coupon from cart');
    }
    try {
      await apiClient.delete(ENDPOINTS.CART.REMOVE_COUPON);
      return true;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[Cart] API error removing coupon:', err);
      }
      throw err;
    }
  },

  /**
   * Synchronize local cart items to backend cart before requesting quotes/checkout
   * @param {Array} items
   */
  async syncCart(items) {
    if (!Array.isArray(items) || items.length === 0) return null;
    try {
      const currentCart = await this.getCart().catch(() => null);
      const existingItems = currentCart?.items || [];

      for (const item of items) {
        const productId = item.productId || item.id;
        if (!productId || isNaN(Number(productId))) continue;
        const numId = Number(productId);
        const qty = Math.max(1, Number(item.quantity) || 1);

        const existing = existingItems.find(ei => Number(ei.productId) === numId);
        if (existing) {
          if (existing.id && existing.quantity !== qty) {
            await this.updateItem(existing.id, qty).catch(() => {});
          }
        } else {
          await this.addItem(numId, qty).catch(() => {});
        }
      }

      return await this.getCart().catch(() => null);
    } catch (err) {
      console.warn('[CartApi] Sync cart notice:', err?.message || err);
      return null;
    }
  }
};

export default cartApi;
