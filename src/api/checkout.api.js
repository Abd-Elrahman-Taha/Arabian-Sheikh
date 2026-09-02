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
   * Retrieve active checkout state
   */
  async getCheckout() {
    const response = await apiClient.get(ENDPOINTS.CHECKOUT.GET);
    return normalizeObjectKeys(response);
  },

  /**
   * 2. PUT /api/checkout/address
   * Set shipping destination address for the active checkout session
   * @param {Object} payload - { addressId: number, useAsBilling?: boolean } or full address object
   */
  async setCheckoutAddress(payload) {
    const body = typeof payload === 'number'
      ? { addressId: payload }
      : payload?.addressId
      ? { addressId: Number(payload.addressId), useAsBilling: payload.useAsBilling !== false }
      : payload;

    const response = await apiClient.put(ENDPOINTS.CHECKOUT.SET_ADDRESS, body);
    return normalizeObjectKeys(response);
  },

  /**
   * 3. PUT /api/checkout/shipping
   * Set shipping carrier / delivery method
   * @param {Object} payload - { shippingMethodId?: number, shippingCarrier?: string, shippingMethod?: string }
   */
  async setCheckoutShipping(payload) {
    const body = typeof payload === 'string'
      ? { shippingMethod: payload }
      : payload;

    const response = await apiClient.put(ENDPOINTS.CHECKOUT.SET_SHIPPING, body);
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
