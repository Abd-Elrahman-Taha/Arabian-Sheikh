import apiClient from './client';
import ENDPOINTS from './endpoints';
import { normalizeShippingOption } from './normalizers';

export const shippingApi = {
  /**
   * Request Shipping Quotes for Checkout
   * POST /api/Shipping/quotes
   * @param {object} payload { addressId }
   * @returns {{ options: ShippingOption[], fromBackend: boolean }}
   *   fromBackend=true  → quoteIds are real backend UUIDs, safe to use in POST /api/Orders
   *   fromBackend=false → fallback display-only quotes, do NOT send quoteId to backend
   */
  async getQuotes(payload = {}) {
    const rawAddrId = payload.addressId;
    const addrId =
      rawAddrId !== undefined &&
      rawAddrId !== null &&
      !isNaN(Number(rawAddrId)) &&
      Number(rawAddrId) > 0
        ? Number(rawAddrId)
        : null;

    if (!addrId) {
      throw new Error('A valid shipping address is required before requesting delivery quotes.');
    }

    if (import.meta.env.DEV) {
      console.log('[Checkout] Requesting shipping quote:', addrId);
    }

    // Call official backend endpoint
    const response = await apiClient.post(
      ENDPOINTS.SHIPPING.QUOTES,
      { addressId: addrId },
      { requiresAuth: true }
    );

    const rawOptions =
      response?.options || (Array.isArray(response) ? response : []);

    const topLevelQuoteId = response?.quoteId || null;

    const options = (Array.isArray(rawOptions) ? rawOptions : [])
      .map(item => {
        const norm = normalizeShippingOption(item);
        if (!norm) return null;
        if (!norm.quoteId && topLevelQuoteId) {
          norm.quoteId = String(topLevelQuoteId);
        }
        return norm;
      })
      .filter(Boolean);

    if (import.meta.env.DEV) {
      console.log('[Checkout] Shipping quote received:', options);
    }

    return { options };
  },
};

export default shippingApi;
