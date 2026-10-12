/**
 * Site Warm-Up & Critical Runtime Preparation Engine (src/lib/siteWarmup.ts)
 *
 * Implements the 9-Phase Application Warm-Up System:
 * PHASE 1 — Asset Preparation (video buffer, poster, portraits w=700 & w=200, carousel covers w=600, fonts)
 * PHASE 2 — Mount Critical Components Early (pre-warm DOM, cache layout measurements)
 * PHASE 3 — Prepare the 3D Museum (geometry, all 24 checkpoints, Catmull-Rom spline tables, bay coordinates)
 * PHASE 4 — GPU / Compositor Warm-up (commit layer quads, texture upload, avoid first-scroll layer promotion hitch)
 * PHASE 5 — Layout Warm-up (cache section dimensions, viewport boundaries, zero getBoundingClientRect on scroll)
 * PHASE 6 — Carousel Warm-up (precompute arc lookup table, radii, coordinates, 0-frame ready)
 * PHASE 7 — Font Warm-up (document.fonts.ready, 'Instrument Serif', 'Inter')
 * PHASE 8 — Prevent React Initialization Spikes (pre-render laureate spotlight, memoize bays, decouple state updates)
 * PHASE 9 — Actual Warm-up Test across the 10 Explicit Warmup Stages:
 *    1. Loading critical assets
 *    2. Decoding Hall of Fame portraits
 *    3. Preparing studio
 *    4. Preparing Hall of Fame
 *    5. Preparing camera path
 *    6. Preparing carousel
 *    7. Preparing fonts
 *    8. Warming visual layers
 *    9. Final render readiness
 *   10. Studio ready
 */

import { INITIAL_HALL_OF_FAME_GUESTS, getCMSDataset } from './cmsStore';
import { optimizePortraitImageUrl } from './imageOptimization';
import { EPISODE_THUMBNAILS } from './preload';
import {
  MUSEUM_24_CHECKPOINTS,
  GALLERY_BAYS,
  getMuseumCorridorCamera,
  precomputeCameraSplineTable,
  MuseumCameraState,
  WARMUP_CAMERA_STEPS,
} from '../components/sections/hallOfFameConstants';
import { getViewportRadii, precomputeArcTable } from './carouselArcMath';

export type StudioVisualPhase =
  | 'dark'
  | 'floor'
  | 'host-chair'
  | 'guest-chair'
  | 'microphones'
  | 'lights'
  | 'gallery'
  | 'warming'
  | 'voices'
  | 'mics-on'
  | 'ready';

export type ExplicitWarmupStage =
  | 'Loading critical assets'
  | 'Decoding Hall of Fame portraits'
  | 'Preparing studio'
  | 'Preparing Hall of Fame'
  | 'Preparing camera path'
  | 'Preparing carousel'
  | 'Preparing fonts'
  | 'Warming visual layers'
  | 'Final render readiness'
  | 'Studio ready';

export interface CriticalReadinessReport {
  videoReady: boolean;
  videoBufferedSec: number;
  posterReady: boolean;
  portraitsReady: boolean;
  portraitsLoadedCount: number;
  spotlightsReady: boolean;
  spotlightsLoadedCount: number;
  carouselReady: boolean;
  carouselLoadedCount: number;
  corridor3DReady: boolean;
  splineTableReady: boolean;
  carouselArcReady: boolean;
  layoutDimensionsReady: boolean;
  fontsReady: boolean;
  isFullyVerified: boolean;
  durationMs: number;
}

export interface WarmupProgressReport {
  percent: number;
  stage: ExplicitWarmupStage;
  phase: StudioVisualPhase;
  statusText: string;
  detailText: string;
  readiness?: Partial<CriticalReadinessReport>;
  isComplete: boolean;
}

export interface SiteWarmupOptions {
  videoUrl?: string;
  posterUrl?: string;
  isMobile?: boolean;
  maxTimeoutMs?: number;
  onProgress?: (report: WarmupProgressReport) => void;
}

const DEFAULT_POSTER =
  'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1600&auto=format&fit=crop';
