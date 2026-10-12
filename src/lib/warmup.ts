/**
 * Critical Asset Warm-Up & Readiness Verification Engine (src/lib/warmup.ts)
 * Backwards-compatible bridge forwarding to the master siteWarmup engine.
 */

export * from './siteWarmup';
import {
  runMasterSiteWarmup,
  SiteWarmupOptions,
  CriticalReadinessReport,
  WarmupProgressReport,
  executeCompositorWarmup,
} from './siteWarmup';

export type WarmupOptions = SiteWarmupOptions & {
  onProgress?: (pct: number, stepName: string) => void;
};

export const warmupMuseumCorridor3D = async (
  optsOrMobile: boolean | { isMobile?: boolean; onProgress?: (pct: number, stepName: string) => void } = false
): Promise<boolean> => {
  const isMobile =
    typeof optsOrMobile === 'boolean' ? optsOrMobile : (optsOrMobile.isMobile ?? false);
  return executeCompositorWarmup(isMobile);
};

export const systematicWarmupAndVerifyReadiness = (options: SiteWarmupOptions = {}) => {
  return runMasterSiteWarmup(options);
};

export const orchestrateFullSiteWarmup = systematicWarmupAndVerifyReadiness;
