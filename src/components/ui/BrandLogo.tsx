import React, { useState } from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
  dark?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showWordmark = true,
  className = '',
  dark = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const dimensionStyles = {
    sm: { img: 'w-7 h-7', text: 'text-lg', badge: 'w-7 h-7' },
    md: { img: 'w-8 h-8', text: 'text-xl', badge: 'w-8 h-8' },
    lg: { img: 'w-10 h-10', text: 'text-2xl sm:text-3xl', badge: 'w-10 h-10' },
  };

  const currentDim = dimensionStyles[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Logo Mark */}
      <div className={`relative ${currentDim.img} shrink-0`}>
        {!imageError ? (
          <img
            src="/assets/logo.png"
            alt="Mic & Mind Logo"
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          /* Elegant Minimal Waveform & Mic Mark */
          <div className={`${currentDim.badge} bg-[#DD5A1F] rounded-full flex items-center justify-center text-white shadow-sm`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" x2="12" y1="19" y2="22"/>
            </svg>
          </div>
        )}
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex items-center">
          <span
            className={`font-display font-bold tracking-tight ${currentDim.text} ${
              dark ? 'text-paper' : 'text-ink'
            }`}
          >
            Mic <span className="text-orange font-serif italic font-normal">&amp;</span> Mind
          </span>
        </div>
      )}
    </div>
  );
};