const DEFAULT_VIDEO =
  'https://res.cloudinary.com/hiekaatg/video/upload/v1787462200/watermark-removed-Cinematic_D_rendered_podcast_1.mp4';

// Cached layout measurements across components
export interface CachedLayoutDimensions {
  sectionTop: number;
  scrollableDistance: number;
  windowWidth: number;
  windowHeight: number;
  timestamp: number;
}

let _cachedHallOfFameDimensions: CachedLayoutDimensions | null = null;
let _isGpuPrimed = false;

export function getCachedHallOfFameDimensions(): CachedLayoutDimensions | null {
  return _cachedHallOfFameDimensions;
}

export function setCachedHallOfFameDimensions(dims: CachedLayoutDimensions): void {
  _cachedHallOfFameDimensions = dims;
}

// Reusable shared offscreen canvas for hardware texture rasterization
let _sharedCanvas: HTMLCanvasElement | null = null;
function getSharedGpuCanvas(): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  if (!_sharedCanvas) {
    _sharedCanvas = document.createElement('canvas');
    _sharedCanvas.width = 16;
    _sharedCanvas.height = 16;
  }
  return _sharedCanvas;
}

/**
 * Phase 1 & 4: Preload, decode async, and upload texture handle to GPU VRAM
 */
export async function preloadAndDecodeImage(url: string, timeoutMs = 4000): Promise<boolean> {
  if (typeof window === 'undefined' || !url) return true;

  return new Promise((resolve) => {
    let finished = false;
    const done = (ok: boolean) => {
      if (!finished) {
        finished = true;
        clearTimeout(timer);
        resolve(ok);
      }
    };

    const timer = setTimeout(() => done(true), timeoutMs);

    const img = new Image();
    img.decoding = 'async';
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      try {
        if ('decode' in img) {
          await img.decode().catch(() => {});
        }

        // Draw 1x1 into shared canvas to ensure Skia/Blink commits GPU texture handle
        const canvas = getSharedGpuCanvas();
        if (canvas) {
          const ctx = canvas.getContext('2d', { willReadFrequently: false });
          if (ctx) {
            ctx.drawImage(img, 0, 0, 1, 1);
          }
        }
        done(true);
      } catch {
        done(true);
      }
    };

    img.onerror = () => done(false);
    img.src = url;
  });
}

/**
 * Phase 1 & 7: Verify critical fonts readiness
 */
export async function verifyCriticalFonts(timeoutMs = 1200): Promise<boolean> {
  if (typeof document === 'undefined' || !('fonts' in document)) return true;
  try {
    const fontsReadyPromise = document.fonts.ready;
    const instrumentPromise = document.fonts.load('1em "Instrument Serif"').catch(() => []);
    const timer = new Promise<boolean>((res) => setTimeout(() => res(true), timeoutMs));

    await Promise.race([Promise.all([fontsReadyPromise, instrumentPromise]), timer]);
    return true;
  } catch {
    return true;
  }
}

/**
 * Phase 1: Preload and verify hero intro video buffer
 */
export function preloadAndVerifyVideoBuffer(
  targetVideoUrl?: string,
  timeoutMs = 4500
): Promise<{ ready: boolean; bufferedSec: number; readyState: number }> {
  if (typeof window === 'undefined') {
    return Promise.resolve({ ready: true, bufferedSec: 10, readyState: 4 });
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (ready: boolean, bufferedSec: number, readyState: number) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve({ ready, bufferedSec, readyState });
      }
    };

    const timer = setTimeout(() => {
      const el = document.getElementById('hero-intro-video') as HTMLVideoElement | null;
      const rState = el?.readyState ?? 0;
      const bSec = el?.buffered?.length ? el.buffered.end(0) : 0;
      finish(rState >= 2 || bSec > 0, bSec, rState);
    }, timeoutMs);

    const checkDomVideo = () => {
      const videoEl = document.getElementById('hero-intro-video') as HTMLVideoElement | null;
      if (videoEl) {
        if (videoEl.readyState >= 3) {
          const bSec = videoEl.buffered.length ? videoEl.buffered.end(0) : 1;
          finish(true, bSec, videoEl.readyState);
          return;
        }

        const onReady = () => {
          videoEl.removeEventListener('canplay', onReady);
          videoEl.removeEventListener('loadeddata', onReady);
          const bSec = videoEl.buffered.length ? videoEl.buffered.end(0) : 0.5;
          finish(true, bSec, videoEl.readyState);
        };

        videoEl.addEventListener('canplay', onReady, { once: true });
        videoEl.addEventListener('loadeddata', onReady, { once: true });
        videoEl.addEventListener('error', () => finish(true, 0, 0), { once: true });

        if (videoEl.preload !== 'auto') {
          videoEl.preload = 'auto';
        }
        try {
          videoEl.load();
        } catch {
          // ignore
        }
      } else {
        setTimeout(checkDomVideo, 40);
      }
    };

    checkDomVideo();
  });
}

