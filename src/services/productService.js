import { productApi } from '../api/product.api';
import { liveCloudSync } from './liveCloudSync';

let memoryCatalog = [];

if (typeof window !== 'undefined') {
  window.addEventListener('arabian_sheikh_cloud_updated', () => {
    if (memoryCatalog && memoryCatalog.length > 0) {
      memoryCatalog = liveCloudSync.applyToProducts(memoryCatalog);
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

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      const cat = filters.category.toLowerCase().trim();
      if (cat === 'offers' || cat === 'discounts') {
        result = result.filter(p => p.hasDiscount || (p.discountPercent > 0) || (p.originalPrice && p.originalPrice > p.price) || p.isOffer);
      } else {
        result = result.filter(p => {
          const c = (p.category || p.categoryName || '').toLowerCase().trim();
          const catId = p.categoryId ? String(p.categoryId) : (p.category?.id ? String(p.category.id) : '');
          if (!c && !catId) return true;
          return c === cat || c.includes(cat) || cat.includes(c) || catId === cat ||
            (cat === 'perfumes' && (c === 'perfume' || catId === '1' || !c)) ||
            (cat === 'oils' && (c.includes('oil') || catId === '2')) ||
            (cat === 'bakhoor' && (c.includes('bakhoor') || c.includes('incense') || catId === '3')) ||
            (cat === 'cosmetics' && (c.includes('cosmetic') || catId === '4')) ||
            (cat === 'bundles' && (c.includes('bundle') || catId === '5'));
        });
      }
    }

    // Filter by perfume tier
    if (filters.tier && filters.tier !== 'all') {
      const targetTier = filters.tier.toLowerCase().trim();
      result = result.filter(p => {
        const t = (p.tier || p.perfumeCategoryName || '').toLowerCase().trim();
        return !t || t === targetTier;
      });
    }

    // Filter by gender
    if (filters.gender && filters.gender !== 'all') {
      const target = filters.gender.toLowerCase().trim();
      result = result.filter(p => {
        const pg = (p.gender || '').toLowerCase().trim();
        return !pg || pg === 'unisex' || pg === target ||
          (target === 'men' && (pg === 'male' || pg === 'masculine')) ||
          (target === 'women' && (pg === 'female' || pg === 'feminine'));
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
    return this.applyFilters(memoryCatalog, filters);
  },

  /**
   * Fresh, pure Live API fetch. Zero localStorage caching.
   */
  async getAllProducts(filters = {}) {
    try {
      const { gender, Gender, category, Category, categoryId, CategoryId, ...apiFilters } = filters;
      
      let response = null;
      if (filters.includeDrafts) {
        try {
          response = await productApi.adminGetProducts(apiFilters);
        } catch (adminErr) {
          console.warn('adminGetProducts fallback to public getProducts:', adminErr.message);
          response = await productApi.getProducts(apiFilters).catch(() => null);
        }
      } else {
        response = await productApi.getProducts(apiFilters);
      }

      let items = response?.items || (Array.isArray(response) ? response : []);
      items = liveCloudSync.applyToProducts(items.length > 0 ? items : memoryCatalog);
      if (items.length > 0) {
        memoryCatalog = items;
      }
      return this.applyFilters(memoryCatalog, filters);
    } catch (err) {
      console.warn('API getAllProducts error:', err.message);
      memoryCatalog = liveCloudSync.applyToProducts(memoryCatalog);
      return this.applyFilters(memoryCatalog, filters);
    }
  },

  getProductByIdSync(idOrSlug) {
    if (!idOrSlug) return null;
    return memoryCatalog.find(p => String(p.id) === String(idOrSlug) || p.slug === idOrSlug || String(p.numericId) === String(idOrSlug)) || null;
  },

  async getProductById(idOrSlug) {
    if (!idOrSlug) return null;

    const numId = Number(idOrSlug);
    if (!isNaN(numId) && numId > 0) {
      try {
        const remote = await productApi.getProductById(numId);
        if (remote) return liveCloudSync.applyToProducts([remote])[0] || remote;
      } catch (err) {
        console.warn('API getProductById fallback:', err.message);
      }
    }

    const all = await this.getAllProducts({ includeDrafts: true });
    return all.find(p => String(p.id) === String(idOrSlug) || p.slug === idOrSlug || String(p.numericId) === String(idOrSlug)) || null;
  },

  getFeaturedProductsSync(limit = 4) {
    return memoryCatalog.filter(p => p.featured).slice(0, limit);
  },

  async getFeaturedProducts(limit = 4) {
    const products = await this.getAllProducts();
    return products.filter(p => p.featured && (!p.status || p.status === 'ACTIVE')).slice(0, limit);
  },

  getProductsByCategorySync(category, limit) {
    const filtered = this.applyFilters(memoryCatalog, { category });
    return limit ? filtered.slice(0, limit) : filtered;
  },

  async getProductsByCategory(category, limit) {
    const products = await this.getAllProducts({ category });
    return limit ? products.slice(0, limit) : products;
  },

  getProductsByTierSync(tier, limit) {
    const filtered = this.applyFilters(memoryCatalog, { tier });
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
    const current = memoryCatalog.find(p => String(p.id) === String(currentId) || p.slug === currentId);
    if (!current) return memoryCatalog.slice(0, limit);
    return memoryCatalog.filter(p => (String(p.id) !== String(current.id)) && (!p.status || p.status === 'ACTIVE') && (p.category === current.category || p.tier === current.tier)).slice(0, limit);
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
  // Admin & Back-Office Live Database Mutations
  // ==========================================
  resolveTargetId(id) {
    if (typeof id === 'number' && !isNaN(id) && id > 0) return id;
    const num = Number(id);
    if (!isNaN(num) && num > 0) return num;
    const found = memoryCatalog.find(p => String(p.id) === String(id) || String(p.numericId) === String(id) || p.slug === id);
    if (found?.numericId && Number(found.numericId) > 0) return Number(found.numericId);
    if (found?.id && !isNaN(Number(found.id)) && Number(found.id) > 0) return Number(found.id);
    return null;
  },

  async createProduct(productData) {
    let created = null;
    try {
      created = await productApi.adminCreateProduct(productData);
    } catch (err) {
      console.warn('adminCreateProduct API fallback:', err.message);
      created = { ...productData, id: 'as-prod-' + Date.now() };
    }
    if (created?.id) {
      await liveCloudSync.addProduct(created).catch(() => {});
    }
    const all = await this.getAllProducts({ includeDrafts: true });
    return created;
  },

  async updateProduct(id, productData) {
    const targetId = this.resolveTargetId(id);
    const existing = memoryCatalog.find(p => String(p.id) === String(id) || String(p.numericId) === String(id) || p.slug === id) || {};
    
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
        console.warn('adminUpdateProduct API fallback:', err.message);
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
    const aliases = Array.from(new Set([
      String(id),
      targetId ? String(targetId) : null,
      existing.id ? String(existing.id) : null,
      existing.slug ? String(existing.slug) : null,
      existing.numericId ? String(existing.numericId) : null
    ].filter(Boolean)));

    for (const a of aliases) {
      await liveCloudSync.updateProduct(a, enrichedProductData).catch(() => {});
    }

    memoryCatalog = memoryCatalog.map(p => {
      const pAliases = [String(p.id), p.slug ? String(p.slug) : null, p.numericId ? String(p.numericId) : null].filter(Boolean);
      const isMatch = aliases.some(a => pAliases.includes(a));
      if (isMatch) {
        return { ...p, ...enrichedProductData };
      }
      return p;
    });

    return updatedRemote || enrichedProductData;
  },

  async deleteProduct(id) {
    const targetId = this.resolveTargetId(id);
    if (targetId) {
      try {
        await productApi.adminDeleteProduct(targetId);
      } catch (err) {
        console.warn('adminDeleteProduct API fallback:', err.message);
      }
    }
    await liveCloudSync.deleteProduct(id).catch(() => {});
    if (targetId) {
      await liveCloudSync.deleteProduct(targetId).catch(() => {});
    }
    memoryCatalog = memoryCatalog.filter(p => String(p.id) !== String(id) && (!targetId || String(p.numericId) !== String(targetId)));
    return true;
  },

  async toggleProductActive(id, isActive) {
    const targetId = this.resolveTargetId(id);
    const existing = memoryCatalog.find(p => String(p.id) === String(id) || String(p.numericId) === String(id) || p.slug === id) || {};
    
    if (targetId) {
      if (Boolean(isActive)) {
        await productApi.adminActivateProduct(targetId, existing).catch(() => {});
      } else {
        await productApi.adminDeactivateProduct(targetId, existing).catch(() => {});
      }
    }

    // Broadcast across all devices via live cloud sync
    const aliases = Array.from(new Set([id, targetId, existing.id, existing.slug, existing.numericId].filter(Boolean)));
    for (const a of aliases) {
      await liveCloudSync.setProductActive(a, isActive).catch(() => {});
    }

    memoryCatalog = memoryCatalog.map(p => {
      if (String(p.id) === String(id) || (targetId && String(p.numericId) === String(targetId)) || p.slug === id) {
        return { ...p, isActive: Boolean(isActive), status: isActive ? 'ACTIVE' : 'INACTIVE' };
      }
      return p;
    });

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
    return memoryCatalog.filter(p => 
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

