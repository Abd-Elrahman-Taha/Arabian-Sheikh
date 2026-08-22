import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { gsap } from 'gsap';
import BakhoorSmoke from './BakhoorSmoke';
import ArabianLogo from '../common/ArabianLogo';
import performanceManager from '../../utils/performanceManager';

/**
 * ArabianIntro Component
 *
 * Cinematic brand prologue on initial load:
 * - 3D Bakhoor incense smoke plumes
 * - Radiant Arabian Sheikh royal crest with gold glint
 * - Smooth fade into the website at 3.2s
 * - Instant Skip button in top right
 */
export default function ArabianIntro({ onComplete }) {
  const containerRef = useRef(null);
  const smokeContainerRef = useRef(null);
  const logoWrapperRef = useRef(null);
  const [isFinished, setIsFinished] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setReducedMotion(true);
      setIsFinished(true);
      onComplete?.();
    }
  }, [onComplete]);

  const handleSkip = () => {
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.out',
        onComplete: () => {
          setIsFinished(true);
          onComplete?.();
        },
      });
    } else {
      setIsFinished(true);
      onComplete?.();
    }
  };

  useEffect(() => {
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsFinished(true);
          onComplete?.();
        },
      });

      // 0.0s -> 0.7s: Smoke & Background fade-in
      tl.fromTo(
        smokeContainerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.7, ease: 'power2.out' },
        0
      );

      // 0.2s -> 1.4s: Royal Logo reveal with scale & golden glow
      tl.fromTo(
        logoWrapperRef.current,
        { opacity: 0, scale: 0.88, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power3.out' },
        0.2
      );

      // 2.5s -> 3.2s: Dissolve curtain into homepage (total ~3.2 sec)
      tl.to(
        containerRef.current,
        {
          opacity: 0,
          scale: 1.03,
          duration: 0.7,
          ease: 'power2.inOut',
        },
        2.5
      );
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [reducedMotion, onComplete]);

  if (isFinished || reducedMotion) {
    return null;
  }

  const dpr = performanceManager.getOptimalDpr(1.5);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] select-none overflow-hidden bg-[#0B0A08] flex items-center justify-center"
      aria-label="Arabian Sheikh Royal Prologue"
    >
      {/* 3D Bakhoor Incense Smoke Layer */}
      <div
        ref={smokeContainerRef}
        className="absolute inset-0 z-0 bg-radial from-[#21130D]/60 via-[#21130D]/90 to-[#0B0A08]"
        style={{ opacity: 0 }}
      >
        <Canvas
          camera={{
            position: [0, 0, 500],
            fov: 55,
            near: 1,
            far: 3000,
          }}
          dpr={[1, dpr]}
          gl={{
            antialias: performanceManager.tier !== 'low',
            alpha: true,
            powerPreference: 'high-performance',
          }}
        >
          {/* Warm Amber Incense Lighting */}
          <ambientLight intensity={1.8} color="#F3E6D0" />
          <directionalLight
            position={[100, 300, 150]}
            intensity={2.4}
            color="#D4AF37"
          />
          <pointLight
            position={[0, -60, -80]}
            intensity={4.2}
            distance={850}
            color="#D4AF37"
          />

          <Suspense fallback={null}>
            <BakhoorSmoke visible={true} opacity={0.45} />
          </Suspense>
        </Canvas>
      </div>

      {/* Central Official Brand Logo */}
      <div
        ref={logoWrapperRef}
        className="relative z-10 flex flex-col items-center justify-center text-center px-4 pointer-events-none"
      >
        <ArabianLogo
          variant="full"
          size="hero"
          showSubtitle={true}
          subtitle="أربيان شيخ"
        />

        {/* Subtle Ambient Radial Light behind logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.22)_0%,rgba(140,109,55,0.08)_50%,transparent_75%)] blur-3xl pointer-events-none -z-10" />
      </div>

      {/* Skip Button */}
      <div className="absolute top-6 right-6 z-[100000] pointer-events-auto">
        <button
          type="button"
          onClick={handleSkip}
          className="group flex items-center gap-2 rounded-full border border-[#D4AF37]/50 bg-black/60 px-5 py-2 text-xs font-cinzel tracking-[0.25em] uppercase text-[#F3E6D0] backdrop-blur-md transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black shadow-2xl focus:outline-none cursor-pointer"
        >
          <span>Skip</span>
        </button>
      </div>
    </div>
  );
}
