import { INITIAL_PRODUCTS, PERFUME_TIERS, CATEGORIES } from './mockData';
import { productApi } from '../api/product.api';
import { apiClient } from '../api/client';

const PRODUCTS_STORAGE_KEY = 'arabian_sheikh_products_v16';
let inMemoryProducts = null;

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
  // Non-blocking browser asset pre-caching
  requestIdleCallback ? requestIdleCallback(() => {
    urls.forEach(src => { const img = new Image(); img.src = src; });
  }) : setTimeout(() => {
    urls.forEach(src => { const img = new Image(); img.src = src; });
  }, 100);
}

function loadProducts() {
  if (inMemoryProducts && inMemoryProducts.length > 0) {
    return inMemoryProducts;
  }

  const data = typeof window !== 'undefined' ? localStorage.getItem(PRODUCTS_STORAGE_KEY) : null;
  if (!data) {
    inMemoryProducts = [...INITIAL_PRODUCTS];
    if (typeof window !== 'undefined') {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    }
    preloadProductAssets(inMemoryProducts);
    return inMemoryProducts;
  }
  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || !parsed.some(p => p.id === 'as-royal-queens-secret')) {
      inMemoryProducts = [...INITIAL_PRODUCTS];
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      preloadProductAssets(inMemoryProducts);
      return inMemoryProducts;
    }
    inMemoryProducts = parsed;
    preloadProductAssets(inMemoryProducts);
    return inMemoryProducts;
  } catch (e) {
    console.error('Error parsing products from localStorage:', e);
    inMemoryProducts = [...INITIAL_PRODUCTS];
    return inMemoryProducts;
  }
}

function saveProducts(products) {
  inMemoryProducts = products;
  if (typeof window !== 'undefined') {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  }
}

// Warm up products cache immediately on module load
if (typeof window !== 'undefined') {
  setTimeout(() => loadProducts(), 0);
}

