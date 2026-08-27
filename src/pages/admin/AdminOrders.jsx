import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { orderService, ORDER_STATUSES } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import { Search } from 'lucide-react';

export default function AdminOrders() {
  const { t } = useTranslation();
  const { success, error } = useToast();

  // Instant 0ms synchronous initialization
  const initialOrders = orderService.getAllOrdersSync({ search: '', status: 'ALL' });
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  const fetchOrders = () => {
    const list = orderService.getAllOrdersSync({
      search,
      status: statusFilter
    });
    setOrders(list);
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
    <div className="space-y-6 animate-fade-in text-[#F3E6D0]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4AF37]/20 pb-5 gap-4">
        <div>
          <h1 className="font-cinzel text-2xl sm:text-4xl font-bold uppercase tracking-wider text-[#F3E6D0]">
            {t('admin.orders')}
          </h1>
          <p className="text-xs sm:text-sm text-[#D8BE99] font-medium mt-1">
            Monitor fulfillment, update dispatch milestones, and inspect client invoices.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID, Patron, Tracking..."
            className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-2.5 text-sm text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer font-medium"
          >
            <option value="ALL">All Statuses</option>
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm sm:text-base font-sans">
            <thead>
              <tr className="border-b border-[#D4AF37]/25 text-[#F2D675] uppercase font-cinzel font-bold text-xs sm:text-sm">
                <th className="py-4 px-4">Order Ref</th>
                <th className="py-4 px-4">Patron & Destination</th>
                <th className="py-4 px-4">Flacons</th>
                <th className="py-4 px-4">Total</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Logistics Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/15 text-[#F3E6D0]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#D8BE99] font-medium text-sm">
                    No orders matched criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-cinzel font-bold text-base text-[#F2D675] block">
                        {order.id}
                      </span>
                      <span className="text-xs text-[#D8BE99] font-mono font-medium">
                        {new Date(order.date).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-[#F3E6D0] block text-sm sm:text-base">{order.customerName}</span>
                      <span className="text-xs sm:text-sm text-[#D8BE99] block font-medium">{order.shippingAddress?.city}, {order.shippingAddress?.country}</span>
                      <span className="text-xs text-[#F2D675] font-mono font-semibold">{order.customerEmail}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-mono text-sm text-[#F3E6D0] font-bold">{order.items?.length} item(s)</span>
                      <p className="text-xs text-[#D8BE99] line-clamp-1 max-w-xs font-medium">
                        {order.items?.map(i => i.name).join(', ')}
                      </p>
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-[#F2D675] text-base">
                      €{order.total}
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-3 py-1 text-xs font-mono uppercase rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F2D675] font-bold">
                        {order.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className="bg-black/70 border border-[#D4AF37]/35 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer font-medium"
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
    </div>
  );
}
