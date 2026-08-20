import React, { useEffect, useRef } from 'react';

/**
 * DesertBackground
 *
 * A fixed full-viewport background layer that smoothly transitions through
 * 6 Arabian desert lighting stages as the user scrolls:
 *
 *   ☀️  Midday sand     →  🌤️  Afternoon  →  🌇  Golden hour
 *   🌅  Amber sunset    →  🌃  Maghrib     →  🌃  Deep evening
 *
 * Technique: reads scroll position on rAF, maps it to a gradient between
 * the nearest two color stops, applies via CSS custom property.
 * Zero canvas, zero dependencies beyond React.
 */

// 6 desert color stages mapped to scroll fraction [0..1]
const STAGES = [
  { at: 0.00, bg: '#F8D188', vignette: 'rgba(93,29,1,0.04)'   }, // ☀️  Midday Desert (Light Sand)
  { at: 0.20, bg: '#EBAA62', vignette: 'rgba(93,29,1,0.07)'   }, // 🌤️  Warm Afternoon (Main Desert Sand)
  { at: 0.40, bg: '#D98F44', vignette: 'rgba(128,48,13,0.12)' }, // 🌇  Golden Hour
  { at: 0.60, bg: '#B45625', vignette: 'rgba(93,29,1,0.16)'   }, // 🌅  Terracotta Sunset
  { at: 0.80, bg: '#80300D', vignette: 'rgba(93,29,1,0.24)'   }, // 🌇  Maghrib (Deep Terracotta)
  { at: 1.00, bg: '#5D1D01', vignette: 'rgba(93,29,1,0.38)'   }, // 🌃  Arabian Evening (Darkest Earth)
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function parseHex(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function interpolateColor(colorA, colorB, t) {
  const a = parseHex(colorA);
  const b = parseHex(colorB);
  const r = Math.round(lerp(a[0], b[0], t));
  const g = Math.round(lerp(a[1], b[1], t));
  const bl = Math.round(lerp(a[2], b[2], t));
  return `rgb(${r},${g},${bl})`;
}

function getDesertColor(scrollFraction) {
  const f = Math.max(0, Math.min(1, scrollFraction));
  for (let i = 0; i < STAGES.length - 1; i++) {
    const curr = STAGES[i];
    const next = STAGES[i + 1];
    if (f >= curr.at && f <= next.at) {
      const range = next.at - curr.at;
      const t = range === 0 ? 0 : (f - curr.at) / range;
      return {
        bg: interpolateColor(curr.bg, next.bg, t),
        vignette: curr.vignette,
      };
    }
  }
  const last = STAGES[STAGES.length - 1];
  return { bg: last.bg, vignette: last.vignette };
}

export default function DesertBackground() {
  const bgRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const el = bgRef.current;
    if (!el) return;

    let lastFraction = -1;

    const tick = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const fraction = maxScroll > 0 ? scrollTop / maxScroll : 0;

      // Only update DOM when value changes meaningfully
      if (Math.abs(fraction - lastFraction) > 0.0005) {
        lastFraction = fraction;
        const { bg } = getDesertColor(fraction);
        el.style.backgroundColor = bg;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={bgRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundColor: '#EBAA62', // initial Warm Desert Sand (#EBAA62)
        transition: 'background-color 0.5s ease',
        pointerEvents: 'none',
      }}
    />
  );
}
