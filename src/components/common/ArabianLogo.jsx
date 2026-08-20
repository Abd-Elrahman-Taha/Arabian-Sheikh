import React from 'react';
import logoSvg from '../../assets/arabian-sheikh-logo.svg';

/**
 * ArabianLogo Component
 *
 * Official vector brand signature — Arabian Sheikh royal identity.
 *
 * Props:
 *  variant      – 'crest' | 'full' | 'horizontal'
 *  size         – 'navbar' | 'sm' | 'md' | 'lg' | 'hero' | 'xl'
 *  showSubtitle – show "Haute Parfumerie Arabe" (or custom subtitle)
 *  showArabic   – show "الشيخ العربي" Arabic brand name below English
 *  subtitle     – custom subtitle string
 */
export default function ArabianLogo({
  variant = 'full',
  size = 'md',
  className = '',
  showSubtitle = false,
  showArabic = false,
  subtitle = 'Haute Parfumerie Arabe'
}) {
  const sizeMap = {
    navbar: {
      crest:  'h-8 sm:h-9 w-auto aspect-[85/113]',
      text:   'text-sm sm:text-base md:text-lg tracking-[0.2em]',
      sub:    'text-[7.5px] sm:text-[8.5px] tracking-[0.32em]',
      arabic: 'text-[11px] sm:text-[13px]'
    },
    sm: {
      crest:  'h-8 sm:h-9 w-auto aspect-[85/113]',
      text:   'text-base sm:text-lg tracking-[0.22em]',
      sub:    'text-[8px] tracking-[0.35em]',
      arabic: 'text-sm'
    },
    md: {
      crest:  'h-11 sm:h-13 w-auto aspect-[85/113]',
      text:   'text-lg sm:text-xl tracking-[0.25em]',
      sub:    'text-[9px] tracking-[0.4em]',
      arabic: 'text-base'
    },
    lg: {
      crest:  'h-16 sm:h-20 w-auto aspect-[85/113]',
      text:   'text-2xl sm:text-3xl tracking-[0.28em]',
      sub:    'text-xs tracking-[0.45em]',
      arabic: 'text-lg sm:text-xl'
    },
    hero: {
      crest:  'h-24 sm:h-32 lg:h-36 w-auto aspect-[85/113]',
      text:   'text-3xl sm:text-5xl lg:text-6xl tracking-[0.3em]',
      sub:    'text-xs sm:text-sm tracking-[0.5em]',
      arabic: 'text-xl sm:text-2xl'
    },
    xl: {
      crest:  'h-36 sm:h-52 lg:h-60 w-auto aspect-[85/113]',
      text:   'text-4xl sm:text-6xl lg:text-7xl tracking-[0.32em]',
      sub:    'text-sm tracking-[0.52em]',
      arabic: 'text-2xl sm:text-3xl lg:text-4xl'
    }
  };

  const s = sizeMap[size] || sizeMap.md;

  if (variant === 'crest') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <img
          src={logoSvg}
          alt="Arabian Sheikh Royal Crest"
          className={`${s.crest} object-contain filter drop-shadow-[0_0_20px_rgba(180,86,37,0.45)] transition-transform duration-500 hover:scale-105`}
        />
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-2.5 sm:gap-3 group ${className}`}>
        <img
          src={logoSvg}
          alt="Arabian Sheikh Royal Crest"
          className={`${s.crest} object-contain flex-shrink-0 filter drop-shadow-[0_0_12px_rgba(180,86,37,0.35)] transition-transform duration-300 group-hover:scale-105`}
        />
        <div className="flex flex-col text-left justify-center">
          <span className={`font-cinzel font-bold text-[var(--color-earth-dark)] group-hover:text-[var(--color-terracotta)] transition-colors leading-tight ${s.text}`}>
            ARABIAN SHEIKH
          </span>
          {showArabic && (
            <span className={`font-arabic text-[var(--color-terracotta)] font-semibold leading-snug mt-0.5 ${s.arabic}`}>
              الشيخ العربي
            </span>
          )}
          {showSubtitle && !showArabic && (
            <span className={`uppercase font-sans font-bold text-[var(--color-terracotta-deep)] tracking-widest leading-tight mt-0.5 ${s.sub}`}>
              {subtitle}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default 'full' centered layout
  return (
    <div className={`flex flex-col items-center text-center group ${className}`}>
      <img
        src={logoSvg}
        alt="Arabian Sheikh Royal Crest"
        className={`${s.crest} object-contain mb-4 filter drop-shadow-[0_0_32px_rgba(180,86,37,0.55)] transition-transform duration-500 group-hover:scale-105`}
      />
      <span className={`font-cinzel font-bold text-[var(--color-earth-dark)] group-hover:text-[var(--color-terracotta)] transition-colors ${s.text}`}>
        ARABIAN SHEIKH
      </span>
      {showArabic && (
        <span className={`font-arabic text-[var(--color-terracotta)] font-bold mt-2 leading-snug ${s.arabic}`}>
          الشيخ العربي
        </span>
      )}
      {showSubtitle && !showArabic && (
        <span className={`uppercase font-sans font-bold text-[var(--color-terracotta-deep)] mt-1 tracking-widest ${s.sub}`}>
          {subtitle}
        </span>
      )}
    </div>
  );
}



