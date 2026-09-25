import { perfumeCategoryApi } from '../api/perfumeCategory.api';

// Purge any stale tier cache from localStorage
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('arabian_sheikh_perfume_tiers');
    localStorage.removeItem('arabian_sheikh_product_discounts');
  } catch {}
}

let liveTiers = [];

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
    return liveTiers;
  },

  getTierById(id) {
    if (!id) return null;
    return liveTiers.find(t => Number(t.id) === Number(id)) || null;
  },

  getTierByName(name) {
    if (!name) return null;
    const cleanName = String(name).trim().toLowerCase();
    return liveTiers.find(t => t.name?.toLowerCase() === cleanName) || null;
  },

  getTierByPrice(price) {
    if (price === undefined || price === null || isNaN(Number(price))) return null;
    const numPrice = Number(price);
    return liveTiers.find(t => Number(t.price) === numPrice) || null;
  },

  getTierForProduct(product) {
    if (!product) return null;

    // 1. Check if product has an explicit perfumeCategoryId
    const pcid = product.perfumeCategoryId || (product.perfumeCategory && typeof product.perfumeCategory === 'object' ? product.perfumeCategory.id : null);
    if (pcid) {
      const match = liveTiers.find(t => Number(t.id) === Number(pcid));
      if (match?.name) return match.name;
    }

    // 2. Check if product has perfumeCategoryName or perfumeCategory object name
    const catName = product.perfumeCategoryName || (product.perfumeCategory && typeof product.perfumeCategory === 'object' ? product.perfumeCategory.name : (typeof product.perfumeCategory === 'string' ? product.perfumeCategory : null));
    if (catName && typeof catName === 'string' && catName.trim()) {
      return catName.trim();
    }

    // 3. Check if product has product.tier
    if (product.tier && typeof product.tier === 'string' && product.tier.trim()) {
      return product.tier.trim();
    }

    return null;
  },

  getTierPrice(id) {
    const tier = this.getTierById(id);
    return tier && tier.price !== undefined ? Number(tier.price) : null;
  },

  async getStorePerfumeCategories() {
    try {
      const res = await this.getAdminPerfumeCategories({ pageSize: 100 });
      return res || { items: liveTiers };
    } catch {
      return { items: liveTiers };
    }
  },

  async getAdminPerfumeCategories(params = {}) {
    try {
      const response = await perfumeCategoryApi.adminGetPerfumeCategories(params);
      const items = response?.items || (Array.isArray(response) ? response : []);
      if (items.length > 0) {
        liveTiers = items;
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
      if (err?.status === 403 || err?.response?.status === 403 || err?.status === 401 || err?.response?.status === 401) {
        return {
          items: liveTiers,
          page: 1,
          pageSize: liveTiers.length,
          totalCount: liveTiers.length,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false
        };
      }
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
      const created = await perfumeCategoryApi.adminCreatePerfumeCategory({
        name: payload.name.trim(),
        price,
        notes: payload.notes ? payload.notes.trim() : null
      });
      if (created) {
        liveTiers = [...liveTiers.filter(t => t.id !== created.id), created];
      }
      return created;
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
      const updated = await perfumeCategoryApi.adminUpdatePerfumeCategory(id, {
        name: payload.name.trim(),
        price,
        notes: payload.notes ? payload.notes.trim() : null
      });
      const updatedItem = updated || { id, name: payload.name.trim(), price, notes: payload.notes ? payload.notes.trim() : null };
      liveTiers = liveTiers.map(t => Number(t.id) === Number(id) ? { ...t, ...updatedItem } : t);
      return updatedItem;
    } catch (err) {
      this.handleApiError(err, 'Failed to update perfume pricing tier.');
    }
  },

  async deletePerfumeCategory(id) {
    try {
      const res = await perfumeCategoryApi.adminDeletePerfumeCategory(id);
      liveTiers = liveTiers.filter(t => Number(t.id) !== Number(id));
      return res;
    } catch (err) {
      this.handleApiError(err, 'Failed to delete perfume pricing tier.');
    }
  }
};

export default perfumeCategoryService;
