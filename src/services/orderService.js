import { INITIAL_ORDERS } from './mockData';

const ORDERS_STORAGE_KEY = 'arabian_sheikh_orders';

function loadOrders() {
  const data = localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_ORDERS;
  }
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
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
  async getAllOrders(filters = {}) {
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
        o.trackingCode?.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async getOrdersByUser(userId) {
    const orders = loadOrders();
    return orders
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async getOrderById(id) {
    const orders = loadOrders();
    return orders.find(o => o.id === id || o.id === `ORD-${id}`) || null;
  },

  async createOrder(orderPayload) {
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
    const orders = loadOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    orders[index].status = newStatus;
    saveOrders(orders);
    return orders[index];
  }
};
