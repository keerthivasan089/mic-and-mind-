// Web Audio API Synthesis Engine for 5-Second Highlight Audio Previews
// Generates warm, studio-quality atmospheric podcast teasers with unique harmonic profiles for each episode.

export interface PreviewState {
  episodeId: string | null;
  isPlaying: boolean;
  progress: number; // 0 to 1
  remainingSeconds: number;
}

class AudioPreviewEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private stopTimer: NodeJS.Timeout | null = null;
  private progressInterval: NodeJS.Timeout | null = null;
  private currentEpisodeId: string | null = null;
  private startTime: number = 0;
  private duration: number = 5.0; // 5 seconds highlight clip
  private onStateChange: ((state: PreviewState) => void) | null = null;

  private getAudioContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public subscribe(listener: (state: PreviewState) => void): () => void {
    this.onStateChange = listener;
    return () => {
      if (this.onStateChange === listener) {
        this.onStateChange = null;
      }
    };
  }

  private notify(episodeId: string | null, isPlaying: boolean, progress: number, remaining: number) {
    if (this.onStateChange) {
      this.onStateChange({
        episodeId,
        isPlaying,
        progress,
        remainingSeconds: remaining,
      });
    }
  }

  // Harmonic chord structures and melodic progressions for each episode category
  private getEpisodeSoundProfile(episodeId: string) {
    const key = episodeId.toLowerCase();
    if (key === 'ep-042' || key.includes('000000000042')) {
      // Entrepreneurship: Maya Lin - energetic, driving, aspirational
      return {
        baseFreq: 220, // A3
        chords: [
          [220, 277.18, 329.63, 440],     // A major
          [246.94, 293.66, 369.99, 493.88], // B minor
          [277.18, 329.63, 415.3, 554.37],  // C# minor
          [293.66, 369.99, 440, 587.33],   // D major
        ],
        timbre: 'sawtooth' as OscillatorType,
        filterCutoff: 1800,
        tempo: 0.45,
      };
    }
    if (key === 'ep-041' || key.includes('000000000041')) {
      // Failure & Recovery: Marcus Vance - introspective, warm, emotional
      return {
        baseFreq: 174.61, // F3
        chords: [
          [174.61, 220.0, 261.63, 349.23], // F major
          [196.0, 233.08, 293.66, 392.0],  // G minor
          [220.0, 261.63, 329.63, 440.0],  // A minor
          [174.61, 261.63, 329.63, 440.0], // Dm/F
        ],
        timbre: 'triangle' as OscillatorType,
        filterCutoff: 1200,
        tempo: 0.6,
      };
    }
    if (key === 'ep-040' || key.includes('000000000040')) {
      // Growth & Mindset: Elena Rostova - shimmering, avant-garde, crystal clear
      return {
        baseFreq: 261.63, // C4
        chords: [
          [261.63, 329.63, 392.0, 493.88], // Cmaj7
          [293.66, 349.23, 440.0, 523.25], // Dm7
          [329.63, 392.0, 493.88, 587.33], // Em7
          [349.23, 440.0, 523.25, 659.25], // Fmaj7
        ],
        timbre: 'sine' as OscillatorType,
        filterCutoff: 2600,
        tempo: 0.4,
      };
    }

    // Default Connection/Organic harmony
    return {
      baseFreq: 196.0, // G3
      chords: [
        [196.0, 246.94, 293.66, 392.0],  // G major
        [220.0, 261.63, 329.63, 440.0],  // A minor
        [246.94, 293.66, 392.0, 493.88], // G/B
        [261.63, 329.63, 392.0, 523.25], // C major
      ],
      timbre: 'triangle' as OscillatorType,
      filterCutoff: 1500,
      tempo: 0.5,
    };
  }

  public playPreview(_episodeId: string, _duration = 5.0) {
    // Intentionally disabled: The public site uses a single authoritative AudioPlayerBar.
    // AudioContext synthesis is completely disabled to ensure only one audio system exists.
    return;
  }

  public stopPreview() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    if (this.stopTimer) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }

    if (this.masterGain && this.ctx && this.ctx.state === 'running') {
      try {
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.15);
      } catch {
        // ignore ramp error
      }
    }

    setTimeout(() => {
      this.activeNodes.forEach((node) => {
        if (typeof node !== 'number') {
          try {
            if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
              (node as AudioScheduledSourceNode).stop();
            }
            node.disconnect();
          } catch {
            // ignore
          }
        }
      });
      this.activeNodes = [];
    }, 180);

    const prevId = this.currentEpisodeId;
    this.currentEpisodeId = null;
    this.masterGain = null;
    this.notify(prevId, false, 0, 0);
  }

  public getCurrentEpisodeId(): string | null {
    return this.currentEpisodeId;
  }
}

export const audioPreviewEngine = new AudioPreviewEngine();
