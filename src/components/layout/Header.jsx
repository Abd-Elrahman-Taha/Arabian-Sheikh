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
  const { currentPath } = useRouter();
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

  // Close mobile menu and dropdowns on route changes
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
            ? 'bg-[#0A0A0B]/95 backdrop-blur-md border-b border-[#D4AF37]/20 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.85)]'
            : 'bg-gradient-to-b from-[#0A0A0B]/95 via-[#0A0A0B]/60 to-transparent py-4'
        }`}
      >
        {/* Top VIP Announcement Bar (when not scrolled) */}
        {!isScrolled && (
          <div className="hidden lg:block border-b border-[#D4AF37]/15 pb-2 mb-2">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-[#C5A059]">
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
          <div className="flex items-center justify-between">
            {/* Left Desktop Category Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 text-[12px] tracking-[0.22em] uppercase font-cinzel font-medium text-[#E5E0D8]">
              {navCategories.slice(0, 3).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`transition-colors duration-300 relative py-1 hover:text-[#D4AF37] ${
                    currentPath === item.path ? 'text-[#D4AF37] font-semibold' : ''
                  }`}
                >
                  {item.name}
                  {currentPath === item.path && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#D4AF37] animate-fade-in" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Center Logo — Round 1 Fix #3: Perfect container crop with zero top whitespace */}
            <div className="flex items-center justify-center py-0.5">
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

            {/* Right Desktop Nav + Actions */}
            <div className="flex items-center space-x-4 sm:space-x-6 text-[#E5E0D8]">
              {/* Right secondary categories */}
              <nav className="hidden lg:flex items-center space-x-6 text-[12px] tracking-[0.22em] uppercase font-cinzel font-medium">
                {navCategories.slice(3).map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`transition-colors duration-300 relative py-1 hover:text-[#D4AF37] ${
                      currentPath === item.path ? 'text-[#D4AF37] font-semibold' : ''
                    }`}
                  >
                    {item.name}
                    {currentPath === item.path && (
                      <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#D4AF37] animate-fade-in" />
                    )}
                  </Link>
                ))}
              </nav>

              {/* Language Switcher (English, Spanish, Bulgarian) */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1.5 text-xs tracking-wider uppercase hover:text-[#D4AF37] transition-colors py-1 px-2.5 rounded border border-[#D4AF37]/25 bg-black/40 text-[#E5E0D8]"
                  aria-label="Select Language"
                >
                  <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{language.toUpperCase()}</span>
                  <ChevronDown className="w-3 h-3 text-[#C5A059]" />
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-36 bg-[#121010] border border-[#D4AF37]/30 rounded-md shadow-2xl py-1 z-50 animate-fade-in">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLanguage(l.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#D4AF37]/15 transition-colors ${
                          language === l.code ? 'text-[#D4AF37] font-bold bg-[#D4AF37]/10' : 'text-[#E5E0D8]'
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
                <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#E5E0D8] group-hover:text-[#D4AF37] transition-colors" />
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
        <div className="fixed inset-0 z-50 lg:hidden bg-[#0A0A0B]/98 backdrop-blur-2xl flex flex-col justify-between p-6 pt-20 animate-fade-in overflow-y-auto">
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
              {navCategories.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-[#F8F5F0] hover:text-[#D4AF37] transition-colors border-b border-white/5 flex items-center justify-between"
                >
                  <span>{item.name}</span>
                  <ArrowRight className="w-4 h-4 text-[#D4AF37]/60" />
                </Link>
              ))}
              <Link
                to="/discovery"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[#D4AF37] font-semibold flex items-center justify-between"
              >
                <span>Fragrance Finder Quiz</span>
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              </Link>
            </div>
          </div>

          {/* Mobile Bottom Utilities */}
          <div className="pt-6 border-t border-[#D4AF37]/20 space-y-4">
            {/* Language Selection */}
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[#8C6D37]">Language:</span>
              <div className="flex gap-2">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    className={`px-2.5 py-1 text-xs rounded border ${
                      language === l.code
                        ? 'border-[#D4AF37] bg-[#D4AF37] text-black font-bold'
                        : 'border-white/20 text-[#E5E0D8]'
                    }`}
                  >
                    {l.code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Account & Wishlist */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 rounded text-xs uppercase tracking-wider text-[#F8F5F0]"
              >
                <User className="w-4 h-4 text-[#D4AF37]" />
                <span>Account</span>
              </Link>
              <Link
                to="/account/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 rounded text-xs uppercase tracking-wider text-[#F8F5F0]"
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
