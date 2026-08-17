const WISHLIST_STORAGE_KEY = 'arabian_sheikh_wishlist';

function loadWishlist() {
  const data = localStorage.getItem(WISHLIST_STORAGE_KEY);
  if (!data) {
    const initial = ['as-oud-royal-01', 'as-amber-malaki-02'];
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(data);
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
