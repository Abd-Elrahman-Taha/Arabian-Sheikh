/**
 * Arabian Sheikh - Live Cloud Synchronization Engine
 * 
 * Synchronizes orders, product availability (Active/Inactive), additions, edits,
 * and deletions across all accounts, devices, and sessions globally in real time.
 */

const NTFY_ENDPOINT = 'https://ntfy.sh/arabian_sheikh_sync_hub_2026';
const CLOUD_OBJECT_ID = 'ff8081819ff5b11001a04379654336f1';
// In-memory state structure (Zero localStorage persistence)
let state = {
  orders: [],
  users: [],              // Registered customer and admin accounts
  blockedUserEmails: [],  // Emails of blocked accounts
  deletedUserEmails: [],  // Emails of deleted accounts
  inactiveProductIds: [], // IDs of products marked inactive
  activeProductIds: [],   // IDs explicitly marked active
  deletedProductIds: [],  // IDs of deleted products
  modifiedProducts: {},   // Map of { [id]: updatedProductFields }
  newProducts: []         // Array of newly created products
};

const LOCAL_STORAGE_KEY = 'arabian_sheikh_live_cloud_state_v4';

function loadLocalState() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = {
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        users: Array.isArray(parsed.users) ? parsed.users : [],
        blockedUserEmails: Array.isArray(parsed.blockedUserEmails) ? parsed.blockedUserEmails : [],
        deletedUserEmails: Array.isArray(parsed.deletedUserEmails) ? parsed.deletedUserEmails : [],
        inactiveProductIds: Array.isArray(parsed.inactiveProductIds) ? parsed.inactiveProductIds : [],
        activeProductIds: Array.isArray(parsed.activeProductIds) ? parsed.activeProductIds : [],
        deletedProductIds: Array.isArray(parsed.deletedProductIds) ? parsed.deletedProductIds : [],
        modifiedProducts: parsed.modifiedProducts && typeof parsed.modifiedProducts === 'object' ? parsed.modifiedProducts : {},
        newProducts: Array.isArray(parsed.newProducts) ? parsed.newProducts : []
      };
    }
  } catch (e) {
    console.warn('Could not read local cloud state:', e);
  }
}

function saveLocalState() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save local cloud state:', e);
  }
}

// Load state immediately on script initialization
loadLocalState();

const VERCEL_SYNC_ENDPOINT = '/api/live-sync';

// Push current state to the live cloud backend
let isPushing = false;
let pendingPush = false;

async function pushToCloud() {
  saveLocalState();
  if (typeof window === 'undefined') return;
  if (isPushing) {
    pendingPush = true;
    return;
  }

  isPushing = true;
  try {
    const dataPayload = {
      ...state,
      lastUpdated: new Date().toISOString()
    };

    // 1. Native Vercel Serverless Sync Hub (100% reachable globally, zero CORS / ISP blocks)
    fetch(VERCEL_SYNC_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataPayload)
    }).catch(() => {});

    // 2. Broadcast to all open tabs and windows locally
    window.dispatchEvent(new CustomEvent('arabian_sheikh_cloud_updated', { detail: dataPayload }));
  } catch (err) {
    console.warn('Cloud sync push error:', err.message);
  } finally {
    isPushing = false;
    if (pendingPush) {
      pendingPush = false;
      pushToCloud();
    }
  }
}

