import apiClient from './client';
import ENDPOINTS from './endpoints';

export const perfumeCategoryApi = {
  /**
   * Admin: List Perfume Pricing Tiers
   * GET /api/admin/perfume-categories
   */
  async adminGetPerfumeCategories(params = {}) {
    const query = {};
    if (params.page) query.page = Number(params.page);
    if (params.pageSize) query.pageSize = Number(params.pageSize);
    if (params.search && params.search.trim()) query.search = params.search.trim();

    const response = await apiClient.get(ENDPOINTS.ADMIN.PERFUME_CATEGORIES.LIST, { params: query });
    return response;
  },

  /**
   * Admin: Get Perfume Category by ID
   * GET /api/admin/perfume-categories/{id}
   */
  async adminGetPerfumeCategoryById(id) {
    return await apiClient.get(ENDPOINTS.ADMIN.PERFUME_CATEGORIES.DETAILS(id));
  },

  /**
   * Admin: Create Perfume Category
   * POST /api/admin/perfume-categories
   * Body: { name, price, notes }
   */
  async adminCreatePerfumeCategory(payload) {
    const body = {
      name: String(payload.name || '').trim(),
      price: Number(payload.price) || 0,
      notes: payload.notes ? String(payload.notes).trim() : null
    };
    return await apiClient.post(ENDPOINTS.ADMIN.PERFUME_CATEGORIES.CREATE, body);
  },

  /**
   * Admin: Update Perfume Category
   * PUT /api/admin/perfume-categories/{id}
   * Body: { name, price, notes }
   */
  async adminUpdatePerfumeCategory(id, payload) {
    const body = {
      name: String(payload.name || '').trim(),
      price: Number(payload.price) || 0,
      notes: payload.notes ? String(payload.notes).trim() : null
    };
    return await apiClient.put(ENDPOINTS.ADMIN.PERFUME_CATEGORIES.UPDATE(id), body);
  },

  /**
   * Admin: Delete Perfume Category
   * DELETE /api/admin/perfume-categories/{id}
   */
  async adminDeletePerfumeCategory(id) {
    return await apiClient.delete(ENDPOINTS.ADMIN.PERFUME_CATEGORIES.DELETE(id));
  }
};

export default perfumeCategoryApi;
