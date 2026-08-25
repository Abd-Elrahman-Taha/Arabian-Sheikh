import React from 'react';

/**
 * OttomanEightStar (النجمة الثمانية للزخرفة العثمانية / Seljuk 8-Pointed Star)
 * Authentic Islamic Geometric Rosette featuring dual 45-degree interlocking squares,
 * interlaced geometric latticework, central rosette, and glowing sovereign gold styling.
 */
export default function OttomanEightStar({
  size = 520,
  opacity = 0.7,
  className = '',
  rotateSpeed = 75, // seconds for 360 degree rotation
  reverse = false
}) {
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
          <linearGradient id="goldOttomanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="35%" stopColor="#D4AF37" />
            <stop offset="70%" stopColor="#8C6239" />
            <stop offset="100%" stopColor="#F2D675" />
          </linearGradient>

          {/* Glowing Radial Gold */}
          <radialGradient id="goldRadialCenter" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF9E0" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#D4AF37" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Circular Astrolabe Boundary Ring */}
        <circle
          cx="200"
          cy="200"
          r="190"
          stroke="url(#goldOttomanGrad)"
          strokeWidth="1.4"
          strokeDasharray="4 6"
          opacity="0.65"
        />
        <circle
          cx="200"
          cy="200"
          r="182"
          stroke="url(#goldOttomanGrad)"
          strokeWidth="0.9"
          opacity="0.45"
        />

        {/* 8 Radiating Cardinal & Ordinal Ray Spikes */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <g key={`ray-${i}`} transform={`rotate(${angle} 200 200)`}>
            <line x1="200" y1="10" x2="200" y2="42" stroke="url(#goldOttomanGrad)" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="200" cy="8" r="2.8" fill="#F2D675" />
            <polygon points="200,18 195,34 205,34" fill="url(#goldOttomanGrad)" opacity="0.85" />
          </g>
        ))}

        {/* Main 8-Pointed Star: First Square (0 deg) */}
        <rect
          x="75"
          y="75"
          width="250"
          height="250"
          stroke="url(#goldOttomanGrad)"
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
          stroke="url(#goldOttomanGrad)"
          strokeWidth="2.2"
          opacity="0.9"
          transform="rotate(45 200 200)"
        />

        {/* Intermediate Octagram Interlacing Ring */}
        <polygon
          points="200,45 235,115 310,90 285,165 355,200 285,235 310,310 235,285 200,355 165,285 90,310 115,235 45,200 115,165 90,90 165,115"
          stroke="url(#goldOttomanGrad)"
          strokeWidth="1.6"
          opacity="0.75"
        />

        {/* Inner Secondary 8-Pointed Star (Rotated 22.5 deg) */}
        <rect
          x="110"
          y="110"
          width="180"
          height="180"
          stroke="url(#goldOttomanGrad)"
          strokeWidth="1.3"
          opacity="0.65"
          transform="rotate(22.5 200 200)"
        />
        <rect
          x="110"
          y="110"
          width="180"
          height="180"
          stroke="url(#goldOttomanGrad)"
          strokeWidth="1.3"
          opacity="0.65"
          transform="rotate(67.5 200 200)"
        />

        {/* Inner Rosette Floral Geometry */}
        <circle cx="200" cy="200" r="60" stroke="url(#goldOttomanGrad)" strokeWidth="1.3" opacity="0.75" />
        <circle cx="200" cy="200" r="45" stroke="url(#goldOttomanGrad)" strokeWidth="1.0" strokeDasharray="3 3" opacity="0.65" />

        {/* Central 8-Petal Rosette */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <ellipse
            key={`petal-${i}`}
            cx="200"
            cy="172"
            rx="10"
            ry="24"
            stroke="url(#goldOttomanGrad)"
            strokeWidth="1.2"
            fill="url(#goldRadialCenter)"
            opacity="0.85"
            transform={`rotate(${deg} 200 200)`}
          />
        ))}

        {/* Sacred Central 8-Point Core */}
        <polygon
          points="200,180 206,194 220,200 206,206 200,220 194,206 180,200 194,194"
          fill="url(#goldOttomanGrad)"
          stroke="#FFF9E0"
          strokeWidth="1"
        />
        <circle cx="200" cy="200" r="4.5" fill="#FFFDF0" />
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
