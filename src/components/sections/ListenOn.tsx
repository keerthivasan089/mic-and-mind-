import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Mail, 
  QrCode, 
  Copy, 
  Check, 
  Smartphone, 
  X, 
  Rss,
  Podcast,
  Radio, 
  Layers,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import {
  IconPlatformSpotify,
  IconPlatformApple,
  IconPlatformYouTube,
  IconPlatformGoogle,
  IconPlatformOvercast,
  IconPlatformRSS,
} from '../ui/BrandIcons';
import { ToolDock, ToolDockTile, type ToolDockItem } from '../ui/techstack';
import { ParticleAnimation } from '../ui/particle-animation';
import { ExpandableMap } from '../ui/expandable-map';

function platformLogo(
  label: string, 
  file: string, 
  bg: string, 
  url: string, 
  imgClass = "size-[65%] object-contain"
): ToolDockItem {
  return {
    label,
    url,
    icon: (
      <ToolDockTile className={bg}>
        <img
          src={`https://svgl.app/library/${file}.svg`}
          alt={label}
          draggable={false}
          className={imgClass}
        />
      </ToolDockTile>
    ),
  };
}

export const ListenOn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubmitted(true);
    }
  };

  const platformItems: ToolDockItem[] = [
    platformLogo("Spotify", "spotify", "bg-[#1DB954]", "https://open.spotify.com", "size-[72%] object-contain brightness-0 invert drop-shadow-sm"),
    platformLogo("Apple Podcasts", "apple", "bg-[#000000]", "https://podcasts.apple.com", "size-[72%] object-contain brightness-0 invert drop-shadow-sm"),
    platformLogo("YouTube", "youtube", "bg-[#FF0000]", "https://youtube.com", "size-[74%] object-contain brightness-0 invert drop-shadow-sm"),
    platformLogo("Patreon", "patreon", "bg-[#FF424D]", "https://patreon.com", "size-[72%] object-contain brightness-0 invert drop-shadow-sm"),
    { 
      label: "Pocket Casts", 
      url: "https://pca.st",
      icon: (
        <ToolDockTile className="bg-[#EB4A34] text-white shadow-md">
          <Radio className="size-[62%]" />
        </ToolDockTile>
      ) 
    },
    { 
      label: "Overcast", 
      url: "https://overcast.fm",
      icon: (
        <ToolDockTile className="bg-[#FC7E0F] text-white shadow-md">
          <Podcast className="size-[62%]" />
        </ToolDockTile>
      ) 
    },
  ];

  // Close QR modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowQrModal(false);
    };
    if (showQrModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showQrModal]);

  return (
    <section
      id="listen-on"
      className="relative overflow-hidden bg-paper border-b border-ink/10 py-24 sm:py-32"
      aria-label="Distribution Channels and Studio Newsletter"
    >
      {/* Background Micro Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(var(--color-ink) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Dispersed Particle Cloud — Transitions from sphere into full-viewport cloud */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <ParticleAnimation />
      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-[#1C140F] text-[#FBF6EB] px-5 py-3 rounded-full shadow-2xl border border-[#DD5A1F]/30 flex items-center gap-3 text-sm font-sans max-w-md w-full mx-4 pointer-events-auto"
          >
            <div className="w-6 h-6 rounded-full bg-[#DD5A1F] text-white flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="flex-1 font-medium text-xs sm:text-sm">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-[#FBF6EB]/60 hover:text-[#FBF6EB] p-1 cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 pointer-events-none">
        {/* Section Header */}
        <div className="relative z-20 text-center max-w-3xl mx-auto flex flex-col items-center pointer-events-auto">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-orange/30 bg-orange/10 text-orange font-luxury italic text-sm font-semibold mb-4 shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
            Distribution & Syndication
          </div>

          <h2 className="font-luxury text-5xl md:text-7xl lg:text-8xl text-ink tracking-tight font-light">
            The Archive, Everywhere
          </h2>

          <p
            className="mt-4 text-base sm:text-lg md:text-xl font-luxury italic text-ink/75 leading-relaxed max-w-2xl font-normal"
          >
            Stream in synchronized 4K video, lossless uncompressed audio, or via open decentralized feeds across any client.
          </p>

          {/* Quick-Action Utilities Bar — Center QR Launch Button with tighter spacing */}
          <div className="mt-6 flex items-center justify-center pointer-events-auto">
            <button
              onClick={() => setShowQrModal(true)}
              className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white border border-ink/20 hover:border-orange text-ink hover:text-orange text-sm font-sans font-medium transition-all shadow-xs hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <QrCode className="w-4 h-4 text-orange" />
              <span>Send Directory to Phone (QR)</span>
            </button>
          </div>
        </div>

        {/* Mac-Style Interactive Framer Motion Magnifying Dock */}
        <div id="platform-dock-anchor" className="relative mt-8 sm:mt-10 w-full min-h-[380px] sm:min-h-[440px] flex flex-col items-center justify-center overflow-visible pointer-events-auto">
          {/* Foreground Dock Content — High Z-index and fully interactive */}
          <div className="relative z-20 w-full flex flex-col items-center justify-center pointer-events-auto">
            <ToolDock items={platformItems} label="Podcast Platforms" size={136} overlap={-0.02} magnification={0.36} />
            <p
              className="mt-8 text-xs sm:text-sm font-mono uppercase tracking-wider text-ink/60 text-center select-none"
            >
              Hover to expand &bull; Click to launch platform
            </p>
          </div>
        </div>

        {/* MODAL: Send to Phone / Scan QR Code (Viewport-locked, sharp and unblurred) */}
        <AnimatePresence>
          {showQrModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 pointer-events-auto"
              onClick={() => setShowQrModal(false)} // Close when clicking outside
            >
              <motion.div
                initial={{ y: 25, scale: 0.95, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: 15, scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative bg-[#FBF6EB] border border-[#1C140F]/15 shadow-2xl p-6 sm:p-7 max-w-xs sm:max-w-sm w-full rounded-2xl flex flex-col items-center my-auto"
                onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
              >
                {/* Close Button */}
                <button 
                  onClick={() => setShowQrModal(false)}
                  className="absolute top-4 right-4 text-[#1C140F]/50 hover:text-[#DD5A1F] transition-colors cursor-pointer text-base leading-none"
                  aria-label="Close dialog"
                >
                  ✕
                </button>

                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="w-5 h-5 text-orange" />
                  <h4
                    className="font-luxury text-2xl sm:text-3xl text-ink font-normal"
                  >
                    Listen on Your Phone
                  </h4>
                </div>

                {/* QR Code Container */}
                <div className="my-4 flex flex-col items-center text-center">
                  <div className="p-3 bg-white rounded-2xl border-2 border-orange/30 shadow-md">
                    {/* High-fidelity Crisp SVG QR Pattern */}
                    <svg
                      viewBox="0 0 120 120"
                      className="w-40 h-40 text-[#1C140F]"
                      fill="currentColor"
                    >
                      {/* Corner Detection Squares */}
                      <rect x="10" y="10" width="30" height="30" rx="4" fill="#DD5A1F" />
                      <rect x="16" y="16" width="18" height="18" fill="white" />
                      <rect x="20" y="20" width="10" height="10" fill="#1C140F" />

                      <rect x="80" y="10" width="30" height="30" rx="4" fill="#DD5A1F" />
                      <rect x="86" y="16" width="18" height="18" fill="white" />
                      <rect x="90" y="20" width="10" height="10" fill="#1C140F" />

                      <rect x="10" y="80" width="30" height="30" rx="4" fill="#DD5A1F" />
                      <rect x="16" y="86" width="18" height="18" fill="white" />
                      <rect x="20" y="90" width="10" height="10" fill="#1C140F" />

                      {/* Scannable Grid Elements */}
                      <rect x="46" y="12" width="6" height="6" />
                      <rect x="56" y="12" width="16" height="6" />
                      <rect x="46" y="22" width="8" height="8" />
                      <rect x="60" y="24" width="8" height="6" />
                      <rect x="50" y="34" width="14" height="6" />

                      <rect x="12" y="46" width="8" height="8" />
                      <rect x="24" y="50" width="12" height="6" />
                      <rect x="12" y="60" width="6" height="12" />
                      <rect x="24" y="62" width="14" height="6" />

                      <rect x="46" y="46" width="10" height="10" fill="#DD5A1F" />
                      <rect x="62" y="46" width="12" height="6" />
                      <rect x="80" y="46" width="6" height="12" />
                      <rect x="92" y="46" width="16" height="6" />

                      <rect x="46" y="62" width="8" height="10" />
                      <rect x="60" y="58" width="14" height="6" />
                      <rect x="80" y="64" width="12" height="8" />
                      <rect x="98" y="58" width="10" height="14" />

                      <rect x="46" y="80" width="6" height="14" />
                      <rect x="58" y="80" width="14" height="6" />
                      <rect x="78" y="80" width="10" height="8" />
                      <rect x="94" y="80" width="14" height="8" />

                      <rect x="50" y="98" width="16" height="8" />
                      <rect x="72" y="94" width="10" height="12" />
                      <rect x="88" y="94" width="20" height="8" />
                    </svg>
                  </div>

                  <div className="mt-4 flex flex-col items-center gap-1.5 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ink/5 border border-ink/10 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-ink/80 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange animate-ping" />
                      Universal Lens Hand-Off
                    </span>
                    <p className="font-mono text-[11px] sm:text-xs text-ink/65 tracking-tight max-w-[270px] leading-relaxed">
                      Point device camera to sync directory &bull; Instant hand-off to native client
                    </p>
                  </div>
                </div>

                {/* Direct App Deep Links */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-ink/10 w-full">
                  <a
                    href="https://podcasts.apple.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-white border border-ink/10 hover:border-orange text-center flex flex-col items-center gap-1 transition-all"
                  >
                    <IconPlatformApple className="w-5 h-5" />
                    <span className="text-[11px] font-semibold text-ink font-sans">Apple Podcasts</span>
                  </a>
                  <a
                    href="https://open.spotify.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-white border border-ink/10 hover:border-orange text-center flex flex-col items-center gap-1 transition-all"
                  >
                    <IconPlatformSpotify className="w-5 h-5" />
                    <span className="text-[11px] font-semibold text-ink font-sans">Spotify Mobile</span>
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* THE FRIDAY BRIEFING LEDGER — Tactile Editorial Memo */}
        <div className="mt-20 sm:mt-28 relative pointer-events-auto">
          {/* Subtle Ambient Glow */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-orange/20 via-[#FF8542]/15 to-orange/20 rounded-[38px] blur-2xl opacity-70 pointer-events-none" />

          {/* Physical Editorial Ledger Container */}
          <div className="relative rounded-[32px] bg-[#FAF6EE] text-ink p-8 sm:p-12 md:p-16 border-2 border-ink/15 shadow-[0_20px_50px_rgba(28,20,15,0.08)] overflow-hidden">
            {/* Background Vintage Watermarks */}
            <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-orange/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-[#FF8542]/10 blur-3xl pointer-events-none" />

            {/* Corner Physical Stamp Decoration */}
            <div className="absolute top-6 right-6 sm:top-8 sm:right-8 opacity-25 pointer-events-none select-none hidden sm:block">
              <div className="border-2 border-dashed border-ink p-2 rounded-lg rotate-12 text-center">
                <span className="font-mono text-[10px] uppercase tracking-widest font-bold block text-ink">
                  M&M PRESS
                </span>
                <span className="font-mono text-[8px] uppercase tracking-wider block text-ink">
                  OFFICIAL DISPATCH
                </span>
              </div>
            </div>

            <div className="relative z-10 max-w-3xl mx-auto text-center">
              {/* Ledger Metadata Badge */}
              <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white border border-ink/15 shadow-xs mb-6 text-ink/80 text-xs font-mono font-medium">
                <span className="inline-flex items-center gap-1.5 text-orange font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-orange" />
                  DISPATCH #049
                </span>
                <span>&bull;</span>
                <span>EVERY FRIDAY 06:00 EST</span>
                <span>&bull;</span>
                <span className="text-ink font-semibold">45,820+ SUBSCRIBERS</span>
              </div>

              {/* Headline */}
              <h3
                className="font-luxury text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-ink leading-tight mb-4"
              >
                The Quiet Lessons Behind <br className="hidden sm:inline" />
                <span className="font-luxury italic text-orange">Every Breakthrough</span>
              </h3>

              <p
                className="font-luxury italic text-lg sm:text-xl text-ink/80 leading-relaxed max-w-2xl mx-auto mb-8 font-normal"
              >
                What gets said when the studio recording stops is usually what matters most. Every Friday morning, we send unreleased audio cuts, raw post-mortems, and tactical frameworks directly to your inbox.
              </p>

              {/* Editorial Benefit Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-10 max-w-xl mx-auto">
                <span className="px-3 py-1 rounded-lg bg-white/90 border border-ink/10 text-ink text-xs font-luxury italic shadow-2xs">
                  🎧 Uncut Founder Audio Snippets
                </span>
                <span className="px-3 py-1 rounded-lg bg-white/90 border border-ink/10 text-ink text-xs font-luxury italic shadow-2xs">
                  ⚡ Tactical Decision Frameworks
                </span>
                <span className="px-3 py-1 rounded-lg bg-white/90 border border-ink/10 text-ink text-xs font-luxury italic shadow-2xs">
                  📖 Curated Executive Reading List
                </span>
                <span className="px-3 py-1 rounded-lg bg-white/90 border border-ink/10 text-ink text-xs font-luxury italic shadow-2xs">
                  🧠 Founder Mental Models
                </span>
              </div>

              {/* Subscription Form */}
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border-2 border-orange/40 rounded-2xl p-7 text-center max-w-md mx-auto shadow-lg"
                >
                  <div className="w-14 h-14 rounded-full bg-orange/15 text-orange flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4
                    className="font-luxury text-2xl sm:text-3xl text-ink font-normal mb-1.5"
                  >
                    You’re in the inner circle.
                  </h4>
                  <p
                    className="font-luxury italic text-base text-ink/80 leading-relaxed"
                  >
                    Your first unedited Friday briefing arrives this week. Keep an eye on your inbox for Dispatch #049.
                  </p>
                </motion.div>
              ) : (
                <form
                  id="newsletter-signup-form"
                  onSubmit={handleSubmit}
                  className="max-w-xl mx-auto flex flex-col sm:flex-row items-stretch gap-3"
                >
                  {/* High-Contrast Input Field */}
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-ink/40">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="newsletter-email-input"
                      type="email"
                      required
                      placeholder="Enter your executive email address..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white focus:bg-white border-2 border-ink/15 focus:border-orange focus:ring-2 focus:ring-orange/20 text-ink placeholder-ink/40 text-sm font-sans outline-none transition-all shadow-xs"
                      aria-label="Email address for newsletter"
                    />
                  </div>

                  {/* High-Contrast Action Button */}
                  <button
                    id="newsletter-submit-button"
                    type="submit"
                    className="px-8 py-4 rounded-2xl bg-orange hover:bg-orange-deep text-white text-base font-luxury italic font-medium flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap"
                  >
                    <span>Receive Friday Briefing</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* STUDIO PHYSICAL LOCATION — Embedded inside the Dispatch Box with Hover Animation */}
              <div className="mt-8 pt-6 border-t border-ink/10">
                <ExpandableMap />
              </div>

              {/* Reassurances Trust Strip */}
              <div
                className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm font-luxury italic text-ink/75"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-orange" />
                  Zero sponsored spam, ever
                </span>
                <span>&bull;</span>
                <span>1-Click instantaneous unsubscribe</span>
                <span>&bull;</span>
                <span>100% Free & independent forever</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

