import { addressApi } from '../api/address.api';

/**
 * Arabian Sheikh - Customer Address Service
 * 
 * Central business logic layer for address management:
 * - Coordinates with addressApi
 * - Client-side validation and formatting helpers
 * - In-memory cache management for fast retrieval
 * - Snapshot extraction for orders & checkout
 */

let cachedAddresses = [];

export const addressService = {
  /**
   * Get cached addresses synchronously
   */
  getCachedAddresses() {
    return cachedAddresses;
  },

  /**
   * Fetch all customer addresses from API
   */
  async getAddresses() {
    try {
      const addresses = await addressApi.getAddresses();
      cachedAddresses = Array.isArray(addresses) ? addresses : [];
      return cachedAddresses;
    } catch (err) {
      console.warn('[addressService] Failed to load addresses:', err.message);
      throw err;
    }
  },

  /**
   * Get single address by ID
   */
  async getAddressById(id) {
    const cached = cachedAddresses.find(a => Number(a.id) === Number(id));
    if (cached) return cached;
    return await addressApi.getAddressById(id);
  },

  /**
   * Create new address
   */
  async createAddress(addressData) {
    this.validateAddressData(addressData);
    const created = await addressApi.createAddress(addressData);
    
    // Invalidate / refresh cache
    if (created.isDefaultShipping) {
      cachedAddresses = cachedAddresses.map(a => ({ ...a, isDefaultShipping: false }));
    }
    cachedAddresses = [created, ...cachedAddresses];
    return created;
  },

  /**
   * Update existing address
   */
  async updateAddress(id, addressData) {
    this.validateAddressData(addressData);
    const updated = await addressApi.updateAddress(id, addressData);
    
    // Update in local cache
    cachedAddresses = cachedAddresses.map(a => (Number(a.id) === Number(id) ? updated : a));
    return updated;
  },

  /**
   * Delete address
   */
  async deleteAddress(id, replacementAddressId = null) {
    await addressApi.deleteAddress(id, replacementAddressId);
    cachedAddresses = cachedAddresses.filter(a => Number(a.id) !== Number(id));
    return true;
  },

  /**
   * Set address as default
   */
  async setDefaultAddress(id) {
    await addressApi.setDefaultAddress(id);
    cachedAddresses = cachedAddresses.map(a => ({
      ...a,
      isDefaultShipping: Number(a.id) === Number(id)
    }));
    return true;
  },

  /**
   * Get address snapshot for order creation
   */
  async getAddressSnapshot(id) {
    return await addressApi.getAddressSnapshot(id);
  },

  /**
   * Client-side validation helper
   */
  validateAddressData(data) {
    const errors = {};

    if (!data.fullName || !data.fullName.trim()) {
      errors.fullName = 'Recipient full name is required.';
    }

    if (!data.phone || !data.phone.trim()) {
      errors.phone = 'Phone number is required for courier delivery.';
    } else if (data.phone.trim().length < 6) {
      errors.phone = 'Please enter a valid phone number.';
    }

    if (!data.countryCode || !data.countryCode.trim()) {
      errors.countryCode = 'Country code is required.';
    }

    if (!data.city || !data.city.trim()) {
      errors.city = 'City / Municipality is required.';
    }

    if (!data.region || !data.region.trim()) {
      errors.region = 'Region / State / Governorate is required.';
    }

    if (!data.addressLine1 || !data.addressLine1.trim()) {
      errors.addressLine1 = 'Street address / Villa / Building is required.';
    }

    if (!data.postalCode || !data.postalCode.trim()) {
      errors.postalCode = 'Postal / ZIP Code is required.';
    }

    if (data.label === 'Other' && (!data.customLabel || !data.customLabel.trim())) {
      errors.customLabel = 'Please specify a label (e.g. Palace, Beach House).';
    }

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      const err = new Error(firstError);
      err.errors = errors;
      throw err;
    }

    return true;
  }
};

export default addressService;

