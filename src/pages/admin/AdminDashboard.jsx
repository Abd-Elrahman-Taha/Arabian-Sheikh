import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { adminService } from '../../services/adminService';
import { orderService } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Flame,
  CheckCircle2
} from 'lucide-react';

export default function AdminDashboard() {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const { success } = useToast();

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await adminService.getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      const updated = await adminService.getDashboardMetrics();
      setMetrics(updated);
      success(`Order #${orderId} updated to ${newStatus}.`);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !metrics) {
    return <div className="p-8 text-center text-xs text-[#C5B8A8]">Aggregating Palace KPI metrics...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in text-[#F3EEE5]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#C6A15B]/20 pb-4 gap-4">
        <div>
          <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider">
            {t('admin.dashboard')}
          </h1>
          <p className="text-xs text-[#C5B8A8]">
            Real-time revenue, olfactory vault logistics, and patron metrics.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/admin/products/new"
            className="luxury-btn-gold px-4 py-2 text-xs flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5" />
            <span>{t('admin.addNewProduct')}</span>
          </Link>
          <Link
            to="/admin/discounts"
            className="luxury-btn-outline px-4 py-2 text-xs"
          >
            {t('admin.createDiscount')}
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Revenue */}
        <div className="p-5 bg-[#1C120E] border border-[#C6A15B]/30 space-y-2 shadow-lg">
          <div className="flex justify-between items-center text-[#C6A15B]">
            <span className="text-[11px] uppercase tracking-wider font-cinzel font-semibold">
              {t('admin.totalRevenue')}
            </span>
            <DollarSign className="w-4 h-4" />
          </div>
          <p className="font-cinzel text-2xl font-bold text-[#F3EEE5]">
            ${metrics.totalRevenue.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% vs last month</span>
          </span>
        </div>

        {/* Orders */}
        <div className="p-5 bg-[#1C120E] border border-[#C6A15B]/30 space-y-2 shadow-lg">
          <div className="flex justify-between items-center text-[#C6A15B]">
            <span className="text-[11px] uppercase tracking-wider font-cinzel font-semibold">
              {t('admin.totalOrders')}
            </span>
            <ShoppingBag className="w-4 h-4" />
          </div>
          <p className="font-cinzel text-2xl font-bold text-[#F3EEE5]">
            {metrics.totalOrders}
          </p>
          <span className="text-[10px] text-[#C5B8A8] font-mono">
            {metrics.recentOrders.length} processed today
          </span>
        </div>

        {/* Customers */}
        <div className="p-5 bg-[#1C120E] border border-[#C6A15B]/30 space-y-2 shadow-lg">
          <div className="flex justify-between items-center text-[#C6A15B]">
            <span className="text-[11px] uppercase tracking-wider font-cinzel font-semibold">
              {t('admin.totalCustomers')}
            </span>
            <Users className="w-4 h-4" />
          </div>
          <p className="font-cinzel text-2xl font-bold text-[#F3EEE5]">
            {metrics.totalCustomers}
          </p>
          <span className="text-[10px] text-[#DFBF7A] font-mono">
            Royal VIP Patrons
          </span>
        </div>

        {/* Active Products */}
        <div className="p-5 bg-[#1C120E] border border-[#C6A15B]/30 space-y-2 shadow-lg">
          <div className="flex justify-between items-center text-[#C6A15B]">
            <span className="text-[11px] uppercase tracking-wider font-cinzel font-semibold">
              Flacon Formulations
            </span>
            <Package className="w-4 h-4" />
          </div>
          <p className="font-cinzel text-2xl font-bold text-[#F3EEE5]">
            {metrics.totalProducts}
          </p>
          <span className="text-[10px] text-[#C5B8A8] font-mono">
            Across 5 Fragrance Families
          </span>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-5 bg-[#1C120E] border border-red-500/30 space-y-2 shadow-lg">
          <div className="flex justify-between items-center text-red-400">
            <span className="text-[11px] uppercase tracking-wider font-cinzel font-semibold">
              {t('admin.lowStockAlerts')}
            </span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="font-cinzel text-2xl font-bold text-red-400">
            {metrics.lowStockCount}
          </p>
          <Link to="/admin/inventory" className="text-[10px] text-[#C6A15B] hover:underline font-mono block">
            Inspect inventory →
          </Link>
        </div>
      </div>

      {/* Analytics Charts & Family Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Monthly Revenue Bar Chart */}
        <div className="lg:col-span-8 p-6 bg-[#1C120E] border border-[#C6A15B]/20 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-[#C6A15B]/15 pb-2">
            <h3 className="font-cinzel text-sm font-bold uppercase text-[#C6A15B]">
              Revenue Growth Trajectory (USD)
            </h3>
            <span className="text-[11px] text-[#C5B8A8] font-mono">Simulated 6-Month Velocity</span>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2">
            {metrics.monthlyRevenue.map((m) => {
              const heightPercent = Math.min(100, Math.round((m.revenue / 60000) * 100));
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-[#C6A15B] opacity-0 group-hover:opacity-100 transition-opacity">
                    ${(m.revenue / 1000).toFixed(1)}k
                  </span>
                  <div className="w-full bg-[#241712] h-40 flex items-end">
                    <div
                      className="w-full bg-gold-gradient transition-all duration-700 hover:brightness-110"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-[#C5B8A8]">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fragrance Family Composition */}
        <div className="lg:col-span-4 p-6 bg-[#1C120E] border border-[#C6A15B]/20 space-y-4 shadow-xl">
          <h3 className="font-cinzel text-sm font-bold uppercase text-[#C6A15B] border-b border-[#C6A15B]/15 pb-2">
            Olfactory Family Allocation
          </h3>
          <div className="space-y-3 pt-2 text-xs font-sans">
            {metrics.familyDistribution.map((fam) => (
              <div key={fam.name} className="space-y-1">
                <div className="flex justify-between text-[#F3EEE5]">
                  <span>{fam.name}</span>
                  <span className="font-mono text-[#C6A15B]">{fam.count} flacons ({fam.percentage}%)</span>
                </div>
                <div className="w-full h-1.5 bg-[#0F0D0C] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold-gradient"
                    style={{ width: `${fam.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="p-6 bg-[#1C120E] border border-[#C6A15B]/20 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-[#C6A15B]/15 pb-2">
          <h3 className="font-cinzel text-sm font-bold uppercase text-[#F3EEE5]">
            {t('admin.recentOrders')}
          </h3>
          <Link to="/admin/orders" className="text-xs text-[#C6A15B] hover:underline flex items-center gap-1">
            <span>Manage All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#C6A15B]/20 text-[#C6A15B] uppercase font-cinzel">
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Patron</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Total</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C6A15B]/10 text-[#F3EEE5]">
              {metrics.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#241712] transition-colors">
                  <td className="py-3 px-3 font-cinzel font-bold text-[#C6A15B]">{order.id}</td>
                  <td className="py-3 px-3">{order.customerName}</td>
                  <td className="py-3 px-3 font-mono text-[#C5B8A8]">{new Date(order.date).toLocaleDateString()}</td>
                  <td className="py-3 px-3 font-mono font-bold">${order.total}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#0F0D0C] border border-[#C6A15B]/30 text-[#DFBF7A]">
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="bg-[#0F0D0C] border border-[#C6A15B]/30 px-2 py-1 text-[11px] text-[#F3EEE5] focus:outline-none cursor-pointer"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
