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
import BackgroundAtmosphere from '../components/motion/BackgroundAtmosphere';
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
    <div className="w-full space-y-24 sm:space-y-36 pb-28 overflow-x-hidden">
      
      {/* =========================================================================
          1. HERO SECTION: CINEMATIC ARABIAN PALACE BACKGROUND & LOGO
          ========================================================================= */}
      <section className="relative min-h-[96vh] flex items-center justify-center overflow-hidden pt-36 sm:pt-44 lg:pt-48 pb-20">
        {/* Arabian Palace Background Image with Rich Dark Gradient Masks */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroPalaceImg}
            alt="Arabian Sheikh Royal Palace"
            className="w-full h-full object-cover object-center scale-102 transform transition-transform duration-1000 ease-out"
          />
          {/* Multi-layer ambient gradients for contrast and readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/65 to-[var(--bg-primary)]/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(210,165,95,0.22)_0%,_transparent_75%)]" />

          {/* Subtle Ambient Smoke & Twinkling Stars BEHIND all content */}
          <BackgroundAtmosphere starCount={24} smokeIntensity={0.4} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-between space-y-12 animate-fade-in">
          
          <div className="max-w-4xl mx-auto space-y-8 flex flex-col items-center">
            {/* Royal Crest Emblem in Radiant Light Champagne Gold */}
            <div className="flex justify-center">
              <ArabianLogo variant="crest" size="hero" className="hover:scale-105 transition-transform duration-500 mb-2 filter drop-shadow-[0_0_35px_rgba(210,165,95,0.55)]" />
            </div>

            {/* Subtitle Pill with Dedicated Separate Mobile Lines */}
            <div className="inline-flex flex-col sm:flex-row items-center gap-1 sm:gap-2.5 px-4 sm:px-5 py-2 border border-[var(--gold-primary)]/60 bg-black/60 backdrop-blur-md shadow-2xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[var(--gold-primary)]" />
                <span className="font-cinzel text-[11px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[var(--gold-light)] font-semibold block">
                  {t('home.heroSubtitle')}
                </span>
              </div>
              <span className="hidden sm:inline text-[var(--gold-primary)]/40">•</span>
              <span className="font-cinzel text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[var(--text-primary)] font-semibold block">
                THE ROYAL PALACE OF PERFUMES
              </span>
            </div>

            {/* Title with TextReveal */}
            <div className="space-y-3">
              <TextReveal
                as="h1"
                text="THE ART OF ARABIAN HAUTE PERFUMERY"
                className="font-cinzel text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[0.14em] text-[var(--text-primary)] leading-[1.12] uppercase drop-shadow-2xl"
              />
              <p className="font-arabic text-xl sm:text-2xl text-[var(--gold-light)] tracking-wider drop-shadow-md">
                فن صناعة العطور العربية الفاخرة
              </p>
            </div>

            {/* Supporting Text */}
            <p className="font-sans text-sm sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed font-light drop-shadow">
              {t('home.heroDesc')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/shop"
                className="luxury-btn-gold px-8 py-4 text-xs tracking-[0.25em] flex items-center justify-center gap-3 w-full sm:w-auto shadow-2xl group cursor-pointer"
              >
                <span>{t('home.exploreCollection')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>
              <Link
                to="/the-house"
                className="luxury-btn-outline px-8 py-4 text-xs tracking-[0.25em] w-full sm:w-auto text-center border-[var(--gold-primary)] text-[var(--text-primary)] bg-black/50 hover:bg-[var(--gold-primary)]/20 cursor-pointer"
              >
                {t('home.discoverHouse')}
              </Link>
            </div>
          </div>

          {/* Animated Statistics Numbers Taking FULL WIDTH */}
          <div className="w-full pt-10 sm:pt-12 border-t border-[var(--gold-primary)]/30 text-center text-[var(--text-primary)]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 w-full">
              <div className="space-y-1">
                <span className="font-cinzel text-[var(--gold-light)] font-bold text-2xl sm:text-4xl block">
                  <AnimatedCounter target={500} suffix="+" />
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Signature Fragrances
                </span>
              </div>

              <div className="space-y-1">
                <span className="font-cinzel text-[var(--gold-light)] font-bold text-2xl sm:text-4xl block">
                  <AnimatedCounter target={10000} suffix="+" />
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Happy Patrons
                </span>
              </div>

              <div className="space-y-1">
                <span className="font-cinzel text-[var(--gold-light)] font-bold text-2xl sm:text-4xl block">
                  <AnimatedCounter target={20} suffix="+" />
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Years of Craft
                </span>
              </div>

              <div className="space-y-1">
                <span className="font-cinzel text-[var(--gold-light)] font-bold text-2xl sm:text-4xl block">
                  <AnimatedCounter target={38} suffix="%" />
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
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
          2. VERTICAL SECTION 1: BEST SELLERS
          ========================================================================= */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <ScrollReveal direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-[var(--gold-primary)] font-cinzel font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Acclaimed Masterpieces</span>
              </div>
              <h2 className="font-cinzel text-3xl sm:text-4xl font-bold uppercase text-[var(--text-primary)] tracking-wide">
                {t('home.bestSellersTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-xl">
                The most beloved flacons chosen by connoisseurs of Arabian haute perfumery worldwide.
              </p>
            </div>
            <Link
              to="/shop?filter=bestsellers"
              className="text-xs uppercase tracking-[0.2em] font-cinzel font-semibold text-[var(--gold-primary)] hover:text-[var(--gold-light)] flex items-center gap-2 transition-colors self-start md:self-end"
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
          3. VERTICAL SECTION 2: LUXURY COLLECTION
          ========================================================================= */}
      <section className="relative py-16 sm:py-20 bg-[var(--bg-secondary)] border-y border-[var(--border-gold-subtle)] shadow-inner">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <ScrollReveal direction="up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-gold-subtle)] pb-4">
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-[var(--gold-primary)] font-cinzel font-semibold mb-1">
                  <Gem className="w-3.5 h-3.5 text-[var(--gold-primary)]" />
                  <span>Private Reserve Blends</span>
                </div>
                <h2 className="font-cinzel text-3xl sm:text-4xl font-bold uppercase text-[var(--text-primary)] tracking-wide">
                  LUXURY COLLECTION
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-xl">
                  Artisanal extracts of Damascene petals, Babylon sun figs, and golden ambergris.
                </p>
              </div>
              <Link
                to="/collections"
                className="text-xs uppercase tracking-[0.2em] font-cinzel font-semibold text-[var(--gold-primary)] hover:text-[var(--gold-light)] flex items-center gap-2 transition-colors self-start md:self-end"
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
        </div>
      </section>

      {/* =========================================================================
          4. VERTICAL SECTION 3: ROYAL COLLECTION
          ========================================================================= */}
      <section className="relative py-20 sm:py-24 bg-[var(--bg-dark-section)] text-[var(--bg-dark-section-text)] border-y border-[var(--border-gold-subtle)] shadow-2xl overflow-hidden">
        {/* Subtle Ambient Smoke & Twinkling Stars BEHIND section cards */}
        <BackgroundAtmosphere starCount={16} smokeIntensity={0.3} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <ScrollReveal direction="up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-gold-subtle)] pb-4">
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-[var(--gold-light)] font-cinzel font-semibold mb-1">
                  <Crown className="w-3.5 h-3.5 text-[var(--gold-light)]" />
                  <span>Crown Reserve • 40% Extraits de Parfum</span>
                </div>
                <h2 className="font-cinzel text-3xl sm:text-4xl font-bold uppercase text-[var(--text-primary)] tracking-wide">
                  ROYAL COLLECTION
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-xl">
                  The supreme apex of royal agarwood alchemy, aged 60-year wild Assamese Dehn Al Oud and imperial resins.
                </p>
              </div>
              <Link
                to="/collections?c=royal-oud"
                className="text-xs uppercase tracking-[0.2em] font-cinzel font-semibold text-[var(--gold-light)] hover:text-[var(--text-primary)] flex items-center gap-2 transition-colors self-start md:self-end"
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
          5. THE FIVE OLFACTORY FAMILIES
          ========================================================================= */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <ScrollReveal direction="up">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[var(--gold-primary)] font-semibold">
              Olfactory Classifications
            </span>
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold uppercase text-[var(--text-primary)]">
              {t('home.fragranceFamiliesTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              {t('home.fragranceFamiliesDesc')}
            </p>
          </div>
        </ScrollReveal>

        {/* 5 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {FAMILIES_DATA.map((fam, i) => {
            const Icon = fam.icon;
            return (
              <ScrollRevealItem key={fam.id} index={i} desktopDirection="up">
                <div
                  onClick={() => navigate(`/shop?family=${fam.id}`)}
                  className={`group cursor-pointer relative overflow-hidden bg-[var(--bg-card)] border transition-all duration-500 flex flex-col justify-between p-6 shadow-md hover:shadow-2xl hover:-translate-y-2 ${
                    fam.isCore
                      ? 'border-[var(--gold-primary)] ring-1 ring-[var(--gold-primary)]/40'
                      : 'border-[var(--border-card)] hover:border-[var(--gold-primary)]'
                  }`}
                >
                  {/* Background Silhouette Image */}
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none">
                    <img src={fam.image} alt={fam.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 border border-[var(--gold-primary)]/40 bg-[var(--bg-primary)] flex items-center justify-center text-[var(--gold-primary)] shadow-sm">
                        <Icon className="w-5 h-5" />
                      </div>
                      {fam.isCore && (
                        <span className="bg-[#D2A55F] text-[#130C05] text-[9px] font-cinzel font-bold tracking-widest uppercase px-2 py-0.5 shadow-sm">
                          Signature Pillar
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-cinzel text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--gold-primary)] transition-colors">
                        {fam.name}
                      </h3>
                      <p className="font-arabic text-sm text-[var(--gold-primary)] font-bold mt-0.5">
                        {fam.arabic}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-2 font-sans line-clamp-2 leading-relaxed">
                        {fam.desc}
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 pt-5 border-t border-[var(--border-subtle)] mt-6">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--gold-primary)] font-semibold block mb-1.5">
                      Core Notes:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {fam.notes.slice(0, 3).map((note, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-sans"
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
      </section>

      {/* =========================================================================
          6. BRAND STORY & SACRED AGARWOOD HERITAGE
          ========================================================================= */}
      <section className="relative bg-[var(--bg-dark-section)] text-[var(--bg-dark-section-text)] py-20 sm:py-24 overflow-hidden border-y border-[var(--border-gold-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal direction="left">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-[var(--gold-primary)]/50 bg-black/60 shadow-lg">
                <Crown className="w-3.5 h-3.5 text-[var(--gold-light)]" />
                <span className="font-cinzel text-[11px] uppercase tracking-widest text-[var(--gold-light)] font-semibold">
                  Centuries of Arabian Alchemy
                </span>
              </div>
              <h2 className="font-cinzel text-3xl sm:text-4xl font-bold uppercase tracking-wide leading-tight text-[var(--text-primary)]">
                Wild Assamese Agarwood & Sacred Resins
              </h2>
              <p className="font-sans text-sm text-[var(--text-secondary)] leading-relaxed">
                Every creation within Arabian Sheikh begins with sustainable distillations from 50 to 80-year-old wild agarwood trees. Matured in obsidian clay amphorae and hand-bottled at royal extrait concentrations of 35% to 40%.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2 font-cinzel text-xs uppercase tracking-wider text-[var(--text-primary)]">
                <div className="p-4 border border-[var(--border-gold-subtle)] bg-black/60 space-y-1 shadow-md">
                  <span className="text-[var(--gold-light)] font-bold text-lg block">38% Extrait</span>
                  <span className="text-[var(--text-muted)] text-[11px]">Unrivaled Sillage & Longevity</span>
                </div>
                <div className="p-4 border border-[var(--border-gold-subtle)] bg-black/60 space-y-1 shadow-md">
                  <span className="text-[var(--gold-light)] font-bold text-lg block">Single Batch</span>
                  <span className="text-[var(--text-muted)] text-[11px]">Numbered Flacon Registers</span>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  to="/the-house"
                  className="luxury-btn-gold px-8 py-3.5 text-xs inline-flex items-center gap-2 shadow-2xl cursor-pointer"
                >
                  <span>Read The House Monograph</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </ScrollReveal>

          {/* Distillation Monograph Card */}
          <ScrollReveal direction="right">
            <div className="relative aspect-[4/3] border border-[var(--border-gold-subtle)] shadow-2xl overflow-hidden bg-[var(--bg-secondary)] group">
              <img
                src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85"
                alt="Arabian Fragrance Flacon"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 z-20">
                <p className="font-arabic text-xl sm:text-2xl text-[var(--gold-light)] leading-relaxed drop-shadow-md">
                  « العطر لغة الملوك وذاكرة الأرواح النبيلة »
                </p>
                <p className="font-cinzel text-xs text-[var(--text-muted)] uppercase tracking-widest mt-2">
                  The Eternal Ritual of Arabian Haute Perfumery
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* =========================================================================
          7. BESPOKE PRIVATE CONCIERGE & SALONS CTA (With Prominent Living Camel Caravan)
          ========================================================================= */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-6">
        <ScrollReveal direction="up">
          <div className="pt-12 sm:pt-16 pb-28 sm:pb-36 px-6 sm:px-14 bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-tertiary)] to-[var(--bg-dark-section)] text-[var(--text-primary)] border border-[var(--border-gold-subtle)] shadow-2xl space-y-6 relative overflow-hidden">
            
            {/* Highly Visible Endless Desert Camel Caravan Traversing Dunes */}
            <CamelCaravan speedMultiplier={0.88} opacity={0.95} scale={1.15} />

            <div className="relative z-10 flex justify-center">
              <div className="w-14 h-14 border-2 border-[var(--gold-primary)] bg-[var(--bg-dark-section)] flex items-center justify-center text-[var(--gold-light)] shadow-xl">
                <Building className="w-7 h-7" />
              </div>
            </div>

            <div className="relative z-10 space-y-2">
              <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[var(--gold-light)] font-semibold">
                Private Consultation Privileges
              </span>
              <h2 className="font-cinzel text-2xl sm:text-4xl font-bold uppercase text-[var(--text-primary)]">
                Bespoke Salons & Concierge Fragrance Blending
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
                Experience an intimate olfactory journey in our private salons across Dubai, Riyadh, London, and Paris. Handcrafted bespoke flacons customized for royal houses and private patrons.
              </p>
            </div>

            <div className="relative z-10 pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contact"
                className="luxury-btn-gold px-8 py-3.5 text-xs tracking-widest uppercase w-full sm:w-auto cursor-pointer"
              >
                Reserve Private Appointment
              </Link>
              <Link
                to="/the-house"
                className="luxury-btn-outline px-8 py-3.5 text-xs tracking-widest uppercase w-full sm:w-auto border-[var(--gold-light)] text-[var(--text-primary)] cursor-pointer"
              >
                Discover Boutiques
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

    </div>
  );
}
