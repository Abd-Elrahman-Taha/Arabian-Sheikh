import React, { useState, useEffect } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { orderService } from '../../services/orderService';
import {
  Truck,
  CheckCircle2,
  Package,
  Clock,
  Sparkles,
  MapPin,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import ScrollReveal from '../../components/common/ScrollReveal';

export default function OrderTracking() {
  const { currentPath, navigate } = useRouter();
  const { t } = useTranslation();

  const orderId = currentPath.split('/order-tracking/')[1]?.split('?')[0] || 'ORD-98421';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const item = await orderService.getOrderById(orderId);
        setOrder(item);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
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

  const currentStatus = order?.status || 'SHIPPED';
  const currentStageIndex = STAGES.findIndex(s => s.key === currentStatus);
  const activeIndex = currentStageIndex === -1 ? 3 : currentStageIndex;

  return (
    <div className="pt-36 sm:pt-40 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in text-[#F3E6D0]">
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

          <div className="px-5 py-3 rounded-xl bg-black/70 border border-[#D4AF37]/35 text-xs shadow-xl backdrop-blur-md">
            <span className="text-[#D8BE99] uppercase tracking-wider block text-[10px] font-semibold">Current Dispatch Status</span>
            <span className="font-cinzel font-bold text-sm text-[#F2D675] uppercase flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              {currentStatus.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </ScrollReveal>

      {/* Courier Strip */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="p-4 sm:p-5 rounded-xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 flex items-center justify-between text-xs text-[#D8BE99] shadow-xl backdrop-blur-md font-medium">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center text-[#F2D675]">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#D8BE99]/80 block">Royal Air Courier</span>
              <span className="text-[#F3E6D0] font-mono font-bold text-xs">{order?.trackingCode || 'AS-DHL-9842104-AE'}</span>
            </div>
          </div>
          <span className="text-[#F2D675] font-cinzel font-bold text-xs uppercase tracking-wider hidden sm:inline border border-[#D4AF37]/30 px-3 py-1 rounded-full bg-black/40">
            Insured Royal Air Dispatch
          </span>
        </div>
      </ScrollReveal>

      {/* 6-Step Timeline */}
      <ScrollReveal direction="up" delay={0.2}>
        <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 p-6 sm:p-10 rounded-2xl shadow-2xl space-y-8 backdrop-blur-md">
          <div className="relative pl-8 sm:pl-10 space-y-8 before:absolute before:left-3.5 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#D4AF37] before:via-[#8C6239] before:to-white/10">
            {STAGES.map((stage, idx) => {
              const isCompleted = idx <= activeIndex;
              const isCurrent = idx === activeIndex;
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
          </div>
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
