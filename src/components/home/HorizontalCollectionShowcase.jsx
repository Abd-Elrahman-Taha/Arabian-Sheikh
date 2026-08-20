import React, { useRef, useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Heart,
  Sparkles,
  ArrowRight,
  Eye,
  Crown
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
    const section = sectionRef.current;
    const titleEl = titleRef.current;
    const track = trackRef.current;
    if (!section || !titleEl || !track) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleEl,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 82%',
            toggleActions: 'play none none none'
          }
        }
      );

      const cards = track.querySelectorAll('.collection-product-card');
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, x: 45, scale: 0.96 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.85,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 78%',
              toggleActions: 'play none none none'
            }
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, [collection]);

  const handleScroll = (direction) => {
    if (!trackRef.current) return;
    const cardWidth = 340;
    const scrollAmount = direction === 'left' ? -cardWidth * 1.5 : cardWidth * 1.5;
    trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleMouseDown = (e) => {
    if (!trackRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeftRef.current = trackRef.current.scrollLeft;
    trackRef.current.style.cursor = 'grabbing';
    trackRef.current.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.6;
    trackRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    if (trackRef.current) {
      trackRef.current.style.cursor = 'grab';
      trackRef.current.style.removeProperty('user-select');
    }
  };

  const title = language === 'es' && collection.spanishTitle
    ? collection.spanishTitle
    : language === 'bg' && collection.bulgarianTitle
    ? collection.bulgarianTitle
    : collection.title;

  const description = language === 'es' && collection.spanishDescription
    ? collection.spanishDescription
    : language === 'bg' && collection.bulgarianDescription
    ? collection.bulgarianDescription
    : collection.description;

  const collectionNumber = String(index + 1).padStart(2, '0');

  return (
    <section
      ref={sectionRef}
      className={`relative min-h-[85vh] lg:min-h-[90vh] flex flex-col justify-center py-20 lg:py-26 border-t border-[#D4AF37]/20 overflow-hidden ${
        isEven ? 'bg-[#0B0A08]/75 backdrop-blur-[2px]' : 'bg-[#0B0A08]/70 backdrop-blur-[2px]'
      }`}
    >
      {/* Ambient background aura */}
      <div
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[550px] h-[550px] rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{ background: collection.accentColor || '#D4AF37' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 space-y-8">
        
        {/* Collection Header: High Contrast & Crisp Typography */}
        <div ref={titleRef} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4 border-b border-white/15">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#F2D675] font-bold tracking-widest px-3 py-1 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 shadow-sm">
                COLLECTION {collectionNumber}
              </span>
              {collection.tag && (
                <span className="font-cinzel text-xs font-bold uppercase tracking-[0.25em] text-[#F2D675]">
                  {collection.tag}
                </span>
              )}
            </div>

            <BlurText
              text={title}
              delay={70}
              animateBy="words"
              direction="top"
              className="text-3xl sm:text-4xl lg:text-5xl font-cinzel font-bold text-[#F3E6D0] tracking-[0.04em] leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              as="h2"
            />

            <p className="text-sm sm:text-base text-[#F3E6D0] font-sans font-medium leading-relaxed">
              {description}
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-4 shrink-0 self-start lg:self-end">
            <div className="hidden sm:flex flex-col items-end gap-1 text-[11px] font-mono text-[#F2D675] font-bold">
              <span>EXPLORE HORIZONTALLY</span>
              <div className="w-32 h-1.5 bg-white/15 rounded-full overflow-hidden">
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
                    ? 'border-[#D4AF37] bg-black/80 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black cursor-pointer shadow-lg'
                    : 'border-white/10 bg-black/40 text-neutral-600 opacity-40 cursor-not-allowed'
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
                    ? 'border-[#D4AF37] bg-black/80 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black cursor-pointer shadow-lg'
                    : 'border-white/10 bg-black/40 text-neutral-600 opacity-40 cursor-not-allowed'
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
            const baseNote = product.notes?.base?.[0] || product.baseNotes?.[0] || 'Aged Oud';

            return (
              <div
                key={product.id || pIdx}
                className="collection-product-card shrink-0 w-[290px] sm:w-[340px] md:w-[360px] bg-[#21130D] border border-[#D4AF37]/30 hover:border-[#D4AF37] p-6 flex flex-col justify-between transition-all duration-500 shadow-2xl hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(0,0,0,0.95)] group"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    {product.tier ? (
                      <span className="px-3 py-1 rounded text-[11px] font-cinzel font-bold uppercase tracking-wider bg-[#D4AF37] text-black shadow-sm">
                        {product.tier} Tier
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded text-[11px] font-cinzel font-bold uppercase tracking-wider bg-black/60 text-[#F2D675] border border-[#D4AF37]/40">
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
                          ? 'border-red-500 bg-red-950/60 text-red-400'
                          : 'border-white/20 bg-black/60 text-[#D4AF37] hover:text-white'
                      }`}
                      title="Save to Wishlist"
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Flacon Visual */}
                  <div
                    onClick={() => navigate(`/product/${product.slug || product.id}`)}
                    className="aspect-[4/5] flex items-center justify-center p-4 mb-4 bg-black/60 border border-white/10 relative overflow-hidden cursor-pointer group-hover:border-[#D4AF37]/50 transition-colors"
                  >
                    <img
                      src={product.cutoutImage || product.images?.[0] || '/products/black_diamond_gold.png'}
                      alt={product.name}
                      className="max-h-[88%] w-auto object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] group-hover:scale-108 transition-transform duration-700 pointer-events-none"
                    />
                  </div>

                  {/* High Contrast Product Info */}
                  <div className="space-y-2.5">
                    <h3
                      onClick={() => navigate(`/product/${product.slug || product.id}`)}
                      className="font-cinzel text-lg font-bold text-[#F3E6D0] group-hover:text-[#F2D675] transition-colors cursor-pointer line-clamp-1 drop-shadow-sm"
                    >
                      {displayName}
                    </h3>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#F3E6D0] font-mono text-xs font-semibold">
                        {product.size || '60 ml'} • {product.fragranceFamily || 'Oriental'}
                      </span>
                      <span className="font-cinzel font-bold text-[#F2D675] text-lg">
                        €{product.price}
                      </span>
                    </div>

                    {/* Scent Notes Highlights */}
                    <div className="py-2 px-3 bg-black/60 border border-white/10 text-xs text-[#F3E6D0] space-y-0.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[#F2D675] font-semibold text-[11px] uppercase tracking-wider">Notes:</span>
                        <span className="text-right truncate ml-2 text-[11px] font-medium text-[#F3E6D0]">{topNote} • {heartNote}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="grid grid-cols-2 gap-2.5 pt-4 mt-4 border-t border-white/15">
                  <button
                    onClick={() => addToCart(product, product.size || '60 ml', 1)}
                    disabled={isOutOfStock}
                    className="py-3 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-lg"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
                  </button>

                  <Link
                    to={`/product/${product.slug || product.id}`}
                    className="py-3 bg-black/60 hover:bg-white/10 border border-[#D4AF37]/50 text-[#F3E6D0] hover:text-[#F2D675] font-cinzel font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1 text-center"
                  >
                    <span>Discover</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
