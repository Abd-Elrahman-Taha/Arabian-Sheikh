import apiClient from './client';
import ENDPOINTS from './endpoints';
import { normalizeObjectKeys, toAbsoluteUrl } from './normalizers';

export const brandApi = {
  /**
   * Get Brands (Public)
   * GET /api/brands
   */
  async getBrands(language = 'en') {
    const response = await apiClient.get(ENDPOINTS.BRANDS.LIST, {
      params: { language },
      requiresAuth: false
    });
    return response?.items || (Array.isArray(response) ? response : []);
  },

  /**
   * Get Brand Details (Public)
   * GET /api/brands/{id}
   */
  async getBrandById(id, language = 'en') {
    const response = await apiClient.get(ENDPOINTS.BRANDS.DETAILS(id), {
      params: { language },
      requiresAuth: false
    });
    return normalizeObjectKeys(response);
  },

  /**
   * Admin: List Brands
   * GET /api/admin/brands
   */
  async adminGetBrands(params = {}) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.BRANDS.LIST, { params });
    return response?.items || (Array.isArray(response) ? response : []);
  },

  /**
   * Admin: Create Brand
   * POST /api/admin/brands
   */
  async adminCreateBrand(payload) {
    const body = {
      name: payload.name || 'Arabian Sheikh',
      logoUrl: toAbsoluteUrl(payload.logoUrl || '/assets/arabian-sheikh-logo.svg'),
      isActive: payload.isActive !== false
    };
    const response = await apiClient.post(ENDPOINTS.ADMIN.BRANDS.CREATE, body);
    return normalizeObjectKeys(response);
  },

  /**
   * Admin: Get Brand by ID
   * GET /api/admin/brands/{id}
   */
  async adminGetBrandById(id) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.BRANDS.DETAILS(id));
    return normalizeObjectKeys(response);
  },

  /**
   * Admin: Update Brand
   * PUT /api/admin/brands/{id}
   */
  async adminUpdateBrand(id, payload) {
    const body = {
      name: payload.name || 'Arabian Sheikh',
      logoUrl: toAbsoluteUrl(payload.logoUrl || '/assets/arabian-sheikh-logo.svg'),
      isActive: payload.isActive !== false
    };
    const response = await apiClient.put(ENDPOINTS.ADMIN.BRANDS.UPDATE(id), body);
    return normalizeObjectKeys(response);
  },

  /**
   * Admin: Activate Brand
   * POST /api/admin/brands/{id}/activate
   */
  async adminActivateBrand(id) {
    return await apiClient.post(ENDPOINTS.ADMIN.BRANDS.ACTIVATE(id));
  },

  /**
   * Admin: Deactivate Brand
   * POST /api/admin/brands/{id}/deactivate
   */
  async adminDeactivateBrand(id) {
    return await apiClient.post(ENDPOINTS.ADMIN.BRANDS.DEACTIVATE(id));
  },

  /**
   * Admin: Delete Brand
   * DELETE /api/admin/brands/{id}
   */
  async adminDeleteBrand(id) {
    return await apiClient.delete(ENDPOINTS.ADMIN.BRANDS.DELETE(id));
  },

  /**
   * Admin: Update Brand Translation
   * PUT /api/admin/brands/{id}/translations/{languageCode}
   */
  async adminUpdateBrandTranslation(id, languageCode, payload) {
    return await apiClient.put(ENDPOINTS.ADMIN.BRANDS.UPDATE_TRANSLATION(id, languageCode), payload);
  }
};

export default brandApi;
