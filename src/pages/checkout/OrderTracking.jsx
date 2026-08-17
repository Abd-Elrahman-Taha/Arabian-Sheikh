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
  ArrowLeft
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
    <div className="pt-28 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in text-[var(--text-primary)]">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border-subtle)] pb-4 gap-4">
          <div>
            <button
              onClick={() => navigate('/account/orders')}
              className="text-xs text-[var(--gold-primary)] hover:underline flex items-center gap-1 mb-2 font-cinzel cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Orders</span>
            </button>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase text-[var(--text-primary)]">
              {t('tracking.title')}
            </h1>
            <p className="text-xs text-[var(--text-muted)] font-mono">
              {t('tracking.orderId', { id: orderId })}
            </p>
          </div>

          <div className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-card)] text-xs shadow-sm">
            <span className="text-[var(--text-muted)] uppercase tracking-wider block text-[10px]">Current Status</span>
            <span className="font-cinzel font-bold text-sm text-[var(--gold-primary)] uppercase">
              {currentStatus.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </ScrollReveal>

      {/* Courier Strip */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-card)] flex items-center justify-between text-xs text-[var(--text-muted)] shadow-sm">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[var(--gold-primary)]" />
            <span>{t('tracking.courierDetails', { code: order?.trackingCode || '9842104-AE' })}</span>
          </div>
          <span className="text-[var(--gold-light)] font-semibold hidden sm:inline">Insured Royal Air Dispatch</span>
        </div>
      </ScrollReveal>

      {/* 6-Step Timeline */}
      <ScrollReveal direction="up" delay={0.2}>
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-card)]">
            {STAGES.map((stage, idx) => {
              const isCompleted = idx <= activeIndex;
              const isCurrent = idx === activeIndex;
              const Icon = stage.icon;

              return (
                <div key={stage.key} className="relative flex items-start gap-4 sm:gap-6">
                  {/* Node indicator */}
                  <div
                    className={`absolute -left-6 sm:-left-8 w-6 h-6 sm:w-8 sm:h-8 rounded-none border-2 flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'border-[var(--gold-primary)] bg-[var(--gold-primary)] text-[#130C05] ring-4 ring-[var(--gold-primary)]/20 shadow-lg'
                        : isCompleted
                        ? 'border-[var(--gold-primary)] bg-[var(--bg-secondary)] text-[var(--gold-primary)]'
                        : 'border-[var(--border-card)] bg-[var(--bg-primary)] text-[var(--text-muted)]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`font-cinzel text-sm sm:text-base font-bold uppercase ${
                          isCurrent ? 'text-[var(--gold-primary)]' : isCompleted ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                        }`}
                      >
                        {stage.title}
                      </h3>
                      {isCurrent && (
                        <span className="px-2 py-0.5 text-[9px] uppercase font-mono bg-[var(--gold-primary)]/20 border border-[var(--gold-primary)] text-[var(--gold-primary)] animate-pulse">
                          Active Stage
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] font-sans max-w-lg leading-relaxed">
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
          <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-card)] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans text-[var(--text-muted)] shadow-sm">
            <div>
              <h4 className="font-cinzel text-xs font-bold uppercase text-[var(--gold-primary)] mb-1">
                Destination Residence
              </h4>
              <p className="font-semibold text-[var(--text-primary)]">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.address}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.country}</p>
            </div>
            <div>
              <h4 className="font-cinzel text-xs font-bold uppercase text-[var(--gold-primary)] mb-1">
                Dispatch Details
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
