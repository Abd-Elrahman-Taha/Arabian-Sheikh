import { reviewApi } from '../api/review.api';
import { orderService } from './orderService';
import { authService } from './authService';
import { liveCloudSync } from './liveCloudSync';

const LOCAL_REVIEWS_KEY = 'arabian_sheikh_customer_reviews';

function loadLocalReviews() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalReviews(reviews) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(reviews));
  } catch {}
}

function saveToLocalReviews(newReview) {
  const existing = loadLocalReviews();
  const filtered = existing.filter(r => String(r.id) !== String(newReview.id));
  const updated = [newReview, ...filtered];
  saveLocalReviews(updated);
}

function updateLocalReview(id, fields) {
  const existing = loadLocalReviews();
  const updated = existing.map(r => {
    if (String(r.id) === String(id)) {
      return { ...r, ...fields, updatedAt: new Date().toISOString() };
    }
    return r;
  });
  saveLocalReviews(updated);
}

/**
 * Review & Rating Service
 * Provides complete orchestration for public reviews, verified purchase checks,
 * customer submissions, and admin moderation lifecycle with seamless live cloud sync fallback.
 */
export const reviewService = {
  /**
   * Fetch approved reviews for a specific product
   * @param {number|string} productId 
   * @param {object} params { page, pageSize, rating }
   */
  async getProductReviews(productId, params = {}) {
    const numId = Number(productId);
    if (isNaN(numId) || numId <= 0) {
      return { items: [], page: 1, pageSize: 10, totalCount: 0, totalPages: 1, hasPreviousPage: false, hasNextPage: false };
    }

    let remoteItems = [];
    let page = Number(params.page || 1);
    let pageSize = Number(params.pageSize || 10);
    let totalCount = 0;
    let totalPages = 1;

    try {
      const res = await reviewApi.getProductReviews(numId, params);
      remoteItems = res.items || [];
      totalCount = res.totalCount || remoteItems.length;
      totalPages = res.totalPages || 1;
      page = res.page || page;
      pageSize = res.pageSize || pageSize;
    } catch (err) {
      console.warn(`Failed to fetch reviews for product ${productId}:`, err.message);
    }

    // Merge approved local and cloud reviews
    const cloudReviews = liveCloudSync.getReviews();
    const localReviews = loadLocalReviews();
    const approvedLocal = [...localReviews, ...cloudReviews].filter(r => {
      const matchId = Number(r.productId) === numId;
      const isApproved = String(r.status || '').toLowerCase() === 'approved';
      return matchId && isApproved;
    });

    const reviewMap = new Map();
    remoteItems.forEach(r => {
      if (r?.id) reviewMap.set(String(r.id), r);
    });
    approvedLocal.forEach(r => {
      if (r?.id) {
        const existing = reviewMap.get(String(r.id));
        reviewMap.set(String(r.id), { ...(existing || {}), ...r });
      }
    });

    let combined = Array.from(reviewMap.values());

    // Filter by rating if specified
    if (params.rating !== undefined && params.rating !== null && params.rating !== '' && params.rating !== 'ALL') {
      const targetRating = Number(params.rating);
      if (!isNaN(targetRating)) {
        combined = combined.filter(r => Number(r.rating) === targetRating);
      }
    }

    // Sort descending by date
    combined.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    totalCount = combined.length;
    totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const start = (page - 1) * pageSize;
    const items = combined.slice(start, start + pageSize);

    return {
      items,
      page,
      pageSize,
      totalCount,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages
    };
  },

  /**
   * Submit a new customer review (Pending moderation)
   * @param {number|string} productId 
   * @param {object} reviewData { orderId, rating, comment, productName }
   */
  async createReview(productId, { orderId, rating, comment, productName }) {
    const numId = Number(productId);
    if (isNaN(numId) || numId <= 0) {
      throw new Error('Invalid product identifier.');
    }

    if (!orderId) {
      throw new Error('Please select an eligible order where you purchased this creation.');
    }

    const numericRating = Math.round(Number(rating));
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      throw new Error('Rating must be an integer between 1 and 5 stars.');
    }

    const cleanComment = comment ? String(comment).trim().slice(0, 2000) : '';
    const currentUser = authService.getCurrentUser();

    // Check duplicate in local/cloud reviews first
    const existingReviews = [...loadLocalReviews(), ...liveCloudSync.getReviews()];
    const orderStr = String(orderId).trim().toLowerCase();
    const orderNumericStr = String(orderId).replace(/\D/g, '');

    const isDuplicate = existingReviews.some(r => {
      const sameProduct = Number(r.productId) === numId;
      const rOrderStr = String(r.orderId || '').trim().toLowerCase();
      const rNumericStr = String(r.numericOrderId || r.orderId || '').replace(/\D/g, '');
      const sameOrder = rOrderStr === orderStr || (orderNumericStr && rNumericStr === orderNumericStr);
      return sameProduct && sameOrder;
    });

    if (isDuplicate) {
      throw new Error('You have already submitted a review for this product on this order.');
    }

    // Attempt backend submission if numeric order ID is extractable
    const numericOrderId = typeof orderId === 'number'
      ? orderId
      : Number(String(orderId).replace(/\D/g, ''));

    let backendReview = null;
    if (!isNaN(numericOrderId) && numericOrderId > 0) {
      try {
        backendReview = await reviewApi.createReview(numId, {
          orderId: numericOrderId,
          rating: numericRating,
          comment: cleanComment
        });
      } catch (err) {
        const code = err.code || err.errorCode || (err.data && err.data.code);
        const msg = err.message || '';

        if (code === 'DUPLICATE_REVIEW' || msg.includes('DUPLICATE_REVIEW')) {
          throw new Error('You have already submitted a review for this product on this order.');
        }
        if (code === 'REVIEW_RATING_INVALID' || msg.includes('REVIEW_RATING_INVALID')) {
          throw new Error('Rating must be between 1 and 5 stars.');
        }

        // On 403 Forbidden (e.g. order not delivered yet or local order), 404, or network error:
        // Gracefully queue into royal moderation fallback!
        console.warn('Backend createReview returned error (e.g. order in processing or local order). Queuing in Royal Moderation:', msg);
      }
    }

    if (backendReview) {
      await liveCloudSync.addReview(backendReview);
      saveToLocalReviews(backendReview);
      return backendReview;
    }

    // Royal Moderation Queue (Local & Cloud Sync fallback)
    const authorName = currentUser
      ? (currentUser.name || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Royal Patron')
      : 'Royal Patron';

    const formattedOrderNumber = typeof orderId === 'string' && orderId.startsWith('ORD-')
      ? orderId
      : (orderNumericStr ? `ORD-${orderNumericStr}` : String(orderId));

    // Determine product title
    let resolvedProductName = productName || '';
    if (!resolvedProductName) {
      try {
        const orders = await orderService.getCustomerOrders(currentUser).catch(() => []);
        for (const ord of orders) {
          const items = ord.items || ord.orderItems || [];
          const match = items.find(i => Number(i.productId || i.product?.id || i.id) === numId);
          if (match && (match.productName || match.name || match.title)) {
            resolvedProductName = match.productName || match.name || match.title;
            break;
          }
        }
      } catch {}
    }

    const localReview = {
      id: `REV-${Date.now().toString().slice(-6)}`,
      productId: numId,
      productName: resolvedProductName || `Product #${numId}`,
      userId: currentUser?.id || null,
      orderId: formattedOrderNumber,
      numericOrderId: !isNaN(numericOrderId) ? numericOrderId : null,
      author: authorName,
      userName: authorName,
      rating: numericRating,
      comment: cleanComment,
      status: 'Pending',
      isReported: false,
      createdAt: new Date().toISOString()
    };

    saveToLocalReviews(localReview);
    await liveCloudSync.addReview(localReview);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('arabian_sheikh_review_created', { detail: localReview }));
    }

    return localReview;
  },

  /**
   * Find orders that contain this product for the currently logged in user
   * @param {number|string} productId 
   */
  async getEligibleOrdersForProduct(productId) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return [];

    try {
      const orders = await orderService.getCustomerOrders(currentUser);
      if (!Array.isArray(orders) || orders.length === 0) return [];

      const targetId = Number(productId);

      // Filter orders where at least one line item matches productId
      const eligible = [];
      for (const ord of orders) {
        const items = ord.items || ord.orderItems || [];
        const hasItem = items.some(item => {
          const itemProdId = Number(item.productId || item.product?.id || item.id);
          return itemProdId === targetId;
        });

        if (hasItem) {
          // Check if order is eligible (not cancelled)
          const status = (ord.orderStatus || ord.status || '').toUpperCase();
          if (status !== 'CANCELLED') {
            eligible.push({
              id: ord.id,
              numericId: Number(ord.numericId || (typeof ord.id === 'number' ? ord.id : String(ord.id).replace(/\D/g, ''))) || ord.id,
              orderNumber: ord.orderNumber || (typeof ord.id === 'string' && ord.id.startsWith('ORD-') ? ord.id : `ORD-${ord.id}`),
              date: ord.createdAt || ord.date || new Date().toISOString(),
              status: ord.orderStatus || ord.status || 'Delivered'
            });
          }
        }
      }

      return eligible;
    } catch (err) {
      console.warn('Could not inspect eligible orders:', err.message);
      return [];
    }
  },

  /**
   * Admin: List Reviews with moderation filters (combining API + Cloud/Local sync)
   * @param {object} params { page, pageSize, status, rating, isReported, productId, language }
   */
  async adminGetReviews(params = {}) {
    let remoteRes = { items: [], page: 1, pageSize: 20, totalCount: 0, totalPages: 1, hasPreviousPage: false, hasNextPage: false };
    try {
      remoteRes = await reviewApi.adminGetReviews(params);
    } catch (err) {
      console.warn('Failed to fetch admin reviews from backend API, using cloud/local:', err.message);
    }

    const cloudReviews = liveCloudSync.getReviews();
    const localReviews = loadLocalReviews();

    const reviewMap = new Map();
    (remoteRes.items || []).forEach(r => {
      if (r?.id) reviewMap.set(String(r.id), r);
    });

    [...localReviews, ...cloudReviews].forEach(r => {
      if (r?.id) {
        const existing = reviewMap.get(String(r.id));
        reviewMap.set(String(r.id), { ...(existing || {}), ...r });
      }
    });

    let allItems = Array.from(reviewMap.values());

    // Filter by status
    if (params.status && params.status !== 'ALL') {
      const s = String(params.status).toLowerCase();
      allItems = allItems.filter(r => String(r.status || '').toLowerCase() === s);
    }

    // Filter by rating
    if (params.rating && params.rating !== 'ALL') {
      const rFilter = Number(params.rating);
      if (!isNaN(rFilter)) {
        allItems = allItems.filter(r => Number(r.rating) === rFilter);
      }
    }

    // Filter by isReported
    if (params.isReported) {
      allItems = allItems.filter(r => Boolean(r.isReported));
    }

    // Filter by productId
    if (params.productId) {
      const pId = Number(params.productId);
      if (!isNaN(pId)) {
        allItems = allItems.filter(r => Number(r.productId) === pId);
      }
    }

    // Sort newest first
    allItems.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    const page = Number(params.page || 1);
    const pageSize = Number(params.pageSize || 20);
    const totalCount = allItems.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const paginatedItems = allItems.slice((page - 1) * pageSize, page * pageSize);

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

  /**
   * Admin: Approve Review (Pending -> Approved)
   * @param {number|string} id 
   * @param {string} [note] 
   */
  async adminApproveReview(id, note = '') {
    const numId = Number(id);
    if (!isNaN(numId) && numId > 0 && !String(id).startsWith('REV-') && !String(id).startsWith('rev-')) {
      try {
        await reviewApi.adminApproveReview(numId, { note });
      } catch (err) {
        console.warn('Backend adminApproveReview error, adopting local update:', err.message);
      }
    }

    const updated = { status: 'Approved', adminNote: note };
    await liveCloudSync.updateReview(id, updated);
    updateLocalReview(id, updated);
    return { id, ...updated };
  },

  /**
   * Admin: Reject Review (Pending -> Rejected)
   * @param {number|string} id 
   * @param {string} reason 
   */
  async adminRejectReview(id, reason) {
    if (!reason || !String(reason).trim()) {
      throw new Error('A rejection reason is required.');
    }
    const numId = Number(id);
    if (!isNaN(numId) && numId > 0 && !String(id).startsWith('REV-') && !String(id).startsWith('rev-')) {
      try {
        await reviewApi.adminRejectReview(numId, { reason });
      } catch (err) {
        console.warn('Backend adminRejectReview error, adopting local update:', err.message);
      }
    }

    const updated = { status: 'Rejected', rejectionReason: reason };
    await liveCloudSync.updateReview(id, updated);
    updateLocalReview(id, updated);
    return { id, ...updated };
  },

  /**
   * Admin: Hide Review (Approved -> Hidden)
   * @param {number|string} id 
   */
  async adminHideReview(id) {
    const numId = Number(id);
    if (!isNaN(numId) && numId > 0 && !String(id).startsWith('REV-') && !String(id).startsWith('rev-')) {
      try {
        await reviewApi.adminHideReview(numId);
      } catch (err) {
        console.warn('Backend adminHideReview error, adopting local update:', err.message);
      }
    }

    const updated = { status: 'Hidden' };
    await liveCloudSync.updateReview(id, updated);
    updateLocalReview(id, updated);
    return { id, ...updated };
  }
};

export default reviewService;
