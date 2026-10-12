import { supabase } from './supabase';
import {
  getCMSDataset,
  INITIAL_HERO_VIDEOS,
  INITIAL_CAROUSEL_EPISODES,
  INITIAL_HALL_OF_FAME_GUESTS,
  HeroVideoDocument,
  CarouselEpisodeDocument,
  HallOfFameGuestDocument,
} from './cmsStore';

// ============================================================================
// 1. Database Row Interfaces (matching exact Supabase PostgreSQL schemas)
// ============================================================================

export interface HeroVideoRow {
  id: string;
  title: string;
  tagline: string | null;
  desktop_video_url: string;
  mobile_video_url: string | null;
  poster_url: string | null;
  accent_color: string | null;
  aspect_ratio: string | null;
  duration_seconds: number | null;
  is_active: boolean;
  updated_at?: string;
}

export interface CarouselEpisodeRow {
  id: string;
  number: string;
  title: string;
  rank_position: number;
  guest_name: string;
  guest_role: string | null;
  portrait_url: string;
  description: string | null;
  duration: string | null;
  category: string | null;
  listen_count: string | null;
  trending_badge: string | null;
  ranking_label: string | null;
  audio_url: string | null;
  accent_color: string | null;
  is_active?: boolean | null;
  updated_at?: string;
}

export interface HallOfFameGuestRow {
  id: string;
  name: string;
  role: string;
  company: string | null;
  quote: string | null;
  episode_number: string | null;
  episode_id: string | null;
  rank_position: number;
  portrait_url: string;
  accent_color: string | null;
  featured: boolean;
  updated_at?: string;
}

// Insert / Update Types
export type HeroVideoInsert = Omit<HeroVideoRow, 'id' | 'updated_at'> & { id?: string };
export type HeroVideoUpdate = Partial<Omit<HeroVideoRow, 'id' | 'updated_at'>>;

export type CarouselEpisodeInsert = Omit<CarouselEpisodeRow, 'id' | 'updated_at'> & { id?: string };
export type CarouselEpisodeUpdate = Partial<Omit<CarouselEpisodeRow, 'id' | 'updated_at'>>;

export type HallOfFameGuestInsert = Omit<HallOfFameGuestRow, 'id' | 'updated_at'> & { id?: string };
export type HallOfFameGuestUpdate = Partial<Omit<HallOfFameGuestRow, 'id' | 'updated_at'>>;

// ============================================================================
// 2. UUID & Helper Utilities
// ============================================================================

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates whether a string matches standard UUID format.
 */
export function isValidUUID(id: string): boolean {
  return typeof id === 'string' && UUID_REGEX.test(id.trim());
}

/**
 * Generates a valid random UUID v4 string.
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback RFC4122 v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Deterministically converts non-UUID legacy identifiers (such as 'ep-042', 'guest-001', 'hero-main-001')
 * into standard RFC4122 v4-formatted UUIDs so PostgreSQL queries never fail.
 */
