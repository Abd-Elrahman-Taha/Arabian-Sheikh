import { INITIAL_USERS } from './mockData';
import { authApi } from '../api/auth.api';
import { apiClient } from '../api/client';
import { liveCloudSync } from './liveCloudSync';

const USERS_STORAGE_KEY = 'arabian_sheikh_users';
const CURRENT_USER_KEY = 'arabian_sheikh_current_user';

function loadUsers() {
  const data = typeof window !== 'undefined' ? localStorage.getItem(USERS_STORAGE_KEY) : null;
  if (!data) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    }
    return INITIAL_USERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_USERS;
  }
}

function saveUsers(users) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }
}

export const authService = {
  async login(email, password) {
    const cleanEmail = email.toLowerCase().trim();

    const isAdminLikely = cleanEmail.includes('admin') || cleanEmail.includes('perfumestore');

    // Helper: Attempt Admin API login
    const tryAdminLogin = async () => {
      try {
        const adminUser = await authApi.adminLogin(cleanEmail, password);
        if (adminUser && (adminUser.id || adminUser.email)) {
          if (adminUser.isActive === false || adminUser.status === 'INACTIVE' || adminUser.isBlocked) {
            localStorage.removeItem(CURRENT_USER_KEY);
            throw new Error('This administrator account is currently inactive.');
          }
          // Clean any stale local block records
          liveCloudSync.unblockUser(adminUser.id, cleanEmail).catch(() => {});
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
          liveCloudSync.addUser({ ...adminUser, password }).catch(() => {});
          return adminUser;
        }
      } catch (err) {
        if (err.message?.toLowerCase().includes('inactive') || err.message?.toLowerCase().includes('block')) {
          throw err;
        }
        return null;
      }
      return null;
    };

    // Helper: Attempt Customer API login
    const tryCustomerLogin = async () => {
      try {
        const user = await authApi.login(cleanEmail, password);
        if (user && (user.id || user.email)) {
          if (user.isBlocked || user.status === 'BLOCKED' || user.isActive === false) {
            localStorage.removeItem(CURRENT_USER_KEY);
            throw new Error('Account is blocked. Please contact customer support.');
          }

          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
          liveCloudSync.addUser({ ...user, password }).catch(() => {});
          return user;
        }
      } catch (err) {
        if (err.message?.toLowerCase().includes('blocked') || err.message?.toLowerCase().includes('block')) {
          throw err;
        }
        return null;
      }
      return null;
    };

    // If email contains admin keywords, try admin first
    if (isAdminLikely) {
      const adminResult = await tryAdminLogin();
      if (adminResult) return adminResult;

      const customerResult = await tryCustomerLogin();
      if (customerResult) return customerResult;
    } else {
      // Otherwise try customer first, fallback to admin (for promoted customers with standard emails)
      const customerResult = await tryCustomerLogin();
      if (customerResult) return customerResult;

      const adminResult = await tryAdminLogin();
      if (adminResult) return adminResult;
    }

    throw new Error('Invalid email or password, or account does not exist.');
  },

  async signup({ name, email, password, phone = '', countryCode = '', preferredLanguage = 'En' }) {
    const cleanEmail = email.toLowerCase().trim();

    if (liveCloudSync.isUserBlocked(cleanEmail)) {
      throw new Error('This email address has been blocked from registering.');
    }

    // 1. Send registration directly to live ASP.NET backend database
    if (!apiClient.isMockEnabled()) {
      try {
        const user = await authApi.signup({ name, email: cleanEmail, password, phone, countryCode, preferredLanguage });
        if (user && (user.id || user.email)) {
          const userWithPhone = {
            ...user,
            name: user.name || name || 'Royal Patron',
            phone: phone || user.phone || '',
            countryCode: countryCode || user.countryCode || '',
            preferredLanguage: preferredLanguage || user.preferredLanguage || 'En',
            joinedDate: new Date().toISOString().split('T')[0],
            memberSince: new Date().toISOString().split('T')[0],
            ordersCount: 0,
            totalSpent: 0
          };
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithPhone));
          const users = loadUsers();
          const existingIdx = users.findIndex(u => (u.email || '').toLowerCase().trim() === cleanEmail);
          if (existingIdx > -1) {
            users[existingIdx] = { ...users[existingIdx], ...userWithPhone };
          } else {
            users.unshift(userWithPhone);
          }
          saveUsers(users);
          await liveCloudSync.addUser(userWithPhone).catch(() => {});
          return userWithPhone;
        }
      } catch (e) {
        console.error('ASP.NET Registration error:', e.message);
        throw new Error(e.message || 'Registration failed on the server. Please check your details.');
      }
    }

    // 2. Check live cloud and local for existing account
    await liveCloudSync.sync().catch(() => {});
    const existingInCloud = liveCloudSync.findUserByEmail(cleanEmail);
    const users = loadUsers();
    if (existingInCloud || users.some(u => (u.email || '').toLowerCase().trim() === cleanEmail)) {
      throw new Error('An account already exists with this email address.');
    }

    const newUser = {
      id: 'user-' + Date.now(),
      name,
      email: cleanEmail,
      phone,
      countryCode,
      password, // stored for seamless cross-device auth
      role: cleanEmail.includes('admin') ? 'ADMIN' : 'USER',
      status: 'ACTIVE',
      memberSince: new Date().toISOString().split('T')[0],
      ordersCount: 0,
      totalSpent: 0,
      addresses: [],
      paymentMethods: []
    };

    // Save to live cloud so ANY other device/browser can immediately log in!
    await liveCloudSync.addUser(newUser);

    users.push(newUser);
    saveUsers(users);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  async fetchLatestProfile() {
    const current = this.getCurrentUser();
    if (!current) return null;

    const isAdmin = Boolean(current.role === 'ADMIN' || current.role === 'SUPER_ADMIN' || current.isSuperAdmin || current.email?.toLowerCase().includes('admin') || current.email?.toLowerCase().includes('perfumestore'));

    // Admin account: preserve session intact on refresh
    if (isAdmin) {
      return current;
    }

    // For Customers:
    // If marked as deleted or blocked in cloud, sign out immediately
    if (liveCloudSync.isUserDeleted(current.email) || liveCloudSync.isUserBlocked(current.email)) {
      this.logout();
      return null;
    }

    // 1. Fetch fresh profile directly from live ASP.NET backend
    try {
      const freshUser = await authApi.getMe(false);
      if (freshUser && (freshUser.id || freshUser.email)) {
        // If account has been blocked or deactivated on server, sign out immediately
        if (freshUser.isBlocked || freshUser.status === 'BLOCKED' || freshUser.isActive === false) {
          this.logout();
          return null;
        }

        const merged = {
          ...current,
          ...freshUser,
          name: freshUser.name || (freshUser.firstName ? `${freshUser.firstName} ${freshUser.lastName || ''}`.trim() : current.name),
          firstName: freshUser.firstName || current.firstName,
          lastName: freshUser.lastName || current.lastName,
          phone: freshUser.phone || current.phone || freshUser.phoneNumber || current.phoneNumber
        };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (e) {
      // If server returned 401 Unauthorized (invalid/expired/deleted token) or 404 Not Found (user deleted from database):
      if (e.status === 401 || e.status === 404 || e.message?.toLowerCase().includes('not found') || e.message?.toLowerCase().includes('unauthorized') || e.message?.toLowerCase().includes('block')) {
        this.logout();
        return null;
      }
    }

    // 2. Also check live cloud sync for any customer updates
    await liveCloudSync.sync().catch(() => {});
    if (liveCloudSync.isUserDeleted(current.email) || liveCloudSync.isUserBlocked(current.email)) {
      this.logout();
      return null;
    }

    const cloudUser = liveCloudSync.findUserByEmail(current.email);
    if (cloudUser) {
      if (cloudUser.isBlocked || cloudUser.status === 'BLOCKED' || liveCloudSync.isUserBlocked(current.email)) {
        this.logout();
        return null;
      }
      const merged = {
        ...current,
        ...cloudUser,
        name: cloudUser.name || (cloudUser.firstName ? `${cloudUser.firstName} ${cloudUser.lastName || ''}`.trim() : current.name),
        firstName: cloudUser.firstName || current.firstName,
        lastName: cloudUser.lastName || current.lastName,
        phone: cloudUser.phone || current.phone
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(merged));
      return merged;
    }

    return current;
  },

  async updateProfile(updates) {
    if (!apiClient.isMockEnabled()) {
      try {
        const updated = await authApi.updateProfile(updates);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
        return updated;
      } catch (e) {
        console.warn('Real API update profile fallback:', e.message);
      }
    }

    const current = this.getCurrentUser();
    if (!current) throw new Error('Not authenticated');

    const users = loadUsers();
    const index = users.findIndex(u => u.id === current.id);
    if (index === -1) throw new Error('User not found');

    const updated = { ...users[index], ...updates };
    users[index] = updated;
    saveUsers(users);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
    return updated;
  },

  async forgotPassword(email) {
    if (!apiClient.isMockEnabled()) {
      try {
        return await authApi.forgotPassword(email);
      } catch (e) {
        console.warn('Real API forgotPassword fallback:', e.message);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    const users = loadUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      throw new Error('No registered account associated with this email.');
    }
    return { success: true, message: 'Recovery instructions dispatched to your royal email.' };
  },

  async resetPassword(token, newPassword) {
    if (!apiClient.isMockEnabled()) {
      try {
        return await authApi.resetPassword(token, newPassword);
      } catch (e) {
        console.warn('Real API resetPassword fallback:', e.message);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, message: 'Your password has been successfully updated.' };
  },

  logout() {
    authApi.logout().catch(() => {});
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CURRENT_USER_KEY);
      tokenManager.clearTokens();
      window.dispatchEvent(new CustomEvent('arabian_sheikh_auth_changed'));
    }
  }
};

export default authService;
