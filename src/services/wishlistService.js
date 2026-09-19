import { wishlistApi, normalizeWishlistItem } from '../api/wishlist.api';
import { tokenManager } from '../api/client';

const WISHLIST_STORAGE_KEY = 'arabian_sheikh_wishlist';

function loadLocalWishlist() {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(WISHLIST_STORAGE_KEY);
  if (!data) return [];
  try {
    const list = JSON.parse(data);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveLocalWishlist(items) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export const wishlistService = {
  /**
   * Fetch customer wishlist from live backend API with local cache fallback
   */
  async getWishlist() {
    const token = tokenManager.getToken(false);
    if (!token) {
      return loadLocalWishlist();
    }

    try {
      const items = await wishlistApi.getWishlist();
      if (Array.isArray(items)) {
        saveLocalWishlist(items);
        return items;
      }
      return loadLocalWishlist();
    } catch (err) {
      console.warn('[wishlistService] Live API getWishlist fallback to local storage:', err.message);
      return loadLocalWishlist();
    }
  },

  /**
   * Add product to wishlist via backend POST /api/wishlist/items
   */
  async addItem(productId) {
    const numId = Number(productId);
    const token = tokenManager.getToken(false);

    if (token && !isNaN(numId) && numId > 0) {
      try {
        const added = await wishlistApi.addItem(numId);
        const current = loadLocalWishlist();
        const filtered = current.filter(item => Number(item.productId || item.id) !== numId);
        const updated = [added, ...filtered];
        saveLocalWishlist(updated);
        return added;
      } catch (err) {
        console.error('[wishlistService] Failed to add item via API:', err);
        throw err;
      }
    }

    // Local fallback for guest
    const current = loadLocalWishlist();
    const existing = current.find(item => Number(item.productId || item.id) === numId);
    if (!existing) {
      const newItem = { id: Date.now(), productId: numId, isActive: true, createdAt: new Date().toISOString() };
      const updated = [newItem, ...current];
      saveLocalWishlist(updated);
      return newItem;
    }
    return existing;
  },

  /**
   * Remove item from wishlist via backend DELETE /api/wishlist/items/{productId}
   */
  async removeItem(productId) {
    const numId = Number(productId);
    const token = tokenManager.getToken(false);

    if (token && !isNaN(numId) && numId > 0) {
      try {
        await wishlistApi.removeItem(numId);
      } catch (err) {
        console.warn('[wishlistService] Live API removeItem error:', err.message);
      }
    }

    const current = loadLocalWishlist();
    const updated = current.filter(item => {
      const pId = Number(item.productId || item.id);
      return pId !== numId && String(item.id) !== String(productId);
    });
    saveLocalWishlist(updated);
    return true;
  },

  /**
   * Move item from wishlist to cart via backend POST /api/wishlist/move-to-cart/{productId}
   */
  async moveToCart(productId) {
    const numId = Number(productId);
    const token = tokenManager.getToken(false);

    if (token && !isNaN(numId) && numId > 0) {
      try {
        const res = await wishlistApi.moveToCart(numId);
        // Clean from local wishlist
        await this.removeItem(numId);
        return res;
      } catch (err) {
        console.error('[wishlistService] Failed to move to cart via API:', err);
        throw err;
      }
    }
    throw new Error('Authentication required to move wishlist item to cart.');
  },

  /**
   * Check if a product ID exists in local cached wishlist
   */
  isInWishlistSync(productId) {
    const list = loadLocalWishlist();
    const numId = Number(productId);
    return list.some(item => {
      const pId = Number(item.productId || item.id);
      return (!isNaN(numId) && pId === numId) || String(item.productId) === String(productId) || String(item.id) === String(productId);
    });
  },

  /**
   * Clear cached wishlist
   */
  clearWishlist() {
    saveLocalWishlist([]);
    return [];
  }
};

export default wishlistService;
