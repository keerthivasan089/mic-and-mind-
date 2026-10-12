import React from 'react';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  align?: 'left' | 'center' | 'right';
  theme?: 'light' | 'dark';
  className?: string;
  id?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  theme = 'light',
  className = '',
  id,
}) => {
  const alignStyles = {
    left: 'text-left items-start',
    center: 'text-center items-center mx-auto',
    right: 'text-right items-end ml-auto',
  };

  const isDark = theme === 'dark';

  return (
    <div id={id} className={`flex flex-col max-w-3xl ${alignStyles[align]} ${className}`}>
      {eyebrow && (
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-orange/30 bg-orange/10 text-orange font-mono text-xs uppercase tracking-widest font-semibold mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
          {eyebrow}
        </div>
      )}
      
      <h2
        className={`font-display text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight leading-[1.12] ${
          isDark ? 'text-paper' : 'text-ink'
        }`}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className={`mt-5 text-base sm:text-lg font-body leading-relaxed max-w-2xl font-normal ${
            isDark ? 'text-paper/75' : 'text-ink/70'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
