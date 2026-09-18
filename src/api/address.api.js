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
const COUNTRY_CODE_MAP = {
  'BULGARIA': 'BG',
  'UNITED ARAB EMIRATES': 'AE',
  'UAE': 'AE',
  'SAUDI ARABIA': 'SA',
  'EGYPT': 'EG',
  'KUWAIT': 'KW',
  'QATAR': 'QA',
  'BAHRAIN': 'BH',
  'OMAN': 'OM',
  'UNITED KINGDOM': 'GB',
  'UK': 'GB',
  'UNITED STATES': 'US',
  'USA': 'US',
  'GERMANY': 'DE',
  'FRANCE': 'FR',
  'ITALY': 'IT',
  'SPAIN': 'ES',
  'SWITZERLAND': 'CH',
  'TURKEY': 'TR',
  'GREECE': 'GR',
  'ROMANIA': 'RO'
};

function normalizeCountryCode(val) {
  if (!val) return 'BG';
  const str = String(val).trim().toUpperCase();
  if (str.length === 2) return str;
  if (COUNTRY_CODE_MAP[str]) return COUNTRY_CODE_MAP[str];
  for (const [name, code] of Object.entries(COUNTRY_CODE_MAP)) {
    if (str.includes(name)) return code;
  }
  return 'BG';
}

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
  async createAddress(payload = {}) {
    const customLabelVal = payload.customLabel !== undefined && payload.customLabel !== null
      ? String(payload.customLabel).trim()
      : '';
    const addressLine2Val = payload.addressLine2 !== undefined && payload.addressLine2 !== null
      ? String(payload.addressLine2).trim()
      : '';

    const body = {
      label: ['Home', 'Work', 'Other'].includes(payload.label) ? payload.label : 'Home',
      customLabel: customLabelVal,
      fullName: String(payload.fullName || '').trim(),
      phone: String(payload.phone || '').trim(),
      countryCode: normalizeCountryCode(payload.countryCode || payload.country),
      region: String(payload.region || payload.city || '').trim(),
      city: String(payload.city || '').trim(),
      addressLine1: String(payload.addressLine1 || payload.address || '').trim(),
      addressLine2: addressLine2Val,
      postalCode: String(payload.postalCode || '').trim()
    };

    if (import.meta.env.DEV) {
      console.log('[AddressApi] Creating address with body:', body);
    }

    const response = await apiClient.post(ENDPOINTS.ADDRESSES.CREATE, body);
    return normalizeAddress(response);
  },

  /**
   * Update an existing address for the authenticated customer
   * PUT /api/addresses/{id}
   */
  async updateAddress(id, payload = {}) {
    const targetId = Number(id);
    if (!targetId || isNaN(targetId)) {
      throw new Error('Valid address database ID is required.');
    }

    const customLabelVal = payload.customLabel !== undefined && payload.customLabel !== null
      ? String(payload.customLabel).trim()
      : '';
    const addressLine2Val = payload.addressLine2 !== undefined && payload.addressLine2 !== null
      ? String(payload.addressLine2).trim()
      : '';

    const body = {
      label: ['Home', 'Work', 'Other'].includes(payload.label) ? payload.label : 'Home',
      customLabel: customLabelVal,
      fullName: String(payload.fullName || '').trim(),
      phone: String(payload.phone || '').trim(),
      countryCode: normalizeCountryCode(payload.countryCode || payload.country),
      region: String(payload.region || payload.city || '').trim(),
      city: String(payload.city || '').trim(),
      addressLine1: String(payload.addressLine1 || payload.address || '').trim(),
      addressLine2: addressLine2Val,
      postalCode: String(payload.postalCode || '').trim()
    };

    if (import.meta.env.DEV) {
      console.log('[AddressApi] Updating address with body:', body);
    }

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

