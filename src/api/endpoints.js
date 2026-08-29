/**
 * Arabian Sheikh - Comprehensive REST API Endpoints Registry
 * 
 * Compliant with:
 * - Customer API & DTO Documentation (Storefront)
 * - Admin API & DTO Documentation (Back-office)
 * 
 * Base URL: /api
 */

export const ENDPOINTS = {
  // ==========================================
  // 1. CUSTOMER / STOREFRONT API (/api/...)
  // ==========================================

  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    GOOGLE: '/auth/google',
    REFRESH: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification'
  },

  // Localization
  LOCALIZATION: {
    DETECT_COUNTRY: '/localization/country',
    COUNTRIES: '/localization/countries',
    UPDATE_COUNTRY: '/account/country',
    UPDATE_LANGUAGE: '/account/language'
  },

  // Home Page
  HOME: '/home',

  // Catalog Browsing
  CATEGORIES: {
    LIST: '/categories',
    DETAILS: (id) => `/categories/${id}`,
    SUBCATEGORIES: (categoryId) => `/categories/${categoryId}/subcategories`
  },
  BRANDS: {
    LIST: '/brands',
    DETAILS: (id) => `/brands/${id}`
  },
  PRODUCTS: {
    LIST: '/products',
    DETAILS: (id) => `/products/${id}`,
    REVIEWS: (productId) => `/products/${productId}/reviews`,
    CREATE_REVIEW: (productId) => `/products/${productId}/reviews`
  },

  // Wishlist (Authentication Required)
  WISHLIST: {
    GET: '/wishlist',
    ADD: '/wishlist/items',
    REMOVE: (productId) => `/wishlist/items/${productId}`,
    MOVE_TO_CART: (productId) => `/wishlist/move-to-cart/${productId}`
  },

  // Shopping Cart (Authentication Required, No Size property)
  CART: {
    GET: '/cart',
    CLEAR: '/cart',
    ADD_ITEM: '/cart/items',
    UPDATE_ITEM: (productId) => `/cart/items/${productId}`,
    REMOVE_ITEM: (productId) => `/cart/items/${productId}`,
    REMOVE_COUPON: '/cart/coupon'
  },

  // Coupons
  COUPONS: {
    VALIDATE: '/coupons/validate'
  },

  // Account & Customer Profile
  ACCOUNT: {
    GET: '/account',
    ME: '/account',
    UPDATE_PROFILE: '/account/profile',
    PASSWORD: '/account/password',
    CHANGE_PASSWORD: '/account/password',
    LANGUAGE: '/account/language',
    COUNTRY: '/account/country',
    STORE_CREDIT: '/account/store-credit',
    STORE_CREDIT_TRANSACTIONS: '/account/store-credit/transactions',
    NOTIFICATION_PREFERENCES: '/account/notification-preferences'
  },

  // Customer Addresses
  ADDRESSES: {
    LIST: '/addresses',
    CREATE: '/addresses',
    UPDATE: (id) => `/addresses/${id}`,
    DELETE: (id) => `/addresses/${id}`,
    SET_DEFAULT: (id) => `/addresses/${id}/default`
  },

  // Checkout & Shipping
  CHECKOUT: {
    GET: '/checkout',
    SET_ADDRESS: '/checkout/address',
    SET_SHIPPING: '/checkout/shipping',
    SHIPPING_OPTIONS: '/shipping/options'
  },

  // Payments (Stripe)
  PAYMENTS: {
    STRIPE_PAYMENT_INTENT: '/payments/stripe/payment-intent',
    DETAILS: (paymentId) => `/payments/${paymentId}`
  },

  // Orders
  ORDERS: {
    CREATE: '/orders',
    LIST: '/orders',
    DETAILS: (id) => `/orders/${id}`,
    TRACKING: (id) => `/orders/${id}/tracking`,
    DELIVERY_STATUS: (id) => `/orders/${id}/delivery-status`,
    CANCEL: (id) => `/orders/${id}/cancel`,
    RETURN_ELIGIBILITY: (orderId) => `/orders/${orderId}/return-eligibility`,
    CREATE_RETURN: (orderId) => `/orders/${orderId}/returns`,
    RETURNS: (orderId) => `/orders/${orderId}/returns`,
    REFUNDS: (orderId) => `/orders/${orderId}/refunds`
  },

  // Returns
  RETURNS: {
    DETAILS: (id) => `/returns/${id}`,
    UPLOAD_PHOTOS: (id) => `/returns/${id}/photos`
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all'
  },

  // Content (Public)
  CONTENT: {
    FAQS: '/content/faqs',
    PAGE: (slug) => `/content/pages/${slug}`,
    CONTACT: '/content/contact'
  },

  // ==========================================
  // 2. ADMIN / BACK-OFFICE API (/api/admin/...)
  // ==========================================
  ADMIN: {
    // Admin Auth
    AUTH: {
      LOGIN: '/admin/auth/login',
      REFRESH: '/admin/auth/refresh',
      LOGOUT: '/admin/auth/logout',
      ME: '/admin/auth/me'
    },

    // Dashboard KPIs & Analytics
    DASHBOARD: {
      OVERVIEW: '/admin/dashboard/overview',
      COMPARE: '/admin/dashboard/compare'
    },

    // Sales Reports
    REPORTS: {
      SALES: '/admin/reports/sales',
      SALES_BY_PRODUCT: '/admin/reports/sales/products',
      SALES_BY_CATEGORY: '/admin/reports/sales/categories',
      SALES_BY_BRAND: '/admin/reports/sales/brands',
      SALES_BY_COUNTRY: '/admin/reports/sales/countries',
      EXPORT: '/admin/reports/sales/export'
    },

    // Catalog & Products Management
    PRODUCTS: {
      LIST: '/admin/products',
      DETAILS: (id) => `/admin/products/${id}`,
      CREATE: '/admin/products',
      UPDATE: (id) => `/admin/products/${id}`,
      ACTIVATE: (id) => `/admin/products/${id}/activate`,
      DEACTIVATE: (id) => `/admin/products/${id}/deactivate`,
      DELETE: (id) => `/admin/products/${id}`,
      IMAGES: '/admin/products/images',
      UPLOAD_IMAGE: (id) => `/admin/products/${id}/image`,
      DELETE_IMAGE: (id) => `/admin/products/${id}/image`,
      UPSERT_TRANSLATION: (productId, lang) => `/admin/products/${productId}/translations/${lang}`,
      DELETE_TRANSLATION: (productId, lang) => `/admin/products/${productId}/translations/${lang}`,
      PUBLISH_TRANSLATION: (productId, lang) => `/admin/products/${productId}/translations/${lang}/publish`
    },

    // Categories
    CATEGORIES: {
      LIST: '/admin/categories',
      DETAILS: (id) => `/admin/categories/${id}`,
      CREATE: '/admin/categories',
      UPDATE: (id) => `/admin/categories/${id}`,
      DELETE: (id) => `/admin/categories/${id}`,
      UPDATE_TRANSLATION: (id, lang) => `/admin/categories/${id}/translations/${lang}`,
      DELETE_TRANSLATION: (id, lang) => `/admin/categories/${id}/translations/${lang}`
    },

    // Subcategories
    SUBCATEGORIES: {
      LIST: '/admin/subcategories',
      DETAILS: (id) => `/admin/subcategories/${id}`,
      CREATE: '/admin/subcategories',
      UPDATE: (id) => `/admin/subcategories/${id}`,
      DELETE: (id) => `/admin/subcategories/${id}`
    },

    // Brands
    BRANDS: {
      LIST: '/admin/brands',
      DETAILS: (id) => `/admin/brands/${id}`,
      CREATE: '/admin/brands',
      UPDATE: (id) => `/admin/brands/${id}`,
      ACTIVATE: (id) => `/admin/brands/${id}/activate`,
      DEACTIVATE: (id) => `/admin/brands/${id}/deactivate`,
      DELETE: (id) => `/admin/brands/${id}`,
      UPDATE_TRANSLATION: (id, lang) => `/admin/brands/${id}/translations/${lang}`
    },

    // Perfume Categories (Governs pricing for Perfumes)
    PERFUME_CATEGORIES: {
      LIST: '/admin/perfume-categories',
      DETAILS: (id) => `/admin/perfume-categories/${id}`,
      CREATE: '/admin/perfume-categories',
      UPDATE: (id) => `/admin/perfume-categories/${id}`,
      DELETE: (id) => `/admin/perfume-categories/${id}`
    },

    // Customers Management
    CUSTOMERS: {
      LIST: '/admin/customers',
      DETAILS: (id) => `/admin/customers/${id}`,
      BLOCK: (id) => `/admin/customers/${id}/block`,
      UNBLOCK: (id) => `/admin/customers/${id}/unblock`
    },

    // Coupons
    COUPONS: {
      LIST: '/admin/coupons',
      CREATE: '/admin/coupons',
      UPDATE: (id) => `/admin/coupons/${id}`,
      ACTIVATE: (id) => `/admin/coupons/${id}/activate`,
      DEACTIVATE: (id) => `/admin/coupons/${id}/deactivate`,
      ANALYTICS: (id) => `/admin/coupons/${id}/analytics`
    },

    // Promotions
    PROMOTIONS: {
      LIST: '/admin/promotions',
      CREATE: '/admin/promotions',
      UPDATE: (id) => `/admin/promotions/${id}`,
      ACTIVATE: (id) => `/admin/promotions/${id}/activate`,
      DEACTIVATE: (id) => `/admin/promotions/${id}/deactivate`,
      ANALYTICS: (id) => `/admin/promotions/${id}/analytics`,
      CREATE_BUNDLE: (promotionId) => `/admin/promotions/${promotionId}/bundles`
    },

    // Orders
    ORDERS: {
      LIST: '/admin/orders',
      DETAILS: (id) => `/admin/orders/${id}`,
      UPDATE_STATUS: (id) => `/admin/orders/${id}/status`,
      CANCEL: (id) => `/admin/orders/${id}/cancel`,
      STATUS_HISTORY: (id) => `/admin/orders/${id}/status-history`
    },

    // Payments
    PAYMENTS: {
      LIST: '/admin/payments',
      DETAILS: (id) => `/admin/payments/${id}`,
      ATTEMPTS: (paymentId) => `/admin/payments/${paymentId}/attempts`,
      WEBHOOKS: '/admin/payment-webhooks',
      AUDIT: (paymentId) => `/admin/payments/${paymentId}/audit`
    },

    // Refunds
    REFUNDS: {
      LIST: '/admin/refunds',
      REQUEST: (paymentId) => `/admin/payments/${paymentId}/refunds`,
      PROCESS: (refundId) => `/admin/refunds/${refundId}/process`,
      COMPLETE: (refundId) => `/admin/refunds/${refundId}/complete`
    },

    // Returns
    RETURNS: {
      LIST: '/admin/returns',
      DETAILS: (id) => `/admin/returns/${id}`,
      APPROVE: (id) => `/admin/returns/${id}/approve`,
      REJECT: (id) => `/admin/returns/${id}/reject`,
      INSPECT: (id) => `/admin/returns/${id}/inspect`,
      REFUND_PROCESSING: (id) => `/admin/returns/${id}/refund-processing`,
      MARK_REFUNDED: (id) => `/admin/returns/${id}/mark-refunded`
    },

    // Shipping Administration
    SHIPPING: {
      COMPANIES: '/admin/shipping/companies',
      CREATE_COMPANY: '/admin/shipping/companies',
      UPDATE_COMPANY: (id) => `/admin/shipping/companies/${id}`,
      ACTIVATE_COMPANY: (id) => `/admin/shipping/companies/${id}/activate`,
      DEACTIVATE_COMPANY: (id) => `/admin/shipping/companies/${id}/deactivate`,
      ZONES: '/admin/shipping/zones',
      CREATE_ZONE: '/admin/shipping/zones',
      UPDATE_ZONE: (id) => `/admin/shipping/zones/${id}`,
      DELETE_ZONE: (id) => `/admin/shipping/zones/${id}`,
      METHODS: '/admin/shipping/methods',
      CREATE_METHOD: '/admin/shipping/methods',
      UPDATE_METHOD: (id) => `/admin/shipping/methods/${id}`
    },

    // Shipments
    SHIPMENTS: {
      LIST: '/admin/shipments',
      DETAILS: (id) => `/admin/shipments/${id}`,
      CREATE: (orderId) => `/admin/orders/${orderId}/shipments`,
      UPDATE_TRACKING: (id) => `/admin/shipments/${id}/tracking`,
      UPDATE_STATUS: (id) => `/admin/shipments/${id}/status`
    },

    // Admin Users (Super Admin only for create)
    ADMINS: {
      LIST: '/admin/admins',
      CREATE: '/admin/admins',
      UPDATE: (id) => `/admin/admins/${id}`,
      ACTIVATE: (id) => `/admin/admins/${id}/activate`,
      DEACTIVATE: (id) => `/admin/admins/${id}/deactivate`
    },

    // Settings
    SETTINGS: {
      GET_LANGUAGE: '/admin/settings/language',
      UPDATE_LANGUAGE: '/admin/settings/language'
    },

    // Notifications
    NOTIFICATIONS: {
      LIST: '/admin/notifications',
      MARK_READ: (id) => `/admin/notifications/${id}/read`
    },

    // Reviews Moderation
    REVIEWS: {
      LIST: '/admin/reviews',
      APPROVE: (id) => `/admin/reviews/${id}/approve`,
      REJECT: (id) => `/admin/reviews/${id}/reject`,
      HIDE: (id) => `/admin/reviews/${id}/hide`
    },

    // Content
    CONTENT: {
      FAQS: '/admin/content/faqs',
      CREATE_FAQ: '/admin/content/faqs',
      UPDATE_FAQ: (id) => `/admin/content/faqs/${id}`,
      DELETE_FAQ: (id) => `/admin/content/faqs/${id}`,
      PAGES: '/admin/content/pages',
      PAGE: (slug) => `/admin/content/pages/${slug}`,
      UPDATE_PAGE: (slug) => `/admin/content/pages/${slug}`,
      CONTACT: '/admin/content/contact',
      CREATE_CONTACT: '/admin/content/contact',
      UPDATE_CONTACT: (id) => `/admin/content/contact/${id}`
    },

    // Audit Logs
    AUDIT_LOGS: {
      LIST: '/admin/audit-logs',
      DETAILS: (id) => `/admin/audit-logs/${id}`
    }
  }
};

export default ENDPOINTS;
