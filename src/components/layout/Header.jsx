import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';
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
  const { t, language, setLanguage, availableLanguages } = useTranslation();
  const { totals, openDrawer, cartBadgeAnimated } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAdmin, isAuthenticated } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [shopMegaOpen, setShopMegaOpen] = useState(false);
  const [collectionsMegaOpen, setCollectionsMegaOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu and dropdowns on path change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShopMegaOpen(false);
    setCollectionsMegaOpen(false);
    setLangDropdownOpen(false);
  }, [currentPath]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-400 ${
          isScrolled
            ? 'bg-[var(--bg-glass)] backdrop-blur-md border-b border-[var(--border-gold-subtle)] py-3 shadow-xl'
            : 'bg-gradient-to-b from-[var(--bg-primary)]/90 via-[var(--bg-primary)]/60 to-transparent py-4'
        }`}
      >
        {/* Top VIP Micro-Bar (when not scrolled) */}
        {!isScrolled && (
          <div className="hidden lg:block border-b border-[var(--border-gold-subtle)] pb-2 mb-2.5">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-[var(--text-muted)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-[var(--gold-primary)]" />
                <span>Complimentary Royal Express Delivery on Orders Over $200</span>
              </div>
              <div className="flex items-center gap-6">
                <Link to="/the-house" className="hover:text-[var(--gold-primary)] transition-colors">
                  Private Salons & Boutiques
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-[var(--gold-primary)] flex items-center gap-1 font-semibold">
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
            {/* Desktop Left Navigation */}
            <nav className="hidden lg:flex items-center space-x-7 text-[13px] tracking-[0.2em] uppercase font-cinzel font-medium">
              {/* SHOP with Mega Dropdown */}
              <div
                className="relative py-2"
                onMouseEnter={() => setShopMegaOpen(true)}
                onMouseLeave={() => setShopMegaOpen(false)}
              >
                <Link
                  to="/shop"
                  className={`flex items-center gap-1 transition-colors ${
                    currentPath.startsWith('/shop') ? 'text-[var(--gold-primary)] font-bold' : 'text-[var(--text-primary)] hover:text-[var(--gold-primary)]'
                  }`}
                >
                  <span>{t('nav.shop')}</span>
                  <ChevronDown className="w-3 h-3 transition-transform" />
                </Link>

                {/* Shop Mega Dropdown */}
                {shopMegaOpen && (
                  <div className="absolute top-full left-0 w-[580px] bg-[var(--bg-card)] border border-[var(--border-gold)] shadow-2xl p-6 grid grid-cols-2 gap-6 animate-fade-in z-50">
                    <div>
                      <h4 className="text-[11px] font-sans uppercase tracking-[0.25em] text-[var(--gold-primary)] border-b border-[var(--border-gold-subtle)] pb-2 mb-3">
                        {t('shop.allProducts')}
                      </h4>
                      <ul className="space-y-2.5 text-xs tracking-wider normal-case font-sans">
                        <li>
                          <Link to="/shop" className="text-[var(--text-primary)] hover:text-[var(--gold-primary)] flex items-center justify-between group">
                            <span>{t('nav.allPerfumes')}</span>
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--gold-primary)]" />
                          </Link>
                        </li>
                        <li>
                          <Link to="/men" className="text-[var(--text-primary)] hover:text-[var(--gold-primary)] flex items-center justify-between group">
                            <span>{t('home.menTitle')}</span>
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--gold-primary)]" />
                          </Link>
                        </li>
                        <li>
                          <Link to="/women" className="text-[var(--text-primary)] hover:text-[var(--gold-primary)] flex items-center justify-between group">
                            <span>{t('home.womenTitle')}</span>
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--gold-primary)]" />
                          </Link>
                        </li>
                        <li>
                          <Link to="/unisex" className="text-[var(--text-primary)] hover:text-[var(--gold-primary)] flex items-center justify-between group">
                            <span>{t('home.unisexTitle')}</span>
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--gold-primary)]" />
                          </Link>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-[11px] font-sans uppercase tracking-[0.25em] text-[var(--gold-primary)] border-b border-[var(--border-gold-subtle)] pb-2 mb-3">
                        {t('home.fragranceFamiliesTitle')}
                      </h4>
                      <ul className="space-y-2 text-xs tracking-wider normal-case font-sans">
                        <li>
                          <Link to="/shop?family=woody" className="text-[var(--text-primary)] hover:text-[var(--gold-primary)] flex items-center justify-between">
                            <span>{t('families.woody')}</span>
                            <span className="font-arabic text-[var(--gold-primary)] text-xs">الخشبية (عود)</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/shop?family=oriental" className="text-[var(--text-primary)] hover:text-[var(--gold-primary)] flex items-center justify-between">
                            <span>{t('families.oriental')}</span>
                            <span className="font-arabic text-[var(--gold-primary)] text-xs">الشرقية</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/shop?family=floral" className="text-[var(--text-primary)] hover:text-[var(--gold-primary)] flex items-center justify-between">
                            <span>{t('families.floral')}</span>
                            <span className="font-arabic text-[var(--gold-primary)] text-xs">الزهرية</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/shop?family=fresh" className="text-[var(--text-primary)] hover:text-[var(--gold-primary)] flex items-center justify-between">
                            <span>{t('families.fresh')}</span>
                            <span className="font-arabic text-[var(--gold-primary)] text-xs">المنعشة</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/shop?family=fruity" className="text-[var(--text-primary)] hover:text-[var(--gold-primary)] flex items-center justify-between">
                            <span>{t('families.fruity')}</span>
                            <span className="font-arabic text-[var(--gold-primary)] text-xs">الفاكهية</span>
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/men"
                className={`transition-colors ${
                  currentPath === '/men' ? 'text-[var(--gold-primary)] font-bold' : 'text-[var(--text-primary)] hover:text-[var(--gold-primary)]'
                }`}
              >
                {t('nav.men')}
              </Link>
              <Link
                to="/women"
                className={`transition-colors ${
                  currentPath === '/women' ? 'text-[var(--gold-primary)] font-bold' : 'text-[var(--text-primary)] hover:text-[var(--gold-primary)]'
                }`}
              >
                {t('nav.women')}
              </Link>
              <Link
                to="/unisex"
                className={`transition-colors ${
                  currentPath === '/unisex' ? 'text-[var(--gold-primary)] font-bold' : 'text-[var(--text-primary)] hover:text-[var(--gold-primary)]'
                }`}
              >
                {t('nav.unisex')}
              </Link>

              {/* COLLECTIONS Dropdown */}
              <div
                className="relative py-2"
                onMouseEnter={() => setCollectionsMegaOpen(true)}
                onMouseLeave={() => setCollectionsMegaOpen(false)}
              >
                <Link
                  to="/collections"
                  className={`flex items-center gap-1 transition-colors ${
                    currentPath.startsWith('/collections') ? 'text-[var(--gold-primary)] font-bold' : 'text-[var(--text-primary)] hover:text-[var(--gold-primary)]'
                  }`}
                >
                  <span>{t('nav.collections')}</span>
                  <ChevronDown className="w-3 h-3 transition-transform" />
                </Link>

                {collectionsMegaOpen && (
                  <div className="absolute top-full left-0 w-72 bg-[var(--bg-card)] border border-[var(--border-gold)] shadow-2xl p-4 animate-fade-in z-50">
                    <ul className="space-y-2.5 text-xs font-sans tracking-wide">
                      <li>
                        <Link to="/collections?c=royal-oud" className="block text-[var(--text-primary)] hover:text-[var(--gold-primary)] p-2 hover:bg-[var(--bg-secondary)] transition-colors">
                          <p className="font-cinzel text-xs font-semibold">{t('nav.royalOudCollection')}</p>
                          <p className="text-[11px] text-[var(--text-muted)]">Pure Assamese Wild Oud & Resins</p>
                        </Link>
                      </li>
                      <li>
                        <Link to="/collections?c=imperial-silk" className="block text-[var(--text-primary)] hover:text-[var(--gold-primary)] p-2 hover:bg-[var(--bg-secondary)] transition-colors">
                          <p className="font-cinzel text-xs font-semibold">{t('nav.silkRoadCollection')}</p>
                          <p className="text-[11px] text-[var(--text-muted)]">Taif Rose & Intoxicating Florals</p>
                        </Link>
                      </li>
                      <li>
                        <Link to="/collections?c=desert-gold" className="block text-[var(--text-primary)] hover:text-[var(--gold-primary)] p-2 hover:bg-[var(--bg-secondary)] transition-colors">
                          <p className="font-cinzel text-xs font-semibold">{t('nav.desertGoldCollection')}</p>
                          <p className="text-[11px] text-[var(--text-muted)]">Fossilized Amber & Solar Dew</p>
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <Link
                to="/the-house"
                className={`transition-colors ${
                  currentPath === '/the-house' ? 'text-[var(--gold-primary)] font-bold' : 'text-[var(--text-primary)] hover:text-[var(--gold-primary)]'
                }`}
              >
                {t('nav.theHouse')}
              </Link>
            </nav>

            {/* Mobile Hamburger Trigger */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-[var(--text-primary)] hover:text-[var(--gold-primary)] transition-colors focus:outline-none cursor-pointer"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Center Brand / Logo */}
            <div className="text-center">
              <Link to="/" className="inline-block group text-center focus:outline-none">
                <span className="block font-cinzel text-xl sm:text-2xl lg:text-3xl font-bold tracking-[0.28em] text-[var(--text-primary)] group-hover:text-[var(--gold-primary)] transition-colors">
                  ARABIAN SHEIKH
                </span>
                <span className="block text-[9px] uppercase tracking-[0.45em] text-[var(--gold-primary)] font-sans font-medium mt-0.5">
                  Haute Parfumerie Arabe
                </span>
              </Link>
            </div>

            {/* Right Action Icons, Theme Toggle & Language Selector */}
            <div className="flex items-center space-x-3 sm:space-x-4 text-[var(--text-primary)]">
              {/* Theme Toggle (Desktop) */}
              <div className="hidden sm:flex items-center">
                <ThemeToggle />
              </div>

              {/* Search Trigger */}
              <button
                onClick={onOpenSearch}
                className="p-2 hover:text-[var(--gold-primary)] transition-colors focus:outline-none cursor-pointer"
                aria-label="Search Fragrances"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link
                to="/account/wishlist"
                className="relative p-2 hover:text-[var(--gold-primary)] transition-colors focus:outline-none hidden sm:block"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[#D2A55F] text-[#130C05] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-badge-pop">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account */}
              <Link
                to={isAuthenticated ? '/account' : '/login'}
                className="p-2 hover:text-[var(--gold-primary)] transition-colors focus:outline-none hidden sm:block"
                aria-label="User Account"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Bag / Cart Trigger with Animated Counter */}
              <button
                onClick={openDrawer}
                className="relative p-2 hover:text-[var(--gold-primary)] transition-colors focus:outline-none cursor-pointer"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {totals.totalCount > 0 && (
                  <span
                    className={`absolute top-1 right-1 bg-[#D2A55F] text-[#130C05] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ${
                      cartBadgeAnimated ? 'animate-badge-pop' : ''
                    }`}
                  >
                    {totals.totalCount}
                  </span>
                )}
              </button>

              {/* Language Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 border border-[var(--border-gold-subtle)] hover:border-[var(--gold-primary)] text-xs font-sans uppercase tracking-widest text-[var(--text-primary)] hover:text-[var(--gold-primary)] transition-all bg-[var(--bg-card)] cursor-pointer shadow-sm"
                >
                  <Globe className="w-3.5 h-3.5 text-[var(--gold-primary)]" />
                  <span>{language.toUpperCase()}</span>
                  <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
                </button>

                {langDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-36 bg-[var(--bg-card)] border border-[var(--border-gold)] shadow-2xl py-1 z-50 animate-fade-in"
                    onMouseLeave={() => setLangDropdownOpen(false)}
                  >
                    {availableLanguages.map(l => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLanguage(l.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          language === l.code
                            ? 'bg-[var(--gold-primary)]/20 text-[var(--gold-primary)] font-semibold'
                            : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--gold-primary)]'
                        }`}
                      >
                        <span>{l.name}</span>
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">{l.short}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Fullscreen Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[var(--bg-primary)]/98 backdrop-blur-2xl flex flex-col justify-between p-6 animate-fade-in overflow-y-auto">
          <div>
            {/* Top Close Row & Theme Toggle */}
            <div className="flex items-center justify-between border-b border-[var(--border-gold-subtle)] pb-4">
              <div>
                <span className="font-cinzel text-lg font-bold tracking-[0.2em] text-[var(--text-primary)]">
                  ARABIAN SHEIKH
                </span>
                <p className="text-[8px] uppercase tracking-[0.3em] text-[var(--gold-primary)]">
                  Haute Parfumerie Arabe
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-[var(--text-muted)] hover:text-[var(--gold-primary)] transition-colors cursor-pointer"
                  aria-label="Close Navigation"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Navigation List */}
            <nav className="mt-6 space-y-4">
              <Link
                to="/shop"
                className="block font-cinzel text-xl tracking-[0.15em] text-[var(--text-primary)] hover:text-[var(--gold-primary)] transition-colors"
              >
                {t('nav.shop')}
              </Link>
              <div className="pl-4 space-y-2.5 border-l border-[var(--border-gold-subtle)]">
                <Link to="/men" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--gold-primary)]">
                  {t('nav.men')}
                </Link>
                <Link to="/women" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--gold-primary)]">
                  {t('nav.women')}
                </Link>
                <Link to="/unisex" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--gold-primary)]">
                  {t('nav.unisex')}
                </Link>
              </div>
              <Link
                to="/collections"
                className="block font-cinzel text-xl tracking-[0.15em] text-[var(--text-primary)] hover:text-[var(--gold-primary)] transition-colors"
              >
                {t('nav.collections')}
              </Link>
              <Link
                to="/the-house"
                className="block font-cinzel text-xl tracking-[0.15em] text-[var(--text-primary)] hover:text-[var(--gold-primary)] transition-colors"
              >
                {t('nav.theHouse')}
              </Link>
              <Link
                to="/about"
                className="block font-cinzel text-xl tracking-[0.15em] text-[var(--text-primary)] hover:text-[var(--gold-primary)] transition-colors"
              >
                {t('nav.about')}
              </Link>
              <Link
                to="/contact"
                className="block font-cinzel text-xl tracking-[0.15em] text-[var(--text-primary)] hover:text-[var(--gold-primary)] transition-colors"
              >
                {t('nav.contact')}
              </Link>
              <Link
                to={isAuthenticated ? '/account' : '/login'}
                className="block font-cinzel text-xl tracking-[0.15em] text-[var(--gold-primary)] hover:text-[var(--gold-light)] transition-colors"
              >
                {t('nav.account')} {isAuthenticated ? `(${user?.name?.split(' ')[0]})` : ''}
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="block font-cinzel text-lg tracking-[0.15em] text-gold-gradient font-bold"
                >
                  ★ {t('nav.admin')}
                </Link>
              )}
            </nav>
          </div>

          {/* Bottom Language & Concierge Info */}
          <div className="border-t border-[var(--border-gold-subtle)] pt-5 mt-6">
            <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-2.5">
              Select Language
            </p>
            <div className="flex gap-2">
              {availableLanguages.map(l => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`flex-1 py-2 text-xs uppercase tracking-wider font-sans border transition-all cursor-pointer ${
                    language === l.code
                      ? 'border-[#D2A55F] bg-[#D2A55F] text-[#130C05] font-bold shadow'
                      : 'border-[var(--border-gold-subtle)] text-[var(--text-primary)] bg-[var(--bg-card)]'
                  }`}
                >
                  {l.name}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-3 text-center">
              Dubai Flagship Palace • Mayfair Salon • Vendôme Atelier
            </p>
          </div>
        </div>
      )}
    </>
  );
}
