import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../../components/common/ScrollReveal';

export default function AccountOrders() {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
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
    load();
  }, [user]);

  return (
    <div className="space-y-6 animate-fade-in text-[var(--color-earth-dark)]">
      <ScrollReveal direction="up">
        <div className="flex justify-between items-center border-b border-[var(--color-terracotta-deep)]/20 pb-3">
          <h2 className="font-cinzel text-xl font-bold uppercase text-[var(--color-earth-dark)]">
            {t('account.orders')}
          </h2>
          <span className="text-xs text-[var(--color-terracotta-deep)] font-mono font-semibold">{orders.length} orders total</span>
        </div>
      </ScrollReveal>

      {loading ? (
        <div className="text-center py-12 text-xs text-[var(--color-terracotta-deep)] font-medium">Retrieving purchase archives...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-[var(--color-desert-primary)]/20 border border-[var(--color-terracotta-deep)]/20 space-y-3">
          <ShoppingBag className="w-10 h-10 text-[var(--color-terracotta)] mx-auto opacity-70" />
          <h3 className="font-cinzel text-base font-bold text-[var(--color-earth-dark)]">{t('account.noOrders')}</h3>
          <p className="text-xs text-[var(--color-terracotta-deep)] max-w-xs mx-auto font-medium">
            Your collection awaits its first masterpiece. Discover the royal flacon catalog.
          </p>
          <Link to="/shop" className="luxury-btn-gold px-6 py-2.5 text-xs inline-block cursor-pointer">
            {t('cart.startShopping')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <ScrollRevealItem key={order.id} index={index}>
            <div
              className="p-5 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 space-y-4 shadow-sm"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--color-terracotta-deep)]/20 pb-3 gap-2">
                <div>
                  <span className="font-cinzel font-bold text-base text-[var(--color-earth-dark)] block">
                    {order.id}
                  </span>
                  <span className="text-xs text-[var(--color-terracotta-deep)] font-medium">
                    Placed on {new Date(order.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono px-2.5 py-1 bg-[var(--color-desert-light)] border border-[var(--color-terracotta)]/40 text-[var(--color-terracotta)] font-bold">
                    {order.status}
                  </span>
                  <span className="font-cinzel text-lg font-bold text-[var(--color-terracotta)]">
                    ${order.total}
                  </span>
                </div>
              </div>

              {/* Items Thumbnails */}
              <div className="flex flex-wrap gap-3">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/20 p-2 pr-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-14 object-cover bg-[var(--color-desert-primary)] border border-[var(--color-terracotta-deep)]/30"
                    />
                    <div className="text-xs">
                      <p className="font-cinzel font-bold text-[var(--color-earth-dark)]">{item.name}</p>
                      <p className="text-[11px] text-[var(--color-terracotta-deep)] font-mono font-medium">{item.size} • Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Links */}
              <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[var(--color-terracotta-deep)]/20 gap-3 text-xs">
                <Link
                  to={`/order-tracking/${order.id}`}
                  className="text-[var(--color-terracotta)] font-bold hover:underline flex items-center gap-1.5 font-cinzel"
                >
                  <Truck className="w-4 h-4" />
                  <span>{t('confirmation.trackOrder')}</span>
                </Link>

                <button
                  onClick={() => navigate(`/account/orders/${order.id}`)}
                  className="luxury-btn-outline px-4 py-1.5 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>Order Invoice & Details</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
            </ScrollRevealItem>
          ))}
        </div>
      )}
    </div>
  );
}
