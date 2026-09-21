import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import { paymentApi } from '../../api/payment.api';
import { isSuccessStatus, isFailedStatus } from '../../services/paymentService';
import {
  CreditCard,
  Search,
  RefreshCw,
  Eye,
  AlertTriangle,
  Clock,
  RotateCcw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Copy,
  Check,
  Radio,
  FileText
} from 'lucide-react';

export default function AdminPayments() {
  const { success, error, info } = useToast();

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [manualReviewOnly, setManualReviewOnly] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Data State
  const [payments, setPayments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copiedText, setCopiedText] = useState(null);

  // Modals State
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [modalTab, setModalTab] = useState('overview'); // 'overview' | 'attempts' | 'audit'
  const [modalLoading, setModalLoading] = useState(false);
  const [paymentAttempts, setPaymentAttempts] = useState([]);
  const [paymentAudit, setPaymentAudit] = useState([]);

  // Webhooks Ledger Modal
  const [webhooksModalOpen, setWebhooksModalOpen] = useState(false);
  const [webhooks, setWebhooks] = useState([]);
  const [webhooksLoading, setWebhooksLoading] = useState(false);

  // Flag Manual Review in flight
  const [flaggingId, setFlaggingId] = useState(null);

  // Fetch payments list
  const fetchPayments = useCallback(async () => {
    try {
      const filters = {
        page,
        pageSize
      };

      if (search.trim()) {
        const clean = search.trim().replace(/^#?(PAY-|ORD-)?/i, '');
        const num = Number(clean);
        if (!isNaN(num) && num > 0) {
          // Check if searched by paymentId or orderId
          if (search.toUpperCase().includes('ORD')) {
            filters.orderId = num;
          } else {
            filters.paymentId = num;
          }
        }
      }

      if (statusFilter !== 'ALL') {
        filters.status = statusFilter;
      }
      if (providerFilter !== 'ALL') {
        filters.provider = providerFilter;
      }
      if (manualReviewOnly) {
        filters.manualReviewRequired = true;
      }
      if (fromDate) {
        filters.from = new Date(fromDate).toISOString();
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        filters.to = end.toISOString();
      }

      const response = await paymentApi.adminListPayments(filters);
      const rawList = Array.isArray(response)
        ? response
        : (Array.isArray(response?.items) ? response.items : (Array.isArray(response?.data) ? response.data : []));

      // Pure backend payments list — no local reconciliation
      setPayments(rawList);
      setTotalCount(response?.totalCount ?? rawList.length);
    } catch (err) {
      console.error('[AdminPayments] Fetch error:', err);
      error(err?.message || 'Failed to load payments from gateway.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter, providerFilter, manualReviewOnly, fromDate, toDate, error]);

  useEffect(() => {
    async function load() {
      await fetchPayments();
    }
    load();
  }, [fetchPayments]);

  // Real-time reactive listener + Periodic polling across devices
  useEffect(() => {
    const handleSync = () => {
      fetchPayments();
    };
    window.addEventListener('arabian_sheikh_order_created', handleSync);
    window.addEventListener('arabian_sheikh_order_updated', handleSync);
    window.addEventListener('arabian_sheikh_cloud_updated', handleSync);

    // Periodic polling every 15s so incoming payments appear in real-time
    const interval = setInterval(() => {
      fetchPayments();
    }, 15000);

    return () => {
      window.removeEventListener('arabian_sheikh_order_created', handleSync);
      window.removeEventListener('arabian_sheikh_order_updated', handleSync);
      window.removeEventListener('arabian_sheikh_cloud_updated', handleSync);
      clearInterval(interval);
    };
  }, [fetchPayments]);

  // Open Details Modal and fetch attempts/audit
  const handleOpenDetails = async (payment) => {
    setSelectedPayment(payment);
    setModalTab('overview');
    setPaymentAttempts([]);
    setPaymentAudit([]);
    setModalLoading(true);

    try {
      const [detailsRes, attemptsRes, auditRes] = await Promise.allSettled([
        paymentApi.adminGetPaymentDetails(payment.id),
        paymentApi.adminGetPaymentAttempts(payment.id),
        paymentApi.adminGetPaymentAudit(payment.id)
      ]);

      if (detailsRes.status === 'fulfilled' && detailsRes.value) {
        setSelectedPayment(detailsRes.value);
      }
      if (attemptsRes.status === 'fulfilled' && attemptsRes.value) {
        const raw = attemptsRes.value;
        setPaymentAttempts(Array.isArray(raw) ? raw : (raw?.items || raw?.data || []));
      }
      if (auditRes.status === 'fulfilled' && auditRes.value) {
        const raw = auditRes.value;
        setPaymentAudit(Array.isArray(raw) ? raw : (raw?.items || raw?.data || []));
      }
    } catch (err) {
      console.warn('[AdminPayments] Details hydration notice:', err);
    } finally {
      setModalLoading(false);
    }
  };

  // Open Webhooks Ledger Modal
  const handleOpenWebhooks = async () => {
    setWebhooksModalOpen(true);
    setWebhooksLoading(true);
    try {
      const res = await paymentApi.adminGetWebhooks();
      const list = Array.isArray(res) ? res : (res?.items || res?.data || []);
      setWebhooks(list);
    } catch (err) {
      console.error('[AdminPayments] Webhook ledger error:', err);
      error(err?.message || 'Failed to retrieve Stripe webhook ledger.');
    } finally {
      setWebhooksLoading(false);
    }
  };

  // Flag for manual review
  const handleFlagManualReview = async (paymentId, e) => {
    e?.stopPropagation();
    setFlaggingId(paymentId);
    try {
      await paymentApi.adminFlagManualReview(paymentId);
      success(`Payment #${paymentId} flagged for manual review.`);
      fetchPayments();
      if (selectedPayment?.id === paymentId) {
        setSelectedPayment(prev => ({ ...prev, manualReviewRequired: true }));
      }
    } catch (err) {
      error(err?.message || 'Failed to flag payment for manual review.');
    } finally {
      setFlaggingId(null);
    }
  };

  const handleCopy = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedText(text);
    info(`${label || 'Reference'} copied`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Status Badge Helper
  const getStatusBadge = (status = '') => {
    const s = String(status).toLowerCase();
    switch (s) {
      case 'paid':
      case 'succeeded':
      case 'completed':
      case 'settled':
      case 'success':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'pending':
      case 'processing':
      case 'requires_action':
      case 'requires_payment_method':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'failed':
      case 'declined':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'refunded':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'cancelled':
      case 'canceled':
        return 'bg-neutral-500/20 text-neutral-300 border-neutral-500/40';
      default:
        return 'bg-[#D4AF37]/20 text-[#F2D675] border-[#D4AF37]/40';
    }
  };

  // Metrics Calculations
  const metrics = useMemo(() => {
    let totalVolume = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let failedCount = 0;
    let reviewCount = 0;

    payments.forEach(p => {
      const s = String(p.status || '').toLowerCase();
      const amt = Number(p.amount || 0);
      if (isSuccessStatus(s)) {
        paidCount++;
        totalVolume += amt;
      } else if (s === 'pending' || s === 'processing' || s.includes('require')) {
        pendingCount++;
      } else if (isFailedStatus(s)) {
        failedCount++;
      }
      if (p.manualReviewRequired) {
        reviewCount++;
      }
    });

    return { totalVolume, paidCount, pendingCount, failedCount, reviewCount };
  }, [payments]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#D4AF37]" />
            <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-[#F3E6D0]">
              Payment Operations & Gateways
            </h1>
          </div>
          <p className="text-xs text-[#D8BE99] mt-1">
            Real-time Stripe reconciliations, gateway attempts, and webhook audit log
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenWebhooks}
            className="flex items-center gap-2 px-4 py-2 border border-[#D4AF37]/30 bg-black/50 text-[#F3E6D0] hover:text-[#D4AF37] hover:border-[#D4AF37] rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg"
          >
            <Radio className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Webhook Ledger</span>
          </button>

          <button
            onClick={() => fetchPayments()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#F2D675] transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Live Sync</span>
          </button>
        </div>
      </div>

      {/* 2. Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-[#0B0A08]/80 border border-[#D4AF37]/25 rounded-xl p-3.5 space-y-1 backdrop-blur-md">
          <span className="text-[11px] text-[#D8BE99] uppercase tracking-wider block">Volume Processed</span>
          <span className="text-lg font-bold font-mono text-[#F2D675]">€{metrics.totalVolume.toFixed(2)}</span>
          <span className="text-[10px] text-neutral-400 block">Total on Page</span>
        </div>

        <div className="bg-[#0B0A08]/80 border border-emerald-500/25 rounded-xl p-3.5 space-y-1 backdrop-blur-md">
          <span className="text-[11px] text-[#D8BE99] uppercase tracking-wider block">Paid / Captured</span>
          <span className="text-lg font-bold font-mono text-emerald-400">{metrics.paidCount}</span>
          <span className="text-[10px] text-emerald-300/70 block">Authorized & Settled</span>
        </div>

        <div className="bg-[#0B0A08]/80 border border-amber-500/25 rounded-xl p-3.5 space-y-1 backdrop-blur-md">
          <span className="text-[11px] text-[#D8BE99] uppercase tracking-wider block">Pending / In-Flight</span>
          <span className="text-lg font-bold font-mono text-amber-400">{metrics.pendingCount}</span>
          <span className="text-[10px] text-amber-300/70 block">Awaiting Confirmation</span>
        </div>

        <div className="bg-[#0B0A08]/80 border border-rose-500/25 rounded-xl p-3.5 space-y-1 backdrop-blur-md">
          <span className="text-[11px] text-[#D8BE99] uppercase tracking-wider block">Failed / Declined</span>
          <span className="text-lg font-bold font-mono text-rose-400">{metrics.failedCount}</span>
          <span className="text-[10px] text-rose-300/70 block">Requires Patron Action</span>
        </div>

        <div className="bg-[#0B0A08]/80 border border-[#D4AF37]/25 rounded-xl p-3.5 space-y-1 backdrop-blur-md col-span-2 sm:col-span-1">
          <span className="text-[11px] text-[#D8BE99] uppercase tracking-wider block">Manual Review</span>
          <span className="text-lg font-bold font-mono text-amber-300">{metrics.reviewCount}</span>
          <span className="text-[10px] text-amber-400/70 block">Flagged for Audit</span>
        </div>
      </div>

      {/* 3. Filters & Query Bar */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by Payment # or Order #..."
              className="w-full bg-black/60 border border-[#D4AF37]/30 pl-9 pr-3 py-2 rounded-xl text-xs text-[#F3E6D0] placeholder-neutral-500 focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2 rounded-xl text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Paid">Paid / Succeeded</option>
              <option value="Pending">Pending / In-Flight</option>
              <option value="Failed">Failed / Declined</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          {/* Provider Filter */}
          <div>
            <select
              value={providerFilter}
              onChange={(e) => { setProviderFilter(e.target.value); setPage(1); }}
              className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2 rounded-xl text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Gateways</option>
              <option value="stripe">Stripe</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>

          {/* Date From */}
          <div className="relative">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
              className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2 rounded-xl text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          {/* Date To */}
          <div className="relative">
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(1); }}
              className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2 rounded-xl text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
            />
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10 text-xs">
          <label className="flex items-center gap-2 text-[#D8BE99] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={manualReviewOnly}
              onChange={(e) => { setManualReviewOnly(e.target.checked); setPage(1); }}
              className="accent-[#D4AF37] rounded"
            />
            <span>Show Only Flagged for Manual Review</span>
          </label>

          <div className="flex items-center gap-3">
            {(search || statusFilter !== 'ALL' || providerFilter !== 'ALL' || manualReviewOnly || fromDate || toDate) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('ALL');
                  setProviderFilter('ALL');
                  setManualReviewOnly(false);
                  setFromDate('');
                  setToDate('');
                  setPage(1);
                }}
                className="text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 text-[#D8BE99]">
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="bg-black/60 border border-[#D4AF37]/30 rounded-lg px-2 py-1 text-xs text-[#F3E6D0] cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Payments Table */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm font-sans">
            <thead>
              <tr className="border-b border-[#D4AF37]/25 text-[#F2D675] uppercase font-cinzel font-bold text-[11px] sm:text-xs tracking-wider bg-black/40">
                <th className="py-3.5 px-4">Payment Ref</th>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Gateway & Txn</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Review Flag</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/15 text-[#F3E6D0]">
              {loading && payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#D8BE99]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#D4AF37] mb-2" />
                    <span>Synchronizing gateway payments...</span>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#D8BE99]">
                    <CreditCard className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
                    <p className="font-cinzel text-base text-[#F3E6D0]">No Payment Records Found</p>
                    <p className="text-xs text-[#D8BE99] mt-1">Try refining search parameters or clearing filters.</p>
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const payId = p.id;
                  const ordId = p.orderId;
                  const amt = Number(p.amount || 0);
                  const curr = (p.currency || 'EUR').toUpperCase();
                  const provider = p.provider || 'stripe';
                  const provTxn = p.providerPaymentId || '—';
                  const status = p.status || 'Pending';
                  const isReview = Boolean(p.manualReviewRequired);
                  const dateStr = p.paidAt || p.createdAt || p.updatedAt;

                  return (
                    <tr key={payId} className="hover:bg-white/[0.02] transition-colors">
                      {/* Payment Ref */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-sm text-[#F2D675]">
                          <span>#PAY-{payId}</span>
                          <button
                            onClick={() => handleCopy(payId, 'Payment ID')}
                            className="text-neutral-500 hover:text-white cursor-pointer"
                            title="Copy ID"
                          >
                            {copiedText === payId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* Order ID */}
                      <td className="py-3.5 px-4 font-mono">
                        {ordId ? (
                          <a
                            href={`/admin/orders`}
                            className="text-[#D4AF37] hover:underline flex items-center gap-1"
                          >
                            <span>#ORD-{ordId}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                          </a>
                        ) : (
                          <span className="text-neutral-500">—</span>
                        )}
                      </td>

                      {/* Gateway & Txn */}
                      <td className="py-3.5 px-4">
                        <span className="uppercase font-bold text-[11px] text-[#F3E6D0] block">
                          {provider}
                        </span>
                        <span className="font-mono text-[10px] text-neutral-400 block truncate max-w-[140px]" title={provTxn}>
                          {provTxn}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#F2D675]">
                        {curr} {amt.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase ${getStatusBadge(status)}`}>
                          {isSuccessStatus(status) ? 'PAID' : status}
                        </span>
                      </td>

                      {/* Review Flag */}
                      <td className="py-3.5 px-4">
                        {isReview ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 w-max">
                            <AlertTriangle className="w-2.5 h-2.5" /> Required
                          </span>
                        ) : (
                          <span className="text-neutral-500 text-[11px]">Normal</span>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-xs text-[#D8BE99] font-mono">
                        {dateStr ? new Date(dateStr).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isReview && (
                            <button
                              onClick={(e) => handleFlagManualReview(payId, e)}
                              disabled={flaggingId === payId}
                              className="px-2.5 py-1 border border-amber-500/30 text-amber-400 hover:border-amber-500 rounded text-[11px] font-cinzel transition-colors cursor-pointer"
                              title="Flag for manual inspection"
                            >
                              Flag Review
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenDetails(p)}
                            className="p-1.5 rounded-lg border border-[#D4AF37]/30 bg-black/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors cursor-pointer"
                            title="Inspect Payment & Attempts"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="p-4 border-t border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#D8BE99]">
            <span>
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} records
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 border border-[#D4AF37]/30 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#D4AF37] cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-sm text-[#F3E6D0] px-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 border border-[#D4AF37]/30 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#D4AF37] cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0B0A08] border border-[#D4AF37]/40 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="p-4 border-b border-[#D4AF37]/30 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-cinzel font-bold text-base text-[#F3E6D0]">
                  Payment #{selectedPayment.id}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase ${getStatusBadge(selectedPayment.status)}`}>
                  {selectedPayment.status || 'Pending'}
                </span>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#D4AF37]/20 bg-black/20 px-4 text-xs font-cinzel">
              <button
                onClick={() => setModalTab('overview')}
                className={`py-2.5 px-4 border-b-2 font-bold uppercase transition-colors cursor-pointer ${
                  modalTab === 'overview'
                    ? 'border-[#D4AF37] text-[#F2D675]'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setModalTab('attempts')}
                className={`py-2.5 px-4 border-b-2 font-bold uppercase transition-colors cursor-pointer ${
                  modalTab === 'attempts'
                    ? 'border-[#D4AF37] text-[#F2D675]'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Gateway Attempts ({paymentAttempts.length})
              </button>
              <button
                onClick={() => setModalTab('audit')}
                className={`py-2.5 px-4 border-b-2 font-bold uppercase transition-colors cursor-pointer ${
                  modalTab === 'audit'
                    ? 'border-[#D4AF37] text-[#F2D675]'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Audit Trail ({paymentAudit.length})
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {modalLoading ? (
                <div className="py-12 text-center text-[#D8BE99]">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#D4AF37] mb-2" />
                  <span>Loading payment telemetry...</span>
                </div>
              ) : (
                <>
                  {/* TAB 1: OVERVIEW */}
                  {modalTab === 'overview' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="bg-black/50 border border-[#D4AF37]/20 p-3 rounded-xl">
                          <span className="text-[11px] text-[#D8BE99] block">Gateway Provider</span>
                          <span className="font-bold text-sm text-[#F3E6D0] uppercase mt-0.5 block">
                            {selectedPayment.provider || 'Stripe'}
                          </span>
                        </div>

                        <div className="bg-black/50 border border-[#D4AF37]/20 p-3 rounded-xl">
                          <span className="text-[11px] text-[#D8BE99] block">Order Reference</span>
                          <span className="font-mono font-bold text-sm text-[#F2D675] mt-0.5 block">
                            {selectedPayment.orderId ? `#ORD-${selectedPayment.orderId}` : '—'}
                          </span>
                        </div>

                        <div className="bg-black/50 border border-[#D4AF37]/20 p-3 rounded-xl">
                          <span className="text-[11px] text-[#D8BE99] block">Total Amount</span>
                          <span className="font-mono font-bold text-sm text-[#F2D675] mt-0.5 block">
                            {(selectedPayment.currency || 'EUR').toUpperCase()} {Number(selectedPayment.amount || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="bg-black/50 border border-[#D4AF37]/20 p-3.5 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#D8BE99]">Provider Transaction ID:</span>
                          <span className="font-mono text-[#F3E6D0] font-bold">
                            {selectedPayment.providerPaymentId || '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#D8BE99]">Paid Timestamp:</span>
                          <span className="font-mono text-[#F3E6D0]">
                            {selectedPayment.paidAt ? new Date(selectedPayment.paidAt).toLocaleString() : 'Not paid'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#D8BE99]">Manual Review Required:</span>
                          <span className={selectedPayment.manualReviewRequired ? 'text-amber-400 font-bold' : 'text-neutral-400'}>
                            {selectedPayment.manualReviewRequired ? 'Yes (Review Flagged)' : 'No'}
                          </span>
                        </div>
                      </div>

                      {!selectedPayment.manualReviewRequired && (
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={(e) => handleFlagManualReview(selectedPayment.id, e)}
                            className="px-4 py-2 border border-amber-500/40 bg-amber-950/20 text-amber-300 font-cinzel text-xs uppercase tracking-wider rounded-xl hover:bg-amber-950/40 cursor-pointer"
                          >
                            Flag for Manual Audit
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: ATTEMPTS */}
                  {modalTab === 'attempts' && (
                    <div className="space-y-3">
                      {paymentAttempts.length === 0 ? (
                        <div className="py-8 text-center text-neutral-400">
                          <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
                          <p>No gateway attempts logged for this payment reference.</p>
                        </div>
                      ) : (
                        <div className="border border-[#D4AF37]/20 rounded-xl overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-black/60 border-b border-[#D4AF37]/20 text-[#D8BE99] font-mono">
                              <tr>
                                <th className="p-2.5">Attempt</th>
                                <th className="p-2.5">Status</th>
                                <th className="p-2.5">Time</th>
                                <th className="p-2.5">Error Code</th>
                                <th className="p-2.5">Diagnostics</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-mono">
                              {paymentAttempts.map((att, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.02]">
                                  <td className="p-2.5 font-bold">#{att.attemptNumber || idx + 1}</td>
                                  <td className="p-2.5">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      String(att.status).toLowerCase() === 'succeeded'
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : 'bg-rose-500/20 text-rose-300'
                                    }`}>
                                      {att.status || 'Attempted'}
                                    </span>
                                  </td>
                                  <td className="p-2.5 text-neutral-400">
                                    {att.attemptedAt ? new Date(att.attemptedAt).toLocaleTimeString() : '—'}
                                  </td>
                                  <td className="p-2.5 text-rose-300">
                                    {att.errorCode || '—'}
                                  </td>
                                  <td className="p-2.5 text-neutral-300 truncate max-w-[180px]">
                                    {att.errorMessage || 'Authorized successfully'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: AUDIT TRAIL */}
                  {modalTab === 'audit' && (
                    <div className="space-y-3">
                      {paymentAudit.length === 0 ? (
                        <div className="py-8 text-center text-neutral-400">
                          <FileText className="w-6 h-6 mx-auto mb-2 opacity-50" />
                          <p>No audit trail recorded yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {paymentAudit.map((log, idx) => (
                            <div key={idx} className="bg-black/50 border border-white/10 p-3 rounded-xl flex items-start justify-between gap-3">
                              <div>
                                <span className="font-bold text-[#F3E6D0] block text-xs">{log.action || log.event || 'Gateway Event'}</span>
                                <span className="text-[11px] text-neutral-400 mt-0.5 block">{log.details || log.message || log.notes || '—'}</span>
                              </div>
                              <span className="text-[10px] font-mono text-[#D8BE99] shrink-0">
                                {log.createdAt || log.timestamp ? new Date(log.createdAt || log.timestamp).toLocaleTimeString() : '—'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Webhooks Ledger Modal */}
      {webhooksModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#0B0A08] border border-[#D4AF37]/40 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-[#D4AF37]/30 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-cinzel font-bold text-base text-[#F3E6D0]">
                  Stripe Webhook Ledger
                </h3>
              </div>
              <button
                onClick={() => setWebhooksModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 text-xs">
              {webhooksLoading ? (
                <div className="py-12 text-center text-[#D8BE99]">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#D4AF37] mb-2" />
                  <span>Loading webhook ledger...</span>
                </div>
              ) : webhooks.length === 0 ? (
                <div className="py-12 text-center text-neutral-400">
                  <Radio className="w-8 h-8 mx-auto mb-2 opacity-40 text-neutral-600" />
                  <p className="font-cinzel text-sm text-[#F3E6D0]">No Webhook Records Found</p>
                  <p className="text-xs text-[#D8BE99] mt-1">Webhook deliveries from Stripe will appear here.</p>
                </div>
              ) : (
                <div className="border border-[#D4AF37]/20 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-black/60 border-b border-[#D4AF37]/20 text-[#D8BE99]">
                      <tr>
                        <th className="p-2.5">Event Type</th>
                        <th className="p-2.5">Provider</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Received At</th>
                        <th className="p-2.5">Payload ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {webhooks.map((wh, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="p-2.5 font-bold text-[#F3E6D0]">{wh.eventType || wh.type || 'webhook.event'}</td>
                          <td className="p-2.5 uppercase text-neutral-400">{wh.provider || 'Stripe'}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              wh.status === 'Processed' || wh.status === 'Success'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {wh.status || 'Received'}
                            </span>
                          </td>
                          <td className="p-2.5 text-neutral-400">
                            {wh.receivedAt || wh.createdAt ? new Date(wh.receivedAt || wh.createdAt).toLocaleTimeString() : '—'}
                          </td>
                          <td className="p-2.5 text-neutral-400 truncate max-w-[140px]">
                            {wh.payloadId || wh.id || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
