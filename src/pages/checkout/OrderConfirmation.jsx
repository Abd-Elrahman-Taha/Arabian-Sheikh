import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { orderService } from '../../services/orderService';
import { isSuccessStatus } from '../../services/paymentService';
import { CheckCircle2, Truck, ArrowRight, Sparkles, XCircle, Clock, Copy, Check } from 'lucide-react';
import ScrollReveal from '../../components/common/ScrollReveal';

export default function OrderConfirmation() {
  const { queryParams, currentPath } = useRouter();
  const { t } = useTranslation();
  // Support both /order-confirmation/ORD-123 (path) and ?orderId=ORD-123 (query)
  const orderId =
    currentPath.split('/order-confirmation/')[1]?.split('?')[0] ||
    queryParams.get('orderId') ||
    'ORD-98421';

  const [order, setOrder] = useState(() => orderService.getOrderByIdSync(orderId));
  const [loading, setLoading] = useState(!order);
  const [copiedTracking, setCopiedTracking] = useState(false);

  const handleCopyTracking = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  useEffect(() => {
    async function load() {
      try {
        const [itemRes, delivRes, trkRes] = await Promise.allSettled([
          orderService.getOrderById(orderId),
          orderService.getDeliveryStatus(orderId),
          orderService.getOrderTracking(orderId)
        ]);
        const item = itemRes.status === 'fulfilled' ? itemRes.value : null;
        const deliv = delivRes.status === 'fulfilled' ? delivRes.value : null;
        const trk = trkRes.status === 'fulfilled' ? trkRes.value : null;

        if (item) {
          const resolvedTracking = deliv?.trackingNumber || trk?.trackingNumber || item.trackingNumber || item.trackingCode || item.dhlTrackingNumber || null;
          setOrder({
            ...item,
            trackingNumber: resolvedTracking || item.trackingNumber || null,
            trackingCode: resolvedTracking || item.trackingCode || null,
            carrier: trk?.carrier || deliv?.carrier || item.carrier || null
          });
        }
      } catch (err) {
        console.warn('Confirmation fetch order error:', err);
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

  const displayStatus = order?.orderStatus || order?.status || 'Confirmed';

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
              <span className="font-cinzel font-bold text-sm text-[#F2D675]">{orderService.formatOrderCode(order || orderId)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#D4AF37]/20 pb-3">
              <span className="text-[#D8BE99] font-medium">Fulfillment Status:</span>
              <span className="font-mono font-bold text-xs uppercase px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F2D675]">
                {String(displayStatus).replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-[#D4AF37]/20 pb-3">
              <span className="text-[#D8BE99] font-medium">{t('confirmation.estimatedDelivery')}:</span>
              <span className="text-[#F3E6D0] font-bold font-mono">
                {order?.estimatedDeliveryDays ? `${order.estimatedDeliveryDays} Business Days` : '2-4 Business Days'} ({order?.carrier || order?.shippingMethod || 'Insured Royal Air Courier'})
              </span>
            </div>
            {/* Tracking Number Row */}
            {(() => {
              const trackingNum = order?.trackingNumber || order?.trackingCode || order?.dhlTrackingNumber || order?.shipping?.trackingNumber || order?.shipments?.[0]?.trackingNumber || order?.shippingSnapshot?.trackingNumber;
              return (
                <div className="flex justify-between items-center border-b border-[#D4AF37]/20 pb-3">
                  <span className="text-[#D8BE99] font-medium flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Tracking Number:</span>
                  </span>
                  {trackingNum ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[#F2D675] font-bold font-mono text-xs bg-black/60 px-2.5 py-1 rounded border border-[#D4AF37]/40 shadow-sm">
                        {trackingNum}
                      </span>
                      <button
                        onClick={() => handleCopyTracking(trackingNum)}
                        className="p-1 text-[#D4AF37] hover:text-[#F2D675] transition-colors cursor-pointer"
                        title="Copy Tracking Number"
                      >
                        {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ) : (
                    <span className="text-[#D8BE99]/60 font-mono italic text-xs">
                      Generated upon courier handover
                    </span>
                  )}
                </div>
              );
            })()}

            {(() => {
              const trackingNum = order?.trackingNumber || order?.trackingCode || order?.dhlTrackingNumber || order?.shipping?.trackingNumber || order?.shipments?.[0]?.trackingNumber || order?.shippingSnapshot?.trackingNumber;
              if (!trackingNum) return null;
              return (
                <div className="p-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-between text-xs">
                  <span className="text-[#D8BE99]">Airway Courier Dispatch Active</span>
                  <Link
                    to={`/order-tracking/${orderId}`}
                    className="font-cinzel text-xs font-bold text-[#F2D675] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Track Transit Checkpoints <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })()}
            <div className="flex justify-between items-center border-b border-[#D4AF37]/20 pb-3">
              <span className="text-[#D8BE99] font-medium">Payment Method:</span>
              <span className="font-cinzel font-bold text-xs text-[#F2D675]">
                {['cod', 'cashondelivery'].includes(String(order?.paymentMethod || order?.paymentMethodCode || '').toLowerCase())
                  ? 'Cash on Delivery (COD)'
                  : 'Credit / Debit Card (Stripe)'}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-[#D4AF37]/20 pb-3">
              <span className="text-[#D8BE99] font-medium">Payment Status:</span>
              <div>
                {(() => {
                  const isCod = ['cod', 'cashondelivery'].includes(String(order?.paymentMethod || order?.paymentMethodCode || '').toLowerCase());
                  const payStatus = order?.paymentStatus;
                  if (isCod) {
                    return (
                      <span className="bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F2D675] px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono font-bold text-xs">
                        <Clock className="w-3 h-3" /> Pay Upon Delivery
                      </span>
                    );
                  }
                  if (isSuccessStatus(payStatus) || isSuccessStatus(order?.payments?.[0]?.status) || Boolean(order?.paidAt) || (!payStatus && order?.orderStatus !== 'Cancelled')) {
                    return (
                      <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono font-bold text-xs">
                        <CheckCircle2 className="w-3 h-3" /> Paid & Confirmed
                      </span>
                    );
                  }
                  if (payStatus === 'Failed') {
                    return (
                      <span className="bg-rose-500/20 border border-rose-500/40 text-rose-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono font-bold text-xs">
                        <XCircle className="w-3 h-3" /> Payment Failed
                      </span>
                    );
                  }
                  return (
                    <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono font-bold text-xs">
                      <Clock className="w-3 h-3" /> {payStatus || 'Pending Verification'}
                    </span>
                  );
                })()}
              </div>
            </div>
            {(order?.total !== undefined || order?.totals?.total !== undefined) && (
              <div className="flex justify-between items-center border-b border-[#D4AF37]/20 pb-3">
                <span className="text-[#D8BE99] font-medium">Total Amount:</span>
                <span className="font-mono font-bold text-sm text-[#D4AF37]">
                  {order?.currency || 'EUR'} {Number(order?.total ?? order?.totals?.total ?? 0).toFixed(2)}
                </span>
              </div>
            )}

            {/* COD Specific Instructions */}
            {['cod', 'cashondelivery'].includes(String(order?.paymentMethod || order?.paymentMethodCode || '').toLowerCase()) && (
              <div className="p-3.5 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-xs text-[#F2D675] flex items-center gap-3 mt-2">
                <Truck className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <div>
                  <p className="font-cinzel font-bold text-xs text-[#F2D675]">Pay in cash on delivery</p>
                  <p className="text-[11px] text-[#D8BE99]">
                    Please have {order?.currency || 'EUR'} {Number(order?.total ?? order?.totals?.total ?? 0).toFixed(2)} ready in cash or card for the courier upon arrival.
                  </p>
                </div>
              </div>
            )}

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
