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
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col pt-20">
      {/* Admin Top Header Bar */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--border-card)] px-6 py-3.5 flex items-center justify-between shadow-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none border border-[var(--gold-primary)] bg-[var(--bg-primary)] flex items-center justify-center text-[var(--gold-primary)] font-bold font-cinzel">
            AS
          </div>
          <div>
            <span className="font-cinzel text-sm font-bold tracking-widest text-[var(--text-primary)] uppercase block">
              Arabian Sheikh • Grand Atelier Suite
            </span>
            <span className="text-[10px] text-[var(--gold-primary)] font-mono">
              Management & Olfactory Inventory Console
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-xs text-[var(--text-muted)] hover:text-[var(--gold-primary)] flex items-center gap-1.5 font-cinzel uppercase tracking-wider cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
          <div className="h-4 w-px bg-[var(--border-subtle)]" />
          <div className="text-right hidden sm:block">
            <span className="text-xs font-semibold text-[var(--text-primary)] block font-cinzel">{user?.name || 'Grand Concierge'}</span>
            <span className="text-[10px] text-[var(--gold-primary)] font-mono uppercase font-semibold">Master Administrator</span>
          </div>
        </div>
      </div>

      {/* Admin Body: Sidebar + Main Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Admin Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-card)] p-4 space-y-1 shrink-0">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--gold-primary)] font-cinzel px-3 py-2 font-bold">
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
                    ? 'bg-[var(--bg-card)] text-[var(--gold-primary)] border-l-2 border-[var(--gold-primary)] font-semibold shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-6 mt-6 border-t border-[var(--border-subtle)] px-3">
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Admin</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto bg-[var(--bg-primary)]">
          {children}
        </main>
      </div>
    </div>
  );
}
