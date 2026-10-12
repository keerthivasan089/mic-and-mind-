import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export interface HeroVideoDocument {
  _id: string;
  _type: 'heroVideo';
  title: string;
  tagline: string;
  desktopVideoUrl: string;
  mobileVideoUrl: string;
  posterUrl: string;
  accentColor: string;
  aspectRatio: string;
  durationSeconds: number;
  isActive: boolean;
  _updatedAt: string;
}

export interface CarouselEpisodeDocument {
  _id: string;
  _type: 'carouselEpisode';
  number: string;
  title: string;
  rankPosition: number;
  guestName: string;
  guestRole: string;
  guestAvatar: string;
  portraitUrl: string;
  description: string;
  duration: string;
  date: string;
  category: 'Entrepreneurship' | 'Growth & Mindset' | 'Failure & Recovery' | 'Connection';
  listenCount: string;
  listenCountNumber: number;
  listenCountSuffix: string;
  trendingBadge: string;
  rankingLabel: string;
  audioUrl: string;
  accentColor: string;
  highlights: string[];
  _updatedAt: string;
}

export interface HallOfFameGuestDocument {
  _id: string;
  _type: 'hallOfFameGuest';
  name: string;
  role: string;
  company?: string;
  episodeNumber: string;
  episodeId: string;
  portraitUrl: string;
  quote?: string;
  accentColor: string;
  rankPosition: number;
  featured: boolean;
  _updatedAt: string;
}

export interface CMSDataset {
  heroVideos: HeroVideoDocument[];
  carouselEpisodes: CarouselEpisodeDocument[];
  hallOfFameGuests: HallOfFameGuestDocument[];
  lastSyncedAt: string;
}

const STORAGE_KEY = 'sanity_cms_content_v2';
const EVENT_NAME = 'sanity_cms_updated';

