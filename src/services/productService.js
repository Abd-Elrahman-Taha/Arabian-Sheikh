import { INITIAL_PRODUCTS, PERFUME_TIERS, CATEGORIES } from './mockData';
import { productApi } from '../api/product.api';

let cachedProducts = null;
let isSeedingDatabase = false;


export const productService = {
  /**
   * Filter an array of products locally using supplied filter parameters.
   */
  applyFilters(items, filters = {}) {
    let result = Array.isArray(items) ? [...items] : [];

    // Filter by search query
    if (filters.search) {
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

    // Filter by category (perfumes, oils, bakhoor, cosmetics, bundles, offers)
    if (filters.category && filters.category !== 'all') {
      const cat = filters.category.toLowerCase().trim();
      if (cat === 'offers' || cat === 'discounts') {
        result = result.filter(p => p.hasDiscount || (p.discountPercent > 0) || (p.originalPrice && p.originalPrice > p.price) || p.isOffer);
      } else if (cat === 'perfumes' || cat === 'perfume' || cat === 'fragrance' || cat === 'fragrances') {
        result = result.filter(p => {
          const c = (p.category || p.categoryName || '').toLowerCase();
          const tier = (p.tier || '').toLowerCase();
          return c === 'perfumes' || c === 'perfume' || c.includes('perfume') ||
                 tier === 'luxury' || tier === 'royal' || tier === 'classic' ||
                 Boolean(p.perfumeCategoryName || p.perfumeCategoryId);
        });
      } else if (cat === 'oils' || cat === 'oil' || cat === 'attar') {
        result = result.filter(p => {
          const c = (p.category || p.categoryName || '').toLowerCase();
          const n = (p.name || '').toLowerCase();
          return c === 'oils' || c === 'oil' || c.includes('oil') || c.includes('attar') || n.includes('oil') || n.includes('attar') || n.includes('دهن');
        });
      } else if (cat === 'bakhoor' || cat === 'incense') {
        result = result.filter(p => {
          const c = (p.category || p.categoryName || '').toLowerCase();
          const n = (p.name || '').toLowerCase();
          return c === 'bakhoor' || c === 'incense' || c.includes('bakhoor') || c.includes('incense') || n.includes('bakhoor') || n.includes('incense') || n.includes('بخور');
        });
      } else if (cat === 'cosmetics' || cat === 'body care') {
        result = result.filter(p => {
          const c = (p.category || p.categoryName || '').toLowerCase();
          return c === 'cosmetics' || c === 'cosmetic' || c.includes('cosmetic') || c.includes('body care');
        });
      } else if (cat === 'bundles' || cat === 'gift sets') {
        result = result.filter(p => {
          const c = (p.category || p.categoryName || '').toLowerCase();
          return c === 'bundles' || c === 'bundle' || c.includes('bundle') || c.includes('gift');
        });
      } else {
        result = result.filter(p => {
          const c = (p.category || p.categoryName || '').toLowerCase();
          return c === cat || c.includes(cat);
        });
      }
    }

    // Filter by perfume tier (Luxury, Royal, Classic)
    if (filters.tier && filters.tier !== 'all') {
      result = result.filter(p => p.tier?.toLowerCase() === filters.tier.toLowerCase());
    }

    // Filter by gender
    if (filters.gender && filters.gender !== 'all') {
      const target = filters.gender.toLowerCase();
      result = result.filter(p => {
        const pg = (p.gender || '').toLowerCase();
        if (target === 'men' || target === 'male' || target === 'masculine') {
          return pg === 'male' || pg === 'men' || pg === 'masculine' || pg === 'unisex';
        }
        if (target === 'women' || target === 'female' || target === 'feminine') {
          return pg === 'female' || pg === 'women' || pg === 'feminine' || pg === 'unisex';
        }
        if (target === 'unisex') {
          return pg === 'unisex';
        }
        return pg === target;
      });
    }

    // Filter by fragrance family
    if (filters.family && filters.family !== 'all') {
      result = result.filter(p => 
        p.fragranceFamily?.toLowerCase() === filters.family.toLowerCase() ||
        p.scentFamily?.toLowerCase().includes(filters.family.toLowerCase())
      );
    }

    // Filter by collection
    if (filters.collection && filters.collection !== 'all') {
      result = result.filter(p => 
        p.collection?.toLowerCase() === filters.collection.toLowerCase() ||
        p.collectionName?.toLowerCase() === filters.collection.toLowerCase()
      );
    }

    // Filter by max price
    if (filters.maxPrice) {
      result = result.filter(p => p.price <= filters.maxPrice);
    }

    // Filter by min rating
    if (filters.minRating) {
      result = result.filter(p => (p.rating || 5) >= filters.minRating);
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
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'newest':
          result.reverse();
          break;
        case 'featured':
        default:
          result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
          break;
      }
    }

    return result;
  },

  getAllProductsSync(filters = {}) {
    const products = cachedProducts || INITIAL_PRODUCTS;
    return this.applyFilters(products, filters);
  },

  /**
   * Fetch all products directly from the API.
   * Zero localStorage used.
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

      let items = response?.items || (Array.isArray(response) ? response : []);

      if (Array.isArray(items) && items.length > 0) {
        cachedProducts = items;
        return this.applyFilters(items, filters);
      }

      // If backend is empty (0 products) and admin is loading, auto-seed products to backend PostgreSQL
      if (filters.includeDrafts && (!items || items.length === 0) && !isSeedingDatabase) {
        isSeedingDatabase = true;
        try {
          console.log('Seeding catalog products to PostgreSQL on runasp.net...');
          for (const p of INITIAL_PRODUCTS) {
            await productApi.adminCreateProduct(p).catch(() => {});
          }
          const refetched = await productApi.adminGetProducts(apiFilters);
          items = refetched?.items || [];
          if (items.length > 0) {
            cachedProducts = items;
            return this.applyFilters(items, filters);
          }
        } catch (seedErr) {
          console.warn('Auto-seed error:', seedErr);
        } finally {
          isSeedingDatabase = false;
        }
      }
    } catch (err) {
      console.warn('API getProducts error:', err.message);
    }

    if (cachedProducts && cachedProducts.length > 0) {
      return this.applyFilters(cachedProducts, filters);
    }

    return this.applyFilters(INITIAL_PRODUCTS, filters);
  },

  getProductByIdSync(idOrSlug) {
    if (!idOrSlug) return null;
    const products = cachedProducts || INITIAL_PRODUCTS;
    return products.find(p => String(p.id) === String(idOrSlug) || p.slug === idOrSlug || String(p.numericId) === String(idOrSlug)) || null;
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
    const products = cachedProducts || INITIAL_PRODUCTS;
    return products.filter(p => p.featured).slice(0, limit);
  },

  async getFeaturedProducts(limit = 4) {
    const products = await this.getAllProducts();
    return products.filter(p => p.featured && (!p.status || p.status === 'ACTIVE')).slice(0, limit);
  },

  getProductsByCategorySync(category, limit) {
    const products = cachedProducts || INITIAL_PRODUCTS;
    const filtered = this.applyFilters(products, { category });
    return limit ? filtered.slice(0, limit) : filtered;
  },

  async getProductsByCategory(category, limit) {
    const products = await this.getAllProducts({ category });
    return limit ? products.slice(0, limit) : products;
  },

  getProductsByTierSync(tier, limit) {
    const products = cachedProducts || INITIAL_PRODUCTS;
    const filtered = this.applyFilters(products, { tier });
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
    const all = cachedProducts || INITIAL_PRODUCTS;
    const current = all.find(p => String(p.id) === String(currentId) || p.slug === currentId);
    if (!current) return all.slice(0, limit);
    return all.filter(p => (String(p.id) !== String(current.id)) && (!p.status || p.status === 'ACTIVE') && (p.category === current.category || p.tier === current.tier)).slice(0, limit);
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
    cachedProducts = null;
    return created;
  },

  async updateProduct(id, productData) {
    let targetId = Number(id);
    if (isNaN(targetId) || targetId <= 0) {
      if (cachedProducts) {
        const found = cachedProducts.find(p => String(p.id) === String(id) || p.slug === id);
        if (found && found.numericId) targetId = Number(found.numericId);
      }
    }

    if (!isNaN(targetId) && targetId > 0) {
      const updated = await productApi.adminUpdateProduct(targetId, productData);
      cachedProducts = null;
      return updated;
    }
    return productData;
  },

  async deleteProduct(id) {
    let targetId = Number(id);
    if (isNaN(targetId) || targetId <= 0) {
      if (cachedProducts) {
        const found = cachedProducts.find(p => String(p.id) === String(id) || p.slug === id);
        if (found && found.numericId) targetId = Number(found.numericId);
      }
    }

    if (!isNaN(targetId) && targetId > 0) {
      await productApi.adminDeleteProduct(targetId);
      cachedProducts = null;
      return true;
    }
    return false;
  },

  async toggleProductActive(id, isActive) {
    let targetId = Number(id);
    let currentProd = null;
    if (cachedProducts) {
      currentProd = cachedProducts.find(p => String(p.id) === String(id) || p.slug === id || String(p.numericId) === String(id));
      if (currentProd && currentProd.numericId) targetId = Number(currentProd.numericId);
    }

    if (!isNaN(targetId) && targetId > 0) {
      await productApi.adminUpdateProduct(targetId, {
        ...(currentProd || {}),
        isActive: Boolean(isActive)
      });
      cachedProducts = null;
      return { id: targetId, isActive: Boolean(isActive) };
    }
    throw new Error(`Product must be synced to the database first. Please click 'Sync Database' at the top of the page.`);
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
    const products = cachedProducts || INITIAL_PRODUCTS;
    return products.filter(p => 
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
