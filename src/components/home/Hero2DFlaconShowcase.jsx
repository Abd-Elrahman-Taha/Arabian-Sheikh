import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { Sparkles, Crown } from 'lucide-react';

/**
 * Hero2DFlaconShowcase
 * Replaces the 3D bottle with 2D high-res flacons:
 * - Desktop: 3 bottles visible side-by-side with subtle independent floating motion.
 * - Mobile: 1 bottle displayed at a time, smoothly auto-cycling every 3.5 seconds.
 */
export default function Hero2DFlaconShowcase({
  activeProductIndex = 0,
  onSlideChange,
  products = []
}) {
  const { isDark } = useTheme();
  const { language } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(activeProductIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef(null);

  // Sync external index changes
  useEffect(() => {
    setCurrentIndex(activeProductIndex);
  }, [activeProductIndex]);

  // Mobile automated 3.5s carousel cycle
  useEffect(() => {
    if (!products || products.length <= 1) return;

    timerRef.current = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => {
        const next = (prev + 1) % products.length;
        if (onSlideChange) onSlideChange(next);
        return next;
      });
      setTimeout(() => setIsTransitioning(false), 500);
    }, 3500); // 3.5 seconds exact

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [products, onSlideChange]);

  const handleSelect = (idx) => {
    if (idx === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(idx);
    if (onSlideChange) onSlideChange(idx);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const getFlaconImage = (p) => {
    return p?.image || p?.cutoutImage || p?.originalImage || '/products/stallion_royal_flacon.webp';
  };

  const activeProduct = products[currentIndex] || products[0] || {};

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none">

      {/* =========================================================================
          1. DESKTOP VIEW (3 BOTTLES SIDE-BY-SIDE WITH GENTLE FLOATING MOTION)
          ========================================================================= */}
      <div className="hidden md:flex items-center justify-center gap-4 lg:gap-8 xl:gap-12 w-full max-w-4xl mx-auto h-[480px] lg:h-[560px] relative px-4">
        {products.map((product, idx) => {
          const isActive = idx === currentIndex;
          const isLeft = (currentIndex === 0 && idx === 2) || (currentIndex === 1 && idx === 0) || (currentIndex === 2 && idx === 1);
          const isRight = !isActive && !isLeft;

          // Distinct gentle floating animation per position
          const floatAnim = idx === 0 
            ? 'floatGentleLeft 5.6s ease-in-out infinite alternate'
            : idx === 1
            ? 'floatGentleCenter 6.2s ease-in-out infinite alternate'
            : 'floatGentleRight 5.9s ease-in-out infinite alternate';

          const imgSrc = getFlaconImage(product);

          return (
            <div
              key={product.id || idx}
              onClick={() => handleSelect(idx)}
              className={`group relative flex flex-col items-center justify-center cursor-pointer transition-all duration-700 ${
                isActive
                  ? 'z-20 scale-110 sm:scale-115 lg:scale-120 opacity-100'
                  : 'z-10 scale-85 lg:scale-90 opacity-60 hover:opacity-90 hover:scale-95'
              }`}
              style={{
                order: isLeft ? 1 : isActive ? 2 : 3
              }}
            >
              {/* Active Golden Aura & Spotlight Base */}
              {isActive && (
                <div className="absolute -inset-6 rounded-full bg-radial from-[#D4AF37]/35 via-[#F2D675]/15 to-transparent blur-2xl pointer-events-none -z-10 animate-pulse" />
              )}

              {/* Active Imperial Crown Badge on Center Flacon */}
              {isActive && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/60 text-[#D4AF37] text-[10px] font-cinzel font-bold uppercase tracking-widest backdrop-blur-md shadow-lg pointer-events-none">
                  <Crown className="w-3 h-3 text-[#D4AF37]" />
                  <span>{product.tier || 'Imperial Tier'}</span>
                </div>
              )}

              {/* 2D Bottle Image with Smooth Gentle Floating */}
              <div
                className="relative flex items-center justify-center"
                style={{ animation: floatAnim }}
              >
                <img
                  src={imgSrc}
                  alt={product.name || 'Haute Parfumerie Flacon'}
                  className={`h-[280px] sm:h-[340px] lg:h-[400px] w-auto object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.55)] transition-transform duration-500 transform-gpu group-hover:scale-105`}
                  loading="eager"
                  fetchPriority="high"
                />

                {/* Contact Shadow beneath each bottle */}
                <div
                  className={`absolute -bottom-3 inset-x-0 mx-auto rounded-full blur-md pointer-events-none transition-all duration-500 ${
                    isActive
                      ? 'w-32 lg:w-40 h-5 bg-black/80 opacity-90'
                      : 'w-24 lg:w-28 h-4 bg-black/60 opacity-60'
                  }`}
                />
              </div>

              {/* Flacon Name Tag underneath on desktop */}
              <div className={`mt-4 text-center transition-all duration-300 ${
                isActive ? 'opacity-100 transform translate-y-0' : 'opacity-0 group-hover:opacity-75 transform translate-y-1'
              }`}>
                <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37] block">
                  {product.name}
                </span>
                <span className="text-[10px] font-mono font-medium text-[#F3E6D0]/80">
                  €{product.price} • {product.size || '60 ml'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          2. MOBILE VIEW (1 BOTTLE AT A TIME, AUTOMATED 3.5s ROTATION)
          ========================================================================= */}
      <div className="flex md:hidden flex-col items-center justify-center w-full max-w-sm mx-auto min-h-[380px] sm:min-h-[440px] relative px-4">
        
        {/* Active Bottle Presentation with 3.5s Smooth Crossfade */}
        <div className="relative flex items-center justify-center w-full h-[320px] sm:h-[380px]">
          
          {/* Ambient Golden Glow */}
          <div className="absolute inset-0 mx-auto w-48 h-48 rounded-full bg-radial from-[#D4AF37]/30 via-[#F2D675]/10 to-transparent blur-2xl pointer-events-none -z-10" />

          {/* Floating Mobile Image Container */}
          <div
            className={`relative flex items-center justify-center transition-all duration-500 transform-gpu ${
              isTransitioning ? 'opacity-30 scale-95' : 'opacity-100 scale-100'
            }`}
            style={{ animation: 'floatGentleCenter 4.8s ease-in-out infinite alternate' }}
          >
            <img
              key={activeProduct.id || currentIndex}
              src={getFlaconImage(activeProduct)}
              alt={activeProduct.name || 'Arabian Sheikh Flacon'}
              className="h-[52vh] max-h-[360px] sm:max-h-[420px] w-auto max-w-[90%] object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] transform-gpu"
              loading="eager"
              fetchPriority="high"
            />

            {/* Mobile Contact Shadow */}
            <div className="absolute -bottom-3 inset-x-0 mx-auto w-36 sm:w-44 h-5 rounded-full blur-md bg-black/80 pointer-events-none" />
          </div>
        </div>

        {/* Mobile 3.5s Step Indicator & Interactive Selectors */}
        <div className="flex items-center gap-2 mt-4 z-20">
          {products.map((p, idx) => {
            const isDotActive = idx === currentIndex;
            return (
              <button
                key={p.id || idx}
                onClick={() => handleSelect(idx)}
                aria-label={`View ${p.name}`}
                className={`relative h-2 rounded-full transition-all duration-400 ${
                  isDotActive
                    ? 'w-8 bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.6)]'
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            );
          })}
        </div>

        {/* Small Timer Note on Mobile */}
        <span className="text-[9px] font-cinzel tracking-widest uppercase text-[#D4AF37]/80 mt-1.5 font-bold">
          {currentIndex + 1} / {products.length} • {activeProduct.tier || 'Imperial Tier'}
        </span>
      </div>

      {/* Embedded High-Performance Gentle Float Keyframes */}
      <style>{`
        @keyframes floatGentleCenter {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(0.4deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes floatGentleLeft {
          0% { transform: translateY(0px) rotate(-0.5deg); }
          50% { transform: translateY(-8px) rotate(0.2deg); }
          100% { transform: translateY(0px) rotate(-0.5deg); }
        }
        @keyframes floatGentleRight {
          0% { transform: translateY(0px) rotate(0.5deg); }
          50% { transform: translateY(-9px) rotate(-0.3deg); }
          100% { transform: translateY(0px) rotate(0.5deg); }
        }
      `}</style>
    </div>
  );
}
