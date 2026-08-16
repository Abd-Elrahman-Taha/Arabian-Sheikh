import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { orderService } from '../../services/orderService';
import { CheckCircle2, Truck, ShoppingBag, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function OrderConfirmation() {
  const { queryParams, navigate } = useRouter();
  const { t } = useTranslation();
  const orderId = queryParams.get('orderId') || 'ORD-98421';

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

  return (
    <div className="pt-28 pb-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in text-[#F3EEE5]">
      <div className="bg-[#1C120E] border-2 border-[#C6A15B]/40 p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-none border-2 border-[#C6A15B] bg-[#0F0D0C] flex items-center justify-center mx-auto text-[#C6A15B] shadow-2xl">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[#C6A15B] font-semibold">
            Order Reference Authorized
          </span>
          <h1 className="font-cinzel text-3xl sm:text-4xl font-bold uppercase">
            {t('confirmation.title')}
          </h1>
          <p className="font-editorial italic text-lg text-[#DFBF7A]">
            "{t('confirmation.subtitle')}"
          </p>
        </div>

        {/* Order Details Banner */}
        <div className="p-6 bg-[#0F0D0C] border border-[#C6A15B]/20 text-xs font-sans space-y-2 text-left">
          <div className="flex justify-between items-center border-b border-[#C6A15B]/15 pb-2">
            <span className="text-[#C5B8A8]">{t('confirmation.orderNumber')}:</span>
            <span className="font-cinzel font-bold text-sm text-[#C6A15B]">{orderId}</span>
          </div>
          <div className="flex justify-between items-center border-b border-[#C6A15B]/15 pb-2">
            <span className="text-[#C5B8A8]">{t('confirmation.estimatedDelivery')}:</span>
            <span className="text-[#F3EEE5] font-medium">{t('confirmation.deliveryDays')}</span>
          </div>
          <p className="text-[11px] text-[#C5B8A8] pt-1">
            {t('confirmation.emailSent', { email: order?.customerEmail || 'your email' })}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
          <Link
            to={`/order-tracking/${orderId}`}
            className="luxury-btn-gold px-8 py-3.5 text-xs flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>{t('confirmation.trackOrder')}</span>
          </Link>
          <Link
            to="/shop"
            className="luxury-btn-outline px-8 py-3.5 text-xs text-center"
          >
            {t('confirmation.continueShopping')}
          </Link>
        </div>
      </div>
    </div>
  );
}
