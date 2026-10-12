import React, { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';

export interface CountUpProps {
  to: number;
  from?: number;
  decimals?: number;
  duration?: number; // Duration in seconds (e.g. 1.8)
  delay?: number; // Delay in seconds (e.g. 0.15)
  prefix?: string;
  suffix?: string;
  separator?: string;
  className?: string;
  easing?: 'easeOutCubic' | 'easeOutQuart' | 'easeOutExpo';
  inViewMargin?: string;
}

/**
 * Easing formulas for smooth, organic ease-out deceleration
 */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Format a numeric value with decimals, separators, prefix and suffix
 */
export function formatCountUpValue(
  value: number,
  decimals: number = 0,
  prefix: string = '',
  suffix: string = '',
  separator: string = ''
): string {
  const fixed = value.toFixed(decimals);
  if (!separator) {
    return `${prefix}${fixed}${suffix}`;
  }

  const [intPart, decPart] = fixed.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  const result = decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
  return `${prefix}${result}${suffix}`;
}

export interface UseCountUpOptions {
  to: number;
  from?: number;
  decimals?: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  easing?: 'easeOutCubic' | 'easeOutQuart' | 'easeOutExpo';
  inViewMargin?: string;
  ref?: React.RefObject<HTMLElement | null>;
}

/**
 * Custom React Hook for count-up numbers
 */
export function useCountUp(options: UseCountUpOptions) {
  const {
    to,
    from = 0,
    decimals = 0,
    duration = 1.8,
    delay = 0,
    prefix = '',
    suffix = '',
    separator = '',
    easing = 'easeOutQuart',
    inViewMargin = '-50px',
  } = options;
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, {
    once: true,
    margin: (inViewMargin as any) || '-50px',
  });
  const shouldReduceMotion = useReducedMotion();

  const [displayValue, setDisplayValue] = useState<string>(() => {
    // If reduced motion is active, start directly at target
    if (shouldReduceMotion) {
      return formatCountUpValue(to, decimals, prefix, suffix, separator);
    }
    return formatCountUpValue(from, decimals, prefix, suffix, separator);
  });

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(formatCountUpValue(to, decimals, prefix, suffix, separator));
      return;
    }

    if (!isInView) return;

    let startTime: number | null = null;
    let animationFrameId: number;
    let timeoutId: number | null = null;

    const easeFn =
      easing === 'easeOutCubic'
        ? easeOutCubic
        : easing === 'easeOutExpo'
        ? easeOutExpo
        : easeOutQuart;

    const durationMs = Math.max(100, duration * 1000);
    const delayMs = Math.max(0, delay * 1000);

    const step = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const easedProgress = easeFn(progress);
      const current = from + (to - from) * easedProgress;

      setDisplayValue(formatCountUpValue(current, decimals, prefix, suffix, separator));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(formatCountUpValue(to, decimals, prefix, suffix, separator));
      }
    };

    if (delayMs > 0) {
      timeoutId = window.setTimeout(() => {
        animationFrameId = requestAnimationFrame(step);
      }, delayMs);
    } else {
      animationFrameId = requestAnimationFrame(step);
    }

    return () => {
      if (timeoutId !== null) clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isInView, shouldReduceMotion, to, from, decimals, duration, delay, prefix, suffix, separator, easing]);

  return {
    ref: containerRef,
    displayValue,
  };
}

/**
 * CountUp Component
 * Displays a number that animates upwards from `from` (default 0) to `to`
 * when scrolled into the viewport using smooth ease-out physics.
 */
export const CountUp: React.FC<CountUpProps> = (props) => {
  const {
    to,
    from = 0,
    decimals = 0,
    duration = 1.8,
    delay = 0,
    prefix = '',
    suffix = '',
    separator = '',
    className = '',
    easing = 'easeOutQuart',
    inViewMargin = '-40px',
  } = props;

  const { ref, displayValue } = useCountUp({
    to,
    from,
    decimals,
    duration,
    delay,
    prefix,
    suffix,
    separator,
    easing,
    inViewMargin,
  });

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
};
