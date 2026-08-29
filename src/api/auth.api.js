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
  async register({ firstName, lastName, email, password, phone, countryCode, preferredLanguage = 'En' }) {
    const langCode = preferredLanguage ? (preferredLanguage.charAt(0).toUpperCase() + preferredLanguage.slice(1).toLowerCase()) : 'En';
    const payload = {
      firstName: firstName?.trim() || 'Royal',
      lastName: lastName?.trim() || 'Patron',
      email: email.trim().toLowerCase(),
      password,
      phone: phone || null,
      preferredLanguage: langCode
    };
    if (countryCode) payload.countryCode = countryCode;

    const response = await apiClient.post(
      ENDPOINTS.AUTH.REGISTER,
      payload,
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
    const parts = (payload.name || '').trim().split(/\s+/);
    const firstName = payload.firstName || parts[0] || 'Royal';
    const lastName = payload.lastName || parts.slice(1).join(' ') || 'Patron';
    return this.register({
      firstName,
      lastName,
      email: payload.email,
      password: payload.password,
      phone: payload.phone || null,
      countryCode: payload.countryCode || null,
      preferredLanguage: payload.preferredLanguage || 'En'
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
  /**
   * Get Account
   * GET /api/account
   */
  async getAccount() {
    const response = await apiClient.get(ENDPOINTS.ACCOUNT.GET);
    const userData = response?.user || response?.data || response;
    return normalizeUser(userData);
  },

  async getMe(isAdmin = false) {
    const endpoint = isAdmin ? ENDPOINTS.ADMIN.AUTH.ME : ENDPOINTS.ACCOUNT.GET;
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
   * Update Password
   * PUT /api/account/password
   */
  async updatePassword(oldPassword, newPassword) {
    return await apiClient.put(ENDPOINTS.ACCOUNT.PASSWORD, {
      oldPassword,
      newPassword
    });
  },

  /**
   * Change Password alias
   */
  async changePassword(oldPassword, newPassword) {
    return this.updatePassword(oldPassword, newPassword);
  },

  /**
   * Update Language
   * PUT /api/account/language
   */
  async updateLanguage(language) {
    return await apiClient.put(ENDPOINTS.ACCOUNT.LANGUAGE, { language });
  },

  /**
   * Update Country
   * PUT /api/account/country
   */
  async updateCountry(countryCode) {
    return await apiClient.put(ENDPOINTS.ACCOUNT.COUNTRY, { countryCode });
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
