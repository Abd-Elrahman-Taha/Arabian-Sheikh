import apiClient from './client';
import ENDPOINTS from './endpoints';
import { normalizeUser, normalizeObjectKeys } from './normalizers';

export const userApi = {
  async getUsers(filters = {}) {
    const response = await apiClient.get(ENDPOINTS.USERS.LIST, { params: filters });
    const rawList = Array.isArray(response) ? response : (response?.users || response?.data || []);
    return rawList.map(normalizeUser);
  },

  async getUserById(id) {
    const response = await apiClient.get(ENDPOINTS.USERS.DETAILS(id));
    const rawUser = response?.user || response?.data || response;
    return normalizeUser(rawUser);
  },

  async updateUserStatus(id, status) {
    const response = await apiClient.patch(ENDPOINTS.USERS.UPDATE_STATUS(id), { status });
    const rawUser = response?.user || response?.data || response;
    return normalizeUser(rawUser);
  },

  async updateUserRole(id, role) {
    const response = await apiClient.patch(ENDPOINTS.USERS.UPDATE_ROLE(id), { role });
    const rawUser = response?.user || response?.data || response;
    return normalizeUser(rawUser);
  },

  async getAddresses() {
    const response = await apiClient.get(ENDPOINTS.USERS.ADDRESSES);
    const rawList = Array.isArray(response) ? response : (response?.addresses || response?.data || []);
    return rawList.map(normalizeObjectKeys);
  },

  async addAddress(address) {
    const response = await apiClient.post(ENDPOINTS.USERS.ADDRESSES, address);
    return normalizeObjectKeys(response?.address || response?.data || response);
  },

  async getPaymentMethods() {
    const response = await apiClient.get(ENDPOINTS.USERS.PAYMENT_METHODS);
    const rawList = Array.isArray(response) ? response : (response?.paymentMethods || response?.data || []);
    return rawList.map(normalizeObjectKeys);
  },

  async addPaymentMethod(paymentMethod) {
    const response = await apiClient.post(ENDPOINTS.USERS.PAYMENT_METHODS, paymentMethod);
    return normalizeObjectKeys(response?.paymentMethod || response?.data || response);
  }
};

export default userApi;
