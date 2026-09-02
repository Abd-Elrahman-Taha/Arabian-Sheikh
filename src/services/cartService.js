import { promotionService } from './promotionService';

const CART_STORAGE_KEY = 'arabian_sheikh_cart';

export const cartService = {
  getCart() {
    const data = typeof window !== 'undefined' ? localStorage.getItem(CART_STORAGE_KEY) : null;
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
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  },

  calculateTotals(cart, activePromos = []) {
    const rawItems = cart?.items || [];

    let calculatedSubtotal = 0;
    let promoDiscountAmount = 0;
    const qualifyingPromoNames = new Set();

    // Process each item individually against active promotion rules
    const items = rawItems.map(item => {
      const baseUnitPrice = Number(item.originalPrice || item.price || 0);
      const qty = Number(item.quantity || 1);
      calculatedSubtotal += (baseUnitPrice * qty);

      // Check if this specific item matches any active promotion applicability rules
      const promoResult = promotionService.calculateProductPromotion(item, activePromos);

      let effectiveUnitPrice = baseUnitPrice;
      let itemPromoSavings = 0;

      if (promoResult?.hasPromotion && promoResult.price < baseUnitPrice) {
        effectiveUnitPrice = promoResult.price;
        itemPromoSavings = (baseUnitPrice - effectiveUnitPrice) * qty;
        promoDiscountAmount += itemPromoSavings;
        if (promoResult.promotionName) {
          qualifyingPromoNames.add(promoResult.promotionName);
        }
      }

      return {
        ...item,
        price: effectiveUnitPrice,
        unitBasePrice: baseUnitPrice,
        unitEffectivePrice: effectiveUnitPrice,
        lineTotal: effectiveUnitPrice * qty,
        hasPromoDiscount: itemPromoSavings > 0,
        promoDiscountAmount: itemPromoSavings
      };
    });

    const subtotal = calculatedSubtotal;

    // Coupon discount calculation (if coupon code applied)
    let couponDiscountAmount = 0;
    if (cart.discountPercent > 0) {
      couponDiscountAmount = Math.round(subtotal * (cart.discountPercent / 100));
    } else if (cart.discountFixed > 0) {
      couponDiscountAmount = Math.min(subtotal, cart.discountFixed);
    }

    const discountAmount = promoDiscountAmount + couponDiscountAmount;

    // Free express shipping above €200 (or $200), standard DHL delivery is €10 / $10
    const freeShippingThreshold = 200;
    const finalItemsTotal = Math.max(0, subtotal - discountAmount);
    const shipping = finalItemsTotal >= freeShippingThreshold || items.length === 0 ? 0 : 10;
    const total = Math.max(0, finalItemsTotal + shipping);

    const totalCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

    return {
      subtotal,
      discountAmount,
      couponDiscountAmount,
      promoDiscountAmount,
      activePromoName: qualifyingPromoNames.size > 0 ? Array.from(qualifyingPromoNames).join(', ') : null,
      shipping,
      total,
      totalCount,
      itemCount: totalCount,
      freeShippingThreshold,
      freeShippingRemaining: Math.max(0, freeShippingThreshold - finalItemsTotal),
      items
    };
  }
};

