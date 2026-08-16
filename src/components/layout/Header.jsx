import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
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
  const { currentPath, navigate } = useRouter();
  const { t, language, setLanguage, availableLanguages } = useTranslation();
  const { totals, openDrawer } = useCart();
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

  // Close mobile menu on path change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShopMegaOpen(false);
    setCollectionsMegaOpen(false);
  }, [currentPath]);

  const isDarkPage = currentPath === '/' || currentPath.startsWith('/the-house') || currentPath.startsWith('/admin');

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? 'bg-[#0F0D0C]/95 backdrop-blur-md border-b border-[#C6A15B]/20 py-3.5 shadow-2xl'
            : 'bg-gradient-to-b from-[#0F0D0C]/90 via-[#0F0D0C]/60 to-transparent py-5'
        }`}
      >
        {/* Top VIP Micro-Bar (when not scrolled) */}
        {!isScrolled && (
          <div className="hidden lg:block border-b border-[#C6A15B]/10 pb-2 mb-3">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-[#C5B8A8]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-[#C6A15B]" />
                <span>Complimentary Royal Express Delivery on Orders Over $200</span>
              </div>
              <div className="flex items-center gap-6">
                <Link to="/the-house" className="hover:text-[#C6A15B] transition-colors">
                  Private Salons & Boutiques
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-[#C6A15B] flex items-center gap-1 font-semibold">
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
                    currentPath.startsWith('/shop') ? 'text-[#C6A15B]' : 'text-[#F3EEE5] hover:text-[#C6A15B]'
                  }`}
                >
                  <span>{t('nav.shop')}</span>
                  <ChevronDown className="w-3 h-3 transition-transform" />
                </Link>

                {/* Shop Mega Dropdown */}
                {shopMegaOpen && (
                  <div className="absolute top-full left-0 w-[580px] bg-[#1C120E] border border-[#C6A15B]/30 shadow-2xl p-6 grid grid-cols-2 gap-6 animate-fade-in">
                    <div>
                      <h4 className="text-[11px] font-sans uppercase tracking-[0.25em] text-[#C6A15B] border-b border-[#C6A15B]/20 pb-2 mb-3">
                        {t('shop.allProducts')}
                      </h4>
                      <ul className="space-y-2.5 text-xs tracking-wider normal-case font-sans">
                        <li>
                          <Link to="/shop" className="text-[#F3EEE5] hover:text-[#C6A15B] flex items-center justify-between group">
                            <span>{t('nav.allPerfumes')}</span>
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#C6A15B]" />
                          </Link>
                        </li>
                        <li>
                          <Link to="/men" className="text-[#F3EEE5] hover:text-[#C6A15B] flex items-center justify-between group">
                            <span>{t('home.menTitle')}</span>
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#C6A15B]" />
                          </Link>
                        </li>
                        <li>
                          <Link to="/women" className="text-[#F3EEE5] hover:text-[#C6A15B] flex items-center justify-between group">
                            <span>{t('home.womenTitle')}</span>
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#C6A15B]" />
                          </Link>
                        </li>
                        <li>
                          <Link to="/unisex" className="text-[#F3EEE5] hover:text-[#C6A15B] flex items-center justify-between group">
                            <span>{t('home.unisexTitle')}</span>
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#C6A15B]" />
                          </Link>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-[11px] font-sans uppercase tracking-[0.25em] text-[#C6A15B] border-b border-[#C6A15B]/20 pb-2 mb-3">
                        {t('home.fragranceFamiliesTitle')}
                      </h4>
                      <ul className="space-y-2 text-xs tracking-wider normal-case font-sans">
                        <li>
                          <Link to="/shop?family=woody" className="text-[#F3EEE5] hover:text-[#C6A15B] flex items-center justify-between">
                            <span>{t('families.woody')}</span>
                            <span className="font-arabic text-[#C6A15B] text-xs">الخشبية (عود)</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/shop?family=oriental" className="text-[#F3EEE5] hover:text-[#C6A15B] flex items-center justify-between">
                            <span>{t('families.oriental')}</span>
                            <span className="font-arabic text-[#C6A15B] text-xs">الشرقية</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/shop?family=floral" className="text-[#F3EEE5] hover:text-[#C6A15B] flex items-center justify-between">
                            <span>{t('families.floral')}</span>
                            <span className="font-arabic text-[#C6A15B] text-xs">الزهرية</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/shop?family=fresh" className="text-[#F3EEE5] hover:text-[#C6A15B] flex items-center justify-between">
                            <span>{t('families.fresh')}</span>
                            <span className="font-arabic text-[#C6A15B] text-xs">المنعشة</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/shop?family=fruity" className="text-[#F3EEE5] hover:text-[#C6A15B] flex items-center justify-between">
                            <span>{t('families.fruity')}</span>
                            <span className="font-arabic text-[#C6A15B] text-xs">الفاكهية</span>
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
                  currentPath === '/men' ? 'text-[#C6A15B]' : 'text-[#F3EEE5] hover:text-[#C6A15B]'
                }`}
              >
                {t('nav.men')}
              </Link>
              <Link
                to="/women"
                className={`transition-colors ${
                  currentPath === '/women' ? 'text-[#C6A15B]' : 'text-[#F3EEE5] hover:text-[#C6A15B]'
                }`}
              >
                {t('nav.women')}
              </Link>
              <Link
                to="/unisex"
                className={`transition-colors ${
                  currentPath === '/unisex' ? 'text-[#C6A15B]' : 'text-[#F3EEE5] hover:text-[#C6A15B]'
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
                    currentPath.startsWith('/collections') ? 'text-[#C6A15B]' : 'text-[#F3EEE5] hover:text-[#C6A15B]'
                  }`}
                >
                  <span>{t('nav.collections')}</span>
                  <ChevronDown className="w-3 h-3 transition-transform" />
                </Link>

                {collectionsMegaOpen && (
                  <div className="absolute top-full left-0 w-72 bg-[#1C120E] border border-[#C6A15B]/30 shadow-2xl p-4 animate-fade-in">
                    <ul className="space-y-2.5 text-xs font-sans tracking-wide">
                      <li>
                        <Link to="/collections?c=royal-oud" className="block text-[#F3EEE5] hover:text-[#C6A15B] p-2 hover:bg-[#2B1A12] transition-colors">
                          <p className="font-cinzel text-xs font-semibold">{t('nav.royalOudCollection')}</p>
                          <p className="text-[11px] text-[#C5B8A8]">Pure Assamese Wild Oud & Sacred Resins</p>
                        </Link>
                      </li>
                      <li>
                        <Link to="/collections?c=imperial-silk" className="block text-[#F3EEE5] hover:text-[#C6A15B] p-2 hover:bg-[#2B1A12] transition-colors">
                          <p className="font-cinzel text-xs font-semibold">{t('nav.silkRoadCollection')}</p>
                          <p className="text-[11px] text-[#C5B8A8]">Taif Rose & Intoxicating Florals</p>
                        </Link>
                      </li>
                      <li>
                        <Link to="/collections?c=desert-gold" className="block text-[#F3EEE5] hover:text-[#C6A15B] p-2 hover:bg-[#2B1A12] transition-colors">
                          <p className="font-cinzel text-xs font-semibold">{t('nav.desertGoldCollection')}</p>
                          <p className="text-[11px] text-[#C5B8A8]">Fossilized Amber & Bergamot Solar Dew</p>
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <Link
                to="/the-house"
                className={`transition-colors ${
                  currentPath === '/the-house' ? 'text-[#C6A15B]' : 'text-[#F3EEE5] hover:text-[#C6A15B]'
                }`}
              >
                {t('nav.theHouse')}
              </Link>
            </nav>

            {/* Mobile Hamburger Trigger */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-[#F3EEE5] hover:text-[#C6A15B] transition-colors focus:outline-none"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Center Brand / Logo */}
            <div className="text-center">
              <Link to="/" className="inline-block group text-center focus:outline-none">
                <span className="block font-cinzel text-xl sm:text-2xl lg:text-3xl font-bold tracking-[0.28em] text-[#F3EEE5] group-hover:text-[#C6A15B] transition-colors">
                  ARABIAN SHEIKH
                </span>
                <span className="block text-[9px] uppercase tracking-[0.45em] text-[#C6A15B] font-sans font-medium mt-0.5">
                  Haute Parfumerie Arabe
                </span>
              </Link>
            </div>

            {/* Right Action Icons & Language Selector */}
            <div className="flex items-center space-x-4 sm:space-x-5 text-[#F3EEE5]">
              {/* Search Trigger */}
              <button
                onClick={onOpenSearch}
                className="p-2 hover:text-[#C6A15B] transition-colors focus:outline-none"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link
                to="/account/wishlist"
                className="relative p-2 hover:text-[#C6A15B] transition-colors focus:outline-none hidden sm:block"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[#C6A15B] text-[#0F0D0C] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account */}
              <Link
                to={isAuthenticated ? '/account' : '/login'}
                className="p-2 hover:text-[#C6A15B] transition-colors focus:outline-none hidden sm:block"
                aria-label="User Account"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Bag / Cart Trigger */}
              <button
                onClick={openDrawer}
                className="relative p-2 hover:text-[#C6A15B] transition-colors focus:outline-none"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {totals.totalCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[#C6A15B] text-[#0F0D0C] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {totals.totalCount}
                  </span>
                )}
              </button>

              {/* Language Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 border border-[#C6A15B]/30 hover:border-[#C6A15B] text-xs font-sans uppercase tracking-widest text-[#F3EEE5] hover:text-[#C6A15B] transition-all bg-[#1C120E]/70"
                >
                  <Globe className="w-3.5 h-3.5 text-[#C6A15B]" />
                  <span>{language.toUpperCase()}</span>
                  <ChevronDown className="w-3 h-3 text-[#C5B8A8]" />
                </button>

                {langDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-36 bg-[#1C120E] border border-[#C6A15B]/30 shadow-2xl py-1 z-50 animate-fade-in"
                    onMouseLeave={() => setLangDropdownOpen(false)}
                  >
                    {availableLanguages.map(l => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLanguage(l.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between transition-colors ${
                          language === l.code
                            ? 'bg-[#C6A15B]/20 text-[#C6A15B] font-semibold'
                            : 'text-[#F3EEE5] hover:bg-[#2B1A12] hover:text-[#C6A15B]'
                        }`}
                      >
                        <span>{l.name}</span>
                        <span className="text-[10px] font-mono text-[#C5B8A8]">{l.short}</span>
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
        <div className="fixed inset-0 z-50 bg-[#0F0D0C]/98 backdrop-blur-xl flex flex-col justify-between p-6 animate-fade-in overflow-y-auto">
          <div>
            {/* Top Close Row */}
            <div className="flex items-center justify-between border-b border-[#C6A15B]/20 pb-4">
              <div>
                <span className="font-cinzel text-lg font-bold tracking-[0.2em] text-[#F3EEE5]">
                  ARABIAN SHEIKH
                </span>
                <p className="text-[8px] uppercase tracking-[0.3em] text-[#C6A15B]">
                  Haute Parfumerie Arabe
                </p>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[#C5B8A8] hover:text-[#C6A15B] transition-colors"
                aria-label="Close Navigation"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation List */}
            <nav className="mt-8 space-y-5">
              <Link
                to="/shop"
                className="block font-cinzel text-xl tracking-[0.15em] text-[#F3EEE5] hover:text-[#C6A15B] transition-colors"
              >
                {t('nav.shop')}
              </Link>
              <div className="pl-4 space-y-3 border-l border-[#C6A15B]/20">
                <Link to="/men" className="block text-sm text-[#C5B8A8] hover:text-[#C6A15B]">
                  {t('nav.men')}
                </Link>
                <Link to="/women" className="block text-sm text-[#C5B8A8] hover:text-[#C6A15B]">
                  {t('nav.women')}
                </Link>
                <Link to="/unisex" className="block text-sm text-[#C5B8A8] hover:text-[#C6A15B]">
                  {t('nav.unisex')}
                </Link>
              </div>
              <Link
                to="/collections"
                className="block font-cinzel text-xl tracking-[0.15em] text-[#F3EEE5] hover:text-[#C6A15B] transition-colors"
              >
                {t('nav.collections')}
              </Link>
              <Link
                to="/the-house"
                className="block font-cinzel text-xl tracking-[0.15em] text-[#F3EEE5] hover:text-[#C6A15B] transition-colors"
              >
                {t('nav.theHouse')}
              </Link>
              <Link
                to="/about"
                className="block font-cinzel text-xl tracking-[0.15em] text-[#F3EEE5] hover:text-[#C6A15B] transition-colors"
              >
                {t('nav.about')}
              </Link>
              <Link
                to="/contact"
                className="block font-cinzel text-xl tracking-[0.15em] text-[#F3EEE5] hover:text-[#C6A15B] transition-colors"
              >
                {t('nav.contact')}
              </Link>
              <Link
                to={isAuthenticated ? '/account' : '/login'}
                className="block font-cinzel text-xl tracking-[0.15em] text-[#C6A15B] hover:text-[#DFBF7A] transition-colors"
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
          <div className="border-t border-[#C6A15B]/20 pt-6 mt-8">
            <p className="text-xs uppercase tracking-widest text-[#C5B8A8] mb-3">
              Select Language / Изберете език / Idioma
            </p>
            <div className="flex gap-2">
              {availableLanguages.map(l => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`flex-1 py-2 text-xs uppercase tracking-wider font-sans border transition-all ${
                    language === l.code
                      ? 'border-[#C6A15B] bg-[#C6A15B] text-[#0F0D0C] font-bold'
                      : 'border-[#C6A15B]/30 text-[#F3EEE5] bg-[#1C120E]'
                  }`}
                >
                  {l.name}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#C5B8A8] mt-4 text-center">
              Dubai Flagship Palace • Mayfair Salon • Vendôme Atelier
            </p>
          </div>
        </div>
      )}
    </>
  );
}
