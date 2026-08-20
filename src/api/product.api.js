import apiClient from './client';
import ENDPOINTS from './endpoints';
import { normalizeProduct, normalizeReview } from './normalizers';

export const productApi = {
  async getProducts(filters = {}) {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.LIST, { params: filters, requiresAuth: false });
    const rawList = Array.isArray(response) ? response : (response?.products || response?.data || []);
    return rawList.map(normalizeProduct);
  },

  async getProductById(idOrSlug) {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.DETAILS(idOrSlug), { requiresAuth: false });
    const rawProduct = response?.product || response?.data || response;
    return normalizeProduct(rawProduct);
  },

  async getFeaturedProducts() {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.FEATURED, { requiresAuth: false });
    const rawList = Array.isArray(response) ? response : (response?.products || response?.data || []);
    return rawList.map(normalizeProduct);
  },

  async getBestSellers() {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.BEST_SELLERS, { requiresAuth: false });
    const rawList = Array.isArray(response) ? response : (response?.products || response?.data || []);
    return rawList.map(normalizeProduct);
  },

  async getRelatedProducts(productId, limit = 4) {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.RELATED(productId), { params: { limit }, requiresAuth: false });
    const rawList = Array.isArray(response) ? response : (response?.products || response?.data || []);
    return rawList.map(normalizeProduct);
  },

  async addReview(productId, reviewPayload) {
    const response = await apiClient.post(ENDPOINTS.PRODUCTS.REVIEWS(productId), reviewPayload);
    const rawData = response?.review || response?.data || response;
    return normalizeReview(rawData);
  },

  // Admin Methods
  async createProduct(productPayload) {
    const response = await apiClient.post(ENDPOINTS.PRODUCTS.CREATE, productPayload);
    const rawProduct = response?.product || response?.data || response;
    return normalizeProduct(rawProduct);
  },

  async updateProduct(id, productPayload) {
    const response = await apiClient.put(ENDPOINTS.PRODUCTS.UPDATE(id), productPayload);
    const rawProduct = response?.product || response?.data || response;
    return normalizeProduct(rawProduct);
  },

  async deleteProduct(id) {
    const response = await apiClient.delete(ENDPOINTS.PRODUCTS.DELETE(id));
    return response?.success || true;
  },

  async updateStock(id, newStock) {
    const response = await apiClient.patch(ENDPOINTS.PRODUCTS.UPDATE_STOCK(id), { stock: newStock });
    const rawProduct = response?.product || response?.data || response;
    return normalizeProduct(rawProduct);
  }
};

export default productApi;
