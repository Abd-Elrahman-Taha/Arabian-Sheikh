import React from 'react';
import womanPalaceImg from '../../assets/arabian_woman_palace.jpg';
import sheikhPalaceImg from '../../assets/arabian_sheikh_palace.jpg';

/**
 * LivingArabianFigure Component
 * 
 * Sits in the background behind content with pointer-events-none.
 * Displays an elegant Arabian woman or man figure with subtle living motion
 * and soft radial gradient masking that blends naturally into the palace architecture.
 */
export default function LivingArabianFigure({
  type = 'woman', // 'woman' | 'man'
  position = 'left', // 'left' | 'right'
  opacity = 0.35,
  className = ''
}) {
  const imgSrc = type === 'woman' ? womanPalaceImg : sheikhPalaceImg;
  const altText = type === 'woman' ? 'Arabian Woman in Flowing Abaya' : 'Arabian Sheikh in Palace Majlis';

  return (
    <div
      className={`absolute bottom-0 ${position === 'left' ? 'left-0 sm:left-4 lg:left-10' : 'right-0 sm:right-4 lg:right-10'} pointer-events-none select-none z-0 overflow-hidden ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <div className="relative w-56 sm:w-72 lg:w-96 h-[420px] sm:h-[520px] lg:h-[620px] animate-abaya-sway">
        <img
          src={imgSrc}
          alt={altText}
          className="w-full h-full object-cover object-top filter contrast-115 brightness-95"
          style={{
            maskImage: 'radial-gradient(ellipse 75% 85% at 50% 50%, black 40%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 85% at 50% 50%, black 40%, transparent 85%)'
          }}
        />
        {/* Subtle Warm Light Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/20 via-transparent to-transparent mix-blend-screen" />
      </div>
    </div>
  );
}
