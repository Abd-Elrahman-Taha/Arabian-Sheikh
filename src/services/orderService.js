import { INITIAL_ORDERS } from './mockData';
import { orderApi } from '../api/order.api';
import { apiClient } from '../api/client';
import { liveCloudSync } from './liveCloudSync';

const ORDERS_STORAGE_KEY = 'arabian_sheikh_orders';
const PLACED_ORDERS_STORAGE_KEY = 'arabian_sheikh_placed_order_ids';
let inMemoryOrders = null;

function loadOrders() {
  let base = inMemoryOrders;
  if (!base || base.length === 0) {
    const data = typeof window !== 'undefined' ? localStorage.getItem(ORDERS_STORAGE_KEY) : null;
    if (data) {
      try {
        const parsed = JSON.parse(data);
        base = Array.isArray(parsed) && parsed.length > 0 ? parsed : [...INITIAL_ORDERS];
      } catch {
        base = [...INITIAL_ORDERS];
      }
    } else {
      base = [...INITIAL_ORDERS];
    }
  }

  // Merge live cloud orders
  const cloudOrders = liveCloudSync.getOrders();
  const orderMap = new Map();
  (base || []).forEach(o => { if (o?.id) orderMap.set(String(o.id), o); });
  (cloudOrders || []).forEach(o => { if (o?.id) orderMap.set(String(o.id), o); });

  inMemoryOrders = Array.from(orderMap.values());
  return inMemoryOrders;
}

function saveOrders(orders) {
  inMemoryOrders = orders;
  if (typeof window !== 'undefined') {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }
}

