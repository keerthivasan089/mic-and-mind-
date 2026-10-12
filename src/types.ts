export interface Episode {
  id: string;
  number: string;
  title: string;
  guest: {
    name: string;
    role: string;
    avatar?: string;
  };
  description: string;
  duration: string;
  date: string;
  category: 'Entrepreneurship' | 'Growth & Mindset' | 'Failure & Recovery' | 'Connection';
  audioUrl?: string;
  highlights?: string[];
  // Rich episode metadata for Hall of Fame & unified data-driven rendering
  portraitUrl?: string;
  listenCount?: string;
  listenCountNumber?: number;
  listenCountSuffix?: string;
  trendingBadge?: string;
  rankingLabel?: string;
  rankPosition?: number;
}

export interface ThemeItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badgeEmoji: string;
  colorAccent?: string;
}

export interface PlatformItem {
  id: string;
  name: string;
  tagline: string;
  url: string;
  iconName: string;
  badge?: string;
  metric?: string;
  accentColor?: string;
  actionText?: string;
}

export interface YouTubeVideoItem {
  id: string;
  episodeNumber: string;
  title: string;
  guestName: string;
  guestRole: string;
  avatarUrl: string;
  youtubeId: string;
  duration: string;
  views: string;
  badge: string;
  accentColor: string; // e.g. '#E11D48', '#2563EB', '#059669', '#EA580C', '#9333EA'
  category: string;
  description: string;
  keyTakeaways: string[];
}

export interface GuestApplicationData {
  fullName: string;
  email: string;
  companyOrRole: string;
  socialLink: string;
  storyTopic: string;
  pitchSummary: string;
  agreeToFormat: boolean;
}
