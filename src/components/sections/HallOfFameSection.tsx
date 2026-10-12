import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Compass, Play, Pause } from 'lucide-react';
import { Episode } from '../../types';
import { useCMSDataset, HallOfFameGuestDocument, INITIAL_HALL_OF_FAME_GUESTS } from '../../lib/cmsStore';
import { mapCmsDocToEpisode } from '../../lib/episodes';
import { legacyIdToUUID } from '../../lib/cmsService';
import { HALL_OF_FAME_CONFIG } from '../../config/hallOfFame';
import { optimizePortraitImageUrl } from '../../lib/imageOptimization';
import {
  CuratedHallOfFameItem,
  MUSEUM_24_CHECKPOINTS,
  getMuseumCorridorCamera,
  GALLERY_BAYS,
  precomputeCameraSplineTable,
  WARMUP_CAMERA_STEPS,
} from './hallOfFameConstants';
import { MuseumCorridor3D } from './MuseumCorridor3D';
import { getCachedHallOfFameDimensions, setCachedHallOfFameDimensions } from '../../lib/siteWarmup';

interface HallOfFameSectionProps {
  episodes?: Episode[];
  currentEpisode: Episode | null;
  isPlaying: boolean;
  onPlayEpisode: (episode: Episode) => void;
  onOpenTranscript?: (episode: Episode) => void;
  searchQuery?: string;
  className?: string;
}

