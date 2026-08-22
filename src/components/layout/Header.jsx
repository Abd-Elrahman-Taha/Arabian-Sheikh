import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';

export default function Header({ onOpenSearch }) {
  const { currentPath, queryParams } = useRouter();
  const { t, language, setLanguage } = useTranslation();
  const { totals, openDrawer, cartBadgeAnimated } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAdmin, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();

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
            ? isDark
              ? 'bg-[#0B0A08]/95 backdrop-blur-md border-b border-[#D4AF37]/20 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.85)]'
              : 'bg-[#CBB198]/95 backdrop-blur-md border-b border-[#D4AF37]/30 py-2.5 shadow-[0_10px_30px_rgba(33,19,13,0.06)]'
            : isDark
              ? 'bg-gradient-to-b from-[#0B0A08]/95 via-[#0B0A08]/60 to-transparent py-4'
              : 'bg-gradient-to-b from-[#CBB198]/95 via-[#CBB198]/70 to-transparent py-4'
        }`}
      >
        {/* Top VIP Announcement Bar */}
        {!isScrolled && (
          <div className={`hidden lg:block border-b pb-2 mb-2 ${
            isDark ? 'border-[#D4AF37]/15' : 'border-[#5A3517]/15'
          }`}>
            <div className={`max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 flex items-center justify-between text-[11px] uppercase tracking-[0.25em] ${
              isDark ? 'text-[#D4AF37]' : 'text-[#5A3517]'
            }`}>
              <div className="flex items-center gap-2">
                <Sparkles className={`w-3 h-3 ${isDark ? 'text-[#D4AF37]' : 'text-[#5A3517]'}`} />
                <span>Complimentary Royal Express Delivery Over €100 via DHL</span>
              </div>
              <div className={`flex items-center gap-6 normal-case text-xs tracking-normal ${
                isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'
              }`}>
                <Link
                  to="/discovery"
                  className={`transition-colors flex items-center gap-1 font-cinzel uppercase tracking-[0.15em] text-[11px] relative group ${
                    isDark ? 'hover:text-[#D4AF37]' : 'hover:text-[#5A3517] font-bold'
                  }`}
                >
                  <span>Fragrance Finder Quiz</span>
                  <span className="absolute -bottom-0.5 left-0 right-0 h-[1.5px] bg-[#D4AF37] shadow-[0_0_6px_rgba(212,175,55,0.8)] rounded-full opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 transition-all duration-300" />
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-1 font-semibold uppercase tracking-wider text-[11px] relative group ${
                      isDark ? 'text-[#D4AF37]' : 'text-[#5A3517]'
                    }`}
                  >
                    <ShieldAlert className="w-3 h-3" />
                    <span>Admin Suite</span>
                    <span className="absolute -bottom-0.5 left-0 right-0 h-[1.5px] bg-[#D4AF37] shadow-[0_0_6px_rgba(212,175,55,0.8)] rounded-full opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 transition-all duration-300" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between gap-2 sm:gap-6">
            
            {/* 1. FIRST IN NAVBAR: OFFICIAL ARABIAN SHEIKH LOGO */}
            <div className="flex items-center shrink min-w-0 py-0.5">
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

            {/* 2. CENTER: CATEGORY NAVIGATION WITH GOLDEN LINE ON HOVER OR ACTIVE */}
            <nav className={`hidden lg:flex items-center space-x-7 text-[13.5px] xl:text-[14.5px] tracking-[0.22em] uppercase font-cinzel font-semibold ${
              isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
            }`}>
              {navCategories.map((item) => {
                const active = isItemActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`transition-colors duration-300 relative py-2 group cursor-pointer ${
                      active
                        ? isDark
                          ? 'text-[#D4AF37] font-bold'
                          : 'text-[#5A3517] font-bold'
                        : isDark
                          ? 'text-[#F3E6D0] hover:text-[#D4AF37]'
                          : 'text-[#120B06] hover:text-[#5A3517]'
                    }`}
                  >
                    <span>{item.name}</span>
                    {/* Golden Line under item when HOVER or ACTIVE */}
                    <span
                      className={`absolute -bottom-1 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-[0_0_10px_rgba(212,175,55,0.9)] rounded-full transition-all duration-300 ${
                        active
                          ? 'opacity-100 scale-x-100'
                          : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* 3. RIGHT: UTILITIES & ACTIONS */}
            <div className={`flex items-center space-x-1.5 sm:space-x-3 md:space-x-4 shrink-0 ${
              isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
            }`}>
              {/* Language Switcher */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className={`flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase transition-colors py-1.5 px-3 rounded-full border ${
                    isDark
                      ? 'bg-black/40 text-[#F3E6D0] border-[#D4AF37]/35 hover:text-[#D4AF37]'
                      : 'bg-white text-[#120B06] border-[#5A3517]/35 hover:text-[#5A3517] shadow-xs'
                  }`}
                  aria-label="Select Language"
                >
                  <Globe className={`w-3.5 h-3.5 ${isDark ? 'text-[#D4AF37]' : 'text-[#5A3517]'}`} />
                  <span>{language.toUpperCase()}</span>
                  <ChevronDown className={`w-3 h-3 ${isDark ? 'text-[#D4AF37]' : 'text-[#5A3517]'}`} />
                </button>

                {langDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-36 border rounded-xl shadow-2xl py-1 z-50 animate-fade-in ${
                    isDark ? 'bg-[#0B0A08] border-[#D4AF37]/30 text-[#F3E6D0]' : 'bg-white border-[#5A3517]/30 text-[#120B06]'
                  }`}>
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLanguage(l.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors font-semibold ${
                          language === l.code
                            ? isDark
                              ? 'text-[#D4AF37] font-bold bg-[#D4AF37]/10'
                              : 'text-[#5A3517] font-bold bg-[#5A3517]/10'
                            : isDark
                              ? 'hover:bg-[#D4AF37]/15 hover:text-[#D4AF37]'
                              : 'hover:bg-[#5A3517]/15 hover:text-[#5A3517]'
                        }`}
                      >
                        <span>{l.label}</span>
                        <span>{l.flag}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme Toggle Button (Light / Dark Mode Switcher) */}
              <button
                onClick={toggleTheme}
                className={`p-1.5 sm:p-2 transition-all duration-300 focus:outline-none cursor-pointer rounded-full border flex items-center justify-center shrink-0 ${
                  isDark
                    ? 'bg-black/40 border-[#D4AF37]/30 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                    : 'bg-white border-[#5A3517]/30 hover:border-[#5A3517] hover:text-[#5A3517] shadow-xs'
                }`}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle Luxury Theme"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-[#F2D675] hover:rotate-90 transition-transform duration-500" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-[#120B06] hover:-rotate-45 transition-transform duration-500" />
                )}
              </button>

              {/* Search Trigger */}
              <button
                onClick={onOpenSearch}
                className={`p-1.5 sm:p-2 transition-colors focus:outline-none cursor-pointer shrink-0 ${
                  isDark ? 'hover:text-[#D4AF37]' : 'hover:text-[#5A3517]'
                }`}
                aria-label="Search Fragrances"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Wishlist */}
              <Link
                to="/account/wishlist"
                className={`relative p-1.5 sm:p-2 transition-colors focus:outline-none hidden sm:block shrink-0 ${
                  isDark ? 'hover:text-[#D4AF37]' : 'hover:text-[#5A3517]'
                }`}
                aria-label="Wishlist"
              >
                <Heart className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                {wishlistCount > 0 && (
                  <span className={`absolute top-0 right-0 text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-md ${
                    isDark ? 'bg-[#D4AF37] text-black' : 'bg-[#5A3517] text-white'
                  }`}>
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account / Login */}
              <Link
                to={isAuthenticated ? '/account' : '/login'}
                className={`p-1.5 sm:p-2 transition-colors focus:outline-none hidden sm:block shrink-0 ${
                  isDark ? 'hover:text-[#D4AF37]' : 'hover:text-[#5A3517]'
                }`}
                aria-label="Account / Sign In"
              >
                <User className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </Link>

              {/* Shopping Bag / Cart */}
              <button
                onClick={openDrawer}
                className={`relative p-1.5 sm:p-2 transition-colors focus:outline-none cursor-pointer group shrink-0 ${
                  isDark ? 'hover:text-[#D4AF37]' : 'hover:text-[#5A3517]'
                }`}
                aria-label="Shopping Bag"
              >
                <ShoppingBag className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                  isDark ? 'text-[#F3E6D0] group-hover:text-[#D4AF37]' : 'text-[#120B06] group-hover:text-[#5A3517]'
                }`} />
                {totals.itemCount > 0 && (
                  <span className={`absolute top-0 right-0 text-[9px] font-bold rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center shadow-lg ${
                    isDark ? 'bg-[#D4AF37] text-black' : 'bg-[#5A3517] text-white'
                  } ${cartBadgeAnimated ? 'animate-bounce' : ''}`}>
                    {totals.itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-1.5 sm:p-2 transition-colors focus:outline-none shrink-0 ${
                  isDark ? 'hover:text-[#D4AF37]' : 'hover:text-[#5A3517]'
                }`}
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? (
                  <X className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-[#D4AF37]' : 'text-[#5A3517]'}`} />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className={`fixed inset-0 z-50 lg:hidden backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 pt-3.5 pb-6 animate-slide-down-smooth overflow-y-auto ${
          isDark ? 'bg-[#0B0A08]/98 text-[#F3E6D0]' : 'bg-[#CBB198]/98 text-[#120B06]'
        }`}>
          <div className="space-y-5">
            <div className={`flex items-center justify-between pb-3.5 border-b ${
              isDark ? 'border-[#D4AF37]/20' : 'border-[#5A3517]/20'
            }`}>
              <ArabianLogo variant="header" size="navbar" showSubtitle={true} subtitle="Andalusia" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                  isDark ? 'text-[#D4AF37] hover:bg-[#D4AF37]/10' : 'text-[#5A3517] hover:bg-[#5A3517]/10'
                }`}
                aria-label="Close Menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Nav Links with Golden Line on Hover or Active */}
            <div className="space-y-4 font-cinzel text-lg tracking-[0.2em] uppercase font-semibold">
              {navCategories.map((item) => {
                const active = isItemActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-2.5 transition-colors border-b border-black/5 dark:border-white/5 flex items-center justify-between relative group ${
                      active
                        ? isDark
                          ? 'text-[#D4AF37] font-bold'
                          : 'text-[#5A3517] font-bold'
                        : isDark
                          ? 'text-[#F3E6D0] hover:text-[#D4AF37]'
                          : 'text-[#120B06] hover:text-[#5A3517]'
                    }`}
                  >
                    <span className="relative inline-block">
                      {item.name}
                      <span
                        className={`absolute -bottom-1 left-0 right-0 h-[2px] bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.85)] rounded-full transition-all duration-300 ${
                          active
                            ? 'opacity-100 scale-x-100'
                            : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                        }`}
                      />
                    </span>
                    <ArrowRight className={`w-4 h-4 transition-colors ${
                      active
                        ? isDark ? 'text-[#D4AF37]' : 'text-[#5A3517]'
                        : isDark ? 'text-[#D4AF37]/60 group-hover:text-[#D4AF37]' : 'text-[#5A3517]/60 group-hover:text-[#5A3517]'
                    }`} />
                  </Link>
                );
              })}
              <Link
                to="/discovery"
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2.5 font-bold flex items-center justify-between relative group ${
                  isDark ? 'text-[#D4AF37]' : 'text-[#5A3517]'
                }`}
              >
                <span className="relative inline-block">
                  Fragrance Finder Quiz
                  <span
                    className={`absolute -bottom-1 left-0 right-0 h-[2px] bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.85)] rounded-full transition-all duration-300 ${
                      isItemActive('/discovery')
                        ? 'opacity-100 scale-x-100'
                        : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                    }`}
                  />
                </span>
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              </Link>
            </div>
          </div>

          {/* Mobile Bottom Utilities */}
          <div className={`pt-6 border-t space-y-4 ${
            isDark ? 'border-[#D4AF37]/20' : 'border-[#5A3517]/20'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs uppercase tracking-widest font-semibold ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>Appearance:</span>
              <button
                onClick={toggleTheme}
                className={`px-3.5 py-1.5 text-xs rounded-full border flex items-center gap-1.5 font-cinzel uppercase tracking-wider font-bold transition-colors ${
                  isDark
                    ? 'bg-white/5 border-[#D4AF37]/40 text-[#F3E6D0]'
                    : 'bg-white border-[#5A3517]/40 text-[#120B06] shadow-sm'
                }`}
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-[#F2D675]" /> : <Moon className="w-3.5 h-3.5 text-[#120B06]" />}
                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className={`text-xs uppercase tracking-widest font-semibold ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>Language:</span>
              <div className="flex gap-2">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    className={`px-3 py-1 text-xs rounded-full border font-bold transition-colors ${
                      language === l.code
                        ? isDark
                          ? 'border-[#D4AF37] bg-[#D4AF37] text-black'
                          : 'border-[#5A3517] bg-[#5A3517] text-white shadow-sm'
                        : isDark
                          ? 'border-white/20 text-[#F3E6D0]'
                          : 'border-[#5A3517]/30 text-[#120B06]'
                    }`}
                  >
                    {l.code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to={isAuthenticated ? '/account' : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-center gap-2 py-2.5 border rounded-xl text-xs uppercase tracking-wider font-semibold transition-colors ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-[#F3E6D0] hover:border-[#D4AF37] hover:text-[#D4AF37]'
                    : 'bg-white border-[#5A3517]/30 text-[#120B06] hover:border-[#5A3517] hover:text-[#5A3517] shadow-sm'
                }`}
              >
                <User className={`w-4 h-4 ${isDark ? 'text-[#D4AF37]' : 'text-[#5A3517]'}`} />
                <span>{isAuthenticated ? 'Account' : 'Sign In'}</span>
              </Link>
              <Link
                to="/account/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-center gap-2 py-2.5 border rounded-xl text-xs uppercase tracking-wider font-semibold transition-colors ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-[#F3E6D0] hover:border-[#D4AF37] hover:text-[#D4AF37]'
                    : 'bg-white border-[#5A3517]/30 text-[#120B06] hover:border-[#5A3517] hover:text-[#5A3517] shadow-sm'
                }`}
              >
                <Heart className={`w-4 h-4 ${isDark ? 'text-[#D4AF37]' : 'text-[#5A3517]'}`} />
                <span>Wishlist ({wishlistCount})</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
