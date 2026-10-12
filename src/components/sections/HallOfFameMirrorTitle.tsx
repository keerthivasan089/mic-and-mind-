import React from 'react';

interface HallOfFameMirrorTitleProps {
  className?: string;
  subtitle?: string;
}

export const HallOfFameMirrorTitle: React.FC<HallOfFameMirrorTitleProps> = ({
  className = '',
  subtitle = 'THE DEFINITIVE LAUREATE ARCHIVE',
}) => {
  return (
    <div className={`relative flex flex-col items-center justify-center select-none text-center ${className}`}>
      {/* Cinematic Overhead Spotlight Beam illuminating the mirror text */}
      <div
        className="absolute -top-28 left-1/2 -translate-x-1/2 w-80 sm:w-96 h-48 pointer-events-none opacity-70"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(255, 245, 215, 0.45) 0%, rgba(197, 160, 89, 0.18) 45%, transparent 75%)',
          filter: 'blur(10px)',
        }}
      />

      {/* Top Classical Wing Eyebrow */}
      <div className="flex items-center gap-3 font-mono text-[9.5px] sm:text-[11px] tracking-[0.45em] uppercase text-[#C5A059] font-bold mb-3 z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] shadow-[0_0_8px_#C5A059]" />
        <span>MIC &amp; MIND · PERMANENT WING</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] shadow-[0_0_8px_#C5A059]" />
      </div>

      {/* Mirror Container */}
      <div className="relative flex flex-col items-center">
        {/* 1. PRIMARY MIRROR TITLE */}
        <h1
          className="relative font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight z-10 drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]"
          style={{
            background:
              'linear-gradient(135deg, #FFFFFF 0%, #FAF0DE 20%, #E8D3A7 40%, #FFFFFF 55%, #C5A059 75%, #8C6D34 90%, #FAF0DE 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
          }}
        >
          HALL OF FAME
        </h1>

        {/* Specular Shimmer Sweep Line across Primary Text */}
        <div
          className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay opacity-50"
          style={{
            background:
              'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.85) 45%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.85) 55%, transparent 80%)',
          }}
        />

        {/* 2. POLISHED MIRROR HORIZON LINE */}
        <div className="w-[115%] h-[1.5px] bg-gradient-to-r from-transparent via-[#E8D3A7] to-transparent shadow-[0_0_12px_rgba(232,211,167,0.7)] my-0.5 z-10" />

        {/* 3. OPTICAL INVERTED MIRROR REFLECTION */}
        <div
          className="relative font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight pointer-events-none -mt-1 sm:-mt-2 select-none overflow-hidden"
          style={{
            transform: 'scaleY(-1)',
            background:
              'linear-gradient(135deg, #FFFFFF 0%, #FAF0DE 20%, #E8D3A7 40%, #FFFFFF 55%, #C5A059 75%, #8C6D34 90%, #FAF0DE 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            WebkitMaskImage:
              'linear-gradient(to top, transparent 40%, rgba(0,0,0,0.3) 75%, rgba(0,0,0,0.75) 100%)',
            maskImage:
              'linear-gradient(to top, transparent 40%, rgba(0,0,0,0.3) 75%, rgba(0,0,0,0.75) 100%)',
            filter: 'blur(1px)',
            opacity: 0.55,
          }}
          aria-hidden="true"
        >
          HALL OF FAME
        </div>
      </div>

      {/* Subtitle & Curatorial Note */}
      <div className="flex flex-col items-center mt-3 z-10">
        <div className="font-mono text-[9px] sm:text-[10.5px] tracking-[0.35em] text-[#C5A059] uppercase font-semibold">
          ✦ {subtitle} ✦
        </div>
        <p className="font-serif italic text-xs sm:text-sm text-[#D4C3A3] mt-2 max-w-md leading-relaxed">
          A permanent retrospective honoring the 10 definitive operators, founders, and masterclass minds.
        </p>
      </div>
    </div>
  );
};
