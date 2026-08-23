import React, { useState, useEffect } from 'react';
import ScrollReveal from '../../components/common/ScrollReveal';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { adminService } from '../../services/adminService';
import { orderService } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function AdminDashboard() {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const { success } = useToast();

  // Instant 0ms synchronous initialization
  const initialMetrics = adminService.getDashboardMetricsSync();
  const [metrics, setMetrics] = useState(initialMetrics);
  const [loading, setLoading] = useState(!initialMetrics);

  useEffect(() => {
    const data = adminService.getDashboardMetricsSync();
    if (data) {
      setMetrics(data);
      setLoading(false);
    }
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      const updated = adminService.getDashboardMetricsSync();
      setMetrics(updated);
      success(`Order #${orderId} updated to ${newStatus}.`);
    } catch (e) {
      console.error(e);
    }
  };

  if (!metrics) {
    return <div className="p-8 text-center text-xs text-[#D8BE99]">Aggregating Palace KPI metrics...</div>;
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-[#F3E6D0]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4AF37]/20 pb-4 gap-4">
        <div>
          <h1 className="font-cinzel text-xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
            {t('admin.dashboard')}
          </h1>
          <p className="text-[11px] sm:text-xs text-[#D8BE99] font-medium mt-0.5">
            Real-time revenue, olfactory vault logistics, and patron metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Link
            to="/admin/products/new"
            className="group/btn relative flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-white hover:text-black border border-[#F2D675]/50 font-cinzel font-bold text-[10px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition-all duration-300 overflow-hidden"
          >
            <Package className="w-3.5 h-3.5" />
            <span>{t('admin.addNewProduct')}</span>
          </Link>
          <Link
            to="/admin/discounts"
            className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-[#D4AF37]/40 bg-black/50 text-[10px] sm:text-xs font-cinzel font-bold text-[#F2D675] hover:border-[#D4AF37] hover:bg-[#21130D] text-center transition-all cursor-pointer"
          >
            {t('admin.createDiscount')}
          </Link>
        </div>
      </div>

      {/* KPI Cards in Obsidian Glass - 2 columns on phones, 5 on desktop */}
      <ScrollReveal direction="up">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Revenue */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-1 sm:space-y-2 shadow-xl backdrop-blur-md hover:border-[#D4AF37] transition-all">
          <div className="flex justify-between items-center text-[#F2D675]">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-cinzel font-bold truncate">
              {t('admin.totalRevenue')}
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="font-cinzel text-lg sm:text-2xl font-bold text-[#F3E6D0]">
            €<AnimatedCounter end={metrics.totalRevenue} />
          </p>
          <span className="text-[9px] sm:text-[10px] text-emerald-400 font-mono flex items-center gap-1 font-bold">
            <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>+18.4%</span>
          </span>
        </div>

        {/* Orders */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-1 sm:space-y-2 shadow-xl backdrop-blur-md hover:border-[#D4AF37] transition-all">
          <div className="flex justify-between items-center text-[#F2D675]">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-cinzel font-bold truncate">
              {t('admin.totalOrders')}
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="font-cinzel text-lg sm:text-2xl font-bold text-[#F3E6D0]">
            <AnimatedCounter end={metrics.totalOrders} />
          </p>
          <span className="text-[9px] sm:text-[10px] text-[#D8BE99] font-mono font-medium truncate block">
            {metrics.recentOrders.length} processed
          </span>
        </div>

        {/* Customers */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-1 sm:space-y-2 shadow-xl backdrop-blur-md hover:border-[#D4AF37] transition-all">
          <div className="flex justify-between items-center text-[#F2D675]">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-cinzel font-bold truncate">
              {t('admin.totalCustomers')}
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="font-cinzel text-lg sm:text-2xl font-bold text-[#F3E6D0]">
            <AnimatedCounter end={metrics.totalCustomers} />
          </p>
          <span className="text-[9px] sm:text-[10px] text-[#F2D675] font-mono font-bold truncate block">
            VIP Patrons
          </span>
        </div>

        {/* Active Products */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-1 sm:space-y-2 shadow-xl backdrop-blur-md hover:border-[#D4AF37] transition-all">
          <div className="flex justify-between items-center text-[#F2D675]">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-cinzel font-bold truncate">
              Formulations
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
              <Package className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="font-cinzel text-lg sm:text-2xl font-bold text-[#F3E6D0]">
            <AnimatedCounter end={metrics.totalProducts} />
          </p>
          <span className="text-[9px] sm:text-[10px] text-[#D8BE99] font-mono font-medium truncate block">
            5 Families
          </span>
        </div>

        {/* Low Stock Alerts (Full width on 2-column mobile grid) */}
        <div className="col-span-2 md:col-span-1 p-3.5 sm:p-5 rounded-2xl bg-[#0B0A08]/90 border border-rose-500/40 space-y-1 sm:space-y-2 shadow-xl backdrop-blur-md">
          <div className="flex justify-between items-center text-rose-400 font-bold">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-cinzel font-bold">
              {t('admin.lowStockAlerts')}
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-rose-500/40 bg-rose-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="font-cinzel text-lg sm:text-2xl font-bold text-rose-400">
              <AnimatedCounter end={metrics.lowStockCount} />
            </p>
            <Link to="/admin/inventory" className="text-[10px] text-[#F2D675] font-bold hover:underline font-mono">
              Inspect →
            </Link>
          </div>
        </div>
      </div>
      </ScrollReveal>

      {/* Analytics Charts & Family Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Monthly Revenue Bar Chart */}
        <ScrollReveal direction="left" className="lg:col-span-8">
        <div className="p-4 sm:p-6 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-4 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between border-b border-[#D4AF37]/20 pb-3 gap-1">
            <h3 className="font-cinzel text-xs sm:text-sm font-bold uppercase text-[#F2D675] tracking-wider">
              Revenue Growth Trajectory (EUR)
            </h3>
            <span className="text-[10px] sm:text-[11px] text-[#D8BE99] font-mono font-medium">6-Month Atelier Velocity</span>
          </div>

          <div className="h-44 sm:h-56 flex items-end justify-between gap-2 sm:gap-3 pt-4 sm:pt-6 px-1 sm:px-2">
            {metrics.monthlyRevenue.map((m) => {
              const heightPercent = Math.min(100, Math.round((m.revenue / 60000) * 100));
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 sm:gap-2 group min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-mono text-[#F2D675] opacity-0 group-hover:opacity-100 transition-opacity font-bold truncate">
                    €{(m.revenue / 1000).toFixed(1)}k
                  </span>
                  <div className="w-full bg-black/60 h-32 sm:h-40 flex items-end border border-[#D4AF37]/20 rounded-t-lg overflow-hidden">
                    <div
                      className="w-full bg-gradient-to-t from-[#8C6239] via-[#B8860B] to-[#F2D675] transition-all duration-700 hover:brightness-125"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs font-mono text-[#D8BE99] font-medium truncate">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>
        </ScrollReveal>

        {/* Fragrance Family Composition */}
        <div className="lg:col-span-4 p-4 sm:p-6 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-4 shadow-2xl backdrop-blur-md">
          <h3 className="font-cinzel text-xs sm:text-sm font-bold uppercase text-[#F2D675] border-b border-[#D4AF37]/20 pb-3 tracking-wider">
            Olfactory Family Allocation
          </h3>
          <div className="space-y-3 pt-1 text-xs font-sans">
            {metrics.familyDistribution.map((fam) => (
              <div key={fam.name} className="space-y-1">
                <div className="flex justify-between text-[#F3E6D0] font-medium text-[11px] sm:text-xs">
                  <span className="truncate mr-2">{fam.name}</span>
                  <span className="font-mono text-[#F2D675] font-bold shrink-0">{fam.count} ({fam.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-[#D4AF37]/20">
                  <div
                    className="h-full bg-gradient-to-r from-[#8C6239] via-[#D4AF37] to-[#F2D675]"
                    style={{ width: `${fam.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders - Responsive Mobile Cards + Desktop Table */}
      <ScrollReveal direction="right">
      <div className="p-4 sm:p-6 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-4 shadow-2xl backdrop-blur-md">
        <div className="flex justify-between items-center border-b border-[#D4AF37]/20 pb-3">
          <h3 className="font-cinzel text-xs sm:text-sm font-bold uppercase text-[#F2D675] tracking-wider">
            {t('admin.recentOrders')}
          </h3>
          <Link to="/admin/orders" className="text-xs text-[#D8BE99] hover:text-[#F2D675] font-bold flex items-center gap-1 cursor-pointer transition-colors">
            <span>Manage All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile View: High-End Order Cards (Hidden on md+) */}
        <div className="block md:hidden space-y-3">
          {metrics.recentOrders.map((order) => (
            <div
              key={order.id}
              className="p-3.5 rounded-xl border border-[#D4AF37]/25 bg-black/50 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-cinzel font-bold text-[#F2D675] text-xs">
                  {order.id}
                </span>
                <span className="font-mono font-bold text-[#F2D675] text-sm">
                  €{order.total}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#D8BE99]">
                <span className="font-medium text-[#F3E6D0]">{order.customerName}</span>
                <span className="font-mono">{new Date(order.date).toLocaleDateString()}</span>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 text-[9px] font-mono uppercase rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F2D675] font-bold">
                  {order.status}
                </span>

                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="bg-black/80 border border-[#D4AF37]/40 rounded-lg px-2.5 py-1 text-[11px] text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer font-medium"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Full Table (Hidden on small screens) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#D4AF37]/25 text-[#F2D675] uppercase font-cinzel font-bold">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Patron</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Total</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/15 text-[#F3E6D0]">
              {metrics.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-3 font-cinzel font-bold text-[#F2D675]">{order.id}</td>
                  <td className="py-3.5 px-3 font-medium">{order.customerName}</td>
                  <td className="py-3.5 px-3 font-mono text-[#D8BE99] font-medium">{new Date(order.date).toLocaleDateString()}</td>
                  <td className="py-3.5 px-3 font-mono font-bold text-[#F2D675]">€{order.total}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F2D675] font-bold">
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="bg-black/70 border border-[#D4AF37]/35 rounded-lg px-2.5 py-1 text-[11px] text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer font-medium"
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
      </ScrollReveal>
    </div>
  );
}
