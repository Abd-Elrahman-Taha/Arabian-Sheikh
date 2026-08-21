import { INITIAL_ORDERS } from './mockData';
import { orderApi } from '../api/order.api';
import { apiClient } from '../api/client';

const ORDERS_STORAGE_KEY = 'arabian_sheikh_orders';
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
  getAllOrdersSync(filters = {}) {
    const orders = loadOrders();
    let result = [...orders];

    if (filters.status && filters.status !== 'ALL') {
      result = result.filter(o => o.status === filters.status);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(o => 
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        (o.trackingCode && o.trackingCode.toLowerCase().includes(q))
      );
    }

    return result;
  },

  async getAllOrders(filters = {}) {
    const result = this.getAllOrdersSync(filters);

    if (!apiClient.isMockEnabled() && import.meta.env?.VITE_API_BASE_URL) {
      orderApi.getOrders(filters).then(remote => {
        if (Array.isArray(remote) && remote.length > 0) {
          saveOrders(remote);
        }
      }).catch(() => {});
    }

    return result;
  },

  getOrdersByUserSync(userId) {
    const orders = loadOrders();
    return orders
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  },

  async getOrdersByUser(userId) {
    return this.getOrdersByUserSync(userId);
  },

  getOrderByIdSync(id) {
    if (!id) return null;
    const orders = loadOrders();
    return orders.find(o => o.id === id || o.trackingCode === id) || null;
  },

  async getOrderById(id) {
    return this.getOrderByIdSync(id);
  },

  async createOrder(orderPayload) {
    if (!apiClient.isMockEnabled()) {
      try {
        return await orderApi.createOrder(orderPayload);
      } catch (e) {
        console.warn('Real API create order fallback:', e.message);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 400));
    const orders = loadOrders();

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const newOrder = {
      ...orderPayload,
      id: `ORD-${randomNum}`,
      date: new Date().toISOString(),
      status: 'CONFIRMED',
      trackingCode: `${randomNum}04-AE`,
      timeline: [
        { status: 'PLACED', title: 'Order Placed', timestamp: new Date().toISOString() },
        { status: 'CONFIRMED', title: 'Payment Confirmed', timestamp: new Date().toISOString() }
      ]
    };

    orders.unshift(newOrder);
    saveOrders(orders);
    return newOrder;
  },

  async updateOrderStatus(orderId, newStatus) {
    if (!apiClient.isMockEnabled()) {
      try {
        return await orderApi.updateOrderStatus(orderId, newStatus);
      } catch (e) {
        console.warn('Real API update order status fallback:', e.message);
      }
    }

    const orders = loadOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    orders[index].status = newStatus;
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
    return orders.find(o => o.trackingCode === trackingCode || o.id === trackingCode) || null;
  }
};

export default orderService;
