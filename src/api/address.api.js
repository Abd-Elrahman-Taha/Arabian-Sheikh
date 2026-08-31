import apiClient from './client';
import ENDPOINTS from './endpoints';
import {
  normalizeAddress,
  normalizeAddressList,
  normalizeAddressSnapshot
} from './normalizers';

/**
 * Arabian Sheikh - Customer Address API
 * 
 * Provides centralized network operations for authenticated customer delivery addresses:
 * - GET /api/addresses (List saved addresses)
 * - POST /api/addresses (Create new address)
 * - GET /api/addresses/{id} (Get single address details)
 * - PUT /api/addresses/{id} (Update existing address)
 * - DELETE /api/addresses/{id} (Delete address with optional replacement)
 * - PATCH /api/addresses/{id}/default (Set as default delivery address)
 * - GET /api/addresses/{id}/snapshot (Retrieve immutable snapshot for order/shipping record)
 */
export const addressApi = {
  /**
   * Get all saved addresses for the authenticated customer
   * GET /api/addresses
   */
  async getAddresses() {
    const response = await apiClient.get(ENDPOINTS.ADDRESSES.LIST);
    return normalizeAddressList(response);
  },

  /**
   * Get a single address by database ID
   * GET /api/addresses/{id}
   */
  async getAddressById(id) {
    const targetId = Number(id);
    if (!targetId || isNaN(targetId)) {
      throw new Error('Valid address database ID is required.');
    }
    const response = await apiClient.get(ENDPOINTS.ADDRESSES.DETAILS(targetId));
    return normalizeAddress(response);
  },

  /**
   * Create a new address for the authenticated customer
   * POST /api/addresses
   */
  async createAddress(payload) {
    const body = {
      label: ['Home', 'Work', 'Other'].includes(payload.label) ? payload.label : 'Home',
      customLabel: payload.label === 'Other' && payload.customLabel ? String(payload.customLabel).trim() : null,
      fullName: String(payload.fullName || '').trim(),
      phone: String(payload.phone || '').trim(),
      countryCode: String(payload.countryCode || 'AE').toUpperCase().trim(),
      region: String(payload.region || '').trim(),
      city: String(payload.city || '').trim(),
      addressLine1: String(payload.addressLine1 || '').trim(),
      addressLine2: payload.addressLine2 ? String(payload.addressLine2).trim() : null,
      postalCode: String(payload.postalCode || '').trim()
    };

    const response = await apiClient.post(ENDPOINTS.ADDRESSES.CREATE, body);
    return normalizeAddress(response);
  },

  /**
   * Update an existing address for the authenticated customer
   * PUT /api/addresses/{id}
   */
  async updateAddress(id, payload) {
    const targetId = Number(id);
    if (!targetId || isNaN(targetId)) {
      throw new Error('Valid address database ID is required.');
    }

    const body = {
      label: ['Home', 'Work', 'Other'].includes(payload.label) ? payload.label : 'Home',
      customLabel: payload.label === 'Other' && payload.customLabel ? String(payload.customLabel).trim() : null,
      fullName: String(payload.fullName || '').trim(),
      phone: String(payload.phone || '').trim(),
      countryCode: String(payload.countryCode || 'AE').toUpperCase().trim(),
      region: String(payload.region || '').trim(),
      city: String(payload.city || '').trim(),
      addressLine1: String(payload.addressLine1 || '').trim(),
      addressLine2: payload.addressLine2 ? String(payload.addressLine2).trim() : null,
      postalCode: String(payload.postalCode || '').trim()
    };

    const response = await apiClient.put(ENDPOINTS.ADDRESSES.UPDATE(targetId), body);
    return normalizeAddress(response);
  },

  /**
   * Delete an address
   * DELETE /api/addresses/{id}
   */
  async deleteAddress(id, replacementAddressId = null) {
    const targetId = Number(id);
    if (!targetId || isNaN(targetId)) {
      throw new Error('Valid address database ID is required.');
    }

    let endpoint = ENDPOINTS.ADDRESSES.DELETE(targetId);
    if (replacementAddressId) {
      endpoint += `?replacementAddressId=${Number(replacementAddressId)}`;
    }

    await apiClient.delete(endpoint);
    return true;
  },

  /**
   * Set an address as default delivery address
   * PATCH /api/addresses/{id}/default
   */
  async setDefaultAddress(id) {
    const targetId = Number(id);
    if (!targetId || isNaN(targetId)) {
      throw new Error('Valid address database ID is required.');
    }

    await apiClient.patch(ENDPOINTS.ADDRESSES.SET_DEFAULT(targetId));
    return true;
  },

  /**
   * Retrieve immutable address snapshot for checkout / shipping records
   * GET /api/addresses/{id}/snapshot
   */
  async getAddressSnapshot(id) {
    const targetId = Number(id);
    if (!targetId || isNaN(targetId)) {
      throw new Error('Valid address database ID is required.');
    }

    const response = await apiClient.get(ENDPOINTS.ADDRESSES.SNAPSHOT(targetId));
    return normalizeAddressSnapshot(response);
  }
};

export default addressApi;

