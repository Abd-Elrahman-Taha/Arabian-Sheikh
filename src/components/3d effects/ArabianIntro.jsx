import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { gsap } from 'gsap';
import BakhoorSmoke from './BakhoorSmoke';
import PalaceDoorCanvas from './PalaceDoorCanvas';
import ArabianLogo from '../common/ArabianLogo';
import { Crown, Sparkles } from 'lucide-react';

/**
 * ArabianIntro Component
 *
 * Interactive 3D Sovereign Palace Door Prologue:
 * 1. Initial Load: 3D Door.glb is facing the camera directly in golden studio light.
 * 2. User clicks on the door or screen:
 *    - Embedded animation plays (doors swing open).
 *    - Camera goes inside (dollies forward into the opening).
 *    - 3D Bakhoor incense smoke plumes swell and billow.
 *    - Door disappears smoothly.
 *    - Arabian Sheikh royal emblem & motto reveals with golden glints.
 *    - Curtain dissolves into the live website.
 */
export default function ArabianIntro({ onComplete }) {
  const containerRef = useRef(null);
  const doorContainerRef = useRef(null);
  const smokeContainerRef = useRef(null);
  const logoWrapperRef = useRef(null);
  const promptRef = useRef(null);

  const [isOpening, setIsOpening] = useState(false);
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

  // Handle user clicking the door or screen to open
  const handleOpenDoor = () => {
    if (isOpening || isFinished) return;
    setIsOpening(true);

    // Fade out interactive prompt immediately
    if (promptRef.current) {
      gsap.to(promptRef.current, {
        opacity: 0,
        y: 25,
        duration: 0.35,
        ease: 'power2.in'
      });
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsFinished(true);
        onComplete?.();
      }
    });

    // 0.4s -> 1.6s: 3D Bakhoor smoke clouds swell as camera travels inside
    tl.to(
      smokeContainerRef.current,
      {
        opacity: 1,
        duration: 1.2,
        ease: 'power2.out'
      },
      0.4
    );

    // 0.8s -> 1.8s: Door disappears smoothly as camera enters
    tl.to(
      doorContainerRef.current,
      {
        opacity: 0,
        scale: 1.15,
        duration: 1.0,
        ease: 'power2.inOut'
      },
      0.8
    );

    // 1.4s -> 2.6s: Royal Arabian Sheikh logo emerges with golden glow
    tl.fromTo(
      logoWrapperRef.current,
      { opacity: 0, scale: 0.88, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power3.out' },
      1.4
    );

    // 2.8s -> 3.6s: Dissolve curtain into homepage
    tl.to(
      containerRef.current,
      {
        opacity: 0,
        scale: 1.04,
        duration: 0.8,
        ease: 'power2.inOut'
      },
      2.8
    );
  };

  const handleSkip = () => {
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.out',
        onComplete: () => {
          setIsFinished(true);
          onComplete?.();
        }
      });
    } else {
      setIsFinished(true);
      onComplete?.();
    }
  };

  if (isFinished || reducedMotion) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] select-none overflow-hidden bg-[#0B0A08] flex items-center justify-center cursor-pointer"
      onClick={handleOpenDoor}
      aria-label="Arabian Sheikh Royal Prologue - Click to enter"
    >
      {/* 1. 3D Palace Door Canvas Layer (Faces camera directly) */}
      <div
        ref={doorContainerRef}
        className="absolute inset-0 z-10 flex items-center justify-center pointer-events-auto"
      >
        <PalaceDoorCanvas isOpening={isOpening} />
      </div>

      {/* 2. 3D Bakhoor Incense Smoke Layer (Swells as door opens and camera enters) */}
      <div
        ref={smokeContainerRef}
        className="absolute inset-0 z-20 bg-radial from-[#21130D]/70 via-[#21130D]/90 to-[#0B0A08] pointer-events-none"
        style={{ opacity: 0 }}
      >
        <Canvas
          camera={{
            position: [0, 0, 500],
            fov: 55,
            near: 1,
            far: 3000,
          }}
          dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
        >
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
            <BakhoorSmoke visible={true} opacity={0.55} />
          </Suspense>
        </Canvas>
      </div>

      {/* 3. Central Official Brand Logo Reveal (Appears amidst the smoke) */}
      <div
        ref={logoWrapperRef}
        className="relative z-30 flex flex-col items-center justify-center text-center px-4 pointer-events-none"
        style={{ opacity: 0 }}
      >
        <ArabianLogo
          variant="full"
          size="hero"
          showSubtitle={true}
          subtitle="The Art of Modern Arabian Perfumery • Andalusia"
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.25)_0%,rgba(140,109,55,0.08)_50%,transparent_75%)] blur-3xl pointer-events-none -z-10" />
      </div>

      {/* 4. Interactive Click-to-Open Callout Prompt */}
      {!isOpening && (
        <div
          ref={promptRef}
          className="absolute bottom-10 z-40 flex flex-col items-center gap-3.5 pointer-events-auto cursor-pointer animate-fade-in"
          onClick={handleOpenDoor}
        >
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#0B0A08]/90 border border-[#D4AF37]/60 shadow-[0_0_25px_rgba(212,175,55,0.4)] backdrop-blur-md hover:bg-[#D4AF37] hover:text-black transition-all duration-300 group">
            <Crown className="w-4 h-4 text-[#D4AF37] group-hover:text-black transition-colors" />
            <span className="font-cinzel text-xs uppercase tracking-[0.25em] font-bold text-[#F3E6D0] group-hover:text-black transition-colors">
              Click to Enter The Sovereign Palace
            </span>
            <Sparkles className="w-4 h-4 text-[#F2D675] group-hover:text-black animate-pulse" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D8BE99]/80 animate-pulse">
            Tap anywhere on the door to unlock
          </span>
        </div>
      )}

      {/* 5. Skip Button */}
      <div className="absolute top-6 right-6 z-[100000] pointer-events-auto">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="group flex items-center gap-2 rounded-full border border-[#D4AF37]/50 bg-black/60 px-5 py-2 text-xs font-cinzel tracking-[0.25em] uppercase text-[#F3E6D0] backdrop-blur-md transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black shadow-2xl focus:outline-none cursor-pointer"
        >
          <span>Skip</span>
        </button>
      </div>
    </div>
  );
}
