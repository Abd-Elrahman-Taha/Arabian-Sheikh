import React from 'react';
import logoSvg from '../../assets/arabian-sheikh-logo.svg';

/**
 * ArabianLogo Component
 * 
 * Official vector brand signature extracted from the royal Arabian Sheikh identity.
 * Features the radiant light champagne gold crest and bright luxury typography.
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
      crest: 'w-8 sm:w-10 h-10 sm:h-12',
      text: 'text-base sm:text-xl md:text-2xl tracking-[0.24em]',
      sub: 'text-[8.5px] sm:text-[9.5px] tracking-[0.38em]'
    },
    sm: {
      crest: 'w-7 h-9',
      text: 'text-base sm:text-lg tracking-[0.22em]',
      sub: 'text-[8px] tracking-[0.35em]'
    },
    md: {
      crest: 'w-11 h-14',
      text: 'text-xl sm:text-2xl tracking-[0.26em]',
      sub: 'text-[9.5px] tracking-[0.4em]'
    },
    lg: {
      crest: 'w-16 sm:w-20 h-20 sm:h-26',
      text: 'text-2xl sm:text-4xl tracking-[0.28em]',
      sub: 'text-xs tracking-[0.45em]'
    },
    hero: {
      crest: 'w-24 sm:w-32 lg:w-36 h-32 sm:h-44 lg:h-48',
      text: 'text-3xl sm:text-5xl lg:text-6xl tracking-[0.3em]',
      sub: 'text-xs sm:text-sm tracking-[0.5em]'
    },
    xl: {
      crest: 'w-28 sm:w-36 h-36 sm:h-48',
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
          className={`${currentSize.crest} object-contain filter drop-shadow-[0_0_24px_rgba(243,224,184,0.55)] transition-transform duration-500 hover:scale-105`}
        />
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-3.5 sm:gap-4 group ${className}`}>
        <img
          src={logoSvg}
          alt="Arabian Sheikh Royal Crest"
          className={`${currentSize.crest} object-contain flex-shrink-0 filter drop-shadow-[0_0_20px_rgba(243,224,184,0.5)] transition-transform duration-500 group-hover:scale-105`}
        />
        <div className="flex flex-col text-left">
          <span className={`font-cinzel font-bold text-[#FFFDF7] group-hover:text-[#FDF2D7] transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] ${currentSize.text}`}>
            ARABIAN SHEIKH
          </span>
          {showSubtitle && (
            <span className={`uppercase font-sans font-semibold text-[#E8CE93] mt-0.5 tracking-widest drop-shadow-sm ${currentSize.sub}`}>
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
        className={`${currentSize.crest} object-contain mb-3 filter drop-shadow-[0_0_28px_rgba(243,224,184,0.6)] transition-transform duration-500 group-hover:scale-105`}
      />
      <span className={`font-cinzel font-bold text-[#FFFDF7] group-hover:text-[#FDF2D7] transition-colors drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)] ${currentSize.text}`}>
        ARABIAN SHEIKH
      </span>
      {showSubtitle && (
        <span className={`uppercase font-sans font-semibold text-[#E8CE93] mt-1.5 tracking-widest drop-shadow-sm ${currentSize.sub}`}>
          {subtitle}
        </span>
      )}
    </div>
  );
}
