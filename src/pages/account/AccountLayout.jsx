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
    <div className="pt-32 sm:pt-36 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in text-[#F5ECE3]">
      
      {/* Account Hero Bar in Rich Dark Brown */}
      <div className="bg-[#23180F] border border-[#5C3D28]/60 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-none border border-[#D4AF37]/50 bg-[#160F0A] flex items-center justify-center text-[#D4AF37] font-cinzel text-2xl font-bold shadow-inner">
            {user?.name ? user.name.charAt(0) : 'S'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-cinzel text-xl sm:text-2xl font-bold uppercase text-[#F8F5F0]">
                {user?.name || 'Distinguished Patron'}
              </h1>
              {isAdmin && (
                <span className="bg-[#D4AF37] text-black font-cinzel text-[10px] font-bold px-2 py-0.5 uppercase shadow-sm">
                  Palace Admin
                </span>
              )}
            </div>
            <p className="text-xs text-[#BFA893] mt-0.5 font-medium">
              Royal Member Since {user?.memberSince || '2025'}
            </p>
            <p className="text-xs text-[#D4AF37] font-bold mt-1 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" />
              <span>Privilege Patron Circle</span>
            </p>
          </div>
        </div>

        {isAdmin && (
          <Link
            to="/admin"
            className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#E5C07B] text-black font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Open Admin Suite</span>
          </Link>
        )}
      </div>

      {/* Account Main Grid: Sidebar + Subpage Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar in Dark Brown */}
        <aside className="lg:col-span-3 bg-[#23180F] border border-[#5C3D28]/60 p-4 space-y-1.5 shadow-2xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentPath === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center justify-between px-4 py-3 text-xs font-cinzel uppercase tracking-wider transition-all border ${
                  isActive
                    ? 'border-[#D4AF37]/50 bg-[#2D1F14] text-[#D4AF37] font-bold shadow-md'
                    : 'border-transparent text-[#BFA893] hover:text-[#F8F5F0] hover:bg-[#2D1F14]/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-[#8B5A2B]'}`} />
                  <span>{link.label}</span>
                </div>
                {link.count !== undefined && link.count > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-[#D4AF37] text-black font-bold rounded-full">
                    {link.count}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-[#5C3D28]/40 mt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-cinzel uppercase tracking-wider text-rose-400 hover:text-rose-300 hover:bg-[#2D1F14]/60 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Content View in Dark Brown */}
        <main className="lg:col-span-9 bg-[#23180F] border border-[#5C3D28]/60 p-6 sm:p-8 shadow-2xl text-[#F5ECE3]">
          {children}
        </main>
      </div>
    </div>
  );
}
