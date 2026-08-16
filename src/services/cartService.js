const CART_STORAGE_KEY = 'arabian_sheikh_cart';

export const cartService = {
  getCart() {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    if (!data) {
      return {
        items: [],
        discountCode: null,
        discountPercent: 0,
        discountFixed: 0,
        giftWrap: false
      };
    }
    try {
      return JSON.parse(data);
    } catch {
      return {
        items: [],
        discountCode: null,
        discountPercent: 0,
        discountFixed: 0,
        giftWrap: false
      };
    }
  },

  saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  },

  calculateTotals(cart) {
    const items = cart.items || [];
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let discountAmount = 0;
    if (cart.discountPercent > 0) {
      discountAmount = Math.round(subtotal * (cart.discountPercent / 100));
    } else if (cart.discountFixed > 0) {
      discountAmount = Math.min(subtotal, cart.discountFixed);
    }

    // Free express shipping above $200
    const freeShippingThreshold = 200;
    const shipping = subtotal >= freeShippingThreshold || items.length === 0 ? 0 : 25;
    const total = Math.max(0, subtotal - discountAmount + shipping);

    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal,
      discountAmount,
      shipping,
      total,
      totalCount,
      freeShippingThreshold,
      freeShippingRemaining: Math.max(0, freeShippingThreshold - subtotal)
    };
  }
};
