import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function TextReveal({
  text,
  className = '',
  as: Component = 'h1',
  delay = 0.1,
  duration = 0.8,
  stagger = 0.05
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const words = containerRef.current.querySelectorAll('.reveal-word');
    if (!words.length) return;

    gsap.fromTo(
      words,
      {
        opacity: 0,
        y: 24,
        rotateX: -20
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: duration,
        stagger: stagger,
        delay: delay,
        ease: 'power3.out'
      }
    );
  }, [text, delay, duration, stagger]);

  if (typeof text !== 'string') {
    return <Component className={className}>{text}</Component>;
  }

  const words = text.split(' ');

  return (
    <Component ref={containerRef} className={`${className} overflow-hidden`}>
      {words.map((word, idx) => (
        <span
          key={idx}
          className="reveal-word inline-block mr-[0.25em] will-change-transform"
        >
          {word}
        </span>
      ))}
    </Component>
  );
}
