import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import logoSvg from '../../assets/arabian-sheikh-logo.svg';

/**
 * ArabianLogo Component
 *
 * Official vector brand signature with calibrated container crop
 * Supports light & dark luxury themes with dynamic contrast.
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
  const { isDark } = useTheme();

  const sizeMap = {
    navbar: {
      crestWrap: 'h-10 sm:h-11 w-10 sm:w-11',
      imgScale: 'scale-[1.32] -translate-y-[8%]',
      text: 'text-sm sm:text-[15px] md:text-base tracking-[0.25em]',
      sub: 'text-[8.5px] sm:text-[9.5px] tracking-[0.34em]'
    },
    sm: {
      crestWrap: 'h-12 sm:h-14 w-12 sm:w-14',
      imgScale: 'scale-[1.28] -translate-y-[10%]',
      text: 'text-sm sm:text-base tracking-[0.22em]',
      sub: 'text-[8.5px] tracking-[0.35em]'
    },
    md: {
      crestWrap: 'h-16 sm:h-20 w-16 sm:w-20',
      imgScale: 'scale-[1.28] -translate-y-[10%]',
      text: 'text-base sm:text-lg tracking-[0.25em]',
      sub: 'text-[9.5px] tracking-[0.4em]'
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

  // Crest styling filter per theme
  const crestFilter = isDark
    ? 'filter drop-shadow-[0_0_14px_rgba(212,175,55,0.45)] brightness-100'
    : 'filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.25)] contrast-[1.35] brightness-[0.75]';

  // Text color per theme
  const brandTextColor = isDark
    ? 'text-[#F3E6D0] group-hover:text-[#D4AF37]'
    : 'text-[#120B06] group-hover:text-[#D4AF37]';

  const subtitleColor = isDark
    ? 'text-[#D4AF37]'
    : 'text-[#8C6239]';

  // Header specific centered compact variant
  if (variant === 'header') {
    return (
      <div className={`inline-flex items-center gap-2.5 sm:gap-3 group focus:outline-none ${className}`}>
        <div className={`relative overflow-hidden flex items-center justify-center ${s.crestWrap}`}>
          <img
            src={logoSvg}
            alt="Arabian Sheikh Crest"
            className={`w-full h-full object-contain transition-all duration-500 group-hover:scale-[1.38] ${crestFilter} ${s.imgScale}`}
          />
        </div>
        <div className="flex flex-col text-left justify-center">
          <span className={`font-cinzel font-bold transition-colors leading-tight uppercase ${brandTextColor} ${s.text}`}>
            ARABIAN SHEIKH
          </span>
          <span className={`font-cinzel font-semibold uppercase leading-tight mt-0.5 ${subtitleColor} ${s.sub}`}>
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
            className={`w-full h-full object-contain transition-all duration-500 hover:scale-[1.36] ${crestFilter} ${s.imgScale}`}
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
            className={`w-full h-full object-contain transition-all duration-300 group-hover:scale-[1.36] ${crestFilter} ${s.imgScale}`}
          />
        </div>
        <div className="flex flex-col text-left justify-center">
          <span className={`font-cinzel font-bold transition-colors leading-tight ${brandTextColor} ${s.text}`}>
            ARABIAN SHEIKH
          </span>
          {showSubtitle && (
            <span className={`uppercase font-cinzel font-semibold tracking-widest leading-tight mt-0.5 ${subtitleColor} ${s.sub}`}>
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
          className={`w-full h-full object-contain transition-all duration-500 group-hover:scale-[1.36] ${crestFilter} ${s.imgScale}`}
        />
      </div>
      <div className="flex flex-col items-center">
        <span className={`font-cinzel font-bold transition-colors ${brandTextColor} ${s.text}`}>
          ARABIAN SHEIKH
        </span>
        {showSubtitle && (
          <span
            className={`font-semibold mt-1.5 ${
              isArabicSubtitle
                ? 'font-arabic text-lg sm:text-2xl tracking-normal text-[#D4AF37]'
                : `uppercase font-cinzel tracking-[0.35em] ${subtitleColor} ${s.sub}`
            }`}
          >
            {subtitle || 'Haute Parfumerie • Andalusia'}
          </span>
        )}
      </div>
    </div>
  );
}
