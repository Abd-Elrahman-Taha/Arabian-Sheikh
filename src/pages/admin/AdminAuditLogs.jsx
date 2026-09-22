import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ScrollReveal from '../../components/common/ScrollReveal';
import { useTranslation } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { auditService } from '../../services/auditService';
import {
  Shield,
  ShieldAlert,
  Clock,
  User,
  Filter,
  Search,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Layers,
  Sparkles,
  Copy,
  Check,
  X,
  FileCode,
  Tag,
  ArrowRight,
  Database,
  History,
  Activity
} from 'lucide-react';

const ENTITY_OPTIONS = [
  { value: '', label: 'All Entity Types' },
  { value: 'product', label: 'Product' },
  { value: 'category', label: 'Category' },
  { value: 'subcategory', label: 'Subcategory' },
  { value: 'brand', label: 'Brand' },
  { value: 'coupon', label: 'Coupon' },
  { value: 'promotion', label: 'Promotion' },
  { value: 'order', label: 'Order' },
  { value: 'payment', label: 'Payment' },
  { value: 'review', label: 'Review' },
  { value: 'admin', label: 'Administrator' },
  { value: 'user', label: 'Customer User' }
];

const ACTION_OPTIONS = [
  { value: '', label: 'All Operations' },
  { value: 'created', label: 'Created Entities' },
  { value: 'updated', label: 'Updated Entities' },
  { value: 'deleted', label: 'Deleted Entities' },
  { value: 'translation', label: 'Translations' },
  { value: 'status', label: 'Status Changes' }
];

