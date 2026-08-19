import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { gsap } from "gsap";
import BakhoorSmoke from "./BakhoorSmoke";

/**
 * ArabianIntro Component
 *
 * Standalone cinematic Bakhoor smoke intro effect.
 * Plays immediately upon page load for ~3.5s, smoothly fades out over 1.3s (ending at ~4.8s),
 * and completely unmounts from the DOM to release all GPU/WebGL resources.
 */
export default function ArabianIntro({ onComplete }) {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
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

  // Master GSAP Intro Timeline (0.0s -> 3.5s -> 4.8s)
  useEffect(() => {
    if (reducedMotion || isFinished) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsFinished(true);
          onComplete?.();
        },
      });

      timelineRef.current = tl;

      // 0.0s -> 0.7s: Smooth initial fade-in of the smoke atmosphere
      tl.fromTo(
        containerRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
        },
        0
      );

      // 0.7s -> 3.5s: Smoke is visible, actively moving, swirling and rising

      // 3.5s -> 4.8s: Smooth cinematic fade-out / dissolve
      tl.to(
        containerRef.current,
        {
          opacity: 0,
          duration: 1.3,
          ease: "power2.inOut",
        },
        3.5
      );
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [reducedMotion, isFinished, onComplete]);

  // Graceful user skip handler
  const handleSkip = () => {
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

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

  // Do not render anything once finished or if reduced motion is enabled
  if (isFinished || reducedMotion) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] pointer-events-none select-none overflow-hidden bg-radial from-[#130C05]/40 via-[#130C05]/75 to-[#0B0602]/95 backdrop-blur-[2px]"
      style={{ opacity: 0 }}
      aria-label="Arabian Bakhoor Smoke Intro"
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

      {/* Subtle Central Brand Reveal in the Smoke */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 animate-fade-in opacity-80">
        <div className="w-16 h-20 sm:w-20 sm:h-28 mb-3 filter drop-shadow-[0_0_25px_rgba(210,165,95,0.6)]">
          <img
            src="/arabian-sheikh-logo.svg"
            alt="Arabian Sheikh Crest"
            className="w-full h-full object-contain"
          />
        </div>
        <span className="font-cinzel text-lg sm:text-2xl font-bold tracking-[0.3em] text-[#EADED2] drop-shadow-lg">
          ARABIAN SHEIKH
        </span>
        <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.45em] text-[#D2A55F] font-sans mt-1">
          Haute Parfumerie Arabe
        </span>
      </div>

      {/* Elegant Minimalist Skip Button */}
      <div className="absolute top-6 right-6 z-[10000] pointer-events-auto">
        <button
          type="button"
          onClick={handleSkip}
          className="group flex items-center gap-2 rounded-full border border-[#D2A55F]/40 bg-[#130C05]/60 px-4 py-1.5 text-xs font-cinzel tracking-[0.25em] uppercase text-[#EADED2] backdrop-blur-md transition-all duration-300 hover:border-[#D2A55F] hover:bg-[#D2A55F]/20 hover:text-[#FFF5EB] focus:outline-none focus:ring-1 focus:ring-[#D2A55F]"
          title="Skip Intro"
        >
          <span>Skip</span>
        </button>
      </div>
    </div>
  );
}