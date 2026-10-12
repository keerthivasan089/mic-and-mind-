import React, { useRef } from 'react';
import {
  Play,
  Pause,
  Clock,
  TrendingUp,
  Bookmark,
  Share2,
  FileText,
  Headphones,
  MoreVertical,
} from 'lucide-react';
import { Episode } from '../../types';
import { Button } from './Button';
import { CountUp } from './CountUp';
import { MagneticEpisodeThumbnail } from './MagneticEpisodeThumbnail';
import { PreviewState } from '../../lib/audioPreview';

interface EpisodeRowProps {
  episode: Episode;
  rankIndex: number;
  isThisPlaying: boolean;
  isThisSelected: boolean;
  isSaved: boolean;
  isHovered: boolean;
  isMenuOpen: boolean;
  previewState?: PreviewState;
  onPlayEpisode: (episode: Episode) => void;
  onStartPreview?: (episodeId: string) => void;
  onStopPreview?: () => void;
  onToggleSave: (episodeId: string, e?: React.MouseEvent) => void;
  onShareEpisode: (episode: Episode, e?: React.MouseEvent) => void;
  onOpenTranscript?: (episode: Episode) => void;
  onToggleMenu: (episodeId: string, e: React.MouseEvent) => void;
  onRowMouseEnter: (episode: Episode, e: React.MouseEvent) => void;
  onRowMouseMove: (e: React.MouseEvent) => void;
  onRowMouseLeave: () => void;
  onRowClick: (episode: Episode, e: React.MouseEvent) => void;
}

/**
 * Reusable Hall of Fame Ranked Episode Row Component.
 * Fully data-driven from the Episode object:
 * rank formatting, portrait, plays count, tags, audio actions, and menu.
 */
