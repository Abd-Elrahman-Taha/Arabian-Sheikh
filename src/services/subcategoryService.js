import { subcategoryApi } from '../api/subcategory.api';

export const subcategoryService = {
  handleApiError(err, fallbackMessage = 'An unexpected error occurred.') {
    const status = err?.status || err?.response?.status;
    const data = err?.data || err?.response?.data || {};
    const code = data?.code || err?.code || '';
    let msg = data?.message || err?.message || fallbackMessage;

    if (code === 'VALIDATION_ERROR' && data?.errors) {
      const fieldErrors = Object.values(data.errors).flat().filter(Boolean);
      if (fieldErrors.length > 0) {
        msg = fieldErrors.join(' ');
      }
    }

    if (code === 'SUBCATEGORY_NAME_ALREADY_EXISTS') {
      msg = 'A subcategory with this name already exists in this parent category.';
    } else if (code === 'SUBCATEGORY_HAS_PRODUCTS' || (status === 409 && msg.toLowerCase().includes('products'))) {
      msg = 'Cannot delete this subcategory because products are assigned to it. Please reassign the products first.';
    } else if (status === 403 || code === 'FORBIDDEN') {
      msg = 'You do not have permission to perform this subcategory action.';
    } else if (status === 401 || code === 'UNAUTHORIZED') {
      msg = 'Session expired. Please sign in again.';
    }

    const finalErr = new Error(msg);
    finalErr.status = status;
    finalErr.code = code;
    finalErr.fieldErrors = data?.errors || null;
    throw finalErr;
  },

  async getAdminSubcategories(params = {}) {
    try {
      const response = await subcategoryApi.adminGetSubcategories(params);
      const items = response?.items || (Array.isArray(response) ? response : []);
      return {
        items,
        page: response?.page || 1,
        pageSize: response?.pageSize || 20,
        totalCount: response?.totalCount || items.length,
        totalPages: response?.totalPages || 1,
        hasPreviousPage: Boolean(response?.hasPreviousPage),
        hasNextPage: Boolean(response?.hasNextPage)
      };
    } catch (err) {
      this.handleApiError(err, 'Failed to fetch subcategories.');
    }
  },

  async getSubcategoryById(id) {
    try {
      return await subcategoryApi.adminGetSubcategoryById(id);
    } catch (err) {
      this.handleApiError(err, 'Failed to load subcategory details.');
    }
  },

  async createSubcategory(payload) {
    const catId = Number(payload.categoryId);
    if (!catId || isNaN(catId) || catId <= 0) {
      throw new Error('Please select a valid parent Category.');
    }
    if (!payload.name || !payload.name.trim()) {
      throw new Error('Subcategory name is required.');
    }
    if (payload.name.trim().length > 150) {
      throw new Error('Subcategory name cannot exceed 150 characters.');
    }

    try {
      return await subcategoryApi.adminCreateSubcategory({
        categoryId: catId,
        name: payload.name.trim(),
        isActive: payload.isActive !== false
      });
    } catch (err) {
      this.handleApiError(err, 'Failed to create subcategory.');
    }
  },

  async updateSubcategory(id, payload) {
    const catId = Number(payload.categoryId);
    if (!catId || isNaN(catId) || catId <= 0) {
      throw new Error('Please select a valid parent Category.');
    }
    if (!payload.name || !payload.name.trim()) {
      throw new Error('Subcategory name is required.');
    }
    if (payload.name.trim().length > 150) {
      throw new Error('Subcategory name cannot exceed 150 characters.');
    }

    try {
      return await subcategoryApi.adminUpdateSubcategory(id, {
        categoryId: catId,
        name: payload.name.trim(),
        isActive: payload.isActive !== false
      });
    } catch (err) {
      this.handleApiError(err, 'Failed to update subcategory.');
    }
  },

  async deleteSubcategory(id) {
    try {
      return await subcategoryApi.adminDeleteSubcategory(id);
    } catch (err) {
      this.handleApiError(err, 'Failed to delete subcategory.');
    }
  }
};

export default subcategoryService;
