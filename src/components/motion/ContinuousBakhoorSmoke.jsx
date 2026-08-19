import React, { useRef, useEffect } from 'react';

/**
 * ContinuousBakhoorSmoke Component
 * 
 * High-performance 60fps organic incense/Bakhoor smoke simulator.
 * Produces continuous rising, curling, expanding, and fading smoke plumes
 * in an infinite, seamless loop.
 */
export default function ContinuousBakhoorSmoke({
  originX = 0.5,
  originY = 0.85,
  smokeIntensity = 1.0,
  tint = 'cream',
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

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    const tintColors = {
      cream: { r: 245, g: 236, b: 226 },
      golden: { r: 235, g: 205, b: 155 },
      mystic: { r: 220, g: 200, b: 180 }
    }[tint] || { r: 245, g: 236, b: 226 };

    class SmokeParticle {
      constructor(ox, oy) {
        this.reset(ox, oy, true);
      }

      reset(ox, oy, randomizeProgress = false) {
        this.x = ox + (Math.random() - 0.5) * 8;
        this.y = oy;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = -(Math.random() * 1.1 + 0.7) * smokeIntensity;
        this.radius = Math.random() * 10 + 6;
        this.maxRadius = Math.random() * 70 + 50;
        this.growthRate = Math.random() * 0.4 + 0.3;
        this.life = randomizeProgress ? Math.random() : 0;
        this.maxLife = Math.random() * 160 + 130;
        this.age = randomizeProgress ? Math.random() * this.maxLife : 0;
        this.angle = Math.random() * Math.PI * 2;
        this.angularSpeed = (Math.random() - 0.5) * 0.02;
        this.turbulenceFrequency = Math.random() * 0.04 + 0.02;
        this.turbulenceAmplitude = Math.random() * 1.3 + 0.7;
      }

      update(ox, oy) {
        this.age++;
        this.x += this.vx + Math.sin(this.age * this.turbulenceFrequency) * this.turbulenceAmplitude;
        this.y += this.vy;
        this.vy *= 0.992;
        this.radius += this.growthRate;
        this.angle += this.angularSpeed;

        if (this.age >= this.maxLife || this.y < -40) {
          this.reset(ox, oy, false);
        }
      }

      draw(context) {
        const progress = this.age / this.maxLife;
        let alpha = 0;
        if (progress < 0.15) {
          alpha = (progress / 0.15) * 0.25;
        } else {
          alpha = (1 - (progress - 0.15) / 0.85) * 0.25;
        }
        alpha = Math.max(0, Math.min(0.3, alpha * smokeIntensity));

        if (alpha <= 0.005) return;

        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.angle);

        const grad = context.createRadialGradient(0, 0, 0, 0, 0, this.radius);
        grad.addColorStop(0, `rgba(${tintColors.r}, ${tintColors.g}, ${tintColors.b}, ${alpha})`);
        grad.addColorStop(0.5, `rgba(${tintColors.r}, ${tintColors.g}, ${tintColors.b}, ${alpha * 0.4})`);
        grad.addColorStop(1, `rgba(${tintColors.r}, ${tintColors.g}, ${tintColors.b}, 0)`);

        context.fillStyle = grad;
        context.beginPath();
        context.arc(0, 0, this.radius, 0, Math.PI * 2);
        context.fill();

        context.restore();
      }
    }

    const particleCount = 36;
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

    const render = () => {
      if (isVisibleRef.current && ctx) {
        ctx.clearRect(0, 0, width, height);
        const currentOx = width * originX;
        const currentOy = height * originY;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.update(currentOx, currentOy);
          p.draw(ctx);
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
