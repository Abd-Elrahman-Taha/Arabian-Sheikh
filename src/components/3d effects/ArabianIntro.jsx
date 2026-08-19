import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { gsap } from "gsap";
import BakhoorSmoke from "./BakhoorSmoke";
import ArabianLogo from "../common/ArabianLogo";
import introVideo from "../../assets/intro.mp4";

/**
 * ArabianIntro Component
 *
 * Cinematic multi-stage intro sequence:
 * 1. Stage 1 (Video): High-quality intro video plays first with sleek Skip button.
 * 2. Stage 2 (Smoke): When video ends (or on skip), transitions seamlessly to the 3D Bakhoor smoke atmosphere.
 * 3. Stage 3 (Complete): Smoothly dissolves to reveal the website, then unmounts to free GPU resources.
 */
export default function ArabianIntro({ onComplete }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const smokeContainerRef = useRef(null);
  const [stage, setStage] = useState('video'); // 'video' | 'smoke' | 'finished'
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check for prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setReducedMotion(true);
      setStage('finished');
      onComplete?.();
    }
  }, [onComplete]);

  // Transition from Video to Smoke
  const transitionToSmoke = () => {
    if (stage !== 'video') return;
    
    // Pause video
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch (e) {
        // ignore
      }
    }

    setStage('smoke');
  };

  // Skip Everything immediately
  const handleFullSkip = () => {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch (e) {
        // ignore
      }
    }

    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => {
          setStage('finished');
          onComplete?.();
        },
      });
    } else {
      setStage('finished');
      onComplete?.();
    }
  };

  // Smoke Stage GSAP Animation Timeline
  useEffect(() => {
    if (stage !== 'smoke' || reducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setStage('finished');
          onComplete?.();
        },
      });

      // 0.0s -> 0.6s: Smooth fade-in of smoke & crest
      tl.fromTo(
        smokeContainerRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
        },
        0
      );

      // 3.0s -> 4.2s: Smooth dissolve into website
      tl.to(
        containerRef.current,
        {
          opacity: 0,
          duration: 1.2,
          ease: "power2.inOut",
        },
        3.0
      );
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [stage, reducedMotion, onComplete]);

  if (stage === 'finished' || reducedMotion) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] select-none overflow-hidden bg-black"
      aria-label="Arabian Sheikh Intro Experience"
    >
      {/* =========================================================================
          STAGE 1: HIGH QUALITY INTRO VIDEO
          ========================================================================= */}
      {stage === 'video' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black animate-fade-in">
          <video
            ref={videoRef}
            src={introVideo || "/intro.mp4"}
            autoPlay
            muted
            playsInline
            onEnded={transitionToSmoke}
            onError={transitionToSmoke}
            className="w-full h-full object-cover object-center"
          />
        </div>
      )}

      {/* =========================================================================
          STAGE 2: 3D BAKHOOR SMOKE & BRAND CREST REVEAL
          ========================================================================= */}
      {stage === 'smoke' && (
        <div
          ref={smokeContainerRef}
          className="absolute inset-0 z-10 pointer-events-none bg-radial from-[#130C05]/40 via-[#130C05]/75 to-[#0B0602]/95 backdrop-blur-[2px]"
          style={{ opacity: 0 }}
        >
          {/* Three.js Canvas */}
          <Canvas
            camera={{
              position: [0, 0, 500],
              fov: 55,
              near: 1,
              far: 3000,
            }}
            dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2)]}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
            }}
          >
            {/* Warm Palace & Incense Lighting */}
            <ambientLight intensity={1.6} color="#F5ECE2" />
            <directionalLight
              position={[100, 300, 150]}
              intensity={2.2}
              color="#FCEFD5"
            />
            <pointLight
              position={[0, -60, -80]}
              intensity={3.8}
              distance={850}
              color="#D2A55F"
            />

            <Suspense fallback={null}>
              <BakhoorSmoke visible={true} opacity={0.35} />
            </Suspense>
          </Canvas>

          {/* Central Brand Reveal in the Smoke */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 animate-fade-in opacity-95">
            <ArabianLogo
              variant="full"
              size="xl"
              showArabic={true}
              showSubtitle={false}
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          GLOBAL SKIP BUTTON (Always available in top-right)
          ========================================================================= */}
      <div className="absolute top-6 right-6 z-[10000] pointer-events-auto">
        <button
          type="button"
          onClick={stage === 'video' ? transitionToSmoke : handleFullSkip}
          className="group flex items-center gap-2 rounded-full border border-[#D2A55F]/50 bg-[#130C05]/70 px-5 py-2 text-xs font-cinzel tracking-[0.25em] uppercase text-[#EADED2] backdrop-blur-md transition-all duration-300 hover:border-[#D2A55F] hover:bg-[#D2A55F]/25 hover:text-[#FFF5EB] shadow-2xl focus:outline-none focus:ring-1 focus:ring-[#D2A55F] cursor-pointer"
          title="Skip to next step"
        >
          <span>Skip</span>
        </button>
      </div>
    </div>
  );
}