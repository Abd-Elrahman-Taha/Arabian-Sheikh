import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { orderService } from '../../services/orderService';
import {
  Truck,
  CheckCircle2,
  Package,
  Clock,
  Sparkles,
  ShieldCheck,
  MapPin,
  ArrowLeft
} from 'lucide-react';

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
    <div className="pt-28 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in text-[#F3EEE5]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#C6A15B]/20 pb-4 gap-4">
        <div>
          <button
            onClick={() => navigate('/account/orders')}
            className="text-xs text-[#C6A15B] hover:underline flex items-center gap-1 mb-2 font-cinzel"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </button>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase">
            {t('tracking.title')}
          </h1>
          <p className="text-xs text-[#C5B8A8] font-mono">
            {t('tracking.orderId', { id: orderId })}
          </p>
        </div>

        <div className="px-4 py-2 bg-[#241712] border border-[#C6A15B]/30 text-xs">
          <span className="text-[#C5B8A8] uppercase tracking-wider block text-[10px]">Current Status</span>
          <span className="font-cinzel font-bold text-sm text-[#C6A15B] uppercase">
            {currentStatus.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Courier Strip */}
      <div className="p-4 bg-[#1C120E] border border-[#C6A15B]/25 flex items-center justify-between text-xs text-[#C5B8A8]">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#C6A15B]" />
          <span>{t('tracking.courierDetails', { code: order?.trackingCode || '9842104-AE' })}</span>
        </div>
        <span className="text-[#DFBF7A] font-semibold hidden sm:inline">Insured Royal Air Dispatch</span>
      </div>

      {/* 6-Step Timeline */}
      <div className="bg-[#1C120E] border border-[#C6A15B]/30 p-6 sm:p-10 shadow-2xl space-y-8">
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#2B1A12]">
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
                      ? 'border-[#C6A15B] bg-[#C6A15B] text-[#0F0D0C] ring-4 ring-[#C6A15B]/20 shadow-lg'
                      : isCompleted
                      ? 'border-[#C6A15B] bg-[#2B1A12] text-[#C6A15B]'
                      : 'border-neutral-700 bg-[#0F0D0C] text-neutral-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`font-cinzel text-sm sm:text-base font-bold uppercase ${
                        isCurrent ? 'text-[#C6A15B]' : isCompleted ? 'text-[#F3EEE5]' : 'text-neutral-500'
                      }`}
                    >
                      {stage.title}
                    </h3>
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-[9px] uppercase font-mono bg-[#C6A15B]/20 border border-[#C6A15B] text-[#DFBF7A] animate-pulse">
                        Active Stage
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#C5B8A8] font-sans max-w-lg leading-relaxed">
                    {stage.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Destination Summary */}
      {order && (
        <div className="p-6 bg-[#1C120E] border border-[#C6A15B]/20 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans text-[#C5B8A8]">
          <div>
            <h4 className="font-cinzel text-xs font-bold uppercase text-[#C6A15B] mb-1">
              Destination Residence
            </h4>
            <p className="font-semibold text-[#F3EEE5]">{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.address}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.country}</p>
          </div>
          <div>
            <h4 className="font-cinzel text-xs font-bold uppercase text-[#C6A15B] mb-1">
              Package Contents
            </h4>
            <p className="text-[#F3EEE5]">
              {order.items?.map(i => `${i.name} (${i.size}) × ${i.quantity}`).join(', ')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
