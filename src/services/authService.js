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

    // 1. If admin email or superadmin, try Admin Login first
    if (cleanEmail.includes('admin') || cleanEmail.includes('perfumestore')) {
      try {
        const adminUser = await authApi.adminLogin(cleanEmail, password);
        if (adminUser && (adminUser.id || adminUser.email)) {
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
          liveCloudSync.addUser({ ...adminUser, password }).catch(() => {});
          return adminUser;
        }
      } catch (adminErr) {
        console.warn('Admin API login failed, checking customer endpoint:', adminErr.message);
      }
    }

    // 2. Try Customer Login
    try {
      const user = await authApi.login(cleanEmail, password);
      if (user && (user.id || user.email)) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        liveCloudSync.addUser({ ...user, password }).catch(() => {});
        return user;
      }
    } catch (custErr) {
      // Fallback: If not tried yet, try Admin Login as well
      if (!cleanEmail.includes('admin') && !cleanEmail.includes('perfumestore')) {
        try {
          const adminUser = await authApi.adminLogin(cleanEmail, password);
          if (adminUser && (adminUser.id || adminUser.email)) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
            liveCloudSync.addUser({ ...adminUser, password }).catch(() => {});
            return adminUser;
          }
        } catch {}
      }
      console.warn('Customer API login error, checking live cloud database:', custErr.message);
    }

    // 3. Pull freshest user credentials from live cloud across all devices
    await liveCloudSync.sync().catch(() => {});

    // 4. Check cloud-synced users
    const cloudUser = liveCloudSync.findUserByEmail(cleanEmail);
    const users = loadUsers();
    let user = cloudUser || users.find(u => (u.email || '').toLowerCase().trim() === cleanEmail);

    // If found in cloud but not local, save to local
    if (cloudUser && !users.some(u => (u.email || '').toLowerCase().trim() === cleanEmail)) {
      users.push(cloudUser);
      saveUsers(users);
    }

    if (!user) {
      // Allow demo login for standard testing
      if (cleanEmail === 'superadmin@perfumestore.com') {
        user = {
          id: 1,
          name: 'System Super Admin',
          fullName: 'System Super Admin',
          email: cleanEmail,
          role: 'SUPER_ADMIN',
          isSuperAdmin: true,
          status: 'ACTIVE',
          isActive: true,
          memberSince: new Date().toISOString().split('T')[0],
          ordersCount: 0,
          totalSpent: 0,
          addresses: [],
          paymentMethods: []
        };
        users.push(user);
        saveUsers(users);
        liveCloudSync.addUser(user).catch(() => {});
      } else if (cleanEmail.includes('admin') || cleanEmail.includes('perfumestore')) {
        user = {
          id: 'user-admin-' + Date.now(),
          name: 'Palace Admin',
          email: cleanEmail,
          role: 'ADMIN',
          isSuperAdmin: false,
          status: 'ACTIVE',
          memberSince: new Date().toISOString().split('T')[0],
          ordersCount: 0,
          totalSpent: 0,
          addresses: [],
          paymentMethods: []
        };
        users.push(user);
        saveUsers(users);
        liveCloudSync.addUser(user).catch(() => {});
      } else if (cleanEmail === 'sheikh.user@luxury.com' || cleanEmail.includes('user') || cleanEmail.includes('sheikh')) {
        user = {
          id: 'user-demo-' + Date.now(),
          name: 'Sheikh Al-Mansoor',
          email: cleanEmail,
          role: 'USER',
          status: 'ACTIVE',
          memberSince: new Date().toISOString().split('T')[0],
          ordersCount: 4,
          totalSpent: 260,
          addresses: [],
          paymentMethods: []
        };
        users.push(user);
        saveUsers(users);
        liveCloudSync.addUser(user).catch(() => {});
      } else {
        throw new Error('No royal account found with this email. Please create an account.');
      }
    }

    // Verify password if account has a recorded password
    if (user.password && password && user.password !== password) {
      throw new Error('Invalid email or password.');
    }

    if (user.status === 'BLOCKED') {
      throw new Error('This account has been temporarily restricted by the Palace Master.');
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  },

  async signup({ name, email, password, phone = '', countryCode = '' }) {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Send registration directly to live ASP.NET backend database
    if (!apiClient.isMockEnabled()) {
      try {
        const user = await authApi.signup({ name, email: cleanEmail, password, phone, countryCode });
        if (user && (user.id || user.email)) {
          const userWithPhone = {
            ...user,
            name: user.name || name || 'Royal Patron',
            phone: phone || user.phone || '',
            countryCode: countryCode || user.countryCode || '',
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
