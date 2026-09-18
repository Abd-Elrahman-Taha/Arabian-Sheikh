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
      !isNaN(Number(rawAddrId))
        ? Number(rawAddrId)
        : 0;

    // Endpoints to attempt (/Shipping/quotes matching ASP.NET controller casing, /shipping/quotes fallback)
    const endpointsToTry = [
      ENDPOINTS.SHIPPING.QUOTES,
      '/Shipping/quotes',
      '/shipping/quotes'
    ];
    const uniqueEndpoints = [...new Set(endpointsToTry)];

    for (const ep of uniqueEndpoints) {
      try {
        const response = await apiClient.post(
          ep,
          { addressId: addrId },
          { requiresAuth: false }
        );

        const rawOptions =
          response?.options || (Array.isArray(response) ? response : []);
        if (Array.isArray(rawOptions) && rawOptions.length > 0) {
          return {
            options: rawOptions.map(normalizeShippingOption).filter(Boolean),
            fromBackend: true,
          };
        }
      } catch (err) {
        console.warn(
          `POST ${ep} failed (addressId=${addrId}):`,
          err?.message || err
        );
      }
    }

    // ─── Display-only fallback ─────────────────────────────────────────────────
    // isMockFallback: true  → these MUST NOT be sent as quoteId to POST /api/Orders
    // quoteId: null          → explicitly null so order.api.js skips it
    // They exist only to give the UI something to show when the backend quote call fails.
    const makeFallback = (raw) => ({
      ...normalizeShippingOption(raw),
      quoteId: null,
      isMockFallback: true,
    });

    return {
      options: [
        makeFallback({
          shippingMethodId: 1,
          shippingCompanyId: 3,
          carrier: 'ECONT',
          shippingMethod: 'ECONT Standard Delivery',
          shippingFee: 5.0,
          currency: 'EUR',
          estimatedDeliveryDays: 3,
          minDeliveryDays: 2,
          maxDeliveryDays: 4,
          isFree: false,
          rateSource: 'ECONT',
        }),
        makeFallback({
          shippingMethodId: 2,
          shippingCompanyId: 3,
          carrier: 'ECONT',
          shippingMethod: 'ECONT Priority Express',
          shippingFee: 12.0,
          currency: 'EUR',
          estimatedDeliveryDays: 1,
          minDeliveryDays: 1,
          maxDeliveryDays: 2,
          isFree: false,
          rateSource: 'ECONT',
        }),
        makeFallback({
          shippingMethodId: 3,
          shippingCompanyId: 1,
          carrier: 'DHL Express',
          shippingMethod: 'DHL Royal Air Delivery',
          shippingFee: 15.0,
          currency: 'EUR',
          estimatedDeliveryDays: 2,
          minDeliveryDays: 1,
          maxDeliveryDays: 3,
          isFree: false,
        }),
      ],
      fromBackend: false,
    };
  },
};

export default shippingApi;
