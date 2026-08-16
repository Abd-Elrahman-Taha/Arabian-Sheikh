import React, { useState, useEffect } from 'react';
import { useRouter } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { productService } from '../services/productService';
import ProductCard from '../components/common/ProductCard';
import { ProductSkeleton } from '../components/common/SkeletonLoader';
import { Search, X, Sparkles } from 'lucide-react';

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
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in text-[#F3EEE5]">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[#C6A15B] font-semibold">
          Olfactory Inquiries
        </span>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#F3EEE5] uppercase tracking-wider">
          {t('nav.search')}
        </h1>
      </div>

      {/* Search Input Bar */}
      <div className="max-w-3xl mx-auto relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('common.searchPlaceholder')}
          className="w-full bg-[#1C120E] border-2 border-[#C6A15B]/40 focus:border-[#C6A15B] py-4 pl-12 pr-10 text-base sm:text-lg font-cinzel text-[#F3EEE5] placeholder-[#C5B8A8]/40 focus:outline-none shadow-2xl"
        />
        <Search className="w-6 h-6 text-[#C6A15B] absolute left-4 top-1/2 -translate-y-1/2" />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C5B8A8] hover:text-[#F3EEE5]"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Results Header */}
      <div className="border-b border-[#C6A15B]/20 pb-3 flex justify-between items-center text-xs text-[#C5B8A8]">
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
        <div className="text-center py-16 bg-[#1C120E] border border-[#C6A15B]/20 p-8 space-y-3">
          <Sparkles className="w-8 h-8 text-[#C6A15B] mx-auto opacity-50" />
          <h3 className="font-cinzel text-lg font-bold text-[#F3EEE5]">
            {t('shop.noProductsFound')}
          </h3>
          <p className="text-xs text-[#C5B8A8]">
            Try searching for "Oud", "Amber", "Bakhoor", "Rose", "Bergamot", or "Pomegranate".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
