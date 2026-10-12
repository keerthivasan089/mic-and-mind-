import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';

interface StackCardProps {
  children: React.ReactNode;
  id?: string;
  zIndex: number;
  rotationInitial?: number; // e.g. -1.5 deg
  scaleInitial?: number; // e.g. 0.95
  className?: string;
  isFirstOverHero?: boolean;
}

export const StackCard: React.FC<StackCardProps> = ({
  children,
  id,
  zIndex,
  rotationInitial = -1.2,
  scaleInitial = 0.95,
  className = '',
  isFirstOverHero = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Track the scroll progress of this specific section entering the viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'start start'],
  });

  // Smooth scroll-linked transforms: Card dealt onto the stack
  const scale = useTransform(
    scrollYProgress,
    [0, 0.85, 1],
    shouldReduceMotion ? [1, 1, 1] : [scaleInitial, 0.99, 1]
  );

  const rotate = useTransform(
    scrollYProgress,
    [0, 0.85, 1],
    shouldReduceMotion ? [0, 0, 0] : [rotationInitial, rotationInitial * 0.2, 0]
  );

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.25, 1],
    shouldReduceMotion ? [1, 1, 1] : [0.75, 0.95, 1]
  );

  return (
    <div
      ref={containerRef}
      id={id}
      style={{ zIndex }}
      className={`relative w-full ${className}`}
    >
      <motion.div
        style={{
          scale,
          rotateZ: rotate,
          opacity,
          transformOrigin: '50% 0%',
        }}
        className={`w-full will-change-transform ${
          isFirstOverHero
            ? 'rounded-t-[32px] sm:rounded-t-[44px] md:rounded-t-[52px] shadow-[0_-25px_60px_rgba(0,0,0,0.4)] border-t border-ink/15'
            : 'rounded-t-[32px] sm:rounded-t-[44px] md:rounded-t-[52px] shadow-[0_-20px_50px_rgba(0,0,0,0.12)] border-t border-ink/10'
        }`}
      >
        {children}
      </motion.div>
    </div>
  );
};
