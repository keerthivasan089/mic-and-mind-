import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Volume2, VolumeX, Maximize2, Sparkles, X } from 'lucide-react';

const STUDIO_VIDEO_URL =
  'https://res.cloudinary.com/hiekaatg/video/upload/v1787462200/watermark-removed-Cinematic_D_rendered_podcast_1.mp4';
const STUDIO_POSTER_URL =
  'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1600&auto=format&fit=crop';

// 3 organic, flowing river-like morphing shapes in normalized 0-1 coordinate space for clipPath
const PATH_A =
  'M 0.05,0.22 C 0.14,0.06 0.32,0.04 0.52,0.16 C 0.70,0.26 0.84,0.12 0.94,0.26 C 1.02,0.38 0.97,0.64 0.90,0.78 C 0.80,0.96 0.62,0.94 0.44,0.84 C 0.28,0.74 0.16,0.92 0.07,0.80 C -0.01,0.66 -0.01,0.38 0.05,0.22 Z';

const PATH_B =
  'M 0.08,0.28 C 0.18,0.10 0.36,0.08 0.56,0.20 C 0.74,0.30 0.88,0.18 0.96,0.32 C 1.01,0.46 0.94,0.70 0.86,0.82 C 0.76,0.98 0.58,0.90 0.40,0.80 C 0.24,0.70 0.12,0.86 0.05,0.74 C -0.02,0.60 0.00,0.44 0.08,0.28 Z';

const PATH_C =
  'M 0.05,0.20 C 0.12,0.04 0.30,0.06 0.48,0.14 C 0.66,0.22 0.80,0.10 0.92,0.22 C 1.00,0.34 0.98,0.60 0.92,0.74 C 0.82,0.92 0.66,0.96 0.48,0.88 C 0.32,0.78 0.20,0.94 0.09,0.84 C 0.01,0.72 -0.02,0.36 0.05,0.20 Z';

