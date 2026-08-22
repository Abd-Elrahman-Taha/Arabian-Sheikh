import React, { useState, useEffect } from 'react';
import { useRouter } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { productService } from '../services/productService';
import ProductCard from '../components/common/ProductCard';
import { ProductSkeleton } from '../components/common/SkeletonLoader';
import ScrollReveal, { ScrollRevealItem } from '../components/common/ScrollReveal';
import CamelCaravan from '../components/motion/CamelCaravan';
import BlurText from '../components/common/BlurText';
import { Crown, Feather, Sun, ArrowRight } from 'lucide-react';

export default function Collections() {
  const { queryParams } = useRouter();
  const { t } = useTranslation();
  const { isDark } = useTheme();

  const [activeCollection, setActiveCollection] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLLECTIONS = [
    {
      id: 'Royal Oud Reserve',
      key: 'royal-oud',
      name: t('nav.royalOudCollection') || 'Royal Oud Reserve',
      arabic: 'مجموعة العود الملكي الخاصة',
      desc: 'Extracted from 60-year-old wild Assamese and Cambodian Aquilaria trees. Matured in obsidian jars within dark stone cellars.',
      icon: Crown
    },
    {
      id: 'Imperial Silk',
      key: 'imperial-silk',
      name: t('nav.silkRoadCollection') || 'Imperial Silk',
      arabic: 'مجموعة الحرير الإمبراطوري',
      desc: 'Highland Taif Mountain Roses, French Centifolia, Night-Blooming Jasmine, and velvety fruity nectars.',
      icon: Feather
    },
    {
      id: 'Desert Gold',
      key: 'desert-gold',
      name: t('nav.desertGoldCollection') || 'Desert Gold',
      arabic: 'مجموعة ذهب الصحراء',
      desc: 'Warm fossilized golden amber, crisp sun-drenched bergamot, and precious frankincense tears.',
      icon: Sun
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
    <div className={`pt-36 sm:pt-40 pb-16 max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-16 animate-fade-in transition-colors duration-500 ${
      isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
    }`}>
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className={`font-cinzel text-xs uppercase tracking-[0.35em] font-bold ${
            isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
          }`}>
            Curated Private Reserves
          </span>
          <BlurText
            text={t('nav.collections') || 'THE ROYAL COLLECTIONS'}
            delay={70}
            animateBy="words"
            direction="top"
            className={`font-cinzel text-3xl sm:text-5xl font-bold uppercase tracking-wider justify-center ${
              isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
            }`}
            as="h1"
          />
          <p className={`text-xs sm:text-sm max-w-2xl mx-auto font-medium ${
            isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'
          }`}>
            Explore the three sovereign collections distilled by our master perfumers in limited batches.
          </p>
        </div>
      </ScrollReveal>

      {/* Desert Camel Caravan */}
      <div className="relative w-full h-32 sm:h-44 md:h-52 overflow-hidden -my-4 pointer-events-none">
        <CamelCaravan speedMultiplier={0.9} opacity={0.95} scale={1.05} />
      </div>

      {/* Collection Tab Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLLECTIONS.map((c, index) => {
          const Icon = c.icon;
          const isActive = activeCollection === c.id;
          return (
            <ScrollRevealItem key={c.id} index={index}>
              <div
                onClick={() => setActiveCollection(isActive ? 'all' : c.id)}
                className={`cursor-pointer p-6 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between rounded-2xl ${
                  isActive
                    ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50 shadow-xl scale-[1.02] ' +
                      (isDark ? 'bg-black/80' : 'bg-white')
                    : isDark
                    ? 'border-[#D4AF37]/20 bg-[#0B0A08] hover:border-[#D4AF37]'
                    : 'border-[#D4AF37]/30 bg-white hover:border-[#D4AF37] shadow-[0_8px_25px_rgba(0,0,0,0.04)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-full border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] bg-[#D4AF37]/15">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-arabic text-xs text-[#D4AF37] font-bold">{c.arabic}</span>
                  </div>
                  <h3 className={`font-cinzel text-base font-bold mb-1 ${
                    isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
                  }`}>
                    {c.name}
                  </h3>
                  <p className={`text-xs font-sans leading-relaxed line-clamp-2 font-medium ${
                    isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'
                  }`}>
                    {c.desc}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs">
                  <span className="font-cinzel uppercase text-[#D4AF37] font-bold">
                    {isActive ? 'Showing Collection' : 'Select Collection'}
                  </span>
                  <ArrowRight className={`w-3.5 h-3.5 text-[#D4AF37] ${isActive ? 'rotate-90' : ''} transition-transform`} />
                </div>
              </div>
            </ScrollRevealItem>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="space-y-6">
        <ScrollReveal direction="up" delay={0.2}>
          <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3 text-xs font-medium">
            <span>
              Showing {products.length} masterpieces in{' '}
              <strong className={`font-cinzel ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>
                {activeCollection === 'all' ? 'All Collections' : activeCollection}
              </strong>
            </span>
            {activeCollection !== 'all' && (
              <button
                onClick={() => setActiveCollection('all')}
                className="text-[#D4AF37] hover:underline cursor-pointer font-cinzel font-bold"
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
