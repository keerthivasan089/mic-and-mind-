import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ArrowLeft, ArrowRight, Play, Pause } from 'lucide-react';
import { Episode } from '../../types';

interface FoundersVoicesProps {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  onPlayEpisode: (episodeId: string) => void;
  className?: string;
}

const FOUNDERS = [
  {
    id: 'f1',
    name: 'Keerthi Vasan P',
    role: 'Co-Founder & Host',
    quote:
      'We built Mic & Mind to strip away the noise and get to the absolute core of what makes these visionaries tick. The archive is our legacy.',
    portraitUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    episodeId: 'ep1',
  },
  {
    id: 'f2',
    name: 'Alex Rivera',
    role: 'Creative Director',
    quote:
      'Every conversation is an exhibition. We treat audio the same way a curator treats a physical gallery space—with intention and reverence.',
    portraitUrl:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop',
    episodeId: 'ep2',
  },
];

const portraitVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
    filter: 'blur(4px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
    filter: 'blur(4px)',
    transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] },
  }),
};

const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: 0.1 }, // Slight delay for staggered parallax effect
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -30 : 30,
    opacity: 0,
    transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] },
  }),
};

export const FoundersVoices: React.FC<FoundersVoicesProps> = ({
  currentEpisode,
  isPlaying,
  onPlayEpisode,
  className = '',
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  // Subtle Y-axis parallax drift as the user scrolls into and through the section
  const portraitY = useTransform(scrollYProgress, [0, 1], [-20, 20]);
  const imageY = useTransform(scrollYProgress, [0, 1], [-10, 10]);

  const founders = FOUNDERS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1); // 1 for next, -1 for prev
  // Pause auto-play if the user is hovering over the section
  const [isPaused, setIsPaused] = useState(false);

  const currentFounder = founders[currentIndex];

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + founders.length) % founders.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % founders.length);
  };

  const handleSelect = (idx: number) => {
    if (idx === currentIndex) return;
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  const isFounderPlaying =
    isPlaying &&
    (currentEpisode?.id === currentFounder.episodeId ||
      (currentFounder.episodeId === 'ep1' &&
        (currentEpisode?.id === 'ep1' || currentEpisode?.id === 'ep-042')) ||
      (currentFounder.episodeId === 'ep2' &&
        (currentEpisode?.id === 'ep2' || currentEpisode?.id === 'ep-041')));

  useEffect(() => {
    // Do not auto-play if paused or if there is only 1 founder
    if (isPaused || founders.length <= 1) return;

    const timer = setInterval(() => {
      // Must set direction to 1 (next) for the slide animation
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % founders.length);
    }, 4000); // 4 seconds per slide

    // Cleanup the interval on unmount or dependency change
    return () => clearInterval(timer);
  }, [isPaused, founders.length]);

  return (
    <section
      ref={sectionRef}
      id="founders-voices"
      aria-label="Founders' Voices"
      className={`w-full bg-cream text-ink py-16 sm:py-20 lg:py-24 relative overflow-hidden ${className}`}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 800px' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient Animated Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle Orange Glow */}
        <motion.div
          animate={{
            x: ['0%', '5%', '-5%', '0%'],
            y: ['0%', '-5%', '5%', '0%'],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-[#DD5A1F]/5 blur-[120px]"
        />
        {/* Subtle Ink/Shadow Glow */}
        <motion.div
          animate={{
            x: ['0%', '-5%', '5%', '0%'],
            y: ['0%', '5%', '-5%', '0%'],
            scale: [1, 0.95, 1.05, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-[#1C140F]/5 blur-[120px]"
        />
      </div>

      {/* Background Architectural Accent */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0"
      >
        <div className="w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] lg:w-[900px] lg:h-[900px] rounded-full border border-ink/5 relative flex items-center justify-center">
          <div className="w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] lg:w-[650px] lg:h-[650px] rounded-full border border-ink/5 flex items-center justify-center">
            <div className="w-[180px] h-[180px] sm:w-[300px] sm:h-[300px] lg:w-[420px] lg:h-[420px] rounded-full border border-ink/5" />
          </div>
          <div className="absolute w-full h-px bg-ink/5" />
          <div className="absolute h-full w-px bg-ink/5" />
        </div>
      </div>

      {/* Section Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-paper border border-ink/10 text-[#DD5A1F] font-mono text-[10px] sm:text-xs uppercase tracking-widest font-semibold mb-3">
          <span className="w-1.5 h-1.5 bg-[#DD5A1F] animate-pulse" />
          The Curators & Archivists
        </div>
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl text-ink font-normal tracking-tight leading-tight font-display"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          FOUNDERS' VOICES
        </h2>
        <p className="mt-2 text-sm sm:text-base text-ink-light/80 font-serif italic max-w-md mx-auto">
          Reflections from the editorial team behind every unhurried conversation.
        </p>
      </div>

      {/* Constrained Horizontal Slider Container */}
      <div className="max-w-5xl mx-auto min-h-[65vh] sm:min-h-[70vh] flex flex-col justify-center relative z-10 px-4 sm:px-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentFounder.id}
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
            className="grid grid-cols-1 lg:grid-cols-12 items-center w-full"
          >
            {/* Left Column (Portrait) with Parallax Slide & Blur */}
            <motion.div
              custom={direction}
              variants={portraitVariants}
              className="col-span-1 lg:col-span-6 flex justify-center lg:justify-end relative z-0"
            >
              <motion.div
                style={{ y: portraitY }}
                className="w-full max-w-md aspect-[4/5] relative rounded-none bg-paper p-3 sm:p-4 border border-ink/15 shadow-2xl shadow-ink/10 overflow-hidden"
              >
                <div className="relative w-full h-full overflow-hidden border border-ink/10 shadow-[inset_0_0_0_1px_rgba(28,20,15,0.1)]">
                  <motion.img
                    style={{ y: imageY, scale: 1.05 }}
                    src={currentFounder.portraitUrl}
                    alt={currentFounder.name}
                    className="w-full h-full object-cover grayscale contrast-125 brightness-95 rounded-none"
                    loading="lazy"
                  />
                  {/* Subtle archival film grain vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent pointer-events-none" />

                  {/* Stamp labels */}
                  <div className="absolute bottom-3 left-3 z-10 px-2.5 py-1 bg-paper/90 backdrop-blur-xs border border-ink/15 text-ink font-mono text-[10px] tracking-widest uppercase select-none">
                    PLATE NO. {String(currentIndex + 1).padStart(2, '0')}
                  </div>

                  <div className="absolute top-3 right-3 z-10 px-2.5 py-1 bg-ink text-paper font-mono text-[10px] tracking-widest uppercase select-none">
                    {String(currentIndex + 1).padStart(2, '0')} / {String(founders.length).padStart(2, '0')}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column (Text Card) with Delayed Parallax Slide */}
            <motion.div
              custom={direction}
              variants={cardVariants}
              className="col-span-1 lg:col-span-6 relative z-10 -mt-8 lg:mt-0 lg:-ml-16 flex justify-center lg:justify-start"
            >
              <div className="w-full max-w-lg bg-paper border border-ink/15 rounded-none p-6 sm:p-8 lg:p-10 shadow-2xl shadow-ink/15 relative overflow-hidden">
                {/* Giant decorative quote mark (") in brand orange */}
                <div
                  aria-hidden="true"
                  className="absolute -top-6 -left-2 sm:-top-8 sm:-left-3 text-9xl text-[#DD5A1F] opacity-10 font-display select-none pointer-events-none leading-none z-0"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                >
                  "
                </div>

                <div className="relative z-10 flex flex-col">
                  {/* Role: font-mono text-sm tracking-widest text-[#DD5A1F] uppercase */}
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="font-mono text-sm tracking-widest text-[#DD5A1F] uppercase font-bold">
                      {currentFounder.role}
                    </span>
                    {isPaused && (
                      <span className="font-mono text-[10px] tracking-widest uppercase text-ink-light/50">
                        PAUSED
                      </span>
                    )}
                  </div>

                  {/* Founder Name: font-display text-4xl (Instrument Serif) */}
                  <h3
                    className="font-display text-4xl text-ink font-bold tracking-tight mt-1 mb-3 leading-tight"
                    style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                  >
                    {currentFounder.name}
                  </h3>

                  {/* Quote: font-display italic text-2xl leading-relaxed (Instrument Serif) */}
                  <blockquote
                    className="font-display italic text-2xl leading-relaxed text-ink/90 my-2 pl-4 border-l-2 border-[#DD5A1F]/40 font-normal"
                    style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                  >
                    "{currentFounder.quote}"
                  </blockquote>

                  {/* Divider */}
                  <div className="w-full h-px bg-ink/10 my-5" />

                  {/* Action & Audio Integration */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                    {/* Listen to Episode Button */}
                    <button
                      type="button"
                      onClick={() => onPlayEpisode(currentFounder.episodeId)}
                      className={`inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-none font-mono text-xs uppercase tracking-widest font-bold transition-all shadow-sm cursor-pointer ${
                        isFounderPlaying
                          ? 'bg-ink text-paper hover:bg-orange'
                          : 'bg-orange text-paper hover:bg-orange-deep shadow-orange/20'
                      }`}
                      title={
                        isFounderPlaying
                          ? 'Pause audio playback'
                          : `Listen to episode featuring ${currentFounder.name}`
                      }
                    >
                      {isFounderPlaying ? (
                        <>
                          <span className="flex items-end gap-0.5 h-3.5 w-3.5">
                            <span className="w-0.5 bg-paper animate-[pulse_0.6s_ease-in-out_infinite] h-full" />
                            <span className="w-0.5 bg-paper animate-[pulse_0.8s_ease-in-out_infinite_0.2s] h-2/3" />
                            <span className="w-0.5 bg-paper animate-[pulse_0.7s_ease-in-out_infinite_0.4s] h-4/5" />
                          </span>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>NOW PLAYING</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          <span>LISTEN TO EPISODE</span>
                        </>
                      )}
                    </button>

                    {/* Navigation Controls with Prev / Next */}
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={handlePrev}
                        aria-label="Previous Founder"
                        className="w-10 h-10 rounded-none border border-ink/20 hover:border-orange text-ink hover:text-orange hover:bg-cream/70 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        aria-label="Next Founder"
                        className="w-10 h-10 rounded-none border border-ink/20 hover:border-orange text-ink hover:text-orange hover:bg-cream/70 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Editorial Pagination Indicators with Timer Progress */}
        <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-6 mt-8 sm:mt-10 pt-4 border-t border-ink/8">
          <span className="font-mono text-[10px] tracking-widest uppercase text-ink-light/60">
            SLIDES
          </span>

          <div className="flex items-center gap-4">
            {founders.map((founder, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={founder.id}
                  type="button"
                  onClick={() => handleSelect(idx)}
                  className="group flex flex-col items-start gap-1 cursor-pointer focus:outline-hidden"
                  aria-label={`Go to slide ${idx + 1}: ${founder.name}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[11px] tracking-wider transition-colors ${
                        isActive
                          ? 'text-ink font-bold'
                          : 'text-ink/40 group-hover:text-ink/70'
                      }`}
                    >
                      0{idx + 1}
                    </span>
                    <span
                      className={`font-mono text-[10px] tracking-widest uppercase hidden sm:inline-block transition-colors ${
                        isActive
                          ? 'text-[#DD5A1F] font-bold'
                          : 'text-ink/40 group-hover:text-ink/70'
                      }`}
                    >
                      {founder.name.split(' ')[0]}
                    </span>
                  </div>

                  {/* Horizontal Linear Progress Indicator Track */}
                  <div className="w-20 sm:w-28 h-1 bg-ink/10 overflow-hidden relative rounded-xs">
                    {isActive ? (
                      <div
                        key={`progress-${currentIndex}-${isPaused}`}
                        className="h-full bg-[#DD5A1F] origin-left"
                        style={{
                          animation: 'slideProgress 4000ms linear forwards',
                          animationPlayState: isPaused ? 'paused' : 'running',
                        }}
                      />
                    ) : (
                      <div
                        className={`h-full ${
                          idx < currentIndex ? 'bg-ink/30 w-full' : 'w-0'
                        }`}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="ml-auto hidden md:flex items-center gap-2 text-ink-light/50 font-mono text-[10px] tracking-wider">
            <span>HOVER TO PAUSE</span>
            <span>•</span>
            <span>4S AUTO-PLAY</span>
          </div>
        </div>
      </div>
    </section>
  );
};
