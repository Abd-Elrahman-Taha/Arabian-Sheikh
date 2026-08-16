import React from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  ShieldAlert,
  Crown
} from 'lucide-react';

export default function AccountLayout({ children }) {
  const { currentPath, navigate } = useRouter();
  const { t } = useTranslation();
  const { user, logout, isAdmin } = useAuth();
  const { wishlistCount } = useWishlist();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/account', label: t('account.dashboard'), icon: User },
    { to: '/account/orders', label: t('account.orders'), icon: ShoppingBag },
    { to: '/account/wishlist', label: t('account.wishlist'), icon: Heart, count: wishlistCount },
    { to: '/account/addresses', label: t('account.addresses'), icon: MapPin },
    { to: '/account/payment-methods', label: t('account.paymentMethods'), icon: CreditCard },
    { to: '/account/settings', label: t('account.settings'), icon: Settings }
  ];

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in text-[#F3EEE5]">
      {/* Account Hero Bar */}
      <div className="bg-[#1C120E] border border-[#C6A15B]/30 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-none border-2 border-[#C6A15B] bg-[#0F0D0C] flex items-center justify-center text-[#C6A15B] font-cinzel text-2xl font-bold">
            {user?.name ? user.name.charAt(0) : 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cinzel text-xl sm:text-2xl font-bold uppercase">
                {t('account.welcome', { name: user?.name || 'Distinguished Patron' })}
              </h1>
              {isAdmin && (
                <span className="bg-[#C6A15B] text-[#0F0D0C] font-cinzel text-[10px] font-bold px-2 py-0.5 uppercase">
                  Palace Admin
                </span>
              )}
            </div>
            <p className="text-xs text-[#C5B8A8] mt-0.5">
              {t('account.memberSince', { date: user?.memberSince || '2025' })}
            </p>
            <p className="text-xs text-[#C6A15B] font-semibold mt-1 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" />
              <span>{t('account.tier')}</span>
            </p>
          </div>
        </div>

        {isAdmin && (
          <Link
            to="/admin"
            className="luxury-btn-gold px-6 py-2.5 text-xs flex items-center gap-2 shadow"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Open Admin Suite</span>
          </Link>
        )}
      </div>

      {/* Account Main Grid: Sidebar + Subpage Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 bg-[#1C120E] border border-[#C6A15B]/20 p-4 space-y-1 shadow-xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentPath === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center justify-between px-4 py-3 text-xs font-cinzel uppercase tracking-wider transition-all border ${
                  isActive
                    ? 'border-[#C6A15B] bg-[#2B1A12] text-[#C6A15B] font-bold'
                    : 'border-transparent text-[#C5B8A8] hover:text-[#F3EEE5] hover:bg-[#241712]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#C6A15B]' : ''}`} />
                  <span>{link.label}</span>
                </div>
                {link.count !== undefined && link.count > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-[#0F0D0C] border border-[#C6A15B]/40 text-[#C6A15B]">
                    {link.count}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-[#C6A15B]/15 mt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-cinzel uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-[#241712] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('account.logout')}</span>
            </button>
          </div>
        </aside>

        {/* Content View */}
        <main className="lg:col-span-9 bg-[#1C120E] border border-[#C6A15B]/20 p-6 sm:p-8 shadow-xl">
          {children}
        </main>
      </div>
    </div>
  );
}
