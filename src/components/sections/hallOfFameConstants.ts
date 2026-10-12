import { Episode } from '../../types';
import { HallOfFameGuestDocument } from '../../lib/cmsStore';

export interface MuseumVisualCheckpoint {
  frame: number;
  p: number;
  z: number;
  x: number;
  y: number;
  yaw: number;
  pitch: number;
  title: string;
}

export interface CuratedHallOfFameItem {
  guest: HallOfFameGuestDocument;
  episode: Episode;
  rankNumber: number;
}

export interface GalleryBay {
  id: number;
  zCenter: number;
  zFront: number;
  zBack: number;
  leftPortraitIndex?: number;
  rightPortraitIndex?: number;
}

export interface MuseumCameraState {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  progress: number;
}

// 24 visual composition checkpoints derived from the visual storyboard:
export const MUSEUM_24_CHECKPOINTS: MuseumVisualCheckpoint[] = [
  // 1-2: Colonnade Entrance & Approach to Bay 1 (Natural aisle entrance perspective looking diagonally down corridor)
  { frame: 1,  p: 0.00, z: 0,     x: -20,  y: -90, yaw: 2.5,   pitch: 0.0, title: "Grand Colonnade Entrance Vista" },
  { frame: 2,  p: 0.04, z: -200,  x: -30,  y: -90, yaw: 4.0,   pitch: 0.0, title: "Threshold & Left Colonnade Angle" },

  // 3-6: Bay 1 Traversal - Symmetrical Focus on Laureate #01 (Left) & Laureate #02 (Right)
  { frame: 3,  p: 0.08, z: -520,  x: -120, y: -90, yaw: 9.0,   pitch: 0.0, title: "Approaching Laureate #01 (Left Wall)" },
  { frame: 4,  p: 0.12, z: -640,  x: -155, y: -90, yaw: 11.5,  pitch: 0.0, title: "Laureate #01 (Left Wall) In Focus" },
  { frame: 5,  p: 0.16, z: -725,  x: 0,    y: -90, yaw: 0.0,   pitch: 0.0, title: "Central Aisle Glide across Bay 1" },
  { frame: 6,  p: 0.20, z: -810,  x: 155,  y: -90, yaw: -11.5, pitch: 0.0, title: "Laureate #02 (Right Wall) In Focus" },

  // 7-11: Bay 2 Traversal - Symmetrical Focus on Laureate #03 (Left) & Laureate #04 (Right)
  { frame: 7,  p: 0.24, z: -1050, x: 0,    y: -90, yaw: 0.0,   pitch: 0.0, title: "Traversing to Bay 2 Colonnade" },
  { frame: 8,  p: 0.28, z: -1180, x: -120, y: -90, yaw: 9.0,   pitch: 0.0, title: "Approaching Laureate #03 (Left Wall)" },
  { frame: 9,  p: 0.32, z: -1290, x: -155, y: -90, yaw: 11.5,  pitch: 0.0, title: "Laureate #03 (Left Wall) In Focus" },
  { frame: 10, p: 0.36, z: -1375, x: 0,    y: -90, yaw: 0.0,   pitch: 0.0, title: "Central Aisle Glide across Bay 2" },
  { frame: 11, p: 0.40, z: -1460, x: 155,  y: -90, yaw: -11.5, pitch: 0.0, title: "Laureate #04 (Right Wall) In Focus" },

  // 12-16: Bay 3 Traversal - Symmetrical Focus on Laureate #05 (Left) & Laureate #06 (Right)
  { frame: 12, p: 0.44, z: -1700, x: 0,    y: -90, yaw: 0.0,   pitch: 0.0, title: "Traversing to Bay 3 Colonnade" },
  { frame: 13, p: 0.48, z: -1830, x: -120, y: -90, yaw: 9.0,   pitch: 0.0, title: "Approaching Laureate #05 (Left Wall)" },
  { frame: 14, p: 0.52, z: -1940, x: -155, y: -90, yaw: 11.5,  pitch: 0.0, title: "Laureate #05 (Left Wall) In Focus" },
  { frame: 15, p: 0.56, z: -2025, x: 0,    y: -90, yaw: 0.0,   pitch: 0.0, title: "Central Aisle Glide across Bay 3" },
  { frame: 16, p: 0.60, z: -2110, x: 155,  y: -90, yaw: -11.5, pitch: 0.0, title: "Laureate #06 (Right Wall) In Focus" },

  // 17-19: Bay 4 Traversal - Symmetrical Focus on Laureate #07 (Left) & Laureate #08 (Right)
  { frame: 17, p: 0.64, z: -2350, x: 0,    y: -90, yaw: 0.0,   pitch: 0.0, title: "Traversing to Bay 4 Colonnade" },
  { frame: 18, p: 0.68, z: -2590, x: -155, y: -90, yaw: 11.5,  pitch: 0.0, title: "Laureate #07 (Left Wall) In Focus" },
  { frame: 19, p: 0.72, z: -2760, x: 155,  y: -90, yaw: -11.5, pitch: 0.0, title: "Laureate #08 (Right Wall) In Focus" },

  // 20-22: Bay 5 Traversal - Symmetrical Focus on Laureate #09 (Left) & Laureate #10 (Right)
  { frame: 20, p: 0.76, z: -3000, x: 0,    y: -90, yaw: 0.0,   pitch: 0.0, title: "Traversing to Bay 5 Colonnade" },
  { frame: 21, p: 0.80, z: -3240, x: -155, y: -90, yaw: 11.5,  pitch: 0.0, title: "Laureate #09 (Left Wall) In Focus" },
  { frame: 22, p: 0.84, z: -3410, x: 155,  y: -90, yaw: -11.5, pitch: 0.0, title: "Laureate #10 (Right Wall) In Focus" },

  // 23-24: Grand Axial Arrival & Monumental Center Arch Vista
  { frame: 23, p: 0.92, z: -3850, x: 0,    y: -90, yaw: 0.0,   pitch: 0.0, title: "Axial Approach to Monumental Portal" },
  { frame: 24, p: 1.00, z: -4160, x: 0,    y: -90, yaw: 0.0,   pitch: 0.0, title: "Monumental Hall of Fame Center Wall Vista" },
];

