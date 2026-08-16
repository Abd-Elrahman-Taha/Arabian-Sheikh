import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { orderService } from '../../services/orderService';
import { Truck, ArrowLeft, ShieldCheck, Printer, CheckCircle2 } from 'lucide-react';

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
    return <div className="p-12 text-center text-xs text-[#C5B8A8]">Retrieving royal invoice...</div>;
  }

  if (!order) {
    return (
      <div className="p-8 text-center space-y-4">
        <h3 className="font-cinzel text-lg text-[#F3EEE5]">Order Reference Not Found</h3>
        <Link to="/account/orders" className="luxury-btn-gold px-5 py-2 text-xs inline-block">
          Return to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-[#F3EEE5]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#C6A15B]/20 pb-4 gap-4">
        <div>
          <button
            onClick={() => navigate('/account/orders')}
            className="text-xs text-[#C6A15B] hover:underline flex items-center gap-1 mb-2 font-cinzel"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Orders</span>
          </button>
          <h2 className="font-cinzel text-2xl font-bold uppercase">
            Order Reference: {order.id}
          </h2>
          <p className="text-xs text-[#C5B8A8] font-mono">
            Placed on {new Date(order.date).toLocaleString()} • Status: <strong className="text-[#C6A15B]">{order.status}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/order-tracking/${order.id}`}
            className="luxury-btn-gold px-4 py-2 text-xs flex items-center gap-1.5"
          >
            <Truck className="w-4 h-4" />
            <span>{t('confirmation.trackOrder')}</span>
          </Link>
          <button
            onClick={() => window.print()}
            className="p-2 border border-[#C6A15B]/30 hover:border-[#C6A15B] text-[#C5B8A8] hover:text-[#F3EEE5]"
            title="Print Parchment Invoice"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Items Breakdown */}
      <div className="space-y-4">
        <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#C6A15B]">
          Flacons in this Order
        </h3>
        <div className="divide-y divide-[#C6A15B]/15 border border-[#C6A15B]/20 bg-[#241712]">
          {order.items?.map((item, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-20 object-cover bg-[#0F0D0C] border border-[#C6A15B]/10"
                />
                <div>
                  <h4 className="font-cinzel text-sm font-semibold text-[#F3EEE5]">{item.name}</h4>
                  <p className="text-xs text-[#C6A15B] font-mono">{item.size}</p>
                  <p className="text-xs text-[#C5B8A8]">Qty: {item.quantity} × ${item.price}</p>
                </div>
              </div>
              <span className="font-cinzel text-base font-bold text-[#C6A15B]">
                ${item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Addresses & Financial Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Destination */}
        <div className="p-5 bg-[#241712] border border-[#C6A15B]/20 space-y-2 text-xs">
          <h4 className="font-cinzel text-xs font-bold uppercase text-[#C6A15B] tracking-wider mb-2">
            Delivery Destination
          </h4>
          <p className="font-semibold text-[#F3EEE5]">{order.shippingAddress?.fullName}</p>
          <p className="text-[#C5B8A8]">{order.shippingAddress?.address}</p>
          <p className="text-[#C5B8A8]">{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
          <p className="text-[#C5B8A8]">{order.shippingAddress?.country}</p>
          <p className="text-[#C5B8A8]">Phone: {order.shippingAddress?.phone}</p>
        </div>

        {/* Invoice Summary */}
        <div className="p-5 bg-[#241712] border border-[#C6A15B]/20 space-y-2 text-xs">
          <h4 className="font-cinzel text-xs font-bold uppercase text-[#C6A15B] tracking-wider mb-2">
            Settlement Summary
          </h4>
          <div className="flex justify-between text-[#C5B8A8]">
            <span>Subtotal:</span>
            <span className="font-mono text-[#F3EEE5]">${order.subtotal}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-[#C6A15B]">
              <span>Privilege ({order.discountCode}):</span>
              <span className="font-mono">-${order.discountAmount}</span>
            </div>
          )}
          <div className="flex justify-between text-[#C5B8A8]">
            <span>Insured Express Shipping:</span>
            <span className="font-mono text-[#C6A15B]">Complimentary</span>
          </div>
          <div className="flex justify-between text-base font-bold text-[#F3EEE5] pt-3 border-t border-[#C6A15B]/20 font-cinzel">
            <span>Total Settled:</span>
            <span className="text-[#C6A15B]">${order.total}</span>
          </div>
          <p className="text-[11px] text-[#C5B8A8] pt-2">
            Payment Method: {order.paymentMethod?.brand} ending in •••• {order.paymentMethod?.last4 || '4112'}
          </p>
        </div>
      </div>
    </div>
  );
}