export const OrganicVideoPortal: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  const [isHovering, setIsHovering] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Smooth lerp cursor tracking coordinates
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const [badgePos, setBadgePos] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  // Check user preference for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Smooth animation loop for cursor lag/easing
  useEffect(() => {
    if (prefersReducedMotion) return;

    const animateCursor = () => {
      // Linear interpolation (lerp) for silky lag effect
      const ease = 0.14;
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * ease;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * ease;

      setBadgePos({
        x: currentPos.current.x,
        y: currentPos.current.y,
      });

      rafRef.current = requestAnimationFrame(animateCursor);
    };

    rafRef.current = requestAnimationFrame(animateCursor);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [prefersReducedMotion]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    targetPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    targetPos.current = { x: e.clientX, y: e.clientY };
    currentPos.current = { x: e.clientX, y: e.clientY };
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <section
      id="organic-video-portal"
      className="py-24 sm:py-32 bg-cream text-ink relative overflow-hidden border-b border-ink/10 select-none"
    >
      {/* Background ambient texture / subtle organic accents */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-orange/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#FF8542]/5 rounded-full blur-3xl pointer-events-none" />

      {/* SVG Definitions: ClipPath mask & glowing border filters */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="organicRiverMask" clipPathUnits="objectBoundingBox">
            <path d={PATH_A}>
              {!prefersReducedMotion && (
                <animate
                  attributeName="d"
                  dur="14s"
                  repeatCount="indefinite"
                  values={`${PATH_A}; ${PATH_B}; ${PATH_C}; ${PATH_A}`}
                  keyTimes="0; 0.35; 0.7; 1"
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
                />
              )}
            </path>
          </clipPath>

          <linearGradient id="organicBorderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DD5A1F" />
            <stop offset="50%" stopColor="#FF8542" />
            <stop offset="100%" stopColor="#A8391A" />
          </linearGradient>

          {/* Circular Text Path for Rotating Cursor Badge */}
          <path
            id="cursorBadgeTextPath"
            d="M 50,50 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
            fill="none"
          />
        </defs>
      </svg>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange/10 border border-orange/20 text-orange text-xs font-mono uppercase tracking-widest font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-orange" />
              <span>Behind The Lens // Organic View</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-ink leading-[1.08]">
              The Unfiltered Sanctuary
            </h2>
          </div>
          <p className="font-body text-sm sm:text-base text-ink/70 max-w-md leading-relaxed">
            Step into the recording room where conversation transcends script.
            Every frame captured in uncompressed clarity.
          </p>
        </div>

        {/* ORGANIC SHAPE VIDEO CONTAINER */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={openModal}
          className={`relative w-full aspect-[16/10] sm:aspect-[21/10] max-h-[640px] transition-all duration-300 ${
            isHovering && !prefersReducedMotion ? 'cursor-none' : 'cursor-pointer'
          }`}
        >
          {/* 1. Underlying Cutout Masked Video Container */}
          <div
            className="w-full h-full relative"
            style={{
              clipPath: 'url(#organicRiverMask)',
              WebkitClipPath: 'url(#organicRiverMask)',
            }}
          >
            {/* Background Looping Studio Video */}
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              poster={STUDIO_POSTER_URL}
              className="w-full h-full object-cover scale-105 transition-transform duration-700 hover:scale-110"
            >
              <source src={STUDIO_VIDEO_URL} type="video/mp4" />
            </video>

            {/* Warm Studio Atmospheric Color Grade Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-ink/40 via-transparent to-orange/25 pointer-events-none" />

            {/* Subtle Vignette Layer */}
            <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/60 pointer-events-none" />
          </div>

          {/* 2. Organic Vector Glowing Edge Border Overlay */}
          <svg
            viewBox="0 0 1 1"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none filter drop-shadow-[0_0_12px_rgba(221,90,31,0.45)]"
          >
            <path
              d={PATH_A}
              fill="none"
              stroke="url(#organicBorderGradient)"
              strokeWidth="0.006"
              strokeLinejoin="round"
              className="opacity-90"
            >
              {!prefersReducedMotion && (
                <animate
                  attributeName="d"
                  dur="14s"
                  repeatCount="indefinite"
                  values={`${PATH_A}; ${PATH_B}; ${PATH_C}; ${PATH_A}`}
                  keyTimes="0; 0.35; 0.7; 1"
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
                />
              )}
            </path>
          </svg>

          {/* 3. Static Corner Quick-Action Pill Controls (Audio & Fullscreen) */}
          <div className="absolute bottom-6 sm:bottom-10 right-6 sm:right-10 flex items-center gap-2.5 z-20 pointer-events-auto">
            <button
              type="button"
              id="organic-portal-mute-toggle"
              onClick={toggleSound}
              className="w-10 h-10 rounded-full bg-ink/85 backdrop-blur-md text-white border border-orange/40 flex items-center justify-center hover:bg-orange transition-colors shadow-lg active:scale-95 cursor-pointer"
              title={isMuted ? 'Unmute studio sound' : 'Mute studio sound'}
              aria-label={isMuted ? 'Unmute studio sound' : 'Mute studio sound'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-paper" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#FF8542]" />
              )}
            </button>

            <button
              type="button"
              id="organic-portal-expand-btn"
              onClick={openModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ink/85 backdrop-blur-md text-paper border border-orange/40 hover:bg-orange transition-colors shadow-lg active:scale-95 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#FF8542]" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider">
                Full Cinema
              </span>
            </button>
          </div>

          {/* 4. Editorial Floating Metadata Badges */}
          <div className="absolute top-6 sm:top-10 left-6 sm:left-10 z-20 pointer-events-none hidden sm:flex flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-ink bg-paper/90 backdrop-blur-md px-3 py-1 rounded-full border border-ink/10 shadow-xs inline-block">
              REC // 4K 60FPS
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink/70 bg-white/70 backdrop-blur-sm px-2.5 py-0.5 rounded-full inline-block">
              Master Room &bull; Cam 01
            </span>
          </div>
        </div>
      </div>

      {/* CURSOR-FOLLOWING REVEAL BADGE */}
      {!prefersReducedMotion && (
        <div
          className="fixed pointer-events-none z-50 transition-opacity duration-200 ease-out select-none hidden lg:block"
          style={{
            left: 0,
            top: 0,
            transform: `translate3d(${badgePos.x - 45}px, ${badgePos.y - 45}px, 0)`,
            opacity: isHovering ? 1 : 0,
          }}
          aria-hidden="true"
        >
          {/* Outer Rotating Badge Body */}
          <div className="relative w-[90px] h-[90px] flex items-center justify-center">
            {/* Ambient Outer Glow */}
            <div className="absolute inset-0 rounded-full bg-orange/40 blur-md animate-pulse" />

            {/* Glowing Orange Circle Surface */}
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FF8542] via-orange to-[#A8391A] text-white shadow-2xl border-2 border-white/40 flex items-center justify-center p-1">
              {/* Rotating Circular Text SVG */}
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full animate-[spin_12s_linear_infinite]"
              >
                <path
                  id="textRing"
                  d="M 50,50 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
                  fill="none"
                />
                <text className="font-mono text-[8.5px] uppercase font-bold tracking-[0.18em] fill-white">
                  <textPath href="#textRing">
                    &bull; WATCH LIVE &bull; STUDIO REVEAL &bull;
                  </textPath>
                </text>
              </svg>

              {/* Center Play Icon & Action Target */}
              <div className="absolute w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center shadow-md">
                <Play className="w-3.5 h-3.5 fill-current text-[#FF8542] translate-x-0.5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN CINEMA MODAL LIGHTBOX */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              id="close-cinema-modal"
              onClick={closeModal}
              className="absolute top-4 right-4 z-30 w-11 h-11 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:bg-orange transition-colors cursor-pointer shadow-lg active:scale-95"
              aria-label="Close cinema view"
            >
              <X className="w-5 h-5" />
            </button>

            <video
              ref={modalVideoRef}
              autoPlay
              controls
              playsInline
              className="w-full h-full object-contain"
            >
              <source src={STUDIO_VIDEO_URL} type="video/mp4" />
            </video>
          </div>
        </div>
      )}
    </section>
  );
};
