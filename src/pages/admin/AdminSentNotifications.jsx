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
  X
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

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationApi.getSentNotifications({
        page,
        pageSize: 20,
        marketingOnly
      });
      setCampaigns(Array.isArray(data) ? data : (data?.items || []));
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
    setRecipientsLoading(true);
    try {
      const [details, recipientList] = await Promise.all([
        notificationApi.getSentNotificationDetails(batchId).catch(() => null),
        notificationApi.getSentNotificationRecipients(batchId, { page: 1, pageSize: 50 }).catch(() => [])
      ]);
      setBatchDetails(details);
      setRecipients(Array.isArray(recipientList) ? recipientList : (recipientList?.items || []));
    } catch (e) {
      error('Could not load batch details');
    } finally {
      setRecipientsLoading(false);
    }
  };

  // View specific personalized message
  const handleViewMessage = async (recipientId) => {
    if (!selectedBatch) return;
    try {
      const msg = await notificationApi.getRecipientMessage(selectedBatch, recipientId);
      setSelectedMessage(msg);
    } catch (e) {
      error('Failed to load recipient message');
    }
  };

  // Export CSV for Viber Broadcast
  const handleExportViber = (batchId, lang = '') => {
    try {
      const exportUrl = notificationApi.getViberExportUrl(batchId, lang);
      const link = document.createElement('a');
      link.href = exportUrl;
      link.setAttribute('download', `viber-campaign-${batchId}${lang ? `-${lang}` : ''}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      success('Viber broadcast CSV export generated successfully.');
    } catch (e) {
      error('Failed to export Viber CSV.');
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
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Event / Campaign</th>
                  <th className="py-3.5 px-4">Channels</th>
                  <th className="py-3.5 px-4 text-center">Recipients</th>
                  <th className="py-3.5 px-4 text-center">Delivered</th>
                  <th className="py-3.5 px-4 text-center">Failed</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/15">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-[#D8BE99]">
                      <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37] mx-auto mb-2" />
                      <span>Loading broadcast log...</span>
                    </td>
                  </tr>
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-[#D8BE99]/70 space-y-2">
                      <Send className="w-8 h-8 mx-auto text-[#D4AF37]/40" />
                      <p className="font-cinzel text-xs uppercase tracking-wider">No broadcast history recorded</p>
                      <p className="text-[11px] text-[#D8BE99]/50">Trigger a VIP coupon campaign or order event to view dispatches.</p>
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c) => {
                    const batchId = c.batchId || c.id;
                    const date = c.sentAt ? new Date(c.sentAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently';
                    const channels = Array.isArray(c.channels) ? c.channels : [c.channel || 'InApp'];

                    return (
                      <tr key={batchId} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#D8BE99]">
                          {date}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-cinzel font-bold text-xs text-[#F2D675] block">
                            {c.eventType ? c.eventType.replace(/_/g, ' ') : (c.title || 'Campaign')}
                          </span>
                          <span className="font-mono text-[10px] text-[#D8BE99]/60">
                            {batchId}
                          </span>
                        </td>
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
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-xs text-[#F3E6D0]">
                          {c.totalRecipients || c.sent || 0}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-xs text-emerald-400">
                          {c.delivered ?? c.sent ?? 0}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-xs text-rose-400">
                          {c.failed ?? 0}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Inspect Recipients */}
                            <button
                              type="button"
                              onClick={() => handleOpenRecipients(batchId)}
                              className="px-2.5 py-1 rounded-lg border border-[#D4AF37]/30 bg-black/40 text-[11px] text-[#D8BE99] hover:text-[#F2D675] hover:border-[#D4AF37] transition-all flex items-center gap-1 cursor-pointer"
                              title="View Recipients"
                            >
                              <Users className="w-3 h-3 text-[#D4AF37]" />
                              <span>Recipients</span>
                            </button>

                            {/* Export for Viber */}
                            <button
                              type="button"
                              onClick={() => handleExportViber(batchId)}
                              className="px-2.5 py-1 rounded-lg border border-purple-500/40 bg-purple-950/30 text-[11px] text-purple-300 hover:text-purple-200 hover:border-purple-400 transition-all flex items-center gap-1 cursor-pointer"
                              title="Export CSV for Viber"
                            >
                              <Download className="w-3 h-3" />
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
                <div>
                  <h3 className="font-cinzel text-lg font-bold uppercase text-[#F2D675]">
                    Campaign Delivery Roster
                  </h3>
                  <p className="font-mono text-xs text-[#D8BE99]/80">
                    Batch Reference: {selectedBatch}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedBatch(null); setBatchDetails(null); setSelectedMessage(null); }}
                  className="p-1 rounded-full text-[#D8BE99] hover:text-[#F3E6D0] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stats overview banner */}
              {batchDetails?.stats && (
                <div className="grid grid-cols-4 gap-3 p-4 rounded-xl bg-black/60 border border-[#D4AF37]/25 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-[#D8BE99] block uppercase">Targeted</span>
                    <span className="text-base font-bold text-[#F3E6D0]">{batchDetails.stats.totalRecipients}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#D8BE99] block uppercase">Delivered</span>
                    <span className="text-base font-bold text-emerald-400">{batchDetails.stats.delivered}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#D8BE99] block uppercase">Failed</span>
                    <span className="text-base font-bold text-rose-400">{batchDetails.stats.failed}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#D8BE99] block uppercase">Rate</span>
                    <span className="text-base font-bold text-[#F2D675]">{batchDetails.stats.deliveryRate ?? 100}%</span>
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
                    const statusColor = r.deliveryStatus === 'Delivered'
                      ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
                      : r.deliveryStatus === 'Read'
                      ? 'text-sky-400 bg-sky-950/40 border-sky-500/30'
                      : 'text-rose-400 bg-rose-950/40 border-rose-500/30';

                    return (
                      <div
                        key={r.recipientId || r.id}
                        className="p-3 rounded-xl bg-black/40 border border-[#D4AF37]/20 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-[#F3E6D0] block">{r.fullName || 'Patron'}</span>
                          <span className="font-mono text-[11px] text-[#D8BE99]/70">{r.phoneNumber || 'No phone'} • ({r.language || 'en'})</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${statusColor}`}>
                            {r.deliveryStatus || 'Sent'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleViewMessage(r.recipientId || r.id)}
                            className="text-[#D4AF37] hover:text-[#F2D675] transition-colors p-1"
                            title="Inspect Message"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Preview Drawer if selected */}
              {selectedMessage && (
                <div className="p-4 rounded-xl bg-[#140F0A] border border-[#D4AF37]/40 space-y-2 animate-fade-in">
                  <div className="flex justify-between items-center text-xs font-bold text-[#F2D675]">
                    <span>Exact Delivered Message ({selectedMessage.language || 'en'} • {selectedMessage.channel || 'InApp'}):</span>
                    <button onClick={() => setSelectedMessage(null)} className="text-[#D8BE99] hover:text-white">✕</button>
                  </div>
                  <p className="text-xs text-[#F3E6D0] font-sans leading-relaxed bg-black/60 p-3 rounded-lg border border-[#D4AF37]/20 select-all">
                    {selectedMessage.actualMessage || selectedMessage.body || JSON.stringify(selectedMessage)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
  );
}
