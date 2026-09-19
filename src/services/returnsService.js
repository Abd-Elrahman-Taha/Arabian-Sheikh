import returnsApi from '../api/returns.api';

/**
 * Arabian Sheikh - Returns & Refunds Service
 * Pure JavaScript & JSX - Royal Palace Luxury Standards
 * Zero Mocking - Real Backend Integration
 */

export const RETURN_REASONS = [
  { value: 'DefectiveProduct', label: 'Defective / Damaged Product', requiresPhoto: true },
  { value: 'WrongItem', label: 'Received Wrong Item', requiresPhoto: false },
  { value: 'NotAsDescribed', label: 'Item Not As Described', requiresPhoto: false },
  { value: 'ChangedMind', label: 'Changed Mind', requiresPhoto: false },
  { value: 'Other', label: 'Other Reason', requiresPhoto: false }
];

export const RETURN_STATUSES = {
  PendingReview: {
    label: 'Pending Review',
    color: 'amber',
    badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
  },
  Approved: {
    label: 'Approved',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
  },
  PartiallyApproved: {
    label: 'Partially Approved',
    color: 'blue',
    badgeClass: 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
  },
  Rejected: {
    label: 'Rejected',
    color: 'rose',
    badgeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
  },
  Cancelled: {
    label: 'Cancelled',
    color: 'neutral',
    badgeClass: 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/30'
  }
};

export const ITEM_STATUSES = {
  Pending: {
    label: 'Pending',
    color: 'amber',
    badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
  },
  Approved: {
    label: 'Approved',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
  },
  Rejected: {
    label: 'Rejected',
    color: 'rose',
    badgeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
  }
};

