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
      console.log('[Checkout] Requesting shipping quote:', addrId, payload);
    }

    const requestBody = {
      addressId: addrId,
      ...(payload.countryCode ? { countryCode: String(payload.countryCode).trim() } : {}),
      ...(payload.postalCode ? { postalCode: String(payload.postalCode).trim() } : {}),
      ...(payload.city ? { city: String(payload.city).trim() } : {}),
      ...(Array.isArray(payload.items) && payload.items.length > 0 ? { items: payload.items } : {})
    };

    // Call official backend endpoint
    const response = await apiClient.post(
      ENDPOINTS.SHIPPING.QUOTES,
      requestBody,
      { requiresAuth: true }
    );

    const rawOptions =
      response?.options || (Array.isArray(response) ? response : []);

    const topLevelQuoteId = response?.quoteId || null;

    let options = (Array.isArray(rawOptions) ? rawOptions : [])
      .map(item => {
        const norm = normalizeShippingOption(item);
        if (!norm) return null;
        if (!norm.quoteId && topLevelQuoteId) {
          norm.quoteId = String(topLevelQuoteId);
        }
        return norm;
      })
      .filter(Boolean);

    // Sync with GET /api/checkout to verify and merge authoritative backend shippingOptions if available
    try {
      const checkoutData = await apiClient.get(ENDPOINTS.CHECKOUT.GET, {
        params: { addressId: addrId },
        requiresAuth: true
      });
      const checkoutOptions = checkoutData?.shippingOptions || [];
      if (Array.isArray(checkoutOptions) && checkoutOptions.length > 0) {
        options = options.map(opt => {
          const match = checkoutOptions.find(co => {
            const coCarrier = String(co.carrier || co.carrierName || co.shippingCompany || '').toLowerCase();
            const optCarrier = String(opt.carrier || '').toLowerCase();
            const coMethod = String(co.shippingMethod || co.methodName || co.name || '').toLowerCase();
            const optMethod = String(opt.shippingMethod || '').toLowerCase();
            const expressMatch = (coMethod.includes('express') || coMethod.includes('exp')) ===
                                 (optMethod.includes('express') || optMethod.includes('exp'));
            return (coCarrier.includes(optCarrier) || optCarrier.includes(coCarrier)) && expressMatch;
          });
          if (match) {
            return {
              ...opt,
              quoteId: match.quoteId || opt.quoteId,
              shippingMethodId: Number(match.shippingMethodId || match.id || opt.shippingMethodId),
              shippingCompanyId: Number(match.shippingCompanyId || opt.shippingCompanyId)
            };
          }
          return opt;
        });
      }
    } catch {
      // Non-critical, options already normalized with deterministic IDs
    }

    if (import.meta.env.DEV) {
      console.log('[Checkout] Shipping quote received:', options);
    }

    return { options };
  },
};

export default shippingApi;