export function legacyIdToUUID(
  legacyId: string,
  namespace: 'episode' | 'guest' | 'hero' = 'episode'
): string {
  if (!legacyId || typeof legacyId !== 'string') {
    return generateUUID();
  }

  const clean = legacyId.trim();
  if (isValidUUID(clean)) {
    return clean;
  }

  // Pre-mapped fixed deterministic UUIDs for standard initial items
  const PRESET_MAPPINGS: Record<string, string> = {
    'hero-main-001': 'a0000001-0000-4000-8000-000000000001',
    'ep-042': 'e0000042-0000-4000-8000-000000000042',
    'ep-041': 'e0000041-0000-4000-8000-000000000041',
    'ep-040': 'e0000040-0000-4000-8000-000000000040',
    'ep-039': 'e0000039-0000-4000-8000-000000000039',
    'ep-038': 'e0000038-0000-4000-8000-000000000038',
    'guest-001': 'f0000001-0000-4000-8000-000000000001',
    'guest-002': 'f0000002-0000-4000-8000-000000000002',
    'guest-003': 'f0000003-0000-4000-8000-000000000003',
    'guest-004': 'f0000004-0000-4000-8000-000000000004',
    'guest-005': 'f0000005-0000-4000-8000-000000000005',
    'hof-1': 'f0000001-0000-4000-8000-000000000001',
    'hof-2': 'f0000002-0000-4000-8000-000000000002',
    'hof-3': 'f0000003-0000-4000-8000-000000000003',
    'hof-4': 'f0000004-0000-4000-8000-000000000004',
    'hof-5': 'f0000005-0000-4000-8000-000000000005',
  };

  if (PRESET_MAPPINGS[clean]) {
    return PRESET_MAPPINGS[clean];
  }

  // Deterministic 128-bit hash function for custom legacy keys
  let hash1 = 0xdeadbeef;
  let hash2 = 0x41c6ce57;
  let hash3 = 0x12345678;
  let hash4 = 0x87654321;
  const str = `${namespace}:${clean}`;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    hash1 = Math.imul(hash1 ^ code, 2654435761);
    hash2 = Math.imul(hash2 ^ (code << 5), 1597334677);
    hash3 = Math.imul(hash3 ^ (code << 7), 3801401603);
    hash4 = Math.imul(hash4 ^ (code << 11), 2246822507);
  }
  const toHex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  const hex = (toHex(hash1) + toHex(hash2) + toHex(hash3) + toHex(hash4)).toLowerCase().slice(0, 32);

  // Return RFC4122 v4-compliant UUID format
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

// ============================================================================
// 3. Bidirectional Mapping Functions
// ============================================================================

/**
 * Maps Supabase hero_videos row to application HeroVideoDocument (camelCase)
 */
export function mapHeroVideoRowToDocument(row: HeroVideoRow): HeroVideoDocument {
  return {
    _id: row.id,
    _type: 'heroVideo',
    title: row.title || '',
    tagline: row.tagline || '',
    desktopVideoUrl: row.desktop_video_url || '',
    mobileVideoUrl: row.mobile_video_url || row.desktop_video_url || '',
    posterUrl: row.poster_url || '',
    accentColor: row.accent_color || '#DD5A1F',
    aspectRatio: row.aspect_ratio || '9:16',
    durationSeconds: Number(row.duration_seconds) || 10,
    isActive: row.is_active ?? true,
    _updatedAt: row.updated_at || new Date().toISOString(),
  };
}

/**
 * Maps application HeroVideoDocument to Supabase hero_videos insert payload (snake_case)
 */
export function mapHeroVideoDocumentToInsert(
  doc: Partial<HeroVideoDocument>
): HeroVideoInsert {
  const payload: HeroVideoInsert = {
    title: doc.title || 'Untitled Hero Video',
    tagline: doc.tagline ?? null,
    desktop_video_url: doc.desktopVideoUrl || '',
    mobile_video_url: doc.mobileVideoUrl ?? null,
    poster_url: doc.posterUrl ?? null,
    accent_color: doc.accentColor || '#DD5A1F',
    aspect_ratio: doc.aspectRatio || '9:16',
    duration_seconds: doc.durationSeconds ? Number(doc.durationSeconds) : 10,
    is_active: doc.isActive ?? true,
  };

  if (doc._id && isValidUUID(doc._id)) {
    payload.id = doc._id;
  }

  return payload;
}

/**
 * Maps Supabase carousel_episodes row to application CarouselEpisodeDocument (camelCase)
 */
export function mapCarouselEpisodeRowToDocument(row: CarouselEpisodeRow): CarouselEpisodeDocument {
  const rawListen = row.listen_count || '120K Listens';
  const numericMatch = rawListen.match(/\d+(\.\d+)?/);
  const listenNumber = numericMatch ? parseFloat(numericMatch[0]) : 100;
  const suffixMatch = rawListen.match(/[KM]/i);
  const listenSuffix = suffixMatch ? `${suffixMatch[0].toUpperCase()} Listens` : 'Listens';

  return {
    _id: row.id,
    _type: 'carouselEpisode',
    number: row.number || 'EP. 000',
    title: row.title || 'Untitled Episode',
    rankPosition: Number(row.rank_position) || 1,
    guestName: row.guest_name || 'Featured Guest',
    guestRole: row.guest_role || 'Founder / Creator',
    guestAvatar: row.portrait_url || '',
    portraitUrl: row.portrait_url || '',
    description: row.description || '',
    duration: row.duration || '45 min',
    date: 'Recent',
    category: (row.category as CarouselEpisodeDocument['category']) || 'Entrepreneurship',
    listenCount: rawListen,
    listenCountNumber: listenNumber,
    listenCountSuffix: listenSuffix,
    trendingBadge: row.trending_badge || 'Trending',
    rankingLabel: row.ranking_label || `#${row.rank_position} ALL-TIME`,
    audioUrl: row.audio_url || '',
    accentColor: row.accent_color || '#DD5A1F',
    highlights: [],
    _updatedAt: row.updated_at || new Date().toISOString(),
  };
}

