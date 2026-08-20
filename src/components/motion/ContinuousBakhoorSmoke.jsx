import React, { useRef, useEffect } from 'react';
import performanceManager from '../../utils/performanceManager';

/**
 * High-performance 60fps organic incense/Bakhoor smoke simulator.
 * Produces continuous rising, curling, expanding, and fading smoke plumes
 * Auto-pauses when off-screen or tab hidden, with adaptive particle count.
 */
export default function ContinuousBakhoorSmoke({
  originX = 0.5,
  originY = 0.85,
  smokeIntensity = 1.0,
  tint = '#D4AF37',
  className = ''
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);
  const particlesRef = useRef([]);
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

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    class SmokeParticle {
      constructor(ox, oy) {
        this.reset(ox, oy, true);
      }

      reset(ox, oy, randomize = false) {
        this.x = ox + (Math.random() - 0.5) * 16;
        this.y = oy + (Math.random() - 0.5) * 10;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = -(Math.random() * 1.1 + 0.7) * smokeIntensity;
        this.size = Math.random() * 8 + 6;
        this.maxSize = Math.random() * 45 + 35;
        this.life = randomize ? Math.random() : 0;
        this.maxLife = Math.random() * 140 + 100;
        this.curlSpeed = (Math.random() - 0.5) * 0.045;
        this.curlAngle = Math.random() * Math.PI * 2;
        this.wobble = Math.random() * 0.35 + 0.15;
      }

      update(ox, oy) {
        this.life += 1;
        if (this.life > this.maxLife) {
          this.reset(ox, oy);
          return;
        }

        const progress = this.life / this.maxLife;
        this.size = 6 + (this.maxSize - 6) * Math.pow(progress, 0.75);

        this.curlAngle += this.curlSpeed;
        this.x += this.vx + Math.sin(this.curlAngle) * this.wobble;
        this.y += this.vy * (1 - progress * 0.3);

        this.vx += (Math.random() - 0.5) * 0.04;
      }

      draw(context) {
        const progress = this.life / this.maxLife;
        let alpha = 0;
        if (progress < 0.2) {
          alpha = (progress / 0.2) * 0.18;
        } else {
          alpha = (1 - (progress - 0.2) / 0.8) * 0.18;
        }

        alpha = Math.max(0, Math.min(0.25, alpha * smokeIntensity));
        if (alpha <= 0.005) return;

        context.save();
        context.translate(this.x, this.y);

        const grad = context.createRadialGradient(0, 0, 0, 0, 0, this.size);
        grad.addColorStop(0, `rgba(243, 230, 208, ${alpha * 1.2})`);
        grad.addColorStop(0.35, `rgba(212, 175, 55, ${alpha * 0.6})`);
        grad.addColorStop(0.7, `rgba(58, 33, 22, ${alpha * 0.3})`);
        grad.addColorStop(1, 'rgba(11, 10, 8, 0)');

        context.fillStyle = grad;
        context.beginPath();
        context.arc(0, 0, this.size, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
    }

    // Adaptive particle count
    let particleCount = 32;
    if (performanceManager.tier === 'low') {
      particleCount = 14;
    } else if (performanceManager.tier === 'balanced' || performanceManager.isMobile) {
      particleCount = 22;
    }

    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new SmokeParticle(width * originX, height * originY));
    }
    particlesRef.current = particles;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    let lastFrame = 0;
    const render = (time) => {
      animFrameRef.current = requestAnimationFrame(render);

      if (!isVisibleRef.current || !performanceManager.isTabVisible || !ctx) return;

      if (performanceManager.tier === 'low' && time - lastFrame < 30) return;
      lastFrame = time;

      ctx.clearRect(0, 0, width, height);
      const currentOx = width * originX;
      const currentOy = height * originY;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update(currentOx, currentOy);
        p.draw(ctx);
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) observer.disconnect();
    };
  }, [originX, originY, smokeIntensity, tint]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-0 ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
