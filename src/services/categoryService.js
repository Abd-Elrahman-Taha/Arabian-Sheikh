import { categoryApi } from '../api/category.api';

export const categoryService = {
  handleApiError(err, fallbackMessage = 'An unexpected error occurred.') {
    const status = err?.status || err?.response?.status;
    const data = err?.data || err?.response?.data || {};
    const code = data?.code || err?.code || '';
    let msg = data?.message || err?.message || fallbackMessage;

    // Field level validation error formatting
    if (code === 'VALIDATION_ERROR' && data?.errors) {
      const fieldErrors = Object.values(data.errors).flat().filter(Boolean);
      if (fieldErrors.length > 0) {
        msg = fieldErrors.join(' ');
      }
    }

    if (code === 'CATEGORY_NAME_ALREADY_EXISTS') {
      msg = 'A category with this name already exists. Please choose a different name.';
    } else if (code === 'CATEGORY_HAS_PRODUCTS' || (status === 409 && msg.toLowerCase().includes('products'))) {
      msg = 'Cannot delete this category because products or subcategories are still assigned to it. Please reassign them first.';
    } else if (code === 'CATEGORY_CANNOT_BE_DELETED' || status === 409 && msg.toLowerCase().includes('seeded')) {
      msg = 'Perfumes is a protected system category and cannot be deleted.';
    } else if (status === 403 || code === 'FORBIDDEN') {
      msg = 'You do not have permission to perform this category action.';
    } else if (status === 401 || code === 'UNAUTHORIZED') {
      msg = 'Session expired. Please sign in again.';
    }

    const finalErr = new Error(msg);
    finalErr.status = status;
    finalErr.code = code;
    finalErr.fieldErrors = data?.errors || null;
    throw finalErr;
  },

  async getAdminCategories(params = {}) {
    try {
      const response = await categoryApi.adminGetCategories(params);
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
      this.handleApiError(err, 'Failed to fetch categories.');
    }
  },

  async getCategoryById(id) {
    try {
      return await categoryApi.adminGetCategoryById(id);
    } catch (err) {
      this.handleApiError(err, 'Failed to load category details.');
    }
  },

  async createCategory(payload) {
    if (!payload.name || !payload.name.trim()) {
      throw new Error('Category name is required.');
    }
    if (payload.name.trim().length > 150) {
      throw new Error('Category name cannot exceed 150 characters.');
    }
    if (payload.description && payload.description.trim().length > 500) {
      throw new Error('Description cannot exceed 500 characters.');
    }

    try {
      return await categoryApi.adminCreateCategory(payload);
    } catch (err) {
      this.handleApiError(err, 'Failed to create category.');
    }
  },

  async updateCategory(id, payload) {
    if (!payload.name || !payload.name.trim()) {
      throw new Error('Category name is required.');
    }
    if (payload.name.trim().length > 150) {
      throw new Error('Category name cannot exceed 150 characters.');
    }
    if (payload.description && payload.description.trim().length > 500) {
      throw new Error('Description cannot exceed 500 characters.');
    }

    try {
      return await categoryApi.adminUpdateCategory(id, payload);
    } catch (err) {
      this.handleApiError(err, 'Failed to update category.');
    }
  },

  async deleteCategory(id) {
    if (Number(id) === 1) {
      throw new Error('Perfumes is a protected system category and cannot be deleted.');
    }
    try {
      return await categoryApi.adminDeleteCategory(id);
    } catch (err) {
      this.handleApiError(err, 'Failed to delete category.');
    }
  },

  async getStoreCategories(language = 'en') {
    try {
      return await categoryApi.getCategories(language);
    } catch (err) {
      console.warn('Failed to load storefront categories:', err.message);
      return [];
    }
  },

  async getStoreSubcategories(categoryId, language = 'en') {
    if (!categoryId) return [];
    try {
      return await categoryApi.getSubcategories(categoryId, language);
    } catch (err) {
      console.warn(`Failed to load subcategories for category ${categoryId}:`, err.message);
      return [];
    }
  }
};

export default categoryService;