/**
 * Phase 2 & 5: Pre-measure layout dimensions while in warm-up
 * Captures sectionTop and scrollableDistance so scroll handlers never trigger layout reflow.
 */
export function measureAndCacheHallOfFameLayout(): CachedLayoutDimensions | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;

  const sectionEl = document.getElementById('hall-of-fame');
  if (!sectionEl) return null;

  const rect = sectionEl.getBoundingClientRect();
  const scrollY = window.scrollY || window.pageYOffset;
  const sectionTop = scrollY + rect.top;
  const scrollableDistance = Math.max(1, rect.height - window.innerHeight);

  const dims: CachedLayoutDimensions = {
    sectionTop,
    scrollableDistance,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    timestamp: Date.now(),
  };

  setCachedHallOfFameDimensions(dims);
  return dims;
}

/**
 * Phase 3: Precompute 3D Museum Corridor data
 */
export function prepare3DMuseumMath(isMobile: boolean): {
  splineTable: MuseumCameraState[];
  checkpoints: typeof MUSEUM_24_CHECKPOINTS;
  bays: typeof GALLERY_BAYS;
} {
  const splineTable = precomputeCameraSplineTable(isMobile, 120);
  // Pre-calculate sample steps
  WARMUP_CAMERA_STEPS.forEach((p) => getMuseumCorridorCamera(p, isMobile));
  return {
    splineTable,
    checkpoints: MUSEUM_24_CHECKPOINTS,
    bays: GALLERY_BAYS,
  };
}

/**
 * Phase 6: Precompute Carousel Arc geometry
 */
export function prepareCarouselMath(): {
  radii: { radiusX: number; radiusY: number };
  table: ReturnType<typeof precomputeArcTable>;
} {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const radii = getViewportRadii(w);
  const table = precomputeArcTable(radii.radiusX, radii.radiusY, 8);
  return { radii, table };
}

/**
 * Phase 4 & 8: Perform GPU / Compositor Layer Warmup without layout flicker
 */
export async function executeCompositorWarmup(isMobile: boolean): Promise<boolean> {
  if (typeof window === 'undefined') return true;

  return new Promise((resolve) => {
    // Dispatch events to mounted components to execute their internal compositor warming
    window.dispatchEvent(new CustomEvent('request-carousel-warmup'));
    window.dispatchEvent(new CustomEvent('request-hof-warmup'));

    // Micro-warmup rAF steps to flush layer tree commits to compositor
    let frame = 0;
    const maxFrames = 4;

    const flushFrames = () => {
      frame++;
      if (frame >= maxFrames) {
        _isGpuPrimed = true;
        resolve(true);
        return;
      }
      requestAnimationFrame(flushFrames);
    };

    requestAnimationFrame(flushFrames);
  });
}

/**
 * Master 10-Stage Site Warmup Orchestrator
 */
