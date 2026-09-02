import { adminManagementApi } from '../api/adminManagement.api';
import { liveCloudSync } from './liveCloudSync';

/**
 * Arabian Sheikh - SuperAdmin Administrator Management Service
 * 
 * Business logic layer for Administrator lifecycle operations:
 * - Direct real backend API communication with SuperAdmin JWT
 * - Client-side validation for admin profiles, passwords, and customer promotion
 * - Contextual error parsing (403 SuperAdmin protect, 409 conflicts, 400 validation)
 */
export const adminManagementService = {
  // ==========================================
  // 1. VALIDATION UTILITIES
  // ==========================================

  /**
   * Password policy validator
   * - Min 8 characters
   * - At least 1 uppercase (A-Z)
   * - At least 1 lowercase (a-z)
   * - At least 1 digit (0-9)
   * - At least 1 allowed special character (! ? * .)
   */
  validatePassword(password) {
    if (!password || typeof password !== 'string') {
      return { isValid: false, message: 'Password is required.' };
    }
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long.' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter (A-Z).' };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter (a-z).' };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one digit (0-9).' };
    }
    if (!/[!?*.]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one allowed special character (!, ?, *, .).' };
    }
    return { isValid: true, message: '' };
  },

  /**
   * Validate Email Format
   */
  validateEmail(email) {
    if (!email || !email.trim()) {
      return { isValid: false, message: 'Email address is required.' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { isValid: false, message: 'Please enter a valid email address.' };
    }
    if (email.trim().length > 256) {
      return { isValid: false, message: 'Email address cannot exceed 256 characters.' };
    }
    return { isValid: true, message: '' };
  },

  /**
   * Validate Full Name
   */
  validateFullName(fullName) {
    if (!fullName || !fullName.trim()) {
      return { isValid: false, message: 'Full name is required.' };
    }
    if (fullName.trim().length > 150) {
      return { isValid: false, message: 'Full name cannot exceed 150 characters.' };
    }
    return { isValid: true, message: '' };
  },

  /**
   * Validate Create Administrator Payload
   */
  validateCreateAdmin(data) {
    const errors = {};

    const nameCheck = this.validateFullName(data.fullName);
    if (!nameCheck.isValid) errors.fullName = nameCheck.message;

    const emailCheck = this.validateEmail(data.email);
    if (!emailCheck.isValid) errors.email = emailCheck.message;

    const passCheck = this.validatePassword(data.password);
    if (!passCheck.isValid) errors.password = passCheck.message;

    if (Object.keys(errors).length > 0) {
      const first = Object.values(errors)[0];
      const err = new Error(first);
      err.errors = errors;
      throw err;
    }
    return true;
  },

  /**
   * Validate Update Administrator Payload
   */
  validateUpdateAdmin(data) {
    const errors = {};

    const nameCheck = this.validateFullName(data.fullName);
    if (!nameCheck.isValid) errors.fullName = nameCheck.message;

    const emailCheck = this.validateEmail(data.email);
    if (!emailCheck.isValid) errors.email = emailCheck.message;

    if (Object.keys(errors).length > 0) {
      const first = Object.values(errors)[0];
      const err = new Error(first);
      err.errors = errors;
      throw err;
    }
    return true;
  },

  /**
   * Validate Password Reset Payload
   */
  validateResetPassword(newPassword, confirmPassword) {
    if (!newPassword) {
      throw new Error('New password is required.');
    }
    if (newPassword !== confirmPassword) {
      throw new Error('Passwords do not match.');
    }
    const passCheck = this.validatePassword(newPassword);
    if (!passCheck.isValid) {
      throw new Error(passCheck.message);
    }
    return true;
  },

  // ==========================================
  // 2. ADMINISTRATOR CRUD & LIFECYCLE
  // ==========================================

  /**
   * Get paginated administrators list
   */
  async getAdmins(params = {}) {
    try {
      return await adminManagementApi.getAdmins(params);
    } catch (err) {
      console.warn('[adminManagementService] Error fetching administrators:', err.message);
      this.handleApiError(err);
    }
  },

  /**
   * Get single administrator details by ID
   */
  async getAdminById(id) {
    try {
      return await adminManagementApi.getAdminById(id);
    } catch (err) {
      console.warn(`[adminManagementService] Error fetching administrator #${id}:`, err.message);
      this.handleApiError(err);
    }
  },

  /**
   * Create new direct administrator
   */
  async createAdmin(payload) {
    this.validateCreateAdmin(payload);
    try {
      return await adminManagementApi.createAdmin(payload);
    } catch (err) {
      this.handleApiError(err);
    }
  },

  /**
   * Update administrator profile
   */
  async updateAdmin(id, payload, isSuperAdmin = false) {
    if (isSuperAdmin) {
      throw new Error('The SuperAdmin account cannot be modified.');
    }
    this.validateUpdateAdmin(payload);
    try {
      return await adminManagementApi.updateAdmin(id, payload);
    } catch (err) {
      this.handleApiError(err);
    }
  },

  /**
   * Delete administrator
   */
  async deleteAdmin(id, isSuperAdmin = false) {
    if (isSuperAdmin) {
      throw new Error('The SuperAdmin account cannot be deleted.');
    }
    try {
      return await adminManagementApi.deleteAdmin(id);
    } catch (err) {
      this.handleApiError(err);
    }
  },

  /**
   * Toggle administrator active/inactive status
   */
  async toggleStatus(id, isActive, isSuperAdmin = false) {
    if (isSuperAdmin) {
      throw new Error('The SuperAdmin account cannot be deactivated.');
    }
    try {
      const result = await adminManagementApi.toggleStatus(id, isActive);
      if (isActive) {
        liveCloudSync.unblockUser(id, '').catch(() => {});
      }
      return result;
    } catch (err) {
      this.handleApiError(err);
    }
  },

  /**
   * Reset administrator password
   */
  async resetPassword(id, newPassword, confirmPassword, isSuperAdmin = false) {
    if (isSuperAdmin) {
      throw new Error('The SuperAdmin password cannot be reset through this interface.');
    }
    this.validateResetPassword(newPassword, confirmPassword);
    try {
      return await adminManagementApi.resetPassword(id, newPassword);
    } catch (err) {
      this.handleApiError(err);
    }
  },

  /**
   * Promote customer to administrator
   */
  async promoteUser(userId, payload = {}) {
    if (payload.initialPassword && payload.initialPassword.trim()) {
      const passCheck = this.validatePassword(payload.initialPassword);
      if (!passCheck.isValid) {
        throw new Error(passCheck.message);
      }
    }
    try {
      return await adminManagementApi.promoteUser(userId, payload);
    } catch (err) {
      this.handleApiError(err);
    }
  },

  /**
   * Demote administrator back to customer
   */
  async demoteAdmin(id, isSuperAdmin = false) {
    if (isSuperAdmin) {
      throw new Error('The SuperAdmin account cannot be demoted.');
    }
    try {
      return await adminManagementApi.demoteAdmin(id);
    } catch (err) {
      this.handleApiError(err);
    }
  },

  // ==========================================
  // 3. CONTEXTUAL ERROR HANDLER
  // ==========================================

  handleApiError(err) {
    const status = err.response?.status || err.status;
    const data = err.response?.data || err.data;
    const code = data?.code || '';
    const msg = data?.message || err.message || 'Operation failed.';

    if (status === 403 || code === 'CANNOT_MODIFY_SUPERADMIN') {
      const forbiddenErr = new Error('The SuperAdmin account cannot be modified, demoted, or deleted.');
      forbiddenErr.isSuperAdminProtected = true;
      forbiddenErr.status = 403;
      throw forbiddenErr;
    }

    if (status === 409) {
      if (code === 'EMAIL_ALREADY_EXISTS' || msg.toLowerCase().includes('email')) {
        const conflictErr = new Error('This email address is already in use by another account.');
        conflictErr.field = 'email';
        conflictErr.status = 409;
        throw conflictErr;
      }
      if (code === 'USER_ALREADY_PROMOTED' || msg.toLowerCase().includes('already')) {
        const conflictErr = new Error('This user is already an administrator.');
        conflictErr.status = 409;
        throw conflictErr;
      }
      if (code === 'CUSTOMER_ALREADY_BLOCKED' || msg.toLowerCase().includes('blocked')) {
        const conflictErr = new Error('This customer account is currently blocked. Please unblock them before promoting.');
        conflictErr.status = 409;
        throw conflictErr;
      }
    }

    if (status === 400) {
      if (code === 'PASSWORD_REQUIRED' || msg.toLowerCase().includes('password')) {
        const passReqErr = new Error('This customer registered via social login. Please provide an initial password for their administrator account.');
        passReqErr.field = 'initialPassword';
        passReqErr.status = 400;
        throw passReqErr;
      }
      if (data?.errors && typeof data.errors === 'object') {
        const firstErrorKey = Object.keys(data.errors)[0];
        const firstErrorVal = Array.isArray(data.errors[firstErrorKey]) ? data.errors[firstErrorKey][0] : data.errors[firstErrorKey];
        const valErr = new Error(firstErrorVal || msg);
        valErr.errors = data.errors;
        valErr.status = 400;
        throw valErr;
      }
    }

    if (status === 404 || code === 'NOT_FOUND') {
      const notFoundErr = new Error('Administrator or customer account was not found.');
      notFoundErr.status = 404;
      throw notFoundErr;
    }

    if (status === 401 || code === 'UNAUTHORIZED') {
      const authErr = new Error('Your session has expired. Please sign in again.');
      authErr.status = 401;
      throw authErr;
    }

    throw new Error(msg);
  }
};

export default adminManagementService;
