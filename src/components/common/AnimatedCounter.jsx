import React, { useEffect, useState, useRef } from 'react';

export default function AnimatedCounter({
  target,
  duration = 1800,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = ''
}) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const hasAnimated = useRef(false);

  // Extract pure number if string like "500+" or "$157,300"
  const numericTarget = typeof target === 'number'
    ? target
    : parseFloat(String(target).replace(/[^0-9.-]+/g, '')) || 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTimestamp = null;

          const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = easeProgress * numericTarget;
            
            setCount(currentVal);

            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(numericTarget);
            }
          };

          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.15 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [numericTarget, duration]);

  const formattedValue = decimals > 0
    ? count.toFixed(decimals)
    : Math.round(count).toLocaleString();

  return (
    <span ref={elementRef} className={`tabular-nums ${className}`}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}
