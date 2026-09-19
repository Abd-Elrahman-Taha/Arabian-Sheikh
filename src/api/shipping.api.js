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
      console.warn('[Checkout] POST /api/Shipping/quotes failed, attempting fallback endpoints:', err?.message || err);
    }

    // Extract options from any possible response shape returned by ASP.NET backend
    let rawOptions =
      response?.options ||
      response?.shippingOptions ||
      response?.items ||
      response?.quotes ||
      response?.data ||
      response?.methods ||
      response?.shippingMethods ||
      (Array.isArray(response) ? response : []);

    let topLevelQuoteId = response?.quoteId || response?.id || null;

    // Fallback 1: If POST /api/Shipping/quotes returned no options, check GET /api/checkout with addressId
    if (!rawOptions || rawOptions.length === 0) {
      try {
        const checkoutSummary = await apiClient.get(ENDPOINTS.CHECKOUT.GET, {
          params: { addressId: addrId },
          requiresAuth: true,
          signal: options?.signal
        });
        const summaryOptions =
          checkoutSummary?.shippingOptions ||
          checkoutSummary?.options ||
          checkoutSummary?.items ||
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

    // Fallback 2: If still empty, check GET /api/Shipping/options (all available shipping carriers & rates)
    if (!rawOptions || rawOptions.length === 0) {
      try {
        const globalOptions = await apiClient.get(ENDPOINTS.SHIPPING.OPTIONS, {
          params: { addressId: addrId },
          requiresAuth: false,
          signal: options?.signal
        });
        const list = globalOptions?.items || (Array.isArray(globalOptions) ? globalOptions : globalOptions?.options);
        if (Array.isArray(list) && list.length > 0) {
          rawOptions = list;
        }
      } catch (optErr) {
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

