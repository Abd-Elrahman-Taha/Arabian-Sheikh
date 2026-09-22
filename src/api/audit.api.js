import apiClient from './client';
import ENDPOINTS from './endpoints';
import { normalizeObjectKeys } from './normalizers';

/**
 * Arabian Sheikh - Admin Audit Logs API Client
 * Base Path: /api/admin/audit-logs
 * Required Policy: AdminCatalog / SuperAdmin
 */
export const auditApi = {
  /**
   * GET /api/admin/audit-logs
   * Fetch paginated list of audit logs with optional filters
   * 
   * @param {Object} params
   * @param {number} [params.page=1]
   * @param {number} [params.pageSize=20]
   * @param {number} [params.adminId]
   * @param {string} [params.action]
   * @param {string} [params.entityType]
   * @param {number} [params.entityId]
   * @param {string} [params.from] ISO date-time string
   * @param {string} [params.to] ISO date-time string
   */
  async getAuditLogs(params = {}) {
    const queryParams = {};

    if (params.page !== undefined && params.page !== null) {
      queryParams.Page = params.page;
    }
    if (params.pageSize !== undefined && params.pageSize !== null) {
      queryParams.PageSize = params.pageSize;
    }
    if (params.adminId !== undefined && params.adminId !== null && params.adminId !== '') {
      queryParams.AdminId = params.adminId;
    }
    if (params.action && params.action.trim()) {
      queryParams.Action = params.action.trim();
    }
    if (params.entityType && params.entityType.trim()) {
      queryParams.EntityType = params.entityType.trim();
    }
    if (params.entityId !== undefined && params.entityId !== null && params.entityId !== '') {
      queryParams.EntityId = params.entityId;
    }
    if (params.from && params.from.trim()) {
      queryParams.From = params.from.trim();
    }
    if (params.to && params.to.trim()) {
      queryParams.To = params.to.trim();
    }

    const response = await apiClient.get(ENDPOINTS.ADMIN.AUDIT_LOGS.LIST, {
      params: queryParams,
      requiresAuth: true
    });

    return normalizeObjectKeys(response);
  },

  /**
   * GET /api/admin/audit-logs/{id}
   * Fetch single audit log entry by ID
   * 
   * @param {number|string} id
   */
  async getAuditLogById(id) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.AUDIT_LOGS.DETAILS(id), {
      requiresAuth: true
    });

    return normalizeObjectKeys(response);
  }
};

export default auditApi;
