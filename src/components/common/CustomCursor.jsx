import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';

export default function CustomCursor() {
  const { language } = useTranslation();
  const isArabic = language === 'ar';

  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const textRef = useRef(null);

  const [cursorText, setCursorText] = useState('');
  const [cursorType, setCursorType] = useState('default');
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check if device supports touch
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true);
      return;
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let animId;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) setIsVisible(true);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Check cursor data targets under cursor
      const target = e.target.closest('[data-cursor], a, button, [role="button"], input, select');
      if (target) {
        const customType = target.getAttribute('data-cursor');
        if (customType === 'explore') {
          setCursorType('explore');
          setCursorText(isArabic ? 'اكتشف' : 'EXPLORE');
        } else if (customType === 'view') {
          setCursorType('view');
          setCursorText(isArabic ? 'عرض' : 'VIEW');
        } else if (customType === 'play') {
          setCursorType('play');
          setCursorText(isArabic ? 'تشغيل' : 'PLAY');
        } else if (customType === 'fragrance') {
          setCursorType('fragrance');
          setCursorText(isArabic ? 'العطر' : 'SCENT');
        } else {
          setCursorType('hover');
          setCursorText('');
        }
      } else {
        setCursorType('default');
        setCursorText('');
      }
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    const render = () => {
      // Smooth lerp for outer ring
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      animId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(animId);
    };
  }, [isVisible, isArabic]);

  if (isTouchDevice || !isVisible) return null;

  const isExpanded = cursorType !== 'default' && cursorType !== 'hover';
  const isHovered = cursorType === 'hover';

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none">
      {/* Precision Inner Dot */}
      <div
        ref={dotRef}
        className={`absolute -top-1 -left-1 w-2 h-2 rounded-full bg-[#F2D675] transition-opacity duration-200 ${
          isExpanded ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ willChange: 'transform' }}
      />

      {/* Lag Outer Ring / Floating Pill */}
      <div
        ref={ringRef}
        className={`absolute -top-4 -left-4 flex items-center justify-center rounded-full border transition-all duration-300 ${
          isExpanded
            ? 'w-16 h-16 -top-8 -left-8 bg-[#21130D]/90 border-[#D4AF37] shadow-[0_0_20px_rgba(201,161,92,0.45)] backdrop-blur-sm'
            : isHovered
            ? 'w-10 h-10 -top-5 -left-5 bg-[#D4AF37]/15 border-[#D4AF37]/80 scale-110'
            : 'w-8 h-8 bg-transparent border-white/20'
        }`}
        style={{ willChange: 'transform' }}
      >
        {cursorText && (
          <span
            ref={textRef}
            className="text-[10px] font-sans font-bold text-[#F2D675] tracking-wider uppercase select-none animate-fadeIn"
          >
            {cursorText}
          </span>
        )}
      </div>
    </div>
  );
}
