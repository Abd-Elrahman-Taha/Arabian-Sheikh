import React, { useRef, useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Heart,
  Star,
  Flame,
  ArrowRight,
  Crown
} from 'lucide-react';
import BlurText from '../common/BlurText';

export default function TopSellingShowcase({ products = [] }) {
  const { navigate } = useRouter();
  const { language, t } = useTranslation();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isDark } = useTheme();

  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filter bestsellers or top rated items
  const bestSellers = products.filter(p => p.isBestSeller || p.rating >= 4.95).slice(0, 12);
  const displayProducts = bestSellers.length > 0 ? bestSellers : products.slice(0, 8);

  const updateScrollButtons = () => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updateScrollButtons();
    track.addEventListener('scroll', updateScrollButtons, { passive: true });
    return () => track.removeEventListener('scroll', updateScrollButtons);
  }, [displayProducts]);

  const scroll = (direction) => {
    if (!trackRef.current) return;
    const scrollAmount = direction === 'left' ? -380 : 380;
    trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const getDisplayName = (item) => {
    if (!item) return '';
    if (language === 'ar') return item.arabicName || item.name;
    if (language === 'bg') return item.bulgarianName || item.name;
    return item.name;
  };

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden transition-colors duration-500 border-t border-[#D4AF37]/20 bg-transparent">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-10 relative z-10">
        
        {/* Header with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs uppercase font-cinzel font-bold tracking-widest">
              <Flame className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
              <span>{language === 'ar' ? 'الأكثر طلباً ومبيعاً' : 'ROYAL TOP SELLING'}</span>
            </div>
            
            <BlurText
              text={language === 'ar' ? 'تحف القصر الأكثر طلباً' : 'CROWNED BEST SELLERS'}
              delay={50}
              animateBy="words"
              direction="top"
              className={`text-3xl sm:text-4xl lg:text-5xl font-cinzel font-bold drop-shadow-md ${
                isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
              }`}
              as="h2"
            />
            
            <p className={`text-xs sm:text-sm max-w-xl font-medium leading-relaxed ${
              isDark ? 'text-[#D8BE99]' : 'text-[#3A2116]'
            }`}>
              {language === 'ar'
                ? 'العطور والزيوت الاستثنائية التي حازت على إعجاب وتقدير رواد الفخامة في العالم.'
                : 'The most requested and acclaimed extraits chosen by our sovereign patrons worldwide.'}
            </p>
          </div>

          {/* Controls & View All */}
          <div className="flex items-center gap-3">
            <Link
              to="/shop?filter=best-sellers"
              className={`hidden sm:inline-flex items-center gap-2 px-6 py-2.5 rounded-full border text-xs font-cinzel font-bold uppercase tracking-wider transition-all ${
                isDark
                  ? 'border-[#D4AF37]/40 hover:border-[#D4AF37] text-[#F3E6D0] hover:text-[#D4AF37] bg-black/40'
                  : 'border-[#D4AF37]/50 hover:border-[#D4AF37] text-[#120B06] hover:text-[#5A3517] bg-white/80'
              }`}
            >
              <span>{language === 'ar' ? 'عرض كافة العطور' : 'View Full Catalog'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </Link>

            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                !canScrollLeft
                  ? 'opacity-30 border-white/10 cursor-not-allowed text-gray-500'
                  : isDark
                  ? 'border-[#D4AF37]/40 hover:border-[#D4AF37] bg-black/60 text-[#D4AF37] hover:scale-105 shadow-md'
                  : 'border-[#D4AF37]/50 hover:border-[#D4AF37] bg-white text-[#120B06] hover:text-[#5A3517] hover:scale-105 shadow-md'
              }`}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
            </button>

            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                !canScrollRight
                  ? 'opacity-30 border-white/10 cursor-not-allowed text-gray-500'
                  : isDark
                  ? 'border-[#D4AF37]/40 hover:border-[#D4AF37] bg-black/60 text-[#D4AF37] hover:scale-105 shadow-md'
                  : 'border-[#D4AF37]/50 hover:border-[#D4AF37] bg-white text-[#120B06] hover:text-[#5A3517] hover:scale-105 shadow-md'
              }`}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 rtl:rotate-180" />
            </button>
          </div>
        </div>

        {/* Horizontal Smooth Carousel Track */}
        <div
          ref={trackRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayProducts.map((product, idx) => {
            const isSaved = isInWishlist(product.id);
            const imageSrc = product.originalImage || product.images?.[0] || product.cutoutImage;

            return (
              <div
                key={product.id || idx}
                className={`flex-none w-[280px] sm:w-[320px] snap-start group relative rounded-2xl border-2 p-4 sm:p-5 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 ${
                  isDark
                    ? 'bg-gradient-to-br from-[#8C6239]/40 via-[#D4AF37]/25 to-[#5A3E1B]/50 border-[#D4AF37]/80 hover:border-[#FFF2B2] shadow-[0_12px_40px_rgba(212,175,55,0.35)] hover:shadow-[0_22px_55px_rgba(212,175,55,0.55)]'
                    : 'bg-[#FFFDF8] hover:bg-[#FBF6EC] border-[#A8853B]/35 hover:border-[#A8853B] shadow-[0_10px_30px_-5px_rgba(112,70,34,0.08)] hover:shadow-[0_15px_35px_rgba(112,70,34,0.14)]'
                }`}
              >
                {/* Top Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-black font-cinzel font-bold text-[10px] uppercase tracking-wider shadow-sm">
                    <Crown className="w-3 h-3" />
                    <span>{product.tier ? `${product.tier} Tier` : 'Best Seller'}</span>
                  </span>

                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`p-2 rounded-full border transition-all cursor-pointer ${
                      isSaved
                        ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                        : isDark
                        ? 'bg-black/75 text-[#FFF2B2] border-[#D4AF37]/50 hover:border-[#FFF2B2]'
                        : 'bg-[#FFFDF8]/90 text-[#704622] border-[#A8853B]/40 hover:border-[#A8853B]'
                    }`}
                    aria-label="Wishlist"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Product Visual */}
                <div
                  onClick={() => navigate(`/product/${product.slug || product.id}`)}
                  className={`aspect-[4/5] relative rounded-xl overflow-hidden cursor-pointer mb-4 border ${
                    isDark ? 'border-[#D4AF37]/30 bg-black/40' : 'border-[#A8853B]/25 bg-[#EAE0CC]/30'
                  }`}
                >
                  <img
                    src={imageSrc}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Info & Purchase */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1 text-[#A8853B] dark:text-[#D4AF37]">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-xs font-mono font-bold">{product.rating || 5.0}</span>
                      </div>
                      <span className={`text-[10px] font-mono uppercase tracking-wider ${
                        isDark ? 'text-[#FFF2B2]' : 'text-[#8A6540]'
                      }`}>
                        {product.size || '60 ml'}
                      </span>
                    </div>

                    <h3
                      onClick={() => navigate(`/product/${product.slug || product.id}`)}
                      className={`font-cinzel text-base font-bold line-clamp-1 cursor-pointer transition-colors ${
                        isDark ? 'text-[#FFF5E6] group-hover:text-[#FFF2B2]' : 'text-[#704622] group-hover:text-[#A8853B]'
                      }`}
                    >
                      {getDisplayName(product)}
                    </h3>

                    {product.tagline && (
                      <p className={`text-xs line-clamp-1 mt-0.5 ${isDark ? 'text-[#D8BE99]' : 'text-[#4A2A14]'}`}>
                        {product.tagline}
                      </p>
                    )}
                  </div>

                  {/* Price and Add to Cart */}
                  <div className="pt-2 border-t border-[#A8853B]/20 dark:border-[#D4AF37]/30 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-cinzel text-lg font-bold text-[#A8853B] dark:text-[#D4AF37]">
                        €{product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs line-through ml-2 text-gray-400">
                          €{product.originalPrice}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => addToCart(product, product.size || '60 ml', 1)}
                      className={`px-4 py-2 font-cinzel font-bold text-xs uppercase tracking-wider rounded-full transition-all duration-300 flex items-center gap-1.5 shadow-md cursor-pointer hover:scale-105 ${
                        isDark
                          ? 'bg-[#0B0A08] hover:bg-[#1A1008] text-[#FFF2B2] hover:text-[#D4AF37] border border-[#D4AF37]/70'
                          : 'bg-[#704622] hover:bg-[#4A2A14] text-[#FFFDF8] hover:text-[#FFDF8A] border border-[#A8853B]/50 shadow-sm'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'أضف للسلة' : 'Add to Bag'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
