import React from 'react';

interface BrandIconProps {
  className?: string;
  size?: number | string;
  fillColor?: string;
  strokeColor?: string;
  accentColor?: string;
}

/**
 * Custom Brand-Style Illustrated Icons
 * Characteristic style: Bold, chunky geometry, thick 2.5-3px black/dark ink outlines,
 * flat vibrant fill colors, rounded joins, consistent with the illustrated mascot logo.
 */

// 1. Entrepreneurship: Bold Chunky Rocket / Launch Engine
export const IconEntrepreneurship: React.FC<BrandIconProps> = ({
  className = 'w-7 h-7',
  fillColor = '#DD5A1F',
  strokeColor = '#1C140F',
  accentColor = '#FFB088',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Flame exhaust */}
    <path
      d="M20 38C20 44 24 46 24 46C24 46 28 44 28 38H20Z"
      fill="#F59E0B"
      stroke={strokeColor}
      strokeWidth="2.8"
    />
    <path
      d="M22 38C22 41 24 42.5 24 42.5C24 42.5 26 41 26 38H22Z"
      fill="#FDE047"
    />

    {/* Left wing fin */}
    <path
      d="M14 26L8 34C8 34 11 36 16 36L17 28L14 26Z"
      fill={accentColor}
      stroke={strokeColor}
      strokeWidth="2.8"
    />

    {/* Right wing fin */}
    <path
      d="M34 26L40 34C40 34 37 36 32 36L31 28L34 26Z"
      fill={accentColor}
      stroke={strokeColor}
      strokeWidth="2.8"
    />

    {/* Rocket Fuselage Body */}
    <path
      d="M24 4C17 11 15 22 16 36H32C33 22 31 11 24 4Z"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth="3"
    />

    {/* Porthole Window */}
    <circle
      cx="24"
      cy="18"
      r="4.5"
      fill="#FBF6EB"
      stroke={strokeColor}
      strokeWidth="2.8"
    />
    {/* Window Glare */}
    <path
      d="M25 15.5A2.5 2.5 0 0 0 22.5 18"
      stroke="#DD5A1F"
      strokeWidth="1.8"
    />
  </svg>
);

// 2. Growth & Mindset: Chunky Illustrated Brain & Sprout
export const IconGrowthMindset: React.FC<BrandIconProps> = ({
  className = 'w-7 h-7',
  fillColor = '#DD5A1F',
  strokeColor = '#1C140F',
  accentColor = '#FFD5C0',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Brain Base Lobes (Chunky rounded mascot clouds) */}
    <path
      d="M14 22C10 22 8 26 8 30C8 35 12 38 17 38C19 38 21 37 22 36C23 37 25 38 27 38C32 38 36 35 36 30C36 26 34 22 30 22C29 17 25 14 20 14C17 14 14.5 15.5 13 18C11.5 18.5 14 22 14 22Z"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth="3"
    />

    {/* Inner Brain Creases / Folds */}
    <path
      d="M16 28C18 28 20 25 22 25"
      stroke={strokeColor}
      strokeWidth="2.8"
    />
    <path
      d="M26 27C28 27 30 29 32 29"
      stroke={strokeColor}
      strokeWidth="2.8"
    />
    <path
      d="M20 33C22 33 24 35 26 35"
      stroke={strokeColor}
      strokeWidth="2.8"
    />

    {/* Sprout Stem Emerging from Top */}
    <path
      d="M22 14C22 8 26 6 26 6"
      stroke={strokeColor}
      strokeWidth="3"
    />
    {/* Sprout Leaf Left */}
    <path
      d="M24 9C20 8 18 11 22 12C23.5 12.3 24 9 24 9Z"
      fill="#10B981"
      stroke={strokeColor}
      strokeWidth="2.5"
    />
    {/* Sprout Leaf Right */}
    <path
      d="M26 6C30 5 32 8 28 10C26.5 10.5 26 6 26 6Z"
      fill="#34D399"
      stroke={strokeColor}
      strokeWidth="2.5"
    />

    {/* Sparkle Glint */}
    <circle cx="15" cy="24" r="1.5" fill="#FBF6EB" />
  </svg>
);