// Standard Catmull-Rom cubic spline interpolator for seamless C1 trajectory continuity
export function catmullRomSpline(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (
    (2 * p1) +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t3
  );
}

export function getMuseumCorridorCamera(p: number, isMobile: boolean = false): MuseumCameraState {
  const clampedP = Math.max(0, Math.min(1, p));

  // Firm rest lock at progress <= 0 with zero floating-point oscillation
  if (clampedP <= 0) {
    const rest = MUSEUM_24_CHECKPOINTS[0];
    return {
      x: isMobile ? rest.x * 0.55 : rest.x,
      y: isMobile ? rest.y * 0.80 : rest.y,
      z: rest.z,
      yaw: isMobile ? rest.yaw * 0.90 : rest.yaw,
      pitch: rest.pitch,
      progress: 0,
    };
  }

  // Smooth Hermite cubic ease-in (t * t * (3 - 2 * t)) for the first 3% of the track.
  // Guarantees zero velocity at progress 0.00 and eliminates camera jerkiness on the first scroll tick.
  let effectiveP = clampedP;
  if (clampedP < 0.03) {
    const t = clampedP / 0.03;
    effectiveP = t * t * (3 - 2 * t) * 0.03;
  }

  let idx = 0;
  for (let i = 0; i < MUSEUM_24_CHECKPOINTS.length - 1; i++) {
    if (effectiveP >= MUSEUM_24_CHECKPOINTS[i].p && effectiveP <= MUSEUM_24_CHECKPOINTS[i + 1].p) {
      idx = i;
      break;
    }
  }

  const p1 = MUSEUM_24_CHECKPOINTS[idx];
  const p2 = MUSEUM_24_CHECKPOINTS[Math.min(MUSEUM_24_CHECKPOINTS.length - 1, idx + 1)];
  const p0 = MUSEUM_24_CHECKPOINTS[Math.max(0, idx - 1)];
  const p3 = MUSEUM_24_CHECKPOINTS[Math.min(MUSEUM_24_CHECKPOINTS.length - 1, idx + 2)];

  const segLen = p2.p - p1.p;
  const t = segLen <= 0.0001 ? 0 : Math.max(0, Math.min(1, (effectiveP - p1.p) / segLen));

  const rawX = catmullRomSpline(p0.x, p1.x, p2.x, p3.x, t);
  const rawY = catmullRomSpline(p0.y, p1.y, p2.y, p3.y, t);
  const rawZ = catmullRomSpline(p0.z, p1.z, p2.z, p3.z, t);
  const rawYaw = catmullRomSpline(p0.yaw, p1.yaw, p2.yaw, p3.yaw, t);
  const rawPitch = catmullRomSpline(p0.pitch, p1.pitch, p2.pitch, p3.pitch, t);

  let x = rawX;
  let y = rawY;
  let z = rawZ;
  let yaw = rawYaw;
  let pitch = rawPitch;

  if (isMobile) {
    x = rawX * 0.55;
    y = rawY * 0.80;
    yaw = rawYaw * 0.90;
  }

  return {
    x,
    y,
    z,
    yaw,
    pitch,
    progress: clampedP,
  };
}

