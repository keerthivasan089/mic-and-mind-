/**
 * Hall of Fame Visual Configuration & Media Assets
 * Defines configuration constants for the curated exhibition archive.
 */

export const HALL_OF_FAME_CONFIG = {
  // Production background video hosted on Cloudinary
  backgroundVideoUrl: 'https://res.cloudinary.com/hiekaatg/video/upload/v1788553020/Create_a_premium_cinematic_amb.mp4',
  
  // High-resolution museum arch ambient poster fallback for reduced-motion or pre-buffering
  fallbackPosterUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1600&auto=format&fit=crop',

  // Museum typography & branding
  branding: {
    eyebrow: '✦ MIC & MIND ✦',
    title: 'HALL OF FAME',
    subtitle: 'Curated conversations that stayed with us.',
    quote: 'A cinematic museum environment where each frame holds a story, and every scroll brings you closer to the voices that matter.',
  },
} as const;
