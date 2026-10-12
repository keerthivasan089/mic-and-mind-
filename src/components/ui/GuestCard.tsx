import React from 'react';
import { Episode } from '../../types';

interface GuestCardProps {
  episode: Episode;
  onClick?: (episode: Episode) => void;
}

/**
 * Reusable Featured Voices Guest Card component.
 * Renders portrait avatar with bold 6px ring border, guest credentials,
 * and episode metadata purely from a single episode object prop.
 */
export const GuestCard: React.FC<GuestCardProps> = ({ episode, onClick }) => {
  const cover =
    episode.portraitUrl ||
    episode.guest.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop';

  const handleClick = () => {
    if (onClick) {
      onClick(episode);
    } else {
      const el = document.getElementById(`episode-row-${episode.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div
      id={`featured-guest-card-${episode.id}`}
      onClick={handleClick}
      className="group flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl bg-white/80 hover:bg-white border border-ink/8 hover:border-orange/40 transition-all cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-1"
    >
      {/* Circular Portrait Photo with Bold 6px Ring Border */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-[6px] border-orange group-hover:border-[#FF8542] ring-4 ring-orange/20 shadow-md transition-all duration-300 group-hover:scale-105 shrink-0 bg-ink">
        <img
          src={cover}
          alt={episode.guest.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="mt-3.5 w-full">
        <span className="inline-block font-mono text-[10px] font-bold text-orange uppercase tracking-wider mb-1">
          {episode.number}
        </span>
        <h5 className="font-display text-base sm:text-lg font-bold text-ink group-hover:text-orange transition-colors leading-tight line-clamp-1">
          {episode.guest.name}
        </h5>
        <p className="font-body text-xs text-ink/70 line-clamp-2 mt-1 leading-snug">
          {episode.guest.role}
        </p>
      </div>
    </div>
  );
};
