import React from 'react';

/**
 * CamelCaravan Component
 * 
 * Realistic Arabian Camel Caravan moving to the RIGHT across the horizon dunes.
 * - Natural authentic camel coat colors with anatomical shading
 * - Bedouin leader at the front holding staff and lead rein
 * - Following camels in royal embroidered saddles
 * - 100% infinite continuous walking loop
 */
export default function CamelCaravan({
  speedMultiplier = 1,
  opacity = 1.0,
  scale = 1,
  className = ''
}) {
  // Detailed Realistic Colored Arabian Camel SVG
  const CamelSvg = ({ isLeader = false, saddleColor = '#942222', accentColor = '#D2A55F' }) => (
    <svg
      viewBox="0 0 160 100"
      className="w-36 sm:w-48 md:w-60 h-auto overflow-visible filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)] drop-shadow-[0_0_10px_rgba(210,165,95,0.35)]"
    >
      <defs>
        {/* Natural Camel Coat Gradient */}
        <linearGradient id="camelCoat" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#DFB07E" />
          <stop offset="35%" stopColor="#C89662" />
          <stop offset="75%" stopColor="#AD7743" />
          <stop offset="100%" stopColor="#7E4E24" />
        </linearGradient>

        {/* Back Legs / Shadow Gradient */}
        <linearGradient id="camelShadow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A87542" />
          <stop offset="100%" stopColor="#5E3816" />
        </linearGradient>

        {/* Muzzle & Chest Highlight */}
        <linearGradient id="camelHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EED2B3" />
          <stop offset="100%" stopColor="#C89662" />
        </linearGradient>
      </defs>

      {/* --- BACK LEGS (In Shadow) --- */}
      {/* Back-Right Foreleg */}
      <path d="M70 70 L73 89 L68 89 L66 70 Z" fill="url(#camelShadow)" />
      <rect x="68" y="87" width="5" height="3" rx="1" fill="#2E1A0C" />

      {/* Back-Right Hindleg */}
      <path d="M26 68 L28 88 L23 88 L22 68 Z" fill="url(#camelShadow)" />
      <rect x="23" y="86" width="5" height="3" rx="1" fill="#2E1A0C" />

      {/* Tail with Fur Tuft */}
      <path d="M14 60 Q8 68 11 76 Q12 79 10 82" fill="none" stroke="#7E4E24" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M10 79 Q7 83 11 86 Q13 83 10 79 Z" fill="#4A2B11" />

      {/* --- MAIN CAMEL BODY & FOREGROUND LEGS --- */}
      {/* Camel Body, Hump, Majestic S-Curved Neck and Head */}
      <path
        d="M14 60 
           Q16 52 22 48 
           Q28 44 36 44 
           Q44 28 58 28 
           Q68 28 74 38 
           Q82 38 90 46 
           Q98 38 106 22 
           Q109 16 114 15 
           Q120 14 122 19 
           Q124 25 117 29 
           Q108 38 102 54 
           Q98 64 92 68 
           Q86 72 78 72 
           L76 89 L70 89 L73 70 
           L56 70 L52 89 L46 89 L50 70 
           L36 70 L32 89 L26 89 L30 70 
           L22 70 L18 89 L12 89 L16 64 
           Q13 63 14 60 Z"
        fill="url(#camelCoat)"
      />

      {/* Front Hooves (Dark Espresso) */}
      <rect x="70" y="87" width="6" height="3.5" rx="1" fill="#2E1A0C" />
      <rect x="46" y="87" width="6" height="3.5" rx="1" fill="#2E1A0C" />
      <rect x="26" y="87" width="6" height="3.5" rx="1" fill="#2E1A0C" />
      <rect x="12" y="87" width="6" height="3.5" rx="1" fill="#2E1A0C" />

      {/* Lighter Snout / Muzzle */}
      <path d="M114 15 Q120 14 122 19 Q123 23 118 25 Q115 22 114 15 Z" fill="url(#camelHighlight)" />
      {/* Eye */}
      <ellipse cx="114" cy="18" rx="1.6" ry="1.2" fill="#231206" />
      {/* Nostril & Mouth Line */}
      <circle cx="120" cy="19.5" r="0.8" fill="#3D1D09" />
      <path d="M117 23 Q121 23 122 20" fill="none" stroke="#5E2F0F" strokeWidth="0.8" />
      {/* Small Ear */}
      <polygon points="107,17 110,12 111,18" fill="#9E6938" />

      {/* --- TRADITIONAL ARABIAN SADDLE & EMBROIDERY --- */}
      {/* Ornate Saddle Blanket (Crimson / Emerald with Gold Trim) */}
      <path d="M48 36 Q60 32 68 40 Q62 52 48 52 Z" fill={saddleColor} />
      <path d="M44 42 L38 60 L58 60 L56 42 Z" fill={saddleColor} />
      {/* Gold Trim Borders */}
      <path d="M48 36 Q60 32 68 40" fill="none" stroke={accentColor} strokeWidth="1.8" />
      <line x1="38" y1="60" x2="58" y2="60" stroke={accentColor} strokeWidth="2.2" />
      {/* Decorative Gold Diamonds & Tassels */}
      <polygon points="48,47 50,44 52,47 50,50" fill={accentColor} />
      <circle cx="41" cy="62" r="1.5" fill="#FFF5EB" />
      <circle cx="48" cy="62" r="1.5" fill="#FFF5EB" />
      <circle cx="55" cy="62" r="1.5" fill="#FFF5EB" />
      {/* Wooden Saddle Pommel / Horns */}
      <rect x="62" y="34" width="3" height="8" rx="1" fill="#5A3414" transform="rotate(-15 62 34)" />
      <rect x="47" y="34" width="3" height="8" rx="1" fill="#5A3414" transform="rotate(15 47 34)" />

      {/* Arabian Leather Bridle & Halter Straps */}
      <path d="M113 18 L116 26 L111 28 L108 20 Z" fill="none" stroke="#8E1F1F" strokeWidth="1.2" />
      <circle cx="116" cy="26" r="1.2" fill={accentColor} />

      {/* --- LEADER BEDOUIN GUIDE (Walking in front to the right) --- */}
      {isLeader && (
        <g transform="translate(132, 18)">
          {/* Head & Keffiyeh */}
          <ellipse cx="11" cy="23" rx="4.5" ry="5.5" fill="#FFFDF9" />
          <path d="M6 25 Q11 28 16 25 L15 35 L7 35 Z" fill="#FFFDF9" />
          {/* Black Agal */}
          <ellipse cx="11" cy="20.5" rx="4.2" ry="1.2" fill="#180F08" />
          <ellipse cx="11" cy="22" rx="4.2" ry="1.2" fill="#180F08" />

          {/* Flowing Cream & Gold Royal Bisht Robe */}
          <path d="M7 32 L15 32 L19 64 L3 64 Z" fill="#F7EFE4" />
          <line x1="11" y1="32" x2="11" y2="64" stroke="#D2A55F" strokeWidth="1.4" />
          
          {/* Wooden Walking Staff */}
          <line x1="20" y1="18" x2="21" y2="68" stroke="#7A481F" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="20" cy="18" r="1.5" fill="#D2A55F" />

          {/* Golden Lead Rein back to Camel's Halter */}
          <path d="M4 42 Q-6 45 -16 26" fill="none" stroke="#D2A55F" strokeWidth="1.4" strokeDasharray="3,1.5" />
        </g>
      )}

      {/* Caravan Hitch Rope connecting to trailing camel behind on left */}
      {!isLeader && (
        <path d="M-26 50 Q-10 58 10 60" fill="none" stroke="#D2A55F" strokeWidth="1.4" strokeDasharray="3.5,2" />
      )}
    </svg>
  );

  return (
    <div
      className={`absolute inset-x-0 bottom-0 pointer-events-none select-none overflow-hidden z-0 ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Warm Sunlit Arabian Desert Horizon Dunes */}
      <svg
        viewBox="0 0 1440 140"
        className="w-full h-20 sm:h-28 absolute bottom-0 inset-x-0 object-cover fill-current filter drop-shadow-[0_-6px_16px_rgba(0,0,0,0.6)]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="duneBack" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A87542" />
            <stop offset="100%" stopColor="#4A2B11" />
          </linearGradient>
          <linearGradient id="duneFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C4925B" />
            <stop offset="25%" stopColor="#8C5C2E" />
            <stop offset="100%" stopColor="#2E1807" />
          </linearGradient>
        </defs>

        {/* Dune Layer 1 (Distant Ridge) */}
        <path d="M0 60 Q360 15 720 45 T1440 30 L1440 140 L0 140 Z" fill="url(#duneBack)" opacity="0.9" />
        {/* Dune Layer 2 (Foreground Ridge with Golden Crest) */}
        <path d="M0 82 Q480 32 960 68 T1440 50 L1440 140 L0 140 Z" fill="url(#duneFront)" />
        {/* Gold Light Rim on Dune Crest */}
        <path d="M0 82 Q480 32 960 68 T1440 50" fill="none" stroke="#E6BE8A" strokeWidth="1.5" opacity="0.6" />
      </svg>

      {/* Infinite Walking Camel Caravan Track (Moving Left to Right) */}
      <div className="relative w-full h-36 sm:h-48 md:h-56">
        {/* Camel 1 (Caravan Leader with Bedouin Guide in Front) */}
        <div
          className="absolute bottom-4 sm:bottom-6 animate-caravan-walk"
          style={{
            animationDuration: `${30 / speedMultiplier}s`,
            animationDelay: '0s',
            transform: `scale(${scale})`
          }}
        >
          <div className="animate-camel-gait">
            <CamelSvg isLeader={true} saddleColor="#8B1E1E" accentColor="#D2A55F" />
          </div>
        </div>

        {/* Camel 2 (Trailing 1 - Royal Emerald) */}
        <div
          className="absolute bottom-4 sm:bottom-6 animate-caravan-walk"
          style={{
            animationDuration: `${30.5 / speedMultiplier}s`,
            animationDelay: `${-7.5 / speedMultiplier}s`,
            transform: `scale(${scale * 0.96})`
          }}
        >
          <div className="animate-camel-gait" style={{ animationDelay: '-0.7s' }}>
            <CamelSvg isLeader={false} saddleColor="#1A4A33" accentColor="#E0BA78" />
          </div>
        </div>

        {/* Camel 3 (Trailing 2 - Sapphire) */}
        <div
          className="absolute bottom-4 sm:bottom-6 animate-caravan-walk"
          style={{
            animationDuration: `${30.2 / speedMultiplier}s`,
            animationDelay: `${-15 / speedMultiplier}s`,
            transform: `scale(${scale * 0.92})`
          }}
        >
          <div className="animate-camel-gait" style={{ animationDelay: '-1.4s' }}>
            <CamelSvg isLeader={false} saddleColor="#1B2D54" accentColor="#D2A55F" />
          </div>
        </div>

        {/* Camel 4 (Trailing 3 - Imperial Crimson) */}
        <div
          className="absolute bottom-4 sm:bottom-6 animate-caravan-walk"
          style={{
            animationDuration: `${30.8 / speedMultiplier}s`,
            animationDelay: `${-22.5 / speedMultiplier}s`,
            transform: `scale(${scale * 0.94})`
          }}
        >
          <div className="animate-camel-gait" style={{ animationDelay: '-0.4s' }}>
            <CamelSvg isLeader={false} saddleColor="#7A1D1D" accentColor="#F5D296" />
          </div>
        </div>
      </div>
    </div>
  );
}
