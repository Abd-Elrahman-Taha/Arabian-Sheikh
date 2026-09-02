import apiClient from './client';
import ENDPOINTS from './endpoints';
import { normalizeAdmin, normalizeAdminList } from './normalizers';

/**
 * SuperAdmin - Administrator Management API Client
 * Base Path: /api/admin/admins
 * Required Policy: SuperAdmin
 */
export const adminManagementApi = {
  /**
   * 1. GET /api/admin/admins
   * Paginated list of administrators with search, filter, and sorting
   */
  async getAdmins(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined && params.page !== null) {
      queryParams.append('Page', params.page);
    }
    if (params.pageSize !== undefined && params.pageSize !== null) {
      queryParams.append('PageSize', params.pageSize);
    }
    if (params.search && params.search.trim()) {
      queryParams.append('Search', params.search.trim());
    }
    if (params.isActive !== undefined && params.isActive !== null && params.isActive !== '') {
      queryParams.append('IsActive', params.isActive);
    }
    if (params.sortBy) {
      queryParams.append('SortBy', params.sortBy);
    }
    if (params.sortDirection) {
      queryParams.append('SortDirection', params.sortDirection);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${ENDPOINTS.ADMIN.ADMINS.LIST}?${queryString}`
      : ENDPOINTS.ADMIN.ADMINS.LIST;

    const response = await apiClient.get(endpoint);
    return normalizeAdminList(response);
  },

  /**
   * 2. POST /api/admin/admins
   * Create new direct administrator
   */
  async createAdmin(payload) {
    const body = {
      fullName: payload.fullName?.trim() || '',
      email: payload.email?.trim() || '',
      password: payload.password || '',
      preferredDashboardLanguage: payload.preferredDashboardLanguage !== undefined ? Number(payload.preferredDashboardLanguage) : 1,
      isActive: payload.isActive !== false
    };

    const response = await apiClient.post(ENDPOINTS.ADMIN.ADMINS.CREATE, body);
    return normalizeAdmin(response);
  },

  /**
   * 3. GET /api/admin/admins/{id}
   * Get single administrator details
   */
  async getAdminById(id) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.ADMINS.DETAILS(id));
    return normalizeAdmin(response);
  },

  /**
   * 4. PUT /api/admin/admins/{id}
   * Update administrator profile (fullName, email, preferredDashboardLanguage)
   */
  async updateAdmin(id, payload) {
    const body = {
      fullName: payload.fullName?.trim() || '',
      email: payload.email?.trim() || '',
      preferredDashboardLanguage: payload.preferredDashboardLanguage !== undefined ? Number(payload.preferredDashboardLanguage) : 1
    };

    const response = await apiClient.put(ENDPOINTS.ADMIN.ADMINS.UPDATE(id), body);
    return normalizeAdmin(response);
  },

  /**
   * 5. DELETE /api/admin/admins/{id}
   * Soft-delete administrator and revoke active tokens
   */
  async deleteAdmin(id) {
    return await apiClient.delete(ENDPOINTS.ADMIN.ADMINS.DELETE(id));
  },

  /**
   * 6. PATCH /api/admin/admins/{id}/status
   * Toggle administrator active/inactive status
   */
  async toggleStatus(id, isActive) {
    const body = { isActive: Boolean(isActive) };
    return await apiClient.patch(ENDPOINTS.ADMIN.ADMINS.STATUS(id), body);
  },

  /**
   * 7. PATCH /api/admin/admins/{id}/password
   * Reset administrator password (revokes active sessions)
   */
  async resetPassword(id, newPassword) {
    const body = { newPassword: String(newPassword || '') };
    return await apiClient.patch(ENDPOINTS.ADMIN.ADMINS.PASSWORD(id), body);
  },

  /**
   * 8. POST /api/admin/admins/promote-user/{userId}
   * Promote existing customer to administrator
   */
  async promoteUser(userId, payload = {}) {
    const body = {};
    if (payload.initialPassword && payload.initialPassword.trim()) {
      body.initialPassword = payload.initialPassword.trim();
    }
    if (payload.preferredDashboardLanguage !== undefined && payload.preferredDashboardLanguage !== null) {
      body.preferredDashboardLanguage = Number(payload.preferredDashboardLanguage);
    }

    const response = await apiClient.post(ENDPOINTS.ADMIN.ADMINS.PROMOTE_USER(userId), body);
    return normalizeAdmin(response);
  },

  /**
   * 9. POST /api/admin/admins/{id}/demote
   * Demote administrator back to customer
   */
  async demoteAdmin(id) {
    return await apiClient.post(ENDPOINTS.ADMIN.ADMINS.DEMOTE(id));
  }
};

export default adminManagementApi;