function loadPlacedOrderIds() {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(PLACED_ORDERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function recordPlacedOrderId(id) {
  if (typeof window === 'undefined' || !id) return;
  const list = loadPlacedOrderIds();
  if (!list.includes(id)) {
    list.unshift(id);
    localStorage.setItem(PLACED_ORDERS_STORAGE_KEY, JSON.stringify(list));
  }
}

export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED'
];

export const orderService = {
  recordPlacedOrderId(id) {
    recordPlacedOrderId(id);
  },

  getPlacedOrderIds() {
    return loadPlacedOrderIds();
  },

  getAllOrdersSync(filters = {}) {
    const orders = loadOrders();
    let result = [...orders];

    if (filters.status && filters.status !== 'ALL') {
      result = result.filter(o => (o.status || o.orderStatus) === filters.status);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(o => 
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(q)) ||
        (o.trackingCode && o.trackingCode.toLowerCase().includes(q)) ||
        (o.dhlTrackingNumber && o.dhlTrackingNumber.toLowerCase().includes(q))
      );
    }

    return result;
  },

  /**
   * Get orders for the customer viewing their account
   * Returns orders placed in this browser session, or matching email/userId, or all if Admin
   */
  async getCustomerOrders(user) {
    if (!apiClient.isMockEnabled()) {
      try {
        const response = await orderApi.getMyOrders();
        const remoteItems = response?.items || (Array.isArray(response) ? response : []);
        if (Array.isArray(remoteItems) && remoteItems.length > 0) {
          const current = loadOrders();
          const merged = [...current];
          for (const item of remoteItems) {
            const idx = merged.findIndex(o => o.id === item.id);
            if (idx > -1) {
              merged[idx] = { ...merged[idx], ...item };
            } else {
              merged.unshift(item);
            }
          }
          saveOrders(merged);
        }
      } catch (e) {
        console.warn('Real API getMyOrders fallback:', e.message);
      }
    }

    const all = loadOrders();
    const placedIds = loadPlacedOrderIds();
    const userEmail = user?.email?.toLowerCase().trim();
    const userId = user?.id;

    let mine = all.filter(o => {
      const orderEmail = (o.customerEmail || '').toLowerCase().trim();
      const orderUserId = o.userId ? String(o.userId) : null;
      const currentUserIdStr = userId ? String(userId) : null;
      const isPlacedOnDevice = !user && placedIds.includes(o.id);

      if (userEmail && orderEmail && orderEmail === userEmail) return true;
      if (currentUserIdStr && orderUserId && orderUserId === currentUserIdStr) return true;
      if (isPlacedOnDevice) return true;
      return false;
    });

    mine.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
    return mine;
  },

  /**
   * Get orders for Admin back-office with server sync & live cloud sync
   */
  async getAdminOrders(filters = {}) {
    // 1. Pull latest orders from live cloud sync
    await liveCloudSync.sync().catch(() => {});
    const cloudOrders = liveCloudSync.getOrders();

    if (!apiClient.isMockEnabled()) {
      try {
        const response = await orderApi.adminGetOrders(filters);
        const remoteItems = response?.items || (Array.isArray(response) ? response : []);
        if (Array.isArray(remoteItems) && remoteItems.length > 0) {
          for (const item of remoteItems) {
            await liveCloudSync.addOrder(item);
          }
        }
      } catch (e) {
        console.warn('Real API adminGetOrders fallback:', e.message);
      }
    }

    const current = loadOrders();
    const orderMap = new Map();
    (current || []).forEach(o => { if (o?.id) orderMap.set(String(o.id), o); });
    (cloudOrders || []).forEach(o => { if (o?.id) orderMap.set(String(o.id), o); });
    const merged = Array.from(orderMap.values());
    saveOrders(merged);

    return this.getAllOrdersSync(filters);
  },

  async getAllOrders(filters = {}) {
    return this.getAdminOrders(filters);
  },

  getOrdersByUserSync(userId) {
    const orders = loadOrders();
    return orders
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
  },

  async getOrdersByUser(userId) {
    return this.getOrdersByUserSync(userId);
  },

  getOrderByIdSync(id) {
    if (!id) return null;
    const orders = loadOrders();
    return orders.find(o => o.id === id || o.trackingCode === id || o.dhlTrackingNumber === id) || null;
  },

  async getOrderById(id) {
    const local = this.getOrderByIdSync(id);
    if (local) return local;

    if (!apiClient.isMockEnabled()) {
      try {
        const remote = await orderApi.getOrderById(id);
        if (remote) {
          const orders = loadOrders();
          orders.unshift(remote);
          saveOrders(orders);
          return remote;
        }
      } catch (e) {
        console.warn('Real API getOrderById fallback:', e.message);
      }
    }

    return null;
  },

  async createOrder(orderPayload) {
    let apiOrder = null;
    if (!apiClient.isMockEnabled()) {
      try {
        apiOrder = await orderApi.createOrder(orderPayload);
      } catch (e) {
        console.warn('Real API create order fallback:', e.message);
      }
    }

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = apiOrder?.id || `ORD-${randomNum}`;
    const trackingCode = apiOrder?.trackingCode || apiOrder?.shipping?.trackingNumber || `${randomNum}04-AE`;

    const newOrder = {
      ...orderPayload,
      ...(apiOrder || {}),
      id: orderId,
      orderNumber: orderId,
      customerEmail: orderPayload.customerEmail || apiOrder?.customerEmail || '',
      customerName: orderPayload.customerName || apiOrder?.customerName || 'Valued Patron',
      customerPhone: orderPayload.customerPhone || apiOrder?.customerPhone || '',
      userId: orderPayload.userId || apiOrder?.userId || null,
      items: orderPayload.items || apiOrder?.items || [],
      total: orderPayload.total ?? apiOrder?.total ?? 0,
      subtotal: orderPayload.subtotal ?? apiOrder?.subtotal ?? 0,
      shipping: orderPayload.shipping ?? apiOrder?.shippingCost ?? 0,
      shippingAddress: orderPayload.shippingAddress || apiOrder?.shippingAddress || {},
      date: apiOrder?.date || apiOrder?.createdAt || new Date().toISOString(),
      status: apiOrder?.status || apiOrder?.orderStatus || 'CONFIRMED',
      trackingCode,
      dhlTrackingNumber: orderPayload.dhlTrackingNumber || trackingCode,
      timeline: [
        { status: 'PLACED', title: 'Order Placed', timestamp: new Date().toISOString() },
        { status: 'CONFIRMED', title: 'Payment Confirmed', timestamp: new Date().toISOString() }
      ]
    };

    // Save to live cloud sync so all admins and accounts see it immediately!
    await liveCloudSync.addOrder(newOrder);

    // Save to local list
    const orders = loadOrders();
    const existingIndex = orders.findIndex(o => o.id === newOrder.id);
    if (existingIndex > -1) {
      orders[existingIndex] = newOrder;
    } else {
      orders.unshift(newOrder);
    }
    saveOrders(orders);

    // Record this order on this client/device so it always appears for the one who made it
    recordPlacedOrderId(newOrder.id);

    return newOrder;
  },

  async updateOrderStatus(orderId, newStatus) {
    // 1. Update in live cloud sync
    await liveCloudSync.updateOrderStatus(orderId, newStatus);

    // 2. Update remote API
    if (!apiClient.isMockEnabled()) {
      try {
        await orderApi.adminUpdateOrderStatus(orderId, newStatus);
      } catch (e) {
        console.warn('Real API update order status fallback:', e.message);
      }
    }

    const orders = loadOrders();
    const index = orders.findIndex(o => String(o.id) === String(orderId) || o.orderNumber === orderId);
    if (index > -1) {
      orders[index].status = newStatus;
      orders[index].orderStatus = newStatus;
      orders[index].updatedAt = new Date().toISOString();
      if (!orders[index].timeline) orders[index].timeline = [];
      orders[index].timeline.push({
        status: newStatus,
        title: `Status: ${newStatus}`,
        timestamp: new Date().toISOString()
      });
      saveOrders(orders);
      return orders[index];
    }
    return { id: orderId, status: newStatus };
  },

  async trackOrder(trackingCode) {
    if (!apiClient.isMockEnabled()) {
      try {
        return await orderApi.trackOrder(trackingCode);
      } catch (e) {
        console.warn('Real API track order fallback:', e.message);
      }
    }

    const orders = loadOrders();
    return orders.find(o => o.trackingCode === trackingCode || o.dhlTrackingNumber === trackingCode || o.id === trackingCode) || null;
  }
};

export default orderService;

