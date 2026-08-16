import { INITIAL_PRODUCTS } from './mockData';

const PRODUCTS_STORAGE_KEY = 'arabian_sheikh_products';

function loadProducts() {
  const data = localStorage.getItem(PRODUCTS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Error parsing products from localStorage:', e);
    return INITIAL_PRODUCTS;
  }
}

function saveProducts(products) {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

export const productService = {
  async getAllProducts(filters = {}) {
    const products = loadProducts();
    let result = [...products];

    // Filter by search query
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.arabicName?.includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.fragranceFamily.toLowerCase().includes(q) ||
        p.topNotes.some(n => n.toLowerCase().includes(q)) ||
        p.heartNotes.some(n => n.toLowerCase().includes(q)) ||
        p.baseNotes.some(n => n.toLowerCase().includes(q))
      );
    }

    // Filter by gender
    if (filters.gender && filters.gender !== 'all') {
      result = result.filter(p => p.gender.toLowerCase() === filters.gender.toLowerCase());
    }

    // Filter by fragrance family
    if (filters.family && filters.family !== 'all') {
      result = result.filter(p => 
        p.fragranceFamily.toLowerCase().includes(filters.family.toLowerCase())
      );
    }

    // Filter by collection
    if (filters.collection && filters.collection !== 'all') {
      result = result.filter(p => p.collection?.toLowerCase() === filters.collection.toLowerCase());
    }

    // Filter by price
    if (filters.minPrice !== undefined) {
      result = result.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter(p => p.price <= filters.maxPrice);
    }

    // Filter by rating
    if (filters.minRating !== undefined) {
      result = result.filter(p => p.rating >= filters.minRating);
    }

    // Filter by stock
    if (filters.inStockOnly) {
      result = result.filter(p => p.stock > 0 && p.status === 'ACTIVE');
    }

    // Status filter (admin vs public)
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

  async getProductById(id) {
    const products = loadProducts();
    return products.find(p => p.id === id) || null;
  },

  async getFeaturedProducts() {
    const products = loadProducts();
    return products.filter(p => p.featured && p.status === 'ACTIVE');
  },

  async getBestSellers() {
    const products = loadProducts();
    return products.filter(p => p.isBestSeller && p.status === 'ACTIVE');
  },

  async getRelatedProducts(currentId, limit = 4) {
    const products = loadProducts();
    const current = products.find(p => p.id === currentId);
    if (!current) return products.slice(0, limit);

    return products
      .filter(p => p.id !== currentId && p.status === 'ACTIVE')
      .sort((a, b) => {
        const aMatch = (a.fragranceFamily === current.fragranceFamily ? 2 : 0) + (a.gender === current.gender ? 1 : 0);
        const bMatch = (b.fragranceFamily === current.fragranceFamily ? 2 : 0) + (b.gender === current.gender ? 1 : 0);
        return bMatch - aMatch;
      })
      .slice(0, limit);
  },

  async addReview(productId, review) {
    const products = loadProducts();
    const index = products.findIndex(p => p.id === productId);
    if (index === -1) throw new Error('Product not found');

    const newReview = {
      id: 'rev-' + Date.now(),
      author: review.author || 'Anonymous Patron',
      rating: review.rating || 5,
      date: new Date().toISOString().split('T')[0],
      comment: review.comment
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
    const products = loadProducts();
    const newProduct = {
      ...productData,
      id: 'as-' + (productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) + '-' + Date.now().toString().slice(-4),
      rating: 5.0,
      reviewsCount: 0,
      reviews: []
    };
    products.unshift(newProduct);
    saveProducts(products);
    return newProduct;
  },

  async updateProduct(id, productData) {
    const products = loadProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');

    products[index] = {
      ...products[index],
      ...productData
    };
    saveProducts(products);
    return products[index];
  },

  async deleteProduct(id) {
    let products = loadProducts();
    products = products.filter(p => p.id !== id);
    saveProducts(products);
    return true;
  },

  async updateStock(id, newStock) {
    const products = loadProducts();
    const index = products.findIndex(p => p.id === id);
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
