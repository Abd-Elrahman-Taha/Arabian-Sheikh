/**
 * Arabian Sheikh - Notification Context & State Manager
 * 
 * Manages:
 * - Real-time SignalR notifications & slide-in toast trigger
 * - Customer & Admin unread notification counts
 * - Optimistic read status updates & REST persistence
 * - Multi-tab broadcast channel synchronization
 * - Complete 28-Event deep link route resolution
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { tokenManager } from '../api/client';
import notificationApi from '../api/notification.api';
import signalRService from '../services/SignalRNotificationService';

const NotificationContext = createContext(null);

export const NOTIFICATION_SYNC_CHANNEL = 'arabian_sheikh_notifications_sync';

/**
 * 28-Event Matrix Deep Linking Resolver
 * Maps entity type and entity ID to appropriate customer or admin route
 */
export function resolveNotificationRoute(entityType, entityId, isAdmin = false) {
  if (!entityType || !entityId) {
    return isAdmin ? '/admin' : '/account/notifications';
  }

  const type = String(entityType).toLowerCase();

  switch (type) {
    case 'order':
      return isAdmin ? `/admin/orders` : `/account/orders/${entityId}`;

    case 'payment':
      return isAdmin ? `/admin/payments` : `/account/orders/${entityId}`;

    case 'returnrequest':
    case 'return':
      return isAdmin ? `/admin/returns` : `/account/orders/${entityId}`;

    case 'coupon':
      return `/cart?coupon=${entityId}`;

    case 'promotion':
      return `/promotions/${entityId}`;

    case 'bundle':
      return `/catalog/bundles/${entityId}`;

    case 'cart':
      return '/cart';

    case 'wishlist':
      return '/account/wishlist';

    case 'review':
      return isAdmin ? `/admin/reviews` : `/product/${entityId}`;

    default:
      return isAdmin ? '/admin' : '/account/notifications';
  }
}

/**
 * Event Matrix Styling Helper (Icon and Color accents)
 */
export function getNotificationEventStyle(eventType) {
  const type = String(eventType || '').toLowerCase();

  // Green / Orders & Payments Succeeded
  if (['order_created', 'order_delivered', 'payment_succeeded', 'return_approved', 'refund_completed'].includes(type)) {
    return {
      category: 'order',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      accentColor: '#10B981',
      iconName: 'PackageCheck'
    };
  }

  // Blue / Shipping & Admin Info
  if (['new_order_admin', 'order_shipped', 'out_for_delivery', 'return_requested_admin', 'return_request_submitted', 'wishlist_reminder', 'new_review_pending_admin'].includes(type)) {
    return {
      category: 'shipping',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      accentColor: '#0EA5E9',
      iconName: 'Truck'
    };
  }

  // Purple / VIP Offers & Promotions
  if (['coupon_assigned_exclusive', 'new_bundle_released', 'new_promotion_campaign'].includes(type)) {
    return {
      category: 'vip',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      accentColor: '#A855F7',
      iconName: 'Sparkles'
    };
  }

  // Amber / Warnings & Urgency
  if (['order_cancelled', 'coupon_expiring_soon', 'promotion_ending_soon', 'abandoned_cart_reminder'].includes(type)) {
    return {
      category: 'warning',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      accentColor: '#F59E0B',
      iconName: 'Clock'
    };
  }

  // Red / Danger & Alerts
  if (['payment_failed', 'payment_risk_alert', 'shipment_failed_admin', 'return_rejected', 'password_changed_alert'].includes(type)) {
    return {
      category: 'alert',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      accentColor: '#F43F5E',
      iconName: 'ShieldAlert'
    };
  }

  // Default Gold
  return {
    category: 'general',
    badgeColor: 'bg-[#D4AF37]/20 text-[#F2D675] border-[#D4AF37]/40',
    accentColor: '#D4AF37',
    iconName: 'Bell'
  };
}

