import React, { useState, useRef, useEffect } from 'react';
import { useNotifications, getNotificationEventStyle } from '../../context/NotificationContext';
import { useRouter, Link } from '../../router/RouterContext';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  CheckCheck,
  ExternalLink,
  Sparkles,
  Package,
  Truck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  X
} from 'lucide-react';

// Format ISO date to relative timestamp
function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function NotificationBell({ isAdmin = false }) {
  const { unreadCount, notifications, markAsRead, markAllAsRead, resolveRoute, fetchRecent } = useNotifications();
  const { isAuthenticated } = useAuth();
  const { navigate } = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      fetchRecent();
    }
    setIsOpen(!isOpen);
  };

  const handleItemClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
    const targetRoute = resolveRoute(notification.relatedEntityType, notification.relatedEntityId);
    if (targetRoute) {
      navigate(targetRoute);
    }
  };

  if (!isAuthenticated) return null;

  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className={`relative p-2 rounded-full transition-all duration-300 focus:outline-none cursor-pointer flex items-center justify-center shrink-0 ${
          isOpen
            ? 'text-[#F2D675] bg-[#D4AF37]/20 border border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.4)]'
            : 'text-[#D8BE99] hover:text-[#F2D675] hover:bg-black/40 border border-transparent hover:border-[#D4AF37]/30'
        }`}
        title="Royal Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#B8860B] text-black font-cinzel font-bold text-[10px] rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(212,175,55,0.7)] animate-pulse">
            {displayCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#0B0A08]/95 backdrop-blur-xl border border-[#D4AF37]/40 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50 overflow-hidden animate-fade-in text-[#F3E6D0]">
          {/* Header */}
          <div className="p-4 border-b border-[#D4AF37]/20 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#F2D675] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Royal Alerts</span>
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#F2D675] border border-[#D4AF37]/40 font-mono font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] text-[#D8BE99] hover:text-[#F2D675] flex items-center gap-1 transition-colors cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#D4AF37]/15">
            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full border border-[#D4AF37]/30 bg-black/40 flex items-center justify-center mx-auto text-[#D4AF37]/60">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs text-[#D8BE99]/80 font-medium">No alerts in your Royal Vault</p>
                <p className="text-[10px] text-[#D8BE99]/50">Order updates and privilege offers will appear here.</p>
              </div>
            ) : (
              notifications.slice(0, 6).map((n) => {
                const style = getNotificationEventStyle(n.eventType);
                return (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`p-3.5 hover:bg-[#D4AF37]/10 transition-colors cursor-pointer relative flex gap-3 ${
                      !n.isRead ? 'bg-[#D4AF37]/[0.06]' : 'opacity-85'
                    }`}
                  >
                    {/* Unread gold pill dot */}
                    {!n.isRead && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shrink-0 mt-1.5 shadow-[0_0_6px_#D4AF37]" />
                    )}

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border font-mono font-semibold truncate ${style.badgeColor}`}>
                          {n.eventType ? n.eventType.replace(/_/g, ' ') : 'Alert'}
                        </span>
                        <span className="text-[10px] font-mono text-[#D8BE99]/70 shrink-0">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-[#F3E6D0] line-clamp-1">
                        {n.title}
                      </h4>

                      <p className="text-[11px] text-[#D8BE99]/80 line-clamp-2 leading-relaxed">
                        {n.body}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer View All Link */}
          <div className="p-3 bg-black/60 border-t border-[#D4AF37]/20 text-center">
            <Link
              to={isAdmin ? '/admin/sent-notifications' : '/account/notifications'}
              onClick={() => setIsOpen(false)}
              className="text-xs font-cinzel font-bold text-[#F2D675] hover:text-[#FFE8A3] flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider py-1"
            >
              <span>{isAdmin ? 'View All Broadcasts' : 'Open Notification Center'}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
