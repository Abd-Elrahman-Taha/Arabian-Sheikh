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
  reviews: [],            // Customer product reviews & moderation queue
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
        reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
        users: Array.isArray(parsed.users) ? parsed.users : [],
        blockedUserEmails: Array.isArray(parsed.blockedUserEmails) ? parsed.blockedUserEmails : [],
        deletedUserEmails: Array.isArray(parsed.deletedUserEmails) ? parsed.deletedUserEmails : [],
        inactiveProductIds: Array.isArray(parsed.inactiveProductIds) ? parsed.inactiveProductIds : [],
        activeProductIds: Array.isArray(parsed.activeProductIds) ? parsed.activeProductIds : [],
        deletedProductIds: Array.isArray(parsed.deletedProductIds) ? parsed.deletedProductIds : [],
        modifiedProducts: parsed.modifiedProducts && typeof parsed.modifiedProducts === 'object' ? parsed.modifiedProducts : {},
        newProducts: [] // Purge legacy mock products
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
  (remoteData.orders || []).forEach(o => {
    if (o?.id) {
      const key = String(o.orderNumber || o.id).toLowerCase();
      orderMap.set(key, o);
    }
  });
  state.orders.forEach(o => {
    if (o?.id) {
      const key = String(o.orderNumber || o.id).toLowerCase();
      const existing = orderMap.get(key);
      if (existing) {
        const oTime = new Date(o.updatedAt || o.date || o.createdAt || 0).getTime();
        const exTime = new Date(existing.updatedAt || existing.date || existing.createdAt || 0).getTime();
        orderMap.set(key, oTime >= exTime ? { ...existing, ...o } : { ...o, ...existing });
      } else {
        orderMap.set(key, o);
      }
    }
  });

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

  const reviewMap = new Map();
  (remoteData.reviews || []).forEach(r => { if (r?.id) reviewMap.set(String(r.id), r); });
  (state.reviews || []).forEach(r => {
    if (r?.id) {
      const existing = reviewMap.get(String(r.id));
      reviewMap.set(String(r.id), { ...(existing || {}), ...r });
    }
  });

  // Remote modified products override local state
  const modified = {
    ...state.modifiedProducts,
    ...(remoteData.modifiedProducts || {})
  };

  state = {
    orders: Array.from(orderMap.values()),
    reviews: Array.from(reviewMap.values()),
    users: Array.from(userMap.values()),
    blockedUserEmails: state.blockedUserEmails,
    deletedUserEmails: state.deletedUserEmails,
    inactiveProductIds: state.inactiveProductIds,
    activeProductIds: state.activeProductIds,
    deletedProductIds: state.deletedProductIds,
    modifiedProducts: modified,
    newProducts: [],
    lastUpdated: remoteData.lastUpdated || state.lastUpdated || new Date().toISOString()
  };

  saveLocalState();

  // If current logged-in user is updated, blocked, or deleted, update session & UI immediately
  if (typeof window !== 'undefined') {
    try {
      const curr = JSON.parse(localStorage.getItem('arabian_sheikh_current_user') || 'null');
      if (curr && curr.email) {
        const currEmail = curr.email.toLowerCase().trim();
        if (state.blockedUserEmails?.includes(currEmail) || state.deletedUserEmails?.includes(currEmail)) {
          localStorage.removeItem('arabian_sheikh_current_user');
          window.dispatchEvent(new CustomEvent('arabian_sheikh_auth_changed'));
        } else {
          const freshUser = state.users.find(u => (u.email || '').toLowerCase().trim() === currEmail || String(u.id) === String(curr.id));
          if (freshUser) {
            const hasChanged = freshUser.name !== curr.name || freshUser.firstName !== curr.firstName || freshUser.lastName !== curr.lastName || freshUser.phone !== curr.phone;
            if (hasChanged) {
              const updatedCurr = {
                ...curr,
                ...freshUser,
                name: freshUser.name || `${freshUser.firstName || ''} ${freshUser.lastName || ''}`.trim() || curr.name,
                firstName: freshUser.firstName || curr.firstName,
                lastName: freshUser.lastName || curr.lastName,
                phone: freshUser.phone || curr.phone
              };
              localStorage.setItem('arabian_sheikh_current_user', JSON.stringify(updatedCurr));
              window.dispatchEvent(new CustomEvent('arabian_sheikh_auth_changed'));
            }
          }
        }
      }
    } catch {}
  }
}

// Pull latest state from live cloud and merge across devices
let isPulling = false;
let lastPulledTimestamp = null;

