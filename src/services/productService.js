import { productApi } from '../api/product.api';
import { liveCloudSync } from './liveCloudSync';

const PRODUCTS_STORAGE_KEY = 'arabian_sheikh_cached_catalog_v2';

function loadInitialCatalog() {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
  }
  return [];
}

let cachedProducts = loadInitialCatalog();

function persistCatalog(items) {
  if (Array.isArray(items) && items.length > 0) {
    cachedProducts = items;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(items));
      } catch {}
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('arabian_sheikh_cloud_updated', () => {
    if (cachedProducts && cachedProducts.length > 0) {
      cachedProducts = liveCloudSync.applyToProducts(cachedProducts);
      persistCatalog(cachedProducts);
    }
  });
}

export const productService = {
  /**
   * Filter an array of products locally using supplied filter parameters.
   */
  applyFilters(items, filters = {}) {
    let result = Array.isArray(items) ? [...items] : [];

    // Filter by search query
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(q) ||
        p.arabicName?.includes(q) ||
        p.bulgarianName?.toLowerCase().includes(q) ||
        p.spanishName?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.fragranceFamily?.toLowerCase().includes(q) ||
        p.scentFamily?.toLowerCase().includes(q) ||
        (p.topNotes && p.topNotes.some(n => String(n).toLowerCase().includes(q))) ||
        (p.heartNotes && p.heartNotes.some(n => String(n).toLowerCase().includes(q))) ||
        (p.baseNotes && p.baseNotes.some(n => String(n).toLowerCase().includes(q)))
      );
    }

    // Filter by category only if strictly requested
    if (filters.category && filters.category !== 'all') {
      const cat = filters.category.toLowerCase().trim();
      if (cat === 'offers' || cat === 'discounts') {
        result = result.filter(p => p.hasDiscount || (p.discountPercent > 0) || (p.originalPrice && p.originalPrice > p.price) || p.isOffer);
      } else {
        result = result.filter(p => {
          const c = (p.category || p.categoryName || '').toLowerCase();
          return !c || c === 'all' || c === cat || c.includes(cat) || cat.includes(c);
        });
      }
    }

    // Filter by perfume tier
    if (filters.tier && filters.tier !== 'all') {
      const targetTier = filters.tier.toLowerCase();
      result = result.filter(p => {
        const t = (p.tier || p.perfumeCategoryName || '').toLowerCase();
        return !t || t === targetTier;
      });
    }

    // Filter by gender
    if (filters.gender && filters.gender !== 'all') {
      const target = filters.gender.toLowerCase();
      result = result.filter(p => {
        const pg = (p.gender || '').toLowerCase();
        return !pg || pg === 'unisex' || pg === target ||
          (target === 'men' && pg === 'male') ||
          (target === 'women' && pg === 'female');
      });
    }

    // Status filter
    if (filters.status && filters.status !== 'ALL') {
      result = result.filter(p => p.status === filters.status);
    } else if (!filters.includeDrafts) {
      result = result.filter(p => p.isActive !== false && p.status !== 'INACTIVE');
    }

    // Sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-low':
          result.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        case 'price-high':
          result.sort((a, b) => (b.price || 0) - (a.price || 0));
          break;
        case 'rating':
          result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'newest':
          result.reverse();
          break;
        case 'featured':
        default:
          break;
      }
    }

    return result;
  },

  getAllProductsSync(filters = {}) {
    return this.applyFilters(cachedProducts, filters);
  },

  /**
   * Fetch all products directly from the API database only with real-time cloud overrides.
   */
  async getAllProducts(filters = {}) {
    try {
      const { gender, Gender, category, Category, categoryId, CategoryId, ...apiFilters } = filters;
      
      let response = null;
      if (filters.includeDrafts) {
        try {
          response = await productApi.adminGetProducts(apiFilters);
        } catch (adminErr) {
          console.warn('adminGetProducts failed, fetching public products:', adminErr.message);
          response = await productApi.getProducts(apiFilters).catch(() => null);
        }
      } else {
        response = await productApi.getProducts(apiFilters);
      }

      const items = response?.items || (Array.isArray(response) ? response : []);
      if (items.length > 0) {
        cachedProducts = items;
        persistCatalog(items);
      }
      return this.applyFilters(cachedProducts, filters);
    } catch (err) {
      console.warn('API getProducts error:', err.message);
      return this.applyFilters(cachedProducts, filters);
    }
  },

  getProductByIdSync(idOrSlug) {
    if (!idOrSlug) return null;
    return cachedProducts.find(p => String(p.id) === String(idOrSlug) || p.slug === idOrSlug || String(p.numericId) === String(idOrSlug)) || null;
  },

  async getProductById(idOrSlug) {
    if (!idOrSlug) return null;

    const numId = Number(idOrSlug);
    if (!isNaN(numId) && numId > 0) {
      try {
        const remote = await productApi.getProductById(numId);
        if (remote) return remote;
      } catch (err) {
        console.warn('API getProductById fallback:', err.message);
      }
    }

    const all = await this.getAllProducts({ includeDrafts: true });
    return all.find(p => String(p.id) === String(idOrSlug) || p.slug === idOrSlug || String(p.numericId) === String(idOrSlug)) || null;
  },

  getFeaturedProductsSync(limit = 4) {
    return cachedProducts.filter(p => p.featured).slice(0, limit);
  },

  async getFeaturedProducts(limit = 4) {
    const products = await this.getAllProducts();
    return products.filter(p => p.featured && (!p.status || p.status === 'ACTIVE')).slice(0, limit);
  },

  getProductsByCategorySync(category, limit) {
    const filtered = this.applyFilters(cachedProducts, { category });
    return limit ? filtered.slice(0, limit) : filtered;
  },

  async getProductsByCategory(category, limit) {
    const products = await this.getAllProducts({ category });
    return limit ? products.slice(0, limit) : products;
  },

  getProductsByTierSync(tier, limit) {
    const filtered = this.applyFilters(cachedProducts, { tier });
    return limit ? filtered.slice(0, limit) : filtered;
  },

  async getProductsByTier(tier, limit) {
    const products = await this.getAllProducts({ tier });
    return limit ? products.slice(0, limit) : products;
  },

  async getPerfumes() {
    const products = await this.getAllProducts({ category: 'perfumes' });
    return products.filter(p => !p.status || p.status === 'ACTIVE');
  },

  async getOils() {
    const products = await this.getAllProducts({ category: 'oils' });
    return products.filter(p => !p.status || p.status === 'ACTIVE');
  },

  async getBakhoor() {
    const products = await this.getAllProducts({ category: 'bakhoor' });
    return products.filter(p => !p.status || p.status === 'ACTIVE');
  },

  async getCosmetics() {
    const products = await this.getAllProducts({ category: 'cosmetics' });
    return products.filter(p => !p.status || p.status === 'ACTIVE');
  },

  async getBundles() {
    const products = await this.getAllProducts({ category: 'bundles' });
    return products.filter(p => !p.status || p.status === 'ACTIVE');
  },

  async getRelatedProducts(currentId, limit = 4) {
    const all = await this.getAllProducts();
    const current = all.find(p => String(p.id) === String(currentId) || p.slug === currentId);
    if (!current) return all.slice(0, limit);
    return all.filter(p => (String(p.id) !== String(current.id)) && (!p.status || p.status === 'ACTIVE') && (p.category === current.category || p.tier === current.tier)).slice(0, limit);
  },

  getRelatedProductsSync(currentId, limit = 4) {
    const current = cachedProducts.find(p => String(p.id) === String(currentId) || p.slug === currentId);
    if (!current) return cachedProducts.slice(0, limit);
    return cachedProducts.filter(p => (String(p.id) !== String(current.id)) && (!p.status || p.status === 'ACTIVE') && (p.category === current.category || p.tier === current.tier)).slice(0, limit);
  },

  async searchProducts(query, limit = 10) {
    if (!query) return [];
    const all = await this.getAllProducts();
    return this.applyFilters(all, { search: query }).slice(0, limit);
  },

  async addReview(productId, review) {
    return await productApi.addReview(productId, review);
  },

  // ==========================================
  // Admin & Back-Office API Integration
  // ==========================================
  resolveTargetId(id) {
    if (typeof id === 'number' && !isNaN(id) && id > 0) return id;
    const num = Number(id);
    if (!isNaN(num) && num > 0) return num;
    const found = cachedProducts.find(p => String(p.id) === String(id) || String(p.numericId) === String(id) || p.slug === id);
    if (found?.numericId && Number(found.numericId) > 0) return Number(found.numericId);
    if (found?.id && !isNaN(Number(found.id)) && Number(found.id) > 0) return Number(found.id);
    return null;
  },

  async createProduct(productData) {
    const created = await productApi.adminCreateProduct(productData);
    if (created?.id) {
      await liveCloudSync.addProduct(created).catch(() => {});
    }
    const all = await this.getAllProducts({ includeDrafts: true });
    return created;
  },

  async updateProduct(id, productData) {
    const targetId = this.resolveTargetId(id);
    const existing = cachedProducts.find(p => String(p.id) === String(id) || String(p.numericId) === String(id) || p.slug === id) || {};
    
    const isPerfume = Boolean(
      productData.perfumeCategoryId ||
      (existing?.perfumeCategoryId) ||
      productData.category === 'perfumes' ||
      existing?.category === 'perfumes' ||
      productData.tier ||
      existing?.tier ||
      Number(productData.categoryId || existing?.categoryId) === 1
    );

    let perfumeCatId = productData.perfumeCategoryId;
    if (!perfumeCatId) {
      const tierName = productData.tier || existing?.tier;
      if (tierName === 'Royal') perfumeCatId = 2;
      else if (tierName === 'Classic') perfumeCatId = 3;
      else if (isPerfume) perfumeCatId = 1;
    }

    let updatedRemote = null;
    if (targetId) {
      const mergedPayload = {
        brandId: Number(productData.brandId || existing?.brandId) || 1,
        categoryId: Number(productData.categoryId || existing?.categoryId) || (isPerfume ? 1 : 2),
        subcategoryId: productData.subcategoryId !== undefined ? productData.subcategoryId : (existing?.subcategoryId || null),
        perfumeCategoryId: isPerfume ? Number(perfumeCatId) : null,
        gender: productData.gender || existing?.gender || 'Unisex',
        price: Number(productData.price !== undefined ? productData.price : (existing?.price || 0)),
        isActive: productData.isActive !== undefined ? Boolean(productData.isActive) : (existing?.isActive !== false),
        imageUrl: productData.imageUrl || productData.image || existing?.imageUrl || existing?.image || (existing?.images?.[0]),
        name: productData.name || existing?.name,
        description: productData.description || existing?.description,
        ingredients: productData.ingredients || existing?.ingredients
      };

      try {
        updatedRemote = await productApi.adminUpdateProduct(targetId, mergedPayload);
      } catch (err) {
        console.error('[Live API Error] adminUpdateProduct failed:', err);
        throw err;
      }
    }

    // Compute final prices and discount fields
    let finalHasDiscount = productData.hasDiscount !== undefined ? Boolean(productData.hasDiscount) : Boolean(existing?.hasDiscount);
    let finalDiscountPct = productData.discountPercent !== undefined ? Number(productData.discountPercent) : (Number(existing?.discountPercent) || 0);
    let finalOriginalPrice = productData.originalPrice !== undefined ? productData.originalPrice : existing?.originalPrice;
    let finalPrice = productData.price !== undefined ? Number(productData.price) : Number(existing?.price || 0);

    if (finalDiscountPct > 0 && finalHasDiscount) {
      const basePrice = finalOriginalPrice ? Number(finalOriginalPrice) : finalPrice;
      finalOriginalPrice = basePrice;
      finalPrice = Math.round(basePrice * (1 - finalDiscountPct / 100));
      finalHasDiscount = true;
    } else if (finalDiscountPct === 0 || !finalHasDiscount) {
      if (finalOriginalPrice) finalPrice = Number(finalOriginalPrice);
      finalHasDiscount = false;
      finalDiscountPct = 0;
    }

    const tierValue = productData.tier || existing?.tier || (isPerfume ? 'Luxury' : null);

    const enrichedProductData = {
      ...productData,
      tier: tierValue,
      perfumeCategoryName: tierValue,
      perfumeCategoryId: isPerfume ? Number(perfumeCatId) : null,
      hasDiscount: finalHasDiscount,
      discountPercent: finalDiscountPct,
      isOffer: finalHasDiscount,
      price: finalPrice,
      originalPrice: finalHasDiscount ? finalOriginalPrice : null
    };

    // Broadcast across all devices via live cloud sync
    await liveCloudSync.updateProduct(id, enrichedProductData).catch(() => {});
    if (targetId) {
      await liveCloudSync.updateProduct(targetId, enrichedProductData).catch(() => {});
    }

    // Update local cache & persistent storage
    const updatedList = cachedProducts.map(p => {
      if (String(p.id) === String(id) || (targetId && String(p.numericId) === String(targetId)) || p.slug === id) {
        return { ...p, ...enrichedProductData };
      }
      return p;
    });

    persistCatalog(updatedList);
    return updatedRemote || enrichedProductData;
  },

  async deleteProduct(id) {
    const targetId = this.resolveTargetId(id);
    if (targetId) {
      try {
        await productApi.adminDeleteProduct(targetId);
      } catch (err) {
        console.warn('adminDeleteProduct API error:', err.message);
      }
    }
    await liveCloudSync.deleteProduct(id).catch(() => {});
    if (targetId) {
      await liveCloudSync.deleteProduct(targetId).catch(() => {});
    }
    const updatedList = cachedProducts.filter(p => String(p.id) !== String(id) && (!targetId || String(p.numericId) !== String(targetId)));
    persistCatalog(updatedList);
    return true;
  },

  async toggleProductActive(id, isActive) {
    const targetId = this.resolveTargetId(id);
    const existing = cachedProducts.find(p => String(p.id) === String(id) || String(p.numericId) === String(id) || p.slug === id) || {};
    
    if (targetId) {
      if (Boolean(isActive)) {
        await productApi.adminActivateProduct(targetId, existing);
      } else {
        await productApi.adminDeactivateProduct(targetId, existing);
      }
    }

    // Clear and set in cloud sync for all aliases so status reflects everywhere instantly
    const aliases = Array.from(new Set([id, targetId, existing.id, existing.slug, existing.numericId].filter(Boolean)));
    for (const a of aliases) {
      await liveCloudSync.setProductActive(a, isActive).catch(() => {});
    }

    const updatedList = cachedProducts.map(p => {
      if (String(p.id) === String(id) || (targetId && String(p.numericId) === String(targetId)) || p.slug === id) {
        return { ...p, isActive: Boolean(isActive), status: isActive ? 'ACTIVE' : 'INACTIVE' };
      }
      return p;
    });

    persistCatalog(updatedList);
    return { id: targetId || id, isActive: Boolean(isActive) };
  },

  async updateStock(id, newStock) {
    const stockVal = Math.max(0, Number(newStock));
    return await this.updateProduct(id, { stock: stockVal });
  },

  async applyProductDiscount(id, discountPercent) {
    const pct = Math.max(1, Math.min(99, Number(discountPercent) || 10));
    return await this.updateProduct(id, {
      discountPercent: pct,
      hasDiscount: true,
      isOffer: true
    });
  },

  async removeProductDiscount(id) {
    return await this.updateProduct(id, {
      discountPercent: 0,
      hasDiscount: false,
      isOffer: false
    });
  },

  getDiscountedProductsSync() {
    return cachedProducts.filter(p => 
      (!p.status || p.status === 'ACTIVE') && (
        p.hasDiscount || 
        (p.discountPercent && p.discountPercent > 0) || 
        (p.originalPrice && p.originalPrice > p.price) ||
        p.isOffer
      )
    );
  }
};

export default productService;
