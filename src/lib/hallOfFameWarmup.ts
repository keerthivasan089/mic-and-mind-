/**
 * Hall of Fame GPU Warm-Up & 3D Geometry Pre-Rendering Engine
 *
 * Pre-renders key 3D geometries and warm-up textures into an offscreen canvas
 * and hidden hardware-accelerated layer during the loading screen to guarantee
 * zero-stutter on the user's very first scroll into the Hall of Fame.
 */

import { INITIAL_HALL_OF_FAME_GUESTS } from './cmsStore';
import { optimizePortraitImageUrl } from './imageOptimization';
import {
  precomputeCameraSplineTable,
  getMuseumCorridorCamera,
  WARMUP_CAMERA_STEPS,
  CuratedHallOfFameItem,
} from '../components/sections/hallOfFameConstants';

export interface PrepareHallOfFameOptions {
  filteredItems?: CuratedHallOfFameItem[];
  isMobile?: boolean;
  timeoutMs?: number;
  onStep?: (stepName: string, progress: number) => void;
}

/**
 * Pre-renders an ornate museum frame with gold metallic gradients,
 * laurel motif, and inner bevel directly into a 2D canvas context.
 */
function drawMuseumFrameToCanvas(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  rankNumber: number,
  guestName: string
) {
  ctx.save();

  // 1. Outer Gilded Frame Drop Shadow
  ctx.shadowColor = 'rgba(124, 45, 18, 0.35)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 10;

  // 2. Outer Bronze/Gilded Molding Border
  const outerBorder = ctx.createLinearGradient(x, y, x + w, y + h);
  outerBorder.addColorStop(0, '#F59E0B'); // Bright amber gold
  outerBorder.addColorStop(0.3, '#D97706'); // Warm gold
  outerBorder.addColorStop(0.7, '#92400E'); // Deep bronze
  outerBorder.addColorStop(1, '#78350F'); // Antique bronze

  ctx.fillStyle = outerBorder;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x, y, w, h, 12) : ctx.rect(x, y, w, h);
  ctx.fill();

  // Reset shadow for inner details
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 3. Inner Molded Bead Liner (Ivory Parchment mat)
  const beadX = x + 10;
  const beadY = y + 10;
  const beadW = w - 20;
  const beadH = h - 20;

  ctx.fillStyle = '#FFF8F0';
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(beadX, beadY, beadW, beadH, 8) : ctx.rect(beadX, beadY, beadW, beadH);
  ctx.fill();

  // 4. Portrait Aperture (Dark Walnut archival mounting)
  const imgX = x + 18;
  const imgY = y + 18;
  const imgW = w - 36;
  const imgH = h - 72;

  ctx.fillStyle = '#1C1917';
  ctx.fillRect(imgX, imgY, imgW, imgH);

  // 5. Museum Brass Archival Nameplate
  const plateX = x + 24;
  const plateY = y + h - 48;
  const plateW = w - 48;
  const plateH = 34;

  const plateGrad = ctx.createLinearGradient(plateX, plateY, plateX, plateY + plateH);
  plateGrad.addColorStop(0, '#FEF3C7');
  plateGrad.addColorStop(0.5, '#FDE68A');
  plateGrad.addColorStop(1, '#D97706');

  ctx.fillStyle = plateGrad;
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(plateX, plateY, plateW, plateH, 4) : ctx.rect(plateX, plateY, plateW, plateH);
  ctx.fill();
  ctx.stroke();

  // Brass Nameplate Engraved Text
  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`NO. ${String(rankNumber).padStart(2, '0')} — ${guestName.toUpperCase()}`, x + w / 2, plateY + plateH / 2);

  ctx.restore();
}

/**
 * Pre-renders key architectural motifs (travertine parquet, fluted columns, coffered ceiling)
 * into an offscreen canvas to commit patterns to GPU raster caches.
 */