// Helper to merge remote state data
function mergeRemoteData(remoteData) {
  if (!remoteData || typeof remoteData !== 'object') return;

  // Direct adoption from latest broadcast
  if (Array.isArray(remoteData.activeProductIds)) {
    const activeList = remoteData.activeProductIds.map(String);
    state.activeProductIds = activeList;
    state.inactiveProductIds = (state.inactiveProductIds || []).filter(id => !activeList.includes(String(id)));
  }
  if (Array.isArray(remoteData.inactiveProductIds)) {
    const inactiveList = remoteData.inactiveProductIds.map(String);
    state.inactiveProductIds = inactiveList;
    state.activeProductIds = (state.activeProductIds || []).filter(id => !inactiveList.includes(String(id)));
  }
  if (Array.isArray(remoteData.deletedProductIds)) {
    state.deletedProductIds = remoteData.deletedProductIds.map(String);
  }

  if (Array.isArray(remoteData.blockedUserEmails)) {
    state.blockedUserEmails = remoteData.blockedUserEmails.map(e => String(e).toLowerCase().trim());
  }
  if (Array.isArray(remoteData.deletedUserEmails)) {
    state.deletedUserEmails = remoteData.deletedUserEmails.map(e => String(e).toLowerCase().trim());
  }

  const orderMap = new Map();
  (remoteData.orders || []).forEach(o => { if (o?.id) orderMap.set(String(o.id), o); });
  state.orders.forEach(o => { if (o?.id) orderMap.set(String(o.id), o); });

  const userMap = new Map();
  (remoteData.users || []).forEach(u => {
    if (u?.email) {
      const em = u.email.toLowerCase().trim();
      if (!state.deletedUserEmails?.includes(em)) {
        userMap.set(em, u);
      }
    }
  });
  state.users.forEach(u => {
    if (u?.email) {
      const em = u.email.toLowerCase().trim();
      if (!state.deletedUserEmails?.includes(em)) {
        userMap.set(em, u);
      }
    }
  });

  // Remote modified products override local state
  const modified = {
    ...state.modifiedProducts,
    ...(remoteData.modifiedProducts || {})
  };

  const newProdMap = new Map();
  (remoteData.newProducts || []).forEach(p => { if (p?.id) newProdMap.set(String(p.id), p); });
  state.newProducts.forEach(p => { if (p?.id) newProdMap.set(String(p.id), p); });

  state = {
    orders: Array.from(orderMap.values()),
    users: Array.from(userMap.values()),
    blockedUserEmails: state.blockedUserEmails,
    deletedUserEmails: state.deletedUserEmails,
    inactiveProductIds: state.inactiveProductIds,
    activeProductIds: state.activeProductIds,
    deletedProductIds: state.deletedProductIds,
    modifiedProducts: modified,
    newProducts: Array.from(newProdMap.values()),
    lastUpdated: remoteData.lastUpdated || state.lastUpdated || new Date().toISOString()
  };

  saveLocalState();

  // If current logged-in user is in blocked or deleted list, force sign-out immediately
  if (typeof window !== 'undefined') {
    try {
      const curr = JSON.parse(localStorage.getItem('arabian_sheikh_current_user') || 'null');
      if (curr && curr.email) {
        const currEmail = curr.email.toLowerCase().trim();
        if (state.blockedUserEmails?.includes(currEmail) || state.deletedUserEmails?.includes(currEmail)) {
          localStorage.removeItem('arabian_sheikh_current_user');
          window.dispatchEvent(new CustomEvent('arabian_sheikh_auth_changed'));
        }
      }
    } catch {}
  }
}

// Pull latest state from live cloud and merge across devices
async function pullFromCloud() {
  if (typeof window === 'undefined') return state;
  
  try {
    const res = await fetch(VERCEL_SYNC_ENDPOINT, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    }).catch(() => null);

    if (res && res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const remoteData = data?.data || data;
        mergeRemoteData(remoteData);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('arabian_sheikh_cloud_updated', { detail: remoteData }));
        }
        return state;
      }
    }
  } catch (err) {
    console.warn('Cloud sync pull error:', err.message);
  }
  return state;
}

// Live Real-Time Listener across all tabs & devices
function setupLiveSyncListener() {
  if (typeof window === 'undefined') return;

  // Listen for storage events across browser tabs
  window.addEventListener('storage', (e) => {
    if (e.key === LOCAL_STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        mergeRemoteData(parsed);
        window.dispatchEvent(new CustomEvent('arabian_sheikh_cloud_updated', { detail: parsed }));
      } catch {}
    }
  });
}