export function NotificationProvider({ children }) {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [latestToast, setLatestToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const broadcastRef = useRef(null);

  // 1. Fetch initial unread count
  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      if (isAdmin) {
        const res = await notificationApi.getAdminUnreadCount();
        setUnreadCount(res?.count || 0);
      } else {
        const res = await notificationApi.getUnreadCount();
        setUnreadCount(res?.count || 0);
      }
    } catch {
      // Gracefully handle network hiccups
    }
  }, [isAuthenticated, isAdmin]);

  // 2. Fetch recent notifications (for dropdown)
  const fetchRecent = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      if (isAdmin) {
        const items = await notificationApi.getAdminNotifications({ page: 1, pageSize: 8 });
        setNotifications(Array.isArray(items) ? items : []);
      } else {
        const items = await notificationApi.getNotifications({ page: 1, pageSize: 8 });
        setNotifications(Array.isArray(items) ? items : []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  // 3. Mark single notification as read (Optimistic + REST)
  const markAsRead = useCallback(async (id) => {
    if (!id || !isAuthenticated) return;

    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    // Multi-tab sync
    if (broadcastRef.current) {
      try {
        broadcastRef.current.postMessage({
          type: 'MARK_READ',
          id,
          newCount: Math.max(0, unreadCount - 1)
        });
      } catch {}
    }

    try {
      if (isAdmin) {
        await notificationApi.markAdminAsRead(id);
      } else {
        await notificationApi.markAsRead(id);
      }
    } catch (e) {
      console.warn('Failed to persist notification read status:', e);
    }
  }, [isAuthenticated, isAdmin, unreadCount]);

  // 4. Mark all notifications as read (Optimistic + REST)
  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    // Multi-tab sync
    if (broadcastRef.current) {
      try {
        broadcastRef.current.postMessage({
          type: 'MARK_ALL_READ',
          newCount: 0
        });
      } catch {}
    }

    try {
      if (isAdmin) {
        await notificationApi.markAdminAllAsRead();
      } else {
        await notificationApi.markAllAsRead();
      }
    } catch (e) {
      console.warn('Failed to persist mark all as read:', e);
    }
  }, [isAuthenticated, isAdmin]);

  // 5. SignalR Connection Lifecycle
  useEffect(() => {
    if (!isAuthenticated) {
      signalRService.stopConnection();
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    const token = tokenManager.getToken(isAdmin);
    if (!token) return;

    refreshUnreadCount();
    fetchRecent();

    const handleIncomingNotification = (newNotification) => {
      // 1. Increment unread counter
      setUnreadCount((c) => c + 1);

      // 2. Prepend to in-memory notifications list
      setNotifications((prev) => [newNotification, ...prev.slice(0, 19)]);

      // 3. Trigger floating slide-in toast
      setLatestToast(newNotification);

      // 4. Notify other browser tabs
      if (broadcastRef.current) {
        try {
          broadcastRef.current.postMessage({
            type: 'NEW_NOTIFICATION',
            notification: newNotification
          });
        } catch {}
      }
    };

    const handleReconnected = () => {
      refreshUnreadCount();
      fetchRecent();
    };

    signalRService.startConnection(token, handleIncomingNotification, handleReconnected);

    return () => {
      signalRService.removeListener(handleIncomingNotification, handleReconnected);
    };
  }, [isAuthenticated, isAdmin, user?.id, refreshUnreadCount, fetchRecent]);

  // 6. Multi-Tab Synchronization via BroadcastChannel
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;

    const channel = new BroadcastChannel(NOTIFICATION_SYNC_CHANNEL);
    broadcastRef.current = channel;

    channel.onmessage = (event) => {
      const data = event?.data;
      if (!data) return;

      if (data.type === 'MARK_READ') {
        setNotifications((prev) =>
          prev.map((n) => (n.id === data.id ? { ...n, isRead: true } : n))
        );
        if (data.newCount !== undefined) {
          setUnreadCount(data.newCount);
        } else {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
      } else if (data.type === 'MARK_ALL_READ') {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      } else if (data.type === 'NEW_NOTIFICATION' && data.notification) {
        setUnreadCount((c) => c + 1);
        setNotifications((prev) => [data.notification, ...prev.slice(0, 19)]);
      }
    };

    return () => {
      channel.close();
      broadcastRef.current = null;
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        latestToast,
        clearToast: () => setLatestToast(null),
        loading,
        markAsRead,
        markAllAsRead,
        refreshUnreadCount,
        fetchRecent,
        resolveRoute: (entityType, entityId) => resolveNotificationRoute(entityType, entityId, isAdmin)
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
