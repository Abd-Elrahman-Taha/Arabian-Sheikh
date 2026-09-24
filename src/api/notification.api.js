/**
 * Arabian Sheikh - Notification & Marketing API Service
 * 
 * Compliant with:
 * - PerfumeStore Dual-Layer Notification System (SignalR + REST)
 * - Customer & Admin Notification Management
 * - VIP Segmentation & Coupon Campaign Broadcasts
 */

import apiClient, { resolveBaseUrl } from './client';
import { ENDPOINTS } from './endpoints';
import { normalizeObjectKeys } from './normalizers';

export const notificationApi = {
  // ==========================================
  // 1. CUSTOMER NOTIFICATIONS
  // ==========================================

  /**
   * Fetch paginated notification history for authenticated customer
   * GET /api/Notifications?unreadOnly=false&page=1&pageSize=20
   */
  async getNotifications({ unreadOnly = false, page = 1, pageSize = 20 } = {}) {
    const response = await apiClient.get(ENDPOINTS.NOTIFICATIONS.LIST, {
      params: { unreadOnly, page, pageSize }
    });
    return response?.data || response?.items || response || [];
  },

  /**
   * Get current unread notification count
   * GET /api/Notifications/unread-count
   */
  async getUnreadCount() {
    const response = await apiClient.get(ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    const count = response?.count !== undefined ? response.count : (typeof response === 'number' ? response : 0);
    return { count };
  },

  /**
   * Mark a single notification as read
   * PATCH /api/Notifications/{id}/read
   */
  async markAsRead(id) {
    return await apiClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  },

  /**
   * Mark all notifications as read for current user
   * PATCH /api/Notifications/read-all
   */
  async markAllAsRead() {
    return await apiClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },

  /**
   * Retrieve notification preferences
   * GET /api/Notifications/preferences
   */
  async getPreferences() {
    try {
      const serverData = await apiClient.get(ENDPOINTS.NOTIFICATIONS.PREFERENCES);
      return {
        inAppEnabled: serverData?.inAppEnabled ?? true,
        emailMarketingOptIn: serverData?.emailMarketingOptIn ?? true,
        whatsAppOptIn: serverData?.whatsAppOptIn ?? false,
        promotionsOptIn: serverData?.promotionsOptIn ?? true,
        couponsOptIn: serverData?.couponsOptIn ?? true
      };
    } catch (e) {
      console.warn('[notificationApi] getPreferences failed from backend:', e?.message);
      return {
        inAppEnabled: true,
        emailMarketingOptIn: true,
        whatsAppOptIn: false,
        promotionsOptIn: true,
        couponsOptIn: true
      };
    }
  },

  /**
   * Save updated notification preferences (Pure backend persistence)
   * PUT /api/Notifications/preferences
   */
  async updatePreferences(preferences) {
    const payload = {
      inAppEnabled: Boolean(preferences.inAppEnabled),
      emailMarketingOptIn: Boolean(preferences.emailMarketingOptIn),
      whatsAppOptIn: Boolean(preferences.whatsAppOptIn),
      promotionsOptIn: Boolean(preferences.promotionsOptIn),
      couponsOptIn: Boolean(preferences.couponsOptIn)
    };

    const response = await apiClient.put(ENDPOINTS.NOTIFICATIONS.PREFERENCES, payload);
    return response || payload;
  },

  /**
   * One-click unsubscribe from marketing emails via token
   * GET /api/Notifications/unsubscribe?token=...
   */
  async unsubscribeWithToken(token) {
    return await apiClient.get(ENDPOINTS.NOTIFICATIONS.UNSUBSCRIBE, {
      params: { token },
      requiresAuth: false
    });
  },

  /**
   * Account programmatic unsubscribe from marketing emails
   * POST /api/Notifications/unsubscribe
   */
  async unsubscribeAccount() {
    return await apiClient.post(ENDPOINTS.NOTIFICATIONS.UNSUBSCRIBE);
  },

  // ==========================================
  // 2. ADMIN NOTIFICATIONS
  // ==========================================

  /**
   * Get paginated admin notifications
   * GET /api/admin/notifications
   */
  async getAdminNotifications({ unreadOnly = false, page = 1, pageSize = 20, channel } = {}) {
    const params = { unreadOnly, page, pageSize };
    if (channel) params.channel = channel;
    const response = await apiClient.get(ENDPOINTS.ADMIN.NOTIFICATIONS.LIST, { params });
    return response?.data || response?.items || response || [];
  },

  /**
   * Get admin unread count
   * GET /api/admin/notifications/unread-count
   */
  async getAdminUnreadCount() {
    const response = await apiClient.get(ENDPOINTS.ADMIN.NOTIFICATIONS.UNREAD_COUNT);
    const count = response?.count !== undefined ? response.count : (typeof response === 'number' ? response : 0);
    return { count };
  },

  /**
   * Mark admin notification as read
   * PATCH /api/admin/notifications/{id}/read
   */
  async markAdminAsRead(id) {
    return await apiClient.patch(ENDPOINTS.ADMIN.NOTIFICATIONS.MARK_READ(id));
  },

  /**
   * Mark all admin notifications as read
   * PATCH /api/admin/notifications/read-all
   */
  async markAdminAllAsRead() {
    return await apiClient.patch(ENDPOINTS.ADMIN.NOTIFICATIONS.MARK_ALL_READ);
  },

  // ==========================================
  // 3. ADMIN SENT NOTIFICATIONS (BROADCASTS)
  // ==========================================

  /**
   * Get broadcast campaign history
   * GET /api/admin/sent-notifications
   */
  async getSentNotifications(params = {}) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.SENT_NOTIFICATIONS.LIST, { params });
    const raw = response?.data || response?.items || response || [];
    return normalizeObjectKeys(raw);
  },

  /**
   * Get campaign batch details with statistics & message variants
   * GET /api/admin/sent-notifications/{batchId}
   */
  async getSentNotificationDetails(batchId) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.SENT_NOTIFICATIONS.DETAILS(batchId));
    return normalizeObjectKeys(response);
  },

  /**
   * Get recipient list for a campaign batch
   * GET /api/admin/sent-notifications/{batchId}/recipients
   */
  async getSentNotificationRecipients(batchId, params = {}) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.SENT_NOTIFICATIONS.RECIPIENTS(batchId), { params });
    const raw = response?.data || response?.items || response || [];
    return normalizeObjectKeys(raw);
  },

  /**
   * Get exact message delivered to a specific recipient
   * GET /api/admin/sent-notifications/{batchId}/recipients/{recipientId}/message
   */
  async getRecipientMessage(batchId, recipientId) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.SENT_NOTIFICATIONS.RECIPIENT_MESSAGE(batchId, recipientId));
    return normalizeObjectKeys(response);
  },

  /**
   * Export campaign report for a batch with Bearer token authentication
   * GET /api/admin/sent-notifications/{batchId}/export
   * Downloads a CSV/report file with all recipients and their personalized messages.
   * @param {string} batchId
   * @param {string} [language] — optional language filter (en, ar, bg, es). Omit for all.
   */
  async exportCampaignReport(batchId, language = '') {
    const params = {};
    if (language) params.language = language;
    const response = await apiClient.get(ENDPOINTS.ADMIN.SENT_NOTIFICATIONS.EXPORT(batchId), {
      params
    });
    const csvContent = typeof response === 'string' ? response : (response?.data ?? response);
    const blob = new Blob(['\uFEFF', csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `campaign-report-${batchId}${language ? `-${language}` : ''}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    return true;
  },

  /**
   * Generate campaign report export download URL
   * @param {string} batchId
   * @param {string} [language]
   */
  getCampaignExportUrl(batchId, language = '') {
    const base = resolveBaseUrl();
    const cleanBase = base.startsWith('http') ? base : `${window.location.origin}${base}`;
    const langParam = language ? `?language=${encodeURIComponent(language)}` : '';
    return `${cleanBase}${ENDPOINTS.ADMIN.SENT_NOTIFICATIONS.EXPORT(batchId)}${langParam}`;
  },

  // ==========================================
  // 4. ADMIN SETTINGS (VIP & WINDOWS)
  // ==========================================

  /**
   * Get VIP Segment eligibility thresholds
   * GET /api/admin/settings/vip-segments
   */
  async getVipSegments() {
    return await apiClient.get(ENDPOINTS.ADMIN.SETTINGS.VIP_SEGMENTS);
  },

  /**
   * Update VIP Segment eligibility thresholds
   * PUT /api/admin/settings/vip-segments
   */
  async updateVipSegments(payload) {
    return await apiClient.put(ENDPOINTS.ADMIN.SETTINGS.VIP_SEGMENTS, payload);
  },

  /**
   * Get Active Customer Window Days
   * GET /api/admin/settings/notifications
   */
  async getNotificationSettings() {
    return await apiClient.get(ENDPOINTS.ADMIN.SETTINGS.NOTIFICATIONS);
  },

  /**
   * Update Active Customer Window Days
   * PUT /api/admin/settings/notifications
   */
  async updateNotificationSettings(payload) {
    return await apiClient.put(ENDPOINTS.ADMIN.SETTINGS.NOTIFICATIONS, payload);
  },

  // ==========================================
  // 5. COUPON VIP EXCLUSIVE ASSIGNMENT
  // ==========================================

  /**
   * Assign exclusive coupon to all eligible VIP customers & broadcast
   * POST /api/admin/coupons/{id}/assign-exclusive
   */
  async assignCouponToVip(couponId) {
    return await apiClient.post(ENDPOINTS.ADMIN.COUPONS.ASSIGN_EXCLUSIVE(couponId));
  },

  // ==========================================
  // 6. ADMIN CAMPAIGN DISPATCH (BACKEND DRIVEN)
  // ==========================================

  /**
   * Save and dispatch exclusive coupon campaign to patrons via real backend database.
   * Calls POST /api/admin/coupons/{id}/assign-exclusive which persists the campaign batch
   * to PostgreSQL, generating records for GET /api/admin/sent-notifications.
   */
  async sendBroadcastNotification(payload) {
    const { couponId } = payload;
    if (couponId) {
      return await this.assignCouponToVip(couponId);
    }
    // Directly call backend if a general broadcast endpoint exists
    const response = await apiClient.post('/admin/notifications/broadcast', payload);
    return response?.data || response;
  }
};

export default notificationApi;

