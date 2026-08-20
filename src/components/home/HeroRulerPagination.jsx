import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * HeroRulerPagination Component
 * 
 * Inspired by luxury haute horlogerie / Chronoswiss calibration gauge:
 * - Precision ruler ticks with minor, medium, and major graduated gold lines
 * - Centered active index indicator with gold glow
 * - Prev / Next flacon name triggers on left and right flanks
 * - 100% compliant with the 7 Arabic Luxury Palette colors
 */
export default function HeroRulerPagination({
  activeIndex = 0,
  onSelectIndex,
  products = [],
  language = 'en'
}) {
  if (!products || products.length === 0) return null;

  const total = products.length;
  const prevIndex = (activeIndex - 1 + total) % total;
  const nextIndex = (activeIndex + 1) % total;

  const prevProduct = products[prevIndex];
  const nextProduct = products[nextIndex];
  const currentProduct = products[activeIndex];

  const getTierName = (p) => {
    if (!p) return '';
    return p.tier || p.name;
  };

  const getProductName = (p) => {
    if (!p) return '';
    if (language === 'es' && p.spanishName) return p.spanishName;
    if (language === 'bg' && p.bulgarianName) return p.bulgarianName;
    return p.name;
  };

  return (
    <div className="w-full flex flex-col items-center justify-center pt-8 pb-4 select-none">
      
      {/* 3-Flank Navigation Grid */}
      <div className="w-full max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Flank: Previous Product Indicator */}
        <button
          onClick={() => onSelectIndex(prevIndex)}
          className="group flex items-center gap-3 text-left transition-all duration-300 cursor-pointer order-2 md:order-1 opacity-70 hover:opacity-100"
          aria-label={`Previous flacon: ${getProductName(prevProduct)}`}
        >
          <div className="w-8 h-8 rounded-full border border-[#D8BE99]/30 group-hover:border-[#D4AF37] bg-[#21130D]/80 flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-md">
            <ChevronLeft className="w-4 h-4 text-[#D8BE99] group-hover:text-[#D4AF37] transition-transform group-hover:-translate-x-0.5" />
          </div>
          <div className="hidden sm:block">
            <span className="block text-[9px] font-mono tracking-widest text-[#D8BE99]/70 uppercase">
              PREV • 0{prevIndex + 1}
            </span>
            <span className="block text-xs font-cinzel font-bold text-[#F3E6D0] group-hover:text-[#D4AF37] tracking-wider uppercase transition-colors">
              {getProductName(prevProduct)}
            </span>
          </div>
        </button>

        {/* Center: Precision Horological Ruler Gauge */}
        <div className="relative flex flex-col items-center justify-center order-1 md:order-2 px-6 py-3 bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.9)] backdrop-blur-md">
          
          {/* Active Center Marker Triangle */}
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#D4AF37] mb-1.5 animate-pulse" />

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Leading minor ticks */}
            <div className="flex items-center gap-1 opacity-30">
              <span className="w-[1px] h-2 bg-[#D8BE99]" />
              <span className="w-[1px] h-3 bg-[#D8BE99]" />
              <span className="w-[1px] h-2 bg-[#D8BE99]" />
            </div>

            {/* Product Tiers on the Ruler */}
            {products.map((flacon, idx) => {
              const isActive = activeIndex === idx;
              return (
                <React.Fragment key={flacon.id || idx}>
                  {/* Flacon Item & Major Ruler Mark */}
                  <button
                    onClick={() => onSelectIndex(idx)}
                    className={`group relative px-2 sm:px-3 py-1 flex flex-col items-center gap-1.5 transition-all duration-400 cursor-pointer ${
                      isActive ? 'scale-110' : 'opacity-50 hover:opacity-85 hover:scale-105'
                    }`}
                  >
                    {/* Number / Tier Label */}
                    <div className="flex items-center gap-1">
                      <span
                        className={`font-mono text-xs sm:text-sm font-bold tracking-widest transition-colors duration-300 ${
                          isActive ? 'text-[#F2D675] drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]' : 'text-[#D8BE99]'
                        }`}
                      >
                        0{idx + 1}
                      </span>
                      {isActive && (
                        <span className="hidden sm:inline font-cinzel text-[10px] uppercase font-bold text-[#F3E6D0] tracking-wider">
                          • {flacon.tier}
                        </span>
                      )}
                    </div>

                    {/* Ruler Tick Line */}
                    <div
                      className={`w-[1.5px] rounded-full transition-all duration-300 ${
                        isActive
                          ? 'h-6 bg-gradient-to-b from-[#F2D675] to-[#D4AF37] shadow-[0_0_10px_#D4AF37]'
                          : 'h-3 bg-[#D8BE99]/50 group-hover:bg-[#D4AF37]'
                      }`}
                    />
                  </button>

                  {/* Intermediate tick marks between products */}
                  {idx < products.length - 1 && (
                    <div className="flex items-center gap-1 opacity-35 px-0.5">
                      <span className="w-[1px] h-2 bg-[#D8BE99]" />
                      <span className="w-[1px] h-3.5 bg-[#D8BE99]" />
                      <span className="w-[1px] h-2 bg-[#D8BE99]" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {/* Trailing minor ticks */}
            <div className="flex items-center gap-1 opacity-30">
              <span className="w-[1px] h-2 bg-[#D8BE99]" />
              <span className="w-[1px] h-3 bg-[#D8BE99]" />
              <span className="w-[1px] h-2 bg-[#D8BE99]" />
            </div>

          </div>

          {/* Underline Calibration Axis */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent mt-1" />
        </div>

        {/* Right Flank: Next Product Indicator */}
        <button
          onClick={() => onSelectIndex(nextIndex)}
          className="group flex items-center gap-3 text-right transition-all duration-300 cursor-pointer order-3 opacity-70 hover:opacity-100"
          aria-label={`Next flacon: ${getProductName(nextProduct)}`}
        >
          <div className="hidden sm:block">
            <span className="block text-[9px] font-mono tracking-widest text-[#D8BE99]/70 uppercase">
              NEXT • 0{nextIndex + 1}
            </span>
            <span className="block text-xs font-cinzel font-bold text-[#F3E6D0] group-hover:text-[#D4AF37] tracking-wider uppercase transition-colors">
              {getProductName(nextProduct)}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full border border-[#D8BE99]/30 group-hover:border-[#D4AF37] bg-[#21130D]/80 flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-md">
            <ChevronRight className="w-4 h-4 text-[#D8BE99] group-hover:text-[#D4AF37] transition-transform group-hover:translate-x-0.5" />
          </div>
        </button>

      </div>

    </div>
  );
}
