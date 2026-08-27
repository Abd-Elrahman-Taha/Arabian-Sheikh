import React, { useState } from 'react';
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
  ExternalLink,
  Menu,
  X
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const { currentPath, navigate } = useRouter();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* Admin Top Header Bar in Obsidian Glass */}
      <header className="bg-[#0B0A08]/95 border-b border-[#D4AF37]/30 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-2xl sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl border border-[#D4AF37]/50 bg-gradient-to-br from-[#D4AF37]/20 via-black to-[#8C6239]/20 flex items-center justify-center text-[#F2D675] font-bold font-cinzel text-sm sm:text-base shadow-[0_0_15px_rgba(212,175,55,0.3)] shrink-0">
            AS
          </div>
          <div className="min-w-0">
            <span className="font-cinzel text-sm sm:text-lg lg:text-xl font-bold tracking-wider text-[#F3E6D0] uppercase truncate block">
              Arabian Sheikh <span className="hidden sm:inline">• Atelier Suite</span>
            </span>
            <span className="text-xs sm:text-sm text-[#F2D675] font-mono font-bold tracking-wider truncate block">
              Admin & Inventory Console
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/"
            className="group px-3.5 sm:px-5 py-2 rounded-full border border-[#D4AF37]/40 bg-black/50 text-xs sm:text-sm text-[#D8BE99] hover:text-[#F2D675] hover:border-[#D4AF37] flex items-center gap-2 font-cinzel uppercase tracking-wider cursor-pointer font-bold transition-all shadow-sm shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110" />
            <span className="hidden xs:inline">Storefront</span>
          </Link>
          
          <div className="h-6 w-px bg-[#D4AF37]/25 hidden sm:block" />
          
          <div className="text-right hidden md:block">
            <span className="text-sm sm:text-base font-bold text-[#F3E6D0] block font-cinzel">{user?.name || 'Grand Concierge'}</span>
            <span className="text-xs text-[#F2D675] font-mono uppercase font-bold">Master Administrator</span>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-lg border border-[#D4AF37]/30 bg-black/50 text-[#F2D675] hover:border-[#D4AF37] transition-all cursor-pointer"
            aria-label="Toggle Admin Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Horizontal Fast-Pills Nav for Mobile */}
      <div className="md:hidden bg-[#0B0A08]/95 border-b border-[#D4AF37]/20 px-3 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none sticky top-[61px] z-30 backdrop-blur-md">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = link.exact
            ? currentPath === link.to
            : currentPath.startsWith(link.to);

          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full text-xs sm:text-sm font-cinzel uppercase tracking-wider font-bold transition-all border whitespace-nowrap ${
                isActive
                  ? 'border-[#D4AF37] bg-[#D4AF37] text-black shadow-md'
                  : 'border-[#D4AF37]/25 bg-black/60 text-[#D8BE99] hover:text-[#F3E6D0]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Mobile Drawer (When Open) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[105px] bottom-0 bg-[#0B0A08]/95 backdrop-blur-xl z-50 p-4 border-t border-[#D4AF37]/30 overflow-y-auto space-y-2 animate-fade-in">
          <p className="text-xs uppercase tracking-[0.25em] text-[#F2D675] font-cinzel px-3 py-1 font-bold">
            Palace Administration
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
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm sm:text-base font-cinzel uppercase tracking-wider transition-all border ${
                  isActive
                    ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#F2D675] font-bold shadow-md'
                    : 'border-transparent text-[#D8BE99] hover:bg-white/5'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${
                  isActive ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#F2D675]' : 'border-[#D4AF37]/30 bg-black/50 text-[#D8BE99]'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 border-t border-[#D4AF37]/20">
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center gap-3 text-sm font-cinzel uppercase tracking-wider text-rose-400 py-3.5 px-4 rounded-xl border border-rose-500/20 bg-rose-500/10 font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Suite</span>
            </button>
          </div>
        </div>
      )}

      {/* Admin Body: Sidebar (Desktop) + Main Content */}
      <div className="flex-1 flex flex-col md:flex-row min-w-0">
        {/* Admin Navigation Sidebar in Obsidian Glass (Desktop) */}
        <aside className="hidden md:block w-72 bg-[#0B0A08]/90 border-r border-[#D4AF37]/25 p-4 space-y-2 shrink-0 backdrop-blur-md shadow-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-[#F2D675] font-cinzel px-3 py-2 font-bold flex items-center gap-2">
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
                className={`group flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-cinzel uppercase tracking-wider transition-all border ${
                  isActive
                    ? 'border-[#D4AF37]/60 bg-gradient-to-r from-[#D4AF37]/20 via-[#8C6239]/15 to-transparent text-[#F2D675] font-bold shadow-md'
                    : 'border-transparent text-[#D8BE99] hover:text-[#F3E6D0] hover:bg-white/5 font-medium'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                  isActive
                    ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#F2D675]'
                    : 'border-[#D4AF37]/30 bg-black/50 text-[#D8BE99] group-hover:border-[#D4AF37] group-hover:text-[#F2D675]'
                }`}>
                  <Icon className="w-4 h-4 shrink-0" />
                </div>
                <span className="truncate">{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-6 mt-6 border-t border-[#D4AF37]/20 px-3">
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center gap-3 text-sm font-cinzel uppercase tracking-wider text-rose-400 hover:text-rose-300 transition-colors py-2.5 cursor-pointer font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Suite</span>
            </button>
          </div>
        </aside>

        {/* Main Admin View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-black/40 overflow-x-hidden backdrop-blur-sm min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
