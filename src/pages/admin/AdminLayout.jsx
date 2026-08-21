import React from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Warehouse,
  BarChart3,
  Percent,
  Settings,
  LogOut,
  ExternalLink
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const { currentPath, navigate } = useRouter();
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const navLinks = [
    { to: '/admin', label: t('admin.dashboard'), icon: LayoutDashboard, exact: true },
    { to: '/admin/products', label: t('admin.products'), icon: Package },
    { to: '/admin/orders', label: t('admin.orders'), icon: ShoppingBag },
    { to: '/admin/users', label: t('admin.users'), icon: Users },
    { to: '/admin/inventory', label: t('admin.inventory'), icon: Warehouse },
    { to: '/admin/analytics', label: t('admin.analytics'), icon: BarChart3 },
    { to: '/admin/discounts', label: t('admin.discounts'), icon: Percent },
    { to: '/admin/settings', label: t('admin.settings'), icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-transparent text-[#F3E6D0] flex flex-col pt-0">
      {/* Admin Top Header Bar in Obsidian Glass - Flush at the top */}
      <div className="bg-[#0B0A08]/95 border-b border-[#D4AF37]/30 px-6 py-4 flex items-center justify-between shadow-2xl sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl border border-[#D4AF37]/50 bg-gradient-to-br from-[#D4AF37]/20 via-black to-[#8C6239]/20 flex items-center justify-center text-[#F2D675] font-bold font-cinzel text-sm shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            AS
          </div>
          <div>
            <span className="font-cinzel text-sm sm:text-base font-bold tracking-widest text-[#F3E6D0] uppercase block">
              Arabian Sheikh • Grand Atelier Suite
            </span>
            <span className="text-[10px] text-[#F2D675] font-mono font-bold tracking-wider">
              Management & Olfactory Inventory Console
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="group px-4 py-1.5 rounded-full border border-[#D4AF37]/30 bg-black/40 text-xs text-[#D8BE99] hover:text-[#F2D675] hover:border-[#D4AF37] flex items-center gap-2 font-cinzel uppercase tracking-wider cursor-pointer font-bold transition-all shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
            <span>Storefront</span>
          </Link>
          <div className="h-5 w-px bg-[#D4AF37]/25 hidden sm:block" />
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-[#F3E6D0] block font-cinzel">{user?.name || 'Grand Concierge'}</span>
            <span className="text-[10px] text-[#F2D675] font-mono uppercase font-bold">Master Administrator</span>
          </div>
        </div>
      </div>

      {/* Admin Body: Sidebar + Main Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Admin Navigation Sidebar in Obsidian Glass */}
        <aside className="w-full md:w-64 bg-[#0B0A08]/90 border-r border-[#D4AF37]/25 p-4 space-y-1.5 shrink-0 backdrop-blur-md shadow-2xl">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#F2D675] font-cinzel px-3 py-2 font-bold flex items-center gap-2">
            <span>Palace Administration</span>
          </p>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.exact
              ? currentPath === link.to
              : currentPath.startsWith(link.to);

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`group flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-cinzel uppercase tracking-wider transition-all border ${
                  isActive
                    ? 'border-[#D4AF37]/60 bg-gradient-to-r from-[#D4AF37]/20 via-[#8C6239]/15 to-transparent text-[#F2D675] font-bold shadow-md'
                    : 'border-transparent text-[#D8BE99] hover:text-[#F3E6D0] hover:bg-white/5'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                  isActive
                    ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#F2D675]'
                    : 'border-[#D4AF37]/30 bg-black/50 text-[#D8BE99] group-hover:border-[#D4AF37] group-hover:text-[#F2D675]'
                }`}>
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                </div>
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-6 mt-6 border-t border-[#D4AF37]/20 px-3">
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center gap-3 text-xs font-cinzel uppercase tracking-wider text-rose-400 hover:text-rose-300 transition-colors py-2 cursor-pointer font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Suite</span>
            </button>
          </div>
        </aside>

        {/* Main Admin View Container */}
        <main className="flex-1 p-6 sm:p-8 bg-black/40 overflow-x-hidden backdrop-blur-sm">
          {children}
        </main>
      </div>
    </div>
  );
}
