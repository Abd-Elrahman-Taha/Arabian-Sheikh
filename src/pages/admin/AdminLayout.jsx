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
  ExternalLink,
  ShieldCheck,
  Crown
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
    <div className="min-h-screen bg-[#0F0D0C] text-[#F3EEE5] flex flex-col pt-20">
      {/* Admin Top Header Bar */}
      <div className="bg-[#1C120E] border-b border-[#C6A15B]/30 px-6 py-3.5 flex items-center justify-between shadow-xl sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none border border-[#C6A15B] bg-[#0F0D0C] flex items-center justify-center text-[#C6A15B] font-bold font-cinzel">
            AS
          </div>
          <div>
            <span className="font-cinzel text-sm font-bold tracking-widest text-[#F3EEE5] uppercase block">
              Arabian Sheikh • Grand Atelier Suite
            </span>
            <span className="text-[10px] text-[#C6A15B] font-mono">
              Management & Olfactory Inventory Console
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-xs text-[#C5B8A8] hover:text-[#C6A15B] flex items-center gap-1.5 font-cinzel uppercase tracking-wider"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
          <div className="h-4 w-px bg-[#C6A15B]/20" />
          <div className="text-right hidden sm:block">
            <span className="text-xs font-semibold text-[#F3EEE5] block font-cinzel">{user?.name || 'Grand Concierge'}</span>
            <span className="text-[10px] text-[#C6A15B] font-mono uppercase">Master Administrator</span>
          </div>
        </div>
      </div>

      {/* Admin Body: Sidebar + Main Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Admin Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-[#140D0A] border-r border-[#C6A15B]/20 p-4 space-y-1 shrink-0">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#C6A15B] font-cinzel px-3 py-2">
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
                className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-sans font-medium transition-all ${
                  isActive
                    ? 'bg-[#2B1A12] text-[#C6A15B] border-l-2 border-[#C6A15B] font-semibold'
                    : 'text-[#C5B8A8] hover:text-[#F3EEE5] hover:bg-[#1C120E]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-6 mt-6 border-t border-[#C6A15B]/15 px-3">
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Admin</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto bg-[#0F0D0C]">
          {children}
        </main>
      </div>
    </div>
  );
}
