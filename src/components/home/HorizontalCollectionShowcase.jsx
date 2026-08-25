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
  ArrowRight
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import BlurText from '../common/BlurText';

gsap.registerPlugin(ScrollTrigger);

export default function HorizontalCollectionShowcase({
  collection,
  index = 0,
  isEven = false
}) {
  const { navigate } = useRouter();
  const { language, t } = useTranslation();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isDark } = useTheme();

  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const titleRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Mouse drag state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const updateScrollButtons = () => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    const max = scrollWidth - clientWidth;
    if (max > 0) {
      setScrollProgress(Math.min(100, Math.max(0, (scrollLeft / max) * 100)));
    }
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    updateScrollButtons();
    track.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      track.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [collection.products]);

  // GSAP ScrollTrigger Entrance Animation
  useEffect(() => {
    const el = sectionRef.current;
    const titleEl = titleRef.current;
    const cards = el?.querySelectorAll('.collection-product-card');
    if (!el || !titleEl || !cards) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleEl,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
            toggleActions: 'play none none none'
          }
        }
      );

      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            once: true,
            toggleActions: 'play none none none'
          }
        }
      );
    }, el);

    return () => ctx.revert();
  }, [collection.products]);

  const handleScroll = (direction) => {
    if (!trackRef.current) return;
    const scrollAmount = trackRef.current.clientWidth * 0.75;
    trackRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Mouse Drag to Scroll handlers
  const handleMouseDown = (e) => {
    if (!trackRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeftRef.current = trackRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    trackRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  const title = language === 'bg' && collection.bulgarianTitle
    ? collection.bulgarianTitle
    : language === 'es' && collection.spanishTitle
    ? collection.spanishTitle
    : collection.title;

  const description = language === 'bg' && collection.bulgarianDescription
    ? collection.bulgarianDescription
    : language === 'es' && collection.spanishDescription
    ? collection.spanishDescription
    : collection.description;

  return (
    <section
      ref={sectionRef}
      className="relative py-16 sm:py-20 lg:py-24 border-t border-[#D4AF37]/20 transition-colors duration-500 bg-transparent overflow-hidden"
    >
      <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8 sm:space-y-10">
        
        {/* Collection Header: High Contrast & Crisp Typography */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-black/10 dark:border-white/10">
          <div ref={titleRef} className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-px w-8 bg-[#D4AF37]" />
              <span className={`text-xs uppercase tracking-[0.35em] font-cinzel font-bold ${
                isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
              }`}>
                {collection.tier || 'Royal Reserve'} • 0{index + 1}
              </span>
              {collection.curatorNote && (
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-mono font-semibold">
                  {collection.curatorNote}
                </span>
              )}
            </div>

            <BlurText
              text={title}
              delay={70}
              animateBy="words"
              direction="top"
              className={`text-3xl sm:text-4xl lg:text-5xl font-cinzel font-bold tracking-[0.04em] leading-tight ${
                isDark ? 'text-[#F3E6D0] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]' : 'text-[#120B06]'
              }`}
              as="h2"
            />

            <p className={`text-sm sm:text-base font-sans font-medium leading-relaxed ${
              isDark ? 'text-[#D8BE99]' : 'text-[#2C180F]'
            }`}>
              {description}
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-4 shrink-0 self-start lg:self-end">
            <div className={`hidden sm:flex flex-col items-end gap-1 text-[11px] font-mono font-bold ${
              isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
            }`}>
              <span>EXPLORE HORIZONTALLY</span>
              <div className="w-32 h-1.5 bg-black/10 dark:bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#D8BE99] via-[#D4AF37] to-[#F3E6D0] transition-all duration-200"
                  style={{ width: `${Math.max(15, scrollProgress)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleScroll('left')}
                disabled={!canScrollLeft}
                className={`p-3 rounded-full border transition-all duration-300 ${
                  canScrollLeft
                    ? isDark
                      ? 'border-[#D4AF37] bg-black/80 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black cursor-pointer shadow-lg'
                      : 'border-[#D4AF37] bg-white text-[#120B06] hover:bg-[#D4AF37] hover:text-black cursor-pointer shadow-md'
                    : 'border-black/10 dark:border-white/10 opacity-40 cursor-not-allowed text-neutral-400'
                }`}
                aria-label="Previous Products in Collection"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleScroll('right')}
                disabled={!canScrollRight}
                className={`p-3 rounded-full border transition-all duration-300 ${
                  canScrollRight
                    ? isDark
                      ? 'border-[#D4AF37] bg-black/80 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black cursor-pointer shadow-lg'
                      : 'border-[#D4AF37] bg-white text-[#120B06] hover:bg-[#D4AF37] hover:text-black cursor-pointer shadow-md'
                    : 'border-black/10 dark:border-white/10 opacity-40 cursor-not-allowed text-neutral-400'
                }`}
                aria-label="Next Products in Collection"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Track (Touch-friendly & Drag-to-scroll) */}
        <div
          ref={trackRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-none py-4 px-1 cursor-grab active:cursor-grabbing select-none"
          style={{ scrollSnapType: 'x mandatory', touchAction: 'pan-x pan-y' }}
        >
          {collection.products.map((product, pIdx) => {
            const isSaved = isInWishlist(product.id);
            const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stock === 0;

            const displayName = language === 'bg' && product.bulgarianName
              ? product.bulgarianName
              : language === 'es' && product.spanishName
              ? product.spanishName
              : product.name;

            const topNote = product.notes?.top?.[0] || product.topNotes?.[0] || 'Rare Resins';
            const heartNote = product.notes?.heart?.[0] || product.heartNotes?.[0] || 'Taif Rose';

            return (
              <div
                key={product.id || pIdx}
                className={`collection-product-card shrink-0 w-[290px] sm:w-[340px] md:w-[360px] border-2 p-6 flex flex-col justify-between transition-all duration-500 rounded-2xl group hover:-translate-y-2 ${
                  isDark
                    ? 'bg-gradient-to-br from-[#8C6239]/40 via-[#D4AF37]/25 to-[#5A3E1B]/50 border-[#D4AF37]/80 hover:border-[#FFF2B2] shadow-[0_12px_40px_rgba(212,175,55,0.35)] hover:shadow-[0_22px_55px_rgba(212,175,55,0.55)]'
                    : 'bg-gradient-to-br from-[#FFF8E7] via-[#F7E7C4] to-[#EBD29B] border-[#D4AF37]/75 hover:border-[#D4AF37] shadow-[0_12px_35px_rgba(212,175,55,0.25)] hover:shadow-[0_20px_45px_rgba(212,175,55,0.4)]'
                }`}
                style={{ scrollSnapAlign: 'start' }}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    {product.tier ? (
                      <span className="px-3 py-1 rounded-full text-[11px] font-cinzel font-bold uppercase tracking-wider bg-[#D4AF37] text-black shadow-sm">
                        {product.tier} Tier
                      </span>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-[11px] font-cinzel font-bold uppercase tracking-wider border ${
                        isDark ? 'bg-black/75 text-[#FFF2B2] border-[#D4AF37]/50' : 'bg-[#FAF1DF] text-[#8C6239] border-[#D4AF37]/40 font-bold'
                      }`}>
                        {product.category || 'Palace Reserve'}
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
                        isSaved
                          ? 'border-[#D4AF37] bg-[#D4AF37] text-black shadow-sm'
                          : isDark
                          ? 'border-[#D4AF37]/40 bg-black/75 text-[#FFF2B2] hover:text-white'
                          : 'border-[#D4AF37]/40 bg-white/90 text-[#120B06] hover:bg-[#D4AF37] hover:text-black shadow-xs'
                      }`}
                      title="Save to Wishlist"
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Flacon Visual */}
                  <div
                    onClick={() => navigate(`/product/${product.slug || product.id}`)}
                    className={`aspect-[4/5] flex items-center justify-center p-0 mb-4 border relative overflow-hidden cursor-pointer rounded-xl transition-colors ${
                      isDark
                        ? 'bg-gradient-to-b from-[#26190C] via-[#1F1308] to-[#140C05] border-[#D4AF37]/35 group-hover:border-[#D4AF37]'
                        : 'bg-gradient-to-b from-[#FFFBF2] to-[#FAF1DF] border-[#D4AF37]/40 group-hover:border-[#D4AF37]'
                    }`}
                  >
                    <img
                      src={product.cutoutImage || product.images?.[0] || '/products/luxury_designs/07_arabian_gold.webp'}
                      alt={product.name}
                      className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.35)] group-hover:scale-108 transition-transform duration-700 pointer-events-none"
                    />
                  </div>

                  {/* High Contrast Product Info */}
                  <div className="space-y-2.5">
                    <h3
                      onClick={() => navigate(`/product/${product.slug || product.id}`)}
                      className={`font-cinzel text-lg font-bold transition-colors cursor-pointer line-clamp-1 ${
                        isDark ? 'text-[#FFF5E6] group-hover:text-[#FFF2B2]' : 'text-[#120B06] group-hover:text-[#D4AF37]'
                      }`}
                    >
                      {displayName}
                    </h3>

                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-mono text-xs font-semibold ${
                        isDark ? 'text-[#FFF2B2]' : 'text-[#5A3517]'
                      }`}>
                        {product.size || '60 ml'} • {product.fragranceFamily || 'Oriental'}
                      </span>
                      <span className="font-cinzel font-bold text-[#D4AF37] text-lg">
                        €{product.price}
                      </span>
                    </div>

                    {/* Scent Notes Highlights */}
                    <div className={`py-2 px-3 border text-xs space-y-0.5 rounded-lg ${
                      isDark ? 'bg-black/60 border-[#D4AF37]/30 text-[#FFF5E6]' : 'bg-white/90 border-[#D4AF37]/30 text-[#2C180F]'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="text-[#D4AF37] font-semibold text-[11px] uppercase tracking-wider">Notes:</span>
                        <span className="text-right truncate ml-2 text-[11px] font-medium">{topNote} • {heartNote}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ultra-Luxury Card Actions */}
                <div className="grid grid-cols-2 gap-2.5 pt-4 mt-4 border-t border-[#D4AF37]/30">
                  <button
                    onClick={() => addToCart(product, product.size || '60 ml', 1)}
                    disabled={isOutOfStock}
                    className={`group/btn relative py-3 px-3 rounded-full font-cinzel font-bold text-[10px] sm:text-[11px] uppercase tracking-[0.18em] transition-all duration-400 flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer overflow-hidden ${
                      isDark
                        ? 'bg-[#0B0A08] hover:bg-[#1A1008] text-[#FFF2B2] hover:text-[#D4AF37] border border-[#D4AF37]/70 shadow-[0_6px_20px_rgba(0,0,0,0.6)]'
                        : 'bg-[#1A1008] hover:bg-[#2C180F] text-[#FFFDF9] hover:text-[#D4AF37] border border-[#D4AF37]/60 shadow-[0_6px_20px_rgba(0,0,0,0.15)]'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 relative z-10 transition-transform duration-300 group-hover/btn:scale-110" />
                    <span className="relative z-10 drop-shadow-sm">{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
                  </button>

                  <Link
                    to={`/product/${product.slug || product.id}`}
                    className={`group/btn relative py-3 px-3 rounded-full border font-cinzel font-bold text-[10px] sm:text-[11px] uppercase tracking-[0.18em] transition-all duration-300 flex items-center justify-center gap-1.5 text-center shadow-sm hover:scale-[1.02] ${
                      isDark
                        ? 'bg-[#1A1008] hover:bg-[#0B0A08] border-[#D4AF37]/50 text-[#FFF2B2] hover:text-[#D4AF37]'
                        : 'bg-white/90 hover:bg-white border-[#D4AF37]/50 text-[#120B06] hover:text-[#B8860B]'
                    }`}
                  >
                    <span>Discover</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
