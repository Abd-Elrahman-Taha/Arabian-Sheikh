import React, { useState, useEffect, useCallback } from 'react';
import notificationApi from '../../api/notification.api';
import { discountService } from '../../services/discountService';
import { useToast } from '../../context/ToastContext';
import { generateCampaignPdf } from '../../utils/campaignPdfGenerator';
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
  Check,
  FileText,
  Plus,
  Smartphone,
  Globe,
  Tag,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export default function AdminSentNotifications() {
  const { success, error, info } = useToast();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [marketingOnly, setMarketingOnly] = useState(false);

  // Recipient Drilldown Modal State
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchDetails, setBatchDetails] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageLoadingId, setMessageLoadingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [exportingPdfId, setExportingPdfId] = useState(null);
  const [exportingCsvId, setExportingCsvId] = useState(null);

  // Broadcast Composer Modal State
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerLoading, setComposerLoading] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [previewTab, setPreviewTab] = useState('inapp'); // 'inapp' | 'whatsapp' | 'email'

  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    body: '',
    targetAudience: 'all', // 'all' | 'vip' | 'specific'
    specificTarget: '',
    eventType: 'Exclusive_Privilege',
    channels: {
      inApp: true,
      whatsApp: true,
      email: true
    },
    actionUrl: '/shop',
    selectedCouponId: ''
  });

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

  // Load available coupons for optional attachment in composer
  const loadCouponsForComposer = async () => {
    try {
      const res = await discountService.getCoupons({ pageSize: 50, status: 'Active' });
      const items = res?.items || res?.data || (Array.isArray(res) ? res : []);
      setActiveCoupons(items);
    } catch {
      setActiveCoupons([]);
    }
  };

  const handleOpenComposer = () => {
    loadCouponsForComposer();
    setBroadcastForm({
      title: 'Exclusive Palace Privilege',
      body: 'Your presence is requested at Arabian Sheikh. Experience our newest private reserves with royal complimentary delivery.',
      targetAudience: 'all',
      specificTarget: '',
      eventType: 'Exclusive_Privilege',
      channels: {
        inApp: true,
        whatsApp: true,
        email: true
      },
      actionUrl: '/shop',
      selectedCouponId: ''
    });
    setPreviewTab('inapp');
    setComposerOpen(true);
  };

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
    if (!selectedBatch) return;
    if (recipientId === undefined || recipientId === null) {
      error('Recipient ID is missing from this record.');
      return;
    }
    setMessageLoadingId(recipientId);
    try {
      const msg = await notificationApi.getRecipientMessage(selectedBatch, recipientId);
      if (msg) {
        setSelectedMessage(msg);
      } else {
        error('No message content returned for this recipient.');
      }
    } catch (e) {
      console.error('Failed to load recipient message:', e);
      const detail = e?.data?.detail || e?.data?.message || e?.message || 'Failed to load recipient message';
      error(`Failed to load recipient message: ${detail}`);
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

  // Single button: Export all messages and recipients into one comprehensive PDF report
  const handleExportPdfReport = async (batchOrId) => {
    const batchId = typeof batchOrId === 'object' ? (batchOrId?.batchId || batchOrId?.id) : batchOrId;
    if (!batchId) return;

    setExportingPdfId(batchId);
    try {
      let batch = typeof batchOrId === 'object' ? batchOrId : null;
      let batchRecipients = [];

      // If we are currently inspecting this batch, use existing state
      if (selectedBatch === batchId && recipients.length > 0) {
        batch = batchDetails || batch;
        batchRecipients = recipients;
      } else {
        const [detailsRes, recipientsRes] = await Promise.all([
          notificationApi.getSentNotificationDetails(batchId).catch(() => null),
          notificationApi.getSentNotificationRecipients(batchId, { page: 1, pageSize: 200 }).catch(() => [])
        ]);
        batch = detailsRes || batch || campaigns.find(c => (c.batchId || c.id) === batchId);
        batchRecipients = Array.isArray(recipientsRes)
          ? recipientsRes
          : (recipientsRes?.items || recipientsRes?.data || []);
      }

      const generated = generateCampaignPdf({
        batch: batch || { batchId },
        recipients: batchRecipients,
        messageText: batch?.body || batch?.message || ''
      });

      if (generated) {
        success('Campaign report PDF generated and downloaded successfully.');
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      error('Failed to generate PDF report: ' + (err?.message || 'Unknown error'));
    } finally {
      setExportingPdfId(null);
    }
  };

  // Secondary option: Download raw CSV export
  const handleExportCsv = async (batchId) => {
    setExportingCsvId(batchId);
    try {
      await notificationApi.exportCampaignReport(batchId);
      success('Campaign CSV data downloaded successfully.');
    } catch (e) {
      console.error('Failed to export CSV:', e);
      error(e?.message || 'Failed to download CSV export.');
    } finally {
      setExportingCsvId(null);
    }
  };

  // Dispatch custom admin notification across selected channels
  const handleDispatchBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.body.trim()) {
      error('Please provide both a notification title and message body.');
      return;
    }

    const selectedChannelsList = [];
    if (broadcastForm.channels.inApp) selectedChannelsList.push('InApp');
    if (broadcastForm.channels.whatsApp) selectedChannelsList.push('WhatsApp');
    if (broadcastForm.channels.email) selectedChannelsList.push('Email');

    if (selectedChannelsList.length === 0) {
      error('Please select at least one delivery channel (In-App, WhatsApp, or Email).');
      return;
    }

    setComposerLoading(true);
    try {
      const payload = {
        title: broadcastForm.title.trim(),
        body: broadcastForm.body.trim(),
        targetAudience: broadcastForm.targetAudience,
        specificTarget: broadcastForm.specificTarget.trim(),
        eventType: broadcastForm.eventType,
        channels: selectedChannelsList,
        actionUrl: broadcastForm.actionUrl.trim(),
        couponId: broadcastForm.selectedCouponId || undefined
      };

      const result = await notificationApi.sendBroadcastNotification(payload);

      // Prepend the new broadcast campaign to the local table
      const newCampaignRecord = {
        batchId: result?.batchId || `BC-${Date.now()}`,
        title: payload.title,
        body: payload.body,
        eventType: payload.eventType,
        channels: selectedChannelsList,
        totalRecipients: result?.notifiedCount || (payload.targetAudience === 'specific' ? 1 : 45),
        createdAtUtc: new Date().toISOString(),
        status: 'Delivered'
      };

      setCampaigns((prev) => [newCampaignRecord, ...prev]);
      success(
        result?.message ||
        `Broadcast successfully dispatched across ${selectedChannelsList.join(', ')}!`
      );
      setComposerOpen(false);
    } catch (err) {
      console.error('Broadcast dispatch error:', err);
      error(err?.message || 'Failed to dispatch notification broadcast.');
    } finally {
      setComposerLoading(false);
    }
  };

  // Robust date formatter (DD/MM/YYYY, HH:mm)
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
      <div className="rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/35 p-6 shadow-2xl backdrop-blur-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#F2D675] font-bold flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Multi-Channel Broadcast Intelligence</span>
            </span>
          </div>
          <h2 className="font-cinzel text-2xl font-bold uppercase tracking-wider text-[#F3E6D0]">
            Sent Notifications & Broadcast Hub
          </h2>
          <p className="text-xs text-[#D8BE99]">
            Dispatch notifications directly to patrons via Website (In-App), WhatsApp, and Email. Export comprehensive delivery reports into a single PDF.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* New Broadcast Composer Button */}
          <button
            type="button"
            onClick={handleOpenComposer}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#D4AF37] text-black font-cinzel text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.35)]"
          >
            <Plus className="w-4 h-4" />
            <span>Compose Broadcast</span>
          </button>

          <button
            type="button"
            onClick={() => setMarketingOnly(!marketingOnly)}
            className={`px-4 py-2.5 rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider transition-all cursor-pointer border ${
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
                <th className="py-3.5 px-4">Delivery Channels</th>
                <th className="py-3.5 px-4 text-center">Recipients</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/15">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-[#D8BE99]">
                    <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37] mx-auto mb-2" />
                    <span>Loading multi-channel broadcast log...</span>
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-[#D8BE99]/70 space-y-2">
                    <Send className="w-8 h-8 mx-auto text-[#D4AF37]/40" />
                    <p className="font-cinzel text-xs uppercase tracking-wider">No broadcast history recorded</p>
                    <p className="text-[11px] text-[#D8BE99]/50">Use 'Compose Broadcast' or trigger a VIP coupon campaign to dispatch.</p>
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => {
                  const batchId = c.batchId || c.id;
                  const dateFormatted = formatBroadcastDate(c.createdAtUtc || c.createdAt || c.sentAt);
                  const rawChannels = Array.isArray(c.channels) ? c.channels : [c.channel || 'InApp'];
                  const channels = rawChannels.map(ch => (String(ch).toLowerCase().startsWith('vi') ? 'WhatsApp' : ch));
                  const eventTitle = c.title || (c.eventType ? c.eventType.replace(/_/g, ' ') : 'Campaign');

                  const messageBody = c.body || c.message || c.text || '';
                  const isExportingPdf = exportingPdfId === batchId;
                  const isExportingCsv = exportingCsvId === batchId;

                  return (
                    <tr key={batchId} className="hover:bg-white/[0.02] transition-colors">
                      {/* 1. Date Column */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#D8BE99] whitespace-nowrap">
                        {dateFormatted}
                      </td>

                      {/* 2. Event / Campaign Column */}
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

                      {/* 4. Delivery Channels Column (In-App, WhatsApp, Email) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {channels.map((ch) => {
                            const isWhatsApp = ch.toLowerCase().includes('whatsapp');
                            const isEmail = ch.toLowerCase().includes('email');
                            const isInApp = ch.toLowerCase().includes('inapp') || ch.toLowerCase().includes('web');

                            return (
                              <span
                                key={ch}
                                className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border flex items-center gap-1 ${
                                  isWhatsApp
                                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                                    : isEmail
                                    ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                                    : isInApp
                                    ? 'bg-amber-950/40 border-[#D4AF37]/40 text-[#F2D675]'
                                    : 'bg-black/40 border-[#D4AF37]/30 text-[#F3E6D0]'
                                }`}
                              >
                                {isWhatsApp && <Smartphone className="w-2.5 h-2.5" />}
                                {isEmail && <Mail className="w-2.5 h-2.5" />}
                                {isInApp && <Bell className="w-2.5 h-2.5" />}
                                <span>{ch}</span>
                              </span>
                            );
                          })}
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

                          {/* Unified Single Button: Gather all messages into one PDF file */}
                          <button
                            type="button"
                            onClick={() => handleExportPdfReport(c)}
                            disabled={isExportingPdf}
                            className="px-2.5 py-1.5 rounded-lg border border-[#D4AF37] bg-[#D4AF37]/15 text-[11px] text-[#F2D675] hover:bg-[#D4AF37] hover:text-black disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm font-semibold"
                            title="Gather all campaign messages and recipients into one PDF report"
                          >
                            {isExportingPdf ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <FileText className="w-3.5 h-3.5" />
                            )}
                            <span>PDF Report</span>
                          </button>

                          {/* Quick CSV Export */}
                          <button
                            type="button"
                            onClick={() => handleExportCsv(batchId)}
                            disabled={isExportingCsv}
                            className="p-1.5 rounded-lg border border-white/10 bg-black/40 text-[#D8BE99] hover:text-white hover:border-white/30 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                            title="Download CSV export"
                          >
                            {isExportingCsv ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Download className="w-3 h-3" />
                            )}
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
              <div className="flex items-center gap-2.5">
                {/* Single Button: Gather all messages into one PDF */}
                <button
                  type="button"
                  onClick={() => handleExportPdfReport(selectedBatch)}
                  disabled={exportingPdfId === selectedBatch}
                  className="px-3.5 py-1.5 rounded-xl border border-[#D4AF37] bg-[#D4AF37]/20 text-xs font-cinzel font-bold text-[#F2D675] hover:bg-[#D4AF37] hover:text-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  title="Gather all messages into one PDF file"
                >
                  {exportingPdfId === selectedBatch ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileText className="w-3.5 h-3.5" />
                  )}
                  <span>Export PDF Report</span>
                </button>

                {/* CSV Download */}
                <button
                  type="button"
                  onClick={() => handleExportCsv(selectedBatch)}
                  disabled={exportingCsvId === selectedBatch}
                  className="px-3 py-1.5 rounded-xl border border-white/20 bg-black/40 text-xs font-cinzel font-semibold text-[#D8BE99] hover:text-white hover:border-white/40 transition-all flex items-center gap-1 cursor-pointer"
                  title="Download CSV"
                >
                  {exportingCsvId === selectedBatch ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3" />
                  )}
                  <span>CSV</span>
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
                    {Array.isArray(batchDetails.channels)
                      ? batchDetails.channels.map(c => (String(c).toLowerCase().startsWith('vi') ? 'WhatsApp' : c)).join(', ')
                      : (batchDetails.channel ? (String(batchDetails.channel).toLowerCase().startsWith('vi') ? 'WhatsApp' : batchDetails.channel) : 'In-App, WhatsApp, Email')}


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
                  const recipientId = r.recipientId ?? r.id ?? r.recipient_id ?? r.userId;
                  const recipientName = r.recipientName || r.fullName || r.name || r.email || 'Patron';
                  const phone = r.phone || r.phoneNumber || (r.email ? r.email : 'No contact');
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

      {/* ADMIN NOTIFICATION & BROADCAST COMPOSER MODAL */}
      {composerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl rounded-3xl bg-[#0B0A08] border border-[#D4AF37]/45 shadow-[0_25px_70px_rgba(0,0,0,0.98)] text-[#F3E6D0] max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#D4AF37]/25 flex items-center justify-between bg-black/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl border border-[#D4AF37]/50 bg-gradient-to-br from-[#D4AF37]/20 via-black to-[#8C6239]/20 flex items-center justify-center text-[#F2D675] shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cinzel text-lg sm:text-xl font-bold uppercase tracking-wider text-[#F2D675]">
                    Compose Notification Broadcast
                  </h3>
                  <p className="text-xs text-[#D8BE99]">
                    Dispatch personalized notices across In-App Notifications, WhatsApp, and Email.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                className="p-2 rounded-full text-[#D8BE99] hover:text-[#F3E6D0] hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form Controls (7 cols) */}
              <form onSubmit={handleDispatchBroadcast} id="broadcast-form" className="lg:col-span-7 space-y-4 text-xs font-sans">
                {/* 1. Target Audience Selection */}
                <div>
                  <label className="block uppercase tracking-wider font-cinzel text-[#F2D675] font-bold mb-1.5">
                    1. Target Audience
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setBroadcastForm({ ...broadcastForm, targetAudience: 'all' })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        broadcastForm.targetAudience === 'all'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#F2D675] font-bold shadow-md'
                          : 'border-[#D4AF37]/25 bg-black/40 text-[#D8BE99] hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <Globe className="w-4 h-4 mb-1 text-[#D4AF37]" />
                      <div className="font-cinzel text-[11px] uppercase">All Patrons</div>
                      <div className="text-[10px] text-[#D8BE99]/60 font-sans mt-0.5">Sitewide broadcast</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBroadcastForm({ ...broadcastForm, targetAudience: 'vip' })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        broadcastForm.targetAudience === 'vip'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#F2D675] font-bold shadow-md'
                          : 'border-[#D4AF37]/25 bg-black/40 text-[#D8BE99] hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 mb-1 text-[#D4AF37]" />
                      <div className="font-cinzel text-[11px] uppercase">VIP Only</div>
                      <div className="text-[10px] text-[#D8BE99]/60 font-sans mt-0.5">Top spenders segment</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBroadcastForm({ ...broadcastForm, targetAudience: 'specific' })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        broadcastForm.targetAudience === 'specific'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#F2D675] font-bold shadow-md'
                          : 'border-[#D4AF37]/25 bg-black/40 text-[#D8BE99] hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <Users className="w-4 h-4 mb-1 text-[#D4AF37]" />
                      <div className="font-cinzel text-[11px] uppercase">Specific Patron</div>
                      <div className="text-[10px] text-[#D8BE99]/60 font-sans mt-0.5">Direct targeted user</div>
                    </button>
                  </div>

                  {broadcastForm.targetAudience === 'specific' && (
                    <div className="mt-2.5">
                      <input
                        type="text"
                        required
                        value={broadcastForm.specificTarget}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, specificTarget: e.target.value })}
                        placeholder="Enter customer email, phone, or User ID..."
                        className="w-full bg-black/60 border border-[#D4AF37]/40 rounded-xl py-2.5 px-3.5 text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* 2. Output Channels Selection (The 3 Channels: In-App, WhatsApp, Email) */}
                <div>
                  <label className="block uppercase tracking-wider font-cinzel text-[#F2D675] font-bold mb-1.5">
                    2. Delivery Channels (Multi-Dispatch)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* In-App / Website Notification */}
                    <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      broadcastForm.channels.inApp
                        ? 'border-amber-500/60 bg-amber-950/30 text-[#F2D675]'
                        : 'border-white/10 bg-black/40 text-[#D8BE99]/50'
                    }`}>
                      <input
                        type="checkbox"
                        checked={broadcastForm.channels.inApp}
                        onChange={(e) => setBroadcastForm({
                          ...broadcastForm,
                          channels: { ...broadcastForm.channels, inApp: e.target.checked }
                        })}
                        className="accent-[#D4AF37] w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <div className="font-cinzel text-[11px] uppercase font-bold flex items-center gap-1">
                          <Bell className="w-3 h-3 text-[#D4AF37]" />
                          <span>Website</span>
                        </div>
                        <span className="text-[9px] text-[#D8BE99]/70">In-App Toast & Bell</span>
                      </div>
                    </label>

                    {/* WhatsApp */}
                    <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      broadcastForm.channels.whatsApp
                        ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300'
                        : 'border-white/10 bg-black/40 text-[#D8BE99]/50'
                    }`}>
                      <input
                        type="checkbox"
                        checked={broadcastForm.channels.whatsApp}
                        onChange={(e) => setBroadcastForm({
                          ...broadcastForm,
                          channels: { ...broadcastForm.channels, whatsApp: e.target.checked }
                        })}
                        className="accent-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <div className="font-cinzel text-[11px] uppercase font-bold flex items-center gap-1">
                          <Smartphone className="w-3 h-3 text-emerald-400" />
                          <span>WhatsApp</span>
                        </div>
                        <span className="text-[9px] text-[#D8BE99]/70">Meta Cloud API</span>
                      </div>
                    </label>

                    {/* Email */}
                    <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      broadcastForm.channels.email
                        ? 'border-blue-500/60 bg-blue-950/30 text-blue-300'
                        : 'border-white/10 bg-black/40 text-[#D8BE99]/50'
                    }`}>
                      <input
                        type="checkbox"
                        checked={broadcastForm.channels.email}
                        onChange={(e) => setBroadcastForm({
                          ...broadcastForm,
                          channels: { ...broadcastForm.channels, email: e.target.checked }
                        })}
                        className="accent-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <div className="font-cinzel text-[11px] uppercase font-bold flex items-center gap-1">
                          <Mail className="w-3 h-3 text-blue-400" />
                          <span>Email</span>
                        </div>
                        <span className="text-[9px] text-[#D8BE99]/70">MailKit SMTP</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* 3. Event Type & Coupon Attachment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold mb-1">
                      Event Category
                    </label>
                    <select
                      value={broadcastForm.eventType}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, eventType: e.target.value })}
                      className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2.5 px-3 text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                    >
                      <option value="Exclusive_Privilege">VIP Exclusive Privilege</option>
                      <option value="Promotion_Campaign">Palace Offer / Promotion</option>
                      <option value="New_Flacon_Arrival">New Fragrance Arrival</option>
                      <option value="Royal_Announcement">Royal Maison Announcement</option>
                      <option value="Account_Notice">Patron Account Advisory</option>
                    </select>
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold mb-1">
                      Attach Coupon Code (Optional)
                    </label>
                    <select
                      value={broadcastForm.selectedCouponId}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, selectedCouponId: e.target.value })}
                      className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2.5 px-3 text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                    >
                      <option value="">No coupon attached</option>
                      {activeCoupons.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} ({c.type === 'Percentage' ? `${c.value}% OFF` : `€${c.value} OFF`})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. Notification Title */}
                <div>
                  <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold mb-1">
                    Notification Title / Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    placeholder="e.g. Royal Invitation: Private Reserve Access"
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2.5 px-3.5 text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:outline-none font-medium"
                  />
                </div>

                {/* 5. Message Body */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="uppercase tracking-wider text-[#D8BE99] font-semibold">
                      Message Content
                    </label>
                    <span className="text-[10px] font-mono text-[#D8BE99]/60">
                      {broadcastForm.body.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={broadcastForm.body}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, body: e.target.value })}
                    placeholder="Type the message body that will be delivered across Website Notifications, WhatsApp, and Email..."
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl p-3 text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:outline-none leading-relaxed resize-none"
                  />
                </div>

                {/* 6. Target Action URL */}
                <div>
                  <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold mb-1">
                    Call-to-Action Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={broadcastForm.actionUrl}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, actionUrl: e.target.value })}
                    placeholder="/shop or /cart?coupon=VIP20"
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:outline-none font-mono text-[11px]"
                  />
                </div>
              </form>

              {/* Right Column: Multi-Channel Live Previews (5 cols) */}
              <div className="lg:col-span-5 space-y-3 flex flex-col">
                <span className="font-cinzel text-xs uppercase tracking-wider text-[#F2D675] font-bold block">
                  Live Multi-Channel Preview
                </span>

                {/* Preview Tabs */}
                <div className="flex rounded-xl bg-black/60 border border-[#D4AF37]/30 p-1">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('inapp')}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-cinzel font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      previewTab === 'inapp'
                        ? 'bg-[#D4AF37] text-black shadow-sm'
                        : 'text-[#D8BE99] hover:text-[#F3E6D0]'
                    }`}
                  >
                    <Bell className="w-3 h-3" />
                    <span>In-App</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewTab('whatsapp')}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-cinzel font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      previewTab === 'whatsapp'
                        ? 'bg-emerald-500 text-black shadow-sm'
                        : 'text-[#D8BE99] hover:text-[#F3E6D0]'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewTab('email')}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-cinzel font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      previewTab === 'email'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-[#D8BE99] hover:text-[#F3E6D0]'
                    }`}
                  >
                    <Mail className="w-3 h-3" />
                    <span>Email</span>
                  </button>
                </div>

                {/* Preview Card View */}
                <div className="flex-1 rounded-2xl bg-black/80 border border-[#D4AF37]/25 p-4 flex flex-col justify-center min-h-[220px]">
                  {/* IN-APP PREVIEW */}
                  {previewTab === 'inapp' && (
                    <div className="space-y-3 animate-fade-in">
                      <span className="text-[10px] font-mono text-[#D8BE99]/60 block uppercase">
                        Browser Push Toast & Bell Dropdown
                      </span>
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1A140B] via-[#0E0C08] to-[#000000] border border-[#D4AF37]/60 shadow-xl space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#F2D675]">
                            <Bell className="w-3 h-3" />
                          </div>
                          <span className="font-cinzel text-xs font-bold text-[#F2D675] truncate">
                            {broadcastForm.title || 'Notification Title'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#F3E6D0]/90 font-sans leading-relaxed">
                          {broadcastForm.body || 'Your notification body preview will render here...'}
                        </p>
                        {broadcastForm.actionUrl && (
                          <div className="pt-1 flex justify-end">
                            <span className="text-[10px] font-cinzel font-bold text-[#D4AF37] uppercase flex items-center gap-1">
                              <span>Experience Now</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* WHATSAPP PREVIEW */}
                  {previewTab === 'whatsapp' && (
                    <div className="space-y-3 animate-fade-in">
                      <span className="text-[10px] font-mono text-emerald-400/80 block uppercase">
                        Meta WhatsApp Cloud API Bubble
                      </span>
                      <div className="p-4 rounded-2xl bg-[#0B2017] border border-emerald-500/40 text-emerald-100 shadow-xl space-y-2.5 max-w-sm">
                        <div className="flex items-center gap-2 border-b border-emerald-500/20 pb-1.5">
                          <span className="font-cinzel text-xs font-bold text-emerald-300">
                            Arabian Sheikh Official
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                            Verified
                          </span>
                        </div>
                        <p className="font-bold text-xs text-white">
                          {broadcastForm.title || 'Palace Notice'}
                        </p>
                        <p className="text-[11px] font-sans text-emerald-100/90 leading-relaxed whitespace-pre-wrap">
                          {broadcastForm.body || 'WhatsApp template message body preview...'}
                        </p>
                        <div className="pt-1 flex items-center justify-between text-[9px] text-emerald-400/60 font-mono">
                          <span>Concierge Concierge</span>
                          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EMAIL PREVIEW */}
                  {previewTab === 'email' && (
                    <div className="space-y-3 animate-fade-in">
                      <span className="text-[10px] font-mono text-blue-400/80 block uppercase">
                        Royal MailKit SMTP Branded Email
                      </span>
                      <div className="p-4 rounded-2xl bg-[#111116] border border-blue-500/30 text-[#F3E6D0] shadow-xl space-y-3">
                        <div className="text-center border-b border-[#D4AF37]/20 pb-2">
                          <span className="font-cinzel text-[11px] font-bold text-[#F2D675] tracking-widest uppercase block">
                            ARABIAN SHEIKH
                          </span>
                          <span className="text-[8px] uppercase tracking-widest text-[#D8BE99]">
                            Maison de Haute Parfumerie
                          </span>
                        </div>
                        <div>
                          <h4 className="font-cinzel text-xs font-bold text-[#F2D675]">
                            {broadcastForm.title || 'Email Subject Header'}
                          </h4>
                          <p className="text-[11px] font-sans text-[#D8BE99] mt-1 leading-relaxed">
                            {broadcastForm.body || 'Email content preview will appear here...'}
                          </p>
                        </div>
                        <div className="text-center pt-2">
                          <span className="inline-block px-4 py-1.5 rounded-full bg-[#D4AF37] text-black font-cinzel font-bold text-[10px] uppercase">
                            View Royal Sanctuary
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 sm:p-6 border-t border-[#D4AF37]/25 flex items-center justify-between bg-black/60">
              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-white/20 text-xs font-cinzel uppercase text-[#D8BE99] hover:text-white hover:border-white/40 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="broadcast-form"
                disabled={composerLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#D4AF37] text-black font-cinzel text-xs font-bold uppercase tracking-wider hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(212,175,55,0.4)]"
              >
                {composerLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Dispatching Multi-Channel...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Dispatch Broadcast Now</span>
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
