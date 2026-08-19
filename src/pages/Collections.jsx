import React, { useState, useEffect } from 'react';
import { useRouter } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { productService } from '../services/productService';
import ProductCard from '../components/common/ProductCard';
import { ProductSkeleton } from '../components/common/SkeletonLoader';
import ScrollReveal, { ScrollRevealItem } from '../components/common/ScrollReveal';
import CamelCaravan from '../components/motion/CamelCaravan';
import { Crown, Feather, Sun, ArrowRight } from 'lucide-react';

export default function Collections() {
  const { queryParams } = useRouter();
  const { t } = useTranslation();

  const [activeCollection, setActiveCollection] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLLECTIONS = [
    {
      id: 'Royal Oud Reserve',
      key: 'royal-oud',
      name: t('nav.royalOudCollection'),
      arabic: 'مجموعة العود الملكي الخاصة',
      desc: 'Extracted from 60-year-old wild Assamese and Cambodian Aquilaria trees. Matured in obsidian jars within dark stone cellars.',
      icon: Crown,
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85'
    },
    {
      id: 'Imperial Silk',
      key: 'imperial-silk',
      name: t('nav.silkRoadCollection'),
      arabic: 'مجموعة الحرير الإمبراطوري',
      desc: 'Highland Taif Mountain Roses, French Centifolia, Night-Blooming Jasmine, and velvety fruity nectars.',
      icon: Feather,
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85'
    },
    {
      id: 'Desert Gold',
      key: 'desert-gold',
      name: t('nav.desertGoldCollection'),
      arabic: 'مجموعة ذهب الصحراء',
      desc: 'Warm fossilized golden amber, crisp sun-drenched bergamot, and precious frankincense tears.',
      icon: Sun,
      image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=85'
    }
  ];

  useEffect(() => {
    const cParam = queryParams.get('c');
    if (cParam === 'royal-oud') setActiveCollection('Royal Oud Reserve');
    else if (cParam === 'imperial-silk') setActiveCollection('Imperial Silk');
    else if (cParam === 'desert-gold') setActiveCollection('Desert Gold');
  }, [queryParams]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const filter = activeCollection === 'all' ? {} : { collection: activeCollection };
        const data = await productService.getAllProducts(filter);
        setProducts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeCollection]);

  return (
    <div className="pt-36 sm:pt-40 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 animate-fade-in text-[var(--text-primary)]">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[var(--text-on-sand-gold)] font-bold">
            Curated Private Reserves
          </span>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-[var(--text-on-sand)] uppercase tracking-wider">
            {t('nav.collections')}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-on-sand-sec)]">
            Explore the three sovereign collections distilled by our master perfumers in limited batches.
          </p>
        </div>
      </ScrollReveal>

      {/* Desert Camel Caravan — Below First Header Section */}
      <div className="relative w-full h-32 sm:h-44 md:h-52 overflow-hidden -my-4 pointer-events-none">
        <CamelCaravan speedMultiplier={0.9} opacity={0.95} scale={1.05} />
      </div>

      {/* Collection Tab Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLLECTIONS.map((c, index) => {
          const Icon = c.icon;
          const isActive = activeCollection === c.id;
          return (
            <ScrollRevealItem key={c.id} index={index}>
              <div
                onClick={() => setActiveCollection(isActive ? 'all' : c.id)}
                className={`cursor-pointer p-6 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                  isActive
                    ? 'border-[var(--gold-primary)] bg-[var(--bg-card)] shadow-2xl scale-[1.02]'
                    : 'border-[var(--border-card)] bg-[var(--bg-card)] hover:border-[var(--gold-primary)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-none border border-[var(--border-gold-subtle)] flex items-center justify-center text-[var(--gold-primary)] bg-[var(--bg-primary)]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-arabic text-xs text-[var(--gold-light)] font-bold">{c.arabic}</span>
                  </div>
                  <h3 className="font-cinzel text-base font-bold text-[var(--text-primary)] mb-1">
                    {c.name}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] font-sans leading-relaxed line-clamp-2">
                    {c.desc}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                  <span className="font-cinzel uppercase text-[var(--gold-primary)] font-semibold">
                    {isActive ? 'Showing Collection' : 'Select Collection'}
                  </span>
                  <ArrowRight className={`w-3.5 h-3.5 text-[var(--gold-primary)] ${isActive ? 'rotate-90' : ''} transition-transform`} />
                </div>
              </div>
            </ScrollRevealItem>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="space-y-6">
        <ScrollReveal direction="up" delay={0.2}>
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 text-xs text-[var(--text-muted)]">
            <span>
              Showing {products.length} masterpieces in{' '}
              <strong className="text-[var(--text-primary)] font-cinzel">
                {activeCollection === 'all' ? 'All Collections' : activeCollection}
              </strong>
            </span>
            {activeCollection !== 'all' && (
              <button
                onClick={() => setActiveCollection('all')}
                className="text-[var(--gold-primary)] hover:underline cursor-pointer font-cinzel"
              >
                Show All Collections
              </button>
            )}
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((p, index) => (
              <ScrollRevealItem key={p.id} index={index}>
                <ProductCard product={p} />
              </ScrollRevealItem>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
