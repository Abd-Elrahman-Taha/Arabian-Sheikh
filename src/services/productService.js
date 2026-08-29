import { productApi } from '../api/product.api';

let cachedProducts = [];

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
   * Fetch all products directly from the API database only.
   * Zero local mock products returned.
   */
  async getAllProducts(filters = {}) {
    try {
      const { gender, Gender, category, Category, categoryId, CategoryId, ...apiFilters } = filters;
      
      let response;
      if (filters.includeDrafts) {
        response = await productApi.adminGetProducts(apiFilters);
      } else {
        response = await productApi.getProducts(apiFilters);
      }

      const items = response?.items || (Array.isArray(response) ? response : []);
      cachedProducts = Array.isArray(items) ? items : [];
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
  async createProduct(productData) {
    const created = await productApi.adminCreateProduct(productData);
    cachedProducts = [];
    return created;
  },

  async updateProduct(id, productData) {
    const targetId = Number(id);
    if (!isNaN(targetId) && targetId > 0) {
      const current = await productApi.adminGetProductById(targetId).catch(() => null);
      const mergedPayload = {
        brandId: productData.brandId || current?.brandId,
        categoryId: productData.categoryId || current?.categoryId,
        subcategoryId: productData.subcategoryId !== undefined ? productData.subcategoryId : (current?.subcategoryId || null),
        perfumeCategoryId: productData.perfumeCategoryId !== undefined ? productData.perfumeCategoryId : (current?.perfumeCategoryId || null),
        gender: productData.gender || current?.gender || 'Unisex',
        price: productData.price !== undefined ? productData.price : current?.price,
        isActive: productData.isActive !== undefined ? productData.isActive : (current?.isActive !== false),
        imageUrl: productData.imageUrl || productData.image || current?.imageUrl || current?.image || (current?.images?.[0]),
        name: productData.name || current?.name,
        description: productData.description || current?.description,
        ingredients: productData.ingredients || current?.ingredients,
        discountPercent: productData.discountPercent !== undefined ? productData.discountPercent : current?.discountPercent,
        hasDiscount: productData.hasDiscount !== undefined ? productData.hasDiscount : current?.hasDiscount,
        isOffer: productData.isOffer !== undefined ? productData.isOffer : current?.isOffer
      };
      const updated = await productApi.adminUpdateProduct(targetId, mergedPayload);
      cachedProducts = [];
      return updated;
    }
    throw new Error('Invalid product database ID.');
  },

  async deleteProduct(id) {
    const targetId = Number(id);
    if (!isNaN(targetId) && targetId > 0) {
      await productApi.adminDeleteProduct(targetId);
      cachedProducts = [];
      return true;
    }
    throw new Error('Invalid product database ID.');
  },

  async toggleProductActive(id, isActive) {
    const targetId = Number(id);
    if (!isNaN(targetId) && targetId > 0) {
      if (Boolean(isActive)) {
        await productApi.adminActivateProduct(targetId);
      } else {
        await productApi.adminDeactivateProduct(targetId);
      }
      cachedProducts = [];
      return { id: targetId, isActive: Boolean(isActive) };
    }
    throw new Error('Invalid product database ID.');
  },

  async updateStock(id, newStock) {
    const stockVal = Math.max(0, Number(newStock));
    return await this.updateProduct(id, { stock: stockVal });
  },

  async applyProductDiscount(id, discountPercent) {
    const pct = Math.max(1, Math.min(99, Number(discountPercent) || 10));
    const targetId = Number(id);
    if (!isNaN(targetId) && targetId > 0) {
      const current = await productApi.adminGetProductById(targetId).catch(() => null);
      const updatePayload = {
        brandId: current?.brandId,
        categoryId: current?.categoryId,
        subcategoryId: current?.subcategoryId || null,
        perfumeCategoryId: current?.perfumeCategoryId || null,
        gender: current?.gender || 'Unisex',
        price: current?.price,
        isActive: current?.isActive !== false,
        imageUrl: current?.imageUrl || current?.image || (current?.images?.[0]),
        discountPercent: pct,
        hasDiscount: true,
        isOffer: true
      };
      const updated = await productApi.adminUpdateProduct(targetId, updatePayload);
      cachedProducts = [];
      return updated;
    }
    throw new Error('Invalid product database ID.');
  },

  async removeProductDiscount(id) {
    const targetId = Number(id);
    if (!isNaN(targetId) && targetId > 0) {
      const current = await productApi.adminGetProductById(targetId).catch(() => null);
      const updatePayload = {
        brandId: current?.brandId,
        categoryId: current?.categoryId,
        subcategoryId: current?.subcategoryId || null,
        perfumeCategoryId: current?.perfumeCategoryId || null,
        gender: current?.gender || 'Unisex',
        price: current?.price,
        isActive: current?.isActive !== false,
        imageUrl: current?.imageUrl || current?.image || (current?.images?.[0]),
        discountPercent: 0,
        hasDiscount: false,
        isOffer: false
      };
      const updated = await productApi.adminUpdateProduct(targetId, updatePayload);
      cachedProducts = [];
      return updated;
    }
    throw new Error('Invalid product database ID.');
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