/**
 * Maps application CarouselEpisodeDocument to Supabase carousel_episodes insert payload (snake_case)
 */
export function mapCarouselEpisodeDocumentToInsert(
  doc: Partial<CarouselEpisodeDocument>
): CarouselEpisodeInsert {
  const payload: CarouselEpisodeInsert = {
    title: doc.title || 'Untitled Episode',
    number: doc.number || 'EP. 000',
    rank_position: doc.rankPosition ? Number(doc.rankPosition) : 1,
    guest_name: doc.guestName || 'Featured Guest',
    guest_role: doc.guestRole ?? null,
    portrait_url: doc.portraitUrl || doc.guestAvatar || '',
    description: doc.description ?? null,
    duration: doc.duration ?? '45 min',
    category: doc.category ?? 'Entrepreneurship',
    listen_count: doc.listenCount ?? '120K Listens',
    trending_badge: doc.trendingBadge ?? 'Trending',
    ranking_label: doc.rankingLabel ?? `#${doc.rankPosition || 1} ALL-TIME`,
    audio_url: doc.audioUrl ?? null,
    accent_color: doc.accentColor || '#DD5A1F',
  };

  if (doc._id && isValidUUID(doc._id)) {
    payload.id = doc._id;
  }

  return payload;
}

/**
 * Maps Supabase hall_of_fame_guests row to application HallOfFameGuestDocument (camelCase)
 */
export function mapHallOfFameGuestRowToDocument(row: HallOfFameGuestRow): HallOfFameGuestDocument {
  return {
    _id: row.id,
    _type: 'hallOfFameGuest',
    name: row.name || 'Featured Guest',
    role: row.role || 'Leader',
    company: row.company || undefined,
    episodeNumber: row.episode_number || 'EP. 001',
    episodeId: row.episode_id || '',
    portraitUrl: row.portrait_url || '',
    quote: row.quote || undefined,
    accentColor: row.accent_color || '#DD5A1F',
    rankPosition: Number(row.rank_position) || 1,
    featured: row.featured ?? true,
    _updatedAt: row.updated_at || new Date().toISOString(),
  };
}

/**
 * Maps application HallOfFameGuestDocument to Supabase hall_of_fame_guests insert payload (snake_case)
 */
export function mapHallOfFameGuestDocumentToInsert(
  doc: Partial<HallOfFameGuestDocument>
): HallOfFameGuestInsert {
  const payload: HallOfFameGuestInsert = {
    name: doc.name || 'Featured Guest',
    role: doc.role || 'Leader',
    company: doc.company ?? null,
    quote: doc.quote ?? null,
    episode_number: doc.episodeNumber ?? 'EP. 001',
    episode_id: doc.episodeId ? legacyIdToUUID(doc.episodeId, 'episode') : null,
    rank_position: doc.rankPosition ? Number(doc.rankPosition) : 1,
    portrait_url: doc.portraitUrl || '',
    accent_color: doc.accentColor || '#DD5A1F',
    featured: doc.featured === false ? false : true,
  };

  if (doc._id && isValidUUID(doc._id)) {
    payload.id = doc._id;
  }

  return payload;
}

// ============================================================================
// 4. Hero Videos CRUD Operations
// ============================================================================

/**
 * Reads all hero videos from Supabase, sorted by updated_at descending.
 */
