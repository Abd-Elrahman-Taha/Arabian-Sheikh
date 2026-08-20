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

  // GSAP ScrollTrigger Entrance Animation for this Collection
  useEffect(() => {
    const section = sectionRef.current;
    const titleEl = titleRef.current;
    const track = trackRef.current;
    if (!section || !titleEl || !track) return;

    const ctx = gsap.context(() => {
      // Title reveal
      gsap.fromTo(
        titleEl,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );

      // Product cards staggered reveal
      const cards = track.querySelectorAll('.collection-product-card');
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, x: 50, scale: 0.95 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.9,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              toggleActions: 'play none none none'
            }
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, [collection]);

  // Navigation button controls
  const handleScroll = (direction) => {
    if (!trackRef.current) return;
    const cardWidth = 340;
    const scrollAmount = direction === 'left' ? -cardWidth * 1.5 : cardWidth * 1.5;
    trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Drag to scroll handlers
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

  // Titles / copy by language
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
      className={`relative min-h-[85vh] lg:min-h-[92vh] flex flex-col justify-center py-20 lg:py-28 border-t border-[#D4AF37]/15 overflow-hidden ${
        isEven ? 'bg-[#0E0B09]/95' : 'bg-[#0A0A0B]/95'
      }`}
    >
      {/* Subtle collection ambient background aura */}
      <div
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{ background: collection.accentColor || '#D4AF37' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 space-y-8">
        
        {/* Collection Header: Number, Title, Tagline & Scroll Navigation Controls */}
        <div ref={titleRef} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4 border-b border-white/10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#D4AF37] font-bold tracking-widest px-2.5 py-0.5 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/30">
                COLLECTION {collectionNumber}
              </span>
              {collection.tag && (
                <span className="font-cinzel text-[11px] uppercase tracking-[0.25em] text-[#C5A059]">
                  {collection.tag}
                </span>
              )}
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-cinzel font-bold text-[#F8F5F0] tracking-[0.05em] leading-tight">
              {title}
            </h2>

            <p className="text-xs sm:text-sm text-[#C7B299] font-sans leading-relaxed">
              {description}
            </p>
          </div>

          {/* Collection Navigation Arrows & Horizontal Progress */}
          <div className="flex items-center gap-4 shrink-0 self-start lg:self-end">
            {/* Scroll Progress Bar */}
            <div className="hidden sm:flex flex-col items-end gap-1 text-[10px] font-mono text-[#8C6D37]">
              <span>EXPLORE HORIZONTALLY</span>
              <div className="w-28 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#8C6D37] via-[#D4AF37] to-[#FFF5EB] transition-all duration-200"
                  style={{ width: `${Math.max(15, scrollProgress)}%` }}
                />
              </div>
            </div>

            {/* Left & Right Arrow Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleScroll('left')}
                disabled={!canScrollLeft}
                className={`p-3 rounded-full border transition-all duration-300 ${
                  canScrollLeft
                    ? 'border-[#D4AF37]/50 bg-black/60 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black cursor-pointer shadow-lg'
                    : 'border-white/10 bg-black/30 text-neutral-600 opacity-40 cursor-not-allowed'
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
                    ? 'border-[#D4AF37]/50 bg-black/60 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black cursor-pointer shadow-lg'
                    : 'border-white/10 bg-black/30 text-neutral-600 opacity-40 cursor-not-allowed'
                }`}
                aria-label="Next Products in Collection"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Scrolling Products Track (Touch Swipe + Mouse Drag) */}
        <div
          ref={trackRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-none py-4 px-1 cursor-grab active:cursor-grabbing select-none"
          style={{ scrollSnapType: 'x mandatory' }}
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
                className="collection-product-card shrink-0 w-[290px] sm:w-[340px] md:w-[360px] bg-[#14100D]/90 border border-[#D4AF37]/20 hover:border-[#D4AF37] p-6 flex flex-col justify-between transition-all duration-500 shadow-2xl hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(0,0,0,0.9)] group"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    {product.tier ? (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-cinzel font-bold uppercase tracking-wider bg-[#D4AF37] text-black">
                        {product.tier} Tier
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-cinzel font-bold uppercase tracking-wider bg-white/10 text-[#D4AF37] border border-[#D4AF37]/30">
                        {product.category || 'Palace Reserve'}
                      </span>
                    )}

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
                        isSaved
                          ? 'border-red-500/50 bg-red-950/40 text-red-400'
                          : 'border-white/10 bg-black/40 text-[#8C6D37] hover:text-[#D4AF37]'
                      }`}
                      title="Save to Wishlist"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Flacon Visual with soft ambient shadow */}
                  <div
                    onClick={() => navigate(`/product/${product.slug || product.id}`)}
                    className="aspect-[4/5] flex items-center justify-center p-4 mb-4 bg-black/50 border border-white/5 relative overflow-hidden cursor-pointer group-hover:border-[#D4AF37]/30 transition-colors"
                  >
                    <img
                      src={product.cutoutImage || product.images?.[0] || '/products/black_diamond_gold.png'}
                      alt={product.name}
                      className="max-h-[88%] w-auto object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)] group-hover:scale-108 transition-transform duration-700 pointer-events-none"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        onClick={() => navigate(`/product/${product.slug || product.id}`)}
                        className="font-cinzel text-base font-bold text-[#F8F5F0] group-hover:text-[#D4AF37] transition-colors cursor-pointer line-clamp-1"
                      >
                        {displayName}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8C6D37] font-mono text-[11px]">
                        {product.size || '60 ml'} • {product.fragranceFamily || 'Oriental'}
                      </span>
                      <span className="font-cinzel font-bold text-[#D4AF37] text-base">
                        €{product.price}
                      </span>
                    </div>

                    {/* Scent Notes Highlights */}
                    <div className="py-2 px-3 bg-black/40 border border-white/5 text-[10px] text-[#C7B299] space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-[#8C6D37]">Notes:</span>
                        <span className="text-right truncate ml-2">{topNote} • {heartNote}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions: Quick Add + Discover Details */}
                <div className="grid grid-cols-2 gap-2 pt-4 mt-4 border-t border-white/10">
                  <button
                    onClick={() => addToCart(product, product.size || '60 ml', 1)}
                    disabled={isOutOfStock}
                    className="py-2.5 bg-[#D4AF37] hover:bg-[#E5C07B] text-black font-cinzel font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-md"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
                  </button>

                  <Link
                    to={`/product/${product.slug || product.id}`}
                    className="py-2.5 bg-white/5 hover:bg-white/10 border border-[#D4AF37]/30 text-[#F8F5F0] hover:text-[#D4AF37] font-cinzel text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1 text-center"
                  >
                    <span>Discover</span>
                    <ArrowRight className="w-3 h-3" />
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
