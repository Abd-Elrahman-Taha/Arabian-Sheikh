import { orderApi, toNumericId } from '../api/order.api';
import { shippingApi } from '../api/shipping.api';
import { checkoutApi } from '../api/checkout.api';
import { addressApi } from '../api/address.api';
import { newOrderKey, paymentService } from './paymentService';
import { normalizeShippingOption, isOrderConfirmedPaid, recordConfirmedPaidOrder } from '../api/normalizers';

// ─── NO localStorage for orders. Everything comes from the API. ───────────────

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

/**
 * Returns formatted order code (e.g. #ORD-12345 or #12345)
 */
export function formatOrderCode(order) {
  if (!order) return '';
  const code = typeof order === 'object' ? (order.orderNumber || order.id || '') : String(order);
  const clean = String(code).trim();
  if (!clean) return '';
  return clean.startsWith('#') ? clean : `#${clean}`;
}

// ─── Persistent Memory Cache for Detailed Order Attributes (Address, Items, Phone) ───
const orderDetailsCache = new Map();

export function cacheOrderDetails(order) {
  if (!order || typeof order !== 'object') return;
  const idKey = order.id ? String(order.id) : null;
  const numKey = order.numericId ? String(order.numericId) : null;
  const ordKey = order.orderNumber ? String(order.orderNumber) : null;

  if (idKey) orderDetailsCache.set(idKey, order);
  if (numKey) orderDetailsCache.set(numKey, order);
  if (ordKey) orderDetailsCache.set(ordKey, order);
}

export function getCachedOrderDetails(id) {
  if (!id) return null;
  const key = String(id);
  return orderDetailsCache.get(key) || null;
}

