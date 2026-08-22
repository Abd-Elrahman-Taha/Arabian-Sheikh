import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { orderService } from '../../services/orderService';
import { CheckCircle2, Truck, ArrowRight, Sparkles } from 'lucide-react';
import ScrollReveal from '../../components/common/ScrollReveal';

export default function OrderConfirmation() {
  const { queryParams } = useRouter();
  const { t } = useTranslation();
  const orderId = queryParams.get('orderId') || 'ORD-98421';

  const [order, setOrder] = useState(() => orderService.getOrderByIdSync(orderId));
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    const item = orderService.getOrderByIdSync(orderId);
    if (item) {
      setOrder(item);
      setLoading(false);
    }
  }, [orderId]);

  return (
    <div className="pt-36 sm:pt-40 pb-6 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in text-[#F3E6D0]">
      <ScrollReveal direction="up">
        <div className="rounded-3xl bg-[#0B0A08]/90 border border-[#D4AF37]/35 p-8 sm:p-12 text-center space-y-7 shadow-2xl backdrop-blur-md relative overflow-hidden">
          {/* Success Medallion */}
          <div className="w-20 h-20 rounded-full border-2 border-[#D4AF37] bg-gradient-to-br from-[#D4AF37]/25 via-black to-[#8C6239]/20 flex items-center justify-center mx-auto text-[#F2D675] shadow-[0_0_30px_rgba(212,175,55,0.4)]">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[#F2D675] font-bold flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Royal Authorization Confirmed</span>
            </span>
            <h1 className="font-cinzel text-3xl sm:text-4xl font-bold uppercase text-[#F3E6D0] tracking-wide">
              {t('confirmation.title')}
            </h1>
            <p className="font-editorial italic text-lg sm:text-xl text-[#D8BE99]">
              "{t('confirmation.subtitle')}"
            </p>
          </div>

          {/* Order Details Banner */}
          <div className="p-6 rounded-2xl bg-black/60 border border-[#D4AF37]/30 text-xs font-sans space-y-3 text-left shadow-inner">
            <div className="flex justify-between items-center border-b border-[#D4AF37]/20 pb-3">
              <span className="text-[#D8BE99] font-medium">{t('confirmation.orderNumber')}:</span>
              <span className="font-cinzel font-bold text-sm text-[#F2D675]">{orderId}</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#D4AF37]/20 pb-3">
              <span className="text-[#D8BE99] font-medium">{t('confirmation.estimatedDelivery')}:</span>
              <span className="text-[#F3E6D0] font-bold font-mono">2-4 Business Days (Insured Royal Air Courier)</span>
            </div>
            <p className="text-[11px] text-[#D8BE99] pt-1 font-medium">
              {t('confirmation.emailSent', { email: order?.customerEmail || 'your email' })}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
            <Link
              to={`/order-tracking/${orderId}`}
              className="group/btn relative px-8 py-3.5 rounded-full bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-white hover:text-black border border-[#F2D675]/50 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>{t('confirmation.trackOrder')}</span>
            </Link>
            <Link
              to="/shop"
              className="px-8 py-3.5 rounded-full border border-[#D4AF37]/40 bg-black/50 hover:bg-[#21130D] text-[#F3E6D0] hover:text-[#F2D675] font-cinzel font-bold text-xs uppercase tracking-wider text-center cursor-pointer transition-all shadow-md"
            >
              {t('confirmation.continueShopping')}
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
