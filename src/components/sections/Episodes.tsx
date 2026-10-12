import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Headphones,
  TrendingUp,
  Bookmark,
  Share2,
  Search,
  X,
  FileText,
} from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react';
import { Button } from '../ui/Button';
import { Episode } from '../../types';
import { useCMSDataset } from '../../lib/cmsStore';
import { mapCmsDocToEpisode } from '../../lib/episodes';
import { AmbientParticles } from '../ui/AmbientParticles';
import { optimizePortraitImageUrl } from '../../lib/imageOptimization';
import {
  getViewportRadii,
  precomputeArcTable,
  lookupArcTransform,
  ArcTransformData,
} from '../../lib/carouselArcMath';

interface EpisodesProps {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  onPlayEpisode: (episode: Episode) => void;
  onOpenTranscript?: (episode: Episode) => void;
  searchQuery?: string;
  onClearSearch?: () => void;
}

// Local storage key for saving episodes to "Listen Later"
const SAVED_EPISODES_STORAGE_KEY = 'mic_mind_listen_later_episodes';

// Rich guest photos with warm studio lighting
const EPISODE_COVERS: Record<string, string> = {
  'ep-042': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
  'ep-041': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
  'ep-040': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
  'ep-039': 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=800&auto=format&fit=crop',
};

// Curated highlights and popularity stats for famous playlist appeal
const PLAYLIST_TAGS: Record<string, { ranking: string; plays: string; badge: string }> = {
  'ep-042': { ranking: '#1 Trending', plays: '148K Listens', badge: 'Editor’s Choice' },
  'ep-041': { ranking: '#2 Most Shared', plays: '112K Listens', badge: 'Fan Favorite' },
  'ep-040': { ranking: '#3 Deep Dive', plays: '98K Listens', badge: 'Must Listen' },
  'ep-039': { ranking: '#4 Masterclass', plays: '86K Listens', badge: 'Essential' },
};

interface ContinuousArcCardProps {
  episode: Episode;
  index: number;
  currentEpisode: Episode | null;
  isPlaying: boolean;
  isSaved: boolean;
  onToggleSave: (episodeId: string, e?: React.MouseEvent) => void;
  onShareEpisode: (episode: Episode, e?: React.MouseEvent) => void;
  onPlayEpisode: (episode: Episode) => void;
  onOpenTranscript?: (episode: Episode) => void;
  onCardClick: (index: number) => void;
}