// 3. Failure & Recovery: Chunky Bandaged Heart / Phoenix Spark
export const IconFailureRecovery: React.FC<BrandIconProps> = ({
  className = 'w-7 h-7',
  fillColor = '#DD5A1F',
  strokeColor = '#1C140F',
  accentColor = '#FBF6EB',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Chunky Heart Silhouette */}
    <path
      d="M24 41C24 41 7 30 7 18C7 11 12 7 18 7C21 7 23 8.5 24 10.5C25 8.5 27 7 30 7C36 7 41 11 41 18C41 30 24 41 24 41Z"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth="3"
    />

    {/* Band-Aid Patch (angled across crack) */}
    <g transform="rotate(35 24 22)">
      <rect
        x="15"
        y="18"
        width="18"
        height="8"
        rx="3"
        fill={accentColor}
        stroke={strokeColor}
        strokeWidth="2.8"
      />
      {/* Band-aid micro dots */}
      <circle cx="21" cy="22" r="1" fill="#DD5A1F" />
      <circle cx="24" cy="22" r="1" fill="#DD5A1F" />
      <circle cx="27" cy="22" r="1" fill="#DD5A1F" />
    </g>

    {/* Energetic Spark / Lightning Accent */}
    <path
      d="M37 6L39 11L44 11L40 14L42 19L37 16L32 19L34 14L30 11L35 11L37 6Z"
      fill="#F59E0B"
      stroke={strokeColor}
      strokeWidth="2"
    />
  </svg>
);

// 4. Connection: Chunky Illustrated Overlapping Speech Bubbles
export const IconConnection: React.FC<BrandIconProps> = ({
  className = 'w-7 h-7',
  fillColor = '#DD5A1F',
  strokeColor = '#1C140F',
  accentColor = '#FF8542',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Back Bubble (Cream Paper) */}
    <path
      d="M10 24C10 16 16 10 24 10C32 10 38 16 38 24C38 31 32 36 25 36L20 40V35C14 34 10 30 10 24Z"
      fill="#FBF6EB"
      stroke={strokeColor}
      strokeWidth="3"
    />

    {/* Front Bubble (Brand Orange) */}
    <path
      d="M16 28C16 22 21 17 28 17C35 17 40 22 40 28C40 34 35 38 29 38L25 42V37C20 37 16 33 16 28Z"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth="3"
    />

    {/* Chat Bubble Dots */}
    <circle cx="23" cy="28" r="1.8" fill="#FBF6EB" />
    <circle cx="28" cy="28" r="1.8" fill="#FBF6EB" />
    <circle cx="33" cy="28" r="1.8" fill="#FBF6EB" />

    {/* Back Bubble mini dots */}
    <circle cx="19" cy="20" r="1.4" fill="#1C140F" />
    <circle cx="24" cy="20" r="1.4" fill="#1C140F" />
  </svg>
);

// 5. Pillar 01: Psychological Depth (Chunky Brain Flame)
export const IconPsychologicalDepth: React.FC<BrandIconProps> = ({
  className = 'w-6 h-6',
  fillColor = '#DD5A1F',
  strokeColor = '#1C140F',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Flame Silhouette */}
    <path
      d="M24 4C24 4 11 16 11 28C11 36 17 42 24 42C31 42 37 36 37 28C37 18 29 13 29 13C29 13 31 20 28 23C25 26 21 21 21 21C21 21 19 28 24 31C21 31 18 28 18 25C18 19 24 14 24 4Z"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth="3"
    />
    {/* Inner Core Flame */}
    <path
      d="M24 24C22 26 20 28 20 32C20 36 22 38 24 38C26 38 28 36 28 32C28 29 26 26 24 24Z"
      fill="#FDE047"
      stroke={strokeColor}
      strokeWidth="2.2"
    />
  </svg>
);

