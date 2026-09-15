import apiClient from './client';
import ENDPOINTS from './endpoints';

export const categoryApi = {
  /**
   * Customer: Get Categories
   * GET /api/categories?language={language}
   */
  async getCategories(language = 'en') {
    const lang = String(language || 'en').toLowerCase().trim();
    const response = await apiClient.get(ENDPOINTS.CATEGORIES.LIST, {
      params: { language: lang },
      requiresAuth: false
    });
    return response?.items || (Array.isArray(response) ? response : []);
  },

  /**
   * Customer: Get Category Details
   * GET /api/categories/{id}?language={language}
   */
  async getCategoryById(id, language = 'en') {
    const lang = String(language || 'en').toLowerCase().trim();
    return await apiClient.get(ENDPOINTS.CATEGORIES.DETAILS(id), {
      params: { language: lang },
      requiresAuth: false
    });
  },

  /**
   * Customer: Get Subcategories for a category
   * GET /api/categories/{categoryId}/subcategories?language={language}
   */
  async getSubcategories(categoryId, language = 'en') {
    const lang = String(language || 'en').toLowerCase().trim();
    const response = await apiClient.get(ENDPOINTS.CATEGORIES.SUBCATEGORIES(categoryId), {
      params: { language: lang },
      requiresAuth: false
    });
    return response?.items || (Array.isArray(response) ? response : []);
  },

  /**
   * Admin: List Categories with query params
   * GET /api/admin/categories
   */
  async adminGetCategories(params = {}) {
    const query = {};
    if (params.page) query.page = Number(params.page);
    if (params.pageSize) query.pageSize = Number(params.pageSize);
    if (params.search && params.search.trim()) query.search = params.search.trim();
    if (params.isActive !== undefined && params.isActive !== null && params.isActive !== '') {
      query.isActive = Boolean(params.isActive);
    }
    if (params.sortBy) query.sortBy = params.sortBy;
    if (params.sortDirection) query.sortDirection = params.sortDirection;

    const response = await apiClient.get(ENDPOINTS.ADMIN.CATEGORIES.LIST, { params: query });
    return response;
  },

  /**
   * Admin: Get single Category
   * GET /api/admin/categories/{id}
   */
  async adminGetCategoryById(id) {
    return await apiClient.get(ENDPOINTS.ADMIN.CATEGORIES.DETAILS(id));
  },

  /**
   * Admin: Create Category
   * POST /api/admin/categories
   * Body: { name, description, isActive }
   * NOTE: No price field!
   */
  async adminCreateCategory(payload) {
    const body = {
      name: String(payload.name || '').trim(),
      description: payload.description ? String(payload.description).trim() : null,
      isActive: payload.isActive !== false
    };
    return await apiClient.post(ENDPOINTS.ADMIN.CATEGORIES.CREATE, body);
  },

  /**
   * Admin: Update Category
   * PUT /api/admin/categories/{id}
   */
  async adminUpdateCategory(id, payload) {
    const body = {
      name: String(payload.name || '').trim(),
      description: payload.description ? String(payload.description).trim() : null,
      isActive: payload.isActive !== false
    };
    return await apiClient.put(ENDPOINTS.ADMIN.CATEGORIES.UPDATE(id), body);
  },

  /**
   * Admin: Delete Category
   * DELETE /api/admin/categories/{id}
   */
  async adminDeleteCategory(id) {
    return await apiClient.delete(ENDPOINTS.ADMIN.CATEGORIES.DELETE(id));
  },

  /**
   * Admin: Update Translation
   * PUT /api/admin/categories/{id}/translations/{languageCode}
   */
  async adminUpdateTranslation(id, languageCode, payload) {
    return await apiClient.put(
      ENDPOINTS.ADMIN.CATEGORIES.UPDATE_TRANSLATION(id, languageCode),
      payload
    );
  }
};

export default categoryApi;
