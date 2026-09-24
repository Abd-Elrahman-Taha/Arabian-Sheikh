import React, { useState, useEffect, useCallback } from 'react';
import notificationApi from '../../api/notification.api';
import { useToast } from '../../context/ToastContext';
import {
  Send,
  Download,
  Users,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Mail,
  Bell,
  Sparkles,
  X,
  Copy,
  Check
} from 'lucide-react';

export default function AdminSentNotifications() {
  const { success, error } = useToast();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [marketingOnly, setMarketingOnly] = useState(false);

  // Recipient Modal State
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchDetails, setBatchDetails] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageLoadingId, setMessageLoadingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [exportingBatchId, setExportingBatchId] = useState(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationApi.getSentNotifications({
        page,
        pageSize: 20,
        marketingOnly
      });
      setCampaigns(Array.isArray(data) ? data : (data?.items || data?.data || []));
    } catch (err) {
      console.warn('Failed to load sent campaigns:', err);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [page, marketingOnly]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Open Recipients modal
  const handleOpenRecipients = async (batchId) => {
    setSelectedBatch(batchId);
    setSelectedMessage(null);
    setRecipientsLoading(true);
    try {
      const [details, recipientList] = await Promise.all([
        notificationApi.getSentNotificationDetails(batchId).catch(() => null),
        notificationApi.getSentNotificationRecipients(batchId, { page: 1, pageSize: 50 }).catch(() => [])
      ]);
      setBatchDetails(details);
      setRecipients(Array.isArray(recipientList) ? recipientList : (recipientList?.items || recipientList?.data || []));
    } catch (e) {
      console.error('Could not load batch details:', e);
      error('Could not load batch details');
    } finally {
      setRecipientsLoading(false);
    }
  };

  // View specific personalized message
  const handleViewMessage = async (recipientId) => {
    if (!selectedBatch || !recipientId) return;
    setMessageLoadingId(recipientId);
    try {
      const msg = await notificationApi.getRecipientMessage(selectedBatch, recipientId);
      setSelectedMessage(msg);
    } catch (e) {
      console.error('Failed to load recipient message:', e);
      error(e?.message || 'Failed to load recipient message');
    } finally {
      setMessageLoadingId(null);
    }
  };

  // Copy text helper with visual feedback
  const handleCopyText = async (text, id) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      success('Copied to clipboard.');
      setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      error('Failed to copy to clipboard.');
    }
  };

  // Export CSV for Viber Broadcast via authenticated blob download
  const handleExportViber = async (batchId, lang = '') => {
    setExportingBatchId(batchId);
    try {
      await notificationApi.exportViberCsv(batchId, lang);
      success('Viber broadcast CSV exported successfully.');
    } catch (e) {
      console.error('Failed to export Viber CSV:', e);
      error(e?.message || 'Failed to export Viber CSV.');
    } finally {
      setExportingBatchId(null);
    }
  };

  // Robust date formatter (DD/MM/YYYY, HH:mm) - strictly never returns relative 'Recently'
  const formatBroadcastDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/35 p-6 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#F2D675] font-bold flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Broadcast Intelligence</span>
            </span>
          </div>
          <h2 className="font-cinzel text-2xl font-bold uppercase tracking-wider text-[#F3E6D0]">
            Sent Notifications & Viber Center
          </h2>
          <p className="text-xs text-[#D8BE99]">
            Track multi-channel dispatches (In-App, WhatsApp, Email) and download CSVs for manual Viber broadcasts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMarketingOnly(!marketingOnly)}
            className={`px-4 py-2 rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider transition-all cursor-pointer border ${
              marketingOnly
                ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                : 'bg-black/40 text-[#D8BE99] border-[#D4AF37]/30 hover:border-[#D4AF37]'
            }`}
          >
            {marketingOnly ? '✓ Marketing Only' : 'All Broadcasts'}
          </button>

          <button
            type="button"
            onClick={fetchCampaigns}
            className="p-2.5 rounded-xl border border-[#D4AF37]/30 bg-black/40 text-[#D8BE99] hover:text-[#F2D675] hover:border-[#D4AF37] transition-colors cursor-pointer"
            title="Refresh Campaigns"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="rounded-2xl bg-[#0B0A08]/80 border border-[#D4AF37]/30 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs text-[#F3E6D0]">
            <thead className="bg-black/60 border-b border-[#D4AF37]/30 uppercase text-[10px] font-cinzel font-bold tracking-wider text-[#D8BE99]">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">Date</th>
                <th className="py-3.5 px-4">Event / Campaign</th>
                <th className="py-3.5 px-4">Message Content</th>
                <th className="py-3.5 px-4">Channels</th>
                <th className="py-3.5 px-4 text-center">Recipients</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/15">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-[#D8BE99]">
                    <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37] mx-auto mb-2" />
                    <span>Loading broadcast log...</span>
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-[#D8BE99]/70 space-y-2">
                    <Send className="w-8 h-8 mx-auto text-[#D4AF37]/40" />
                    <p className="font-cinzel text-xs uppercase tracking-wider">No broadcast history recorded</p>
                    <p className="text-[11px] text-[#D8BE99]/50">Trigger a VIP coupon campaign or order event to view dispatches.</p>
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => {
                  const batchId = c.batchId || c.id;
                  const dateFormatted = formatBroadcastDate(c.createdAtUtc || c.createdAt || c.sentAt);
                  const channels = Array.isArray(c.channels) ? c.channels : [c.channel || 'InApp'];
                  const eventTitle = c.title || (c.eventType ? c.eventType.replace(/_/g, ' ') : 'Campaign');
                  const messageBody = c.body || c.message || c.text || '';
                  const isExporting = exportingBatchId === batchId;

                  return (
                    <tr key={batchId} className="hover:bg-white/[0.02] transition-colors">
                      {/* 1. Date Column */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#D8BE99] whitespace-nowrap">
                        {dateFormatted}
                      </td>

                      {/* 2. Event / Campaign Column (NO UUID rendered) */}
                      <td className="py-3.5 px-4 min-w-[160px]">
                        <span className="font-cinzel font-bold text-xs text-[#F2D675] block">
                          {eventTitle}
                        </span>
                        {c.eventType && c.title && (
                          <span className="text-[10px] text-[#D8BE99]/60 uppercase tracking-wider block font-sans mt-0.5">
                            {c.eventType.replace(/_/g, ' ')}
                          </span>
                        )}
                      </td>

                      {/* 3. Message Content & Copy Button Column */}
                      <td className="py-3.5 px-4 max-w-xs md:max-w-md">
                        {messageBody ? (
                          <div className="flex items-center gap-2 group">
                            <span
                              className="text-xs text-[#F3E6D0]/90 line-clamp-2 leading-relaxed font-sans"
                              title={messageBody}
                            >
                              {messageBody}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(messageBody, batchId)}
                              className="shrink-0 p-1.5 rounded-lg border border-[#D4AF37]/30 bg-black/60 text-[#D8BE99] hover:text-[#F2D675] hover:border-[#D4AF37] transition-all cursor-pointer shadow-sm"
                              title="Copy message content"
                            >
                              {copiedId === batchId ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-[#D8BE99]/40 italic">—</span>
                        )}
                      </td>

                      {/* 4. Channels Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {channels.map((ch) => (
                            <span
                              key={ch}
                              className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border bg-black/40 border-[#D4AF37]/30 text-[#F3E6D0]"
                            >
                              {ch}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* 5. Recipients Column */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-xs text-[#F3E6D0]">
                        {c.totalRecipients || c.sent || 0}
                      </td>

                      {/* 6. Actions Column */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Inspect Recipients */}
                          <button
                            type="button"
                            onClick={() => handleOpenRecipients(batchId)}
                            className="px-2.5 py-1.5 rounded-lg border border-[#D4AF37]/30 bg-black/40 text-[11px] text-[#D8BE99] hover:text-[#F2D675] hover:border-[#D4AF37] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                            title="View Campaign Delivery Roster"
                          >
                            <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>Recipients</span>
                          </button>

                          {/* Export for Viber */}
                          <button
                            type="button"
                            onClick={() => handleExportViber(batchId)}
                            disabled={isExporting}
                            className="px-2.5 py-1.5 rounded-lg border border-purple-500/40 bg-purple-950/30 text-[11px] text-purple-300 hover:text-purple-200 hover:border-purple-400 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                            title="Download Viber CSV Export"
                          >
                            {isExporting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-300" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            <span>Viber CSV</span>
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
      </div>

      {/* Recipient Drilldown Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#0B0A08] border border-[#D4AF37]/40 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-[#F3E6D0] space-y-6 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-start justify-between border-b border-[#D4AF37]/20 pb-4">
              <div className="space-y-0.5">
                <h3 className="font-cinzel text-lg font-bold uppercase text-[#F2D675] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#D4AF37]" />
                  <span>Campaign Delivery Roster</span>
                </h3>
                <p className="font-mono text-xs text-[#D8BE99]/80">
                  Batch: <span className="text-[#F3E6D0]">{selectedBatch}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleExportViber(selectedBatch)}
                  disabled={exportingBatchId === selectedBatch}
                  className="px-3 py-1.5 rounded-xl border border-purple-500/40 bg-purple-950/40 text-xs font-cinzel font-bold text-purple-200 hover:bg-purple-900/40 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Export Roster as Viber CSV"
                >
                  {exportingBatchId === selectedBatch ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Export Viber CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedBatch(null); setBatchDetails(null); setSelectedMessage(null); }}
                  className="p-1.5 rounded-full text-[#D8BE99] hover:text-[#F3E6D0] hover:bg-white/5 transition-colors cursor-pointer"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stats overview banner */}
            {batchDetails && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-black/60 border border-[#D4AF37]/25 text-center font-mono">
                <div>
                  <span className="text-[10px] text-[#D8BE99] block uppercase">Targeted</span>
                  <span className="text-base font-bold text-[#F3E6D0]">
                    {batchDetails.totalRecipients || batchDetails.stats?.totalRecipients || recipients.length}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#D8BE99] block uppercase">Channels</span>
                  <span className="text-xs font-bold text-[#F2D675] uppercase truncate block">
                    {Array.isArray(batchDetails.channels) ? batchDetails.channels.join(', ') : (batchDetails.channel || 'InApp')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#D8BE99] block uppercase">Language</span>
                  <span className="text-xs font-bold text-[#D8BE99] uppercase">
                    {batchDetails.language || 'Multi-Lang'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#D8BE99] block uppercase">Status</span>
                  <span className="text-xs font-bold text-emerald-400 uppercase">
                    {batchDetails.status || 'Completed'}
                  </span>
                </div>
              </div>
            )}

            {/* Recipients List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {recipientsLoading ? (
                <div className="py-12 text-center text-[#D8BE99]">
                  <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37] mx-auto mb-2" />
                  <span>Loading patron roster...</span>
                </div>
              ) : recipients.length === 0 ? (
                <p className="py-8 text-center text-xs text-[#D8BE99]/70">No individual recipient records available for this batch.</p>
              ) : (
                recipients.map((r) => {
                  const recipientId = r.recipientId ?? r.id;
                  const recipientName = r.recipientName || r.fullName || r.name || r.email || 'Patron';
                  const phone = r.phone || r.phoneNumber || (r.email ? r.email : 'No phone');
                  const language = r.language || 'en';
                  const deliveryStatus = r.deliveryStatus || r.status || 'Sent';

                  const statusColor = deliveryStatus === 'Delivered'
                    ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
                    : deliveryStatus === 'Read'
                    ? 'text-sky-400 bg-sky-950/40 border-sky-500/30'
                    : deliveryStatus === 'Failed'
                    ? 'text-rose-400 bg-rose-950/40 border-rose-500/30'
                    : 'text-[#D8BE99] bg-black/40 border-[#D4AF37]/30';

                  const isMsgLoading = messageLoadingId === recipientId;

                  return (
                    <div
                      key={recipientId}
                      className="p-3.5 rounded-xl bg-black/40 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 flex items-center justify-between text-xs transition-all"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-[#F3E6D0] block text-sm">{recipientName}</span>
                        <div className="flex items-center gap-2 font-mono text-[11px] text-[#D8BE99]/70">
                          <span>{phone}</span>
                          <span>•</span>
                          <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[#F3E6D0]">
                            {language}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${statusColor}`}>
                          {deliveryStatus}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleViewMessage(recipientId)}
                          disabled={isMsgLoading}
                          className="p-2 rounded-lg border border-[#D4AF37]/30 bg-black/50 text-[#D4AF37] hover:text-[#F2D675] hover:border-[#D4AF37] disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                          title="Inspect Delivered Message"
                        >
                          {isMsgLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Details Preview Drawer / Popup */}
            {selectedMessage && (
              <div className="p-5 rounded-2xl bg-gradient-to-b from-[#18140E] to-[#0D0B08] border border-[#D4AF37]/50 shadow-2xl space-y-4 animate-fade-in relative">
                <div className="flex items-start justify-between gap-3 border-b border-[#D4AF37]/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <div>
                      <h4 className="font-cinzel text-sm font-bold text-[#F2D675] uppercase tracking-wide">
                        {selectedMessage.title || 'Personalized Notification'}
                      </h4>
                      <span className="text-[10px] font-mono text-[#D8BE99]/70">
                        Language: <span className="uppercase text-[#F3E6D0] font-bold">{selectedMessage.language || 'en'}</span>
                        {selectedMessage.recipientId && ` • Recipient #${selectedMessage.recipientId}`}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMessage(null)}
                    className="p-1.5 rounded-lg text-[#D8BE99] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    title="Close message preview"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedMessage.body && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-cinzel uppercase text-[#D8BE99] tracking-wider block font-bold">
                        Message Body
                      </span>
                      <div className="p-3.5 rounded-xl bg-black/60 border border-[#D4AF37]/30 text-xs text-[#F3E6D0] font-sans leading-relaxed select-all">
                        {selectedMessage.body}
                      </div>
                    </div>
                  )}

                  {selectedMessage.text && selectedMessage.text !== selectedMessage.body && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-cinzel uppercase text-[#D8BE99] tracking-wider block font-bold">
                        Full Rendered Text
                      </span>
                      <div className="p-3 rounded-xl bg-black/40 border border-[#D4AF37]/20 text-xs text-[#D8BE99] font-sans leading-relaxed select-all whitespace-pre-wrap">
                        {selectedMessage.text}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopyText(selectedMessage.body || selectedMessage.text, 'modal-msg')}
                    className="px-4 py-2 rounded-xl border border-[#D4AF37] bg-[#D4AF37]/15 text-xs font-cinzel font-bold text-[#F2D675] hover:bg-[#D4AF37] hover:text-black transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    {copiedId === 'modal-msg' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
