import React, { useState, useEffect, useCallback } from 'react';
import { VideoHero } from './components/sections/VideoHero';
import { Header } from './components/layout/Header';
import { Episodes } from './components/sections/Episodes';
import { EditorialPillars } from './components/sections/EditorialPillars';
import { OrganicVideoPortal } from './components/sections/OrganicVideoPortal';
import { Feeling } from './components/sections/Feeling';
import { ListenOn } from './components/sections/ListenOn';
import { Footer } from './components/layout/Footer';
import { AudioPlayerBar } from './components/ui/AudioPlayerBar';
import { StackCard } from './components/ui/StackCard';
import { TranscriptModal } from './components/ui/TranscriptModal';
import { AudioWaveDivider } from './components/ui/AudioWaveDivider';
import { Episode } from './types';
import { preloadAllEpisodeThumbnails } from './lib/preload';
import { EPISODES_DATA } from './lib/data';
import { AdminPortal } from './admin/AdminPortal';
import { useCMSDataset } from './lib/cmsStore';
import { mapCmsDocToEpisode } from './lib/episodes';
import { HallOfFameSection } from './components/sections/HallOfFameSection';
import { FoundersVoices } from './components/sections/FoundersVoices';
import { StudioPreloader } from './components/loading/StudioPreloader';
import { ReactLenis } from 'lenis/react';

const STACK_CARD_IDS = [
  'episodes-stack',
  'hall-of-fame',
  'founders-stack',
  'themes-stack',
  'portal-stack',
  'feeling-stack',
  'listen-footer-stack',
];

