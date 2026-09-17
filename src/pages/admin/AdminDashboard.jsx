import React, { useState, useEffect, useCallback } from 'react';
import ScrollReveal from '../../components/common/ScrollReveal';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { adminService } from '../../services/adminService';
import { orderService } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import { cleanImageUrl } from '../../api/normalizers';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import AdminReports from './AdminReports';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  RotateCcw,
  CreditCard,
  Building2,
  Sparkles,
  Globe,
  Award,
  Clock
} from 'lucide-react';

const TIMEZONES = [
  { id: 'Europe/London', label: '🇬🇧 London (Europe/London)' },
  { id: 'Europe/Madrid', label: '🇪🇸 Madrid (Europe/Madrid)' },
  { id: 'Europe/Sofia', label: '🇧🇬 Sofia (Europe/Sofia)' },
  { id: 'Asia/Dubai', label: '🇦🇪 Dubai (Asia/Dubai)' },
  { id: 'UTC', label: '🌐 UTC' }
];

const DEFAULT_OVERVIEW = {
  timeZoneId: 'Europe/London',
  generatedAtUtc: new Date().toISOString(),
  financials: {
    todayGrossSales: 0,
    todayRefunds: 0,
    todayNetRevenue: 0,
    thisMonthGrossSales: 0,
    thisMonthRefunds: 0,
    thisMonthNetRevenue: 0,
    growthPercentage: null
  },
  orders: {
    totalOrders: 0,
    todayOrders: 0,
    thisMonthOrders: 0,
    pendingOrdersCount: 0,
    statusBreakdown: {}
  },
  catalog: {
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    productsBySubcategory: []
  },
  returns: {
    totalReturnRequests: 0,
    pendingReviewCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalRefundedAmount: 0,
    todayRefundedAmount: 0,
    thisMonthRefundedAmount: 0,
    gatewayRefundsTotal: 0,
    bankTransferRefundsTotal: 0
  },
  customers: {
    totalCustomers: 0,
    newCustomersThisMonth: 0
  },
  topSellingProducts: [],
  recentOrders: [],
  topCustomers: []
};

