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
    { to: '/account', label: t('account.dashboard') || 'Overview', icon: User },
    { to: '/account/orders', label: t('account.orders') || 'Acquisitions', icon: ShoppingBag },
    { to: '/account/wishlist', label: t('account.wishlist') || 'Vault Wishlist', icon: Heart, count: wishlistCount },
    { to: '/account/addresses', label: t('account.addresses') || 'Palace Addresses', icon: MapPin },
    { to: '/account/payment-methods', label: t('account.paymentMethods') || 'Payment Methods', icon: CreditCard },
    { to: '/account/settings', label: t('account.settings') || 'Settings & Security', icon: Settings }
  ];

  return (
    <div className="pt-32 sm:pt-36 pb-6 max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8 animate-fade-in text-[#F3E6D0]">
      
      {/* Account Hero Bar in Obsidian & Gold */}
      <div className="rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/35 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-[#D4AF37]/50 bg-gradient-to-br from-[#D4AF37]/20 via-black to-[#8C6239]/20 flex items-center justify-center text-[#F2D675] font-cinzel text-2xl sm:text-3xl font-bold shadow-[0_0_20px_rgba(212,175,55,0.25)] shrink-0">
            {user?.name ? user.name.charAt(0) : 'S'}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase text-[#F3E6D0] tracking-wide">
                {user?.name || 'Distinguished Patron'}
              </h1>
              {isAdmin && (
                <span className="bg-[#D4AF37] text-black font-cinzel text-xs font-bold px-3 py-1 rounded-full uppercase shadow-md">
                  Palace Admin
                </span>
              )}
            </div>
            <p className="text-sm sm:text-base text-[#D8BE99] mt-1 font-medium">
              Royal Member Since {user?.memberSince || '2025'}
            </p>
            <p className="text-sm sm:text-base text-[#F2D675] font-bold mt-1.5 flex items-center gap-2">
              <Crown className="w-4 h-4 text-[#D4AF37]" />
              <span>Privilege Patron Circle</span>
            </p>
          </div>
        </div>

        {isAdmin && (
          <Link
            to="/admin"
            className="group/btn relative px-6 py-3 rounded-full bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-white hover:text-black font-cinzel font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all duration-300 border border-[#F2D675]/50 overflow-hidden shrink-0 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Open Admin Suite</span>
          </Link>
        )}
      </div>

      {/* Account Main Grid: Sidebar + Subpage Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar in Obsidian Glass */}
        <aside className="lg:col-span-3 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 p-4 space-y-2.5 shadow-2xl backdrop-blur-md">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentPath === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`group flex items-center justify-between px-4 py-3.5 rounded-xl text-sm sm:text-base font-cinzel uppercase tracking-wider transition-all border ${
                  isActive
                    ? 'border-[#D4AF37]/60 bg-gradient-to-r from-[#D4AF37]/20 via-[#8C6239]/15 to-transparent text-[#F2D675] font-bold shadow-md'
                    : 'border-transparent text-[#D8BE99] hover:text-[#F3E6D0] hover:bg-white/5 font-medium'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                    isActive
                      ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#F2D675] shadow-sm'
                      : 'border-[#D4AF37]/30 bg-black/50 text-[#D8BE99] group-hover:border-[#D4AF37] group-hover:text-[#F2D675]'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{link.label}</span>
                </div>
                {link.count !== undefined && link.count > 0 && (
                  <span className="px-2.5 py-0.5 text-xs font-mono bg-[#D4AF37] text-black font-bold rounded-full">
                    {link.count}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-[#3A2116]/40 mt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3.5 px-4 py-3.5 text-sm sm:text-base font-cinzel uppercase tracking-wider text-rose-400 hover:text-rose-300 hover:bg-[#21130D]/60 transition-colors cursor-pointer font-bold rounded-xl"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Content View in Dark Brown */}
        <main className="lg:col-span-9 bg-[#21130D] border border-[#3A2116]/60 p-6 sm:p-8 shadow-2xl text-[#F3E6D0]">
          {children}
        </main>
      </div>
    </div>
  );
}
