/**
 * Preload Strategy for Episode Thumbnails & Visual Assets
 * Pre-fetches and pre-decodes images into browser memory before they enter the viewport
 * to eliminate layout shifts, decode bottlenecks, and animation frame drops.
 */

export const EPISODE_THUMBNAILS: string[] = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
];

const preloadedUrls = new Set<string>();

/**
 * Preloads and decodes a single image off the main thread using HTMLImageElement.decode()
 */
export const preloadImage = async (url: string): Promise<HTMLImageElement | null> => {
  if (typeof window === 'undefined' || !url) return null;
  if (preloadedUrls.has(url)) return null;

  try {
    const img = new Image();
    img.src = url;
    img.decoding = 'async';

    // Decode off-main-thread so GPU rendering doesn't drop frames during arc rotation
    if ('decode' in img) {
      await img.decode().catch(() => {});
    }

    preloadedUrls.add(url);
    return img;
  } catch (error) {
    console.warn(`Failed to preload image: ${url}`, error);
    return null;
  }
};

/**
 * Preload all episode thumbnail assets concurrently with high priority
 */
export const preloadAllEpisodeThumbnails = (): void => {
  if (typeof window === 'undefined') return;

  // Utilize requestIdleCallback if available, or execute immediately
  const runPreload = () => {
    EPISODE_THUMBNAILS.forEach((url) => {
      preloadImage(url);
    });
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(runPreload, { timeout: 1000 });
  } else {
    setTimeout(runPreload, 50);
  }
};

// Immediate invocation at module evaluation time for fast startup
if (typeof window !== 'undefined') {
  preloadAllEpisodeThumbnails();
}
