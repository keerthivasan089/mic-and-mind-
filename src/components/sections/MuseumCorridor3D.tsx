import React from 'react';
import { Award, RotateCcw } from 'lucide-react';
import { Episode } from '../../types';
import { HallOfFamePortrait } from './HallOfFamePortrait';
import { CuratedHallOfFameItem, GalleryBay, GALLERY_BAYS } from './hallOfFameConstants';

interface ArchitecturalBayViewProps {
  bay: GalleryBay;
  leftItem?: CuratedHallOfFameItem;
  rightItem?: CuratedHallOfFameItem;
  isLeftPlaying: boolean;
  isRightPlaying: boolean;
  isLeftDominant: boolean;
  isRightDominant: boolean;
  onPlayEpisode: (episode: Episode) => void;
}

const ArchitecturalBayViewComponent: React.FC<ArchitecturalBayViewProps> = ({
  bay,
  leftItem,
  rightItem,
  isLeftPlaying,
  isRightPlaying,
  isLeftDominant,
  isRightDominant,
  onPlayEpisode,
}) => {
  const bayLength = 650; // Each bay is 650px long along the corridor

  return (
    <div
      key={`bay-${bay.id}`}
      className="absolute"
      style={{
        transform: `translate3d(0px, 0px, ${bay.zCenter}px)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* --------------------------------------------------- */}
      {/* LEFT EXHIBITION WALL (X = -500px, Facing +X into room)*/}
      {/* 1200px tall (Y: -600 to +600), 650px long along Z   */}
      {/* --------------------------------------------------- */}
      <div
        className="absolute"
        style={{
          left: '-325px',
          top: '-600px',
          width: `${bayLength}px`,
          height: '1200px',
          transform: 'translate3d(-500px, 0px, 0px) rotateY(90deg)',
          transformStyle: 'preserve-3d',
          background: 'linear-gradient(to bottom, #FFFBF5 0%, #FFF5EA 50%, #FEEBD7 100%)',
          borderTop: '4px solid #FDBA74',
          borderBottom: '4px solid #FDBA74',
        }}
      >
        {/* Classical Fluted Pilaster Column dividing bays on left */}
        <div className="absolute left-0 inset-y-0 w-10 bg-gradient-to-r from-[#FED7AA] via-[#FFF7ED] to-[#FDBA74] border-r-2 border-[#EA580C] shadow-md z-10 flex flex-col justify-between">
          <div className="h-10 bg-gradient-to-b from-[#EA580C] to-[#C2410C] shadow-xs" />
          <div className="h-12 bg-gradient-to-t from-[#EA580C] to-[#C2410C] shadow-xs" />
        </div>

        {/* Classical Wall Baseboard Plinth (Warm Sienna Wood with Gilded Trim) */}
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-b from-[#FFF0DE] via-[#FED7AA] to-[#FDBA74] border-t-4 border-[#EA580C] shadow-sm z-10 flex flex-col justify-between">
          <div className="h-3 bg-gradient-to-r from-[#EA580C] via-[#F59E0B] to-[#EA580C] shadow-xs" />
          <div className="h-4 bg-[#7C2D12]" />
        </div>

        {/* Museum Boiserie Wall Molding Paneling (Classical Archival Setting) */}
        <div className="absolute inset-x-14 top-16 bottom-36 border-2 border-[#EA580C]/40 rounded-xs shadow-[inset_0_2px_12px_rgba(234,88,12,0.06)] bg-gradient-to-b from-[#FFFDF9]/60 via-[#FFF9F2]/60 to-[#FFF3E6]/60 flex items-center justify-center">
          {/* Inner Molded Framing Bead */}
          <div className="w-[88%] h-[90%] border border-[#EA580C]/25 rounded-2xs flex items-center justify-center p-2 relative">
            {/* Left Laureate Portrait Mounted on Wall */}
            {leftItem ? (
              <div className="pointer-events-auto">
                <HallOfFamePortrait
                  guest={leftItem.guest}
                  episode={leftItem.episode}
                  rankNumber={leftItem.rankNumber}
                  isDominant={isLeftDominant}
                  isPlaying={isLeftPlaying}
                  onPlay={onPlayEpisode}
                  wallSide="left"
                />
              </div>
            ) : (
              /* Architectural Bay Plaque for Decorative Continuity */
              <div className="flex flex-col items-center justify-center text-center p-6 border border-[#EA580C]/30 rounded-xs bg-[#FFFDF9]/80 shadow-xs max-w-xs">
                <div className="w-8 h-8 rounded-full border border-[#EA580C] flex items-center justify-center text-[#EA580C] mb-2">
                  <Award className="w-4 h-4" />
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#C2410C] font-bold">
                  COLONNADE WING
                </span>
                <span className="font-serif italic text-xs text-[#7C2D12] mt-1">
                  Architectural Chamber {bay.id + 1}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Classical Upper Frieze Architrave with Fluted Dentil Accents */}
        <div className="absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-[#FDBA74] via-[#FED7AA] to-[#FFF7ED] border-b-2 border-[#EA580C] shadow-xs z-10 flex flex-col justify-between">
          <div className="h-2 bg-[#7C2D12]" />
          <div
            className="h-3 w-full opacity-40"
            style={{
              backgroundImage:
                'repeating-linear-gradient(to right, rgba(234,88,12,0.12) 0px, rgba(234,88,12,0.12) 2px, transparent 2px, transparent 65px)',
            }}
          />
          <div className="absolute bottom-0 inset-x-0 h-22 bg-gradient-to-b from-[#9A3412] via-[#7C2D12] to-[#431407] border-t-2 border-[#EA580C] shadow-md" />
        </div>
      </div>

      {/* --------------------------------------------------- */}
      {/* RIGHT EXHIBITION WALL (X = +500px, Facing -X into room)*/}
      {/* 1200px tall (Y: -600 to +600), 650px long along Z   */}
      {/* --------------------------------------------------- */}
      <div
        className="absolute"
        style={{
          left: '-325px',
          top: '-600px',
          width: `${bayLength}px`,
          height: '1200px',
          transform: 'translate3d(500px, 0px, 0px) rotateY(-90deg)',
          transformStyle: 'preserve-3d',
          background: 'linear-gradient(to bottom, #FFFBF5 0%, #FFF5EA 50%, #FEEBD7 100%)',
          borderTop: '4px solid #FDBA74',
          borderBottom: '4px solid #FDBA74',
        }}
      >
        {/* Classical Fluted Pilaster Column dividing bays on right */}
        <div className="absolute right-0 inset-y-0 w-10 bg-gradient-to-r from-[#FDBA74] via-[#FFF7ED] to-[#FED7AA] border-l-2 border-[#EA580C] shadow-md z-10 flex flex-col justify-between">
          <div className="h-10 bg-gradient-to-b from-[#EA580C] to-[#C2410C] shadow-xs" />
          <div className="h-12 bg-gradient-to-t from-[#EA580C] to-[#C2410C] shadow-xs" />
        </div>

        {/* Classical Wall Baseboard Plinth */}
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-b from-[#FFF0DE] via-[#FED7AA] to-[#FDBA74] border-t-4 border-[#EA580C] shadow-sm z-10 flex flex-col justify-between">
          <div className="h-3 bg-gradient-to-r from-[#EA580C] via-[#F59E0B] to-[#EA580C] shadow-xs" />
          <div className="h-4 bg-[#7C2D12]" />
        </div>

        {/* Museum Boiserie Wall Molding Paneling */}
        <div className="absolute inset-x-14 top-16 bottom-36 border-2 border-[#EA580C]/40 rounded-xs shadow-[inset_0_2px_12px_rgba(234,88,12,0.06)] bg-gradient-to-b from-[#FFFDF9]/60 via-[#FFF9F2]/60 to-[#FFF3E6]/60 flex items-center justify-center">
          {/* Inner Molded Framing Bead */}
          <div className="w-[88%] h-[90%] border border-[#EA580C]/25 rounded-2xs flex items-center justify-center p-2 relative">
            {/* Right Laureate Portrait Mounted on Wall */}
            {rightItem ? (
              <div className="pointer-events-auto">
                <HallOfFamePortrait
                  guest={rightItem.guest}
                  episode={rightItem.episode}
                  rankNumber={rightItem.rankNumber}
                  isDominant={isRightDominant}
                  isPlaying={isRightPlaying}
                  onPlay={onPlayEpisode}
                  wallSide="right"
                />
              </div>
            ) : (
              /* Architectural Bay Plaque for Decorative Continuity */
              <div className="flex flex-col items-center justify-center text-center p-6 border border-[#EA580C]/30 rounded-xs bg-[#FFFDF9]/80 shadow-xs max-w-xs">
                <div className="w-8 h-8 rounded-full border border-[#EA580C] flex items-center justify-center text-[#EA580C] mb-2">
                  <Award className="w-4 h-4" />
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#C2410C] font-bold">
                  ARCHIVAL WING
                </span>
                <span className="font-serif italic text-xs text-[#7C2D12] mt-1">
                  Masterclass Gallery {bay.id + 1}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Classical Upper Frieze Architrave with Dentil Accents */}
        <div className="absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-[#FDBA74] via-[#FED7AA] to-[#FFF7ED] border-b-2 border-[#EA580C] shadow-xs z-10 flex flex-col justify-between">
          <div className="h-2 bg-[#7C2D12]" />
          <div
            className="h-3 w-full opacity-40"
            style={{
              backgroundImage:
                'repeating-linear-gradient(to right, rgba(234,88,12,0.12) 0px, rgba(234,88,12,0.12) 2px, transparent 2px, transparent 65px)',
            }}
          />
          <div className="absolute bottom-0 inset-x-0 h-22 bg-gradient-to-b from-[#9A3412] via-[#7C2D12] to-[#431407] border-t-2 border-[#EA580C] shadow-md" />
        </div>
      </div>

      {/* --------------------------------------------------- */}
      {/* POLISHED CREAM TRAVERTINE FLOOR (Y = +600px, Facing -Y) */}
      {/* 1600px wide (X: -800 to +800), 650px long along Z   */}
      {/* Centered Inlaid Hall of Fame Bronze Terrazzo Medallion*/}
      {/* --------------------------------------------------- */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: '-800px',
          top: '-325px',
          width: '1600px',
          height: `${bayLength}px`,
          transform: 'translate3d(0px, 600px, 0px) rotateX(90deg)',
          transformStyle: 'preserve-3d',
          background: 'linear-gradient(to bottom, #FFFBF5 0%, #FFF5EA 50%, #FEEBD7 100%)',
          boxShadow: 'inset 0 0 120px rgba(251, 146, 60, 0.12), inset 0 0 50px rgba(234, 88, 12, 0.06)',
        }}
      >
        {/* Marble Tile Grid with Strong Perspective Convergence Lines */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(234, 88, 12, 0.18) 1.5px, transparent 1.5px), linear-gradient(to bottom, rgba(234, 88, 12, 0.18) 1.5px, transparent 1.5px)',
            backgroundSize: '200px 216px',
          }}
        />

        {/* Terracotta Marble Border Runners perfectly aligned with wall bases */}
        <div className="absolute left-[290px] inset-y-0 w-5 bg-gradient-to-r from-[#EA580C] via-[#F59E0B] to-[#FED7AA] opacity-80 shadow-xs" />
        <div className="absolute left-[318px] inset-y-0 w-1 bg-[#EA580C] opacity-70" />
        <div className="absolute right-[290px] inset-y-0 w-5 bg-gradient-to-r from-[#EA580C] via-[#F59E0B] to-[#FED7AA] opacity-80 shadow-xs" />
        <div className="absolute right-[318px] inset-y-0 w-1 bg-[#EA580C] opacity-70" />

        {/* Specular Daylight Runner down Center Aisle */}
        <div
          className="absolute left-1/2 -translate-x-1/2 inset-y-0 w-[550px] opacity-40"
          style={{
            background:
              'linear-gradient(to right, transparent, rgba(254,215,170,0.3) 40%, rgba(255,250,240,0.6) 50%, rgba(254,215,170,0.3) 60%, transparent)',
          }}
        />

        {/* Inlaid Imperial Bronze Hall of Fame Medallion (Center between walls) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none select-none">
          <div className="w-44 h-44 rounded-full border-2 border-[#EA580C]/70 shadow-[0_0_24px_rgba(234,88,12,0.15),inset_0_0_16px_rgba(124,45,18,0.06)] flex flex-col items-center justify-center bg-gradient-to-b from-[#FFFDF9] via-[#FFF8F1] to-[#FEEBD4]">
            <div className="w-36 h-36 rounded-full border border-[#EA580C]/40 flex flex-col items-center justify-center p-2 text-center">
              <span className="font-mono text-[7px] tracking-[0.35em] text-[#C2410C] uppercase font-bold">
                ✦ HALL OF FAME ✦
              </span>
              <div className="w-14 h-px bg-[#EA580C]/60 my-1" />
              <span className="font-serif italic text-[10px] text-[#7C2D12] font-semibold">
                Permanent Wing
              </span>
              <span className="font-mono text-[6px] tracking-widest text-[#EA580C] uppercase mt-0.5">
                Bay {bay.id + 1} Archive
              </span>
            </div>
          </div>
        </div>

        {/* Warm Light Orange Spotlight Pool Underneath Left Portrait */}
        {leftItem && (
          <div
            className="absolute rounded-full opacity-75 pointer-events-none select-none"
            style={{
              left: '260px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '280px',
              height: '280px',
              background:
                'radial-gradient(ellipse at center, rgba(254,215,170,0.85) 0%, rgba(251,146,60,0.35) 45%, rgba(234,88,12,0.08) 70%, transparent 85%)',
            }}
          />
        )}

        {/* Warm Light Orange Spotlight Pool Underneath Right Portrait */}
        {rightItem && (
          <div
            className="absolute rounded-full opacity-75 pointer-events-none select-none"
            style={{
              right: '260px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '280px',
              height: '280px',
              background:
                'radial-gradient(ellipse at center, rgba(254,215,170,0.85) 0%, rgba(251,146,60,0.35) 45%, rgba(234,88,12,0.08) 70%, transparent 85%)',
            }}
          />
        )}
      </div>

      {/* --------------------------------------------------- */}
      {/* CLASSICAL COFFERED CEILING (Y = -600px, Facing +Y)  */}
      {/* 1600px wide (X: -800 to +800), 650px long along Z   */}
      {/* Recessed Warm Tungsten Architectural Troffers       */}
      {/* --------------------------------------------------- */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: '-800px',
          top: '-325px',
          width: '1600px',
          height: `${bayLength}px`,
          transform: 'translate3d(0px, -600px, 0px) rotateX(-90deg)',
          transformStyle: 'preserve-3d',
          background: 'linear-gradient(to bottom, #FFFDF9 0%, #FFF8F0 60%, #FEEBD7 100%)',
          borderBottom: '4px solid #FDBA74',
        }}
      >
        {/* Deep Recessed Architectural Coffers (Classical Museum Architecture) */}
        <div className="absolute inset-x-16 inset-y-8 flex justify-around items-center">
          {[0, 1, 2].map((cofferIdx) => (
            <div
              key={`coffer-${cofferIdx}`}
              className="w-80 h-44 rounded-sm border-2 border-[#EA580C]/40 bg-gradient-to-b from-[#FFF7ED] to-[#FED7AA] shadow-[inset_0_4px_16px_rgba(124,45,18,0.12)] flex items-center justify-center relative p-3"
            >
              {/* Inner Recessed Bevel Frame */}
              <div className="w-full h-full border border-[#EA580C]/25 rounded-2xs flex items-center justify-center relative">
                {/* Architectural Warm Tungsten Museum Downlight */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A] border-2 border-[#EA580C] shadow-[0_0_28px_rgba(251,146,60,0.6),inset_0_2px_4px_rgba(255,255,255,0.8)] flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-white shadow-xs" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ArchitecturalBayView = React.memo(ArchitecturalBayViewComponent);

interface MuseumCorridor3DProps {
  filteredItems: CuratedHallOfFameItem[];
  currentEpisode: Episode | null;
  isPlaying: boolean;
  onPlayEpisode: (episode: Episode) => void;
  activeRank: number | null;
  onReturnToStart: () => void;
}

const MuseumCorridor3DComponent: React.FC<MuseumCorridor3DProps> = ({
  filteredItems,
  currentEpisode,
  isPlaying,
  onPlayEpisode,
  activeRank,
  onReturnToStart,
}) => {
  return (
    <>
      {/* ========================================================= */}
      {/* 3A. ARCHITECTURAL BAYS FORMING THE LONG CONTINUOUS ROOM   */}
      {/* Memoized per-bay components skip 80% re-renders on scroll */}
      {/* ========================================================= */}
      {GALLERY_BAYS.map((bay) => {
        const leftItem =
          bay.leftPortraitIndex !== undefined ? filteredItems[bay.leftPortraitIndex] : undefined;
        const rightItem =
          bay.rightPortraitIndex !== undefined ? filteredItems[bay.rightPortraitIndex] : undefined;

        const isLeftPlaying =
          !!(leftItem && currentEpisode?.id === leftItem.episode.id && isPlaying);
        const isRightPlaying =
          !!(rightItem && currentEpisode?.id === rightItem.episode.id && isPlaying);

        const isLeftDominant = !!(leftItem && activeRank === leftItem.rankNumber);
        const isRightDominant = !!(rightItem && activeRank === rightItem.rankNumber);

        return (
          <ArchitecturalBayView
            key={`bay-${bay.id}`}
            bay={bay}
            leftItem={leftItem}
            rightItem={rightItem}
            isLeftPlaying={isLeftPlaying}
            isRightPlaying={isRightPlaying}
            isLeftDominant={isLeftDominant}
            isRightDominant={isRightDominant}
            onPlayEpisode={onPlayEpisode}
          />
        );
      })}

      {/* ========================================================= */}
      {/* 3B. GRAND TERMINAL APSE WALL & ROMAN ARCHWAY PORTAL       */}
      {/* Z = -4160px (Fixed at the end of the grand colonnade aisle)*/}
      {/* ========================================================= */}
      <div
        className="absolute flex flex-col items-center justify-center select-none pointer-events-none"
        style={{
          left: '-900px',
          top: '-650px',
          width: '1800px',
          height: '1300px',
          transform: 'translate3d(0px, 0px, -4160px)',
          transformStyle: 'preserve-3d',
          background: 'linear-gradient(to bottom, #FFFBF5 0%, #FFF5EA 45%, #FEEBD7 100%)',
          border: '6px solid #FDBA74',
          boxShadow: 'inset 0 0 160px rgba(124, 45, 18, 0.18)',
        }}
      >
        {/* Monumental Roman Portal Archway */}
        <div className="relative flex items-center justify-center mt-10">
          {/* Left Flanking Corinthian Colonnade Pilaster */}
          <div className="w-16 h-[840px] bg-gradient-to-r from-[#FFF7ED] via-[#FED7AA] to-[#FDBA74] border-y-4 border-r-2 border-[#EA580C] shadow-xl flex flex-col justify-between">
            <div className="h-12 bg-gradient-to-b from-[#F59E0B] to-[#EA580C] shadow-xs" />
            <div className="h-16 bg-gradient-to-t from-[#F59E0B] to-[#EA580C] shadow-xs" />
          </div>

          {/* Main Semicircular Arch Portal Structure */}
          <div className="w-[680px] h-[860px] rounded-t-[340px] border-[12px] border-[#FDBA74] shadow-[0_30px_100px_rgba(124,45,18,0.25)] bg-gradient-to-b from-[#FFFDF9] via-[#FFF3E6] to-[#FED7AA] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Arch Keystone Detail at Top Center */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-14 bg-gradient-to-b from-[#EA580C] to-[#C2410C] border-x-2 border-b-2 border-[#FEF3C7] shadow-md z-20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#FEF3C7]" />
            </div>

            {/* Inner Archway Portal with Deep Architectural Presentation */}
            <div className="w-[580px] h-[750px] mt-16 rounded-t-[290px] border-4 border-[#EA580C] bg-gradient-to-b from-[#FFFDF9] via-[#FFF8F1] to-[#FFEDD5] shadow-[inset_0_20px_60px_rgba(124,45,18,0.14)] flex flex-col items-center justify-center relative overflow-hidden px-8">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 35%, rgba(254, 215, 170, 0.75) 0%, rgba(251, 146, 60, 0.25) 45%, transparent 80%)',
                }}
              />
              
              {/* Classical Inscription Cartouche Centered in Vista */}
              <div className="z-10 w-full px-6 py-8 rounded-xl border-2 border-[#EA580C] bg-[#FFFDF9]/95 backdrop-blur-sm shadow-[0_12px_36px_rgba(124,45,18,0.18)] flex flex-col items-center text-center">
                {/* Laurel Medallion Pill */}
                <div className="flex items-center gap-2.5 px-4 py-1 rounded-full bg-[#FFF3E6] border border-[#EA580C] shadow-xs mb-3">
                  <Award className="w-4 h-4 text-[#EA580C]" />
                  <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.35em] uppercase text-[#C2410C] font-bold">
                    PERMANENT WING OF LAUREATES
                  </span>
                </div>

                {/* Monumental, Large, Bold HALL OF FAME Title in Instrument Serif */}
                <h2
                  className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-center leading-none my-1 select-none"
                  style={{
                    fontFamily: "'Instrument Serif', Georgia, serif",
                    background: 'linear-gradient(135deg, #7C2D12 0%, #C2410C 28%, #EA580C 52%, #B45309 78%, #7C2D12 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 3px 6px rgba(124, 45, 18, 0.22))',
                  }}
                >
                  HALL OF FAME
                </h2>

                {/* Classical Gilded Fluted Divider */}
                <div className="w-48 sm:w-64 h-1 bg-gradient-to-r from-transparent via-[#EA580C] to-transparent my-3 shadow-xs" />

                {/* Sub-Inscription */}
                <div className="font-mono text-[10px] sm:text-[11px] tracking-[0.4em] uppercase text-[#9A3412] font-bold">
                  ✦ THE DEFINITIVE MASTERCLASS ARCHIVE ✦
                </div>

                {/* Classical Description in Instrument Serif Italic */}
                <p
                  className="font-serif italic text-sm sm:text-base text-[#7C2D12] mt-3 max-w-md text-center leading-relaxed font-medium"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                >
                  A permanent retrospective honoring the 10 definitive operators, founders, and masterclass minds whose transformative wisdom is preserved in the archive.
                </p>

                {/* Interactive Walk Corridor Again Button */}
                <div className="mt-5 pointer-events-auto flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onReturnToStart}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#EA580C] via-[#C2410C] to-[#9A3412] hover:from-[#F97316] hover:to-[#7C2D12] text-[#FFFDF8] font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-bold shadow-[0_4px_16px_rgba(234,88,12,0.35)] flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                    title="Return to the Grand Colonnade entrance"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Walk Corridor Again</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Flanking Corinthian Colonnade Pilaster */}
          <div className="w-16 h-[840px] bg-gradient-to-r from-[#FDBA74] via-[#FED7AA] to-[#FFF7ED] border-y-4 border-l-2 border-[#EA580C] shadow-xl flex flex-col justify-between">
            <div className="h-12 bg-gradient-to-b from-[#F59E0B] to-[#EA580C] shadow-xs" />
            <div className="h-16 bg-gradient-to-t from-[#F59E0B] to-[#EA580C] shadow-xs" />
          </div>
        </div>
      </div>
    </>
  );
};

export const MuseumCorridor3D = React.memo(MuseumCorridor3DComponent);
