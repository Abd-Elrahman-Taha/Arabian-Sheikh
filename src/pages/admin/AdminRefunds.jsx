import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  User,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check,
  Loader2,
  Package
} from 'lucide-react';
import returnsService, {
  REFUND_STATUSES,
  getReturnErrorMessage
} from '../../services/returnsService';

export default function AdminRefunds() {
  const [data, setData] = useState({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Mark as paid state
  const [confirmPaidItem, setConfirmPaidItem] = useState(null);
  const [markingPaid, setMarkingPaid] = useState(false);

  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const result = await returnsService.getAdminRefunds({
        page,
        pageSize,
        status: statusFilter !== 'All' ? statusFilter : undefined
      });
      setData(result);
    } catch (err) {
      setErrorMessage(getReturnErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter]);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const handleStatusChange = (newStatus) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const handleConfirmMarkPaid = async () => {
    if (!confirmPaidItem) return;
    setMarkingPaid(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await returnsService.markRefundPaid(confirmPaidItem.id);
      setSuccessMessage(`Refund for item #${confirmPaidItem.id} marked as paid successfully.`);
      setConfirmPaidItem(null);
      await fetchRefunds();
    } catch (err) {
      setErrorMessage(getReturnErrorMessage(err));
    } finally {
      setMarkingPaid(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#F3E6D0]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-cinzel text-xl font-bold uppercase tracking-wider text-[#F3E6D0]">
                Refunds & Disbursements
              </h1>
              <p className="text-xs text-[#D8BE99]">
                Manage approved patron refunds, inspect bank transfer coordinates, and verify disbursements.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchRefunds}
          disabled={loading}
          className="px-4 py-2 bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 text-xs font-cinzel text-[#F3E6D0] hover:text-[#D4AF37] transition-colors rounded-xl flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-wrap items-center gap-2">
        {['All', 'Pending', 'Paid'].map(status => {
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => handleStatusChange(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-cinzel tracking-wider transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#D4AF37] text-black font-bold shadow-md'
                  : 'bg-white/5 text-neutral-400 hover:text-white border border-white/5'
              }`}
            >
              {status === 'All' ? 'All Refunds' : (REFUND_STATUSES[status]?.label || status)}
            </button>
          );
        })}
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Table / List View */}
      <div className="rounded-xl border border-white/10 bg-black/30 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-neutral-400 font-cinzel">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#D4AF37]" />
            Loading refund disbursements...
          </div>
        ) : data.items.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <DollarSign className="w-10 h-10 text-neutral-600 mx-auto" />
            <p className="font-cinzel text-sm text-[#F3E6D0]">No refund disbursements found</p>
            <p className="text-xs text-neutral-500">
              {statusFilter !== 'All'
                ? 'No refunds match the current filter criteria.'
                : 'No approved refund items are pending payment.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/50 text-[11px] font-cinzel text-[#D4AF37] uppercase tracking-wider">
                  <th className="p-4">Item #</th>
                  <th className="p-4">Order / Return</th>
                  <th className="p-4">Patron</th>
                  <th className="p-4">Bank Coordinates</th>
                  <th className="p-4">Item & Quantity</th>
                  <th className="p-4">Refund Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.items.map(ref => {
                  const isPaid = Boolean(ref.paidAt || ref.status === 'Paid');
                  const statusConf = isPaid ? REFUND_STATUSES.Paid : REFUND_STATUSES.Pending;

                  return (
                    <tr
                      key={ref.id}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="p-4 font-mono font-bold text-[#F3E6D0]">
                        #{ref.id}
                      </td>
                      <td className="p-4 font-mono text-[#D8BE99]">
                        <div>Order: #{ref.orderNumber || '—'}</div>
                        {ref.returnRequestId > 0 && (
                          <div className="text-[10px] text-neutral-400">Return: #{ref.returnRequestId}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-[#F3E6D0]">{ref.customer}</div>
                        <div className="text-[11px] text-neutral-400">{ref.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-[11px] font-medium text-[#F3E6D0]">
                          {ref.bankName || 'Bank N/A'}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {ref.accountHolder || ref.bankAccountHolderName}
                        </div>
                        <div className="font-mono text-[#D4AF37] text-[11px] select-all">
                          {ref.bankAccount || ref.bankAccountNumber || '—'}
                        </div>
                      </td>
                      <td className="p-4 text-neutral-300">
                        <div className="font-medium text-[#F3E6D0]">{ref.productName || ref.name || 'Imperial Flacon'}</div>
                        <div className="text-[10px] text-neutral-400">Qty: {ref.quantity || 1}</div>
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-400 text-sm">
                        €{Number(ref.refundAmount || ref.amount || 0).toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full uppercase border ${statusConf.badgeClass}`}>
                          {statusConf.label}
                        </span>
                        {isPaid && ref.paidAt && (
                          <span className="block text-[10px] text-neutral-400 mt-1 font-mono">
                            {new Date(ref.paidAt).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {!isPaid ? (
                          <button
                            type="button"
                            onClick={() => setConfirmPaidItem(ref)}
                            className="px-3 py-1.5 bg-emerald-600/30 border border-emerald-500/60 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-cinzel font-bold uppercase rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark as Paid</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-mono text-neutral-500 italic">Disbursed</span>
                        )}
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

      {/* Confirmation Modal for Mark as Paid */}
      {confirmPaidItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#120B06] border border-[#D4AF37]/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-[#F3E6D0]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-cinzel text-base font-bold uppercase tracking-wider">
                  Authorize Refund Disbursement
                </h3>
              </div>
              <button
                onClick={() => setConfirmPaidItem(null)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#D8BE99] leading-relaxed">
              Confirm that you have completed the wire transfer of{' '}
              <strong className="text-emerald-400 font-mono text-sm">
                €{Number(confirmPaidItem.refundAmount || confirmPaidItem.amount || 0).toFixed(2)}
              </strong>{' '}
              to patron <strong className="text-[#F3E6D0]">{confirmPaidItem.customer}</strong>.
            </p>

            <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 text-xs space-y-1 font-mono">
              <p><span className="text-neutral-500">Bank:</span> {confirmPaidItem.bankName}</p>
              <p><span className="text-neutral-500">Account:</span> {confirmPaidItem.bankAccount || confirmPaidItem.bankAccountNumber}</p>
              <p><span className="text-neutral-500">Holder:</span> {confirmPaidItem.accountHolder || confirmPaidItem.bankAccountHolderName}</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmPaidItem(null)}
                disabled={markingPaid}
                className="px-4 py-2 bg-white/5 border border-white/10 text-xs font-cinzel text-[#F3E6D0] hover:bg-white/10 transition-colors cursor-pointer rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMarkPaid}
                disabled={markingPaid}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-cinzel font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-lg shadow-md flex items-center gap-2"
              >
                {markingPaid ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm Disbursement</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
