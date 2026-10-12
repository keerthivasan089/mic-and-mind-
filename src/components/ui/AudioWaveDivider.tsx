import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface AudioWaveDividerProps {
  id?: string;
  barCount?: number;
  theme?: 'light' | 'dark' | 'cream';
  isPlaying?: boolean;
  className?: string;
  seed?: number;
}

/**
 * AudioWaveDivider
 * A signature animated audio visualizer section divider.
 * Features organic, independently undulating rounded waveform bars
 * with responsive light/dark themes and no distracting text labels.
 */
export const AudioWaveDivider: React.FC<AudioWaveDividerProps> = ({
  id,
  barCount = 36,
  theme = 'light',
  isPlaying = false,
  className = '',
  seed = 0,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Color mappings based on section theme
  const themeStyles = useMemo(() => {
    switch (theme) {
      case 'dark':
        return {
          bg: 'bg-ink',
          border: 'border-paper/10',
          barPrimary: '#DD5A1F',
          barSecondary: 'rgba(251, 246, 235, 0.25)',
          barAccent: '#FF8542',
        };
      case 'cream':
        return {
          bg: 'bg-cream',
          border: 'border-ink/10',
          barPrimary: '#DD5A1F',
          barSecondary: 'rgba(28, 20, 15, 0.25)',
          barAccent: '#A8391A',
        };
      case 'light':
      default:
        return {
          bg: 'bg-paper',
          border: 'border-ink/10',
          barPrimary: '#DD5A1F',
          barSecondary: 'rgba(28, 20, 15, 0.25)',
          barAccent: '#DD5A1F',
        };
    }
  }, [theme]);

  // Generate randomized parameters for each bar to create organic, non-uniform motion
  const barsData = useMemo(() => {
    return Array.from({ length: barCount }).map((_, index) => {
      // Periodic accenting for technical ruler cadence
      const isAccent = (index + seed) % 4 === 0;
      const isHighlight = (index + seed) % 8 === 0;

      // Base heights (varying between 4px and 10px min, up to 24px max)
      const minH = 4 + ((index + seed * 3) % 4) * 1.5;
      const baseMaxH = isHighlight ? 22 : isAccent ? 17 : 12;
      const dynamicBoost = isPlaying ? 5 : 0;
      const maxH = Math.min(24, baseMaxH + dynamicBoost);

      // Unique duration (0.75s to 1.75s) and delay with instance phase offset
      const duration = 0.75 + (((index * 7) + seed * 11) % 13) * 0.08;
      const delay = (((index * 13) + seed * 7) % 19) * 0.05;

      // Color selection
      const color = isHighlight
        ? themeStyles.barAccent
        : isAccent
        ? themeStyles.barPrimary
        : themeStyles.barSecondary;

      return {
        id: index,
        minH,
        maxH,
        duration,
        delay,
        color,
        isAccent,
      };
    });
  }, [barCount, isPlaying, seed, themeStyles]);

  return (
    <div
      id={id}
      role="separator"
      aria-label="Audio Waveform Section Divider"
      className={`w-full h-8 sm:h-9 ${themeStyles.bg} border-y ${themeStyles.border} flex items-center justify-center px-4 sm:px-8 select-none overflow-hidden relative z-20 ${className}`}
    >
      {/* Animated Waveform / Audio Level Visualizer */}
      <div
        className="flex items-center justify-center gap-[3px] sm:gap-[4px] px-2 sm:px-6 h-full w-full max-w-2xl mx-auto overflow-hidden"
        aria-hidden="true"
      >
        {barsData.map((bar) => {
          if (shouldReduceMotion) {
            return (
              <span
                key={bar.id}
                style={{
                  height: `${(bar.minH + bar.maxH) / 2}px`,
                  backgroundColor: bar.color,
                }}
                className="w-[2px] sm:w-[2.5px] rounded-full shrink-0"
              />
            );
          }

          return (
            <motion.span
              key={bar.id}
              initial={{ scaleY: bar.minH / bar.maxH }}
              animate={{
                scaleY: [
                  bar.minH / bar.maxH,
                  1,
                  Math.min(1, (bar.minH * 1.3) / bar.maxH),
                  (bar.maxH * 0.7) / bar.maxH,
                  bar.minH / bar.maxH,
                ],
              }}
              transition={{
                duration: bar.duration,
                delay: bar.delay,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
              style={{
                height: `${bar.maxH}px`,
                backgroundColor: bar.color,
                transformOrigin: 'bottom',
              }}
              className="w-[2px] sm:w-[2.5px] rounded-full shrink-0 will-change-transform"
            />
          );
        })}
      </div>
    </div>
  );
};

