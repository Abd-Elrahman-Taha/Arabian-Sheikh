import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { useTranslation } from '../../i18n/LanguageContext';

export default function LuxuryPreloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const curtainRef = useRef(null);
  const contentRef = useRef(null);
  const logoRef = useRef(null);
  const { language } = useTranslation();
  const isArabic = language === 'ar';

  useEffect(() => {
    // Progress counter animation
    const tl = gsap.timeline({
      onComplete: () => {
        // Exit animation
        const exitTl = gsap.timeline({
          onComplete: () => {
            if (onComplete) onComplete();
          }
        });

        exitTl.to(contentRef.current, {
          opacity: 0,
          y: -20,
          duration: 0.6,
          ease: 'power2.in'
        });

        exitTl.to(curtainRef.current, {
          yPercent: -100,
          duration: 0.9,
          ease: 'power4.inOut'
        }, '-=0.2');
      }
    });

    const progressObj = { value: 0 };
    tl.to(progressObj, {
      value: 100,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate: () => {
        setProgress(Math.floor(progressObj.value));
      }
    });

    // Logo entrance
    gsap.fromTo(
      logoRef.current,
      { opacity: 0, scale: 0.92, y: 15 },
      { opacity: 1, scale: 1, y: 0, duration: 1.0, ease: 'power3.out' }
    );
  }, [onComplete]);

  return (
    <div
      ref={curtainRef}
      className="fixed inset-0 z-[10000] bg-[#050505] flex flex-col items-center justify-center select-none overflow-hidden"
    >
      {/* Subtle Warm Spotlight */}
      <div className="absolute w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle_at_center,rgba(201,161,92,0.12)_0%,transparent_70%)] blur-3xl pointer-events-none" />

      {/* Main Content */}
      <div ref={contentRef} className="relative z-10 flex flex-col items-center text-center space-y-6 px-6">
        
        {/* Brand Emblem / Monogram */}
        <div ref={logoRef} className="space-y-2">
          <div className="text-4xl sm:text-5xl font-arabic font-bold text-[#F4F1EA] tracking-wide">
            سَـراب
          </div>
          <div className="text-[11px] font-sans font-extrabold uppercase tracking-[0.35em] text-[#C9A15C]">
            SARAB HAUTE PARFUMERIE
          </div>
          <div className="text-[9px] font-sans text-[#8E8880] tracking-[0.25em] uppercase">
            PARIS • RIYADH • DUBAI
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-48 sm:w-64 h-[1.5px] bg-white/[0.08] relative overflow-hidden rounded-full mt-4">
          <div
            className="h-full bg-gradient-to-r from-[#8C6A32] via-[#C9A15C] to-[#E6C587] transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Counter & Status */}
        <div className="flex items-center justify-between w-48 sm:w-64 text-[10px] font-mono text-[#8E8880] tracking-widest pt-1">
          <span>{isArabic ? 'جاري تجهيز الخزينة' : 'INITIALIZING ARCHIVE'}</span>
          <span className="text-[#C9A15C] font-bold">{progress}%</span>
        </div>

      </div>
    </div>
  );
}
