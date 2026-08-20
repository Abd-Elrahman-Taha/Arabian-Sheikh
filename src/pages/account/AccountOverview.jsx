import React from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import {
  ShoppingBag,
  Heart,
  MapPin,
  CreditCard,
  ArrowRight,
  Clock,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function AccountOverview() {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { wishlistCount } = useWishlist();

  const recentOrders = [
    {
      id: 'ORD-98214',
      date: '2026-08-14',
      total: 120.00,
      status: 'DELIVERED',
      itemsCount: 2,
      tier: 'Luxury'
    },
    {
      id: 'ORD-97450',
      date: '2026-07-28',
      total: 50.00,
      status: 'IN_TRANSIT',
      itemsCount: 1,
      tier: 'Royal'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in text-[#F3E6D0]">
      {/* Header */}
      <div className="border-b border-[#3A2116]/40 pb-4">
        <h2 className="font-cinzel text-xl font-bold uppercase tracking-wider text-[#F3E6D0]">
          Patron Profile Overview
        </h2>
        <p className="text-xs text-[#D8BE99]">
          Manage your personal acquisitions, shipping addresses, and bespoke preferences.
        </p>
      </div>

      {/* Quick Stat Cards in Dark Brown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-[#21130D] border border-[#3A2116]/60 space-y-1">
          <div className="flex items-center justify-between text-[#D4AF37]">
            <span className="text-[11px] font-cinzel uppercase tracking-wider">Total Acquisitions</span>
            <ShoppingBag className="w-4 h-4" />
          </div>
          <p className="font-cinzel text-2xl font-bold text-[#F3E6D0]">4 Flacons</p>
          <span className="text-[10px] text-[#D8BE99]">€260 lifetime value</span>
        </div>

        <div className="p-5 bg-[#21130D] border border-[#3A2116]/60 space-y-1">
          <div className="flex items-center justify-between text-[#D4AF37]">
            <span className="text-[11px] font-cinzel uppercase tracking-wider">Vault Wishlist</span>
            <Heart className="w-4 h-4" />
          </div>
          <p className="font-cinzel text-2xl font-bold text-[#F3E6D0]">{wishlistCount} Creations</p>
          <Link to="/account/wishlist" className="text-[10px] text-[#D4AF37] hover:underline">
            View Wishlist
          </Link>
        </div>

        <div className="p-5 bg-[#21130D] border border-[#3A2116]/60 space-y-1">
          <div className="flex items-center justify-between text-[#D4AF37]">
            <span className="text-[11px] font-cinzel uppercase tracking-wider">Palace Privilege Tier</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="font-cinzel text-2xl font-bold text-[#D4AF37]">Sovereign Gold</p>
          <span className="text-[10px] text-emerald-400">Complimentary DHL Air on all orders</span>
        </div>
      </div>

      {/* Recent Acquisitions Section */}
      <div className="space-y-4 pt-4 border-t border-[#3A2116]/40">
        <div className="flex items-center justify-between">
          <h3 className="font-cinzel text-sm font-bold uppercase text-[#D4AF37] tracking-wider">
            Recent Acquisitions
          </h3>
          <Link to="/account/orders" className="text-xs text-[#D8BE99] hover:text-[#D4AF37] flex items-center gap-1 font-cinzel uppercase tracking-wider">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="p-4 bg-[#21130D] border border-[#3A2116]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-cinzel font-bold text-[#F3E6D0]">{order.id}</span>
                  <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                    {order.tier} Tier
                  </span>
                </div>
                <div className="text-[11px] text-[#D8BE99] mt-0.5 flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>Placed on {order.date}</span>
                  <span>•</span>
                  <span>{order.itemsCount} item(s)</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <span className="font-cinzel font-bold text-[#D4AF37] text-sm">
                  €{order.total.toFixed(2)}
                </span>
                <span className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider ${
                  order.status === 'DELIVERED'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
