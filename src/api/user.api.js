import apiClient from './client';
import ENDPOINTS from './endpoints';
import { normalizeUser, normalizeObjectKeys } from './normalizers';

export const userApi = {
  // ==========================================
  // CUSTOMER ADDRESSES
  // ==========================================

  /**
   * Get Customer Addresses
   * GET /api/addresses
   */
  async getAddresses() {
    const response = await apiClient.get(ENDPOINTS.ADDRESSES.LIST);
    const rawList = response?.items || (Array.isArray(response) ? response : []);
    return rawList.map(normalizeObjectKeys);
  },

  /**
   * Add Customer Address
   * POST /api/addresses
   */
  async addAddress(address) {
    const response = await apiClient.post(ENDPOINTS.ADDRESSES.CREATE, address);
    return normalizeObjectKeys(response);
  },

  /**
   * Update Customer Address
   * PUT /api/addresses/{id}
   */
  async updateAddress(id, address) {
    const response = await apiClient.put(ENDPOINTS.ADDRESSES.UPDATE(id), address);
    return normalizeObjectKeys(response);
  },

  /**
   * Delete Customer Address
   * DELETE /api/addresses/{id}
   */
  async deleteAddress(id) {
    await apiClient.delete(ENDPOINTS.ADDRESSES.DELETE(id));
    return true;
  },

  /**
   * Set Default Address
   * PATCH /api/addresses/{id}/default
   */
  async setDefaultAddress(id) {
    await apiClient.patch(ENDPOINTS.ADDRESSES.SET_DEFAULT(id));
    return true;
  },

  // ==========================================
  // ADMIN CUSTOMER MANAGEMENT
  // ==========================================

  /**
   * Admin: List customers
   * GET /api/admin/customers
   */
  async adminGetCustomers(params = {}) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.CUSTOMERS.LIST, { params });
    const rawList = response?.items || (Array.isArray(response) ? response : []);
    return {
      items: rawList.map(normalizeUser),
      totalCount: response?.totalCount || rawList.length,
      page: response?.page || 1,
      pageSize: response?.pageSize || 20,
      totalPages: response?.totalPages || 1
    };
  },

  /**
   * Admin: Customer details
   * GET /api/admin/customers/{id}
   */
  async adminGetCustomerById(id) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.CUSTOMERS.DETAILS(id));
    return normalizeUser(response);
  },

  /**
   * Admin: Block customer
   * POST /api/admin/customers/{id}/block
   */
  async adminBlockCustomer(id, reason = '') {
    const response = await apiClient.post(ENDPOINTS.ADMIN.CUSTOMERS.BLOCK(id), { reason });
    return normalizeObjectKeys(response);
  },

  /**
   * Admin: Unblock customer
   * POST /api/admin/customers/{id}/unblock
   */
  async adminUnblockCustomer(id, reason = '') {
    const response = await apiClient.post(ENDPOINTS.ADMIN.CUSTOMERS.UNBLOCK(id), { reason });
    return normalizeObjectKeys(response);
  },

  // ==========================================
  // ADMIN USER / STAFF MANAGEMENT
  // ==========================================

  /**
   * Admin: List admin users
   * GET /api/admin/admins
   */
  async adminGetAdmins() {
    const response = await apiClient.get(ENDPOINTS.ADMIN.ADMINS.LIST);
    const rawList = response?.items || (Array.isArray(response) ? response : []);
    return rawList.map(normalizeUser);
  },

  /**
   * Admin: Create new admin (Super Admin only)
   * POST /api/admin/admins
   */
  async adminCreateAdmin(payload) {
    const response = await apiClient.post(ENDPOINTS.ADMIN.ADMINS.CREATE, payload);
    return normalizeUser(response);
  }
};

export default userApi;
