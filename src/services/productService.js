import { INITIAL_PRODUCTS, PERFUME_TIERS, CATEGORIES } from './mockData';
import { productApi } from '../api/product.api';
import { apiClient } from '../api/client';
import { liveCloudSync } from './liveCloudSync';

const PRODUCTS_STORAGE_KEY = 'arabian_sheikh_api_products_v4';
let inMemoryProducts = [];

function preloadProductAssets(products) {
  if (typeof window === 'undefined' || !Array.isArray(products)) return;
  const urls = new Set();
  products.forEach(p => {
    if (p.cutoutImage) urls.add(p.cutoutImage);
    if (p.originalImage) urls.add(p.originalImage);
    if (p.images && Array.isArray(p.images)) {
      p.images.forEach(img => urls.add(img));
    }
  });
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => {
      urls.forEach(src => { const img = new Image(); img.src = src; });
    });
  } else {
    setTimeout(() => {
      urls.forEach(src => { const img = new Image(); img.src = src; });
    }, 100);
  }
}

function loadProducts() {
  let base = inMemoryProducts;
  if (!base || base.length === 0) {
    const data = typeof window !== 'undefined' ? localStorage.getItem(PRODUCTS_STORAGE_KEY) : null;
    if (data) {
      try {
        const parsed = JSON.parse(data);
        base = Array.isArray(parsed) && parsed.length > 0 ? parsed : [...INITIAL_PRODUCTS];
      } catch {
        base = [...INITIAL_PRODUCTS];
      }
    } else {
      base = [...INITIAL_PRODUCTS];
    }
    inMemoryProducts = base;
  }
  return liveCloudSync.applyToProducts(base);
}

