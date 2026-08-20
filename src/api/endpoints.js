/**
 * Arabian Sheikh - REST API Endpoints Registry
 * 
 * Centralized mapping of all backend endpoints for easy versioning and maintenance.
 */

export const ENDPOINTS = {
  // Authentication & Profile
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH_TOKEN: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    UPDATE_PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password'
  },

  // Products & Collections
  PRODUCTS: {
    LIST: '/products',
    DETAILS: (idOrSlug) => `/products/${idOrSlug}`,
    FEATURED: '/products/featured',
    BEST_SELLERS: '/products/best-sellers',
    CATEGORIES: '/products/categories',
    TIERS: '/products/tiers',
    RELATED: (id) => `/products/${id}/related`,
    REVIEWS: (id) => `/products/${id}/reviews`,
    CREATE: '/products',
    UPDATE: (id) => `/products/${id}`,
    DELETE: (id) => `/products/${id}`,
    UPDATE_STOCK: (id) => `/products/${id}/stock`
  },

  // Orders & Checkout
  ORDERS: {
    LIST: '/orders',
    DETAILS: (id) => `/orders/${id}`,
    USER_ORDERS: (userId) => `/orders/user/${userId}`,
    CREATE: '/orders',
    UPDATE_STATUS: (id) => `/orders/${id}/status`,
    TRACK: (trackingCode) => `/orders/track/${trackingCode}`
  },

  // Cart & Persistence
  CART: {
    GET: '/cart',
    SYNC: '/cart/sync',
    ADD_ITEM: '/cart/items',
    UPDATE_ITEM: '/cart/items',
    REMOVE_ITEM: (productId, size) => `/cart/items?productId=${productId}&size=${size}`,
    CLEAR: '/cart/clear',
    APPLY_DISCOUNT: '/cart/discount'
  },

  // Wishlist
  WISHLIST: {
    GET: '/wishlist',
    SYNC: '/wishlist/sync',
    TOGGLE: '/wishlist/toggle',
    CLEAR: '/wishlist/clear'
  },

  // Discounts & Promotions
  DISCOUNTS: {
    VALIDATE: '/discounts/validate',
    LIST: '/discounts',
    CREATE: '/discounts',
    DELETE: (id) => `/discounts/${id}`
  },

  // Users & Customers Management
  USERS: {
    LIST: '/users',
    DETAILS: (id) => `/users/${id}`,
    UPDATE_STATUS: (id) => `/users/${id}/status`,
    UPDATE_ROLE: (id) => `/users/${id}/role`,
    ADDRESSES: '/users/addresses',
    PAYMENT_METHODS: '/users/payment-methods'
  },

  // Analytics & Admin Dashboard
  ANALYTICS: {
    OVERVIEW: '/analytics/overview',
    SALES_TRENDS: '/analytics/sales-trends',
    INVENTORY_STATUS: '/analytics/inventory-status'
  }
};

export default ENDPOINTS;
