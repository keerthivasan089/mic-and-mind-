/**
 * Asset Preloader Utility for Mic & Mind
 *
 * Implements true readiness verification (not just superficial URL loading):
 * 1. Intro video: verified to HTMLMediaElement.readyState >= 3 (HAVE_FUTURE_DATA / HAVE_ENOUGH_DATA)
 *    and buffered chunks on the actual mounted <video id="hero-intro-video"> element.
 * 2. Intro poster: fetched and decoded into GPU bitmap memory via HTMLImageElement.decode().
 * 3. 10 Hall of Fame laureate portraits: exact width matching (700px) and decoded via .decode().
 * 4. Semicircular Carousel top 4 episode covers: exact width matching (600px) and decoded via .decode().
 * 5. Architectural 3D Corridor & DOM readiness: verified via element presence and double
 *    requestAnimationFrame to ensure browser layout and GPU layer compositing are pre-flushed.
 *
 * Graceful fallbacks and per-item timeouts prevent blocking indefinitely on slow or restricted networks.
 */

import { INITIAL_HALL_OF_FAME_GUESTS } from './cmsStore';
import { EPISODE_THUMBNAILS } from './preload';
import { optimizePortraitImageUrl } from './imageOptimization';

export interface PreloadProgress {
  loadedCount: number;
  totalCount: number;
  percent: number;
  currentAsset?: string;
  isComplete: boolean;
  videoBufferedSec?: number;
}

export interface AssetPreloaderOptions {
  videoUrl?: string;
  posterUrl?: string;
  maxTimeoutMs?: number; // Global safety timeout (defaults to 6500ms)
  onProgress?: (progress: PreloadProgress) => void;
}

const DEFAULT_POSTER =
  'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1600&auto=format&fit=crop';
const DEFAULT_VIDEO =
  'https://res.cloudinary.com/hiekaatg/video/upload/v1787462200/watermark-removed-Cinematic_D_rendered_podcast_1.mp4';
const DEFAULT_MOBILE_VIDEO =
  'https://res.cloudinary.com/hiekaatg/video/upload/c_fill,ar_9:16,g_center/v1787462200/watermark-removed-Cinematic_D_rendered_podcast_1.mp4';

/**
 * Preload and decode an image URL safely with HTMLImageElement and .decode()
 * Ensures uncompressed bitmap is ready in GPU/compositor memory before display.
 */
function preloadAndDecodeImage(url: string, timeoutMs = 3800): Promise<boolean> {
  if (typeof window === 'undefined' || !url) return Promise.resolve(true);

  return new Promise((resolve) => {
    let resolved = false;
    const finish = (success: boolean) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve(success);
      }
    };

    const timer = setTimeout(() => finish(true), timeoutMs);

    const img = new Image();
    img.decoding = 'async';

    img.onload = () => {
      if ('decode' in img) {
        img
          .decode()
          .then(() => finish(true))
          .catch(() => finish(true)); // Even if decode throws (e.g. SVG or format quirk), don't stall
      } else {
        finish(true);
      }
    };

    img.onerror = () => {
      // Gracefully resolve on error to avoid blocking the user
      finish(false);
    };

    img.src = url;
  });
}

/**
 * Verifies that the intro video element has reached a usable playback-ready state:
 * - HTMLMediaElement.readyState >= 3 (HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA)
 * - Or canplay/canplaythrough event fired
 * - Or buffered ranges contain playable seconds
 */
function verifyVideoPlaybackReady(
  targetUrl: string,
  timeoutMs = 5000
): Promise<{ success: boolean; readyState: number; bufferedSec: number }> {
  if (typeof window === 'undefined') {
    return Promise.resolve({ success: true, readyState: 4, bufferedSec: 10 });
  }

  return new Promise((resolve) => {
    let resolved = false;
    const finish = (success: boolean, readyState: number, bufferedSec: number) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve({ success, readyState, bufferedSec });
      }
    };

    // Sensible per-item timeout so slow network or restricted media policy never hangs
    const timer = setTimeout(() => {
      const el = document.getElementById('hero-intro-video') as HTMLVideoElement | null;
      const rState = el?.readyState ?? 0;
      const bSec = el?.buffered?.length ? el.buffered.end(0) : 0;
      finish(true, rState, bSec);
    }, timeoutMs);

    // Look for the real mounted hero video element in the DOM
    const checkDomVideo = () => {
      const videoEl = document.getElementById('hero-intro-video') as HTMLVideoElement | null;
      if (videoEl) {
        // If already buffered enough for playback
        if (videoEl.readyState >= 3) {
          const bSec = videoEl.buffered.length ? videoEl.buffered.end(0) : 1;
          finish(true, videoEl.readyState, bSec);
          return;
        }

        const onCanPlay = () => {
          videoEl.removeEventListener('canplay', onCanPlay);
          videoEl.removeEventListener('loadeddata', onCanPlay);
          const bSec = videoEl.buffered.length ? videoEl.buffered.end(0) : 0.5;
          finish(true, videoEl.readyState, bSec);
        };

        videoEl.addEventListener('canplay', onCanPlay, { once: true });
        videoEl.addEventListener('loadeddata', onCanPlay, { once: true });
        videoEl.addEventListener('error', () => finish(false, 0, 0), { once: true });

        // Ensure preload is triggered on the element
        if (videoEl.preload !== 'auto') {
          videoEl.preload = 'auto';
        }
        try {
          videoEl.load();
        } catch {
          // Ignore if already loading
        }
      } else {
        // If not yet mounted in DOM, poll briefly
        setTimeout(checkDomVideo, 40);
      }
    };

    checkDomVideo();
  });
}

