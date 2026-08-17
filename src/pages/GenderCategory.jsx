import React, { useState, useEffect } from 'react';
import { useRouter } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { productService } from '../services/productService';
import ProductCard from '../components/common/ProductCard';
import { ProductSkeleton } from '../components/common/SkeletonLoader';
import { Sparkles } from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../components/common/ScrollReveal';


export default function GenderCategory({ genderType }) {
  const { currentPath } = useRouter();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentGender = genderType || (
    currentPath.includes('/men') ? 'men' :
    currentPath.includes('/women') ? 'women' : 'unisex'
  );

  const METADATA = {
    men: {
      title: t('home.menTitle'),
      arabic: 'عطور الرجال الملكية',
      subtitle: 'Charismatic Presence & Regal Woods',
      desc: t('home.menDesc'),
      image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1800&q=85'
    },
    women: {
      title: t('home.womenTitle'),
      arabic: 'عطور النساء الفاخرة',
      subtitle: 'Velvet Taif Rose & White Amber Nectar',
      desc: t('home.womenDesc'),
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1800&q=85'
    },
    unisex: {
      title: t('home.unisexTitle'),
      arabic: 'المجموعة الملكية الخاصة',
      subtitle: 'Sacred Resins & Transcendent Saffron',
      desc: t('home.unisexDesc'),
      image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1800&q=85'
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
    <div className="space-y-16 pb-20 animate-fade-in text-[var(--text-primary)]">
      {/* Editorial Category Hero */}
      <ScrollReveal direction="up">
        <section className="relative min-h-[50vh] flex items-center justify-center bg-[var(--bg-secondary)] overflow-hidden pt-36 sm:pt-44 pb-12">
          <div className="absolute inset-0 z-0">
            <img
              src={meta.image}
              alt={meta.title}
              className="w-full h-full object-cover object-center opacity-30 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/70 to-[var(--bg-primary)]/90" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-[var(--border-gold-subtle)] bg-[var(--bg-card)]/80 backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[var(--gold-primary)]" />
              <span className="font-cinzel text-xs uppercase tracking-[0.25em] text-[var(--gold-primary)] font-semibold">
                {meta.subtitle}
              </span>
            </div>

            <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-[var(--text-primary)] uppercase tracking-wider">
              {meta.title}
            </h1>

            <p className="font-arabic text-lg text-[var(--gold-light)]">
              {meta.arabic}
            </p>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
              {meta.desc}
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="border-b border-[var(--border-subtle)] pb-4 mb-8 flex justify-between items-center text-xs text-[var(--text-muted)]">
            <span>Displaying {products.length} exclusive formulations</span>
            <span className="font-cinzel uppercase text-[var(--gold-primary)] font-semibold">Pure Extrait de Parfum</span>
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
