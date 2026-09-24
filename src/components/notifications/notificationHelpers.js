/**
 * Arabian Sheikh — Notification Helpers
 * 
 * Shared utilities for notification routing, icons, colors, and time formatting.
 */
import {
  Package, Bell, XCircle, CreditCard, AlertTriangle, ShieldAlert, Truck,
  Bike, Gift, RotateCcw, CheckCircle2, DollarSign, Ticket, Timer,
  Flame, BarChart3, ShoppingCart, Heart, Star, Lock, AlertCircle, Info
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// Deep Link Route Resolver
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Resolve the navigation route when a notification is clicked.
 * @param {string|null} entityType — relatedEntityType from the notification
 * @param {number|null} entityId — relatedEntityId from the notification
 * @param {boolean} isAdmin — whether the current user is admin
 * @returns {string} path to navigate to
 */
export function resolveNotificationRoute(entityType, entityId, isAdmin = false) {
  if (!entityType || entityId == null) {
    return isAdmin ? '/admin' : '/account/notifications';
  }

  switch (entityType.toLowerCase()) {
    case 'order':
      return isAdmin ? `/admin/orders` : `/account/orders/${entityId}`;
    case 'payment':
      return isAdmin ? `/admin/payments` : `/account/orders/${entityId}`;
    case 'returnrequest':
    case 'return':
      return isAdmin ? `/admin/returns` : `/account/orders/${entityId}`;
    case 'coupon':
      return '/cart';
    case 'promotion':
      return `/shop`;
    case 'bundle':
      return `/bundle/${entityId}`;
    case 'cart':
      return '/cart';
    case 'wishlist':
      return '/account/wishlist';
    case 'review':
      return isAdmin ? '/admin/reviews' : `/product/${entityId}`;
    default:
      return isAdmin ? '/admin' : '/account/notifications';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Notification Icon Mapping
// ═══════════════════════════════════════════════════════════════════════════════

const EVENT_ICON_MAP = {
  order_created: Package,
  new_order_admin: Bell,
  order_cancelled: XCircle,
  payment_succeeded: CreditCard,
  payment_failed: AlertCircle,
  payment_risk_alert: ShieldAlert,
  order_shipped: Truck,
  out_for_delivery: Bike,
  order_delivered: Gift,
  shipment_failed_admin: AlertTriangle,
  return_requested_admin: RotateCcw,
  return_request_submitted: RotateCcw,
  return_approved: CheckCircle2,
  return_rejected: XCircle,
  refund_completed: DollarSign,
  coupon_assigned_exclusive: Ticket,
  coupon_expiring_soon: Timer,
  coupon_limit_reached_admin: Ticket,
  coupon_expired_admin: Ticket,
  new_bundle_released: Gift,
  new_promotion_campaign: Flame,
  promotion_ending_soon: Timer,
  promotion_limit_reached_admin: BarChart3,
  promotion_ended_report_admin: BarChart3,
  abandoned_cart_reminder: ShoppingCart,
  wishlist_reminder: Heart,
  new_review_pending_admin: Star,
  password_changed_alert: Lock,
};

/**
 * Get the Lucide icon component for a given event type.
 * @param {string} eventType
 * @returns {import('lucide-react').LucideIcon}
 */
export function getNotificationIcon(eventType) {
  return EVENT_ICON_MAP[eventType] || Bell;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Notification Color Mapping (Toast & Badge Colors)
// ═══════════════════════════════════════════════════════════════════════════════

const EVENT_COLOR_MAP = {
  // Green — Success
  order_created: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  payment_succeeded: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  order_delivered: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  return_approved: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  refund_completed: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', dot: 'bg-emerald-400' },

  // Red — Danger
  payment_failed: { bg: 'bg-rose-500/20', border: 'border-rose-500/40', text: 'text-rose-400', dot: 'bg-rose-400' },
  payment_risk_alert: { bg: 'bg-rose-500/20', border: 'border-rose-500/40', text: 'text-rose-400', dot: 'bg-rose-400' },
  shipment_failed_admin: { bg: 'bg-rose-500/20', border: 'border-rose-500/40', text: 'text-rose-400', dot: 'bg-rose-400' },
  return_rejected: { bg: 'bg-rose-500/20', border: 'border-rose-500/40', text: 'text-rose-400', dot: 'bg-rose-400' },
  password_changed_alert: { bg: 'bg-rose-500/20', border: 'border-rose-500/40', text: 'text-rose-400', dot: 'bg-rose-400' },

  // Amber — Warning
  order_cancelled: { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-400', dot: 'bg-amber-400' },
  coupon_expiring_soon: { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-400', dot: 'bg-amber-400' },
  promotion_ending_soon: { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-400', dot: 'bg-amber-400' },
  abandoned_cart_reminder: { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-400', dot: 'bg-amber-400' },

  // Purple — Luxury/VIP
  coupon_assigned_exclusive: { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-400', dot: 'bg-purple-400' },
  new_bundle_released: { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-400', dot: 'bg-purple-400' },
  new_promotion_campaign: { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-400', dot: 'bg-purple-400' },
};

// Default blue for info-level events
const DEFAULT_COLOR = { bg: 'bg-sky-500/20', border: 'border-sky-500/40', text: 'text-sky-400', dot: 'bg-sky-400' };

/**
 * Get the color classes for a given event type.
 * @param {string} eventType
 * @returns {{ bg: string, border: string, text: string, dot: string }}
 */
export function getNotificationColor(eventType) {
  return EVENT_COLOR_MAP[eventType] || DEFAULT_COLOR;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Time Formatting
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Format a notification timestamp to relative time.
 * @param {string} createdAt — ISO 8601 UTC timestamp
 * @returns {string} e.g. "Just now", "2 hours ago", "Yesterday", "Sep 22"
 */
export function formatNotificationTime(createdAt) {
  if (!createdAt) return '';

  const now = new Date();
  const date = new Date(createdAt);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  // Older than a week — show date
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Action Link Text by Entity Type
// ═══════════════════════════════════════════════════════════════════════════════

const ACTION_LINK_MAP = {
  order: 'View Order',
  payment: 'View Receipt',
  returnrequest: 'View Return',
  return: 'View Return',
  coupon: 'Use Coupon Now',
  promotion: 'View Promotion',
  bundle: 'View Bundle',
  cart: 'Go to Cart',
  wishlist: 'View Wishlist',
  review: 'View Review',
};

/**
 * Get the action link text for a notification based on its entity type.
 * @param {string|null} entityType
 * @returns {string}
 */
export function getActionLinkText(entityType) {
  if (!entityType) return 'View Details';
  return ACTION_LINK_MAP[entityType.toLowerCase()] || 'View Details';
}
