import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Radio } from 'lucide-react';
import { Episode } from '../../types';

export interface InteractiveWaveformScrubberProps {
  episode: Episode;
  isPlaying: boolean;
  onTogglePlay?: (episode: Episode) => void;
  previewState?: {
    episodeId: string | null;
    isPlaying: boolean;
    progress: number;
    remainingSeconds: number;
  };
  audioUrl?: string;
  onSeek?: (seconds: number, progress: number) => void;
  className?: string;
}

// Generate consistent harmonic wave bar heights for an episode
function generateWaveHeights(count: number, seedString: string): number[] {
  let seed = 0;
  for (let i = 0; i < seedString.length; i++) {
    seed = (seed * 31 + seedString.charCodeAt(i)) & 0xffffffff;
  }

  const heights: number[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const env = Math.sin(t * Math.PI);
    const h1 = Math.sin(t * 14 + seed) * 0.25;
    const h2 = Math.cos(t * 26 + seed * 2) * 0.18;
    const h3 = Math.sin(t * 42 + seed * 3) * 0.12;
    const raw = (env * 0.65 + h1 + h2 + h3 + 0.35) * 100;
    heights.push(Math.max(18, Math.min(100, Math.round(raw))));
  }
  return heights;
}

// Parse string duration like "58 min" or "1h 14m" into total seconds
function parseDurationToSeconds(durationStr: string): number {
  if (!durationStr) return 3480; // default 58 min
  const minMatch = durationStr.match(/(\d+)\s*min/i);
  if (minMatch) {
    return parseInt(minMatch[1], 10) * 60;
  }
  const hourMatch = durationStr.match(/(\d+)\s*h(?:our)?s?/i);
  const hourMinMatch = durationStr.match(/(\d+)\s*m(?:in)?s?/i);
  if (hourMatch) {
    const hours = parseInt(hourMatch[1], 10);
    const mins = hourMinMatch ? parseInt(hourMinMatch[1], 10) : 0;
    return hours * 3600 + mins * 60;
  }
  return 3480;
}

// Format seconds into MM:SS or H:MM:SS
function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * InteractiveWaveformScrubber
 * Read-only waveform visualizer strictly synchronized with the single
 * authoritative AudioPlayerBar (<audio id="main-podcast-audio-element" />).
 * Does not create independent audio instances, intervals, or timers.
 */
export const InteractiveWaveformScrubber: React.FC<InteractiveWaveformScrubberProps> = ({
  episode,
  isPlaying,
  className = '',
}) => {
  const totalSeconds = parseDurationToSeconds(episode.duration);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const waveHeights = useRef(generateWaveHeights(48, episode.id + episode.title)).current;

  // Listen to authoritative audio element events from AudioPlayerBar
  useEffect(() => {
    const handleTimeUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ currentTime: number; duration: number; episodeId: string }>;
      if (customEvent.detail?.episodeId === episode.id) {
        setCurrentSeconds(customEvent.detail.currentTime);
      }
    };

    const handleEnded = (e: Event) => {
      const customEvent = e as CustomEvent<{ episodeId: string }>;
      if (customEvent.detail?.episodeId === episode.id) {
        setCurrentSeconds(0);
      }
    };

    const handleSeek = (e: Event) => {
      const customEvent = e as CustomEvent<{ time: number; episodeId?: string }>;
      if (
        (!customEvent.detail?.episodeId || customEvent.detail.episodeId === episode.id) &&
        Number.isFinite(customEvent.detail?.time)
      ) {
        setCurrentSeconds(customEvent.detail.time);
      }
    };

    window.addEventListener('podcast:timeupdate', handleTimeUpdate);
    window.addEventListener('podcast:seek', handleSeek);
    window.addEventListener('podcast:ended', handleEnded);

    return () => {
      window.removeEventListener('podcast:timeupdate', handleTimeUpdate);
      window.removeEventListener('podcast:seek', handleSeek);
      window.removeEventListener('podcast:ended', handleEnded);
    };
  }, [episode.id]);

  // Compute active progress strictly from authoritative time
  const normalProgress = totalSeconds > 0 ? currentSeconds / totalSeconds : 0;
  const activeProgress = isPlaying ? Math.max(0.01, Math.min(1, normalProgress)) : 0;
  const displaySeconds = isPlaying ? currentSeconds : 0;

  return (
    <div
      id={`interactive-scrubber-${episode.id}`}
      className={`bg-[#100A07]/80 rounded-2xl p-3.5 sm:p-4 border border-[#DD5A1F]/25 shadow-inner backdrop-blur-sm select-none ${className}`}
    >
      {/* Waveform Visualization (Read-only, synchronized) */}
      <div
        className="relative h-11 sm:h-13 flex items-center justify-between gap-[2px] sm:gap-[3px] py-1 px-1"
        role="presentation"
        aria-label="Audio waveform visualization"
      >
        {/* Live Vertical Needle (Only active when playing) */}
        {isPlaying && (
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-white pointer-events-none z-20 transition-all duration-75 shadow-[0_0_8px_#FF8542]"
            style={{
              left: `${activeProgress * 100}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="w-2 h-2 rounded-full bg-[#FF8542] border border-white -translate-x-[3px] -translate-y-0.5 shadow-md" />
          </div>
        )}

        {/* Waveform Bars */}
        {waveHeights.map((h, barIdx) => {
          const barProgress = barIdx / waveHeights.length;
          const isPlayed = isPlaying && barProgress <= activeProgress;

          return (
            <div
              key={`scrub-bar-${barIdx}`}
              className="flex-1 flex items-center justify-center h-full"
            >
              <div
                className={`w-full max-w-[4px] rounded-full transition-all duration-150 ${
                  isPlayed
                    ? 'bg-gradient-to-t from-[#DD5A1F] via-[#FF8542] to-[#FFA366] shadow-[0_0_4px_rgba(221,90,31,0.4)]'
                    : 'bg-white/20'
                } ${isPlaying && isPlayed ? 'animate-pulse' : ''}`}
                style={{
                  height: `${Math.max(
                    14,
                    h * (isPlaying && isPlayed ? 0.9 + Math.sin(barIdx * 0.7) * 0.1 : 0.85)
                  )}%`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Synchronized Meta & Timestamp Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-2.5 pt-2.5 border-t border-white/10">
        <div className="flex items-center gap-3">
          {/* Current Live Timestamp */}
          <div className="font-mono text-xs text-paper font-semibold tracking-wider">
            <span className={isPlaying ? 'text-[#FF8542]' : 'text-white/80'}>
              {formatTime(displaySeconds)}
            </span>
            <span className="text-white/40 mx-1">/</span>
            <span className="text-paper/75">{episode.duration}</span>
          </div>

          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-white/50 uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10">
            CC
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-white/50 uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 hidden sm:inline-flex">
            <Volume2 className="w-3 h-3 text-[#FF8542]" />
            Master Audio
          </span>
        </div>

        <div className="text-[11px] font-mono text-white/50 flex items-center gap-1.5">
          {isPlaying ? (
            <>
              <Radio className="w-3 h-3 text-[#FF8542] animate-pulse" />
              <span className="text-[#FF8542]/90">Playing in Master Player</span>
            </>
          ) : (
            <span>Synchronized to bottom player</span>
          )}
        </div>
      </div>
    </div>
  );
};
