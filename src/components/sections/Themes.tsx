import React from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import { THEMES_DATA } from '../../lib/data';
import { ArrowRight } from 'lucide-react';
import { AmbientParticles } from '../ui/AmbientParticles';
import {
  IconEntrepreneurship,
  IconGrowthMindset,
  IconFailureRecovery,
  IconConnection,
} from '../ui/BrandIcons';

interface ThemesProps {
  onSelectCategory?: (categoryName: string) => void;
}

export const Themes: React.FC<ThemesProps> = ({ onSelectCategory }) => {
  const brandIconMap: Record<string, React.ReactNode> = {
    Rocket: <IconEntrepreneurship className="w-8 h-8 group-hover:scale-110 transition-transform duration-200" />,
    Sparkles: <IconGrowthMindset className="w-8 h-8 group-hover:scale-110 transition-transform duration-200" />,
    RefreshCw: <IconFailureRecovery className="w-8 h-8 group-hover:scale-110 transition-transform duration-200" />,
    HeartHandshake: <IconConnection className="w-8 h-8 group-hover:scale-110 transition-transform duration-200" />,
  };

  return (
    <section
      id="themes"
      className="py-28 sm:py-36 bg-paper border-b border-ink/10 relative overflow-hidden"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 800px' }}
    >
      {/* HTML5 Canvas Ambient Particle Background Layer */}
      <AmbientParticles theme="mixed" particleCount={80} mobileParticleCount={35} />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <SectionHeading
          eyebrow="Core Editorial Pillars"
          title="The Four Cornerstones of Every Conversation"
          subtitle="We avoid surface-level fluff. Every guest sits down to explore at least one of these dimensions in authentic, tactical detail."
          align="center"
        />

        {/* 4-column spacious responsive grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {THEMES_DATA.map((theme) => (
            <div
              key={theme.id}
              id={`theme-card-${theme.id}`}
              onClick={() => onSelectCategory && onSelectCategory(theme.title)}
              className="elegant-card rounded-3xl p-8 flex flex-col justify-between group cursor-pointer border border-ink/10 hover:border-orange/40 bg-white/95 backdrop-blur-sm shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                {/* Refined Custom Brand Mascot Icon Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-orange/10 border border-orange/20 flex items-center justify-center group-hover:bg-orange/20 transition-colors duration-200 shadow-xs">
                    {brandIconMap[theme.iconName] || <span className="text-2xl">{theme.badgeEmoji}</span>}
                  </div>
                  <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-orange bg-orange/10 px-3 py-1 rounded-full border border-orange/20">
                    Topic // 0{THEMES_DATA.indexOf(theme) + 1}
                  </span>
                </div>

                {/* Heading */}
                <h3 className="font-display text-2xl sm:text-3xl font-normal text-ink mb-3 group-hover:text-orange transition-colors">
                  {theme.title}
                </h3>

                {/* Description */}
                <p className="font-body text-sm text-ink/70 leading-relaxed">
                  {theme.description}
                </p>
              </div>

              {/* Action link */}
              <div className="mt-8 pt-6 border-t border-ink/10 flex items-center justify-between text-xs font-display font-medium text-ink/80 group-hover:text-orange">
                <span>Explore Stories</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
