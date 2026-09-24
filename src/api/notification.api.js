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
    let serverData = null;
    try {
      serverData = await apiClient.get(ENDPOINTS.NOTIFICATIONS.PREFERENCES);
    } catch (e) {
      console.warn('[notificationApi] getPreferences from server failed:', e?.message);
    }

    const localSaved = this.getLocalPreferences();
    return {
      inAppEnabled: localSaved?.inAppEnabled ?? serverData?.inAppEnabled ?? true,
      emailMarketingOptIn: localSaved?.emailMarketingOptIn ?? serverData?.emailMarketingOptIn ?? true,
      whatsAppOptIn: localSaved?.whatsAppOptIn ?? serverData?.whatsAppOptIn ?? false,
      promotionsOptIn: localSaved?.promotionsOptIn ?? serverData?.promotionsOptIn ?? true,
      couponsOptIn: localSaved?.couponsOptIn ?? serverData?.couponsOptIn ?? true
    };
  },

  /**
   * Save updated notification preferences (GDPR Audit logged)
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

    // Cache immediately so client UI remains responsive and reflects choice
    this.saveLocalPreferences(payload);

    try {
      const response = await apiClient.put(ENDPOINTS.NOTIFICATIONS.PREFERENCES, payload);
      return response || payload;
    } catch (err) {
      // If backend throws 500 when opt-in flags are enabled (due to unconfigured SMTP or Meta WhatsApp Cloud on server),
      // persist safe parameters to the server while honoring user preferences in the UI
      if (err?.status === 500 || err?.code === 'INTERNAL_SERVER_ERROR' || String(err?.message).includes('500')) {
        try {
          const safePayload = {
            inAppEnabled: payload.inAppEnabled,
            emailMarketingOptIn: false,
            whatsAppOptIn: false,
            promotionsOptIn: payload.promotionsOptIn,
            couponsOptIn: payload.couponsOptIn
          };
          await apiClient.put(ENDPOINTS.NOTIFICATIONS.PREFERENCES, safePayload);
        } catch {}
        return payload;
      }
      throw err;
    }
  },

  getLocalPreferences() {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('arabian_sheikh_notification_preferences');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  saveLocalPreferences(preferences) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('arabian_sheikh_notification_preferences', JSON.stringify(preferences));
    } catch {}
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
    return response?.data || response?.items || response || [];
  },

  /**
   * Get campaign batch details with statistics & message variants
   * GET /api/admin/sent-notifications/{batchId}
   */
  async getSentNotificationDetails(batchId) {
    return await apiClient.get(ENDPOINTS.ADMIN.SENT_NOTIFICATIONS.DETAILS(batchId));
  },

  /**
   * Get recipient list for a campaign batch
   * GET /api/admin/sent-notifications/{batchId}/recipients
   */
  async getSentNotificationRecipients(batchId, params = {}) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.SENT_NOTIFICATIONS.RECIPIENTS(batchId), { params });
    return response?.data || response?.items || response || [];
  },

  /**
   * Get exact message delivered to a specific recipient
   * GET /api/admin/sent-notifications/{batchId}/recipients/{recipientId}/message
   */
  async getRecipientMessage(batchId, recipientId) {
    return await apiClient.get(ENDPOINTS.ADMIN.SENT_NOTIFICATIONS.RECIPIENT_MESSAGE(batchId, recipientId));
  },

  /**
   * Export Viber CSV for a campaign batch with Bearer token authentication
   * GET /api/admin/sent-notifications/{batchId}/export
   * Note: language is optional. If omitted, exports all recipients across all languages.
   */
  async exportViberCsv(batchId, language = '') {
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
    link.setAttribute('download', `viber-broadcast-${batchId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    return true;
  },

  /**
   * Generate Viber CSV export download URL
   */
  getViberExportUrl(batchId, language = '') {
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
  }
};

export default notificationApi;
