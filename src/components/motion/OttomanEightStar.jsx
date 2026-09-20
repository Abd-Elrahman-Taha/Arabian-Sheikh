import React, { useId } from 'react';

/**
 * OttomanEightStar (النجمة الثمانية للزخرفة العثمانية / Seljuk 8-Pointed Star)
 * Authentic Islamic Geometric Rosette featuring dual 45-degree interlocking squares,
 * interlaced geometric latticework, central rosette, and glowing sovereign gold styling.
 * Uses isolated unique SVG definition IDs to ensure zero rendering conflicts when conditionally hidden.
 */
export default function OttomanEightStar({
  size = 520,
  opacity = 0.7,
  className = '',
  rotateSpeed = 75, // seconds for 360 degree rotation
  reverse = false
}) {
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gradId = `goldOttomanGrad_${reactId}`;

  return (
    <div
      className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: typeof size === 'number' ? `${size}px` : size, height: typeof size === 'number' ? `${size}px` : size, opacity }}
      aria-hidden="true"
    >
      {/* Outer Radiant Ambient Glow */}
      <div
        className="absolute inset-0 rounded-full blur-3xl transform-gpu pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.3) 0%, rgba(184, 134, 11, 0.15) 50%, transparent 75%)',
          animation: 'pulseGlowStar 6s ease-in-out infinite alternate'
        }}
      />

      {/* Rotating Geometric SVG Container */}
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full transform-gpu"
        style={{
          animation: `${reverse ? 'spinOttomanCounter' : 'spinOttoman'} ${rotateSpeed}s linear infinite`,
          filter: 'drop-shadow(0 0 14px rgba(212, 175, 55, 0.4))'
        }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sovereign Gold Gradient */}
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="35%" stopColor="#D4AF37" />
            <stop offset="70%" stopColor="#8C6239" />
            <stop offset="100%" stopColor="#F2D675" />
          </linearGradient>
        </defs>

        {/* Main 8-Pointed Star: First Square (0 deg) */}
        <rect
          x="75"
          y="75"
          width="250"
          height="250"
          stroke={`url(#${gradId})`}
          strokeWidth="2.2"
          opacity="0.9"
          transform="rotate(0 200 200)"
        />

        {/* Main 8-Pointed Star: Second Square (45 deg) */}
        <rect
          x="75"
          y="75"
          width="250"
          height="250"
          stroke={`url(#${gradId})`}
          strokeWidth="2.2"
          opacity="0.9"
          transform="rotate(45 200 200)"
        />

        {/* Intermediate Octagram Interlacing Ring */}
        <polygon
          points="200,45 235,115 310,90 285,165 355,200 285,235 310,310 235,285 200,355 165,285 90,310 115,235 45,200 115,165 90,90 165,115"
          stroke={`url(#${gradId})`}
          strokeWidth="1.6"
          opacity="0.75"
        />

        {/* Inner Secondary 8-Pointed Star (Rotated 22.5 deg) */}
        <rect
          x="110"
          y="110"
          width="180"
          height="180"
          stroke={`url(#${gradId})`}
          strokeWidth="1.3"
          opacity="0.65"
          transform="rotate(22.5 200 200)"
        />
        <rect
          x="110"
          y="110"
          width="180"
          height="180"
          stroke={`url(#${gradId})`}
          strokeWidth="1.3"
          opacity="0.65"
          transform="rotate(67.5 200 200)"
        />
      </svg>

      {/* Embedded CSS Animations */}
      <style>{`
        @keyframes spinOttoman {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spinOttomanCounter {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes pulseGlowStar {
          0% { transform: scale(0.94); opacity: 0.55; }
          100% { transform: scale(1.12); opacity: 0.95; }
        }
      `}</style>
    </div>
  );
}
