import React, { useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Clock,
  Flame,
  Bookmark,
  Share2,
  FileText,
  Headphones,
  X,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Episode } from '../../types';
import { Button } from './Button';
import { CountUp } from './CountUp';
import { MagneticEpisodeThumbnail } from './MagneticEpisodeThumbnail';
import { InteractiveWaveformScrubber } from './InteractiveWaveformScrubber';
import { PreviewState } from '../../lib/audioPreview';

export interface EpisodeExpandedPopupProps {
  episode: Episode;
  rankFormatted?: string;
  isThisPlaying?: boolean;
  isSaved?: boolean;
  previewState?: PreviewState;
  meta?: { ranking: string; plays: string; badge: string };
  playsNumber?: number;
  playsSuffix?: string;
  coverImg?: string;
  anchorRect: { top: number; left: number; width: number; height: number } | null;
  isMobile: boolean;
  onClose: () => void;
  onPlayEpisode: (episode: Episode) => void;
  onStartPreview?: (episodeId: string) => void;
  onStopPreview?: () => void;
  onToggleSave?: (episodeId: string, e?: React.MouseEvent) => void;
  onShareEpisode?: (episode: Episode, e?: React.MouseEvent) => void;
  onOpenTranscript?: (episode: Episode) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/**
 * Reusable single template component for the Hall of Fame expanded/popup dark card.
 * Renders all details purely from the single Episode data object.
 */
export const EpisodeExpandedPopup: React.FC<EpisodeExpandedPopupProps> = ({
  episode,
  rankFormatted,
  isThisPlaying = false,
  isSaved = false,
  previewState,
  meta,
  playsNumber,
  playsSuffix,
  coverImg,
  anchorRect,
  isMobile,
  onClose,
  onPlayEpisode,
  onStartPreview = (_id: string) => {},
  onStopPreview = () => {},
  onToggleSave = (_id: string, _e?: React.MouseEvent) => {},
  onShareEpisode = (_ep: Episode, _e?: React.MouseEvent) => {},
  onOpenTranscript,
  onMouseEnter,
  onMouseLeave,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!episode) return null;

  // Resolve all episode fields cleanly from data
  const rankNum = episode.rankPosition ?? 1;
  const resolvedRankFormatted =
    rankFormatted ??
    (rankNum < 10 ? `0${rankNum}` : `${rankNum}`);

  const resolvedCoverImg =
    coverImg ||
    episode.portraitUrl ||
    episode.guest.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop';

  const resolvedRankingTag =
    meta?.ranking ||
    episode.trendingBadge ||
    episode.rankingLabel ||
    `#${rankNum} Top Pick`;

  const resolvedPlaysNumber =
    playsNumber ??
    episode.listenCountNumber ??
    (episode.listenCount ? parseFloat(episode.listenCount) : 100);

  const resolvedPlaysSuffix =
    playsSuffix ??
    episode.listenCountSuffix ??
    (episode.listenCount?.replace(/^[\d.]+/, '') || 'K Listens');

  // Calculate desktop vertical position anchored near hovered row, clamped to viewport
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const overlayHeight = 360; // Estimated height of the expanded overlay card
  let desktopTop = 100;

  if (anchorRect) {
    // Center popup over the row, clamped within screen margins
    const idealTop = anchorRect.top + anchorRect.height / 2 - overlayHeight / 2;
    desktopTop = Math.max(20, Math.min(viewportHeight - overlayHeight - 20, idealTop));
  }

  return (
    <div
      key={`popup-container-${episode.id}`}
      className="fixed inset-0 z-[65] pointer-events-none"
      aria-live="polite"
    >
      {/* Mobile / Touch Dimmed Backdrop */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-xs pointer-events-auto z-[66]"
        />
      )}

      {/* The Dark Ink Overlay Card */}
      <motion.div
        id={`episode-popup-card-${episode.id}`}
        initial={{ opacity: 0, scale: 0.96, y: isMobile ? 0 : 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: isMobile ? 0 : 4 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={
          !isMobile && anchorRect
            ? {
                position: 'fixed',
                top: `${desktopTop}px`,
                left: '50%',
                transform: 'translateX(-50%)',
              }
            : undefined
        }
        className={`pointer-events-auto z-[70] w-[min(94vw,880px)] rounded-3xl p-5 sm:p-7 md:p-8 border-2 border-orange/50 bg-gradient-to-br from-ink via-ink to-[#221611] text-paper shadow-2xl shadow-black/85 ring-1 ring-white/10 overflow-hidden ${
          isMobile
            ? 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto'
            : ''
        }`}
      >
        {/* Ambient Lighting Orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-deep/20 rounded-full blur-3xl pointer-events-none" />

        {/* Huge Ghost Rank Number */}
        <div
          className="absolute -top-4 sm:-top-8 right-4 sm:right-8 font-display text-8xl sm:text-9xl md:text-[11rem] font-bold text-orange/10 select-none pointer-events-none leading-none z-0 tracking-tighter"
          aria-hidden="true"
        >
          {resolvedRankFormatted}
        </div>

        {/* Mobile Close Button */}
        {isMobile && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close details"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="relative z-10">
          {/* Top Row: Circular Guest Portrait with 6px Orange Ring Border + Guest Details */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 mb-5">
            {/* Circular Portrait with Ring Border */}
            <div
              className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden shrink-0 shadow-2xl border-[6px] border-orange ring-4 ring-orange/30 bg-ink group/thumb cursor-pointer self-start sm:self-center"
            >
              <MagneticEpisodeThumbnail
                src={resolvedCoverImg}
                alt={episode.guest.name}
                maxTilt={12}
                maxShift={8}
                zoomOnHover={1.06}
                className="w-full h-full"
              >
                <div className="absolute inset-0 bg-black/35 flex items-center justify-center transition-colors group-hover/thumb:bg-black/55 z-20">
                  <button
                    id={`play-btn-popup-${episode.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayEpisode(episode);
                    }}
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                      isThisPlaying
                        ? 'bg-ink text-white scale-105 ring-2 ring-white/50'
                        : 'bg-orange text-white hover:bg-orange-deep hover:scale-110'
                    }`}
                    aria-label={isThisPlaying ? `Pause ${episode.title}` : `Play ${episode.title}`}
                  >
                    {isThisPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current translate-x-0.5" />
                    )}
                  </button>
                </div>
              </MagneticEpisodeThumbnail>
            </div>

            {/* Guest Meta Details & Title */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#FF8542] bg-orange/20 px-3 py-0.5 rounded-full border border-orange/40 shadow-xs">
                  <Flame className="w-3.5 h-3.5 text-[#FF8542]" />
                  {resolvedRankingTag}
                </span>

                <span className="font-mono text-xs font-bold text-paper/80 bg-white/10 px-2.5 py-0.5 rounded-full">
                  {episode.number}
                </span>

                {isSaved && (
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#FF8542] bg-orange/20 px-2.5 py-0.5 rounded-full border border-orange/40 animate-in fade-in">
                    <Bookmark className="w-3 h-3 fill-current" />
                    Saved
                  </span>
                )}

                <span className="font-mono text-xs text-paper/60 inline-flex items-center gap-1">
                  <span>&bull;</span>
                  <CountUp
                    to={resolvedPlaysNumber}
                    suffix={resolvedPlaysSuffix}
                    duration={1.8}
                    inViewMargin="-20px"
                  />
                </span>

                <span className="font-mono text-xs text-paper/50 inline-flex items-center gap-1">
                  <span>&bull;</span>
                  <Clock className="w-3 h-3 text-[#FF8542]" />
                  {episode.duration}
                </span>
              </div>

              <div className="font-mono text-[11px] uppercase tracking-widest text-[#FF8542] font-semibold mb-0.5">
                Feat.
              </div>
              <h4 className="font-display text-2xl sm:text-3xl lg:text-4xl font-normal text-white leading-tight mb-1 truncate">
                {episode.guest.name}
              </h4>
              <div className="font-body text-xs sm:text-sm text-cream/85 mb-1.5 font-medium truncate">
                {episode.guest.role}
              </div>

              <p className="font-body text-xs sm:text-sm text-paper/80 line-clamp-2 leading-relaxed max-w-2xl">
                <strong className="text-white font-semibold mr-1.5">{episode.title} &mdash;</strong>
                {episode.description}
              </p>
            </div>
          </div>

          {/* Real Interactive Audio Waveform Scrubber (Read-only, synchronized with AudioPlayerBar) */}
          <div className="mb-4">
            <InteractiveWaveformScrubber
              episode={episode}
              isPlaying={isThisPlaying}
              audioUrl={episode.audioUrl}
            />
          </div>

          {/* Bottom Action Buttons Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2.5">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onPlayEpisode(episode);
                }}
                className="shadow-md"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>{isThisPlaying ? 'Now Playing' : 'Listen Masterclass'}</span>
              </Button>

              {onOpenTranscript && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTranscript(episode);
                  }}
                  className="px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-body font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#FF8542]" />
                  <span>Transcript</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => onShareEpisode(episode, e)}
                className="p-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Share Episode"
                aria-label="Share Episode"
              >
                <Share2 className="w-3.5 h-3.5 text-[#FF8542]" />
              </button>

              <button
                type="button"
                onClick={(e) => onToggleSave(episode.id, e)}
                className={`p-2 rounded-full border transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-orange border-orange text-white'
                    : 'border-white/20 bg-white/10 hover:bg-white/20 text-white'
                }`}
                title={isSaved ? 'Remove from Saved' : 'Save to Listen Later'}
                aria-label="Bookmark Episode"
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
