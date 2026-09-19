import apiClient from './client';
import ENDPOINTS from './endpoints';
import { normalizeShippingOption, normalizeObjectKeys } from './normalizers';

export const shippingApi = {
  /**
   * Request Shipping Quotes for Checkout
   * POST /api/Shipping/quotes
   * @param {object} payload { addressId }
   * @returns {{ options: ShippingOption[], fromBackend: boolean }}
   *   fromBackend=true  → quoteIds are real backend UUIDs, safe to use in POST /api/Orders
   *   fromBackend=false → fallback display-only quotes, do NOT send quoteId to backend
   */
  async getQuotes(payload = {}, options = {}) {
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
      addressId: addrId
    };

    let response = null;
    try {
      // Call official backend endpoint with optional AbortSignal
      response = await apiClient.post(
        ENDPOINTS.SHIPPING.QUOTES,
        requestBody,
        { requiresAuth: true, signal: options?.signal }
      );
    } catch (err) {
      if (options?.signal?.aborted) throw err;
      console.warn('[Checkout] POST /api/Shipping/quotes notice:', err?.message || err);
    }

    const normResponse = normalizeObjectKeys(response);

    // Extract options from normalized or raw response
    let rawOptions =
      normResponse?.options ||
      normResponse?.shippingOptions ||
      normResponse?.items ||
      normResponse?.quotes ||
      normResponse?.data ||
      normResponse?.methods ||
      normResponse?.shippingMethods ||
      response?.options ||
      response?.Options ||
      response?.shippingOptions ||
      response?.ShippingOptions ||
      response?.quotes ||
      response?.Quotes ||
      (Array.isArray(normResponse) ? normResponse : (Array.isArray(response) ? response : []));

    let topLevelQuoteId =
      normResponse?.quoteId ||
      normResponse?.id ||
      response?.quoteId ||
      response?.QuoteId ||
      response?.id ||
      null;

    // Fallback: If quotes endpoint returned no options, retrieve session quotes via GET /api/checkout
    if (!rawOptions || rawOptions.length === 0) {
      try {
        const rawCheckout = await apiClient.get(ENDPOINTS.CHECKOUT.GET, {
          params: { addressId: addrId },
          requiresAuth: true,
          signal: options?.signal
        });
        const checkoutSummary = normalizeObjectKeys(rawCheckout);
        const summaryOptions =
          checkoutSummary?.shippingOptions ||
          checkoutSummary?.options ||
          checkoutSummary?.items ||
          checkoutSummary?.quotes ||
          checkoutSummary?.methods;

        if (Array.isArray(summaryOptions) && summaryOptions.length > 0) {
          rawOptions = summaryOptions;
          if (!topLevelQuoteId) {
            topLevelQuoteId = checkoutSummary?.quoteId || checkoutSummary?.selectedShippingMethod?.quoteId || null;
          }
        }
      } catch (chkErr) {
        // Non-blocking fallback
      }
    }

    const optionsList = (Array.isArray(rawOptions) ? rawOptions : [])
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
      console.log('[Checkout] Shipping quote received:', optionsList);
    }

    return { options: optionsList, quoteId: topLevelQuoteId };
  },
};

export default shippingApi;

