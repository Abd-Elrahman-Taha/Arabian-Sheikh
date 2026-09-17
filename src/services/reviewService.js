import { reviewApi } from '../api/review.api';
import { orderService } from './orderService';
import { authService } from './authService';

/**
 * Review & Rating Service
 * Provides complete orchestration for public reviews, verified purchase checks,
 * customer submissions, and admin moderation lifecycle.
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
      return { items: [], page: 1, pageSize: 10, totalCount: 0, totalPages: 1 };
    }

    try {
      return await reviewApi.getProductReviews(numId, params);
    } catch (err) {
      console.warn(`Failed to fetch reviews for product ${productId}:`, err.message);
      return { items: [], page: 1, pageSize: 10, totalCount: 0, totalPages: 1 };
    }
  },

  /**
   * Submit a new customer review (Pending moderation)
   * @param {number|string} productId 
   * @param {object} reviewData { orderId, rating, comment }
   */
  async createReview(productId, { orderId, rating, comment }) {
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

    try {
      return await reviewApi.createReview(numId, {
        orderId: Number(orderId),
        rating: numericRating,
        comment: comment ? String(comment).trim().slice(0, 2000) : ''
      });
    } catch (err) {
      const code = err.code || err.errorCode || (err.data && err.data.code);
      const msg = err.message || '';

      if (code === 'REVIEW_NOT_ALLOWED' || msg.includes('REVIEW_NOT_ALLOWED')) {
        throw new Error('You may only review products from completed qualifying orders.');
      }
      if (code === 'DUPLICATE_REVIEW' || msg.includes('DUPLICATE_REVIEW')) {
        throw new Error('You have already submitted a review for this product on this order.');
      }
      if (code === 'REVIEW_RATING_INVALID' || msg.includes('REVIEW_RATING_INVALID')) {
        throw new Error('Rating must be between 1 and 5 stars.');
      }
      if (err.status === 401 || err.statusCode === 401) {
        throw new Error('Your session has expired. Please sign in to submit a review.');
      }

      throw new Error(msg || 'Failed to submit review. Please try again.');
    }
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
   * Admin: List Reviews with moderation filters
   * @param {object} params { page, pageSize, status, rating, isReported, productId, language }
   */
  async adminGetReviews(params = {}) {
    return await reviewApi.adminGetReviews(params);
  },

  /**
   * Admin: Approve Review (Pending -> Approved)
   * @param {number|string} id 
   * @param {string} [note] 
   */
  async adminApproveReview(id, note = '') {
    try {
      return await reviewApi.adminApproveReview(id, { note });
    } catch (err) {
      const code = err.code || err.errorCode;
      if (code === 'REVIEW_INVALID_STATE_TRANSITION' || err.message?.includes('TRANSITION')) {
        throw new Error('Only Pending reviews can be approved.');
      }
      throw err;
    }
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
    try {
      return await reviewApi.adminRejectReview(id, { reason });
    } catch (err) {
      const code = err.code || err.errorCode;
      if (code === 'REVIEW_INVALID_STATE_TRANSITION' || err.message?.includes('TRANSITION')) {
        throw new Error('Only Pending reviews can be rejected.');
      }
      throw err;
    }
  },

  /**
   * Admin: Hide Review (Approved -> Hidden)
   * @param {number|string} id 
   */
  async adminHideReview(id) {
    try {
      return await reviewApi.adminHideReview(id);
    } catch (err) {
      const code = err.code || err.errorCode;
      if (code === 'REVIEW_INVALID_STATE_TRANSITION' || err.message?.includes('TRANSITION')) {
        throw new Error('Only Approved reviews can be hidden.');
      }
      throw err;
    }
  }
};

export default reviewService;
