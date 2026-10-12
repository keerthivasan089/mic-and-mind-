import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Search,
  Download,
  Copy,
  Check,
  Play,
  Pause,
  Clock,
  Sparkles,
  BookOpen,
  Quote,
  Filter,
  FileText,
  Bookmark,
  Share2,
  ExternalLink,
  ChevronRight,
  ListOrdered,
  Users,
} from 'lucide-react';
import { Episode } from '../../types';
import {
  EpisodeTranscript,
  fetchEpisodeTranscript,
  formatTranscriptForExport,
  TranscriptSegment,
} from '../../lib/transcriptService';

interface TranscriptModalProps {
  episode: Episode | null;
  isOpen: boolean;
  onClose: () => void;
  isPlaying?: boolean;
  onPlayEpisode?: (episode: Episode) => void;
}

type TabMode = 'all' | 'chapters' | 'quotes';

export const TranscriptModal: React.FC<TranscriptModalProps> = ({
  episode,
  isOpen,
  onClose,
  isPlaying = false,
  onPlayEpisode,
}) => {
  const [transcript, setTranscript] = useState<EpisodeTranscript | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<TabMode>('all');
  const [copied, setCopied] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch transcript data whenever selected episode changes
  useEffect(() => {
    if (!episode || !isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setSearchQuery('');
    setSelectedSpeaker('all');
    setActiveTab('all');

    fetchEpisodeTranscript(episode.id)
      .then((data) => {
        if (isMounted) {
          setTranscript(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load transcript:', err);
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [episode, isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Copy full transcript to clipboard
  const handleCopyTranscript = async () => {
    if (!transcript) return;
    const formatted = formatTranscriptForExport(transcript);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(formatted);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = formatted;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Could not copy transcript', err);
    }
  };

  // Download transcript as text file
  const handleDownloadTranscript = () => {
    if (!transcript) return;
    const formatted = formatTranscriptForExport(transcript);
    const blob = new Blob([formatted], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MicAndMind_${transcript.episodeNumber.replace(/[\s.]+/g, '_')}_Transcript.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered segments based on tab, search query, and speaker filter
  const filteredSegments = useMemo(() => {
    if (!transcript) return [];

    return transcript.segments.filter((seg) => {
      // Tab filter
      if (activeTab === 'quotes' && !seg.isKeyQuote) {
        return false;
      }

      // Speaker filter
      if (selectedSpeaker !== 'all' && seg.speakerId !== selectedSpeaker) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesText = seg.text.toLowerCase().includes(q);
        const matchesSpeaker = seg.speakerName.toLowerCase().includes(q);
        const matchesTimestamp = seg.timestamp.includes(q);
        return matchesText || matchesSpeaker || matchesTimestamp;
      }

      return true;
    });
  }, [transcript, activeTab, selectedSpeaker, searchQuery]);

  // Highlight matching search text
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="bg-[#DD5A1F]/30 text-[#DD5A1F] font-semibold px-1 py-0.5 rounded-sm"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (!isOpen || !episode) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-in fade-in duration-200">
      {/* Darkened Backdrop */}
      <div
        className="fixed inset-0 bg-[#0E0A08]/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side-Panel Drawer Container */}
      <aside
        id="episode-transcript-panel"
        aria-label={`Transcript for ${episode.title}`}
        className="relative z-10 w-full max-w-2xl lg:max-w-3xl h-full bg-ink text-paper border-l border-white/10 shadow-2xl flex flex-col transform transition-transform ease-out duration-300 animate-in slide-in-from-right-8"
      >
        {/* Panel Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-ink/90 backdrop-blur-md shrink-0 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-1 rounded-md bg-orange/20 text-orange font-mono text-xs font-bold uppercase tracking-wider border border-orange/30">
                  {episode.number}
                </span>
                <span className="font-mono text-xs text-white/50 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange" />
                  {episode.duration}
                </span>
                {transcript && (
                  <span className="font-mono text-xs text-white/50 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-[#FF8542]" />
                    ~{transcript.wordCount.toLocaleString()} words
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-[11px] font-mono">
                  {episode.category}
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-paper leading-tight mt-1">
                {episode.title}
              </h2>
              <p className="text-xs sm:text-sm text-white/70 font-body">
                Featuring <span className="font-semibold text-white">{episode.guest.name}</span> — {episode.guest.role}
              </p>
            </div>

            {/* Close & Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {onPlayEpisode && (
                <button
                  onClick={() => onPlayEpisode(episode)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isPlaying
                      ? 'bg-white text-ink ring-2 ring-orange'
                      : 'bg-orange text-white hover:bg-orange-deep'
                  }`}
                  title={isPlaying ? 'Pause full episode' : 'Play full episode'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
                </button>
              )}

              <button
                onClick={onClose}
                id="close-transcript-modal-btn"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close Transcript (Esc)"
                aria-label="Close Transcript"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Toolbar: Copy, Download, Tab Switching */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
            {/* View Mode Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10 text-xs font-medium">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[#DD5A1F] text-white shadow-xs'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Dialogue</span>
              </button>
              <button
                onClick={() => setActiveTab('chapters')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'chapters'
                    ? 'bg-[#DD5A1F] text-white shadow-xs'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Chapters</span>
              </button>
              <button
                onClick={() => setActiveTab('quotes')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'quotes'
                    ? 'bg-[#DD5A1F] text-white shadow-xs'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Quote className="w-3.5 h-3.5" />
                <span>Key Quotes</span>
              </button>
            </div>

            {/* Utility Buttons: Copy & Download */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyTranscript}
                disabled={isLoading || !transcript}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-body font-medium text-white/90 transition-all flex items-center gap-1.5 cursor-pointer border border-white/10 disabled:opacity-50"
                title="Copy Full Transcript to Clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-green-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-white/70" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadTranscript}
                disabled={isLoading || !transcript}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-body font-medium text-white/90 transition-all flex items-center gap-1.5 cursor-pointer border border-white/10 disabled:opacity-50"
                title="Download .TXT File"
              >
                <Download className="w-3.5 h-3.5 text-white/70" />
                <span>Download .txt</span>
              </button>
            </div>
          </div>

          {/* Search & Speaker Filter Bar (shown on dialogue & quotes tabs) */}
          {activeTab !== 'chapters' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search keywords, speakers, or topics..."
                  className="w-full bg-black/50 border border-white/15 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#DD5A1F] focus:ring-1 focus:ring-[#DD5A1F] transition-all font-body"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Speaker Select Filter */}
              {transcript && transcript.speakers.length > 0 && (
                <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-[11px] font-mono text-white/50 flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#DD5A1F]" />
                  </span>
                  <button
                    onClick={() => setSelectedSpeaker('all')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      selectedSpeaker === 'all'
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    All Speakers
                  </button>
                  {transcript.speakers.map((spk) => (
                    <button
                      key={spk.id}
                      onClick={() => setSelectedSpeaker(spk.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                        selectedSpeaker === spk.id
                          ? 'bg-[#DD5A1F] text-white font-semibold'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {spk.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panel Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-6 animate-pulse py-8">
              <div className="h-4 bg-white/10 rounded w-1/3" />
              <div className="space-y-3">
                <div className="h-4 bg-white/10 rounded w-4/5" />
                <div className="h-4 bg-white/10 rounded w-full" />
                <div className="h-4 bg-white/10 rounded w-3/4" />
              </div>
              <div className="space-y-3 pt-6">
                <div className="h-4 bg-white/10 rounded w-2/5" />
                <div className="h-4 bg-white/10 rounded w-full" />
                <div className="h-4 bg-white/10 rounded w-5/6" />
              </div>
            </div>
          )}

          {/* Chapters & Outlines View */}
          {!isLoading && activeTab === 'chapters' && transcript && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Executive Summary Card */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="font-mono text-xs uppercase tracking-wider text-[#DD5A1F] font-bold mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Executive Summary
                </h3>
                <p className="text-sm font-body text-white/90 leading-relaxed">
                  {transcript.summary}
                </p>
              </div>

              {/* Key Takeaways Card */}
              <div className="p-4 rounded-2xl bg-[#DD5A1F]/10 border border-[#DD5A1F]/30">
                <h3 className="font-mono text-xs uppercase tracking-wider text-[#FF8542] font-bold mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Key Takeaways & Frameworks
                </h3>
                <ul className="space-y-2.5">
                  {transcript.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-white/90 font-body">
                      <span className="w-5 h-5 rounded-full bg-[#DD5A1F]/30 text-[#FF8542] flex items-center justify-center shrink-0 font-mono text-[11px] font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Chapters List */}
              <div className="space-y-3 pt-2">
                <h3 className="font-mono text-xs uppercase tracking-wider text-white/60 font-bold">
                  Chapter Directory & Timestamps
                </h3>
                <div className="divide-y divide-white/10 rounded-2xl bg-black/40 border border-white/10 overflow-hidden">
                  {transcript.chapters.map((chap) => (
                    <div
                      key={chap.id}
                      onClick={() => {
                        setActiveTab('all');
                        setSearchQuery(chap.title.split(' ')[0]);
                      }}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-white/5 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-md bg-white/10 font-mono text-xs text-[#DD5A1F] font-bold">
                          {chap.timestamp}
                        </span>
                        <span className="font-display font-medium text-sm sm:text-base text-white group-hover:text-[#FF8542] transition-colors">
                          {chap.title}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Dialogue & Quotes Streams */}
          {!isLoading && activeTab !== 'chapters' && (
            <div className="space-y-6">
              {/* Search match stats */}
              {searchQuery && (
                <div className="text-xs font-mono text-white/60 flex items-center justify-between border-b border-white/10 pb-3">
                  <span>
                    Showing {filteredSegments.length} match{filteredSegments.length === 1 ? '' : 'es'} for &ldquo;
                    <span className="text-[#DD5A1F] font-bold">{searchQuery}</span>&rdquo;
                  </span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-[#FF8542] hover:underline cursor-pointer"
                  >
                    Clear filter
                  </button>
                </div>
              )}

              {filteredSegments.length === 0 ? (
                <div className="py-12 text-center text-white/50 space-y-2">
                  <Search className="w-8 h-8 text-white/30 mx-auto" />
                  <p className="font-display text-base">No dialogue matched your query</p>
                  <p className="text-xs font-body text-white/40">Try searching for other words or reset the speaker filter.</p>
                </div>
              ) : (
                filteredSegments.map((segment) => {
                  const isHost = segment.speakerId === 'alex';

                  return (
                    <div
                      key={segment.id}
                      className={`p-4 sm:p-5 rounded-2xl transition-all border ${
                        segment.isKeyQuote
                          ? 'bg-[#DD5A1F]/10 border-[#DD5A1F]/40 shadow-sm'
                          : isHost
                          ? 'bg-black/30 border-white/10'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      {/* Segment Speaker & Time Header */}
                      <div className="flex items-center justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-display text-sm font-bold ${
                              isHost ? 'text-[#FF8542]' : 'text-white'
                            }`}
                          >
                            {segment.speakerName}
                          </span>
                          <span className="text-xs text-white/50 font-body hidden sm:inline">
                            • {segment.speakerRole}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {segment.isKeyQuote && (
                            <span className="px-2 py-0.5 rounded-full bg-[#DD5A1F]/30 text-[#FF8542] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                              <Quote className="w-2.5 h-2.5" />
                              Key Quote
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-md bg-white/10 font-mono text-xs text-white/70">
                            {segment.timestamp}
                          </span>
                        </div>
                      </div>

                      {/* Segment Spoken Text */}
                      <p
                        className={`text-sm sm:text-[15px] leading-relaxed font-body ${
                          segment.isKeyQuote
                            ? 'text-white font-medium italic'
                            : 'text-white/85'
                        }`}
                      >
                        {renderHighlightedText(segment.text, searchQuery)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Panel Footer */}
        <div className="p-4 px-6 border-t border-white/10 bg-ink shrink-0 flex items-center justify-between text-xs text-white/50 font-mono">
          <span>Mic & Mind Official Transcript Archive</span>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors cursor-pointer font-semibold underline underline-offset-4"
          >
            Close Viewer
          </button>
        </div>
      </aside>
    </div>
  );
};
