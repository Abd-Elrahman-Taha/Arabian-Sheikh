import React, { useRef, useEffect } from 'react';

/**
 * BackgroundAtmosphere Component
 * 
 * Sits BEHIND all content (z-0 / pointer-events-none).
 * Features:
 * - Subtle, delicate twinkling celestial stars (light, not too many)
 * - Soft diffuse ethereal smoke/mist curling slowly in the background
 * - 60fps performance with auto-pause when off-screen
 */
export default function BackgroundAtmosphere({
  starCount = 28,
  smokeIntensity = 0.5,
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

    // Star Class
    class Star {
      constructor() {
        this.reset(true);
      }

      reset(randomize = false) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5 + 0.6;
        this.baseAlpha = Math.random() * 0.4 + 0.2;
        this.twinkleSpeed = Math.random() * 0.02 + 0.008;
        this.twinkleVal = randomize ? Math.random() * Math.PI * 2 : 0;
        this.vx = (Math.random() - 0.5) * 0.15;
        this.vy = -(Math.random() * 0.15 + 0.05);
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.twinkleVal += this.twinkleSpeed;

        if (this.y < -10) this.y = height + 10;
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
      }

      draw(context) {
        const currentAlpha = this.baseAlpha + Math.sin(this.twinkleVal) * 0.3;
        const alpha = Math.max(0.05, Math.min(0.85, currentAlpha));

        context.save();
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fillStyle = `rgba(245, 230, 195, ${alpha})`;
        context.shadowBlur = this.size * 5;
        context.shadowColor = 'rgba(210, 165, 95, 0.6)';
        context.fill();

        // Delicate 4-point sparkle for prominent stars
        if (this.size > 1.4 && alpha > 0.4) {
          const ray = this.size * 3;
          context.strokeStyle = `rgba(255, 248, 230, ${alpha * 0.5})`;
          context.lineWidth = 0.6;
          context.beginPath();
          context.moveTo(this.x - ray, this.y);
          context.lineTo(this.x + ray, this.y);
          context.moveTo(this.x, this.y - ray);
          context.lineTo(this.x, this.y + ray);
          context.stroke();
        }
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
        this.radius = Math.random() * 80 + 60;
        this.growth = Math.random() * 0.2 + 0.1;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = -(Math.random() * 0.4 + 0.25);
        this.maxLife = Math.random() * 260 + 200;
        this.life = randomize ? Math.random() * this.maxLife : 0;
        this.angle = Math.random() * Math.PI * 2;
        this.angularSpeed = (Math.random() - 0.5) * 0.005;
      }

      update() {
        this.life++;
        this.x += this.vx + Math.sin(this.life * 0.015) * 0.6;
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
        grad.addColorStop(0, `rgba(235, 215, 185, ${alpha})`);
        grad.addColorStop(0.5, `rgba(210, 175, 125, ${alpha * 0.4})`);
        grad.addColorStop(1, 'rgba(19, 12, 5, 0)');

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
      const puffCount = 12; // Light and subtle
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

        // Draw twinkling stars
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
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-0 ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
