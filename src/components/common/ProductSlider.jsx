import React, { useRef, useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

/**
 * ProductSlider Component
 * 
 * Reusable luxury horizontal product carousel for collection shelves.
 * - Desktop: Left/Right gold arrow buttons, mouse wheel, and smooth multi-card display.
 * - Mobile: Ultra-smooth touch swipe, snap scrolling, next-card peeking, zero horizontal page bleed.
 */
export default function ProductSlider({
  products = [],
  collectionTheme = 'default', // 'best-sellers' | 'luxury' | 'royal' | 'default'
  layout = 'slider',
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const checkScrollBounds = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollBounds();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollBounds, { passive: true });
      window.addEventListener('resize', checkScrollBounds);
      return () => {
        el.removeEventListener('scroll', checkScrollBounds);
        window.removeEventListener('resize', checkScrollBounds);
      };
    }
  }, [products]);

  const scrollBy = (direction) => {
    if (!scrollRef.current) return;
    const containerWidth = scrollRef.current.clientWidth;
    const cardWidth = window.innerWidth < 640 ? 270 : 340;
    const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Mouse Drag to Scroll (Desktop)
  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full group/slider select-none">
      {/* Desktop Left Navigation Arrow */}
      <button
        onClick={() => scrollBy('left')}
        disabled={!canScrollLeft}
        aria-label="Previous products"
        className={`hidden md:flex absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full border border-[#D2A55F]/50 bg-[#130C05]/90 text-[#EADED2] backdrop-blur-md transition-all duration-300 shadow-xl cursor-pointer ${
          canScrollLeft
            ? 'opacity-80 hover:opacity-100 hover:border-[#D2A55F] hover:bg-[#D2A55F] hover:text-[#130C05] hover:scale-110'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Desktop Right Navigation Arrow */}
      <button
        onClick={() => scrollBy('right')}
        disabled={!canScrollRight}
        aria-label="Next products"
        className={`hidden md:flex absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full border border-[#D2A55F]/50 bg-[#130C05]/90 text-[#EADED2] backdrop-blur-md transition-all duration-300 shadow-xl cursor-pointer ${
          canScrollRight
            ? 'opacity-80 hover:opacity-100 hover:border-[#D2A55F] hover:bg-[#D2A55F] hover:text-[#130C05] hover:scale-110'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
        className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-4 px-1 sm:px-2 cursor-grab active:cursor-grabbing"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
      >
        {products.map((product, idx) => (
          <div
            key={product.id || idx}
            className="w-[260px] sm:w-[290px] md:w-[320px] lg:w-[340px] flex-shrink-0 snap-start transition-transform duration-300"
          >
            <ProductCard product={product} />
          </div>
        ))}

        {/* Peek End Spacer on Mobile */}
        <div className="w-6 flex-shrink-0 sm:hidden" />
      </div>

      {/* Mobile Swipe Guidance Hint */}
      <div className="flex sm:hidden items-center justify-between px-2 pt-2 text-[11px] uppercase tracking-[0.25em] text-[var(--gold-primary)]/80 font-cinzel">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[var(--gold-primary)]" />
          <span>Swipe to explore</span>
        </span>
        <span>→</span>
      </div>
    </div>
  );
}
