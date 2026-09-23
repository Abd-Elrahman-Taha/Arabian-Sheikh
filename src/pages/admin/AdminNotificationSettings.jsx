import React, { useState, useEffect } from 'react';
import notificationApi from '../../api/notification.api';
import { useToast } from '../../context/ToastContext';
import {
  Sliders,
  Crown,
  Clock,
  Save,
  Check,
  Loader2,
  Sparkles,
  Users,
  ShieldCheck,
  DollarSign,
  ShoppingBag
} from 'lucide-react';

export default function AdminNotificationSettings() {
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [savingVip, setSavingVip] = useState(false);
  const [savingWindow, setSavingWindow] = useState(false);

  // VIP Segments Form
  const [vipSegments, setVipSegments] = useState({
    minOrderCount: 3,
    minTotalSpend: 500,
    topBuyersCount: 100
  });

  // Active Customer Window Form
  const [activeWindow, setActiveWindow] = useState({
    activeCustomerWindowDays: 30
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [vipData, windowData] = await Promise.all([
          notificationApi.getVipSegments().catch(() => null),
          notificationApi.getNotificationSettings().catch(() => null)
        ]);

        if (vipData) {
          setVipSegments({
            minOrderCount: vipData.minOrderCount ?? 3,
            minTotalSpend: vipData.minTotalSpend ?? 500,
            topBuyersCount: vipData.topBuyersCount ?? 100
          });
        }

        if (windowData) {
          setActiveWindow({
            activeCustomerWindowDays: windowData.activeCustomerWindowDays ?? 30
          });
        }
      } catch (err) {
        console.warn('Could not load notification settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveVip = async (e) => {
    e.preventDefault();
    setSavingVip(true);
    try {
      await notificationApi.updateVipSegments({
        minOrderCount: Number(vipSegments.minOrderCount),
        minTotalSpend: Number(vipSegments.minTotalSpend),
        topBuyersCount: Number(vipSegments.topBuyersCount)
      });
      success('VIP Segment eligibility rules updated successfully.');
    } catch (err) {
      error(err?.message || 'Failed to update VIP segments.');
    } finally {
      setSavingVip(false);
    }
  };

  const handleSaveWindow = async (e) => {
    e.preventDefault();
    setSavingWindow(true);
    try {
      await notificationApi.updateNotificationSettings({
        activeCustomerWindowDays: Number(activeWindow.activeCustomerWindowDays)
      });
      success('Active Customer Window updated successfully.');
    } catch (err) {
      error(err?.message || 'Failed to update active customer window.');
    } finally {
      setSavingWindow(false);
    }
  };

  return (
    <div className="space-y-6">
        {/* Header Card */}
        <div className="rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/35 p-6 shadow-2xl backdrop-blur-md space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#F2D675] font-bold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Marketing Automation Rules</span>
            </span>
          </div>
          <h2 className="font-cinzel text-2xl font-bold uppercase tracking-wider text-[#F3E6D0]">
            Notification & VIP Segment Configuration
          </h2>
          <p className="text-xs text-[#D8BE99]">
            Configure the mathematical thresholds that grant customers VIP status, and set the engagement decay window for automated campaign broadcasts.
          </p>
        </div>

        {loading ? (
          <div className="py-20 rounded-2xl bg-[#0B0A08]/60 border border-[#D4AF37]/20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mx-auto" />
            <p className="text-xs text-[#D8BE99] font-cinzel tracking-wider uppercase">Loading Automation Settings...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* VIP Eligibility Settings Form */}
            <form onSubmit={handleSaveVip} className="rounded-2xl bg-[#0B0A08]/80 border border-[#D4AF37]/30 p-6 space-y-5 shadow-xl">
              <div className="flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#F2D675]">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cinzel text-base font-bold text-[#F3E6D0]">
                    VIP Circle Eligibility Rules
                  </h3>
                  <p className="text-xs text-[#D8BE99]/80">
                    A customer qualifies for VIP status if they meet ANY of these 3 conditions:
                  </p>
                </div>
              </div>

              <div className="space-y-4 font-sans text-xs">
                {/* Rule 1: Min Order Count */}
                <div>
                  <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold mb-1 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Minimum Orders Placed</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={vipSegments.minOrderCount}
                    onChange={(e) => setVipSegments({ ...vipSegments, minOrderCount: e.target.value })}
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2.5 px-3 text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none font-mono text-sm"
                  />
                  <p className="text-[10px] text-[#D8BE99]/60 mt-1">
                    Customer qualifies once they complete at least this many orders.
                  </p>
                </div>

                {/* Rule 2: Min Total Spend */}
                <div>
                  <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold mb-1 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Minimum Total Invested (Spend)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={vipSegments.minTotalSpend}
                    onChange={(e) => setVipSegments({ ...vipSegments, minTotalSpend: e.target.value })}
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2.5 px-3 text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none font-mono text-sm"
                  />
                  <p className="text-[10px] text-[#D8BE99]/60 mt-1">
                    Customer qualifies once their lifetime order spend reaches this threshold.
                  </p>
                </div>

                {/* Rule 3: Top Buyers Count */}
                <div>
                  <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Top Spenders Auto-VIP Tier (Top N)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={vipSegments.topBuyersCount}
                    onChange={(e) => setVipSegments({ ...vipSegments, topBuyersCount: e.target.value })}
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2.5 px-3 text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none font-mono text-sm"
                  />
                  <p className="text-[10px] text-[#D8BE99]/60 mt-1">
                    The top N highest spending patrons are always granted VIP membership automatically.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#D4AF37]/20 flex justify-end">
                <button
                  type="submit"
                  disabled={savingVip}
                  className="luxury-btn-gold px-6 py-2.5 text-xs font-cinzel font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {savingVip ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save VIP Thresholds</span>
                </button>
              </div>
            </form>

            {/* Active Customer Engagement Window Form */}
            <form onSubmit={handleSaveWindow} className="rounded-2xl bg-[#0B0A08]/80 border border-[#D4AF37]/30 p-6 space-y-5 shadow-xl">
              <div className="flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#F2D675]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cinzel text-base font-bold text-[#F3E6D0]">
                    Active Engagement Decay Window
                  </h3>
                  <p className="text-xs text-[#D8BE99]/80">
                    Controls customer dormancy filtering for promotional and WhatsApp dispatches.
                  </p>
                </div>
              </div>

              <div className="space-y-4 font-sans text-xs">
                <div>
                  <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold mb-1">
                    Active Customer Window (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    required
                    value={activeWindow.activeCustomerWindowDays}
                    onChange={(e) => setActiveWindow({ activeCustomerWindowDays: e.target.value })}
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2.5 px-3 text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none font-mono text-sm"
                  />
                  <p className="text-[10px] text-[#D8BE99]/60 mt-1 leading-relaxed">
                    A customer is considered "active" if they have logged in, added an item to cart, or placed an order within this number of days (default: 30 days). Inactive customers are safely excluded from bulk marketing broadcasts to preserve WhatsApp deliverability.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#D4AF37]/20 flex justify-end">
                <button
                  type="submit"
                  disabled={savingWindow}
                  className="luxury-btn-gold px-6 py-2.5 text-xs font-cinzel font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {savingWindow ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Engagement Window</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
  );
}
