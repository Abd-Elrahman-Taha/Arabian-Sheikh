import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { productService } from '../services/productService';
import ProductCard from '../components/common/ProductCard';
import { ProductSkeleton } from '../components/common/SkeletonLoader';
import AnimatedCounter from '../components/common/AnimatedCounter';
import TextReveal from '../components/common/TextReveal';
import ScrollReveal, { ScrollRevealItem } from '../components/common/ScrollReveal';
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
  Compass,
  Check,
  Clock,
  Crown
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
    <div className="space-y-24 sm:space-y-32 pb-20">
      {/* 1. HERO SECTION WITH CINEMATIC ARABIAN PALACE BACKGROUND */}
      <section className="relative min-h-[94vh] flex items-center justify-center overflow-hidden pt-36 sm:pt-44 lg:pt-48 pb-16">
        {/* Arabian Palace Background Image with Rich Dark Gradient Masks */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroPalaceImg}
            alt="Arabian Sheikh Royal Palace"
            className="w-full h-full object-cover object-center scale-102 transform transition-transform duration-1000 ease-out"
          />
          {/* Subtle multi-layer ambient gradients for contrast and readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-black/60 to-black/70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(210,165,95,0.18)_0%,_transparent_75%)]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 animate-fade-in">
          {/* Subtitle Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#D2A55F]/50 bg-black/60 backdrop-blur-md shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#D2A55F]" />
            <span className="font-cinzel text-xs uppercase tracking-[0.3em] text-[#E0B978] font-semibold">
              {t('home.heroSubtitle')}
            </span>
          </div>

          {/* Title with TextReveal */}
          <div className="space-y-2">
            <TextReveal
              as="h1"
              text="THE ART OF ARABIAN PERFUMERY"
              className="font-cinzel text-4xl sm:text-6xl lg:text-7xl font-bold tracking-[0.12em] text-[#F3EAE1] leading-[1.1] uppercase drop-shadow-lg"
            />
            <p className="font-arabic text-xl sm:text-2xl text-[#E0B978] tracking-wider">
              فن صناعة العطور العربية الفاخرة
            </p>
          </div>

          {/* Supporting Text */}
          <p className="font-sans text-sm sm:text-lg text-[#EADED2]/90 max-w-2xl mx-auto leading-relaxed font-light drop-shadow">
            {t('home.heroDesc')}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <Link
              to="/shop"
              className="luxury-btn-gold px-8 py-4 text-xs tracking-[0.25em] flex items-center justify-center gap-3 w-full sm:w-auto shadow-2xl group"
            >
              <span>{t('home.exploreCollection')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
            <Link
              to="/the-house"
              className="luxury-btn-outline px-8 py-4 text-xs tracking-[0.25em] w-full sm:w-auto text-center border-[#E0B978] text-[#F3EAE1] bg-black/40 hover:bg-[#D2A55F]/20"
            >
              {t('home.discoverHouse')}
            </Link>
          </div>

          {/* Animated Statistics Numbers */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto border-t border-[#D2A55F]/25 text-center text-[#EADED2]">
            <div className="space-y-1">
              <span className="font-cinzel text-[#D2A55F] font-bold text-2xl sm:text-3xl block">
                <AnimatedCounter target={500} suffix="+" />
              </span>
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#E0B978]">
                Signature Fragrances
              </span>
            </div>

            <div className="space-y-1">
              <span className="font-cinzel text-[#D2A55F] font-bold text-2xl sm:text-3xl block">
                <AnimatedCounter target={10000} suffix="+" />
              </span>
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#E0B978]">
                Happy Patrons
              </span>
            </div>

            <div className="space-y-1">
              <span className="font-cinzel text-[#D2A55F] font-bold text-2xl sm:text-3xl block">
                <AnimatedCounter target={20} suffix="+" />
              </span>
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#E0B978]">
                Years of Craft
              </span>
            </div>

            <div className="space-y-1">
              <span className="font-cinzel text-[#D2A55F] font-bold text-2xl sm:text-3xl block">
                <AnimatedCounter target={98} suffix="%" />
              </span>
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#E0B978]">
                Satisfaction Rating
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FIVE EXPLICIT FRAGRANCE FAMILIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
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
                  <div className="absolute inset-0 opacity-15 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none">
                    <img src={fam.image} alt={fam.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 border border-[var(--gold-primary)]/40 bg-[var(--bg-primary)] flex items-center justify-center text-[var(--gold-primary)]">
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
                          className="text-[10px] px-1.5 py-0.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-sans"
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

      {/* 3. FEATURED ROYAL CREATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <ScrollReveal direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
            <div>
              <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[var(--gold-primary)] font-semibold">
                Atelier Highlights
              </span>
              <h2 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase text-[var(--text-primary)] mt-1">
                {t('home.featuredTitle')}
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs uppercase tracking-[0.2em] font-cinzel font-semibold text-[var(--gold-primary)] hover:text-[var(--gold-light)] flex items-center gap-1.5 transition-colors"
            >
              <span>{t('shop.exploreAll')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product, i) => (
              <ScrollRevealItem key={product.id} index={i} desktopDirection="up">
                <ProductCard product={product} />
              </ScrollRevealItem>
            ))}
          </div>
        )}
      </section>

      {/* 4. HERITAGE & ARTISANAL EXTRACTION BANNER */}
      <section className="relative bg-[var(--bg-dark-section)] text-[var(--bg-dark-section-text)] py-20 overflow-hidden border-y border-[var(--border-gold-subtle)]">
        <div className="absolute inset-0 opacity-15">
          <img
            src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1600&q=80"
            alt="Artisanal Extraction"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal direction="left">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#D2A55F]/40 bg-black/40">
                <Crown className="w-3.5 h-3.5 text-[#D2A55F]" />
                <span className="font-cinzel text-[11px] uppercase tracking-widest text-[#D2A55F]">
                  Centuries of Alchemy
                </span>
              </div>
              <h2 className="font-cinzel text-3xl sm:text-4xl font-bold uppercase tracking-wide leading-tight text-[#F3EAE1]">
                Wild Assamese Agarwood & Sacred Resins
              </h2>
              <p className="font-sans text-sm text-[#CDBEAE] leading-relaxed">
                Every creation within Arabian Sheikh begins with sustainable distillations from 50 to 80-year-old wild agarwood trees. Matured in obsidian clay amphorae and hand-bottled at royal extrait concentrations of 35% to 40%.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2 font-cinzel text-xs uppercase tracking-wider text-[#EADED2]">
                <div className="p-4 border border-[#D2A55F]/30 bg-black/50 space-y-1">
                  <span className="text-[#D2A55F] font-bold text-lg block">38% Extrait</span>
                  <span className="text-[#CDBEAE] text-[11px]">Unrivaled Sillage & Longevity</span>
                </div>
                <div className="p-4 border border-[#D2A55F]/30 bg-black/50 space-y-1">
                  <span className="text-[#D2A55F] font-bold text-lg block">Single Batch</span>
                  <span className="text-[#CDBEAE] text-[11px]">Numbered Flacon Registers</span>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  to="/the-house"
                  className="luxury-btn-gold px-8 py-3.5 text-xs inline-flex items-center gap-2"
                >
                  <span>Read The House Monograph</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right">
            <div className="relative aspect-[4/3] border border-[#D2A55F]/40 shadow-2xl overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85"
                alt="Arabian Fragrance Flacon"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                <p className="font-arabic text-xl text-[#E0B978]">
                  « العطر لغة الملوك وذاكرة الأرواح النبيلة »
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 5. BEST SELLERS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <ScrollReveal direction="up">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[var(--gold-primary)] font-semibold">
              Acclaimed Treasures
            </span>
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold uppercase text-[var(--text-primary)]">
              {t('home.bestSellersTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              The most coveted creations adorning private vanity suites globally.
            </p>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.slice(0, 4).map((product, i) => (
              <ScrollRevealItem key={product.id} index={i} desktopDirection="up">
                <ProductCard product={product} />
              </ScrollRevealItem>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
