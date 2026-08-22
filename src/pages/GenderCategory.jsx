import React, { useState, useEffect } from 'react';
import { useRouter } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { productService } from '../services/productService';
import ProductCard from '../components/common/ProductCard';
import { ProductSkeleton } from '../components/common/SkeletonLoader';
import { Sparkles } from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../components/common/ScrollReveal';

export default function GenderCategory({ genderType }) {
  const { currentPath } = useRouter();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentGender = genderType || (
    currentPath.includes('/men') ? 'men' :
    currentPath.includes('/women') ? 'women' : 'unisex'
  );

  const METADATA = {
    men: {
      title: t('home.menTitle') || 'Men’s Sovereign Collection',
      arabic: 'عطور الرجال الملكية',
      subtitle: 'Charismatic Presence & Regal Woods',
      desc: t('home.menDesc') || 'Distilled with aged Cambodian oud, wild cardamom, and noble leather.'
    },
    women: {
      title: t('home.womenTitle') || 'Women’s Royal Silk Collection',
      arabic: 'عطور النساء الفاخرة',
      subtitle: 'Velvet Taif Rose & White Amber Nectar',
      desc: t('home.womenDesc') || 'Precious Damascus roses, candied ambergris, and spun vanilla nectar.'
    },
    unisex: {
      title: t('home.unisexTitle') || 'Unisex Palace Reserve',
      arabic: 'المجموعة الملكية الخاصة',
      subtitle: 'Sacred Resins & Transcendent Saffron',
      desc: t('home.unisexDesc') || 'Sacred resins, crystalline amber, and royal Kashmiri saffron.'
    }
  };

  const meta = METADATA[currentGender] || METADATA.unisex;

  useEffect(() => {
    async function loadCategory() {
      setLoading(true);
      try {
        const data = await productService.getAllProducts({ gender: currentGender });
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCategory();
  }, [currentGender]);

  return (
    <div className={`space-y-16 pb-12 animate-fade-in transition-colors duration-500 ${
      isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
    }`}>
      {/* Editorial Category Hero */}
      <ScrollReveal direction="up">
        <section className={`relative min-h-[42vh] flex items-center justify-center overflow-hidden pt-36 sm:pt-44 pb-12 border-b border-[#D4AF37]/20 ${
          isDark
            ? 'bg-gradient-to-b from-[#140D07] via-[#0B0A08] to-[#0B0A08]'
            : 'bg-gradient-to-b from-[#FAF6F0] via-[#F8F5EE] to-[#FAF7F2]'
        }`}>
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 border border-[#D4AF37]/40 bg-[#D4AF37]/15 rounded-full backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className={`font-cinzel text-xs uppercase tracking-[0.25em] font-bold ${
                isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
              }`}>
                {meta.subtitle}
              </span>
            </div>

            <h1 className={`font-cinzel text-3xl sm:text-5xl font-bold uppercase tracking-wider ${
              isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
            }`}>
              {meta.title}
            </h1>

            <p className="font-arabic text-xl text-[#D4AF37] font-bold">
              {meta.arabic}
            </p>

            <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-medium ${
              isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'
            }`}>
              {meta.desc}
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* Products Grid */}
      <section className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <ScrollReveal direction="up">
          <div className="border-b border-black/10 dark:border-white/10 pb-4 mb-8 flex justify-between items-center text-xs font-medium">
            <span className={isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}>Displaying {products.length} exclusive formulations</span>
            <span className="font-cinzel uppercase text-[#D4AF37] font-bold">Pure Extrait de Parfum</span>
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
      </section>
    </div>
  );
}
