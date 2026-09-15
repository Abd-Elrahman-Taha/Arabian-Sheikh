import { brandApi } from '../api/brand.api';

export const brandService = {
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

    if (code === 'BRAND_NAME_ALREADY_EXISTS') {
      msg = 'A brand with this name already exists.';
    } else if (code === 'BRAND_HAS_PRODUCTS' || (status === 409 && msg.toLowerCase().includes('products'))) {
      msg = 'Cannot delete this brand because products are assigned to it.';
    }

    const finalErr = new Error(msg);
    finalErr.status = status;
    finalErr.code = code;
    finalErr.fieldErrors = data?.errors || null;
    throw finalErr;
  },

  async getStoreBrands(language = 'en') {
    try {
      return await brandApi.getBrands(language);
    } catch (err) {
      console.warn('Failed to load store brands:', err.message);
      return [];
    }
  },

  async getAdminBrands(params = {}) {
    try {
      const response = await brandApi.adminGetBrands(params);
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
      this.handleApiError(err, 'Failed to fetch brands.');
    }
  },

  async getBrandById(id) {
    try {
      return await brandApi.adminGetBrandById(id);
    } catch (err) {
      this.handleApiError(err, 'Failed to load brand details.');
    }
  },

  async createBrand(payload) {
    if (!payload.name || !payload.name.trim()) {
      throw new Error('Brand name is required.');
    }
    try {
      return await brandApi.adminCreateBrand(payload);
    } catch (err) {
      this.handleApiError(err, 'Failed to create brand.');
    }
  },

  async updateBrand(id, payload) {
    if (!payload.name || !payload.name.trim()) {
      throw new Error('Brand name is required.');
    }
    try {
      return await brandApi.adminUpdateBrand(id, payload);
    } catch (err) {
      this.handleApiError(err, 'Failed to update brand.');
    }
  },

  async deleteBrand(id) {
    try {
      return await brandApi.adminDeleteBrand(id);
    } catch (err) {
      this.handleApiError(err, 'Failed to delete brand.');
    }
  }
};

export default brandService;
