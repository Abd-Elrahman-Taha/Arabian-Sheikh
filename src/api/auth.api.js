import apiClient, { tokenManager } from './client';
import ENDPOINTS from './endpoints';
import { normalizeUser } from './normalizers';

export const authApi = {
  async login(email, password) {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, { email, password }, { requiresAuth: false });
    
    // Save tokens if returned by API
    if (response?.token || response?.accessToken) {
      tokenManager.setToken(response.token || response.accessToken);
    }
    if (response?.refreshToken) {
      tokenManager.setRefreshToken(response.refreshToken);
    }

    const userData = response?.user || response?.data || response;
    return normalizeUser(userData);
  },

  async signup(payload) {
    const response = await apiClient.post(ENDPOINTS.AUTH.SIGNUP, payload, { requiresAuth: false });

    if (response?.token || response?.accessToken) {
      tokenManager.setToken(response.token || response.accessToken);
    }
    if (response?.refreshToken) {
      tokenManager.setRefreshToken(response.refreshToken);
    }

    const userData = response?.user || response?.data || response;
    return normalizeUser(userData);
  },

  async getMe() {
    const response = await apiClient.get(ENDPOINTS.AUTH.ME);
    const userData = response?.user || response?.data || response;
    return normalizeUser(userData);
  },

  async updateProfile(updates) {
    const response = await apiClient.put(ENDPOINTS.AUTH.UPDATE_PROFILE, updates);
    const userData = response?.user || response?.data || response;
    return normalizeUser(userData);
  },

  async forgotPassword(email) {
    return await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }, { requiresAuth: false });
  },

  async resetPassword(token, newPassword) {
    return await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, { token, password: newPassword }, { requiresAuth: false });
  },

  async logout() {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Ignore network errors on logout
    } finally {
      tokenManager.clearTokens();
    }
  }
};

export default authApi;