export const REFUND_STATUSES = {
  Pending: {
    label: 'Pending Payment',
    color: 'amber',
    badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
  },
  Paid: {
    label: 'Paid',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
  }
};

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Validates an image file before upload
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateReturnPhoto(file) {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }
  const type = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();
  const validExt = /\.(jpg|jpeg|png|webp)$/i.test(name);
  const validType = ALLOWED_IMAGE_TYPES.includes(type) || validExt;

  if (!validType) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPG, JPEG, PNG, and WEBP images are permitted.'
    };
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size exceeds the 5MB limit (${sizeMb}MB). Please upload a smaller image.`
    };
  }

  return { valid: true };
}

/**
 * Maps backend error codes / messages to user-friendly text
 * @param {Error|object} error
 * @returns {string}
 */
export function getReturnErrorMessage(error) {
  if (!error) return 'An unexpected error occurred.';

  const code = (error.code || error.data?.code || '').toUpperCase();
  const detail = error.data?.detail || error.data?.message || error.message || '';

  // Explicit Backend Error Code Mappings
  switch (code) {
    case 'RETURN_WINDOW_EXPIRED':
      return 'The return window for this order has expired.';
    case 'RETURN_NOT_ELIGIBLE':
      return 'This order is not eligible for returns.';
    case 'RETURN_ITEM_NOT_ELIGIBLE':
      return 'One or more selected items are not eligible for return.';
    case 'RETURN_PHOTO_REQUIRED':
      return 'At least one clear photo is required for defective or damaged products.';
    case 'RETURN_DUPLICATE_ITEM_IN_REQUEST':
      return 'Duplicate items were detected in your return request.';
    case 'RETURN_QUANTITY_EXCEEDS_ELIGIBLE':
      return 'The requested return quantity exceeds the eligible quantity for this order.';
    case 'RETURN_NOT_FOUND':
      return 'The requested return was not found.';
    case 'RETURN_NOT_OWNED':
      return 'You do not have permission to view or manage this return request.';
    case 'RETURN_ALREADY_REVIEWED':
      return 'This return request has already been reviewed by our staff.';
    case 'RETURN_CANNOT_CANCEL':
      return 'This return request cannot be cancelled because it is no longer pending review.';
    case 'RETURN_CANNOT_DELETE_LAST_REQUIRED_PHOTO':
      return 'Cannot delete the only photo for a defective item. Defective items must have at least one photo.';
    case 'PHOTO_STAGING_EXPIRED':
      return 'One or more staged photos have expired. Please upload your photos again.';
    case 'RETURN_INCOMPLETE_DECISIONS':
      return 'Every item in the return request must have a review decision (Approved or Rejected).';
    case 'RETURN_REFUND_AMOUNT_REQUIRED':
      return 'A refund amount is required for all approved items.';
    case 'RETURN_REJECTION_REASON_REQUIRED':
      return 'A rejection reason is required for all rejected items.';
    case 'RETURN_REFUND_AMOUNT_EXCEEDS_ITEM_PRICE':
      return 'The refund amount cannot exceed the original item price.';
    case 'RETURN_ALREADY_PAID':
      return 'This refund has already been marked as paid.';
    case 'RETURN_ITEM_NOT_APPROVED':
      return 'Refund amounts can only be adjusted for approved items.';
    case 'RETURN_ITEM_ALREADY_PAID_CANNOT_CORRECT':
      return 'The refund amount cannot be adjusted after payment has been completed.';
    default:
      break;
  }

  // Textual pattern checks if code was generic HTTP error
  if (/window.*expired/i.test(detail)) {
    return 'The return window for this order has expired.';
  }
  if (/photo.*required/i.test(detail)) {
    return 'At least one clear photo is required for defective or damaged products.';
  }
  if (/cannot.*cancel/i.test(detail)) {
    return 'This return cannot be cancelled because it is already under review or resolved.';
  }
  if (/last.*photo/i.test(detail)) {
    return 'Cannot delete the only photo for a defective item.';
  }

  return detail || 'An error occurred while processing your return. Please try again.';
}

/**
 * Returns human-readable label for a reason value
 * @param {string} reason
 */
export function getReasonLabel(reason) {
  const found = RETURN_REASONS.find(r => r.value === reason);
  return found ? found.label : (reason || 'Other');
}

/**
 * Checks if a reason requires at least one photo
 * @param {string} reason
 */
export function isPhotoRequired(reason) {
  const found = RETURN_REASONS.find(r => r.value === reason);
  return found ? Boolean(found.requiresPhoto) : false;
}

/**
 * Checks if a return can be cancelled by the customer
 * @param {object} returnObj
 */
export function canCancelReturn(returnObj) {
  return Boolean(returnObj && returnObj.status === 'PendingReview');
}

export const returnsService = {
  RETURN_REASONS,
  RETURN_STATUSES,
  ITEM_STATUSES,
  REFUND_STATUSES,
  validateReturnPhoto,
  getReturnErrorMessage,
  getReasonLabel,
  isPhotoRequired,
  canCancelReturn,

  // Storefront methods
  async checkEligibility(orderId) {
    return await returnsApi.getReturnEligibility(orderId);
  },

  async createReturn(orderId, payload) {
    return await returnsApi.createReturn(orderId, payload);
  },

  async getOrderReturns(orderId) {
    return await returnsApi.getOrderReturns(orderId);
  },

  async stagePhoto(file) {
    const validation = validateReturnPhoto(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    return await returnsApi.stagePhoto(file);
  },

  async getReturnDetails(returnId) {
    return await returnsApi.getReturnDetails(returnId);
  },

  async cancelReturn(returnId) {
    return await returnsApi.cancelReturn(returnId);
  },

  async addSupplementaryPhoto(returnId, itemId, photoId) {
    return await returnsApi.addSupplementaryPhoto(returnId, itemId, photoId);
  },

  async deleteSupplementaryPhoto(returnId, itemId, photoId) {
    return await returnsApi.deleteSupplementaryPhoto(returnId, itemId, photoId);
  },

  // Admin methods
  async getAdminReturns(params) {
    return await returnsApi.getAdminReturns(params);
  },

  async getAdminReturnDetails(returnId) {
    return await returnsApi.getAdminReturnDetails(returnId);
  },

  async reviewReturn(returnId, decisions) {
    return await returnsApi.reviewReturn(returnId, decisions);
  },

  async correctRefundAmount(returnId, itemId, data) {
    return await returnsApi.correctRefundAmount(returnId, itemId, data);
  },

  async getAdminRefunds(params) {
    return await returnsApi.getAdminRefunds(params);
  },

  async markRefundPaid(itemId) {
    return await returnsApi.markRefundPaid(itemId);
  }
};

export default returnsService;