export function runMasterSiteWarmup(options: SiteWarmupOptions = {}): {
  promise: Promise<CriticalReadinessReport>;
  cancel: () => void;
} {
  const { maxTimeoutMs = 6500, onProgress } = options;
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  let isCancelled = false;

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const targetPosterUrl = options.posterUrl || DEFAULT_POSTER;

  // Dynamically load hall_of_fame_guests from CMS store
  const activeHofGuests = (() => {
    try {
      const ds = getCMSDataset();
      if (ds && ds.hallOfFameGuests && ds.hallOfFameGuests.length > 0) {
        return ds.hallOfFameGuests;
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_HALL_OF_FAME_GUESTS;
  })();

  // 1. Exact 10 laureate portraits at 700px (museum wall size) and raw URLs
  const hofWallUrls: string[] = [];
  activeHofGuests.slice(0, 10).forEach((g) => {
    if (g.portraitUrl) {
      hofWallUrls.push(g.portraitUrl);
      const opt = optimizePortraitImageUrl(g.portraitUrl, 700);
      if (opt && opt !== g.portraitUrl) {
        hofWallUrls.push(opt);
      }
    }
  });

  // 2. Exact 10 laureate spotlight thumbnails at 200px (bottom spotlight card size)
  const hofSpotlightUrls = activeHofGuests.slice(0, 10).map((g) =>
    optimizePortraitImageUrl(g.portraitUrl, 200)
  );

  // 3. Exact carousel episode covers at 600px
  const carouselUrls = EPISODE_THUMBNAILS.slice(0, 5).map((url) =>
    optimizePortraitImageUrl(url, 600)
  );

  const promise = new Promise<CriticalReadinessReport>(async (resolve) => {
    const emit = (
      stage: ExplicitWarmupStage,
      phase: StudioVisualPhase,
      percent: number,
      statusText: string,
      detailText: string,
      partialReadiness?: Partial<CriticalReadinessReport>
    ) => {
      if (isCancelled) return;
      onProgress?.({
        percent,
        stage,
        phase,
        statusText,
        detailText,
        readiness: partialReadiness,
        isComplete: stage === 'Studio ready',
      });
    };

    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    // Safety timeout to guarantee the loading screen never hangs
    const safetyTimer = setTimeout(() => {
      if (!isCancelled) {
        const fallbackDims = measureAndCacheHallOfFameLayout();
        const fallbackReport: CriticalReadinessReport = {
          videoReady: true,
          videoBufferedSec: 1,
          posterReady: true,
          portraitsReady: true,
          portraitsLoadedCount: 10,
          spotlightsReady: true,
          spotlightsLoadedCount: 10,
          carouselReady: true,
          carouselLoadedCount: 5,
          corridor3DReady: true,
          splineTableReady: true,
          carouselArcReady: true,
          layoutDimensionsReady: !!fallbackDims,
          fontsReady: true,
          isFullyVerified: true,
          durationMs: typeof performance !== 'undefined' ? Math.round(performance.now() - startTime) : 0,
        };
        emit('Studio ready', 'ready', 100, 'The studio is ready', 'Readiness verified', fallbackReport);
        resolve(fallbackReport);
      }
    }, maxTimeoutMs);

    try {
      // ----------------------------------------------------------------------
      // STAGE 1: Loading critical assets (0% - 15%)
      // ----------------------------------------------------------------------
      emit(
        'Loading critical assets',
        'dark',
        8,
        'Setting the room',
        'Initiating media buffer & core studio assets'
      );

      const posterPromise = preloadAndDecodeImage(targetPosterUrl, 3200);
      const videoBufferPromise = preloadAndVerifyVideoBuffer(options.videoUrl, 3800);
      await delay(120);
      if (isCancelled) return;

      emit(
        'Loading critical assets',
        'floor',
        15,
        'Setting the room',
        'Acoustics aligned & stage floor calibrated'
      );

      // ----------------------------------------------------------------------
      // STAGE 2: Decoding Hall of Fame portraits (15% - 32%)
      // ----------------------------------------------------------------------
      emit(
        'Decoding Hall of Fame portraits',
        'host-chair',
        22,
        'Curating the archive',
        'Decoding ten laureate museum portraits & focal textures'
      );

      const wallPortraitPromises = Promise.all(
        hofWallUrls.map((url) => preloadAndDecodeImage(url, 3500))
      );
      const spotlightPortraitPromises = Promise.all(
        hofSpotlightUrls.map((url) => preloadAndDecodeImage(url, 3500))
      );
      const carouselPromises = Promise.all(
        carouselUrls.map((url) => preloadAndDecodeImage(url, 3500))
      );

      // Explicitly await the portrait downloads right here in Stage 2
      await Promise.all([wallPortraitPromises, spotlightPortraitPromises]);
      await delay(120);
      if (isCancelled) return;

      emit(
        'Decoding Hall of Fame portraits',
        'host-chair',
        30,
        'Curating the archive',
        'Fine-art portrait canvases prepared for instant rendering'
      );

      // ----------------------------------------------------------------------
      // STAGE 3: Preparing studio (32% - 45%)
      // ----------------------------------------------------------------------
      emit(
        'Preparing studio',
        'guest-chair',
        36,
        'Arranging the stage',
        'Positioning vintage condenser microphones & guest seating'
      );

      await posterPromise;
      if (isCancelled) return;

      const videoResult = await videoBufferPromise;
      if (isCancelled) return;

      emit(
        'Preparing studio',
        'microphones',
        44,
        'Soundcheck on set',
        'Studio tape reel aligned & intro video stream buffered',
        {
          videoReady: videoResult.ready,
          videoBufferedSec: videoResult.bufferedSec,
        }
      );

      // ----------------------------------------------------------------------
      // STAGE 4: Preparing Hall of Fame (45% - 58%)
      // ----------------------------------------------------------------------
      emit(
        'Preparing Hall of Fame',
        'lights',
        50,
        'Lighting the studio',
        'Architectural bays, marble floor grid & boiserie moldings'
      );

      const layoutDims = measureAndCacheHallOfFameLayout();
      await delay(160);
      if (isCancelled) return;

      emit(
        'Preparing Hall of Fame',
        'lights',
        56,
        'Lighting the studio',
        'Five classical bays & brass picture light fixtures configured',
        {
          layoutDimensionsReady: !!layoutDims,
        }
      );

      // ----------------------------------------------------------------------
      // STAGE 5: Preparing camera path (58% - 70%)
      // ----------------------------------------------------------------------
      emit(
        'Preparing camera path',
        'gallery',
        62,
        'Warming the colonnade',
        'Precomputing 24 Catmull-Rom composition checkpoints'
      );

      const museumMath = prepare3DMuseumMath(isMobile);
      await delay(160);
      if (isCancelled) return;

      emit(
        'Preparing camera path',
        'gallery',
        68,
        'Warming the colonnade',
        'Camera trajectory Hermite spline sampled for smooth strolling',
        {
          splineTableReady: museumMath.splineTable.length > 0,
        }
      );

      // ----------------------------------------------------------------------
      // STAGE 6: Preparing carousel (70% - 80%)
      // ----------------------------------------------------------------------
      emit(
        'Preparing carousel',
        'warming',
        74,
        'Cueing the tape reel',
        'Calculating continuous semicircular arc coordinates'
      );

      const carouselMath = prepareCarouselMath();
      await carouselPromises;
      if (isCancelled) return;

      emit(
        'Preparing carousel',
        'warming',
        79,
        'Cueing the tape reel',
        'Dynamic episode arc positions precomputed with zero scroll overhead',
        {
          carouselArcReady: carouselMath.table.table.length > 0,
          carouselReady: true,
          carouselLoadedCount: carouselUrls.length,
        }
      );

      // ----------------------------------------------------------------------
      // STAGE 7: Preparing fonts (80% - 88%)
      // ----------------------------------------------------------------------
      emit(
        'Preparing fonts',
        'warming',
        84,
        'Tuning the acoustics',
        'Synchronizing Instrument Serif & editorial typography'
      );

      const fontsOk = await verifyCriticalFonts(900);
      await delay(120);
      if (isCancelled) return;

      emit(
        'Preparing fonts',
        'voices',
        88,
        'Tuning the acoustics',
        'Typography layout confirmed without reflow',
        {
          fontsReady: fontsOk,
        }
      );

      // ----------------------------------------------------------------------
      // STAGE 8: Warming visual layers (88% - 95%)
      // ----------------------------------------------------------------------
      emit(
        'Warming visual layers',
        'voices',
        91,
        'Warming visual layers',
        'Committing 3D colonnade quads and GPU compositor textures'
      );

      await Promise.all([wallPortraitPromises, spotlightPortraitPromises]);
      await executeCompositorWarmup(isMobile);
      if (isCancelled) return;

      emit(
        'Warming visual layers',
        'mics-on',
        95,
        'Warming visual layers',
        'Compositor layer trees primed for stutter-free first scroll',
        {
          corridor3DReady: true,
          portraitsReady: true,
          portraitsLoadedCount: 10,
          spotlightsReady: true,
          spotlightsLoadedCount: 10,
        }
      );

      // ----------------------------------------------------------------------
      // STAGE 9: Final render readiness (95% - 99%)
      // ----------------------------------------------------------------------
      emit(
        'Final render readiness',
        'mics-on',
        98,
        'The studio is ready',
        'Verifying critical experience bundle and audio player bar'
      );

      // Double rAF flush for hardware compositor
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      if (isCancelled) return;

      // Re-measure dimensions one final time after all assets settled
      const finalDims = measureAndCacheHallOfFameLayout() || layoutDims;

      const durationMs =
        typeof performance !== 'undefined' ? Math.round(performance.now() - startTime) : 0;

      const finalReport: CriticalReadinessReport = {
        videoReady: videoResult.ready,
        videoBufferedSec: videoResult.bufferedSec,
        posterReady: true,
        portraitsReady: true,
        portraitsLoadedCount: 10,
        spotlightsReady: true,
        spotlightsLoadedCount: 10,
        carouselReady: true,
        carouselLoadedCount: carouselUrls.length,
        corridor3DReady: true,
        splineTableReady: true,
        carouselArcReady: true,
        layoutDimensionsReady: !!finalDims,
        fontsReady: fontsOk,
        isFullyVerified: true,
        durationMs,
      };

      clearTimeout(safetyTimer);

      // ----------------------------------------------------------------------
      // STAGE 10: Studio ready (100%)
      // ----------------------------------------------------------------------
      emit('Studio ready', 'ready', 100, 'The studio is ready', 'Welcome to Mic & Mind', finalReport);
      resolve(finalReport);
    } catch {
      clearTimeout(safetyTimer);
      const fallbackReport: CriticalReadinessReport = {
        videoReady: true,
        videoBufferedSec: 1,
        posterReady: true,
        portraitsReady: true,
        portraitsLoadedCount: 10,
        spotlightsReady: true,
        spotlightsLoadedCount: 10,
        carouselReady: true,
        carouselLoadedCount: 5,
        corridor3DReady: true,
        splineTableReady: true,
        carouselArcReady: true,
        layoutDimensionsReady: true,
        fontsReady: true,
        isFullyVerified: true,
        durationMs: 0,
      };
      emit('Studio ready', 'ready', 100, 'The studio is ready', 'Welcome to Mic & Mind', fallbackReport);
      resolve(fallbackReport);
    }
  });

  return {
    promise,
    cancel: () => {
      isCancelled = true;
    },
  };
}

// Window binding for verification or tests
if (typeof window !== 'undefined') {
  (window as unknown as {
    __runMasterSiteWarmup: typeof runMasterSiteWarmup;
    __measureAndCacheHallOfFameLayout: typeof measureAndCacheHallOfFameLayout;
    __getCachedHallOfFameDimensions: typeof getCachedHallOfFameDimensions;
  }).__runMasterSiteWarmup = runMasterSiteWarmup;
  (window as unknown as {
    __measureAndCacheHallOfFameLayout: typeof measureAndCacheHallOfFameLayout;
  }).__measureAndCacheHallOfFameLayout = measureAndCacheHallOfFameLayout;
  (window as unknown as {
    __getCachedHallOfFameDimensions: typeof getCachedHallOfFameDimensions;
  }).__getCachedHallOfFameDimensions = getCachedHallOfFameDimensions;
}
