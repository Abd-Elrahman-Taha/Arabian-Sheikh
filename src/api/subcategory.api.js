import apiClient from './client';
import ENDPOINTS from './endpoints';

export const subcategoryApi = {
  /**
   * Admin: List Subcategories
   * GET /api/admin/subcategories
   * Params: categoryId, page, pageSize, search, isActive, sortBy, sortDirection
   */
  async adminGetSubcategories(params = {}) {
    const query = {};
    if (params.categoryId) query.categoryId = Number(params.categoryId);
    if (params.page) query.page = Number(params.page);
    if (params.pageSize) query.pageSize = Number(params.pageSize);
    if (params.search && params.search.trim()) query.search = params.search.trim();
    if (params.isActive !== undefined && params.isActive !== null && params.isActive !== '') {
      query.isActive = Boolean(params.isActive);
    }
    if (params.sortBy) query.sortBy = params.sortBy;
    if (params.sortDirection) query.sortDirection = params.sortDirection;

    const response = await apiClient.get(ENDPOINTS.ADMIN.SUBCATEGORIES.LIST, { params: query });
    return response;
  },

  /**
   * Admin: Get Subcategory by ID
   * GET /api/admin/subcategories/{id}
   */
  async adminGetSubcategoryById(id) {
    return await apiClient.get(ENDPOINTS.ADMIN.SUBCATEGORIES.DETAILS(id));
  },

  /**
   * Admin: Create Subcategory
   * POST /api/admin/subcategories
   * Body: { categoryId, name, isActive }
   */
  async adminCreateSubcategory(payload) {
    const body = {
      categoryId: Number(payload.categoryId),
      name: String(payload.name || '').trim(),
      isActive: payload.isActive !== false
    };
    return await apiClient.post(ENDPOINTS.ADMIN.SUBCATEGORIES.CREATE, body);
  },

  /**
   * Admin: Update Subcategory
   * PUT /api/admin/subcategories/{id}
   * Body: { categoryId, name, isActive }
   */
  async adminUpdateSubcategory(id, payload) {
    const body = {
      categoryId: Number(payload.categoryId),
      name: String(payload.name || '').trim(),
      isActive: payload.isActive !== false
    };
    return await apiClient.put(ENDPOINTS.ADMIN.SUBCATEGORIES.UPDATE(id), body);
  },

  /**
   * Admin: Delete Subcategory
   * DELETE /api/admin/subcategories/{id}
   */
  async adminDeleteSubcategory(id) {
    return await apiClient.delete(ENDPOINTS.ADMIN.SUBCATEGORIES.DELETE(id));
  }
};

export default subcategoryApi;
