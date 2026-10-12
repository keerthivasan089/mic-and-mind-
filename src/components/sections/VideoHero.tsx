import React, { useEffect, useRef, useState } from 'react';
import { useCMSDataset } from '../../lib/cmsStore';

interface VideoHeroProps {
  onVideoComplete?: () => void;
  isUnlocked?: boolean;
  canPlay?: boolean;
}

export const VideoHero: React.FC<VideoHeroProps> = ({
  onVideoComplete,
  isUnlocked = false,
  canPlay = true,
}) => {
  const cms = useCMSDataset();
  const heroVideo = cms.heroVideos.find((v) => v.isActive) || cms.heroVideos[0];

  const desktopVideoUrl =
    heroVideo?.desktopVideoUrl ||
    'https://res.cloudinary.com/hiekaatg/video/upload/v1787462200/watermark-removed-Cinematic_D_rendered_podcast_1.mp4';
  const mobileVideoUrl =
    heroVideo?.mobileVideoUrl ||
    'https://res.cloudinary.com/hiekaatg/video/upload/c_fill,ar_9:16,g_center/v1787462200/watermark-removed-Cinematic_D_rendered_podcast_1.mp4';
  const posterUrl =
    heroVideo?.posterUrl ||
    'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1600&auto=format&fit=crop';

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [autoplayFailed, setAutoplayFailed] = useState(false);

  // 1. Initial configuration & pre-buffering pipeline (runs on mount regardless of canPlay)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.removeAttribute('controls');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    if (!canPlay) {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        // Ignore if metadata not yet parsed
      }
    }

    try {
      video.load();
    } catch (e) {
      console.warn('Initial video load notice:', e);
    }
  }, []);

  // 2. Playback execution pipeline (runs when canPlay becomes true)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !canPlay) return;

    const tryPlay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Autoplay blocked or failed on mobile:', err);
          // Autoplay fallback: if blocked on mobile/edge browsers, immediately show poster and unlock scroll
          setAutoplayFailed(true);
          setVideoEnded(true);
          onVideoComplete?.();
        });
      }
    };

    // Video has been pre-buffered, so tryPlay() launches immediately
    tryPlay();

    const handleEnded = () => {
      setVideoEnded(true);
      onVideoComplete?.();
    };

    const handleTimeUpdate = () => {
      if (video.duration && video.currentTime) {
        // Immediate handoff as soon as video hits 99% or ends
        if (video.currentTime >= video.duration - 0.15 && !videoEnded) {
          setVideoEnded(true);
          onVideoComplete?.();
        }
      }
    };

    const handleError = () => {
      // If video resource fails to load on mobile, fallback immediately
      setAutoplayFailed(true);
      setVideoEnded(true);
      onVideoComplete?.();
    };

    // Standard media event listeners
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('canplay', tryPlay);
    video.addEventListener('loadeddata', tryPlay);
    video.addEventListener('error', handleError);

    // Fallback safety timeout matching video duration (~10.2s) in case events fail in edge environments
    const fallbackTimer = setTimeout(() => {
      if (!videoEnded) {
        setVideoEnded(true);
        onVideoComplete?.();
      }
    }, 10500);

    // One-time interaction fallback if browser blocked unmuted/initial autoplay
    const handleFirstInteraction = () => {
      if (video.paused && !videoEnded) {
        video.play().catch(() => {
          setAutoplayFailed(true);
          setVideoEnded(true);
          onVideoComplete?.();
        });
      }
    };
    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      clearTimeout(fallbackTimer);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('canplay', tryPlay);
      video.removeEventListener('loadeddata', tryPlay);
      video.removeEventListener('error', handleError);
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [onVideoComplete, videoEnded, canPlay]);

  return (
    <section
      id="video-hero-section"
      className={`relative w-full h-[100svh] min-h-[500px] overflow-hidden bg-[#1C140F] flex items-center justify-center select-none transition-all duration-300 ${
        isUnlocked || videoEnded ? 'opacity-90 scale-[0.99] filter brightness-95' : 'opacity-100 scale-100'
      }`}
      aria-label="Hero Video Presentation"
    >
      {/* Background Static Poster Image Fallback if Video is Loading or Autoplay is Blocked */}
      <div
        className={`absolute inset-0 w-full h-full bg-no-repeat bg-contain md:bg-cover bg-center transition-opacity duration-700 pointer-events-none z-0 ${
          autoplayFailed ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: `url(${posterUrl})`,
        }}
      />

      {/* Responsive Video: object-contain on mobile (<768px) to show full uncropped frame with ink letterboxing, object-cover on desktop/tablet */}
      <video
        ref={videoRef}
        id="hero-intro-video"
        muted
        playsInline
        preload="auto"
        poster={posterUrl}
        className="absolute inset-0 w-full h-full object-contain md:object-cover object-center z-0 pointer-events-none transition-opacity duration-500"
      >
        {/* Mobile-specific Portrait Cropped Source (< 768px) */}
        <source
          media="(max-width: 767px)"
          src={mobileVideoUrl}
          type="video/mp4"
        />
        {/* Desktop/Default Wide Video Source */}
        <source
          src={desktopVideoUrl}
          type="video/mp4"
        />
        {/* Fallback plain source */}
        <source
          src={desktopVideoUrl}
        />
      </video>

      {/* Subtle Studio Vignette for clean edge blending */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1C140F] via-transparent to-[#1C140F]/30 pointer-events-none z-1" />
    </section>
  );
};
