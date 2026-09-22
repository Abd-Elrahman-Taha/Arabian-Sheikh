import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
    <div className="space-y-5 sm:space-y-6 animate-fade-in text-[#F3E6D0] w-full max-w-full min-w-0 overflow-x-hidden">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4AF37]/20 pb-4 gap-3 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8C6239] via-[#D4AF37] to-[#8C6239] flex items-center justify-center text-black shadow-md shrink-0">
              <ShieldAlert className="w-4 h-4 text-black" />
            </div>
            <div>
              <h1 className="font-cinzel text-xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
                Audit Logs & Telemetry
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Security Trail
              </span>
            </div>
          </div>
          <p className="text-xs text-[#D8BE99] font-medium mt-1.5 max-w-3xl truncate">
            Immutable administrative action ledger: track all record updates, deletions, translations, and promotions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          {/* Refresh button */}
          <button
            onClick={fetchLogs}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-full border border-[#D4AF37]/40 bg-black/60 hover:bg-[#21130D] text-xs font-cinzel font-bold text-[#F3E6D0] hover:text-[#F2D675] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            title="Force refresh audit logs from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Logs'}</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <ScrollReveal direction="up">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
          {/* Total Events */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-1.5 shadow-xl backdrop-blur-md hover:border-[#D4AF37] transition-all min-w-0">
            <div className="flex justify-between items-center text-[#F2D675]">
              <span className="text-[11px] sm:text-xs uppercase tracking-wider font-cinzel font-bold truncate">
                Total Audit Events
              </span>
              <History className="w-3.5 h-3.5 text-[#F2D675] shrink-0" />
            </div>
            <p className="font-cinzel text-xl sm:text-2xl lg:text-3xl font-bold text-[#F3E6D0]">
              {kpiStats.total}
            </p>
            <span className="text-[10px] text-[#A69076] font-mono block truncate">
              Permanent immutable records
            </span>
          </div>

          {/* Today's Activity */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-1.5 shadow-xl backdrop-blur-md hover:border-[#D4AF37] transition-all min-w-0">
            <div className="flex justify-between items-center text-[#F2D675]">
              <span className="text-[11px] sm:text-xs uppercase tracking-wider font-cinzel font-bold truncate">
                Recorded In Batch
              </span>
              <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </div>
            <p className="font-cinzel text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-400">
              {logs.length}
            </p>
            <span className="text-[10px] text-[#A69076] font-mono block truncate">
              Active page snapshot
            </span>
          </div>

          {/* Active Admins */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-1.5 shadow-xl backdrop-blur-md hover:border-[#D4AF37] transition-all min-w-0">
            <div className="flex justify-between items-center text-[#F2D675]">
              <span className="text-[11px] sm:text-xs uppercase tracking-wider font-cinzel font-bold truncate">
                Actor Administrators
              </span>
              <User className="w-3.5 h-3.5 text-[#F2D675] shrink-0" />
            </div>
            <p className="font-cinzel text-xl sm:text-2xl lg:text-3xl font-bold text-[#F3E6D0]">
              {kpiStats.admins}
            </p>
            <span className="text-[10px] text-[#A69076] font-mono block truncate">
              Authorized operators
            </span>
          </div>

          {/* Target Entities */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-1.5 shadow-xl backdrop-blur-md hover:border-[#D4AF37] transition-all min-w-0">
            <div className="flex justify-between items-center text-[#F2D675]">
              <span className="text-[11px] sm:text-xs uppercase tracking-wider font-cinzel font-bold truncate">
                Entity Scopes
              </span>
              <Database className="w-3.5 h-3.5 text-[#F2D675] shrink-0" />
            </div>
            <p className="font-cinzel text-xl sm:text-2xl lg:text-3xl font-bold text-[#F3E6D0]">
              {kpiStats.entities}
            </p>
            <span className="text-[10px] text-[#A69076] font-mono block truncate">
              Distinct modified modules
            </span>
          </div>
        </div>
      </ScrollReveal>

      {/* 3. Filter Toolbar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-black/60 border border-[#D4AF37]/30 backdrop-blur-md space-y-3 w-full min-w-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3 items-center min-w-0">
          {/* Search box: 5 columns on laptop/desktop */}
          <div className="relative sm:col-span-2 lg:col-span-5 min-w-0">
            <Search className="w-3.5 h-3.5 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by admin name, email, action or ID..."
              className="w-full bg-[#14120F] border border-[#D4AF37]/30 rounded-xl pl-9 pr-7 py-2 text-xs text-[#F3E6D0] placeholder-[#A69076] focus:border-[#D4AF37] focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A69076] hover:text-[#F3E6D0] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Entity Type Filter: 3 columns on laptop/desktop */}
          <div className="sm:col-span-1 lg:col-span-3 min-w-0">
            <select
              value={entityTypeFilter}
              onChange={(e) => {
                setEntityTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#14120F] border border-[#D4AF37]/30 rounded-xl px-2.5 py-2 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer truncate"
            >
              {ENTITY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-[#14120F] text-[#F3E6D0]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Category Filter: 2 columns on laptop/desktop */}
          <div className="sm:col-span-1 lg:col-span-2 min-w-0">
            <select
              value={actionCategoryFilter}
              onChange={(e) => setActionCategoryFilter(e.target.value)}
              className="w-full bg-[#14120F] border border-[#D4AF37]/30 rounded-xl px-2.5 py-2 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer truncate"
            >
              {ACTION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-[#14120F] text-[#F3E6D0]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Page size: 2 columns on laptop/desktop */}
          <div className="sm:col-span-2 lg:col-span-2 min-w-0">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="w-full bg-[#14120F] border border-[#D4AF37]/30 rounded-xl px-2.5 py-2 text-xs text-[#F2D675] focus:border-[#D4AF37] focus:outline-none cursor-pointer font-mono font-bold"
            >
              <option value={10} className="bg-[#14120F]">10 / page</option>
              <option value={20} className="bg-[#14120F]">20 / page</option>
              <option value={50} className="bg-[#14120F]">50 / page</option>
              <option value={100} className="bg-[#14120F]">100 / page</option>
            </select>
          </div>
        </div>

        {/* Date Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#D4AF37]/10 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#A69076] flex items-center gap-1 font-medium text-[11px]">
              <Calendar className="w-3 h-3 text-[#D4AF37]" />
              Date:
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-[#A69076] text-[10px]">From</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                className="bg-[#14120F] border border-[#D4AF37]/30 rounded-lg px-2 py-0.5 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[#A69076] text-[10px]">To</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                className="bg-[#14120F] border border-[#D4AF37]/30 rounded-lg px-2 py-0.5 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            {(fromDate || toDate) && (
              <button
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                  setPage(1);
                }}
                className="text-[#D4AF37] hover:underline text-[11px] ml-1 cursor-pointer font-medium"
              >
                Clear
              </button>
            )}
          </div>

          <span className="text-[11px] text-[#A69076] font-mono">
            Showing {filteredLogs.length} of {totalCount} events
          </span>
        </div>
      </div>

      {/* 4. Logs Table Card */}
      <div className="rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 shadow-2xl backdrop-blur-md overflow-hidden w-full max-w-full min-w-0">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#D4AF37]">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <p className="font-cinzel text-xs uppercase tracking-wider">Loading security audit records...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center space-y-2.5 px-4">
            <Shield className="w-8 h-8 text-[#A69076] mx-auto opacity-50" />
            <p className="font-cinzel text-sm sm:text-base font-bold text-[#F3E6D0]">No Audit Records Found</p>
            <p className="text-xs text-[#A69076] max-w-md mx-auto font-sans">
              No audit logs matched your search or filter parameters. Clear filters to inspect all operational events.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full max-w-full scrollbar-thin scrollbar-thumb-[#D4AF37]/30 scrollbar-track-black/40">
            <table className="w-full min-w-[760px] text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#D4AF37]/25 text-[#F2D675] uppercase font-cinzel font-bold text-[11px] bg-black/40 tracking-wider">
                  <th className="py-3 px-3 w-16">ID</th>
                  <th className="py-3 px-3 w-36">Timestamp</th>
                  <th className="py-3 px-3 min-w-[150px] max-w-[200px]">Administrator</th>
                  <th className="py-3 px-3 w-36">Operation</th>
                  <th className="py-3 px-3 w-28">Entity</th>
                  <th className="py-3 px-3 min-w-[160px] max-w-[240px]">Changes</th>
                  <th className="py-3 px-3 w-24 text-right">Inspect</th>
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
                      <td className="py-2.5 px-3 font-mono font-bold text-[#D8BE99] text-xs">
                        #{log.id}
                      </td>

                      {/* Timestamp */}
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#A69076] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-[#D4AF37] shrink-0" />
                          <span>{formatDateTime(log.createdAt)}</span>
                        </div>
                      </td>

                      {/* Admin Info */}
                      <td className="py-2.5 px-3 max-w-[200px]">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#8C6239] to-[#D4AF37] text-black font-bold font-cinzel text-[10px] flex items-center justify-center shrink-0">
                            {(log.admin?.name || 'A')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0 truncate">
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
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wide ${badge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {log.action}
                        </span>
                      </td>

                      {/* Target Entity */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-[#F2D675] bg-[#14120F] border border-[#D4AF37]/30 px-2 py-0.5 rounded">
                          {log.entityType} <span className="text-[#A69076]">#{log.entityId}</span>
                        </span>
                      </td>

                      {/* Changes preview */}
                      <td className="py-2.5 px-3 max-w-[240px] truncate text-xs text-[#D8BE99]">
                        {changes.length > 0 ? (
                          <span className="truncate block">
                            Modified <strong className="text-[#F2D675] font-mono">{changes.length}</strong> field{changes.length !== 1 ? 's' : ''}:{' '}
                            {changes.map(c => c.field).slice(0, 2).join(', ')}
                            {changes.length > 2 && '...'}
                          </span>
                        ) : (
                          <span className="text-[#A69076] italic">No direct property change</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-[#D4AF37]/30 group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37]/10 text-[11px] font-cinzel font-bold text-[#F2D675] inline-flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
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
        <div className="p-3.5 border-t border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-[#A69076] font-mono">
          <div>
            Page <strong className="text-[#F2D675]">{page}</strong> of <strong className="text-[#F2D675]">{totalPages}</strong> ({totalCount} events)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-2.5 py-1 rounded-lg border border-[#D4AF37]/30 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 text-[#F3E6D0] flex items-center gap-1 cursor-pointer text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <span className="px-2 font-bold text-[#F2D675] text-xs">{page}</span>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-2.5 py-1 rounded-lg border border-[#D4AF37]/30 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 text-[#F3E6D0] flex items-center gap-1 cursor-pointer text-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Diff & Details Inspector Modal */}
      {selectedLog && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-start justify-center p-3 sm:p-5 pt-8 sm:pt-12 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[88vh] bg-[#0E0C09] border border-[#D4AF37]/50 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col justify-between overflow-hidden space-y-4 my-auto sm:my-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#D4AF37]/20 pb-3.5 gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-cinzel font-bold text-base sm:text-lg text-[#F2D675]">
                    Audit Record #{selectedLog.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full border text-[11px] font-mono font-bold uppercase ${auditService.getActionBadge(selectedLog.action).bg}`}>
                    {selectedLog.action}
                  </span>
                  <span className="font-mono text-xs text-[#D8BE99] bg-[#14120F] border border-[#D4AF37]/30 px-2 py-0.5 rounded">
                    {selectedLog.entityType} ID: #{selectedLog.entityId}
                  </span>
                </div>
                <p className="text-[11px] text-[#A69076] font-mono flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#D4AF37]" />
                  Recorded At: {formatDateTime(selectedLog.createdAt)}
                </p>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="w-7 h-7 rounded-full border border-[#D4AF37]/40 flex items-center justify-center text-[#A69076] hover:text-[#F3E6D0] hover:border-[#D4AF37] transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Admin Metadata Card */}
            <div className="p-3 sm:p-3.5 rounded-xl border border-[#D4AF37]/25 bg-black/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-mono">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8C6239] to-[#D4AF37] text-black font-cinzel font-bold text-xs flex items-center justify-center shrink-0">
                  {(selectedLog.admin?.name || 'A')[0].toUpperCase()}
                </div>
                <div className="min-w-0 truncate">
                  <p className="font-cinzel font-bold text-[#F3E6D0] text-xs truncate">
                    {selectedLog.admin?.name || 'System Administrator'}
                  </p>
                  <p className="text-[#D8BE99] text-[11px] truncate">
                    {selectedLog.admin?.email || 'No email registered'}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right shrink-0 text-[11px]">
                <span className="text-[#A69076]">Admin ID:</span>{' '}
                <strong className="text-[#F2D675]">#{selectedLog.admin?.id || '—'}</strong>
              </div>
            </div>

            {/* Side-by-Side Diff Comparison */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="flex items-center justify-between text-xs font-cinzel font-bold uppercase text-[#D8BE99]">
                <span>State Transition Diff</span>
                <span className="font-mono lowercase text-[#A69076] font-normal text-[11px]">
                  (Old Value vs New Value)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* 1. Old Value */}
                <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/15 space-y-2 flex flex-col min-w-0">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-rose-300">
                    <span className="uppercase flex items-center gap-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      Previous State (Old)
                    </span>
                    <button
                      onClick={() => handleCopy(selectedLog.oldValue, 'old')}
                      className="text-rose-300 hover:text-white flex items-center gap-1 cursor-pointer text-[11px]"
                      title="Copy raw JSON"
                    >
                      {copiedKey === 'old' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="flex-1 p-2.5 rounded-lg bg-black/60 border border-white/5 font-mono text-[10px] sm:text-[11px] text-[#E5D2B8] overflow-x-auto max-h-60 leading-relaxed">
                    {selectedLog.oldValue === null || selectedLog.oldValue === undefined
                      ? 'null (No previous value / Created record)'
                      : typeof selectedLog.oldValue === 'object'
                      ? JSON.stringify(selectedLog.oldValue, null, 2)
                      : String(selectedLog.oldValue)}
                  </pre>
                </div>

                {/* 2. New Value */}
                <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/15 space-y-2 flex flex-col min-w-0">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-300">
                    <span className="uppercase flex items-center gap-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Committed State (New)
                    </span>
                    <button
                      onClick={() => handleCopy(selectedLog.newValue, 'new')}
                      className="text-emerald-300 hover:text-white flex items-center gap-1 cursor-pointer text-[11px]"
                      title="Copy raw JSON"
                    >
                      {copiedKey === 'new' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="flex-1 p-2.5 rounded-lg bg-black/60 border border-white/5 font-mono text-[10px] sm:text-[11px] text-[#E5D2B8] overflow-x-auto max-h-60 leading-relaxed">
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
                <div className="p-3.5 rounded-xl border border-[#D4AF37]/25 bg-black/40 space-y-2.5">
                  <h4 className="font-cinzel text-xs font-bold text-[#F2D675] uppercase tracking-wider">
                    Changed Fields Breakdown
                  </h4>
                  <div className="space-y-1.5 text-xs font-mono">
                    {auditService.computeChanges(selectedLog.oldValue, selectedLog.newValue).map((ch, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-[#14120F] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 min-w-0"
                      >
                        <span className="text-[#F2D675] font-bold text-xs truncate">{ch.field}:</span>
                        <div className="flex items-center gap-2 overflow-x-auto text-[11px] max-w-full">
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
            <div className="pt-2.5 border-t border-[#D4AF37]/20 flex items-center justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-full bg-[#1C160C] hover:bg-[#2A1F11] border border-[#D4AF37]/40 text-xs font-cinzel font-bold text-[#F3E6D0] hover:text-[#F2D675] transition-all cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
