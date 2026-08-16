import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { productService } from '../services/productService';
import ProductCard from '../components/common/ProductCard';
import { ProductSkeleton } from '../components/common/SkeletonLoader';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Flame,
  Feather,
  Sun,
  Droplets,
  Trees,
  Star,
  Compass,
  Check
} from 'lucide-react';

export default function Home() {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [featured, best] = await Promise.all([
          productService.getFeaturedProducts(),
          productService.getBestSellers()
        ]);
        setFeaturedProducts(featured);
        setBestSellers(best);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const spotlight = featuredProducts[0];
  const stackedSpotlights = featuredProducts.slice(1, 3);

  // 5 Explicit Fragrance Families
  const FAMILIES_DATA = [
    {
      id: 'woody',
      name: t('families.woody'),
      arabic: t('families.woodyArabic'),
      desc: t('families.woodyDesc'),
      notes: ['Oud', 'Sandalwood', 'Cedar', 'Vetiver', 'Patchouli'],
      icon: Trees,
      isCore: true,
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'oriental',
      name: t('families.oriental'),
      arabic: t('families.orientalArabic'),
      desc: t('families.orientalDesc'),
      notes: ['Amber', 'Vanilla', 'Bakhoor', 'Resins', 'Spices', 'Musk'],
      icon: Flame,
      isCore: true,
      image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'floral',
      name: t('families.floral'),
      arabic: t('families.floralArabic'),
      desc: t('families.floralDesc'),
      notes: ['Rose', 'Jasmine', 'Lily', 'Violet', 'Orange Blossom'],
      icon: Feather,
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'fresh',
      name: t('families.fresh'),
      arabic: t('families.freshArabic'),
      desc: t('families.freshDesc'),
      notes: ['Citrus', 'Bergamot', 'Lemon', 'Fresh leaves', 'Clean airy notes'],
      icon: Droplets,
      image: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'fruity',
      name: t('families.fruity'),
      arabic: t('families.fruityArabic'),
      desc: t('families.fruityDesc'),
      notes: ['Apple', 'Pear', 'Peach', 'Strawberry', 'Berries', 'Mango'],
      icon: Sun,
      image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80'
    }
  ];

  return (
    <div className="space-y-24 sm:space-y-32 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center bg-[#0F0D0C] overflow-hidden pt-24 pb-16">
        {/* Background Image with Dark Brown/Black Gradient Mask */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=2000&q=90"
            alt="Arabian Luxury Perfumery"
            className="w-full h-full object-cover object-center opacity-30 scale-105 transform motion-safe:transition-transform motion-safe:duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0D0C] via-[#0F0D0C]/75 to-[#0F0D0C]/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(74,47,34,0.35)_0%,_transparent_70%)]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 animate-fade-in">
          {/* Subtitle Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#C6A15B]/40 bg-[#1C120E]/80 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span className="font-cinzel text-xs uppercase tracking-[0.3em] text-[#C6A15B] font-semibold">
              {t('home.heroSubtitle')}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-cinzel text-4xl sm:text-6xl lg:text-7xl font-bold tracking-[0.1em] text-[#F3EEE5] leading-[1.1] uppercase">
            {t('home.heroTitle')}
          </h1>

          {/* Supporting Text */}
          <p className="font-sans text-sm sm:text-lg text-[#C5B8A8] max-w-2xl mx-auto leading-relaxed font-light">
            {t('home.heroDesc')}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/shop"
              className="luxury-btn-gold px-8 py-4 text-xs tracking-[0.25em] flex items-center justify-center gap-3 w-full sm:w-auto shadow-2xl"
            >
              <span>{t('home.exploreCollection')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/the-house"
              className="luxury-btn-outline px-8 py-4 text-xs tracking-[0.25em] w-full sm:w-auto text-center"
            >
              {t('home.discoverHouse')}
            </Link>
          </div>

          {/* Bottom Trust Indicators */}
          <div className="pt-12 grid grid-cols-3 gap-4 max-w-xl mx-auto border-t border-[#C6A15B]/15 text-[11px] uppercase tracking-[0.2em] text-[#C5B8A8]">
            <div className="flex flex-col items-center">
              <span className="font-cinzel text-[#C6A15B] font-bold text-sm">35-40%</span>
              <span>Extrait Concentration</span>
            </div>
            <div className="flex flex-col items-center border-x border-[#C6A15B]/15">
              <span className="font-cinzel text-[#C6A15B] font-bold text-sm">Wild Aged</span>
              <span>Dehn Al Oud</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-cinzel text-[#C6A15B] font-bold text-sm">100% Insured</span>
              <span>Express Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED COLLECTION (Asymmetric Luxury Editorial Layout) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#C6A15B]/20 pb-6 mb-12">
          <div>
            <span className="font-cinzel text-xs uppercase tracking-[0.3em] text-[#C6A15B] block mb-2 font-semibold">
              {t('home.featuredSubtitle')}
            </span>
            <h2 className="font-cinzel text-2xl sm:text-4xl font-bold text-[#F3EEE5] uppercase tracking-wide">
              {t('home.featuredTitle')}
            </h2>
          </div>
          <Link
            to="/collections"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#C6A15B] hover:text-[#DFBF7A] font-cinzel transition-colors"
          >
            <span>{t('home.discoverCollection')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Asymmetric Composition */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ProductSkeleton />
            </div>
            <div className="space-y-6">
              <ProductSkeleton />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Spotlight Main Large Card (7 cols) */}
            {spotlight && (
              <div className="lg:col-span-7 bg-[#1C120E] border border-[#C6A15B]/30 hover:border-[#C6A15B]/70 transition-all duration-500 flex flex-col md:flex-row overflow-hidden group shadow-2xl">
                <div className="md:w-1/2 aspect-[4/5] md:aspect-auto relative overflow-hidden bg-[#140D0A]">
                  <img
                    src={spotlight.images?.[0]}
                    alt={spotlight.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-[#C6A15B] text-[#0F0D0C] font-cinzel text-xs font-bold uppercase tracking-widest px-3 py-1">
                    Spotlight Masterpiece
                  </div>
                </div>
                <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-b from-[#1C120E] to-[#2B1A12]">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#C6A15B]">
                      <span>{spotlight.fragranceFamily}</span>
                      <span className="font-arabic text-sm">{spotlight.familyArabic}</span>
                    </div>
                    <h3 className="font-cinzel text-2xl font-bold text-[#F3EEE5] group-hover:text-[#C6A15B] transition-colors">
                      {spotlight.name}
                    </h3>
                    <p className="font-arabic text-sm text-[#C5B8A8]">{spotlight.arabicName}</p>
                    <p className="text-xs text-[#C5B8A8] leading-relaxed line-clamp-3 font-sans">
                      {spotlight.description}
                    </p>

                    <div className="pt-2">
                      <p className="text-[11px] uppercase tracking-wider text-[#C6A15B] font-cinzel mb-1">
                        Key Notes:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {spotlight.topNotes?.map(note => (
                          <span key={note} className="text-[11px] px-2 py-0.5 bg-[#0F0D0C] border border-[#C6A15B]/20 text-[#F3EEE5]">
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#C6A15B]/20 flex items-center justify-between mt-6">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#C5B8A8] block">Price</span>
                      <span className="font-cinzel text-2xl font-bold text-[#C6A15B]">
                        ${spotlight.price}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(`/product/${spotlight.id}`)}
                      className="luxury-btn-gold px-5 py-2.5 text-xs flex items-center gap-2"
                    >
                      <span>Explore Flacon</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Stacked Secondary Items (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-6">
              {stackedSpotlights.map(item => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/product/${item.id}`)}
                  className="cursor-pointer bg-[#1C120E] border border-[#C6A15B]/20 hover:border-[#C6A15B]/60 p-4 flex gap-4 transition-all duration-300 group flex-1 shadow-lg"
                >
                  <img
                    src={item.images?.[0]}
                    alt={item.name}
                    className="w-28 sm:w-32 aspect-[4/5] object-cover bg-[#140D0A] shrink-0 border border-[#C6A15B]/15 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex flex-col justify-between flex-1 py-1">
                    <div>
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#C6A15B]">
                        <span>{item.fragranceFamily}</span>
                        <span className="font-arabic">{item.familyArabic}</span>
                      </div>
                      <h4 className="font-cinzel text-base font-semibold text-[#F3EEE5] group-hover:text-[#C6A15B] transition-colors line-clamp-1 mt-1">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[#C5B8A8] line-clamp-2 mt-1">
                        {item.tagline}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#C6A15B]/15">
                      <span className="font-cinzel text-base font-bold text-[#C6A15B]">
                        ${item.price}
                      </span>
                      <span className="text-xs text-[#C6A15B] uppercase font-cinzel flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. SHOP BY GENDER (3 Large Editorial Panels) */}
      <section className="bg-[#140D0A] py-16 sm:py-24 border-y border-[#C6A15B]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-cinzel text-xs uppercase tracking-[0.3em] text-[#C6A15B] block mb-2 font-semibold">
              {t('home.shopByGenderSubtitle')}
            </span>
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F3EEE5] uppercase">
              {t('home.shopByGenderTitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Panel 1: Men */}
            <div
              onClick={() => navigate('/men')}
              className="cursor-pointer group relative h-[480px] bg-[#1C120E] border border-[#C6A15B]/25 hover:border-[#C6A15B] transition-all duration-500 overflow-hidden flex flex-col justify-end p-8 shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=85"
                alt="Men Collection"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 opacity-60 group-hover:opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F0D0C] via-[#0F0D0C]/60 to-transparent" />

              <div className="relative z-10 space-y-3">
                <span className="text-xs uppercase tracking-[0.3em] text-[#C6A15B] font-cinzel font-semibold">
                  Noble Masculine Silhouettes
                </span>
                <h3 className="font-cinzel text-3xl font-bold text-[#F3EEE5] uppercase">
                  {t('home.menTitle')}
                </h3>
                <p className="text-xs text-[#C5B8A8] font-sans leading-relaxed">
                  {t('home.menDesc')}
                </p>
                <div className="pt-2">
                  <span className="luxury-btn-outline px-6 py-2.5 text-xs inline-flex items-center gap-2 group-hover:bg-[#C6A15B] group-hover:text-[#0F0D0C] transition-all">
                    <span>{t('home.explore')} {t('nav.men')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* Panel 2: Women */}
            <div
              onClick={() => navigate('/women')}
              className="cursor-pointer group relative h-[480px] bg-[#1C120E] border border-[#C6A15B]/25 hover:border-[#C6A15B] transition-all duration-500 overflow-hidden flex flex-col justify-end p-8 shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85"
                alt="Women Collection"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 opacity-60 group-hover:opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F0D0C] via-[#0F0D0C]/60 to-transparent" />

              <div className="relative z-10 space-y-3">
                <span className="text-xs uppercase tracking-[0.3em] text-[#C6A15B] font-cinzel font-semibold">
                  Royalty & Velvet Florals
                </span>
                <h3 className="font-cinzel text-3xl font-bold text-[#F3EEE5] uppercase">
                  {t('home.womenTitle')}
                </h3>
                <p className="text-xs text-[#C5B8A8] font-sans leading-relaxed">
                  {t('home.womenDesc')}
                </p>
                <div className="pt-2">
                  <span className="luxury-btn-outline px-6 py-2.5 text-xs inline-flex items-center gap-2 group-hover:bg-[#C6A15B] group-hover:text-[#0F0D0C] transition-all">
                    <span>{t('home.explore')} {t('nav.women')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* Panel 3: Unisex */}
            <div
              onClick={() => navigate('/unisex')}
              className="cursor-pointer group relative h-[480px] bg-[#1C120E] border border-[#C6A15B]/25 hover:border-[#C6A15B] transition-all duration-500 overflow-hidden flex flex-col justify-end p-8 shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85"
                alt="Unisex Collection"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 opacity-60 group-hover:opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F0D0C] via-[#0F0D0C]/60 to-transparent" />

              <div className="relative z-10 space-y-3">
                <span className="text-xs uppercase tracking-[0.3em] text-[#C6A15B] font-cinzel font-semibold">
                  Private Reserve
                </span>
                <h3 className="font-cinzel text-3xl font-bold text-[#F3EEE5] uppercase">
                  {t('home.unisexTitle')}
                </h3>
                <p className="text-xs text-[#C5B8A8] font-sans leading-relaxed">
                  {t('home.unisexDesc')}
                </p>
                <div className="pt-2">
                  <span className="luxury-btn-outline px-6 py-2.5 text-xs inline-flex items-center gap-2 group-hover:bg-[#C6A15B] group-hover:text-[#0F0D0C] transition-all">
                    <span>{t('home.explore')} {t('nav.unisex')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE 5 FRAGRANCE FAMILIES (Floral, Oriental/Amber, Woody, Fresh, Fruity) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-cinzel text-xs uppercase tracking-[0.3em] text-[#C6A15B] block mb-2 font-semibold">
            {t('home.fragranceFamiliesSubtitle')}
          </span>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F3EEE5] uppercase">
            {t('home.fragranceFamiliesTitle')}
          </h2>
          <p className="text-xs text-[#C5B8A8] mt-3 max-w-xl mx-auto">
            Explore the five sovereign pillars that form the architecture of Arabian Sheikh Haute Parfumerie.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {FAMILIES_DATA.map((fam) => {
            const Icon = fam.icon;
            return (
              <div
                key={fam.id}
                onClick={() => navigate(`/shop?family=${fam.id}`)}
                className={`cursor-pointer p-6 bg-[#1C120E] border transition-all duration-400 flex flex-col justify-between group hover:-translate-y-1 shadow-lg ${
                  fam.isCore
                    ? 'border-[#C6A15B]/50 hover:border-[#C6A15B] bg-gradient-to-b from-[#2B1A12] to-[#1C120E]'
                    : 'border-[#C6A15B]/20 hover:border-[#C6A15B]/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-none border border-[#C6A15B]/40 bg-[#0F0D0C] flex items-center justify-center text-[#C6A15B] group-hover:bg-[#C6A15B] group-hover:text-[#0F0D0C] transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-arabic text-base text-[#DFBF7A]">{fam.arabic}</span>
                  </div>

                  <h3 className="font-cinzel text-lg font-bold text-[#F3EEE5] group-hover:text-[#C6A15B] transition-colors mb-2">
                    {fam.name}
                  </h3>

                  <p className="text-xs text-[#C5B8A8] leading-relaxed mb-4 font-sans">
                    {fam.desc}
                  </p>

                  <div className="space-y-1 pt-3 border-t border-[#C6A15B]/15">
                    <span className="text-[10px] uppercase tracking-wider text-[#C6A15B] font-cinzel block">
                      Sacred Notes:
                    </span>
                    <p className="text-[11px] text-[#F3EEE5]/80 font-sans">
                      {fam.notes.join(' • ')}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-4 flex items-center justify-between text-xs text-[#C6A15B] uppercase font-cinzel font-semibold group-hover:text-[#DFBF7A]">
                  <span>Explore {fam.name.split('/')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#C6A15B]/20 pb-6 mb-12">
          <div>
            <span className="font-cinzel text-xs uppercase tracking-[0.3em] text-[#C6A15B] block mb-2 font-semibold">
              {t('home.bestSellersSubtitle')}
            </span>
            <h2 className="font-cinzel text-2xl sm:text-4xl font-bold text-[#F3EEE5] uppercase">
              {t('home.bestSellersTitle')}
            </h2>
          </div>
          <Link
            to="/shop?sort=rating"
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#C6A15B] hover:text-[#DFBF7A] font-cinzel transition-colors"
          >
            <span>{t('home.viewAllBestSellers')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 6. ARABIAN HERITAGE & THE ART OF OUD & BAKHOOR */}
      <section className="relative bg-[#1C120E] border-y border-[#C6A15B]/30 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#C6A15B]/40 bg-[#0F0D0C]/80">
                <Compass className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#C6A15B]">
                  {t('home.heritageSubtitle')}
                </span>
              </div>

              <h2 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#F3EEE5] uppercase leading-tight">
                {t('home.heritageTitle')}
              </h2>

              <p className="text-sm sm:text-base text-[#C5B8A8] font-sans leading-relaxed">
                {t('home.heritageDesc')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="p-4 bg-[#0F0D0C]/60 border border-[#C6A15B]/20">
                  <h4 className="font-cinzel text-sm font-semibold text-[#F3EEE5] uppercase mb-1">
                    The Art of Oud
                  </h4>
                  <p className="text-xs text-[#C5B8A8] leading-relaxed">
                    Distilled from rare Assamese and Cambodian aged trees through traditional copper alembics for unmatched depth.
                  </p>
                </div>

                <div className="p-4 bg-[#0F0D0C]/60 border border-[#C6A15B]/20">
                  <h4 className="font-cinzel text-sm font-semibold text-[#F3EEE5] uppercase mb-1">
                    The Ritual of Bakhoor
                  </h4>
                  <p className="text-xs text-[#C5B8A8] leading-relaxed">
                    Incense chips infused for 40 days in pure amber oils to perfume the room and garments before grand occasions.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/the-house"
                  className="luxury-btn-gold px-8 py-3.5 text-xs inline-flex items-center gap-2"
                >
                  <span>{t('home.readOurHeritage')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Visual Composition */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] bg-[#0F0D0C] border-2 border-[#C6A15B]/40 shadow-2xl overflow-hidden group">
                <img
                  src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85"
                  alt="Arabian Oud & Bakhoor Heritage"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0D0C] via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-[#1C120E]/90 border border-[#C6A15B]/30 backdrop-blur-md">
                  <p className="font-arabic text-sm text-[#DFBF7A]">
                    "العطر لغة الملوك ورمز الكرم العربي الأصيل"
                  </p>
                  <p className="text-[11px] text-[#C5B8A8] font-cinzel mt-1 uppercase tracking-wider">
                    — The Royal Arabian House of Perfumes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-cinzel text-xs uppercase tracking-[0.3em] text-[#C6A15B] block mb-2 font-semibold">
            {t('home.testimonialsSubtitle')}
          </span>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F3EEE5] uppercase">
            {t('home.testimonialsTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-[#1C120E] border border-[#C6A15B]/20 relative flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center gap-1 text-[#C6A15B]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#F3EEE5] leading-relaxed font-editorial italic text-lg">
                "Dehn Al Oud Royal is extraordinary. It captures the true warmth of Arabian hospitality and wild resins without a trace of harsh synthetic notes."
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-[#C6A15B]/15">
              <h4 className="font-cinzel text-xs font-bold text-[#C6A15B] uppercase tracking-wider">
                His Excellency Tariq Al-Fassi
              </h4>
              <p className="text-[11px] text-[#C5B8A8]">Riyadh, Saudi Arabia</p>
            </div>
          </div>

          <div className="p-8 bg-[#2B1A12] border border-[#C6A15B]/40 relative flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center gap-1 text-[#C6A15B]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#F3EEE5] leading-relaxed font-editorial italic text-lg">
                "The presentation, the weight of the gold zamak cap, and the pure Taif rose nectar make every wear a sensory ceremony. Remarkable longevity."
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-[#C6A15B]/15">
              <h4 className="font-cinzel text-xs font-bold text-[#C6A15B] uppercase tracking-wider">
                Lady Charlotte Montrose
              </h4>
              <p className="text-[11px] text-[#C5B8A8]">Mayfair, London</p>
            </div>
          </div>

          <div className="p-8 bg-[#1C120E] border border-[#C6A15B]/20 relative flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center gap-1 text-[#C6A15B]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#F3EEE5] leading-relaxed font-editorial italic text-lg">
                "Amber Al Malaki is the pinnacle of warm oriental sophistication. The combination of ambergris, vanilla, and bakhoor smoke is sheer perfection."
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-[#C6A15B]/15">
              <h4 className="font-cinzel text-xs font-bold text-[#C6A15B] uppercase tracking-wider">
                Dr. Gabriel Laurent
              </h4>
              <p className="text-[11px] text-[#C5B8A8]">Paris, France</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