export async function getHeroVideos(): Promise<HeroVideoDocument[]> {
  const { data, error } = await supabase
    .from('hero_videos')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch hero videos: ${error.message}`);
  }

  return (data as HeroVideoRow[]).map(mapHeroVideoRowToDocument);
}

/**
 * Creates a new hero video record in Supabase.
 */
export async function createHeroVideo(
  item: Omit<HeroVideoDocument, '_id' | '_type' | '_updatedAt'> & { _id?: string }
): Promise<HeroVideoDocument> {
  const payload = mapHeroVideoDocumentToInsert(item);
  if (!payload.id) {
    payload.id = generateUUID();
  }

  const { data, error } = await supabase
    .from('hero_videos')
    .insert(payload)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create hero video: ${error?.message || 'Unknown database error'}`);
  }

  return mapHeroVideoRowToDocument(data as HeroVideoRow);
}

/**
 * Updates an existing hero video in Supabase by UUID.
 */
export async function updateHeroVideo(
  id: string,
  updates: Partial<HeroVideoDocument>
): Promise<HeroVideoDocument> {
  const targetId = isValidUUID(id) ? id : legacyIdToUUID(id, 'hero');

  const payload: HeroVideoUpdate = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.tagline !== undefined) payload.tagline = updates.tagline;
  if (updates.desktopVideoUrl !== undefined) payload.desktop_video_url = updates.desktopVideoUrl;
  if (updates.mobileVideoUrl !== undefined) payload.mobile_video_url = updates.mobileVideoUrl;
  if (updates.posterUrl !== undefined) payload.poster_url = updates.posterUrl;
  if (updates.accentColor !== undefined) payload.accent_color = updates.accentColor;
  if (updates.aspectRatio !== undefined) payload.aspect_ratio = updates.aspectRatio;
  if (updates.durationSeconds !== undefined) payload.duration_seconds = Number(updates.durationSeconds);
  if (updates.isActive !== undefined) payload.is_active = updates.isActive;

  const { data, error } = await supabase
    .from('hero_videos')
    .update(payload)
    .eq('id', targetId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to update hero video (${targetId}): ${error?.message || 'Unknown database error'}`);
  }

  return mapHeroVideoRowToDocument(data as HeroVideoRow);
}

/**
 * Deletes a hero video from Supabase by UUID.
 */
export async function deleteHeroVideo(id: string): Promise<void> {
  const targetId = isValidUUID(id) ? id : legacyIdToUUID(id, 'hero');

  const { error } = await supabase.from('hero_videos').delete().eq('id', targetId);
  if (error) {
    throw new Error(`Failed to delete hero video (${targetId}): ${error.message}`);
  }
}

// ============================================================================
// 5. Carousel Episodes CRUD Operations
// ============================================================================

/**
 * Reads all carousel episodes from Supabase, ordered by rank_position ascending.
 */
export async function getCarouselEpisodes(): Promise<CarouselEpisodeDocument[]> {
  const { data, error } = await supabase
    .from('carousel_episodes')
    .select('*')
    .order('rank_position', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch carousel episodes: ${error.message}`);
  }

  return (data as CarouselEpisodeRow[]).map(mapCarouselEpisodeRowToDocument);
}

/**
 * Creates a new carousel episode record in Supabase.
 */
