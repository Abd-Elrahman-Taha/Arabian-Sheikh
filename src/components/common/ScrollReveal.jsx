import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * ScrollReveal — wraps children in a smooth entrance element that
 * animates ONCE into view when scrolled into the viewport and stays
 * permanently visible without fading out on subsequent scrolling.
 */
export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 50,
  once = true,
  threshold = 0.1,
  className = '',
  as = 'div',
  style,
  ...rest
}) {
  const prefersReducedMotion = useReducedMotion();
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);

  const directionMap = {
    left:  { x: -distance, y: 0 },
    right: { x: distance,  y: 0 },
    up:    { x: 0, y: distance },
    down:  { x: 0, y: -distance },
  };

  const offset = directionMap[direction] || directionMap.up;

  useEffect(() => {
    if (hasAnimated || prefersReducedMotion || !elementRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.unobserve(entry.target);
          observer.disconnect();
        }
      },
      { threshold: Math.min(threshold, 0.15), rootMargin: '60px 0px' }
    );

    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [hasAnimated, prefersReducedMotion, threshold]);

  if (prefersReducedMotion) {
    const Tag = as;
    return (
      <Tag className={className} style={style} {...rest}>
        {children}
      </Tag>
    );
  }

  const MotionTag = motion.create(as);

  return (
    <MotionTag
      ref={elementRef}
      initial={hasAnimated ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: offset.x, y: offset.y }}
      animate={hasAnimated ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: offset.x, y: offset.y }}
      transition={{
        duration,
        delay: hasAnimated ? delay : 0,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
      style={{
        ...style,
        ...(hasAnimated ? { opacity: 1, transform: 'none' } : {})
      }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

/**
 * ScrollRevealItem — used inside grids/lists.
 * Animates ONCE on scroll and stays permanently visible.
 */
export function ScrollRevealItem({
  children,
  index = 0,
  desktopDirection = 'up',
  staggerDelay = 0.08,
  ...rest
}) {
  const mobileDirection = index % 2 === 0 ? 'left' : 'right';
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <ScrollReveal
      direction={isMobile ? mobileDirection : desktopDirection}
      delay={index * staggerDelay}
      {...rest}
    >
      {children}
    </ScrollReveal>
  );
}
