import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Music,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  RefreshCw,
  Link as LinkIcon,
  Check,
  Headphones,
  AlertCircle,
} from 'lucide-react';
import { uploadMediaToCloudinary, validateMediaFile } from '../lib/cloudinaryService';

interface AudioUploadFieldProps {
  label: string;
  description?: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  id?: string;
}

export const AudioUploadField: React.FC<AudioUploadFieldProps> = ({
  label,
  description,
  value,
  onChange,
  folder = 'mic-and-mind/episodes/audio',
  id = 'audio-upload',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [manualUrl, setManualUrl] = useState(value || '');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Audio Playback State for in-editor testing
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reset playback when value changes
    setIsPlaying(false);
    setCurrentTime(0);
  }, [value]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    setUploadError(null);

    // 1. Strict validation (MP3, WAV up to 100MB)
    const validation = validateMediaFile(file, 'audio');
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid audio format.');
      return;
    }

    try {
      setUploadProgress(5);
      const secureUrl = await uploadMediaToCloudinary({
        file,
        folder,
        expectedType: 'audio',
        onProgress: (percent) => setUploadProgress(percent),
      });

      onChange(secureUrl);
      setUploadProgress(null);
      setUploadError(null);
    } catch (err: any) {
      console.error('Audio upload failed:', err);
      setUploadProgress(null);
      setUploadError(err?.message || 'Failed to upload audio track to Cloudinary.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleManualUrlSave = () => {
    if (manualUrl.trim()) {
      onChange(manualUrl.trim());
      setIsUrlMode(false);
      setUploadError(null);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Audio playback error', err);
          setIsPlaying(false);
        });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
          {label}
        </label>
        <button
          type="button"
          onClick={() => {
            setIsUrlMode(!isUrlMode);
            setManualUrl(value || '');
            setUploadError(null);
          }}
          className="text-[11px] font-mono text-neutral-400 hover:text-[#DD5A1F] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{isUrlMode ? 'File Upload Mode' : 'Direct Audio Link'}</span>
        </button>
      </div>

      {description && <p className="text-xs text-neutral-400 leading-relaxed">{description}</p>}

      {/* Validation / Error Feedback Alert */}
      {uploadError && (
        <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/80 flex items-start gap-2.5 text-xs text-red-300 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-red-200">Audio Error: </span>
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-red-400 hover:text-red-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {isUrlMode ? (
        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-700 space-y-2.5">
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/..."
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-[#DD5A1F]"
            />
            <button
              type="button"
              onClick={handleManualUrlSave}
              className="px-3 py-2 bg-[#DD5A1F] hover:bg-[#B84312] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </div>
      ) : value ? (
        /* Audio Player Preview & Controls */
        <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-700 space-y-3">
          <audio
            ref={audioRef}
            src={value}
            onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
            onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
            onEnded={() => setIsPlaying(false)}
            muted={isMuted}
          />

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#DD5A1F]/15 border border-[#DD5A1F]/30 flex items-center justify-center shrink-0">
                <Music className="w-4 h-4 text-[#DD5A1F]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                    {value.includes('cloudinary.com') ? 'Cloudinary Master Track' : 'Direct Audio Stream'}
                  </span>
                </div>
                <div className="text-xs font-mono text-neutral-300 truncate" title={value}>
                  {value}
                </div>
                <div className="text-[10px] font-mono text-neutral-400 flex items-center gap-2 pt-0.5">
                  <span>{formatTime(currentTime)} / {formatTime(duration || 180)}</span>
                  <span>•</span>
                  <span className="text-[#DD5A1F]">Stream Ready</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadProgress !== null}
                title="Replace Audio"
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors cursor-pointer border border-neutral-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#DD5A1F] ${uploadProgress !== null ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (audioRef.current) audioRef.current.pause();
                  onChange('');
                }}
                title="Remove Audio"
                className="p-1.5 bg-neutral-800 hover:bg-red-900/40 text-red-400 rounded-lg transition-colors cursor-pointer border border-neutral-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Player Controls */}
          <div className="pt-2 border-t border-neutral-800 flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-[#DD5A1F] hover:bg-[#B84312] text-white flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                  setCurrentTime(0);
                }
              }}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Restart Track"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Seek Bar */}
            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#DD5A1F]"
              />
            </div>

            {/* Mute button */}
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,audio/mpeg,audio/mp3,audio/wav"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        /* Drag-and-Drop Audio Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (uploadProgress === null) fileInputRef.current?.click();
          }}
          className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#DD5A1F] bg-[#DD5A1F]/10 scale-[1.01]'
              : 'border-neutral-700 hover:border-neutral-500 bg-neutral-900/60 hover:bg-neutral-900'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,audio/mpeg,audio/mp3,audio/wav"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400">
              <Headphones className={`w-5 h-5 text-[#DD5A1F] ${uploadProgress !== null ? 'animate-bounce' : ''}`} />
            </div>

            <div>
              <span className="text-xs font-semibold text-white">
                {uploadProgress !== null ? 'Uploading Audio Track to Cloudinary...' : 'Click to upload podcast audio'}
              </span>
              {uploadProgress === null && <span className="text-xs text-neutral-400"> or drag and drop</span>}
            </div>

            <p className="text-[11px] text-neutral-500 font-mono">
              MP3, WAV up to 100MB
            </p>

            {uploadProgress !== null && (
              <div className="w-full max-w-xs mt-2 space-y-1">
                <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#DD5A1F] transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-neutral-400">{uploadProgress}% complete</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
