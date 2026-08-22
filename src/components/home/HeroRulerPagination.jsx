import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * HeroRulerPagination Component
 * 
 * Luxury horological calibration gauge ruler:
 * - Dynamically renders available products (shows only "01" when 1 product is present)
 * - Precision ruler ticks with minor, medium, and major graduated gold lines
 * - Smooth interactive product switching upon clicking any index or prev/next flanks
 */
export default function HeroRulerPagination({
  activeIndex = 0,
  onSelectIndex,
  products = [],
  language = 'en'
}) {
  if (!products || products.length === 0) return null;

  const total = products.length;
  const isMulti = total > 1;
  const prevIndex = (activeIndex - 1 + total) % total;
  const nextIndex = (activeIndex + 1) % total;

  const prevProduct = products[prevIndex];
  const nextProduct = products[nextIndex];
  const currentProduct = products[activeIndex];

  const getProductName = (p) => {
    if (!p) return '';
    if (language === 'es' && p.spanishName) return p.spanishName;
    if (language === 'bg' && p.bulgarianName) return p.bulgarianName;
    return p.name;
  };

  return (
    <div className="w-full flex flex-col items-center justify-center pt-1 pb-1 select-none pointer-events-auto">
      
      {/* 3-Flank Horological Gauge Row */}
      <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 flex flex-row items-center justify-center md:justify-between gap-2 sm:gap-4 md:gap-6">
        
        {/* Left Flank: Previous Product Arrow & Label */}
        <button
          onClick={() => isMulti && onSelectIndex && onSelectIndex(prevIndex)}
          disabled={!isMulti}
          className={`group flex items-center gap-2 sm:gap-3 text-left transition-all duration-300 ${
            isMulti ? 'cursor-pointer opacity-75 hover:opacity-100' : 'cursor-default opacity-40'
          }`}
          aria-label={isMulti ? `Previous flacon: ${getProductName(prevProduct)}` : 'Previous'}
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-[#D8BE99]/40 group-hover:border-[#D4AF37] bg-black/70 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm">
            <ChevronLeft className="w-3 h-3 text-[#D8BE99] group-hover:text-[#D4AF37]" />
          </div>
          <div className="hidden md:block">
            <span className="block text-[11px] font-cinzel font-semibold text-[#D8BE99] group-hover:text-[#D4AF37] tracking-[0.18em] uppercase transition-colors">
              {isMulti ? getProductName(prevProduct) : (language === 'ar' ? 'السابق' : 'PREV')}
            </span>
          </div>
        </button>

        {/* Center: Precision Horological Ruler Gauge */}
        <div className="relative flex flex-col items-center justify-center px-4 sm:px-6 py-1.5 sm:py-2 bg-black/70 border border-[#D4AF37]/35 rounded-full shadow-[0_0_25px_rgba(0,0,0,0.9)] backdrop-blur-md shrink-0">
          
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Leading minor ticks */}
            <div className="flex items-center gap-0.5 sm:gap-1 opacity-30">
              <span className="w-[1px] h-1.5 bg-[#D8BE99]" />
              <span className="w-[1px] h-2.5 bg-[#D8BE99]" />
              <span className="w-[1px] h-1.5 bg-[#D8BE99]" />
              <span className="w-[1px] h-3.5 bg-[#D8BE99]" />
              <span className="w-[1px] h-1.5 bg-[#D8BE99]" />
            </div>

            {/* Product Tiers on the Ruler */}
            {products.map((flacon, idx) => {
              const isActive = activeIndex === idx;
              return (
                <React.Fragment key={flacon.id || idx}>
                  {/* Flacon Item & Major Ruler Mark */}
                  <button
                    onClick={() => isMulti && onSelectIndex && onSelectIndex(idx)}
                    className={`group relative px-2 py-0.5 flex flex-col items-center gap-0.5 transition-all duration-300 ${
                      isActive ? 'scale-110' : 'opacity-40 hover:opacity-80'
                    } ${isMulti ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <span
                      className={`font-mono text-[11px] sm:text-xs font-bold tracking-widest transition-colors duration-300 ${
                        isActive ? 'text-[#F2D675] drop-shadow-[0_0_6px_rgba(212,175,55,0.8)]' : 'text-[#D8BE99]'
                      }`}
                    >
                      0{idx + 1}
                    </span>
                    <div
                      className={`w-[1.5px] rounded-full transition-all duration-300 ${
                        isActive
                          ? 'h-3.5 sm:h-4.5 bg-[#F2D675] shadow-[0_0_8px_#D4AF37]'
                          : 'h-1.5 sm:h-2 bg-[#D8BE99]/40 group-hover:bg-[#D4AF37]'
                      }`}
                    />
                  </button>

                  {/* Intermediate tick marks between products */}
                  {idx < products.length - 1 && (
                    <div className="flex items-center gap-0.5 opacity-25 px-0.5">
                      <span className="w-[1px] h-1 bg-[#D8BE99]" />
                      <span className="w-[1px] h-2 bg-[#D8BE99]" />
                      <span className="w-[1px] h-1 bg-[#D8BE99]" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {/* Trailing minor ticks */}
            <div className="flex items-center gap-0.5 sm:gap-1 opacity-30">
              <span className="w-[1px] h-1.5 bg-[#D8BE99]" />
              <span className="w-[1px] h-3.5 bg-[#D8BE99]" />
              <span className="w-[1px] h-1.5 bg-[#D8BE99]" />
              <span className="w-[1px] h-2.5 bg-[#D8BE99]" />
              <span className="w-[1px] h-1.5 bg-[#D8BE99]" />
            </div>

          </div>
        </div>

        {/* Right Flank: Next Product Arrow & Label */}
        <button
          onClick={() => isMulti && onSelectIndex && onSelectIndex(nextIndex)}
          disabled={!isMulti}
          className={`group flex items-center gap-2 sm:gap-3 text-right transition-all duration-300 ${
            isMulti ? 'cursor-pointer opacity-75 hover:opacity-100' : 'cursor-default opacity-40'
          }`}
          aria-label={isMulti ? `Next flacon: ${getProductName(nextProduct)}` : 'Next'}
        >
          <div className="hidden md:block">
            <span className="block text-[11px] font-cinzel font-semibold text-[#D8BE99] group-hover:text-[#D4AF37] tracking-[0.18em] uppercase transition-colors">
              {isMulti ? getProductName(nextProduct) : (language === 'ar' ? 'التالي' : 'NEXT')}
            </span>
          </div>
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-[#D8BE99]/40 group-hover:border-[#D4AF37] bg-black/70 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm">
            <ChevronRight className="w-3 h-3 text-[#D8BE99] group-hover:text-[#D4AF37]" />
          </div>
        </button>

      </div>

    </div>
  );
}
