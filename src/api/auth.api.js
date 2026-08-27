import apiClient, { tokenManager } from './client';
import ENDPOINTS from './endpoints';
import { normalizeUser } from './normalizers';

export const authApi = {
  /**
   * Customer Login
   * POST /api/auth/login
   */
  async login(email, password) {
    const response = await apiClient.post(
      ENDPOINTS.AUTH.LOGIN,
      { email: email.trim().toLowerCase(), password },
      { requiresAuth: false }
    );
    
    // Save JWT tokens if returned
    if (response?.tokens?.accessToken || response?.token || response?.accessToken) {
      tokenManager.setToken(response?.tokens?.accessToken || response?.token || response?.accessToken);
    }
    if (response?.tokens?.refreshToken || response?.refreshToken) {
      tokenManager.setRefreshToken(response?.tokens?.refreshToken || response?.refreshToken);
    }

    const userData = response?.user || response?.data || response;
    return normalizeUser(userData);
  },

  /**
   * Admin Login
   * POST /api/admin/auth/login
   */
  async adminLogin(email, password) {
    const response = await apiClient.post(
      ENDPOINTS.ADMIN.AUTH.LOGIN,
      { email: email.trim().toLowerCase(), password },
      { requiresAuth: false }
    );

    if (response?.tokens?.accessToken || response?.token || response?.accessToken) {
      tokenManager.setToken(response?.tokens?.accessToken || response?.token || response?.accessToken);
    }
    if (response?.tokens?.refreshToken || response?.refreshToken) {
      tokenManager.setRefreshToken(response?.tokens?.refreshToken || response?.refreshToken);
    }

    const adminData = response?.admin || response?.user || response?.data || response;
    return normalizeUser({ ...adminData, role: adminData?.isSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN' });
  },

  /**
   * Customer Registration
   * POST /api/auth/register
   */
  async register({ firstName, lastName, email, password, phone, preferredLanguage = 'en' }) {
    const response = await apiClient.post(
      ENDPOINTS.AUTH.REGISTER,
      {
        firstName,
        lastName,
        email: email.trim().toLowerCase(),
        password,
        phone: phone || null,
        preferredLanguage
      },
      { requiresAuth: false }
    );

    if (response?.tokens?.accessToken || response?.token || response?.accessToken) {
      tokenManager.setToken(response?.tokens?.accessToken || response?.token || response?.accessToken);
    }
    if (response?.tokens?.refreshToken || response?.refreshToken) {
      tokenManager.setRefreshToken(response?.tokens?.refreshToken || response?.refreshToken);
    }

    const userData = response?.user || response?.data || response;
    return normalizeUser(userData);
  },

  // Alias for backward compatibility
  async signup(payload) {
    const parts = (payload.name || '').split(' ');
    const firstName = payload.firstName || parts[0] || 'Distinguished';
    const lastName = payload.lastName || parts.slice(1).join(' ') || 'Patron';
    return this.register({
      firstName,
      lastName,
      email: payload.email,
      password: payload.password,
      phone: payload.phone,
      preferredLanguage: payload.preferredLanguage || 'en'
    });
  },

  /**
   * Google Social Login
   * POST /api/auth/google
   */
  async googleLogin(idToken) {
    const response = await apiClient.post(
      ENDPOINTS.AUTH.GOOGLE,
      { idToken },
      { requiresAuth: false }
    );

    if (response?.tokens?.accessToken || response?.token || response?.accessToken) {
      tokenManager.setToken(response?.tokens?.accessToken || response?.token || response?.accessToken);
    }
    if (response?.tokens?.refreshToken || response?.refreshToken) {
      tokenManager.setRefreshToken(response?.tokens?.refreshToken || response?.refreshToken);
    }

    const userData = response?.user || response?.data || response;
    return normalizeUser(userData);
  },

  /**
   * Refresh Token
   * POST /api/auth/refresh
   */
  async refreshToken() {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token stored');

    const response = await apiClient.post(
      ENDPOINTS.AUTH.REFRESH,
      { refreshToken },
      { requiresAuth: false }
    );

    if (response?.accessToken) {
      tokenManager.setToken(response.accessToken);
    }
    if (response?.refreshToken) {
      tokenManager.setRefreshToken(response.refreshToken);
    }

    return response;
  },

  /**
   * Get Current Customer / Admin Profile
   * GET /api/account/me or /api/admin/auth/me
   */
  async getMe(isAdmin = false) {
    const endpoint = isAdmin ? ENDPOINTS.ADMIN.AUTH.ME : ENDPOINTS.ACCOUNT.ME;
    const response = await apiClient.get(endpoint);
    const userData = response?.user || response?.admin || response?.data || response;
    return normalizeUser(userData);
  },

  /**
   * Update Profile
   * PUT /api/account/profile
   */
  async updateProfile(updates) {
    const response = await apiClient.put(ENDPOINTS.ACCOUNT.UPDATE_PROFILE, updates);
    const userData = response?.user || response?.data || response;
    return normalizeUser(userData);
  },

  /**
   * Change Password
   * POST /api/account/change-password
   */
  async changePassword(currentPassword, newPassword) {
    return await apiClient.post(ENDPOINTS.ACCOUNT.CHANGE_PASSWORD, {
      currentPassword,
      newPassword
    });
  },

  /**
   * Forgot Password
   * POST /api/auth/forgot-password
   */
  async forgotPassword(email) {
    return await apiClient.post(
      ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email: email.trim().toLowerCase() },
      { requiresAuth: false }
    );
  },

  /**
   * Reset Password
   * POST /api/auth/reset-password
   */
  async resetPassword(token, newPassword) {
    return await apiClient.post(
      ENDPOINTS.AUTH.RESET_PASSWORD,
      { token, newPassword },
      { requiresAuth: false }
    );
  },

  /**
   * Verify Email
   * POST /api/auth/verify-email
   */
  async verifyEmail(token) {
    return await apiClient.post(
      ENDPOINTS.AUTH.VERIFY_EMAIL,
      { token },
      { requiresAuth: false }
    );
  },

  /**
   * Resend Email Verification
   * POST /api/auth/resend-verification
   */
  async resendVerification(email) {
    return await apiClient.post(
      ENDPOINTS.AUTH.RESEND_VERIFICATION,
      { email: email.trim().toLowerCase() },
      { requiresAuth: false }
    );
  },

  /**
   * Logout
   * POST /api/auth/logout
   */
  async logout() {
    const refreshToken = tokenManager.getRefreshToken();
    try {
      if (refreshToken) {
        await apiClient.post(ENDPOINTS.AUTH.LOGOUT, { refreshToken });
      }
    } catch {
      // Gracefully ignore network errors on logout
    } finally {
      tokenManager.clearTokens();
    }
  }
};

export default authApi;