function drawArchitecturalMotifsToCanvas(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();

  // A. Travertine Marble Floor with Herringbone Perspective Runner
  const floorGrad = ctx.createLinearGradient(0, height * 0.5, 0, height);
  floorGrad.addColorStop(0, '#FFF5EA');
  floorGrad.addColorStop(0.5, '#FED7AA');
  floorGrad.addColorStop(1, '#FDBA74');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, height * 0.5, width, height * 0.5);

  // Travertine joints
  ctx.strokeStyle = 'rgba(194, 65, 12, 0.15)';
  ctx.lineWidth = 1;
  for (let i = 0; i < width; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, height * 0.5);
    ctx.lineTo(i + (i - width / 2) * 0.4, height);
    ctx.stroke();
  }

  // B. Classical Fluted Pilaster Column Strip
  const colGrad = ctx.createLinearGradient(0, 0, 80, 0);
  colGrad.addColorStop(0, '#FED7AA');
  colGrad.addColorStop(0.5, '#FFF7ED');
  colGrad.addColorStop(1, '#FDBA74');
  ctx.fillStyle = colGrad;
  ctx.fillRect(0, 0, 80, height * 0.5);

  // Fluting lines
  ctx.strokeStyle = 'rgba(234, 88, 12, 0.35)';
  ctx.lineWidth = 1.5;
  for (let c = 8; c < 72; c += 10) {
    ctx.beginPath();
    ctx.moveTo(c, 0);
    ctx.lineTo(c, height * 0.5);
    ctx.stroke();
  }

  // C. Coffered Ceiling Architrave Beam
  const beamGrad = ctx.createLinearGradient(80, 0, width, 60);
  beamGrad.addColorStop(0, '#431407');
  beamGrad.addColorStop(0.5, '#7C2D12');
  beamGrad.addColorStop(1, '#9A3412');
  ctx.fillStyle = beamGrad;
  ctx.fillRect(80, 0, width - 80, 60);

  // Gilded Dentil Moulding
  ctx.fillStyle = '#EA580C';
  for (let d = 90; d < width - 20; d += 24) {
    ctx.fillRect(d, 46, 12, 10);
  }

  ctx.restore();
}

/**
 * Creates an offscreen canvas and pre-renders the 10 Hall of Fame portrait textures
 * and architectural elements into the GPU texture cache.
 */
async function preRenderTexturesToOffscreenCanvas(
  portraits: { name: string; url: string; rank: number }[],
  onStep?: (stepName: string, progress: number) => void
): Promise<void> {
  if (typeof document === 'undefined') return;

  // Dedicated offscreen surface
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  if (!ctx) return;

  onStep?.('Pre-rendering architectural textures', 10);
  drawArchitecturalMotifsToCanvas(ctx, 1024, 1024);

  // Force Skia texture handle allocation
  ctx.getImageData(0, 0, 1, 1);

  // Pre-render the laureate portraits with frames
  for (let i = 0; i < portraits.length; i++) {
    const item = portraits[i];
    const targetW = 280;
    const targetH = 360;
    const posX = (i % 3) * 320 + 20;
    const posY = Math.floor(i / 3) * 340 + 20;

    drawMuseumFrameToCanvas(ctx, posX, posY, targetW, targetH, item.rank, item.name);

    // If an image is available, draw it inside the portrait aperture
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';

      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => resolve(), 800);
        img.onload = () => {
          clearTimeout(timeout);
          try {
            ctx.drawImage(img, posX + 18, posY + 18, targetW - 36, targetH - 72);
            resolve();
          } catch {
            resolve();
          }
        };
        img.onerror = () => {
          clearTimeout(timeout);
          resolve();
        };
        img.src = item.url;
      });
    } catch {
      // Continue silently if single image fails
    }

    onStep?.(`Pre-rendering laureate ${i + 1}/${portraits.length}`, 15 + Math.round((i / portraits.length) * 45));
  }

  // Force final GPU texture commit
  ctx.getImageData(0, 0, 1, 1);
}