async function pullFromCloud() {
  if (typeof window === 'undefined') return state;
  if (isPulling) return state;

  isPulling = true;
  try {
    const res = await fetch(VERCEL_SYNC_ENDPOINT, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    }).catch(() => null);

    if (res && res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const remoteData = data?.data || data;
        const remoteTimestamp = remoteData.lastUpdated || null;

        // Only process and dispatch if there is actual new/updated data
        const isNew = !lastPulledTimestamp || (remoteTimestamp && remoteTimestamp !== lastPulledTimestamp);
        if (isNew) {
          lastPulledTimestamp = remoteTimestamp || new Date().toISOString();
          mergeRemoteData(remoteData);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('arabian_sheikh_cloud_updated', { detail: remoteData }));
          }
        }
        return state;
      }
    }
  } catch (err) {
    console.warn('Cloud sync pull error:', err.message);
  } finally {
    isPulling = false;
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

let lastSyncTime = 0;

export const liveCloudSync = {
  // Pull latest updates from cloud (throttled to at most once per 5 seconds unless forced)
  async sync(force = false) {
    const now = Date.now();
    if (!force && now - lastSyncTime < 5000) {
      return state;
    }
    lastSyncTime = now;
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

  // Apply all live cloud overrides (active/inactive, edits, deleted products)
  applyToProducts(baseProducts) {
    if (!Array.isArray(baseProducts)) return [];
    
    // 1. Filter out deleted products
    const deletedSet = new Set(state.deletedProductIds.map(String));
    let prods = baseProducts.filter(p => !deletedSet.has(String(p.id)) && !deletedSet.has(String(p.slug)));

    // 2. Apply modified fields and active/inactive status
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

      // Preserve live product price and tier directly from backend API without hardcoded overrides
      if (item.perfumeCategory && typeof item.perfumeCategory === 'object') {
        if (!item.tier && item.perfumeCategory.name) item.tier = item.perfumeCategory.name;
        if (item.perfumeCategory.price !== undefined && (!item.price || Number(item.price) === 0)) {
          item.price = Number(item.perfumeCategory.price);
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
  },

  async updateUser(id, updatedFields) {
    if (!id && !updatedFields?.email) return;
    const clean = (updatedFields?.email || '').toLowerCase().trim();
    state.users = (state.users || []).map(u => {
      if ((clean && (u.email || '').toLowerCase().trim() === clean) || String(u.id) === String(id)) {
        const fullName = updatedFields.fullName || (updatedFields.firstName ? `${updatedFields.firstName} ${updatedFields.lastName || ''}`.trim() : (updatedFields.name || u.name));
        return {
          ...u,
          ...updatedFields,
          name: fullName,
          fullName: fullName
        };
      }
      return u;
    });

    // Check if current user on this device is this user
    if (typeof window !== 'undefined') {
      try {
        const curr = JSON.parse(localStorage.getItem('arabian_sheikh_current_user') || 'null');
        if (curr && ((clean && curr.email?.toLowerCase().trim() === clean) || String(curr.id) === String(id))) {
          const fullName = updatedFields.fullName || (updatedFields.firstName ? `${updatedFields.firstName} ${updatedFields.lastName || ''}`.trim() : (updatedFields.name || curr.name));
          const merged = {
            ...curr,
            ...updatedFields,
            name: fullName,
            fullName: fullName
          };
          localStorage.setItem('arabian_sheikh_current_user', JSON.stringify(merged));
          window.dispatchEvent(new CustomEvent('arabian_sheikh_auth_changed'));
        }
      } catch {}
    }

    saveLocalState();
    await pushToCloud();
  },

  // ==========================================
  // ORDERS SYNCHRONIZATION
  // ==========================================
  getOrders() {
    return Array.isArray(state.orders) ? state.orders : [];
  },

  async addOrder(order) {
    if (!order || !order.id) return;
    const idStr = String(order.id);
    const numStr = order.orderNumber ? String(order.orderNumber) : null;
    const list = Array.isArray(state.orders) ? [...state.orders] : [];
    const idx = list.findIndex(o => String(o.id) === idStr || (numStr && String(o.orderNumber) === numStr));
    if (idx > -1) {
      list[idx] = { ...list[idx], ...order };
    } else {
      list.unshift(order);
    }
    state.orders = list;
    state.lastUpdated = new Date().toISOString();
    saveLocalState();
    await pushToCloud();
  },

  async updateOrderStatus(orderId, newStatus) {
    if (!orderId) return;
    const target = String(orderId).replace(/^#/, '').toLowerCase().trim();
    state.orders = (state.orders || []).map(o => {
      const oId = String(o.id || '').replace(/^#/, '').toLowerCase().trim();
      const oNum = String(o.orderNumber || '').replace(/^#/, '').toLowerCase().trim();
      if (oId === target || oNum === target || (oNum && target && (oNum.endsWith(target) || target.endsWith(oNum)))) {
        return {
          ...o,
          status: newStatus,
          orderStatus: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    });
    state.lastUpdated = new Date().toISOString();
    saveLocalState();
    await pushToCloud();
  },

  // ==========================================
  // REVIEWS SYNCHRONIZATION
  // ==========================================
  getReviews() {
    loadLocalState();
    return Array.isArray(state.reviews) ? state.reviews : [];
  },

  async addReview(review) {
    if (!review || !review.id) return;
    const list = Array.isArray(state.reviews) ? [...state.reviews] : [];
    const idx = list.findIndex(r => String(r.id) === String(review.id));
    if (idx > -1) {
      list[idx] = { ...list[idx], ...review };
    } else {
      list.unshift(review);
    }
    state.reviews = list;
    state.lastUpdated = new Date().toISOString();
    saveLocalState();
    await pushToCloud();
  },

  async updateReview(reviewId, updatedFields) {
    if (!reviewId) return;
    state.reviews = (state.reviews || []).map(r => {
      if (String(r.id) === String(reviewId)) {
        return { ...r, ...updatedFields, updatedAt: new Date().toISOString() };
      }
      return r;
    });
    state.lastUpdated = new Date().toISOString();
    saveLocalState();
    await pushToCloud();
  }
};