// 6. Pillar 02: Tactical Execution (Chunky Target / Compass Bullseye)
export const IconTacticalExecution: React.FC<BrandIconProps> = ({
  className = 'w-6 h-6',
  fillColor = '#DD5A1F',
  strokeColor = '#1C140F',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Outer chunky ring */}
    <circle
      cx="24"
      cy="24"
      r="18"
      fill="#FBF6EB"
      stroke={strokeColor}
      strokeWidth="3"
    />
    {/* Middle colored ring */}
    <circle
      cx="24"
      cy="24"
      r="12"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth="2.8"
    />
    {/* Bullseye Center */}
    <circle
      cx="24"
      cy="24"
      r="5"
      fill="#FDE047"
      stroke={strokeColor}
      strokeWidth="2.4"
    />
    {/* Crosshairs */}
    <path d="M24 2V10M24 38V46M2 24H10M38 24H46" stroke={strokeColor} strokeWidth="3" />
  </svg>
);

// 7. Pillar 03: Sustainable Scale (Chunky Mountain / Geometric Spire)
export const IconSustainableScale: React.FC<BrandIconProps> = ({
  className = 'w-6 h-6',
  fillColor = '#DD5A1F',
  strokeColor = '#1C140F',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Secondary peak */}
    <path
      d="M26 22L39 40H17L26 22Z"
      fill="#FF8542"
      stroke={strokeColor}
      strokeWidth="3"
    />
    {/* Main mountain peak */}
    <path
      d="M19 12L33 40H5L19 12Z"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth="3"
    />
    {/* Snow cap */}
    <path
      d="M19 12L23 20L19 18L15 20L19 12Z"
      fill="#FBF6EB"
      stroke={strokeColor}
      strokeWidth="2.5"
    />
    {/* Sun disc */}
    <circle cx="36" cy="14" r="5" fill="#F59E0B" stroke={strokeColor} strokeWidth="2.5" />
  </svg>
);