/**
 * Mounts a temporary hidden 3D CSS container to compile CSS 3D transformation matrices,
 * perspective projection shaders, and layer quads in the browser compositor before scroll.
 */
async function preRender3DGeometriesInHiddenLayer(
  isMobile: boolean,
  onStep?: (stepName: string, progress: number) => void
): Promise<void> {
  if (typeof document === 'undefined') return;

  return new Promise<void>((resolve) => {
    // 1. Create temporary offscreen staging node
    const stage = document.createElement('div');
    stage.id = 'hof-3d-geometry-warmup';
    stage.setAttribute('aria-hidden', 'true');
    Object.assign(stage.style, {
      position: 'fixed',
      left: '-9999px',
      top: '-9999px',
      width: '800px',
      height: '600px',
      opacity: '0.01',
      pointerEvents: 'none',
      perspective: isMobile ? '650px' : '850px',
      perspectiveOrigin: '50% 50%',
      zIndex: '-999',
      contain: 'strict',
    });

    // 2. World container with 3D transform style
    const world = document.createElement('div');
    Object.assign(world.style, {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: '0px',
      height: '0px',
      transformStyle: 'preserve-3d',
      willChange: 'transform',
    });

    // 3. Architectural 3D planes (Left wall, Right wall, Floor, Ceiling, Bay Threshold)
    const leftWall = document.createElement('div');
    Object.assign(leftWall.style, {
      position: 'absolute',
      left: '-325px',
      top: '-600px',
      width: '650px',
      height: '1200px',
      transform: 'translate3d(-500px, 0px, 0px) rotateY(90deg)',
      transformStyle: 'preserve-3d',
      background: 'linear-gradient(to bottom, #FFFBF5 0%, #FFF5EA 50%, #FEEBD7 100%)',
      borderTop: '4px solid #FDBA74',
      borderBottom: '4px solid #FDBA74',
      willChange: 'transform',
    });

    const rightWall = document.createElement('div');
    Object.assign(rightWall.style, {
      position: 'absolute',
      left: '-325px',
      top: '-600px',
      width: '650px',
      height: '1200px',
      transform: 'translate3d(500px, 0px, 0px) rotateY(-90deg)',
      transformStyle: 'preserve-3d',
      background: 'linear-gradient(to bottom, #FFFBF5 0%, #FFF5EA 50%, #FEEBD7 100%)',
      borderTop: '4px solid #FDBA74',
      borderBottom: '4px solid #FDBA74',
      willChange: 'transform',
    });

    const floor = document.createElement('div');
    Object.assign(floor.style, {
      position: 'absolute',
      left: '-800px',
      top: '-325px',
      width: '1600px',
      height: '650px',
      transform: 'translate3d(0px, 600px, 0px) rotateX(90deg)',
      transformStyle: 'preserve-3d',
      background: 'linear-gradient(to bottom, #FFFBF5 0%, #FFF5EA 50%, #FEEBD7 100%)',
      willChange: 'transform',
    });

    const ceiling = document.createElement('div');
    Object.assign(ceiling.style, {
      position: 'absolute',
      left: '-800px',
      top: '-325px',
      width: '1600px',
      height: '650px',
      transform: 'translate3d(0px, -600px, 0px) rotateX(-90deg)',
      transformStyle: 'preserve-3d',
      background: 'linear-gradient(to bottom, #FFF5EA 0%, #FFFDF9 50%, #FFF5EA 100%)',
      willChange: 'transform',
    });

    world.appendChild(leftWall);
    world.appendChild(rightWall);
    world.appendChild(floor);
    world.appendChild(ceiling);
    stage.appendChild(world);
    document.body.appendChild(stage);

    onStep?.('Compiling 3D corridor projection matrices', 65);

    // 4. Step through key camera checkpoints to trigger hardware compositor matrix compilation
    const warmupSteps = [0.0, 0.05, 0.1, 0.15, 0.0];
    let stepIndex = 0;

    const animateWarmup = () => {
      if (stepIndex >= warmupSteps.length) {
        // Clean up temporary DOM node
        if (stage.parentNode) {
          stage.parentNode.removeChild(stage);
        }
        resolve();
        return;
      }

      const p = warmupSteps[stepIndex++];
      const cam = getMuseumCorridorCamera(p, isMobile);
      world.style.transform = `rotateX(${-cam.pitch}deg) rotateY(${-cam.yaw}deg) translate3d(${-cam.x}px, ${-cam.y}px, ${-cam.z}px)`;

      requestAnimationFrame(animateWarmup);
    };

    requestAnimationFrame(animateWarmup);
  });
}

