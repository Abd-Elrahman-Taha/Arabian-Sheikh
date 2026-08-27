import React, { useEffect, useState, useRef } from 'react';

export default function AnimatedCounter({
  target,
  end,
  duration = 1400,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = ''
}) {
  const value = target !== undefined ? target : end;
  const numericTarget = typeof value === 'number'
    ? value
    : parseFloat(String(value ?? 0).replace(/[^0-9.-]+/g, '')) || 0;

  const [count, setCount] = useState(numericTarget);
  const elementRef = useRef(null);
  const prevTargetRef = useRef(numericTarget);

  useEffect(() => {
    let startTimestamp = null;
    const startVal = count;
    const endVal = numericTarget;
    prevTargetRef.current = endVal;

    if (startVal === endVal) {
      setCount(endVal);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = startVal + (endVal - startVal) * easeProgress;
      setCount(currentVal);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(endVal);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
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
