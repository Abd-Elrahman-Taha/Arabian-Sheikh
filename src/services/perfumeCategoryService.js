import { perfumeCategoryApi } from '../api/perfumeCategory.api';
import { tokenManager } from '../api/client';

// Purge any stale tier cache from localStorage
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('arabian_sheikh_perfume_tiers');
  } catch {}
}

let cachedTiers = [];

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
    if (typeof window !== 'undefined') {
      const stored = loadStoredTiers();
      if (stored && stored.length > 0) {
        cachedTiers = stored;
      }
    }
    return cachedTiers;
  },

  getTierById(id) {
    if (!id) return null;
    const tiers = this.getCachedTiers();
    return tiers.find(t => Number(t.id) === Number(id)) || null;
  },

  getTierByName(name) {
    if (!name) return null;
    const cleanName = String(name).trim().toLowerCase();
    const tiers = this.getCachedTiers();
    return tiers.find(t => t.name?.toLowerCase() === cleanName) || null;
  },

  getTierByPrice(price) {
    if (price === undefined || price === null || isNaN(Number(price))) return null;
    const numPrice = Number(price);
    const tiers = this.getCachedTiers();
    return tiers.find(t => Number(t.price) === numPrice) || null;
  },

  getTierForProduct(product) {
    if (!product) return null;
    const tiers = this.getCachedTiers();

    // 1. Check if product has an explicit perfumeCategoryId
    const pcid = product.perfumeCategoryId || (product.perfumeCategory && typeof product.perfumeCategory === 'object' ? product.perfumeCategory.id : null);
    if (pcid) {
      const match = tiers.find(t => Number(t.id) === Number(pcid));
      if (match) return match.name;
    }

    // 2. Check if product has perfumeCategoryName or perfumeCategory object name
    const catName = product.perfumeCategoryName || (product.perfumeCategory && typeof product.perfumeCategory === 'object' ? product.perfumeCategory.name : (typeof product.perfumeCategory === 'string' ? product.perfumeCategory : null));
    if (catName && typeof catName === 'string') {
      const match = tiers.find(t => t.name.toLowerCase() === catName.trim().toLowerCase());
      if (match) return match.name;
      return catName.trim();
    }

    // 3. Check if product has product.tier
    if (product.tier && typeof product.tier === 'string' && product.tier.trim()) {
      const match = tiers.find(t => t.name.toLowerCase() === product.tier.trim().toLowerCase());
      if (match) return match.name;
      return product.tier.trim();
    }

    // 4. Match against tier prices if it's a perfume
    const isPerfume = Number(product.categoryId) === 1 || product.category === 'perfume' || product.category === 'perfumes' || (product.category && typeof product.category === 'object' && Number(product.category.id) === 1);
    const price = Number(product.price);
    if (isPerfume && !isNaN(price) && price > 0) {
      const match = tiers.find(t => Number(t.price) === price);
      if (match) return match.name;
    }

    return null;
  },

  getTierPrice(id) {
    const tier = this.getTierById(id);
    return tier && tier.price !== undefined ? Number(tier.price) : null;
  },

  getStorePerfumeCategories() {
    return { items: this.getCachedTiers() };
  },

  async getAdminPerfumeCategories(params = {}) {
    // Only attempt admin fetch if an admin token is actually present
    const adminToken = tokenManager.getToken(true);
    if (!adminToken) {
      return {
        items: cachedTiers,
        page: 1,
        pageSize: cachedTiers.length,
        totalCount: cachedTiers.length,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false
      };
    }

    try {
      const response = await perfumeCategoryApi.adminGetPerfumeCategories(params);
      const items = response?.items || (Array.isArray(response) ? response : []);
      if (items.length > 0) {
        cachedTiers = items;
        saveStoredTiers(cachedTiers);
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
          items: cachedTiers,
          page: 1,
          pageSize: cachedTiers.length,
          totalCount: cachedTiers.length,
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
        cachedTiers = [...cachedTiers.filter(t => t.id !== created.id), created];
        saveStoredTiers(cachedTiers);
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
      cachedTiers = cachedTiers.map(t => Number(t.id) === Number(id) ? { ...t, ...updatedItem } : t);
      saveStoredTiers(cachedTiers);
      return updatedItem;
    } catch (err) {
      this.handleApiError(err, 'Failed to update perfume pricing tier.');
    }
  },

  async deletePerfumeCategory(id) {
    try {
      const res = await perfumeCategoryApi.adminDeletePerfumeCategory(id);
      cachedTiers = cachedTiers.filter(t => Number(t.id) !== Number(id));
      saveStoredTiers(cachedTiers);
      return res;
    } catch (err) {
      this.handleApiError(err, 'Failed to delete perfume pricing tier.');
    }
  }
};

export default perfumeCategoryService;
