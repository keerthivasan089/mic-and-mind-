import React, { useState, useEffect } from 'react';
import {
  Mic,
  Video,
  Music,
  Users,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  LogOut,
  Save,
  CheckCircle2,
  Sparkles,
  Search,
  ChevronRight,
  ShieldCheck,
  Globe,
  Clock,
  ArrowLeft,
  Mail,
  Lock,
  Flame,
  Radio,
  Eye,
  Sliders,
  FileDown,
  FileUp,
  RotateCcw,
  AlertTriangle,
  Layers,
  KeyRound,
  UserCheck,
  Play,
  Check,
  X,
  History,
  Database,
  RefreshCw,
} from 'lucide-react';
import {
  CMSDataset,
  HeroVideoDocument,
  CarouselEpisodeDocument,
  HallOfFameGuestDocument,
  saveCMSDataset,
} from '../lib/cmsStore';
import {
  getHeroVideos,
  getCarouselEpisodes,
  getHallOfFameGuests,
  createHeroVideo,
  updateHeroVideo,
  deleteHeroVideo,
  createCarouselEpisode,
  updateCarouselEpisode,
  deleteCarouselEpisode,
  createHallOfFameGuest,
  updateHallOfFameGuest,
  reorderHallOfFameGuests,
  deleteHallOfFameGuest,
  legacyIdToUUID,
  migrateLegacyCMSToSupabase,
  MigrationResult,
} from '../lib/cmsService';
import { supabase } from '../lib/supabase';
import {
  getCurrentAdminUser,
  loginAdmin,
  logoutAdmin,
  requestPasswordReset,
  AdminUser,
} from './adminAuth';
import { ColorPickerField } from './ColorPickerField';
import { ImageUploadField } from './ImageUploadField';
import { AudioUploadField } from './AudioUploadField';
import { VideoUploadField } from './VideoUploadField';

type AdminTab = 'episodes' | 'hero' | 'guests' | 'review' | 'security';

const DEFAULT_HERO_DRAFT: HeroVideoDocument = {
  _id: '',
  _type: 'heroVideo',
  title: 'Mic & Mind: The Sound of Ambition',
  tagline: 'Conversations with the pioneers, outliers, and creatives reshaping our world.',
  desktopVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-recording-studio-sound-engineer-working-41584-large.mp4',
  mobileVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-recording-studio-sound-engineer-working-41584-large.mp4',
  posterUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1200&auto=format&fit=crop',
  accentColor: '#DD5A1F',
  aspectRatio: '9:16',
  durationSeconds: 12,
  isActive: true,
  _updatedAt: new Date().toISOString(),
};

