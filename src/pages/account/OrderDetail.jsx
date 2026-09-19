import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { orderService } from '../../services/orderService';
import { shippingService } from '../../services/shippingService';
import {
  Truck,
  ArrowLeft,
  Printer,
  AlertCircle,
  Copy,
  Check,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  MapPin,
  CreditCard,
  Calendar,
  Package,
  Sparkles,
  CheckCircle2,
  Banknote,
  FileText,
  ChevronRight,
  Phone,
  Building,
  Globe,
  Receipt
} from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../../components/common/ScrollReveal';
import returnsService from '../../services/returnsService';
import ReturnWizardModal from '../../components/returns/ReturnWizardModal';
import ReturnDetailsModal from '../../components/returns/ReturnDetailsModal';

function formatOrderStatus(status = '') {
  if (!status) return 'Pending';
  return String(status)
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/_/g, ' ');
}

function getStatusBadge(status = '') {
  const s = String(status || '').toUpperCase().replace(/[\s_-]+/g, '');
  if (s.includes('DELIVER')) {
    return 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]';
  }
  if (s.includes('SHIP') || s.includes('TRANSIT') || s.includes('OUTFOR')) {
    return 'bg-amber-950/70 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]';
  }
  if (s.includes('PROCESS') || s.includes('CONFIRM')) {
    return 'bg-blue-950/70 text-blue-300 border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.25)]';
  }
  if (s.includes('CANCEL')) {
    return 'bg-rose-950/70 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.25)]';
  }
  return 'bg-[#21130D] text-[#D8BE99] border-[#D4AF37]/30 shadow-[0_0_8px_rgba(212,175,55,0.15)]';
}

function getPaymentStatusBadge(status = '') {
  const s = String(status || '').toUpperCase();
  if (s.includes('PAID') || s.includes('SETTLED') || s.includes('SUCCEED')) {
    return 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40';
  }
  if (s.includes('FAIL') || s.includes('DECLIN')) {
    return 'bg-rose-950/70 text-rose-300 border-rose-500/40';
  }
  return 'bg-amber-950/70 text-amber-300 border-amber-500/40';
}

function formatPrice(amount, currency = 'EUR') {
  const num = Number(amount) || 0;
  const curr = String(currency || 'EUR').toUpperCase();
  const symbol = curr === 'USD' ? '$' : (curr === 'GBP' ? '£' : (curr === 'BGN' ? 'лв ' : '€'));
  return `${symbol}${num.toFixed(2)}`;
}

function formatPaymentMethod(method, paymentMethodCode) {
  const raw = String(paymentMethodCode || method?.brand || method || '').toLowerCase();
  if (raw.includes('stripe') || raw.includes('credit') || raw.includes('card')) {
    return {
      label: 'Stripe Secure Card',
      icon: CreditCard,
      badge: 'Visa / Mastercard'
    };
  }
  if (raw.includes('cod') || raw.includes('cash') || raw.includes('delivery')) {
    return {
      label: 'Cash on Delivery (COD)',
      icon: Banknote,
      badge: 'Pay on Doorstep'
    };
  }
  return {
    label: raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'Credit Card',
    icon: CreditCard,
    badge: 'Electronic Settlement'
  };
}

