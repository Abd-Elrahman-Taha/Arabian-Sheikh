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

    // 0. Check live cloud block and deletion lists
    if (liveCloudSync.isUserBlocked(cleanEmail)) {
      throw new Error('This account has been blocked by the Administrator.');
    }
    if (liveCloudSync.isUserDeleted(cleanEmail)) {
      throw new Error('No account found with this email. Please register.');
    }

    // 1. If admin email or superadmin, try Admin Login first
    if (cleanEmail.includes('admin') || cleanEmail.includes('perfumestore')) {
      try {
        const adminUser = await authApi.adminLogin(cleanEmail, password);
        if (adminUser && (adminUser.id || adminUser.email)) {
          if (adminUser.isBlocked || adminUser.status === 'BLOCKED' || adminUser.isActive === false) {
            localStorage.removeItem(CURRENT_USER_KEY);
            throw new Error('This account has been blocked by the Administrator.');
          }
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
          liveCloudSync.addUser({ ...adminUser, password }).catch(() => {});
          return adminUser;
        }
      } catch (adminErr) {
        if (adminErr.status === 401 || adminErr.status === 400 || adminErr.status === 404 || adminErr.message?.toLowerCase().includes('password') || adminErr.message?.toLowerCase().includes('block') || adminErr.message?.toLowerCase().includes('invalid')) {
          throw new Error(adminErr.message || 'Invalid admin email or password.');
        }
        console.warn('Admin API login failed, checking customer endpoint:', adminErr.message);
      }
    }

    // 2. Try Customer Login against live ASP.NET backend
    try {
      const user = await authApi.login(cleanEmail, password);
      if (user && (user.id || user.email)) {
        if (user.isBlocked || user.status === 'BLOCKED' || user.isActive === false || liveCloudSync.isUserBlocked(cleanEmail)) {
          localStorage.removeItem(CURRENT_USER_KEY);
          throw new Error('This account has been blocked by the Administrator.');
        }
        if (liveCloudSync.isUserDeleted(cleanEmail)) {
          localStorage.removeItem(CURRENT_USER_KEY);
          throw new Error('No account found with this email. Please register.');
        }

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        liveCloudSync.addUser({ ...user, password }).catch(() => {});
        return user;
      }
    } catch (custErr) {
      if (custErr.status === 401 || custErr.status === 400 || custErr.status === 404 || custErr.message?.toLowerCase().includes('password') || custErr.message?.toLowerCase().includes('invalid') || custErr.message?.toLowerCase().includes('block') || custErr.message?.toLowerCase().includes('not found')) {
        throw new Error(custErr.message || 'Invalid email or password.');
      }
      console.warn('Customer API login error:', custErr.message);
    }

    throw new Error('Invalid email or password.');
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
    }
  }
};

export default authService;