export default function App() {
  const cms = useCMSDataset();
  const allEpisodes = cms.carouselEpisodes.map(mapCmsDocToEpisode);

  const [currentPath, setCurrentPath] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScrollUnlocked, setIsScrollUnlocked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPreloaderComplete, setIsPreloaderComplete] = useState(false);

  // Transcript Side-Panel Modal State
  const [transcriptEpisode, setTranscriptEpisode] = useState<Episode | null>(null);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);

  // If path starts with /admin, mount Admin Portal workspace directly
  if (currentPath.startsWith('/admin')) {
    return <AdminPortal />;
  }

  const handleOpenTranscript = (episode: Episode) => {
    setTranscriptEpisode(episode);
    setIsTranscriptOpen(true);
  };

  const handleCloseTranscript = () => {
    setIsTranscriptOpen(false);
  };

  // Preload episode assets on app boot so carousel thumbnails are instantly warm in memory
  useEffect(() => {
    preloadAllEpisodeThumbnails();
  }, []);

  // Lock window scrolling while the video is playing
  useEffect(() => {
    if (!isScrollUnlocked) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isScrollUnlocked]);

  // Instant handoff: unlock scroll the moment the video completes
  const handleVideoComplete = () => {
    setIsScrollUnlocked(true);
    document.body.style.overflow = 'unset';
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
    });
  };

  const handlePlayEpisode = (episodeOrId: Episode | string) => {
    let episode: Episode | undefined;
    if (typeof episodeOrId === 'string') {
      episode =
        allEpisodes.find((ep) => ep.id === episodeOrId) ||
        (episodeOrId === 'ep1' ? { ...allEpisodes[0], id: 'ep1' } : null) ||
        (episodeOrId === 'ep2' ? { ...(allEpisodes[1] || allEpisodes[0]), id: 'ep2' } : null) ||
        allEpisodes[0] ||
        EPISODES_DATA[0];
    } else {
      episode = episodeOrId;
    }
    if (!episode) return;

    if (currentEpisode?.id === episode.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentEpisode(episode);
      setIsPlaying(true);
    }
  };

  const handleTogglePlay = () => {
    if (!currentEpisode) {
      setCurrentEpisode(allEpisodes[0] || EPISODES_DATA[0]);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
    setCurrentEpisode(null);
  };

  // Helper to find currently focused stack card index
  const getCurrentCardIndex = useCallback((): number => {
    const scrollY = window.scrollY;
    // If user is at the very top (hero video)
    if (scrollY < window.innerHeight * 0.35) {
      return -1;
    }

    const viewportReference = scrollY + window.innerHeight * 0.3;
    let closestIndex = 0;
    let minDistance = Infinity;

    STACK_CARD_IDS.forEach((id, idx) => {
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        const distance = Math.abs(top - viewportReference);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = idx;
        }
      }
    });

    return closestIndex;
  }, []);

  const scrollToCard = useCallback((index: number) => {
    setIsScrollUnlocked(true);
    document.body.style.overflow = 'unset';

    if (index < 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const targetId = STACK_CARD_IDS[Math.min(index, STACK_CARD_IDS.length - 1)];
    const el = document.getElementById(targetId);
    if (el) {
      const yOffset = -20;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  // Global Keyboard Event Listeners for Stack Card Arrow Navigation & Space Bar Play/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keyboard shortcuts if the user is typing in an active input, textarea, or contentEditable element
      const activeElement = document.activeElement;
      const isInputActive =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT' ||
          (activeElement as HTMLElement).isContentEditable);

      if (isInputActive) {
        return;
      }

      // Space bar: Toggle Play / Pause current episode
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleTogglePlay();
        return;
      }

      // Arrow Down / Arrow Right: Navigate to next stack card
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        const currentIndex = getCurrentCardIndex();
        const nextIndex = currentIndex < 0 ? 0 : Math.min(STACK_CARD_IDS.length - 1, currentIndex + 1);
        scrollToCard(nextIndex);
        return;
      }

      // Arrow Up / Arrow Left: Navigate to previous stack card
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const currentIndex = getCurrentCardIndex();
        const prevIndex = currentIndex <= 0 ? -1 : currentIndex - 1;
        scrollToCard(prevIndex);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [getCurrentCardIndex, scrollToCard, handleTogglePlay]);

  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1.2, smoothWheel: true }}>
      <div
        id="top"
        className="min-h-screen bg-cream text-ink flex flex-col antialiased selection:bg-orange selection:text-white"
      >
      {/* 0. Full-Screen Interactive Studio Preparation Preloader (Initial Page Load Only) */}
      {!isPreloaderComplete && (
        <StudioPreloader
          onComplete={() => setIsPreloaderComplete(true)}
        />
      )}

      {/* 1. Full-Bleed Sticky Hero Video Section with 9:16 vertical frame & instant handoff */}
      <div
        className={`sticky top-0 z-0 w-full h-[100svh] overflow-hidden ${
          !isPreloaderComplete ? 'pointer-events-none' : ''
        }`}
        aria-hidden={!isPreloaderComplete}
      >
        <VideoHero
          isUnlocked={isScrollUnlocked}
          onVideoComplete={handleVideoComplete}
          canPlay={isPreloaderComplete}
        />
      </div>

      {/* 2. Scroll-Driven Stacked Cards Architecture */}
      <div
        className={`relative z-10 w-full bg-transparent flex flex-col transition-all duration-300 ${
          isScrollUnlocked ? 'opacity-100' : 'opacity-95'
        } ${!isPreloaderComplete ? 'pointer-events-none select-none' : ''}`}
        aria-hidden={!isPreloaderComplete}
      >
        {/* Navigation Bar: Sticks at top when scrolling past hero */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Card 1: Featured Episodes & Dynamic Arc Carousel (Dealt directly over Hero) */}
        <StackCard
          id="episodes-stack"
          zIndex={10}
          rotationInitial={-1.5}
          scaleInitial={0.94}
          isFirstOverHero={true}
          className="-mt-8 sm:-mt-12"
        >
          <AudioWaveDivider
            theme="cream"
            isPlaying={isPlaying}
            seed={1}
            className="!border-t-0"
          />
          <Episodes
            currentEpisode={currentEpisode}
            isPlaying={isPlaying}
            onPlayEpisode={handlePlayEpisode}
            onOpenTranscript={handleOpenTranscript}
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery('')}
          />
        </StackCard>

        {/* Hall of Fame: 3D Architectural Museum Gallery (Scroll-Driven Pinned Viewport) */}
        <HallOfFameSection
          episodes={allEpisodes}
          currentEpisode={currentEpisode}
          isPlaying={isPlaying}
          onPlayEpisode={handlePlayEpisode}
          onOpenTranscript={handleOpenTranscript}
          searchQuery={searchQuery}
        />

        {/* Card 2: Founders' Voices (Curators & Archivists Profile Carousel) */}
        <StackCard
          id="founders-stack"
          zIndex={18}
          rotationInitial={-0.8}
          scaleInitial={0.955}
          className="-mt-6 sm:-mt-10"
        >
          <AudioWaveDivider
            theme="light"
            isPlaying={isPlaying}
            seed={8}
            className="!border-t-0"
          />
          <FoundersVoices
            currentEpisode={currentEpisode}
            isPlaying={isPlaying}
            onPlayEpisode={handlePlayEpisode}
          />
        </StackCard>

        {/* Card 3: Core Editorial Pillars (SVG Follow Scroll Journey) */}
        <StackCard
          id="themes-stack"
          zIndex={30}
          rotationInitial={-1.0}
          scaleInitial={0.96}
          className="-mt-6 sm:-mt-10"
        >
          <AudioWaveDivider
            theme="light"
            isPlaying={isPlaying}
            seed={3}
            className="!border-t-0"
          />
          <EditorialPillars />
        </StackCard>

        {/* Card 4: Editorial Organic Video Portal (Standalone Section after Four Cornerstones) */}
        <StackCard
          id="portal-stack"
          zIndex={38}
          rotationInitial={0.8}
          scaleInitial={0.965}
          className="-mt-6 sm:-mt-10"
        >
          <AudioWaveDivider
            theme="cream"
            isPlaying={isPlaying}
            seed={7}
            className="!border-t-0"
          />
          <OrganicVideoPortal />
        </StackCard>

        {/* Card 5: The Mindset / Feeling (Dark moody cinematic card dealt onto stack) */}
        <StackCard
          id="feeling-stack"
          zIndex={45}
          rotationInitial={-0.6}
          scaleInitial={0.97}
          className="-mt-6 sm:-mt-10"
        >
          <AudioWaveDivider
            theme="dark"
            isPlaying={isPlaying}
            seed={4}
            className="!border-t-0"
          />
          <Feeling />
        </StackCard>

        {/* Card 6: Listen Platforms & Footer (Final card closing the deck) */}
        <StackCard
          id="listen-footer-stack"
          zIndex={55}
          rotationInitial={0.6}
          scaleInitial={0.975}
          className="-mt-6 sm:-mt-10"
        >
          <AudioWaveDivider
            theme="light"
            isPlaying={isPlaying}
            seed={5}
            className="!border-t-0"
          />
          <ListenOn />
          <AudioWaveDivider
            theme="light"
            isPlaying={isPlaying}
            seed={6}
          />
          <Footer />
        </StackCard>
      </div>

      {/* Persistent Audio Player Bar */}
      <AudioPlayerBar
        currentEpisode={currentEpisode}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onClose={handleClosePlayer}
        onOpenTranscript={handleOpenTranscript}
      />

      {/* Side-Panel / Drawer Modal Transcript Viewer */}
      <TranscriptModal
        episode={transcriptEpisode}
        isOpen={isTranscriptOpen}
        onClose={handleCloseTranscript}
        isPlaying={isPlaying && currentEpisode?.id === transcriptEpisode?.id}
        onPlayEpisode={handlePlayEpisode}
      />
      </div>
    </ReactLenis>
  );
}
