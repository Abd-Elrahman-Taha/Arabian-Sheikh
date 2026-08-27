import { INITIAL_ORDERS } from './mockData';
import { orderApi } from '../api/order.api';
import { apiClient } from '../api/client';

const ORDERS_STORAGE_KEY = 'arabian_sheikh_orders';
const PLACED_ORDERS_STORAGE_KEY = 'arabian_sheikh_placed_order_ids';
let inMemoryOrders = null;

function loadOrders() {
  if (inMemoryOrders && inMemoryOrders.length > 0) {
    return inMemoryOrders;
  }

  const data = typeof window !== 'undefined' ? localStorage.getItem(ORDERS_STORAGE_KEY) : null;
  if (!data) {
    inMemoryOrders = [...INITIAL_ORDERS];
    if (typeof window !== 'undefined') {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
    }
    return inMemoryOrders;
  }
  try {
    inMemoryOrders = JSON.parse(data);
    return inMemoryOrders;
  } catch {
    inMemoryOrders = [...INITIAL_ORDERS];
    return inMemoryOrders;
  }
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
    if (!apiClient.isMockEnabled() && import.meta.env?.VITE_API_BASE_URL) {
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
      const orderUserId = o.userId;
      const isPlacedOnDevice = placedIds.includes(o.id);

      return (
        isPlacedOnDevice ||
        (userEmail && orderEmail === userEmail) ||
        (userId && orderUserId && orderUserId === userId)
      );
    });

    // If no orders match and the current user is an Admin, show all orders
    if (mine.length === 0 && user?.role === 'ADMIN') {
      mine = [...all];
    }

    mine.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
    return mine;
  },

  /**
   * Get orders for Admin back-office with server sync
   */
  async getAdminOrders(filters = {}) {
    if (!apiClient.isMockEnabled() && import.meta.env?.VITE_API_BASE_URL) {
      try {
        const response = await orderApi.adminGetOrders(filters);
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
        console.warn('Real API adminGetOrders fallback:', e.message);
      }
    }

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

    if (!apiClient.isMockEnabled() && import.meta.env?.VITE_API_BASE_URL) {
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

    await new Promise(resolve => setTimeout(resolve, 300));
    const orders = loadOrders();

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

    // Save to list
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
    if (!apiClient.isMockEnabled()) {
      try {
        await orderApi.adminUpdateOrderStatus(orderId, newStatus);
      } catch (e) {
        console.warn('Real API update order status fallback:', e.message);
      }
    }

    const orders = loadOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    orders[index].status = newStatus;
    orders[index].orderStatus = newStatus;
    saveOrders(orders);
    return orders[index];
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