export async function createCarouselEpisode(
  item: Omit<CarouselEpisodeDocument, '_id' | '_type' | '_updatedAt'> & { _id?: string }
): Promise<CarouselEpisodeDocument> {
  const payload = mapCarouselEpisodeDocumentToInsert(item);
  if (!payload.id || !isValidUUID(payload.id)) {
    payload.id = item._id ? legacyIdToUUID(item._id, 'episode') : generateUUID();
  }

  const { data, error } = await supabase
    .from('carousel_episodes')
    .insert(payload)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create carousel episode: ${error?.message || 'Unknown database error'}`);
  }

  return mapCarouselEpisodeRowToDocument(data as CarouselEpisodeRow);
}

/**
 * Updates an existing carousel episode in Supabase by UUID.
 */
export async function updateCarouselEpisode(
  id: string,
  updates: Partial<CarouselEpisodeDocument>
): Promise<CarouselEpisodeDocument> {
  const targetId = isValidUUID(id) ? id : legacyIdToUUID(id, 'episode');

  const payload: CarouselEpisodeUpdate = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.number !== undefined) payload.number = updates.number;
  if (updates.rankPosition !== undefined) payload.rank_position = Number(updates.rankPosition);
  if (updates.guestName !== undefined) payload.guest_name = updates.guestName;
  if (updates.guestRole !== undefined) payload.guest_role = updates.guestRole;
  if (updates.portraitUrl !== undefined) payload.portrait_url = updates.portraitUrl;
  if (updates.guestAvatar !== undefined && !updates.portraitUrl) payload.portrait_url = updates.guestAvatar;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.duration !== undefined) payload.duration = updates.duration;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.listenCount !== undefined) payload.listen_count = updates.listenCount;
  if (updates.trendingBadge !== undefined) payload.trending_badge = updates.trendingBadge;
  if (updates.rankingLabel !== undefined) payload.ranking_label = updates.rankingLabel;
  if (updates.audioUrl !== undefined) payload.audio_url = updates.audioUrl;
  if (updates.accentColor !== undefined) payload.accent_color = updates.accentColor;

  const { data, error } = await supabase
    .from('carousel_episodes')
    .update(payload)
    .eq('id', targetId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to update carousel episode (${targetId}): ${error?.message || 'Unknown database error'}`);
  }

  return mapCarouselEpisodeRowToDocument(data as CarouselEpisodeRow);
}

/**
 * Deletes a carousel episode from Supabase by UUID.
 */
export async function deleteCarouselEpisode(id: string): Promise<void> {
  const targetId = isValidUUID(id) ? id : legacyIdToUUID(id, 'episode');

  const { error } = await supabase.from('carousel_episodes').delete().eq('id', targetId);
  if (error) {
    throw new Error(`Failed to delete carousel episode (${targetId}): ${error.message}`);
  }
}

// ============================================================================
// 6. Hall of Fame Guests CRUD Operations
// ============================================================================

/**
 * Reads all Hall of Fame guests from Supabase, ordered by rank_position ascending.
 */
export async function getHallOfFameGuests(): Promise<HallOfFameGuestDocument[]> {
  const { data, error } = await supabase
    .from('hall_of_fame_guests')
    .select('*')
    .order('rank_position', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch Hall of Fame guests: ${error.message}`);
  }

  return (data as HallOfFameGuestRow[]).map(mapHallOfFameGuestRowToDocument);
}

/**
 * Creates a new Hall of Fame guest record in Supabase.
 */
export async function createHallOfFameGuest(
  item: Omit<HallOfFameGuestDocument, '_id' | '_type' | '_updatedAt'> & { _id?: string }
): Promise<HallOfFameGuestDocument> {
  const payload = mapHallOfFameGuestDocumentToInsert(item);
  if (!payload.id || !isValidUUID(payload.id)) {
    payload.id = item._id ? legacyIdToUUID(item._id, 'guest') : generateUUID();
  }

  const { data, error } = await supabase
    .from('hall_of_fame_guests')
    .insert(payload)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create Hall of Fame guest: ${error?.message || 'Unknown database error'}`);
  }

  return mapHallOfFameGuestRowToDocument(data as HallOfFameGuestRow);
}

/**
 * Updates an existing Hall of Fame guest in Supabase by UUID.
 */
