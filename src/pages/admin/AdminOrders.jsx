import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { orderService, ORDER_STATUSES } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import { ShoppingBag, Search, Truck, ExternalLink, Filter } from 'lucide-react';

export default function AdminOrders() {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const { success, error } = useToast();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const list = await orderService.getAllOrders({
        search,
        status: statusFilter
      });
      setOrders(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      success(`Order #${orderId} status changed to ${newStatus}.`);
      fetchOrders();
    } catch (err) {
      error(err.message || 'Could not update status.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#F3EEE5]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#C6A15B]/20 pb-4 gap-4">
        <div>
          <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider">
            {t('admin.orders')}
          </h1>
          <p className="text-xs text-[#C5B8A8]">
            Monitor fulfillment, update dispatch milestones, and inspect client invoices.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#1C120E] border border-[#C6A15B]/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID, Patron, Tracking..."
            className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 pl-9 pr-3 py-2 text-xs text-[#F3EEE5] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#C6A15B] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-[#0F0D0C] border border-[#C6A15B]/30 px-3 py-2 text-xs text-[#F3EEE5] focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#1C120E] border border-[#C6A15B]/20 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[#C6A15B]/20 text-[#C6A15B] uppercase font-cinzel">
              <th className="py-3 px-4">Order Ref</th>
              <th className="py-3 px-4">Patron & Destination</th>
              <th className="py-3 px-4">Flacons</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Logistics Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C6A15B]/10 text-[#F3EEE5]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#C5B8A8]">
                  Loading logistics ledger...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#C5B8A8]">
                  No orders matched criteria.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#241712] transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-cinzel font-bold text-sm text-[#C6A15B] block">
                      {order.id}
                    </span>
                    <span className="text-[10px] text-[#C5B8A8] font-mono">
                      {new Date(order.date).toLocaleDateString()}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#F3EEE5] block">{order.customerName}</span>
                    <span className="text-[11px] text-[#C5B8A8] block">{order.shippingAddress?.city}, {order.shippingAddress?.country}</span>
                    <span className="text-[10px] text-[#C6A15B] font-mono">{order.customerEmail}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-mono text-xs">{order.items?.length} item(s)</span>
                    <p className="text-[10px] text-[#C5B8A8] line-clamp-1 max-w-xs">
                      {order.items?.map(i => i.name).join(', ')}
                    </p>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-[#C6A15B]">
                    ${order.total}
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#0F0D0C] border border-[#C6A15B]/30 text-[#DFBF7A]">
                      {order.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className="bg-[#0F0D0C] border border-[#C6A15B]/30 px-2 py-1 text-xs text-[#F3EEE5] focus:outline-none cursor-pointer"
                      >
                        {ORDER_STATUSES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>

                      <Link
                        to={`/order-tracking/${order.id}`}
                        className="p-1.5 text-[#C5B8A8] hover:text-[#C6A15B]"
                        title="View Live Timeline"
                      >
                        <Truck className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
