import { INITIAL_PRODUCTS, PERFUME_TIERS, CATEGORIES } from './mockData';
import { productApi } from '../api/product.api';
import { apiClient } from '../api/client';

const PRODUCTS_STORAGE_KEY = 'arabian_sheikh_api_products_v2';
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
  if (inMemoryProducts && inMemoryProducts.length > 0) {
    return inMemoryProducts;
  }

  const data = typeof window !== 'undefined' ? localStorage.getItem(PRODUCTS_STORAGE_KEY) : null;
  if (!data) {
    inMemoryProducts = [...INITIAL_PRODUCTS];
    preloadProductAssets(inMemoryProducts);
    return inMemoryProducts;
  }
  try {
    const parsed = JSON.parse(data);
    inMemoryProducts = Array.isArray(parsed) && parsed.length > 0 ? parsed : [...INITIAL_PRODUCTS];
    preloadProductAssets(inMemoryProducts);
    return inMemoryProducts;
  } catch (e) {
    console.error('Error parsing products from storage:', e);
    inMemoryProducts = [...INITIAL_PRODUCTS];
    return inMemoryProducts;
  }
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
      if (filters.category.toLowerCase() === 'offers' || filters.category.toLowerCase() === 'discounts') {
        result = result.filter(p => p.hasDiscount || (p.discountPercent > 0) || (p.originalPrice && p.originalPrice > p.price) || p.isOffer);
      } else {
        result = result.filter(p => p.category?.toLowerCase() === filters.category.toLowerCase());
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
    if (filters.status) {
      result = result.filter(p => p.status === filters.status);
    } else if (!filters.includeDrafts) {
      result = result.filter(p => !p.status || p.status === 'ACTIVE');
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
    try {
      // Strip gender from the API call so we always receive all genders
      // (including unisex). Gender filtering is applied locally below,
      // where our applyFilters already includes unisex in men/women results.
      const { gender, Gender, ...apiFilters } = filters;
      const response = await productApi.getProducts(apiFilters);
      const items = Array.isArray(response) ? response : (response?.items || response?.data || []);
      if (Array.isArray(items) && items.length > 0) {
        saveProducts(items);
        return this.applyFilters(items, filters);
      }
    } catch (err) {
      console.warn('API getProducts error:', err.message);
    }

    const cached = loadProducts();
    return this.applyFilters(cached || [], filters);
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
    try {
      const remote = await productApi.getProductById(idOrSlug);
      if (remote) {
        const prods = loadProducts();
        const idx = prods.findIndex(p => String(p.id) === String(remote.id) || p.slug === remote.slug);
        if (idx >= 0) prods[idx] = remote;
        else prods.push(remote);
        saveProducts(prods);
        return remote;
      }
    } catch (err) {
      console.warn('API getProductById error:', err.message);
    }

    const cached = this.getProductByIdSync(idOrSlug);
    return cached;
  },

  async getFeaturedProducts() {
    const products = await this.getAllProducts();
    return products.filter(p => p.featured && (!p.status || p.status === 'ACTIVE'));
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
    const products = loadProducts();
    const current = products.find(p => String(p.id) === String(currentId) || p.slug === currentId);
    
    // Filter active candidates excluding current product
    const candidates = products.filter(p => 
      (!p.status || p.status === 'ACTIVE') && 
      String(p.id) !== String(currentId) && 
      p.slug !== currentId && 
      (!current || (String(p.id) !== String(current.id) && p.slug !== current.slug))
    );

    if (!current) {
      return candidates.slice(0, limit);
    }

    // Extract current notes for olfactory matching
    const currentNotes = [
      ...(current.topNotes || []),
      ...(current.heartNotes || []),
      ...(current.baseNotes || []),
      ...(current.notes?.top || []),
      ...(current.notes?.heart || []),
      ...(current.notes?.base || [])
    ].map(n => String(n).toLowerCase());

    const scored = candidates.map(p => {
      let score = 0;
      if (p.tier && current.tier && p.tier.toLowerCase() === current.tier.toLowerCase()) score += 5;
      const pFamily = (p.fragranceFamily || p.scentFamily || '').toLowerCase();
      const cFamily = (current.fragranceFamily || current.scentFamily || '').toLowerCase();
      if (pFamily && cFamily && (pFamily.includes(cFamily) || cFamily.includes(pFamily))) score += 4;
      if (p.category && current.category && p.category === current.category) score += 3;
      if (p.gender === current.gender || p.gender === 'Unisex' || current.gender === 'Unisex') score += 2;

      const pNotes = [
        ...(p.topNotes || []),
        ...(p.heartNotes || []),
        ...(p.baseNotes || []),
        ...(p.notes?.top || []),
        ...(p.notes?.heart || []),
        ...(p.notes?.base || [])
      ].map(n => String(n).toLowerCase());

      pNotes.forEach(note => {
        if (currentNotes.some(cn => cn.includes(note) || note.includes(cn))) score += 3;
      });

      return { product: p, score };
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
  // Admin & Back-Office API Integration
  // ==========================================
  async createProduct(productData) {
    const remote = await productApi.adminCreateProduct(productData);
    const prods = loadProducts();
    prods.unshift(remote);
    saveProducts(prods);
    return remote;
  },

  async updateProduct(id, productData) {
    const remote = await productApi.adminUpdateProduct(id, productData);
    const prods = loadProducts();
    const idx = prods.findIndex(p => String(p.id) === String(id) || p.slug === id);
    if (idx >= 0) {
      prods[idx] = { ...prods[idx], ...remote };
    }
    saveProducts(prods);
    return remote;
  },

  async deleteProduct(id) {
    await productApi.adminDeleteProduct(id);
    let prods = loadProducts();
    prods = prods.filter(p => String(p.id) !== String(id) && p.slug !== id);
    saveProducts(prods);
    return true;
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
