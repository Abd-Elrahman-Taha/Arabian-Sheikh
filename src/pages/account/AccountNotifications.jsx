import React, { useState, useEffect, useCallback } from 'react';
import { useNotifications, getNotificationEventStyle } from '../../context/NotificationContext';
import { useRouter } from '../../router/RouterContext';
import notificationApi from '../../api/notification.api';
import {
  Bell,
  CheckCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Inbox,
  Filter,
  Loader2,
  CheckCircle2,
  Package,
  Truck,
  Tag,
  CreditCard,
  ShieldAlert,
  Clock
} from 'lucide-react';
import ScrollReveal from '../../components/common/ScrollReveal';

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;
  return past.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function getActionLabel(relatedEntityType) {
  const type = String(relatedEntityType || '').toLowerCase();
  switch (type) {
    case 'order':
      return 'View Order Details';
    case 'payment':
      return 'View Payment Receipt';
    case 'returnrequest':
    case 'return':
      return 'View Return Progress';
    case 'coupon':
      return 'Use Coupon Now';
    case 'promotion':
      return 'View Promotion';
    case 'bundle':
      return 'View Royal Bundle';
    case 'cart':
      return 'Go to Shopping Bag';
    case 'wishlist':
      return 'View Vault Wishlist';
    case 'review':
      return 'View Product Reviews';
    default:
      return 'Inspect Details';
  }
}

export default function AccountNotifications() {
  const { unreadCount, markAsRead, markAllAsRead, resolveRoute, refreshUnreadCount } = useNotifications();
  const { navigate } = useRouter();

  const [tab, setTab] = useState('all'); // 'all' | 'unread'
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationApi.getNotifications({
        unreadOnly: tab === 'unread',
        page,
        pageSize
      });
      const list = Array.isArray(data) ? data : (data?.items || []);
      setItems(list);
      setHasMore(list.length === pageSize);
    } catch (e) {
      console.warn('Failed to load notifications list:', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tab, page, pageSize]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCardClick = async (item) => {
    if (!item.isRead) {
      markAsRead(item.id);
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
    }
    const target = resolveRoute(item.relatedEntityType, item.relatedEntityId);
    if (target) {
      navigate(target);
    }
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    refreshUnreadCount();
  };

  return (
    <div className="space-y-6">
        {/* Top Header Card */}
        <div className="rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/35 p-6 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#F2D675] font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Private Communications</span>
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F2D675] text-[10px] font-mono font-bold">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <h2 className="font-cinzel text-2xl font-bold uppercase tracking-wider text-[#F3E6D0]">
              Notifications Center
            </h2>
            <p className="text-xs text-[#D8BE99]">
              Real-time dispatches, order checkpoints, and exclusive VIP privileges.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="luxury-btn-outline px-5 py-2.5 text-xs font-cinzel font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shrink-0"
            >
              <CheckCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-[#D4AF37]/25 pb-3">
          <button
            type="button"
            onClick={() => { setTab('all'); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider transition-all cursor-pointer ${
              tab === 'all'
                ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                : 'bg-black/40 text-[#D8BE99] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50'
            }`}
          >
            All Notifications
          </button>

          <button
            type="button"
            onClick={() => { setTab('unread'); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              tab === 'unread'
                ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                : 'bg-black/40 text-[#D8BE99] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50'
            }`}
          >
            <span>Unread Only</span>
            {unreadCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                tab === 'unread' ? 'bg-black text-[#F2D675]' : 'bg-[#D4AF37]/30 text-[#F2D675]'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="py-20 rounded-2xl bg-[#0B0A08]/60 border border-[#D4AF37]/20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mx-auto" />
            <p className="text-xs text-[#D8BE99] font-cinzel tracking-wider uppercase">Accessing Royal Records...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 rounded-2xl bg-[#0B0A08]/80 border border-[#D4AF37]/25 text-center space-y-4 p-8">
            <div className="w-16 h-16 rounded-full border border-[#D4AF37]/30 bg-black/60 flex items-center justify-center mx-auto text-[#D4AF37]/60">
              <Inbox className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-cinzel text-lg font-bold text-[#F3E6D0] uppercase tracking-wider">
                {tab === 'unread' ? 'All Alerts Are Read' : 'No Notifications in the Vault'}
              </h3>
              <p className="text-xs text-[#D8BE99]/80 max-w-sm mx-auto">
                {tab === 'unread'
                  ? 'You have reviewed all messages. Switch to "All Notifications" to view your full historical archive.'
                  : 'New purchase confirmations, logistics updates, and promotional vouchers will be preserved here.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const style = getNotificationEventStyle(item.eventType);
              const actionText = getActionLabel(item.relatedEntityType);

              return (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    !item.isRead
                      ? 'bg-[#150F09]/95 border-[#D4AF37]/50 shadow-[0_8px_25px_rgba(212,175,55,0.15)] hover:border-[#F2D675]'
                      : 'bg-[#0B0A08]/80 border-[#D4AF37]/20 hover:border-[#D4AF37]/45'
                  }`}
                >
                  {/* Subtle hover golden sweep */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-[#F2D675]/5 to-transparent pointer-events-none" />

                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Unread Indicator Dot */}
                    <div className="pt-1 shrink-0">
                      {!item.isRead ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" title="Unread" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${style.badgeColor}`}>
                          {item.eventType ? item.eventType.replace(/_/g, ' ') : 'Alert'}
                        </span>
                        <span className="text-[11px] text-[#D8BE99]/70 font-mono">
                          {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>

                      <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#F3E6D0] group-hover:text-[#F2D675] transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-xs text-[#D8BE99] leading-relaxed font-sans line-clamp-3">
                        {item.body}
                      </p>
                    </div>
                  </div>

                  {/* Action Link Button */}
                  <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                    <span className="text-xs font-cinzel font-bold text-[#F2D675] group-hover:underline flex items-center gap-1.5">
                      <span>{actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {(page > 1 || hasMore) && (
          <div className="pt-4 flex items-center justify-between border-t border-[#D4AF37]/20 text-xs">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="luxury-btn-outline px-4 py-2 font-cinzel font-bold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="font-mono text-[#D8BE99]">
              Page {page}
            </span>

            <button
              type="button"
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
              className="luxury-btn-outline px-4 py-2 font-cinzel font-bold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
  );
}
