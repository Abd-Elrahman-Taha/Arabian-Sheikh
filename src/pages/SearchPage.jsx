import React, { useState, useEffect } from 'react';
import { useRouter } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { productService } from '../services/productService';
import ProductCard from '../components/common/ProductCard';
import { ProductSkeleton } from '../components/common/SkeletonLoader';
import { Search, X, Sparkles } from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../components/common/ScrollReveal';

export default function SearchPage() {
  const { queryParams } = useRouter();
  const { t } = useTranslation();

  const [query, setQuery] = useState(queryParams.get('q') || queryParams.get('search') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function doSearch() {
      if (!query.trim()) {
        const all = await productService.getAllProducts();
        setResults(all);
        return;
      }
      setLoading(true);
      try {
        const data = await productService.getAllProducts({ search: query });
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    doSearch();
  }, [query]);

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in text-[var(--text-primary)]">
      <ScrollReveal direction="up">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[var(--gold-primary)] font-semibold">
            Olfactory Inquiries
          </span>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-[var(--text-primary)] uppercase tracking-wider">
            {t('nav.search')}
          </h1>
        </div>
      </ScrollReveal>

      {/* Search Input Bar */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="max-w-3xl mx-auto relative">
          <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('common.searchPlaceholder')}
          className="w-full bg-[var(--bg-card)] border-2 border-[var(--gold-primary)]/40 focus:border-[var(--gold-primary)] py-4 pl-12 pr-10 text-base sm:text-lg font-cinzel text-[var(--text-primary)] placeholder-[var(--text-muted)]/60 focus:outline-none shadow-2xl"
        />
        <Search className="w-6 h-6 text-[var(--gold-primary)] absolute left-4 top-1/2 -translate-y-1/2" />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        </div>
      </ScrollReveal>

      {/* Results Header */}
      <div className="border-b border-[var(--border-subtle)] pb-3 flex justify-between items-center text-xs text-[var(--text-muted)]">
        <span>
          {loading ? 'Searching royal archives...' : `Found ${results.length} fragrances`}
        </span>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 bg-[var(--bg-card)] border border-[var(--border-card)] p-8 space-y-3 shadow-sm">
          <Sparkles className="w-8 h-8 text-[var(--gold-primary)] mx-auto opacity-50" />
          <h3 className="font-cinzel text-lg font-bold text-[var(--text-primary)]">
            {t('shop.noProductsFound')}
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Try searching for "Oud", "Amber", "Bakhoor", "Rose", "Bergamot", or "Pomegranate".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map((p, i) => (
            <ScrollRevealItem key={p.id} index={i}>
              <ProductCard product={p} />
            </ScrollRevealItem>
          ))}
        </div>
      )}
    </div>
  );
}
