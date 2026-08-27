import apiClient from './client';
import ENDPOINTS from './endpoints';
import { normalizeObjectKeys } from './normalizers';

export const analyticsApi = {
  /**
   * Admin Dashboard Overview KPIs
   * GET /api/admin/dashboard/overview
   */
  async getOverview(params = {}) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.DASHBOARD.OVERVIEW, { params });
    return normalizeObjectKeys(response);
  },

  /**
   * Admin Dashboard Period Comparison
   * GET /api/admin/dashboard/compare
   */
  async getPeriodComparison(params = {}) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.DASHBOARD.COMPARE, { params });
    return normalizeObjectKeys(response);
  },

  /**
   * Admin Sales Report
   * GET /api/admin/reports/sales
   */
  async getSalesReport(params = {}) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.REPORTS.SALES, { params });
    return normalizeObjectKeys(response);
  },

  /**
   * Sales by Product
   * GET /api/admin/reports/sales/products
   */
  async getSalesByProduct(params = {}) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.REPORTS.SALES_BY_PRODUCT, { params });
    return normalizeObjectKeys(response);
  },

  /**
   * Sales by Category
   * GET /api/admin/reports/sales/categories
   */
  async getSalesByCategory(params = {}) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.REPORTS.SALES_BY_CATEGORY, { params });
    return normalizeObjectKeys(response);
  },

  /**
   * Sales by Brand
   * GET /api/admin/reports/sales/brands
   */
  async getSalesByBrand(params = {}) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.REPORTS.SALES_BY_BRAND, { params });
    return normalizeObjectKeys(response);
  },

  /**
   * Export Sales Report (csv | xlsx | pdf)
   * GET /api/admin/reports/sales/export
   */
  async exportSalesReport(params = {}) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.REPORTS.EXPORT, { params });
    return response;
  }
};

export default analyticsApi;
