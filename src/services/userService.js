import { userApi } from '../api/user.api';
import { wishlistApi } from '../api/wishlist.api';
import { apiClient } from '../api/client';

const WISHLIST_STORAGE_KEY = 'arabian_sheikh_wishlist';
let inMemoryUsers = [];

function loadUsers() {
  return inMemoryUsers;
}

function saveUsers(users) {
  inMemoryUsers = Array.isArray(users) ? users : [];
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
    const current = this.getWishlist();
    let updated;
    if (current.includes(productId)) {
      updated = current.filter(id => id !== productId);
    } else {
      updated = [productId, ...current];
    }
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updated));

    if (!apiClient.isMockEnabled()) {
      wishlistApi.toggleWishlist(productId).catch(() => {});
    }

    return updated;
  },

  removeFromWishlist(productId) {
    const current = this.getWishlist();
    const updated = current.filter(id => id !== productId);
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  // Addresses
  getAddressesSync(userId) {
    const users = loadUsers();
    const user = users.find(u => u.id === userId);
    return user?.addresses || [];
  },

  async getAddresses(userId) {
    return this.getAddressesSync(userId);
  },

  async addAddress(userId, addressData) {
    const users = loadUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');

    const newAddr = {
      id: 'addr-' + Date.now(),
      fullName: addressData.fullName,
      address: addressData.address,
      city: addressData.city,
      country: addressData.country,
      postalCode: addressData.postalCode,
      phone: addressData.phone,
      isDefault: addressData.isDefault || users[userIndex].addresses?.length === 0
    };

    if (newAddr.isDefault && users[userIndex].addresses) {
      users[userIndex].addresses.forEach(a => { a.isDefault = false; });
    }

    users[userIndex].addresses = [newAddr, ...(users[userIndex].addresses || [])];
    saveUsers(users);

    if (!apiClient.isMockEnabled()) {
      userApi.addAddress(addressData).catch(() => {});
    }

    return newAddr;
  },

  async removeAddress(userId, addressId) {
    const users = loadUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');

    users[userIndex].addresses = (users[userIndex].addresses || []).filter(a => a.id !== addressId);
    saveUsers(users);
    return true;
  },

  // Payment Methods
  getPaymentMethodsSync(userId) {
    const users = loadUsers();
    const user = users.find(u => u.id === userId);
    return user?.paymentMethods || [];
  },

  async getPaymentMethods(userId) {
    return this.getPaymentMethodsSync(userId);
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

  // Admin user management (Patron Directory)
  getAllUsersSync(filters = {}) {
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

  // Admin Customer Management
  async getAllUsers(filters = {}) {
    try {
      const params = {};
      if (filters.search) params.Search = filters.search;
      if (filters.isBlocked !== undefined && filters.isBlocked !== 'ALL') {
        params.IsBlocked = filters.isBlocked === true || filters.isBlocked === 'true' || filters.isBlocked === 'BLOCKED';
      }
      if (filters.page) params.Page = Number(filters.page);
      if (filters.pageSize) params.PageSize = Number(filters.pageSize);
      if (filters.sortBy) params.SortBy = filters.sortBy;
      if (filters.sortDirection) params.SortDirection = filters.sortDirection;

      const response = await userApi.adminGetCustomers(params);
      const items = response?.items || (Array.isArray(response) ? response : []);
      saveUsers(items);
      return items;
    } catch (e) {
      console.warn('Backend adminGetCustomers API error:', e.message);
      return loadUsers();
    }
  },

  async updateCustomer(id, { firstName, lastName, phone }) {
    const numId = Number(id);
    if (!isNaN(numId) && numId > 0) {
      const updated = await userApi.adminUpdateCustomer(numId, { firstName, lastName, phone });
      const users = loadUsers().map(u => (u.id === numId || String(u.id) === String(id)) ? { ...u, ...updated } : u);
      saveUsers(users);
      return updated;
    }
    throw new Error('Invalid customer ID.');
  },

  async blockCustomer(id) {
    const numId = Number(id);
    if (!isNaN(numId) && numId > 0) {
      await userApi.adminBlockCustomer(numId);
      const users = loadUsers().map(u => (u.id === numId || String(u.id) === String(id)) ? { ...u, isBlocked: true, status: 'BLOCKED' } : u);
      saveUsers(users);
      return { id: numId, isBlocked: true, status: 'BLOCKED' };
    }
    throw new Error('Invalid customer ID.');
  },

  async unblockCustomer(id) {
    const numId = Number(id);
    if (!isNaN(numId) && numId > 0) {
      await userApi.adminUnblockCustomer(numId);
      const users = loadUsers().map(u => (u.id === numId || String(u.id) === String(id)) ? { ...u, isBlocked: false, status: 'ACTIVE' } : u);
      saveUsers(users);
      return { id: numId, isBlocked: false, status: 'ACTIVE' };
    }
    throw new Error('Invalid customer ID.');
  },

  async deleteCustomer(id) {
    const numId = Number(id);
    if (!isNaN(numId) && numId > 0) {
      await userApi.adminDeleteCustomer(numId);
      const users = loadUsers().filter(u => u.id !== numId && String(u.id) !== String(id));
      saveUsers(users);
      return true;
    }
    throw new Error('Invalid customer ID.');
  },

  // Backward compatibility alias
  async toggleUserBlock(userId) {
    const users = loadUsers();
    const user = users.find(u => String(u.id) === String(userId));
    if (user?.isBlocked || user?.status === 'BLOCKED') {
      return await this.unblockCustomer(userId);
    } else {
      return await this.blockCustomer(userId);
    }
  },

  async deleteUser(userId) {
    return await this.deleteCustomer(userId);
  }
};

export default userService;
