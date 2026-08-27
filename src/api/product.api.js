import apiClient from './client';
import ENDPOINTS from './endpoints';
import { normalizeProduct, normalizeReview } from './normalizers';

export const productApi = {
  // ==========================================
  // CUSTOMER STOREFRONT ENDPOINTS
  // ==========================================

  /**
   * Get Products with filtering & sorting
   * GET /api/products
   */
  async getProducts(filters = {}) {
    // Note: Availability and Size filters are explicitly forbidden by contract
    const cleanFilters = { ...filters };
    delete cleanFilters.availability;
    delete cleanFilters.inStock;
    delete cleanFilters.size;

    const response = await apiClient.get(ENDPOINTS.PRODUCTS.LIST, { params: cleanFilters, requiresAuth: false });
    const rawList = Array.isArray(response) ? response : (response?.items || response?.products || response?.data || []);
    return {
      items: rawList.map(normalizeProduct),
      page: response?.page || 1,
      pageSize: response?.pageSize || 20,
      totalCount: response?.totalCount || rawList.length,
      totalPages: response?.totalPages || 1
    };
  },

  /**
   * Get Product Details
   * GET /api/products/{id}
   */
  async getProductById(id) {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.DETAILS(id), { requiresAuth: false });
    const rawProduct = response?.product || response?.data || response;
    return normalizeProduct(rawProduct);
  },

  /**
   * Get Home Page Data
   * GET /api/home
   */
  async getHome(language = 'en') {
    const response = await apiClient.get(ENDPOINTS.HOME, { params: { language }, requiresAuth: false });
    return response;
  },

  /**
   * Get Categories
   * GET /api/categories
   */
  async getCategories(language = 'en') {
    const response = await apiClient.get(ENDPOINTS.CATEGORIES.LIST, { params: { language }, requiresAuth: false });
    return response?.items || (Array.isArray(response) ? response : []);
  },

  /**
   * Get Brands
   * GET /api/brands
   */
  async getBrands(language = 'en') {
    const response = await apiClient.get(ENDPOINTS.BRANDS.LIST, { params: { language }, requiresAuth: false });
    return response?.items || (Array.isArray(response) ? response : []);
  },

  /**
   * Get Product Reviews
   * GET /api/products/{productId}/reviews
   */
  async getReviews(productId, params = {}) {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.REVIEWS(productId), { params, requiresAuth: false });
    const rawList = response?.items || (Array.isArray(response) ? response : []);
    return rawList.map(normalizeReview);
  },

  /**
   * Add Product Review (Customer Auth Required)
   * POST /api/products/{productId}/reviews
   */
  async addReview(productId, { rating, comment, orderId }) {
    const response = await apiClient.post(ENDPOINTS.PRODUCTS.CREATE_REVIEW(productId), {
      productId: Number(productId),
      rating: Number(rating),
      comment,
      orderId: orderId ? Number(orderId) : null
    });
    return normalizeReview(response);
  },

  // ==========================================
  // ADMIN BACK-OFFICE ENDPOINTS
  // ==========================================

  /**
   * Admin: List all products (with pagination & internal filters)
   * GET /api/admin/products
   */
  async adminGetProducts(filters = {}) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.PRODUCTS.LIST, { params: filters });
    const rawList = response?.items || (Array.isArray(response) ? response : []);
    return {
      items: rawList.map(normalizeProduct),
      totalCount: response?.totalCount || rawList.length,
      page: response?.page || 1,
      pageSize: response?.pageSize || 20,
      totalPages: response?.totalPages || 1
    };
  },

  /**
   * Admin: Create product
   * POST /api/admin/products
   * Note: If Perfume, perfumeCategoryId is required and price is omitted.
   * If non-perfume, price is required and perfumeCategoryId is omitted.
   */
  async adminCreateProduct(payload) {
    const response = await apiClient.post(ENDPOINTS.ADMIN.PRODUCTS.CREATE, payload);
    return normalizeProduct(response);
  },

  /**
   * Admin: Update product
   * PUT /api/admin/products/{id}
   */
  async adminUpdateProduct(id, payload) {
    const response = await apiClient.put(ENDPOINTS.ADMIN.PRODUCTS.UPDATE(id), payload);
    return normalizeProduct(response);
  },

  /**
   * Admin: Activate product
   * POST /api/admin/products/{id}/activate
   */
  async adminActivateProduct(id) {
    return await apiClient.post(ENDPOINTS.ADMIN.PRODUCTS.ACTIVATE(id));
  },

  /**
   * Admin: Deactivate product
   * POST /api/admin/products/{id}/deactivate
   */
  async adminDeactivateProduct(id) {
    return await apiClient.post(ENDPOINTS.ADMIN.PRODUCTS.DEACTIVATE(id));
  },

  /**
   * Admin: Delete or archive product
   * DELETE /api/admin/products/{id}
   */
  async adminDeleteProduct(id) {
    return await apiClient.delete(ENDPOINTS.ADMIN.PRODUCTS.DELETE(id));
  },

  /**
   * Admin: Upload product image
   * POST /api/admin/products/{id}/image
   */
  async adminUploadImage(id, file) {
    const formData = new FormData();
    formData.append('file', file);
    return await apiClient.upload(ENDPOINTS.ADMIN.PRODUCTS.UPLOAD_IMAGE(id), formData);
  },

  /**
   * Admin: Upsert product translation
   * PUT /api/admin/products/{productId}/translations/{languageCode}
   */
  async adminUpsertTranslation(productId, languageCode, translation) {
    return await apiClient.put(
      ENDPOINTS.ADMIN.PRODUCTS.UPSERT_TRANSLATION(productId, languageCode),
      translation
    );
  },

  /**
   * Admin: Publish product translation
   * POST /api/admin/products/{productId}/translations/{languageCode}/publish
   */
  async adminPublishTranslation(productId, languageCode) {
    return await apiClient.post(
      ENDPOINTS.ADMIN.PRODUCTS.PUBLISH_TRANSLATION(productId, languageCode)
    );
  }
};

export default productApi;
