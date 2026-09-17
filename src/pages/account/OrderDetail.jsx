import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { orderService } from '../../services/orderService';
import { Truck, ArrowLeft, Printer, AlertCircle } from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../../components/common/ScrollReveal';

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
    return 'bg-emerald-950 text-emerald-300 border-emerald-500/40';
  }
  if (s.includes('SHIP') || s.includes('TRANSIT') || s.includes('OUTFOR')) {
    return 'bg-amber-950 text-amber-300 border-amber-500/40';
  }
  if (s.includes('PROCESS') || s.includes('CONFIRM')) {
    return 'bg-blue-950 text-blue-300 border-blue-500/40';
  }
  if (s.includes('CANCEL')) {
    return 'bg-rose-950 text-rose-300 border-rose-500/40';
  }
  return 'bg-neutral-900 text-neutral-300 border-neutral-600/40';
}

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

  const displayStatus = order.orderStatus || order.status || 'Pending';
  const isCancelled = String(displayStatus).toLowerCase().includes('cancel');
  const statusBadgeClass = getStatusBadge(displayStatus);
  const cancelNote = order.timeline?.find(t => String(t.status).toLowerCase().includes('cancel'))?.title ||
    order.statusHistory?.find(h => String(h.toStatus || h.status).toLowerCase().includes('cancel'))?.note || '';

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
            Order Reference: {order.orderNumber || order.id}
          </h2>
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            <span className="text-xs text-[var(--color-terracotta-deep)] font-mono font-medium">
              Placed on {new Date(order.date || order.createdAt).toLocaleString()}
            </span>
            <span className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded-full uppercase border ${statusBadgeClass}`}>
              {formatOrderStatus(displayStatus)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/order-tracking/${order.orderNumber || order.id}`}
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

      {/* Cancellation Notice Banner */}
      {isCancelled && (
        <ScrollReveal direction="up">
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 flex items-start gap-3 text-rose-300">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-cinzel font-bold text-sm text-rose-200 uppercase tracking-wider">
                Order Cancelled by Administration
              </p>
              <p className="text-rose-300/90 font-medium">
                {cancelNote || 'This acquisition was cancelled by palace administration. For questions or refund status, please contact royal concierge.'}
              </p>
            </div>
          </div>
        </ScrollReveal>
      )}

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
