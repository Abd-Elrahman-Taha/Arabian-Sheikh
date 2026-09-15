import { perfumeCategoryApi } from '../api/perfumeCategory.api';

const DEFAULT_TIERS = [
  { id: 1, name: 'Standard', price: 100, notes: 'Standard Perfume Tier' },
  { id: 2, name: 'Premium', price: 150, notes: 'Premium Perfume Tier' },
  { id: 3, name: 'Luxury', price: 300, notes: 'Luxury Perfume Tier' }
];

let cachedTiers = [...DEFAULT_TIERS];

export const perfumeCategoryService = {
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

    if (code === 'PERFUME_CATEGORY_NAME_ALREADY_EXISTS') {
      msg = 'A perfume pricing tier with this name already exists.';
    } else if (code === 'PERFUME_CATEGORY_HAS_PRODUCTS' || (status === 409 && msg.toLowerCase().includes('products'))) {
      msg = 'Cannot delete this pricing tier because perfume products are currently referencing it. Please reassign those perfumes first.';
    } else if (status === 403 || code === 'FORBIDDEN') {
      msg = 'You do not have permission to modify perfume pricing tiers.';
    } else if (status === 401 || code === 'UNAUTHORIZED') {
      msg = 'Session expired. Please sign in again.';
    }

    const finalErr = new Error(msg);
    finalErr.status = status;
    finalErr.code = code;
    finalErr.fieldErrors = data?.errors || null;
    throw finalErr;
  },

  getCachedTiers() {
    return cachedTiers;
  },

  getTierById(id) {
    if (!id) return null;
    return cachedTiers.find(t => Number(t.id) === Number(id)) || null;
  },

  getTierPrice(id) {
    const tier = this.getTierById(id);
    return tier && tier.price !== undefined ? Number(tier.price) : null;
  },

  async getAdminPerfumeCategories(params = {}) {
    try {
      const response = await perfumeCategoryApi.adminGetPerfumeCategories(params);
      const items = response?.items || (Array.isArray(response) ? response : []);
      if (items.length > 0) {
        cachedTiers = items;
      }
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
      this.handleApiError(err, 'Failed to fetch perfume pricing tiers.');
    }
  },

  async getPerfumeCategoryById(id) {
    try {
      return await perfumeCategoryApi.adminGetPerfumeCategoryById(id);
    } catch (err) {
      this.handleApiError(err, 'Failed to load pricing tier details.');
    }
  },

  async createPerfumeCategory(payload) {
    if (!payload.name || !payload.name.trim()) {
      throw new Error('Pricing tier name is required.');
    }
    const price = Number(payload.price);
    if (isNaN(price) || price < 0) {
      throw new Error('A valid non-negative price is required.');
    }

    try {
      return await perfumeCategoryApi.adminCreatePerfumeCategory({
        name: payload.name.trim(),
        price,
        notes: payload.notes ? payload.notes.trim() : null
      });
    } catch (err) {
      this.handleApiError(err, 'Failed to create perfume pricing tier.');
    }
  },

  async updatePerfumeCategory(id, payload) {
    if (!payload.name || !payload.name.trim()) {
      throw new Error('Pricing tier name is required.');
    }
    const price = Number(payload.price);
    if (isNaN(price) || price < 0) {
      throw new Error('A valid non-negative price is required.');
    }

    try {
      return await perfumeCategoryApi.adminUpdatePerfumeCategory(id, {
        name: payload.name.trim(),
        price,
        notes: payload.notes ? payload.notes.trim() : null
      });
    } catch (err) {
      this.handleApiError(err, 'Failed to update perfume pricing tier.');
    }
  },

  async deletePerfumeCategory(id) {
    try {
      return await perfumeCategoryApi.adminDeletePerfumeCategory(id);
    } catch (err) {
      this.handleApiError(err, 'Failed to delete perfume pricing tier.');
    }
  }
};

export default perfumeCategoryService;