export default function AdminAuditLogs() {
  const { t } = useTranslation();
  const { success, error: toastError } = useToast();

  // Data state
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [actionCategoryFilter, setActionCategoryFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Selected Log for Inspector Modal
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Fetch logs from backend
  const fetchLogs = useCallback(async () => {
    setRefreshing(true);
    try {
      const params = {
        page,
        pageSize,
        entityType: entityTypeFilter || undefined,
        from: fromDate ? new Date(fromDate).toISOString() : undefined,
        to: toDate ? new Date(toDate).toISOString() : undefined
      };

      const result = await auditService.getAuditLogs(params);
      setLogs(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      setErrorMessage(null);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setErrorMessage(err.message || 'Unable to sync audit logs with live backend telemetry.');
      toastError?.('Failed to fetch audit logs.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, pageSize, entityTypeFilter, fromDate, toDate, toastError]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Client-side quick filter for Search term & Action category
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Search term (matches admin name, email, action, entityId)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const adminName = (log.admin?.name || '').toLowerCase();
        const adminEmail = (log.admin?.email || '').toLowerCase();
        const action = (log.action || '').toLowerCase();
        const entityIdStr = String(log.entityId || '');
        const entityType = (log.entityType || '').toLowerCase();

        const matches =
          adminName.includes(query) ||
          adminEmail.includes(query) ||
          action.includes(query) ||
          entityIdStr.includes(query) ||
          entityType.includes(query);

        if (!matches) return false;
      }

      // 2. Action Category filter
      if (actionCategoryFilter) {
        const act = (log.action || '').toLowerCase();
        if (!act.includes(actionCategoryFilter)) return false;
      }

      return true;
    });
  }, [logs, searchTerm, actionCategoryFilter]);

  // Summary KPIs
  const kpiStats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayLogsCount = logs.filter(l => (l.createdAt || '').slice(0, 10) === todayStr).length;
    const uniqueAdmins = new Set(logs.map(l => l.admin?.email).filter(Boolean)).size;
    const uniqueEntities = new Set(logs.map(l => l.entityType).filter(Boolean)).size;

    return {
      total: totalCount,
      today: todayLogsCount,
      admins: uniqueAdmins || 1,
      entities: uniqueEntities || 1
    };
  }, [logs, totalCount]);

  // Copy helper
  const handleCopy = (text, key) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(typeof text === 'object' ? JSON.stringify(text, null, 2) : String(text));
      setCopiedKey(key);
      success('Copied to clipboard');
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Format date helper
  const formatDateTime = (isoDate) => {
    if (!isoDate) return '—';
    try {
      return new Date(isoDate).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return isoDate;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-[#F3E6D0]">
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-[#D4AF37]/20 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8C6239] via-[#D4AF37] to-[#8C6239] flex items-center justify-center text-black shadow-lg">
              <ShieldAlert className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="font-cinzel text-2xl sm:text-4xl font-bold uppercase tracking-wider text-[#F3E6D0]">
                Audit Logs & Telemetry
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Security Trail
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#D8BE99] font-medium mt-2">
            Immutable administrative action ledger: track all record updates, deletions, translations, and promotions across the royal system.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Refresh button */}
          <button
            onClick={fetchLogs}
            disabled={refreshing}
            className="px-4 py-2 sm:py-2.5 rounded-full border border-[#D4AF37]/40 bg-black/60 hover:bg-[#21130D] text-xs sm:text-sm font-cinzel font-bold text-[#F3E6D0] hover:text-[#F2D675] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            title="Force refresh audit logs from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Logs'}</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <ScrollReveal direction="up">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
          {/* Total Events */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-2 shadow-xl backdrop-blur-md hover:border-[#D4AF37] transition-all">
            <div className="flex justify-between items-center text-[#F2D675]">
              <span className="text-xs uppercase tracking-wider font-cinzel font-bold truncate">
                Total Audit Events
              </span>
              <History className="w-4 h-4 text-[#F2D675]" />
            </div>
            <p className="font-cinzel text-xl sm:text-3xl font-bold text-[#F3E6D0]">
              {kpiStats.total}
            </p>
            <span className="text-[11px] text-[#A69076] font-mono block">
              Permanent immutable records
            </span>
          </div>

          {/* Today's Activity */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-2 shadow-xl backdrop-blur-md hover:border-[#D4AF37] transition-all">
            <div className="flex justify-between items-center text-[#F2D675]">
              <span className="text-xs uppercase tracking-wider font-cinzel font-bold truncate">
                Recorded In Batch
              </span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="font-cinzel text-xl sm:text-3xl font-bold text-emerald-400">
              {logs.length}
            </p>
            <span className="text-[11px] text-[#A69076] font-mono block">
              Active page snapshot
            </span>
          </div>

          {/* Active Admins */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-2 shadow-xl backdrop-blur-md hover:border-[#D4AF37] transition-all">
            <div className="flex justify-between items-center text-[#F2D675]">
              <span className="text-xs uppercase tracking-wider font-cinzel font-bold truncate">
                Actor Administrators
              </span>
              <User className="w-4 h-4 text-[#F2D675]" />
            </div>
            <p className="font-cinzel text-xl sm:text-3xl font-bold text-[#F3E6D0]">
              {kpiStats.admins}
            </p>
            <span className="text-[11px] text-[#A69076] font-mono block">
              Authorized operators
            </span>
          </div>

          {/* Target Entities */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-2 shadow-xl backdrop-blur-md hover:border-[#D4AF37] transition-all">
            <div className="flex justify-between items-center text-[#F2D675]">
              <span className="text-xs uppercase tracking-wider font-cinzel font-bold truncate">
                Entity Scopes
              </span>
              <Database className="w-4 h-4 text-[#F2D675]" />
            </div>
            <p className="font-cinzel text-xl sm:text-3xl font-bold text-[#F3E6D0]">
              {kpiStats.entities}
            </p>
            <span className="text-[11px] text-[#A69076] font-mono block">
              Distinct modified modules
            </span>
          </div>
        </div>
      </ScrollReveal>

      {/* 3. Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-[#D4AF37]/30 backdrop-blur-md space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by admin name, email, action or entity ID..."
              className="w-full bg-[#14120F] border border-[#D4AF37]/30 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-[#F3E6D0] placeholder-[#A69076] focus:border-[#D4AF37] focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A69076] hover:text-[#F3E6D0]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Entity Type Filter */}
          <div className="w-full md:w-48">
            <select
              value={entityTypeFilter}
              onChange={(e) => {
                setEntityTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#14120F] border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
            >
              {ENTITY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-[#14120F] text-[#F3E6D0]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Category Filter */}
          <div className="w-full md:w-44">
            <select
              value={actionCategoryFilter}
              onChange={(e) => setActionCategoryFilter(e.target.value)}
              className="w-full bg-[#14120F] border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
            >
              {ACTION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-[#14120F] text-[#F3E6D0]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Page size */}
          <div className="w-full md:w-28">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="w-full bg-[#14120F] border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-[#F2D675] focus:border-[#D4AF37] focus:outline-none cursor-pointer font-mono font-bold"
            >
              <option value={10} className="bg-[#14120F]">10 / page</option>
              <option value={20} className="bg-[#14120F]">20 / page</option>
              <option value={50} className="bg-[#14120F]">50 / page</option>
              <option value={100} className="bg-[#14120F]">100 / page</option>
            </select>
          </div>
        </div>

        {/* Date Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#D4AF37]/10 text-xs">
          <span className="text-[#A69076] flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
            Date Filter:
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[#A69076]">From</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              className="bg-[#14120F] border border-[#D4AF37]/30 rounded-lg px-2.5 py-1 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#A69076]">To</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              className="bg-[#14120F] border border-[#D4AF37]/30 rounded-lg px-2.5 py-1 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          {(fromDate || toDate) && (
            <button
              onClick={() => {
                setFromDate('');
                setToDate('');
                setPage(1);
              }}
              className="text-[#D4AF37] hover:underline text-xs ml-2 cursor-pointer"
            >
              Clear Dates
            </button>
          )}

          <span className="ml-auto text-xs text-[#A69076] font-mono">
            Showing {filteredLogs.length} of {totalCount} events
          </span>
        </div>
      </div>

      {/* 4. Logs Table */}
      <div className="rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 shadow-2xl backdrop-blur-md overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#D4AF37]">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <p className="font-cinzel text-xs uppercase tracking-wider">Loading security audit records...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Shield className="w-10 h-10 text-[#A69076] mx-auto opacity-50" />
            <p className="font-cinzel text-base font-bold text-[#F3E6D0]">No Audit Records Found</p>
            <p className="text-xs text-[#A69076] max-w-md mx-auto font-sans">
              No audit logs matched your search or filter parameters. Clear filters to inspect all operational events.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm font-sans">
              <thead>
                <tr className="border-b border-[#D4AF37]/25 text-[#F2D675] uppercase font-cinzel font-bold text-xs bg-black/40">
                  <th className="py-3.5 px-4">Event ID</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Administrator</th>
                  <th className="py-3.5 px-4">Operation</th>
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 px-4">Changes Preview</th>
                  <th className="py-3.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/15 text-[#F3E6D0]">
                {filteredLogs.map((log) => {
                  const badge = auditService.getActionBadge(log.action);
                  const changes = auditService.computeChanges(log.oldValue, log.newValue);

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-white/5 transition-colors cursor-pointer group"
                      onClick={() => setSelectedLog(log)}
                    >
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#D8BE99]">
                        #{log.id}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 font-mono text-xs text-[#A69076] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-[#D4AF37] shrink-0" />
                          <span>{formatDateTime(log.createdAt)}</span>
                        </div>
                      </td>

                      {/* Admin Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#8C6239] to-[#D4AF37] text-black font-bold font-cinzel text-xs flex items-center justify-center shrink-0">
                            {(log.admin?.name || 'A')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-[#F3E6D0] text-xs truncate">
                              {log.admin?.name || 'Administrator'}
                            </p>
                            <p className="text-[10px] text-[#A69076] font-mono truncate">
                              {log.admin?.email || `ID #${log.admin?.id || '—'}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Operation Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-bold uppercase tracking-wide ${badge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {log.action}
                        </span>
                      </td>

                      {/* Target Entity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-xs text-[#F2D675] bg-[#14120F] border border-[#D4AF37]/30 px-2 py-0.5 rounded">
                          {log.entityType} <span className="text-[#A69076]">#{log.entityId}</span>
                        </span>
                      </td>

                      {/* Changes preview */}
                      <td className="py-3.5 px-4 max-w-xs truncate text-xs text-[#D8BE99]">
                        {changes.length > 0 ? (
                          <span>
                            Modified <strong className="text-[#F2D675] font-mono">{changes.length}</strong> field{changes.length !== 1 ? 's' : ''}:{' '}
                            {changes.map(c => c.field).slice(0, 2).join(', ')}
                            {changes.length > 2 && '...'}
                          </span>
                        ) : (
                          <span className="text-[#A69076] italic">No direct property change</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-[#D4AF37]/30 group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37]/10 text-xs font-cinzel font-bold text-[#F2D675] inline-flex items-center gap-1.5 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Pagination Bar */}
        <div className="p-4 border-t border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A69076] font-mono">
          <div>
            Showing Page <strong className="text-[#F2D675]">{page}</strong> of <strong className="text-[#F2D675]">{totalPages}</strong> ({totalCount} total events recorded)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-[#D4AF37]/30 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 text-[#F3E6D0] flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-2 font-bold text-[#F2D675]">{page}</span>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-[#D4AF37]/30 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 text-[#F3E6D0] flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Diff & Details Inspector Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] bg-[#0E0C09] border border-[#D4AF37]/50 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between overflow-hidden space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#D4AF37]/20 pb-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-cinzel font-bold text-lg text-[#F2D675]">
                    Audit Record #{selectedLog.id}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full border text-xs font-mono font-bold uppercase ${auditService.getActionBadge(selectedLog.action).bg}`}>
                    {selectedLog.action}
                  </span>
                  <span className="font-mono text-xs text-[#D8BE99] bg-[#14120F] border border-[#D4AF37]/30 px-2 py-0.5 rounded">
                    {selectedLog.entityType} ID: #{selectedLog.entityId}
                  </span>
                </div>
                <p className="text-xs text-[#A69076] font-mono flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Recorded At: {formatDateTime(selectedLog.createdAt)}
                </p>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-full border border-[#D4AF37]/40 flex items-center justify-center text-[#A69076] hover:text-[#F3E6D0] hover:border-[#D4AF37] transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Admin Metadata Card */}
            <div className="p-4 rounded-xl border border-[#D4AF37]/25 bg-black/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8C6239] to-[#D4AF37] text-black font-cinzel font-bold text-sm flex items-center justify-center shrink-0">
                  {(selectedLog.admin?.name || 'A')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-cinzel font-bold text-[#F3E6D0] text-sm">
                    {selectedLog.admin?.name || 'System Administrator'}
                  </p>
                  <p className="text-[#D8BE99]">
                    {selectedLog.admin?.email || 'No email registered'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[#A69076]">Admin ID:</span>{' '}
                <strong className="text-[#F2D675]">#{selectedLog.admin?.id || '—'}</strong>
              </div>
            </div>

            {/* Side-by-Side Diff Comparison */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="flex items-center justify-between text-xs font-cinzel font-bold uppercase text-[#D8BE99]">
                <span>State Transition Diff</span>
                <span className="font-mono lowercase text-[#A69076] font-normal">
                  (Old Value vs New Value)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Old Value */}
                <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-950/15 space-y-2 flex flex-col">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-rose-300">
                    <span className="uppercase flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      Previous State (Old)
                    </span>
                    <button
                      onClick={() => handleCopy(selectedLog.oldValue, 'old')}
                      className="text-rose-300 hover:text-white flex items-center gap-1 cursor-pointer"
                      title="Copy raw JSON"
                    >
                      {copiedKey === 'old' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="flex-1 p-3 rounded-xl bg-black/60 border border-white/5 font-mono text-[11px] text-[#E5D2B8] overflow-x-auto max-h-72 leading-relaxed">
                    {selectedLog.oldValue === null || selectedLog.oldValue === undefined
                      ? 'null (No previous value / Created record)'
                      : typeof selectedLog.oldValue === 'object'
                      ? JSON.stringify(selectedLog.oldValue, null, 2)
                      : String(selectedLog.oldValue)}
                  </pre>
                </div>

                {/* 2. New Value */}
                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/15 space-y-2 flex flex-col">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-300">
                    <span className="uppercase flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Committed State (New)
                    </span>
                    <button
                      onClick={() => handleCopy(selectedLog.newValue, 'new')}
                      className="text-emerald-300 hover:text-white flex items-center gap-1 cursor-pointer"
                      title="Copy raw JSON"
                    >
                      {copiedKey === 'new' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="flex-1 p-3 rounded-xl bg-black/60 border border-white/5 font-mono text-[11px] text-[#E5D2B8] overflow-x-auto max-h-72 leading-relaxed">
                    {selectedLog.newValue === null || selectedLog.newValue === undefined
                      ? 'null (Deleted / Cleared entity)'
                      : typeof selectedLog.newValue === 'object'
                      ? JSON.stringify(selectedLog.newValue, null, 2)
                      : String(selectedLog.newValue)}
                  </pre>
                </div>
              </div>

              {/* Structured Key Changes Summary */}
              {auditService.computeChanges(selectedLog.oldValue, selectedLog.newValue).length > 0 && (
                <div className="p-4 rounded-2xl border border-[#D4AF37]/25 bg-black/40 space-y-3">
                  <h4 className="font-cinzel text-xs font-bold text-[#F2D675] uppercase tracking-wider">
                    Changed Fields Breakdown
                  </h4>
                  <div className="space-y-2 text-xs font-mono">
                    {auditService.computeChanges(selectedLog.oldValue, selectedLog.newValue).map((ch, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-[#14120F] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <span className="text-[#F2D675] font-bold">{ch.field}:</span>
                        <div className="flex items-center gap-2 overflow-x-auto text-[11px]">
                          <span className="text-rose-400 line-through truncate max-w-xs">
                            {JSON.stringify(ch.oldValue)}
                          </span>
                          <ArrowRight className="w-3 h-3 text-[#A69076] shrink-0" />
                          <span className="text-emerald-400 font-bold truncate max-w-xs">
                            {JSON.stringify(ch.newValue)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#D4AF37]/20 flex items-center justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-6 py-2.5 rounded-full bg-[#1C160C] hover:bg-[#2A1F11] border border-[#D4AF37]/40 text-xs font-cinzel font-bold text-[#F3E6D0] hover:text-[#F2D675] transition-all cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
