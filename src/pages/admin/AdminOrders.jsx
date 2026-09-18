import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import {
  orderService,
  ADMIN_ORDER_STATUSES,
  ADMIN_PAYMENT_STATUSES
} from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import {
  Search,
  RefreshCw,
  Phone,
  Eye,
  Truck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  CreditCard,
  Package,
  FileText,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  RotateCcw,
  Filter,
  Calendar,
  ArrowUpDown,
  User,
  MapPin,
  ExternalLink,
  ShieldCheck,
  DollarSign,
  X,
  Layers,
  AlertCircle,
  Tag
} from 'lucide-react';

export default function AdminOrders() {
  const { t } = useTranslation();
  const { success, error, info } = useToast();

  // State: Filter parameters
  const [search, setSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filterCompensationOnly, setFilterCompensationOnly] = useState(false);

  // State: Data and loading
  const [ordersData, setOrdersData] = useState({
    items: [],
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false
  });
  const [loading, setLoading] = useState(false);

  // State: Modals & Drawers
  const [detailsModalOrder, setDetailsModalOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsActiveTab, setDetailsActiveTab] = useState('items'); // 'items' | 'shipping' | 'payments' | 'history'

  const [trackingModalData, setTrackingModalData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const [statusModalOrder, setStatusModalOrder] = useState(null);
  const [targetStatus, setTargetStatus] = useState('Pending');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingOrder, setCancellingOrder] = useState(false);

  const [retryingOrderId, setRetryingOrderId] = useState(null);
  const [copiedText, setCopiedText] = useState(null);

  // Copy helper
  const handleCopy = (text, label = 'Copied') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    info(`${label} copied to clipboard.`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Fetch orders from API / Service
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        page,
        pageSize,
        search: search.trim() || undefined,
        orderStatus: orderStatusFilter !== 'ALL' ? orderStatusFilter : undefined,
        paymentStatus: paymentStatusFilter !== 'ALL' ? paymentStatusFilter : undefined,
        from: fromDate ? new Date(fromDate).toISOString() : undefined,
        to: toDate ? new Date(toDate).toISOString() : undefined,
        sortBy,
        sortDirection
      };

      const result = await orderService.getAdminOrders(filters);
      if (result && Array.isArray(result.items)) {
        setOrdersData(result);
      } else if (Array.isArray(result)) {
        setOrdersData({
          items: result,
          page: 1,
          pageSize: result.length,
          totalCount: result.length,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false
        });
      }
    } catch (err) {
      console.warn('Fetch admin orders error:', err.message);
      error(err.message || 'Failed to fetch orders from server.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, orderStatusFilter, paymentStatusFilter, fromDate, toDate, sortBy, sortDirection, error]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Real-time reactive listener: when an order is placed on any customer account or tab
  useEffect(() => {
    const handleOrderEvent = () => {
      fetchOrders();
    };
    window.addEventListener('arabian_sheikh_order_created', handleOrderEvent);
    window.addEventListener('arabian_sheikh_cloud_updated', handleOrderEvent);
    return () => {
      window.removeEventListener('arabian_sheikh_order_created', handleOrderEvent);
      window.removeEventListener('arabian_sheikh_cloud_updated', handleOrderEvent);
    };
  }, [fetchOrders]);

  // Open Details Modal and fetch deep purchase cycle snapshot
  const handleOpenDetails = async (order) => {
    setDetailsModalOrder(order);
    setDetailsActiveTab('items');
    setDetailsLoading(true);
    try {
      const detailed = await orderService.getAdminOrderDetails(order.id);
      if (detailed) {
        setDetailsModalOrder(detailed);
      }
    } catch (err) {
      console.warn('Failed to load order deep details:', err.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Open Logistics Tracking Modal
  const handleOpenTracking = async (order) => {
    setTrackingModalData({
      orderId: order.id,
      orderNumber: order.orderNumber || order.id,
      carrier: order.shippingSnapshot?.carrier || 'DHL Express',
      trackingNumber: order.trackingCode || order.dhlTrackingNumber || order.shippingSnapshot?.trackingNumber || 'PENDING',
      status: order.orderStatus || order.status || 'InTransit',
      events: []
    });
    setTrackingLoading(true);
    try {
      const tracking = await orderService.getOrderTracking(order.id);
      if (tracking) {
        setTrackingModalData(prev => ({
          ...prev,
          ...tracking,
          orderNumber: order.orderNumber || order.id
        }));
      }
    } catch (err) {
      console.warn('Tracking fetch error:', err.message);
    } finally {
      setTrackingLoading(false);
    }
  };

  // Open Status Update Modal
  const handleOpenStatusModal = (order) => {
    setStatusModalOrder(order);
    setTargetStatus(order.orderStatus || order.status || 'Pending');
    setStatusNote('');
  };

  // Submit Status Update
  const handleSubmitStatusUpdate = async (e) => {
    e.preventDefault();
    if (!statusModalOrder) return;
    setUpdatingStatus(true);
    try {
      await orderService.updateOrderStatus(statusModalOrder.id, targetStatus, statusNote);
      success(`Order #${statusModalOrder.orderNumber || statusModalOrder.id} status transitioned to ${targetStatus}.`);
      setStatusModalOrder(null);
      fetchOrders();
      if (detailsModalOrder && detailsModalOrder.id === statusModalOrder.id) {
        handleOpenDetails(statusModalOrder);
      }
    } catch (err) {
      error(err.message || 'Failed to update order status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Open Cancel Modal
  const handleOpenCancelModal = (order) => {
    setCancelModalOrder(order);
    setCancelReason('');
  };

  // Submit Order Cancellation
  const handleSubmitCancelOrder = async (e) => {
    e.preventDefault();
    if (!cancelModalOrder) return;
    setCancellingOrder(true);
    try {
      await orderService.cancelOrder(cancelModalOrder.id, cancelReason);
      success(`Order #${cancelModalOrder.orderNumber || cancelModalOrder.id} has been cancelled.`);
      setCancelModalOrder(null);
      fetchOrders();
      if (detailsModalOrder && detailsModalOrder.id === cancelModalOrder.id) {
        handleOpenDetails(cancelModalOrder);
      }
    } catch (err) {
      error(err.message || 'Failed to cancel order.');
    } finally {
      setCancellingOrder(false);
    }
  };

  // Retry Compensation Failure Workflow
  const handleRetryCompensation = async (orderId) => {
    setRetryingOrderId(orderId);
    try {
      await orderService.retryCompensation(orderId);
      success(`Compensation workflow for order #${orderId} successfully triggered.`);
      fetchOrders();
      if (detailsModalOrder && detailsModalOrder.id === orderId) {
        const refreshed = await orderService.getAdminOrderDetails(orderId);
        if (refreshed) setDetailsModalOrder(refreshed);
      }
    } catch (err) {
      error(err.message || 'Failed to retry compensation workflow.');
    } finally {
      setRetryingOrderId(null);
    }
  };

  // Status Badge Styling
  const getOrderStatusBadge = (status = '') => {
    const s = String(status).toLowerCase();
    if (s.includes('deliver')) {
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
    }
    if (s.includes('ship') || s.includes('transit') || s.includes('outfor')) {
      return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40';
    }
    if (s.includes('process') || s.includes('confirm')) {
      return 'bg-blue-500/15 text-blue-300 border-blue-500/40';
    }
    if (s.includes('cancel')) {
      return 'bg-rose-500/15 text-rose-300 border-rose-500/40';
    }
    return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
  };

  const getPaymentStatusBadge = (status = '') => {
    const s = String(status).toLowerCase();
    if (s.includes('paid')) {
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
    }
    if (s.includes('refund')) {
      return 'bg-purple-500/15 text-purple-300 border-purple-500/40';
    }
    if (s.includes('fail') || s.includes('cancel')) {
      return 'bg-rose-500/15 text-rose-300 border-rose-500/40';
    }
    return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
  };

  // Filtered displayed items (handling compensation only client toggle if active)
  const displayedItems = useMemo(() => {
    let items = ordersData.items || [];
    if (filterCompensationOnly) {
      items = items.filter(o => o.compensationFailure === true || o.compensation?.hasFailure === true);
    }
    return items;
  }, [ordersData.items, filterCompensationOnly]);

  // Quick KPI counts
  const kpis = useMemo(() => {
    const all = ordersData.items || [];
    const pendingCount = all.filter(o => ['Pending', 'Processing'].includes(o.orderStatus || o.status)).length;
    const shippedCount = all.filter(o => ['Shipped', 'OutForDelivery'].includes(o.orderStatus || o.status)).length;
    const deliveredCount = all.filter(o => ['Delivered'].includes(o.orderStatus || o.status)).length;
    const cancelledCount = all.filter(o => ['Cancelled', 'CancelPending'].includes(o.orderStatus || o.status)).length;
    const compensationAlerts = all.filter(o => o.compensationFailure === true || o.compensation?.hasFailure === true).length;

    return {
      total: ordersData.totalCount || all.length,
      pending: pendingCount,
      shipped: shippedCount,
      delivered: deliveredCount,
      cancelled: cancelledCount,
      compensationAlerts
    };
  }, [ordersData]);

  return (
    <div className="space-y-6 animate-fade-in text-[#F3E6D0]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#D4AF37]/20 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-cinzel text-2xl sm:text-4xl font-bold uppercase tracking-wider text-[#F3E6D0]">
              {t('admin.orders') || 'Orders & Purchase Cycle'}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F2D675]">
              Full Lifecycle
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#D8BE99] font-medium mt-1">
            End-to-end purchase cycle command: fulfillment status, carrier tracking, audit logs, and compensation resolution.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="px-4 py-2.5 rounded-full bg-black/60 hover:bg-[#21130D] border border-[#D4AF37]/40 text-xs font-cinzel font-bold text-[#F3E6D0] hover:text-[#F2D675] flex items-center gap-2 transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${loading ? 'animate-spin' : ''}`} />
            <span>Synchronize</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/25 rounded-xl p-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-[#D8BE99] text-xs font-medium">
            <span>Total Orders</span>
            <Package className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="font-cinzel text-xl sm:text-2xl font-bold text-[#F2D675] mt-1">
            {kpis.total}
          </p>
        </div>

        <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/25 rounded-xl p-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-[#D8BE99] text-xs font-medium">
            <span>Pending / Prep</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="font-cinzel text-xl sm:text-2xl font-bold text-amber-300 mt-1">
            {kpis.pending}
          </p>
        </div>

        <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/25 rounded-xl p-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-[#D8BE99] text-xs font-medium">
            <span>In Transit</span>
            <Truck className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="font-cinzel text-xl sm:text-2xl font-bold text-cyan-300 mt-1">
            {kpis.shipped}
          </p>
        </div>

        <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/25 rounded-xl p-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-[#D8BE99] text-xs font-medium">
            <span>Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-cinzel text-xl sm:text-2xl font-bold text-emerald-300 mt-1">
            {kpis.delivered}
          </p>
        </div>

        <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/25 rounded-xl p-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-[#D8BE99] text-xs font-medium">
            <span>Cancelled</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="font-cinzel text-xl sm:text-2xl font-bold text-rose-300 mt-1">
            {kpis.cancelled}
          </p>
        </div>

        <button
          onClick={() => setFilterCompensationOnly(!filterCompensationOnly)}
          className={`p-3.5 rounded-xl border text-left transition-all backdrop-blur-md cursor-pointer ${
            filterCompensationOnly
              ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-950/50'
              : kpis.compensationAlerts > 0
              ? 'bg-[#0B0A08]/90 border-rose-500/40 hover:border-rose-400'
              : 'bg-[#0B0A08]/90 border-[#D4AF37]/25 hover:border-[#D4AF37]/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium">
            <span className={kpis.compensationAlerts > 0 ? 'text-rose-400 font-bold' : 'text-[#D8BE99]'}>
              Comp. Alerts
            </span>
            <AlertTriangle className={`w-4 h-4 ${kpis.compensationAlerts > 0 ? 'text-rose-400 animate-pulse' : 'text-neutral-500'}`} />
          </div>
          <p className={`font-cinzel text-xl sm:text-2xl font-bold mt-1 ${kpis.compensationAlerts > 0 ? 'text-rose-400' : 'text-[#F2D675]'}`}>
            {kpis.compensationAlerts}
          </p>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search Order #, Patron, Tracking..."
              className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:outline-none"
            />
            <Search className="w-4 h-4 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Order Status */}
          <div>
            <select
              value={orderStatusFilter}
              onChange={(e) => {
                setOrderStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Fulfillment Statuses</option>
              {ADMIN_ORDER_STATUSES.map(s => (
                <option key={s} value={s}>{s.replace(/([A-Z])/g, ' $1').trim()}</option>
              ))}
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <select
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Payment Statuses</option>
              {ADMIN_PAYMENT_STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Sort By & Direction */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="flex-1 bg-black/60 border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
            >
              <option value="createdAt">Date (Created)</option>
              <option value="total">Order Total</option>
              <option value="orderNumber">Order Number</option>
              <option value="orderStatus">Fulfillment Status</option>
            </select>
            <button
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-[#F2D675] hover:bg-[#21130D] transition-colors cursor-pointer"
              title="Toggle Sort Direction"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Date Filter Ribbon & Quick Resets */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#D4AF37]/15 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#D8BE99] flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" /> Date Range:
            </span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
              className="bg-black/60 border border-[#D4AF37]/30 rounded-lg px-2.5 py-1 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
            />
            <span className="text-[#D8BE99]">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(1); }}
              className="bg-black/60 border border-[#D4AF37]/30 rounded-lg px-2.5 py-1 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            {(search || orderStatusFilter !== 'ALL' || paymentStatusFilter !== 'ALL' || fromDate || toDate || filterCompensationOnly) && (
              <button
                onClick={() => {
                  setSearch('');
                  setOrderStatusFilter('ALL');
                  setPaymentStatusFilter('ALL');
                  setFromDate('');
                  setToDate('');
                  setFilterCompensationOnly(false);
                  setPage(1);
                }}
                className="text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset Filters
              </button>
            )}

            <div className="flex items-center gap-1 text-[#D8BE99]">
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="bg-black/60 border border-[#D4AF37]/30 rounded-lg px-2 py-0.5 text-xs text-[#F3E6D0] focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm font-sans">
            <thead>
              <tr className="border-b border-[#D4AF37]/25 text-[#F2D675] uppercase font-cinzel font-bold text-[11px] sm:text-xs tracking-wider bg-black/40">
                <th className="py-3.5 px-4">Order Ref & Date</th>
                <th className="py-3.5 px-4">Patron & Destination</th>
                <th className="py-3.5 px-4">Flacons / Items</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Fulfillment</th>
                <th className="py-3.5 px-4 text-right">Purchase Cycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/15 text-[#F3E6D0]">
              {loading && displayedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#D8BE99]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#D4AF37] mb-2" />
                    <span>Synchronizing purchase cycle data...</span>
                  </td>
                </tr>
              ) : displayedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#D8BE99]">
                    <Package className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
                    <p className="font-cinzel text-base text-[#F3E6D0]">No Orders Found</p>
                    <p className="text-xs text-[#D8BE99] mt-1">Try refining your search queries or status filters.</p>
                  </td>
                </tr>
              ) : (
                displayedItems.map((order) => {
                  const hasCompensationFailure = order.compensationFailure === true || order.compensation?.hasFailure === true;
                  const customerName = order.customer?.name || order.customerName || 'Valued Patron';
                  const customerEmail = order.customer?.email || order.customerEmail || '—';
                  const customerPhone = order.customer?.phone || order.customerPhone || order.phone || order.shippingAddress?.phone;
                  const orderNum = order.orderNumber || order.id;
                  const orderDate = order.createdAt || order.date;
                  const itemsCount = order.itemsCount || (Array.isArray(order.items) ? order.items.length : 0);
                  const orderTotal = order.totals?.total ?? order.total ?? 0;
                  const currency = order.totals?.currency || order.currency || 'EUR';
                  const orderStatus = order.orderStatus || order.status || 'Pending';
                  const paymentStatus = order.paymentStatus || (order.payments?.[0]?.status) || 'Pending';

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-white/[0.03] transition-colors ${
                        hasCompensationFailure ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      {/* Order Ref & Date */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-cinzel font-bold text-sm text-[#F2D675] tracking-wide">
                            #{orderNum}
                          </span>
                          {hasCompensationFailure && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-0.5"
                              title="Compensation workflow alert pending retry"
                            >
                              <AlertTriangle className="w-2.5 h-2.5" /> Comp Fail
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#D8BE99] font-mono block mt-0.5">
                          {orderDate ? new Date(orderDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '—'}
                        </span>
                      </td>

                      {/* Patron & Destination */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#F3E6D0] block text-xs sm:text-sm">
                          {customerName}
                        </span>
                        <span className="text-[11px] text-[#D8BE99] font-mono block truncate max-w-[200px]">
                          {customerEmail}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-[#D8BE99] flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-[#D4AF37]" />
                            {order.shippingAddress?.city || 'Dubai'}, {order.shippingAddress?.country || 'UAE'}
                          </span>
                          {customerPhone && (
                            <a
                              href={`tel:${customerPhone}`}
                              className="inline-flex items-center gap-0.5 text-[10px] text-[#D4AF37] hover:underline font-mono"
                              title="Call patron"
                            >
                              <Phone className="w-2.5 h-2.5" />
                              <span>{customerPhone}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs text-[#F3E6D0] font-bold">
                          {itemsCount} {itemsCount === 1 ? 'Flacon' : 'Flacons'}
                        </span>
                        <p className="text-[11px] text-[#D8BE99] line-clamp-1 max-w-xs">
                          {Array.isArray(order.items) && order.items.length > 0
                            ? order.items.map(i => i.productName || i.name).filter(Boolean).join(', ')
                            : 'Bespoke Perfumery'}
                        </p>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#F2D675] text-sm">
                          {currency === 'EUR' ? '€' : currency === 'USD' ? '$' : `${currency} `}
                          {Number(orderTotal).toFixed(2)}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 text-[10px] sm:text-xs font-mono font-bold rounded-full border uppercase ${getPaymentStatusBadge(paymentStatus)}`}>
                          {paymentStatus}
                        </span>
                      </td>

                      {/* Fulfillment Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 text-[10px] sm:text-xs font-mono font-bold rounded-full border uppercase ${getOrderStatusBadge(orderStatus)}`}>
                          {orderStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Details */}
                          <button
                            onClick={() => handleOpenDetails(order)}
                            className="p-1.5 rounded-lg bg-black/60 border border-[#D4AF37]/30 hover:border-[#D4AF37] text-[#D4AF37] hover:text-[#F2D675] transition-colors cursor-pointer"
                            title="Inspect Deep Purchase Cycle"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Track Logistics */}
                          <button
                            onClick={() => handleOpenTracking(order)}
                            className="p-1.5 rounded-lg bg-black/60 border border-[#D4AF37]/30 hover:border-cyan-400 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                            title="View Logistics & Tracking"
                          >
                            <Truck className="w-3.5 h-3.5" />
                          </button>

                          {/* Transition Status */}
                          <button
                            onClick={() => handleOpenStatusModal(order)}
                            className="p-1.5 rounded-lg bg-black/60 border border-[#D4AF37]/30 hover:border-amber-400 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                            title="Update Fulfillment Milestone"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Compensation Retry Button */}
                          {hasCompensationFailure && (
                            <button
                              onClick={() => handleRetryCompensation(order.id)}
                              disabled={retryingOrderId === order.id}
                              className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-500 hover:bg-rose-500/40 text-rose-300 transition-colors cursor-pointer disabled:opacity-50"
                              title="Retry Failed Compensation Workflow"
                            >
                              <RotateCcw className={`w-3.5 h-3.5 ${retryingOrderId === order.id ? 'animate-spin' : ''}`} />
                            </button>
                          )}

                          {/* Cancel Order */}
                          {orderStatus !== 'Cancelled' && (
                            <button
                              onClick={() => handleOpenCancelModal(order)}
                              className="p-1.5 rounded-lg bg-black/60 border border-[#D4AF37]/30 hover:border-rose-500 text-rose-400/80 hover:text-rose-300 transition-colors cursor-pointer"
                              title="Cancel Order"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-[#D4AF37]/20 bg-black/40 text-xs text-[#D8BE99]">
          <div>
            Showing <span className="text-[#F2D675] font-bold">{displayedItems.length}</span> of{' '}
            <span className="text-[#F2D675] font-bold">{ordersData.totalCount}</span> orders
            {ordersData.totalPages > 1 && (
              <span className="ml-2">
                (Page <span className="text-[#F3E6D0] font-bold">{ordersData.page}</span> of{' '}
                <span className="text-[#F3E6D0] font-bold">{ordersData.totalPages}</span>)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page <= 1 || loading}
              className="px-3 py-1.5 rounded-lg bg-black/60 border border-[#D4AF37]/30 text-[#F3E6D0] hover:border-[#D4AF37] hover:text-[#F2D675] disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>

            <span className="px-3 py-1 bg-black/80 border border-[#D4AF37]/40 rounded-lg text-[#F2D675] font-mono font-bold">
              {page}
            </span>

            <button
              onClick={() => setPage(prev => Math.min(ordersData.totalPages || 1, prev + 1))}
              disabled={page >= (ordersData.totalPages || 1) || loading}
              className="px-3 py-1.5 rounded-lg bg-black/60 border border-[#D4AF37]/30 text-[#F3E6D0] hover:border-[#D4AF37] hover:text-[#F2D675] disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 cursor-pointer"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: DEEP PURCHASE CYCLE & ORDER DETAILS DRAWER                      */}
      {/* ========================================================================= */}
      {detailsModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#0B0A08] border border-[#D4AF37]/40 rounded-2xl shadow-2xl overflow-hidden text-[#F3E6D0]">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 border-b border-[#D4AF37]/25 bg-gradient-to-r from-black via-[#16120B] to-black">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#F2D675]">
                    Order #{detailsModalOrder.orderNumber || detailsModalOrder.id}
                  </h2>
                  <span className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded-full border uppercase ${getOrderStatusBadge(detailsModalOrder.orderStatus || detailsModalOrder.status)}`}>
                    {detailsModalOrder.orderStatus || detailsModalOrder.status || 'Pending'}
                  </span>
                  <span className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded-full border uppercase ${getPaymentStatusBadge(detailsModalOrder.paymentStatus || detailsModalOrder.payments?.[0]?.status)}`}>
                    {detailsModalOrder.paymentStatus || detailsModalOrder.payments?.[0]?.status || 'Pending'}
                  </span>
                </div>
                <p className="text-xs text-[#D8BE99] mt-1 font-mono">
                  Placed on {detailsModalOrder.createdAt || detailsModalOrder.date ? new Date(detailsModalOrder.createdAt || detailsModalOrder.date).toLocaleString() : '—'}
                  {detailsModalOrder.customer?.email && ` by ${detailsModalOrder.customer.email}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDetailsModalOrder(null)}
                  className="p-1.5 rounded-lg bg-black/60 border border-[#D4AF37]/30 text-[#D8BE99] hover:text-[#F2D675] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Compensation Failure Alert Banner */}
            {(detailsModalOrder.compensationFailure === true || detailsModalOrder.compensation?.hasFailure === true) && (
              <div className="bg-rose-950/60 border-y border-rose-500/50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-200 uppercase tracking-wider">
                      Compensation Workflow Warning
                    </h4>
                    <p className="text-xs text-rose-300/90 mt-0.5">
                      {detailsModalOrder.compensation?.failureReason || 'An automated fulfillment or compensation step failed during purchase cycle execution.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRetryCompensation(detailsModalOrder.id)}
                  disabled={retryingOrderId === detailsModalOrder.id}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-mono transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${retryingOrderId === detailsModalOrder.id ? 'animate-spin' : ''}`} />
                  <span>Retry Workflow</span>
                </button>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="flex items-center border-b border-[#D4AF37]/20 bg-black/40 px-5 gap-4 overflow-x-auto">
              <button
                onClick={() => setDetailsActiveTab('items')}
                className={`py-3 text-xs sm:text-sm font-cinzel font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  detailsActiveTab === 'items'
                    ? 'border-[#D4AF37] text-[#F2D675]'
                    : 'border-transparent text-[#D8BE99] hover:text-[#F3E6D0]'
                }`}
              >
                <Package className="w-4 h-4" /> Items & Financials
              </button>

              <button
                onClick={() => setDetailsActiveTab('shipping')}
                className={`py-3 text-xs sm:text-sm font-cinzel font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  detailsActiveTab === 'shipping'
                    ? 'border-[#D4AF37] text-[#F2D675]'
                    : 'border-transparent text-[#D8BE99] hover:text-[#F3E6D0]'
                }`}
              >
                <Truck className="w-4 h-4" /> Shipping & Logistics
              </button>

              <button
                onClick={() => setDetailsActiveTab('payments')}
                className={`py-3 text-xs sm:text-sm font-cinzel font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  detailsActiveTab === 'payments'
                    ? 'border-[#D4AF37] text-[#F2D675]'
                    : 'border-transparent text-[#D8BE99] hover:text-[#F3E6D0]'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Payments & Attempts
              </button>

              <button
                onClick={() => setDetailsActiveTab('history')}
                className={`py-3 text-xs sm:text-sm font-cinzel font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  detailsActiveTab === 'history'
                    ? 'border-[#D4AF37] text-[#F2D675]'
                    : 'border-transparent text-[#D8BE99] hover:text-[#F3E6D0]'
                }`}
              >
                <Clock className="w-4 h-4" /> Audit Trail & History
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-5 overflow-y-auto max-h-[calc(85vh-200px)] space-y-6">
              {detailsLoading && (
                <div className="py-8 text-center text-[#D8BE99]">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#D4AF37] mb-2" />
                  <span>Loading deep order payload...</span>
                </div>
              )}

              {/* TAB 1: ITEMS & FINANCIALS */}
              {detailsActiveTab === 'items' && (
                <div className="space-y-5">
                  {/* Flacon line items table */}
                  <div className="border border-[#D4AF37]/25 rounded-xl overflow-hidden">
                    <div className="bg-black/50 px-4 py-2.5 border-b border-[#D4AF37]/20 flex items-center justify-between">
                      <h3 className="text-xs font-cinzel font-bold uppercase text-[#F2D675] tracking-wider">
                        Flacons & Items ({Array.isArray(detailsModalOrder.items) ? detailsModalOrder.items.length : 0})
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead>
                          <tr className="border-b border-[#D4AF37]/15 text-[#D8BE99] font-mono uppercase bg-black/30">
                            <th className="py-2.5 px-3">Item Details</th>
                            <th className="py-2.5 px-3">SKU</th>
                            <th className="py-2.5 px-3 text-right">Unit Price</th>
                            <th className="py-2.5 px-3 text-center">Qty</th>
                            <th className="py-2.5 px-3 text-right">Discount</th>
                            <th className="py-2.5 px-3 text-right">Line Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D4AF37]/10 text-[#F3E6D0]">
                          {Array.isArray(detailsModalOrder.items) && detailsModalOrder.items.length > 0 ? (
                            detailsModalOrder.items.map((item, idx) => {
                              const lineTotal = item.lineTotal ?? ((item.unitPrice || item.price || 0) * (item.quantity || 1) - (item.discountAmount || 0));
                              return (
                                <tr key={item.id || idx} className="hover:bg-white/[0.02]">
                                  <td className="py-3 px-3">
                                    <div className="flex items-center gap-3">
                                      {item.imageUrl && (
                                        <img
                                          src={item.imageUrl}
                                          alt={item.productName || item.name}
                                          className="w-10 h-10 object-cover rounded-lg border border-[#D4AF37]/30 shrink-0"
                                        />
                                      )}
                                      <div>
                                        <span className="font-bold text-[#F3E6D0] block text-xs sm:text-sm">
                                          {item.productName || item.name || 'Imperial Creation'}
                                        </span>
                                        <span className="text-[10px] text-[#D8BE99]">
                                          {item.brand || 'Arabian Sheikh'} {item.category ? `• ${item.category}` : ''}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-3 font-mono text-[11px] text-[#D8BE99]">
                                    {item.sku || 'SKU-ASH-01'}
                                  </td>
                                  <td className="py-3 px-3 text-right font-mono text-xs">
                                    €{Number(item.unitPrice || item.price || 0).toFixed(2)}
                                  </td>
                                  <td className="py-3 px-3 text-center font-mono font-bold text-xs">
                                    {item.quantity || 1}
                                  </td>
                                  <td className="py-3 px-3 text-right font-mono text-xs text-emerald-400">
                                    {item.discountAmount ? `-€${Number(item.discountAmount).toFixed(2)}` : '—'}
                                  </td>
                                  <td className="py-3 px-3 text-right font-mono font-bold text-xs text-[#F2D675]">
                                    €{Number(lineTotal).toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={6} className="py-4 text-center text-[#D8BE99]">
                                No line items recorded.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Financial Breakdown & Snapshots */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Snapshots: Coupons & Promos */}
                    <div className="bg-black/50 border border-[#D4AF37]/25 rounded-xl p-4 space-y-3">
                      <h4 className="text-xs font-cinzel font-bold uppercase text-[#F2D675] tracking-wider flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#D4AF37]" /> Promotional Snapshots
                      </h4>

                      {detailsModalOrder.couponSnapshot?.code ? (
                        <div className="bg-[#16120B] border border-[#D4AF37]/30 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-[#F2D675]">
                              {detailsModalOrder.couponSnapshot.code}
                            </span>
                            <span className="text-xs text-emerald-400 font-mono font-bold">
                              Applied: -€{Number(detailsModalOrder.couponSnapshot.appliedDiscountAmount || 0).toFixed(2)}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#D8BE99] mt-1">
                            Type: {detailsModalOrder.couponSnapshot.discountType || 'Fixed'} ({detailsModalOrder.couponSnapshot.discountValue})
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-[#D8BE99]/70 italic">No coupon code applied to this purchase.</p>
                      )}

                      {detailsModalOrder.promotionSnapshot?.name && (
                        <div className="bg-[#16120B] border border-[#D4AF37]/30 rounded-lg p-3">
                          <span className="text-xs font-semibold text-[#F3E6D0] block">
                            {detailsModalOrder.promotionSnapshot.name}
                          </span>
                          <span className="text-xs text-emerald-400 font-mono mt-0.5 block">
                            Discount: -€{Number(detailsModalOrder.promotionSnapshot.discountAmount || 0).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Totals Summary */}
                    <div className="bg-black/50 border border-[#D4AF37]/25 rounded-xl p-4 space-y-2.5">
                      <h4 className="text-xs font-cinzel font-bold uppercase text-[#F2D675] tracking-wider flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-[#D4AF37]" /> Financial Reconciliation
                      </h4>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-[#D8BE99]">
                          <span>Subtotal</span>
                          <span className="font-mono">
                            €{Number(detailsModalOrder.totals?.subtotal ?? detailsModalOrder.subtotal ?? 0).toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-emerald-400">
                          <span>Discounts Total</span>
                          <span className="font-mono">
                            -€{Number(detailsModalOrder.totals?.discountTotal ?? detailsModalOrder.discountTotal ?? 0).toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[#D8BE99]">
                          <span>Shipping & Logistics</span>
                          <span className="font-mono">
                            €{Number(detailsModalOrder.totals?.shippingCost ?? detailsModalOrder.shipping ?? detailsModalOrder.shippingCost ?? 0).toFixed(2)}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-[#D4AF37]/25 flex items-center justify-between font-bold text-sm text-[#F2D675]">
                          <span>Grand Total ({detailsModalOrder.totals?.currency || detailsModalOrder.currency || 'EUR'})</span>
                          <span className="font-mono text-base">
                            €{Number(detailsModalOrder.totals?.total ?? detailsModalOrder.total ?? 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SHIPPING & LOGISTICS */}
              {detailsActiveTab === 'shipping' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Destination Address */}
                    <div className="bg-black/50 border border-[#D4AF37]/25 rounded-xl p-4 space-y-3">
                      <h4 className="text-xs font-cinzel font-bold uppercase text-[#F2D675] tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" /> Delivery Destination
                      </h4>

                      <div className="text-xs space-y-1 text-[#D8BE99]">
                        <p className="font-bold text-[#F3E6D0] text-sm">
                          {detailsModalOrder.shippingAddress?.fullName || detailsModalOrder.customer?.name || detailsModalOrder.customerName || 'Valued Patron'}
                        </p>
                        <p>{detailsModalOrder.shippingAddress?.addressLine1 || detailsModalOrder.shippingAddress?.street || 'Luxury Avenue'}</p>
                        {detailsModalOrder.shippingAddress?.addressLine2 && (
                          <p>{detailsModalOrder.shippingAddress.addressLine2}</p>
                        )}
                        <p>
                          {detailsModalOrder.shippingAddress?.city || 'Dubai'}, {detailsModalOrder.shippingAddress?.state || ''} {detailsModalOrder.shippingAddress?.postalCode || ''}
                        </p>
                        <p className="font-semibold text-[#F2D675]">{detailsModalOrder.shippingAddress?.country || 'United Arab Emirates'}</p>
                        {detailsModalOrder.shippingAddress?.phone && (
                          <p className="pt-2 font-mono flex items-center gap-1 text-[#D4AF37]">
                            <Phone className="w-3 h-3" /> {detailsModalOrder.shippingAddress.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Shipping Snapshot */}
                    <div className="bg-black/50 border border-[#D4AF37]/25 rounded-xl p-4 space-y-3">
                      <h4 className="text-xs font-cinzel font-bold uppercase text-[#F2D675] tracking-wider flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#D4AF37]" /> Logistics Snapshot
                      </h4>

                      <div className="text-xs space-y-2 text-[#D8BE99]">
                        <div className="flex items-center justify-between">
                          <span>Carrier</span>
                          <span className="font-bold text-[#F3E6D0]">
                            {detailsModalOrder.shippingSnapshot?.carrier || 'DHL Express Worldwide'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Method</span>
                          <span>{detailsModalOrder.shippingSnapshot?.shippingMethod || 'Standard Secure Freight'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Weight</span>
                          <span>{detailsModalOrder.shippingSnapshot?.weightKg ? `${detailsModalOrder.shippingSnapshot.weightKg} kg` : '0.85 kg'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Tracking Airway</span>
                          {(detailsModalOrder.trackingCode || detailsModalOrder.shippingSnapshot?.trackingNumber) ? (
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-[#F2D675] font-bold">
                                {detailsModalOrder.trackingCode || detailsModalOrder.shippingSnapshot?.trackingNumber}
                              </span>
                              <button
                                onClick={() => handleCopy(detailsModalOrder.trackingCode || detailsModalOrder.shippingSnapshot?.trackingNumber, 'Tracking number')}
                                className="p-1 hover:text-[#F2D675] cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="font-mono text-neutral-500 italic text-xs">Unassigned</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipments List */}
                  {Array.isArray(detailsModalOrder.shipments) && detailsModalOrder.shipments.length > 0 && (
                    <div className="border border-[#D4AF37]/25 rounded-xl overflow-hidden">
                      <div className="bg-black/50 px-4 py-2 border-b border-[#D4AF37]/20">
                        <h4 className="text-xs font-cinzel font-bold uppercase text-[#F2D675]">
                          Consignments & Shipments ({detailsModalOrder.shipments.length})
                        </h4>
                      </div>
                      <div className="p-4 divide-y divide-[#D4AF37]/15">
                        {detailsModalOrder.shipments.map((ship, idx) => (
                          <div key={ship.id || idx} className="py-2.5 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-[#F3E6D0]">{ship.carrier || 'Courier'}</span>
                              <span className="font-mono text-[#D8BE99] ml-2">Airway: {ship.trackingNumber}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              {ship.status || 'Dispatched'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PAYMENTS & ATTEMPTS */}
              {detailsActiveTab === 'payments' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-black/50 border border-[#D4AF37]/25 rounded-xl p-3">
                      <span className="text-[11px] text-[#D8BE99] block">Gateway Provider</span>
                      <span className="text-sm font-bold text-[#F2D675] font-mono mt-0.5 block">
                        {detailsModalOrder.payments?.[0]?.provider || 'Stripe / Bank Wire'}
                      </span>
                    </div>

                    <div className="bg-black/50 border border-[#D4AF37]/25 rounded-xl p-3">
                      <span className="text-[11px] text-[#D8BE99] block">Transaction Reference</span>
                      <span className="text-xs font-mono text-[#F3E6D0] mt-0.5 block truncate">
                        {detailsModalOrder.payments?.[0]?.transactionId || detailsModalOrder.id || 'TXN-DIRECT'}
                      </span>
                    </div>

                    <div className="bg-black/50 border border-[#D4AF37]/25 rounded-xl p-3">
                      <span className="text-[11px] text-[#D8BE99] block">Reconciliation Status</span>
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-mono font-bold rounded-full border mt-1 uppercase ${getPaymentStatusBadge(detailsModalOrder.paymentStatus || detailsModalOrder.payments?.[0]?.status)}`}>
                        {detailsModalOrder.paymentStatus || detailsModalOrder.payments?.[0]?.status || 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Payment Attempts History */}
                  <div className="border border-[#D4AF37]/25 rounded-xl overflow-hidden">
                    <div className="bg-black/50 px-4 py-2.5 border-b border-[#D4AF37]/20 flex items-center justify-between">
                      <h4 className="text-xs font-cinzel font-bold uppercase text-[#F2D675] tracking-wider">
                        Payment Gateway Attempts & Verification
                      </h4>
                    </div>

                    {Array.isArray(detailsModalOrder.payments?.[0]?.paymentAttempts) && detailsModalOrder.payments[0].paymentAttempts.length > 0 ? (
                      <table className="w-full text-left text-xs font-sans">
                        <thead>
                          <tr className="border-b border-[#D4AF37]/15 text-[#D8BE99] font-mono uppercase bg-black/30">
                            <th className="py-2.5 px-3">Attempt #</th>
                            <th className="py-2.5 px-3">Result Status</th>
                            <th className="py-2.5 px-3">Timestamp</th>
                            <th className="py-2.5 px-3">Error Code / Diagnostics</th>
                            <th className="py-2.5 px-3 text-right">Manual Review</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D4AF37]/10 text-[#F3E6D0]">
                          {detailsModalOrder.payments[0].paymentAttempts.map((att, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.02]">
                              <td className="py-2.5 px-3 font-mono font-bold">#{att.attemptNumber || idx + 1}</td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  att.status === 'Succeeded' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                                }`}>
                                  {att.status || 'Logged'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[11px] text-[#D8BE99]">
                                {att.attemptedAt ? new Date(att.attemptedAt).toLocaleTimeString() : '—'}
                              </td>
                              <td className="py-2.5 px-3 text-[11px] text-[#D8BE99]">
                                {att.errorCode ? `${att.errorCode}: ${att.errorMessage || ''}` : 'Authorised successfully'}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-[11px]">
                                {att.isManualReviewRequired ? (
                                  <span className="text-amber-400 font-bold">Required</span>
                                ) : (
                                  <span className="text-neutral-500">None</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-4 text-center text-xs text-[#D8BE99]">
                        Single verification payment recorded without exceptions.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: AUDIT TRAIL & HISTORY */}
              {detailsActiveTab === 'history' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-cinzel font-bold uppercase text-[#F2D675] tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#D4AF37]" /> Purchase Cycle Status Audit Trail
                  </h4>

                  {Array.isArray(detailsModalOrder.statusHistory) && detailsModalOrder.statusHistory.length > 0 ? (
                    <div className="relative pl-6 border-l-2 border-[#D4AF37]/30 space-y-5 my-2">
                      {detailsModalOrder.statusHistory.map((hist, idx) => (
                        <div key={hist.id || idx} className="relative">
                          {/* Timeline node */}
                          <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#0B0A08] border-2 border-[#D4AF37] flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#F2D675]" />
                          </div>

                          <div className="bg-black/50 border border-[#D4AF37]/25 rounded-xl p-3 space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-[#F2D675] uppercase">
                                  {hist.toStatus || hist.status}
                                </span>
                                {hist.fromStatus && (
                                  <span className="text-[10px] text-[#D8BE99]">
                                    (from {hist.fromStatus})
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-[#D8BE99]">
                                {hist.createdAt ? new Date(hist.createdAt).toLocaleString() : '—'}
                              </span>
                            </div>

                            {hist.note && (
                              <p className="text-xs text-[#F3E6D0] mt-1 italic">
                                "{hist.note}"
                              </p>
                            )}

                            <span className="text-[10px] text-[#D4AF37]/80 block pt-1">
                              Actor: {hist.changedBy || 'Admin System'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : Array.isArray(detailsModalOrder.timeline) && detailsModalOrder.timeline.length > 0 ? (
                    <div className="relative pl-6 border-l-2 border-[#D4AF37]/30 space-y-5 my-2">
                      {detailsModalOrder.timeline.map((item, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#0B0A08] border-2 border-[#D4AF37]" />
                          <div className="bg-black/50 border border-[#D4AF37]/25 rounded-xl p-3">
                            <span className="text-xs font-bold text-[#F2D675] block">{item.title || item.status}</span>
                            <span className="text-[10px] text-[#D8BE99] font-mono">
                              {item.timestamp ? new Date(item.timestamp).toLocaleString() : '—'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#D8BE99]/70 italic">No historical status modifications recorded yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-[#D4AF37]/25 bg-black/60 text-xs">
              <span className="text-[#D8BE99]">
                Internal Order ID: <span className="font-mono text-[#F3E6D0]">{detailsModalOrder.id}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenStatusModal(detailsModalOrder)}
                  className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold text-xs transition-colors cursor-pointer"
                >
                  Update Milestone
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CARRIER LOGISTICS & AIRWAY TRACKING                             */}
      {/* ========================================================================= */}
      {trackingModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#0B0A08] border border-[#D4AF37]/40 rounded-2xl shadow-2xl p-6 text-[#F3E6D0] space-y-4">
            <div className="flex items-start justify-between border-b border-[#D4AF37]/25 pb-3">
              <div>
                <h3 className="font-cinzel text-lg font-bold text-[#F2D675] flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#D4AF37]" /> Logistics Tracking
                </h3>
                <p className="text-xs text-[#D8BE99] mt-0.5">Order #{trackingModalData.orderNumber}</p>
              </div>
              <button
                onClick={() => setTrackingModalData(null)}
                className="p-1 rounded text-[#D8BE99] hover:text-[#F3E6D0] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-black/60 border border-[#D4AF37]/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#D8BE99]">Courier Partner</span>
                <span className="font-bold text-sm text-[#F3E6D0]">{trackingModalData.carrier || 'DHL Express'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#D8BE99]">Tracking Number</span>
                {trackingModalData.trackingNumber ? (
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-bold text-[#F2D675]">
                      {trackingModalData.trackingNumber}
                    </span>
                    <button
                      onClick={() => handleCopy(trackingModalData.trackingNumber, 'Tracking number')}
                      className="p-1 text-[#D4AF37] hover:text-[#F2D675] cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="font-mono text-neutral-500 italic text-xs">Unassigned</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#D8BE99]">Current Logistics Status</span>
                <span className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded-full border uppercase ${getOrderStatusBadge(trackingModalData.status)}`}>
                  {trackingModalData.status || 'In Transit'}
                </span>
              </div>
            </div>

            {/* Milestone Events Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-cinzel font-bold text-[#F2D675] uppercase">
                Milestone Transit Events
              </h4>

              {trackingLoading ? (
                <div className="py-6 text-center text-xs text-[#D8BE99]">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#D4AF37] mb-2" />
                  <span>Querying carrier hub...</span>
                </div>
              ) : Array.isArray(trackingModalData.events) && trackingModalData.events.length > 0 ? (
                <div className="relative pl-5 border-l-2 border-[#D4AF37]/30 space-y-4 max-h-56 overflow-y-auto">
                  {trackingModalData.events.map((evt, idx) => (
                    <div key={idx} className="relative text-xs">
                      <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-[#0B0A08] border-2 border-cyan-400" />
                      <p className="font-bold text-[#F3E6D0]">{evt.description || evt.status}</p>
                      <p className="text-[10px] text-[#D8BE99] font-mono">
                        {(evt.occurredAt || evt.timestamp) ? new Date(evt.occurredAt || evt.timestamp).toLocaleString() : '—'} • {evt.location || 'Hub'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#D8BE99]/70 italic">Package prepared for courier handover.</p>
              )}
            </div>

            <div className="pt-3 border-t border-[#D4AF37]/20 flex justify-end">
              <button
                onClick={() => setTrackingModalData(null)}
                className="px-4 py-2 rounded-xl bg-black/60 border border-[#D4AF37]/30 text-xs font-semibold text-[#F3E6D0] hover:text-[#F2D675] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: STATUS TRANSITION & AUDIT NOTE                                  */}
      {/* ========================================================================= */}
      {statusModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <form
            onSubmit={handleSubmitStatusUpdate}
            className="w-full max-w-md bg-[#0B0A08] border border-[#D4AF37]/40 rounded-2xl shadow-2xl p-6 text-[#F3E6D0] space-y-4"
          >
            <div className="flex items-start justify-between border-b border-[#D4AF37]/25 pb-3">
              <div>
                <h3 className="font-cinzel text-lg font-bold text-[#F2D675] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" /> Transition Fulfillment Status
                </h3>
                <p className="text-xs text-[#D8BE99] mt-0.5">Order #{statusModalOrder.orderNumber || statusModalOrder.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setStatusModalOrder(null)}
                className="p-1 rounded text-[#D8BE99] hover:text-[#F3E6D0] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#D8BE99] mb-1">
                  Target Status
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full bg-black/60 border border-[#D4AF37]/35 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                >
                  {ADMIN_ORDER_STATUSES.map(st => (
                    <option key={st} value={st}>{st.replace(/([A-Z])/g, ' $1').trim()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D8BE99] mb-1">
                  Audit Log Note (Optional)
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g., Flacon hand-sealed and dispatched with courier consignment"
                  rows={3}
                  className="w-full bg-black/60 border border-[#D4AF37]/35 rounded-xl p-3 text-xs text-[#F3E6D0] placeholder-[#D8BE99]/40 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#D4AF37]/20 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setStatusModalOrder(null)}
                className="px-4 py-2 rounded-xl bg-black/60 border border-[#D4AF37]/30 text-xs font-semibold text-[#D8BE99] hover:text-[#F3E6D0] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingStatus}
                className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {updatingStatus && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Apply Status</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CANCEL ORDER                                                    */}
      {/* ========================================================================= */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <form
            onSubmit={handleSubmitCancelOrder}
            className="w-full max-w-md bg-[#0B0A08] border border-rose-500/40 rounded-2xl shadow-2xl p-6 text-[#F3E6D0] space-y-4"
          >
            <div className="flex items-start justify-between border-b border-rose-500/25 pb-3">
              <div>
                <h3 className="font-cinzel text-lg font-bold text-rose-300 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-400" /> Cancel Order
                </h3>
                <p className="text-xs text-[#D8BE99] mt-0.5">Order #{cancelModalOrder.orderNumber || cancelModalOrder.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="p-1 rounded text-[#D8BE99] hover:text-[#F3E6D0] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-[#D8BE99]">
                Are you sure you want to cancel this order? This will invoke the cancellation workflow and halt fulfillment.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#D8BE99] mb-1">
                  Cancellation Reason
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Specify reason (e.g. Patron requested cancellation prior to flight dispatch)"
                  rows={3}
                  required
                  className="w-full bg-black/60 border border-rose-500/35 rounded-xl p-3 text-xs text-[#F3E6D0] placeholder-[#D8BE99]/40 focus:border-rose-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#D4AF37]/20 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="px-4 py-2 rounded-xl bg-black/60 border border-[#D4AF37]/30 text-xs font-semibold text-[#D8BE99] hover:text-[#F3E6D0] cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="submit"
                disabled={cancellingOrder}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-cinzel font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {cancellingOrder && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Cancellation</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

