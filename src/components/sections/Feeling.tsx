import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

export const Feeling: React.FC = () => {
  const [activeWord, setActiveWord] = useState<string | null>(null);

  const feelings = [
    { word: 'Inspired.', description: 'Ready to build what others deemed impossible.' },
    { word: 'Motivated.', description: 'Fueled by real stories of resilience, not hollow platitudes.' },
    { word: 'Curious.', description: 'Questioning default assumptions and seeking deeper truths.' },
    { word: 'Empowered.', description: 'Equipped with hard-won frameworks for your next leap.' },
  ];

  return (
    <section
      id="feeling"
      className="py-32 sm:py-44 bg-ink text-paper border-b border-paper/10 relative overflow-hidden select-none"
    >
      {/* Ambient Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-orange font-mono text-xs uppercase tracking-widest mb-12">
          <Sparkles className="w-3.5 h-3.5" />
          The After-Effect
        </div>

        {/* The 4 Outlined Words - Expansive Editorial Scale */}
        <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-6 my-4">
          {feelings.map((item, idx) => {
            const isHovered = activeWord === item.word;
            return (
              <div
                key={idx}
                onMouseEnter={() => setActiveWord(item.word)}
                onMouseLeave={() => setActiveWord(null)}
                className="cursor-pointer py-1.5 group"
              >
                <h2
                  className={`font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-normal tracking-tight leading-none text-stroke-cream transition-all duration-300 ${
                    isHovered ? 'scale-[1.02]' : ''
                  }`}
                >
                  {item.word}
                </h2>
              </div>
            );
          })}
        </div>

        {/* Supporting line */}
        <div className="mt-16 max-w-2xl mx-auto min-h-[48px] flex items-center justify-center">
          <p className="font-body text-base sm:text-xl text-paper/70 leading-relaxed transition-all duration-300 font-light">
            {activeWord ? (
              <span className="text-orange font-medium">
                {feelings.find((f) => f.word === activeWord)?.description}
              </span>
            ) : (
              <span>
                Every conversation is crafted to shift your perspective and leave you with genuine clarity.
              </span>
            )}
          </p>
        </div>
      </div>
    </section>
  );
};
