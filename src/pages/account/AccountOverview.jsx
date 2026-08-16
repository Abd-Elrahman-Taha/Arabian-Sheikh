import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { useWishlist } from '../../context/WishlistContext';
import {
  ShoppingBag,
  DollarSign,
  Heart,
  Truck,
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react';

export default function AccountOverview() {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { wishlistCount } = useWishlist();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (!user) return;
      try {
        const userOrders = await orderService.getOrdersByUser(user.id);
        setOrders(userOrders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [user]);

  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="font-cinzel text-xl font-bold uppercase text-[#F3EEE5] border-b border-[#C6A15B]/20 pb-3">
        {t('account.dashboard')}
      </h2>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-[#241712] border border-[#C6A15B]/20 space-y-1">
          <div className="flex justify-between items-center text-[#C6A15B]">
            <span className="text-xs uppercase tracking-wider font-cinzel font-semibold">Total Orders</span>
            <ShoppingBag className="w-4 h-4" />
          </div>
          <p className="font-cinzel text-2xl font-bold text-[#F3EEE5]">
            {orders.length}
          </p>
        </div>

        <div className="p-5 bg-[#241712] border border-[#C6A15B]/20 space-y-1">
          <div className="flex justify-between items-center text-[#C6A15B]">
            <span className="text-xs uppercase tracking-wider font-cinzel font-semibold">Total Invested</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <p className="font-cinzel text-2xl font-bold text-[#F3EEE5]">
            ${totalSpent}
          </p>
        </div>

        <div className="p-5 bg-[#241712] border border-[#C6A15B]/20 space-y-1">
          <div className="flex justify-between items-center text-[#C6A15B]">
            <span className="text-xs uppercase tracking-wider font-cinzel font-semibold">{t('account.savedItems')}</span>
            <Heart className="w-4 h-4" />
          </div>
          <p className="font-cinzel text-2xl font-bold text-[#F3EEE5]">
            {wishlistCount}
          </p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-cinzel text-base font-bold uppercase text-[#F3EEE5]">
            {t('account.recentOrders')}
          </h3>
          <Link to="/account/orders" className="text-xs text-[#C6A15B] hover:underline flex items-center gap-1">
            <span>{t('account.viewAll')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[#C5B8A8]">Loading palace transactions...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 bg-[#241712] border border-[#C6A15B]/15 text-center space-y-3">
            <ShoppingBag className="w-8 h-8 text-[#C6A15B] mx-auto opacity-50" />
            <p className="text-xs text-[#C5B8A8]">{t('account.noOrders')}</p>
            <Link to="/shop" className="luxury-btn-gold px-5 py-2 text-xs inline-block">
              {t('cart.startShopping')}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/account/orders/${order.id}`)}
                className="cursor-pointer p-4 bg-[#241712] border border-[#C6A15B]/15 hover:border-[#C6A15B]/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-cinzel font-bold text-sm text-[#F3EEE5]">
                      {order.id}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-[#0F0D0C] border border-[#C6A15B]/30 text-[#C6A15B] font-mono">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#C5B8A8]">
                    {new Date(order.date).toLocaleDateString()} • {order.items?.length} flacon(s)
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="font-cinzel text-base font-bold text-[#C6A15B]">
                    ${order.total}
                  </span>
                  <span className="text-xs text-[#C6A15B] uppercase font-cinzel flex items-center gap-1">
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
