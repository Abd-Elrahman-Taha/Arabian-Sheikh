import React, { useState, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  Search,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  CreditCard,
  User,
  Package
} from 'lucide-react';
import returnsService, {
  RETURN_STATUSES,
  getReturnErrorMessage
} from '../../services/returnsService';
import AdminReturnReviewModal from '../../components/admin/AdminReturnReviewModal';

export default function AdminReturns() {
  const [data, setData] = useState({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Review Modal State
  const [selectedReturnId, setSelectedReturnId] = useState(null);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const result = await returnsService.getAdminReturns({
        page,
        pageSize,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        orderNumber: orderSearch.trim() || undefined
      });
      setData(result);
    } catch (err) {
      setErrorMessage(getReturnErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, orderSearch]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReturns();
  };

  const handleStatusChange = (newStatus) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#F3E6D0]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-cinzel text-xl font-bold uppercase tracking-wider text-[#F3E6D0]">
                Returns Management
              </h1>
              <p className="text-xs text-[#D8BE99]">
                Adjudicate patron return dossiers, review verification photos, and authorize bank disbursements.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchReturns}
          disabled={loading}
          className="px-4 py-2 bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 text-xs font-cinzel text-[#F3E6D0] hover:text-[#D4AF37] transition-colors rounded-xl flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'PendingReview', 'Approved', 'PartiallyApproved', 'Rejected', 'Cancelled'].map(status => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => handleStatusChange(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-cinzel tracking-wider transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#D4AF37] text-black font-bold shadow-md'
                    : 'bg-white/5 text-neutral-400 hover:text-white border border-white/5'
                }`}
              >
                {status === 'All' ? 'All Returns' : (RETURN_STATUSES[status]?.label || status)}
              </button>
            );
          })}
        </div>

        {/* Order Number Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by order #..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="bg-black/60 border border-white/15 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none placeholder:text-neutral-500 w-48"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 hover:bg-[#D4AF37] text-white hover:text-black text-xs font-cinzel font-bold uppercase rounded-xl transition-colors cursor-pointer"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Table / List View */}
      <div className="rounded-xl border border-white/10 bg-black/30 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-neutral-400 font-cinzel">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#D4AF37]" />
            Loading return dossiers...
          </div>
        ) : data.items.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Package className="w-10 h-10 text-neutral-600 mx-auto" />
            <p className="font-cinzel text-sm text-[#F3E6D0]">No return dossiers found</p>
            <p className="text-xs text-neutral-500">
              {statusFilter !== 'All' || orderSearch
                ? 'No returns match the current filter criteria.'
                : 'No return requests have been submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/50 text-[11px] font-cinzel text-[#D4AF37] uppercase tracking-wider">
                  <th className="p-4">Return ID</th>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Patron</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Refund Amount</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.items.map(ret => {
                  const statusConf = RETURN_STATUSES[ret.status] || {
                    label: ret.status,
                    badgeClass: 'bg-neutral-800 text-neutral-300'
                  };

                  return (
                    <tr
                      key={ret.id}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="p-4 font-mono font-bold text-[#F3E6D0]">
                        #{ret.id}
                      </td>
                      <td className="p-4 font-mono text-[#D8BE99]">
                        #{ret.orderNumber || ret.orderId}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-[#F3E6D0]">{ret.customerName}</div>
                        <div className="text-[11px] text-neutral-400">{ret.customerEmail}</div>
                      </td>
                      <td className="p-4 text-neutral-300">
                        {ret.items?.length || 0} item{ret.items?.length !== 1 ? 's' : ''}
                      </td>
                      <td className="p-4 text-neutral-400">
                        {new Date(ret.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full uppercase border ${statusConf.badgeClass}`}>
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold">
                        {ret.totalRefundAmount > 0 ? (
                          <span className="text-emerald-400">€{ret.totalRefundAmount.toFixed(2)}</span>
                        ) : (
                          <span className="text-neutral-500">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedReturnId(ret.id)}
                          className="px-3 py-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/50 hover:bg-[#D4AF37] text-white hover:text-black text-xs font-cinzel font-bold uppercase rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{ret.status === 'PendingReview' ? 'Adjudicate' : 'View'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {data.totalPages > 1 && (
          <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs text-neutral-400 font-cinzel">
            <span>
              Showing Page <strong className="text-[#F3E6D0]">{data.page}</strong> of <strong className="text-[#F3E6D0]">{data.totalPages}</strong> ({data.totalCount} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={data.page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={data.page >= data.totalPages}
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admin Return Review Modal */}
      <AdminReturnReviewModal
        isOpen={Boolean(selectedReturnId)}
        onClose={() => setSelectedReturnId(null)}
        returnId={selectedReturnId}
        onUpdated={() => {
          fetchReturns();
        }}
      />
    </div>
  );
}
