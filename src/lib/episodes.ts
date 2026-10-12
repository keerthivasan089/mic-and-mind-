import { Episode } from '../types';
import { getCMSDataset, CarouselEpisodeDocument } from './cmsStore';

export function mapCmsDocToEpisode(doc: CarouselEpisodeDocument): Episode {
  return {
    id: doc._id,
    number: doc.number,
    rankPosition: doc.rankPosition,
    title: doc.title,
    guest: {
      name: doc.guestName,
      role: doc.guestRole,
      avatar: doc.guestAvatar || doc.portraitUrl,
    },
    portraitUrl: doc.portraitUrl || doc.guestAvatar,
    description: doc.description,
    duration: doc.duration,
    date: doc.date,
    category: doc.category,
    listenCount: doc.listenCount,
    listenCountNumber: doc.listenCountNumber,
    listenCountSuffix: doc.listenCountSuffix,
    trendingBadge: doc.trendingBadge,
    rankingLabel: doc.rankingLabel,
    audioUrl: doc.audioUrl,
    highlights: doc.highlights || [],
  };
}

/**
 * Single source of truth for all episodes in the application.
 * Defines the comprehensive episode list used across:
 * 1. The Continuous Semicircular Arc Showcase
 * 2. The Hall of Fame "Featured Voices" Grid
 * 3. The Hall of Fame Ranked Tracklist / Episode Rows
 * 4. The Interactive Floating/Modal Episode Popup Overlay
 * 5. The Global Audio Player
 */
export function getEpisodes(): Episode[] {
  const dataset = getCMSDataset();
  if (dataset.carouselEpisodes && dataset.carouselEpisodes.length > 0) {
    return dataset.carouselEpisodes.map(mapCmsDocToEpisode);
  }
  return FALLBACK_EPISODES;
}

const FALLBACK_EPISODES: Episode[] = [
  {
    id: 'ep-042',
    number: 'EP. 042',
    rankPosition: 1,
    title: 'From $0 to $30M: The Unspoken Toll of Hypergrowth',
    guest: {
      name: 'Maya Lin',
      role: 'Founder & CEO, Lumina Craft',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    },
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
    highlights: ['The 3 a.m. panic moments', 'Hiring executives who are smarter than you', 'Why speed is often a trap'],
  },
  {
    id: 'ep-041',
    number: 'EP. 041',
    rankPosition: 2,
    title: 'Failing in Public: Rebuilding Confidence After a Shut Down',
    guest: {
      name: 'Marcus Vance',
      role: 'Serial Founder & Author',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    },
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
    highlights: ['The post-mortem call with your lead investor', 'Detangling self-worth from valuation', 'The rebirth roadmap'],
  },
  {
    id: 'ep-040',
    number: 'EP. 040',
    rankPosition: 3,
    title: 'The Discipline of Intuition: How Gut Instincts Win',
    guest: {
      name: 'Elena Rostova',
      role: 'Creative Director & Brand Strategist',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
    },
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
    highlights: ['Developing pattern recognition', 'When data lies to you', 'Building brand equity with bold conviction'],
  },
  {
    id: 'ep-039',
    number: 'EP. 039',
    rankPosition: 4,
    title: 'Radical Candor & Co-Founder Marriages',
    guest: {
      name: 'David & Priya Chen',
      role: 'Co-Founders, Synergize Health',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=800&auto=format&fit=crop',
    },
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
    highlights: ['The "disagree and commit" rule in action', 'Weekly emotional retrospectives', 'Separating friendship from fiduciary duty'],
  },
  {
    id: 'ep-038',
    number: 'EP. 038',
    rankPosition: 5,
    title: 'Bootstrapping to an 8-Figure Exit with Zero Outside VC',
    guest: {
      name: 'Zack Thorne',
      role: 'Founder & CEO, Apex Grid',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
    },
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
    highlights: ['The bootstrap mental model for asymmetric upside', 'Pricing for enterprise clients with confidence', 'Saying no to tempting term sheets'],
  },
];

export const EPISODES: Episode[] = getEpisodes();
