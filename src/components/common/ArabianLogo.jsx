import React from 'react';
import logoSvg from '../../assets/arabian-sheikh-logo.svg';

/**
 * ArabianLogo Component
 * 
 * Official vector brand signature extracted from the royal Arabian Sheikh identity.
 * Combines the ornate Arabesque royal crest with serif editorial typography.
 */
export default function ArabianLogo({
  variant = 'full', // 'crest' | 'full' | 'horizontal'
  size = 'md',      // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
  showSubtitle = true,
  subtitle = 'Haute Parfumerie Arabe'
}) {
  const sizeMap = {
    sm: { crest: 'w-6 h-8', text: 'text-sm sm:text-base tracking-[0.22em]', sub: 'text-[7.5px] tracking-[0.35em]' },
    md: { crest: 'w-8 h-10', text: 'text-lg sm:text-xl tracking-[0.26em]', sub: 'text-[8.5px] tracking-[0.42em]' },
    lg: { crest: 'w-12 h-16', text: 'text-2xl sm:text-3xl tracking-[0.28em]', sub: 'text-[10px] tracking-[0.45em]' },
    xl: { crest: 'w-20 h-28', text: 'text-3xl sm:text-5xl tracking-[0.3em]', sub: 'text-xs tracking-[0.5em]' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (variant === 'crest') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <img
          src={logoSvg}
          alt="Arabian Sheikh Royal Crest"
          className={`${currentSize.crest} object-contain filter drop-shadow-[0_2px_12px_rgba(210,165,95,0.35)] transition-transform duration-500 hover:scale-105`}
        />
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-3.5 ${className}`}>
        <img
          src={logoSvg}
          alt="Arabian Sheikh Royal Crest"
          className={`${currentSize.crest} object-contain filter drop-shadow-[0_2px_10px_rgba(210,165,95,0.3)]`}
        />
        <div className="flex flex-col text-left">
          <span className={`font-cinzel font-bold text-[var(--text-primary)] group-hover:text-[var(--gold-primary)] transition-colors ${currentSize.text}`}>
            ARABIAN SHEIKH
          </span>
          {showSubtitle && (
            <span className={`uppercase text-[var(--gold-primary)] font-sans font-medium mt-0.5 ${currentSize.sub}`}>
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
        className={`${currentSize.crest} object-contain mb-2 filter drop-shadow-[0_4px_16px_rgba(210,165,95,0.4)] transition-transform duration-500 group-hover:scale-105`}
      />
      <span className={`font-cinzel font-bold text-[var(--text-primary)] group-hover:text-[var(--gold-primary)] transition-colors ${currentSize.text}`}>
        ARABIAN SHEIKH
      </span>
      {showSubtitle && (
        <span className={`uppercase text-[var(--gold-primary)] font-sans font-semibold mt-1 ${currentSize.sub}`}>
          {subtitle}
        </span>
      )}
    </div>
  );
}