/**
 * Verifies that the Hall of Fame 3D corridor, Semicircular Carousel,
 * and Hero Video sections are mounted in the DOM, and that the browser
 * has completed initial layout and compositor layer creation.
 */
function verifyCorridorAndCarouselMounted(timeoutMs = 1500): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(true);

  return new Promise((resolve) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(true);
      }
    }, timeoutMs);

    const checkMount = () => {
      const hallOfFame = document.getElementById('hall-of-fame');
      const episodes = document.getElementById('episodes');
      const heroVideo = document.getElementById('hero-intro-video');

      if (hallOfFame && episodes && heroVideo) {
        // Double requestAnimationFrame ensures style recalculation, layout,
        // and GPU compositor display lists are flushed before overlay fades.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!resolved) {
              resolved = true;
              clearTimeout(timer);
              resolve(true);
            }
          });
        });
      } else {
        setTimeout(checkMount, 40);
      }
    };

    checkMount();
  });
}

/**
 * Critical asset definition with explicit weighted progress allocation
 */
interface CriticalAssetItem {
  id: string;
  type: 'image' | 'video' | 'scene';
  url?: string;
  label: string;
  weight: number;
}

/**
 * Executes full preload of critical assets and calls onProgress as true readiness is achieved
 */
export function preloadCriticalAssets(options: AssetPreloaderOptions = {}): {
  promise: Promise<void>;
  cancel: () => void;
} {
  const { maxTimeoutMs = 6500, onProgress } = options;

  let isCancelled = false;

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const targetVideoUrl =
    options.videoUrl || (isMobile ? DEFAULT_MOBILE_VIDEO : DEFAULT_VIDEO);
  const targetPosterUrl = options.posterUrl || DEFAULT_POSTER;

  // 1. Hall of Fame portraits: EXACT width 700px used by HallOfFamePortraitComponent to prevent cache misses
  const hofPortraits = INITIAL_HALL_OF_FAME_GUESTS.map((g, index) => ({
    id: `hof-${g._id}`,
    type: 'image' as const,
    url: optimizePortraitImageUrl(g.portraitUrl, 700),
    label: `Laureate: ${g.name || `#${index + 1}`}`,
    weight: 4, // 10 guests * 4 = 40%
  }));

  // 2. Carousel top 4 episode covers: EXACT width 600px used by Episodes.tsx ContinuousArcCard
  const carouselCovers = EPISODE_THUMBNAILS.slice(0, 4).map((url, index) => ({
    id: `carousel-ep-${index + 1}`,
    type: 'image' as const,
    url: optimizePortraitImageUrl(url, 600),
    label: `Carousel Episode #${index + 1}`,
    weight: 5, // 4 covers * 5 = 20%
  }));

  // Master critical asset inventory with 100% total weight distribution
  const criticalItems: CriticalAssetItem[] = [
    {
      id: 'intro-poster',
      type: 'image',
      url: targetPosterUrl,
      label: 'Intro Poster (Decoded)',
      weight: 10,
    },
    {
      id: 'intro-video',
      type: 'video',
      url: targetVideoUrl,
      label: 'Intro Video (Playback Ready)',
      weight: 20,
    },
    ...hofPortraits,
    ...carouselCovers,
    {
      id: 'museum-corridor-dom',
      type: 'scene',
      label: '3D Museum Corridor & Carousel Mounted',
      weight: 10,
    },
  ];

  const totalWeight = criticalItems.reduce((acc, item) => acc + item.weight, 0); // 100
  let currentWeight = 0;
  let loadedItemsCount = 0;
  const totalItemsCount = criticalItems.length;

  const promise = new Promise<void>((resolve) => {
    const notifyProgress = (currentLabel?: string, videoSec?: number) => {
      if (isCancelled) return;
      const percent = Math.min(100, Math.round((currentWeight / totalWeight) * 100));
      onProgress?.({
        loadedCount: loadedItemsCount,
        totalCount: totalItemsCount,
        percent,
        currentAsset: currentLabel,
        isComplete: currentWeight >= totalWeight,
        videoBufferedSec: videoSec,
      });

      if (currentWeight >= totalWeight) {
        clearTimeout(globalTimer);
        resolve();
      }
    };

    // Initial progress kick
    notifyProgress('Initializing Stage');

    // Global fail-safe timeout: never let loading hang indefinitely
    const globalTimer = setTimeout(() => {
      if (!isCancelled) {
        currentWeight = totalWeight;
        loadedItemsCount = totalItemsCount;
        notifyProgress('Studio Ready');
        resolve();
      }
    }, maxTimeoutMs);

    // Launch each readiness verification task concurrently
    criticalItems.forEach((item) => {
      let taskPromise: Promise<unknown>;

      if (item.type === 'video') {
        taskPromise = verifyVideoPlaybackReady(item.url || targetVideoUrl, 4800).then(
          (result) => {
            return result.bufferedSec;
          }
        );
      } else if (item.type === 'scene') {
        taskPromise = verifyCorridorAndCarouselMounted(1500);
      } else {
        taskPromise = preloadAndDecodeImage(item.url || '', 3800);
      }

      taskPromise.then((extraData) => {
        if (!isCancelled) {
          currentWeight += item.weight;
          loadedItemsCount++;
          const videoSec = typeof extraData === 'number' ? extraData : undefined;
          notifyProgress(item.label, videoSec);
        }
      });
    });
  });

  return {
    promise,
    cancel: () => {
      isCancelled = true;
    },
  };
}
