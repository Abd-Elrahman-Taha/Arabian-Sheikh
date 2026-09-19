import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { orderService } from '../../services/orderService';
import { shippingService } from '../../services/shippingService';
import { Truck, ArrowLeft, Printer, AlertCircle, Copy, Check, XCircle, Clock, ExternalLink, ShieldCheck, RotateCcw } from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../../components/common/ScrollReveal';
import returnsService from '../../services/returnsService';
import ReturnWizardModal from '../../components/returns/ReturnWizardModal';
import ReturnDetailsModal from '../../components/returns/ReturnDetailsModal';

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

  // Logistics & Cancellation State
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Returns & Refunds State
  const [eligibility, setEligibility] = useState(null);
  const [orderReturns, setOrderReturns] = useState([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedReturnId, setSelectedReturnId] = useState(null);

  const orderId = currentPath.split('/account/orders/')[1]?.split('?')[0];

  const refreshOrderData = async () => {
    if (!orderId) return;
    try {
      const [item, deliv, elig, ret] = await Promise.allSettled([
        orderService.getOrderById(orderId),
        orderService.getDeliveryStatus(orderId),
        returnsService.checkEligibility(orderId),
        returnsService.getOrderReturns(orderId)
      ]);
      const orderData = item.status === 'fulfilled' ? item.value : null;
      const delivData = deliv.status === 'fulfilled' ? deliv.value : null;

      if (orderData) {
        setOrder({
          ...orderData,
          shipmentStatus: delivData?.shipmentStatus || orderData.shipmentStatus || null,
          trackingCode: delivData?.trackingNumber || orderData.trackingCode || null,
          carrierStatus: delivData?.carrierStatus || orderData.carrierStatus || null
        });
      }
      if (elig.status === 'fulfilled') setEligibility(elig.value);
      if (ret.status === 'fulfilled') setOrderReturns(ret.value || []);
    } catch (err) {
      console.warn('Failed to refresh order data:', err);
    }
  };

  useEffect(() => {
    async function load() {
      if (!orderId) return;
      try {
        const [item, deliv, elig, ret] = await Promise.allSettled([
          orderService.getOrderById(orderId),
          orderService.getDeliveryStatus(orderId),
          returnsService.checkEligibility(orderId),
          returnsService.getOrderReturns(orderId)
        ]);
        const orderData = item.status === 'fulfilled' ? item.value : null;
        const delivData = deliv.status === 'fulfilled' ? deliv.value : null;

        if (orderData) {
          setOrder({
            ...orderData,
            shipmentStatus: delivData?.shipmentStatus || orderData.shipmentStatus || null,
            trackingCode: delivData?.trackingNumber || orderData.trackingCode || null,
            carrierStatus: delivData?.carrierStatus || orderData.carrierStatus || null
          });
        }
        if (elig.status === 'fulfilled') setEligibility(elig.value);
        if (ret.status === 'fulfilled') setOrderReturns(ret.value || []);
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

  const normStatus = String(displayStatus).toLowerCase();
  const isCancellable = ['pending', 'processing'].includes(normStatus);
  const isShippedOrOut = ['shipped', 'outfordelivery'].includes(normStatus);

  const trackingNumber = order.trackingCode || order.dhlTrackingNumber || order.shippingSnapshot?.trackingNumber || order.shipments?.[0]?.trackingNumber || null;
  const carrierName = order.carrier || order.shippingSnapshot?.shippingCompanyName || order.shippingSnapshot?.carrier || order.shipping?.shippingCompanyName || 'ECONT';
  const shipmentStatus = order.shipmentStatus || (normStatus === 'shipped' ? 'Shipped' : (normStatus === 'delivered' ? 'Delivered' : (normStatus === 'outfordelivery' ? 'OutForDelivery' : 'Pending')));

  const handleCopyTracking = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    setCancelling(true);
    try {
      const res = await orderService.customerCancelOrder(order.id, cancelReason);
      const updatedStatus = res?.orderStatus || res?.status || 'Cancelled';
      setOrder(prev => ({
        ...prev,
        orderStatus: updatedStatus,
        status: updatedStatus
      }));
      setCancelModalOpen(false);
    } catch (err) {
      console.warn('Failed to cancel order:', err);
    } finally {
      setCancelling(false);
    }
  };

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

        <div className="flex flex-wrap items-center gap-3">
          {/* Cancel Button with Eligibility Rules (Section 9) */}
          {isCancellable && (
            <button
              onClick={() => { setCancelReason(''); setCancelModalOpen(true); }}
              className="px-3.5 py-2 border border-rose-500/40 hover:border-rose-500 text-rose-300 hover:text-rose-200 bg-rose-950/20 text-xs font-cinzel font-bold flex items-center gap-1.5 transition-colors cursor-pointer rounded"
              title="Request cancellation for this order"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Cancel Order</span>
            </button>
          )}

          {isShippedOrOut && (
            <span
              className="px-3 py-1.5 border border-neutral-700/50 bg-neutral-900/40 text-neutral-400 text-[11px] font-cinzel flex items-center gap-1.5 rounded cursor-not-allowed"
              title="This order cannot be cancelled because it has already shipped. You can request a return after delivery."
            >
              <Truck className="w-3 h-3 text-neutral-500" />
              <span>Shipped (Non-cancellable)</span>
            </span>
          )}

          {/* Return Request Button */}
          {eligibility?.eligible && (eligibility?.eligibleItems?.length > 0) && (
            <button
              onClick={() => setWizardOpen(true)}
              className="px-3.5 py-2 bg-[#D4AF37]/20 border border-[#D4AF37]/60 hover:bg-[#D4AF37] text-white hover:text-black text-xs font-cinzel font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer rounded shadow-sm"
              title="Request a return or refund for this order"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Request Return</span>
            </button>
          )}

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
                Order Cancelled
              </p>
              <p className="text-rose-300/90 font-medium">
                {cancelNote || 'This acquisition was cancelled. If payment was settled, a refund will be processed to your original settlement method.'}
              </p>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Return Eligibility Banner */}
      {eligibility?.eligible && (
        <ScrollReveal direction="up">
          <div className="p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start sm:items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-cinzel font-bold text-[#F3E6D0] uppercase tracking-wider block">
                  Royal Return Privilege Active
                </span>
                <span className="text-[#D8BE99]">
                  {eligibility.reason || 'This order is eligible for return.'}
                  {eligibility.daysRemaining !== null ? ` (${eligibility.daysRemaining} days remaining)` : ''}
                </span>
              </div>
            </div>
            <button
              onClick={() => setWizardOpen(true)}
              className="luxury-btn-gold px-4 py-1.5 text-[11px] font-cinzel font-bold uppercase tracking-wider shrink-0 cursor-pointer"
            >
              Start Return
            </button>
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
                  src={item.image || item.imageUrl || '/products/luxury_designs/07_arabian_gold.webp'}
                  alt={item.name}
                  className="w-16 h-20 object-cover bg-[var(--color-desert-primary)] border border-[var(--color-terracotta-deep)]/30"
                />
                <div>
                  <h4 className="font-cinzel text-sm font-bold text-[var(--color-earth-dark)]">{item.name}</h4>
                  <p className="text-xs text-[var(--color-terracotta)] font-mono font-semibold">{item.size || '100 ml Extrait'}</p>
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

      {/* Addresses, Shipping Information & Financial Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shipping Destination */}
        <ScrollReveal direction="right" delay={0.2}>
        <div className="p-5 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 space-y-2 text-xs h-full">
          <h4 className="font-cinzel text-xs font-bold uppercase text-[var(--color-terracotta)] tracking-wider mb-2">
            Delivery Destination
          </h4>
          <p className="font-bold text-[var(--color-earth-dark)]">{order.shippingAddress?.fullName || order.customerName}</p>
          <p className="text-[var(--color-terracotta-deep)] font-medium">{order.shippingAddress?.address || order.shippingAddress?.addressLine1}</p>
          <p className="text-[var(--color-terracotta-deep)] font-medium">{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
          <p className="text-[var(--color-terracotta-deep)] font-medium">{order.shippingAddress?.country}</p>
          <p className="text-[var(--color-terracotta-deep)] font-medium">Phone: {order.shippingAddress?.phone || order.customerPhone || '—'}</p>
        </div>
        </ScrollReveal>

        {/* Section 8: SHIPPING INFORMATION Card */}
        <ScrollReveal direction="up" delay={0.2}>
        <div className="p-5 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 space-y-3 text-xs h-full flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-cinzel text-xs font-bold uppercase text-[var(--color-terracotta)] tracking-wider">
                Shipping Information
              </h4>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded border ${shippingService.getShipmentStatusBadge(shipmentStatus)}`}>
                {shippingService.getShipmentStatusLabel(shipmentStatus)}
              </span>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[var(--color-terracotta-deep)]">
                <span>Carrier:</span>
                <span className="font-bold text-[var(--color-earth-dark)] font-mono uppercase">{carrierName}</span>
              </div>
              <div className="flex justify-between items-center text-[var(--color-terracotta-deep)]">
                <span>Tracking Number:</span>
                {trackingNumber ? (
                  <div className="flex items-center gap-1 font-mono font-bold text-[var(--color-terracotta)]">
                    <span>{trackingNumber}</span>
                    <button
                      onClick={() => handleCopyTracking(trackingNumber)}
                      className="p-1 hover:text-white transition-colors cursor-pointer"
                      title="Copy Tracking Number"
                    >
                      {copiedTracking ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                ) : (
                  <span className="font-mono text-neutral-500 italic text-[11px]">Tracking will be available once your order ships</span>
                )}
              </div>
              <div className="flex justify-between text-[var(--color-terracotta-deep)]">
                <span>Expected Delivery:</span>
                <span className="font-medium text-[var(--color-earth-dark)]">
                  {order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : '2-4 business days'}
                </span>
              </div>
            </div>
          </div>

          <Link
            to={`/order-tracking/${order.orderNumber || order.id}`}
            className="w-full py-2 bg-[#D4AF37]/20 border border-[#D4AF37]/50 hover:bg-[#D4AF37] text-white hover:text-black font-cinzel font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 rounded cursor-pointer mt-2"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{trackingNumber ? 'Track Shipment' : 'View Delivery Status'}</span>
          </Link>
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
            <span>Insured Shipping:</span>
            <span className="font-mono text-[var(--color-terracotta)] font-bold">
              {order.shippingCost === 0 || order.shipping === 0 ? 'Complimentary' : `$${order.shippingCost || order.shipping}`}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold text-[var(--color-earth-dark)] pt-3 border-t border-[var(--color-terracotta-deep)]/20 font-cinzel">
            <span>Total Settled:</span>
            <span className="text-[var(--color-terracotta)] font-mono font-bold">${order.total}</span>
          </div>
          <p className="text-[11px] text-[var(--color-terracotta-deep)] pt-2 font-medium">
            Payment Method: {order.paymentMethod?.brand || order.paymentMethod || 'Credit Card'}
          </p>
        </div>
        </ScrollReveal>
      </div>

      {/* Return Requests & Inquiries History */}
      {orderReturns && orderReturns.length > 0 && (
        <ScrollReveal direction="up" delay={0.25}>
          <div className="space-y-4">
            <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[var(--color-terracotta)]">
              Return Requests & Inquiries ({orderReturns.length})
            </h3>

            <div className="divide-y divide-[var(--color-terracotta-deep)]/20 border border-[var(--color-terracotta-deep)]/25 bg-[var(--color-desert-primary)]/30 rounded-xl overflow-hidden">
              {orderReturns.map(ret => {
                const retStatus = returnsService.RETURN_STATUSES[ret.status] || {
                  label: ret.status,
                  badgeClass: 'bg-neutral-800 text-neutral-300 border-neutral-700'
                };

                return (
                  <div key={ret.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[var(--color-earth-dark)]">
                          Return #{ret.id}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full uppercase border ${retStatus.badgeClass}`}>
                          {retStatus.label}
                        </span>
                      </div>
                      <p className="text-[var(--color-terracotta-deep)] font-medium">
                        Submitted on {new Date(ret.createdAt).toLocaleDateString()} &bull; {ret.items?.length || 0} item(s)
                      </p>
                      {ret.totalRefundAmount > 0 && (
                        <p className="font-mono text-emerald-600 font-bold">
                          Refund: €{ret.totalRefundAmount.toFixed(2)}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedReturnId(ret.id)}
                      className="px-4 py-2 bg-[#D4AF37]/20 border border-[#D4AF37]/50 hover:bg-[#D4AF37] text-white hover:text-black font-cinzel font-bold text-xs uppercase tracking-wider transition-colors rounded cursor-pointer self-start sm:self-auto"
                    >
                      View Details & Evidence
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Royal Cancellation Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#120B06] border border-[#D4AF37]/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-[#F3E6D0]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-cinzel text-base font-bold uppercase tracking-wider">Cancel Acquisition</h3>
              </div>
              <button
                onClick={() => setCancelModalOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#D8BE99] leading-relaxed">
              Are you certain you wish to request cancellation for Order <strong className="text-[#F3E6D0]">#{order.orderNumber || order.id}</strong>? Once accepted, logistics and warehouse dispatch will be terminated.
            </p>

            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div>
                <label className="block text-[11px] font-cinzel text-[#D8BE99] uppercase tracking-wider mb-1.5">
                  Cancellation Reason (Optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="E.g. Changed fragrance preference, ordered duplicate flacon..."
                  rows={3}
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none placeholder:text-neutral-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-xs font-cinzel text-[#F3E6D0] hover:bg-white/10 transition-colors cursor-pointer rounded-lg"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-cinzel font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-lg shadow-md flex items-center gap-1.5"
                >
                  {cancelling ? <span>Processing...</span> : <span>Confirm Cancellation</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Return Wizard Modal */}
      <ReturnWizardModal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        orderId={order.id}
        orderNumber={order.orderNumber}
        eligibility={eligibility}
        onSuccess={() => {
          refreshOrderData();
        }}
      />

      {/* Customer Return Details Modal */}
      <ReturnDetailsModal
        isOpen={Boolean(selectedReturnId)}
        onClose={() => setSelectedReturnId(null)}
        returnId={selectedReturnId}
        onUpdated={() => {
          refreshOrderData();
        }}
      />
    </div>
  );
}
