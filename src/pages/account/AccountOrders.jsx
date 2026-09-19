import React, { useState, useEffect } from 'react';
import { Link } from '../../router/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { shippingService } from '../../services/shippingService';
import { Package, Truck, ChevronRight } from 'lucide-react';

function getStatusStyle(status = '') {
  const s = String(status || '').toUpperCase().replace(/[\s_-]+/g, '');
  if (s.includes('DELIVER')) {
    return 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 shadow-sm';
  }
  if (s.includes('SHIP') || s.includes('TRANSIT') || s.includes('OUTFOR')) {
    return 'bg-amber-950 text-amber-300 border border-amber-500/40 shadow-sm';
  }
  if (s.includes('PROCESS') || s.includes('CONFIRM')) {
    return 'bg-blue-950 text-blue-300 border border-blue-500/40 shadow-sm';
  }
  if (s.includes('CANCEL')) {
    return 'bg-rose-950 text-rose-300 border border-rose-500/40 shadow-sm';
  }
  return 'bg-neutral-900 text-neutral-300 border border-neutral-600/40 shadow-sm';
}

function formatOrderStatus(status = '') {
  if (!status) return 'Pending';
  return String(status)
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/_/g, ' ');
}

export default function AccountOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const mine = await orderService.getCustomerOrders(user);
        setOrders(mine);
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
        setOrders(fresh);
      } catch (e) {
        console.warn('Real-time order refresh error:', e);
      }
    };

    window.addEventListener('arabian_sheikh_order_updated', handleOrderUpdate);
    window.addEventListener('arabian_sheikh_cloud_updated', handleOrderUpdate);
    window.addEventListener('arabian_sheikh_order_created', handleOrderUpdate);

    // Cross-tab synchronization
    const handleStorageChange = (e) => {
      if (
        e.key === 'arabian_sheikh_orders' ||
        e.key === 'arabian_sheikh_last_order_update' ||
        e.key === 'arabian_sheikh_live_cloud_state_v4'
      ) {
        handleOrderUpdate();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('arabian_sheikh_order_updated', handleOrderUpdate);
      window.removeEventListener('arabian_sheikh_cloud_updated', handleOrderUpdate);
      window.removeEventListener('arabian_sheikh_order_created', handleOrderUpdate);
      window.removeEventListener('storage', handleStorageChange);
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
                  <span className="font-cinzel font-bold text-[#D4AF37] text-base sm:text-lg">{o.id}</span>
                  <span className="text-[#D8BE99] ml-3 font-mono text-xs sm:text-sm">{dateStr}</span>
                </div>
                <div className="flex items-center gap-3">
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
                <div className="flex items-center gap-2 font-mono text-[#D8BE99]">
                  <Truck className="w-4 h-4 text-[#D4AF37]" />
                  <span>{o.dhlTrackingNumber || o.trackingCode || '—'}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    to={`/order-tracking/${o.id}`}
                    className="font-cinzel text-xs uppercase tracking-wider font-bold text-[#D4AF37] flex items-center gap-1 hover:underline"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Track Order
                  </Link>
                  <Link
                    to={`/order-confirmation/${o.id}`}
                    className="font-cinzel text-xs uppercase tracking-wider font-bold text-[#F3E6D0] flex items-center gap-1 hover:underline"
                  >
                    View Receipt
                    <ChevronRight className="w-3.5 h-3.5" />
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


