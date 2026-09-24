import React, { useState, useEffect, useCallback, useRef } from 'react';
import notificationApi from '../../api/notification.api';
import { discountService } from '../../services/discountService';
import { userService } from '../../services/userService';
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
  ArrowRight,
  User,
  Phone,
  ExternalLink
} from 'lucide-react';

const WEBSITE_URL = 'https://arabian-sheikh.vercel.app';

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
  const [manualSentStatus, setManualSentStatus] = useState({}); // recipientId -> { whatsapp: bool, email: bool }

  // Overlay scroll refs to guarantee modals render pinned at the absolute TOP of page
  const rosterOverlayRef = useRef(null);
  const composerOverlayRef = useRef(null);

  // Manual Notification Composer State (One-by-One patron dispatch)
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerLoading, setComposerLoading] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [customerDirectory, setCustomerDirectory] = useState([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [previewTab, setPreviewTab] = useState('whatsapp'); // 'whatsapp' | 'email'

  const [patronForm, setPatronForm] = useState({
    patronName: '',
    patronPhone: '',
    patronEmail: '',
    patronId: '',
    title: 'Exclusive Palace Privilege',
    body: `Your presence is requested at Arabian Sheikh. Experience our newest private reserves with royal complimentary delivery.\n\n👑 Visit Arabian Sheikh: https://arabian-sheikh.vercel.app/`,
    actionUrl: 'https://arabian-sheikh.vercel.app/',
    selectedCouponId: ''
  });

  // Ensure Roster modal is positioned at the very top of the page immediately upon opening
  useEffect(() => {
    if (selectedBatch) {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
      if (typeof document !== 'undefined') {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
      if (rosterOverlayRef.current) {
        rosterOverlayRef.current.scrollTop = 0;
      }
    }
  }, [selectedBatch]);

  // Ensure Composer modal is positioned at the very top of the page immediately upon opening
  useEffect(() => {
    if (composerOpen) {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
      if (typeof document !== 'undefined') {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
      if (composerOverlayRef.current) {
        composerOverlayRef.current.scrollTop = 0;
      }
    }
  }, [composerOpen]);

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

  // Load available coupons and customer list for easy patron selection
  const loadDirectoryData = async () => {
    try {
      const [couponsRes, usersRes] = await Promise.all([
        discountService.getCoupons({ pageSize: 50, status: 'Active' }).catch(() => []),
        userService.getAllUsers({ pageSize: 50 }).catch(() => [])
      ]);
      const couponItems = couponsRes?.items || couponsRes?.data || (Array.isArray(couponsRes) ? couponsRes : []);
      const userItems = usersRes?.items || usersRes?.data || (Array.isArray(usersRes) ? usersRes : []);
      setActiveCoupons(couponItems);
      setCustomerDirectory(userItems);
    } catch {
      setActiveCoupons([]);
      setCustomerDirectory([]);
    }
  };

  const handleOpenComposer = () => {
    loadDirectoryData();
    setCustomerSearchQuery('');
    setPatronForm({
      patronName: '',
      patronPhone: '',
      patronEmail: '',
      patronId: '',
      title: 'Exclusive Palace Privilege',
      body: `Your presence is requested at Arabian Sheikh. Experience our newest private reserves with royal complimentary delivery.\n\n👑 Visit Arabian Sheikh: https://arabian-sheikh.vercel.app/`,
      actionUrl: 'https://arabian-sheikh.vercel.app/',
      selectedCouponId: ''
    });
    setPreviewTab('whatsapp');
    setComposerOpen(true);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  // Helper to format messages with website link and coupon code
  const formatPatronMessage = (baseText, couponCode = '', actionUrl = '') => {
    let text = (baseText || '').trim();

    // 1. Append Coupon Code if present and not already typed in message
    if (couponCode && !text.toUpperCase().includes(couponCode.toUpperCase())) {
      text += `\n\n🎟️ Use Exclusive Privilege Code: ${couponCode}`;
    }

    // 2. Append Website URL if not already typed in message
    if (!text.includes('arabian-sheikh.vercel.app')) {
      const cleanUrl = actionUrl && actionUrl !== '/shop' && actionUrl !== '/'
        ? (actionUrl.startsWith('http') ? actionUrl : `${WEBSITE_URL}${actionUrl.startsWith('/') ? actionUrl : `/${actionUrl}`}`)
        : 'https://arabian-sheikh.vercel.app/';
      text += `\n👑 Visit Arabian Sheikh: ${cleanUrl}`;
    }

    return text;
  };

  // When admin selects a coupon, automatically type it into the message body
  const handleSelectCoupon = (couponId) => {
    const chosenCoupon = activeCoupons.find(c => String(c.id) === String(couponId));
    const couponCode = chosenCoupon?.code || '';
    const discountLabel = chosenCoupon ? (chosenCoupon.type === 'Percentage' ? `${chosenCoupon.value}% OFF` : `€${chosenCoupon.value} OFF`) : '';

    setPatronForm(prev => {
      let updatedBody = prev.body;
      // Strip any existing coupon privilege line when switching or clearing
      updatedBody = updatedBody.replace(/\n\n🎟️ Use Exclusive Privilege Code: [^\n]+/g, '');

      if (couponCode) {
        if (updatedBody.includes('👑 Visit Arabian Sheikh:')) {
          updatedBody = updatedBody.replace(
            '👑 Visit Arabian Sheikh:',
            `🎟️ Use Exclusive Privilege Code: ${couponCode}${discountLabel ? ` (${discountLabel})` : ''}\n\n👑 Visit Arabian Sheikh:`
          );
        } else {
          updatedBody = `${updatedBody.trim()}\n\n🎟️ Use Exclusive Privilege Code: ${couponCode}${discountLabel ? ` (${discountLabel})` : ''}\n👑 Visit Arabian Sheikh: https://arabian-sheikh.vercel.app/`;
        }
      }

      // Guarantee store website link is present
      if (!updatedBody.includes('https://arabian-sheikh.vercel.app')) {
        updatedBody = `${updatedBody.trim()}\n\n👑 Visit Arabian Sheikh: https://arabian-sheikh.vercel.app/`;
      }

      return {
        ...prev,
        selectedCouponId: couponId,
        body: updatedBody
      };
    });
  };

  // Helper to select a patron from the directory
  const handleSelectCustomer = (customer) => {
    setPatronForm(prev => ({
      ...prev,
      patronName: customer.name || customer.fullName || '',
      patronPhone: customer.phone || customer.phoneNumber || '',
      patronEmail: customer.email || '',
      patronId: customer.id || customer.userId || ''
    }));
    setCustomerSearchQuery('');
  };

  // Filtered customer directory for search
  const filteredCustomers = customerDirectory.filter(c => {
    if (!customerSearchQuery) return false;
    const q = customerSearchQuery.toLowerCase();
    const name = (c.name || c.fullName || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    const phone = (c.phone || c.phoneNumber || '').toLowerCase();
    return name.includes(q) || email.includes(q) || phone.includes(q);
  });

  // URL Helpers for Manual One-by-One Sending
  const getCleanPhone = (phone) => {
    if (!phone) return '';
    return String(phone).replace(/[^\d]/g, '');
  };

  const getWhatsAppUrl = (phone, text) => {
    const clean = getCleanPhone(phone);
    return `https://wa.me/${clean}?text=${encodeURIComponent(text || '')}`;
  };

  const getMailtoUrl = (email, title, text) => {
    return `mailto:${encodeURIComponent(email || '')}?subject=${encodeURIComponent(title || 'Arabian Sheikh Notice')}&body=${encodeURIComponent(text || '')}`;
  };

  // 1-Click Manual Send to Patron: WhatsApp (with website link & coupon guaranteed)
  const handleSendWhatsAppManual = (phone, text, recipientId = null, couponCode = '', actionUrl = '') => {
    if (!phone) {
      error('Patron phone number is required to send via WhatsApp.');
      return;
    }
    const formatted = formatPatronMessage(text, couponCode, actionUrl || patronForm.actionUrl);
    const url = getWhatsAppUrl(phone, formatted);
    window.open(url, '_blank', 'noopener,noreferrer');
    if (recipientId) {
      setManualSentStatus(prev => ({
        ...prev,
        [recipientId]: { ...prev[recipientId], whatsapp: true }
      }));
    }
    success('WhatsApp opened with pre-filled message, coupon, and website link.');
  };

  // 1-Click Manual Send to Patron: Email (with website link & coupon guaranteed)
  const handleSendEmailManual = (email, title, text, recipientId = null, couponCode = '', actionUrl = '') => {
    if (!email) {
      error('Patron email address is required to send via Email.');
      return;
    }
    const formatted = formatPatronMessage(text, couponCode, actionUrl || patronForm.actionUrl);
    const url = getMailtoUrl(email, title, formatted);
    window.location.href = url;
    if (recipientId) {
      setManualSentStatus(prev => ({
        ...prev,
        [recipientId]: { ...prev[recipientId], email: true }
      }));
    }
    info('Email client opened with pre-filled subject, body, and website link.');
  };

  // Open Recipients modal anchored immediately to TOP of screen
  const handleOpenRecipients = async (batchId) => {
    setSelectedBatch(batchId);
    setSelectedMessage(null);
    setRecipientsLoading(true);

    // Scroll window to top immediately so roster modal is at the very top of page
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    try {
      const [details, recipientList] = await Promise.all([
        notificationApi.getSentNotificationDetails(batchId).catch(() => null),
        notificationApi.getSentNotificationRecipients(batchId, { page: 1, pageSize: 100 }).catch(() => [])
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

  // Save & Assign Campaign to Backend Database (Pure backend persistence, zero local storage)
  const handleSaveManualDispatch = async (e) => {
    e.preventDefault();
    if (!patronForm.selectedCouponId) {
      error('Please select an active coupon to assign to VIP patrons and save the campaign batch to the backend database.');
      return;
    }

    setComposerLoading(true);
    try {
      const chosenCoupon = activeCoupons.find(c => String(c.id) === String(patronForm.selectedCouponId));
      
      // Save campaign directly to the real backend database
      const res = await notificationApi.assignCouponToVip(patronForm.selectedCouponId);

      // Re-fetch the real campaign list directly from the backend API (GET /api/admin/sent-notifications)
      await fetchCampaigns();

      success(res?.message || `Privilege campaign for '${chosenCoupon?.code}' saved to backend successfully! You can now open its Roster to send via WhatsApp and Email.`);
      setComposerOpen(false);
    } catch (err) {
      console.error('Save backend dispatch error:', err);
      error(err?.message || 'Failed to save campaign in backend.');
    } finally {
      setComposerLoading(false);
    }
  };

  // Format date DD/MM/YYYY, HH:mm
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
              <span>Personalized Patron Concierge & Dispatch</span>
            </span>
          </div>
          <h2 className="font-cinzel text-2xl font-bold uppercase tracking-wider text-[#F3E6D0]">
            Sent Notifications & Broadcast Hub
          </h2>
          <p className="text-xs text-[#D8BE99]">
            Send notifications directly to individual patrons via WhatsApp and Email one by one manually, and export unified PDF reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Send Notification to Patron (Manual 1-by-1) */}
          <button
            type="button"
            onClick={handleOpenComposer}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#D4AF37] text-black font-cinzel text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.35)]"
          >
            <User className="w-4 h-4" />
            <span>+ Send Notification to Patron</span>
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
            {marketingOnly ? '✓ Marketing Only' : 'All Dispatches'}
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
                <th className="py-3.5 px-4">Event / Patron</th>
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
                    <span>Loading multi-channel notification log...</span>
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-[#D8BE99]/70 space-y-2">
                    <Send className="w-8 h-8 mx-auto text-[#D4AF37]/40" />
                    <p className="font-cinzel text-xs uppercase tracking-wider">No notification history recorded</p>
                    <p className="text-[11px] text-[#D8BE99]/50">Use '+ Send Notification to Patron' to send manually to customers.</p>
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => {
                  const batchId = c.batchId || c.id;
                  const dateFormatted = formatBroadcastDate(c.createdAtUtc || c.createdAt || c.sentAt);
                  const rawChannels = Array.isArray(c.channels) ? c.channels : [c.channel || 'WhatsApp'];
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

                      {/* 2. Event / Patron Column */}
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

                      {/* 4. Delivery Channels Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {channels
                            .filter(ch => !ch.toLowerCase().includes('inapp') && !ch.toLowerCase().includes('web') && !ch.toLowerCase().includes('viber'))
                            .concat(
                              channels.filter(ch => !ch.toLowerCase().includes('inapp') && !ch.toLowerCase().includes('web') && !ch.toLowerCase().includes('viber')).length === 0
                                ? ['WhatsApp', 'Email']
                                : []
                            )
                            .map((ch) => {
                              const isWhatsApp = ch.toLowerCase().includes('whatsapp');
                              const isEmail = ch.toLowerCase().includes('email');

                              return (
                                <span
                                  key={ch}
                                  className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border flex items-center gap-1 ${
                                    isWhatsApp
                                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                                      : 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                                  }`}
                                >
                                  {isWhatsApp && <Smartphone className="w-2.5 h-2.5" />}
                                  {isEmail && <Mail className="w-2.5 h-2.5" />}
                                  <span>{ch}</span>
                                </span>
                              );
                            })}
                        </div>
                      </td>

                      {/* 5. Recipients Column */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-xs text-[#F3E6D0]">
                        {c.totalRecipients || c.sent || 1}
                      </td>

                      {/* 6. Actions Column */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Inspect Recipients Roster */}
                          <button
                            type="button"
                            onClick={() => handleOpenRecipients(batchId)}
                            className="px-2.5 py-1.5 rounded-lg border border-[#D4AF37]/30 bg-black/40 text-[11px] text-[#D8BE99] hover:text-[#F2D675] hover:border-[#D4AF37] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                            title="View Campaign Delivery Roster"
                          >
                            <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>Roster</span>
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

      {/* Recipient Drilldown Modal (Anchored to the absolute TOP of page) */}
      {selectedBatch && (
        <div
          ref={rosterOverlayRef}
          className="fixed inset-0 z-50 flex items-start justify-center pt-2 sm:pt-4 pb-6 px-2 sm:px-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
        >
          <div className="relative w-full max-w-4xl rounded-3xl bg-[#0B0A08] border border-[#D4AF37]/40 p-5 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.98)] text-[#F3E6D0] space-y-4 max-h-[96vh] flex flex-col overflow-hidden mt-0 mb-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#D4AF37]/20 pb-3 shrink-0">
              <div className="space-y-0.5">
                <h3 className="font-cinzel text-base sm:text-lg font-bold uppercase text-[#F2D675] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#D4AF37]" />
                  <span>Patron Delivery Roster — Manual 1-by-1 Sending</span>
                </h3>
                <p className="font-mono text-[11px] text-[#D8BE99]/80">
                  Batch: <span className="text-[#F3E6D0]">{selectedBatch}</span> • Send to patrons individually via WhatsApp & Email
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Single Button: Gather all messages into one PDF */}
                <button
                  type="button"
                  onClick={() => handleExportPdfReport(selectedBatch)}
                  disabled={exportingPdfId === selectedBatch}
                  className="px-3 py-1.5 rounded-xl border border-[#D4AF37] bg-[#D4AF37]/20 text-xs font-cinzel font-bold text-[#F2D675] hover:bg-[#D4AF37] hover:text-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  title="Gather all messages into one PDF file"
                >
                  {exportingPdfId === selectedBatch ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileText className="w-3.5 h-3.5" />
                  )}
                  <span>Export PDF Report</span>
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

            {/* Recipients List directly in view without scrolling */}
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
                  const phone = r.phone || r.phoneNumber || '';
                  const email = r.email || '';
                  const language = r.language || 'en';
                  const messageText = r.message || r.body || batchDetails?.body || batchDetails?.message || 'Exclusive offer from Arabian Sheikh';
                  const couponCode = batchDetails?.couponCode || r.couponCode || '';

                  const isSentStatus = manualSentStatus[recipientId] || {};
                  const isMsgLoading = messageLoadingId === recipientId;

                  return (
                    <div
                      key={recipientId}
                      className="p-3 rounded-xl bg-black/50 border border-[#D4AF37]/25 hover:border-[#D4AF37]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs transition-all"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#F3E6D0] text-sm">{recipientName}</span>
                          <span className="uppercase text-[9px] px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-[#D8BE99]">
                            {language}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 font-mono text-[11px] text-[#D8BE99]/80">
                          {phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-400" />
                              <span>{phone}</span>
                            </span>
                          )}
                          {email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-blue-400" />
                              <span>{email}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Manual 1-by-1 Send Actions with link & coupon formatted */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {/* 1. Send WhatsApp 1-by-1 */}
                        {phone && (
                          <button
                            type="button"
                            onClick={() => handleSendWhatsAppManual(phone, messageText, recipientId, couponCode, batchDetails?.actionUrl)}
                            className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                              isSentStatus.whatsapp
                                ? 'bg-emerald-900/50 border-emerald-400 text-emerald-300'
                                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-800/40'
                            }`}
                            title="Open WhatsApp with this patron, prefilled message, coupon, and website link"
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>{isSentStatus.whatsapp ? '✓ WhatsApp Sent' : 'Send WhatsApp'}</span>
                          </button>
                        )}

                        {/* 2. Send Email 1-by-1 */}
                        {email && (
                          <button
                            type="button"
                            onClick={() => handleSendEmailManual(email, batchDetails?.title || 'Arabian Sheikh Notice', messageText, recipientId, couponCode, batchDetails?.actionUrl)}
                            className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                              isSentStatus.email
                                ? 'bg-blue-900/50 border-blue-400 text-blue-300'
                                : 'bg-blue-950/40 border-blue-500/40 text-blue-400 hover:bg-blue-800/40'
                            }`}
                            title="Open email client for this patron with prefilled message, coupon, and website link"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>{isSentStatus.email ? '✓ Email Sent' : 'Send Email'}</span>
                          </button>
                        )}

                        {/* 3. Inspect Message */}
                        <button
                          type="button"
                          onClick={() => handleViewMessage(recipientId)}
                          disabled={isMsgLoading}
                          className="p-1.5 rounded-lg border border-white/10 bg-black/40 text-[#D8BE99] hover:text-white hover:border-white/30 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                          title="Inspect Delivered Message Content"
                        >
                          {isMsgLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Details Preview Drawer */}
            {selectedMessage && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#18140E] to-[#0D0B08] border border-[#D4AF37]/50 shadow-2xl space-y-2 animate-fade-in relative shrink-0">
                <div className="flex items-start justify-between gap-3 border-b border-[#D4AF37]/20 pb-1.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <h4 className="font-cinzel text-xs font-bold text-[#F2D675] uppercase tracking-wide">
                      {selectedMessage.title || 'Personalized Notification Preview'}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMessage(null)}
                    className="p-1 text-[#D8BE99] hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-black/60 border border-[#D4AF37]/30 text-xs text-[#F3E6D0] leading-relaxed select-all">
                  {formatPatronMessage(selectedMessage.body || selectedMessage.text, batchDetails?.couponCode, batchDetails?.actionUrl)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MANUAL NOTIFICATION COMPOSER (ONE-BY-ONE PATRON SENDING) */}
      {composerOpen && (
        <div
          ref={composerOverlayRef}
          className="fixed inset-0 z-50 flex items-start justify-center pt-2 sm:pt-4 pb-6 px-2 sm:px-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
        >
          <div className="relative w-full max-w-4xl rounded-3xl bg-[#0B0A08] border border-[#D4AF37]/45 shadow-[0_25px_70px_rgba(0,0,0,0.98)] text-[#F3E6D0] max-h-[96vh] flex flex-col overflow-hidden mt-0 mb-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#D4AF37]/25 flex items-center justify-between bg-black/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl border border-[#D4AF37]/50 bg-gradient-to-br from-[#D4AF37]/20 via-black to-[#8C6239]/20 flex items-center justify-center text-[#F2D675] shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cinzel text-base sm:text-lg font-bold uppercase tracking-wider text-[#F2D675]">
                    Send Notification to Patron (Manual Dispatch)
                  </h3>
                  <p className="text-[11px] text-[#D8BE99]">
                    Select a patron to message via WhatsApp and Email one by one, or assign an exclusive coupon campaign to the backend.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                className="p-1.5 rounded-full text-[#D8BE99] hover:text-[#F3E6D0] hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form & Patron Selection (7 cols) */}
              <form onSubmit={handleSaveManualDispatch} id="manual-patron-form" className="lg:col-span-7 space-y-4 text-xs font-sans">
                {/* 1. Patron Selection & Directory Search */}
                <div className="space-y-2">
                  <label className="block uppercase tracking-wider font-cinzel text-[#F2D675] font-bold">
                    1. Select Patron / Customer
                  </label>

                  {/* Customer search bar */}
                  <div className="relative">
                    <input
                      type="text"
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      placeholder="Search patron by name, email, or phone number..."
                      className="w-full bg-black/60 border border-[#D4AF37]/40 rounded-xl py-2 pl-9 pr-3 text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:outline-none"
                    />
                    <Search className="w-4 h-4 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>

                  {/* Filtered Customer Dropdown Results */}
                  {filteredCustomers.length > 0 && (
                    <div className="max-h-40 overflow-y-auto rounded-xl bg-[#110E0A] border border-[#D4AF37]/40 p-1 space-y-1 shadow-2xl z-20">
                      {filteredCustomers.slice(0, 6).map((c) => (
                        <div
                          key={c.id || c.email}
                          onClick={() => handleSelectCustomer(c)}
                          className="p-2 rounded-lg hover:bg-[#D4AF37]/20 flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div>
                            <span className="font-bold text-[#F3E6D0] block text-xs">{c.name || c.fullName}</span>
                            <span className="text-[10px] text-[#D8BE99]/70">{c.email} • {c.phone || 'No phone'}</span>
                          </div>
                          <span className="text-[10px] font-cinzel text-[#D4AF37] uppercase font-bold">Select</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Chosen Patron Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] uppercase text-[#D8BE99] block font-semibold mb-0.5">Patron Name</span>
                      <input
                        type="text"
                        required
                        value={patronForm.patronName}
                        onChange={(e) => setPatronForm({ ...patronForm, patronName: e.target.value })}
                        placeholder="e.g. Princess Jasmine"
                        className="w-full bg-black/40 border border-[#D4AF37]/30 rounded-lg p-2 text-[#F3E6D0]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-[#D8BE99] block font-semibold mb-0.5">Phone Number (WhatsApp)</span>
                      <input
                        type="text"
                        value={patronForm.patronPhone}
                        onChange={(e) => setPatronForm({ ...patronForm, patronPhone: e.target.value })}
                        placeholder="+201..."
                        className="w-full bg-black/40 border border-[#D4AF37]/30 rounded-lg p-2 text-[#F3E6D0]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-[#D8BE99] block font-semibold mb-0.5">Email Address</span>
                      <input
                        type="email"
                        value={patronForm.patronEmail}
                        onChange={(e) => setPatronForm({ ...patronForm, patronEmail: e.target.value })}
                        placeholder="patron@palace.com"
                        className="w-full bg-black/40 border border-[#D4AF37]/30 rounded-lg p-2 text-[#F3E6D0]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Notification Title */}
                <div>
                  <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold mb-1">
                    Notification Title / Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={patronForm.title}
                    onChange={(e) => setPatronForm({ ...patronForm, title: e.target.value })}
                    placeholder="e.g. Royal Invitation: Private Reserve Access"
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                {/* 3. Action URL & Optional Coupon (Auto-types into message!) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold mb-1">
                      Website Link URL
                    </label>
                    <input
                      type="text"
                      value={patronForm.actionUrl}
                      onChange={(e) => setPatronForm({ ...patronForm, actionUrl: e.target.value })}
                      placeholder="/shop or /account/orders"
                      className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-[#F3E6D0] font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold mb-1">
                      Attach Coupon (Types in message)
                    </label>
                    <select
                      value={patronForm.selectedCouponId}
                      onChange={(e) => handleSelectCoupon(e.target.value)}
                      className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-[#F3E6D0] cursor-pointer"
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

                {/* 4. Message Content Body */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="uppercase tracking-wider text-[#D8BE99] font-semibold">
                      Message Content (Includes Website Link & Coupon)
                    </label>
                    <span className="text-[10px] font-mono text-[#D8BE99]/60">
                      {patronForm.body.length} chars
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={patronForm.body}
                    onChange={(e) => setPatronForm({ ...patronForm, body: e.target.value })}
                    placeholder="Type the message for this patron..."
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl p-3 text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:outline-none leading-relaxed resize-none font-mono text-xs"
                  />
                </div>

                {/* 5. Direct Manual Send Buttons Box */}
                <div className="p-3.5 rounded-2xl bg-black/60 border border-[#D4AF37]/40 space-y-2.5">
                  <span className="font-cinzel text-xs uppercase tracking-wider text-[#F2D675] font-bold block">
                    Direct 1-Click Manual Send Actions:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Send WhatsApp */}
                    <button
                      type="button"
                      onClick={() => handleSendWhatsAppManual(
                        patronForm.patronPhone,
                        patronForm.body,
                        null,
                        activeCoupons.find(c => String(c.id) === String(patronForm.selectedCouponId))?.code,
                        patronForm.actionUrl
                      )}
                      className="py-2.5 px-3 rounded-xl bg-emerald-950/50 border border-emerald-500/60 hover:bg-emerald-900/60 text-emerald-300 font-cinzel font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                    >
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span>WhatsApp (1-Click)</span>
                    </button>

                    {/* Send Email */}
                    <button
                      type="button"
                      onClick={() => handleSendEmailManual(
                        patronForm.patronEmail,
                        patronForm.title,
                        patronForm.body,
                        null,
                        activeCoupons.find(c => String(c.id) === String(patronForm.selectedCouponId))?.code,
                        patronForm.actionUrl
                      )}
                      className="py-2.5 px-3 rounded-xl bg-blue-950/50 border border-blue-500/60 hover:bg-blue-900/60 text-blue-300 font-cinzel font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                    >
                      <Mail className="w-4 h-4 text-blue-400" />
                      <span>Email (1-Click)</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Right Column: Previews (5 cols) */}
              <div className="lg:col-span-5 space-y-3 flex flex-col">
                <span className="font-cinzel text-xs uppercase tracking-wider text-[#F2D675] font-bold block">
                  Manual Message Preview
                </span>

                {/* Tabs */}
                <div className="flex rounded-xl bg-black/60 border border-[#D4AF37]/30 p-1">
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

                {/* Preview Display */}
                <div className="flex-1 rounded-2xl bg-black/80 border border-[#D4AF37]/25 p-4 flex flex-col justify-center min-h-[220px]">
                  {/* WHATSAPP PREVIEW */}
                  {previewTab === 'whatsapp' && (
                    <div className="space-y-3 animate-fade-in">
                      <span className="text-[10px] font-mono text-emerald-400/80 block uppercase">
                        Patron WhatsApp Screen
                      </span>
                      <div className="p-3.5 rounded-2xl bg-[#0B2017] border border-emerald-500/40 text-emerald-100 shadow-xl space-y-2 max-w-sm">
                        <div className="flex items-center gap-2 border-b border-emerald-500/20 pb-1.5">
                          <span className="font-cinzel text-xs font-bold text-emerald-300">
                            Arabian Sheikh Official
                          </span>
                        </div>
                        <p className="font-bold text-xs text-white">
                          {patronForm.title || 'Palace Notice'}
                        </p>
                        <p className="text-[11px] font-sans text-emerald-100/90 leading-relaxed whitespace-pre-wrap">
                          {formatPatronMessage(
                            patronForm.body,
                            activeCoupons.find(c => String(c.id) === String(patronForm.selectedCouponId))?.code,
                            patronForm.actionUrl
                          )}
                        </p>
                        <div className="pt-1 flex items-center justify-between text-[9px] text-emerald-400/60 font-mono">
                          <span>To: {patronForm.patronName || 'Patron'}</span>
                          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EMAIL PREVIEW */}
                  {previewTab === 'email' && (
                    <div className="space-y-3 animate-fade-in">
                      <span className="text-[10px] font-mono text-blue-400/80 block uppercase">
                        Patron Email Screen
                      </span>
                      <div className="p-3.5 rounded-2xl bg-[#111116] border border-blue-500/30 text-[#F3E6D0] shadow-xl space-y-2.5">
                        <div className="text-center border-b border-[#D4AF37]/20 pb-2">
                          <span className="font-cinzel text-[11px] font-bold text-[#F2D675] tracking-widest uppercase block">
                            ARABIAN SHEIKH
                          </span>
                        </div>
                        <div>
                          <h4 className="font-cinzel text-xs font-bold text-[#F2D675]">
                            {patronForm.title || 'Email Subject Header'}
                          </h4>
                          <p className="text-[11px] font-sans text-[#D8BE99] mt-1 leading-relaxed whitespace-pre-wrap">
                            {formatPatronMessage(
                              patronForm.body,
                              activeCoupons.find(c => String(c.id) === String(patronForm.selectedCouponId))?.code,
                              patronForm.actionUrl
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-[#D4AF37]/25 flex items-center justify-between bg-black/60 shrink-0">
              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-white/20 text-xs font-cinzel uppercase text-[#D8BE99] hover:text-white transition-all cursor-pointer"
              >
                Close
              </button>

              <button
                type="submit"
                form="manual-patron-form"
                disabled={composerLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#D4AF37] text-black font-cinzel text-xs font-bold uppercase tracking-wider hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(212,175,55,0.4)]"
              >
                {composerLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Saving to Backend...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Assign & Save Campaign to Backend</span>
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