export default function AdminDashboard({ initialTab = 'all' }) {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const { success, error: showErrorToast } = useToast();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [timeZone, setTimeZone] = useState(() => {
    return localStorage.getItem('arabian_sheikh_dashboard_tz') || 'Europe/London';
  });
  const [data, setData] = useState(DEFAULT_OVERVIEW);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const fetchOverview = useCallback(async (tz) => {
    const activeTz = tz || timeZone;
    setRefreshing(true);
    try {
      const response = await adminService.getDashboardOverview(activeTz);
      if (response) {
        setData({
          ...DEFAULT_OVERVIEW,
          ...response,
          financials: { ...DEFAULT_OVERVIEW.financials, ...(response.financials || {}) },
          orders: { ...DEFAULT_OVERVIEW.orders, ...(response.orders || {}) },
          catalog: { ...DEFAULT_OVERVIEW.catalog, ...(response.catalog || {}) },
          returns: { ...DEFAULT_OVERVIEW.returns, ...(response.returns || {}) },
          customers: { ...DEFAULT_OVERVIEW.customers, ...(response.customers || {}) },
          topSellingProducts: Array.isArray(response.topSellingProducts) ? response.topSellingProducts : [],
          recentOrders: Array.isArray(response.recentOrders) ? response.recentOrders : [],
          topCustomers: Array.isArray(response.topCustomers) ? response.topCustomers : []
        });
        setFetchError(null);
      }
    } catch (err) {
      console.warn('Dashboard metrics fetch error:', err.message);
      setFetchError(err.message || 'Unable to sync with live backend telemetry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeZone]);

  useEffect(() => {
    fetchOverview(timeZone);
  }, [fetchOverview, timeZone]);

  const handleTimeZoneChange = (newTz) => {
    setTimeZone(newTz);
    localStorage.setItem('arabian_sheikh_dashboard_tz', newTz);
    fetchOverview(newTz);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      success(`Order #${orderId} status updated to ${newStatus}.`);
      await fetchOverview(timeZone);
    } catch (e) {
      console.error('Order status update error:', e);
      showErrorToast?.('Failed to update order status.');
    }
  };

  const formatCurrency = (amount, currency = '€') => {
    const num = Number(amount) || 0;
    return `${currency}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDateTime = (isoDate) => {
    if (!isoDate) return '—';
    try {
      return new Date(isoDate).toLocaleString(undefined, {
        timeZone,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return new Date(isoDate).toLocaleDateString();
    }
  };

  const getStatusBadgeStyle = (status) => {
    const s = String(status || '').toLowerCase().replace(/[\s_-]+/g, '');
    if (s === 'delivered') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    if (s === 'processing' || s === 'confirmed') return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    if (s === 'shipped' || s === 'outfordelivery') return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    if (s === 'pending') return 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse';
    if (s === 'cancelled' || s === 'rejected') return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    if (s === 'approved') return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
    return 'bg-[#D4AF37]/20 text-[#F2D675] border-[#D4AF37]/40';
  };

  const pendingOrders = data.orders?.pendingOrdersCount || 0;
  const pendingReturns = data.returns?.pendingReviewCount || 0;
  const hasUrgentAction = pendingOrders > 0 || pendingReturns > 0;

  const totalStatusOrders = Object.values(data.orders?.statusBreakdown || {}).reduce((sum, n) => sum + (Number(n) || 0), 0) || data.orders?.totalOrders || 1;
  const totalSubcategoryProducts = (data.catalog?.productsBySubcategory || []).reduce((sum, s) => sum + (Number(s.productCount) || 0), 0) || data.catalog?.totalProducts || 1;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-[#F3E6D0]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-[#D4AF37]/20 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-cinzel text-2xl sm:text-4xl font-bold uppercase tracking-wider text-[#F3E6D0]">
              {t('admin.dashboard')}
            </h1>
            {data.isFallback ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[11px] font-mono text-amber-300 font-bold uppercase tracking-wider" title="Real-time operational metrics aggregated from database">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Live Database Telemetry
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Backend Telemetry
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#D8BE99] font-medium mt-1">
            Real-time backend financial reports, inventory vaults, returns pipeline & patron intelligence.
          </p>
          {data.generatedAtUtc && (
            <p className="text-[11px] text-[#A69076] font-mono mt-1 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-[#D4AF37]" />
              Generated: {formatDateTime(data.generatedAtUtc)} ({data.timeZoneId || timeZone})
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* Timezone Selector */}
          <div className="flex items-center gap-1.5 bg-black/60 border border-[#D4AF37]/40 rounded-full px-3 py-1.5 sm:py-2 text-xs text-[#F3E6D0]">
            <Globe className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <select
              value={timeZone}
              onChange={(e) => handleTimeZoneChange(e.target.value)}
              className="bg-transparent border-none text-xs font-mono font-medium text-[#F2D675] focus:outline-none cursor-pointer pr-1"
              title="Operating Timezone for Analytics Aggregation"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.id} value={tz.id} className="bg-[#14120F] text-[#F3E6D0]">
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sync Button */}
          <button
            onClick={() => fetchOverview(timeZone)}
            disabled={refreshing}
            className="px-4 py-2 sm:py-2.5 rounded-full border border-[#D4AF37]/40 bg-black/60 hover:bg-[#21130D] text-xs sm:text-sm font-cinzel font-bold text-[#F3E6D0] hover:text-[#F2D675] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            title="Force refresh live backend KPIs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
          </button>

          {/* New Product */}
          <Link
            to="/admin/products/new"
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-white hover:text-black border border-[#F2D675]/50 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition-all duration-300"
          >
            <Package className="w-3.5 h-3.5" />
            <span>+ Product</span>
          </Link>

          {/* Promotions & Bundles */}
          <Link
            to="/admin/promotions"
            className="px-4 py-2 sm:py-2.5 rounded-full border border-[#D4AF37]/40 bg-black/50 text-xs font-cinzel font-bold text-[#F2D675] hover:border-[#D4AF37] hover:bg-[#21130D] text-center transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Promotions</span>
          </Link>

          {/* Coupons */}
          <Link
            to="/admin/discounts"
            className="px-4 py-2 sm:py-2.5 rounded-full border border-[#D4AF37]/40 bg-black/50 text-xs font-cinzel font-bold text-[#F2D675] hover:border-[#D4AF37] hover:bg-[#21130D] text-center transition-all cursor-pointer shadow-sm"
          >
            Coupons
          </Link>
        </div>
      </div>

      {/* Dashboard View Mode Selector: All-In-One | Sales Reports | Operations */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#D4AF37]/20 pb-4">
        <div className="flex items-center p-1 rounded-2xl bg-black/60 border border-[#D4AF37]/30 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black shadow-lg font-extrabold'
                : 'text-[#D8BE99] hover:text-[#F2D675]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complete Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black shadow-lg font-extrabold'
                : 'text-[#D8BE99] hover:text-[#F2D675]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Sales & Financial Reports</span>
          </button>
          <button
            onClick={() => setActiveTab('operations')}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'operations'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black shadow-lg font-extrabold'
                : 'text-[#D8BE99] hover:text-[#F2D675]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Operations & Pipeline</span>
          </button>
        </div>

        <span className="text-xs font-mono text-[#A69076]">
          {activeTab === 'all' && '✨ Unified operational telemetry & sales reports on one page'}
          {activeTab === 'reports' && '📈 Multi-dimensional sales reports: Overview, Products, Categories, Countries, Export'}
          {activeTab === 'operations' && '📦 Operational pipeline, inventory vaults, returns & recent live orders'}
        </span>
      </div>

      {/* Fetch Error Notice */}
      {fetchError && !data?.financials && (
        <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 text-rose-300 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Backend Sync Notice: {fetchError}</span>
          </div>
          <button
            onClick={() => fetchOverview(timeZone)}
            className="underline font-bold text-rose-200 hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Urgent Action Alert Banner */}
      {hasUrgentAction && (
        <ScrollReveal direction="down">
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#1C160C] to-amber-950/30 border border-amber-500/50 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="font-cinzel text-sm sm:text-base font-bold text-amber-300 tracking-wide">
                  Concierge Operational Action Required
                </h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#E5D2B8] mt-0.5">
                  {pendingOrders > 0 && (
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <strong className="text-[#F2D675] font-mono">{pendingOrders}</strong> order{pendingOrders !== 1 ? 's' : ''} awaiting fulfillment
                    </span>
                  )}
                  {pendingReturns > 0 && (
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      <strong className="text-rose-300 font-mono">{pendingReturns}</strong> return request{pendingReturns !== 1 ? 's' : ''} awaiting review
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 self-end md:self-auto">
              {pendingOrders > 0 && (
                <Link
                  to="/admin/orders"
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 text-xs font-cinzel font-bold tracking-wider uppercase transition-colors"
                >
                  Inspect Orders →
                </Link>
              )}
              {pendingReturns > 0 && (
                <Link
                  to="/admin/orders"
                  className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-200 text-xs font-cinzel font-bold tracking-wider uppercase transition-colors"
                >
                  Review Returns →
                </Link>
              )}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Primary KPI Cards (5 Cards) */}
      <ScrollReveal direction="up">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {/* 1. Today Net Revenue */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-2 shadow-xl backdrop-blur-md hover:border-[#D4AF37] transition-all flex flex-col justify-between">
            <div className="flex justify-between items-center text-[#F2D675]">
              <span className="text-xs uppercase tracking-wider font-cinzel font-bold truncate">
                Today Net Revenue
              </span>
              <div className="w-8 h-8 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <p className="font-cinzel text-xl sm:text-2xl lg:text-3xl font-bold text-[#F3E6D0]">
                {formatCurrency(data.financials?.todayNetRevenue)}
              </p>
              <div className="text-[11px] text-[#A69076] font-mono mt-1 space-y-0.5">
                <div className="flex justify-between">
                  <span>Gross:</span>
                  <span className="text-[#D8BE99]">{formatCurrency(data.financials?.todayGrossSales)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Refunds:</span>
                  <span className="text-rose-400">-{formatCurrency(data.financials?.todayRefunds)}</span>
                </div>
              </div>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono font-bold pt-1 border-t border-white/5 block">
              {data.orders?.todayOrders || 0} orders today
            </span>
          </div>

          {/* 2. Month Net Revenue */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-2 shadow-xl backdrop-blur-md hover:border-[#D4AF37] transition-all flex flex-col justify-between">
            <div className="flex justify-between items-center text-[#F2D675]">
              <span className="text-xs uppercase tracking-wider font-cinzel font-bold truncate">
                Month Net Revenue
              </span>
              <div className="w-8 h-8 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-[#F2D675]" />
              </div>
            </div>
            <div>
              <p className="font-cinzel text-xl sm:text-2xl lg:text-3xl font-bold text-[#F3E6D0]">
                {formatCurrency(data.financials?.thisMonthNetRevenue)}
              </p>
              <div className="text-[11px] text-[#A69076] font-mono mt-1 space-y-0.5">
                <div className="flex justify-between">
                  <span>Gross:</span>
                  <span className="text-[#D8BE99]">{formatCurrency(data.financials?.thisMonthGrossSales)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Refunds:</span>
                  <span className="text-rose-400">-{formatCurrency(data.financials?.thisMonthRefunds)}</span>
                </div>
              </div>
            </div>
            <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
              {data.financials?.growthPercentage !== null && data.financials?.growthPercentage !== undefined ? (
                <span className={`font-bold flex items-center gap-1 ${data.financials.growthPercentage >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {data.financials.growthPercentage >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {data.financials.growthPercentage >= 0 ? '+' : ''}{Number(data.financials.growthPercentage).toFixed(1)}% MoM
                </span>
              ) : (
                <span className="text-[#A69076]">Baseline Month</span>
              )}
              <span className="text-[#D8BE99]">{data.orders?.thisMonthOrders || 0} orders</span>
            </div>
          </div>

          {/* 3. Orders Pipeline */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-2 shadow-xl backdrop-blur-md hover:border-[#D4AF37] transition-all flex flex-col justify-between">
            <div className="flex justify-between items-center text-[#F2D675]">
              <span className="text-xs uppercase tracking-wider font-cinzel font-bold truncate">
                {t('admin.totalOrders')}
              </span>
              <div className="w-8 h-8 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4 text-[#F2D675]" />
              </div>
            </div>
            <div>
              <p className="font-cinzel text-xl sm:text-2xl lg:text-3xl font-bold text-[#F3E6D0]">
                <AnimatedCounter target={data.orders?.totalOrders || 0} />
              </p>
              <div className="text-[11px] text-[#A69076] font-mono mt-1 space-y-0.5">
                <div className="flex justify-between">
                  <span>This Month:</span>
                  <span className="text-[#D8BE99]">{data.orders?.thisMonthOrders || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending:</span>
                  <span className={pendingOrders > 0 ? 'text-amber-400 font-bold' : 'text-[#D8BE99]'}>
                    {pendingOrders}
                  </span>
                </div>
              </div>
            </div>
            <Link to="/admin/orders" className="text-[11px] text-[#F2D675] hover:underline font-mono font-bold pt-1 border-t border-white/5 flex items-center justify-between">
              <span>Inspect Queue</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* 4. Patron Base */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-2 shadow-xl backdrop-blur-md hover:border-[#D4AF37] transition-all flex flex-col justify-between">
            <div className="flex justify-between items-center text-[#F2D675]">
              <span className="text-xs uppercase tracking-wider font-cinzel font-bold truncate">
                {t('admin.totalCustomers')}
              </span>
              <div className="w-8 h-8 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-[#F2D675]" />
              </div>
            </div>
            <div>
              <p className="font-cinzel text-xl sm:text-2xl lg:text-3xl font-bold text-[#F3E6D0]">
                <AnimatedCounter target={data.customers?.totalCustomers || 0} />
              </p>
              <div className="text-[11px] text-[#A69076] font-mono mt-1 space-y-0.5">
                <div className="flex justify-between">
                  <span>New This Month:</span>
                  <span className="text-emerald-400 font-bold">+{data.customers?.newCustomersThisMonth || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Patron Status:</span>
                  <span className="text-[#D8BE99]">Active VIPs</span>
                </div>
              </div>
            </div>
            <Link to="/admin/users" className="text-[11px] text-[#F2D675] hover:underline font-mono font-bold pt-1 border-t border-white/5 flex items-center justify-between">
              <span>View Patrons</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* 5. Catalog Formulations */}
          <div className="col-span-2 md:col-span-1 p-4 sm:p-5 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-2 shadow-xl backdrop-blur-md hover:border-[#D4AF37] transition-all flex flex-col justify-between">
            <div className="flex justify-between items-center text-[#F2D675]">
              <span className="text-xs uppercase tracking-wider font-cinzel font-bold truncate">
                Catalog Formulations
              </span>
              <div className="w-8 h-8 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-[#F2D675]" />
              </div>
            </div>
            <div>
              <p className="font-cinzel text-xl sm:text-2xl lg:text-3xl font-bold text-[#F3E6D0]">
                <AnimatedCounter target={data.catalog?.totalProducts || 0} />
              </p>
              <div className="text-[11px] text-[#A69076] font-mono mt-1 space-y-0.5">
                <div className="flex justify-between">
                  <span>Active in Store:</span>
                  <span className="text-emerald-400 font-bold">{data.catalog?.activeProducts || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vault Reserve:</span>
                  <span className="text-amber-400">{data.catalog?.inactiveProducts || 0}</span>
                </div>
              </div>
            </div>
            <Link to="/admin/inventory" className="text-[11px] text-[#F2D675] hover:underline font-mono font-bold pt-1 border-t border-white/5 flex items-center justify-between">
              <span>Manage Vault</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </ScrollReveal>

      {/* Sales Reports & Performance Analytics (Integrated on Dashboard) */}
      {(activeTab === 'all' || activeTab === 'reports') && (
        <ScrollReveal direction="up">
          <div className="p-5 sm:p-7 rounded-3xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 shadow-2xl backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4AF37]/20 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F2D675]">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-cinzel text-lg sm:text-xl font-bold uppercase text-[#F3E6D0] tracking-wider">
                    Sales Reports & Performance Analytics
                  </h2>
                  <p className="text-xs text-[#D8BE99]">
                    Multi-dimensional breakdowns: Overview, Products, Categories, Countries & Direct Exports
                  </p>
                </div>
              </div>
              {activeTab === 'all' && (
                <button
                  onClick={() => setActiveTab('reports')}
                  className="px-4 py-1.5 rounded-full border border-[#D4AF37]/40 text-xs font-cinzel font-bold text-[#F2D675] hover:bg-[#D4AF37]/10 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-all"
                >
                  <span>Focus Reports View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <AdminReports embedded={true} />
          </div>
        </ScrollReveal>
      )}

      {/* Operational Sections: Pipeline, Inventory, Returns, Recent Orders */}
      {(activeTab === 'all' || activeTab === 'operations') && (
        <>
          {/* Returns & Refund Disbursements Telemetry */}
          <ScrollReveal direction="up">
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-4 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4AF37]/20 pb-3 gap-2">
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="font-cinzel text-sm sm:text-base font-bold uppercase text-[#F2D675] tracking-wider">
                Returns & Refund Telemetry
              </h3>
            </div>
            <span className="text-xs text-[#D8BE99] font-mono">
              Total Processed: {data.returns?.totalReturnRequests || 0} Requests
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 pt-1">
            {/* Pending Review */}
            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-black/40 space-y-1">
              <span className="text-[11px] font-cinzel uppercase text-amber-400 font-bold block">
                Pending Review
              </span>
              <p className="font-cinzel text-xl sm:text-2xl font-bold text-amber-300">
                {data.returns?.pendingReviewCount || 0}
              </p>
              <span className="text-[10px] text-[#A69076] font-mono block">Awaiting Concierge</span>
            </div>

            {/* Approved */}
            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-black/40 space-y-1">
              <span className="text-[11px] font-cinzel uppercase text-emerald-400 font-bold block">
                Approved
              </span>
              <p className="font-cinzel text-xl sm:text-2xl font-bold text-emerald-300">
                {data.returns?.approvedCount || 0}
              </p>
              <span className="text-[10px] text-[#A69076] font-mono block">Settled / Authorized</span>
            </div>

            {/* Rejected */}
            <div className="p-3.5 rounded-xl border border-zinc-500/30 bg-black/40 space-y-1">
              <span className="text-[11px] font-cinzel uppercase text-zinc-400 font-bold block">
                Rejected
              </span>
              <p className="font-cinzel text-xl sm:text-2xl font-bold text-zinc-300">
                {data.returns?.rejectedCount || 0}
              </p>
              <span className="text-[10px] text-[#A69076] font-mono block">Ineligible items</span>
            </div>

            {/* Total Refunded */}
            <div className="p-3.5 rounded-xl border border-[#D4AF37]/30 bg-black/40 space-y-1">
              <span className="text-[11px] font-cinzel uppercase text-[#F2D675] font-bold block">
                Total Refunded
              </span>
              <p className="font-cinzel text-xl sm:text-2xl font-bold text-[#F3E6D0]">
                {formatCurrency(data.returns?.totalRefundedAmount)}
              </p>
              <span className="text-[10px] text-[#A69076] font-mono block">Lifetime Disbursements</span>
            </div>

            {/* Gateway Refunds */}
            <div className="p-3.5 rounded-xl border border-[#D4AF37]/30 bg-black/40 space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-cinzel uppercase text-[#D8BE99] font-bold">
                <CreditCard className="w-3 h-3 text-[#D4AF37]" />
                <span>Gateway Total</span>
              </div>
              <p className="font-cinzel text-lg sm:text-xl font-bold text-[#F3E6D0]">
                {formatCurrency(data.returns?.gatewayRefundsTotal)}
              </p>
              <span className="text-[10px] text-[#A69076] font-mono block">Stripe / Card reversals</span>
            </div>

            {/* Bank Transfer Refunds */}
            <div className="p-3.5 rounded-xl border border-[#D4AF37]/30 bg-black/40 space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-cinzel uppercase text-[#D8BE99] font-bold">
                <Building2 className="w-3 h-3 text-[#D4AF37]" />
                <span>Bank Transfers</span>
              </div>
              <p className="font-cinzel text-lg sm:text-xl font-bold text-[#F3E6D0]">
                {formatCurrency(data.returns?.bankTransferRefundsTotal)}
              </p>
              <span className="text-[10px] text-[#A69076] font-mono block">Direct wire settlements</span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Order Status Pipeline & Catalog by Subcategory (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Order Status Pipeline (7 cols) */}
        <ScrollReveal direction="left" className="lg:col-span-7">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-4 shadow-2xl backdrop-blur-md h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
                <h3 className="font-cinzel text-sm sm:text-base font-bold uppercase text-[#F2D675] tracking-wider">
                  Order Status Pipeline
                </h3>
                <Link to="/admin/orders" className="text-xs text-[#D8BE99] hover:text-[#F2D675] font-mono font-bold flex items-center gap-1">
                  <span>Manage All</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3 pt-4">
                {Object.keys(data.orders?.statusBreakdown || {}).length === 0 ? (
                  <p className="text-xs text-[#A69076] font-mono py-6 text-center">
                    No orders recorded yet. As orders are placed, the pipeline distribution displays here.
                  </p>
                ) : (
                  Object.entries(data.orders?.statusBreakdown || {}).map(([statusKey, count]) => {
                    const countNum = Number(count) || 0;
                    const percent = Math.min(100, Math.round((countNum / totalStatusOrders) * 100));
                    return (
                      <div key={statusKey} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs sm:text-sm">
                          <span className="font-mono text-[#F3E6D0] font-medium flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-md border ${getStatusBadgeStyle(statusKey)}`}>
                              {statusKey}
                            </span>
                          </span>
                          <span className="font-mono text-[#F2D675] font-bold">
                            {countNum} <span className="text-[#A69076] text-xs font-normal">({percent}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-[#D4AF37]/20">
                          <div
                            className="h-full bg-gradient-to-r from-[#8C6239] via-[#D4AF37] to-[#F2D675] transition-all duration-700"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#A69076] font-mono">
              <span>Total Pipeline: {data.orders?.totalOrders || 0} orders</span>
              <span>Pending Action: {data.orders?.pendingOrdersCount || 0}</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Catalog by Subcategory (5 cols) */}
        <ScrollReveal direction="right" className="lg:col-span-5">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-4 shadow-2xl backdrop-blur-md h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
                <h3 className="font-cinzel text-sm sm:text-base font-bold uppercase text-[#F2D675] tracking-wider">
                  Catalog Distribution
                </h3>
                <Link to="/admin/inventory" className="text-xs text-[#D8BE99] hover:text-[#F2D675] font-mono font-bold flex items-center gap-1">
                  <span>Inventory</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3 pt-4">
                {(data.catalog?.productsBySubcategory || []).length === 0 ? (
                  <p className="text-xs text-[#A69076] font-mono py-6 text-center">
                    Subcategory breakdown will appear once products are classified into subcategories.
                  </p>
                ) : (
                  (data.catalog?.productsBySubcategory || []).map((sub) => {
                    const count = Number(sub.productCount) || 0;
                    const pct = Math.min(100, Math.round((count / totalSubcategoryProducts) * 100));
                    return (
                      <div key={sub.subcategoryId || sub.subcategoryName} className="space-y-1">
                        <div className="flex justify-between items-center text-xs sm:text-sm">
                          <span className="text-[#F3E6D0] font-medium truncate pr-2">
                            {sub.subcategoryName}{' '}
                            <span className="text-[11px] text-[#A69076]">({sub.categoryName})</span>
                          </span>
                          <span className="font-mono text-[#F2D675] font-bold shrink-0">
                            {count} <span className="text-[#A69076] text-xs font-normal">({pct}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-[#D4AF37]/20">
                          <div
                            className="h-full bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#F2D675] transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#A69076] font-mono">
              <span>Active: {data.catalog?.activeProducts || 0}</span>
              <span>Inactive: {data.catalog?.inactiveProducts || 0}</span>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Top Selling Products & VIP Patrons Leaderboard (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Top Selling Products (7 cols) */}
        <ScrollReveal direction="up" className="lg:col-span-7">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-4 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-cinzel text-sm sm:text-base font-bold uppercase text-[#F2D675] tracking-wider">
                  Top Selling Creations
                </h3>
              </div>
              <span className="text-xs text-[#D8BE99] font-mono">
                {data.topSellingProducts?.length || 0} Items Ranked
              </span>
            </div>

            {(!data.topSellingProducts || data.topSellingProducts.length === 0) ? (
              <div className="py-8 text-center text-xs text-[#A69076] font-mono">
                No product sales recorded in current period.
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {data.topSellingProducts.map((prod, idx) => (
                  <div
                    key={prod.productId || idx}
                    className="p-3 sm:p-3.5 rounded-xl border border-[#D4AF37]/20 bg-black/40 hover:border-[#D4AF37]/50 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={cleanImageUrl(prod.imageUrl)}
                          alt={prod.productName}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/products/luxury_designs/07_arabian_gold.webp';
                          }}
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg object-cover border border-[#D4AF37]/30 bg-black/80"
                        />
                        <span className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full text-[10px] font-cinzel font-bold flex items-center justify-center border ${
                          idx === 0
                            ? 'bg-[#D4AF37] text-black border-[#F2D675]'
                            : idx === 1
                            ? 'bg-zinc-300 text-black border-white'
                            : idx === 2
                            ? 'bg-amber-700 text-white border-amber-500'
                            : 'bg-black/80 text-[#D8BE99] border-[#D4AF37]/40'
                        }`}>
                          #{idx + 1}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-cinzel text-xs sm:text-sm font-bold text-[#F3E6D0] truncate">
                          {prod.productName}
                        </p>
                        <span className="text-[11px] text-[#A69076] font-mono">
                          ID: #{prod.productId}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-cinzel font-bold text-xs sm:text-sm text-[#F2D675]">
                        {formatCurrency(prod.totalSales)}
                      </p>
                      <span className="text-[11px] text-emerald-400 font-mono font-medium block">
                        {prod.unitsSold} units sold
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* VIP High-Spender Patrons (5 cols) */}
        <ScrollReveal direction="up" className="lg:col-span-5">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-4 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-cinzel text-sm sm:text-base font-bold uppercase text-[#F2D675] tracking-wider">
                  VIP Patrons Leaderboard
                </h3>
              </div>
              <Link to="/admin/users" className="text-xs text-[#D8BE99] hover:text-[#F2D675] font-mono font-bold flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {(!data.topCustomers || data.topCustomers.length === 0) ? (
              <div className="py-8 text-center text-xs text-[#A69076] font-mono">
                No patron order records available in current timeframe.
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {data.topCustomers.map((cust, idx) => (
                  <div
                    key={cust.userId || idx}
                    className="p-3 sm:p-3.5 rounded-xl border border-[#D4AF37]/20 bg-black/40 hover:border-[#D4AF37]/50 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-cinzel text-xs font-bold shrink-0 border ${
                        idx === 0
                          ? 'bg-gradient-to-br from-[#D4AF37] to-[#8C6239] text-black border-[#F2D675]'
                          : idx === 1
                          ? 'bg-zinc-400/20 text-zinc-200 border-zinc-400/50'
                          : idx === 2
                          ? 'bg-amber-900/30 text-amber-300 border-amber-700/50'
                          : 'bg-black/60 text-[#A69076] border-white/10'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-cinzel text-xs sm:text-sm font-bold text-[#F3E6D0] truncate">
                          {cust.customerName || 'Valued Patron'}
                        </p>
                        <p className="text-[11px] text-[#A69076] font-mono truncate">
                          {cust.email || 'No email registered'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-cinzel font-bold text-xs sm:text-sm text-[#F2D675]">
                        {formatCurrency(cust.totalSpent)}
                      </p>
                      <span className="text-[11px] text-[#D8BE99] font-mono block">
                        {cust.orderCount} orders
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>

      {/* Live Recent Orders Feed */}
      <ScrollReveal direction="up">
        <div className="p-5 sm:p-7 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-5 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4AF37]/20 pb-3.5 gap-2">
            <div>
              <h3 className="font-cinzel text-sm sm:text-base lg:text-lg font-bold uppercase text-[#F2D675] tracking-wider">
                Recent Orders Feed
              </h3>
              <p className="text-xs text-[#A69076] font-mono mt-0.5">
                Real-time transactions streaming from backend ({data.recentOrders?.length || 0} orders listed)
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs sm:text-sm text-[#D8BE99] hover:text-[#F2D675] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Manage All Orders in Hub</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {(!data.recentOrders || data.recentOrders.length === 0) ? (
            <div className="py-12 text-center text-xs text-[#A69076] font-mono">
              No recent orders found in current operational timeframe.
            </div>
          ) : (
            <>
              {/* Mobile View: High-End Cards */}
              <div className="block md:hidden space-y-3">
                {data.recentOrders.map((order) => (
                  <div
                    key={order.orderId || order.orderNumber}
                    className="p-4 rounded-xl border border-[#D4AF37]/25 bg-black/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-cinzel font-bold text-[#F2D675] text-sm">
                        {order.orderNumber || `#${order.orderId}`}
                      </span>
                      <span className="font-mono font-bold text-[#F2D675] text-base">
                        {formatCurrency(order.total, order.currency === 'USD' ? '$' : (order.currency || '€'))}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#D8BE99]">
                      <span className="font-medium text-[#F3E6D0]">{order.customerName || 'Valued Patron'}</span>
                      <span className="font-mono">{formatDateTime(order.createdAt)}</span>
                    </div>

                    <div className="pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
                      <span className={`px-3 py-1 text-xs font-mono uppercase rounded-full border font-bold ${getStatusBadgeStyle(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>

                      <select
                        value={order.orderStatus || 'Pending'}
                        onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                        className="bg-black/80 border border-[#D4AF37]/40 rounded-lg px-3 py-1.5 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer font-medium"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="OutForDelivery">Out For Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View: Full Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm font-sans">
                  <thead>
                    <tr className="border-b border-[#D4AF37]/25 text-[#F2D675] uppercase font-cinzel font-bold text-xs">
                      <th className="py-3.5 px-4">Order ID</th>
                      <th className="py-3.5 px-4">Patron</th>
                      <th className="py-3.5 px-4">Date & Time ({timeZone})</th>
                      <th className="py-3.5 px-4">Total</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4AF37]/15 text-[#F3E6D0]">
                    {data.recentOrders.map((order) => (
                      <tr key={order.orderId || order.orderNumber} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4 font-cinzel font-bold text-[#F2D675]">
                          {order.orderNumber || `#${order.orderId}`}
                        </td>
                        <td className="py-4 px-4 font-medium">
                          {order.customerName || 'Valued Patron'}
                        </td>
                        <td className="py-4 px-4 font-mono text-[#D8BE99] text-xs">
                          {formatDateTime(order.createdAt)}
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-[#F2D675]">
                          {formatCurrency(order.total, order.currency === 'USD' ? '$' : (order.currency || '€'))}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 text-xs font-mono uppercase rounded-full border font-bold ${getStatusBadgeStyle(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <select
                            value={order.orderStatus || 'Pending'}
                            onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                            className="bg-black/70 border border-[#D4AF37]/35 rounded-lg px-3 py-1.5 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer font-medium"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="OutForDelivery">Out For Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </ScrollReveal>
        </>
      )}
    </div>
  );
}
