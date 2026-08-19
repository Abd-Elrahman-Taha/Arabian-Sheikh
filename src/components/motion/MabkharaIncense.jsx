import React from 'react';
import ContinuousBakhoorSmoke from './ContinuousBakhoorSmoke';

/**
 * MabkharaIncense Component
 * 
 * Elegant traditional Arabian incense burner (Mabkhara) with continuous,
 * seamlessly looping organic Bakhoor smoke.
 * Sits in the background behind content with pointer-events-none.
 */
export default function MabkharaIncense({
  size = 'md', // 'sm' | 'md' | 'lg'
  position = 'right', // 'left' | 'right' | 'center'
  opacity = 0.85,
  smokeIntensity = 1.0,
  tint = 'cream',
  showBase = true,
  className = ''
}) {
  const sizeMap = {
    sm: {
      container: 'w-24 sm:w-32 h-44 sm:h-56',
      base: 'w-7 sm:w-9 h-9 sm:h-11',
      smokeOriginY: 0.88,
      smokeScale: 0.8
    },
    md: {
      container: 'w-32 sm:w-44 h-60 sm:h-76',
      base: 'w-10 sm:w-14 h-13 sm:h-18',
      smokeOriginY: 0.86,
      smokeScale: 1.0
    },
    lg: {
      container: 'w-44 sm:w-56 h-80 sm:h-96',
      base: 'w-14 sm:w-20 h-18 sm:h-24',
      smokeOriginY: 0.84,
      smokeScale: 1.25
    }
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative pointer-events-none select-none overflow-visible ${current.container} ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Traditional Golden Mabkhara Silhouette */}
      {showBase && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
          <svg
            viewBox="0 0 50 65"
            className={`${current.base} text-[#D2A55F] filter drop-shadow-[0_4px_16px_rgba(210,165,95,0.45)]`}
            fill="currentColor"
          >
            {/* Crown / Top Lip of Burner */}
            <path d="M10 18 Q25 24 40 18 L44 14 Q25 8 6 14 Z" fill="#E0B978" />
            <polygon points="12,18 16,10 20,18 25,8 30,18 34,10 38,18" fill="#D2A55F" />

            {/* Glowing Burning Charcoal Core */}
            <ellipse cx="25" cy="18" rx="11" ry="3.5" fill="#B8945A" />
            <ellipse cx="25" cy="18" rx="6" ry="2" fill="#E0B978" opacity="0.9" />

            {/* Upper Cup Bowl */}
            <path d="M12 18 L18 36 L32 36 L38 18 Z" opacity="0.95" />
            {/* Ornate Cutouts on Bowl */}
            <polygon points="21,24 25,20 29,24 25,28" fill="#130C05" opacity="0.6" />
            <polygon points="17,28 20,25 23,28 20,31" fill="#130C05" opacity="0.6" />
            <polygon points="27,28 30,25 33,28 30,31" fill="#130C05" opacity="0.6" />

            {/* Central Stem Pillar */}
            <path d="M22 36 L22 46 L28 46 L28 36 Z" fill="#E0B978" />

            {/* Flared Base */}
            <path d="M20 46 L10 60 L40 60 L30 46 Z" opacity="0.95" />
            <path d="M16 60 Q25 54 34 60 Z" fill="#130C05" opacity="0.4" />
            <rect x="8" y="60" width="34" height="3" rx="1.5" fill="#E0B978" />
          </svg>

          {/* Warm Ember Glow Shimmer */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#E0B978] animate-ping opacity-40 filter blur-xs" />
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#D2A55F]/30 filter blur-md animate-lantern-pulse" />
        </div>
      )}

      {/* Infinite Organic Rising Bakhoor Smoke */}
      <ContinuousBakhoorSmoke
        originX={0.5}
        originY={current.smokeOriginY}
        smokeIntensity={smokeIntensity * current.smokeScale}
        tint={tint}
      />
    </div>
  );
}
