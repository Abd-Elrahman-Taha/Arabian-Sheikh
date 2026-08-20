import React, { useRef, useEffect } from 'react';
import performanceManager from '../../utils/performanceManager';

/**
 * BackgroundAtmosphere Component
 * 
 * Sits in the atmosphere (pointer-events-none).
 * Features:
 * - Radiant, luminous twinkling celestial stars with diamond sparkle rays and glowing halos
 * - Warm golden and crystalline diamond white stars with dynamic shine pulses
 * - Auto-pauses when off-screen or tab is hidden to preserve battery & 60fps performance
 * - Adaptive particle count based on device hardware tier
 */
export default function BackgroundAtmosphere({
  starCount = 30,
  smokeIntensity = 0.08,
  className = ''
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || window.innerHeight);

    // Adaptive star count for low/balanced devices
    let effectiveStarCount = starCount;
    if (performanceManager.tier === 'low') {
      effectiveStarCount = Math.min(starCount, 12);
    } else if (performanceManager.tier === 'balanced' || performanceManager.isMobile) {
      effectiveStarCount = Math.min(starCount, 20);
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || window.innerHeight;
      initElements();
    };

    window.addEventListener('resize', handleResize, { passive: true });

    const STAR_PALETTES = [
      { core: '#F3E6D0', glow: 'rgba(255, 230, 150, 0.95)', ray: 'rgba(255, 245, 220, 0.9)' },
      { core: '#F3E6D0', glow: 'rgba(248, 209, 136, 0.95)', ray: 'rgba(248, 209, 136, 0.85)' },
      { core: '#F2D675', glow: 'rgba(235, 170, 98, 0.9)',  ray: 'rgba(255, 215, 130, 0.85)' },
      { core: '#F3E6D0', glow: 'rgba(180, 86, 37, 0.85)',  ray: 'rgba(255, 235, 180, 0.8)' },
    ];

    class Star {
      constructor() {
        this.reset(true);
      }

      reset(randomize = false) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2.0 + 0.8;
        this.baseAlpha = Math.random() * 0.45 + 0.45;
        this.twinkleSpeed = Math.random() * 0.035 + 0.015;
        this.twinkleVal = randomize ? Math.random() * Math.PI * 2 : 0;
        this.vx = (Math.random() - 0.5) * 0.1;
        this.vy = -(Math.random() * 0.1 + 0.03);
        this.palette = STAR_PALETTES[Math.floor(Math.random() * STAR_PALETTES.length)];
        this.hasRays = performanceManager.tier !== 'low' && Math.random() > 0.5;
        this.rayLength = this.size * (Math.random() * 3.0 + 2.5);
        this.rotation = Math.random() * Math.PI;
        this.rotSpeed = (Math.random() - 0.5) * 0.008;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.twinkleVal += this.twinkleSpeed;
        this.rotation += this.rotSpeed;

        if (this.y < -15) this.y = height + 15;
        if (this.x < -15) this.x = width + 15;
        if (this.x > width + 15) this.x = -15;
      }

      draw(context) {
        const sinVal = (Math.sin(this.twinkleVal) + 1) / 2;
        const shineFactor = Math.pow(sinVal, 1.8);
        const alpha = Math.max(0.2, Math.min(1.0, this.baseAlpha * 0.6 + shineFactor * 0.55));
        const currentSize = this.size * (0.8 + shineFactor * 0.5);

        context.save();
        context.translate(this.x, this.y);

        // 1. Radiant Outer Glow Halo (Only on balanced/high tiers)
        if (performanceManager.tier !== 'low') {
          const glowRadius = currentSize * 4.0;
          const radialGrad = context.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
          radialGrad.addColorStop(0, this.palette.glow);
          radialGrad.addColorStop(0.4, `rgba(235, 170, 98, ${alpha * 0.35})`);
          radialGrad.addColorStop(1, 'rgba(93, 29, 1, 0)');
          context.fillStyle = radialGrad;
          context.beginPath();
          context.arc(0, 0, glowRadius, 0, Math.PI * 2);
          context.fill();
        }

        // 2. Sparkling Diffraction Rays
        if (this.hasRays && shineFactor > 0.4) {
          const rayAlpha = (shineFactor - 0.4) * 1.6 * alpha;
          context.rotate(this.rotation);
          context.strokeStyle = this.palette.ray;
          context.lineWidth = 1.0;
          context.globalAlpha = rayAlpha;

          context.beginPath();
          context.moveTo(-this.rayLength, 0);
          context.lineTo(this.rayLength, 0);
          context.moveTo(0, -this.rayLength);
          context.lineTo(0, this.rayLength);
          context.stroke();
        }

        // 3. Crisp Diamond Core
        context.globalAlpha = alpha;
        context.fillStyle = this.palette.core;
        context.beginPath();
        context.arc(0, 0, currentSize * 0.9, 0, Math.PI * 2);
        context.fill();

        context.restore();
      }
    }

    let stars = [];
    const initElements = () => {
      stars = [];
      for (let i = 0; i < effectiveStarCount; i++) {
        stars.push(new Star());
      }
    };

    initElements();

    // IntersectionObserver to auto-pause when out of viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.01 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Animation Loop with visibility sleep
    let lastRenderTime = 0;
    const animate = (timestamp) => {
      animFrameRef.current = requestAnimationFrame(animate);

      if (!isVisibleRef.current || !performanceManager.isTabVisible) return;

      // Throttle background particle frame rate on low/mobile devices
      if (performanceManager.tier === 'low' && timestamp - lastRenderTime < 30) return;
      lastRenderTime = timestamp;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        stars[i].update();
        stars[i].draw(ctx);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [starCount, smokeIntensity]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
      />
    </div>
  );
}
