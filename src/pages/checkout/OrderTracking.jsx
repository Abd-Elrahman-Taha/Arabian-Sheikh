import React, { useState, useEffect } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { orderService } from '../../services/orderService';
import { shippingService } from '../../services/shippingService';
import {
  Truck,
  CheckCircle2,
  Package,
  Clock,
  Sparkles,
  MapPin,
  ArrowLeft,
  ShieldCheck,
  XCircle,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import ScrollReveal from '../../components/common/ScrollReveal';

export default function OrderTracking() {
  const { currentPath, navigate } = useRouter();
  const { t } = useTranslation();

  const orderId = currentPath.split('/order-tracking/')[1]?.split('?')[0] || 'ORD-98421';

  const [order, setOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedTracking, setCopiedTracking] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const item = await orderService.getOrderById(orderId);
        setOrder(item);
        const trk = await orderService.getCustomerTracking(orderId);
        setTrackingData(trk);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();

    // Listen for real-time status updates from Admin
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

  // 6 Stages
  const STAGES = [
    { key: 'PENDING', title: t('tracking.placed'), desc: t('tracking.placedDesc'), icon: Clock },
    { key: 'CONFIRMED', title: t('tracking.confirmed'), desc: t('tracking.confirmedDesc'), icon: CheckCircle2 },
    { key: 'PROCESSING', title: t('tracking.processing'), desc: t('tracking.processingDesc'), icon: Package },
    { key: 'SHIPPED', title: t('tracking.shipped'), desc: t('tracking.shippedDesc'), icon: Truck },
    { key: 'OUT_FOR_DELIVERY', title: t('tracking.outForDelivery'), desc: t('tracking.outForDeliveryDesc'), icon: MapPin },
    { key: 'DELIVERED', title: t('tracking.delivered'), desc: t('tracking.deliveredDesc'), icon: Sparkles }
  ];

  const currentStatus = order?.orderStatus || order?.status || 'Pending';
  const normStatus = String(currentStatus).toUpperCase().replace(/[\s_-]+/g, '');
  const isCancelled = normStatus.includes('CANCEL');

  // Flexible stage index mapping
  let activeIndex = 0;
  if (normStatus.includes('DELIVER')) {
    activeIndex = 5;
  } else if (normStatus.includes('OUTFOR') || normStatus.includes('TRANSIT')) {
    activeIndex = 4;
  } else if (normStatus.includes('SHIP')) {
    activeIndex = 3;
  } else if (normStatus.includes('PROCESS')) {
    activeIndex = 2;
  } else if (normStatus.includes('CONFIRM')) {
    activeIndex = 1;
  } else {
    activeIndex = 0;
  }

  const cancelNote = order?.timeline?.find(t => String(t.status).toLowerCase().includes('cancel'))?.title ||
    order?.statusHistory?.find(h => String(h.toStatus || h.status).toLowerCase().includes('cancel'))?.note || '';

  return (
    <div className="pt-36 sm:pt-40 pb-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in text-[#F3E6D0]">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4AF37]/25 pb-6 gap-4">
          <div>
            <button
              onClick={() => navigate('/account/orders')}
              className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/30 bg-black/40 text-xs font-cinzel font-bold text-[#F2D675] hover:text-white hover:border-[#D4AF37] transition-all mb-3 cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Orders</span>
            </button>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase text-[#F3E6D0] tracking-wide">
              {t('tracking.title')}
            </h1>
            <p className="text-xs text-[#D8BE99] font-mono font-semibold mt-1">
              {t('tracking.orderId', { id: orderId })}
            </p>
          </div>

          <div className={`px-5 py-3 rounded-xl border text-xs shadow-xl backdrop-blur-md ${
            isCancelled
              ? 'bg-rose-950/40 border-rose-500/50'
              : 'bg-black/70 border-[#D4AF37]/35'
          }`}>
            <span className="text-[#D8BE99] uppercase tracking-wider block text-[10px] font-semibold">Current Dispatch Status</span>
            <span className={`font-cinzel font-bold text-sm uppercase flex items-center gap-1.5 mt-0.5 ${
              isCancelled ? 'text-rose-300' : 'text-[#F2D675]'
            }`}>
              {isCancelled ? (
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              )}
              {currentStatus.replace(/([A-Z])/g, ' $1').trim().replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </ScrollReveal>

      {/* Cancellation Alert Banner */}
      {isCancelled && (
        <ScrollReveal direction="up">
          <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/50 flex items-start gap-4 text-rose-200 shadow-xl backdrop-blur-md">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="font-cinzel text-base sm:text-lg font-bold uppercase text-rose-200 tracking-wider">
                Order Cancelled by Administration
              </h2>
              <p className="text-xs sm:text-sm text-rose-300/90 font-sans leading-relaxed">
                {cancelNote || 'This order has been cancelled by administration. Transit and fulfillment operations have been terminated. For queries or refunds, please reach out to our Royal Concierge.'}
              </p>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Courier Strip (Carrier + Tracking + Status) */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="p-4 sm:p-5 rounded-xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#D8BE99] shadow-xl backdrop-blur-md font-medium gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center text-[#F2D675] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-[#D8BE99]/80 block font-mono font-semibold">
                  Carrier: {trackingData?.carrier || order?.carrier || (order?.trackingCode?.startsWith('ECONT') ? 'ECONT' : 'DHL Express')}
                </span>
                <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded border ${
                  shippingService.getShipmentStatusBadge(trackingData?.currentStatus || order?.shipmentStatus || currentStatus)
                }`}>
                  {shippingService.getShipmentStatusLabel(trackingData?.currentStatus || order?.shipmentStatus || currentStatus)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[#F3E6D0] font-mono font-bold text-sm">
                  {trackingData?.trackingNumber || order?.trackingCode || 'AS-ECONT-9842104-BG'}
                </span>
                <button
                  onClick={() => {
                    const code = trackingData?.trackingNumber || order?.trackingCode || 'AS-ECONT-9842104-BG';
                    navigator.clipboard.writeText(code);
                    setCopiedTracking(true);
                    setTimeout(() => setCopiedTracking(false), 2000);
                  }}
                  className="p-1 text-[#D4AF37] hover:text-white transition-colors cursor-pointer"
                  title="Copy Tracking Number"
                >
                  {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {trackingData?.expectedDeliveryDate && (
              <div className="text-right sm:border-r border-white/10 sm:pr-4">
                <span className="text-[10px] uppercase text-neutral-400 block font-mono">Expected Arrival</span>
                <span className="font-mono text-xs text-[#F2D675] font-bold">
                  {new Date(trackingData.expectedDeliveryDate).toLocaleDateString()}
                </span>
              </div>
            )}
            <span className="text-[#F2D675] font-cinzel font-bold text-xs uppercase tracking-wider hidden sm:inline border border-[#D4AF37]/30 px-3.5 py-1.5 rounded-full bg-black/40">
              Insured Carrier Dispatch
            </span>
          </div>
        </div>
      </ScrollReveal>

      {/* 6-Step Conceptual Timeline */}
      <ScrollReveal direction="up" delay={0.2}>
        <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 p-6 sm:p-10 rounded-2xl shadow-2xl space-y-8 backdrop-blur-md">
          <div className="relative pl-8 sm:pl-10 space-y-8 before:absolute before:left-3.5 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#D4AF37] before:via-[#8C6239] before:to-white/10">
            {STAGES.map((stage, idx) => {
              const isCompleted = !isCancelled && idx <= activeIndex;
              const isCurrent = !isCancelled && idx === activeIndex;
              const Icon = stage.icon;

              return (
                <div key={stage.key} className="relative flex items-start gap-4 sm:gap-6">
                  {/* Node indicator */}
                  <div
                    className={`absolute -left-8 sm:-left-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'border-[#FFF] bg-gradient-to-br from-[#F2D675] via-[#D4AF37] to-[#8C6239] text-black ring-4 ring-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.6)] scale-110'
                        : isCompleted
                        ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#F2D675]'
                        : 'border-white/15 bg-black/60 text-white/30'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h3
                        className={`font-cinzel text-sm sm:text-base font-bold uppercase tracking-wider ${
                          isCurrent ? 'text-[#F2D675]' : isCompleted ? 'text-[#F3E6D0]' : 'text-neutral-500'
                        }`}
                      >
                        {stage.title}
                      </h3>
                      {isCurrent && (
                        <span className="px-2.5 py-0.5 text-[9px] uppercase font-mono rounded-full bg-[#D4AF37]/25 border border-[#D4AF37] text-[#F2D675] font-bold animate-pulse shadow-sm">
                          Active Stage
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#D8BE99] font-sans max-w-lg leading-relaxed font-medium">
                      {stage.desc}
                    </p>
                  </div>
                </div>
              );
            })}

            {isCancelled && (
              <div className="relative flex items-start gap-4 sm:gap-6">
                <div className="absolute -left-8 sm:-left-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-rose-500 bg-rose-500/20 text-rose-400 flex items-center justify-center ring-4 ring-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                  <XCircle className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-cinzel text-sm sm:text-base font-bold uppercase tracking-wider text-rose-300">
                      Order Terminated & Cancelled
                    </h3>
                    <span className="px-2.5 py-0.5 text-[9px] uppercase font-mono rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold">
                      Cancelled
                    </span>
                  </div>
                  <p className="text-xs text-rose-300/80 font-sans max-w-lg leading-relaxed">
                    {cancelNote || 'Order fulfillment and dispatch were cancelled by administration.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* Section 7: Live Carrier Tracking Events Log */}
      <ScrollReveal direction="up" delay={0.25}>
        <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="font-cinzel text-base sm:text-lg font-bold uppercase text-[#F3E6D0] tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#D4AF37]" />
                <span>Carrier Checkpoints ({trackingData?.carrier || 'ECONT'})</span>
              </h2>
              <p className="text-xs text-[#D8BE99] mt-0.5">
                Real-time carrier scans synchronized directly from {trackingData?.carrier || 'ECONT'}
              </p>
            </div>
            {trackingData?.carrierStatus && (
              <span className="px-2.5 py-1 text-[10px] font-mono text-[#D8BE99] bg-white/5 border border-white/10 rounded">
                Carrier Status: {trackingData.carrierStatus}
              </span>
            )}
          </div>

          {(!trackingData?.events || trackingData.events.length === 0) ? (
            <div className="p-8 text-center space-y-2 bg-black/40 border border-white/5 rounded-xl">
              <Package className="w-8 h-8 text-[#D4AF37]/40 mx-auto" />
              <h4 className="font-cinzel text-sm font-bold text-[#F3E6D0]">Tracking In Preparation</h4>
              <p className="text-xs text-[#D8BE99] max-w-md mx-auto leading-relaxed">
                Your order is currently being prepared for carrier pickup. Full milestone timestamps and locations will appear here as the courier scans your package.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {trackingData.events.map((event, idx) => {
                const isLatest = idx === trackingData.events.length - 1;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      isLatest
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]/40'
                        : 'bg-black/40 border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isLatest
                          ? 'border-[#D4AF37] bg-[#D4AF37] text-black font-bold'
                          : 'border-white/20 bg-white/5 text-[#F2D675]'
                      }`}>
                        {isLatest ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-cinzel font-bold text-xs uppercase text-[#F3E6D0]">
                            {shippingService.getShipmentStatusLabel(event.status)}
                          </span>
                          {isLatest && (
                            <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-[#D4AF37]/30 text-[#F2D675] border border-[#D4AF37]/50">
                              Active
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-xs text-[#D8BE99] font-sans mt-0.5">
                            {event.description}
                          </p>
                        )}
                        {event.location && (
                          <p className="text-[11px] text-neutral-400 flex items-center gap-1 mt-1 font-mono">
                            <MapPin className="w-3 h-3 text-[#D4AF37]" />
                            <span>{event.location}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <span className="font-mono text-[11px] text-[#D8BE99] block">
                        {new Date(event.occurredAt).toLocaleDateString()}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-500">
                        {new Date(event.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Destination Summary */}
      {order && (
        <ScrollReveal direction="up" delay={0.3}>
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-sans text-[#D8BE99] shadow-2xl backdrop-blur-md font-medium">
            <div className="space-y-1">
              <h4 className="font-cinzel text-xs font-bold uppercase text-[#F2D675] mb-2 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Destination Residence</span>
              </h4>
              <p className="font-bold text-[#F3E6D0] text-sm">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.address}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.country}</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-cinzel text-xs font-bold uppercase text-[#F2D675] mb-2 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Dispatch Security</span>
              </h4>
              <p>Carrier: Arabian Sovereign Logistics</p>
              <p>Service: Ultra-Insured Flight Courier</p>
              <p>Signature: Mandatory upon Handover</p>
            </div>
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}
