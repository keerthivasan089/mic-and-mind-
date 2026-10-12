/**
 * Mic & Mind Design Tokens
 * 
 * Core brand palette, typography pairings, and layout dimensions.
 */

export const BRAND_COLORS = {
  orange: '#DD5A1F',       // Primary brand color
  orangeDeep: '#A8391A',   // Deep burnt orange accent
  cream: '#F4ECD9',        // Warm cream container background
  paper: '#FBF6EB',        // Off-white paper page background
  ink: '#1C140F',          // Near-black outline and text
} as const;

export const FONTS = {
  display: 'Instrument Serif, Georgia, serif',
  body: 'Inter, sans-serif',
  mono: 'Space Mono, monospace',
} as const;

export const SHADOWS = {
  stickerSm: '2px 2px 0px #1C140F',
  sticker: '4px 4px 0px #1C140F',
  stickerMd: '5px 5px 0px #1C140F',
  stickerLg: '6px 6px 0px #1C140F',
  stickerXl: '8px 8px 0px #1C140F',
} as const;
