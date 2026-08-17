import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * ScrollReveal — wraps children in a framer-motion element that
 * animates into view when scrolled into the viewport.
 *
 * Props:
 *  direction  — 'left' | 'right' | 'up' | 'down' (default 'up')
 *  delay      — seconds before animation starts (default 0)
 *  duration   — animation length in seconds (default 0.6)
 *  distance   — px offset the element slides from (default 60)
 *  once       — only animate once (default true)
 *  threshold  — fraction of element visible to trigger (default 0.15)
 *  className  — additional CSS classes
 *  as         — HTML element tag (default 'div')
 *  style      — additional inline styles
 */
export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 60,
  once = true,
  threshold = 0.15,
  className = '',
  as = 'div',
  style,
  ...rest
}) {
  const prefersReducedMotion = useReducedMotion();

  const directionMap = {
    left:  { x: -distance, y: 0 },
    right: { x: distance,  y: 0 },
    up:    { x: 0, y: distance },
    down:  { x: 0, y: -distance },
  };

  const offset = directionMap[direction] || directionMap.up;

  // Respect prefers-reduced-motion
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
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: threshold }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
      }}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

/**
 * ScrollRevealItem — meant to be used inside grids/lists.
 * On desktop, all items come from the same direction.
 * On mobile, items alternate left ↔ right based on index.
 *
 * Props:
 *  index            — item index in the list (0-based)
 *  desktopDirection — direction on md+ screens (default 'up')
 *  staggerDelay     — per-item stagger in seconds (default 0.1)
 *  + all ScrollReveal props
 */
export function ScrollRevealItem({
  children,
  index = 0,
  desktopDirection = 'up',
  staggerDelay = 0.1,
  ...rest
}) {
  // On mobile, alternate left/right based on index
  const mobileDirection = index % 2 === 0 ? 'left' : 'right';

  // Use a CSS media query check via a state hook
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
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
