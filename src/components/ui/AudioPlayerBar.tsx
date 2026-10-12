import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, X, RotateCcw, RotateCw, Sparkles, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { Episode } from '../../types';

interface AudioPlayerBarProps {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClose: () => void;
  onOpenTranscript?: (episode: Episode) => void;
}

function formatSeconds(sec: number): string {
  if (isNaN(sec) || sec < 0 || !isFinite(sec)) return '00:00';
  const total = Math.floor(sec);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

// Deterministic waveform generator that computes varied, natural podcast speech heights
function generateEpisodeWaveform(seedString: string, count: number = 80): number[] {
  let seed = 0;
  for (let i = 0; i < seedString.length; i++) {
    seed = (seed * 31 + seedString.charCodeAt(i)) & 0xffffffff;
  }

  const heights: number[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / count;
    // Macro envelope: gentle attenuation at head and tail
    const env = Math.sin(t * Math.PI);
    // Harmonic frequencies simulating conversational cadence peaks and valleys
    const h1 = Math.sin(t * 14 + seed * 0.1) * 0.22;
    const h2 = Math.cos(t * 31 + seed * 0.05) * 0.18;
    const h3 = Math.sin(t * 49 + seed * 0.02) * 0.12;

    // High frequency pseudo-random micro variations based on bar index & seed
    const pseudoRand = Math.abs(Math.sin((seed + i * 23.17) * 43758.5453));
    const micro = (pseudoRand - 0.5) * 0.26;

    // Occasional speech pauses
    const breath = Math.abs(Math.sin(t * 9 * Math.PI));
    const dip = breath < 0.12 ? 0.45 : 1.0;

    const raw = (0.32 + env * 0.38 + h1 + h2 + h3 + micro) * dip;
    const clamped = Math.max(18, Math.min(84, Math.round(raw * 100)));
    heights.push(clamped);
  }
  return heights;
}

interface WaveBar {
  height: number;
  animName: string;
  duration: number;
  delay: number;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentEpisode,
  isPlaying,
  onTogglePlay,
  onClose,
  onOpenTranscript,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const scrubRafRef = useRef<number | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<'1.0x' | '1.25x' | '1.5x' | '2.0x'>('1.0x');
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const hasAudio = Boolean(currentEpisode?.audioUrl && currentEpisode.audioUrl.trim().length > 0);

  // Sync isPlaying with real HTMLAudioElement playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && hasAudio) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play request interrupted or requires user interaction:', err);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, hasAudio, currentEpisode?.audioUrl]);

  // Reset states and apply playback rate when episode changes
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setIsDragging(false);
    setDragProgress(0);
    setAudioError(null);
    setIsLoadingAudio(false);

    if (audioRef.current) {
      audioRef.current.playbackRate = parseFloat(playbackSpeed.replace('x', ''));
    }
  }, [currentEpisode?.id, playbackSpeed]);

  // Generate stable deterministic waveform with organic live speech pulse properties
  const waveBars = useMemo<WaveBar[]>(() => {
    if (!currentEpisode) return [];
    const seed = `${currentEpisode.id}_${currentEpisode.audioUrl || ''}_${currentEpisode.title}`;
    const heights = generateEpisodeWaveform(seed, 80);
    const animNames = ['waveformPulseA', 'waveformPulseB', 'waveformPulseC'];

    return heights.map((h, i) => {
      // Alternate across 3 organic speech pulse profiles
      const animName = animNames[i % animNames.length];
      // Varied duration between 0.72s and 1.44s
      const duration = 0.72 + ((i * 7) % 9) * 0.09;
      // Staggered negative delay so each bar is at a distinct phase immediately
      const delay = -(((i * 11) % 13) * 0.09);

      return {
        height: h,
        animName,
        duration: Math.round(duration * 100) / 100,
        delay: Math.round(delay * 100) / 100,
      };
    });
  }, [currentEpisode?.id, currentEpisode?.audioUrl, currentEpisode?.title]);

  // Listen for external seek events (e.g. from waveform scrubber)
  useEffect(() => {
    const handleExternalSeek = (e: Event) => {
      const customEvent = e as CustomEvent<{ time: number; episodeId?: string }>;
      const targetTime = customEvent.detail?.time;
      if (
        audioRef.current &&
        Number.isFinite(targetTime) &&
        (!customEvent.detail?.episodeId || customEvent.detail.episodeId === currentEpisode?.id)
      ) {
        audioRef.current.currentTime = targetTime;
        setCurrentTime(targetTime);
      }
    };

    window.addEventListener('podcast:seek', handleExternalSeek);
    return () => window.removeEventListener('podcast:seek', handleExternalSeek);
  }, [currentEpisode?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrubRafRef.current) {
        cancelAnimationFrame(scrubRafRef.current);
        scrubRafRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  if (!currentEpisode) return null;

  const cycleSpeed = () => {
    const speeds: ('1.0x' | '1.25x' | '1.5x' | '2.0x')[] = ['1.0x', '1.25x', '1.5x', '2.0x'];
    const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = parseFloat(nextSpeed.replace('x', ''));
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || isDragging) return;
    setCurrentTime(audio.currentTime);

    // Broadcast authoritative playback time to waveform scrubbers & UI
    window.dispatchEvent(
      new CustomEvent('podcast:timeupdate', {
        detail: {
          currentTime: audio.currentTime,
          duration: audio.duration,
          episodeId: currentEpisode.id,
        },
      })
    );
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      setDuration(audio.duration);
    }
    audio.playbackRate = parseFloat(playbackSpeed.replace('x', ''));
    setIsLoadingAudio(false);
  };

  const handleEnded = () => {
    setCurrentTime(0);
    if (isPlaying) {
      onTogglePlay();
    }
    window.dispatchEvent(
      new CustomEvent('podcast:ended', {
        detail: { episodeId: currentEpisode.id },
      })
    );
  };

  const handleAudioError = () => {
    const audio = audioRef.current;
    setIsLoadingAudio(false);
    if (!audio) return;

    const err = audio.error;
    let message = 'Unable to play episode audio.';
    if (err) {
      switch (err.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          message = 'Audio playback was aborted.';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          message = 'Network error while loading audio. Please check your internet connection.';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          message = 'Audio decoding failed or format is corrupt.';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          message = 'Audio source format not supported or media URL is unreachable.';
          break;
        default:
          message = `Playback error: ${err.message || 'Media stream failed'}`;
      }
    }
    setAudioError(message);
    if (isPlaying) {
      onTogglePlay();
    }
  };

  const handleRewind = () => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) return;
    const target = Math.max(0, audio.currentTime - 10);
    audio.currentTime = target;
    setCurrentTime(target);
    window.dispatchEvent(
      new CustomEvent('podcast:seek', { detail: { time: target, episodeId: currentEpisode.id } })
    );
  };

  const handleForward = () => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) return;
    const maxDur = duration > 0 ? duration : audio.duration || Infinity;
    const target = Math.min(maxDur, audio.currentTime + 10);
    audio.currentTime = target;
    setCurrentTime(target);
    window.dispatchEvent(
      new CustomEvent('podcast:seek', { detail: { time: target, episodeId: currentEpisode.id } })
    );
  };

  // Authoritative seek implementation on existing audioRef
  const applySeek = (ratio: number) => {
    const effectiveDuration = duration > 0 ? duration : audioRef.current?.duration || 0;
    if (effectiveDuration > 0 && audioRef.current) {
      const targetTime = Math.max(0, Math.min(effectiveDuration, ratio * effectiveDuration));
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
      window.dispatchEvent(
        new CustomEvent('podcast:seek', {
          detail: { time: targetTime, episodeId: currentEpisode.id },
        })
      );
    }
  };

  // Waveform pointer scrubbing
  const calculateProgressFromPointer = (clientX: number): number => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    const ratio = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(1, ratio));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!hasAudio) return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setIsDragging(true);
    const ratio = calculateProgressFromPointer(e.clientX);
    setDragProgress(ratio);
    applySeek(ratio);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !hasAudio) return;
    const ratio = calculateProgressFromPointer(e.clientX);
    setDragProgress(ratio);

    if (scrubRafRef.current) {
      cancelAnimationFrame(scrubRafRef.current);
    }
    scrubRafRef.current = requestAnimationFrame(() => {
      applySeek(ratio);
      scrubRafRef.current = null;
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !hasAudio) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    if (scrubRafRef.current) {
      cancelAnimationFrame(scrubRafRef.current);
      scrubRafRef.current = null;
    }

    const ratio = calculateProgressFromPointer(e.clientX);
    applySeek(ratio);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!hasAudio) return;
    const effectiveDuration = duration > 0 ? duration : audioRef.current?.duration || 0;
    if (effectiveDuration <= 0 || !audioRef.current) return;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const target = Math.max(0, audioRef.current.currentTime - 5);
      audioRef.current.currentTime = target;
      setCurrentTime(target);
      window.dispatchEvent(
        new CustomEvent('podcast:seek', { detail: { time: target, episodeId: currentEpisode.id } })
      );
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const target = Math.min(effectiveDuration, audioRef.current.currentTime + 5);
      audioRef.current.currentTime = target;
      setCurrentTime(target);
      window.dispatchEvent(
        new CustomEvent('podcast:seek', { detail: { time: target, episodeId: currentEpisode.id } })
      );
    } else if (e.key === 'Home') {
      e.preventDefault();
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      window.dispatchEvent(
        new CustomEvent('podcast:seek', { detail: { time: 0, episodeId: currentEpisode.id } })
      );
    } else if (e.key === 'End') {
      e.preventDefault();
      audioRef.current.currentTime = effectiveDuration;
      setCurrentTime(effectiveDuration);
      window.dispatchEvent(
        new CustomEvent('podcast:seek', { detail: { time: effectiveDuration, episodeId: currentEpisode.id } })
      );
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onTogglePlay();
    }
  };

  const activeRatio = isDragging
    ? dragProgress
    : duration > 0
    ? Math.min(1, Math.max(0, currentTime / duration))
    : 0;

  const progressPercent = activeRatio * 100;

  const currentDisplayTime = isDragging
    ? formatSeconds(dragProgress * (duration || 1))
    : formatSeconds(currentTime);

  const durationDisplayTime = duration > 0 ? formatSeconds(duration) : currentEpisode.duration;

  return (
    <aside
      id="podcast-audio-player-bar"
      aria-label="Audio Player"
      className="fixed bottom-6 left-4 right-4 md:left-12 md:right-12 z-40 max-w-4xl mx-auto bg-ink/95 backdrop-blur-md text-paper border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl transition-all"
    >
      {/* Real Authoritative HTMLAudioElement */}
      <audio
        ref={audioRef}
        id="main-podcast-audio-element"
        src={currentEpisode.audioUrl || undefined}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleAudioError}
        onWaiting={() => setIsLoadingAudio(true)}
        onPlaying={() => setIsLoadingAudio(false)}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Episode Info */}
        <div className="flex items-center gap-3.5 w-full sm:w-auto min-w-0">
          <div className="w-10 h-10 rounded-xl bg-orange flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-orange font-semibold uppercase tracking-wider">
                {currentEpisode.number}
              </span>
              <span className="text-[11px] text-white/50 font-mono">• {durationDisplayTime}</span>
              {!hasAudio && (
                <span className="font-mono text-[10px] bg-white/10 text-amber-300 px-1.5 py-0.5 rounded">
                  No Audio Track
                </span>
              )}
            </div>
            <h4 className="font-display text-sm font-semibold truncate text-paper max-w-xs sm:max-w-md">
              {currentEpisode.title}
            </h4>
            <p
              className="text-xs text-white/70 truncate font-serif italic"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              {currentEpisode.guest.name} — {currentEpisode.guest.role}
            </p>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Rewind 10 seconds button */}
          <button
            onClick={handleRewind}
            disabled={!hasAudio}
            className={`p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors ${
              !hasAudio ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            }`}
            title="Rewind 10 seconds"
            aria-label="Rewind 10 seconds"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Play/Pause Button */}
          <button
            id="audio-bar-play-toggle"
            onClick={() => {
              if (hasAudio) {
                onTogglePlay();
              }
            }}
            disabled={!hasAudio}
            className={`w-10 h-10 rounded-full bg-[#DD5A1F] text-white flex items-center justify-center hover:bg-[#B84312] transition-transform active:scale-95 shadow-sm ${
              !hasAudio ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            }`}
            title={
              !hasAudio
                ? 'Audio track not available'
                : isPlaying
                ? 'Pause audio (Space)'
                : 'Play audio (Space)'
            }
            aria-label={
              !hasAudio
                ? 'Audio track not available'
                : isPlaying
                ? 'Pause audio (Space)'
                : 'Play audio (Space)'
            }
          >
            {isLoadingAudio ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Forward 10 seconds button */}
          <button
            onClick={handleForward}
            disabled={!hasAudio}
            className={`p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors ${
              !hasAudio ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            }`}
            title="Forward 10 seconds"
            aria-label="Forward 10 seconds"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <button
            onClick={cycleSpeed}
            disabled={!hasAudio}
            className={`px-2.5 py-1 rounded-full border border-white/20 bg-white/5 font-mono text-xs text-white/80 hover:border-[#DD5A1F] hover:text-[#DD5A1F] transition-colors ${
              !hasAudio ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            }`}
            title="Change playback speed"
          >
            {playbackSpeed}
          </button>

          {/* Transcript Button */}
          {onOpenTranscript && (
            <button
              id="audio-bar-transcript-btn"
              onClick={() => onOpenTranscript(currentEpisode)}
              className="px-2.5 py-1 rounded-full border border-white/20 bg-white/10 hover:bg-[#DD5A1F] hover:border-[#DD5A1F] font-mono text-xs text-white transition-all flex items-center gap-1.5 cursor-pointer"
              title="Open full episode transcript"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Transcript</span>
            </button>
          )}

          {/* Close bar */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Podcast Waveform Visualizer & Real Timers */}
      <div className="mt-3.5 flex items-center gap-2.5 sm:gap-3">
        <span className="font-mono text-[10px] sm:text-[11px] text-white/60 min-w-[34px] sm:min-w-[38px] text-right shrink-0 select-none">
          {currentDisplayTime}
        </span>
        <div
          ref={progressBarRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            setIsDragging(false);
            if (scrubRafRef.current) {
              cancelAnimationFrame(scrubRafRef.current);
              scrubRafRef.current = null;
            }
          }}
          onKeyDown={handleKeyDown}
          tabIndex={hasAudio ? 0 : -1}
          role="slider"
          aria-label="Audio progress. Click or drag to seek."
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progressPercent)}
          aria-valuetext={`${currentDisplayTime} of ${durationDisplayTime}`}
          className={`group relative flex-1 h-8 sm:h-9 bg-[#100A07]/70 rounded-xl px-2 py-1 flex items-center border border-white/10 touch-none select-none transition-all focus:outline-none focus:ring-1 focus:ring-[#DD5A1F] ${
            !hasAudio ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:border-white/20'
          }`}
          title={hasAudio ? 'Audio progress. Click or drag to seek.' : 'Audio not available'}
        >
          {/* Live Playhead Needle */}
          {hasAudio && (progressPercent > 0 || isDragging) && (
            <div
              className="absolute top-1 bottom-1 w-[2px] bg-white pointer-events-none z-20 shadow-[0_0_8px_#FF8542]"
              style={{
                left: `${progressPercent}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="w-2 h-2 rounded-full bg-[#FF8542] border border-white -translate-x-[3px] -translate-y-0.5 shadow-md" />
            </div>
          )}

          {/* Waveform Bars */}
          <div className="w-full h-full flex items-center justify-between gap-[2px] sm:gap-[3px] pointer-events-none">
            {waveBars.map((bar, barIdx) => {
              const barProgress =
                waveBars.length > 1 ? barIdx / (waveBars.length - 1) : 0;
              const isPlayed =
                hasAudio &&
                (isDragging
                  ? dragProgress > 0 && barProgress <= dragProgress
                  : activeRatio > 0 && barProgress <= activeRatio);

              return (
                <div
                  key={`bottom-wave-bar-${currentEpisode.id}-${barIdx}`}
                  className={`flex-1 flex items-center justify-center h-full ${
                    barIdx % 2 !== 0 ? 'hidden sm:flex' : 'flex'
                  }`}
                >
                  <div
                    className={`waveform-bar-anim w-full max-w-[4px] min-w-[2px] rounded-full transition-colors duration-100 ${
                      isPlayed
                        ? 'bg-gradient-to-t from-[#DD5A1F] via-[#FF8542] to-[#FFA366] shadow-[0_0_4px_rgba(221,90,31,0.35)]'
                        : 'bg-white/20 group-hover:bg-white/30'
                    }`}
                    style={{
                      height: `${bar.height}%`,
                      animationName: bar.animName,
                      animationDuration: `${bar.duration}s`,
                      animationDelay: `${bar.delay}s`,
                      animationIterationCount: 'infinite',
                      animationTimingFunction: 'ease-in-out',
                      animationPlayState: isPlaying && hasAudio ? 'running' : 'paused',
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <span className="font-mono text-[10px] sm:text-[11px] text-white/60 min-w-[34px] sm:min-w-[38px] shrink-0 select-none">
          {durationDisplayTime}
        </span>
      </div>

      {/* Error Alert Display */}
      {audioError && (
        <div
          role="alert"
          className="mt-2.5 px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-500/40 text-red-200 text-xs font-body flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2 truncate">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
            <span className="truncate">{audioError}</span>
          </div>
          <button
            type="button"
            onClick={() => setAudioError(null)}
            className="text-red-300 hover:text-white text-xs font-semibold underline shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
    </aside>
  );
};