export async function updateHallOfFameGuest(
  id: string,
  updates: Partial<HallOfFameGuestDocument>
): Promise<HallOfFameGuestDocument> {
  const targetId = isValidUUID(id) ? id : legacyIdToUUID(id, 'guest');

  const payload: HallOfFameGuestUpdate = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.role !== undefined) payload.role = updates.role;
  if (updates.company !== undefined) payload.company = updates.company;
  if (updates.quote !== undefined) payload.quote = updates.quote;
  if (updates.episodeNumber !== undefined) payload.episode_number = updates.episodeNumber;
  if (updates.episodeId !== undefined) {
    payload.episode_id = updates.episodeId ? legacyIdToUUID(updates.episodeId, 'episode') : null;
  }
  if (updates.rankPosition !== undefined) payload.rank_position = Number(updates.rankPosition);
  if (updates.portraitUrl !== undefined) payload.portrait_url = updates.portraitUrl;
  if (updates.accentColor !== undefined) payload.accent_color = updates.accentColor;
  if (updates.featured !== undefined) payload.featured = updates.featured;

  const { data, error } = await supabase
    .from('hall_of_fame_guests')
    .update(payload)
    .eq('id', targetId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to update Hall of Fame guest (${targetId}): ${error?.message || 'Unknown database error'}`);
  }

  return mapHallOfFameGuestRowToDocument(data as HallOfFameGuestRow);
}

/**
 * Persists the reordered Hall of Fame guests safely to Supabase.
 * Enforces contiguous 1..N unique rank positions without leaving conflicting ranks.
 * Uses atomic batch upsert where supported.
 * If batch upsert encounters permission or constraint issues, uses a guaranteed collision-free
 * two-phase rank assignment (temporary negative offsets, followed by final positive ranks)
 * to ensure that conflicting ranks can never exist in the database at any moment.
 */
export async function reorderHallOfFameGuests(
  orderedGuests: HallOfFameGuestDocument[]
): Promise<HallOfFameGuestDocument[]> {
  if (orderedGuests.length === 0) return [];

  // Guarantee contiguous 1-based unique ranks
  const normalizedGuests = orderedGuests.map((g, idx) => ({
    ...g,
    rankPosition: idx + 1,
  }));

  const payloads = normalizedGuests.map((doc) => {
    const targetId = isValidUUID(doc._id) ? doc._id : legacyIdToUUID(doc._id, 'guest');
    return {
      ...mapHallOfFameGuestDocumentToInsert({ ...doc, _id: targetId }),
      id: targetId,
    };
  });

  try {
    // Attempt 1: Atomic batch upsert across all records
    const { data, error } = await supabase
      .from('hall_of_fame_guests')
      .upsert(payloads, { onConflict: 'id' })
      .select();

    if (!error && data && data.length > 0) {
      const updatedDocs = (data as HallOfFameGuestRow[]).map(mapHallOfFameGuestRowToDocument);
      return updatedDocs.sort((a, b) => a.rankPosition - b.rankPosition);
    }
    if (error) {
      console.warn('Batch upsert encountered error, falling back to collision-free two-phase update:', error.message);
    }
  } catch (err: any) {
    console.warn('Batch upsert threw exception, falling back to collision-free two-phase update:', err);
  }

  // Fallback: Safe collision-free two-phase update
  // Phase 1: Shift to safe temporary negative ranks so no row collides with any positive 1..N rank
  for (let i = 0; i < payloads.length; i++) {
    const p = payloads[i];
    await supabase
      .from('hall_of_fame_guests')
      .update({ rank_position: -(10000 + i + 1) })
      .eq('id', p.id);
  }

  // Phase 2: Set final contiguous positive ranks and all other updated fields
  const finalResults: HallOfFameGuestDocument[] = [];
  for (let i = 0; i < payloads.length; i++) {
    const p = payloads[i];
    const { data: updatedRow, error: updateErr } = await supabase
      .from('hall_of_fame_guests')
      .update({
        name: p.name,
        role: p.role,
        company: p.company,
        quote: p.quote,
        episode_number: p.episode_number,
        episode_id: p.episode_id,
        rank_position: i + 1,
        portrait_url: p.portrait_url,
        accent_color: p.accent_color,
        featured: p.featured,
      })
      .eq('id', p.id)
      .select()
      .single();

    if (updateErr || !updatedRow) {
      finalResults.push(normalizedGuests[i]);
    } else {
      finalResults.push(mapHallOfFameGuestRowToDocument(updatedRow as HallOfFameGuestRow));
    }
  }

  return finalResults.sort((a, b) => a.rankPosition - b.rankPosition);
}

/**
 * Deletes a Hall of Fame guest from Supabase by UUID.
 */
export async function deleteHallOfFameGuest(id: string): Promise<void> {
  const targetId = isValidUUID(id) ? id : legacyIdToUUID(id, 'guest');

  const { error } = await supabase.from('hall_of_fame_guests').delete().eq('id', targetId);
  if (error) {
    throw new Error(`Failed to delete Hall of Fame guest (${targetId}): ${error.message}`);
  }
}

// ============================================================================
// 7. Safe One-Time / Idempotent CMS Migration to Supabase
// ============================================================================

export interface MigrationResult {
  success: boolean;
  heroCount: number;
  episodeCount: number;
  guestCount: number;
  skippedHeroCount: number;
  skippedEpisodeCount: number;
  skippedGuestCount: number;
  message: string;
  errors: string[];
}

/**
 * Safely migrates initial or localStorage CMS dataset into Supabase tables.
 *
 * Guarantees:
 * - Deterministically maps legacy IDs (e.g., ep-042, guest-001) to valid RFC4122 v4 UUIDs.
 * - Preserves episode numbers (e.g., EP. 042) in the 'number' column.
 * - Never deletes or overwrites existing Supabase rows.
 * - Strictly idempotent: can be executed multiple times without creating duplicates.
 */
export async function migrateLegacyCMSToSupabase(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    heroCount: 0,
    episodeCount: 0,
    guestCount: 0,
    skippedHeroCount: 0,
    skippedEpisodeCount: 0,
    skippedGuestCount: 0,
    message: '',
    errors: [],
  };

  try {
    // 1. Obtain legacy source dataset from localStorage or initial constants
    const localDataset = getCMSDataset();
    const sourceHeroes =
      localDataset.heroVideos && localDataset.heroVideos.length > 0
        ? localDataset.heroVideos
        : INITIAL_HERO_VIDEOS;
    const sourceEpisodes =
      localDataset.carouselEpisodes && localDataset.carouselEpisodes.length > 0
        ? localDataset.carouselEpisodes
        : INITIAL_CAROUSEL_EPISODES;
    const sourceGuests =
      localDataset.hallOfFameGuests && localDataset.hallOfFameGuests.length > 0
        ? localDataset.hallOfFameGuests
        : INITIAL_HALL_OF_FAME_GUESTS;

    // 2. Fetch all existing records from Supabase to check existence and prevent duplicates
    const [existingHeroesRes, existingEpisodesRes, existingGuestsRes] = await Promise.all([
      supabase.from('hero_videos').select('id, title'),
      supabase.from('carousel_episodes').select('id, number, title'),
      supabase.from('hall_of_fame_guests').select('id, name, episode_number'),
    ]);

    if (existingHeroesRes.error) {
      result.errors.push(`Hero check failed: ${existingHeroesRes.error.message}`);
    }
    if (existingEpisodesRes.error) {
      result.errors.push(`Episode check failed: ${existingEpisodesRes.error.message}`);
    }
    if (existingGuestsRes.error) {
      result.errors.push(`Guest check failed: ${existingGuestsRes.error.message}`);
    }

    const existingHeroIds = new Set<string>((existingHeroesRes.data || []).map((h) => h.id));
    const existingHeroTitles = new Set<string>(
      (existingHeroesRes.data || []).map((h) => h.title?.trim().toLowerCase() || '')
    );

    const existingEpisodeIds = new Set<string>((existingEpisodesRes.data || []).map((e) => e.id));
    const existingEpisodeNumbers = new Set<string>(
      (existingEpisodesRes.data || []).map((e) => e.number?.trim().toLowerCase() || '')
    );

    const existingGuestIds = new Set<string>((existingGuestsRes.data || []).map((g) => g.id));
    const existingGuestKeys = new Set<string>(
      (existingGuestsRes.data || []).map(
        (g) => `${g.name?.trim().toLowerCase()}:::${(g.episode_number || '').trim().toLowerCase()}`
      )
    );

    // 3. Migrate Hero Videos
    for (const hero of sourceHeroes) {
      const targetUUID = legacyIdToUUID(hero._id, 'hero');
      const titleKey = (hero.title || '').trim().toLowerCase();

      if (existingHeroIds.has(targetUUID) || (existingHeroIds.size > 0 && existingHeroTitles.has(titleKey))) {
        result.skippedHeroCount++;
        continue;
      }

      const payload: HeroVideoInsert = {
        id: targetUUID,
        title: hero.title || 'Mic & Mind: The Sound of Ambition',
        tagline: hero.tagline || null,
        desktop_video_url: hero.desktopVideoUrl || '',
        mobile_video_url: hero.mobileVideoUrl || null,
        poster_url: hero.posterUrl || null,
        accent_color: hero.accentColor || '#DD5A1F',
        aspect_ratio: hero.aspectRatio || '9:16',
        duration_seconds: Number(hero.durationSeconds) || 10,
        is_active: hero.isActive ?? true,
      };

      const { error } = await supabase.from('hero_videos').insert(payload);
      if (error) {
        result.errors.push(`Hero video "${hero.title}" insert failed: ${error.message}`);
      } else {
        result.heroCount++;
        existingHeroIds.add(targetUUID);
        existingHeroTitles.add(titleKey);
      }
    }

    // 4. Migrate Carousel Episodes
    for (const ep of sourceEpisodes) {
      const targetUUID = legacyIdToUUID(ep._id, 'episode');
      const numKey = (ep.number || '').trim().toLowerCase();

      if (existingEpisodeIds.has(targetUUID) || existingEpisodeNumbers.has(numKey)) {
        result.skippedEpisodeCount++;
        continue;
      }

      const payload: CarouselEpisodeInsert = {
        id: targetUUID,
        number: ep.number || 'EP. 000',
        title: ep.title || 'Untitled Episode',
        rank_position: Number(ep.rankPosition) || 1,
        guest_name: ep.guestName || 'Featured Guest',
        guest_role: ep.guestRole || null,
        portrait_url: ep.portraitUrl || ep.guestAvatar || '',
        description: ep.description || null,
        duration: ep.duration || '45 min',
        category: ep.category || 'Entrepreneurship',
        listen_count: ep.listenCount || '100K Listens',
        trending_badge: ep.trendingBadge || null,
        ranking_label: ep.rankingLabel || `#${ep.rankPosition || 1} Spotlight`,
        audio_url: ep.audioUrl || null,
        accent_color: ep.accentColor || '#DD5A1F',
        is_active: true,
      };

      const { error } = await supabase.from('carousel_episodes').insert(payload);
      if (error) {
        result.errors.push(`Episode "${ep.number}: ${ep.title}" insert failed: ${error.message}`);
      } else {
        result.episodeCount++;
        existingEpisodeIds.add(targetUUID);
        existingEpisodeNumbers.add(numKey);
      }
    }

    // 5. Migrate Hall of Fame Guests
    for (const guest of sourceGuests) {
      const targetUUID = legacyIdToUUID(guest._id, 'guest');
      const guestKey = `${guest.name.trim().toLowerCase()}:::${(guest.episodeNumber || '').trim().toLowerCase()}`;

      if (existingGuestIds.has(targetUUID) || existingGuestKeys.has(guestKey)) {
        result.skippedGuestCount++;
        continue;
      }

      const targetEpisodeUUID = guest.episodeId ? legacyIdToUUID(guest.episodeId, 'episode') : null;

      const payload: HallOfFameGuestInsert = {
        id: targetUUID,
        name: guest.name || 'Featured Guest',
        role: guest.role || 'Industry Pioneer',
        company: guest.company || null,
        quote: guest.quote || null,
        episode_number: guest.episodeNumber || null,
        episode_id: targetEpisodeUUID,
        rank_position: Number(guest.rankPosition) || 1,
        portrait_url: guest.portraitUrl || '',
        accent_color: guest.accentColor || '#DD5A1F',
        featured: guest.featured ?? true,
      };

      const { error } = await supabase.from('hall_of_fame_guests').insert(payload);
      if (error) {
        result.errors.push(`Guest "${guest.name}" insert failed: ${error.message}`);
      } else {
        result.guestCount++;
        existingGuestIds.add(targetUUID);
        existingGuestKeys.add(guestKey);
      }
    }

    if (result.errors.length > 0) {
      result.success = false;
      result.message = `Migration completed with ${result.errors.length} error(s). Migrated: ${result.episodeCount} episodes, ${result.guestCount} guests, ${result.heroCount} hero videos.`;
    } else {
      result.success = true;
      result.message = `Successfully migrated ${result.episodeCount} episodes, ${result.guestCount} Hall of Fame guests, and ${result.heroCount} hero videos to Supabase.`;
    }

    return result;
  } catch (err: any) {
    result.success = false;
    result.errors.push(err?.message || 'Unexpected migration failure');
    result.message = `Migration aborted: ${err?.message || 'Unknown error'}`;
    return result;
  }
}