export const HallOfFameSection: React.FC<HallOfFameSectionProps> = ({
  episodes,
  currentEpisode,
  isPlaying,
  onPlayEpisode,
  searchQuery = '',
  className = '',
}) => {
  const cms = useCMSDataset();
  const sectionRef = useRef<HTMLDivElement>(null);
  const worldContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const scrollProgressRef = useRef<number>(0);
  const smoothProgressRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  // Cached layout dimensions to prevent layout thrashing on scroll
  const dimensionsRef = useRef<{ sectionTop: number; scrollableDistance: number }>({
    sectionTop: getCachedHallOfFameDimensions()?.sectionTop ?? 0,
    scrollableDistance: getCachedHallOfFameDimensions()?.scrollableDistance ?? 1,
  });

  const [activeCheckpointIndex, setActiveCheckpointIndex] = useState<number>(0);
  const [activeRank, setActiveRank] = useState<number | null>(null);
  const [isScrollActive, setIsScrollActive] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  // --------------------------------------------------------------------------
  // Screen size detection for responsive perspective & camera calibration
  // --------------------------------------------------------------------------
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      precomputeCameraSplineTable(mobile, 80);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // --------------------------------------------------------------------------
  // Dynamic Hall of Fame CMS Data: Exactly 10 Templates (5 Left, 5 Right)
  // Automatically maps fetched episode data and guest documents to 10 slots.
  // --------------------------------------------------------------------------
  const allEpisodes = useMemo(() => {
    if (episodes && episodes.length > 0) {
      return episodes;
    }
    return (cms.carouselEpisodes || []).map(mapCmsDocToEpisode);
  }, [episodes, cms.carouselEpisodes]);

  const guestDocs = useMemo(() => {
    if (cms.hallOfFameGuests && cms.hallOfFameGuests.length > 0) {
      return cms.hallOfFameGuests;
    }
    return INITIAL_HALL_OF_FAME_GUESTS;
  }, [cms.hallOfFameGuests]);

  // Merge episodes with curated laureates into 10 guaranteed museum slots
  const curatedItems: CuratedHallOfFameItem[] = useMemo(() => {
    const items: CuratedHallOfFameItem[] = [];

    for (let i = 0; i < 10; i++) {
      const guestDoc = guestDocs[i] || INITIAL_HALL_OF_FAME_GUESTS[i % INITIAL_HALL_OF_FAME_GUESTS.length];
      const matchedEpisode =
        allEpisodes.find(
          (ep) =>
            ep.id === guestDoc.episodeId ||
            ep.id === legacyIdToUUID(guestDoc.episodeId) ||
            ep.guest.name.toLowerCase() === guestDoc.name.toLowerCase()
        ) ||
        allEpisodes[i % allEpisodes.length] || {
          id: `hof-ep-${i + 1}`,
          number: guestDoc.episodeNumber || `EP. ${String(i + 1).padStart(2, '0')}`,
          title: `${guestDoc.name}: Masterclass`,
          description: guestDoc.bio || 'Curated archival discussion on leadership, scale, and mastery.',
          date: '2025',
          duration: '1h 14m',
          audioUrl: '',
          coverImage: guestDoc.portraitUrl,
          guest: {
            name: guestDoc.name,
            role: guestDoc.role,
            avatar: guestDoc.portraitUrl,
          },
          category: 'Strategy & Scale',
          stats: { listens: '85k+', shares: '1.4k' },
        };

      items.push({
        guest: guestDoc,
        episode: matchedEpisode,
        rankNumber: i + 1,
      });
    }

    return items;
  }, [guestDocs, allEpisodes]);

  // Background pre-decoding for all featured guest portraits on initial mount
  const featuredGuests = useMemo(() => {
    return curatedItems.map((item) => item.guest);
  }, [curatedItems]);

  useEffect(() => {
    if (!featuredGuests || featuredGuests.length === 0) return;

    featuredGuests.forEach((guest) => {
      if (guest.portraitUrl) {
        const img = new Image();
        img.decoding = 'async';
        img.src = guest.portraitUrl;
        img.decode?.().catch(() => {});

        const optimizedUrl = optimizePortraitImageUrl(guest.portraitUrl, 700);
        if (optimizedUrl && optimizedUrl !== guest.portraitUrl) {
          const optImg = new Image();
          optImg.decoding = 'async';
          optImg.src = optimizedUrl;
          optImg.decode?.().catch(() => {});
        }

        const spotUrl = optimizePortraitImageUrl(guest.portraitUrl, 200);
        if (spotUrl && spotUrl !== guest.portraitUrl) {
          const spotImg = new Image();
          spotImg.decoding = 'async';
          spotImg.src = spotUrl;
          spotImg.decode?.().catch(() => {});
        }
      }
    });
  }, [featuredGuests]);

  // Search filter across laureate name, role, episode title, and quote
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return curatedItems;
    const q = searchQuery.toLowerCase().trim();
    return curatedItems.filter(
      (item) =>
        item.guest.name.toLowerCase().includes(q) ||
        item.guest.role.toLowerCase().includes(q) ||
        item.guest.quote.toLowerCase().includes(q) ||
        item.episode.title.toLowerCase().includes(q)
    );
  }, [curatedItems, searchQuery]);

  // Active focused laureate for the bottom card spotlight (pre-mounted to avoid first-scroll hitch)
  const activeLaureate = useMemo(() => {
    if (activeRank) {
      return filteredItems.find((item) => item.rankNumber === activeRank) || filteredItems[0] || null;
    }
    return filteredItems[0] || null;
  }, [activeRank, filteredItems]);

  const activeCheckpoint = useMemo(() => {
    return MUSEUM_24_CHECKPOINTS[activeCheckpointIndex] || MUSEUM_24_CHECKPOINTS[0];
  }, [activeCheckpointIndex]);

  // --------------------------------------------------------------------------
  // Direct Jump to a specific visual composition checkpoint
  // --------------------------------------------------------------------------
  const handleSelectCheckpoint = useCallback((checkpointIndex: number) => {
    if (checkpointIndex < 0 || checkpointIndex >= MUSEUM_24_CHECKPOINTS.length) return;
    const cp = MUSEUM_24_CHECKPOINTS[checkpointIndex];
    scrollProgressRef.current = cp.p;
    setActiveCheckpointIndex(checkpointIndex);

    if (sectionRef.current) {
      const { sectionTop, scrollableDistance } = dimensionsRef.current;
      const targetScrollY = sectionTop + cp.p * scrollableDistance;
      window.scrollTo({
        top: targetScrollY,
        behavior: 'smooth',
      });
    }
  }, []);

  const handleNextCheckpoint = useCallback(() => {
    const nextIdx = Math.min(MUSEUM_24_CHECKPOINTS.length - 1, activeCheckpointIndex + 1);
    handleSelectCheckpoint(nextIdx);
  }, [activeCheckpointIndex, handleSelectCheckpoint]);

  const handlePrevCheckpoint = useCallback(() => {
    const prevIdx = Math.max(0, activeCheckpointIndex - 1);
    handleSelectCheckpoint(prevIdx);
  }, [activeCheckpointIndex, handleSelectCheckpoint]);

  const handleReturnToStart = useCallback(() => {
    handleSelectCheckpoint(0);
  }, [handleSelectCheckpoint]);

  // --------------------------------------------------------------------------
  // DYNAMIC GPU COMPOSITING LAYER MANAGEMENT
  // Promotes worldContainerRef to a GPU compositing layer with `will-change: transform`
  // only during the active scroll phase, and explicitly removes the property
  // when the section is out of view to release compositor memory and VRAM.
  // --------------------------------------------------------------------------
  const isGpuPromotedRef = useRef<boolean>(false);
  const isInViewRef = useRef<boolean>(false);

  const setGpuPromotion = useCallback((promote: boolean) => {
    if (isGpuPromotedRef.current === promote) return;
    isGpuPromotedRef.current = promote;
    setIsScrollActive(promote);
    if (worldContainerRef.current) {
      if (promote) {
        worldContainerRef.current.style.willChange = 'transform';
      } else {
        worldContainerRef.current.style.removeProperty('will-change');
      }
    }
  }, []);

  // --------------------------------------------------------------------------
  // INTERSECTION OBSERVER FOR VIEWPORT VISIBILITY & GPU LAYER LIFECYCLE
  // --------------------------------------------------------------------------
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const inView = entry.isIntersecting;
        isInViewRef.current = inView;

        if (!inView) {
          // Explicitly remove will-change when out of view
          setGpuPromotion(false);
        } else {
          // In view: check if entering view within the active scroll range [0.01, 0.99]
          const scrollY = window.scrollY || window.pageYOffset;
          const { sectionTop, scrollableDistance } = dimensionsRef.current;
          const rawProgress = (scrollY - sectionTop) / scrollableDistance;
          const inActivePhase = rawProgress >= 0.01 && rawProgress <= 0.99;
          setGpuPromotion(inActivePhase);
        }
      },
      {
        threshold: 0,
        rootMargin: '100px 0px',
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (worldContainerRef.current) {
        worldContainerRef.current.style.removeProperty('will-change');
      }
    };
  }, [setGpuPromotion]);

  // --------------------------------------------------------------------------
  // HIGH-PERFORMANCE SCROLL MEASUREMENT
  // Caches dimensions and synchronizes scrollProgressRef.
  // Never calls getBoundingClientRect() inside the passive scroll event listener.
  // --------------------------------------------------------------------------
  useEffect(() => {
    const updateDimensions = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top;
      const scrollableDistance = rect.height - window.innerHeight;
      const dims = {
        sectionTop,
        scrollableDistance: Math.max(1, scrollableDistance),
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        timestamp: Date.now(),
      };
      dimensionsRef.current = dims;
      setCachedHallOfFameDimensions(dims);
    };

    updateDimensions();

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const { sectionTop, scrollableDistance } = dimensionsRef.current;
      const rawProgress = (scrollY - sectionTop) / scrollableDistance;
      const progress = Math.min(Math.max(rawProgress, 0), 1);
      scrollProgressRef.current = progress;

      // Promote to GPU layer immediately when scrolling into active range [0.01, 0.99]
      if (isInViewRef.current) {
        const inActiveRange = progress >= 0.01 && progress <= 0.99;
        if (inActiveRange) {
          setGpuPromotion(true);
        }
      } else {
        setGpuPromotion(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateDimensions, { passive: true });

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && sectionRef.current) {
      ro = new ResizeObserver(updateDimensions);
      ro.observe(sectionRef.current);
    }

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateDimensions);
      if (ro) ro.disconnect();
    };
  }, [setGpuPromotion]);

  // --------------------------------------------------------------------------
  // CONTINUOUS 60/120FPS RAF CAMERA ENGINE
  // Updates worldContainerRef transform directly in DOM without React re-renders.
  // Decoupled HUD and rank updates prevent frame hitching on first scroll.
  // --------------------------------------------------------------------------
  useEffect(() => {
    let lastCheckpoint = 0;
    let lastActiveFocusRank: number | null = null;
    let lastHudTime = performance.now();

    const tick = (now: number) => {
      const target = scrollProgressRef.current;
      let current = smoothProgressRef.current;

      if (target <= 0 && current <= 0.0001) {
        current = 0;
        smoothProgressRef.current = 0;
      } else {
        const diff = target - current;
        if (Math.abs(diff) > 0.00004) {
          current += diff * 0.085; // Butter-smooth damping
          smoothProgressRef.current = current;
        } else {
          current = target;
          smoothProgressRef.current = target;
        }
      }

      // Maintain will-change: transform on corridor container only during active scroll range [0.01, 0.99]
      if (isInViewRef.current) {
        const inActiveRange = (current >= 0.01 && current <= 0.99) || (target >= 0.01 && target <= 0.99);
        setGpuPromotion(inActiveRange);
      } else {
        setGpuPromotion(false);
      }

      // Compute camera along spline (firmly locked to initialCam when current <= 0)
      const cam = current <= 0 ? initialCam : getMuseumCorridorCamera(current, isMobile);

      // 1. Direct GPU transform on moving camera world container with translateZ(0)
      // At progress <= 0, camera transform remains firmly locked to exact initial rest matrix
      if (worldContainerRef.current) {
        worldContainerRef.current.style.transform = `translateZ(0) rotateX(${-cam.pitch}deg) rotateY(${-cam.yaw}deg) translate3d(${-cam.x}px, ${-cam.y}px, ${-cam.z}px)`;
      }

      // 2. Modulate entrance vista display header (smooth fade out as user scrolls 0% -> 10%)
      if (headerRef.current) {
        const headerOpacity = Math.max(0, 1 - current * 10);
        headerRef.current.style.opacity = `${headerOpacity}`;
        headerRef.current.style.visibility = headerOpacity <= 0.001 ? 'hidden' : 'visible';
      }

      // 3. Low-frequency HUD state synchronization (only when crossing checkpoints or entering bays)
      if (now - lastHudTime > 80 || current === 0 || current === 1) {
        lastHudTime = now;

        // Find closest checkpoint
        let closest = 0;
        let minDiff = Infinity;
        for (let i = 0; i < MUSEUM_24_CHECKPOINTS.length; i++) {
          const d = Math.abs(current - MUSEUM_24_CHECKPOINTS[i].p);
          if (d < minDiff) {
            minDiff = d;
            closest = i;
          }
        }

        // Determine active focused laureate
        let focusedRank: number | null = null;
        if (current > 0.04 && current < 0.88) {
          for (const bay of GALLERY_BAYS) {
            if (bay.leftPortraitIndex !== undefined && bay.rightPortraitIndex !== undefined) {
              const dist = Math.abs(cam.z - bay.zCenter);
              if (dist < 400) {
                if (cam.x < -30 || cam.yaw > 1.5) {
                  focusedRank = bay.leftPortraitIndex + 1;
                } else if (cam.x > 30 || cam.yaw < -1.5) {
                  focusedRank = bay.rightPortraitIndex + 1;
                } else {
                  focusedRank = cam.x <= 0 ? bay.leftPortraitIndex + 1 : bay.rightPortraitIndex + 1;
                }
                break;
              }
            }
          }
        }

        if (closest !== lastCheckpoint) {
          lastCheckpoint = closest;
          setActiveCheckpointIndex(closest);
        }
        if (focusedRank !== lastActiveFocusRank) {
          lastActiveFocusRank = focusedRank;
          setActiveRank(focusedRank);
        }
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isMobile]);

  // --------------------------------------------------------------------------
  // CONTROLLED 3D CAMERA & GPU LAYER WARM-UP ENGINE
  // Listens to warmup orchestrator event during studio preloader phase.
  // Performs a 7-frame GPU camera motion touching Bay 1 (Left & Right walls),
  // ensuring the browser compiles 3D projection shaders, computes transform
  // matrices, and commits textures to VRAM before the preloader disappears.
  // --------------------------------------------------------------------------
  useEffect(() => {
    const handleRequestWarmup = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top;
      const scrollableDistance = rect.height - window.innerHeight;
      const dims = {
        sectionTop,
        scrollableDistance: Math.max(1, scrollableDistance),
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        timestamp: Date.now(),
      };
      dimensionsRef.current = dims;
      setCachedHallOfFameDimensions(dims);

      // Temporarily promote to GPU layer for the preloader warmup frames
      setGpuPromotion(true);

      let stepIdx = 0;
      const steps = WARMUP_CAMERA_STEPS;

      const runFrame = () => {
        if (stepIdx >= steps.length) {
          const initialCam = getMuseumCorridorCamera(0, isMobile);
          if (worldContainerRef.current) {
            worldContainerRef.current.style.transform = `translateZ(0) rotateX(${-initialCam.pitch}deg) rotateY(${-initialCam.yaw}deg) translate3d(${-initialCam.x}px, ${-initialCam.y}px, ${-initialCam.z}px)`;
          }
          // If the section is not in view when warmup completes, remove will-change
          if (!isInViewRef.current) {
            setGpuPromotion(false);
          }
          window.dispatchEvent(new CustomEvent('hof-warmup-done'));
          return;
        }

        const p = steps[stepIdx++];
        const cam = getMuseumCorridorCamera(p, isMobile);
        if (worldContainerRef.current) {
          worldContainerRef.current.style.transform = `translateZ(0) rotateX(${-cam.pitch}deg) rotateY(${-cam.yaw}deg) translate3d(${-cam.x}px, ${-cam.y}px, ${-cam.z}px)`;
        }

        requestAnimationFrame(runFrame);
      };

      requestAnimationFrame(runFrame);
    };

    window.addEventListener('request-hof-warmup', handleRequestWarmup);
    return () => {
      window.removeEventListener('request-hof-warmup', handleRequestWarmup);
    };
  }, [isMobile, setGpuPromotion]);

  // Initial camera orientation for pristine first frame rendering
  const initialCam = useMemo(() => getMuseumCorridorCamera(0, isMobile), [isMobile]);

  const branding = HALL_OF_FAME_CONFIG.branding;

  return (
    <section
      ref={sectionRef}
      id="hall-of-fame"
      aria-label="Hall of Fame Museum Gallery"
      className={`relative w-full h-[320vh] sm:h-[360vh] bg-[#FFF8F0] text-[#431407] ${className}`}
    >
      {/* ============================================================= */}
      {/* 1. STICKY PINNED CAMERA VIEWPORT                              */}
      {/* Visual stage completely filled by the museum architecture     */}
      {/* ============================================================= */}
      <div
        className="w-full h-[100vh] h-[100svh] overflow-hidden select-none bg-[#FFF8F0] sticky top-0"
        style={{
          perspective: isMobile ? '650px' : '850px',
          perspectiveOrigin: '50% 50%',
          transform: 'translateZ(0)',
        }}
      >
        {/* =========================================================== */}
        {/* 2. ENTRANCE VISTA DISPLAY HEADER (Fades 0% -> 10% scroll)   */}
        {/* =========================================================== */}
        <div
          ref={headerRef}
          className="absolute top-0 inset-x-0 z-40 pt-6 sm:pt-9 pb-14 px-6 pointer-events-none flex flex-col items-center text-center select-none"
          style={{
            opacity: 1,
            willChange: 'opacity',
            background:
              'linear-gradient(to bottom, rgba(255, 248, 240, 0.95) 0%, rgba(255, 248, 240, 0.7) 60%, transparent 100%)',
          }}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-1.5 font-mono text-[9px] sm:text-[10px] tracking-[0.35em] uppercase text-[#DD5A1F] font-bold">
            <span>✦</span>
            <span>MIC &amp; MIND</span>
            <span>✦</span>
          </div>

          {/* Title */}
          <h1
            className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#1C140F]"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            HALL OF FAME
          </h1>

          {/* Subtitle */}
          <p className="mt-1 sm:mt-1.5 font-serif italic text-xs sm:text-sm md:text-base text-[#7C2D12]/85 tracking-wide max-w-lg">
            &ldquo;The conversations that stayed with us.&rdquo;
          </p>

          <div className="mt-2.5 flex items-center gap-2 font-mono text-[8px] sm:text-[9px] tracking-[0.25em] text-[#C2410C]/80 uppercase">
            <span>PERMANENT WING</span>
            <span className="w-1 h-1 rounded-full bg-[#EA580C]" />
            <span>{filteredItems.length} LAUREATES</span>
          </div>
        </div>

        {/* =========================================================== */}
        {/* 3. 3D WORLD CONTAINER (The Physical Long Museum Gallery)    */}
        {/* Moves relative to camera forward travel along aisle         */}
        {/* =========================================================== */}
        <div
          ref={worldContainerRef}
          className="absolute left-1/2 top-1/2 w-0 h-0 pointer-events-none"
          style={{
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: `translateZ(0) rotateX(${-initialCam.pitch}deg) rotateY(${-initialCam.yaw}deg) translate3d(${-initialCam.x}px, ${-initialCam.y}px, ${-initialCam.z}px)`,
            ...(isScrollActive ? { willChange: 'transform' } : {}),
          }}
        >
          {/* Memoized Static Corridor Geometry: Renders once with zero scroll reflows */}
          <MuseumCorridor3D
            filteredItems={filteredItems}
            currentEpisode={currentEpisode}
            isPlaying={isPlaying}
            onPlayEpisode={onPlayEpisode}
            activeRank={activeRank}
            onReturnToStart={handleReturnToStart}
          />
        </div>

        {/* =========================================================== */}
        {/* 4. ACTIVE LAUREATE FOCUS SPOTLIGHT CARD (Pre-mounted)       */}
        {/* Pre-rendered & decoded in DOM: Eliminates first-scroll hitch*/}
        {/* =========================================================== */}
        {activeLaureate && (
          <div
            className={`absolute bottom-20 sm:bottom-22 left-1/2 -translate-x-1/2 z-45 w-[92%] sm:w-auto max-w-xl transition-all duration-300 ${
              activeRank !== null
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
            aria-hidden={activeRank === null}
          >
            <div className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#EA580C] shadow-[0_12px_36px_rgba(124,45,18,0.22)] flex items-center justify-between gap-3 sm:gap-4">
              {/* Laureate Thumbnail & Details */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 border-2 border-[#EA580C] shadow-sm">
                  <img
                    src={optimizePortraitImageUrl(
                      activeLaureate.guest.portraitUrl ||
                      activeLaureate.episode.portraitUrl ||
                      activeLaureate.episode.guest.avatar,
                      200
                    )}
                    alt={activeLaureate.guest.name}
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-[#EA580C] font-bold">
                    <span>LAUREATE #{String(activeLaureate.rankNumber).padStart(2, '0')}</span>
                    <span className="text-[#FED7AA]">|</span>
                    <span className="text-[#9A3412] truncate">
                      {activeLaureate.guest.episodeNumber || activeLaureate.episode.number}
                    </span>
                  </div>
                  <div
                    className="font-serif text-xl sm:text-2xl text-[#1C140F] font-normal tracking-tight truncate leading-tight my-0.5"
                    style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                  >
                    {activeLaureate.guest.name}
                  </div>
                  <div
                    className="font-serif italic text-xs sm:text-sm text-[#7C2D12] truncate font-medium"
                    style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                  >
                    {activeLaureate.guest.role}
                  </div>
                </div>
              </div>

              {/* Audio Listen Action */}
              <button
                type="button"
                onClick={() => onPlayEpisode(activeLaureate.episode)}
                className="shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-[#FFFDF8] font-mono text-[10px] sm:text-xs uppercase tracking-wider font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
                title={`Listen to ${activeLaureate.guest.name}'s masterclass`}
              >
                {isPlaying && currentEpisode?.id === activeLaureate.episode.id ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    <span>LISTEN</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* =========================================================== */}
        {/* 5. STORYBOARD COMPOSITION CHECKPOINT VIEWFINDER HUD         */}
        {/* Directly surfaces the 24 reference composition checkpoints */}
        {/* =========================================================== */}
        <div className="absolute bottom-4 inset-x-3 sm:inset-x-6 z-40 flex flex-col sm:flex-row items-center justify-between gap-2 pointer-events-none">
          {/* Active Checkpoint Title & Micro-Navigator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFDF9]/90 border border-[#EA580C]/40 backdrop-blur-md shadow-xs pointer-events-auto">
            <button
              type="button"
              onClick={handlePrevCheckpoint}
              disabled={activeCheckpointIndex === 0}
              className="p-1 rounded-full text-[#7C2D12] hover:text-[#EA580C] hover:bg-[#FFF3E6] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Previous composition angle"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5 px-1 font-mono text-[10px] sm:text-[11px] font-semibold text-[#7C2D12]">
              <Compass className="w-3.5 h-3.5 text-[#EA580C] animate-pulse" />
              <span className="text-[#EA580C] font-bold">
                FRAME {String(activeCheckpoint.frame).padStart(2, '0')}/24
              </span>
              <span className="text-[#FED7AA]">·</span>
              <span className="truncate max-w-[140px] sm:max-w-[220px] text-[#431407]">
                {activeCheckpoint.title}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextCheckpoint}
              disabled={activeCheckpointIndex === MUSEUM_24_CHECKPOINTS.length - 1}
              className="p-1 rounded-full text-[#7C2D12] hover:text-[#EA580C] hover:bg-[#FFF3E6] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Next composition angle"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 24-Step Miniature Timeline Scrub Bar */}
          <div className="flex items-center gap-1 px-3 py-2 rounded-full bg-[#FFFDF9]/90 border border-[#EA580C]/40 backdrop-blur-md shadow-xs pointer-events-auto max-w-full overflow-x-auto">
            {MUSEUM_24_CHECKPOINTS.map((cp, idx) => {
              const isCurrent = activeCheckpointIndex === idx;
              return (
                <button
                  key={`cp-pip-${cp.frame}`}
                  type="button"
                  onClick={() => handleSelectCheckpoint(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    isCurrent
                      ? 'w-5 bg-[#EA580C] shadow-[0_0_8px_#EA580C]'
                      : 'w-1.5 bg-[#FED7AA] hover:bg-[#F97316]/70'
                  }`}
                  title={`Jump to Frame ${cp.frame}: ${cp.title}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
