import { promotionService } from './promotionService';

export const EMPTY_CART = {
  id: null,
  items: [],
  subtotal: 0,
  discountTotal: 0,
  discount: 0,
  shippingEstimate: 0,
  shipping: 0,
  total: 0,
  currency: 'EUR',
  expiresAt: null,
  discountCode: null,
  discountPercent: 0,
  discountFixed: 0,
  giftWrap: false
};

export const cartService = {
  getInitialCart() {
    return { ...EMPTY_CART, items: [] };
  },

  getCart() {
    return { ...EMPTY_CART, items: [] };
  },

  saveCart(cart) {
    // Deprecated: Authenticated cart source of truth is the backend API.
  },

  calculateTotals(cart, activePromos = []) {
    const rawItems = cart?.items || [];

    let calculatedSubtotal = 0;
    let promoDiscountAmount = 0;
    const qualifyingPromoNames = new Set();

    // Process each item individually against active promotion rules
    const items = rawItems.map(item => {
      const qty = Number(item.quantity || 1);

      // Handle Curated Bundle Suites with dedicated bundle pricing
      if (item.isBundle) {
        const bundleUnitPrice = Number(item.bundlePrice !== undefined ? item.bundlePrice : (item.price || 0));
        const originalRetail = Number(item.originalPrice || bundleUnitPrice);
        calculatedSubtotal += (bundleUnitPrice * qty);
        
        return {
          ...item,
          price: bundleUnitPrice,
          bundlePrice: bundleUnitPrice,
          originalPrice: originalRetail,
          unitBasePrice: originalRetail,
          unitEffectivePrice: bundleUnitPrice,
          lineTotal: bundleUnitPrice * qty,
          hasPromoDiscount: originalRetail > bundleUnitPrice,
          promoDiscountAmount: Math.max(0, (originalRetail - bundleUnitPrice) * qty)
        };
      }

      // Resolve the true base retail price before any promotional discounts
      const originalPriceVal = Number(item.originalPrice);
      const unitBasePriceVal = Number(item.unitBasePrice);
      const basePriceVal = Number(item.basePrice);
      const snapshotVal = Number(item.unitPriceSnapshot);
      const priceVal = Number(item.price);

      const trueBaseRetailPrice = (!isNaN(originalPriceVal) && originalPriceVal > 0)
        ? originalPriceVal
        : ((!isNaN(unitBasePriceVal) && unitBasePriceVal > 0)
          ? unitBasePriceVal
          : ((!isNaN(basePriceVal) && basePriceVal > 0)
            ? basePriceVal
            : ((!isNaN(snapshotVal) && snapshotVal > 0)
              ? snapshotVal
              : (!isNaN(priceVal) ? priceVal : 0))));

      calculatedSubtotal += (trueBaseRetailPrice * qty);

      // Check if this specific item matches any active promotion applicability rules
      // Evaluated against trueBaseRetailPrice so inactive promotions never stick
      const promoResult = promotionService.calculateProductPromotion({
        ...item,
        price: trueBaseRetailPrice,
        originalPrice: trueBaseRetailPrice
      }, activePromos);

      let effectiveUnitPrice = trueBaseRetailPrice;
      let itemPromoSavings = 0;

      if (promoResult?.hasPromotion && promoResult.price < trueBaseRetailPrice) {
        effectiveUnitPrice = promoResult.price;
        itemPromoSavings = (trueBaseRetailPrice - effectiveUnitPrice) * qty;
        promoDiscountAmount += itemPromoSavings;
        if (promoResult.promotionName) {
          qualifyingPromoNames.add(promoResult.promotionName);
        }
      }

      const origPrice = itemPromoSavings > 0 ? trueBaseRetailPrice : null;

      return {
        ...item,
        price: effectiveUnitPrice,
        originalPrice: origPrice,
        unitBasePrice: trueBaseRetailPrice,
        unitEffectivePrice: effectiveUnitPrice,
        lineTotal: effectiveUnitPrice * qty,
        hasPromoDiscount: itemPromoSavings > 0,
        promoDiscountAmount: itemPromoSavings
      };
    });

    const subtotal = (cart.subtotal !== undefined && cart.subtotal !== null && Number(cart.subtotal) > 0 && promoDiscountAmount === 0) ? Number(cart.subtotal) : calculatedSubtotal;

    // Coupon discount calculation (if coupon code applied)
    let couponDiscountAmount = 0;
    if (cart.discountPercent > 0) {
      couponDiscountAmount = Math.round(subtotal * (cart.discountPercent / 100));
    } else if (cart.discountFixed > 0) {
      couponDiscountAmount = Math.min(subtotal, cart.discountFixed);
    }

    const discountAmount = promoDiscountAmount + couponDiscountAmount;

    const finalItemsTotal = Math.max(0, subtotal - discountAmount);
    const shipping = 0;
    const total = (cart.total !== undefined && cart.total !== null && Number(cart.total) > 0 && discountAmount === 0) ? Number(cart.total) : finalItemsTotal;


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
      freeShippingThreshold: 0,
      freeShippingRemaining: 0,

      items
    };
  }
};

