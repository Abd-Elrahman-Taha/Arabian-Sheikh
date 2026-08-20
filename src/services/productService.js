import { INITIAL_PRODUCTS, PERFUME_TIERS, CATEGORIES } from './mockData';
import { productApi } from '../api/product.api';
import { apiClient } from '../api/client';

const PRODUCTS_STORAGE_KEY = 'arabian_sheikh_products_v9';

function loadProducts() {
  const data = typeof window !== 'undefined' ? localStorage.getItem(PRODUCTS_STORAGE_KEY) : null;
  if (!data) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    }
    return INITIAL_PRODUCTS;
  }
  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || !parsed.some(p => p.id === 'as-royal-queens-secret')) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return parsed;
  } catch (e) {
    console.error('Error parsing products from localStorage:', e);
    return INITIAL_PRODUCTS;
  }
}

function saveProducts(products) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  }
}

export const productService = {
  async getAllProducts(filters = {}) {
    if (!apiClient.isMockEnabled()) {
      try {
        return await productApi.getProducts(filters);
      } catch (e) {
        console.warn('Real API unavailable, falling back to local catalog data:', e.message);
      }
    }

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

    // Filter by category (perfumes, oils, bakhoor, cosmetics, bundles)
    if (filters.category && filters.category !== 'all') {
      result = result.filter(p => p.category?.toLowerCase() === filters.category.toLowerCase());
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

  async getProductById(idOrSlug) {
    if (!apiClient.isMockEnabled()) {
      try {
        return await productApi.getProductById(idOrSlug);
      } catch (e) {
        console.warn('Real API product detail unavailable, using local cache:', e.message);
      }
    }

    const products = loadProducts();
    return products.find(p => p.id === idOrSlug || p.slug === idOrSlug) || null;
  },

  async getFeaturedProducts() {
    if (!apiClient.isMockEnabled()) {
      try {
        return await productApi.getFeaturedProducts();
      } catch (e) {
        console.warn('Real API featured products fallback:', e.message);
      }
    }

    const products = loadProducts();
    return products.filter(p => p.featured && p.status === 'ACTIVE');
  },

  async getBestSellers() {
    if (!apiClient.isMockEnabled()) {
      try {
        return await productApi.getBestSellers();
      } catch (e) {
        console.warn('Real API bestsellers fallback:', e.message);
      }
    }

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

  async getRelatedProducts(currentId, limit = 4) {
    if (!apiClient.isMockEnabled()) {
      try {
        return await productApi.getRelatedProducts(currentId, limit);
      } catch (e) {
        console.warn('Real API related products fallback:', e.message);
      }
    }

    const products = loadProducts();
    const current = products.find(p => p.id === currentId || p.slug === currentId);
    if (!current) return products.slice(0, limit);

    return products
      .filter(p => p.id !== current.id && p.status === 'ACTIVE')
      .sort((a, b) => {
        const aMatch = (a.category === current.category ? 2 : 0) + (a.gender === current.gender ? 1 : 0);
        const bMatch = (b.category === current.category ? 2 : 0) + (b.gender === current.gender ? 1 : 0);
        return bMatch - aMatch;
      })
      .slice(0, limit);
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
  }
};

export default productService;
