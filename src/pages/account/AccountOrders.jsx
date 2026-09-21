import { useState, useEffect } from 'react';
import { Link } from '../../router/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { shippingService } from '../../services/shippingService';
import { paymentApi } from '../../api/payment.api';
import { isSuccessStatus } from '../../services/paymentService';
import { Package, Truck, ChevronRight } from 'lucide-react';

function getStatusStyle(status = '') {
  const s = String(status || '').toUpperCase().replace(/[\s_-]+/g, '');
  if (s.includes('DELIVER')) return 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 shadow-sm';
  if (s.includes('SHIP') || s.includes('TRANSIT') || s.includes('OUTFOR')) return 'bg-amber-950 text-amber-300 border border-amber-500/40 shadow-sm';
  if (s.includes('PROCESS') || s.includes('CONFIRM')) return 'bg-blue-950 text-blue-300 border border-blue-500/40 shadow-sm';
  if (s.includes('CANCEL')) return 'bg-rose-950 text-rose-300 border border-rose-500/40 shadow-sm';
  return 'bg-neutral-900 text-neutral-300 border border-neutral-600/40 shadow-sm';
}

function formatOrderStatus(status = '') {
  if (!status) return 'Pending';
  return String(status).replace(/([A-Z])/g, ' $1').trim().replace(/_/g, ' ');
}


/** Helper to check if order is Cash on Delivery */
function isCodOrder(order) {
  const method = String(order?.paymentMethodCode || order?.paymentMethod || order?.paymentMethodName || '').toLowerCase();
  return method.includes('cod') || method.includes('cash') || method.includes('delivery');
}

/** Resolve payment status strictly from the backend order entity */
function resolveDisplayPaymentStatus(order) {
  if (isCodOrder(order)) return 'Cash on Delivery';
  if (isSuccessStatus(order.paymentStatus)) return 'Paid';
  return order.paymentStatus || 'Pending';
}

/** For Pending orders with a known backend paymentId, check live status from the API */
async function enrichOrdersWithPaymentStatus(orders) {
  const enriched = await Promise.all(orders.map(async (o) => {
    const displayPay = resolveDisplayPaymentStatus(o);
    if (isSuccessStatus(displayPay)) {
      return { ...o, paymentStatus: 'Paid' };
    }

    // Check backend payment record if paymentId exists on the order
    const pid = o.paymentId || o.payments?.[0]?.id || o.payments?.[0]?.paymentId;
    if (pid) {
      try {
        const payment = await paymentApi.getPaymentStatus(Number(pid));
        if (payment && isSuccessStatus(payment.status)) {
          return { ...o, paymentStatus: 'Paid' };
        }
      } catch (err) {
        console.warn('Could not verify payment status for order:', o.id, err?.message);
      }
    }

    return { ...o, paymentStatus: displayPay };
  }));
  return enriched;
}

