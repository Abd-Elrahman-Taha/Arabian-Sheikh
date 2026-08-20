import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { orderService } from '../../services/orderService';
import { Truck, ArrowLeft, Printer } from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../../components/common/ScrollReveal';

export default function OrderDetail() {
  const { currentPath, navigate } = useRouter();
  const { t } = useTranslation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = currentPath.split('/account/orders/')[1]?.split('?')[0];

  useEffect(() => {
    async function load() {
      if (!orderId) return;
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

  if (loading) {
    return <div className="p-12 text-center text-xs text-[var(--text-muted)]">Retrieving royal invoice...</div>;
  }

  if (!order) {
    return (
      <div className="p-8 text-center space-y-4">
        <h3 className="font-cinzel text-lg text-[var(--text-primary)]">Order Reference Not Found</h3>
        <Link to="/account/orders" className="luxury-btn-gold px-5 py-2 text-xs inline-block cursor-pointer">
          Return to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-[var(--color-earth-dark)]">
      {/* Header */}
      <ScrollReveal direction="up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--color-terracotta-deep)]/20 pb-4 gap-4">
        <div>
          <button
            onClick={() => navigate('/account/orders')}
            className="text-xs text-[var(--color-terracotta)] hover:underline flex items-center gap-1 mb-2 font-cinzel font-bold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Orders</span>
          </button>
          <h2 className="font-cinzel text-2xl font-bold uppercase text-[var(--color-earth-dark)]">
            Order Reference: {order.id}
          </h2>
          <p className="text-xs text-[var(--color-terracotta-deep)] font-mono font-medium">
            Placed on {new Date(order.date).toLocaleString()} • Status: <strong className="text-[var(--color-terracotta)]">{order.status}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/order-tracking/${order.id}`}
            className="luxury-btn-gold px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Truck className="w-4 h-4" />
            <span>{t('confirmation.trackOrder')}</span>
          </Link>
          <button
            onClick={() => window.print()}
            className="p-2 border border-[var(--color-terracotta-deep)]/25 hover:border-[var(--color-terracotta)] text-[var(--color-terracotta-deep)] hover:text-[var(--color-earth-dark)] cursor-pointer"
            title="Print Parchment Invoice"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>
      </ScrollReveal>

      {/* Items Breakdown */}
      <ScrollReveal direction="up" delay={0.1}>
      <div className="space-y-4">
        <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[var(--color-terracotta)]">
          Flacons in this Order
        </h3>
        <div className="divide-y divide-[var(--color-terracotta-deep)]/20 border border-[var(--color-terracotta-deep)]/25 bg-[var(--color-desert-primary)]/30">
          {order.items?.map((item, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-20 object-cover bg-[var(--color-desert-primary)] border border-[var(--color-terracotta-deep)]/30"
                />
                <div>
                  <h4 className="font-cinzel text-sm font-bold text-[var(--color-earth-dark)]">{item.name}</h4>
                  <p className="text-xs text-[var(--color-terracotta)] font-mono font-semibold">{item.size}</p>
                  <p className="text-xs text-[var(--color-terracotta-deep)] font-medium">Qty: {item.quantity} × ${item.price}</p>
                </div>
              </div>
              <span className="font-cinzel text-base font-bold text-[var(--color-terracotta)]">
                ${item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>
      </div>
      </ScrollReveal>

      {/* Addresses & Financial Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Destination */}
        <ScrollReveal direction="right" delay={0.2}>
        <div className="p-5 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 space-y-2 text-xs h-full">
          <h4 className="font-cinzel text-xs font-bold uppercase text-[var(--color-terracotta)] tracking-wider mb-2">
            Delivery Destination
          </h4>
          <p className="font-bold text-[var(--color-earth-dark)]">{order.shippingAddress?.fullName}</p>
          <p className="text-[var(--color-terracotta-deep)] font-medium">{order.shippingAddress?.address}</p>
          <p className="text-[var(--color-terracotta-deep)] font-medium">{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
          <p className="text-[var(--color-terracotta-deep)] font-medium">{order.shippingAddress?.country}</p>
          <p className="text-[var(--color-terracotta-deep)] font-medium">Phone: {order.shippingAddress?.phone}</p>
        </div>
        </ScrollReveal>

        {/* Invoice Summary */}
        <ScrollReveal direction="left" delay={0.2}>
        <div className="p-5 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 space-y-2 text-xs h-full">
          <h4 className="font-cinzel text-xs font-bold uppercase text-[var(--color-terracotta)] tracking-wider mb-2">
            Settlement Summary
          </h4>
          <div className="flex justify-between text-[var(--color-terracotta-deep)] font-medium">
            <span>Subtotal:</span>
            <span className="font-mono text-[var(--color-earth-dark)] font-bold">${order.subtotal}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-[var(--color-terracotta)] font-bold">
              <span>Privilege ({order.discountCode}):</span>
              <span className="font-mono">-${order.discountAmount}</span>
            </div>
          )}
          <div className="flex justify-between text-[var(--color-terracotta-deep)] font-medium">
            <span>Insured Express Shipping:</span>
            <span className="font-mono text-[var(--color-terracotta)] font-bold">Complimentary</span>
          </div>
          <div className="flex justify-between text-base font-bold text-[var(--color-earth-dark)] pt-3 border-t border-[var(--color-terracotta-deep)]/20 font-cinzel">
            <span>Total Settled:</span>
            <span className="text-[var(--color-terracotta)] font-mono font-bold">${order.total}</span>
          </div>
          <p className="text-[11px] text-[var(--color-terracotta-deep)] pt-2 font-medium">
            Payment Method: {order.paymentMethod?.brand} ending in •••• {order.paymentMethod?.last4 || '4112'}
          </p>
        </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
