"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ExternalLink, Compass } from "lucide-react";

export function ExpandableMap() {
  const [isHovered, setIsHovered] = useState(false);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    leaveTimerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 180);
  };

  const googleMapsUrl =
    "https://www.google.com/maps/place/PRQJ%2BH49,+Bagalur+Hudco,+Avalapalli+Hudco,+Tamil+Nadu+635109/@12.7390104,77.8305063,19z";

  return (
    <div className="w-full my-6 flex justify-center pointer-events-auto">
      <motion.div
        layout
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsHovered((prev) => !prev)}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className={`relative overflow-hidden bg-white/90 backdrop-blur-md border border-ink/15 shadow-md transition-all duration-300 w-full ${
          isHovered
            ? "max-w-2xl h-[380px] sm:h-[420px] rounded-3xl shadow-2xl border-orange/40"
            : "max-w-xl h-auto rounded-2xl p-4 sm:p-5 cursor-pointer hover:border-orange/40 hover:shadow-xl hover:-translate-y-0.5"
        }`}
      >
        <AnimatePresence mode="wait">
          {!isHovered ? (
            /* COLLAPSED DISPATCH LOCATION CARD */
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-orange/10 text-orange flex items-center justify-center shrink-0 border border-orange/20 shadow-2xs group-hover:scale-105 transition-transform">
                  <MapPin className="w-5 h-5 text-orange" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-ink/60 font-semibold">
                      HQ Studio Location
                    </p>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="font-luxury text-xl sm:text-2xl text-ink font-normal tracking-tight">
                    Hosur, Tamil Nadu
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-ink/10 text-right">
                <span className="text-[11px] font-mono text-ink/60">
                  12.7390° N, 77.8305° E
                </span>
                <span className="text-[11px] font-mono text-orange font-medium flex items-center gap-1 mt-0.5">
                  <Compass className="w-3 h-3 text-orange animate-spin" style={{ animationDuration: "12s" }} />
                  Hover to view studio map &rarr;
                </span>
              </div>
            </motion.div>
          ) : (
            /* HOVER-EXPANDED INTERACTIVE LOCATION SCREEN */
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full flex flex-col"
            >
              {/* Top Floating Header */}
              <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
                <div className="bg-[#FAF6EE]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-ink/15 shadow-md flex items-center gap-2 pointer-events-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-luxury text-base text-ink font-medium">
                    Hosur, Tamil Nadu
                  </span>
                  <span className="text-[11px] font-mono text-ink/60 hidden sm:inline">
                    (12.7390° N, 77.8305° E)
                  </span>
                </div>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-[#FAF6EE]/95 backdrop-blur-md border border-ink/15 shadow-md text-ink/70 hover:text-orange hover:border-orange transition-all cursor-pointer flex items-center justify-center pointer-events-auto"
                  title="Open in Google Maps"
                  aria-label="Open in Google Maps"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Exact Google Maps Embed with Premium Editorial Filter */}
              <div className="w-full h-full bg-[#FAF6EE]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d362.49640445946176!2d77.83050627046413!3d12.739010414635096!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae70ce7ac8cdb3%3A0x4a96bd5db12497c!2sPRQJ%2BH49%2C%20Bagalur%20Hudco%2C%20Avalapalli%20Hudco%2C%20Tamil%20Nadu%20635109!5e0!3m2!1sen!2sin!4v1790620679231!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{
                    border: 0,
                    filter: "grayscale(100%) contrast(110%) opacity(0.8) sepia(20%) hue-rotate(-10deg)",
                  }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>

              {/* Bottom Subtle Overlay Label */}
              <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none flex items-center justify-between">
                <div className="bg-[#FAF6EE]/95 backdrop-blur-md px-3 py-1 rounded-xl border border-ink/15 shadow-sm text-[11px] font-mono text-ink/80 pointer-events-auto flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-orange" />
                  <span>Recording Sanctuary &bull; Hosur Studio HQ</span>
                </div>
                <div className="text-[10px] font-mono text-ink/50 bg-[#FAF6EE]/80 px-2 py-0.5 rounded-md hidden sm:block pointer-events-auto">
                  Move cursor out to collapse
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
