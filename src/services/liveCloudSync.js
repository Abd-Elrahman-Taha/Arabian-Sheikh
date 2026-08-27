/**
 * Arabian Sheikh - Live Cloud Synchronization Engine
 * 
 * Synchronizes orders, product availability (Active/Inactive), additions, edits,
 * and deletions across all accounts, devices, and sessions globally in real time.
 */

const CLOUD_OBJECT_ID = 'ff8081819ff5b11001a04379654336f1';
const CLOUD_ENDPOINT = `https://api.restful-api.dev/objects/${CLOUD_OBJECT_ID}`;
const LOCAL_STORAGE_KEY = 'arabian_sheikh_live_cloud_state_v1';

// In-memory state structure
let state = {
  orders: [],
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

    const res = await fetch(CLOUD_ENDPOINT, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      // If object doesn't exist yet, try creating it with PATCH or POST
      await fetch(`https://api.restful-api.dev/objects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('Cloud sync push error (using local persistence):', err.message);
  } finally {
    isPushing = false;
    if (pendingPush) {
      pendingPush = false;
      pushToCloud();
    }
  }
}

// Pull latest state from the live cloud backend and merge
async function pullFromCloud() {
  if (typeof window === 'undefined') return state;
  try {
    const res = await fetch(CLOUD_ENDPOINT, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const json = await res.json();
      const remoteData = json?.data;
      if (remoteData && typeof remoteData === 'object') {
        // Merge orders (union by ID, remote + local)
        const orderMap = new Map();
        (remoteData.orders || []).forEach(o => { if (o?.id) orderMap.set(String(o.id), o); });
        state.orders.forEach(o => { if (o?.id) orderMap.set(String(o.id), o); });
        
        // Merge inactive IDs
        const inactiveSet = new Set([
          ...(remoteData.inactiveProductIds || []),
          ...state.inactiveProductIds
        ]);

        // Merge active IDs
        const activeSet = new Set([
          ...(remoteData.activeProductIds || []),
          ...state.activeProductIds
        ]);

        // Merge deleted IDs
        const deletedSet = new Set([
          ...(remoteData.deletedProductIds || []),
          ...state.deletedProductIds
        ]);

        // Merge modified products
        const modified = {
          ...(remoteData.modifiedProducts || {}),
          ...state.modifiedProducts
        };

        // Merge new products
        const newProdMap = new Map();
        (remoteData.newProducts || []).forEach(p => { if (p?.id) newProdMap.set(String(p.id), p); });
        state.newProducts.forEach(p => { if (p?.id) newProdMap.set(String(p.id), p); });

        state = {
          orders: Array.from(orderMap.values()),
          inactiveProductIds: Array.from(inactiveSet),
          activeProductIds: Array.from(activeSet),
          deletedProductIds: Array.from(deletedSet),
          modifiedProducts: modified,
          newProducts: Array.from(newProdMap.values())
        };

        saveLocalState();
      }
    }
  } catch (err) {
    console.warn('Cloud sync pull error (using local cache):', err.message);
  }
  return state;
}

// Initialize on file import
loadLocalState();
if (typeof window !== 'undefined') {
  // Sync in background immediately
  pullFromCloud();
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
      let item = { ...p };

      // Apply modifications
      if (state.modifiedProducts[idStr]) {
        item = { ...item, ...state.modifiedProducts[idStr] };
      } else if (slugStr && state.modifiedProducts[slugStr]) {
        item = { ...item, ...state.modifiedProducts[slugStr] };
      }

      // Apply active / inactive status
      if (inactiveSet.has(idStr) || (slugStr && inactiveSet.has(slugStr))) {
        item.isActive = false;
        item.status = 'INACTIVE';
      } else if (activeSet.has(idStr) || (slugStr && activeSet.has(slugStr))) {
        item.isActive = true;
        item.status = 'ACTIVE';
      }

      return item;
    });
  }
};