export const EpisodeRow: React.FC<EpisodeRowProps> = ({
  episode,
  rankIndex,
  isThisPlaying,
  isThisSelected,
  isSaved,
  isHovered,
  isMenuOpen,
  onPlayEpisode,
  onToggleSave,
  onShareEpisode,
  onOpenTranscript,
  onToggleMenu,
  onRowMouseEnter,
  onRowMouseMove,
  onRowMouseLeave,
  onRowClick,
}) => {
  const trackHoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Compute rank formatting from rankPosition or rankIndex
  const rankNum = episode.rankPosition ?? rankIndex + 1;
  const rankFormatted = rankNum < 10 ? `0${rankNum}` : `${rankNum}`;

  // Cover image
  const coverImg =
    episode.portraitUrl ||
    episode.guest.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop';

  // Ranking label and listen counts
  const rankingLabel = episode.rankingLabel || `#${rankNum} Top Pick`;
  const playsNumber =
    episode.listenCountNumber ??
    (episode.listenCount ? parseFloat(episode.listenCount) : 80);
  const playsSuffix =
    episode.listenCountSuffix ??
    (episode.listenCount?.replace(/^[\d.]+/, '') || 'K Listens');

  return (
    <div
      id={`episode-row-${episode.id}`}
      onMouseEnter={(e) => onRowMouseEnter(episode, e)}
      onMouseMove={onRowMouseMove}
      onMouseLeave={onRowMouseLeave}
      onClick={(e) => onRowClick(episode, e)}
      className={`group relative w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border transition-all duration-200 cursor-pointer ${
        isThisSelected
          ? 'bg-white border-orange shadow-md ring-2 ring-orange/20'
          : isHovered
          ? 'bg-white border-orange/50 shadow-md ring-1 ring-orange/20'
          : 'bg-white/95 hover:bg-white border-ink/10 hover:border-orange/30 shadow-2xs hover:shadow-sm'
      }`}
    >
      {/* Left: Rank Number, Circular Guest Portrait with 5px Ring Border & Details */}
      <div className="flex items-center gap-3.5 sm:gap-5 flex-1 min-w-0">
        {/* Rank Number in Display Font */}
        <div className="font-display text-2xl sm:text-3xl font-bold text-orange/50 group-hover:text-orange transition-colors shrink-0 w-8 sm:w-10 text-center select-none">
          {rankFormatted}
        </div>

        {/* Circular Guest Portrait with Ring Border */}
        <div
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shrink-0 shadow-xs border-[5px] border-orange/40 group-hover:border-orange ring-2 ring-orange/15 bg-ink group/thumb cursor-pointer transition-all duration-200"
        >
          <MagneticEpisodeThumbnail
            src={coverImg}
            alt={episode.guest.name}
            maxTilt={10}
            maxShift={6}
            zoomOnHover={1.06}
            className="w-full h-full"
          >
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-colors group-hover/thumb:bg-black/50 z-20">
              <button
                id={`play-btn-archive-${episode.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayEpisode(episode);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                  isThisPlaying
                    ? 'bg-ink text-white scale-105'
                    : 'bg-orange text-white hover:bg-orange-deep hover:scale-110'
                }`}
                aria-label={isThisPlaying ? `Pause ${episode.title}` : `Play ${episode.title}`}
              >
                {isThisPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                )}
              </button>
            </div>
          </MagneticEpisodeThumbnail>
        </div>

        {/* Core Episode Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <TrendingUp className="w-2.5 h-2.5 text-emerald-600" />
              {rankingLabel}
            </span>

            <span className="font-mono text-[10px] font-bold text-ink/60 bg-ink/5 px-2 py-0.5 rounded-full">
              {episode.number}
            </span>

            {isSaved && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-orange bg-orange/15 px-2 py-0.5 rounded-full border border-orange/30 animate-in fade-in">
                <Bookmark className="w-2.5 h-2.5 fill-current" />
                Saved
              </span>
            )}

            <span className="font-mono text-[11px] text-ink/50 inline-flex items-center gap-1">
              <span>&bull;</span>
              <CountUp
                to={playsNumber}
                suffix={playsSuffix}
                duration={1.8}
                inViewMargin="-20px"
              />
            </span>
          </div>

          <h4 className="font-display text-lg sm:text-xl font-normal text-ink leading-snug group-hover:text-orange transition-colors truncate mb-0.5">
            {episode.title}
          </h4>

          <div className="flex flex-wrap items-center gap-2 text-xs font-body text-ink/70">
            <strong className="text-ink font-medium">{episode.guest.name}</strong>
            <span>&mdash; {episode.guest.role}</span>
            <span className="text-ink/30 hidden sm:inline">&bull;</span>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-ink/55 hidden sm:inline-flex">
              <Clock className="w-3 h-3 text-orange" />
              {episode.duration}
            </span>
          </div>
        </div>
      </div>

      {/* Right Action: Listen Button + Overflow Kebab Menu */}
      <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
        <Button
          variant={isThisPlaying ? 'dark' : 'primary'}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onPlayEpisode(episode);
          }}
          className="shadow-xs"
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>{isThisPlaying ? 'Now Playing' : 'Listen'}</span>
        </Button>

        {/* Overflow 3-Dots Menu */}
        <div className="relative episode-overflow-menu-container">
          <button
            type="button"
            id={`overflow-btn-comp-${episode.id}`}
            onClick={(e) => onToggleMenu(episode.id, e)}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-ink/15 bg-white text-ink/70 hover:text-orange hover:border-orange/40 transition-all cursor-pointer shadow-xs active:scale-95"
            title="More options"
            aria-label="More options"
            aria-expanded={isMenuOpen}
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {/* Dropdown Popover */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-ink/10 p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
              {onOpenTranscript && (
                <button
                  type="button"
                  id={`overflow-transcript-comp-${episode.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenTranscript(episode);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left text-xs font-body font-medium text-ink/85 hover:text-orange hover:bg-orange/8 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-orange" />
                  <span>Read Full Transcript</span>
                </button>
              )}
              <button
                type="button"
                id={`overflow-share-comp-${episode.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onShareEpisode(episode, e);
                }}
                className="w-full px-3 py-2 rounded-xl text-left text-xs font-body font-medium text-ink/85 hover:text-orange hover:bg-orange/8 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-orange" />
                <span>Share Episode</span>
              </button>
              <button
                type="button"
                id={`overflow-save-comp-${episode.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(episode.id, e);
                }}
                className="w-full px-3 py-2 rounded-xl text-left text-xs font-body font-medium text-ink/85 hover:text-orange hover:bg-orange/8 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Bookmark className={`w-3.5 h-3.5 text-orange ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? 'Remove from Saved' : 'Save to Listen Later'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
