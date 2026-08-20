import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { orderService } from '../../services/orderService';
import { CheckCircle2, Truck } from 'lucide-react';
import ScrollReveal from '../../components/common/ScrollReveal';

export default function OrderConfirmation() {
  const { queryParams } = useRouter();
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
    <div className="pt-36 sm:pt-40 pb-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in text-[var(--color-earth-dark)]">
      <ScrollReveal direction="up">
        <div className="bg-[var(--color-desert-light)] border-2 border-[var(--color-terracotta)]/40 p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          {/* Success Icon */}
        <div className="w-16 h-16 rounded-none border-2 border-[var(--color-terracotta)] bg-[var(--color-desert-primary)]/30 flex items-center justify-center mx-auto text-[var(--color-terracotta)] shadow-xl">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[var(--color-terracotta)] font-bold">
            Order Reference Authorized
          </span>
          <h1 className="font-cinzel text-3xl sm:text-4xl font-bold uppercase text-[var(--color-earth-dark)]">
            {t('confirmation.title')}
          </h1>
          <p className="font-editorial italic text-lg text-[var(--color-terracotta-deep)] font-medium">
            "{t('confirmation.subtitle')}"
          </p>
        </div>

        {/* Order Details Banner */}
        <div className="p-6 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 text-xs font-sans space-y-2 text-left">
          <div className="flex justify-between items-center border-b border-[var(--color-terracotta-deep)]/20 pb-2">
            <span className="text-[var(--color-terracotta-deep)] font-semibold">{t('confirmation.orderNumber')}:</span>
            <span className="font-cinzel font-bold text-sm text-[var(--color-terracotta)]">{orderId}</span>
          </div>
          <div className="flex justify-between items-center border-b border-[var(--color-terracotta-deep)]/20 pb-2">
            <span className="text-[var(--color-terracotta-deep)] font-semibold">{t('confirmation.estimatedDelivery')}:</span>
            <span className="text-[var(--color-earth-dark)] font-bold">{t('confirmation.deliveryDays')}</span>
          </div>
          <p className="text-[11px] text-[var(--color-terracotta-deep)] pt-1 font-medium">
            {t('confirmation.emailSent', { email: order?.customerEmail || 'your email' })}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
          <Link
            to={`/order-tracking/${orderId}`}
            className="luxury-btn-gold px-8 py-3.5 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Truck className="w-4 h-4" />
            <span>{t('confirmation.trackOrder')}</span>
          </Link>
          <Link
            to="/shop"
            className="luxury-btn-outline px-8 py-3.5 text-xs text-center cursor-pointer"
          >
            {t('confirmation.continueShopping')}
          </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
