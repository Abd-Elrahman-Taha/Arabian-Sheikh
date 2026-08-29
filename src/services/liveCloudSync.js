/**
 * Arabian Sheikh - Live Cloud Synchronization Engine
 * 
 * Synchronizes orders, product availability (Active/Inactive), additions, edits,
 * and deletions across all accounts, devices, and sessions globally in real time.
 */

const NTFY_ENDPOINT = 'https://ntfy.sh/arabian_sheikh_sync_hub_2026';
const CLOUD_OBJECT_ID = 'ff8081819ff5b11001a04379654336f1';
const CLOUD_ENDPOINT = `https://api.restful-api.dev/objects/${CLOUD_OBJECT_ID}`;
const LOCAL_STORAGE_KEY = 'arabian_sheikh_live_cloud_state_v1';

// In-memory state structure
let state = {
  orders: [],
  users: [],              // Registered customer and admin accounts
  inactiveProductIds: [], // IDs of products marked inactive
  activeProductIds: [],   // IDs explicitly marked active
  deletedProductIds: [],  // IDs of deleted products
  modifiedProducts: {},   // Map of { [id]: updatedProductFields }
  newProducts: []         // Array of newly created products
};

// Load initial state synchronously from localStorage for instant 0ms rendering
function loadLocalState() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = {
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        users: Array.isArray(parsed.users) ? parsed.users : [],
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

// Save state to localStorage
function saveLocalState() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save local cloud state:', e);
  }
}

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
    const payload = {
      name: 'arabian_sheikh_live_state',
      data: {
        ...state,
        lastUpdated: new Date().toISOString()
      }
    };

    // 1. Instant cross-device broadcast via public ntfy hub (unlimited, no auth)
    fetch(NTFY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});

    // 2. Secondary backup to restful-api.dev
    fetch(CLOUD_ENDPOINT, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
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

  // Protect newer local state from stale remote messages
  if (remoteData.lastUpdated && state.lastUpdated) {
    try {
      if (new Date(remoteData.lastUpdated).getTime() < new Date(state.lastUpdated).getTime()) {
        return;
      }
    } catch {}
  }

  // Direct adoption from latest broadcast
  if (Array.isArray(remoteData.inactiveProductIds)) {
    state.inactiveProductIds = remoteData.inactiveProductIds.map(String);
  }
  if (Array.isArray(remoteData.activeProductIds)) {
    state.activeProductIds = remoteData.activeProductIds.map(String);
  }
  if (Array.isArray(remoteData.deletedProductIds)) {
    state.deletedProductIds = remoteData.deletedProductIds.map(String);
  }

  const orderMap = new Map();
  (remoteData.orders || []).forEach(o => { if (o?.id) orderMap.set(String(o.id), o); });
  state.orders.forEach(o => { if (o?.id) orderMap.set(String(o.id), o); });

  const userMap = new Map();
  (remoteData.users || []).forEach(u => { if (u?.email) userMap.set(u.email.toLowerCase().trim(), u); });
  state.users.forEach(u => { if (u?.email) userMap.set(u.email.toLowerCase().trim(), u); });

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
    inactiveProductIds: state.inactiveProductIds,
    activeProductIds: state.activeProductIds,
    deletedProductIds: state.deletedProductIds,
    modifiedProducts: modified,
    newProducts: Array.from(newProdMap.values()),
    lastUpdated: remoteData.lastUpdated || state.lastUpdated || new Date().toISOString()
  };

  saveLocalState();
}

