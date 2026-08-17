import React, { useEffect, useRef } from 'react';
import { useRouter } from '../../router/RouterContext';
import gsap from 'gsap';

export default function PageTransition({ children }) {
  const { currentPath } = useRouter();
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Fast, elegant page transition (0.45s)
    gsap.fromTo(
      containerRef.current,
      {
        opacity: 0,
        y: 16
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: 'power2.out'
      }
    );

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentPath]);

  return (
    <div ref={containerRef} className="w-full flex-1">
      {children}
    </div>
  );
}