export const INITIAL_HERO_VIDEOS: HeroVideoDocument[] = [
  {
    _id: 'hero-main-001',
    _type: 'heroVideo',
    title: 'Raw Founder Conversations & Uncensored Journeys',
    tagline: 'Step behind closed doors with operators who built from nothing.',
    desktopVideoUrl:
      'https://res.cloudinary.com/hiekaatg/video/upload/v1787462200/watermark-removed-Cinematic_D_rendered_podcast_1.mp4',
    mobileVideoUrl:
      'https://res.cloudinary.com/hiekaatg/video/upload/c_fill,ar_9:16,g_center/v1787462200/watermark-removed-Cinematic_D_rendered_podcast_1.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1600&auto=format&fit=crop',
    accentColor: '#DD5A1F',
    aspectRatio: '9:16',
    durationSeconds: 10,
    isActive: true,
    _updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_CAROUSEL_EPISODES: CarouselEpisodeDocument[] = [
  {
    _id: 'ep-042',
    _type: 'carouselEpisode',
    number: 'EP. 042',
    rankPosition: 1,
    title: 'From $0 to $30M: The Unspoken Toll of Hypergrowth',
    guestName: 'Maya Lin',
    guestRole: 'Founder & CEO, Lumina Craft',
    guestAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    portraitUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    description: 'Maya breaks down what happens when your product goes viral overnight — how she rebuilt her supply chain during a pandemic, navigated identity crises, and learned to protect her mental bandwidth.',
    duration: '58 min',
    date: 'August 18, 2026',
    category: 'Entrepreneurship',
    listenCount: '148K Listens',
    listenCountNumber: 148,
    listenCountSuffix: 'K Listens',
    trendingBadge: 'Editor’s Choice',
    rankingLabel: '#1 Trending',
    audioUrl: 'https://cdn.freesound.org/previews/612/612642_5674468-lq.mp3',
    accentColor: '#DD5A1F',
    highlights: ['The 3 a.m. panic moments', 'Hiring executives who are smarter than you', 'Why speed is often a trap'],
    _updatedAt: new Date().toISOString(),
  },
  {
    _id: 'ep-041',
    _type: 'carouselEpisode',
    number: 'EP. 041',
    rankPosition: 2,
    title: 'Failing in Public: Rebuilding Confidence After a Shut Down',
    guestName: 'Marcus Vance',
    guestRole: 'Serial Founder & Author',
    guestAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    portraitUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    description: 'After liquidating a venture-backed logistics startup with $8M in funding, Marcus spent 9 months in reflection. He shares the uncomfortable truths about ego, investor dynamics, and starting over.',
    duration: '64 min',
    date: 'August 11, 2026',
    category: 'Failure & Recovery',
    listenCount: '112K Listens',
    listenCountNumber: 112,
    listenCountSuffix: 'K Listens',
    trendingBadge: 'Fan Favorite',
    rankingLabel: '#2 Most Shared',
    audioUrl: 'https://cdn.freesound.org/previews/612/612642_5674468-lq.mp3',
    accentColor: '#FF8542',
    highlights: ['The post-mortem call with your lead investor', 'Detangling self-worth from valuation', 'The rebirth roadmap'],
    _updatedAt: new Date().toISOString(),
  },
  {
    _id: 'ep-040',
    _type: 'carouselEpisode',
    number: 'EP. 040',
    rankPosition: 3,
    title: 'The Discipline of Intuition: How Gut Instincts Win',
    guestName: 'Elena Rostova',
    guestRole: 'Creative Director & Brand Strategist',
    guestAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
    portraitUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
    description: 'In an era obsessed with A/B testing and analytics, Elena argues why radical intuition and taste are the only sustainable competitive advantages left for modern creators.',
    duration: '51 min',
    date: 'August 04, 2026',
    category: 'Growth & Mindset',
    listenCount: '98K Listens',
    listenCountNumber: 98,
    listenCountSuffix: 'K Listens',
    trendingBadge: 'Must Listen',
    rankingLabel: '#3 Deep Dive',
    audioUrl: 'https://cdn.freesound.org/previews/612/612642_5674468-lq.mp3',
    accentColor: '#E5A823',
    highlights: ['Developing pattern recognition', 'When data lies to you', 'Building brand equity with bold conviction'],
    _updatedAt: new Date().toISOString(),
  },
  {
    _id: 'ep-039',
    _type: 'carouselEpisode',
    number: 'EP. 039',
    rankPosition: 4,
    title: 'Radical Candor & Co-Founder Marriages',
    guestName: 'David & Priya Chen',
    guestRole: 'Co-Founders, Synergize Health',
    guestAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=800&auto=format&fit=crop',
    portraitUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=800&auto=format&fit=crop',
    description: 'A 10-year working partnership that survived product pivots, market crashes, and intense disagreements. David and Priya share their conflict protocols and weekly alignment rituals.',
    duration: '72 min',
    date: 'July 28, 2026',
    category: 'Connection',
    listenCount: '86K Listens',
    listenCountNumber: 86,
    listenCountSuffix: 'K Listens',
    trendingBadge: 'Essential',
    rankingLabel: '#4 Masterclass',
    audioUrl: 'https://cdn.freesound.org/previews/612/612642_5674468-lq.mp3',
    accentColor: '#2E7D32',
    highlights: ['The "disagree and commit" rule in action', 'Weekly emotional retrospectives', 'Separating friendship from fiduciary duty'],
    _updatedAt: new Date().toISOString(),
  },
  {
    _id: 'ep-038',
    _type: 'carouselEpisode',
    number: 'EP. 038',
    rankPosition: 5,
    title: 'Bootstrapping to an 8-Figure Exit with Zero Outside VC',
    guestName: 'Zack Thorne',
    guestRole: 'Founder & CEO, Apex Grid',
    guestAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
    portraitUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
    description: 'Zack explains how staying lean, charging from day one, and prioritizing cash-flow compounding allowed him to retain 100% equity until acquisition.',
    duration: '49 min',
    date: 'July 21, 2026',
    category: 'Entrepreneurship',
    listenCount: '74K Listens',
    listenCountNumber: 74,
    listenCountSuffix: 'K Listens',
    trendingBadge: 'Case Study',
    rankingLabel: '#5 Top Rated',
    audioUrl: 'https://cdn.freesound.org/previews/612/612642_5674468-lq.mp3',
    accentColor: '#3B82F6',
    highlights: ['The bootstrap mental model for asymmetric upside', 'Pricing for enterprise clients with confidence', 'Saying no to tempting term sheets'],
    _updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_HALL_OF_FAME_GUESTS: HallOfFameGuestDocument[] = [
  {
    _id: 'guest-001',
    _type: 'hallOfFameGuest',
    name: 'Maya Lin',
    role: 'Founder & CEO, Lumina Craft',
    company: 'Lumina Craft',
    episodeNumber: 'EP. 042',
    episodeId: 'ep-042',
    portraitUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    quote: 'Hypergrowth will break whatever foundation you forgot to pour.',
    accentColor: '#DD5A1F',
    rankPosition: 1,
    featured: true,
    _updatedAt: new Date().toISOString(),
  },
  {
    _id: 'guest-002',
    _type: 'hallOfFameGuest',
    name: 'Marcus Vance',
    role: 'Serial Founder & Author',
    company: 'Author, "Post-Mortem"',
    episodeNumber: 'EP. 041',
    episodeId: 'ep-041',
    portraitUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    quote: 'Your company shutting down is an event; it is not your identity.',
    accentColor: '#FF8542',
    rankPosition: 2,
    featured: true,
    _updatedAt: new Date().toISOString(),
  },
  {
    _id: 'guest-003',
    _type: 'hallOfFameGuest',
    name: 'Elena Rostova',
    role: 'Creative Director & Brand Strategist',
    company: 'Studio Rostova',
    episodeNumber: 'EP. 040',
    episodeId: 'ep-040',
    portraitUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
    quote: 'When everyone has access to the same analytics, instinct is the only edge.',
    accentColor: '#E5A823',
    rankPosition: 3,
    featured: true,
    _updatedAt: new Date().toISOString(),
  },
  {
    _id: 'guest-004',
    _type: 'hallOfFameGuest',
    name: 'David & Priya Chen',
    role: 'Co-Founders, Synergize Health',
    company: 'Synergize Health',
    episodeNumber: 'EP. 039',
    episodeId: 'ep-039',
    portraitUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=800&auto=format&fit=crop',
    quote: 'Disagreeing is healthy. Walking away without clarity is what poisons teams.',
    accentColor: '#2E7D32',
    rankPosition: 4,
    featured: true,
    _updatedAt: new Date().toISOString(),
  },
  {
    _id: 'guest-005',
    _type: 'hallOfFameGuest',
    name: 'Zack Thorne',
    role: 'Founder & CEO, Apex Grid',
    company: 'Apex Grid',
    episodeNumber: 'EP. 038',
    episodeId: 'ep-038',
    portraitUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
    quote: 'Charge upfront on day one. Cash flow gives you sovereignty.',
    accentColor: '#3B82F6',
    rankPosition: 5,
    featured: true,
    _updatedAt: new Date().toISOString(),
  },
  {
    _id: 'guest-006',
    _type: 'hallOfFameGuest',
    name: 'Dr. Aris Thorne',
    role: 'Chief AI Scientist, Cognition Labs',
    company: 'Cognition Labs',
    episodeNumber: 'EP. 037',
    episodeId: 'ep-037',
    portraitUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop',
    quote: 'The models will commoditize. The enduring moat is proprietary domain context.',
    accentColor: '#8B5CF6',
    rankPosition: 6,
    featured: true,
    _updatedAt: new Date().toISOString(),
  },
  {
    _id: 'guest-007',
    _type: 'hallOfFameGuest',
    name: 'Sofia Al-Mansoor',
    role: 'Managing Partner, Oasis Ventures',
    company: 'Oasis Ventures',
    episodeNumber: 'EP. 036',
    episodeId: 'ep-036',
    portraitUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
    quote: 'Great capital allocators look for inflection points that conventional metrics ignore.',
    accentColor: '#EC4899',
    rankPosition: 7,
    featured: true,
    _updatedAt: new Date().toISOString(),
  },
  {
    _id: 'guest-008',
    _type: 'hallOfFameGuest',
    name: 'Julian Mercer',
    role: 'Head of Industrial Design, Form & Function',
    company: 'Form & Function',
    episodeNumber: 'EP. 035',
    episodeId: 'ep-035',
    portraitUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop',
    quote: 'True luxury is the radical elimination of visual friction and unnecessary noise.',
    accentColor: '#10B981',
    rankPosition: 8,
    featured: true,
    _updatedAt: new Date().toISOString(),
  },
  {
    _id: 'guest-009',
    _type: 'hallOfFameGuest',
    name: 'Naomi Kalu',
    role: 'Founder & CTO, Pulse Bio-Tech',
    company: 'Pulse Bio-Tech',
    episodeNumber: 'EP. 034',
    episodeId: 'ep-034',
    portraitUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop',
    quote: 'Resilience is not enduring pain; it is designing systems that absorb shocks without failing.',
    accentColor: '#F59E0B',
    rankPosition: 9,
    featured: true,
    _updatedAt: new Date().toISOString(),
  },
  {
    _id: 'guest-010',
    _type: 'hallOfFameGuest',
    name: 'Henrik Lindqvist',
    role: 'Principal Architect, Nordic Sound',
    company: 'Nordic Sound',
    episodeNumber: 'EP. 033',
    episodeId: 'ep-033',
    portraitUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop',
    quote: 'Acoustic architecture teaches you that space is defined by what you choose not to amplify.',
    accentColor: '#6366F1',
    rankPosition: 10,
    featured: true,
    _updatedAt: new Date().toISOString(),
  },
];

/**
 * Load the complete CMS dataset from local storage or initial values
 */
export function getCMSDataset(): CMSDataset {
  if (typeof window === 'undefined') {
    return {
      heroVideos: INITIAL_HERO_VIDEOS,
      carouselEpisodes: INITIAL_CAROUSEL_EPISODES,
      hallOfFameGuests: INITIAL_HALL_OF_FAME_GUESTS,
      lastSyncedAt: new Date().toISOString(),
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial: CMSDataset = {
        heroVideos: INITIAL_HERO_VIDEOS,
        carouselEpisodes: INITIAL_CAROUSEL_EPISODES,
        hallOfFameGuests: INITIAL_HALL_OF_FAME_GUESTS,
        lastSyncedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as CMSDataset;
    // Safety fallback if fields are missing in older storage
    if (!parsed.heroVideos || !parsed.carouselEpisodes || !parsed.hallOfFameGuests) {
      const merged: CMSDataset = {
        heroVideos: parsed.heroVideos || INITIAL_HERO_VIDEOS,
        carouselEpisodes: parsed.carouselEpisodes || INITIAL_CAROUSEL_EPISODES,
        hallOfFameGuests: parsed.hallOfFameGuests || INITIAL_HALL_OF_FAME_GUESTS,
        lastSyncedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to read CMS dataset from storage, using defaults:', err);
    return {
      heroVideos: INITIAL_HERO_VIDEOS,
      carouselEpisodes: INITIAL_CAROUSEL_EPISODES,
      hallOfFameGuests: INITIAL_HALL_OF_FAME_GUESTS,
      lastSyncedAt: new Date().toISOString(),
    };
  }
}

/**
 * Helper to strip large transient base64 payloads to prevent localStorage quota exhaustion.
 * Only pure HTTPS / Cloudinary URLs are persisted.
 */
function sanitizeDatasetForStorage(dataset: CMSDataset): CMSDataset {
  return {
    ...dataset,
    heroVideos: (dataset.heroVideos || []).map((h) => ({
      ...h,
      desktopVideoUrl: h.desktopVideoUrl?.startsWith('data:') ? '' : h.desktopVideoUrl,
      mobileVideoUrl: h.mobileVideoUrl?.startsWith('data:') ? '' : h.mobileVideoUrl,
      posterUrl: h.posterUrl?.startsWith('data:') ? '' : h.posterUrl,
    })),
    carouselEpisodes: (dataset.carouselEpisodes || []).map((ep) => ({
      ...ep,
      audioUrl: ep.audioUrl?.startsWith('data:') ? '' : ep.audioUrl,
      portraitUrl: ep.portraitUrl?.startsWith('data:') && ep.portraitUrl.length > 600000 ? '' : ep.portraitUrl,
      guestAvatar: ep.guestAvatar?.startsWith('data:') && ep.guestAvatar.length > 600000 ? '' : ep.guestAvatar,
    })),
    hallOfFameGuests: (dataset.hallOfFameGuests || []).map((g) => ({
      ...g,
      portraitUrl: g.portraitUrl?.startsWith('data:') && g.portraitUrl.length > 600000 ? '' : g.portraitUrl,
    })),
  };
}

/**
 * Save CMS dataset and notify all listeners
 */
export function saveCMSDataset(dataset: CMSDataset): void {
  if (typeof window === 'undefined') return;
  try {
    dataset.lastSyncedAt = new Date().toISOString();
    const sanitized = sanitizeDatasetForStorage(dataset);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: dataset }));
  } catch (err) {
    console.error('Failed to save CMS dataset:', err);
  }
}

/**
 * Subscribe to live CMS store changes
 */
export function subscribeToCMS(callback: (dataset: CMSDataset) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: Event) => {
    const customEvent = e as CustomEvent<CMSDataset>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    } else {
      callback(getCMSDataset());
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getCMSDataset());
    }
  };

  window.addEventListener(EVENT_NAME, handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener(EVENT_NAME, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}

/**
 * Fetches latest authoritative CMS dataset directly from Supabase.
 */
export async function fetchSupabaseDataset(): Promise<CMSDataset | null> {
  try {
    const [heroesRes, episodesRes, guestsRes] = await Promise.all([
      supabase.from('hero_videos').select('*').order('updated_at', { ascending: false }),
      supabase.from('carousel_episodes').select('*').order('rank_position', { ascending: true }),
      supabase.from('hall_of_fame_guests').select('*').order('rank_position', { ascending: true }),
    ]);

    if (heroesRes.error || episodesRes.error || guestsRes.error) {
      console.warn('Supabase fetch error:', heroesRes.error || episodesRes.error || guestsRes.error);
      return null;
    }

    const heroVideos: HeroVideoDocument[] = (heroesRes.data || []).map((row: any) => ({
      _id: row.id,
      _type: 'heroVideo',
      title: row.title || 'Raw Founder Conversations & Uncensored Journeys',
      tagline: row.tagline || '',
      desktopVideoUrl: row.desktop_video_url || '',
      mobileVideoUrl: row.mobile_video_url || '',
      posterUrl: row.poster_url || '',
      accentColor: row.accent_color || '#DD5A1F',
      aspectRatio: row.aspect_ratio || '9:16',
      durationSeconds: Number(row.duration_seconds) || 10,
      isActive: Boolean(row.is_active),
      _updatedAt: row.updated_at || new Date().toISOString(),
    }));

    const carouselEpisodes: CarouselEpisodeDocument[] = (episodesRes.data || []).map((row: any) => {
      const rawListen = row.listen_count || '120K Listens';
      const numericMatch = rawListen.match(/\d+(\.\d+)?/);
      const listenNumber = numericMatch ? parseFloat(numericMatch[0]) : 100;
      const suffixMatch = rawListen.match(/[KM]/i);
      const listenSuffix = suffixMatch ? `${suffixMatch[0].toUpperCase()} Listens` : 'Listens';

      return {
        _id: row.id,
        _type: 'carouselEpisode',
        number: row.number || 'EP. 000',
        title: row.title || '',
        rankPosition: Number(row.rank_position) || 1,
        guestName: row.guest_name || '',
        guestRole: row.guest_role || '',
        guestAvatar: row.portrait_url || '',
        portraitUrl: row.portrait_url || '',
        description: row.description || '',
        duration: row.duration || '45 min',
        date: row.episode_date || 'Recent',
        category: (row.category as any) || 'Entrepreneurship',
        listenCount: rawListen,
        listenCountNumber: listenNumber,
        listenCountSuffix: listenSuffix,
        trendingBadge: row.trending_badge || 'Trending',
        rankingLabel: row.ranking_label || `#${row.rank_position || 1} ALL-TIME`,
        audioUrl: row.audio_url || '',
        accentColor: row.accent_color || '#DD5A1F',
        highlights: [],
        _updatedAt: row.updated_at || new Date().toISOString(),
      };
    });

    const hallOfFameGuests: HallOfFameGuestDocument[] = (guestsRes.data || []).map((row: any) => ({
      _id: row.id,
      _type: 'hallOfFameGuest',
      name: row.name || '',
      role: row.role || '',
      company: row.company || '',
      episodeNumber: row.episode_number || '',
      episodeId: row.episode_id || '',
      portraitUrl: row.portrait_url || '',
      quote: row.quote || '',
      accentColor: row.accent_color || '#DD5A1F',
      rankPosition: Number(row.rank_position) || 1,
      featured: row.featured === false ? false : true,
      _updatedAt: row.updated_at || new Date().toISOString(),
    }));

    if (carouselEpisodes.length === 0 && heroVideos.length === 0 && hallOfFameGuests.length === 0) {
      return null;
    }

    return {
      heroVideos: heroVideos.length > 0 ? heroVideos : INITIAL_HERO_VIDEOS,
      carouselEpisodes: carouselEpisodes.length > 0 ? carouselEpisodes : INITIAL_CAROUSEL_EPISODES,
      hallOfFameGuests: hallOfFameGuests.length > 0 ? hallOfFameGuests : INITIAL_HALL_OF_FAME_GUESTS,
      lastSyncedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Error fetching Supabase dataset:', err);
    return null;
  }
}

/**
 * React hook to reactively subscribe to live CMS updates from Supabase
 */
export function useCMSDataset(): CMSDataset {
  const [data, setData] = useState<CMSDataset>(() => getCMSDataset());

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch live authoritative data from Supabase immediately on mount
    fetchSupabaseDataset().then((supaData) => {
      if (isMounted && supaData) {
        setData(supaData);
        // Sync local cache fallback
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(supaData));
        } catch {}
      }
    });

    // 2. Subscribe to internal app sync events (e.g. AdminPortal actions)
    const unsubscribe = subscribeToCMS((nextData) => {
      if (isMounted) {
        setData({ ...nextData });
      }
    });

    // 3. Subscribe to Supabase Postgres Realtime changes across tabs/devices
    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel('schema-cms-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'carousel_episodes' },
          () => {
            fetchSupabaseDataset().then((supaData) => {
              if (isMounted && supaData) {
                setData(supaData);
                try {
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(supaData));
                } catch {}
              }
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'hall_of_fame_guests' },
          () => {
            fetchSupabaseDataset().then((supaData) => {
              if (isMounted && supaData) {
                setData(supaData);
                try {
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(supaData));
                } catch {}
              }
            });
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Realtime channel subscription error:', e);
    }

    return () => {
      isMounted = false;
      unsubscribe();
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return data;
}

/**
 * Reset all CMS content back to factory defaults
 */
export function resetCMSDataset(): CMSDataset {
  const initial: CMSDataset = {
    heroVideos: INITIAL_HERO_VIDEOS,
    carouselEpisodes: INITIAL_CAROUSEL_EPISODES,
    hallOfFameGuests: INITIAL_HALL_OF_FAME_GUESTS,
    lastSyncedAt: new Date().toISOString(),
  };
  saveCMSDataset(initial);
  return initial;
}