/**
 * Triggers the live HallOfFameSection event listener if mounted on page.
 */
function triggerLiveSectionEvent(timeoutMs = 1500): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(true);

  return new Promise((resolve) => {
    let resolved = false;
    const finish = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        window.removeEventListener('hof-warmup-done', handleDone);
        resolve(true);
      }
    };

    const timer = setTimeout(finish, timeoutMs);

    const handleDone = () => {
      finish();
    };

    window.addEventListener('hof-warmup-done', handleDone, { once: true });
    window.dispatchEvent(new CustomEvent('request-hof-warmup'));
  });
}

/**
 * Master 'prepareHallOfFame' loading trigger
 *
 * Pre-renders key 3D geometries, architectural elements, and laureate textures
 * into an offscreen canvas and hidden layer during the loading screen to ensure
 * the GPU is fully initialized and warmed up before the first scroll.
 */
export async function prepareHallOfFame(options: PrepareHallOfFameOptions = {}): Promise<boolean> {
  const {
    filteredItems,
    isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    timeoutMs = 2500,
    onStep,
  } = options;

  if (typeof window === 'undefined') return true;

  return new Promise<boolean>(async (resolve) => {
    // Safety fallback timeout: Never hang or block the app
    const safetyTimer = setTimeout(() => {
      resolve(true);
    }, timeoutMs);

    try {
      // 1. Precompute Camera Spline Table for immediate zero-allocation lookup
      onStep?.('Precomputing 3D camera spline tables', 5);
      precomputeCameraSplineTable(isMobile, 120);

      // 2. Prepare portrait texture list
      const portraitsToWarm = (filteredItems && filteredItems.length > 0
        ? filteredItems
        : INITIAL_HALL_OF_FAME_GUESTS.map((g, idx) => ({
            guest: g,
            rankNumber: idx + 1,
            episode: { id: `ep-${idx + 1}` },
          }))
      ).slice(0, 10).map((item) => ({
        name: item.guest.name,
        rank: item.rankNumber,
        url: optimizePortraitImageUrl(item.guest.portraitUrl, 700),
      }));

      // 3. Offscreen Canvas Texture Pre-rendering (Architectural Motifs & Laureates)
      await preRenderTexturesToOffscreenCanvas(portraitsToWarm, onStep);

      // 4. Hidden Hardware-Accelerated 3D Layer Geometry Pre-rendering
      await preRender3DGeometriesInHiddenLayer(isMobile, onStep);

      // 5. Trigger live mounted corridor component if present in DOM
      onStep?.('Aligning active gallery corridor', 90);
      await triggerLiveSectionEvent(1200);

      onStep?.('Hall of Fame GPU ready', 100);
      clearTimeout(safetyTimer);
      resolve(true);
    } catch (err) {
      clearTimeout(safetyTimer);
      resolve(true);
    }
  });
}

// Expose to window for testing or programmatic triggering
if (typeof window !== 'undefined') {
  (window as unknown as { __prepareHallOfFame: typeof prepareHallOfFame }).__prepareHallOfFame = prepareHallOfFame;
}
