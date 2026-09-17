import { INITIAL_ORDERS } from './mockData';
import { orderApi } from '../api/order.api';
import { addressApi } from '../api/address.api';
import { cartApi } from '../api/cart.api';
import { apiClient } from '../api/client';
import { liveCloudSync } from './liveCloudSync';

const ORDERS_STORAGE_KEY = 'arabian_sheikh_orders';
const PLACED_ORDERS_STORAGE_KEY = 'arabian_sheikh_placed_order_ids';
let inMemoryOrders = null;

function loadOrders() {
  let base = [];
  const data = typeof window !== 'undefined' ? localStorage.getItem(ORDERS_STORAGE_KEY) : null;
  if (data) {
    try {
      const parsed = JSON.parse(data);
      base = Array.isArray(parsed) && parsed.length > 0 ? parsed : (inMemoryOrders || [...INITIAL_ORDERS]);
    } catch {
      base = inMemoryOrders || [...INITIAL_ORDERS];
    }
  } else {
    base = inMemoryOrders || [...INITIAL_ORDERS];
  }

  // Merge live cloud orders
  const cloudOrders = typeof liveCloudSync.getOrders === 'function' ? liveCloudSync.getOrders() : [];
  const orderMap = new Map();
  (base || []).forEach(o => {
    if (o?.id) {
      const key = String(o.orderNumber || o.id).toLowerCase();
      orderMap.set(key, o);
    }
  });
  (cloudOrders || []).forEach(o => {
    if (o?.id) {
      const key = String(o.orderNumber || o.id).toLowerCase();
      const existing = orderMap.get(key);
      if (existing) {
        const baseTime = new Date(existing.updatedAt || existing.date || existing.createdAt || 0).getTime();
        const cloudTime = new Date(o.updatedAt || o.date || o.createdAt || 0).getTime();
        orderMap.set(key, baseTime >= cloudTime ? { ...o, ...existing } : { ...existing, ...o });
      } else {
        orderMap.set(key, o);
      }
    }
  });

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

export const ADMIN_ORDER_STATUSES = [
  'Pending',
  'Processing',
  'Shipped',
  'OutForDelivery',
  'Delivered',
  'CancelPending',
  'Cancelled'
];

export const ADMIN_PAYMENT_STATUSES = [
  'Pending',
  'Paid',
  'Failed',
  'Cancelled',
  'Refunded'
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
    // 1. Sync latest live cloud updates first
    await liveCloudSync.sync().catch(() => {});

    if (!apiClient.isMockEnabled()) {
      try {
        const response = await orderApi.getMyOrders();
        const remoteItems = response?.items || (Array.isArray(response) ? response : []);
        if (Array.isArray(remoteItems) && remoteItems.length > 0) {
          const current = loadOrders();
          const merged = [...current];
          for (const item of remoteItems) {
            const target = String(item.orderNumber || item.id).replace(/^#/, '').toLowerCase().trim();
            const idx = merged.findIndex(o => {
              const idStr = String(o.id || '').replace(/^#/, '').toLowerCase().trim();
              const numStr = String(o.orderNumber || '').replace(/^#/, '').toLowerCase().trim();
              return idStr === target || numStr === target;
            });
            if (idx > -1) {
              const localStatus = merged[idx].orderStatus || merged[idx].status;
              merged[idx] = { ...merged[idx], ...item };
              // Preserve status if admin has updated it locally/in cloud
              if (localStatus && localStatus !== 'Pending' && item.orderStatus === 'Pending') {
                merged[idx].orderStatus = localStatus;
                merged[idx].status = localStatus;
              }
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
      const orderEmail = (o.customerEmail || o.customer?.email || '').toLowerCase().trim();
      const orderUserId = (o.userId || o.customer?.id) ? String(o.userId || o.customer?.id) : null;
      const currentUserIdStr = userId ? String(userId) : null;
      const isPlacedOnDevice = placedIds.includes(o.id) || placedIds.includes(o.orderNumber);

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
   * Merges remote backend orders with customer orders placed in browser/cloud
   */
  async getAdminOrders(filters = {}) {
    // 1. Pull latest orders from live cloud sync
    await liveCloudSync.sync().catch(() => {});
    const cloudOrders = typeof liveCloudSync.getOrders === 'function' ? liveCloudSync.getOrders() : [];
    const currentOrders = loadOrders();

    let remoteItems = [];
    let remotePage = Number(filters.page || filters.Page || 1);
    let remotePageSize = Number(filters.pageSize || filters.PageSize || 20);

    if (!apiClient.isMockEnabled()) {
      try {
        const response = await orderApi.adminGetOrders(filters);
        if (response && Array.isArray(response.items)) {
          remoteItems = response.items;
          remotePage = response.page || remotePage;
          remotePageSize = response.pageSize || remotePageSize;
        }
      } catch (e) {
        console.warn('Real API adminGetOrders fallback:', e.message);
      }
    }

    // Combine local saved orders, live cloud sync orders, and remote backend orders
    const orderMap = new Map();

    // 1. Base / Local orders (created on this device)
    (currentOrders || []).forEach(o => {
      if (o?.id) {
        const key = String(o.orderNumber || o.id);
        orderMap.set(key, o);
      }
    });

    // 2. Live cloud sync orders (placed by normal user accounts on any tab or device)
    (cloudOrders || []).forEach(o => {
      if (o?.id) {
        const key = String(o.orderNumber || o.id);
        const existing = orderMap.get(key);
        orderMap.set(key, { ...(existing || {}), ...o });
      }
    });

    // 3. Remote backend orders
    (remoteItems || []).forEach(o => {
      if (o?.id) {
        const key = String(o.orderNumber || o.id);
        const existing = orderMap.get(key);
        orderMap.set(key, { ...(existing || {}), ...o });
      }
    });

    const allOrders = Array.from(orderMap.values());
    saveOrders(allOrders);

    // Apply filters (orderStatus, paymentStatus, search, date range)
    let filtered = allOrders;

    const statusFilter = filters.orderStatus || filters.OrderStatus || filters.status;
    if (statusFilter && statusFilter !== 'ALL') {
      filtered = filtered.filter(o => {
        const s = String(o.orderStatus || o.status || '').toLowerCase();
        return s === String(statusFilter).toLowerCase();
      });
    }

    const paymentFilter = filters.paymentStatus || filters.PaymentStatus;
    if (paymentFilter && paymentFilter !== 'ALL') {
      filtered = filtered.filter(o => {
        const p = String(o.paymentStatus || o.payments?.[0]?.status || '').toLowerCase();
        return p === String(paymentFilter).toLowerCase();
      });
    }

    const searchStr = (filters.search || filters.Search || '').toLowerCase().trim();
    if (searchStr) {
      filtered = filtered.filter(o => {
        const idStr = String(o.id || '').toLowerCase();
        const numStr = String(o.orderNumber || '').toLowerCase();
        const custName = String(o.customer?.name || o.customerName || '').toLowerCase();
        const custEmail = String(o.customer?.email || o.customerEmail || '').toLowerCase();
        const trk = String(o.trackingCode || o.dhlTrackingNumber || o.shippingSnapshot?.trackingNumber || '').toLowerCase();
        return idStr.includes(searchStr) || numStr.includes(searchStr) || custName.includes(searchStr) || custEmail.includes(searchStr) || trk.includes(searchStr);
      });
    }

    if (filters.from || filters.From) {
      const fromTime = new Date(filters.from || filters.From).getTime();
      filtered = filtered.filter(o => new Date(o.createdAt || o.date || 0).getTime() >= fromTime);
    }
    if (filters.to || filters.To) {
      const toTime = new Date(filters.to || filters.To).getTime();
      filtered = filtered.filter(o => new Date(o.createdAt || o.date || 0).getTime() <= toTime);
    }

    // Sort
    const sortBy = filters.sortBy || filters.SortBy || 'createdAt';
    const sortDir = (filters.sortDirection || filters.SortDirection || 'desc').toLowerCase() === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
      if (sortBy === 'total') {
        const totA = Number(a.totals?.total ?? a.total ?? 0);
        const totB = Number(b.totals?.total ?? b.total ?? 0);
        return (totA - totB) * sortDir;
      }
      const timeA = new Date(a.createdAt || a.date || 0).getTime();
      const timeB = new Date(b.createdAt || b.date || 0).getTime();
      return (timeA - timeB) * sortDir;
    });

    const page = remotePage;
    const pageSize = remotePageSize;
    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const startIdx = (page - 1) * pageSize;
    const paginatedItems = filtered.slice(startIdx, startIdx + pageSize);

    return {
      items: paginatedItems,
      page,
      pageSize,
      totalCount,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages
    };
  },

  async getAllOrders(filters = {}) {
    return this.getAdminOrders(filters);
  },

  /**
   * Admin: Get order details by ID
   */
  async getAdminOrderDetails(id) {
    if (!apiClient.isMockEnabled()) {
      try {
        const remote = await orderApi.adminGetOrderDetails(id);
        if (remote) {
          const orders = loadOrders();
          const idx = orders.findIndex(o => String(o.id) === String(id) || o.orderNumber === id);
          if (idx > -1) {
            orders[idx] = { ...orders[idx], ...remote };
          } else {
            orders.unshift(remote);
          }
          saveOrders(orders);
          return remote;
        }
      } catch (e) {
        console.warn('Real API adminGetOrderDetails fallback:', e.message);
      }
    }

    return this.getOrderByIdSync(id);
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
    const target = String(id).replace(/^#/, '').toLowerCase().trim();
    return orders.find(o => {
      const idStr = String(o.id || '').replace(/^#/, '').toLowerCase().trim();
      const numStr = String(o.orderNumber || '').replace(/^#/, '').toLowerCase().trim();
      const trk = String(o.trackingCode || o.dhlTrackingNumber || o.shippingSnapshot?.trackingNumber || '').toLowerCase().trim();
      return idStr === target || numStr === target || trk === target;
    }) || null;
  },

  async getOrderById(id) {
    const local = this.getOrderByIdSync(id);

    const numId = Number(id);
    const validNumericId = !isNaN(numId) && numId > 0 ? numId : (local?.numericId ? Number(local.numericId) : null);

    if (!apiClient.isMockEnabled() && validNumericId) {
      try {
        const remote = await orderApi.getOrderById(validNumericId);
        if (remote) {
          const orders = loadOrders();
          const target = String(id).replace(/^#/, '').toLowerCase().trim();
          const idx = orders.findIndex(o => {
            const idStr = String(o.id || '').replace(/^#/, '').toLowerCase().trim();
            const numStr = String(o.orderNumber || '').replace(/^#/, '').toLowerCase().trim();
            return idStr === target || numStr === target;
          });

          // If local has a newer status updated by admin, preserve it!
          const localStatus = local?.orderStatus || local?.status;
          const merged = { ...remote, ...local };
          if (localStatus && localStatus !== 'Pending' && remote.orderStatus === 'Pending') {
            merged.orderStatus = localStatus;
            merged.status = localStatus;
          }

          if (idx > -1) {
            orders[idx] = merged;
          } else {
            orders.unshift(merged);
          }
          saveOrders(orders);
          return merged;
        }
      } catch (e) {
        // Graceful silent fallback to local/cloud order
      }
    }

    return local;
  },

  async createOrder(orderPayload) {
    let apiOrder = null;
    let resolvedAddressId = orderPayload.addressId;

    if (!apiClient.isMockEnabled()) {
      try {
        // 1. Resolve or create customer delivery address on backend if needed
        if (!resolvedAddressId) {
          const addresses = await addressApi.getAddresses().catch(() => []);
          if (Array.isArray(addresses) && addresses.length > 0 && addresses[0]?.id) {
            resolvedAddressId = addresses[0].id;
          } else if (orderPayload.shippingAddress) {
            const createdAddr = await addressApi.createAddress({
              fullName: orderPayload.shippingAddress.fullName || orderPayload.customerName || 'Valued Patron',
              phone: orderPayload.customerPhone || orderPayload.phone || '+971500000000',
              countryCode: 'AE',
              region: orderPayload.shippingAddress.region || 'Dubai',
              city: orderPayload.shippingAddress.city || 'Dubai',
              addressLine1: orderPayload.shippingAddress.address || orderPayload.shippingAddress.addressLine1 || 'Sheikh Zayed Road',
              addressLine2: orderPayload.shippingAddress.addressLine2 || null,
              postalCode: orderPayload.shippingAddress.postalCode || '00000'
            }).catch(() => null);
            if (createdAddr?.id) {
              resolvedAddressId = createdAddr.id;
            }
          }
        }

        // 2. Ensure items exist in server-side cart
        if (Array.isArray(orderPayload.items) && orderPayload.items.length > 0) {
          for (const item of orderPayload.items) {
            const pId = item.productId || item.id;
            if (pId && !isNaN(Number(pId))) {
              await cartApi.addItem(Number(pId), item.quantity || 1).catch(() => {});
            }
          }
        }

        // 3. Call official POST /api/Orders
        apiOrder = await orderApi.createOrder({
          addressId: Number(resolvedAddressId) || 1,
          shippingMethodId: Number(orderPayload.shippingMethodId) || 1,
          quoteId: orderPayload.quoteId || undefined,
          paymentMethod: orderPayload.paymentMethod || 'CreditCard',
          couponCode: orderPayload.discountCode || orderPayload.couponCode || undefined
        });
      } catch (e) {
        console.warn('Real API create order fallback:', e.message);
      }
    }

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = apiOrder?.id || `ORD-${randomNum}`;
    const orderNum = apiOrder?.orderNumber || (typeof orderId === 'string' && orderId.startsWith('ORD-') ? orderId : `ORD-${orderId}`);
    const trackingCode = apiOrder?.trackingCode || apiOrder?.shipping?.trackingNumber || `DHL-EXP-${randomNum}04`;

    const customerName = orderPayload.customerName || apiOrder?.customer?.name || 'Valued Patron';
    const customerEmail = orderPayload.customerEmail || apiOrder?.customer?.email || '';
    const customerPhone = orderPayload.customerPhone || apiOrder?.customer?.phone || '';
    const orderTotal = Number(apiOrder?.total ?? orderPayload.total ?? 0);
    const subtotal = Number(apiOrder?.subtotal ?? orderPayload.subtotal ?? orderTotal);
    const shippingCost = Number(apiOrder?.shippingCost ?? orderPayload.shipping ?? 0);
    const discountTotal = Number(apiOrder?.discountTotal ?? orderPayload.discountAmount ?? 0);
    const orderDate = apiOrder?.createdAt || new Date().toISOString();

    const newOrder = {
      ...orderPayload,
      ...(apiOrder || {}),
      id: orderId,
      numericId: typeof orderId === 'number' ? orderId : (!isNaN(Number(orderId)) ? Number(orderId) : null),
      orderNumber: orderNum,
      customer: {
        id: orderPayload.userId || apiOrder?.customer?.id || null,
        name: customerName,
        email: customerEmail,
        phone: customerPhone
      },
      customerEmail,
      customerName,
      customerPhone,
      userId: orderPayload.userId || null,
      items: (apiOrder?.items && apiOrder.items.length > 0) ? apiOrder.items : (orderPayload.items || []),
      totals: {
        subtotal,
        discountTotal,
        shippingCost,
        total: orderTotal,
        currency: 'EUR'
      },
      total: orderTotal,
      subtotal,
      shipping: shippingCost,
      currency: apiOrder?.currency || 'EUR',
      orderStatus: apiOrder?.orderStatus || 'Pending',
      paymentStatus: apiOrder?.paymentStatus || 'Paid',
      status: apiOrder?.orderStatus || 'Pending',
      shippingAddress: orderPayload.shippingAddress || apiOrder?.shippingAddress || {},
      shippingSnapshot: {
        carrier: 'DHL Express',
        shippingMethod: 'Express Worldwide',
        trackingNumber: trackingCode,
        shippingCost
      },
      createdAt: orderDate,
      date: orderDate,
      trackingCode,
      dhlTrackingNumber: orderPayload.dhlTrackingNumber || trackingCode,
      timeline: [
        { status: 'Placed', title: 'Order Placed by Customer', timestamp: orderDate },
        { status: 'Pending', title: 'Awaiting Admin Fulfillment Dispatch', timestamp: orderDate }
      ],
      statusHistory: [
        {
          status: 'Pending',
          toStatus: 'Pending',
          fromStatus: null,
          note: 'Order submitted successfully via customer checkout',
          changedBy: 'Customer',
          createdAt: orderDate
        }
      ],
      compensationFailure: false
    };

    // 1. Save to live cloud sync so all admins and accounts see it immediately!
    await liveCloudSync.addOrder(newOrder);

    // 2. Save to local storage list
    const orders = loadOrders();
    const existingIndex = orders.findIndex(o => String(o.id) === String(newOrder.id) || o.orderNumber === newOrder.orderNumber);
    if (existingIndex > -1) {
      orders[existingIndex] = newOrder;
    } else {
      orders.unshift(newOrder);
    }
    saveOrders(orders);

    // 3. Record this order on this client/device
    recordPlacedOrderId(newOrder.id);

    // 4. Dispatch browser event for real-time reactive UI update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('arabian_sheikh_order_created', { detail: newOrder }));
    }

    return newOrder;
  },

  async updateOrderStatus(orderId, newStatus, note = '') {
    // 1. Update in live cloud sync
    await liveCloudSync.updateOrderStatus(orderId, newStatus);

    // 2. Update remote API
    if (!apiClient.isMockEnabled()) {
      try {
        await orderApi.adminUpdateOrderStatus(orderId, newStatus, note);
      } catch (e) {
        console.warn('Real API update order status fallback:', e.message);
      }
    }

    const orders = loadOrders();
    const target = String(orderId).replace(/^#/, '').toLowerCase().trim();
    const index = orders.findIndex(o => {
      const idStr = String(o.id || '').replace(/^#/, '').toLowerCase().trim();
      const numStr = String(o.orderNumber || '').replace(/^#/, '').toLowerCase().trim();
      return idStr === target || numStr === target;
    });

    let updatedOrder = null;
    if (index > -1) {
      orders[index].status = newStatus;
      orders[index].orderStatus = newStatus;
      orders[index].updatedAt = new Date().toISOString();
      if (!orders[index].timeline) orders[index].timeline = [];
      orders[index].timeline.push({
        status: newStatus,
        title: `Status: ${newStatus}${note ? ` (${note})` : ''}`,
        timestamp: new Date().toISOString()
      });
      if (!orders[index].statusHistory) orders[index].statusHistory = [];
      orders[index].statusHistory.push({
        status: newStatus,
        fromStatus: orders[index].orderStatus || orders[index].status,
        toStatus: newStatus,
        note: note || '',
        changedBy: 'Admin',
        createdAt: new Date().toISOString()
      });
      saveOrders(orders);
      updatedOrder = orders[index];
    } else {
      updatedOrder = { id: orderId, orderNumber: orderId, status: newStatus, orderStatus: newStatus };
    }

    // 3. Dispatch real-time event so customer account, tracking, and detail views update immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('arabian_sheikh_order_updated', {
        detail: {
          orderId,
          status: newStatus,
          orderStatus: newStatus,
          note,
          order: updatedOrder
        }
      }));
      try {
        localStorage.setItem('arabian_sheikh_last_order_update', JSON.stringify({
          orderId,
          status: newStatus,
          timestamp: Date.now()
        }));
      } catch {}
    }

    return updatedOrder;
  },

  async cancelOrder(orderId, reason = '') {
    if (!apiClient.isMockEnabled()) {
      try {
        await orderApi.adminCancelOrder(orderId, reason);
      } catch (e) {
        console.warn('Real API cancel order fallback:', e.message);
      }
    }
    return this.updateOrderStatus(orderId, 'Cancelled', reason ? `Cancellation reason: ${reason}` : 'Cancelled by administrator');
  },

  async getOrderStatusHistory(orderId) {
    if (!apiClient.isMockEnabled()) {
      try {
        const history = await orderApi.adminGetOrderStatusHistory(orderId);
        if (Array.isArray(history) && history.length > 0) return history;
      } catch (e) {
        console.warn('Real API getOrderStatusHistory fallback:', e.message);
      }
    }
    const order = this.getOrderByIdSync(orderId);
    return order?.statusHistory || order?.timeline || [];
  },

  async getOrderTracking(orderId) {
    if (!apiClient.isMockEnabled()) {
      try {
        const tracking = await orderApi.adminGetOrderTracking(orderId);
        if (tracking) return tracking;
      } catch (e) {
        console.warn('Real API getOrderTracking fallback:', e.message);
      }
    }
    const order = this.getOrderByIdSync(orderId);
    return {
      orderId,
      carrier: order?.shippingSnapshot?.carrier || 'DHL Express',
      trackingNumber: order?.trackingCode || order?.dhlTrackingNumber || 'TRK-EXP-001',
      status: order?.orderStatus || order?.status || 'InTransit',
      events: (order?.timeline || []).map(t => ({
        timestamp: t.timestamp,
        status: t.status,
        description: t.title || t.status,
        location: 'Logistics Center'
      }))
    };
  },

  async retryCompensation(orderId) {
    if (!apiClient.isMockEnabled()) {
      try {
        return await orderApi.adminRetryCompensation(orderId);
      } catch (e) {
        console.warn('Real API retryCompensation fallback:', e.message);
        throw e;
      }
    }
    const orders = loadOrders();
    const idx = orders.findIndex(o => String(o.id) === String(orderId) || o.orderNumber === orderId);
    if (idx > -1) {
      orders[idx].compensationFailure = false;
      if (orders[idx].compensation) {
        orders[idx].compensation.status = 'Resolved';
      }
      saveOrders(orders);
      return { success: true, message: 'Compensation workflow retried successfully' };
    }
    return { success: true };
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

