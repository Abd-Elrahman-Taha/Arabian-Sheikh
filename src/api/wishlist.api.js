import apiClient from './client';
import ENDPOINTS from './endpoints';
import { normalizeObjectKeys } from './normalizers';

/**
 * Normalizes a Wishlist item matching the backend contract:
 * { id, productId, productName, price, currency, imageUrl, isActive, createdAt }
 */
export function normalizeWishlistItem(raw) {
  if (!raw) return null;
  const item = normalizeObjectKeys(raw);
  const id = Number(item.id);
  const productId = Number(item.productId);
  const img = item.imageUrl || item.image || item.cutoutImage || '';

  return {
    id: !isNaN(id) ? id : item.id,
    productId: !isNaN(productId) ? productId : item.productId,
    productName: item.productName || item.name || '',
    name: item.productName || item.name || '',
    price: item.price !== undefined && item.price !== null ? Number(item.price) : 0,
    currency: item.currency || 'EUR',
    imageUrl: img,
    image: img,
    images: [img].filter(Boolean),
    cutoutImage: img,
    isActive: item.isActive !== false,
    createdAt: item.createdAt || new Date().toISOString()
  };
}

export const wishlistApi = {
  /**
   * Get Customer Wishlist
   * GET /api/wishlist
   * Requires JWT Bearer token
   */
  async getWishlist() {
    const response = await apiClient.get(ENDPOINTS.WISHLIST.GET);
    const rawList = Array.isArray(response) ? response : (response?.items || []);
    return rawList.map(normalizeWishlistItem).filter(Boolean);
  },

  /**
   * Add Item to Wishlist
   * POST /api/wishlist/items
   * Body: { productId: number }
   */
  async addItem(productId) {
    const numId = Number(productId);
    if (!numId || isNaN(numId)) throw new Error('Valid numeric Product ID is required.');
    
    const response = await apiClient.post(ENDPOINTS.WISHLIST.ADD, {
      productId: numId
    });
    return normalizeWishlistItem(response);
  },

  /**
   * Remove Item from Wishlist
   * DELETE /api/wishlist/items/{productId}
   */
  async removeItem(productId) {
    const numId = Number(productId);
    if (!numId || isNaN(numId)) throw new Error('Valid numeric Product ID is required.');

    await apiClient.delete(ENDPOINTS.WISHLIST.REMOVE(numId));
    return true;
  },

  /**
   * Move Item to Cart
   * POST /api/wishlist/move-to-cart/{productId}
   */
  async moveToCart(productId) {
    const numId = Number(productId);
    if (!numId || isNaN(numId)) throw new Error('Valid numeric Product ID is required.');

    const response = await apiClient.post(ENDPOINTS.WISHLIST.MOVE_TO_CART(numId));
    return normalizeObjectKeys(response);
  }
};

export default wishlistApi;
