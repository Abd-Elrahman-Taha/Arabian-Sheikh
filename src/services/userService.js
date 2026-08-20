import { INITIAL_USERS } from './mockData';
import { userApi } from '../api/user.api';
import { wishlistApi } from '../api/wishlist.api';
import { apiClient } from '../api/client';

const USERS_STORAGE_KEY = 'arabian_sheikh_users';
const WISHLIST_STORAGE_KEY = 'arabian_sheikh_wishlist';

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

export const userService = {
  // Wishlist
  getWishlist() {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!data) return ['as-oud-royal-01', 'as-amber-malaki-02'];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  async toggleWishlist(productId) {
    if (!apiClient.isMockEnabled()) {
      try {
        const remote = await wishlistApi.toggleWishlist(productId);
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(remote));
        return remote;
      } catch (e) {
        console.warn('Real API toggle wishlist fallback:', e.message);
      }
    }

    const current = this.getWishlist();
    let updated;
    if (current.includes(productId)) {
      updated = current.filter(id => id !== productId);
    } else {
      updated = [productId, ...current];
    }
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  removeFromWishlist(productId) {
    const current = this.getWishlist();
    const updated = current.filter(id => id !== productId);
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  // Addresses
  async getAddresses(userId) {
    if (!apiClient.isMockEnabled()) {
      try {
        return await userApi.getAddresses();
      } catch (e) {
        console.warn('Real API get addresses fallback:', e.message);
      }
    }

    const users = loadUsers();
    const user = users.find(u => u.id === userId);
    return user?.addresses || [];
  },

  async addAddress(userId, addressData) {
    if (!apiClient.isMockEnabled()) {
      try {
        return await userApi.addAddress(addressData);
      } catch (e) {
        console.warn('Real API add address fallback:', e.message);
      }
    }

    const users = loadUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');

    const newAddr = {
      ...addressData,
      id: 'addr-' + Date.now(),
      isDefault: addressData.isDefault || users[userIndex].addresses?.length === 0
    };

    if (newAddr.isDefault && users[userIndex].addresses) {
      users[userIndex].addresses.forEach(a => { a.isDefault = false; });
    }

    users[userIndex].addresses = [newAddr, ...(users[userIndex].addresses || [])];
    saveUsers(users);
    return newAddr;
  },

  async deleteAddress(userId, addressId) {
    const users = loadUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');

    users[userIndex].addresses = (users[userIndex].addresses || []).filter(a => a.id !== addressId);
    saveUsers(users);
    return true;
  },

  // Payment Methods
  async getPaymentMethods(userId) {
    if (!apiClient.isMockEnabled()) {
      try {
        return await userApi.getPaymentMethods();
      } catch (e) {
        console.warn('Real API get payment methods fallback:', e.message);
      }
    }

    const users = loadUsers();
    const user = users.find(u => u.id === userId);
    return user?.paymentMethods || [];
  },

  async addPaymentMethod(userId, cardData) {
    if (!apiClient.isMockEnabled()) {
      try {
        return await userApi.addPaymentMethod(cardData);
      } catch (e) {
        console.warn('Real API add payment method fallback:', e.message);
      }
    }

    const users = loadUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');

    const newCard = {
      id: 'pm-' + Date.now(),
      cardholderName: cardData.cardholderName,
      last4: cardData.cardNumber.slice(-4),
      brand: cardData.cardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
      expiry: cardData.expiry,
      isDefault: cardData.isDefault || users[userIndex].paymentMethods?.length === 0
    };

    if (newCard.isDefault && users[userIndex].paymentMethods) {
      users[userIndex].paymentMethods.forEach(p => { p.isDefault = false; });
    }

    users[userIndex].paymentMethods = [newCard, ...(users[userIndex].paymentMethods || [])];
    saveUsers(users);
    return newCard;
  },

  async removePaymentMethod(userId, methodId) {
    const users = loadUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');

    users[userIndex].paymentMethods = (users[userIndex].paymentMethods || []).filter(p => p.id !== methodId);
    saveUsers(users);
    return true;
  },

  // Admin user management
  async getAllUsers(filters = {}) {
    if (!apiClient.isMockEnabled()) {
      try {
        return await userApi.getUsers(filters);
      } catch (e) {
        console.warn('Real API get all users fallback:', e.message);
      }
    }

    const users = loadUsers();
    let result = [...users];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }

    if (filters.role && filters.role !== 'ALL') {
      result = result.filter(u => u.role === filters.role);
    }

    return result;
  },

  async updateUserRole(userId, newRole) {
    if (!apiClient.isMockEnabled()) {
      try {
        return await userApi.updateUserRole(userId, newRole);
      } catch (e) {
        console.warn('Real API update role fallback:', e.message);
      }
    }

    const users = loadUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    user.role = newRole;
    saveUsers(users);
    return user;
  },

  async toggleUserBlock(userId) {
    if (!apiClient.isMockEnabled()) {
      try {
        const user = users.find(u => u.id === userId);
        const nextStatus = user?.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
        return await userApi.updateUserStatus(userId, nextStatus);
      } catch (e) {
        console.warn('Real API toggle block fallback:', e.message);
      }
    }

    const users = loadUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    user.status = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    saveUsers(users);
    return user;
  },

  async deleteUser(userId) {
    let users = loadUsers();
    users = users.filter(u => u.id !== userId);
    saveUsers(users);
    return true;
  }
};

export default userService;
