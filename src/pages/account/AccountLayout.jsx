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
    <div className="pt-36 sm:pt-40 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in text-[var(--color-earth-dark)]">
      {/* Account Hero Bar */}
      <div className="bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-none border-2 border-[var(--color-terracotta)] bg-[var(--color-desert-primary)]/30 flex items-center justify-center text-[var(--color-terracotta)] font-cinzel text-2xl font-bold shadow-md">
            {user?.name ? user.name.charAt(0) : 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cinzel text-xl sm:text-2xl font-bold uppercase text-[var(--color-earth-dark)]">
                {t('account.welcome', { name: user?.name || 'Distinguished Patron' })}
              </h1>
              {isAdmin && (
                <span className="bg-[var(--color-terracotta)] text-[#F8D188] font-cinzel text-[10px] font-bold px-2 py-0.5 uppercase shadow-sm">
                  Palace Admin
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--color-terracotta-deep)] mt-0.5 font-medium">
              {t('account.memberSince', { date: user?.memberSince || '2025' })}
            </p>
            <p className="text-xs text-[var(--color-terracotta)] font-bold mt-1 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" />
              <span>{t('account.tier')}</span>
            </p>
          </div>
        </div>

        {isAdmin && (
          <Link
            to="/admin"
            className="luxury-btn-gold px-6 py-2.5 text-xs flex items-center gap-2 shadow-md cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Open Admin Suite</span>
          </Link>
        )}
      </div>

      {/* Account Main Grid: Sidebar + Subpage Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-4 space-y-1 shadow-xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentPath === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center justify-between px-4 py-3 text-xs font-cinzel uppercase tracking-wider transition-all border ${
                  isActive
                    ? 'border-[var(--color-terracotta)] bg-[var(--color-desert-primary)]/30 text-[var(--color-terracotta)] font-bold shadow-sm'
                    : 'border-transparent text-[var(--color-terracotta-deep)] hover:text-[var(--color-earth-dark)] hover:bg-[var(--color-desert-primary)]/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--color-terracotta)]' : ''}`} />
                  <span>{link.label}</span>
                </div>
                {link.count !== undefined && link.count > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-[var(--color-terracotta)] text-[#F8D188] font-bold rounded-full">
                    {link.count}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-[var(--color-terracotta-deep)]/20 mt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-cinzel uppercase tracking-wider text-rose-600 hover:text-rose-700 hover:bg-[var(--color-desert-primary)]/20 transition-colors cursor-pointer font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('account.logout')}</span>
            </button>
          </div>
        </aside>

        {/* Content View */}
        <main className="lg:col-span-9 bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-6 sm:p-8 shadow-xl">
          {children}
        </main>
      </div>
    </div>
  );
}