// Pre-calculated camera state lookup table for zero-allocation runtime sampling
export const WARMUP_CAMERA_STEPS = [0.0, 0.04, 0.08, 0.12, 0.16, 0.20, 0.0];

let cachedSplineTableDesktop: MuseumCameraState[] | null = null;
let cachedSplineTableMobile: MuseumCameraState[] | null = null;

export function precomputeCameraSplineTable(isMobile = false, samples = 100): MuseumCameraState[] {
  if (isMobile && cachedSplineTableMobile) return cachedSplineTableMobile;
  if (!isMobile && cachedSplineTableDesktop) return cachedSplineTableDesktop;

  const table: MuseumCameraState[] = [];
  for (let i = 0; i <= samples; i++) {
    const p = i / samples;
    table.push(getMuseumCorridorCamera(p, isMobile));
  }

  if (isMobile) {
    cachedSplineTableMobile = table;
  } else {
    cachedSplineTableDesktop = table;
  }

  return table;
}

// Modular Architectural Bays along the Continuous Corridor (All Z <= 0, preventing negative-Z clipping)
export const GALLERY_BAYS: GalleryBay[] = [
  { id: 0, zCenter: -200, zFront: 0, zBack: -400 },                                                   // Entrance Colonnade Threshold
  { id: 1, zCenter: -725, zFront: -400, zBack: -1050, leftPortraitIndex: 0, rightPortraitIndex: 1 },    // Laureate #1 (Left) & #2 (Right)
  { id: 2, zCenter: -1375, zFront: -1050, zBack: -1700, leftPortraitIndex: 2, rightPortraitIndex: 3 }, // Laureate #3 (Left) & #4 (Right)
  { id: 3, zCenter: -2025, zFront: -1700, zBack: -2350, leftPortraitIndex: 4, rightPortraitIndex: 5 }, // Laureate #5 (Left) & #6 (Right)
  { id: 4, zCenter: -2675, zFront: -2350, zBack: -3000, leftPortraitIndex: 6, rightPortraitIndex: 7 }, // Laureate #7 (Left) & #8 (Right)
  { id: 5, zCenter: -3325, zFront: -3000, zBack: -3650, leftPortraitIndex: 8, rightPortraitIndex: 9 }, // Laureate #9 (Left) & #10 (Right)
  { id: 6, zCenter: -3975, zFront: -3650, zBack: -4300 },                                             // Grand Mastery Portal Arch Vestibule
];