// Pull latest state from live cloud and merge across devices
async function pullFromCloud() {
  if (typeof window === 'undefined') return state;
  try {
    // 1. Pull from ntfy hub
    const ntfyRes = await fetch(`${NTFY_ENDPOINT}/json?poll=1`).catch(() => null);
    if (ntfyRes && ntfyRes.ok) {
      const text = await ntfyRes.text();
      const lines = text.trim().split('\n');
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        if (!line) continue;
        try {
          const item = JSON.parse(line);
          let remoteData = null;

          if (item.attachment?.url) {
            const fileRes = await fetch(item.attachment.url).catch(() => null);
            if (fileRes && fileRes.ok) {
              const json = await fileRes.json();
              remoteData = json?.data || json;
            }
          } else if (item.message) {
            try {
              const parsed = JSON.parse(item.message);
              remoteData = parsed?.data || parsed;
            } catch {}
          }

          if (remoteData) {
            mergeRemoteData(remoteData);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('arabian_sheikh_cloud_updated', { detail: remoteData }));
            }
            break; // Merged latest valid broadcast
          }
        } catch {}
      }
    }
  } catch (err) {
    console.warn('Cloud sync pull error:', err.message);
  }
  return state;
}

// Live Real-Time SSE Listener (Server-Sent Events) across all devices
function setupLiveSyncListener() {
  if (typeof window === 'undefined') return;

  let eventSource = null;

  function connect() {
    try {
      eventSource = new EventSource(`${NTFY_ENDPOINT}/sse`);

      eventSource.onmessage = async (event) => {
        try {
          const item = JSON.parse(event.data);
          let remoteData = null;

          if (item.attachment?.url) {
            const fileRes = await fetch(item.attachment.url).catch(() => null);
            if (fileRes && fileRes.ok) {
              const json = await fileRes.json();
              remoteData = json?.data || json;
            }
          } else if (item.message) {
            try {
              const json = JSON.parse(item.message);
              remoteData = json?.data || json;
            } catch {}
          }

          if (remoteData) {
            mergeRemoteData(remoteData);
            window.dispatchEvent(new CustomEvent('arabian_sheikh_cloud_updated', { detail: remoteData }));
          }
        } catch (e) {
          console.warn('SSE message error:', e);
        }
      };

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        // Reconnect after 3 seconds
        setTimeout(connect, 3000);
      };
    } catch {}
  }

  connect();

  // Background fallback poll every 5 seconds
  setInterval(() => {
    pullFromCloud();
  }, 5000);
}

// Initialize on file import
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
      // Remove from inactive, add to active
      state.inactiveProductIds = state.inactiveProductIds.filter(id => id !== idStr);
      if (!state.activeProductIds.includes(idStr)) {
        state.activeProductIds.push(idStr);
      }
    } else {
      // Remove from active, add to inactive
      state.activeProductIds = state.activeProductIds.filter(id => id !== idStr);
      if (!state.inactiveProductIds.includes(idStr)) {
        state.inactiveProductIds.push(idStr);
      }
    }

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

      // Automatically handle discount price calculations
      if (item.discountPercent && Number(item.discountPercent) > 0) {
        const basePrice = item.originalPrice ? Number(item.originalPrice) : Number(item.price);
        item.originalPrice = basePrice;
        item.price = Math.round(basePrice * (1 - Number(item.discountPercent) / 100));
        item.hasDiscount = true;
        item.isOffer = true;
      } else if (item.discountPercent === 0) {
        if (item.originalPrice) {
          item.price = item.originalPrice;
        }
        item.hasDiscount = false;
        item.isOffer = false;
      }

      // Apply active / inactive status
      const isExplicitlyInactive = inactiveSet.has(idStr) || (slugStr && inactiveSet.has(slugStr)) || (numStr && inactiveSet.has(numStr));
      const isExplicitlyActive = activeSet.has(idStr) || (slugStr && activeSet.has(slugStr)) || (numStr && activeSet.has(numStr));

      if (isExplicitlyInactive) {
        item.isActive = false;
        item.status = 'INACTIVE';
      } else if (isExplicitlyActive) {
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
    return (state.users || []).find(u => (u.email || '').toLowerCase().trim() === clean) || null;
  },

  // Save new user or update existing user across all devices
  async addUser(user) {
    if (!user || !user.email) return;
    const clean = user.email.toLowerCase().trim();
    const list = Array.isArray(state.users) ? state.users : [];
    const idx = list.findIndex(u => (u.email || '').toLowerCase().trim() === clean);
    if (idx > -1) {
      list[idx] = { ...list[idx], ...user };
    } else {
      list.push(user);
    }
    state.users = list;
    await pushToCloud();
  }
};
