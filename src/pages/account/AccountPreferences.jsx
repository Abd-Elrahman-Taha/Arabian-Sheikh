import React, { useState, useEffect } from 'react';
import notificationApi from '../../api/notification.api';
import { useToast } from '../../context/ToastContext';
import {
  Sliders,
  Bell,
  Mail,
  MessageSquare,
  Sparkles,
  Tag,
  ShieldCheck,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react';

export default function AccountPreferences() {
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    inAppEnabled: true,
    emailMarketingOptIn: true,
    whatsAppOptIn: false,
    promotionsOptIn: true,
    couponsOptIn: true
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await notificationApi.getPreferences();
        if (data) {
          setPreferences({
            inAppEnabled: data.inAppEnabled ?? true,
            emailMarketingOptIn: data.emailMarketingOptIn ?? true,
            whatsAppOptIn: data.whatsAppOptIn ?? false,
            promotionsOptIn: data.promotionsOptIn ?? true,
            couponsOptIn: data.couponsOptIn ?? true
          });
        }
      } catch (err) {
        console.warn('Could not load preferences, using defaults:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleToggle = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await notificationApi.updatePreferences(preferences);
      success('Your royal notification preferences have been saved securely.');
    } catch (err) {
      error(err?.message || 'Failed to update preferences.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
        {/* Header Banner */}
        <div className="rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/35 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#F2D675] font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>GDPR Certified Privacy Center</span>
            </span>
          </div>
          <h2 className="font-cinzel text-2xl font-bold uppercase tracking-wider text-[#F3E6D0]">
            Notification & Marketing Preferences
          </h2>
          <p className="text-xs text-[#D8BE99] max-w-2xl leading-relaxed">
            Configure how and when the House of Arabian Sheikh contacts you. We honor your sovereignty over your personal data. Every modification is logged to the certified consent registry.
          </p>
        </div>

        {loading ? (
          <div className="py-20 rounded-2xl bg-[#0B0A08]/60 border border-[#D4AF37]/20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mx-auto" />
            <p className="text-xs text-[#D8BE99] font-cinzel tracking-wider uppercase">Loading Preferences...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="rounded-2xl bg-[#0B0A08]/80 border border-[#D4AF37]/30 divide-y divide-[#D4AF37]/20 shadow-xl overflow-hidden">
              {/* 1. In-App Notifications */}
              <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-[#F2D675] shrink-0 mt-0.5">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#F3E6D0]">
                      In-App Notifications (Bell & Real-Time Alerts)
                    </h3>
                    <p className="text-xs text-[#D8BE99] leading-relaxed max-w-xl">
                      Displays real-time slide-in toasts and bell notifications in the navbar when order status changes or coupons are awarded.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={preferences.inAppEnabled}
                    onChange={() => handleToggle('inAppEnabled')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-black/60 border border-[#D4AF37]/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#D4AF37] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]/30 peer-checked:border-[#D4AF37]"></div>
                </label>
              </div>

              {/* 2. Email Marketing */}
              <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-[#F2D675] shrink-0 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#F3E6D0]">
                      Email Offers & Luxury Updates
                    </h3>
                    <p className="text-xs text-[#D8BE99] leading-relaxed max-w-xl">
                      Receive editorial releases, fragrance harvest announcements, and promotional parchment letters directly to your inbox.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={preferences.emailMarketingOptIn}
                    onChange={() => handleToggle('emailMarketingOptIn')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-black/60 border border-[#D4AF37]/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#D4AF37] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]/30 peer-checked:border-[#D4AF37]"></div>
                </label>
              </div>

              {/* 3. WhatsApp VIP */}
              <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#F3E6D0]">
                      WhatsApp VIP Concierge & High-Urgency Alerts
                    </h3>
                    <p className="text-xs text-[#D8BE99] leading-relaxed max-w-xl">
                      Receive direct WhatsApp dispatch notices for exclusive limited-reserve coupon assignments, flash events, and urgent delivery checkpoints.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={preferences.whatsAppOptIn}
                    onChange={() => handleToggle('whatsAppOptIn')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-black/60 border border-[#D4AF37]/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-emerald-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500/30 peer-checked:border-emerald-400"></div>
                </label>
              </div>

              {/* 4. Promotions Topic */}
              <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/35 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#F3E6D0]">
                      Seasonal Promotions & Bundle Drops
                    </h3>
                    <p className="text-xs text-[#D8BE99] leading-relaxed max-w-xl">
                      Permits topic-level notifications regarding curated flacon bundles, Eid seasonal specials, and private holiday collections.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={preferences.promotionsOptIn}
                    onChange={() => handleToggle('promotionsOptIn')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-black/60 border border-[#D4AF37]/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#D4AF37] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]/30 peer-checked:border-[#D4AF37]"></div>
                </label>
              </div>

              {/* 5. Coupons Topic */}
              <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#F3E6D0]">
                      VIP Privilege Coupons & Vouchers
                    </h3>
                    <p className="text-xs text-[#D8BE99] leading-relaxed max-w-xl">
                      Permits topic-level notification when an exclusive private discount code is granted to your account.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={preferences.couponsOptIn}
                    onChange={() => handleToggle('couponsOptIn')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-black/60 border border-[#D4AF37]/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#D4AF37] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]/30 peer-checked:border-[#D4AF37]"></div>
                </label>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-[#D8BE99]/80">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Encrypted with TLS 1.3 & Server-side Consent Logging</span>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto luxury-btn-gold px-8 py-3.5 text-xs font-cinzel font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 cursor-pointer shadow-xl disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sealing Preferences...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Royal Preferences</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
  );
}
