import { INITIAL_USERS } from './mockData';

const USERS_STORAGE_KEY = 'arabian_sheikh_users';
const WISHLIST_STORAGE_KEY = 'arabian_sheikh_wishlist';

function loadUsers() {
  const data = localStorage.getItem(USERS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_USERS;
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export const userService = {
  // Wishlist
  getWishlist() {
    const data = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!data) return ['as-oud-royal-01', 'as-amber-malaki-02'];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  toggleWishlist(productId) {
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
    const users = loadUsers();
    const user = users.find(u => u.id === userId);
    return user?.addresses || [];
  },

  async addAddress(userId, addressData) {
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
    const users = loadUsers();
    const user = users.find(u => u.id === userId);
    return user?.paymentMethods || [];
  },

  async addPaymentMethod(userId, cardData) {
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
    const users = loadUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    user.role = newRole;
    saveUsers(users);
    return user;
  },

  async toggleUserBlock(userId) {
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
