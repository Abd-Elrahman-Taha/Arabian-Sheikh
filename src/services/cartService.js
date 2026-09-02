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

  calculateTotals(cart, activePromos = []) {
    const items = cart.items || [];
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);

    let couponDiscountAmount = 0;
    if (cart.discountPercent > 0) {
      couponDiscountAmount = Math.round(subtotal * (cart.discountPercent / 100));
    } else if (cart.discountFixed > 0) {
      couponDiscountAmount = Math.min(subtotal, cart.discountFixed);
    }

    // Automatic Promotion Discount
    let promoDiscountAmount = 0;
    let activePromoName = null;

    if (Array.isArray(activePromos) && activePromos.length > 0) {
      const bestPromo = activePromos.find(p => p.type === 'Discount');
      if (bestPromo && subtotal > 0) {
        activePromoName = bestPromo.name;
        if (bestPromo.discountType === 'Percentage' && bestPromo.discountValue > 0) {
          promoDiscountAmount = Math.round(subtotal * (Number(bestPromo.discountValue) / 100));
        } else if (bestPromo.discountType === 'Fixed' && bestPromo.discountValue > 0) {
          promoDiscountAmount = Math.min(subtotal, Number(bestPromo.discountValue));
        }
      }
    }

    // Total discount is the greater of coupon or automatic promotion (or combination)
    const discountAmount = Math.max(couponDiscountAmount, promoDiscountAmount);

    // Free express shipping above $200
    const freeShippingThreshold = 200;
    const shipping = subtotal >= freeShippingThreshold || items.length === 0 ? 0 : 25;
    const total = Math.max(0, subtotal - discountAmount + shipping);

    const totalCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

    return {
      subtotal,
      discountAmount,
      couponDiscountAmount,
      promoDiscountAmount,
      activePromoName: promoDiscountAmount >= couponDiscountAmount ? activePromoName : null,
      shipping,
      total,
      totalCount,
      freeShippingThreshold,
      freeShippingRemaining: Math.max(0, freeShippingThreshold - subtotal)
    };
  }
};

