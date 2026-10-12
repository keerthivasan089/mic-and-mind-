/**
 * Lightweight, high-performance image URL optimizer
 * Automatically inserts responsive Cloudinary transformations and formats Unsplash URLs.
 * Avoids downloading multi-megabyte source images and prevents decoding jank on the main thread.
 */

const URL_CACHE = new Map<string, string>();

export function optimizePortraitImageUrl(url?: string | null, targetWidth: number = 700): string {
  if (!url || typeof url !== 'string') return '';
  
  const cacheKey = `${url}__${targetWidth}`;
  const cached = URL_CACHE.get(cacheKey);
  if (cached) return cached;

  let result = url;

  // 1. Cloudinary optimization
  // Automatically serve auto-format (AVIF/WebP), auto-quality, and resize to viewport dimensions
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const uploadIndex = url.indexOf('/upload/');
    const prefix = url.substring(0, uploadIndex + 8);
    const suffix = url.substring(uploadIndex + 8);

    // If already has transformation parameters, do not duplicate
    if (
      suffix.startsWith('f_auto') ||
      suffix.startsWith('w_') ||
      suffix.includes(',w_') ||
      suffix.includes('f_auto,q_auto')
    ) {
      result = url;
    } else {
      result = `${prefix}f_auto,q_auto,w_${targetWidth},c_limit/${suffix}`;
    }
  }
  // 2. Unsplash optimization
  else if (url.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('w', String(targetWidth));
      parsed.searchParams.set('q', '80');
      parsed.searchParams.set('auto', 'format');
      result = parsed.toString();
    } catch {
      result = url;
    }
  }

  // Keep cache bounded to prevent memory growth
  if (URL_CACHE.size > 200) {
    const firstKey = URL_CACHE.keys().next().value;
    if (firstKey) URL_CACHE.delete(firstKey);
  }

  URL_CACHE.set(cacheKey, result);
  return result;
}