export default function OrderDetail() {
  const { currentPath, navigate } = useRouter();
  const { t } = useTranslation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Logistics & Cancellation State
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [copiedOrderCode, setCopiedOrderCode] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Returns & Refunds State
  const [eligibility, setEligibility] = useState(null);
  const [orderReturns, setOrderReturns] = useState([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedReturnId, setSelectedReturnId] = useState(null);

  const orderId = currentPath.split('/account/orders/')[1]?.split('?')[0];

  const refreshOrderData = async () => {
    if (!orderId) return;
    try {
      const [item, deliv, elig, ret] = await Promise.allSettled([
        orderService.getOrderById(orderId),
        orderService.getDeliveryStatus(orderId),
        returnsService.checkEligibility(orderId),
        returnsService.getOrderReturns(orderId)
      ]);
      const orderData = item.status === 'fulfilled' ? item.value : null;
      const delivData = deliv.status === 'fulfilled' ? deliv.value : null;

      if (orderData) {
        setOrder({
          ...orderData,
          shipmentStatus: delivData?.shipmentStatus || orderData.shipmentStatus || null,
          trackingCode: delivData?.trackingNumber || orderData.trackingCode || null,
          carrierStatus: delivData?.carrierStatus || orderData.carrierStatus || null
        });
      }
      if (elig.status === 'fulfilled') setEligibility(elig.value);
      if (ret.status === 'fulfilled') setOrderReturns(ret.value || []);
    } catch (err) {
      console.warn('Failed to refresh order data:', err);
    }
  };

  useEffect(() => {
    async function load() {
      if (!orderId) return;
      try {
        const [item, deliv, elig, ret] = await Promise.allSettled([
          orderService.getOrderById(orderId),
          orderService.getDeliveryStatus(orderId),
          returnsService.checkEligibility(orderId),
          returnsService.getOrderReturns(orderId)
        ]);
        const orderData = item.status === 'fulfilled' ? item.value : null;
        const delivData = deliv.status === 'fulfilled' ? deliv.value : null;

        if (orderData) {
          setOrder({
            ...orderData,
            shipmentStatus: delivData?.shipmentStatus || orderData.shipmentStatus || null,
            trackingCode: delivData?.trackingNumber || orderData.trackingCode || null,
            carrierStatus: delivData?.carrierStatus || orderData.carrierStatus || null
          });
        }
        if (elig.status === 'fulfilled') setEligibility(elig.value);
        if (ret.status === 'fulfilled') setOrderReturns(ret.value || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();

    const handleUpdate = async (e) => {
      const target = String(orderId).replace(/^#/, '').toLowerCase().trim();

      if (e?.type === 'arabian_sheikh_order_updated') {
        const updatedId = e?.detail?.orderId;
        const eventTarget = String(updatedId || '').replace(/^#/, '').toLowerCase().trim();
        const matchesDetail = e?.detail?.order && (
          String(e.detail.order.id || '').toLowerCase().replace(/^#/, '').trim() === target ||
          String(e.detail.order.orderNumber || '').toLowerCase().replace(/^#/, '').trim() === target
        );
        if (eventTarget !== target && !matchesDetail) return;
      }

      if (e?.type === 'arabian_sheikh_cloud_updated') {
        const cloudOrders = e?.detail?.orders;
        if (Array.isArray(cloudOrders)) {
          const hasThisOrder = cloudOrders.some(o => {
            const oId = String(o.id || '').replace(/^#/, '').toLowerCase().trim();
            const oNum = String(o.orderNumber || '').replace(/^#/, '').toLowerCase().trim();
            return oId === target || oNum === target;
          });
          if (!hasThisOrder) return;
        }
      }

      const item = await orderService.getOrderById(orderId);
      if (item) setOrder(item);
    };

    window.addEventListener('arabian_sheikh_order_updated', handleUpdate);
    window.addEventListener('arabian_sheikh_cloud_updated', handleUpdate);

    const handleStorageChange = (e) => {
      if (
        e.key === 'arabian_sheikh_orders' ||
        e.key === 'arabian_sheikh_last_order_update' ||
        e.key === 'arabian_sheikh_live_cloud_state_v4'
      ) {
        orderService.getOrderById(orderId).then(item => { if (item) setOrder(item); });
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('arabian_sheikh_order_updated', handleUpdate);
      window.removeEventListener('arabian_sheikh_cloud_updated', handleUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-cinzel text-sm text-[#D8BE99] tracking-wider uppercase">
          Retrieving royal invoice & order details...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center space-y-5 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 p-8 shadow-2xl">
        <div className="w-16 h-16 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center mx-auto text-[#D4AF37]">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="font-cinzel text-xl font-bold text-[#F3E6D0]">Order Reference Not Found</h3>
        <p className="text-xs text-[#D8BE99] max-w-sm mx-auto">
          The requested acquisition reference could not be located in your palace records.
        </p>
        <Link
          to="/account/orders"
          className="inline-block px-8 py-3 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-full hover:bg-[#F2D675] transition-colors cursor-pointer"
        >
          Return to All Orders
        </Link>
      </div>
    );
  }

  const formattedOrderCode = orderService.formatOrderCode(order);
  const displayStatus = order.orderStatus || order.status || 'Pending';
  const paymentStatus = order.paymentStatus || 'Pending';
  const isCancelled = String(displayStatus).toLowerCase().includes('cancel');
  const statusBadgeClass = getStatusBadge(displayStatus);
  const paymentBadgeClass = getPaymentStatusBadge(paymentStatus);

  const cancelNote = order.timeline?.find(t => String(t.status).toLowerCase().includes('cancel'))?.title ||
    order.statusHistory?.find(h => String(h.toStatus || h.status).toLowerCase().includes('cancel'))?.note || '';

  const normStatus = String(displayStatus).toLowerCase();
  const isCancellable = ['pending', 'processing'].includes(normStatus) && !isCancelled;
  const isShippedOrOut = ['shipped', 'outfordelivery'].includes(normStatus);

  const trackingNumber = order.trackingCode || order.dhlTrackingNumber || order.shippingSnapshot?.trackingNumber || order.shipments?.[0]?.trackingNumber || null;
  const carrierName = order.carrier || order.shippingSnapshot?.shippingCompanyName || order.shippingSnapshot?.carrier || order.shipping?.shippingCompanyName || 'ECONT';
  const shipmentStatus = order.shipmentStatus || (normStatus === 'shipped' ? 'Shipped' : (normStatus === 'delivered' ? 'Delivered' : (normStatus === 'outfordelivery' ? 'OutForDelivery' : 'Pending')));

  // Address normalization
  const shipping = order.shippingAddress || {};
  const recipientName = shipping.fullName || shipping.recipientName || order.customerName || 'Valued Patron';
  const address1 = shipping.addressLine1 || shipping.address || '';
  const address2 = shipping.addressLine2 || '';
  const city = shipping.city || '';
  const region = shipping.region || '';
  const postalCode = shipping.postalCode || '';
  const country = shipping.country || shipping.countryCode || '';
  const phone = shipping.phone || order.customerPhone || null;
  const cityLine = [city, region, postalCode].filter(Boolean).join(', ');

  // Financial calculations with dynamic currency and fallback
  const items = Array.isArray(order.items) ? order.items : [];
  const itemsSubtotal = items.reduce((sum, item) => sum + (Number(item.price || item.unitPrice || 0) * Number(item.quantity || 1)), 0);
  const rawSubtotal = Number(order.subtotal ?? order.totals?.subtotal ?? itemsSubtotal);
  const subtotal = rawSubtotal > 0 ? rawSubtotal : itemsSubtotal;
  const discountAmount = Number(order.discountAmount ?? order.discountTotal ?? order.totals?.discountTotal ?? 0);
  const shippingCost = Number(order.shippingCost ?? order.shipping ?? order.totals?.shippingCost ?? 0);
  const grandTotal = Number(order.total ?? order.totals?.total ?? (subtotal - discountAmount + shippingCost));
  const currency = order.currency || order.totals?.currency || 'EUR';

  // Payment method info
  const paymentInfo = formatPaymentMethod(order.paymentMethod, order.paymentMethodCode);
  const PaymentIcon = paymentInfo.icon;

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedOrderCode(true);
    setTimeout(() => setCopiedOrderCode(false), 2000);
  };

  const handleCopyTracking = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    setCancelling(true);
    try {
      const res = await orderService.customerCancelOrder(order.id, cancelReason);
      const updatedStatus = res?.orderStatus || res?.status || 'Cancelled';
      setOrder(prev => ({
        ...prev,
        orderStatus: updatedStatus,
        status: updatedStatus
      }));
      setCancelModalOpen(false);
    } catch (err) {
      console.warn('Failed to cancel order:', err);
    } finally {
      setCancelling(false);
    }
  };

  // Order timeline progression steps
  const orderSteps = [
    { key: 'placed', label: 'Order Placed', icon: FileText },
    { key: 'confirmed', label: 'Confirmed', icon: ShieldCheck },
    { key: 'processing', label: 'Crafting & Packing', icon: Package },
    { key: 'shipped', label: 'In Transit', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 }
  ];

  function getStepState(index) {
    if (isCancelled) return 'cancelled';
    if (index === 0) return 'completed';
    if (index === 1) {
      if (paymentStatus === 'Paid' || ['processing', 'shipped', 'delivered'].includes(normStatus)) return 'completed';
      return 'active';
    }
    if (index === 2) {
      if (['shipped', 'delivered'].includes(normStatus)) return 'completed';
      if (normStatus === 'processing') return 'active';
      return 'pending';
    }
    if (index === 3) {
      if (normStatus === 'delivered') return 'completed';
      if (['shipped', 'outfordelivery'].includes(normStatus)) return 'active';
      return 'pending';
    }
    if (index === 4) {
      if (normStatus === 'delivered') return 'completed';
      return 'pending';
    }
    return 'pending';
  }

  return (
    <div className="space-y-8 animate-fade-in text-[#F3E6D0]">

      {/* ─── Top Header & Primary Actions ─── */}
      <ScrollReveal direction="up">
        <div className="rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#D4AF37]/20">
            <div className="space-y-2">
              <button
                onClick={() => navigate('/account/orders')}
                className="group inline-flex items-center gap-2 text-xs font-cinzel font-bold text-[#D4AF37] hover:text-[#F2D675] uppercase tracking-wider transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                <span>Back to All Orders</span>
              </button>

              <div className="flex items-center gap-3 flex-wrap pt-1">
                <h2 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase text-[#F3E6D0] tracking-wide">
                  Order Reference: {formattedOrderCode}
                </h2>
                <button
                  onClick={() => handleCopyCode(formattedOrderCode)}
                  className="p-1.5 rounded-lg bg-black/50 border border-[#D4AF37]/30 text-[#D4AF37] hover:text-white hover:border-[#D4AF37] transition-colors cursor-pointer"
                  title="Copy Order Reference Code"
                >
                  {copiedOrderCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#D8BE99]">
                <span className="flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Placed on {new Date(order.date || order.createdAt).toLocaleString()}</span>
                </span>
                <span className="text-[#D4AF37]/40">•</span>
                <span className={`px-3 py-1 text-xs font-mono font-bold rounded-full uppercase border ${statusBadgeClass}`}>
                  {formatOrderStatus(displayStatus)}
                </span>
                <span className={`px-3 py-1 text-xs font-mono font-bold rounded-full uppercase border ${paymentBadgeClass}`}>
                  {paymentStatus === 'Paid' ? 'Paid & Settled' : `Payment: ${paymentStatus}`}
                </span>
              </div>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {/* Cancel Button */}
              {isCancellable && (
                <button
                  onClick={() => { setCancelReason(''); setCancelModalOpen(true); }}
                  className="px-4 py-2.5 border border-rose-500/40 hover:border-rose-500 text-rose-300 hover:text-rose-200 bg-rose-950/30 text-xs font-cinzel font-bold uppercase tracking-wider flex items-center gap-2 transition-all rounded-full cursor-pointer shadow-sm hover:shadow-rose-900/20"
                  title="Request cancellation for this order"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Cancel Order</span>
                </button>
              )}

              {/* Return Request Button */}
              {eligibility?.eligible && (eligibility?.eligibleItems?.length > 0) && (
                <button
                  onClick={() => setWizardOpen(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-white hover:text-black text-xs font-cinzel font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 rounded-full cursor-pointer shadow-lg border border-[#F2D675]/40"
                  title="Request a return or refund for this order"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Request Return</span>
                </button>
              )}

              {/* Track Order Timeline Button */}
              <Link
                to={`/order-tracking/${order.orderNumber || order.id}`}
                className="group/btn relative px-6 py-2.5 rounded-full bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all duration-300 shadow-md cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Track Order Timeline</span>
              </Link>

              {/* Print Parchment Invoice Button */}
              <button
                onClick={() => window.print()}
                className="p-2.5 rounded-full border border-[#D4AF37]/30 hover:border-[#D4AF37] bg-black/40 text-[#D4AF37] hover:text-white transition-colors cursor-pointer"
                title="Print Royal Invoice"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ─── Order Progression Timeline ─── */}
          <div className="pt-2">
            <h4 className="text-[11px] font-cinzel font-bold uppercase tracking-widest text-[#D4AF37] mb-4">
              Acquisition Progress
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {orderSteps.map((step, idx) => {
                const state = getStepState(idx);
                const Icon = step.icon;
                const isCompleted = state === 'completed';
                const isActive = state === 'active';
                const isCancelledState = state === 'cancelled';

                return (
                  <div
                    key={step.key}
                    className={`p-3 rounded-xl border flex flex-col items-center text-center space-y-2 transition-all ${
                      isCompleted
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 shadow-sm'
                        : isActive
                          ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#F2D675] shadow-md shadow-[#D4AF37]/10'
                          : isCancelledState
                            ? 'bg-rose-950/20 border-rose-500/30 text-rose-400 opacity-60'
                            : 'bg-black/40 border-white/10 text-neutral-500'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-emerald-900/60 text-emerald-300'
                        : isActive
                          ? 'bg-[#D4AF37]/30 text-[#F2D675] animate-pulse'
                          : 'bg-white/5 text-neutral-500'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-cinzel text-[11px] font-bold uppercase leading-tight">
                      {step.label}
                    </span>
                    <span className="text-[9px] font-mono uppercase tracking-wider">
                      {isCompleted ? 'Completed' : isActive ? 'In Progress' : isCancelledState ? 'Terminated' : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ─── Cancellation Notice Banner ─── */}
      {isCancelled && (
        <ScrollReveal direction="up">
          <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-500/40 flex items-start gap-3.5 text-rose-300 shadow-xl">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-cinzel font-bold text-sm text-rose-200 uppercase tracking-wider">
                Order Acquisition Cancelled
              </p>
              <p className="text-rose-300/90 leading-relaxed">
                {cancelNote || 'This acquisition was cancelled. If payment was settled, a full refund will be disbursed to your original settlement method.'}
              </p>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* ─── Return Eligibility Banner ─── */}
      {eligibility?.eligible && (
        <ScrollReveal direction="up">
          <div className="p-5 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl backdrop-blur-md">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center shrink-0 text-[#F2D675]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-cinzel font-bold text-[#F3E6D0] uppercase tracking-wider text-sm block">
                  Royal Return Privilege Active
                </span>
                <span className="text-xs text-[#D8BE99]">
                  {eligibility.reason || 'This order is eligible for complimentary palace return & refund.'}
                  {eligibility.daysRemaining !== null ? ` (${eligibility.daysRemaining} days remaining)` : ''}
                </span>
              </div>
            </div>
            <button
              onClick={() => setWizardOpen(true)}
              className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-full shrink-0 transition-colors shadow-md cursor-pointer"
            >
              Start Return Wizard
            </button>
          </div>
        </ScrollReveal>
      )}

      {/* ─── Flacons in this Order ─── */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20">
            <h3 className="font-cinzel text-base font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>Flacons in this Order ({items.length})</span>
            </h3>
            <span className="text-xs font-mono text-[#D8BE99]">
              {items.reduce((sum, i) => sum + (i.quantity || 1), 0)} Total Flacon(s)
            </span>
          </div>

          <div className="divide-y divide-white/10">
            {items.map((item, idx) => {
              const itemPrice = Number(item.price || item.unitPrice || 0);
              const qty = Number(item.quantity || 1);
              const lineTotal = itemPrice * qty;

              return (
                <div key={idx} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl bg-black/60 border border-[#D4AF37]/30 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                      <img
                        src={item.image || item.imageUrl || '/products/luxury_designs/07_arabian_gold.webp'}
                        alt={item.name}
                        className="w-full h-full object-contain filter drop-shadow"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-cinzel font-bold uppercase tracking-widest text-[#D4AF37] block">
                        {item.brandName || 'Arabian Sheikh'}
                      </span>
                      <h4 className="font-cinzel text-sm sm:text-base font-bold text-[#F3E6D0]">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[#D8BE99]">
                        {item.size || '100 ml Extrait de Parfum'}
                      </p>
                      <p className="text-xs font-mono text-[#D8BE99]">
                        Qty: <strong className="text-[#F3E6D0]">{qty}</strong> × {formatPrice(itemPrice, currency)}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[10px] font-cinzel uppercase text-[#D8BE99] block">
                      Subtotal
                    </span>
                    <span className="font-mono text-lg font-bold text-[#F2D675]">
                      {formatPrice(lineTotal, currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      {/* ─── 3-Card Information Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Card 1: Delivery Destination */}
        <ScrollReveal direction="right" delay={0.15}>
          <div className="rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 p-6 shadow-2xl backdrop-blur-md space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-[#D4AF37]">
                <MapPin className="w-4 h-4" />
                <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider">
                  Delivery Destination
                </h4>
              </div>

              <div className="space-y-1.5 text-xs">
                <p className="font-cinzel font-bold text-sm text-[#F3E6D0]">
                  {recipientName}
                </p>

                {address1 && (
                  <p className="text-[#D8BE99] flex items-start gap-1.5 pt-1">
                    <Building className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span>{address1}</span>
                  </p>
                )}

                {address2 && (
                  <p className="text-[#D8BE99] pl-5">
                    {address2}
                  </p>
                )}

                {cityLine && (
                  <p className="text-[#D8BE99] pl-5">
                    {cityLine}
                  </p>
                )}

                {country && (
                  <p className="text-[#D8BE99] flex items-center gap-1.5 pl-5 font-medium">
                    <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{country}</span>
                  </p>
                )}

                {!address1 && !cityLine && !country && (
                  <p className="text-neutral-500 italic text-[11px] pt-1">
                    Palace delivery coordinates on file.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 text-xs text-[#D8BE99] flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="font-mono">{phone ? phone : 'Phone: Not specified'}</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Card 2: Shipping & Logistics */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 p-6 shadow-2xl backdrop-blur-md space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <Truck className="w-4 h-4" />
                  <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider">
                    Shipping Information
                  </h4>
                </div>
                <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full border ${shippingService.getShipmentStatusBadge(shipmentStatus)}`}>
                  {shippingService.getShipmentStatusLabel(shipmentStatus)}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-[#D8BE99]">
                  <span>Courier Carrier:</span>
                  <span className="font-mono font-bold text-[#F3E6D0] uppercase bg-black/50 px-2 py-0.5 rounded border border-white/10">
                    {carrierName}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[#D8BE99]">
                    <span>Tracking Number:</span>
                    {trackingNumber && (
                      <button
                        onClick={() => handleCopyTracking(trackingNumber)}
                        className="p-1 text-[#D4AF37] hover:text-white transition-colors cursor-pointer"
                        title="Copy Tracking Number"
                      >
                        {copiedTracking ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                  {trackingNumber ? (
                    <span className="font-mono font-bold text-xs text-[#D4AF37] block bg-black/60 p-2 rounded border border-[#D4AF37]/20">
                      {trackingNumber}
                    </span>
                  ) : (
                    <span className="font-mono text-neutral-500 italic text-[11px] block bg-black/40 p-2 rounded border border-white/5">
                      Tracking available once courier dispatches
                    </span>
                  )}
                </div>

                <div className="flex justify-between text-[#D8BE99] pt-1">
                  <span>Expected Delivery:</span>
                  <span className="font-mono font-bold text-[#F3E6D0]">
                    {order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : '2–4 business days'}
                  </span>
                </div>
              </div>
            </div>

            <Link
              to={`/order-tracking/${order.orderNumber || order.id}`}
              className="w-full py-2.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 hover:bg-[#D4AF37] text-[#F3E6D0] hover:text-black font-cinzel font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 rounded-xl cursor-pointer shadow-sm mt-2"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{trackingNumber ? 'Track Shipment' : 'View Delivery Status'}</span>
            </Link>
          </div>
        </ScrollReveal>

        {/* Card 3: Settlement Summary */}
        <ScrollReveal direction="left" delay={0.25}>
          <div className="rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 p-6 shadow-2xl backdrop-blur-md space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-[#D4AF37]">
                <Receipt className="w-4 h-4" />
                <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider">
                  Settlement Summary
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#D8BE99]">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold text-[#F3E6D0]">
                    {formatPrice(subtotal, currency)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Privilege ({order.discountCode || 'PROMO'}):</span>
                    <span className="font-mono font-bold">
                      -{formatPrice(discountAmount, currency)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-[#D8BE99]">
                  <span>Insured Shipping:</span>
                  <span className="font-mono font-bold text-[#D4AF37]">
                    {shippingCost === 0 ? 'Complimentary' : formatPrice(shippingCost, currency)}
                  </span>
                </div>

                <div className="pt-2.5 border-t border-[#D4AF37]/30 flex justify-between items-baseline">
                  <span className="font-cinzel text-sm font-bold text-[#F3E6D0] uppercase tracking-wider">
                    Total Settled:
                  </span>
                  <span className="font-mono text-xl font-bold text-[#F2D675] drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                    {formatPrice(grandTotal, currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Details */}
            <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#D8BE99]">
                  <PaymentIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="font-cinzel font-bold">{paymentInfo.label}</span>
                </div>
                <span className="text-[10px] font-mono uppercase text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20">
                  {paymentInfo.badge}
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#D8BE99] flex items-center gap-1.5">
                <span>Status:</span>
                <strong className={paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}>
                  {paymentStatus === 'Paid' ? 'Paid & Settled' : paymentStatus}
                </strong>
              </p>
            </div>
          </div>
        </ScrollReveal>

      </div>

      {/* ─── Return Requests & Inquiries History ─── */}
      {orderReturns && orderReturns.length > 0 && (
        <ScrollReveal direction="up" delay={0.3}>
          <div className="rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-5">
            <h3 className="font-cinzel text-base font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              <span>Return Requests & Inquiries ({orderReturns.length})</span>
            </h3>

            <div className="divide-y divide-white/10 border border-[#D4AF37]/20 rounded-xl overflow-hidden bg-black/40">
              {orderReturns.map(ret => {
                const retStatus = returnsService.RETURN_STATUSES[ret.status] || {
                  label: ret.status,
                  badgeClass: 'bg-neutral-800 text-neutral-300 border-neutral-700'
                };

                return (
                  <div key={ret.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#F3E6D0]">
                          Return #{ret.id}
                        </span>
                        <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full uppercase border ${retStatus.badgeClass}`}>
                          {retStatus.label}
                        </span>
                      </div>
                      <p className="text-[#D8BE99]">
                        Submitted on {new Date(ret.createdAt).toLocaleDateString()} &bull; {ret.items?.length || 0} item(s)
                      </p>
                      {ret.totalRefundAmount > 0 && (
                        <p className="font-mono text-emerald-400 font-bold">
                          Approved Refund: {formatPrice(ret.totalRefundAmount, currency)}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedReturnId(ret.id)}
                      className="px-5 py-2 bg-[#D4AF37]/20 border border-[#D4AF37]/50 hover:bg-[#D4AF37] text-white hover:text-black font-cinzel font-bold text-xs uppercase tracking-wider transition-colors rounded-full cursor-pointer self-start sm:self-auto shadow-sm"
                    >
                      View Details & Evidence
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* ─── Royal Cancellation Confirmation Modal ─── */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0B0A08] border border-[#D4AF37]/40 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 text-[#F3E6D0]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-cinzel text-base font-bold uppercase tracking-wider">Cancel Acquisition</h3>
              </div>
              <button
                onClick={() => setCancelModalOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#D8BE99] leading-relaxed">
              Are you certain you wish to cancel Order <strong className="text-[#F3E6D0] font-mono">{formattedOrderCode}</strong>? Once confirmed, warehouse dispatch and logistics packaging will be immediately halted.
            </p>

            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div>
                <label className="block text-[11px] font-cinzel text-[#D8BE99] uppercase tracking-wider mb-1.5 font-bold">
                  Cancellation Reason (Optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="E.g. Changed fragrance preference, duplicate flacon ordered..."
                  rows={3}
                  className="w-full bg-black/80 border border-white/15 rounded-xl p-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none placeholder:text-neutral-600 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="px-5 py-2.5 bg-white/5 border border-white/15 text-xs font-cinzel text-[#F3E6D0] hover:bg-white/10 transition-colors cursor-pointer rounded-full"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-cinzel font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-full shadow-lg flex items-center gap-1.5 disabled:opacity-50"
                >
                  {cancelling ? <span>Processing...</span> : <span>Confirm Cancellation</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Customer Return Wizard Modal ─── */}
      <ReturnWizardModal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        orderId={order.id}
        orderNumber={order.orderNumber}
        eligibility={eligibility}
        onSuccess={() => {
          refreshOrderData();
        }}
      />

      {/* ─── Customer Return Details Modal ─── */}
      <ReturnDetailsModal
        isOpen={Boolean(selectedReturnId)}
        onClose={() => setSelectedReturnId(null)}
        returnId={selectedReturnId}
        onUpdated={() => {
          refreshOrderData();
        }}
      />
    </div>
  );
}