export default function AccountOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const mine = await orderService.getCustomerOrders(user);
        const enriched = await enrichOrdersWithPaymentStatus(mine);
        setOrders(enriched);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();

    // Real-time reactive updates when admin updates status or an order is placed
    const handleOrderUpdate = async () => {
      try {
        const fresh = await orderService.getCustomerOrders(user);
        const enriched = await enrichOrdersWithPaymentStatus(fresh);
        setOrders(enriched);
      } catch (e) {
        console.warn('Real-time order refresh error:', e);
      }
    };

    window.addEventListener('arabian_sheikh_order_updated', handleOrderUpdate);
    window.addEventListener('arabian_sheikh_order_created', handleOrderUpdate);

    return () => {
      window.removeEventListener('arabian_sheikh_order_updated', handleOrderUpdate);
      window.removeEventListener('arabian_sheikh_order_created', handleOrderUpdate);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2].map(i => (
          <div key={i} className="h-32 rounded-xl bg-white/5 border border-[#3A2116]/30" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 space-y-4 text-[#F3E6D0]">
        <div className="w-16 h-16 rounded-full border border-[#3A2116] flex items-center justify-center mx-auto text-[#D4AF37] bg-[#21130D]">
          <Package className="w-8 h-8 opacity-60" />
        </div>
        <h3 className="font-cinzel text-lg font-bold text-[#F3E6D0]">No Orders Yet</h3>
        <p className="text-xs text-[#D8BE99] max-w-sm mx-auto">
          Your acquisition history will appear here once you place your first order.
        </p>
        <Link to="/shop" className="inline-block px-6 py-2.5 bg-[#D4AF37] text-black font-cinzel text-xs uppercase font-bold tracking-wider rounded-full">
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#F3E6D0]">
      <div className="border-b border-[#3A2116]/40 pb-5">
        <h2 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
          Acquisition History
        </h2>
        <p className="text-xs sm:text-sm text-[#D8BE99] mt-1">
          Track and review all royal distillations dispatched to your palace residence.
        </p>
      </div>

      <div className="space-y-5">
        {orders.map((o) => {
          const hasShipmentStatus = Boolean(o.shipmentStatus);
          const displayStatus = o.shipmentStatus || o.orderStatus || o.status || 'Pending';
          const statusClass = hasShipmentStatus
            ? shippingService.getShipmentStatusBadge(o.shipmentStatus)
            : getStatusStyle(displayStatus);
          const statusLabel = hasShipmentStatus
            ? shippingService.getShipmentStatusLabel(o.shipmentStatus)
            : formatOrderStatus(displayStatus);
          const dateStr = o.date || o.createdAt
            ? new Date(o.date || o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—';
          const orderItems = Array.isArray(o.items) ? o.items : [];

          return (
            <div key={o.id} className="bg-[#21130D] border border-[#3A2116]/60 p-6 space-y-4 shadow-md rounded-xl">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#3A2116]/30 gap-2 text-sm">
                <div>
                  <Link
                    to={`/account/orders/${o.id}`}
                    className="font-cinzel font-bold text-[#D4AF37] text-base sm:text-lg hover:underline cursor-pointer"
                  >
                    {orderService.formatOrderCode(o)}
                  </Link>
                  <span className="text-[#D8BE99] ml-3 font-mono text-xs sm:text-sm">{dateStr}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  {(() => {
                    const isCod = isCodOrder(o);
                    const badgeClass = isCod
                      ? 'bg-[#D4AF37]/20 text-[#F2D675] border-[#D4AF37]/40'
                      : isSuccessStatus(o.paymentStatus)
                        ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-950/70 text-amber-300 border-amber-500/40';
                    const label = isCod ? 'Cash on Delivery' : isSuccessStatus(o.paymentStatus) ? 'Paid' : (o.paymentStatus || 'Pending');
                    return (
                      <span className={`px-2.5 py-0.5 text-[11px] font-mono uppercase font-bold rounded-full border ${badgeClass}`}>
                        {label}
                      </span>
                    );
                  })()}
                  <span className={`px-3 py-1 text-xs font-mono uppercase font-bold rounded-full border ${statusClass}`}>
                    {statusLabel}
                  </span>
                  <span className="font-cinzel font-bold text-[#F3E6D0] text-base sm:text-lg">
                    €{Number(o.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Items */}
              {orderItems.length > 0 && (
                <div className="space-y-2 text-sm">
                  {orderItems.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-[#D8BE99]">
                      <span>{it.name || it.productName || 'Product'} × {it.quantity ?? it.qty ?? 1}</span>
                      <span className="font-mono text-[#F3E6D0] font-semibold">
                        €{Number((it.price ?? it.unitPriceSnapshot ?? 0) * (it.quantity ?? it.qty ?? 1)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="pt-3.5 border-t border-[#3A2116]/30 flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm gap-2">
                {(() => {
                  const trkNum = o.trackingNumber || o.trackingCode || o.dhlTrackingNumber || o.shipping?.trackingNumber || o.shippingSnapshot?.trackingNumber || o.shipments?.[0]?.trackingNumber;
                  return (
                    <div className="flex items-center gap-2 font-mono text-xs text-[#D8BE99]">
                      <Truck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      {trkNum ? (
                        <span className="text-[#F2D675] font-bold bg-black/50 px-2 py-0.5 rounded border border-[#D4AF37]/30">
                          Tracking: {trkNum}
                        </span>
                      ) : (
                        <span className="text-neutral-500 italic text-xs">Tracking pending dispatch</span>
                      )}
                    </div>
                  );
                })()}
                <div className="flex items-center gap-4">
                  <Link
                    to={`/account/orders/${o.id}`}
                    className="font-cinzel text-xs uppercase tracking-wider font-bold text-[#D4AF37] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    Order Details & Returns
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to={`/order-tracking/${o.id}`}
                    className="font-cinzel text-xs uppercase tracking-wider font-bold text-[#D8BE99] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Track
                  </Link>
                  <Link
                    to={`/order-confirmation/${o.id}`}
                    className="font-cinzel text-xs uppercase tracking-wider font-bold text-[#F3E6D0] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    Receipt
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


