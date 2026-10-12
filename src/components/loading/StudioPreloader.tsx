import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  runMasterSiteWarmup,
  CriticalReadinessReport,
  WarmupProgressReport,
  StudioVisualPhase,
  ExplicitWarmupStage,
} from '../../lib/siteWarmup';

interface StudioPreloaderProps {
  onComplete: () => void;
  videoUrl?: string;
  posterUrl?: string;
}

export const StudioPreloader: React.FC<StudioPreloaderProps> = ({
  onComplete,
  videoUrl,
  posterUrl,
}) => {
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Preparing the studio');
  const [currentAsset, setCurrentAsset] = useState<string>('');
  const [stagePhase, setStagePhase] = useState<StudioVisualPhase>('dark');
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Parallax direct DOM references for 60fps compositor-only mouse following
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const lightBeamRef = useRef<SVGGElement>(null);
  const targetMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafIdRef = useRef<number | null>(null);

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Smooth mouse parallax loop (Desktop only, 0 React re-renders)
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const normX = (e.clientX / w - 0.5) * 2; // -1 to 1
      const normY = (e.clientY / h - 0.5) * 2; // -1 to 1
      targetMouseRef.current = { x: normX, y: normY };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const animateParallax = () => {
      const target = targetMouseRef.current;
      const current = currentMouseRef.current;

      // Smooth lerp damping
      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;

      if (stageContainerRef.current) {
        const rotY = current.x * 3.5;
        const rotX = -current.y * 2.5;
        const transX = current.x * 8;
        const transY = current.y * 5;
        stageContainerRef.current.style.transform = `perspective(1100px) rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg) translate3d(${transX.toFixed(2)}px, ${transY.toFixed(2)}px, 0px)`;
      }

      if (lightBeamRef.current) {
        // Subtle counter-parallax for light beam to enhance depth
        const lightShiftX = -current.x * 12;
        lightBeamRef.current.style.transform = `translate3d(${lightShiftX.toFixed(2)}px, 0px, 0px)`;
      }

      rafIdRef.current = requestAnimationFrame(animateParallax);
    };

    rafIdRef.current = requestAnimationFrame(animateParallax);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isMobile]);

  // Full-site warm-up and critical readiness verification lifecycle
  useEffect(() => {
    const { promise, cancel } = runMasterSiteWarmup({
      videoUrl,
      posterUrl,
      isMobile,
      maxTimeoutMs: 7000,
      onProgress: (report: WarmupProgressReport) => {
        setProgressPercent(report.percent);
        setStagePhase(report.phase);
        setStatusText(report.statusText);
        if (report.detailText) {
          setCurrentAsset(report.detailText);
        }
      },
    });

    let exitTimer: NodeJS.Timeout | null = null;
    let completeTimer: NodeJS.Timeout | null = null;

    promise.then((readiness: CriticalReadinessReport) => {
      // Systematically verify critical readiness before initiating StudioPreloader completion state
      if (readiness.isFullyVerified || readiness.videoReady || readiness.portraitsReady) {
        // 1. Reached 100% verified
        setProgressPercent(100);
        setStagePhase('ready');
        setStatusText('The studio is ready');
        setCurrentAsset('Welcome to Mic & Mind');

        // 2. Cinematic hold on completed studio scene (550ms)
        exitTimer = setTimeout(() => {
          setIsExiting(true);

          // 3. Smooth crossfade duration (650ms), then hand off to intro video
          completeTimer = setTimeout(() => {
            onComplete();
          }, 650);
        }, 550);
      }
    });

    return () => {
      cancel();
      if (exitTimer) clearTimeout(exitTimer);
      if (completeTimer) clearTimeout(completeTimer);
    };
  }, [videoUrl, posterUrl, isMobile, onComplete]);

  // Phase booleans for progressive animation states
  const showFloor = stagePhase !== 'dark';
  const showHostChair =
    stagePhase === 'host-chair' ||
    stagePhase === 'guest-chair' ||
    stagePhase === 'microphones' ||
    stagePhase === 'lights' ||
    stagePhase === 'gallery' ||
    stagePhase === 'warming' ||
    stagePhase === 'voices' ||
    stagePhase === 'mics-on' ||
    stagePhase === 'ready';
  const showGuestChair =
    stagePhase === 'guest-chair' ||
    stagePhase === 'microphones' ||
    stagePhase === 'lights' ||
    stagePhase === 'gallery' ||
    stagePhase === 'warming' ||
    stagePhase === 'voices' ||
    stagePhase === 'mics-on' ||
    stagePhase === 'ready';
  const showMicrophones =
    stagePhase === 'microphones' ||
    stagePhase === 'lights' ||
    stagePhase === 'gallery' ||
    stagePhase === 'warming' ||
    stagePhase === 'voices' ||
    stagePhase === 'mics-on' ||
    stagePhase === 'ready';
  const showLights =
    stagePhase === 'lights' ||
    stagePhase === 'gallery' ||
    stagePhase === 'warming' ||
    stagePhase === 'voices' ||
    stagePhase === 'mics-on' ||
    stagePhase === 'ready';
  const showMicsOn =
    stagePhase === 'voices' ||
    stagePhase === 'mics-on' ||
    stagePhase === 'ready';
  const isStudioReady = stagePhase === 'ready';

  // Minimal 4-stage dot step indicator
  const activeDotIndex =
    progressPercent < 25 ? 0 : progressPercent < 60 ? 1 : progressPercent < 90 ? 2 : 3;

  // Progressive transition from moody dark studio into radiant light orange theme
  const lightBloomRatio = Math.min(1, Math.max(0, (progressPercent - 15) / 75));
  const isLightDominant = lightBloomRatio > 0.45;

  return (
    <div
      id="mic-mind-studio-preloader"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between select-none overflow-hidden transition-all duration-700 ease-out bg-[#0B0705] ${
        isExiting
          ? 'opacity-0 scale-[1.03] pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% 35%, rgba(45, 25, 16, 0.55) 0%, rgba(11, 7, 5, 0.98) 75%, #070403 100%)',
      }}
      aria-label="Studio Preparation Loading Screen"
      role="status"
      aria-live="polite"
    >
      {/* Dynamic Blooming Light Orange Atmospheric Theme Layer */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-out"
        style={{
          opacity: lightBloomRatio,
          background:
            'radial-gradient(ellipse 95% 85% at 50% 45%, #FFF8F0 0%, #FFEDD5 35%, #FED7AA 70%, #FDBA74 100%)',
        }}
      />

      {/* Warm Ambient Volumetric Glow in Center */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700 ease-out"
        style={{
          opacity: showLights ? 0.75 : 0.25,
          background:
            'radial-gradient(circle at 50% 48%, rgba(234, 88, 12, 0.18) 0%, rgba(253, 186, 116, 0.12) 40%, transparent 70%)',
        }}
      />

      {/* Studio Acoustic Slat Wall Subtle Grid Texture */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          isLightDominant
            ? 'opacity-[0.06] bg-[radial-gradient(#7C2D12_1px,transparent_1px)]'
            : 'opacity-20 bg-[radial-gradient(#DD5A1F_1px,transparent_1px)]'
        } [background-size:24px_24px]`}
      />

      {/* Top Header Identity */}
      <header className="relative z-10 w-full pt-8 sm:pt-10 px-8 flex items-center justify-between max-w-6xl mx-auto transition-colors duration-700">
        <div className="flex items-center gap-2.5">
          <span
            className={`font-display text-xl sm:text-2xl tracking-tight font-medium transition-colors duration-700 ${
              isLightDominant ? 'text-[#1C140F]' : 'text-white'
            }`}
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            Mic & Mind
          </span>
          <span
            className={`text-xs font-mono transition-colors duration-700 ${
              isLightDominant ? 'text-[#C2410C]/40' : 'text-white/30'
            }`}
          >
            /
          </span>
          <span
            className={`font-mono text-[11px] uppercase tracking-widest font-bold transition-colors duration-700 ${
              isLightDominant ? 'text-[#EA580C]' : 'text-[#FF8542]'
            }`}
          >
            Studio
          </span>
        </div>

        {/* Minimal On-Air Beacon */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md transition-all duration-700 ${
            isLightDominant
              ? 'bg-white/85 border border-[#FED7AA] shadow-[0_4px_16px_rgba(234,88,12,0.12)] text-[#431407]'
              : 'bg-white/5 border border-white/10 text-white/70'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              isStudioReady
                ? 'bg-[#EA580C] shadow-[0_0_10px_#EA580C]'
                : showMicsOn
                ? 'bg-[#EA580C] animate-pulse shadow-[0_0_8px_#EA580C]'
                : isLightDominant
                ? 'bg-[#FED7AA]'
                : 'bg-white/20'
            }`}
          />
          <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
            {isStudioReady ? 'Live' : 'Standby'}
          </span>
        </div>
      </header>

      {/* Center Interactive Studio Stage (SVG + CSS 3D Transforms) */}
      <main className="relative z-10 flex-1 w-full max-w-4xl mx-auto flex items-center justify-center p-4 sm:p-6 overflow-visible">
        <div
          ref={stageContainerRef}
          className="relative w-full max-w-[620px] aspect-[4/3] flex items-center justify-center transition-transform duration-100 ease-out will-change-transform"
        >
          <svg
            viewBox="0 0 800 600"
            className="w-full h-full overflow-visible drop-shadow-2xl"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Studio Key Light Volumetric Cone Gradient */}
              <linearGradient id="studioLightCone" x1="400" y1="0" x2="400" y2="480" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FF9B54" stopOpacity="0.45" />
                <stop offset="35%" stopColor="#DD5A1F" stopOpacity="0.22" />
                <stop offset="75%" stopColor="#DD5A1F" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#DD5A1F" stopOpacity="0" />
              </linearGradient>

              {/* Stage Platform Surface Gradient */}
              <radialGradient id="stagePlatformGrad" cx="50%" cy="40%" r="50%">
                <stop offset="0%" stopColor="#2A1B14" />
                <stop offset="65%" stopColor="#170F0B" />
                <stop offset="100%" stopColor="#0E0806" />
              </radialGradient>

              {/* Warm Rim Light on Stage Edge */}
              <linearGradient id="stageRimGrad" x1="160" y1="440" x2="640" y2="440" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FF8542" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#FF8542" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#FF8542" stopOpacity="0.1" />
              </linearGradient>

              {/* Chair Leather Texture Gradients */}
              <linearGradient id="hostChairGrad" x1="240" y1="280" x2="340" y2="420" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3A241A" />
                <stop offset="50%" stopColor="#251610" />
                <stop offset="100%" stopColor="#140B07" />
              </linearGradient>
              <linearGradient id="guestChairGrad" x1="460" y1="280" x2="560" y2="420" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3A241A" />
                <stop offset="50%" stopColor="#251610" />
                <stop offset="100%" stopColor="#140B07" />
              </linearGradient>

              {/* Metallic Microphone Shading */}
              <linearGradient id="micMetalGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#55463D" />
                <stop offset="50%" stopColor="#2B211B" />
                <stop offset="100%" stopColor="#120D0A" />
              </linearGradient>

              {/* Soft Drop Shadow Filter for Furniture */}
              <filter id="furnitureShadow" x="-20%" y="-20%" width="140%" height="150%">
                <feDropShadow dx="0" dy="18" stdDeviation="14" floodColor="#000000" floodOpacity="0.7" />
              </filter>
            </defs>

            {/* 1. STUDIO OVERHEAD VOLUMETRIC KEY LIGHT CONE */}
            <g
              ref={lightBeamRef}
              className="transition-opacity duration-1000 ease-out will-change-transform pointer-events-none"
              style={{ opacity: showLights ? (isStudioReady ? 0.95 : 0.8) : 0 }}
            >
              <polygon points="370,10 430,10 680,480 120,480" fill="url(#studioLightCone)" />
              {/* Floor Light Pool */}
              <ellipse cx="400" cy="460" rx="260" ry="55" fill="#DD5A1F" fillOpacity="0.16" />
              <ellipse cx="400" cy="460" rx="180" ry="36" fill="#FF8542" fillOpacity="0.12" />
            </g>

            {/* 2. STUDIO PLATFORM / FLOOR RISER */}
            <g
              className="transition-all duration-700 ease-out"
              style={{
                opacity: showFloor ? 1 : 0,
                transform: showFloor ? 'translateY(0px)' : 'translateY(25px)',
              }}
            >
              {/* Ground Shadow */}
              <ellipse cx="400" cy="470" rx="270" ry="46" fill="#000000" fillOpacity="0.8" />
              {/* Riser Thickness Lip */}
              <path
                d="M 140 455 C 140 485, 660 485, 660 455 L 660 467 C 660 497, 140 497, 140 467 Z"
                fill="#120B08"
                stroke="#2B1A12"
                strokeWidth="1"
              />
              {/* Riser Top Deck */}
              <ellipse
                cx="400"
                cy="455"
                rx="260"
                ry="42"
                fill="url(#stagePlatformGrad)"
                stroke="url(#stageRimGrad)"
                strokeWidth="1.5"
              />
              {/* Center Table Pedestal */}
              <ellipse cx="400" cy="442" rx="42" ry="12" fill="#1C120C" stroke="#3D271D" strokeWidth="1" />
              <path d="M 392 442 L 392 422 L 408 422 L 408 442 Z" fill="#160E09" />
              <ellipse cx="400" cy="422" rx="34" ry="9" fill="#241710" stroke="#482F23" strokeWidth="1" />
            </g>

            {/* 3. HOST CHAIR (LEFT) */}
            <g
              filter="url(#furnitureShadow)"
              className="transition-all duration-700 ease-out will-change-transform"
              style={{
                opacity: showHostChair ? 1 : 0,
                transform: showHostChair ? 'translateX(0px)' : 'translateX(-60px)',
              }}
            >
              {/* Chair Stand / Base */}
              <ellipse cx="280" cy="448" rx="26" ry="7" fill="#18110D" stroke="#3A251B" strokeWidth="1" />
              <line x1="280" y1="448" x2="280" y2="400" stroke="#261A14" strokeWidth="4" strokeLinecap="round" />
              <line x1="280" y1="448" x2="262" y2="456" stroke="#261A14" strokeWidth="3" strokeLinecap="round" />
              <line x1="280" y1="448" x2="298" y2="456" stroke="#261A14" strokeWidth="3" strokeLinecap="round" />
              {/* Chair Cushion & Shell (Host facing gently toward center) */}
              <path
                d="M 240 375 C 240 320, 265 295, 305 305 C 315 340, 315 375, 305 390 C 275 395, 240 395, 240 375 Z"
                fill="url(#hostChairGrad)"
                stroke="#543628"
                strokeWidth="1.2"
              />
              {/* Backrest Cushion Accent Line */}
              <path
                d="M 252 368 C 255 330, 272 312, 298 318"
                stroke="#FF8542"
                strokeWidth="1"
                strokeOpacity={showLights ? 0.35 : 0.1}
                fill="none"
              />
              {/* Seat Cushion Surface */}
              <ellipse cx="282" cy="388" rx="24" ry="10" fill="#2E1D15" stroke="#482F23" strokeWidth="1" />
            </g>

            {/* 4. GUEST CHAIR (RIGHT) */}
            <g
              filter="url(#furnitureShadow)"
              className="transition-all duration-700 ease-out will-change-transform"
              style={{
                opacity: showGuestChair ? 1 : 0,
                transform: showGuestChair ? 'translateX(0px)' : 'translateX(60px)',
              }}
            >
              {/* Chair Stand / Base */}
              <ellipse cx="520" cy="448" rx="26" ry="7" fill="#18110D" stroke="#3A251B" strokeWidth="1" />
              <line x1="520" y1="448" x2="520" y2="400" stroke="#261A14" strokeWidth="4" strokeLinecap="round" />
              <line x1="520" y1="448" x2="502" y2="456" stroke="#261A14" strokeWidth="3" strokeLinecap="round" />
              <line x1="520" y1="448" x2="538" y2="456" stroke="#261A14" strokeWidth="3" strokeLinecap="round" />
              {/* Chair Cushion & Shell (Guest facing gently toward center) */}
              <path
                d="M 560 375 C 560 320, 535 295, 495 305 C 485 340, 485 375, 495 390 C 525 395, 560 395, 560 375 Z"
                fill="url(#guestChairGrad)"
                stroke="#543628"
                strokeWidth="1.2"
              />
              {/* Backrest Cushion Accent Line */}
              <path
                d="M 548 368 C 545 330, 528 312, 502 318"
                stroke="#FF8542"
                strokeWidth="1"
                strokeOpacity={showLights ? 0.35 : 0.1}
                fill="none"
              />
              {/* Seat Cushion Surface */}
              <ellipse cx="518" cy="388" rx="24" ry="10" fill="#2E1D15" stroke="#482F23" strokeWidth="1" />
            </g>

            {/* 5. BROADCAST MICROPHONES ON BOOM ARMS */}
            <g
              className="transition-all duration-700 ease-out will-change-transform"
              style={{
                opacity: showMicrophones ? 1 : 0,
                transform: showMicrophones ? 'translateY(0px)' : 'translateY(-35px)',
              }}
            >
              {/* Left Host Microphone */}
              <g>
                {/* Articulated Scissor Boom Arm */}
                <line x1="385" y1="422" x2="350" y2="385" stroke="#2C1D16" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="350" y1="385" x2="330" y2="350" stroke="#2C1D16" strokeWidth="2.5" strokeLinecap="round" />
                {/* Shockmount Ring */}
                <circle cx="330" cy="350" r="10" stroke="#4A3125" strokeWidth="1.5" fill="none" />
                {/* Microphone Body (Shure SM7B aesthetic) */}
                <rect
                  x="323"
                  y="336"
                  width="14"
                  height="26"
                  rx="4"
                  fill="url(#micMetalGrad)"
                  stroke="#5C3E30"
                  strokeWidth="1"
                  transform="rotate(18, 330, 349)"
                />
                {/* Capsule Acoustic Grille */}
                <rect
                  x="324"
                  y="337"
                  width="12"
                  height="10"
                  rx="2"
                  fill="#1C1410"
                  transform="rotate(18, 330, 349)"
                />
                {/* Microphone Amber "On-Air" Indicator Ring */}
                <line
                  x1="324"
                  y1="348"
                  x2="336"
                  y2="348"
                  stroke={showMicsOn ? '#FF8542' : '#3D281E'}
                  strokeWidth="2"
                  transform="rotate(18, 330, 349)"
                  className="transition-all duration-500"
                  style={{
                    filter: showMicsOn ? 'drop-shadow(0 0 4px #FF8542)' : 'none',
                  }}
                />
              </g>

              {/* Right Guest Microphone */}
              <g>
                {/* Articulated Scissor Boom Arm */}
                <line x1="415" y1="422" x2="450" y2="385" stroke="#2C1D16" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="450" y1="385" x2="470" y2="350" stroke="#2C1D16" strokeWidth="2.5" strokeLinecap="round" />
                {/* Shockmount Ring */}
                <circle cx="470" cy="350" r="10" stroke="#4A3125" strokeWidth="1.5" fill="none" />
                {/* Microphone Body */}
                <rect
                  x="463"
                  y="336"
                  width="14"
                  height="26"
                  rx="4"
                  fill="url(#micMetalGrad)"
                  stroke="#5C3E30"
                  strokeWidth="1"
                  transform="rotate(-18, 470, 349)"
                />
                {/* Capsule Acoustic Grille */}
                <rect
                  x="464"
                  y="337"
                  width="12"
                  height="10"
                  rx="2"
                  fill="#1C1410"
                  transform="rotate(-18, 470, 349)"
                />
                {/* Microphone Amber "On-Air" Indicator Ring */}
                <line
                  x1="464"
                  y1="348"
                  x2="476"
                  y2="348"
                  stroke={showMicsOn ? '#FF8542' : '#3D281E'}
                  strokeWidth="2"
                  transform="rotate(-18, 470, 349)"
                  className="transition-all duration-500"
                  style={{
                    filter: showMicsOn ? 'drop-shadow(0 0 4px #FF8542)' : 'none',
                  }}
                />
              </g>
            </g>

            {/* 6. OVERHEAD STUDIO SOFTBOX / SPOTLIGHT FIXTURE */}
            <g
              className="transition-opacity duration-700 ease-out"
              style={{ opacity: showLights ? 1 : 0.2 }}
            >
              <ellipse cx="400" cy="20" rx="35" ry="8" fill="#1C140F" stroke="#3A281E" strokeWidth="1" />
              <polygon points="380,20 420,20 440,34 360,34" fill="#291C15" stroke="#4A3427" strokeWidth="1" />
              <ellipse
                cx="400"
                cy="34"
                rx="40"
                ry="9"
                fill={showLights ? '#FFA566' : '#2A1A12'}
                className="transition-colors duration-700"
                style={{
                  filter: showLights ? 'drop-shadow(0 0 12px #FF8542)' : 'none',
                }}
              />
            </g>
          </svg>
        </div>
      </main>

      {/* Bottom Minimal Status & Progress Controls */}
      <footer className="relative z-10 w-full pb-10 sm:pb-12 px-6 flex flex-col items-center justify-center gap-4 text-center max-w-lg mx-auto transition-colors duration-700">
        {/* Dynamic Editorial Status Text with Instrument Serif Scribe Typography */}
        <div className="flex flex-col items-center gap-1 min-h-[56px] justify-center">
          <p
            className={`font-serif text-2xl sm:text-3xl font-normal tracking-tight leading-tight transition-all duration-500 ${
              isLightDominant
                ? isStudioReady
                  ? 'text-[#EA580C] drop-shadow-[0_2px_12px_rgba(234,88,12,0.3)]'
                  : 'text-[#1C140F]'
                : isStudioReady
                ? 'text-[#FF8542] drop-shadow-[0_0_12px_rgba(255,133,66,0.6)]'
                : 'text-white/90'
            }`}
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            {statusText}
          </p>
          {currentAsset && !isStudioReady && (
            <p
              className={`font-serif italic text-xs sm:text-sm font-normal tracking-wide transition-colors duration-500 truncate max-w-[340px] ${
                isLightDominant ? 'text-[#7C2D12]/80' : 'text-white/50'
              }`}
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              {currentAsset}
            </p>
          )}

          {/* 4-Step Minimal Amber Progress Dots */}
          <div className="flex items-center gap-2 pt-2" aria-hidden="true">
            {[0, 1, 2, 3].map((step) => (
              <span
                key={step}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  activeDotIndex === step
                    ? isLightDominant
                      ? 'w-6 bg-[#EA580C] shadow-[0_0_10px_rgba(234,88,12,0.7)]'
                      : 'w-6 bg-[#DD5A1F] shadow-[0_0_8px_rgba(221,90,31,0.9)]'
                    : activeDotIndex > step
                    ? isLightDominant
                      ? 'w-2 bg-[#EA580C]/50'
                      : 'w-2 bg-[#DD5A1F]/60'
                    : isLightDominant
                    ? 'w-1.5 bg-[#FED7AA]'
                    : 'w-1.5 bg-white/15'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Thin Hairline Studio Progress Track */}
        <div
          className={`w-48 sm:w-60 h-[2px] rounded-full overflow-hidden transition-colors duration-500 ${
            isLightDominant
              ? 'bg-[#FED7AA]/60 border border-[#FDBA74]/30'
              : 'bg-white/10'
          }`}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-gradient-to-r from-[#DD5A1F] via-[#EA580C] to-[#FF8542] transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </footer>
    </div>
  );
};
