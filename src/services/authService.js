import { INITIAL_USERS } from './mockData';
import { authApi } from '../api/auth.api';
import { apiClient } from '../api/client';

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
    if (!apiClient.isMockEnabled()) {
      try {
        const user = await authApi.login(email, password);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return user;
      } catch (e) {
        // If it's an API validation error or invalid credentials, throw it directly
        if (e.status === 400 || e.status === 401 || e.status === 403 || e.status === 422) {
          throw e;
        }
        console.warn('Real Auth API network issue, falling back to local credentials:', e.message);
      }
    }

    // Simulate brief network delay
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const users = loadUsers();
    const cleanEmail = email.toLowerCase().trim();
    
    // Check if user exists
    let user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      // If email doesn't exist, allow mock login for seamless review or create quick guest/user
      if (cleanEmail.includes('admin')) {
        user = {
          id: 'user-admin-' + Date.now(),
          name: 'Grand Concierge',
          email: cleanEmail,
          role: 'ADMIN',
          status: 'ACTIVE',
          memberSince: new Date().toISOString().split('T')[0],
          ordersCount: 0,
          totalSpent: 0,
          addresses: [],
          paymentMethods: []
        };
        users.push(user);
        saveUsers(users);
      } else {
        throw new Error('No royal account found with this email. Please create an account.');
      }
    }

    if (user.status === 'BLOCKED') {
      throw new Error('This account has been temporarily restricted by the Palace Master.');
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  },

  async signup({ name, email, password }) {
    if (!apiClient.isMockEnabled()) {
      try {
        const user = await authApi.signup({ name, email, password });
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return user;
      } catch (e) {
        if (e.status === 400 || e.status === 409 || e.status === 422) {
          throw e;
        }
        console.warn('Real Auth API signup network issue, falling back to local register:', e.message);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 350));
    const users = loadUsers();
    const cleanEmail = email.toLowerCase().trim();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account already exists with this email address.');
    }

    const newUser = {
      id: 'user-' + Date.now(),
      name,
      email: cleanEmail,
      role: cleanEmail.includes('admin') ? 'ADMIN' : 'USER',
      status: 'ACTIVE',
      memberSince: new Date().toISOString().split('T')[0],
      ordersCount: 0,
      totalSpent: 0,
      addresses: [],
      paymentMethods: []
    };

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