export const productService = {
  getAllProductsSync(filters = {}) {
    const products = loadProducts();
    let result = [...products];

    // Filter by search query
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(q) ||
        p.arabicName?.includes(q) ||
        p.bulgarianName?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.fragranceFamily?.toLowerCase().includes(q) ||
        p.scentFamily?.toLowerCase().includes(q) ||
        (p.topNotes && p.topNotes.some(n => n.toLowerCase().includes(q))) ||
        (p.heartNotes && p.heartNotes.some(n => n.toLowerCase().includes(q))) ||
        (p.baseNotes && p.baseNotes.some(n => n.toLowerCase().includes(q)))
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
      result = result.filter(p => p.gender?.toLowerCase() === filters.gender.toLowerCase());
    }

    // Filter by fragrance family / scent family
    if (filters.family && filters.family !== 'all') {
      result = result.filter(p => 
        (p.fragranceFamily && p.fragranceFamily.toLowerCase().includes(filters.family.toLowerCase())) ||
        (p.scentFamily && p.scentFamily.toLowerCase().includes(filters.family.toLowerCase()))
      );
    }

    // Filter by season
    if (filters.season && filters.season !== 'all') {
      result = result.filter(p => 
        p.season && (p.season.includes('All Seasons') || p.season.some(s => s.toLowerCase().includes(filters.season.toLowerCase())))
      );
    }

    // Filter by occasion
    if (filters.occasion && filters.occasion !== 'all') {
      result = result.filter(p => 
        p.occasion && p.occasion.some(o => o.toLowerCase().includes(filters.occasion.toLowerCase()))
      );
    }

    // Filter by price range
    if (filters.minPrice !== undefined) {
      result = result.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter(p => p.price <= filters.maxPrice);
    }

    // Filter by rating
    if (filters.minRating !== undefined) {
      result = result.filter(p => (p.rating || 5) >= filters.minRating);
    }

    // Filter by in-stock only
    if (filters.inStockOnly) {
      result = result.filter(p => p.stock > 0 && p.status === 'ACTIVE');
    }

    // Status filter
    if (filters.status) {
      result = result.filter(p => p.status === filters.status);
    } else if (!filters.includeDrafts) {
      result = result.filter(p => p.status === 'ACTIVE');
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

  async getAllProducts(filters = {}) {
    const result = this.getAllProductsSync(filters);

    if (!apiClient.isMockEnabled() && import.meta.env?.VITE_API_BASE_URL) {
      productApi.getProducts(filters).then(realProds => {
        if (Array.isArray(realProds) && realProds.length > 0) {
          saveProducts(realProds);
        }
      }).catch(() => {});
    }

    return result;
  },

  getProductByIdSync(idOrSlug) {
    if (!idOrSlug) return null;
    const products = loadProducts();
    return products.find(p => p.id === idOrSlug || p.slug === idOrSlug) || null;
  },

  async getProductById(idOrSlug) {
    const item = this.getProductByIdSync(idOrSlug);
    if (item) return item;

    if (!apiClient.isMockEnabled() && import.meta.env?.VITE_API_BASE_URL) {
      try {
        const remote = await productApi.getProductById(idOrSlug);
        if (remote) {
          const prods = loadProducts();
          const idx = prods.findIndex(p => p.id === remote.id);
          if (idx >= 0) prods[idx] = remote;
          else prods.push(remote);
          saveProducts(prods);
          return remote;
        }
      } catch (e) {}
    }

    return null;
  },

  async getFeaturedProducts() {
    const products = loadProducts();
    return products.filter(p => p.featured && p.status === 'ACTIVE');
  },

  async getBestSellers() {
    const products = loadProducts();
    return products.filter(p => (p.isBestSeller || p.featured) && p.status === 'ACTIVE');
  },

  async getPerfumes() {
    const products = await this.getAllProducts({ category: 'perfumes' });
    return products.filter(p => p.status === 'ACTIVE');
  },

  async getTiers() {
    return PERFUME_TIERS;
  },

  async getCategories() {
    return CATEGORIES;
  },

  getRelatedProductsSync(currentId, limit = 4) {
    const products = loadProducts();
    const current = products.find(p => p.id === currentId || p.slug === currentId);
    
    // Filter active candidates excluding current product
    const candidates = products.filter(p => 
      p.status === 'ACTIVE' && 
      p.id !== currentId && 
      p.slug !== currentId && 
      (!current || (p.id !== current.id && p.slug !== current.slug))
    );

    if (!current) {
      return candidates.slice(0, limit);
    }

    // Extract current notes for deep olfactory matching
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

      // 1. Same tier matching (+5 points)
      if (p.tier && current.tier && p.tier.toLowerCase() === current.tier.toLowerCase()) {
        score += 5;
      }

      // 2. Scent & Fragrance family matching (+4 points)
      const pFamily = (p.fragranceFamily || p.scentFamily || '').toLowerCase();
      const cFamily = (current.fragranceFamily || current.scentFamily || '').toLowerCase();
      if (pFamily && cFamily && (pFamily.includes(cFamily) || cFamily.includes(pFamily))) {
        score += 4;
      }

      // 3. Category matching (+3 points)
      if (p.category && current.category && p.category === current.category) {
        score += 3;
      }

      // 4. Gender profile matching (+2 points)
      if (p.gender === current.gender || p.gender === 'Unisex' || current.gender === 'Unisex') {
        score += 2;
      }

      // 5. Shared olfactory notes (+3 points per shared note)
      const pNotes = [
        ...(p.topNotes || []),
        ...(p.heartNotes || []),
        ...(p.baseNotes || []),
        ...(p.notes?.top || []),
        ...(p.notes?.heart || []),
        ...(p.notes?.base || [])
      ].map(n => String(n).toLowerCase());

      pNotes.forEach(note => {
        if (currentNotes.some(cn => cn.includes(note) || note.includes(cn))) {
          score += 3;
        }
      });

      return { product: p, score };
    });

    // Sort by highest match score
    scored.sort((a, b) => b.score - a.score);

    const result = scored.map(item => item.product).slice(0, limit);

    // If result has fewer than requested limit, fill with remaining candidates
    if (result.length < limit) {
      const remaining = candidates.filter(c => !result.some(r => r.id === c.id));
      result.push(...remaining.slice(0, limit - result.length));
    }

    return result;
  },

  async addReview(productId, review) {
    if (!apiClient.isMockEnabled()) {
      try {
        return await productApi.addReview(productId, review);
      } catch (e) {
        console.warn('Real API add review fallback:', e.message);
      }
    }

    const products = loadProducts();
    const index = products.findIndex(p => p.id === productId || p.slug === productId);
    if (index === -1) throw new Error('Product not found');

    const newReview = {
      id: 'rev-' + Date.now(),
      author: review.author || 'Anonymous Patron',
      rating: review.rating || 5,
      title: review.title || 'Exquisite Fragrance',
      date: new Date().toISOString().split('T')[0],
      comment: review.comment,
      verifiedPurchase: true,
      status: 'approved'
    };

    const currentReviews = products[index].reviews || [];
    const updatedReviews = [newReview, ...currentReviews];
    const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((totalRating / updatedReviews.length).toFixed(2));

    products[index] = {
      ...products[index],
      reviews: updatedReviews,
      reviewsCount: updatedReviews.length,
      rating: avgRating
    };

    saveProducts(products);
    return products[index];
  },

  // Admin methods
  async createProduct(productData) {
    if (!apiClient.isMockEnabled()) {
      try {
        return await productApi.createProduct(productData);
      } catch (e) {
        console.warn('Real API create product fallback:', e.message);
      }
    }

    const products = loadProducts();
    const newProduct = {
      ...productData,
      id: 'as-' + (productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) + '-' + Date.now().toString().slice(-4),
      slug: (productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
      rating: 5.0,
      reviewsCount: 0,
      reviews: [],
      status: productData.status || 'ACTIVE'
    };
    products.unshift(newProduct);
    saveProducts(products);
    return newProduct;
  },

  async updateProduct(id, productData) {
    if (!apiClient.isMockEnabled()) {
      try {
        return await productApi.updateProduct(id, productData);
      } catch (e) {
        console.warn('Real API update product fallback:', e.message);
      }
    }

    const products = loadProducts();
    const index = products.findIndex(p => p.id === id || p.slug === id);
    if (index === -1) throw new Error('Product not found');

    products[index] = {
      ...products[index],
      ...productData
    };
    saveProducts(products);
    return products[index];
  },

  async deleteProduct(id) {
    if (!apiClient.isMockEnabled()) {
      try {
        return await productApi.deleteProduct(id);
      } catch (e) {
        console.warn('Real API delete product fallback:', e.message);
      }
    }

    let products = loadProducts();
    products = products.filter(p => p.id !== id && p.slug !== id);
    saveProducts(products);
    return true;
  },

  async updateStock(id, newStock) {
    if (!apiClient.isMockEnabled()) {
      try {
        return await productApi.updateStock(id, newStock);
      } catch (e) {
        console.warn('Real API stock update fallback:', e.message);
      }
    }

    const products = loadProducts();
    const index = products.findIndex(p => p.id === id || p.slug === id);
    if (index === -1) throw new Error('Product not found');

    products[index].stock = Math.max(0, newStock);
    if (products[index].stock === 0) {
      products[index].status = 'OUT_OF_STOCK';
    } else if (products[index].status === 'OUT_OF_STOCK') {
      products[index].status = 'ACTIVE';
    }
    saveProducts(products);
    return products[index];
  },

  async applyProductDiscount(id, discountPercent) {
    const products = loadProducts();
    const index = products.findIndex(p => p.id === id || p.slug === id);
    if (index === -1) throw new Error('Product not found');

    const item = products[index];
    const basePrice = item.originalPrice && item.originalPrice > item.price ? item.originalPrice : item.price;
    const pct = Math.max(1, Math.min(99, Number(discountPercent) || 10));
    const discountedPrice = Math.round(basePrice * (1 - pct / 100));

    products[index] = {
      ...item,
      originalPrice: basePrice,
      price: discountedPrice,
      discountPercent: pct,
      hasDiscount: true,
      isOffer: true
    };
    saveProducts(products);
    return products[index];
  },

  async removeProductDiscount(id) {
    const products = loadProducts();
    const index = products.findIndex(p => p.id === id || p.slug === id);
    if (index === -1) throw new Error('Product not found');

    const item = products[index];
    const restoredPrice = item.originalPrice || item.price;

    products[index] = {
      ...item,
      price: restoredPrice,
      originalPrice: null,
      discountPercent: 0,
      hasDiscount: false,
      isOffer: false
    };
    saveProducts(products);
    return products[index];
  },

  getDiscountedProductsSync() {
    const products = loadProducts();
    return products.filter(p => 
      p.status === 'ACTIVE' && (
        p.hasDiscount || 
        (p.discountPercent && p.discountPercent > 0) || 
        (p.originalPrice && p.originalPrice > p.price) ||
        p.isOffer
      )
    );
  }
};

export default productService;
