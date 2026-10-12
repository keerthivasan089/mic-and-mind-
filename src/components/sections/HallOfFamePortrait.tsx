import React, { useMemo } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Episode } from '../../types';
import { HallOfFameGuestDocument } from '../../lib/cmsStore';
import { optimizePortraitImageUrl } from '../../lib/imageOptimization';

interface HallOfFamePortraitProps {
  guest: HallOfFameGuestDocument;
  episode: Episode;
  rankNumber: number;
  isDominant?: boolean;
  isPlaying: boolean;
  onPlay: (episode: Episode) => void;
  wallSide?: 'left' | 'right';
  style?: React.CSSProperties;
  className?: string;
}

const HallOfFamePortraitComponent: React.FC<HallOfFamePortraitProps> = ({
  guest,
  episode,
  rankNumber,
  isDominant = false,
  isPlaying,
  onPlay,
  wallSide = 'left',
  style,
  className = '',
}) => {
  const formattedRank = `#${String(rankNumber).padStart(2, '0')}`;
  const photoUrl = guest.portraitUrl || episode.portraitUrl || episode.guest.avatar;
  const guestName = guest.name || episode.guest.name;
  const episodeNumber = guest.episodeNumber || episode.number;
  const guestRole = guest.role || episode.guest.role || 'Curated Laureate';

  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [photoUrl]);

  const fallbackPhoto = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop';
  const effectivePhoto = (hasError || !photoUrl) ? fallbackPhoto : photoUrl;

  // Optimized image URL: responsive Cloudinary / Unsplash sizing to prevent main-thread decode jank
  const optimizedPhoto = useMemo(() => {
    return optimizePortraitImageUrl(effectivePhoto, 700);
  }, [effectivePhoto]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPlay(episode);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onPlay(episode);
    }
  };

  // Fixed stable frame dimensions to eliminate layout thrashing during camera movement
  const frameWidth = 305;
  const plaqueTiltAngle = wallSide === 'left' ? -7 : 7;

  return (
    <div
      className={`relative flex flex-col items-center select-none ${className}`}
      style={{
        width: `${frameWidth}px`,
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      {/* ============================================================= */}
      {/* 1. 3D PROJECTED AMBIENT WALL HALO (Soft Museum Background)    */}
      {/* Soft warm amber glow on light creamy wall behind frame         */}
      {/* ============================================================= */}
      <div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none select-none"
        style={{
          top: '-40px',
          width: isDominant ? '520px' : '460px',
          height: isDominant ? '660px' : '600px',
          transform: 'translateZ(1px)',
          transformStyle: 'preserve-3d',
        }}
        aria-hidden="true"
      >
        {/* Soft Warm Amber Ambient Wall Wash on Creamy Boiserie */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 85% at 50% 15%, rgba(251, 146, 60, 0.24) 0%, rgba(245, 158, 11, 0.12) 35%, rgba(234, 88, 12, 0.03) 65%, transparent 85%)',
          }}
        />
      </div>

      {/* ============================================================= */}
      {/* 2. OVERHEAD BRASS PICTURE LAMP FIXTURE (Single Focused Light) */}
      {/* Authentic museum picture lamp with clean, focused glow         */}
      {/* ============================================================= */}
      <div
        className="relative w-full flex flex-col items-center pointer-events-none z-35 -mb-1.5"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'translateZ(6px)',
        }}
        aria-hidden="true"
      >
        {/* Classic Brass Wall Mount Plate */}
        <div className="w-5 h-2.5 bg-gradient-to-b from-[#F59E0B] via-[#D97706] to-[#9A3412] rounded-t-xs shadow-[0_2px_6px_rgba(124,45,18,0.4)] border-t border-[#FEF3C7] flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-[#431407]" />
        </div>

        {/* Slender Arched Brass Lamp Arm extending gracefully over frame */}
        <div className="w-1.5 h-4 bg-gradient-to-b from-[#FEF3C7] via-[#F59E0B] to-[#B45309] shadow-sm border-x border-[#FFFBEB]/50" />

        {/* Single Hooded Brass Tubular Reflector */}
        <div className="relative flex flex-col items-center">
          {/* Brass Cylindrical Reflector Hood */}
          <div
            className={`rounded-t-full shadow-[0_4px_16px_rgba(124,45,18,0.45)] border-t border-x border-[#FFFBEB] ${
              isDominant
                ? 'w-38 sm:w-44 h-3.5 bg-gradient-to-r from-[#9A3412] via-[#FDE68A] to-[#9A3412]'
                : 'w-30 sm:w-36 h-3 bg-gradient-to-r from-[#9A3412] via-[#FDE68A] to-[#9A3412]'
            }`}
          />

          {/* Underside Luminous Warm Aperture (Warm museum tungsten slit) */}
          <div
            className={`rounded-b-full shadow-[0_0_12px_2px_rgba(251,191,36,0.7)] ${
              isDominant ? 'w-34 sm:w-40 h-1.5 bg-[#FFFDF0]' : 'w-26 sm:w-32 h-1 bg-[#FFFDF0]'
            }`}
          />
        </div>

        {/* Soft, natural downward ambient glow positioned behind the frame on the wall */}
        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            top: '12px',
            width: isDominant ? '480px' : '420px',
            height: '520px',
            background:
              'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(251, 146, 60, 0.20) 0%, rgba(245, 158, 11, 0.08) 45%, transparent 75%)',
            transform: 'translateZ(-1px)',
          }}
        />
      </div>

      {/* ============================================================= */}
      {/* 3. GILDED BAROQUE MUSEUM FRAME (Interactive Button)           */}
      {/* Restrained antique gold with ivory boiserie bevel             */}
      {/* ============================================================= */}
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`${isPlaying ? 'Pause' : 'Listen to'} Hall of Fame Masterclass: ${guestName} (${formattedRank}, Episode ${episodeNumber})`}
        className="group/frame relative w-full text-left rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] transition-all duration-300 z-20 cursor-pointer"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'translateZ(2px)',
        }}
      >
        {/* Soft wall-cast drop shadow on wall */}
        <div
          className="absolute -inset-1.5 sm:-inset-2 rounded-xs pointer-events-none transition-shadow duration-300"
          style={{
            transform: 'translateZ(-1px)',
            boxShadow: isPlaying
              ? '0 12px 28px -2px rgba(124, 45, 18, 0.28), 0 0 20px rgba(251, 146, 60, 0.25)'
              : isDominant
              ? '0 10px 24px -2px rgba(124, 45, 18, 0.22), 0 0 15px rgba(251, 146, 60, 0.15)'
              : '0 6px 16px -2px rgba(124, 45, 18, 0.16)',
          }}
        />

        {/* Outer Heavy Gilded Antique Gold Molded Profile */}
        <div
          className={`relative rounded-xs transition-colors duration-300 ${
            isDominant ? 'p-3.5 sm:p-4' : 'p-3 sm:p-3.5'
          }`}
          style={{
            background:
              'linear-gradient(135deg, #DFB96E 0%, #8A6427 18%, #F7E4AD 36%, #68481A 56%, #DDB66B 80%, #946E2F 100%)',
            border: isPlaying
              ? '2px solid #FFF8E6'
              : isDominant
              ? '2px solid #FDE68A'
              : '1.5px solid rgba(250, 235, 185, 0.85)',
            boxShadow:
              'inset 0 2px 3px rgba(255, 255, 255, 0.7), inset 0 -3px 5px rgba(60, 40, 15, 0.6), inset 2px 0 3px rgba(255, 245, 210, 0.4), inset -2px 0 4px rgba(60, 40, 15, 0.4)',
          }}
        >
          {/* Inner Stepped Bevel with Carved Relief Accent */}
          <div
            className="p-1 sm:p-1.5 rounded-3xs"
            style={{
              background:
                'linear-gradient(315deg, #604215 0%, #B8924B 38%, #FDECB9 68%, #78531C 100%)',
              boxShadow:
                'inset 0 1px 2px rgba(255, 255, 255, 0.5), inset 0 -2px 4px rgba(45, 30, 10, 0.6)',
            }}
          >
            {/* Fine Museum Archival Ivory Mat (Warm Off-White) */}
            <div className="relative p-2.5 sm:p-3 bg-[#FFFDF9] border border-[#FDBA74]/50 shadow-[inset_0_2px_8px_rgba(124,45,18,0.08)] rounded-3xs overflow-hidden">
              {/* Subtle Mat Bevel Inset Line */}
              <div className="absolute inset-1 border border-[#FED7AA]/60 pointer-events-none rounded-4xs" />

              {/* Archival Rank Number Stamp (Top-Left) */}
              <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-1.5 py-0.5 bg-[#FFFDF8]/95 backdrop-blur-xs border border-[#F59E0B]/60 rounded-3xs shadow-xs">
                <span className="font-mono text-[8.5px] sm:text-[9.5px] font-bold text-[#9A3412] tracking-widest">
                  {formattedRank}
                </span>
                {isPlaying && (
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EA580C] opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#EA580C]" />
                  </span>
                )}
              </div>

              {/* On-Air Live Playing Badge (Top-Right) */}
              {isPlaying && (
                <div className="absolute top-2 right-2 z-20 flex items-center gap-1 px-1.5 py-0.5 bg-[#EA580C] text-[#FFFDF8] font-mono text-[8px] uppercase tracking-widest font-bold rounded-3xs shadow-xs animate-pulse">
                  <Volume2 className="w-2.5 h-2.5" />
                  <span>ON AIR</span>
                </div>
              )}

              {/* Dynamic CMS Portrait Canvas - Crisp, High-Contrast, Eye-Safe */}
              <div className="relative w-full overflow-hidden bg-[#1C140F] border border-[#FDBA74]/50 shadow-inner aspect-[3/4]">
                <img
                  src={optimizedPhoto}
                  alt={`${guestName} - Museum Hall of Fame ${formattedRank}`}
                  loading="eager"
                  decoding="async"
                  onError={() => setHasError(true)}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/frame:scale-105"
                  style={{
                    filter: 'contrast(1.08) saturate(1.04) brightness(1.01)',
                  }}
                />

                {/* Subtle Fine-Art Shadow Depth at Base */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#1A0A04]/60 via-[#1A0A04]/15 to-transparent pointer-events-none" />

                {/* Delicate Top Rim Highlight */}
                <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[#FEF3C7]/20 to-transparent pointer-events-none" />

                {/* Interactive Play Button (Antique Gold Seal) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className={`rounded-full border flex items-center justify-center transition-all duration-300 shadow-[0_4px_16px_rgba(124,45,18,0.35)] ${
                      isDominant
                        ? 'w-13 h-13 sm:w-15 sm:h-15 border-[#FFF4D0]'
                        : 'w-10 h-10 sm:w-11 sm:h-11 border-[#FFF1C6]'
                    } ${
                      isPlaying
                        ? 'bg-[#EA580C] text-[#FFFDF8] scale-105 ring-4 ring-[#EA580C]/40 opacity-100'
                        : isDominant
                        ? 'bg-[#7C2D12]/90 text-[#FFF7ED] group-hover/frame:bg-[#EA580C] group-hover/frame:text-[#FFFDF8] group-hover/frame:scale-110 opacity-90'
                        : 'bg-[#7C2D12]/90 text-[#FFF7ED] group-hover/frame:bg-[#EA580C] group-hover/frame:text-[#FFFDF8] group-hover/frame:scale-110 opacity-0 group-hover/frame:opacity-100 group-focus-visible/frame:opacity-100'
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className={isDominant ? 'w-5 h-5 fill-current' : 'w-4 h-4 fill-current'} />
                    ) : (
                      <Play className={isDominant ? 'w-5 h-5 fill-current ml-0.5' : 'w-4 h-4 fill-current ml-0.5'} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* ============================================================= */}
      {/* 4. HIGH-CONTRAST ARCHIVAL LABEL PLAQUE WITH INSTRUMENT SERIF  */}
      {/* Prominent, angled towards the aisle for clear visibility      */}
      {/* ============================================================= */}
      <div
        onClick={handleClick}
        className={`group/plaque relative mt-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xs flex flex-col items-center text-center cursor-pointer transition-colors duration-300 z-25 ${
          isDominant
            ? 'w-[94%] sm:w-[96%] bg-[#FFFFFF] border-2 border-[#EA580C] shadow-[0_4px_16px_rgba(234,88,12,0.22)]'
            : 'w-[90%] sm:w-[92%] bg-[#FFFDF9] border-2 border-[#FDBA74] hover:border-[#EA580C] shadow-[0_2px_8px_rgba(124,45,18,0.1)]'
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transform: `translateZ(${isDominant ? 4 : 2}px) rotateY(${isDominant ? plaqueTiltAngle : plaqueTiltAngle * 0.7}deg)`,
        }}
        title={`Click to listen to ${guestName}'s masterclass`}
      >
        {/* Decorative corner brass rivets */}
        <div className="absolute top-1.5 left-1.5 w-1 h-1 rounded-full bg-[#D97706]/70 shadow-xs" />
        <div className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-[#D97706]/70 shadow-xs" />
        <div className="absolute bottom-1.5 left-1.5 w-1 h-1 rounded-full bg-[#D97706]/70 shadow-xs" />
        <div className="absolute bottom-1.5 right-1.5 w-1 h-1 rounded-full bg-[#D97706]/70 shadow-xs" />

        {/* Laureate Rank Pill Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EA580C] text-[#FFFFFF] font-mono text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] shadow-xs">
          <span>LAUREATE {formattedRank}</span>
        </div>

        {/* Primary Guest Name in High-Contrast Instrument Serif */}
        <div
          className="font-serif text-xl sm:text-2xl md:text-[25px] font-normal text-[#1C140F] tracking-tight text-center leading-tight my-1 truncate w-full group-hover/plaque:text-[#EA580C] transition-colors"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          {guestName}
        </div>

        {/* Guest Role & Topic in Instrument Serif Italic */}
        <div
          className="font-serif italic text-xs sm:text-[13px] text-[#7C2D12] text-center font-medium leading-tight truncate w-full"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          {guestRole}
        </div>

        {/* Episode Reference Pill */}
        <div className="w-full flex items-center justify-center gap-1.5 mt-1.5 pt-1 border-t border-[#FED7AA]/60 font-mono text-[8px] sm:text-[8.5px] text-[#9A3412] uppercase tracking-wider font-semibold">
          <span>{episodeNumber}</span>
          <span className="text-[#EA580C]">✦</span>
          <span>MASTERCLASS ARCHIVE</span>
        </div>
      </div>
    </div>
  );
};

export const HallOfFamePortrait = React.memo(HallOfFamePortraitComponent);


