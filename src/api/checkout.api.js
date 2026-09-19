import apiClient from './client';
import ENDPOINTS from './endpoints';
import { normalizeObjectKeys } from './normalizers';

/**
 * Arabian Sheikh - Checkout API Client
 * 
 * Provides methods for the full customer checkout lifecycle:
 * 1. GET /api/checkout - Retrieve current checkout session state, items, subtotal, and shipping
 * 2. PUT /api/checkout/address - Set / update shipping and billing destination address
 * 3. PUT /api/checkout/shipping - Select shipping method / carrier (e.g. DHL Express)
 * 4. GET /api/shipping/options - Retrieve available shipping carriers and rates
 */
export const checkoutApi = {
  /**
   * 1. GET /api/checkout
   * Parameters (query): addressId?: number, shippingMethodId?: number, couponCode?: string
   */
  async getCheckout(params = {}) {
    const query = {};
    if (params.addressId) query.addressId = Number(params.addressId);
    if (params.shippingMethodId) query.shippingMethodId = Number(params.shippingMethodId);
    if (params.couponCode && String(params.couponCode).trim()) {
      query.couponCode = String(params.couponCode).trim();
    }
    const response = await apiClient.get(ENDPOINTS.CHECKOUT.GET, { params: query, requiresAuth: true });
    return normalizeObjectKeys(response);
  },

  /**
   * 2. PUT /api/checkout/address
   * Request body: { addressId: number }
   */
  async setCheckoutAddress(payload) {
    const addressId = typeof payload === 'number'
      ? payload
      : Number(payload?.addressId ?? payload?.id);

    if (!addressId || isNaN(addressId)) {
      console.warn('setCheckoutAddress: addressId must be a valid integer', payload);
      return null;
    }

    const response = await apiClient.put(ENDPOINTS.CHECKOUT.SET_ADDRESS, { addressId }, { requiresAuth: true });
    return normalizeObjectKeys(response);
  },

  /**
   * 3. PUT /api/checkout/shipping
   * Query params: addressId?: number, couponCode?: string
   * Request body: { shippingMethodId: number, quoteId: string }
   */
  async setCheckoutShipping(payload, queryParams = {}) {
    const shippingMethodId = Number(payload?.shippingMethodId || (typeof payload === 'number' ? payload : null));
    const quoteId = payload?.quoteId || (typeof payload === 'string' ? payload : undefined);

    if (!shippingMethodId || isNaN(shippingMethodId)) {
      throw new Error('Valid shippingMethodId is required.');
    }

    const body = {
      shippingMethodId,
      ...(quoteId ? { quoteId } : {})
    };

    const params = {};
    const addrId = queryParams.addressId || payload?.addressId;
    if (addrId) params.addressId = Number(addrId);
    const coupon = queryParams.couponCode || payload?.couponCode;
    if (coupon && String(coupon).trim()) params.couponCode = String(coupon).trim();

    const response = await apiClient.put(ENDPOINTS.CHECKOUT.SET_SHIPPING, body, { params, requiresAuth: true });
    return normalizeObjectKeys(response);
  },

  /**
   * 4. GET /api/shipping/options
   * Retrieve shipping options / rates for current destination
   */
  async getShippingOptions(params = {}) {
    const response = await apiClient.get(ENDPOINTS.CHECKOUT.SHIPPING_OPTIONS, { params });
    const rawList = response?.items || (Array.isArray(response) ? response : []);
    return rawList.map(normalizeObjectKeys);
  }
};

export default checkoutApi;