const ContinuousArcCard = React.memo(
  React.forwardRef<HTMLDivElement, ContinuousArcCardProps>(
    (
      {
        episode,
        index,
        currentEpisode,
        isPlaying,
        isSaved,
        onToggleSave,
        onShareEpisode,
        onPlayEpisode,
        onOpenTranscript,
        onCardClick,
      },
      ref
    ) => {
      const [isHovered, setIsHovered] = useState(false);

      const isCurrentPlaying = currentEpisode?.id === episode.id && isPlaying;
      const isCurrentSelected = currentEpisode?.id === episode.id;

      const rawCoverImg =
        episode.portraitUrl ||
        episode.guest.avatar ||
        EPISODE_COVERS[episode.id] ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop';
      const coverImg = optimizePortraitImageUrl(rawCoverImg, 600);

      const meta = {
        ranking: episode.rankingLabel || PLAYLIST_TAGS[episode.id]?.ranking || `#${index + 1} Spotlight`,
        plays: episode.listenCount || PLAYLIST_TAGS[episode.id]?.plays || '100K Listens',
        badge: episode.trendingBadge || PLAYLIST_TAGS[episode.id]?.badge || 'Trending',
      };

      const shouldReduceMotion = useReducedMotion();
      const mouseX = useMotionValue(0);
      const mouseY = useMotionValue(0);

      // Responsive spring physics config: smooth, organic damping
      const springConfig = { damping: 22, stiffness: 180, mass: 0.15 };
      const magneticShiftX = useSpring(
        useTransform(mouseX, [-0.5, 0.5], [-12, 12]),
        springConfig
      );
      const magneticShiftY = useSpring(
        useTransform(mouseY, [-0.5, 0.5], [-12, 12]),
        springConfig
      );
      const tiltX = useSpring(
        useTransform(mouseY, [-0.5, 0.5], [8, -8]),
        springConfig
      );
      const tiltY = useSpring(
        useTransform(mouseX, [-0.5, 0.5], [-8, 8]),
        springConfig
      );
      const thumbnailScale = useSpring(isHovered ? 1.08 : 1, springConfig);

      const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (shouldReduceMotion) return;
        const rect = e.currentTarget.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const normalizedX = Math.max(-0.5, Math.min(0.5, (e.clientX - rect.left) / rect.width - 0.5));
          const normalizedY = Math.max(-0.5, Math.min(0.5, (e.clientY - rect.top) / rect.height - 0.5));
          mouseX.set(normalizedX);
          mouseY.set(normalizedY);
        }
      };

      const handleMouseEnter = () => {
        setIsHovered(true);
      };

      const handleMouseLeave = () => {
        setIsHovered(false);
        mouseX.set(0);
        mouseY.set(0);
      };

      return (
        <div
          ref={ref}
          onClick={() => onCardClick(index)}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            willChange: 'transform, opacity',
            perspective: 900,
          }}
          className={`absolute w-[280px] sm:w-[320px] md:w-[340px] h-[400px] sm:h-[430px] md:h-[450px] rounded-3xl overflow-hidden p-6 flex flex-col justify-between cursor-pointer select-none bg-ink border transition-[border-color,box-shadow,background-color] duration-300 ${
            isCurrentPlaying
              ? 'shadow-[0_20px_55px_rgba(221,90,31,0.45)] border-orange ring-2 ring-orange/50'
              : isCurrentSelected
              ? 'shadow-[0_20px_50px_rgba(221,90,31,0.35)] border-orange ring-2 ring-orange/30'
              : 'shadow-[0_15px_40px_rgba(20,13,9,0.3)] border-white/10 hover:border-white/25'
          }`}
        >
          {/* Background Portrait Image with 3D Magnetic Tilt and Cursor Following */}
          <motion.div
            style={
              shouldReduceMotion
                ? { width: '100%', height: '100%' }
                : {
                    x: magneticShiftX,
                    y: magneticShiftY,
                    rotateX: tiltX,
                    rotateY: tiltY,
                    scale: thumbnailScale,
                    transformStyle: 'preserve-3d',
                  }
            }
            className="absolute inset-0 w-full h-full z-0 pointer-events-none will-change-transform"
          >
            <img
              src={coverImg}
              alt={episode.title}
              decoding="async"
              loading={index < 4 ? 'eager' : 'lazy'}
              className="w-full h-full object-cover object-center pointer-events-none"
            />

            {/* Dynamic Magnetic Sheen / Specular Light Reflection on Tilt */}
            {isHovered && !shouldReduceMotion && (
              <div
                style={{
                  background:
                    'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.35) 0%, rgba(221,90,31,0.15) 45%, transparent 75%)',
                }}
                className="absolute inset-0 pointer-events-none mix-blend-overlay animate-in fade-in duration-200"
              />
            )}
          </motion.div>

          {/* Dark Studio Vignette Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#120B08] via-[#120B08]/65 to-black/40 z-0 pointer-events-none" />

          {/* Top Floating Badges & Bookmark Action */}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded-full bg-ink/80 text-orange border border-orange/30 backdrop-blur-md shadow-xs">
                {episode.number}
              </span>

              {/* Listen Later Saved Badge on Card */}
              {isSaved && (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase font-bold text-white bg-orange px-2.5 py-1 rounded-full border border-white/20 shadow-md backdrop-blur-md animate-in fade-in">
                  <Bookmark className="w-2.5 h-2.5 fill-current" />
                  Saved
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] text-white/90 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
                <TrendingUp className="w-3 h-3 text-[#FF8542]" />
                {meta.ranking}
              </span>

              {/* Bookmark Button */}
              <button
                type="button"
                id={`arc-bookmark-btn-${episode.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(episode.id, e);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border ${
                  isSaved
                    ? 'bg-[#DD5A1F] text-white border-white/30 shadow-md scale-105'
                    : 'bg-black/40 text-white/80 hover:text-white border-white/15 hover:bg-black/60'
                }`}
                title={isSaved ? 'Remove from Listen Later' : 'Save to Listen Later'}
                aria-label={
                  isSaved
                    ? `Remove ${episode.title} from Listen Later`
                    : `Save ${episode.title} to Listen Later`
                }
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              </button>

              {/* Share Button */}
              <button
                type="button"
                id={`arc-share-btn-${episode.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onShareEpisode(episode, e);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border bg-black/40 text-white/80 hover:text-white border-white/15 hover:bg-black/60 active:scale-95 shadow-xs"
                title={`Share ${episode.title}`}
                aria-label={`Share ${episode.title}`}
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Center Play Button Overlay */}
          <div className="relative z-10 my-auto self-center flex flex-col items-center gap-2">
            <button
              type="button"
              id={`arc-play-btn-${episode.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onPlayEpisode(episode);
              }}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
                isCurrentPlaying
                  ? 'bg-ink text-white ring-4 ring-orange scale-105'
                  : 'bg-orange text-white hover:bg-orange-deep hover:scale-110 shadow-orange/40'
              }`}
              aria-label={isCurrentPlaying ? `Pause ${episode.title}` : `Play ${episode.title}`}
            >
              {isCurrentPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current translate-x-0.5" />
              )}
            </button>
          </div>

          {/* Bottom Episode Meta & Guest Details with Light Frosted Glass Panel */}
          <div className="relative z-10 text-left bg-black/35 backdrop-blur-lg -mx-3 -mb-3 p-4 rounded-2xl border border-white/15 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#DD5A1F] font-semibold">
                {episode.category}
              </span>
              <span className="font-mono text-[10px] text-white/60">
                {meta.plays}
              </span>
            </div>

            <h3 className="font-display font-normal text-xl sm:text-2xl text-white leading-snug mb-1 line-clamp-2">
              {episode.title}
            </h3>

            <p className="font-body text-xs text-white/80 truncate mb-3">
              <strong className="text-white font-medium">{episode.guest.name}</strong> &mdash;{' '}
              {episode.guest.role}
            </p>

            {/* Bottom Actions: Listen Episode, Read Transcript & Listen Later */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayEpisode(episode);
                }}
                className="flex-1 py-2 px-2.5 rounded-full bg-white/20 hover:bg-[#DD5A1F] text-white backdrop-blur-md border border-white/25 hover:border-[#DD5A1F] text-xs font-body font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>{isCurrentPlaying ? 'Now Playing' : 'Listen'}</span>
              </button>

              {onOpenTranscript && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenTranscript(episode);
                  }}
                  className="py-2 px-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 border border-white/20 text-xs font-body font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                  title={`Read Transcript for ${episode.title}`}
                  aria-label={`Read Transcript for ${episode.title}`}
                >
                  <FileText className="w-3.5 h-3.5 text-[#FF8542]" />
                  <span className="hidden sm:inline">Transcript</span>
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(episode.id, e);
                }}
                className={`py-2 px-2.5 rounded-full text-xs font-body font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer border backdrop-blur-md ${
                  isSaved
                    ? 'bg-[#DD5A1F] text-white border-[#DD5A1F]'
                    : 'bg-white/10 hover:bg-white/20 text-white/90 border-white/20'
                }`}
                title={isSaved ? 'Saved in Listen Later' : 'Save for Later'}
                aria-label="Listen Later bookmark"
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      );
    }
  )
);
ContinuousArcCard.displayName = 'ContinuousArcCard';

export const Episodes: React.FC<EpisodesProps> = ({
  currentEpisode,
  isPlaying,
  onPlayEpisode,
  onOpenTranscript,
  searchQuery = '',
  onClearSearch,
}) => {
  const cms = useCMSDataset();
  const allEpisodes = useMemo(() => cms.carouselEpisodes.map(mapCmsDocToEpisode), [cms.carouselEpisodes]);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeDot, setActiveDot] = useState<number>(0);
  const [savedEpisodeIds, setSavedEpisodeIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'bookmark' | 'share' } | null>(null);

  // References for zero-state RAF animation engine
  const carouselStageRef = useRef<HTMLDivElement>(null);
  const cardElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const continuousPosRef = useRef<number>(0);
  const targetPosRef = useRef<number | null>(null);
  const lastActiveDotRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const isIntersectingRef = useRef<boolean>(true);

  // Precomputed semicircular arc lookup table (precomputed on resize, zero cost in RAF loop)
  const arcDataRef = useRef<{ table: ArcTransformData[]; maxOffset: number }>(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const radii = getViewportRadii(w);
    return precomputeArcTable(radii.radiusX, radii.radiusY, 8);
  });

  // Initialize saved episodes from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SAVED_EPISODES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedEpisodeIds(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load bookmarks from localStorage', e);
    }
  }, []);

  // Sync to localStorage and show brief feedback toast
  const handleToggleSave = useCallback((episodeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setSavedEpisodeIds((prev) => {
      const isAlreadySaved = prev.includes(episodeId);
      const updated = isAlreadySaved
        ? prev.filter((id) => id !== episodeId)
        : [...prev, episodeId];

      try {
        localStorage.setItem(SAVED_EPISODES_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save bookmarks to localStorage', err);
      }

      const ep = allEpisodes.find((item) => item.id === episodeId);
      const epName = ep ? ep.number : 'Episode';
      setToastMessage({
        text: isAlreadySaved ? `Removed ${epName} from Listen Later` : `Saved ${epName} to Listen Later`,
        type: 'bookmark',
      });
      return updated;
    });
  }, [allEpisodes]);

  // Web Share API with Clipboard fallback
  const handleShareEpisode = useCallback(async (episode: Episode, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const shareUrl = `${origin}${pathname}#episodes`;
    const shareTitle = `${episode.title} - ${episode.number} | Mic & Mind Podcast`;
    const shareText = `Check out "${episode.title}" featuring ${episode.guest.name} (${episode.guest.role}) on Mic & Mind Podcast!`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        setToastMessage({ text: `Shared ${episode.number}!`, type: 'share' });
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
      }
    }

    try {
      const copyPayload = `"${episode.title}" (${episode.number}) ft. ${episode.guest.name}\n${shareUrl}`;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(copyPayload);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = copyPayload;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setToastMessage({ text: `Copied "${episode.number}" link to clipboard!`, type: 'share' });
    } catch {
      setToastMessage({ text: `Episode link: ${shareUrl}`, type: 'share' });
    }
  }, []);

  // Clear toast after 2.8 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2800);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const categories = useMemo(() => [
    'All',
    ...(savedEpisodeIds.length > 0 ? [`Saved (${savedEpisodeIds.length})`] : []),
    'Entrepreneurship',
    'Growth & Mindset',
    'Failure & Recovery',
    'Connection',
  ], [savedEpisodeIds.length]);

  // Real-time multi-field episode filter (Category / Saved + Search Query)
  const filteredEpisodes = useMemo(() => {
    return allEpisodes.filter((ep) => {
      if (selectedCategory.startsWith('Saved')) {
        if (!savedEpisodeIds.includes(ep.id)) return false;
      } else {
        const matchesCategory = selectedCategory === 'All' || ep.category === selectedCategory;
        if (!matchesCategory) return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        ep.title.toLowerCase().includes(q) ||
        ep.guest.name.toLowerCase().includes(q) ||
        ep.guest.role.toLowerCase().includes(q) ||
        ep.category.toLowerCase().includes(q) ||
        ep.description.toLowerCase().includes(q) ||
        ep.number.toLowerCase().includes(q)
      );
    });
  }, [allEpisodes, selectedCategory, savedEpisodeIds, searchQuery]);

  const numCards = filteredEpisodes.length;

  // --------------------------------------------------------------------------
  // DIRECT DOM HARDWARE-ACCELERATED TRANSFORM APPLIER
  // Precomputed coordinates applied directly via translate3d/rotateZ/scale.
  // Completely bypasses React tree diffing and layout triggers.
  // --------------------------------------------------------------------------
  const applyCardTransforms = useCallback((offset: number) => {
    const count = cardElementsRef.current.length;
    if (count === 0) return;

    const { table, maxOffset } = arcDataRef.current;
    const cards = cardElementsRef.current;

    for (let i = 0; i < count; i++) {
      const el = cards[i];
      if (!el) continue;

      let wrappedOffset = (i - offset) % count;
      if (wrappedOffset > count / 2) {
        wrappedOffset -= count;
      } else if (wrappedOffset < -count / 2) {
        wrappedOffset += count;
      }

      const t = lookupArcTransform(wrappedOffset, table, maxOffset);

      el.style.transform = `translate3d(${t.x.toFixed(2)}px, ${t.y.toFixed(2)}px, 0px) rotateZ(${t.rotateZ.toFixed(2)}deg) scale(${t.scale.toFixed(3)})`;
      el.style.opacity = `${t.opacity.toFixed(3)}`;
      el.style.zIndex = `${t.zIndex}`;
    }
  }, []);

  // --------------------------------------------------------------------------
  // PASSIVE RESIZE LISTENER & PRECOMPUTED TABLE GENERATOR
  // Evaluates viewport dimensions only during resize (never during animation frames).
  // --------------------------------------------------------------------------
  useEffect(() => {
    const handleResize = () => {
      const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const radii = getViewportRadii(w);
      const safeMaxOffset = Math.max(6, Math.ceil(numCards / 2) + 1);
      arcDataRef.current = precomputeArcTable(radii.radiusX, radii.radiusY, safeMaxOffset);
      applyCardTransforms(continuousPosRef.current);
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [numCards, applyCardTransforms]);

  // --------------------------------------------------------------------------
  // CONTROLLED CAROUSEL TRANSFORM WARM-UP ENGINE
  // Precomputes the arc coordinate table, applies card transforms, runs
  // a controlled 3-frame micro-warmup to commit layer quads to the compositor,
  // then halts the loop so zero idle CPU is consumed.
  // --------------------------------------------------------------------------
  useEffect(() => {
    const handleCarouselWarmup = () => {
      const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const radii = getViewportRadii(w);
      const safeMaxOffset = Math.max(6, Math.ceil(numCards / 2) + 1);
      arcDataRef.current = precomputeArcTable(radii.radiusX, radii.radiusY, safeMaxOffset);

      const warmupOffsets = [0.03, -0.03, 0.0];
      let frame = 0;

      const runWarmupFrame = () => {
        if (frame >= warmupOffsets.length) {
          applyCardTransforms(0);
          continuousPosRef.current = 0;
          window.dispatchEvent(new CustomEvent('carousel-warmup-done'));
          return;
        }

        applyCardTransforms(warmupOffsets[frame++]);
        requestAnimationFrame(runWarmupFrame);
      };

      requestAnimationFrame(runWarmupFrame);
    };

    window.addEventListener('request-carousel-warmup', handleCarouselWarmup);
    return () => {
      window.removeEventListener('request-carousel-warmup', handleCarouselWarmup);
    };
  }, [numCards, applyCardTransforms]);

  // --------------------------------------------------------------------------
  // PASSIVE SCROLL & WHEEL LISTENERS
  // --------------------------------------------------------------------------
  useEffect(() => {
    const handlePassiveScroll = () => {
      // Non-blocking passive scroll listener
    };
    window.addEventListener('scroll', handlePassiveScroll, { passive: true });
    return () => window.removeEventListener('scroll', handlePassiveScroll);
  }, []);

  useEffect(() => {
    const container = carouselStageRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (numCards <= 1) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 5) {
        const step = (e.deltaX / 120) * 0.5;
        const currentTarget = targetPosRef.current ?? continuousPosRef.current;
        targetPosRef.current = currentTarget + step;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: true });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [numCards]);

  // --------------------------------------------------------------------------
  // 60FPS REQUEST ANIMATION FRAME LOOP (PAUSED WHEN OUTSIDE VIEWPORT)
  // Zero React state updates on the frame path.
  // --------------------------------------------------------------------------
  useEffect(() => {
    continuousPosRef.current = 0;
    targetPosRef.current = null;
    lastActiveDotRef.current = 0;
    setActiveDot(0);

    // Initial position placement
    applyCardTransforms(0);

    if (numCards <= 1) {
      return;
    }

    let isRunning = true;

    const tick = (now: number) => {
      if (!isRunning) return;

      if (!isIntersectingRef.current) {
        rafIdRef.current = null;
        return;
      }

      if (lastTimeRef.current === 0) {
        lastTimeRef.current = now;
      }
      const deltaMs = Math.min(64, now - lastTimeRef.current);
      lastTimeRef.current = now;
      const dt = deltaMs / 1000;

      if (targetPosRef.current !== null) {
        // Smoothly ease toward user-clicked target index
        const diff = targetPosRef.current - continuousPosRef.current;
        if (Math.abs(diff) > 0.003) {
          continuousPosRef.current += diff * Math.min(1, dt * 6);
        } else {
          continuousPosRef.current = targetPosRef.current;
          targetPosRef.current = null;
        }
      } else {
        // Constant non-stop smooth ambient continuous rotation
        const speed = numCards / 14; // units per second
        continuousPosRef.current = (continuousPosRef.current + speed * dt) % numCards;
      }

      // Direct DOM transform updates (zero React re-renders)
      applyCardTransforms(continuousPosRef.current);

      // Update active dot in React only when integer step changes
      const currentActiveDot =
        ((Math.round(continuousPosRef.current) % numCards) + numCards) % numCards;
      if (currentActiveDot !== lastActiveDotRef.current) {
        lastActiveDotRef.current = currentActiveDot;
        setActiveDot(currentActiveDot);
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    if (isIntersectingRef.current) {
      lastTimeRef.current = performance.now();
      rafIdRef.current = requestAnimationFrame(tick);
    }

    return () => {
      isRunning = false;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [numCards, applyCardTransforms]);

  // --------------------------------------------------------------------------
  // INTERSECTION OBSERVER: PAUSE RAF LOOP WHEN OUTSIDE VIEWPORT
  // --------------------------------------------------------------------------
  useEffect(() => {
    const container = carouselStageRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const isIntersecting = entry.isIntersecting;
        isIntersectingRef.current = isIntersecting;

        if (isIntersecting) {
          if (rafIdRef.current === null && numCards > 1) {
            lastTimeRef.current = performance.now();
            const tick = (now: number) => {
              if (!isIntersectingRef.current) {
                rafIdRef.current = null;
                return;
              }
              const deltaMs = Math.min(64, now - lastTimeRef.current);
              lastTimeRef.current = now;
              const dt = deltaMs / 1000;

              if (targetPosRef.current !== null) {
                const diff = targetPosRef.current - continuousPosRef.current;
                if (Math.abs(diff) > 0.003) {
                  continuousPosRef.current += diff * Math.min(1, dt * 6);
                } else {
                  continuousPosRef.current = targetPosRef.current;
                  targetPosRef.current = null;
                }
              } else {
                const speed = numCards / 14;
                continuousPosRef.current = (continuousPosRef.current + speed * dt) % numCards;
              }

              applyCardTransforms(continuousPosRef.current);

              const currentActiveDot =
                ((Math.round(continuousPosRef.current) % numCards) + numCards) % numCards;
              if (currentActiveDot !== lastActiveDotRef.current) {
                lastActiveDotRef.current = currentActiveDot;
                setActiveDot(currentActiveDot);
              }

              rafIdRef.current = requestAnimationFrame(tick);
            };
            rafIdRef.current = requestAnimationFrame(tick);
          }
        } else {
          if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
          }
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [numCards, applyCardTransforms]);

  // Card click handler
  const handleCardClick = useCallback(
    (index: number) => {
      if (numCards <= 1) return;
      const currentWrapped = ((continuousPosRef.current % numCards) + numCards) % numCards;
      let diff = index - currentWrapped;
      if (diff > numCards / 2) diff -= numCards;
      if (diff < -numCards / 2) diff += numCards;
      targetPosRef.current = continuousPosRef.current + diff;
    },
    [numCards]
  );

  const handlePrev = useCallback(() => {
    if (numCards <= 1) return;
    const currentTarget = targetPosRef.current ?? continuousPosRef.current;
    targetPosRef.current = Math.round(currentTarget) - 1;
  }, [numCards]);

  const handleNext = useCallback(() => {
    if (numCards <= 1) return;
    const currentTarget = targetPosRef.current ?? continuousPosRef.current;
    targetPosRef.current = Math.round(currentTarget) + 1;
  }, [numCards]);

  return (
    <section
      id="episodes"
      className="bg-cream border-b border-ink/10 relative overflow-hidden"
      aria-label="Featured Episodes and Top Playlist Directory"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 800px' }}
    >
      {/* HTML5 Canvas Ambient Particle Background Layer */}
      <AmbientParticles theme="mixed" particleCount={80} mobileParticleCount={35} />

      {/* Visual Toast Notification for Bookmarking & Sharing */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="px-4 py-2.5 rounded-full bg-ink text-white text-xs font-body font-medium flex items-center gap-2.5 shadow-2xl border border-white/20">
            {toastMessage.type === 'share' ? (
              <Share2 className="w-3.5 h-3.5 text-orange" />
            ) : (
              <Bookmark className="w-3.5 h-3.5 text-orange fill-current" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* 1. NON-STOP CONTINUOUS ARC CAROUSEL STAGE */}
      <div className="relative w-full py-16 sm:py-20 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto flex flex-col justify-between min-h-[680px] sm:min-h-[740px] overflow-hidden">
        {/* Ambient Warm Studio Light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#DD5A1F]/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Top Section Heading & Filters */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#DD5A1F]/30 bg-[#DD5A1F]/10 text-[#DD5A1F] font-mono text-xs uppercase tracking-widest font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Featured Episodes
            </div>

            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-normal text-ink tracking-tight leading-[1.05]">
              Candid Conversations{' '}
              <span className="font-serif italic text-orange">On Air</span>
            </h2>

            {/* Active Search Filter Pill Indicator */}
            {searchQuery && (
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DD5A1F]/15 border border-[#DD5A1F]/30 text-xs font-mono text-[#DD5A1F] font-semibold">
                  <Search className="w-3.5 h-3.5" />
                  Filtering by: &ldquo;{searchQuery}&rdquo; ({filteredEpisodes.length} found)
                  <button
                    type="button"
                    onClick={onClearSearch}
                    className="ml-1 p-0.5 rounded-full hover:bg-[#DD5A1F] hover:text-white transition-colors cursor-pointer"
                    aria-label="Clear filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              </div>
            )}
          </div>

          {/* Category & Saved Filter Pills */}
          <div className="flex flex-wrap gap-2 items-center">
            {categories.map((category) => {
              const isSavedTab = category.startsWith('Saved');
              const isSelected = selectedCategory === category;

              return (
                <button
                  key={category}
                  id={`filter-${category.toLowerCase().replace(/[\s()]+/g, '-')}`}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category);
                  }}
                  className={`px-3.5 py-1.5 rounded-full font-body text-xs font-semibold tracking-tight transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-orange text-white shadow-sm'
                      : isSavedTab
                      ? 'bg-orange/10 text-orange border border-orange/30 hover:bg-orange/20'
                      : 'bg-white text-ink/80 border border-ink/10 hover:border-orange/40 hover:text-orange'
                  }`}
                >
                  {isSavedTab && <Bookmark className={`w-3 h-3 ${isSelected ? 'fill-current' : 'text-orange'}`} />}
                  <span>{category}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3D CONTINUOUS ARC CAROUSEL CONTAINER OR EMPTY SEARCH/SAVED STATE */}
        {numCards > 0 ? (
          <div
            ref={carouselStageRef}
            className="relative w-full h-[450px] sm:h-[490px] md:h-[520px] flex items-center justify-center overflow-visible perspective-[1200px] my-4"
          >
            {filteredEpisodes.map((episode, index) => (
              <ContinuousArcCard
                key={episode.id}
                ref={(el) => {
                  cardElementsRef.current[index] = el;
                }}
                episode={episode}
                index={index}
                currentEpisode={currentEpisode}
                isPlaying={isPlaying}
                isSaved={savedEpisodeIds.includes(episode.id)}
                onToggleSave={handleToggleSave}
                onShareEpisode={handleShareEpisode}
                onPlayEpisode={onPlayEpisode}
                onOpenTranscript={onOpenTranscript}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        ) : (
          <div className="my-12 py-16 px-8 rounded-3xl bg-white/70 backdrop-blur-md border border-ink/10 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-full bg-orange/10 text-orange flex items-center justify-center mx-auto mb-4">
              {selectedCategory.startsWith('Saved') ? <Bookmark className="w-6 h-6" /> : <Search className="w-6 h-6" />}
            </div>
            <h3 className="font-display text-2xl text-ink font-semibold mb-2">
              {selectedCategory.startsWith('Saved') ? 'No saved episodes yet' : 'No matching episodes found'}
            </h3>
            <p className="font-body text-xs sm:text-sm text-ink/70 mb-6">
              {selectedCategory.startsWith('Saved')
                ? 'Click the bookmark icon or "Listen Later" button on any episode card to save it to your personal queue.'
                : `We couldn't find any episodes matching "${searchQuery}". Try searching for another guest or topic.`}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory('All');
                onClearSearch?.();
              }}
              className="border-[#DD5A1F] text-[#DD5A1F] hover:bg-[#DD5A1F] hover:text-white"
            >
              View All Episodes
            </Button>
          </div>
        )}

        {/* Bottom Arc Clean Navigation */}
        {numCards > 0 && (
          <div className="relative z-10 flex items-center justify-between text-xs font-mono text-ink/70 pt-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-ink uppercase tracking-wider">
                Curated Edition
              </span>
            </div>

            {/* Carousel Navigation Buttons & Dots */}
            <div className="flex items-center gap-4 mx-auto sm:mx-0">
              <button
                type="button"
                id="arc-carousel-prev-btn"
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-ink/15 hover:border-orange text-ink hover:text-orange flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs"
                aria-label="Previous episode"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Indicator Dots */}
              <div className="flex items-center gap-2">
                {filteredEpisodes.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCardClick(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === activeDot
                        ? 'w-7 bg-orange'
                        : 'w-2 bg-ink/20 hover:bg-ink/40'
                    }`}
                    aria-label={`Jump to episode ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                id="arc-carousel-next-btn"
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-ink/15 hover:border-orange text-ink hover:text-orange flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs"
                aria-label="Next episode"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="hidden sm:inline-block font-mono text-[11px] uppercase tracking-wider text-ink/60">
              {activeDot + 1} / {numCards}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
