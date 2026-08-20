import React, { useEffect, useRef } from 'react';

/**
 * DesertBackground
 *
 * Calibrated dark luxury background transition:
 * Deep obsidian (#0A0A0B) → Rich espresso (#0F0D0C) → Royal bronze ember (#14100D) → Obsidian night (#0A0A0B)
 */

const STAGES = [
  { at: 0.00, bg: '#0A0A0B', vignette: 'rgba(0,0,0,0.6)' },
  { at: 0.35, bg: '#0E0C0B', vignette: 'rgba(0,0,0,0.5)' },
  { at: 0.70, bg: '#14100D', vignette: 'rgba(0,0,0,0.55)' },
  { at: 1.00, bg: '#0A0A0B', vignette: 'rgba(0,0,0,0.7)' },
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
      className="fixed inset-0 pointer-events-none -z-20 transition-colors duration-700 bg-[#0A0A0B]"
    />
  );
}
