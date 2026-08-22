import React from 'react';
import logoSvg from '../../assets/arabian-sheikh-logo.svg';

/**
 * ArabianLogo Component
 *
 * Official vector brand signature with calibrated container crop
 * (Round 1 Fix #3: removes extra whitespace above crest while keeping SVG file 100% untouched).
 *
 * Props:
 *  variant      – 'crest' | 'full' | 'horizontal' | 'header'
 *  size         – 'navbar' | 'sm' | 'md' | 'lg' | 'hero' | 'xl'
 *  showSubtitle – show "Haute Parfumerie • Andalusia"
 *  subtitle     – custom subtitle string
 */
export default function ArabianLogo({
  variant = 'full',
  size = 'md',
  className = '',
  showSubtitle = true,
  subtitle = 'Andalusia'
}) {
  const sizeMap = {
    navbar: {
      crestWrap: 'h-9 sm:h-10 w-9 sm:w-10',
      imgScale: 'scale-[1.28] -translate-y-[10%]',
      text: 'text-xs sm:text-sm tracking-[0.25em]',
      sub: 'text-[7.5px] sm:text-[8.5px] tracking-[0.32em]'
    },
    sm: {
      crestWrap: 'h-12 sm:h-14 w-12 sm:w-14',
      imgScale: 'scale-[1.28] -translate-y-[10%]',
      text: 'text-sm sm:text-base tracking-[0.22em]',
      sub: 'text-[8px] tracking-[0.35em]'
    },
    md: {
      crestWrap: 'h-16 sm:h-20 w-16 sm:w-20',
      imgScale: 'scale-[1.28] -translate-y-[10%]',
      text: 'text-base sm:text-lg tracking-[0.25em]',
      sub: 'text-[9px] tracking-[0.4em]'
    },
    lg: {
      crestWrap: 'h-24 sm:h-32 w-24 sm:w-32',
      imgScale: 'scale-[1.28] -translate-y-[10%]',
      text: 'text-xl sm:text-2xl tracking-[0.28em]',
      sub: 'text-xs tracking-[0.45em]'
    },
    hero: {
      crestWrap: 'h-36 sm:h-48 lg:h-56 w-36 sm:w-48 lg:w-56',
      imgScale: 'scale-[1.28] -translate-y-[10%]',
      text: 'text-2xl sm:text-4xl tracking-[0.3em]',
      sub: 'text-xs sm:text-sm tracking-[0.5em]'
    },
    xl: {
      crestWrap: 'h-48 sm:h-64 w-48 sm:w-64',
      imgScale: 'scale-[1.28] -translate-y-[10%]',
      text: 'text-3xl sm:text-5xl tracking-[0.32em]',
      sub: 'text-sm tracking-[0.52em]'
    }
  };

  const s = sizeMap[size] || sizeMap.md;

  // Header specific centered compact variant
  if (variant === 'header') {
    return (
      <div className={`inline-flex items-center gap-2.5 sm:gap-3 group focus:outline-none ${className}`}>
        <div className={`relative overflow-hidden flex items-center justify-center ${s.crestWrap}`}>
          <img
            src={logoSvg}
            alt="Arabian Sheikh Crest"
            className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.34] ${s.imgScale}`}
          />
        </div>
        <div className="flex flex-col text-left justify-center">
          <span className="font-cinzel font-bold text-current group-hover:text-[#D4AF37] transition-colors leading-tight text-xs sm:text-sm md:text-base tracking-[0.25em] uppercase">
            ARABIAN SHEIKH
          </span>
          <span className="text-[#D4AF37] font-cinzel text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.35em] leading-tight mt-0.5">
            {subtitle || 'Andalusia'}
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'crest') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <div className={`relative overflow-hidden flex items-center justify-center ${s.crestWrap}`}>
          <img
            src={logoSvg}
            alt="Arabian Sheikh Royal Crest"
            className={`w-full h-full object-contain filter drop-shadow-[0_0_18px_rgba(212,175,55,0.45)] transition-transform duration-500 hover:scale-[1.34] ${s.imgScale}`}
          />
        </div>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-2.5 sm:gap-3 group ${className}`}>
        <div className={`relative overflow-hidden flex items-center justify-center flex-shrink-0 ${s.crestWrap}`}>
          <img
            src={logoSvg}
            alt="Arabian Sheikh Royal Crest"
            className={`w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(212,175,55,0.35)] transition-transform duration-300 group-hover:scale-[1.34] ${s.imgScale}`}
          />
        </div>
        <div className="flex flex-col text-left justify-center">
          <span className={`font-cinzel font-bold text-current group-hover:text-[#D4AF37] transition-colors leading-tight ${s.text}`}>
            ARABIAN SHEIKH
          </span>
          {showSubtitle && (
            <span className={`uppercase font-cinzel text-[#D4AF37] font-semibold tracking-widest leading-tight mt-0.5 ${s.sub}`}>
              {subtitle || 'Haute Parfumerie • Andalusia'}
            </span>
          )}
        </div>
      </div>
    );
  }

  const isArabicSubtitle = Boolean(subtitle && /[\u0600-\u06FF]/.test(subtitle));

  // Full stacked variant
  return (
    <div className={`inline-flex flex-col items-center justify-center text-center group ${className}`}>
      <div className={`relative overflow-hidden flex items-center justify-center mb-2 sm:mb-3 ${s.crestWrap}`}>
        <img
          src={logoSvg}
          alt="Arabian Sheikh Royal Identity"
          className={`w-full h-full object-contain filter drop-shadow-[0_0_24px_rgba(212,175,55,0.4)] transition-transform duration-500 group-hover:scale-[1.34] ${s.imgScale}`}
        />
      </div>
      <div className="flex flex-col items-center">
        <span className={`font-cinzel font-bold text-current group-hover:text-[#D4AF37] transition-colors ${s.text}`}>
          ARABIAN SHEIKH
        </span>
        {showSubtitle && (
          <span
            className={`font-semibold text-[#D4AF37] mt-1.5 ${
              isArabicSubtitle
                ? 'font-arabic text-lg sm:text-2xl tracking-normal text-[#F2D675] drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]'
                : `uppercase font-cinzel tracking-[0.35em] ${s.sub}`
            }`}
          >
            {subtitle || 'Haute Parfumerie • Andalusia'}
          </span>
        )}
      </div>
    </div>
  );
}
