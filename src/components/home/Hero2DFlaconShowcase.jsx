import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { Sparkles, Crown } from 'lucide-react';

/**
 * Hero2DFlaconShowcase
 * 3D Depth-Swap Carousel:
 * - Active flacon is positioned in front (scale 1.0 / 1.15, full opacity, radiant gold aura).
 * - Next & previous flacons are receded behind in 3D perspective space (scale 0.68 / 0.85, dimmed, lower z-index).
 * - When swapping, the active one smoothly moves to get behind while the next one swoops forward into the foreground.
 */
export default function Hero2DFlaconShowcase({
  activeProductIndex = 0,
  onSlideChange,
  products = []
}) {
  const { isDark } = useTheme();
  const { language } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(activeProductIndex);
  const timerRef = useRef(null);

  // Sync external index changes
  useEffect(() => {
    setCurrentIndex(activeProductIndex);
  }, [activeProductIndex]);

  // Automated 3.5s carousel cycle with smooth 3D depth rotation
  useEffect(() => {
    if (!products || products.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % products.length;
        setTimeout(() => {
          if (onSlideChange) onSlideChange(next);
        }, 0);
        return next;
      });
    }, 3500); // 3.5 seconds

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [products, onSlideChange]);

  const handleSelect = (idx) => {
    if (idx === currentIndex) return;
    setCurrentIndex(idx);
    if (onSlideChange) onSlideChange(idx);
  };

  const getFlaconImage = (p) => {
    return p?.image || p?.cutoutImage || p?.originalImage || '/products/luxury_designs/07_arabian_gold.webp';
  };

  const getDisplayName = (p) => {
    if (!p) return '';
    if (language === 'ar') return p.arabicName || p.name;
    if (language === 'es') return p.spanishName || p.name;
    if (language === 'bg') return p.bulgarianName || p.name;
    return p.name;
  };

  const activeProduct = products[currentIndex] || products[0] || {};
  const total = products.length || 3;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-visible">

      {/* =========================================================================
          1. DESKTOP VIEW (3D TURNTABLE DEPTH SWAP: SIDES BEHIND, CENTER FORWARD)
          ========================================================================= */}
      <div
        className="hidden md:flex items-center justify-center w-full max-w-4xl mx-auto h-[480px] lg:h-[560px] relative px-4"
        style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
      >
        {products.map((product, idx) => {
          const diff = (idx - currentIndex + total) % total;
          const isActive = diff === 0;
          const isRight = diff === 1;
          const isLeft = diff === total - 1 || (!isActive && !isRight);

          // Position the bottle item in 2D viewport coordinates WITHOUT scaling the outer container
          let parentTransform = 'translate(-50%, -50%)';
          let bottle3DTransform = 'scale(1.15) translateZ(0px)';
          let desktopOpacity = 1;
          let desktopZIndex = 30;

          if (isRight) {
            parentTransform = 'translate(calc(-50% + 230px), calc(-50% + 10px))';
            bottle3DTransform = 'scale(0.82) translateZ(-90px) rotateY(-6deg)';
            desktopOpacity = 0.75;
            desktopZIndex = 10;
          } else if (isLeft) {
            parentTransform = 'translate(calc(-50% - 230px), calc(-50% + 10px))';
            bottle3DTransform = 'scale(0.82) translateZ(-90px) rotateY(6deg)';
            desktopOpacity = 0.75;
            desktopZIndex = 10;
          }

          const floatAnim = isActive
            ? 'floatGentleCenter 6s ease-in-out infinite alternate'
            : isRight
            ? 'floatGentleRight 5.7s ease-in-out infinite alternate'
            : 'floatGentleLeft 5.5s ease-in-out infinite alternate';

          const imgSrc = getFlaconImage(product);

          return (
            <div
              key={product.id || idx}
              onClick={() => handleSelect(idx)}
              className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center cursor-pointer transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)"
              style={{
                transform: parentTransform,
                opacity: desktopOpacity,
                zIndex: desktopZIndex
              }}
            >
              {/* Active Golden Aura Spotlight */}
              <div
                className={`absolute -inset-8 rounded-full bg-radial from-[#D4AF37]/40 via-[#F2D675]/15 to-transparent blur-3xl pointer-events-none -z-10 transition-opacity duration-700 ${
                  isActive ? 'opacity-100 animate-pulse' : 'opacity-0'
                }`}
              />

              {/* Imperial Crown Badge on Forward Flacon */}
              <div
                className={`absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/25 border border-[#D4AF37]/70 text-[#D4AF37] text-[10px] font-cinzel font-bold uppercase tracking-widest backdrop-blur-md shadow-lg pointer-events-none transition-all duration-500 ${
                  isActive ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-0 transform translate-y-2 scale-90'
                }`}
              >
                <Crown className="w-3 h-3 text-[#D4AF37]" />
                <span>{product.tier || 'Imperial Tier'}</span>
              </div>

              {/* 2D Bottle with 3D Depth Swap & Floating Animation */}
              <div
                className="relative flex items-center justify-center transition-transform duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) transform-gpu"
                style={{
                  transform: bottle3DTransform,
                  animation: floatAnim
                }}
              >
                <img
                  src={imgSrc}
                  alt={getDisplayName(product) || 'Haute Parfumerie Flacon'}
                  className="h-[280px] sm:h-[340px] lg:h-[390px] w-auto object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.65)] transition-transform duration-500 group-hover:scale-105"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>

              {/* Flacon Name Tag - Razor-Sharp High-Definition Luxury Pedestal */}
              <div
                className={`mt-4 px-5 py-2.5 rounded-full border transition-all duration-500 backdrop-blur-md text-center pointer-events-auto ${
                  isActive
                    ? 'bg-black/85 border-[#D4AF37]/70 shadow-[0_8px_30px_rgba(0,0,0,0.85),0_0_20px_rgba(212,175,55,0.3)] opacity-100'
                    : 'bg-black/60 border-white/15 opacity-75 hover:opacity-100 hover:border-[#D4AF37]/50 shadow-md'
                }`}
                style={{
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'geometricPrecision'
                }}
              >
                <span className="font-cinzel text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-[#FFFDF8] block drop-shadow-sm">
                  {getDisplayName(product)}
                </span>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <span className="font-mono text-xs font-bold text-[#F2D675] tracking-wider">
                    €{product.price}
                  </span>
                  <span className="text-[#D4AF37]/60 text-[10px]">•</span>
                  <span className="font-mono text-[10.5px] font-medium text-[#D8BE99]">
                    {product.size || '60 ml / 2.0 fl oz'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          2. MOBILE VIEW (3D TURNTABLE DEPTH SWAP: OLD RECEDES BEHIND, NEXT MOVES FORWARD)
          ========================================================================= */}
      <div
        className="flex md:hidden flex-col items-center justify-center w-full max-w-sm mx-auto min-h-[380px] sm:min-h-[440px] relative px-4"
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      >
        
        {/* 3D Orbit Track on Mobile */}
        <div className="relative w-full h-[320px] sm:h-[380px] overflow-visible">
          
          {/* Ambient Golden Glow Spotlight */}
          <div className="absolute inset-0 mx-auto w-48 h-48 rounded-full bg-radial from-[#D4AF37]/35 via-[#F2D675]/10 to-transparent blur-3xl pointer-events-none -z-10" />

          {/* Render All 3 Bottles in 3D Depth Orbit */}
          {products.map((product, idx) => {
            const diff = (idx - currentIndex + total) % total;
            const isActive = diff === 0;
            const isRight = diff === 1;
            const isLeft = diff === total - 1 || (!isActive && !isRight);

            // 3D Depth-swap positioning on Mobile
            let mobileTransform = 'translate(-50%, -50%) translateZ(0px) scale(1)';
            let mobileOpacity = 1;
            let mobileZIndex = 30;

            if (isRight) {
              // Right & Behind in depth
              mobileTransform = 'translate(calc(-50% + 55px), calc(-50% - 10px)) translateZ(-110px) scale(0.68) rotateY(-8deg)';
              mobileOpacity = 0.35;
              mobileZIndex = 10;
            } else if (isLeft) {
              // Left & Behind in depth
              mobileTransform = 'translate(calc(-50% - 55px), calc(-50% - 10px)) translateZ(-110px) scale(0.68) rotateY(8deg)';
              mobileOpacity = 0.35;
              mobileZIndex = 10;
            }

            const imgSrc = getFlaconImage(product);

            return (
              <div
                key={product.id || idx}
                onClick={() => handleSelect(idx)}
                className="absolute left-1/2 top-1/2 flex items-center justify-center transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) transform-gpu cursor-pointer"
                style={{
                  transform: mobileTransform,
                  opacity: mobileOpacity,
                  zIndex: mobileZIndex
                }}
              >
                <div
                  className="relative flex items-center justify-center"
                  style={{ animation: isActive ? 'floatGentleCenter 4.8s ease-in-out infinite alternate' : 'none' }}
                >
                  {/* Glowing Imperial Crown Badge on Active Bottle for Phones */}
                  {isActive && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#0B0A08]/80 border border-[#D4AF37] text-[#FFF2B2] text-[9.5px] font-cinzel font-bold uppercase tracking-widest backdrop-blur-md shadow-[0_0_15px_rgba(212,175,55,0.6)] pointer-events-none z-30 animate-fade-in">
                      <Crown className="w-3 h-3 text-[#D4AF37]" />
                      <span>{product.tier || 'Imperial Tier'}</span>
                    </div>
                  )}

                  <img
                    src={imgSrc}
                    alt={product.name || 'Arabian Sheikh Flacon'}
                    className="h-[50vh] max-h-[340px] sm:max-h-[400px] w-auto max-w-[85%] object-contain filter drop-shadow-[0_18px_32px_rgba(0,0,0,0.6)] transform-gpu"
                    loading="eager"
                    fetchPriority="high"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile 3.5s Step Indicator & Interactive Selectors */}
        <div className="flex items-center gap-2 mt-4 z-40">
          {products.map((p, idx) => {
            const isDotActive = idx === currentIndex;
            return (
              <button
                key={p.id || idx}
                onClick={() => handleSelect(idx)}
                aria-label={`View ${p.name}`}
                className={`relative h-2 rounded-full transition-all duration-500 cursor-pointer ${
                  isDotActive
                    ? 'w-9 bg-gradient-to-r from-[#FFF2B2] via-[#D4AF37] to-[#F2D675] shadow-[0_0_16px_rgba(212,175,55,0.9)]'
                    : 'w-2.5 bg-white/30 hover:bg-white/60'
                }`}
              />
            );
          })}
        </div>

        {/* Active Product Name & Price on Mobile - High Definition */}
        <div
          className="mt-2.5 px-4 py-1.5 rounded-full bg-black/80 border border-[#D4AF37]/60 text-center shadow-lg backdrop-blur-md z-40"
          style={{
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'geometricPrecision'
          }}
        >
          <span className="font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-[#FFFDF8] block">
            {getDisplayName(activeProduct)}
          </span>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <span className="font-mono text-[11px] font-bold text-[#F2D675]">
              €{activeProduct.price}
            </span>
            <span className="text-[#D4AF37]/60 text-[9px]">•</span>
            <span className="font-mono text-[10px] text-[#D8BE99]">
              {activeProduct.size || '60 ml'}
            </span>
          </div>
        </div>

        {/* Status Tag on Mobile */}
        <span className="text-[9.5px] font-cinzel tracking-widest uppercase text-[#FFF2B2] mt-1.5 font-bold transition-opacity duration-300 z-40 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
          {currentIndex + 1} / {products.length} • {activeProduct.tier || 'Imperial Tier'}
        </span>
      </div>

      {/* Embedded High-Performance Floating Keyframes */}
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
