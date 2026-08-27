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
      <div className="border-b border-[#3A2116]/40 pb-5">
        <h2 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
          Patron Profile Overview
        </h2>
        <p className="text-xs sm:text-sm text-[#D8BE99] mt-1">
          Manage your personal acquisitions, shipping addresses, and bespoke preferences.
        </p>
      </div>

      {/* Quick Stat Cards in Obsidian Glass with Gold Medallions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-2.5 shadow-xl backdrop-blur-md hover:border-[#D4AF37] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-cinzel font-bold uppercase tracking-wider text-[#D8BE99]">Total Acquisitions</span>
            <div className="w-10 h-10 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center text-[#F2D675] shadow-inner">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F3E6D0]">4 Flacons</p>
          <span className="text-xs text-[#D8BE99] block font-mono">€260 lifetime value</span>
        </div>

        <div className="p-6 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-2.5 shadow-xl backdrop-blur-md hover:border-[#D4AF37] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-cinzel font-bold uppercase tracking-wider text-[#D8BE99]">Vault Wishlist</span>
            <div className="w-10 h-10 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center text-[#F2D675] shadow-inner">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <p className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F3E6D0]">{wishlistCount} Creations</p>
          <Link to="/account/wishlist" className="text-xs text-[#F2D675] hover:underline font-semibold flex items-center gap-1.5">
            <span>View Wishlist</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-2.5 shadow-xl backdrop-blur-md hover:border-[#D4AF37] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-cinzel font-bold uppercase tracking-wider text-[#D8BE99]">Palace Privilege Tier</span>
            <div className="w-10 h-10 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center text-[#F2D675] shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <p className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F2D675]">Sovereign Gold</p>
          <span className="text-xs text-emerald-400 font-medium block">Complimentary DHL Air on all orders</span>
        </div>
      </div>

      {/* Recent Acquisitions Section */}
      <div className="space-y-4 pt-6 border-t border-[#D4AF37]/20">
        <div className="flex items-center justify-between">
          <h3 className="font-cinzel text-base sm:text-lg font-bold uppercase text-[#F2D675] tracking-wider">
            Recent Acquisitions
          </h3>
          <Link to="/account/orders" className="text-xs sm:text-sm text-[#D8BE99] hover:text-[#F2D675] flex items-center gap-1.5 font-cinzel uppercase tracking-wider font-bold transition-colors">
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3.5">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="p-5 sm:p-6 rounded-xl bg-[#0B0A08]/90 border border-[#D4AF37]/25 hover:border-[#D4AF37]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl transition-all"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-cinzel font-bold text-base sm:text-lg text-[#F3E6D0]">{order.id}</span>
                  <span className="px-3 py-0.5 text-xs font-mono rounded-full bg-[#D4AF37]/20 text-[#F2D675] border border-[#D4AF37]/35 font-bold">
                    {order.tier} Tier
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-[#D8BE99] mt-1.5 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                  <span>Placed on {order.date}</span>
                  <span>•</span>
                  <span>{order.itemsCount} item(s)</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-5">
                <span className="font-cinzel font-bold text-[#F2D675] text-lg sm:text-xl">
                  €{order.total.toFixed(2)}
                </span>
                <span className={`px-3.5 py-1 text-xs font-mono uppercase tracking-wider rounded-full font-bold ${
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
