import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { productService } from '../../services/productService';
import { Search, X, ArrowRight, Sparkles, Star } from 'lucide-react';

export default function SearchOverlay({ isOpen, onClose }) {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const POPULAR_SEARCHES = ['Dehn Al Oud', 'Amber Al Malaki', 'Taif Rose', 'Bakhoor', 'Bergamot', 'Royal Assamese'];
  const SUGGESTED_NOTES = ['Oud', 'Ambergris', 'Taif Rose', 'Bakhoor Smoke', 'Saffron Threads', 'Bergamot', 'Bourbon Vanilla'];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const found = await productService.getAllProducts({ search: query });
        setResults(found);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelectProduct = (id) => {
    onClose();
    navigate(`/product/${id}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--color-desert-primary)]/95 backdrop-blur-2xl animate-fade-in text-[var(--color-earth-dark)] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Top Bar with Close */}
        <div className="flex items-center justify-between border-b border-[var(--color-terracotta-deep)]/20 pb-4 mb-8">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--color-terracotta)]" />
            <span className="font-cinzel text-sm uppercase tracking-[0.25em] text-[var(--color-terracotta)] font-bold">
              Royal Olfactory Search
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--color-terracotta-deep)] hover:text-[var(--color-earth-dark)] transition-colors cursor-pointer"
            aria-label="Close search"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Big Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative mb-8">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('common.searchPlaceholder')}
            className="w-full bg-[var(--color-desert-light)] border-b-2 border-[var(--color-terracotta)] py-4 pl-12 pr-12 text-lg sm:text-2xl font-cinzel text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/60 focus:outline-none focus:bg-[var(--color-desert-light)] transition-colors shadow-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-[var(--color-terracotta)]" />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-terracotta-deep)] hover:text-[var(--color-earth-dark)] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </form>

        {/* Popular & Suggested Tags (when query is empty) */}
        {!query && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h4 className="font-cinzel text-xs uppercase tracking-[0.2em] text-[var(--color-terracotta)] mb-3 font-bold">
                {t('common.popularSearches')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map(item => (
                  <button
                    key={item}
                    onClick={() => setQuery(item)}
                    className="px-3.5 py-1.5 bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 hover:border-[var(--color-terracotta)] text-xs font-sans text-[var(--color-earth-dark)] hover:text-[var(--color-terracotta)] transition-all cursor-pointer shadow-sm font-bold"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-cinzel text-xs uppercase tracking-[0.2em] text-[var(--color-terracotta)] mb-3 font-bold">
                {t('common.suggestedNotes')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_NOTES.map(note => (
                  <button
                    key={note}
                    onClick={() => setQuery(note)}
                    className="px-3 py-1 bg-[var(--color-desert-light)]/70 border border-[var(--color-terracotta-deep)]/20 hover:border-[var(--color-terracotta)] text-xs font-sans text-[var(--color-terracotta-deep)] hover:text-[var(--color-earth-dark)] transition-all cursor-pointer shadow-sm font-medium"
                  >
                    • {note}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Live Search Results */}
        {query && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-[var(--color-terracotta-deep)] border-b border-[var(--color-terracotta-deep)]/20 pb-2 font-medium">
              <span>
                {loading ? 'Distilling search results...' : `${results.length} creations matched`}
              </span>
              {results.length > 0 && (
                <button
                  onClick={handleSearchSubmit}
                  className="text-[var(--color-terracotta)] hover:underline flex items-center gap-1 font-cinzel uppercase text-[11px] tracking-wider cursor-pointer font-bold"
                >
                  <span>View All in Boutique</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {results.length === 0 && !loading ? (
              <div className="text-center py-12 text-[var(--color-terracotta-deep)] text-sm space-y-2 font-medium">
                <p>No bespoke flacons found matching "{query}".</p>
                <p className="text-xs">Try searching for ingredients such as Oud, Amber, Rose, or Bakhoor.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.slice(0, 6).map(product => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product.id)}
                    className="flex gap-4 p-3 bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 hover:border-[var(--color-terracotta)] cursor-pointer transition-all hover:translate-x-1 shadow-sm"
                  >
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="w-16 h-20 object-cover bg-[var(--color-desert-primary)] border border-[var(--color-terracotta-deep)]/25 shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[var(--color-terracotta)] font-mono font-bold">
                          {product.fragranceFamily}
                        </span>
                        <h4 className="font-cinzel text-sm font-bold text-[var(--color-earth-dark)]">
                          {product.name}
                        </h4>
                        <p className="font-arabic text-xs text-[var(--color-terracotta-deep)] font-semibold">{product.arabicName}</p>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1 text-[var(--color-terracotta)] text-xs font-bold">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{product.rating}</span>
                        </div>
                        <span className="font-cinzel text-sm font-bold text-[var(--color-terracotta)]">
                          ${product.price}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
