export interface ArcTransformData {
  x: number;
  y: number;
  rotateZ: number;
  scale: number;
  opacity: number;
  zIndex: number;
}

export const ARC_ANGLE_STEP = 0.52;
export const ARC_TABLE_RESOLUTION = 2048;

/**
 * Responsive radii lookup based on window viewport width.
 * Cached and evaluated only during resize to prevent layout thrashing.
 */
export function getViewportRadii(windowWidth: number): { radiusX: number; radiusY: number } {
  if (windowWidth < 640) {
    return { radiusX: 290, radiusY: 160 };
  }
  if (windowWidth < 1024) {
    return { radiusX: 420, radiusY: 220 };
  }
  return { radiusX: 540, radiusY: 260 };
}

/**
 * Precomputes high-precision semicircular arc coordinates across the wrapped offset range.
 * Eliminates all trigonometric and per-frame floating calculations from the animation loop.
 */
export function precomputeArcTable(
  radiusX: number,
  radiusY: number,
  maxOffset: number = 8
): { table: ArcTransformData[]; maxOffset: number } {
  const safeMax = Math.max(6, maxOffset);
  const table: ArcTransformData[] = new Array(ARC_TABLE_RESOLUTION);

  for (let i = 0; i < ARC_TABLE_RESOLUTION; i++) {
    const t = i / (ARC_TABLE_RESOLUTION - 1);
    const wrappedOffset = -safeMax + t * (2 * safeMax);
    const angle = wrappedOffset * ARC_ANGLE_STEP;
    const absOffset = Math.abs(wrappedOffset);

    // Continuous semicircular arc coordinate derivation
    const x = radiusX * Math.sin(angle);
    const y = radiusY * (1 - Math.cos(angle)) * 0.7;
    const rotateZ = angle * (180 / Math.PI) * 0.65;

    // Natural depth scaling, atmospheric occlusion, and stacking order
    const scale = Math.max(0.72, 1 - absOffset * 0.12);
    const opacity = Math.max(0.25, 1 - absOffset * 0.28);
    const zIndex = Math.round(50 - absOffset * 10);

    table[i] = { x, y, rotateZ, scale, opacity, zIndex };
  }

  return { table, maxOffset: safeMax };
}

/**
 * High-performance O(1) table lookup for any continuous wrapped offset.
 */
export function lookupArcTransform(
  wrappedOffset: number,
  table: ArcTransformData[],
  maxOffset: number
): ArcTransformData {
  const clamped = Math.max(-maxOffset, Math.min(maxOffset, wrappedOffset));
  const norm = (clamped + maxOffset) / (2 * maxOffset);
  const idx = Math.min(
    table.length - 1,
    Math.max(0, Math.round(norm * (table.length - 1)))
  );
  return table[idx];
}
