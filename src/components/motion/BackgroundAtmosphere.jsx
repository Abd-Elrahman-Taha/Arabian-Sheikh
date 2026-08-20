import React, { useRef, useEffect } from 'react';

/**
 * BackgroundAtmosphere Component
 * 
 * Sits in the atmosphere (pointer-events-none).
 * Features:
 * - Radiant, luminous twinkling celestial stars with diamond sparkle rays and glowing halos
 * - Warm golden (#F2D675, #F2D675) and crystalline diamond white (#F3E6D0) stars with dynamic shine pulses
 * - Soft diffuse ethereal desert smoke/mist curling slowly in the background
 * - 60fps performance with auto-pause when off-screen
 */
export default function BackgroundAtmosphere({
  starCount = 30,
  smokeIntensity = 0.1,
  className = ''
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      initElements();
    };

    window.addEventListener('resize', handleResize);

    const STAR_PALETTES = [
      { core: '#F3E6D0', glow: 'rgba(255, 230, 150, 0.95)', ray: 'rgba(255, 245, 220, 0.9)' },
      { core: '#F3E6D0', glow: 'rgba(248, 209, 136, 0.95)', ray: 'rgba(248, 209, 136, 0.85)' },
      { core: '#F2D675', glow: 'rgba(235, 170, 98, 0.9)',  ray: 'rgba(255, 215, 130, 0.85)' },
      { core: '#F3E6D0', glow: 'rgba(180, 86, 37, 0.85)',  ray: 'rgba(255, 235, 180, 0.8)' },
    ];

    // Star Class with dynamic shine, rotation, and lens-flare rays
    class Star {
      constructor() {
        this.reset(true);
      }

      reset(randomize = false) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2.2 + 0.9;
        this.baseAlpha = Math.random() * 0.45 + 0.45; // Higher visibility
        this.twinkleSpeed = Math.random() * 0.035 + 0.015;
        this.twinkleVal = randomize ? Math.random() * Math.PI * 2 : 0;
        this.vx = (Math.random() - 0.5) * 0.12;
        this.vy = -(Math.random() * 0.12 + 0.04);
        this.palette = STAR_PALETTES[Math.floor(Math.random() * STAR_PALETTES.length)];
        this.hasRays = Math.random() > 0.45; // 55% of stars have sparkling diffraction rays
        this.rayLength = this.size * (Math.random() * 3.5 + 3.0);
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
        // Dynamic shine intensity with exponential peak for radiant twinkling
        const sinVal = (Math.sin(this.twinkleVal) + 1) / 2; // 0..1
        const shineFactor = Math.pow(sinVal, 1.8);
        const alpha = Math.max(0.2, Math.min(1.0, this.baseAlpha * 0.6 + shineFactor * 0.55));
        const currentSize = this.size * (0.8 + shineFactor * 0.5);

        context.save();
        context.translate(this.x, this.y);

        // 1. Radiant Outer Glow Halo
        const glowRadius = currentSize * 4.5;
        const radialGrad = context.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
        radialGrad.addColorStop(0, this.palette.glow);
        radialGrad.addColorStop(0.4, `rgba(235, 170, 98, ${alpha * 0.4})`);
        radialGrad.addColorStop(1, 'rgba(93, 29, 1, 0)');
        context.fillStyle = radialGrad;
        context.beginPath();
        context.arc(0, 0, glowRadius, 0, Math.PI * 2);
        context.fill();

        // 2. Shining Diamond Sparkle Rays (4-point or 8-point lens flare)
        if (this.hasRays && alpha > 0.35) {
          context.rotate(this.rotation);
          const rayLen = this.rayLength * (0.7 + shineFactor * 0.6);
          const rayAlpha = alpha * 0.85;

          // Main vertical & horizontal diamond rays
          context.strokeStyle = this.palette.ray.replace(/[\d.]+\)$/, `${rayAlpha})`);
          context.lineWidth = Math.max(0.8, currentSize * 0.45);
          
          context.beginPath();
          context.moveTo(-rayLen, 0);
          context.lineTo(rayLen, 0);
          context.moveTo(0, -rayLen);
          context.lineTo(0, rayLen);
          context.stroke();

          // Diagonal micro-spikes for extra brilliance
          if (this.size > 1.8) {
            const diagLen = rayLen * 0.55;
            context.beginPath();
            context.moveTo(-diagLen, -diagLen);
            context.lineTo(diagLen, diagLen);
            context.moveTo(diagLen, -diagLen);
            context.lineTo(-diagLen, diagLen);
            context.stroke();
          }
        }

        // 3. Crisp Brilliant Star Core
        context.beginPath();
        context.arc(0, 0, Math.max(0.8, currentSize * 0.8), 0, Math.PI * 2);
        context.fillStyle = this.palette.core;
        context.shadowBlur = currentSize * 8;
        context.shadowColor = this.palette.glow;
        context.fill();

        context.restore();
      }
    }

    // Soft Mist / Smoke Puff Class
    class SmokePuff {
      constructor() {
        this.reset(true);
      }

      reset(randomize = false) {
        this.x = Math.random() * width;
        this.y = randomize ? Math.random() * height : height + 60;
        this.radius = Math.random() * 90 + 60;
        this.growth = Math.random() * 0.2 + 0.1;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = -(Math.random() * 0.35 + 0.2);
        this.maxLife = Math.random() * 260 + 200;
        this.life = randomize ? Math.random() * this.maxLife : 0;
        this.angle = Math.random() * Math.PI * 2;
        this.angularSpeed = (Math.random() - 0.5) * 0.004;
      }

      update() {
        this.life++;
        this.x += this.vx + Math.sin(this.life * 0.015) * 0.5;
        this.y += this.vy;
        this.radius += this.growth;
        this.angle += this.angularSpeed;

        if (this.life >= this.maxLife || this.y < -this.radius) {
          this.reset(false);
        }
      }

      draw(context) {
        const progress = this.life / this.maxLife;
        let alpha = 0;
        if (progress < 0.25) {
          alpha = (progress / 0.25) * 0.12;
        } else {
          alpha = (1 - (progress - 0.25) / 0.75) * 0.12;
        }
        alpha = alpha * smokeIntensity;
        if (alpha <= 0.002) return;

        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.angle);

        const grad = context.createRadialGradient(0, 0, 0, 0, 0, this.radius);
        grad.addColorStop(0, `rgba(248, 209, 136, ${alpha})`);
        grad.addColorStop(0.5, `rgba(235, 170, 98, ${alpha * 0.4})`);
        grad.addColorStop(1, 'rgba(93, 29, 1, 0)');

        context.fillStyle = grad;
        context.beginPath();
        context.arc(0, 0, this.radius, 0, Math.PI * 2);
        context.fill();

        context.restore();
      }
    }

    let stars = [];
    let smokePuffs = [];

    function initElements() {
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push(new Star());
      }
      smokePuffs = [];
      const puffCount = 10;
      for (let i = 0; i < puffCount; i++) {
        smokePuffs.push(new SmokePuff());
      }
    }

    initElements();

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const render = () => {
      if (isVisibleRef.current && ctx) {
        ctx.clearRect(0, 0, width, height);

        // Draw soft background smoke mist
        for (let i = 0; i < smokePuffs.length; i++) {
          smokePuffs[i].update();
          smokePuffs[i].draw(ctx);
        }

        // Draw twinkling & shining stars
        for (let i = 0; i < stars.length; i++) {
          stars[i].update();
          stars[i].draw(ctx);
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) observer.disconnect();
    };
  }, [starCount, smokeIntensity]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
