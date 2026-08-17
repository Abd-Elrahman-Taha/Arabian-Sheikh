import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { useWishlist } from '../../context/WishlistContext';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import {
  ShoppingBag,
  DollarSign,
  Heart,
  ArrowRight
} from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../../components/common/ScrollReveal';

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
    <div className="space-y-8 animate-fade-in text-[var(--text-primary)]">
      <ScrollReveal direction="up">
        <h2 className="font-cinzel text-xl font-bold uppercase text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-3">
          {t('account.dashboard')}
        </h2>
      </ScrollReveal>

      {/* KPI Metrics */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-card)] space-y-1 shadow-sm">
          <div className="flex justify-between items-center text-[var(--gold-primary)]">
            <span className="text-xs uppercase tracking-wider font-cinzel font-semibold">Total Orders</span>
            <ShoppingBag className="w-4 h-4" />
          </div>
          <p className="font-cinzel text-2xl font-bold text-[var(--text-primary)]">
            <AnimatedCounter end={orders.length} />
          </p>
        </div>

        <div className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-card)] space-y-1 shadow-sm">
          <div className="flex justify-between items-center text-[var(--gold-primary)]">
            <span className="text-xs uppercase tracking-wider font-cinzel font-semibold">Total Invested</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <p className="font-cinzel text-2xl font-bold text-[var(--gold-primary)]">
            $<AnimatedCounter end={totalSpent} />
          </p>
        </div>

        <div className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-card)] space-y-1 shadow-sm">
          <div className="flex justify-between items-center text-[var(--gold-primary)]">
            <span className="text-xs uppercase tracking-wider font-cinzel font-semibold">{t('account.savedItems')}</span>
            <Heart className="w-4 h-4" />
          </div>
          <p className="font-cinzel text-2xl font-bold text-[var(--text-primary)]">
            <AnimatedCounter end={wishlistCount} />
          </p>
        </div>
      </div>
      </ScrollReveal>

      {/* Recent Orders Section */}
      <ScrollReveal direction="up" delay={0.2}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-cinzel text-base font-bold uppercase text-[var(--text-primary)]">
            {t('account.recentOrders')}
          </h3>
          <Link to="/account/orders" className="text-xs text-[var(--gold-primary)] hover:underline flex items-center gap-1">
            <span>{t('account.viewAll')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[var(--text-muted)]">Loading palace transactions...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center space-y-3">
            <ShoppingBag className="w-8 h-8 text-[var(--gold-primary)] mx-auto opacity-50" />
            <p className="text-xs text-[var(--text-muted)]">{t('account.noOrders')}</p>
            <Link to="/shop" className="luxury-btn-gold px-5 py-2 text-xs inline-block cursor-pointer">
              {t('cart.startShopping')}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((order, index) => (
              <ScrollRevealItem key={order.id} index={index}>
              <div
                onClick={() => navigate(`/account/orders/${order.id}`)}
                className="cursor-pointer p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--gold-primary)] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-cinzel font-bold text-sm text-[var(--text-primary)]">
                      {order.id}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-[var(--bg-card)] border border-[var(--border-gold-subtle)] text-[var(--gold-primary)] font-mono font-semibold">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    {new Date(order.date).toLocaleDateString()} • {order.items?.length} flacon(s)
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="font-cinzel text-base font-bold text-[var(--gold-primary)]">
                    ${order.total}
                  </span>
                  <span className="text-xs text-[var(--gold-primary)] uppercase font-cinzel flex items-center gap-1">
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
              </ScrollRevealItem>
            ))}
          </div>
        )}
      </div>
      </ScrollReveal>
    </div>
  );
}
