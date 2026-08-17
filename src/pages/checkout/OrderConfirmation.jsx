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
    <div className="pt-36 sm:pt-40 pb-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in text-[var(--text-primary)]">
      <ScrollReveal direction="up">
        <div className="bg-[var(--bg-card)] border-2 border-[var(--gold-primary)]/40 p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          {/* Success Icon */}
        <div className="w-16 h-16 rounded-none border-2 border-[var(--gold-primary)] bg-[var(--bg-primary)] flex items-center justify-center mx-auto text-[var(--gold-primary)] shadow-2xl">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[var(--gold-primary)] font-semibold">
            Order Reference Authorized
          </span>
          <h1 className="font-cinzel text-3xl sm:text-4xl font-bold uppercase text-[var(--text-primary)]">
            {t('confirmation.title')}
          </h1>
          <p className="font-editorial italic text-lg text-[var(--gold-light)]">
            "{t('confirmation.subtitle')}"
          </p>
        </div>

        {/* Order Details Banner */}
        <div className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs font-sans space-y-2 text-left">
          <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-2">
            <span className="text-[var(--text-muted)]">{t('confirmation.orderNumber')}:</span>
            <span className="font-cinzel font-bold text-sm text-[var(--gold-primary)]">{orderId}</span>
          </div>
          <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-2">
            <span className="text-[var(--text-muted)]">{t('confirmation.estimatedDelivery')}:</span>
            <span className="text-[var(--text-primary)] font-medium">{t('confirmation.deliveryDays')}</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] pt-1">
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
