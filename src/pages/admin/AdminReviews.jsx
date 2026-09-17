import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { reviewService } from '../../services/reviewService';
import { useToast } from '../../context/ToastContext';
import {
  Star,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  EyeOff,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  ShoppingBag,
  Clock,
  Filter,
  X,
  MessageSquare,
  FileText
} from 'lucide-react';

const STATUS_TABS = [
  { id: 'ALL', label: 'All Reviews' },
  { id: 'Pending', label: 'Pending Moderation', color: 'text-amber-400 border-amber-500/50 bg-amber-500/10' },
  { id: 'Approved', label: 'Approved & Public', color: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10' },
  { id: 'Rejected', label: 'Rejected', color: 'text-rose-400 border-rose-500/50 bg-rose-500/10' },
  { id: 'Hidden', label: 'Hidden Vault', color: 'text-neutral-400 border-neutral-500/50 bg-neutral-500/10' }
];

const RATING_OPTIONS = [
  { value: 'ALL', label: 'All Ratings' },
  { value: '5', label: '5 Stars (Royal)' },
  { value: '4', label: '4 Stars (Very Good)' },
  { value: '3', label: '3 Stars (Good)' },
  { value: '2', label: '2 Stars (Modest)' },
  { value: '1', label: '1 Star (Poor)' }
];

export default function AdminReviews() {
  const { t } = useTranslation();
  const { success, error, info } = useToast();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [isReportedFilter, setIsReportedFilter] = useState(false);
  const [searchProduct, setSearchProduct] = useState('');
  const [productIdFilter, setProductIdFilter] = useState('');

  // Modals state
  const [approveModal, setApproveModal] = useState({ open: false, review: null, note: '', submitting: false });
  const [rejectModal, setRejectModal] = useState({ open: false, review: null, reason: '', submitting: false, error: '' });
  const [hideModal, setHideModal] = useState({ open: false, review: null, submitting: false });

  // Metrics overview
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejectedOrHidden: 0
  });

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize
      };

      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (ratingFilter !== 'ALL') {
        params.rating = Number(ratingFilter);
      }
      if (isReportedFilter) {
        params.isReported = true;
      }
      if (productIdFilter && !isNaN(Number(productIdFilter))) {
        params.productId = Number(productIdFilter);
      }

      const res = await reviewService.adminGetReviews(params);
      let items = res.items || [];

      // Optional client-side product name filter if user typed text instead of ID
      if (searchProduct.trim() && isNaN(Number(searchProduct.trim()))) {
        const q = searchProduct.toLowerCase().trim();
        items = items.filter(r => (r.productName || '').toLowerCase().includes(q));
      }

      setReviews(items);
      setTotalCount(res.totalCount || items.length);
      setTotalPages(res.totalPages || 1);
      setHasPreviousPage(res.hasPreviousPage || page > 1);
      setHasNextPage(res.hasNextPage || page < (res.totalPages || 1));

      // Calculate quick metric counts
      setMetrics(prev => ({
        ...prev,
        total: res.totalCount || items.length,
        pending: items.filter(r => r.status === 'Pending').length,
        approved: items.filter(r => r.status === 'Approved').length,
        rejectedOrHidden: items.filter(r => r.status === 'Rejected' || r.status === 'Hidden').length
      }));
    } catch (err) {
      console.warn('Failed to load reviews queue:', err.message);
      error(err.message || 'Failed to load reviews moderation queue.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, ratingFilter, isReportedFilter, productIdFilter, searchProduct]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Handle Search Input (Auto-detect ID vs text)
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchProduct(val);
    setPage(1);
    if (!isNaN(Number(val.trim())) && val.trim() !== '') {
      setProductIdFilter(val.trim());
    } else {
      setProductIdFilter('');
    }
  };

  // 1. APPROVE ACTION
  const handleOpenApprove = (review) => {
    setApproveModal({
      open: true,
      review,
      note: '',
      submitting: false
    });
  };

  const handleConfirmApprove = async () => {
    if (!approveModal.review) return;
    setApproveModal(prev => ({ ...prev, submitting: true }));
    try {
      await reviewService.adminApproveReview(approveModal.review.id, approveModal.note);
      success(`Review #${approveModal.review.id} has been Approved and published.`);
      setApproveModal({ open: false, review: null, note: '', submitting: false });
      loadReviews();
    } catch (err) {
      error(err.message || 'Failed to approve review.');
      setApproveModal(prev => ({ ...prev, submitting: false }));
    }
  };

  // 2. REJECT ACTION
  const handleOpenReject = (review) => {
    setRejectModal({
      open: true,
      review,
      reason: '',
      submitting: false,
      error: ''
    });
  };

  const handleConfirmReject = async () => {
    if (!rejectModal.review) return;
    if (!rejectModal.reason.trim()) {
      setRejectModal(prev => ({ ...prev, error: 'A rejection reason is required for audit logs.' }));
      return;
    }
    setRejectModal(prev => ({ ...prev, submitting: true, error: '' }));
    try {
      await reviewService.adminRejectReview(rejectModal.review.id, rejectModal.reason.trim());
      success(`Review #${rejectModal.review.id} has been Rejected.`);
      setRejectModal({ open: false, review: null, reason: '', submitting: false, error: '' });
      loadReviews();
    } catch (err) {
      error(err.message || 'Failed to reject review.');
      setRejectModal(prev => ({ ...prev, submitting: false, error: err.message }));
    }
  };

  // 3. HIDE ACTION
  const handleOpenHide = (review) => {
    setHideModal({
      open: true,
      review,
      submitting: false
    });
  };

  const handleConfirmHide = async () => {
    if (!hideModal.review) return;
    setHideModal(prev => ({ ...prev, submitting: true }));
    try {
      await reviewService.adminHideReview(hideModal.review.id);
      success(`Review #${hideModal.review.id} has been Hidden from the boutique.`);
      setHideModal({ open: false, review: null, submitting: false });
      loadReviews();
    } catch (err) {
      error(err.message || 'Failed to hide review.');
      setHideModal(prev => ({ ...prev, submitting: false }));
    }
  };

  // Render Status Badge helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/15 border border-amber-500/40 text-amber-300">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
            <CheckCircle className="w-3 h-3" />
            <span>Approved</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-rose-500/15 border border-rose-500/40 text-rose-300">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
      case 'Hidden':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-neutral-500/15 border border-neutral-500/40 text-neutral-300">
            <EyeOff className="w-3 h-3" />
            <span>Hidden</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/10 text-neutral-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#D4AF37]/20 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37]">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <h1 className="font-cinzel text-2xl md:text-3xl font-bold text-[#F3E6D0]">
              Reviews & Rating Moderation
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Curate patron impressions, enforce verification compliance, and maintain authentic olfactory testimonials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadReviews}
            disabled={loading}
            className="px-4 py-2.5 rounded-full border border-[#D4AF37]/40 bg-[#0B0A08] text-xs font-cinzel text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Telemetry Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0B0A08] border border-white/10 shadow-lg space-y-1">
          <span className="text-[11px] font-cinzel uppercase tracking-wider text-neutral-400">Total in System</span>
          <div className="font-cinzel text-2xl font-bold text-[#F3E6D0]">{totalCount}</div>
          <span className="text-[10px] text-neutral-500">All registered reviews</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B0A08] border border-amber-500/30 shadow-lg space-y-1">
          <span className="text-[11px] font-cinzel uppercase tracking-wider text-amber-400">Pending Review</span>
          <div className="font-cinzel text-2xl font-bold text-amber-300">{metrics.pending}</div>
          <span className="text-[10px] text-amber-500/80">Requires curator decision</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B0A08] border border-emerald-500/30 shadow-lg space-y-1">
          <span className="text-[11px] font-cinzel uppercase tracking-wider text-emerald-400">Approved & Public</span>
          <div className="font-cinzel text-2xl font-bold text-emerald-300">{metrics.approved}</div>
          <span className="text-[10px] text-emerald-500/80">Visible on storefront</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B0A08] border border-rose-500/30 shadow-lg space-y-1">
          <span className="text-[11px] font-cinzel uppercase tracking-wider text-rose-400">Rejected / Vault</span>
          <div className="font-cinzel text-2xl font-bold text-rose-300">{metrics.rejectedOrHidden}</div>
          <span className="text-[10px] text-rose-500/80">Filtered from catalog</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4 p-5 rounded-2xl bg-[#0B0A08] border border-white/10">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setStatusFilter(tab.id); setPage(1); }}
              className={`px-4 py-2 rounded-full text-xs font-cinzel font-bold tracking-wider transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#D4AF37] text-black shadow-md'
                  : 'bg-black/50 border border-white/10 text-neutral-300 hover:border-[#D4AF37]/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Secondary Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
          {/* Product Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Flacon name or ID..."
              value={searchProduct}
              onChange={handleSearchChange}
              className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none placeholder:text-neutral-500"
            />
            {searchProduct && (
              <button
                onClick={() => { setSearchProduct(''); setProductIdFilter(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Star Rating Filter */}
          <div>
            <select
              value={ratingFilter}
              onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
            >
              {RATING_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#120B06]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reported / Flagged Toggle */}
          <div>
            <button
              onClick={() => { setIsReportedFilter(!isReportedFilter); setPage(1); }}
              className={`w-full py-2 px-4 rounded-xl border text-xs font-cinzel font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                isReportedFilter
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                  : 'bg-black/60 border-white/10 text-neutral-400 hover:border-white/30'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Flagged by Users Only</span>
            </button>
          </div>

          {/* Reset Filters button */}
          {(statusFilter !== 'ALL' || ratingFilter !== 'ALL' || isReportedFilter || searchProduct) && (
            <div>
              <button
                onClick={() => {
                  setStatusFilter('ALL');
                  setRatingFilter('ALL');
                  setIsReportedFilter(false);
                  setSearchProduct('');
                  setProductIdFilter('');
                  setPage(1);
                }}
                className="w-full py-2 px-3 rounded-xl border border-white/10 text-xs text-neutral-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Moderation Table / Cards */}
      <div className="rounded-2xl bg-[#0B0A08] border border-white/10 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF37] mx-auto" />
            <p className="text-xs font-cinzel uppercase tracking-wider text-neutral-400">Loading moderation records...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <ShieldCheck className="w-10 h-10 text-[#D4AF37]/50 mx-auto" />
            <h3 className="font-cinzel text-base font-bold text-[#F3E6D0]">No Reviews Found</h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              There are no customer reviews matching the current filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-[11px] font-cinzel uppercase tracking-wider text-[#D8BE99]">
                  <th className="py-4 px-4 font-bold">ID</th>
                  <th className="py-4 px-4 font-bold">Product</th>
                  <th className="py-4 px-4 font-bold">Customer & Order</th>
                  <th className="py-4 px-4 font-bold">Rating</th>
                  <th className="py-4 px-6 font-bold">Review Comment</th>
                  <th className="py-4 px-4 font-bold">Status</th>
                  <th className="py-4 px-4 font-bold">Date</th>
                  <th className="py-4 px-4 font-bold text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reviews.map((rev) => (
                  <tr
                    key={rev.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    {/* ID & Flag */}
                    <td className="py-4 px-4 align-top font-mono text-[11px] text-neutral-400">
                      <div>#{rev.id}</div>
                      {rev.isReported && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-bold bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-500/40 mt-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>Flagged</span>
                        </span>
                      )}
                    </td>

                    {/* Product */}
                    <td className="py-4 px-4 align-top">
                      <div className="font-cinzel font-bold text-[#F3E6D0] line-clamp-1 max-w-[170px]">
                        {rev.productName || `Product #${rev.productId || '—'}`}
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500">
                        PID: {rev.productId || '—'}
                      </span>
                    </td>

                    {/* Customer & Order */}
                    <td className="py-4 px-4 align-top space-y-0.5">
                      <div className="font-semibold text-neutral-200 line-clamp-1 max-w-[150px]">
                        {rev.userName || rev.author || 'Anonymous'}
                      </div>
                      <div className="text-[10px] font-mono text-[#D4AF37] flex items-center gap-1">
                        <ShoppingBag className="w-2.5 h-2.5" />
                        <span>Order #{rev.orderId || '—'}</span>
                      </div>
                      {rev.userId && (
                        <div className="text-[10px] font-mono text-neutral-500">
                          UID: {rev.userId}
                        </div>
                      )}
                    </td>

                    {/* Star Rating */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex text-[#D4AF37] gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${s <= Number(rev.rating) ? 'fill-current' : 'text-neutral-600'}`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono font-bold text-neutral-400 mt-0.5 block">
                        {rev.rating}.0 / 5.0
                      </span>
                    </td>

                    {/* Comment Body */}
                    <td className="py-4 px-6 align-top max-w-sm">
                      {rev.comment ? (
                        <p className="text-neutral-300 text-xs leading-relaxed line-clamp-3">
                          "{rev.comment}"
                        </p>
                      ) : (
                        <span className="italic text-neutral-500 text-[11px]">No written commentary.</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 align-top">
                      {renderStatusBadge(rev.status)}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 align-top text-neutral-400 text-[11px] whitespace-nowrap">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : '—'}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-4 align-top text-right">
                      {rev.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenApprove(rev)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-black font-cinzel text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                            title="Approve and Publish to boutique"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleOpenReject(rev)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 hover:bg-rose-500 hover:text-white font-cinzel text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                            title="Reject review"
                          >
                            Reject
                          </button>
                        </div>
                      ) : rev.status === 'Approved' ? (
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleOpenHide(rev)}
                            className="px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-600 text-neutral-300 hover:border-amber-500 hover:text-amber-400 font-cinzel text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                            title="Hide from public view"
                          >
                            <EyeOff className="w-3 h-3" />
                            <span>Hide</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-neutral-500 font-mono italic">
                          Locked
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer with Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs">
            <span className="text-neutral-400">
              Showing page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong> ({totalCount} total)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!hasPreviousPage || page === 1}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-neutral-300 hover:border-[#D4AF37] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={!hasNextPage || page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-neutral-300 hover:border-[#D4AF37] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 1. APPROVE MODAL */}
      {approveModal.open && approveModal.review && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0D0B08] border border-emerald-500/40 rounded-2xl p-6 space-y-5 shadow-2xl text-[#F3E6D0]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-5 h-5" />
                <h3 className="font-cinzel text-base font-bold uppercase tracking-wider">
                  Approve Review
                </h3>
              </div>
              <button
                onClick={() => setApproveModal({ open: false, review: null, note: '', submitting: false })}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-1.5 text-xs">
              <div className="font-cinzel font-bold text-[#D4AF37]">
                {approveModal.review.productName}
              </div>
              <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
                <span>By {approveModal.review.userName}</span>
                <span>•</span>
                <span>Order #{approveModal.review.orderId}</span>
                <span>•</span>
                <span className="text-[#D4AF37]">{approveModal.review.rating} ★</span>
              </div>
              <p className="text-neutral-300 italic pt-1 text-[11px] line-clamp-3">
                "{approveModal.review.comment}"
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-cinzel font-bold uppercase text-neutral-400">
                Audit Note (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Verified patron authenticity confirmed"
                value={approveModal.note}
                onChange={(e) => setApproveModal(prev => ({ ...prev, note: e.target.value }))}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F3E6D0] focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setApproveModal({ open: false, review: null, note: '', submitting: false })}
                className="px-4 py-2 text-xs uppercase font-cinzel rounded-full border border-white/20 text-neutral-300 hover:border-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                disabled={approveModal.submitting}
                className="px-5 py-2 text-xs uppercase font-cinzel font-bold tracking-wider rounded-full bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {approveModal.submitting ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. REJECT MODAL */}
      {rejectModal.open && rejectModal.review && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0D0B08] border border-rose-500/40 rounded-2xl p-6 space-y-5 shadow-2xl text-[#F3E6D0]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <XCircle className="w-5 h-5" />
                <h3 className="font-cinzel text-base font-bold uppercase tracking-wider">
                  Reject Review
                </h3>
              </div>
              <button
                onClick={() => setRejectModal({ open: false, review: null, reason: '', submitting: false, error: '' })}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-1.5 text-xs">
              <div className="font-cinzel font-bold text-neutral-200">
                {rejectModal.review.productName}
              </div>
              <p className="text-neutral-400 italic text-[11px] line-clamp-3">
                "{rejectModal.review.comment}"
              </p>
            </div>

            {rejectModal.error && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{rejectModal.error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-cinzel font-bold uppercase text-rose-400 flex items-center justify-between">
                <span>Reason for Rejection:</span>
                <span className="text-rose-500 text-[10px]">* Required</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Explain reason (e.g. Inappropriate language, off-topic, spam)..."
                value={rejectModal.reason}
                onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value, error: '' }))}
                className="w-full bg-black/60 border border-rose-500/30 rounded-xl p-3 text-xs text-[#F3E6D0] focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModal({ open: false, review: null, reason: '', submitting: false, error: '' })}
                className="px-4 py-2 text-xs uppercase font-cinzel rounded-full border border-white/20 text-neutral-300 hover:border-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={rejectModal.submitting}
                className="px-5 py-2 text-xs uppercase font-cinzel font-bold tracking-wider rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {rejectModal.submitting ? 'Rejecting...' : 'Reject Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. HIDE MODAL */}
      {hideModal.open && hideModal.review && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0D0B08] border border-white/20 rounded-2xl p-6 space-y-5 shadow-2xl text-[#F3E6D0]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-neutral-300">
                <EyeOff className="w-5 h-5 text-amber-400" />
                <h3 className="font-cinzel text-base font-bold uppercase tracking-wider">
                  Hide Review from Public
                </h3>
              </div>
              <button
                onClick={() => setHideModal({ open: false, review: null, submitting: false })}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to hide Review <strong>#{hideModal.review.id}</strong> on <strong>{hideModal.review.productName}</strong>?
              It will no longer appear in the customer storefront or contribute to aggregate scores.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setHideModal({ open: false, review: null, submitting: false })}
                className="px-4 py-2 text-xs uppercase font-cinzel rounded-full border border-white/20 text-neutral-300 hover:border-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmHide}
                disabled={hideModal.submitting}
                className="px-5 py-2 text-xs uppercase font-cinzel font-bold tracking-wider rounded-full bg-neutral-700 hover:bg-neutral-600 text-white shadow-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {hideModal.submitting ? 'Hiding...' : 'Confirm Hide'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