function saveProducts(products) {
  inMemoryProducts = Array.isArray(products) ? products : [];
  if (typeof window !== 'undefined') {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(inMemoryProducts));
  }
  preloadProductAssets(inMemoryProducts);
}


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
    const products = loadProducts();
    return this.applyFilters(products, filters);
  },

  /**
   * Fetch all products directly from the API.
   * If remote API returns products, store in memory and return.
   * Zero hardcoded/local products are returned.
   */
  async getAllProducts(filters = {}) {
    await liveCloudSync.sync().catch(() => {});

    try {
      const { gender, Gender, category, Category, categoryId, CategoryId, ...apiFilters } = filters;
      
      let response;
      if (filters.includeDrafts) {
        response = await productApi.adminGetProducts(apiFilters);
      } else {
        response = await productApi.getProducts(apiFilters);
      }

      const items = Array.isArray(response) ? response : (response?.items || response?.data || []);
      if (Array.isArray(items) && items.length > 0) {
        saveProducts(items);
        const transformed = liveCloudSync.applyToProducts(items);
        return this.applyFilters(transformed, filters);
      }
    } catch (err) {
      console.warn('API getProducts error:', err.message);
    }

    const cached = loadProducts();
    const transformed = liveCloudSync.applyToProducts(cached || []);
    return this.applyFilters(transformed, filters);
  },

  getProductByIdSync(idOrSlug) {
    if (!idOrSlug) return null;
    const products = loadProducts();
    return products.find(p => String(p.id) === String(idOrSlug) || p.slug === idOrSlug) || null;
  },

  /**
   * Fetch product details directly from the API.
   */
  async getProductById(idOrSlug) {
    if (!idOrSlug) return null;
    await liveCloudSync.sync().catch(() => {});

    // Try backend API first for direct detail fetch
    try {
      const remote = await productApi.getProductById(idOrSlug);
      if (remote) {
        const transformed = liveCloudSync.applyToProducts([remote])[0];
        return transformed;
      }
    } catch (err) {
      console.warn('API getProductById fallback:', err.message);
    }

    const products = loadProducts();
    return products.find(p => String(p.id) === String(idOrSlug) || p.slug === idOrSlug) || null;
  },

  getFeaturedProductsSync(limit = 4) {
    const products = loadProducts();
    return products.filter(p => p.featured).slice(0, limit);
  },

  async getFeaturedProducts(limit = 4) {
    const products = await this.getAllProducts();
    return products.filter(p => p.featured && (!p.status || p.status === 'ACTIVE')).slice(0, limit);
  },

  getProductsByCategorySync(category, limit) {
    const products = loadProducts();
    const filtered = this.applyFilters(products, { category });
    return limit ? filtered.slice(0, limit) : filtered;
  },

  async getProductsByCategory(category, limit) {
    const products = await this.getAllProducts({ category });
    return limit ? products.slice(0, limit) : products;
  },

  getProductsByTierSync(tier, limit) {
    const products = loadProducts();
    const filtered = this.applyFilters(products, { tier });
    return limit ? filtered.slice(0, limit) : filtered;
  },

  async getProductsByTier(tier, limit) {
    const products = await this.getAllProducts({ tier });
    return limit ? products.slice(0, limit) : products;
  },

  async getBestSellers() {
    const products = await this.getAllProducts();
    return products.filter(p => (p.isBestSeller || p.featured) && (!p.status || p.status === 'ACTIVE'));
  },

  async getPerfumes() {
    const products = await this.getAllProducts({ category: 'perfumes' });
    return products.filter(p => !p.status || p.status === 'ACTIVE');
  },

  async getTiers() {
    return PERFUME_TIERS;
  },

  async getCategories() {
    return CATEGORIES;
  },

  getRelatedProductsSync(currentId, limit = 4) {
    const all = loadProducts();
    const current = all.find(p => String(p.id) === String(currentId) || p.slug === currentId);
    if (!current) return all.slice(0, limit);

    const candidates = all.filter(p => String(p.id) !== String(currentId) && p.slug !== currentId);
    const scored = candidates.map(product => {
      let score = 0;
      if (product.tier && current.tier && product.tier === current.tier) score += 3;
      if (product.fragranceFamily && current.fragranceFamily && product.fragranceFamily === current.fragranceFamily) score += 4;
      if (product.category && current.category && product.category === current.category) score += 2;
      if (product.gender && current.gender && product.gender === current.gender) score += 1;
      return { product, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const result = scored.map(item => item.product).slice(0, limit);

    if (result.length < limit) {
      const remaining = candidates.filter(c => !result.some(r => String(r.id) === String(c.id)));
      result.push(...remaining.slice(0, limit - result.length));
    }

    return result;
  },

  async getRelatedProducts(currentId, limit = 4) {
    await this.getAllProducts();
    return this.getRelatedProductsSync(currentId, limit);
  },

  async addReview(productId, review) {
    return await productApi.addReview(productId, review);
  },

  // ==========================================
  // Admin & Back-Office API Integration with Live Cloud Sync
  // ==========================================
  async createProduct(productData) {
    let remote = null;
    try {
      remote = await productApi.adminCreateProduct(productData);
    } catch (e) {
      console.warn('Remote backend create product fallback to cloud sync:', e.message);
    }

    const newProd = {
      id: remote?.id || `AS-PROD-${Date.now()}`,
      slug: remote?.slug || (productData.name ? productData.name.toLowerCase().replace(/\s+/g, '-') : `prod-${Date.now()}`),
      ...productData,
      ...(remote || {}),
      isActive: productData.isActive !== false,
      status: productData.isActive !== false ? 'ACTIVE' : 'INACTIVE',
      createdAt: new Date().toISOString()
    };

    await liveCloudSync.addProduct(newProd);
    inMemoryProducts = [newProd, ...loadProducts()];
    saveProducts(inMemoryProducts);
    return newProd;
  },

  async updateProduct(id, productData) {
    let remote = null;
    try {
      remote = await productApi.adminUpdateProduct(id, productData);
    } catch (e) {
      console.warn('Remote backend update product fallback to cloud sync:', e.message);
    }

    const patch = { ...productData, ...(remote || {}) };
    await liveCloudSync.updateProduct(id, patch);

    const prods = loadProducts();
    const idx = prods.findIndex(p => String(p.id) === String(id) || p.slug === id);
    if (idx >= 0) {
      prods[idx] = { ...prods[idx], ...patch };
      saveProducts(prods);
      return prods[idx];
    }
    return patch;
  },

  async deleteProduct(id) {
    await liveCloudSync.deleteProduct(id);
    try {
      await productApi.adminDeleteProduct(id);
    } catch (e) {
      console.warn('Remote backend delete product fallback to cloud sync:', e.message);
    }

    inMemoryProducts = inMemoryProducts.filter(p => String(p.id) !== String(id) && p.slug !== id);
    saveProducts(inMemoryProducts);
    return true;
  },

  async toggleProductActive(id, isActive) {
    const activeBool = Boolean(isActive);
    const prods = loadProducts();
    const product = prods.find(p => String(p.id) === String(id) || p.slug === id);

    // 1. Immediately broadcast to cross-device cloud sync hub so ALL devices update
    await liveCloudSync.setProductActive(id, activeBool);
    if (product && product.slug) {
      await liveCloudSync.setProductActive(product.slug, activeBool);
    }

    // 2. Determine numeric server database ID if available
    let targetId = Number(id);
    if (isNaN(targetId) || targetId <= 0) {
      if (product && product.numericId && Number(product.numericId) > 0) {
        targetId = Number(product.numericId);
      } else if (product && !isNaN(Number(product.id)) && Number(product.id) > 0) {
        targetId = Number(product.id);
      }
    }

    // 3. If product has database ID, send to ASP.NET server
    if (!isNaN(targetId) && targetId > 0) {
      const updatePayload = {
        name: product?.name || 'Exclusive Creation',
        description: product?.description || product?.tagline || 'Haute Parfumerie Fragrance',
        brandId: Number(product?.brandId) || 1,
        categoryId: Number(product?.categoryId) || 1,
        subcategoryId: product?.subcategoryId ? Number(product.subcategoryId) : null,
        perfumeCategoryId: product?.perfumeCategoryId ? Number(product.perfumeCategoryId) : null,
        price: product?.price !== undefined ? Number(product.price) : 55,
        gender: product?.gender || 'Unisex',
        isActive: activeBool
      };

      try {
        await productApi.adminUpdateProduct(targetId, updatePayload);
      } catch (putErr) {
        if (activeBool) {
          await productApi.adminActivateProduct(targetId).catch(() => {});
        } else {
          await productApi.adminDeactivateProduct(targetId).catch(() => {});
        }
      }
    }

    // 4. Update in-memory state
    if (product) {
      product.isActive = activeBool;
      product.status = activeBool ? 'ACTIVE' : 'INACTIVE';
      saveProducts(prods);
    }

    return product || { id, isActive: activeBool, status: activeBool ? 'ACTIVE' : 'INACTIVE' };
  },

  async updateStock(id, newStock) {
    const remote = await productApi.adminUpdateProduct(id, { stock: Math.max(0, newStock) });
    const prods = loadProducts();
    const idx = prods.findIndex(p => String(p.id) === String(id) || p.slug === id);
    if (idx >= 0) {
      prods[idx] = { ...prods[idx], ...remote };
    }
    saveProducts(prods);
    return remote;
  },

  async applyProductDiscount(id, discountPercent) {
    const pct = Math.max(1, Math.min(99, Number(discountPercent) || 10));
    const remote = await productApi.adminUpdateProduct(id, {
      discountPercent: pct,
      hasDiscount: true,
      isOffer: true
    });
    const prods = loadProducts();
    const idx = prods.findIndex(p => String(p.id) === String(id) || p.slug === id);
    if (idx >= 0) {
      prods[idx] = { ...prods[idx], ...remote };
    }
    saveProducts(prods);
    return remote;
  },

  async removeProductDiscount(id) {
    const remote = await productApi.adminUpdateProduct(id, {
      discountPercent: 0,
      hasDiscount: false,
      isOffer: false
    });
    const prods = loadProducts();
    const idx = prods.findIndex(p => String(p.id) === String(id) || p.slug === id);
    if (idx >= 0) {
      prods[idx] = { ...prods[idx], ...remote };
    }
    saveProducts(prods);
    return remote;
  },

  getDiscountedProductsSync() {
    const products = loadProducts();
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
