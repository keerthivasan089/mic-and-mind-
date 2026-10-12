import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

interface AmbientParticlesProps {
  className?: string;
  particleCount?: number;
  mobileParticleCount?: number;
  /**
   * Color theme profile for particle blending:
   * - 'mixed': Default signature cream + fiery orange embers
   * - 'dark': Brighter cream, golden amber, and vivid orange on dark backgrounds
   * - 'light': Warm sepia cream, muted terracotta, and orange on light paper
   */
  theme?: 'mixed' | 'dark' | 'light';
  speedMultiplier?: number;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  glowColor: string;
  baseAlpha: number;
  currentAlpha: number;
  baseVy: number;
  vx: number;
  vy: number;
  swayFreq: number;
  swayAmp: number;
  phase: number;
  time: number;
  isOrange: boolean;
}

export const AmbientParticles: React.FC<AmbientParticlesProps> = ({
  className = '',
  particleCount = 80,
  mobileParticleCount = 35,
  theme = 'mixed',
  speedMultiplier = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  // Non-rendering mutable refs for ultra-fast 60fps loop
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });

  useEffect(() => {
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Detect touch / coarse pointer
    const isTouchDevice =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0);

    const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 768;
    const activeCount = isTouchDevice || isSmallScreen ? mobileParticleCount : particleCount;

    // Color definitions based on theme
    const getColors = () => {
      if (theme === 'dark') {
        // High contrast on dark background (#1C140F)
        const creamPalette = [
          'rgba(251, 246, 235, ', // Paper #FBF6EB
          'rgba(244, 236, 217, ', // Cream #F4ECD9
          'rgba(255, 250, 240, ', // Soft ivory
        ];
        const orangePalette = [
          'rgba(221, 90, 31, ', // Brand Orange #DD5A1F
          'rgba(255, 122, 48, ', // Vivid Sunset Ember #FF7A30
          'rgba(245, 158, 11, ', // Warm Gold #F59E0B
        ];
        return { creamPalette, orangePalette };
      } else if (theme === 'light') {
        // Subtle warm tones on cream/paper background (#F4ECD9 / #FBF6EB)
        const creamPalette = [
          'rgba(180, 165, 150, ', // Warm muted stone/sand
          'rgba(140, 120, 105, ', // Soft sepia dust
          'rgba(200, 185, 170, ', // Soft cream shadow
        ];
        const orangePalette = [
          'rgba(221, 90, 31, ', // Brand Orange #DD5A1F
          'rgba(200, 75, 20, ', // Deep Terracotta
          'rgba(235, 105, 40, ', // Ember
        ];
        return { creamPalette, orangePalette };
      } else {
        // Mixed adaptive: versatile cream + brand orange
        const creamPalette = [
          'rgba(244, 236, 217, ', // Cream #F4ECD9
          'rgba(251, 246, 235, ', // Paper #FBF6EB
          'rgba(220, 210, 195, ',
        ];
        const orangePalette = [
          'rgba(221, 90, 31, ',
          'rgba(255, 122, 48, ',
          'rgba(245, 158, 11, ',
        ];
        return { creamPalette, orangePalette };
      }
    };

    const { creamPalette, orangePalette } = getColors();

    // Create a particle
    const createParticle = (initialRandomY = false): Particle => {
      const isOrange = Math.random() < 0.25; // ~25% orange embers, ~75% cream/paper
      const palette = isOrange ? orangePalette : creamPalette;
      const baseColorPrefix = palette[Math.floor(Math.random() * palette.length)];

      // 4px to 7px diameter (2.0px to 3.5px radius)
      const radius = 2.0 + Math.random() * 1.5;
      const baseAlpha = isOrange
        ? 0.55 + Math.random() * 0.25 // 0.55 - 0.80
        : 0.50 + Math.random() * 0.25; // 0.50 - 0.75

      return {
        x: Math.random() * (width || 800),
        y: initialRandomY ? Math.random() * (height || 600) : -10 - Math.random() * 30,
        radius,
        color: baseColorPrefix,
        glowColor: isOrange ? 'rgba(221, 90, 31, 0.45)' : 'rgba(250, 247, 242, 0.35)',
        baseAlpha,
        currentAlpha: 0,
        baseVy: (0.35 + Math.random() * 0.55) * speedMultiplier, // Gentle slow fall
        vx: (Math.random() - 0.5) * 0.15,
        vy: (0.35 + Math.random() * 0.55) * speedMultiplier,
        swayFreq: 0.008 + Math.random() * 0.012,
        swayAmp: 0.25 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        time: Math.random() * 1000,
        isOrange,
      };
    };

    let particles: Particle[] = [];

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < activeCount; i++) {
        particles.push(createParticle(true));
      }
    };

    // Resize handler
    const handleResize = () => {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      if (particles.length === 0) {
        initParticles();
      } else {
        // Adjust existing particles to new bounds if needed
        particles.forEach((p) => {
          if (p.x > width) p.x = Math.random() * width;
        });
      }
    };

    // Use ResizeObserver for accurate sizing without window resize delays
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);
    handleResize();

    // Mouse Tracking (cursor coordinates relative to container)
    const handleMouseMove = (e: MouseEvent) => {
      if (isTouchDevice) return;
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    container.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // Physics & Render Loop
    const REPULSION_RADIUS = 135; // 120px-150px radius
    const REPULSION_FORCE = 0.65; // Gentle pushing force
    const FADE_DISTANCE = 45; // Smooth alpha fade at top and bottom bounds

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const isMouseActive = mouse.active && !isTouchDevice;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.time += 1;

        // 1. Horizontal Sway (Sine Wave)
        const sway = Math.sin(p.time * p.swayFreq + p.phase) * p.swayAmp;

        // 2. Cursor Repulsion
        if (isMouseActive) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < REPULSION_RADIUS * REPULSION_RADIUS && distSq > 4) {
            const dist = Math.sqrt(distSq);
            // Smooth non-linear cubic falloff
            const normDist = 1 - dist / REPULSION_RADIUS;
            const force = normDist * normDist * REPULSION_FORCE;

            const pushX = (dx / dist) * force * 3.2;
            const pushY = (dy / dist) * force * 3.2;

            p.vx += pushX;
            p.vy += pushY;
          }
        }

        // 3. Velocity Damping / Restoration to normal fall
        p.vx *= 0.93; // Smooth damping
        p.vy += (p.baseVy - p.vy) * 0.06; // Ease back into terminal downward drift

        // 4. Update Position
        p.x += p.vx + sway * 0.25;
        p.y += p.vy;

        // Wrap around horizontally if drifted out
        if (p.x < -10) p.x = width + 5;
        if (p.x > width + 10) p.x = -5;

        // 5. Vertical Respawn Cycle
        if (p.y > height + 10) {
          p.y = -10 - Math.random() * 20;
          p.x = Math.random() * width;
          p.vx = (Math.random() - 0.5) * 0.15;
          p.vy = p.baseVy;
        }

        // 6. Smooth Alpha Fade In/Out (No hard pop-in or pop-out)
        let alpha = p.baseAlpha;
        if (p.y < FADE_DISTANCE) {
          alpha = p.baseAlpha * Math.max(0, p.y / FADE_DISTANCE);
        } else if (p.y > height - FADE_DISTANCE) {
          alpha = p.baseAlpha * Math.max(0, (height - p.y) / FADE_DISTANCE);
        }
        p.currentAlpha = alpha;

        // 7. Draw Particle with Soft Ambient Glow
        if (p.currentAlpha > 0.01) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.currentAlpha.toFixed(3)})`;
          ctx.fill();

          // Soft subtle halo for orange embers or larger cream particles
          if (p.isOrange || p.radius > 1.8) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
            ctx.fillStyle = p.isOrange
              ? `rgba(221, 90, 31, ${(p.currentAlpha * 0.22).toFixed(3)})`
              : `rgba(250, 247, 242, ${(p.currentAlpha * 0.12).toFixed(3)})`;
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [prefersReduced, particleCount, mobileParticleCount, theme, speedMultiplier]);

  if (prefersReduced) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none select-none z-0 overflow-hidden ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full pointer-events-none"
        style={{ willChange: 'transform' }}
      />
    </div>
  );
};