// Initialize on file load / page refresh
loadLocalState();
if (typeof window !== 'undefined') {
  pullFromCloud();
  setupLiveSyncListener();
}

export const liveCloudSync = {
  // Pull latest updates from cloud
  async sync() {
    return await pullFromCloud();
  },

  getState() {
    return state;
  },

  // ==========================================
  // ORDERS MANAGEMENT
  // ==========================================
  getOrders() {
    return state.orders;
  },

  async addOrder(order) {
    if (!order || !order.id) return;
    const exists = state.orders.some(o => String(o.id) === String(order.id));
    if (!exists) {
      state.orders.unshift(order);
    } else {
      state.orders = state.orders.map(o => String(o.id) === String(order.id) ? { ...o, ...order } : o);
    }
    await pushToCloud();
  },

  async updateOrderStatus(orderId, newStatus) {
    state.orders = state.orders.map(o => {
      if (String(o.id) === String(orderId) || o.orderNumber === orderId) {
        return {
          ...o,
          status: newStatus,
          orderStatus: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    });
    await pushToCloud();
  },

  // ==========================================
  // PRODUCT ACTIVE / INACTIVE STATUS
  // ==========================================
  isProductActive(productId, defaultActive = true) {
    const idStr = String(productId);
    if (state.deletedProductIds.includes(idStr)) return false;
    if (state.inactiveProductIds.includes(idStr)) return false;
    if (state.activeProductIds.includes(idStr)) return true;
    return defaultActive;
  },

  async setProductActive(productId, isActive) {
    const idStr = String(productId);
    const activeBool = Boolean(isActive);

    if (activeBool) {
      // Remove from inactive
      state.inactiveProductIds = (state.inactiveProductIds || []).filter(id => String(id) !== idStr);
      if (!state.activeProductIds.includes(idStr)) {
        state.activeProductIds.push(idStr);
      }
      // Clean modifiedProducts override
      if (state.modifiedProducts[idStr]) {
        state.modifiedProducts[idStr] = {
          ...state.modifiedProducts[idStr],
          isActive: true,
          status: 'ACTIVE'
        };
      }
    } else {
      // Remove from active
      state.activeProductIds = (state.activeProductIds || []).filter(id => String(id) !== idStr);
      if (!state.inactiveProductIds.includes(idStr)) {
        state.inactiveProductIds.push(idStr);
      }
      // Set modifiedProducts override
      if (state.modifiedProducts[idStr]) {
        state.modifiedProducts[idStr] = {
          ...state.modifiedProducts[idStr],
          isActive: false,
          status: 'INACTIVE'
        };
      }
    }

    state.lastUpdated = new Date().toISOString();
    saveLocalState();
    await pushToCloud();
  },

  // ==========================================
  // PRODUCT DELETIONS
  // ==========================================
  isProductDeleted(productId) {
    return state.deletedProductIds.includes(String(productId));
  },

  async deleteProduct(productId) {
    const idStr = String(productId);
    if (!state.deletedProductIds.includes(idStr)) {
      state.deletedProductIds.push(idStr);
    }
    // Remove from new products if it was there
    state.newProducts = state.newProducts.filter(p => String(p.id) !== idStr);
    await pushToCloud();
  },

  // ==========================================
  // PRODUCT ADDITIONS & EDITS
  // ==========================================
  async addProduct(product) {
    if (!product || !product.id) return;
    const idStr = String(product.id);
    state.deletedProductIds = state.deletedProductIds.filter(id => id !== idStr);
    state.newProducts = [product, ...state.newProducts.filter(p => String(p.id) !== idStr)];
    await pushToCloud();
  },

  async updateProduct(productId, updatedFields) {
    const idStr = String(productId);
    state.modifiedProducts[idStr] = {
      ...(state.modifiedProducts[idStr] || {}),
      ...updatedFields,
      updatedAt: new Date().toISOString()
    };
    // Also update in newProducts if present
    state.newProducts = state.newProducts.map(p => {
      if (String(p.id) === idStr) {
        return { ...p, ...updatedFields };
      }
      return p;
    });
    await pushToCloud();
  },

  // Apply all live cloud overrides (active/inactive, edits, new products, deleted products)
  applyToProducts(baseProducts) {
    if (!Array.isArray(baseProducts)) return [];
    
    // 1. Filter out deleted products
    const deletedSet = new Set(state.deletedProductIds.map(String));
    let prods = baseProducts.filter(p => !deletedSet.has(String(p.id)) && !deletedSet.has(String(p.slug)));

    // 2. Prepend newly added products that aren't in baseProducts
    const existingIds = new Set(prods.map(p => String(p.id)));
    for (const newP of state.newProducts) {
      if (!existingIds.has(String(newP.id)) && !deletedSet.has(String(newP.id))) {
        prods.unshift(newP);
        existingIds.add(String(newP.id));
      }
    }

    // 3. Apply modified fields and active/inactive status
    const inactiveSet = new Set(state.inactiveProductIds.map(String));
    const activeSet = new Set(state.activeProductIds.map(String));

    return prods.map(p => {
      const idStr = String(p.id);
      const slugStr = p.slug ? String(p.slug) : null;
      const numStr = p.numericId ? String(p.numericId) : null;
      let item = { ...p };

      // Apply modifications
      if (state.modifiedProducts[idStr]) {
        item = { ...item, ...state.modifiedProducts[idStr] };
      }
      if (slugStr && state.modifiedProducts[slugStr]) {
        item = { ...item, ...state.modifiedProducts[slugStr] };
      }
      if (numStr && state.modifiedProducts[numStr]) {
        item = { ...item, ...state.modifiedProducts[numStr] };
      }

      // Enforce live perfume tier and tier pricing dynamically
      const isPerfume = item.category === 'perfumes' || item.category === 'perfume' || !!item.tier || Number(item.categoryId) === 1;
      if (isPerfume && item.tier) {
        const tLower = item.tier.toLowerCase();
        if (tLower.includes('royal') || Number(item.perfumeCategoryId) === 2) {
          item.tier = 'Royal';
          item.perfumeCategoryName = 'Royal';
          item.perfumeCategoryId = 2;
          item.price = 40;
        } else if (tLower.includes('classic') || Number(item.perfumeCategoryId) === 3) {
          item.tier = 'Classic';
          item.perfumeCategoryName = 'Classic';
          item.perfumeCategoryId = 3;
          item.price = 30;
        } else {
          item.tier = 'Luxury';
          item.perfumeCategoryName = 'Luxury';
          item.perfumeCategoryId = 1;
          item.price = 50;
        }
      }

      // Apply active / inactive status (database status + explicit overrides)
      const isExplicitlyInactive = inactiveSet.has(idStr) || (slugStr && inactiveSet.has(slugStr)) || (numStr && inactiveSet.has(numStr));
      const isExplicitlyActive = activeSet.has(idStr) || (slugStr && activeSet.has(slugStr)) || (numStr && activeSet.has(numStr));

      if (isExplicitlyActive) {
        item.isActive = true;
        item.status = 'ACTIVE';
      } else if (isExplicitlyInactive) {
        item.isActive = false;
        item.status = 'INACTIVE';
      } else if (p.isActive !== undefined) {
        item.isActive = Boolean(p.isActive);
        item.status = item.isActive ? 'ACTIVE' : 'INACTIVE';
      } else {
        item.isActive = true;
        item.status = 'ACTIVE';
      }

      return item;
    });
  },

  // Get all cloud-synced user accounts
  getUsers() {
    return state.users || [];
  },

  // Find user by email in live cloud
  findUserByEmail(email) {
    if (!email) return null;
    const clean = email.toLowerCase().trim();
    if (state.deletedUserEmails?.includes(clean)) return null;
    return (state.users || []).find(u => (u.email || '').toLowerCase().trim() === clean) || null;
  },

  isUserBlocked(email) {
    if (!email) return false;
    const clean = email.toLowerCase().trim();
    if (state.blockedUserEmails?.includes(clean)) return true;
    const found = (state.users || []).find(u => (u.email || '').toLowerCase().trim() === clean);
    return Boolean(found?.isBlocked || found?.status === 'BLOCKED');
  },

  isUserDeleted(email) {
    if (!email) return false;
    const clean = email.toLowerCase().trim();
    return Boolean(state.deletedUserEmails?.includes(clean));
  },

  // Save new user or update existing user across all devices
  async addUser(user) {
    if (!user || !user.email) return;
    const clean = user.email.toLowerCase().trim();
    // Un-delete if re-registering
    state.deletedUserEmails = (state.deletedUserEmails || []).filter(e => e !== clean);
    const list = Array.isArray(state.users) ? state.users : [];
    const idx = list.findIndex(u => (u.email || '').toLowerCase().trim() === clean);
    if (idx > -1) {
      list[idx] = { ...list[idx], ...user };
    } else {
      list.push(user);
    }
    state.users = list;
    await pushToCloud();
  },

  async blockUser(id, email) {
    const clean = (email || '').toLowerCase().trim();
    if (clean && !state.blockedUserEmails.includes(clean)) {
      state.blockedUserEmails.push(clean);
    }
    state.users = (state.users || []).map(u => {
      if ((clean && (u.email || '').toLowerCase().trim() === clean) || String(u.id) === String(id)) {
        return { ...u, isBlocked: true, status: 'BLOCKED' };
      }
      return u;
    });

    // Check if currently logged in user is this blocked user
    if (typeof window !== 'undefined') {
      try {
        const curr = JSON.parse(localStorage.getItem('arabian_sheikh_current_user') || 'null');
        if (curr && ((clean && curr.email?.toLowerCase().trim() === clean) || String(curr.id) === String(id))) {
          localStorage.removeItem('arabian_sheikh_current_user');
          window.dispatchEvent(new CustomEvent('arabian_sheikh_auth_changed'));
        }
      } catch {}
    }

    await pushToCloud();
  },

  async unblockUser(id, email) {
    const clean = (email || '').toLowerCase().trim();
    if (clean) {
      state.blockedUserEmails = (state.blockedUserEmails || []).filter(e => e !== clean);
    }
    state.users = (state.users || []).map(u => {
      if ((clean && (u.email || '').toLowerCase().trim() === clean) || String(u.id) === String(id)) {
        return { ...u, isBlocked: false, status: 'ACTIVE' };
      }
      return u;
    });
    await pushToCloud();
  },

  async deleteUser(id, email) {
    const clean = (email || '').toLowerCase().trim();
    if (clean && !state.deletedUserEmails.includes(clean)) {
      state.deletedUserEmails.push(clean);
    }
    state.users = (state.users || []).filter(u => {
      if (clean && (u.email || '').toLowerCase().trim() === clean) return false;
      if (id && String(u.id) === String(id)) return false;
      return true;
    });

    // Check if currently logged in user is this deleted user
    if (typeof window !== 'undefined') {
      try {
        const curr = JSON.parse(localStorage.getItem('arabian_sheikh_current_user') || 'null');
        if (curr && ((clean && curr.email?.toLowerCase().trim() === clean) || String(curr.id) === String(id))) {
          localStorage.removeItem('arabian_sheikh_current_user');
          window.dispatchEvent(new CustomEvent('arabian_sheikh_auth_changed'));
        }
      } catch {}
    }

    await pushToCloud();
  }
};
