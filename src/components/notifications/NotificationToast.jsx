import React, { useEffect, useState } from 'react';
import { useNotifications, getNotificationEventStyle } from '../../context/NotificationContext';
import { useRouter } from '../../router/RouterContext';
import { X, ExternalLink, Sparkles, Bell } from 'lucide-react';

export default function NotificationToast() {
  const { latestToast, clearToast, markAsRead, resolveRoute } = useNotifications();
  const { navigate } = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (latestToast) {
      setVisible(true);

      // Auto-dismiss after 6 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(clearToast, 400); // Allow fade-out animation to finish
      }, 6000);

      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [latestToast, clearToast]);

  if (!latestToast) return null;

  const style = getNotificationEventStyle(latestToast.eventType);

  const handleClick = () => {
    if (!latestToast.isRead) {
      markAsRead(latestToast.id);
    }
    const targetRoute = resolveRoute(latestToast.relatedEntityType, latestToast.relatedEntityId);
    setVisible(false);
    clearToast();
    if (targetRoute) {
      navigate(targetRoute);
    }
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setVisible(false);
    setTimeout(clearToast, 400);
  };

  return (
    <div
      className={`fixed top-20 right-4 sm:right-6 z-[99999] max-w-sm w-full transition-all duration-500 ease-out transform ${
        visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-6 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div
        onClick={handleClick}
        className="relative rounded-2xl bg-[#0B0A08]/95 backdrop-blur-xl border border-[#D4AF37]/50 p-4 shadow-[0_15px_40px_rgba(0,0,0,0.85)] cursor-pointer group hover:border-[#F2D675] transition-all overflow-hidden text-[#F3E6D0]"
        style={{
          boxShadow: `0 10px 30px rgba(0, 0, 0, 0.7), 0 0 20px ${style.accentColor}25`
        }}
      >
        {/* Accent Top Border Line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${style.accentColor}, transparent)`
          }}
        />

        <div className="flex items-start gap-3">
          {/* Icon Badge */}
          <div
            className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-md"
            style={{
              borderColor: `${style.accentColor}50`,
              backgroundColor: `${style.accentColor}18`,
              color: style.accentColor
            }}
          >
            <Bell className="w-5 h-5 animate-pulse" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border font-mono font-semibold truncate ${style.badgeColor}`}>
                {latestToast.eventType ? latestToast.eventType.replace(/_/g, ' ') : 'Royal Alert'}
              </span>
              <span className="text-[10px] text-[#D8BE99]/60 font-mono">Just now</span>
            </div>

            <h4 className="text-xs font-bold text-[#F3E6D0] line-clamp-1 group-hover:text-[#F2D675] transition-colors">
              {latestToast.title}
            </h4>

            <p className="text-[11px] text-[#D8BE99] line-clamp-2 leading-relaxed font-sans">
              {latestToast.body}
            </p>

            <div className="pt-1 flex items-center gap-1 text-[10px] text-[#F2D675] font-cinzel font-bold tracking-wider uppercase">
              <span>View Details</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </div>
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="text-[#D8BE99]/60 hover:text-[#F3E6D0] p-1 rounded-full hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            aria-label="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
