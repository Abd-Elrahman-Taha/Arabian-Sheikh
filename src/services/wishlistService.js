const WISHLIST_STORAGE_KEY = 'arabian_sheikh_wishlist';

function loadWishlist() {
  const data = typeof window !== 'undefined' ? localStorage.getItem(WISHLIST_STORAGE_KEY) : null;
  if (!data) {
    return [];
  }
  try {
    const list = JSON.parse(data);
    if (!Array.isArray(list)) return [];
    // Remove legacy fake mock IDs if present
    const cleaned = list.filter(id => id !== 'as-oud-royal-01' && id !== 'as-amber-malaki-02');
    if (cleaned.length !== list.length && typeof window !== 'undefined') {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

function saveWishlist(items) {
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
}

export const wishlistService = {
  getWishlist() {
    return loadWishlist();
  },

  toggleWishlist(productId) {
    const list = loadWishlist();
    let updated;
    if (list.includes(productId)) {
      updated = list.filter(id => id !== productId);
    } else {
      updated = [productId, ...list];
    }
    saveWishlist(updated);
    return updated;
  },

  removeFromWishlist(productId) {
    const list = loadWishlist();
    const updated = list.filter(id => id !== productId);
    saveWishlist(updated);
    return updated;
  },

  isInWishlist(productId) {
    const list = loadWishlist();
    return list.includes(productId);
  },

  clearWishlist() {
    saveWishlist([]);
    return [];
  }
};
