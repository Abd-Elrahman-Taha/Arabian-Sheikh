import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { productService } from '../../services/productService';
import { Search, X, ArrowRight, Sparkles, Star } from 'lucide-react';

export default function SearchOverlay({ isOpen, onClose }) {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const { isDark } = useTheme();
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
    <div className={`fixed inset-0 z-50 overflow-y-auto backdrop-blur-2xl animate-fade-in p-4 sm:p-8 transition-colors duration-500 ${
      isDark ? 'bg-[#0B0A08]/95 text-[#F3E6D0]' : 'bg-[#FAF7F2]/95 text-[#120B06]'
    }`}>
      <div className="max-w-4xl mx-auto">
        {/* Top Bar with Close */}
        <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4 mb-8">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-cinzel text-sm uppercase tracking-[0.25em] text-[#D4AF37] font-bold">
              Royal Olfactory Search
            </span>
          </div>
          <button
            onClick={onClose}
            className={`p-2 transition-colors cursor-pointer ${
              isDark ? 'text-[#D8BE99] hover:text-[#D4AF37]' : 'text-[#5A3517] hover:text-black'
            }`}
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
            placeholder={t('common.searchPlaceholder') || 'Search perfumes, notes, oils...'}
            className={`w-full border-b-2 py-4 pl-12 pr-12 text-lg sm:text-2xl font-cinzel transition-colors shadow-sm focus:outline-none ${
              isDark
                ? 'bg-black/40 border-[#D4AF37] text-[#F3E6D0] placeholder-neutral-500 focus:bg-black/60'
                : 'bg-white border-[#D4AF37] text-[#120B06] placeholder-neutral-400 focus:bg-[#FFFDF9]'
            }`}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-[#D4AF37]" />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer ${
                isDark ? 'text-[#D8BE99] hover:text-white' : 'text-[#5A3517] hover:text-black'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </form>

        {/* Popular & Suggested Tags (when query is empty) */}
        {!query && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h4 className={`font-cinzel text-xs uppercase tracking-[0.2em] mb-3 font-bold ${
                isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
              }`}>
                {t('common.popularSearches') || 'Popular Creations'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map(item => (
                  <button
                    key={item}
                    onClick={() => setQuery(item)}
                    className={`px-3.5 py-1.5 border text-xs font-sans transition-all cursor-pointer font-bold rounded-full ${
                      isDark
                        ? 'bg-black/50 border-[#D4AF37]/30 hover:border-[#D4AF37] text-[#F3E6D0] hover:text-[#D4AF37]'
                        : 'bg-white border-[#D4AF37]/35 hover:border-[#D4AF37] text-[#120B06] hover:text-[#B8860B] shadow-sm'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className={`font-cinzel text-xs uppercase tracking-[0.2em] mb-3 font-bold ${
                isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
              }`}>
                {t('common.suggestedNotes') || 'Signature Olfactory Notes'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_NOTES.map(note => (
                  <button
                    key={note}
                    onClick={() => setQuery(note)}
                    className={`px-3 py-1 border text-xs font-sans transition-all cursor-pointer font-medium rounded-full ${
                      isDark
                        ? 'bg-black/30 border-white/10 hover:border-[#D4AF37] text-[#D8BE99] hover:text-[#F3E6D0]'
                        : 'bg-white/80 border-[#D4AF37]/25 hover:border-[#D4AF37] text-[#5A3517] hover:text-[#120B06] shadow-sm'
                    }`}
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
            <div className={`flex items-center justify-between text-xs border-b pb-2 font-medium ${
              isDark ? 'border-white/10 text-[#D8BE99]' : 'border-black/10 text-[#5A3517]'
            }`}>
              <span>
                {loading ? 'Distilling search results...' : `${results.length} creations matched`}
              </span>
              {results.length > 0 && (
                <button
                  onClick={handleSearchSubmit}
                  className="text-[#D4AF37] hover:underline flex items-center gap-1 font-cinzel uppercase text-[11px] tracking-wider cursor-pointer font-bold"
                >
                  <span>View All in Boutique</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {results.length === 0 && !loading ? (
              <div className={`text-center py-12 text-sm space-y-2 font-medium ${
                isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'
              }`}>
                <p>No bespoke flacons found matching "{query}".</p>
                <p className="text-xs">Try searching for ingredients such as Oud, Amber, Rose, or Bakhoor.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.slice(0, 6).map(product => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product.id)}
                    className={`flex gap-4 p-3.5 border cursor-pointer transition-all hover:translate-x-1 rounded-xl ${
                      isDark
                        ? 'bg-black/60 border-[#D4AF37]/20 hover:border-[#D4AF37]'
                        : 'bg-white border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-sm'
                    }`}
                  >
                    <img
                      src={product.cutoutImage || product.images?.[0] || '/products/black_diamond_gold.png'}
                      alt={product.name}
                      className={`w-16 h-20 object-contain p-1 border rounded-lg shrink-0 ${
                        isDark ? 'bg-black/40 border-white/10' : 'bg-[#FAF7F2] border-black/10'
                      }`}
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-mono font-bold">
                          {product.fragranceFamily || 'Haute Parfumerie'}
                        </span>
                        <h4 className={`font-cinzel text-sm font-bold line-clamp-1 ${
                          isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
                        }`}>
                          {product.name}
                        </h4>
                        {product.arabicName && (
                          <p className="font-arabic text-xs text-[#D4AF37] font-semibold">{product.arabicName}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1 text-[#D4AF37] text-xs font-bold">
                          <Star className="w-3 h-3 fill-current" />
                          <span className={isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}>{product.rating || '5.0'}</span>
                        </div>
                        <span className="font-cinzel text-sm font-bold text-[#D4AF37]">
                          €{product.price}
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
