import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const buildKeyframes = (from, steps) => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap(s => Object.keys(s))]);

  const keyframes = {};
  keys.forEach(k => {
    keyframes[k] = [from[k], ...steps.map(s => s[k])];
  });
  return keyframes;
};

const BlurText = ({
  text = '',
  delay = 100,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '60px 0px',
  animationFrom,
  animationTo,
  easing = t => t,
  onAnimationComplete,
  stepDuration = 0.3,
  as = 'h2'
}) => {
  const prefersReduced = useReducedMotion();
  const elements = animateBy === 'words' ? (text || '').split(' ') : (text || '').split('');
  const [inView, setInView] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (inView || hasCompleted || prefersReduced || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [inView, hasCompleted, prefersReduced, threshold, rootMargin]);

  const defaultFrom = useMemo(
    () =>
      direction === 'top'
        ? { filter: 'blur(10px)', opacity: 0, y: -30 }
        : { filter: 'blur(10px)', opacity: 0, y: 30 },
    [direction]
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: 'blur(3px)',
        opacity: 0.7,
        y: direction === 'top' ? 3 : -3
      },
      { filter: 'blur(0px)', opacity: 1, y: 0 }
    ],
    [direction]
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;

  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) => (stepCount === 1 ? 0 : i / (stepCount - 1)));

  const Component = as;

  // If reduced motion or already completed, render static text with 0 animations that stays permanently
  if (prefersReduced || hasCompleted) {
    return (
      <Component ref={ref} className={className} style={{ display: 'flex', flexWrap: 'wrap' }}>
        {elements.map((segment, index) => (
          <span key={index} className="inline-block" style={{ opacity: 1, filter: 'none', transform: 'none' }}>
            {segment === ' ' ? '\u00A0' : segment}
            {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
          </span>
        ))}
      </Component>
    );
  }

  const handleSpanComplete = (index) => {
    if (index === elements.length - 1) {
      setHasCompleted(true);
      onAnimationComplete?.();
    }
  };

  return (
    <Component ref={ref} className={className} style={{ display: 'flex', flexWrap: 'wrap' }}>
      {elements.map((segment, index) => {
        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);

        const spanTransition = {
          duration: totalDuration,
          times,
          delay: (index * delay) / 1000,
          ease: easing
        };

        return (
          <motion.span
            className="inline-block will-change-[transform,filter,opacity]"
            key={index}
            initial={fromSnapshot}
            animate={inView ? animateKeyframes : fromSnapshot}
            transition={spanTransition}
            onAnimationComplete={() => handleSpanComplete(index)}
          >
            {segment === ' ' ? '\u00A0' : segment}
            {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
          </motion.span>
        );
      })}
    </Component>
  );
};

export default BlurText;
