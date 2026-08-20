import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { orderService, ORDER_STATUSES } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import { Search } from 'lucide-react';

export default function AdminOrders() {
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
    <div className="space-y-6 animate-fade-in text-[var(--color-earth-dark)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--color-terracotta-deep)]/20 pb-4 gap-4">
        <div>
          <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider text-[var(--color-earth-dark)]">
            {t('admin.orders')}
          </h1>
          <p className="text-xs text-[var(--color-terracotta-deep)] font-medium">
            Monitor fulfillment, update dispatch milestones, and inspect client invoices.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID, Patron, Tracking..."
            className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 pl-9 pr-3 py-2 text-xs text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[var(--color-terracotta)] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 px-3 py-2 text-xs text-[var(--color-earth-dark)] focus:border-[var(--color-terracotta)] focus:outline-none cursor-pointer font-medium"
          >
            <option value="ALL">All Statuses</option>
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[var(--color-terracotta-deep)]/20 text-[var(--color-terracotta)] uppercase font-cinzel font-bold">
              <th className="py-3 px-4">Order Ref</th>
              <th className="py-3 px-4">Patron & Destination</th>
              <th className="py-3 px-4">Flacons</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Logistics Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-terracotta-deep)]/15 text-[var(--color-earth-dark)]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[var(--color-terracotta-deep)] font-medium">
                  Loading logistics ledger...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[var(--color-terracotta-deep)] font-medium">
                  No orders matched criteria.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-[var(--color-desert-primary)]/20 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-cinzel font-bold text-sm text-[var(--color-terracotta)] block">
                      {order.id}
                    </span>
                    <span className="text-[10px] text-[var(--color-terracotta-deep)] font-mono font-medium">
                      {new Date(order.date).toLocaleDateString()}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-[var(--color-earth-dark)] block">{order.customerName}</span>
                    <span className="text-[11px] text-[var(--color-terracotta-deep)] block font-medium">{order.shippingAddress?.city}, {order.shippingAddress?.country}</span>
                    <span className="text-[10px] text-[var(--color-terracotta)] font-mono font-semibold">{order.customerEmail}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-mono text-xs text-[var(--color-earth-dark)] font-bold">{order.items?.length} item(s)</span>
                    <p className="text-[10px] text-[var(--color-terracotta-deep)] line-clamp-1 max-w-xs font-medium">
                      {order.items?.map(i => i.name).join(', ')}
                    </p>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-[var(--color-terracotta)]">
                    ${order.total}
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[var(--color-desert-light)] border border-[var(--color-terracotta)]/40 text-[var(--color-terracotta)] font-bold">
                      {order.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className="bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 px-2 py-1 text-[11px] text-[var(--color-earth-dark)] focus:border-[var(--color-terracotta)] focus:outline-none cursor-pointer font-medium"
                    >
                      {ORDER_STATUSES.map(st => (
                        <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
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
