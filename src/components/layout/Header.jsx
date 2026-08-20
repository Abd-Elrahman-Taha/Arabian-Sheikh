import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import ArabianLogo from '../common/ArabianLogo';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Globe,
  ShieldAlert,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function Header({ onOpenSearch }) {
  const { currentPath, queryParams } = useRouter();
  const { t, language, setLanguage } = useTranslation();
  const { totals, openDrawer, cartBadgeAnimated } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAdmin, isAuthenticated } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setLangDropdownOpen(false);
  }, [currentPath]);

  const navCategories = [
    { name: t('nav.perfumes') || 'Perfumes', path: '/shop?category=perfumes' },
    { name: t('nav.oils') || 'Oils', path: '/shop?category=oils' },
    { name: t('nav.bakhoor') || 'Bakhoor', path: '/shop?category=bakhoor' },
    { name: t('nav.cosmetics') || 'Cosmetics', path: '/shop?category=cosmetics' },
    { name: t('nav.bundles') || 'Bundles', path: '/shop?category=bundles' },
    { name: t('nav.thePalace') || t('nav.about') || 'The Palace', path: '/the-palace' }
  ];

  const isItemActive = (itemPath) => {
    if (!itemPath) return false;
    const [basePath, queryString] = itemPath.split('?');

    if (queryString) {
      const targetParams = new URLSearchParams(queryString);
      const targetCategory = targetParams.get('category');
      const currentCategory = queryParams?.get('category');

      if (currentPath === basePath && currentCategory === targetCategory) {
        return true;
      }
      return false;
    }

    if (basePath === '/') {
      return currentPath === '/';
    }

    return currentPath === basePath || currentPath.startsWith(basePath + '/');
  };

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'bg', label: 'Български', flag: '🇧🇬' }
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? 'bg-[#0B0A08]/95 backdrop-blur-md border-b border-[#D4AF37]/20 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.85)]'
            : 'bg-gradient-to-b from-[#0B0A08]/95 via-[#0B0A08]/60 to-transparent py-4'
        }`}
      >
        {/* Top VIP Announcement Bar */}
        {!isScrolled && (
          <div className="hidden lg:block border-b border-[#D4AF37]/15 pb-2 mb-2">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-[#D4AF37]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span>Complimentary Royal Express Delivery Over €100 via DHL</span>
              </div>
              <div className="flex items-center gap-6 normal-case text-xs tracking-normal">
                <Link to="/discovery" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1 font-cinzel uppercase tracking-[0.15em] text-[11px]">
                  <span>Fragrance Finder Quiz</span>
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-[#D4AF37] flex items-center gap-1 font-semibold uppercase tracking-wider text-[11px]">
                    <ShieldAlert className="w-3 h-3" />
                    <span>Admin Suite</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6">
            
            {/* 1. FIRST IN NAVBAR: OFFICIAL ARABIAN SHEIKH LOGO */}
            <div className="flex items-center shrink-0 py-0.5">
              <Link
                to="/"
                className="inline-block focus:outline-none"
                aria-label="Arabian Sheikh Homepage"
              >
                <ArabianLogo
                  variant="header"
                  size="navbar"
                  showSubtitle={true}
                  subtitle="Andalusia"
                />
              </Link>
            </div>

            {/* 2. CENTER: CATEGORY NAVIGATION WITH ACTIVE UNDERLINE INDICATOR */}
            <nav className="hidden lg:flex items-center space-x-7 text-[12px] tracking-[0.22em] uppercase font-cinzel font-medium text-[#F3E6D0]">
              {navCategories.map((item) => {
                const active = isItemActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`transition-colors duration-300 relative py-1.5 hover:text-[#D4AF37] ${
                      active ? 'text-[#D4AF37] font-semibold' : 'text-[#F3E6D0]'
                    }`}
                  >
                    <span>{item.name}</span>
                    {active && (
                      <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-[0_0_8px_rgba(212,175,55,0.85)] rounded-full animate-fade-in" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* 3. RIGHT: UTILITIES & ACTIONS */}
            <div className="flex items-center space-x-4 sm:space-x-5 text-[#F3E6D0]">
              {/* Language Switcher */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1.5 text-xs tracking-wider uppercase hover:text-[#D4AF37] transition-colors py-1 px-2.5 rounded border border-[#D4AF37]/25 bg-black/40 text-[#F3E6D0]"
                  aria-label="Select Language"
                >
                  <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{language.toUpperCase()}</span>
                  <ChevronDown className="w-3 h-3 text-[#D4AF37]" />
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-36 bg-[#0B0A08] border border-[#D4AF37]/30 rounded-md shadow-2xl py-1 z-50 animate-fade-in">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLanguage(l.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#D4AF37]/15 transition-colors ${
                          language === l.code ? 'text-[#D4AF37] font-bold bg-[#D4AF37]/10' : 'text-[#F3E6D0]'
                        }`}
                      >
                        <span>{l.label}</span>
                        <span>{l.flag}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Trigger */}
              <button
                onClick={onOpenSearch}
                className="p-1.5 hover:text-[#D4AF37] transition-colors focus:outline-none cursor-pointer"
                aria-label="Search Fragrances"
              >
                <Search className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </button>

              {/* Wishlist */}
              <Link
                to="/account/wishlist"
                className="relative p-1.5 hover:text-[#D4AF37] transition-colors focus:outline-none hidden sm:block"
                aria-label="Wishlist"
              >
                <Heart className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[#D4AF37] text-black text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-md">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account */}
              <Link
                to={isAuthenticated ? '/account' : '/auth/login'}
                className="p-1.5 hover:text-[#D4AF37] transition-colors focus:outline-none hidden sm:block"
                aria-label="Account"
              >
                <User className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </Link>

              {/* Shopping Bag / Cart */}
              <button
                onClick={openDrawer}
                className="relative p-1.5 hover:text-[#D4AF37] transition-colors focus:outline-none cursor-pointer group"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#F3E6D0] group-hover:text-[#D4AF37] transition-colors" />
                {totals.itemCount > 0 && (
                  <span className={`absolute top-0 right-0 bg-[#D4AF37] text-black text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-lg ${
                    cartBadgeAnimated ? 'animate-bounce' : ''
                  }`}>
                    {totals.itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 hover:text-[#D4AF37] transition-colors focus:outline-none"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-[#D4AF37]" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-[#0B0A08]/98 backdrop-blur-2xl flex flex-col justify-between p-6 pt-20 animate-fade-in overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20">
              <ArabianLogo variant="header" size="navbar" showSubtitle={true} subtitle="Andalusia" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <div className="space-y-4 font-cinzel text-base tracking-[0.18em] uppercase">
              {navCategories.map((item) => {
                const active = isItemActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-2 transition-colors border-b border-white/5 flex items-center justify-between relative ${
                      active ? 'text-[#D4AF37] font-bold' : 'text-[#F3E6D0] hover:text-[#D4AF37]'
                    }`}
                  >
                    <span className="relative inline-block">
                      {item.name}
                      {active && (
                        <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.85)] rounded-full" />
                      )}
                    </span>
                    <ArrowRight className={`w-4 h-4 ${active ? 'text-[#D4AF37]' : 'text-[#D4AF37]/60'}`} />
                  </Link>
                );
              })}
              <Link
                to="/discovery"
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 font-semibold flex items-center justify-between relative ${
                  isItemActive('/discovery') ? 'text-[#D4AF37] font-bold' : 'text-[#D4AF37]'
                }`}
              >
                <span className="relative inline-block">
                  Fragrance Finder Quiz
                  {isItemActive('/discovery') && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.85)] rounded-full" />
                  )}
                </span>
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              </Link>
            </div>
          </div>

          {/* Mobile Bottom Utilities */}
          <div className="pt-6 border-t border-[#D4AF37]/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[#D8BE99]">Language:</span>
              <div className="flex gap-2">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    className={`px-2.5 py-1 text-xs rounded border ${
                      language === l.code
                        ? 'border-[#D4AF37] bg-[#D4AF37] text-black font-bold'
                        : 'border-white/20 text-[#F3E6D0]'
                    }`}
                  >
                    {l.code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 rounded text-xs uppercase tracking-wider text-[#F3E6D0]"
              >
                <User className="w-4 h-4 text-[#D4AF37]" />
                <span>Account</span>
              </Link>
              <Link
                to="/account/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 rounded text-xs uppercase tracking-wider text-[#F3E6D0]"
              >
                <Heart className="w-4 h-4 text-[#D4AF37]" />
                <span>Wishlist ({wishlistCount})</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
