import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { ShoppingBag, ArrowRight, Truck, ExternalLink } from 'lucide-react';

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
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-[#C6A15B]/20 pb-3">
        <h2 className="font-cinzel text-xl font-bold uppercase text-[#F3EEE5]">
          {t('account.orders')}
        </h2>
        <span className="text-xs text-[#C5B8A8] font-mono">{orders.length} orders total</span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-[#C5B8A8]">Retrieving purchase archives...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-[#241712] border border-[#C6A15B]/15 space-y-3">
          <ShoppingBag className="w-10 h-10 text-[#C6A15B] mx-auto opacity-50" />
          <h3 className="font-cinzel text-base text-[#F3EEE5]">{t('account.noOrders')}</h3>
          <p className="text-xs text-[#C5B8A8] max-w-xs mx-auto">
            Your collection awaits its first masterpiece. Discover the royal flacon catalog.
          </p>
          <Link to="/shop" className="luxury-btn-gold px-6 py-2.5 text-xs inline-block">
            {t('cart.startShopping')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-5 bg-[#241712] border border-[#C6A15B]/20 space-y-4 shadow-lg"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#C6A15B]/15 pb-3 gap-2">
                <div>
                  <span className="font-cinzel font-bold text-base text-[#F3EEE5] block">
                    {order.id}
                  </span>
                  <span className="text-xs text-[#C5B8A8]">
                    Placed on {new Date(order.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono px-2.5 py-1 bg-[#0F0D0C] border border-[#C6A15B]/30 text-[#C6A15B]">
                    {order.status}
                  </span>
                  <span className="font-cinzel text-lg font-bold text-[#C6A15B]">
                    ${order.total}
                  </span>
                </div>
              </div>

              {/* Items Thumbnails */}
              <div className="flex flex-wrap gap-3">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#1C120E] border border-[#C6A15B]/10 p-2 pr-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-14 object-cover bg-[#0F0D0C]"
                    />
                    <div className="text-xs">
                      <p className="font-cinzel font-semibold text-[#F3EEE5]">{item.name}</p>
                      <p className="text-[11px] text-[#C5B8A8] font-mono">{item.size} • Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Links */}
              <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#C6A15B]/10 gap-3 text-xs">
                <Link
                  to={`/order-tracking/${order.id}`}
                  className="text-[#C6A15B] hover:underline flex items-center gap-1.5 font-cinzel"
                >
                  <Truck className="w-4 h-4" />
                  <span>{t('confirmation.trackOrder')}</span>
                </Link>

                <button
                  onClick={() => navigate(`/account/orders/${order.id}`)}
                  className="luxury-btn-outline px-4 py-1.5 text-xs flex items-center gap-1"
                >
                  <span>Order Invoice & Details</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
