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

  const POPULAR_SEARCHES = ['Dehn Al Oud', 'Amber Al Malaki', 'Taif Rose', 'Bakhoor', 'Bergamot', 'Babylon Fig'];
  const SUGGESTED_NOTES = ['Oud', 'Ambergris', 'Taif Rose', 'Bakhoor Smoke', 'Saffron', 'Bergamot', 'Bourbon Vanilla'];

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
    }, 200);

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0F0D0C]/95 backdrop-blur-xl animate-fade-in text-[#F3EEE5] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Top Bar with Close */}
        <div className="flex items-center justify-between border-b border-[#C6A15B]/20 pb-4 mb-8">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C6A15B]" />
            <span className="font-cinzel text-sm uppercase tracking-[0.25em] text-[#C6A15B]">
              Royal Olfactory Search
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#C5B8A8] hover:text-[#C6A15B] transition-colors"
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
            className="w-full bg-[#1C120E] border-b-2 border-[#C6A15B] py-4 pl-12 pr-12 text-lg sm:text-2xl font-cinzel text-[#F3EEE5] placeholder-[#C5B8A8]/40 focus:outline-none focus:bg-[#241712] transition-colors"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-[#C6A15B]" />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C5B8A8] hover:text-[#F3EEE5]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </form>

        {/* Popular & Suggested Tags (when query is empty) */}
        {!query && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h4 className="font-cinzel text-xs uppercase tracking-[0.2em] text-[#C6A15B] mb-3">
                {t('common.popularSearches')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map(item => (
                  <button
                    key={item}
                    onClick={() => setQuery(item)}
                    className="px-3.5 py-1.5 bg-[#1C120E] border border-[#C6A15B]/30 hover:border-[#C6A15B] text-xs font-sans text-[#F3EEE5] hover:text-[#C6A15B] transition-all"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-cinzel text-xs uppercase tracking-[0.2em] text-[#C6A15B] mb-3">
                {t('common.suggestedNotes')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_NOTES.map(note => (
                  <button
                    key={note}
                    onClick={() => setQuery(note)}
                    className="px-3 py-1 bg-[#2B1A12]/50 border border-[#C6A15B]/20 hover:border-[#C6A15B] text-xs font-sans text-[#C5B8A8] hover:text-[#F3EEE5] transition-all"
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
            <div className="flex items-center justify-between text-xs text-[#C5B8A8] border-b border-[#C6A15B]/15 pb-2">
              <span>
                {loading ? 'Distilling search results...' : `${results.length} fragrances matched`}
              </span>
              {results.length > 0 && (
                <button
                  onClick={handleSearchSubmit}
                  className="text-[#C6A15B] hover:underline flex items-center gap-1 font-cinzel uppercase text-[11px] tracking-wider"
                >
                  <span>View All in Boutique</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {results.length === 0 && !loading ? (
              <div className="text-center py-12 text-[#C5B8A8]">
                <p className="font-cinzel text-base text-[#F3EEE5] mb-1">
                  {t('shop.noProductsFound')}
                </p>
                <p className="text-xs">
                  Try searching for ingredients like "Oud", "Amber", "Rose", or "Saffron".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                {results.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => handleSelectProduct(prod.id)}
                    className="flex gap-3 p-3 bg-[#1C120E] border border-[#C6A15B]/20 hover:border-[#C6A15B] cursor-pointer transition-all group"
                  >
                    <img
                      src={prod.images?.[0]}
                      alt={prod.name}
                      className="w-16 h-20 object-cover bg-[#0F0D0C] shrink-0 border border-[#C6A15B]/10"
                    />
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#C6A15B] font-mono">
                          {prod.fragranceFamily}
                        </span>
                        <h5 className="font-cinzel text-sm font-semibold text-[#F3EEE5] group-hover:text-[#C6A15B] transition-colors line-clamp-1">
                          {prod.name}
                        </h5>
                        <p className="font-arabic text-xs text-[#C5B8A8]">{prod.arabicName}</p>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-cinzel text-xs font-bold text-[#C6A15B]">
                          ${prod.price}
                        </span>
                        <div className="flex items-center gap-0.5 text-[#C6A15B] text-[10px]">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{prod.rating}</span>
                        </div>
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
