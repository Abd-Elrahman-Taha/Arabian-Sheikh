import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { productService } from '../services/productService';
import ProductSlider from '../components/common/ProductSlider';
import { ProductSkeleton } from '../components/common/SkeletonLoader';
import AnimatedCounter from '../components/common/AnimatedCounter';
import TextReveal from '../components/common/TextReveal';
import ScrollReveal, { ScrollRevealItem } from '../components/common/ScrollReveal';
import ArabianLogo from '../components/common/ArabianLogo';
import CamelCaravan from '../components/motion/CamelCaravan';
import heroPalaceImg from '../assets/hero_arabian_palace.jpg';
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
  Crown,
  Compass,
  Check,
  Clock,
  Gem,
  Building
} from 'lucide-react';

export default function Home() {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const [bestSellers, setBestSellers] = useState([]);
  const [luxuryProducts, setLuxuryProducts] = useState([]);
  const [royalProducts, setRoyalProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [best, luxury, royal] = await Promise.all([
          productService.getBestSellers(),
          productService.getLuxuryCollection(),
          productService.getRoyalCollection()
        ]);
        setBestSellers(best);
        setLuxuryProducts(luxury);
        setRoyalProducts(royal);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  // 5 Explicit Fragrance Families
  const FAMILIES_DATA = [
    {
      id: 'woody',
      name: t('families.woody'),
      arabic: t('families.woodyArabic'),
      desc: t('families.woodyDesc'),
      notes: ['Aged Assamese Oud', 'Royal Sandalwood', 'Smoky Cedar', 'Dark Patchouli'],
      icon: Trees,
      isCore: true,
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'oriental',
      name: t('families.oriental'),
      arabic: t('families.orientalArabic'),
      desc: t('families.orientalDesc'),
      notes: ['Fossilized Amber', 'Sacred Bakhoor', 'Bourbon Vanilla', 'Frankincense Tears'],
      icon: Flame,
      isCore: true,
      image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'floral',
      name: t('families.floral'),
      arabic: t('families.floralArabic'),
      desc: t('families.floralDesc'),
      notes: ['Mountain Taif Rose', 'Damascene Petals', 'Night Jasmine', 'White Musk'],
      icon: Feather,
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'fresh',
      name: t('families.fresh'),
      arabic: t('families.freshArabic'),
      desc: t('families.freshDesc'),
      notes: ['Calabrian Bergamot', 'Oasis Palm Dew', 'Cooling Mint', 'Crisp Cedar'],
      icon: Droplets,
      image: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'fruity',
      name: t('families.fruity'),
      arabic: t('families.fruityArabic'),
      desc: t('families.fruityDesc'),
      notes: ['Babylon Sun Fig', 'Spiced Pomegranate', 'Sweet Plum', 'Cardamom Nectar'],
      icon: Sun,
      image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80'
    }
  ];

  return (
    <div className="w-full pb-0 overflow-x-hidden">
      
      {/* =========================================================================
          1. HERO SECTION: CINEMATIC ARABIAN PALACE BACKGROUND & LOGO
          ========================================================================= */}
      <section className="relative min-h-[96vh] flex items-center justify-center overflow-hidden pt-36 sm:pt-44 lg:pt-48 pb-20">
        {/* Arabian Palace Background Image — Crystal Clear & High Definition */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={heroPalaceImg}
            alt="Arabian Sheikh Royal Palace"
            className="w-full h-full object-cover object-center scale-100 transform transition-transform duration-1000 ease-out brightness-105 contrast-[1.08] saturate-[1.05]"
          />
          {/* Subtle natural bottom edge connection */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--color-desert-primary)]/40 to-transparent pointer-events-none" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-between space-y-12 animate-fade-in">
          
          <div className="max-w-4xl mx-auto space-y-8 flex flex-col items-center">
            {/* Royal Crest Emblem with Luminous Aura */}
            <div className="flex justify-center relative">
              <div className="absolute inset-0 bg-radial from-[var(--color-desert-light)]/80 to-transparent blur-2xl -z-10 scale-150" />
              <ArabianLogo variant="crest" size="hero" className="hover:scale-105 transition-transform duration-500 mb-2 filter drop-shadow-[0_4px_28px_rgba(180,86,37,0.55)]" />
            </div>

            {/* Subtitle Pill */}
            <div className="inline-flex flex-col sm:flex-row items-center gap-1 sm:gap-2.5 px-5 sm:px-6 py-2.5 border-2 border-[var(--color-terracotta)]/50 bg-[var(--color-desert-light)]/95 backdrop-blur-md shadow-xl rounded-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-terracotta)]" />
                <span className="font-cinzel text-[11px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[var(--color-terracotta-deep)] font-bold block">
                  {t('home.heroSubtitle')}
                </span>
              </div>
              <span className="hidden sm:inline text-[var(--color-terracotta)]/60 font-bold">•</span>
              <span className="font-cinzel text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[var(--color-earth-dark)] font-bold block">
                THE ROYAL PALACE OF PERFUMES
              </span>
            </div>

            {/* Title with TextReveal & Arabic Typography */}
            <div className="space-y-3 relative">
              <div className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-[var(--color-desert-light)]/60 backdrop-blur-sm border border-[var(--color-terracotta)]/25 shadow-md rounded-sm">
                <TextReveal
                  as="h1"
                  text="THE ART OF ARABIAN HAUTE PERFUMERY"
                  className="font-cinzel text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[0.14em] text-[var(--color-earth-dark)] leading-[1.15] uppercase drop-shadow-sm"
                />
              </div>
              <p className="font-arabic text-2xl sm:text-3xl text-[var(--color-terracotta-deep)] tracking-wider font-bold drop-shadow-sm">
                فن صناعة العطور العربية الفاخرة
              </p>
            </div>

            {/* Supporting Text */}
            <p className="font-sans text-sm sm:text-lg text-[var(--color-earth-dark)] max-w-2xl mx-auto leading-relaxed font-semibold bg-[var(--color-desert-light)]/75 backdrop-blur-sm px-6 py-3.5 border border-[var(--color-terracotta)]/25 shadow-md rounded-sm">
              {t('home.heroDesc')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/shop"
                className="luxury-btn-gold px-8 py-4 text-xs tracking-[0.25em] flex items-center justify-center gap-3 w-full sm:w-auto shadow-2xl group cursor-pointer font-bold"
              >
                <span>{t('home.exploreCollection')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>
              <Link
                to="/the-house"
                className="px-8 py-4 text-xs tracking-[0.25em] w-full sm:w-auto text-center border-2 border-[var(--color-terracotta-deep)] text-[var(--color-earth-dark)] bg-[var(--color-desert-light)]/90 backdrop-blur-md hover:bg-[var(--color-terracotta-deep)] hover:text-[#F8D188] transition-all duration-300 shadow-xl cursor-pointer font-bold"
              >
                {t('home.discoverHouse')}
              </Link>
            </div>
          </div>

          {/* Animated Statistics Numbers Taking FULL WIDTH */}
          <div className="w-full pt-10 sm:pt-12 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full">
              <div className="p-4 sm:p-5 bg-[var(--color-desert-light)]/90 backdrop-blur-md border border-[var(--color-terracotta)]/35 shadow-lg space-y-1 hover:border-[var(--color-terracotta)] transition-all">
                <span className="font-cinzel text-[var(--color-terracotta)] font-bold text-3xl sm:text-4xl block">
                  <AnimatedCounter target={500} suffix="+" />
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[var(--color-earth-dark)] font-bold block">
                  Signature Fragrances
                </span>
              </div>

              <div className="p-4 sm:p-5 bg-[var(--color-desert-light)]/90 backdrop-blur-md border border-[var(--color-terracotta)]/35 shadow-lg space-y-1 hover:border-[var(--color-terracotta)] transition-all">
                <span className="font-cinzel text-[var(--color-terracotta)] font-bold text-3xl sm:text-4xl block">
                  <AnimatedCounter target={10000} suffix="+" />
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[var(--color-earth-dark)] font-bold block">
                  Happy Patrons
                </span>
              </div>

              <div className="p-4 sm:p-5 bg-[var(--color-desert-light)]/90 backdrop-blur-md border border-[var(--color-terracotta)]/35 shadow-lg space-y-1 hover:border-[var(--color-terracotta)] transition-all">
                <span className="font-cinzel text-[var(--color-terracotta)] font-bold text-3xl sm:text-4xl block">
                  <AnimatedCounter target={20} suffix="+" />
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[var(--color-earth-dark)] font-bold block">
                  Years of Craft
                </span>
              </div>

              <div className="p-4 sm:p-5 bg-[var(--color-desert-light)]/90 backdrop-blur-md border border-[var(--color-terracotta)]/35 shadow-lg space-y-1 hover:border-[var(--color-terracotta)] transition-all">
                <span className="font-cinzel text-[var(--color-terracotta)] font-bold text-3xl sm:text-4xl block">
                  <AnimatedCounter target={38} suffix="%" />
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[var(--color-earth-dark)] font-bold block">
                  Pure Extrait Concentration
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          TRANSITION: PANORAMIC DESERT CARAVAN HORIZON
          ========================================================================= */}
      <div className="relative w-full h-36 sm:h-48 md:h-56 overflow-hidden -my-10 sm:-my-16 pointer-events-none">
        <CamelCaravan speedMultiplier={0.92} opacity={0.95} scale={1.05} />
      </div>

      {/* =========================================================================
          2. BEST SELLERS  ☀️ Warm Bright Sand (#F8D188 & #EBAA62)
          ========================================================================= */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-12 sm:py-16">
        <ScrollReveal direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--color-terracotta-deep)]/25 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)] font-cinzel font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Acclaimed Masterpieces</span>
              </div>
              <h2 className="font-cinzel text-3xl sm:text-4xl font-bold uppercase text-[var(--color-earth-dark)] tracking-wide">
                {t('home.bestSellersTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-terracotta-deep)] mt-1 max-w-xl font-medium">
                The most beloved flacons chosen by connoisseurs of Arabian haute perfumery worldwide.
              </p>
            </div>
            <Link
              to="/shop?filter=bestsellers"
              className="text-xs uppercase tracking-[0.2em] font-cinzel font-bold text-[var(--color-terracotta)] hover:text-[var(--color-terracotta-deep)] flex items-center gap-2 transition-colors self-start md:self-end"
            >
              <span>{t('shop.exploreAll')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="flex gap-6 overflow-hidden py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[280px] sm:w-[320px] flex-shrink-0">
                <ProductSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <ProductSlider products={bestSellers} collectionTheme="best-sellers" />
        )}
      </section>

      {/* =========================================================================
          3. LUXURY COLLECTION  🌤️ Afternoon Sand & Terracotta (#EBAA62 & #B45625)
          ========================================================================= */}
      <section className="relative py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <ScrollReveal direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--color-terracotta-deep)]/25 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)] font-cinzel font-bold mb-1">
                <Gem className="w-3.5 h-3.5 text-[var(--color-terracotta)]" />
                <span>Private Reserve Blends</span>
              </div>
              <h2 className="font-cinzel text-3xl sm:text-4xl font-bold uppercase text-[var(--color-earth-dark)] tracking-wide">
                LUXURY COLLECTION
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-terracotta-deep)] mt-1 max-w-xl font-medium">
                Artisanal extracts of Damascene petals, Babylon sun figs, and golden ambergris.
              </p>
            </div>
            <Link
              to="/collections"
              className="text-xs uppercase tracking-[0.2em] font-cinzel font-bold text-[var(--color-terracotta)] hover:text-[var(--color-terracotta-deep)] flex items-center gap-2 transition-colors self-start md:self-end"
            >
              <span>Discover Luxury Reserve</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="flex gap-6 overflow-hidden py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[280px] sm:w-[320px] flex-shrink-0">
                <ProductSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <ProductSlider products={luxuryProducts} collectionTheme="luxury" />
        )}
      </section>

      {/* =========================================================================
          4. ROYAL COLLECTION  🌇 Deep Terracotta & Dark Earth (#80300D & #5D1D01)
          ========================================================================= */}
      <section className="relative py-20 sm:py-24 text-[var(--text-primary)] overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <ScrollReveal direction="up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--color-terracotta-deep)]/25 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)] font-cinzel font-bold mb-1">
                  <Crown className="w-3.5 h-3.5 text-[var(--color-terracotta)]" />
                  <span>Crown Reserve • 40% Extraits de Parfum</span>
                </div>
                <h2 className="font-cinzel text-3xl sm:text-4xl font-bold uppercase text-[var(--color-earth-dark)] tracking-wide">
                  ROYAL COLLECTION
                </h2>
                <p className="text-xs sm:text-sm text-[var(--color-terracotta-deep)] mt-1 max-w-xl font-medium">
                  The supreme apex of royal agarwood alchemy, aged 60-year wild Assamese Dehn Al Oud and imperial resins.
                </p>
              </div>
              <Link
                to="/collections?c=royal-oud"
                className="text-xs uppercase tracking-[0.2em] font-cinzel font-bold text-[var(--color-terracotta)] hover:text-[var(--color-earth-dark)] flex items-center gap-2 transition-colors self-start md:self-end"
              >
                <span>Explore Royal Vault</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>

          {loading ? (
            <div className="flex gap-6 overflow-hidden py-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-[280px] sm:w-[320px] flex-shrink-0">
                  <ProductSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <ProductSlider products={royalProducts} collectionTheme="royal" />
          )}
        </div>
      </section>

      {/* =========================================================================
          5. THE FIVE OLFACTORY FAMILIES  🌅 Warm Sand & Terracotta
          ========================================================================= */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 space-y-10">
        <ScrollReveal direction="up">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[var(--color-terracotta)] font-bold">
              Olfactory Classifications
            </span>
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold uppercase text-[var(--color-earth-dark)]">
              {t('home.fragranceFamiliesTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-terracotta-deep)] font-medium">
              {t('home.fragranceFamiliesDesc')}
            </p>
          </div>
        </ScrollReveal>

        {/* 5 Cards Grid */}
        <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {FAMILIES_DATA.map((fam, i) => {
            const Icon = fam.icon;
            return (
              <ScrollRevealItem key={fam.id} index={i} desktopDirection="up">
                <div
                  onClick={() => navigate(`/shop?family=${fam.id}`)}
                  className={`group cursor-pointer relative overflow-hidden bg-[var(--color-desert-light)] border transition-all duration-500 flex flex-col justify-between p-6 shadow-md hover:shadow-xl hover:-translate-y-2 ${
                    fam.isCore
                      ? 'border-[var(--color-terracotta)] ring-1 ring-[var(--color-terracotta)]/40'
                      : 'border-[var(--color-terracotta-deep)]/25 hover:border-[var(--color-terracotta)]'
                  }`}
                >
                  {/* Background Silhouette Image */}
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none">
                    <img src={fam.image} alt={fam.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 border border-[var(--color-terracotta)]/50 bg-[var(--color-desert-light)] flex items-center justify-center text-[var(--color-terracotta)] shadow-sm">
                        <Icon className="w-5 h-5" />
                      </div>
                      {fam.isCore && (
                        <span className="bg-[var(--color-terracotta)] text-[#F8D188] text-[9px] font-cinzel font-bold tracking-widest uppercase px-2 py-0.5 shadow-sm">
                          Signature Pillar
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-cinzel text-lg font-bold text-[var(--color-earth-dark)] group-hover:text-[var(--color-terracotta)] transition-colors">
                        {fam.name}
                      </h3>
                      <p className="font-arabic text-sm text-[var(--color-terracotta)] font-bold mt-0.5">
                        {fam.arabic}
                      </p>
                      <p className="text-xs text-[var(--color-terracotta-deep)] mt-2 font-sans line-clamp-2 leading-relaxed">
                        {fam.desc}
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 pt-5 border-t border-[var(--color-terracotta-deep)]/20 mt-6">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--color-terracotta)] font-bold block mb-1.5">
                      Core Notes:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {fam.notes.slice(0, 3).map((note, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/20 text-[var(--color-earth-dark)] font-sans font-medium"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollRevealItem>
            );
          })}
        </div>
        </div>
      </section>

      {/* =========================================================================
          6. BRAND STORY & SACRED AGARWOOD HERITAGE  🌃 Warm Desert Heritage
          ========================================================================= */}
      <section className="relative text-[var(--color-earth-dark)] py-20 sm:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal direction="left">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-[var(--color-terracotta)]/40 bg-[var(--color-desert-light)]/80 shadow-md">
                <Crown className="w-3.5 h-3.5 text-[var(--color-terracotta)]" />
                <span className="font-cinzel text-[11px] uppercase tracking-widest text-[var(--color-terracotta-deep)] font-bold">
                  Centuries of Arabian Alchemy
                </span>
              </div>
              <h2 className="font-cinzel text-3xl sm:text-4xl font-bold uppercase tracking-wide leading-tight text-[var(--color-earth-dark)]">
                Wild Assamese Agarwood &amp; Sacred Resins
              </h2>
              <p className="font-sans text-sm text-[var(--color-terracotta-deep)] leading-relaxed font-medium">
                Every creation within Arabian Sheikh begins with sustainable distillations from 50 to 80-year-old wild agarwood trees. Matured in obsidian clay amphorae and hand-bottled at royal extrait concentrations of 35% to 40%.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2 font-cinzel text-xs uppercase tracking-wider text-[var(--color-earth-dark)]">
                <div className="p-4 border border-[var(--color-terracotta-deep)]/25 bg-[var(--color-desert-light)]/80 space-y-1 shadow-sm">
                  <span className="text-[var(--color-terracotta)] font-bold text-lg block">38% Extrait</span>
                  <span className="text-[var(--color-terracotta-deep)] text-[11px]">Unrivaled Sillage &amp; Longevity</span>
                </div>
                <div className="p-4 border border-[var(--color-terracotta-deep)]/25 bg-[var(--color-desert-light)]/80 space-y-1 shadow-sm">
                  <span className="text-[var(--color-terracotta)] font-bold text-lg block">Single Batch</span>
                  <span className="text-[var(--color-terracotta-deep)] text-[11px]">Numbered Flacon Registers</span>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  to="/the-house"
                  className="luxury-btn-gold px-8 py-3.5 text-xs inline-flex items-center gap-2 shadow-xl cursor-pointer"
                >
                  <span>Read The House Monograph</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </ScrollReveal>

          {/* Distillation Monograph Card */}
          <ScrollReveal direction="right">
            <div className="relative aspect-[4/3] border border-[var(--color-terracotta-deep)]/30 shadow-2xl overflow-hidden bg-[var(--color-desert-light)] group">
              <img
                src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85"
                alt="Arabian Fragrance Flacon"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-earth-dark)]/90 via-[var(--color-earth-dark)]/40 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 z-20">
                <p className="font-arabic text-xl sm:text-2xl text-[var(--color-desert-light)] leading-relaxed drop-shadow-md font-bold">
                  « العطر لغة الملوك وذاكرة الأرواح النبيلة »
                </p>
                <p className="font-cinzel text-xs text-[var(--color-desert-light)]/80 uppercase tracking-widest mt-2">
                  The Eternal Ritual of Arabian Haute Perfumery
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* =========================================================================
          7. BESPOKE CONCIERGE CTA  🌃 Evening Ambiance
          ========================================================================= */}
      <section className="relative text-center py-16 sm:py-24">
        <ScrollReveal direction="up">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden">

            {/* Camel Caravan across the evening dunes */}
            <CamelCaravan speedMultiplier={0.88} opacity={0.95} scale={1.15} />

            {/* Generous space below camel scene before content */}
            <div className="relative z-10 pt-48 sm:pt-56 flex flex-col items-center gap-6">
              <div className="w-14 h-14 border-2 border-[var(--color-terracotta)] bg-[var(--color-desert-light)] flex items-center justify-center text-[var(--color-terracotta)] shadow-xl">
                <Building className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[var(--color-terracotta)] font-bold">
                  Private Consultation Privileges
                </span>
                <h2 className="font-cinzel text-2xl sm:text-4xl font-bold uppercase text-[var(--color-earth-dark)]">
                  Bespoke Salons &amp; Concierge Fragrance Blending
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Link
                  to="/contact"
                  className="luxury-btn-gold px-8 py-3.5 text-xs tracking-widest uppercase w-full sm:w-auto cursor-pointer"
                >
                  Reserve Private Appointment
                </Link>
                <Link
                  to="/the-house"
                  className="luxury-btn-outline px-8 py-3.5 text-xs tracking-widest uppercase w-full sm:w-auto border-[var(--color-terracotta-deep)] text-[var(--color-earth-dark)] cursor-pointer"
                >
                  Discover Boutiques
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

    </div>
  );
}
