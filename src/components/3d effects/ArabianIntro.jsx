import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { gsap } from "gsap";
import BakhoorSmoke from "./BakhoorSmoke";
import ArabianLogo from "../common/ArabianLogo";

/**
 * ArabianIntro Component
 *
 * Cinematic 3D Bakhoor Smoke Atmospheric Intro:
 * 1. 3D interactive billowing incense smoke curls with palace ambient lighting.
 * 2. Majestic Royal Crest reveals "ARABIAN SHEIKH" and under it "اربيان شيخ".
 * 3. Smoothly dissolves to reveal the website, with immediate Skip capability.
 */
export default function ArabianIntro({ onComplete }) {
  const containerRef = useRef(null);
  const smokeContainerRef = useRef(null);
  const [isFinished, setIsFinished] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check for prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setReducedMotion(true);
      setIsFinished(true);
      onComplete?.();
    }
  }, [onComplete]);

  // Skip Intro immediately
  const handleSkip = () => {
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
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

  // Smoke Stage GSAP Animation Timeline
  useEffect(() => {
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsFinished(true);
          onComplete?.();
        },
      });

      // 0.0s -> 0.8s: Smooth fade-in of smoke & crest
      tl.fromTo(
        smokeContainerRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
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
  }, [reducedMotion, onComplete]);

  if (isFinished || reducedMotion) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] select-none overflow-hidden bg-black"
      aria-label="Arabian Sheikh Intro Experience"
    >
      {/* =========================================================================
          3D BAKHOOR SMOKE & BRAND CREST REVEAL
          ========================================================================= */}
      <div
        ref={smokeContainerRef}
        className="absolute inset-0 z-10 bg-radial from-[#130C05]/40 via-[#130C05]/75 to-[#0B0602]/95 backdrop-blur-[2px]"
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
            <BakhoorSmoke visible={true} opacity={0.38} />
          </Suspense>
        </Canvas>

        {/* Central Brand Reveal in the Smoke */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 animate-fade-in opacity-95">
          <ArabianLogo
            variant="full"
            size="xl"
            showArabic={true}
            arabicText="اربيان شيخ"
            showSubtitle={false}
          />
        </div>
      </div>

      {/* =========================================================================
          GLOBAL SKIP BUTTON (Always available in top-right)
          ========================================================================= */}
      <div className="absolute top-6 right-6 z-[10000] pointer-events-auto">
        <button
          type="button"
          onClick={handleSkip}
          className="group flex items-center gap-2 rounded-full border border-[#D2A55F]/50 bg-[#130C05]/70 px-5 py-2 text-xs font-cinzel tracking-[0.25em] uppercase text-[#EADED2] backdrop-blur-md transition-all duration-300 hover:border-[#D2A55F] hover:bg-[#D2A55F]/25 hover:text-[#FFF5EB] shadow-2xl focus:outline-none focus:ring-1 focus:ring-[#D2A55F] cursor-pointer"
          title="Skip Intro"
        >
          <span>Skip</span>
        </button>
      </div>
    </div>
  );
}