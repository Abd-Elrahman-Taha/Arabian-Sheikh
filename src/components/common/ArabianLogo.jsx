import React from 'react';
import logoSvg from '../../assets/arabian-sheikh-logo.svg';

/**
 * ArabianLogo Component
 * 
 * Official vector brand signature extracted from the royal Arabian Sheikh identity.
 * Proportional crest height visually matches the total height of "ARABIAN SHEIKH" + "HAUTE PARFUMERIE ARABE".
 */
export default function ArabianLogo({
  variant = 'full', // 'crest' | 'full' | 'horizontal'
  size = 'md',      // 'navbar' | 'sm' | 'md' | 'lg' | 'hero' | 'xl'
  className = '',
  showSubtitle = true,
  subtitle = 'Haute Parfumerie Arabe'
}) {
  const sizeMap = {
    navbar: {
      crest: 'h-8 sm:h-9 w-auto aspect-[85/113]',
      text: 'text-sm sm:text-base md:text-lg tracking-[0.2em]',
      sub: 'text-[7.5px] sm:text-[8.5px] tracking-[0.32em]'
    },
    sm: {
      crest: 'h-8 sm:h-9 w-auto aspect-[85/113]',
      text: 'text-base sm:text-lg tracking-[0.22em]',
      sub: 'text-[8px] tracking-[0.35em]'
    },
    md: {
      crest: 'h-11 sm:h-13 w-auto aspect-[85/113]',
      text: 'text-lg sm:text-xl tracking-[0.25em]',
      sub: 'text-[9px] tracking-[0.4em]'
    },
    lg: {
      crest: 'h-16 sm:h-20 w-auto aspect-[85/113]',
      text: 'text-2xl sm:text-3xl tracking-[0.28em]',
      sub: 'text-xs tracking-[0.45em]'
    },
    hero: {
      crest: 'h-24 sm:h-32 lg:h-36 w-auto aspect-[85/113]',
      text: 'text-3xl sm:text-5xl lg:text-6xl tracking-[0.3em]',
      sub: 'text-xs sm:text-sm tracking-[0.5em]'
    },
    xl: {
      crest: 'h-28 sm:h-40 w-auto aspect-[85/113]',
      text: 'text-4xl sm:text-6xl tracking-[0.32em]',
      sub: 'text-sm tracking-[0.52em]'
    }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (variant === 'crest') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <img
          src={logoSvg}
          alt="Arabian Sheikh Royal Crest"
          className={`${currentSize.crest} object-contain filter drop-shadow-[0_0_20px_rgba(210,165,95,0.45)] transition-transform duration-500 hover:scale-105`}
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
          className={`${currentSize.crest} object-contain flex-shrink-0 filter drop-shadow-[0_0_12px_rgba(210,165,95,0.35)] transition-transform duration-300 group-hover:scale-105`}
        />
        <div className="flex flex-col text-left justify-center">
          <span className={`font-cinzel font-bold text-[var(--text-primary)] group-hover:text-[var(--gold-primary)] transition-colors leading-tight ${currentSize.text}`}>
            ARABIAN SHEIKH
          </span>
          {showSubtitle && (
            <span className={`uppercase font-sans font-semibold text-[var(--gold-primary)] tracking-widest leading-tight mt-0.5 ${currentSize.sub}`}>
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
        className={`${currentSize.crest} object-contain mb-2.5 filter drop-shadow-[0_0_20px_rgba(210,165,95,0.45)] transition-transform duration-500 group-hover:scale-105`}
      />
      <span className={`font-cinzel font-bold text-[var(--text-primary)] group-hover:text-[var(--gold-primary)] transition-colors ${currentSize.text}`}>
        ARABIAN SHEIKH
      </span>
      {showSubtitle && (
        <span className={`uppercase font-sans font-medium text-[var(--gold-primary)] mt-1 tracking-widest ${currentSize.sub}`}>
          {subtitle}
        </span>
      )}
    </div>
  );
}
