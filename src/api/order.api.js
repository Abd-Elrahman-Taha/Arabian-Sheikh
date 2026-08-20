import apiClient from './client';
import ENDPOINTS from './endpoints';
import { normalizeOrder } from './normalizers';

export const orderApi = {
  async getOrders(filters = {}) {
    const response = await apiClient.get(ENDPOINTS.ORDERS.LIST, { params: filters });
    const rawList = Array.isArray(response) ? response : (response?.orders || response?.data || []);
    return rawList.map(normalizeOrder);
  },

  async getOrderById(id) {
    const response = await apiClient.get(ENDPOINTS.ORDERS.DETAILS(id));
    const rawOrder = response?.order || response?.data || response;
    return normalizeOrder(rawOrder);
  },

  async getUserOrders(userId) {
    const response = await apiClient.get(ENDPOINTS.ORDERS.USER_ORDERS(userId));
    const rawList = Array.isArray(response) ? response : (response?.orders || response?.data || []);
    return rawList.map(normalizeOrder);
  },

  async createOrder(orderPayload) {
    const response = await apiClient.post(ENDPOINTS.ORDERS.CREATE, orderPayload);
    const rawOrder = response?.order || response?.data || response;
    return normalizeOrder(rawOrder);
  },

  async updateOrderStatus(orderId, newStatus) {
    const response = await apiClient.patch(ENDPOINTS.ORDERS.UPDATE_STATUS(orderId), { status: newStatus });
    const rawOrder = response?.order || response?.data || response;
    return normalizeOrder(rawOrder);
  },

  async trackOrder(trackingCode) {
    const response = await apiClient.get(ENDPOINTS.ORDERS.TRACK(trackingCode), { requiresAuth: false });
    const rawOrder = response?.order || response?.data || response;
    return normalizeOrder(rawOrder);
  }
};

export default orderApi;