export const AdminPortal: React.FC = () => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Restore and verify active Supabase admin session on mount
  useEffect(() => {
    let isMounted = true;
    getCurrentAdminUser().then((user) => {
      if (isMounted) {
        setCurrentUser(user);
        setIsCheckingSession(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (isMounted) setCurrentUser(null);
      } else if (event === 'SIGNED_IN' && session?.user) {
        const adminUser = await getCurrentAdminUser();
        if (isMounted) setCurrentUser(adminUser);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription?.unsubscribe();
    };
  }, []);

  // Admin Studio state (Supabase-backed)
  const [dataset, setDataset] = useState<CMSDataset>({
    heroVideos: [],
    carouselEpisodes: [],
    hallOfFameGuests: [],
  });
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('episodes');
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>('');
  const [selectedGuestId, setSelectedGuestId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isPublishing, setIsPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAddFromEpisodesModal, setShowAddFromEpisodesModal] = useState(false);
  const [addEpisodeSearchQuery, setAddEpisodeSearchQuery] = useState('');
  const [selectedEpisodeInModal, setSelectedEpisodeInModal] = useState<CarouselEpisodeDocument | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'relink'>('create');

  // Drafts for active editing
  const [episodeDraft, setEpisodeDraft] = useState<CarouselEpisodeDocument | null>(null);
  const [heroDraft, setHeroDraft] = useState<HeroVideoDocument>(DEFAULT_HERO_DRAFT);
  const [guestDraft, setGuestDraft] = useState<HallOfFameGuestDocument | null>(null);

  // New highlight input helper
  const [newHighlightText, setNewHighlightText] = useState('');

  // Primary Supabase Data Fetcher
  const loadSupabaseData = async (triggerMigrationIfEmpty = true) => {
    setIsLoadingData(true);
    setDataError(null);
    try {
      let [heroVideos, carouselEpisodes, hallOfFameGuests] = await Promise.all([
        getHeroVideos(),
        getCarouselEpisodes(),
        getHallOfFameGuests(),
      ]);

      // If Supabase database has 0 episodes or guests, execute safe one-time idempotent migration
      if (triggerMigrationIfEmpty && carouselEpisodes.length === 0) {
        console.log('No episodes found in Supabase. Executing safe one-time CMS data migration...');
        try {
          const migrationRes = await migrateLegacyCMSToSupabase();
          if (migrationRes.success && (migrationRes.episodeCount > 0 || migrationRes.guestCount > 0)) {
            showToast(`Migrated ${migrationRes.episodeCount} episodes & ${migrationRes.guestCount} guests to Supabase`);
          }
          // Re-fetch all freshly migrated Supabase records
          [heroVideos, carouselEpisodes, hallOfFameGuests] = await Promise.all([
            getHeroVideos(),
            getCarouselEpisodes(),
            getHallOfFameGuests(),
          ]);
        } catch (migErr: any) {
          console.warn('Auto-migration attempt encountered error:', migErr);
        }
      }

      // Sort hall of fame guests and heal any duplicate or non-contiguous ranks
      const sortedGuests = [...hallOfFameGuests].sort(
        (a, b) => (Number(a.rankPosition) || 0) - (Number(b.rankPosition) || 0)
      );
      const isContiguousWithoutDuplicates =
        sortedGuests.length === 0 ||
        sortedGuests.every((g, idx) => Number(g.rankPosition) === idx + 1);

      if (!isContiguousWithoutDuplicates && sortedGuests.length > 0) {
        console.log('Sanitizing Hall of Fame ranks in Supabase to guarantee contiguous 1..N order...');
        try {
          hallOfFameGuests = await reorderHallOfFameGuests(sortedGuests);
        } catch (healErr) {
          console.warn('Failed to sanitize Hall of Fame ranks in Supabase:', healErr);
          hallOfFameGuests = sortedGuests.map((g, idx) => ({ ...g, rankPosition: idx + 1 }));
        }
      } else {
        hallOfFameGuests = sortedGuests;
      }

      const nextDataset: CMSDataset = {
        heroVideos,
        carouselEpisodes,
        hallOfFameGuests,
        lastSyncedAt: new Date().toISOString(),
      };
      setDataset(nextDataset);
      saveCMSDataset(nextDataset);

      if (carouselEpisodes.length > 0) {
        setSelectedEpisodeId(carouselEpisodes[0]._id);
        setEpisodeDraft({ ...carouselEpisodes[0] });
      } else {
        setSelectedEpisodeId('');
        setEpisodeDraft(null);
      }

      if (hallOfFameGuests.length > 0) {
        setSelectedGuestId(hallOfFameGuests[0]._id);
        setGuestDraft({ ...hallOfFameGuests[0] });
      } else {
        setSelectedGuestId('');
        setGuestDraft(null);
      }

      if (heroVideos.length > 0) {
        setHeroDraft({ ...heroVideos[0] });
      } else {
        setHeroDraft(DEFAULT_HERO_DRAFT);
      }
    } catch (err: any) {
      console.error('Failed to load CMS records from Supabase:', err);
      setDataError(err?.message || 'Failed to fetch CMS records from Supabase database.');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Trigger Supabase data fetch upon valid authenticated session
  useEffect(() => {
    if (currentUser) {
      loadSupabaseData();
    }
  }, [currentUser]);

  // Sync active draft when selection changes
  useEffect(() => {
    if (!selectedEpisodeId) return;
    const foundEp = dataset.carouselEpisodes.find((ep) => ep._id === selectedEpisodeId);
    if (foundEp) {
      setEpisodeDraft({ ...foundEp });
    }
  }, [selectedEpisodeId, dataset.carouselEpisodes]);

  useEffect(() => {
    if (!selectedGuestId) return;
    const foundGuest = dataset.hallOfFameGuests.find((g) => g._id === selectedGuestId);
    if (foundGuest) {
      setGuestDraft({ ...foundGuest });
    }
  }, [selectedGuestId, dataset.hallOfFameGuests]);

  useEffect(() => {
    if (dataset.heroVideos.length > 0) {
      setHeroDraft({ ...dataset.heroVideos[0] });
    }
  }, [dataset.heroVideos]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Auth Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);

    try {
      const res = await loginAdmin(emailInput, passwordInput);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        showToast(`Welcome back, ${res.user.name}`);
      } else {
        setAuthError(res.error || 'Invalid credentials or unauthorized account.');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setCurrentUser(null);
    showToast('Logged out of Admin Portal');
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setAuthError('');
    const res = await requestPasswordReset(resetEmail);
    if (res.success) {
      setResetSuccess(true);
      setTimeout(() => {
        setShowPasswordReset(false);
        setResetSuccess(false);
        showToast('Password reset link sent to your email.');
      }, 2500);
    } else {
      setAuthError(res.error || 'Failed to send password reset email.');
    }
  };

  // Content Handlers (Connected to Supabase via cmsService.ts)
  const handleSaveEpisode = async () => {
    if (!episodeDraft) return;
    setIsPublishing(true);
    try {
      let saved: CarouselEpisodeDocument;
      if (episodeDraft._id && dataset.carouselEpisodes.some((ep) => ep._id === episodeDraft._id)) {
        saved = await updateCarouselEpisode(episodeDraft._id, episodeDraft);
      } else {
        saved = await createCarouselEpisode(episodeDraft);
      }

      const updated = dataset.carouselEpisodes.map((ep) =>
        ep._id === (episodeDraft._id || saved._id) ? saved : ep
      );
      const nextList = dataset.carouselEpisodes.some((ep) => ep._id === saved._id)
        ? updated
        : [saved, ...dataset.carouselEpisodes];

      const nextDataset: CMSDataset = {
        ...dataset,
        carouselEpisodes: nextList,
        lastSyncedAt: new Date().toISOString(),
      };
      setDataset(nextDataset);
      saveCMSDataset(nextDataset);
      setEpisodeDraft(saved);
      setSelectedEpisodeId(saved._id);
      setHasPendingChanges(false);
      showToast(`Saved and published ${saved.number}: ${saved.title}`);
    } catch (err: any) {
      alert(`Failed to save episode to Supabase: ${err?.message || err}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveHero = async () => {
    setIsPublishing(true);
    try {
      let saved: HeroVideoDocument;
      if (heroDraft._id && dataset.heroVideos.some((h) => h._id === heroDraft._id)) {
        saved = await updateHeroVideo(heroDraft._id, heroDraft);
      } else {
        saved = await createHeroVideo(heroDraft);
      }
      const updatedHero =
        dataset.heroVideos.length > 0 && dataset.heroVideos.some((h) => h._id === saved._id)
          ? dataset.heroVideos.map((h) => (h._id === saved._id ? saved : h))
          : [saved, ...dataset.heroVideos.filter((h) => h._id !== saved._id)];

      const nextDataset: CMSDataset = {
        ...dataset,
        heroVideos: updatedHero,
        lastSyncedAt: new Date().toISOString(),
      };
      setDataset(nextDataset);
      saveCMSDataset(nextDataset);
      setHeroDraft(saved);
      setHasPendingChanges(false);
      showToast('Hero video stream and branding updated in Supabase');
    } catch (err: any) {
      alert(`Failed to save hero video to Supabase: ${err?.message || err}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveGuest = async () => {
    if (!guestDraft) return;
    setIsPublishing(true);
    try {
      const isExisting = Boolean(
        guestDraft._id && dataset.hallOfFameGuests.some((g) => g._id === guestDraft._id)
      );

      // Sort current guests by rankPosition ascending
      const currentGuests = dataset.hallOfFameGuests
        .slice()
        .sort((a, b) => (Number(a.rankPosition) || 0) - (Number(b.rankPosition) || 0));

      const rawRank = Number(guestDraft.rankPosition);
      const maxRank = isExisting ? currentGuests.length : currentGuests.length + 1;
      // Clamping rules:
      // If <= 0 or invalid, clamp to 1
      // If larger than total available positions, clamp to maxRank
      const clampedRank = isNaN(rawRank) || rawRank < 1 ? 1 : Math.min(rawRank, maxRank);

      let finalList: HallOfFameGuestDocument[];
      let finalSavedGuest: HallOfFameGuestDocument;

      if (isExisting) {
        const targetId = guestDraft._id;
        const currentIndex = currentGuests.findIndex((g) => g._id === targetId);
        const oldRank = currentIndex !== -1 ? currentIndex + 1 : 1;

        if (clampedRank === oldRank) {
          // Rank did not change, update in place
          const updatedDraft = { ...guestDraft, rankPosition: oldRank };
          finalSavedGuest = await updateHallOfFameGuest(targetId, updatedDraft);
          finalList = currentGuests.map((g) => (g._id === targetId ? finalSavedGuest : g));
        } else {
          // Rank position changed: reorder the list with appropriate shifting
          const updatedDraft = { ...guestDraft, rankPosition: clampedRank };
          // Remove target from old position
          const listWithoutTarget = currentGuests.filter((g) => g._id !== targetId);
          // Insert target at new clamped position (0-indexed: clampedRank - 1)
          listWithoutTarget.splice(clampedRank - 1, 0, updatedDraft);
          // Assign contiguous 1..N ranks to all guests
          const contiguousList = listWithoutTarget.map((g, idx) => ({
            ...g,
            rankPosition: idx + 1,
          }));
          // Persist batch reorder safely to Supabase
          finalList = await reorderHallOfFameGuests(contiguousList);
          finalSavedGuest =
            finalList.find((g) => g._id === targetId) || { ...updatedDraft, rankPosition: clampedRank };
        }
      } else {
        // Creating a new guest
        const newGuestDraft = { ...guestDraft, rankPosition: clampedRank };
        const savedNewGuest = await createHallOfFameGuest(newGuestDraft);
        const listWithNew = [...currentGuests];
        listWithNew.splice(clampedRank - 1, 0, savedNewGuest);
        const contiguousList = listWithNew.map((g, idx) => ({
          ...g,
          rankPosition: idx + 1,
        }));
        if (clampedRank <= currentGuests.length) {
          finalList = await reorderHallOfFameGuests(contiguousList);
          finalSavedGuest = finalList.find((g) => g._id === savedNewGuest._id) || savedNewGuest;
        } else {
          finalList = contiguousList;
          finalSavedGuest = savedNewGuest;
        }
      }

      const nextDataset: CMSDataset = {
        ...dataset,
        hallOfFameGuests: finalList,
        lastSyncedAt: new Date().toISOString(),
      };
      setDataset(nextDataset);
      saveCMSDataset(nextDataset);
      setGuestDraft(finalSavedGuest);
      setSelectedGuestId(finalSavedGuest._id);
      setHasPendingChanges(false);
      showToast(`Saved Hall of Fame guest: ${finalSavedGuest.name} (Rank #${finalSavedGuest.rankPosition})`);
    } catch (err: any) {
      alert(`Failed to save guest to Supabase: ${err?.message || err}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAddNewEpisode = async () => {
    setIsPublishing(true);
    try {
      const newNum = dataset.carouselEpisodes.length + 1;
      const padNum = newNum < 10 ? `00${newNum}` : newNum < 100 ? `0${newNum}` : `${newNum}`;

      const newEpPayload: Omit<CarouselEpisodeDocument, '_id' | '_type' | '_updatedAt'> = {
        number: `EP. ${padNum}`,
        rankPosition: dataset.carouselEpisodes.length + 1,
        title: 'New Episode Title',
        guestName: 'Guest Name',
        guestRole: 'Founder / Innovator',
        guestAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
        portraitUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
        description: 'Add a compelling synopsis of the conversation and key takeaways.',
        duration: '45 min',
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        category: 'Entrepreneurship',
        listenCount: '25K Listens',
        listenCountNumber: 25,
        listenCountSuffix: 'K Listens',
        trendingBadge: 'New Release',
        rankingLabel: `#${dataset.carouselEpisodes.length + 1} Spotlight`,
        audioUrl: 'https://cdn.freesound.org/previews/612/612642_5674468-lq.mp3',
        highlights: ['Key lesson 1', 'Turning point moment', 'Closing wisdom'],
        accentColor: '#DD5A1F',
      };

      const saved = await createCarouselEpisode(newEpPayload);
      const nextList = [saved, ...dataset.carouselEpisodes];
      const nextDataset: CMSDataset = {
        ...dataset,
        carouselEpisodes: nextList,
        lastSyncedAt: new Date().toISOString(),
      };
      setDataset(nextDataset);
      saveCMSDataset(nextDataset);
      setSelectedEpisodeId(saved._id);
      setEpisodeDraft(saved);
      showToast(`Created new episode ${saved.number} in Supabase`);
    } catch (err: any) {
      alert(`Failed to create episode in Supabase: ${err?.message || err}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteEpisode = async (id: string) => {
    if (dataset.carouselEpisodes.length <= 1) {
      alert('Cannot delete the only remaining episode.');
      return;
    }
    setIsPublishing(true);
    try {
      await deleteCarouselEpisode(id);
      const filtered = dataset.carouselEpisodes.filter((ep) => ep._id !== id);
      const nextDataset: CMSDataset = {
        ...dataset,
        carouselEpisodes: filtered,
        lastSyncedAt: new Date().toISOString(),
      };
      setDataset(nextDataset);
      saveCMSDataset(nextDataset);
      if (selectedEpisodeId === id && filtered.length > 0) {
        setSelectedEpisodeId(filtered[0]._id);
        setEpisodeDraft(filtered[0]);
      } else if (filtered.length === 0) {
        setSelectedEpisodeId('');
        setEpisodeDraft(null);
      }
      setShowDeleteConfirm(null);
      showToast('Episode removed from Supabase');
    } catch (err: any) {
      alert(`Failed to delete episode from Supabase: ${err?.message || err}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDuplicateEpisode = async (ep: CarouselEpisodeDocument) => {
    setIsPublishing(true);
    try {
      const copyEpPayload: Omit<CarouselEpisodeDocument, '_id' | '_type' | '_updatedAt'> = {
        ...ep,
        number: `${ep.number} (Copy)`,
        title: `${ep.title} (Draft Copy)`,
        rankPosition: dataset.carouselEpisodes.length + 1,
      };
      const saved = await createCarouselEpisode(copyEpPayload);
      const nextList = [saved, ...dataset.carouselEpisodes];
      const nextDataset: CMSDataset = {
        ...dataset,
        carouselEpisodes: nextList,
        lastSyncedAt: new Date().toISOString(),
      };
      setDataset(nextDataset);
      saveCMSDataset(nextDataset);
      setSelectedEpisodeId(saved._id);
      setEpisodeDraft(saved);
      showToast(`Duplicated ${ep.number} to Supabase`);
    } catch (err: any) {
      alert(`Failed to duplicate episode in Supabase: ${err?.message || err}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAddNewGuest = async () => {
    setIsPublishing(true);
    try {
      const newGuestPayload: Omit<HallOfFameGuestDocument, '_id' | '_type' | '_updatedAt'> = {
        name: 'Featured Guest',
        role: 'Industry Pioneer',
        company: 'NextGen Ventures',
        quote: 'Add an unforgettable keynote insight here.',
        episodeNumber: '',
        episodeId: '',
        rankPosition: dataset.hallOfFameGuests.length + 1,
        portraitUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
        accentColor: '#DD5A1F',
        featured: true,
      };
      const saved = await createHallOfFameGuest(newGuestPayload);
      const nextList = [...dataset.hallOfFameGuests, saved];
      const nextDataset: CMSDataset = {
        ...dataset,
        hallOfFameGuests: nextList,
        lastSyncedAt: new Date().toISOString(),
      };
      setDataset(nextDataset);
      saveCMSDataset(nextDataset);
      setSelectedGuestId(saved._id);
      setGuestDraft(saved);
      showToast(`Added new Hall of Fame guest: ${saved.name}`);
    } catch (err: any) {
      alert(`Failed to create guest in Supabase: ${err?.message || err}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const isEpisodeInHallOfFame = (episode: CarouselEpisodeDocument, currentGuestId?: string): boolean => {
    return dataset.hallOfFameGuests.some((g) => {
      if (currentGuestId && g._id === currentGuestId) return false;
      const idMatch =
        Boolean(g.episodeId && episode._id) &&
        (g.episodeId === episode._id || legacyIdToUUID(g.episodeId, 'episode') === legacyIdToUUID(episode._id, 'episode'));
      const numMatch =
        Boolean(g.episodeNumber && episode.number) &&
        g.episodeNumber.trim().toLowerCase() === episode.number.trim().toLowerCase();
      return idMatch || numMatch;
    });
  };

  const handleOpenAddFromEpisodesModal = () => {
    setSelectedEpisodeInModal(null);
    setModalMode('create');
    setAddEpisodeSearchQuery('');
    setShowAddFromEpisodesModal(true);
  };

  const handleOpenRelinkModal = () => {
    setSelectedEpisodeInModal(null);
    setModalMode('relink');
    setAddEpisodeSearchQuery('');
    setShowAddFromEpisodesModal(true);
  };

  const handleConfirmAddFromEpisodes = async () => {
    if (!selectedEpisodeInModal) return;

    if (modalMode === 'create') {
      if (isEpisodeInHallOfFame(selectedEpisodeInModal)) {
        alert(`"${selectedEpisodeInModal.number}" is already represented in the Hall of Fame. Duplicate creation is prevented.`);
        return;
      }

      setIsPublishing(true);
      try {
        const ep = selectedEpisodeInModal;
        const newGuestPayload: Omit<HallOfFameGuestDocument, '_id' | '_type' | '_updatedAt'> = {
          name: ep.guestName || 'Featured Guest',
          role: ep.guestRole || 'Keynote Leader',
          company: (ep as any).company || '',
          quote: (ep.highlights && ep.highlights.length > 0) ? ep.highlights[0] : (ep.title || ep.description || ''),
          episodeNumber: ep.number,
          episodeId: ep._id,
          rankPosition: dataset.hallOfFameGuests.length + 1,
          portraitUrl: ep.portraitUrl || ep.guestAvatar || '',
          accentColor: ep.accentColor || '#DD5A1F',
          featured: true,
        };

        const saved = await createHallOfFameGuest(newGuestPayload);
        const nextList = [...dataset.hallOfFameGuests, saved];
        const nextDataset: CMSDataset = {
          ...dataset,
          hallOfFameGuests: nextList,
          lastSyncedAt: new Date().toISOString(),
        };
        setDataset(nextDataset);
        saveCMSDataset(nextDataset);
        setSelectedGuestId(saved._id);
        setGuestDraft(saved);
        setShowAddFromEpisodesModal(false);
        setSelectedEpisodeInModal(null);
        showToast(`Created Hall of Fame guest for ${ep.number} (${ep.guestName}).`);
      } catch (err: any) {
        alert(`Failed to add episode to Hall of Fame in Supabase: ${err?.message || err}`);
      } finally {
        setIsPublishing(false);
      }
    } else if (modalMode === 'relink' && guestDraft) {
      if (isEpisodeInHallOfFame(selectedEpisodeInModal, guestDraft._id)) {
        alert(`"${selectedEpisodeInModal.number}" is already associated with another Hall of Fame guest.`);
        return;
      }

      setGuestDraft({
        ...guestDraft,
        episodeId: selectedEpisodeInModal._id,
        episodeNumber: selectedEpisodeInModal.number,
      });
      setHasPendingChanges(true);
      setShowAddFromEpisodesModal(false);
      setSelectedEpisodeInModal(null);
      showToast(`Updated association to ${selectedEpisodeInModal.number}. Click "Save Guest" to persist.`);
    }
  };

  const handleToggleFeaturedGuest = async (guest: HallOfFameGuestDocument, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPublishing(true);
    try {
      const nextFeatured = !guest.featured;
      const saved = await updateHallOfFameGuest(guest._id, {
        featured: nextFeatured,
      });
      const nextList = dataset.hallOfFameGuests.map((g) => (g._id === saved._id ? saved : g));
      const nextDataset: CMSDataset = {
        ...dataset,
        hallOfFameGuests: nextList,
        lastSyncedAt: new Date().toISOString(),
      };
      setDataset(nextDataset);
      saveCMSDataset(nextDataset);
      if (guestDraft && guestDraft._id === saved._id) {
        setGuestDraft(saved);
      }
      showToast(`${saved.name} is now ${saved.featured ? 'Featured in' : 'Hidden from'} public Hall of Fame`);
    } catch (err: any) {
      alert(`Failed to update feature status in Supabase: ${err?.message || err}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (dataset.hallOfFameGuests.length <= 1) {
      alert('Cannot delete the only remaining guest.');
      return;
    }
    setIsPublishing(true);
    try {
      await deleteHallOfFameGuest(id);
      const filtered = dataset.hallOfFameGuests
        .filter((g) => g._id !== id)
        .sort((a, b) => (Number(a.rankPosition) || 0) - (Number(b.rankPosition) || 0));

      // Re-assign contiguous 1..N ranks to all remaining guests
      const compacted = filtered.map((g, idx) => ({
        ...g,
        rankPosition: idx + 1,
      }));

      let finalList = compacted;
      try {
        finalList = await reorderHallOfFameGuests(compacted);
      } catch (reorderErr) {
        console.warn('Failed to persist compacted ranks on delete:', reorderErr);
      }

      const nextDataset: CMSDataset = {
        ...dataset,
        hallOfFameGuests: finalList,
        lastSyncedAt: new Date().toISOString(),
      };
      setDataset(nextDataset);
      saveCMSDataset(nextDataset);
      if (selectedGuestId === id && finalList.length > 0) {
        setSelectedGuestId(finalList[0]._id);
        setGuestDraft(finalList[0]);
      } else if (finalList.length === 0) {
        setSelectedGuestId('');
        setGuestDraft(null);
      }
      showToast('Guest removed from Supabase');
    } catch (err: any) {
      alert(`Failed to delete guest from Supabase: ${err?.message || err}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataset, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mic-and-mind-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Database exported as JSON backup');
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.carouselEpisodes && parsed.heroVideos) {
            setDataset(parsed);
            showToast('JSON preview loaded. Save individual items to update Supabase.');
          } else {
            alert('Invalid backup JSON format.');
          }
        } catch {
          alert('Could not parse backup file.');
        }
      };
      reader.readAsText(files[0]);
    }
  };

  const handleRunMigration = async () => {
    setIsMigrating(true);
    try {
      showToast('Starting safe CMS data migration to Supabase...');
      const res = await migrateLegacyCMSToSupabase();
      if (res.success) {
        showToast(res.message);
      } else {
        alert(res.message);
      }
      await loadSupabaseData(false);
    } catch (err: any) {
      alert(`Migration failed: ${err?.message || err}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Re-fetch live data from Supabase database?')) {
      loadSupabaseData(false);
      showToast('Refreshed data from Supabase');
    }
  };

  // Filter episodes
  const filteredEpisodes = dataset.carouselEpisodes.filter((ep) => {
    const matchesSearch =
      ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || ep.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // ==========================================
  // UN-AUTHENTICATED VIEW: Custom Admin Login
  // ==========================================
  if (isCheckingSession) {
    return (
      <div className="min-h-screen w-full bg-[#0A0A0B] text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#DD5A1F] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-neutral-400">Verifying administrator session...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen w-full bg-[#0A0A0B] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-[#DD5A1F] selection:text-white">
        {/* Subtle glowing ambient accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#DD5A1F]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Back Navigation */}
        <div className="w-full max-w-md mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              window.location.href = '/';
            }}
            className="flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-neutral-500 group-hover:text-[#DD5A1F] transition-colors" />
            <span>Back to Live Podcast</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Studio Production Suite</span>
          </div>
        </div>

        {/* Login Container */}
        <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#DD5A1F] to-[#B84312] mx-auto flex items-center justify-center shadow-lg shadow-[#DD5A1F]/20">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-display">
              Mic & Mind Admin Portal
            </h1>
            <p className="text-xs text-neutral-400">
              Sign in to manage podcast episodes, audio streams, video assets & guests
            </p>
          </div>

          {/* Security / Auth Status Banner */}
          <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#DD5A1F]" />
                <span className="text-neutral-300 font-semibold">Supabase Auth & RLS Guard:</span>
              </span>
              <span className="text-emerald-400 font-medium font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">Active</span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-tight">
              Authorized admin accounts only. Role validation is enforced directly against the database profile schema.
            </p>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          {/* Password Reset Modal / Toggle */}
          {showPasswordReset ? (
            <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
              <div className="text-xs text-neutral-300 font-semibold">
                Reset Admin Password via Supabase Auth
              </div>
              <p className="text-[11px] text-neutral-400">
                Enter your admin email. A password reset link will be dispatched to your inbox.
              </p>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Admin Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="admin@micandmind.fm"
                  required
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#DD5A1F]"
                />
              </div>

              {resetSuccess && (
                <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Password reset email dispatched! Check your inbox.</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#DD5A1F] hover:bg-[#B84312] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Send Reset Link
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordReset(false)}
                  className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* Standard Email + Password Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="admin@micandmind.fm"
                    required
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#DD5A1F] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordReset(true);
                      setResetEmail(emailInput || 'admin@micandmind.fm');
                    }}
                    className="text-[11px] text-neutral-400 hover:text-[#DD5A1F] transition-colors cursor-pointer"
                  >
                    Reset Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#DD5A1F] transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-400">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-neutral-800 border-neutral-700 text-[#DD5A1F] focus:ring-[#DD5A1F] accent-[#DD5A1F]"
                  />
                  <span>Keep me signed in</span>
                </label>
                <span className="text-[11px] font-mono text-neutral-500">v2.4 Production</span>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-[#DD5A1F] hover:bg-[#B84312] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#DD5A1F]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {isLoggingIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Sign In to Production Studio</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer note */}
          <div className="pt-2 border-t border-neutral-800 text-center">
            <p className="text-[11px] text-neutral-500">
              Authorized personnel only &bull; Changes propagate live to the listener portal
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // AUTHENTICATED VIEW: Full Admin Studio
  // ==========================================
  return (
    <div className="min-h-screen bg-[#0E0E10] text-neutral-100 flex flex-col font-sans selection:bg-[#DD5A1F] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-neutral-900 border border-[#DD5A1F]/60 text-white text-xs font-medium rounded-xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#DD5A1F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Application Header */}
      <header className="h-14 bg-neutral-950 border-b border-neutral-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#DD5A1F] to-[#B84312] flex items-center justify-center shadow-md">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white flex items-center gap-2 font-display">
              <span>Mic & Mind Studio</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#DD5A1F]/15 text-[#DD5A1F] border border-[#DD5A1F]/30">
                Live CMS
              </span>
            </div>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-3">
          {/* Review Changes Drawer Trigger */}
          <button
            type="button"
            onClick={() => setShowReviewModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium rounded-lg border border-neutral-800 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#DD5A1F]" />
            <span>Review Live Data</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </button>

          {/* View Live Podcast Site */}
          <a
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium rounded-lg border border-neutral-800 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Open Live Site</span>
          </a>

          {/* User profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full bg-neutral-800 object-cover border border-neutral-700"
            />
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-white leading-tight">{currentUser.name}</div>
              <div className="text-[10px] font-mono text-neutral-400">{currentUser.role}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Workspace with Side Navigation */}
      {dataError && (
        <div className="bg-red-950/80 border-b border-red-800 px-4 py-2.5 flex items-center justify-between text-xs text-red-200">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-red-400">Database Sync Notice:</span>
            <span>{dataError}</span>
          </div>
          <button
            type="button"
            onClick={loadSupabaseData}
            className="px-2.5 py-1 bg-red-900 hover:bg-red-800 text-white rounded text-[11px] font-medium transition-colors"
          >
            Retry Sync
          </button>
        </div>
      )}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-56 bg-neutral-950 border-r border-neutral-800/90 flex flex-col shrink-0">
          <div className="p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">
              Content Schemas
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('episodes')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'episodes'
                  ? 'bg-[#DD5A1F] text-white shadow-md shadow-[#DD5A1F]/20'
                  : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Music className="w-4 h-4" />
                <span>Episodes & Audio</span>
              </div>
              <span className="text-[10px] font-mono opacity-80">{dataset.carouselEpisodes.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('hero')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'hero'
                  ? 'bg-[#DD5A1F] text-white shadow-md shadow-[#DD5A1F]/20'
                  : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Video className="w-4 h-4" />
                <span>Hero & Video</span>
              </div>
              <span className="text-[10px] font-mono opacity-80">1</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('guests')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'guests'
                  ? 'bg-[#DD5A1F] text-white shadow-md shadow-[#DD5A1F]/20'
                  : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Hall of Fame</span>
              </div>
              <span className="text-[10px] font-mono opacity-80">{dataset.hallOfFameGuests.length}</span>
            </button>
          </div>

          <div className="p-3 border-t border-neutral-900 space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">
              Management
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('review')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'review'
                  ? 'bg-[#DD5A1F] text-white'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Review Changes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-[#DD5A1F] text-white'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Settings & Backup</span>
            </button>
          </div>

          {/* Quick Stats footer */}
          <div className="mt-auto p-4 border-t border-neutral-900 bg-neutral-950/60">
            <div className="text-[11px] text-neutral-400 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Episodes:</span>
                <span className="text-white font-bold">{dataset.carouselEpisodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Audio Streams:</span>
                <span className="text-emerald-400">Online</span>
              </div>
              <div className="flex justify-between">
                <span>Video Streams:</span>
                <span className="text-emerald-400">Online</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Dynamic Studio Workspace */}
        <main className="flex-1 flex overflow-hidden bg-[#0A0A0B]">
          {/* ========================================================= */}
          {/* TAB 1: EPISODES & AUDIO PRODUCTION */}
          {/* ========================================================= */}
          {activeTab === 'episodes' && (
            <div className="flex-1 flex overflow-hidden">
              {/* Episodes List Pane */}
              <div className="w-80 bg-neutral-950/90 border-r border-neutral-800/80 flex flex-col shrink-0">
                {/* Search & New Episode action */}
                <div className="p-3 border-b border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Episodes ({filteredEpisodes.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddNewEpisode}
                      className="px-2.5 py-1 bg-[#DD5A1F] hover:bg-[#B84312] text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New</span>
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search title, guest, number..."
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#DD5A1F]"
                    />
                  </div>
                </div>

                {/* Episode Items List */}
                <div className="flex-1 overflow-y-auto divide-y divide-neutral-900">
                  {filteredEpisodes.map((ep) => {
                    const isSelected = ep._id === selectedEpisodeId;
                    return (
                      <div
                        key={ep._id}
                        onClick={() => setSelectedEpisodeId(ep._id)}
                        className={`p-3 cursor-pointer transition-all flex items-start gap-3 select-none ${
                          isSelected
                            ? 'bg-neutral-900 border-l-4 border-l-[#DD5A1F] text-white'
                            : 'hover:bg-neutral-900/50 text-neutral-300'
                        }`}
                      >
                        <img
                          src={ep.portraitUrl || ep.guestAvatar}
                          alt={ep.guestName}
                          className="w-12 h-12 rounded-xl object-cover bg-neutral-800 shrink-0 border border-neutral-700"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-[#DD5A1F] font-semibold">
                              {ep.number}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400 truncate">
                              #{ep.rankPosition}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold truncate leading-snug">{ep.title}</h4>
                          <p className="text-[11px] text-neutral-400 truncate">{ep.guestName}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Episode Inspector & Editor */}
              {episodeDraft ? (
                <div className="flex-1 flex flex-col overflow-hidden bg-neutral-900/30">
                  {/* Top Bar for Editor */}
                  <div className="h-12 border-b border-neutral-800 px-6 flex items-center justify-between bg-neutral-950">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-neutral-400">Editing:</span>
                      <span className="text-xs font-bold text-white">{episodeDraft.number}</span>
                      <span className="text-xs text-neutral-400 truncate max-w-xs">&bull; {episodeDraft.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDuplicateEpisode(episodeDraft)}
                        className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Duplicate</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(episodeDraft._id)}
                        className="px-2.5 py-1.5 bg-neutral-800 hover:bg-red-950/60 text-red-400 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700/60"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveEpisode}
                        className="px-4 py-1.5 bg-[#DD5A1F] hover:bg-[#B84312] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-[#DD5A1F]/20 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save & Publish Live</span>
                      </button>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl">
                    {/* Basic info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                          Episode Number
                        </label>
                        <input
                          type="text"
                          value={episodeDraft.number}
                          onChange={(e) => setEpisodeDraft({ ...episodeDraft, number: e.target.value })}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#DD5A1F]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                          Rank Position
                        </label>
                        <input
                          type="number"
                          value={episodeDraft.rankPosition}
                          onChange={(e) => setEpisodeDraft({ ...episodeDraft, rankPosition: parseInt(e.target.value) || 1 })}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#DD5A1F]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                          Category
                        </label>
                        <select
                          value={episodeDraft.category}
                          onChange={(e) => setEpisodeDraft({ ...episodeDraft, category: e.target.value })}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DD5A1F]"
                        >
                          <option value="Entrepreneurship">Entrepreneurship</option>
                          <option value="Failure & Recovery">Failure & Recovery</option>
                          <option value="Growth & Mindset">Growth & Mindset</option>
                          <option value="Connection">Connection</option>
                          <option value="Technology">Technology</option>
                          <option value="Leadership">Leadership</option>
                        </select>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                        Episode Title
                      </label>
                      <input
                        type="text"
                        value={episodeDraft.title}
                        onChange={(e) => setEpisodeDraft({ ...episodeDraft, title: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-[#DD5A1F]"
                      />
                    </div>

                    {/* Audio Stream Upload / Link */}
                    <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                        <Music className="w-4 h-4 text-[#DD5A1F]" />
                        <span>Episode Audio File & Live Preview</span>
                      </div>
                      <AudioUploadField
                        label="Audio Stream"
                        description="Upload an MP3/WAV file directly or paste an external streaming CDN link."
                        value={episodeDraft.audioUrl || ''}
                        onChange={(url) => setEpisodeDraft({ ...episodeDraft, audioUrl: url })}
                        folder="mic-and-mind/episodes/audio"
                      />
                    </div>

                    {/* Guest Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                          Guest Full Name
                        </label>
                        <input
                          type="text"
                          value={episodeDraft.guestName}
                          onChange={(e) => setEpisodeDraft({ ...episodeDraft, guestName: e.target.value })}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DD5A1F]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                          Guest Title / Company Role
                        </label>
                        <input
                          type="text"
                          value={episodeDraft.guestRole}
                          onChange={(e) => setEpisodeDraft({ ...episodeDraft, guestRole: e.target.value })}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DD5A1F]"
                        />
                      </div>
                    </div>

                    {/* Guest Portrait Image */}
                    <ImageUploadField
                      label="Guest Portrait Image"
                      description="Upload a high-resolution portrait (1:1 or 4:5 aspect ratio recommended)"
                      value={episodeDraft.portraitUrl || episodeDraft.guestAvatar || ''}
                      folder="mic-and-mind/episodes/thumbnails"
                      onChange={(url) =>
                        setEpisodeDraft({
                          ...episodeDraft,
                          portraitUrl: url,
                          guestAvatar: url,
                        })
                      }
                    />

                    {/* Description / Synopsis */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                        Episode Description & Synopsis
                      </label>
                      <textarea
                        rows={3}
                        value={episodeDraft.description}
                        onChange={(e) => setEpisodeDraft({ ...episodeDraft, description: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#DD5A1F] leading-relaxed"
                      />
                    </div>

                    {/* Metadata Badges & Duration */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={episodeDraft.duration}
                          onChange={(e) => setEpisodeDraft({ ...episodeDraft, duration: e.target.value })}
                          placeholder="58 min"
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DD5A1F]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                          Trending Badge
                        </label>
                        <input
                          type="text"
                          value={episodeDraft.trendingBadge || ''}
                          onChange={(e) => setEpisodeDraft({ ...episodeDraft, trendingBadge: e.target.value })}
                          placeholder="Editor’s Choice"
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DD5A1F]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                          Listen Count
                        </label>
                        <input
                          type="text"
                          value={episodeDraft.listenCount || ''}
                          onChange={(e) => setEpisodeDraft({ ...episodeDraft, listenCount: e.target.value })}
                          placeholder="148K Listens"
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DD5A1F]"
                        />
                      </div>
                    </div>

                    {/* Key Highlights List */}
                    <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                        Key Discussion Highlights & Takeaways
                      </label>
                      <div className="space-y-2">
                        {(episodeDraft.highlights || []).map((hl, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-neutral-800 text-[10px] font-mono text-neutral-400 flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={hl}
                              onChange={(e) => {
                                const copy = [...(episodeDraft.highlights || [])];
                                copy[idx] = e.target.value;
                                setEpisodeDraft({ ...episodeDraft, highlights: copy });
                              }}
                              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#DD5A1F]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const copy = (episodeDraft.highlights || []).filter((_, i) => i !== idx);
                                setEpisodeDraft({ ...episodeDraft, highlights: copy });
                              }}
                              className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="text"
                            value={newHighlightText}
                            onChange={(e) => setNewHighlightText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newHighlightText.trim()) {
                                e.preventDefault();
                                setEpisodeDraft({
                                  ...episodeDraft,
                                  highlights: [...(episodeDraft.highlights || []), newHighlightText.trim()],
                                });
                                setNewHighlightText('');
                              }
                            }}
                            placeholder="Type new highlight and press Add..."
                            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#DD5A1F]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newHighlightText.trim()) {
                                setEpisodeDraft({
                                  ...episodeDraft,
                                  highlights: [...(episodeDraft.highlights || []), newHighlightText.trim()],
                                });
                                setNewHighlightText('');
                              }
                            }}
                            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            Add Bullet
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-neutral-500 text-xs">
                  Select an episode to inspect
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: HERO VIDEO & MEDIA BRANDING */}
          {/* ========================================================= */}
          {activeTab === 'hero' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div>
                  <h2 className="text-lg font-bold text-white font-display">Hero Video Stream & Brand Styling</h2>
                  <p className="text-xs text-neutral-400">
                    Manage desktop cinematic video, mobile optimized video stream, and fallback poster image
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveHero}
                  className="px-4 py-2 bg-[#DD5A1F] hover:bg-[#B84312] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-[#DD5A1F]/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Publish Hero Changes</span>
                </button>
              </div>

              {/* Desktop Video Stream */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                <VideoUploadField
                  label="Desktop & Landscape Hero Video"
                  description="High bitrate 16:9 MP4/WebM video stream rendered on large screens."
                  value={heroDraft.desktopVideoUrl}
                  onChange={(url) => setHeroDraft({ ...heroDraft, desktopVideoUrl: url })}
                  posterUrl={heroDraft.posterUrl}
                  aspectRatioLabel="16:9 Desktop"
                  folder="mic-and-mind/hero/desktop"
                />
              </div>

              {/* Mobile Portrait Video Stream */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                <VideoUploadField
                  label="Mobile Portrait Video (9:16)"
                  description="Optimized vertical crop stream loaded on smartphones and compact viewports."
                  value={heroDraft.mobileVideoUrl}
                  onChange={(url) => setHeroDraft({ ...heroDraft, mobileVideoUrl: url })}
                  posterUrl={heroDraft.posterUrl}
                  aspectRatioLabel="9:16 Mobile"
                  folder="mic-and-mind/hero/mobile"
                />
              </div>

              {/* Video Fallback Poster Image */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                <ImageUploadField
                  label="Static Poster Image"
                  description="High-resolution poster frame displayed while the video is loading or if autoplay is disabled."
                  value={heroDraft.posterUrl}
                  onChange={(url) => setHeroDraft({ ...heroDraft, posterUrl: url })}
                  folder="mic-and-mind/hero/posters"
                />
              </div>

              {/* Text & Accent Color */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                    Hero Tagline Heading
                  </label>
                  <input
                    type="text"
                    value={heroDraft.title}
                    onChange={(e) => setHeroDraft({ ...heroDraft, title: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DD5A1F]"
                  />
                </div>

                <ColorPickerField
                  label="Brand Theme Accent"
                  description="Primary orange/amber signature accent for buttons, badges, and glow effects."
                  value={heroDraft.accentColor || '#DD5A1F'}
                  onChange={(color) => setHeroDraft({ ...heroDraft, accentColor: color })}
                />
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: HALL OF FAME GUESTS */}
          {/* ========================================================= */}
          {activeTab === 'guests' && (
            <div className="flex-1 flex overflow-hidden">
              {/* Guests List Pane */}
              <div className="w-80 bg-neutral-950/90 border-r border-neutral-800/80 flex flex-col shrink-0">
                <div className="p-3 border-b border-neutral-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Hall of Fame ({dataset.hallOfFameGuests.length})
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {dataset.hallOfFameGuests.filter((g) => g.featured).length} Featured
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenAddFromEpisodesModal}
                      className="flex-1 px-2.5 py-1.5 bg-[#DD5A1F] hover:bg-[#B84312] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add from Episodes</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddNewGuest}
                      title="Add a custom guest directly"
                      className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      <span>Custom</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-neutral-900">
                  {dataset.hallOfFameGuests
                    .slice()
                    .sort((a, b) => (Number(a.rankPosition) || 0) - (Number(b.rankPosition) || 0))
                    .map((g) => {
                      const isSelected = g._id === selectedGuestId;
                      return (
                        <div
                          key={g._id}
                          onClick={() => setSelectedGuestId(g._id)}
                          className={`p-3 cursor-pointer transition-all flex items-center gap-3 select-none ${
                            isSelected
                              ? 'bg-neutral-900 border-l-4 border-l-[#DD5A1F] text-white'
                              : 'hover:bg-neutral-900/50 text-neutral-300'
                          }`}
                        >
                          <div className="relative shrink-0">
                            <img
                              src={g.portraitUrl}
                              alt={g.name}
                              className="w-10 h-10 rounded-full object-cover bg-neutral-800 border border-neutral-700"
                            />
                            <span className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-neutral-950 text-white font-mono text-[9px] font-bold rounded border border-neutral-700">
                              #{g.rankPosition}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <h4 className="text-xs font-semibold truncate leading-tight">{g.name}</h4>
                              {g.featured ? (
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleFeaturedGuest(g, e)}
                                  title="Featured in public Hall of Fame. Click to hide."
                                  className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900 transition-colors cursor-pointer shrink-0"
                                >
                                  Featured
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleFeaturedGuest(g, e)}
                                  title="Hidden from public Hall of Fame. Click to feature."
                                  className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700 hover:text-white transition-colors cursor-pointer shrink-0"
                                >
                                  Hidden
                                </button>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-400 truncate">
                              {g.episodeNumber ? `${g.episodeNumber} • ` : ''}{g.role}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Guest Inspector */}
              {guestDraft ? (
                <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-3xl">
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                    <div>
                      <h2 className="text-lg font-bold text-white font-display">Edit Hall of Fame Entry</h2>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Configure curation status, public showcase ranking, and guest profile.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteGuest(guestDraft._id)}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-red-950/60 text-red-400 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveGuest}
                        className="px-4 py-1.5 bg-[#DD5A1F] hover:bg-[#B84312] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-[#DD5A1F]/20 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Guest</span>
                      </button>
                    </div>
                  </div>

                  {/* Curation & Visibility Controls */}
                  <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#DD5A1F]" />
                          Curation &amp; Showcase Status
                        </span>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          Only entries marked as Featured appear in the public Hall of Fame.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setGuestDraft({ ...guestDraft, featured: !guestDraft.featured })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          guestDraft.featured
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                        }`}
                      >
                        {guestDraft.featured ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Featured in Hall of Fame</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Not Featured (Hidden)</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-neutral-800/80">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                          Rank Position (Order in Public Showcase)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={dataset.hallOfFameGuests.length}
                          value={guestDraft.rankPosition}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === '') {
                              setGuestDraft({
                                ...guestDraft,
                                rankPosition: '' as any,
                              });
                              setHasPendingChanges(true);
                              return;
                            }
                            const val = parseInt(raw, 10);
                            setGuestDraft({
                              ...guestDraft,
                              rankPosition: isNaN(val) ? 1 : val,
                            });
                            setHasPendingChanges(true);
                          }}
                          onBlur={(e) => {
                            const maxRank = dataset.hallOfFameGuests.length;
                            const val = parseInt(e.target.value, 10);
                            const clamped = isNaN(val) || val <= 0 ? 1 : Math.min(val, maxRank);
                            setGuestDraft({
                              ...guestDraft,
                              rankPosition: clamped,
                            });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveGuest();
                            }
                          }}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DD5A1F]"
                        />
                        <span className="text-[10px] text-neutral-500 mt-1 block">
                          Position #{guestDraft.rankPosition || 1} of {dataset.hallOfFameGuests.length}. Changing rank shifts other entries upon save.
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                            Associated Episode
                          </label>
                          <button
                            type="button"
                            onClick={handleOpenRelinkModal}
                            className="text-[11px] text-[#DD5A1F] hover:text-[#ff7537] font-semibold transition-colors cursor-pointer"
                          >
                            {guestDraft.episodeId ? 'Change Episode' : 'Link Episode'}
                          </button>
                        </div>
                        <div className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-[#DD5A1F]">
                                {guestDraft.episodeNumber || 'Unlinked'}
                              </span>
                              {(() => {
                                const matched = dataset.carouselEpisodes.find(
                                  (ep) =>
                                    ep._id === guestDraft.episodeId ||
                                    (guestDraft.episodeId && legacyIdToUUID(ep._id, 'episode') === legacyIdToUUID(guestDraft.episodeId, 'episode')) ||
                                    (guestDraft.episodeNumber && ep.number.trim().toLowerCase() === guestDraft.episodeNumber.trim().toLowerCase())
                                );
                                return matched ? (
                                  <span className="text-neutral-300 truncate text-[11px]">
                                    — {matched.title}
                                  </span>
                                ) : null;
                              })()}
                            </div>
                            <span className="text-[10px] font-mono text-neutral-500 block truncate mt-0.5">
                              {guestDraft.episodeId ? `ID: ${guestDraft.episodeId}` : 'No database episode associated'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                        Guest Name
                      </label>
                      <input
                        type="text"
                        value={guestDraft.name}
                        onChange={(e) => setGuestDraft({ ...guestDraft, name: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DD5A1F]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                        Guest Title / Organization
                      </label>
                      <input
                        type="text"
                        value={guestDraft.role}
                        onChange={(e) => setGuestDraft({ ...guestDraft, role: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DD5A1F]"
                      />
                    </div>
                  </div>

                  {/* Company / Institution */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                      Company / Institution
                    </label>
                    <input
                      type="text"
                      value={guestDraft.company || ''}
                      onChange={(e) => setGuestDraft({ ...guestDraft, company: e.target.value })}
                      placeholder="e.g. NextGen Ventures, OpenAI, Stanford"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DD5A1F]"
                    />
                  </div>

                  {/* Keynote Quote */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                      Keynote Quote
                    </label>
                    <textarea
                      rows={2}
                      value={guestDraft.quote || ''}
                      onChange={(e) => setGuestDraft({ ...guestDraft, quote: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#DD5A1F]"
                    />
                  </div>

                  {/* Guest Portrait Upload */}
                  <ImageUploadField
                    label="Guest Avatar Portrait"
                    description="Upload high-res portrait image for Hall of Fame cards"
                    value={guestDraft.portraitUrl}
                    onChange={(url) => setGuestDraft({ ...guestDraft, portraitUrl: url })}
                    folder="mic-and-mind/guests"
                  />

                  {/* Accent Ring Color */}
                  <ColorPickerField
                    label="Avatar Ring Color"
                    value={guestDraft.accentColor || '#DD5A1F'}
                    onChange={(color) => setGuestDraft({ ...guestDraft, accentColor: color })}
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-neutral-500 text-xs">
                  Select a guest to inspect
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: REVIEW CHANGES & AUDIT LOG */}
          {/* ========================================================= */}
          {activeTab === 'review' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div>
                  <h2 className="text-lg font-bold text-white font-display">Review & Live Data Audit</h2>
                  <p className="text-xs text-neutral-400">
                    Verify all episodes, audio streams, and media before final distribution
                  </p>
                </div>

                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#DD5A1F] hover:bg-[#B84312] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch Live Site in New Tab</span>
                </a>
              </div>

              {/* Data Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                  <div className="text-xs text-neutral-400 mb-1">Total Episodes</div>
                  <div className="text-2xl font-bold text-white">{dataset.carouselEpisodes.length}</div>
                  <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Synchronized with store</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                  <div className="text-xs text-neutral-400 mb-1">Featured Hall of Fame</div>
                  <div className="text-2xl font-bold text-white">{dataset.hallOfFameGuests.length} Guests</div>
                  <div className="text-[11px] text-neutral-400 mt-1">High-res portraits attached</div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                  <div className="text-xs text-neutral-400 mb-1">Hero Streams</div>
                  <div className="text-2xl font-bold text-white">2 Active</div>
                  <div className="text-[11px] text-emerald-400 mt-1">Desktop + Mobile streams</div>
                </div>
              </div>

              {/* Comprehensive Episode Catalog Review Table */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Published Episodes Breakdown
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-500 font-mono">
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Episode</th>
                        <th className="py-2.5 px-3">Guest</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Duration</th>
                        <th className="py-2.5 px-3">Audio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900 text-neutral-300">
                      {dataset.carouselEpisodes.map((ep) => (
                        <tr key={ep._id} className="hover:bg-neutral-900/50">
                          <td className="py-2.5 px-3 font-mono text-[#DD5A1F] font-bold">{ep.number}</td>
                          <td className="py-2.5 px-3 font-medium text-white max-w-xs truncate">{ep.title}</td>
                          <td className="py-2.5 px-3 text-neutral-400">{ep.guestName}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px]">
                              {ep.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-neutral-400">{ep.duration}</td>
                          <td className="py-2.5 px-3">
                            {ep.audioUrl ? (
                              <span className="text-emerald-400 text-[11px] flex items-center gap-1 font-mono">
                                <Check className="w-3 h-3" /> Ready
                              </span>
                            ) : (
                              <span className="text-amber-400 text-[11px]">No file</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: SECURITY & BACKUP SETTINGS */}
          {/* ========================================================= */}
          {activeTab === 'security' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-3xl mx-auto">
              <div className="pb-4 border-b border-neutral-800">
                <h2 className="text-lg font-bold text-white font-display">Admin Settings & Data Backups</h2>
                <p className="text-xs text-neutral-400">
                  Manage master credentials, export data archives, and database rollback tools
                </p>
              </div>

              {/* Admin Profile Summary */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#DD5A1F]" />
                  <span>Active Session Profile</span>
                </div>
                <div className="flex items-center gap-4">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-14 h-14 rounded-2xl object-cover bg-neutral-800 border border-neutral-700"
                  />
                  <div>
                    <div className="text-sm font-bold text-white">{currentUser.name}</div>
                    <div className="text-xs font-mono text-neutral-400">{currentUser.email}</div>
                    <div className="text-[11px] font-mono text-[#DD5A1F] mt-0.5">{currentUser.role}</div>
                  </div>
                </div>
              </div>

              {/* Supabase CMS Data Migration */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#DD5A1F]" />
                    <span>Supabase CMS Cloud Migration</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                    Live Supabase RLS
                  </span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Migrates initial podcast episodes, hero video configurations, and Hall of Fame guest profiles from local storage into your production Supabase database. This operation maps legacy string IDs (e.g. <code className="text-[#DD5A1F] font-mono text-[11px]">ep-042</code>) to valid RFC4122 v4 UUIDs and prevents duplicates.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isMigrating}
                    onClick={handleRunMigration}
                    className="px-4 py-2.5 bg-[#DD5A1F] hover:bg-[#B84312] disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    {isMigrating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Migrating into Supabase...</span>
                      </>
                    ) : (
                      <>
                        <Database className="w-3.5 h-3.5" />
                        <span>Run Safe Migration to Supabase</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isLoadingData}
                    onClick={() => loadSupabaseData(false)}
                    className="px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium rounded-xl border border-neutral-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
                    <span>Refresh Live Data</span>
                  </button>
                </div>
              </div>

              {/* Export & Import Backup */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileDown className="w-4 h-4 text-[#DD5A1F]" />
                  <span>Database Export & Import</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Download a complete JSON snapshot of all podcast episodes, hero video links, and guest data. You can restore this archive anytime.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer border border-neutral-700"
                  >
                    <FileDown className="w-4 h-4 text-[#DD5A1F]" />
                    <span>Download JSON Backup</span>
                  </button>

                  <label className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer border border-neutral-700">
                    <FileUp className="w-4 h-4 text-[#DD5A1F]" />
                    <span>Restore from JSON File</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJSON}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Factory Reset */}
              <div className="p-5 rounded-2xl bg-red-950/20 border border-red-900/40 space-y-3">
                <div className="text-xs font-bold text-red-300 uppercase tracking-wider flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-red-400" />
                  <span>Reset to Factory Defaults</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Permanently restore all episodes, hero videos, and Hall of Fame guests back to the original default seed data.
                </p>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-4 py-2 bg-red-900/60 hover:bg-red-800 text-red-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Reset Entire Database
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-red-900/30 border border-red-800/50 flex items-center justify-center text-red-400 mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-white">Delete Episode?</h3>
              <p className="text-xs text-neutral-400">
                This will immediately remove this episode and its audio stream from the live podcast portal.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleDeleteEpisode(showDeleteConfirm)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Yes, Delete
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#DD5A1F]" />
                <span className="text-sm font-bold text-white font-display">Live Database Snapshot</span>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs text-neutral-300">
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Hero Tagline</span>
                <span className="font-semibold text-white">{dataset.heroVideos[0]?.title}</span>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">
                  Episodes in Carousel ({dataset.carouselEpisodes.length})
                </span>
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {dataset.carouselEpisodes.map((ep) => (
                    <div key={ep._id} className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="font-mono text-[#DD5A1F] font-bold mr-2">{ep.number}</span>
                        <span className="font-medium text-white">{ep.title}</span>
                        <span className="text-neutral-500 ml-2">({ep.guestName})</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 shrink-0">
                        {ep.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 bg-[#DD5A1F] hover:bg-[#B84312] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Done Reviewing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD FROM EPISODES MODAL */}
      {/* ========================================================= */}
      {showAddFromEpisodesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#DD5A1F]" />
                  <span>{modalMode === 'create' ? 'Add Episode to Hall of Fame' : 'Change Associated Episode'}</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Explicitly select an episode from carousel_episodes to associate with the Hall of Fame guest.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddFromEpisodesModal(false);
                  setSelectedEpisodeInModal(null);
                }}
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Filter */}
            <div className="p-3 border-b border-neutral-800 bg-neutral-950/50 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={addEpisodeSearchQuery}
                  onChange={(e) => setAddEpisodeSearchQuery(e.target.value)}
                  placeholder="Filter by episode number, guest name, or title..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#DD5A1F]"
                />
              </div>
            </div>

            {/* Episodes List */}
            <div className="flex-1 overflow-y-auto space-y-2 p-3">
              {dataset.carouselEpisodes
                .filter((ep) => {
                  if (!addEpisodeSearchQuery.trim()) return true;
                  const q = addEpisodeSearchQuery.toLowerCase();
                  return (
                    ep.number.toLowerCase().includes(q) ||
                    ep.title.toLowerCase().includes(q) ||
                    ep.guestName.toLowerCase().includes(q)
                  );
                })
                .map((ep) => {
                  const alreadyInHof = isEpisodeInHallOfFame(ep, modalMode === 'relink' ? guestDraft?._id : undefined);
                  const isSelected = selectedEpisodeInModal?._id === ep._id;

                  if (alreadyInHof) {
                    return (
                      <div
                        key={ep._id}
                        className="p-3 rounded-xl bg-neutral-950/40 border border-neutral-800/50 flex items-center justify-between gap-3 opacity-60 cursor-not-allowed select-none"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={ep.portraitUrl || ep.guestAvatar}
                            alt={ep.guestName}
                            className="w-12 h-12 rounded-xl object-cover bg-neutral-800 shrink-0 border border-neutral-700/60 grayscale-50"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-mono text-xs font-bold text-neutral-400">
                                {ep.number}
                              </span>
                              <span className="text-xs font-semibold text-neutral-300 truncate">
                                {ep.guestName}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-neutral-800 text-neutral-400 border border-neutral-700">
                                Already in Hall of Fame
                              </span>
                            </div>
                            <h4 className="text-xs text-neutral-400 truncate font-body">
                              {ep.title}
                            </h4>
                            <p className="text-[11px] text-neutral-500 truncate">
                              {ep.guestRole} • {ep.category}
                            </p>
                          </div>
                        </div>

                        <span className="text-[11px] text-neutral-500 font-medium px-2 py-1 bg-neutral-900 rounded-lg border border-neutral-800 shrink-0">
                          Unavailable
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={ep._id}
                      onClick={() => setSelectedEpisodeInModal(ep)}
                      className={`p-3 rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-2 border-[#DD5A1F] bg-[#DD5A1F]/10 ring-1 ring-[#DD5A1F]/40 shadow-sm'
                          : 'border border-neutral-800 hover:border-neutral-700 bg-neutral-950/70 hover:bg-neutral-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={ep.portraitUrl || ep.guestAvatar}
                          alt={ep.guestName}
                          className="w-12 h-12 rounded-xl object-cover bg-neutral-800 shrink-0 border border-neutral-700"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono text-xs font-bold text-[#DD5A1F]">
                              {ep.number}
                            </span>
                            <span className="text-xs font-semibold text-white truncate">
                              {ep.guestName}
                            </span>
                          </div>
                          <h4 className="text-xs text-neutral-300 truncate font-body">
                            {ep.title}
                          </h4>
                          <p className="text-[11px] text-neutral-400 truncate">
                            {ep.guestRole} • {ep.category}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-[#DD5A1F] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-neutral-600 hover:border-neutral-400 transition-colors" />
                        )}
                      </div>
                    </div>
                  );
                })}

              {dataset.carouselEpisodes.length === 0 && (
                <div className="py-8 text-center text-xs text-neutral-500">
                  No episodes found in carousel_episodes.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-neutral-800 bg-neutral-950/90 flex items-center justify-between text-xs shrink-0">
              <div className="min-w-0 flex-1 mr-4">
                {selectedEpisodeInModal ? (
                  <p className="text-neutral-200 truncate">
                    Selected:{' '}
                    <span className="font-mono font-bold text-[#DD5A1F]">
                      {selectedEpisodeInModal.number}
                    </span>{' '}
                    — <span className="text-white font-medium">{selectedEpisodeInModal.guestName}</span>
                  </p>
                ) : (
                  <p className="text-neutral-500 italic">
                    No episode selected. Click an episode above to select.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddFromEpisodesModal(false);
                    setSelectedEpisodeInModal(null);
                  }}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedEpisodeInModal || isPublishing}
                  onClick={handleConfirmAddFromEpisodes}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    !selectedEpisodeInModal || isPublishing
                      ? 'bg-neutral-800 text-neutral-500 opacity-50 cursor-not-allowed'
                      : 'bg-[#DD5A1F] hover:bg-[#B84312] text-white shadow-md cursor-pointer'
                  }`}
                >
                  {isPublishing ? (
                    <span>Processing...</span>
                  ) : modalMode === 'create' ? (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Hall of Fame</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Update Association</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