export const orderService = {
  formatOrderCode(order) {
    return formatOrderCode(order);
  },

  cacheOrderDetails(order) {
    cacheOrderDetails(order);
  },

  getCachedOrderDetails(id) {
    return getCachedOrderDetails(id);
  },

  // ─── No-op stubs kept for call-site compatibility ──────────────────────────
  recordPlacedOrderId() {},
  getPlacedOrderIds() { return []; },
  getAllOrdersSync() { return []; },
  getOrderByIdSync(id) {
    if (!id) return null;
    const isPaid = isOrderConfirmedPaid(id);
    if (isPaid) {
      return {
        id,
        numericId: toNumericId(id),
        orderNumber: typeof id === 'string' && id.startsWith('ORD-') ? id : `ORD-${id}`,
        paymentStatus: 'Paid',
        orderStatus: 'Processing',
        status: 'Processing',
        paidAt: new Date().toISOString()
      };
    }
    return null;
  },

  // ─── Customer: Fetch orders from GET /api/Orders ───────────────────────────
  async getCustomerOrders() {
    try {
      const response = await orderApi.getMyOrders({ page: 1, pageSize: 100 });
      const items = response?.items || (Array.isArray(response) ? response : []);
      items.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
      return items;
    } catch (e) {
      console.warn('[orderService] getCustomerOrders failed:', e.message);
      return [];
    }
  },

  // ─── Admin: Fetch orders from GET /api/admin/orders ───────────────────────
  async getAdminOrders(filters = {}) {
    try {
      const response = await orderApi.adminGetOrders(filters);
      const rawItems = response && Array.isArray(response.items)
        ? response.items
        : (Array.isArray(response) ? response : []);

      // Merge each item with cached order details so shippingAddress, phone, items never disappear
      const enrichedItems = rawItems.map(item => {
        const idKey = item.id ? String(item.id) : null;
        const numKey = item.numericId ? String(item.numericId) : null;
        const ordKey = item.orderNumber ? String(item.orderNumber) : null;

        const cached = (idKey ? orderDetailsCache.get(idKey) : null)
          || (ordKey ? orderDetailsCache.get(ordKey) : null)
          || (numKey ? orderDetailsCache.get(numKey) : null);

        if (cached) {
          const merged = {
            ...cached,
            ...item,
            shippingAddress: item.shippingAddress || cached.shippingAddress,
            shippingAddressSnapshot: item.shippingAddressSnapshot || cached.shippingAddressSnapshot,
            shippingSnapshot: item.shippingSnapshot || cached.shippingSnapshot,
            customerPhone: item.customerPhone || cached.customerPhone || item.customer?.phone || cached.customer?.phone,
            items: (Array.isArray(item.items) && item.items.length > 0) ? item.items : (cached.items || []),
            payments: (Array.isArray(item.payments) && item.payments.length > 0) ? item.payments : (cached.payments || []),
            paymentMethod: item.paymentMethod || cached.paymentMethod,
            isCod: item.isCod ?? cached.isCod,
          };
          cacheOrderDetails(merged);
          return merged;
        }

        // If item already has shippingAddress or items, seed the cache
        if (item.shippingAddress || (Array.isArray(item.items) && item.items.length > 0)) {
          cacheOrderDetails(item);
        }

        return item;
      });

      return {
        items: enrichedItems,
        page: Number(response?.page || 1),
        pageSize: Number(response?.pageSize || enrichedItems.length || 20),
        totalCount: Number(response?.totalCount !== undefined ? response.totalCount : enrichedItems.length),
        totalPages: Number(response?.totalPages || 1),
        hasPreviousPage: Boolean(response?.hasPreviousPage),
        hasNextPage: Boolean(response?.hasNextPage)
      };
    } catch (e) {
      console.warn('[orderService] getAdminOrders failed:', e.message);
      throw e;
    }
  },

  async getAllOrders(filters = {}) {
    return this.getAdminOrders(filters);
  },

  // ─── Admin: Get order details from GET /api/admin/orders/{id} ─────────────
  async getAdminOrderDetails(id) {
    const numericId = toNumericId(id);
    if (!numericId) return null;
    try {
      const details = await orderApi.adminGetOrderDetails(numericId);
      if (details) {
        cacheOrderDetails(details);
      }
      return details;
    } catch (e) {
      console.warn('[orderService] getAdminOrderDetails failed:', e.message);
      return getCachedOrderDetails(id) || getCachedOrderDetails(numericId);
    }
  },

  // ─── Customer: Get single order from GET /api/Orders/{id} ─────────────────
  async getOrderById(id) {
    const numericId = toNumericId(id);
    if (!numericId) return null;
    try {
      const order = await orderApi.getOrderById(numericId);
      if (order && isOrderConfirmedPaid(id) && (order.paymentStatus === 'Pending' || !order.paymentStatus)) {
        order.paymentStatus = 'Paid';
        if (order.orderStatus === 'Pending') order.orderStatus = 'Processing';
        if (order.status === 'Pending') order.status = 'Processing';
        paymentService.syncOrderPaymentWithBackend(numericId).catch(() => {});
      }
      return order;
    } catch (e) {
      console.warn('[orderService] getOrderById failed:', e.message);
      if (isOrderConfirmedPaid(id)) {
        return {
          id,
          numericId,
          orderNumber: `ORD-${numericId}`,
          paymentStatus: 'Paid',
          orderStatus: 'Processing',
          status: 'Processing',
          paidAt: new Date().toISOString()
        };
      }
      return null;
    }
  },

  getOrdersByUserSync() { return []; },
  async getOrdersByUser() { return []; },

  // ─── Create order via POST /api/Orders ────────────────────────────────────
  async createOrder(orderPayload) {
    let apiOrder;
    let resolvedAddressId = orderPayload.addressId;

    try {
      // Resolve address if needed
      if (!resolvedAddressId) {
        const addresses = await addressApi.getAddresses().catch(() => []);
        if (Array.isArray(addresses) && addresses.length > 0 && addresses[0]?.id) {
          resolvedAddressId = addresses[0].id;
        } else {
          const addrObj = orderPayload.shippingAddress || {};
          const createdAddr = await addressApi.createAddress({
            fullName: addrObj.fullName || orderPayload.customerName || 'Valued Patron',
            phone: orderPayload.customerPhone || orderPayload.phone || addrObj.phone || '',
            countryCode: addrObj.countryCode || addrObj.country || 'BG',
            region: addrObj.region || addrObj.state || addrObj.city || '',
            city: addrObj.city || addrObj.region || '',
            addressLine1: addrObj.addressLine1 || addrObj.address || addrObj.street || '',
            addressLine2: addrObj.addressLine2 || null,
            postalCode: addrObj.postalCode || addrObj.zipCode || ''
          });
          if (createdAddr?.id) resolvedAddressId = createdAddr.id;
        }
      }

      const numericAddressId = Number(resolvedAddressId) || null;
      if (!numericAddressId) {
        throw new Error('No valid address found for this customer. Please add a shipping address first.');
      }

      const rawQuoteId = orderPayload.quoteId;
      if (!rawQuoteId || typeof rawQuoteId !== 'string' || !rawQuoteId.trim()) {
        throw new Error('Unable to create the order because the shipping quote is missing. Please recalculate shipping and try again.');
      }

      const rawMethodId = orderPayload.shippingMethodId;
      const shippingMethodId = rawMethodId !== undefined && rawMethodId !== null && !isNaN(Number(rawMethodId))
        ? Number(rawMethodId)
        : null;
      if (!shippingMethodId) {
        throw new Error('A shipping method must be selected.');
      }

      const orderKey = orderPayload.idempotencyKey || newOrderKey();

      try {
        apiOrder = await orderApi.createOrder({
          addressId: numericAddressId,
          shippingMethodId,
          quoteId: rawQuoteId.trim(),
          paymentMethod: orderPayload.paymentMethod || 'cod',
          couponCode: orderPayload.discountCode || orderPayload.couponCode || null
        }, orderKey);
      } catch (firstErr) {
        const errMsg = firstErr?.message || '';
        const isQuoteOrMethodError =
          firstErr?.code === 'SHIPPING_QUOTE_MISMATCH' ||
          firstErr?.code === 'QUOTE_MISMATCH' ||
          firstErr?.code === 'INVALID_SHIPPING_METHOD' ||
          errMsg.includes('Quote no longer matches') ||
          errMsg.includes('SHIPPING_QUOTE_MISMATCH') ||
          errMsg.includes('is not available for the selected address') ||
          firstErr?.status === 422 ||
          firstErr?.status === 400;

        if (isQuoteOrMethodError) {
          const currentCoupon = orderPayload.discountCode || orderPayload.couponCode || undefined;
          const summary = await checkoutApi.getCheckout({
            addressId: numericAddressId,
            couponCode: currentCoupon
          }).catch(() => null);

          const rawOptions = summary?.shippingOptions || [];
          const validOptions = (Array.isArray(rawOptions) ? rawOptions : [])
            .map(normalizeShippingOption)
            .filter(opt => opt && opt.shippingMethodId && Number(opt.shippingMethodId) > 0);

          let matchedOption = null;
          if (validOptions.length > 0) {
            matchedOption = validOptions.find(o => Number(o.shippingMethodId) === Number(shippingMethodId)) || validOptions[0];
          }

          if (!matchedOption) {
            const freshQuotes = await shippingApi.getQuotes({ addressId: numericAddressId }).catch(() => null);
            const freshOptions = (freshQuotes?.options || []).filter(o => o && (o.shippingMethodId || o.id));
            matchedOption = freshOptions.find(o => Number(o.shippingMethodId || o.id) === Number(shippingMethodId)) || freshOptions[0];
          }

          const retryMethodId = matchedOption?.shippingMethodId ? Number(matchedOption.shippingMethodId) : Number(shippingMethodId);
          const freshQuoteId = matchedOption?.quoteId || summary?.selectedShippingMethod?.quoteId || summary?.quoteId;

          if (freshQuoteId && retryMethodId) {
            await checkoutApi.setCheckoutShipping({
              shippingMethodId: retryMethodId,
              quoteId: String(freshQuoteId).trim()
            }, {
              addressId: numericAddressId,
              couponCode: currentCoupon
            }).catch(() => {});

            apiOrder = await orderApi.createOrder({
              addressId: numericAddressId,
              shippingMethodId: retryMethodId,
              quoteId: String(freshQuoteId).trim(),
              paymentMethod: orderPayload.paymentMethod || 'cod',
              couponCode: currentCoupon || null
            }, newOrderKey());
          } else {
            throw firstErr;
          }
        } else {
          throw firstErr;
        }
      }
    } catch (e) {
      console.error('[orderService] createOrder error:', e);
      throw e;
    }

    if (!apiOrder) throw new Error('Order creation failed: no response from server.');

    const newOrder = {
      ...apiOrder,
      id: apiOrder.id,
      orderNumber: apiOrder.orderNumber,
      orderStatus: apiOrder.orderStatus || 'Pending',
      paymentStatus: apiOrder.paymentStatus || 'Pending',
      status: apiOrder.orderStatus || 'Pending',
      createdAt: apiOrder.createdAt || new Date().toISOString(),
      date: apiOrder.createdAt || new Date().toISOString(),
    };

    // Dispatch browser event for immediate UI update (same tab only)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('arabian_sheikh_order_created', { detail: newOrder }));
    }

    return newOrder;
  },

  // ─── Update order status via PATCH /api/admin/orders/{id}/status ──────────
  async updateOrderStatus(orderId, newStatus, note = '') {
    const numericId = toNumericId(orderId);
    let result = null;
    if (numericId) {
      try {
        result = await orderApi.adminUpdateOrderStatus(numericId, newStatus, note);
      } catch (e) {
        console.warn('[orderService] updateOrderStatus API error:', e.message);
        throw e;
      }
    }

    // Dispatch event for same-tab UI refresh
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('arabian_sheikh_order_updated', {
        detail: { orderId, status: newStatus, orderStatus: newStatus, note }
      }));
    }

    return result || { orderId, orderStatus: newStatus, status: newStatus };
  },

  // ─── Mark order as paid — records in persistent registry & syncs with backend ──
  async markOrderPaid(orderId, paymentDetails = null) {
    if (!orderId) return null;

    recordConfirmedPaidOrder(orderId, paymentDetails || {});

    // Prompt backend to verify with Stripe and update SQL DB in background
    paymentService.syncOrderPaymentWithBackend(orderId, paymentDetails).catch(() => {});

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('arabian_sheikh_order_updated', {
        detail: {
          orderId,
          paymentStatus: 'Paid',
          orderStatus: 'Processing',
          paymentDetails
        }
      }));
    }

    return { id: orderId, paymentStatus: 'Paid', orderStatus: 'Processing' };
  },

  // ─── Get locally confirmed payment status ──
  getLocalPaidStatus(orderId) {
    return isOrderConfirmedPaid(orderId) ? 'Paid' : null;
  },

  // ─── Cancel order ─────────────────────────────────────────────────────────
  async cancelOrder(orderId, reason = '') {
    const numericId = toNumericId(orderId);
    if (!numericId) throw new Error('Valid order ID required to cancel.');
    const result = await orderApi.adminCancelOrder(numericId, reason);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('arabian_sheikh_order_updated', {
        detail: { orderId, orderStatus: result?.orderStatus || 'Cancelled' }
      }));
    }
    return result;
  },

  async customerCancelOrder(orderId, reason = '') {
    const idStr = typeof orderId === 'object' && orderId !== null
      ? (orderId.orderNumber || orderId.id)
      : orderId;
    const numericId = toNumericId(idStr);
    if (!numericId) throw new Error('Valid order ID required to cancel.');

    const result = await orderApi.cancelOrder(numericId, reason);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('arabian_sheikh_order_updated', {
        detail: { orderId: idStr, orderStatus: result?.orderStatus || 'Cancelled' }
      }));
    }
    return result;
  },

  // ─── Delivery status GET /api/Orders/{id}/delivery-status ─────────────────
  async getDeliveryStatus(orderId) {
    const numericId = toNumericId(orderId);
    if (!numericId) return null;
    try {
      return await orderApi.getDeliveryStatus(numericId);
    } catch (e) {
      console.warn('[orderService] getDeliveryStatus failed:', e.message);
      return null;
    }
  },

  // ─── Customer tracking GET /api/Orders/{id}/tracking ─────────────────────
  async getCustomerTracking(orderId) {
    const numericId = toNumericId(orderId);
    if (!numericId) return null;
    try {
      return await orderApi.trackOrder(numericId);
    } catch (e) {
      console.warn('[orderService] getCustomerTracking failed:', e.message);
      return null;
    }
  },

  // ─── Admin tracking GET /api/admin/orders/{id}/tracking ──────────────────
  async getAdminOrderTracking(orderId) {
    return this.getOrderTracking(orderId);
  },

  async getOrderTracking(orderId) {
    const numericId = toNumericId(orderId);
    if (!numericId) return null;
    try {
      return await orderApi.adminGetOrderTracking(numericId);
    } catch {
      // Fallback: try customer tracking endpoint
      try {
        return await orderApi.trackOrder(numericId);
      } catch {
        return null;
      }
    }
  },

  // ─── Order status history GET /api/admin/orders/{id}/status-history ───────
  async getOrderStatusHistory(orderId) {
    const numericId = toNumericId(orderId);
    if (!numericId) return [];
    try {
      return await orderApi.adminGetOrderStatusHistory(numericId);
    } catch (e) {
      console.warn('[orderService] getOrderStatusHistory failed:', e.message);
      return [];
    }
  },

  // ─── Retry compensation POST /api/admin/orders/{id}/compensation/retry ─────
  async retryCompensation(orderId) {
    const numericId = toNumericId(orderId);
    if (!numericId) throw new Error('Valid order ID required for compensation retry.');
    return await orderApi.adminRetryCompensation(numericId);
  },

  // ─── Track order (alias) ──────────────────────────────────────────────────
  async trackOrder(orderId) {
    return this.getCustomerTracking(orderId);
  }
};

export default orderService;
