import apiClient, { resolveBaseUrl, tokenManager, ApiError } from './client';
import ENDPOINTS from './endpoints';
import {
  normalizeSalesReport,
  normalizeSalesProductItem,
  normalizeSalesCategoryItem,
  normalizeSalesCountryItem
} from './normalizers';

export const reportApi = {
  /**
   * Sales Overview KPIs & Financials
   * GET /api/admin/reports/sales
   * @param {object} params { period, from, to, status, productId, categoryId, brandId, country }
   */
  async getSalesReport(params = {}) {
    const query = {};
    if (params.period || params.Period) query.Period = String(params.period || params.Period).toLowerCase();
    if (params.from || params.From) query.From = String(params.from || params.From);
    if (params.to || params.To) query.To = String(params.to || params.To);
    if (params.status || params.Status) query.Status = String(params.status || params.Status);
    if (params.productId || params.ProductId) query.ProductId = Number(params.productId || params.ProductId);
    if (params.categoryId || params.CategoryId) query.CategoryId = Number(params.categoryId || params.CategoryId);
    if (params.brandId || params.BrandId) query.BrandId = Number(params.brandId || params.BrandId);
    if (params.country || params.Country) query.Country = String(params.country || params.Country).trim();

    const response = await apiClient.get(ENDPOINTS.ADMIN.REPORTS.SALES, {
      params: query,
      requiresAuth: true
    });

    return normalizeSalesReport(response);
  },

  /**
   * Sales by Product Breakdown (Paginated & Sortable)
   * GET /api/admin/reports/sales/products
   * @param {object} params { from, to, page, pageSize, sortBy, sortDirection }
   */
  async getSalesByProduct(params = {}) {
    const query = {};
    if (params.from || params.From) query.From = String(params.from || params.From);
    if (params.to || params.To) query.To = String(params.to || params.To);
    if (params.page || params.Page) query.Page = Number(params.page || params.Page);
    if (params.pageSize || params.PageSize) query.PageSize = Number(params.pageSize || params.PageSize);
    if (params.sortBy || params.SortBy) query.SortBy = String(params.sortBy || params.SortBy).toLowerCase();
    if (params.sortDirection || params.SortDirection) query.SortDirection = String(params.sortDirection || params.SortDirection).toLowerCase();

    const response = await apiClient.get(ENDPOINTS.ADMIN.REPORTS.SALES_PRODUCTS, {
      params: query,
      requiresAuth: true
    });

    const rawList = response?.items || (Array.isArray(response) ? response : []);
    return {
      items: rawList.map(normalizeSalesProductItem).filter(Boolean),
      page: Number(response?.page || 1),
      pageSize: Number(response?.pageSize || 20),
      totalCount: Number(response?.totalCount !== undefined ? response.totalCount : rawList.length),
      totalPages: Number(response?.totalPages || 1),
      hasPreviousPage: Boolean(response?.hasPreviousPage),
      hasNextPage: Boolean(response?.hasNextPage)
    };
  },

  /**
   * Sales by Category Breakdown (Unpaginated)
   * GET /api/admin/reports/sales/categories
   * @param {object} params { from, to }
   */
  async getSalesByCategory(params = {}) {
    const query = {};
    if (params.from || params.From) query.From = String(params.from || params.From);
    if (params.to || params.To) query.To = String(params.to || params.To);

    const response = await apiClient.get(ENDPOINTS.ADMIN.REPORTS.SALES_CATEGORIES, {
      params: query,
      requiresAuth: true
    });

    const rawList = response?.items || (Array.isArray(response) ? response : []);
    return {
      items: rawList.map(normalizeSalesCategoryItem).filter(Boolean)
    };
  },

  /**
   * Sales by Country Breakdown (Unpaginated)
   * GET /api/admin/reports/sales/countries
   * @param {object} params { from, to, country }
   */
  async getSalesByCountry(params = {}) {
    const query = {};
    if (params.from || params.From) query.From = String(params.from || params.From);
    if (params.to || params.To) query.To = String(params.to || params.To);
    if (params.country || params.Country) query.Country = String(params.country || params.Country).trim().toUpperCase();

    const response = await apiClient.get(ENDPOINTS.ADMIN.REPORTS.SALES_COUNTRIES, {
      params: query,
      requiresAuth: true
    });

    const rawList = response?.items || (Array.isArray(response) ? response : []);
    return {
      items: rawList.map(normalizeSalesCountryItem).filter(Boolean)
    };
  },

  /**
   * Download Sales Report File (CSV ZIP, XLSX, or PDF)
   * GET /api/admin/reports/sales/export
   * @param {object} params { format: 'csv'|'xlsx'|'pdf', from, to }
   */
  async downloadSalesExport(params = {}) {
    const format = String(params.format || 'csv').toLowerCase();
    const from = String(params.from || '').trim();
    const to = String(params.to || '').trim();

    if (!from || !to) {
      throw new Error('From and To dates are required for export.');
    }

    const query = new URLSearchParams({
      Format: format,
      From: from,
      To: to
    });

    const baseUrl = resolveBaseUrl();
    const cleanEndpoint = ENDPOINTS.ADMIN.REPORTS.SALES_EXPORT.startsWith('/')
      ? ENDPOINTS.ADMIN.REPORTS.SALES_EXPORT
      : `/${ENDPOINTS.ADMIN.REPORTS.SALES_EXPORT}`;
    const url = `${baseUrl}${cleanEndpoint}?${query.toString()}`;

    // Ensure valid admin token
    await tokenManager.ensureAdminToken();
    const token = tokenManager.getToken(true);

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new ApiError('Admin authentication is required.', 401, null, 'UNAUTHORIZED');
      }
      if (response.status === 403) {
        throw new ApiError('The current Admin access level cannot perform this action.', 403, null, 'FORBIDDEN');
      }
      if (response.status === 422) {
        const body = await response.json().catch(() => null);
        throw new ApiError(
          body?.message || 'Sales exports support EUR only; the selected range contains an order in another currency.',
          422,
          body,
          body?.code || 'UNSUPPORTED_REPORT_CURRENCY'
        );
      }
      const body = await response.json().catch(() => null);
      throw new ApiError(
        body?.message || `Export failed with status ${response.status}`,
        response.status,
        body,
        body?.code || `HTTP_${response.status}`
      );
    }

    // Determine filename from Content-Disposition header
    const disposition = response.headers.get('Content-Disposition') || '';
    const filenameMatch = disposition.match(/filename="?([^";]+)"?/);
    const defaultExtension = format === 'csv' ? 'zip' : format;
    const filename = filenameMatch?.[1] || `sales-report_${from}_${to}.${defaultExtension}`;

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);

    return { filename, success: true };
  }
};

export default reportApi;
