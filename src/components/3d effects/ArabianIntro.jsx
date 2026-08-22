import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { gsap } from 'gsap';
import BakhoorSmoke from './BakhoorSmoke';
import ArabianLogo from '../common/ArabianLogo';
import performanceManager from '../../utils/performanceManager';
import mobileVideo from '../../assets/video.mp4';
import desktopVideo from '../../assets/video2.mp4';

/**
 * ArabianIntro Component
 *
 * Cinematic brand prologue:
 * - Plays responsive video (video.mp4 on mobile, video2.mp4 on desktop)
 * - Smoothly fades out the video as 3D Bakhoor incense smoke and royal Arabic logo emerge
 * - Linger with golden radiance, then dissolves into the homepage
 * - Instant Skip button in top right
 */
export default function ArabianIntro({ onComplete }) {
  const containerRef = useRef(null);
  const videoContainerRef = useRef(null);
  const videoRef = useRef(null);
  const smokeContainerRef = useRef(null);
  const logoWrapperRef = useRef(null);

  const [isFinished, setIsFinished] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [transitionTriggered, setTransitionTriggered] = useState(false);

  // Screen resize detection for video resolution
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Motion reduction check
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setReducedMotion(true);
      setIsFinished(true);
      onComplete?.();
    }
  }, [onComplete]);

  // Handle Skip Button Click
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

  // Trigger smooth transition from video to smoke + logo
  const triggerLogoTransition = () => {
    if (transitionTriggered) return;
    setTransitionTriggered(true);

    const tl = gsap.timeline({
      onComplete: () => {
        setIsFinished(true);
        onComplete?.();
      },
    });

    // 1. Video smoothly fades out (0.0s -> 1.0s)
    if (videoContainerRef.current) {
      tl.to(
        videoContainerRef.current,
        {
          opacity: 0,
          duration: 1.0,
          ease: 'power2.inOut',
        },
        0
      );
    }

    // 2. 3D Smoke fades in simultaneously (0.1s -> 1.1s)
    if (smokeContainerRef.current) {
      tl.to(
        smokeContainerRef.current,
        {
          opacity: 1,
          duration: 1.1,
          ease: 'power2.out',
        },
        0.1
      );
    }

    // 3. Royal Arabic Logo reveals with elegant scale & golden glow (0.3s -> 1.5s)
    if (logoWrapperRef.current) {
      tl.fromTo(
        logoWrapperRef.current,
        { opacity: 0, scale: 0.88, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power3.out' },
        0.3
      );
    }

    // 4. Linger on logo & smoke, then dissolve into homepage (2.6s -> 3.4s)
    if (containerRef.current) {
      tl.to(
        containerRef.current,
        {
          opacity: 0,
          scale: 1.02,
          duration: 0.8,
          ease: 'power2.inOut',
        },
        2.6
      );
    }
  };

  // Video time tracking to trigger fade-out before video ends
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || transitionTriggered) return;

    // Trigger transition 1.2 seconds before video ends
    if (video.duration && video.currentTime >= video.duration - 1.2) {
      triggerLogoTransition();
    }
  };

  const handleVideoEnded = () => {
    if (!transitionTriggered) {
      triggerLogoTransition();
    }
  };

  // Safety fallback if video fails to play or loads slowly
  useEffect(() => {
    if (reducedMotion) return;

    const safetyTimer = setTimeout(() => {
      if (!transitionTriggered) {
        triggerLogoTransition();
      }
    }, 7000); // 7s maximum wait safety threshold

    return () => clearTimeout(safetyTimer);
  }, [transitionTriggered, reducedMotion]);

  if (isFinished || reducedMotion) {
    return null;
  }

  const dpr = performanceManager.getOptimalDpr(1.5);
  const activeVideoSrc = isMobile ? mobileVideo : desktopVideo;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] select-none overflow-hidden bg-[#0B0A08] flex items-center justify-center"
      aria-label="Arabian Sheikh Royal Prologue"
    >
      {/* 1. Responsive Cinematic Video Layer */}
      <div
        ref={videoContainerRef}
        className="absolute inset-0 z-10 overflow-hidden bg-black flex items-center justify-center"
      >
        <video
          ref={videoRef}
          key={isMobile ? 'mobile-video' : 'desktop-video'}
          src={activeVideoSrc}
          autoPlay
          muted
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
          onError={() => triggerLogoTransition()}
          className="w-full h-full object-cover filter brightness-100"
        />
        {/* Soft Dark Vignette on Video */}
        <div className="absolute inset-0 bg-radial-vignette opacity-50 pointer-events-none" />
      </div>

      {/* 2. 3D Bakhoor Incense Smoke Layer */}
      <div
        ref={smokeContainerRef}
        className="absolute inset-0 z-20 bg-radial from-[#21130D]/60 via-[#21130D]/90 to-[#0B0A08] pointer-events-none"
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

      {/* 3. Central Official Brand Logo with Arabic Subtitle */}
      <div
        ref={logoWrapperRef}
        className="relative z-30 flex flex-col items-center justify-center text-center px-4 pointer-events-none"
        style={{ opacity: 0 }}
      >
        <ArabianLogo
          variant="full"
          size="hero"
          showSubtitle={true}
          subtitle="أربيان شيخ"
        />

        {/* Subtle Ambient Radial Light behind logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.25)_0%,rgba(140,109,55,0.08)_50%,transparent_75%)] blur-3xl pointer-events-none -z-10" />
      </div>

      {/* 4. Instant Skip Button */}
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
