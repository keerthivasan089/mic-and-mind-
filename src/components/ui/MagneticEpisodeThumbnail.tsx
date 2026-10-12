import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react';

interface MagneticEpisodeThumbnailProps {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  overlayClassName?: string;
  children?: React.ReactNode;
  maxTilt?: number; // Max degrees of tilt (e.g. 8 - 12 deg)
  maxShift?: number; // Max pixel shift for magnetic follow (e.g. 10 - 15px)
  zoomOnHover?: number; // e.g. 1.06
  showGlare?: boolean;
  isFill?: boolean; // If true, occupies absolute inset-0 for full-card background thumbnails
  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'auto' | 'sync';
  fetchPriority?: 'high' | 'low' | 'auto';
}

/**
 * MagneticEpisodeThumbnail
 * Provides a tactile, magnetic 3D tilt & cursor-follow effect using Framer Motion springs.
 * As the user moves their cursor across the thumbnail, the image tilts along X/Y axes,
 * shifts slightly towards the cursor, and casts a subtle moving specular sheen.
 */
export const MagneticEpisodeThumbnail: React.FC<MagneticEpisodeThumbnailProps> = ({
  src,
  alt,
  className = '',
  imageClassName = '',
  overlayClassName = '',
  children,
  maxTilt = 10,
  maxShift = 12,
  zoomOnHover = 1.06,
  showGlare = true,
  isFill = false,
  loading = 'eager',
  decoding = 'async',
  fetchPriority = 'high',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Normalized mouse coordinates: -0.5 (left/top) to +0.5 (right/bottom)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Responsive spring physics config: snappy yet fluid dampening
  const springConfig = { damping: 20, stiffness: 180, mass: 0.15 };

  // Magnetic translation following cursor
  const springX = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-maxShift, maxShift]),
    springConfig
  );
  const springY = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [-maxShift, maxShift]),
    springConfig
  );

  // 3D Perspective Tilt:
  // Moving mouse UP tilts thumbnail forward (positive rotateX), DOWN tilts backward
  // Moving mouse RIGHT tilts right side down/back (positive rotateY)
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]),
    springConfig
  );

  // Scale zoom
  const scale = useSpring(isHovered ? zoomOnHover : 1, springConfig);

  // Glare position and opacity
  const glareX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);
  const glareOpacity = useSpring(isHovered ? 0.35 : 0, { damping: 25, stiffness: 200 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (shouldReduceMotion) return;
      const target = containerRef.current || e.currentTarget;
      const rect = target.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      // Map to -0.5 to 0.5 range
      const normalizedX = Math.max(-0.5, Math.min(0.5, clientX / rect.width - 0.5));
      const normalizedY = Math.max(-0.5, Math.min(0.5, clientY / rect.height - 0.5));

      mouseX.set(normalizedX);
      mouseY.set(normalizedY);
    },
    [mouseX, mouseY, shouldReduceMotion]
  );

  const handleMouseEnter = () => {
    if (shouldReduceMotion) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 900,
      }}
      className={`relative overflow-hidden ${isFill ? 'absolute inset-0 w-full h-full' : ''} ${className}`}
    >
      {/* 3D Magnetic Motion Wrapper */}
      <motion.div
        style={
          shouldReduceMotion
            ? { width: '100%', height: '100%' }
            : {
                x: springX,
                y: springY,
                rotateX,
                rotateY,
                scale,
                transformStyle: 'preserve-3d',
                width: '100%',
                height: '100%',
              }
        }
        className="relative w-full h-full will-change-transform"
      >
        {/* The Episode Thumbnail Image */}
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding={decoding}
          fetchPriority={fetchPriority}
          className={`w-full h-full object-cover object-center pointer-events-none select-none ${imageClassName}`}
        />

        {/* Dynamic Specular Sheen / Light Glare */}
        {showGlare && !shouldReduceMotion && (
          <motion.div
            style={{
              opacity: glareOpacity,
              background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.45) 0%, rgba(221,90,31,0.2) 40%, transparent 75%)`,
            }}
            className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay transition-opacity duration-200"
          />
        )}

        {/* Optional Custom Overlay Content / Vignettes inside the 3D plane */}
        {overlayClassName && <div className={overlayClassName} />}
      </motion.div>

      {/* Static/Foreground Children (Buttons, Waveforms, Badges, etc.) */}
      {children}
    </div>
  );
};