// 8. Custom Brand Distribution Icons (Spotify, Apple, YouTube, Google, Overcast, RSS)
export const IconPlatformSpotify: React.FC<BrandIconProps> = ({
  className = 'w-6 h-6',
  strokeColor = '#1C140F',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="24" cy="24" r="20" fill="#1DB954" stroke={strokeColor} strokeWidth="3" />
    <path d="M12 18C18 16 28 17 35 21" stroke={strokeColor} strokeWidth="3.5" />
    <path d="M14 24C19 22.5 27 23.5 33 27" stroke={strokeColor} strokeWidth="3.5" />
    <path d="M16 30C20 29 26 30 31 32.5" stroke={strokeColor} strokeWidth="3" />
  </svg>
);

export const IconPlatformApple: React.FC<BrandIconProps> = ({
  className = 'w-6 h-6',
  strokeColor = '#1C140F',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="4" width="40" height="40" rx="12" fill="#B845ED" stroke={strokeColor} strokeWidth="3" />
    {/* Antenna / Mic Spire */}
    <circle cx="24" cy="18" r="4.5" fill="#FBF6EB" stroke={strokeColor} strokeWidth="2.8" />
    <path d="M24 23V36" stroke={strokeColor} strokeWidth="3.5" />
    <path d="M18 36H30" stroke={strokeColor} strokeWidth="3.5" />
    {/* Concentric Audio Arcs */}
    <path d="M15 14C12 17 12 21 15 24" stroke="#FBF6EB" strokeWidth="2.8" />
    <path d="M33 14C36 17 36 21 33 24" stroke="#FBF6EB" strokeWidth="2.8" />
  </svg>
);

export const IconPlatformYouTube: React.FC<BrandIconProps> = ({
  className = 'w-6 h-6',
  strokeColor = '#1C140F',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="8" width="40" height="32" rx="10" fill="#FF0000" stroke={strokeColor} strokeWidth="3" />
    {/* Play Triangle */}
    <path d="M20 18L32 24L20 30V18Z" fill="#FBF6EB" stroke={strokeColor} strokeWidth="2.6" />
  </svg>
);

export const IconPlatformGoogle: React.FC<BrandIconProps> = ({
  className = 'w-6 h-6',
  strokeColor = '#1C140F',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="4" width="40" height="40" rx="12" fill="#4285F4" stroke={strokeColor} strokeWidth="3" />
    {/* Colorful Equalizer Bars */}
    <rect x="13" y="20" width="4" height="12" rx="2" fill="#EA4335" stroke={strokeColor} strokeWidth="2" />
    <rect x="20" y="12" width="4" height="24" rx="2" fill="#FBBC05" stroke={strokeColor} strokeWidth="2" />
    <rect x="27" y="16" width="4" height="18" rx="2" fill="#34A853" stroke={strokeColor} strokeWidth="2" />
    <rect x="34" y="22" width="4" height="9" rx="2" fill="#FFFFFF" stroke={strokeColor} strokeWidth="2" />
  </svg>
);

export const IconPlatformOvercast: React.FC<BrandIconProps> = ({
  className = 'w-6 h-6',
  strokeColor = '#1C140F',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="4" width="40" height="40" rx="12" fill="#FC7E0F" stroke={strokeColor} strokeWidth="3" />
    {/* Sound waves radiating from center */}
    <circle cx="24" cy="24" r="3.5" fill="#FBF6EB" stroke={strokeColor} strokeWidth="2" />
    <path d="M16 16C12 20 12 28 16 32" stroke="#FBF6EB" strokeWidth="3" />
    <path d="M32 16C36 20 36 28 32 32" stroke="#FBF6EB" strokeWidth="3" />
  </svg>
);

export const IconPlatformRSS: React.FC<BrandIconProps> = ({
  className = 'w-6 h-6',
  strokeColor = '#1C140F',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="4" width="40" height="40" rx="12" fill="#DD5A1F" stroke={strokeColor} strokeWidth="3" />
    <circle cx="15" cy="33" r="3" fill="#FBF6EB" stroke={strokeColor} strokeWidth="2.2" />
    <path d="M13 23C19 23 25 29 25 35" stroke="#FBF6EB" strokeWidth="3.5" />
    <path d="M13 15C25 15 35 25 35 35" stroke="#FBF6EB" strokeWidth="3.5" />
  </svg>
);

// 9. Custom Social Icons for Footer
export const IconSocialYouTube: React.FC<BrandIconProps> = ({ className = 'w-5 h-5' }) => (
  <IconPlatformYouTube className={className} />
);

export const IconSocialTwitter: React.FC<BrandIconProps> = ({
  className = 'w-5 h-5',
  strokeColor = '#1C140F',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="4" width="40" height="40" rx="12" fill="#1C140F" stroke={strokeColor} strokeWidth="2.8" />
    <path
      d="M15 14L23 25L14 34H17L24.5 26.5L30 34H34L25.5 22.5L33 14H30L23.8 21L19 14H15Z"
      fill="#FBF6EB"
    />
  </svg>
);

export const IconSocialInstagram: React.FC<BrandIconProps> = ({
  className = 'w-5 h-5',
  strokeColor = '#1C140F',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="4" width="40" height="40" rx="12" fill="#E1306C" stroke={strokeColor} strokeWidth="2.8" />
    <rect x="14" y="14" width="20" height="20" rx="6" stroke="#FBF6EB" strokeWidth="3" />
    <circle cx="24" cy="24" r="5" stroke="#FBF6EB" strokeWidth="3" />
    <circle cx="29.5" cy="18.5" r="1.5" fill="#FBF6EB" />
  </svg>
);

export const IconSocialLinkedIn: React.FC<BrandIconProps> = ({
  className = 'w-5 h-5',
  strokeColor = '#1C140F',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="4" width="40" height="40" rx="12" fill="#0077B5" stroke={strokeColor} strokeWidth="2.8" />
    <rect x="13" y="20" width="5" height="14" rx="1.5" fill="#FBF6EB" />
    <circle cx="15.5" cy="15" r="2.5" fill="#FBF6EB" />
    <path
      d="M22 20H27V22C28 20.5 30 19.5 32.5 19.5C36 19.5 37.5 22 37.5 26V34H32.5V27C32.5 25 31.5 24 30 24C28.5 24 27 25 27 27V34H22V20Z"
      fill="#FBF6EB"
    />
  </svg>
);
