"use client";

import { useEffect, useRef } from "react";

// Mic & Mind Luxury Brand Palette
const PALETTE = ["#DD5A1F", "#1C140F", "#C24E19", "#3A281C", "#F4ECD9"];
const SPRITE_SIZE = 64;

export function ParticleAnimation({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number | null = null;
    let isVisible = true;

    // 1. Pre-render Hardware-Accelerated Particle Sprites onto Offscreen Canvases
    const sprites: (OffscreenCanvas | HTMLCanvasElement)[] = PALETTE.map((hex) => {
      let offscreen: OffscreenCanvas | HTMLCanvasElement;
      let sCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null = null;

      if (typeof OffscreenCanvas !== "undefined") {
        try {
          offscreen = new OffscreenCanvas(SPRITE_SIZE, SPRITE_SIZE);
          sCtx = offscreen.getContext("2d");
        } catch {
          offscreen = document.createElement("canvas");
          offscreen.width = SPRITE_SIZE;
          offscreen.height = SPRITE_SIZE;
          sCtx = (offscreen as HTMLCanvasElement).getContext("2d");
        }
      } else {
        offscreen = document.createElement("canvas");
        offscreen.width = SPRITE_SIZE;
        offscreen.height = SPRITE_SIZE;
        sCtx = (offscreen as HTMLCanvasElement).getContext("2d");
      }

      if (sCtx) {
        const center = SPRITE_SIZE / 2;
        const radius = center - 2;

        const grad = sCtx.createRadialGradient(center, center, 0, center, center, radius);
        grad.addColorStop(0, hex);
        grad.addColorStop(0.55, hex);
        grad.addColorStop(1, "transparent");

        sCtx.fillStyle = grad;
        sCtx.beginPath();
        sCtx.arc(center, center, radius, 0, Math.PI * 2);
        sCtx.fill();
      }

      return offscreen;
    });

    // 2. Viewport & Device Pixel Ratio Setup (Clamped to 2 for 60-120fps performance)
    let width = container.offsetWidth || window.innerWidth;
    let height = container.offsetHeight || window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (!container || !canvas) return;
      width = container.offsetWidth || window.innerWidth;
      height = container.offsetHeight || window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();

    // Measure exact anchor for the platform icons so ball is positioned behind them
    const getBallCenter = () => {
      const dock = document.getElementById("platform-dock-anchor");
      if (dock && container) {
        const dockRect = dock.getBoundingClientRect();
        const contRect = container.getBoundingClientRect();
        const bx = dockRect.left - contRect.left + dockRect.width / 2;
        const by = dockRect.top - contRect.top + dockRect.height / 2;
        const br = Math.max(Math.min(width * 0.42, 320), 210);
        return { x: bx, y: by, radius: br };
      }
      return {
        x: width / 2,
        y: Math.min(height * 0.22, 380),
        radius: Math.max(Math.min(width * 0.42, 320), 210),
      };
    };

    // 3. High-Density Flat Typed Arrays (Zero Garbage Collection / 60-120fps)
    const isMobile = width < 640;
    // Keep high particle count without reduction
    const count = isMobile ? 1200 : width < 1024 ? 1900 : 2800;
    const ballCount = Math.floor(count * 0.65); // 65% dense ball behind platform icons, 35% dispersed over page

    const x = new Float32Array(count);
    const y = new Float32Array(count);
    const vx = new Float32Array(count);
    const vy = new Float32Array(count);

    // 3D Ball coordinates centered behind the platform dock icons
    const ballBaseX = new Float32Array(count);
    const ballBaseY = new Float32Array(count);
    const ballBaseZ = new Float32Array(count);
    const ballRadiusScale = new Float32Array(count);

    // Dispersed cloud coordinates across full page
    const cloudTargetX = new Float32Array(count);
    const cloudTargetY = new Float32Array(count);

    // Physical characteristics
    const size = new Float32Array(count);
    const baseAlpha = new Float32Array(count);
    const colorIdx = new Uint8Array(count);
    const driftFreq = new Float32Array(count);
    const driftPhase = new Float32Array(count);
    const isBall = new Uint8Array(count);

    let currentBallCenter = getBallCenter();

    const initParticleCoordinates = () => {
      currentBallCenter = getBallCenter();

      for (let i = 0; i < count; i++) {
        const inBall = i < ballCount;
        isBall[i] = inBall ? 1 : 0;

        // 3D spherical ball coordinates (Fibonacci sphere distribution)
        const phi = Math.acos(1 - 2 * (i + 0.5) / ballCount);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const radFrac = Math.pow(Math.random(), 0.45); // Volumetric density concentrated like a ball
        
        ballBaseX[i] = Math.sin(phi) * Math.cos(theta);
        ballBaseY[i] = Math.sin(phi) * Math.sin(theta);
        ballBaseZ[i] = Math.cos(phi);
        ballRadiusScale[i] = radFrac;

        // Dispersed coordinates filling the entire page
        const margin = 30;
        cloudTargetX[i] = margin + Math.random() * (width - margin * 2);
        cloudTargetY[i] = margin + Math.random() * (height - margin * 2);

        // Initial position
        if (inBall) {
          x[i] = currentBallCenter.x + ballBaseX[i] * currentBallCenter.radius * radFrac;
          y[i] = currentBallCenter.y + ballBaseY[i] * currentBallCenter.radius * radFrac;
        } else {
          x[i] = cloudTargetX[i];
          y[i] = cloudTargetY[i];
        }

        vx[i] = 0;
        vy[i] = 0;

        size[i] = inBall 
          ? Math.random() * 2.5 + (isMobile ? 1.5 : 1.9)
          : Math.random() * 2.2 + (isMobile ? 1.3 : 1.7);
        baseAlpha[i] = inBall ? Math.random() * 0.45 + 0.50 : Math.random() * 0.35 + 0.30;
        colorIdx[i] = Math.floor(Math.random() * PALETTE.length);
        driftFreq[i] = 0.0008 + Math.random() * 0.0016;
        driftPhase[i] = Math.random() * Math.PI * 2;
      }
    };

    initParticleCoordinates();

    // 4. Industry-Standard Pointer Velocity & Smoothing Pipeline
    let targetMouseX = -9999;
    let targetMouseY = -9999;
    let smoothMouseX = -9999;
    let smoothMouseY = -9999;
    let mouseVx = 0;
    let mouseVy = 0;
    let mouseSpeed = 0;
    let hasPointer = false;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e && e.touches.length > 0 ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = "touches" in e && e.touches.length > 0 ? e.touches[0].clientY : (e as MouseEvent).clientY;
      const rect = container.getBoundingClientRect();
      targetMouseX = clientX - rect.left;
      targetMouseY = clientY - rect.top;
      hasPointer = true;
    };

    const handlePointerLeave = () => {
      hasPointer = false;
      targetMouseX = -9999;
      targetMouseY = -9999;
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      currentBallCenter = getBallCenter();
      for (let i = 0; i < count; i++) {
        if (!isBall[i]) {
          cloudTargetX[i] = 30 + Math.random() * (width - 60);
          cloudTargetY[i] = 30 + Math.random() * (height - 60);
        }
      }
    });
    resizeObserver.observe(container);

    // 5. Main 60-120fps Render Loop with Typed-Array Batching
    let frameCounter = 0;

    const render = (now: number) => {
      if (!isVisible) {
        animId = null;
        return;
      }
      animId = requestAnimationFrame(render);
      frameCounter++;

      // Re-check dock position periodically to ensure accurate centering behind the platform icons
      if (frameCounter % 60 === 0) {
        currentBallCenter = getBallCenter();
      }

      // Pointer velocity smoothing in rAF
      if (hasPointer && targetMouseX > -5000) {
        if (smoothMouseX < -5000) {
          smoothMouseX = targetMouseX;
          smoothMouseY = targetMouseY;
        } else {
          const prevX = smoothMouseX;
          const prevY = smoothMouseY;
          smoothMouseX += (targetMouseX - smoothMouseX) * 0.45;
          smoothMouseY += (targetMouseY - smoothMouseY) * 0.45;
          mouseVx = smoothMouseX - prevX;
          mouseVy = smoothMouseY - prevY;
          mouseSpeed = Math.sqrt(mouseVx * mouseVx + mouseVy * mouseVy);
        }
      } else {
        mouseSpeed *= 0.85;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Slow elegant 3D ball rotation around Y axis
      const autoAngle = (now * 0.00032) % (Math.PI * 2);
      const cosA = Math.cos(autoAngle);
      const sinA = Math.sin(autoAngle);

      // Fast constant calculations for cursor dispersion
      const dispersionRadius = 240;
      const dispersionRadiusSq = dispersionRadius * dispersionRadius;
      const invDispersionRadius = 1 / dispersionRadius;

      // 6. Direct Typed-Array Physics Integration & Fast Draw
      for (let i = 0; i < count; i++) {
        let homeX: number;
        let homeY: number;
        let depthAlpha = 1;

        if (isBall[i] === 1) {
          // Ball concentration positioned DIRECTLY behind the platform dock icons
          const bx = ballBaseX[i];
          const by = ballBaseY[i];
          const bz = ballBaseZ[i];
          const r = currentBallCenter.radius * ballRadiusScale[i];

          const rotX = bx * cosA - bz * sinA;
          const rotZ = bx * sinA + bz * cosA;

          homeX = currentBallCenter.x + rotX * r;
          homeY = currentBallCenter.y + by * r;

          // 3D depth perception for ball particles
          depthAlpha = 0.55 + (rotZ + 1) * 0.25;
        } else {
          // Dispersed cloud particles spanning the entire page from top to bottom
          const t = now * driftFreq[i] + driftPhase[i];
          const driftX = Math.cos(t) * 14;
          const driftY = Math.sin(t) * 14;

          homeX = cloudTargetX[i] + driftX;
          homeY = cloudTargetY[i] + driftY;
          depthAlpha = 0.75;
        }

        // Dynamic Cursor Reaction across the entire page & ball
        if (hasPointer && smoothMouseX > -5000) {
          const dx = x[i] - smoothMouseX;
          const dy = y[i] - smoothMouseY;
          const distSq = dx * dx + dy * dy;

          if (distSq < dispersionRadiusSq && distSq > 0.1) {
            const dist = Math.sqrt(distSq);
            const factor = 1 - dist * invDispersionRadius;
            const force = factor * factor * (16 + mouseSpeed * 0.55);
            const invDist = 1 / dist;

            // Disperse outward away from cursor
            vx[i] += dx * invDist * force;
            vy[i] += dy * invDist * force;

            // Fluid drag wake when cursor sweeps through
            if (mouseSpeed > 2.0) {
              vx[i] += mouseVx * factor * 0.16;
              vy[i] += mouseVy * factor * 0.16;
            }
          }
        }

        // Dampening friction & homing tension back to rest coordinates
        vx[i] *= 0.90;
        vy[i] *= 0.90;

        const homing = isBall[i] === 1 ? 0.042 : 0.028;
        vx[i] += (homeX - x[i]) * homing;
        vy[i] += (homeY - y[i]) * homing;

        x[i] += vx[i];
        y[i] += vy[i];

        // Draw particle via pre-rendered hardware sprite
        const sprite = sprites[colorIdx[i]];
        const pSize = size[i] * 2;
        const alpha = baseAlpha[i] * depthAlpha;

        ctx.globalAlpha = Math.min(1, Math.max(0.1, alpha));
        ctx.drawImage(sprite, x[i] - size[i], y[i] - size[i], pSize, pSize);
      }

      ctx.restore();
    };

    const startLoop = () => {
      if (!animId && isVisible) {
        animId = requestAnimationFrame(render);
      }
    };

    const stopLoop = () => {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    };

    // 7. Viewport Intersection Observer (0% CPU/GPU when out of view)
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    startLoop();

    return () => {
      stopLoop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full z-0 pointer-events-none select-none ${className}`}
      style={{ mixBlendMode: "multiply" }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full pointer-events-none select-none"
      />
    </div>
  );
}
