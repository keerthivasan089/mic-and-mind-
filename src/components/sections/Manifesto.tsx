import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { STATS_DATA } from '../../lib/data';
import { AmbientParticles } from '../ui/AmbientParticles';
import { CountUp } from '../ui/CountUp';
import {
  IconPsychologicalDepth,
  IconTacticalExecution,
  IconSustainableScale,
} from '../ui/BrandIcons';

// Smooth scroll-triggered staggered animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const phraseItem = {
  hidden: { opacity: 0, y: 32, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.75,
      ease: [0.16, 1, 0.3, 1], // Custom smooth ease-out
    },
  },
};

const cardContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.1,
    },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const Manifesto: React.FC = () => {
  return (
    <section
      id="manifesto"
      className="py-16 sm:py-24 bg-paper text-ink relative overflow-hidden border-b border-ink/10 select-none"
      aria-label="Editorial Manifesto"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 800px' }}
    >
      {/* HTML5 Canvas Ambient Particle Background Layer with Cursor Repulsion */}
      <AmbientParticles theme="mixed" particleCount={80} mobileParticleCount={35} />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-4 sm:pt-6">
        {/* Top Floating Editorial Badges & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 mb-10 border-b border-ink/10"
        >
          <div className="flex items-center gap-3">
            <span className="text-orange text-2xl font-black leading-none">*</span>
            <span className="font-mono text-xs uppercase tracking-widest text-ink/70 font-semibold">
              Source of Raw Dialogues /
            </span>
          </div>
          <div className="flex items-center gap-6 font-mono text-xs text-ink/60">
            <span className="uppercase tracking-wider">Where vanity metrics die and authentic insight is created</span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-orange/10 text-orange font-bold border border-orange/20">
              EST. 2024
            </span>
          </div>
        </motion.div>

        {/* 1. HERO BIG EDITORIAL TYPOGRAPHY BLOCK WITH SCROLL-TRIGGERED STAGGERED PHRASE REVEAL */}
        <div className="relative my-8 sm:my-14">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="max-w-6xl"
          >
            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[5.2rem] font-bold uppercase tracking-tight leading-[0.98] text-ink flex flex-wrap items-baseline gap-x-3 sm:gap-x-4 gap-y-2">
              <motion.span variants={phraseItem} className="inline-block">
                MIC &amp; MIND CREATES
              </motion.span>

              <motion.span
                variants={phraseItem}
                className="inline-flex items-center align-middle px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-ink text-white text-xs sm:text-base md:text-lg font-mono font-normal tracking-normal border border-white/20 shadow-md transform hover:scale-105 transition-transform"
              >
                <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-orange animate-pulse mr-2" />
                Raw Audio
              </motion.span>

              <motion.span variants={phraseItem} className="inline-block text-orange">
                DIALOGUES
              </motion.span>

              <motion.span variants={phraseItem} className="inline-block text-ink/40 font-normal">
                THAT REDEFINE MODERN
              </motion.span>

              <motion.span variants={phraseItem} className="inline-block">
                FOUNDER CULTURE
              </motion.span>
            </h2>

            <motion.p
              variants={phraseItem}
              className="mt-8 font-body text-base sm:text-lg md:text-xl text-ink/75 max-w-3xl leading-relaxed font-normal"
            >
              Most podcasts celebrate polished launches and victorious exits. We cut through the PR noise, challenge scripted talking points, and unpack the psychological grit behind true breakthroughs.
            </motion.p>
          </motion.div>
        </div>

        {/* 2. CINEMATIC PORTRAIT TRIO (Staggered Upward Slide on Scroll) */}
        <motion.div
          variants={cardContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 my-14 sm:my-20"
        >
          {/* Card 1: Warm Red Studio Portrait */}
          <motion.div
            variants={cardItem}
            className="group relative h-[360px] sm:h-[420px] rounded-[28px] overflow-hidden bg-ink border border-ink/10 shadow-[0_20px_40px_rgba(28,20,15,0.08)]"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop"
              alt="Studio guest reflection"
              className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity filter contrast-125 opacity-70 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-orange/30 to-transparent opacity-90" />
            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between z-10">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-white/80 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                  Phase 01
                </span>
                <span className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-orange transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <div>
                <h4 className="font-display text-2xl text-white font-semibold mb-1">
                  Unvarnished Truth
                </h4>
                <p className="font-body text-xs text-white/75 line-clamp-2">
                  Zero rehearsed answers. We dig deep into founder crises, doubts, and recovery.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 2: High Contrast Moody Shadow Portrait */}
          <motion.div
            variants={cardItem}
            className="group relative h-[360px] sm:h-[420px] rounded-[28px] overflow-hidden bg-ink border border-ink/10 shadow-[0_20px_40px_rgba(28,20,15,0.08)]"
          >
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop"
              alt="Studio shadow lighting"
              className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity filter contrast-125 opacity-70 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-orange-deep/40 to-transparent opacity-90" />
            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between z-10">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-white/80 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                  Phase 02
                </span>
                <span className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-orange transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <div>
                <h4 className="font-display text-2xl text-white font-semibold mb-1">
                  Tactical Frameworks
                </h4>
                <p className="font-body text-xs text-white/75 line-clamp-2">
                  Extracting mental models that leaders actually use when everything is on the line.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Deep Studio Neon Focus */}
          <motion.div
            variants={cardItem}
            className="group relative h-[360px] sm:h-[420px] rounded-[28px] overflow-hidden bg-ink border border-ink/10 shadow-[0_20px_40px_rgba(28,20,15,0.08)]"
          >
            <img
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop"
              alt="Studio guest close-up"
              className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity filter contrast-125 opacity-70 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-[#8B2206]/50 to-transparent opacity-90" />
            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between z-10">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-white/80 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                  Phase 03
                </span>
                <span className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-orange transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <div>
                <h4 className="font-display text-2xl text-white font-semibold mb-1">
                  Radical Vulnerability
                </h4>
                <p className="font-body text-xs text-white/75 line-clamp-2">
                  A sanctuary for unfiltered honesty, mental wellness, and genuine reflection.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* 3. SECOND STATEMENT BANNER WITH STAGGERED PHRASE REVEAL */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="my-16 sm:my-24 py-12 border-y border-ink/10 flex flex-col items-center text-center"
        >
          <motion.span
            variants={phraseItem}
            className="font-mono text-xs uppercase tracking-widest text-orange font-bold mb-3"
          >
            The Philosophy of Unvarnished Truth
          </motion.span>
          <h3 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight text-ink max-w-4xl leading-[1.05] flex flex-wrap justify-center gap-x-3 gap-y-1">
            <motion.span variants={phraseItem} className="inline-block">
              EVERYTHING LEADERS
            </motion.span>
            <motion.span variants={phraseItem} className="inline-block text-ink/40 font-normal">
              NEED TO NAVIGATE
            </motion.span>
            <motion.span variants={phraseItem} className="inline-block text-orange">
              UNCERTAINTY
            </motion.span>
          </h3>
          <motion.p
            variants={phraseItem}
            className="mt-4 font-body text-sm sm:text-base text-ink/70 max-w-2xl"
          >
            From cognitive stamina and co-founder disputes to burnout resilience and product reinvention.
          </motion.p>
        </motion.div>

        {/* 4. MODERN PILLAR BENTO CARDS (Staggered Entrance - Light Editorial Cards) */}
        <motion.div
          variants={cardContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 my-12"
        >
          {/* Bento Card 1: Psychological Depth */}
          <motion.div
            variants={cardItem}
            className="relative rounded-3xl p-7 bg-white/95 text-ink flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-lg border border-ink/10 group hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <span className="font-mono text-[10px] uppercase text-orange font-bold tracking-widest block mb-4">
                Pillar // 01
              </span>
              <div className="w-12 h-12 rounded-2xl bg-orange/10 border border-orange/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <IconPsychologicalDepth className="w-7 h-7" />
              </div>
              <h4 className="font-display text-xl font-bold mb-2 text-ink">Psychological Depth</h4>
              <p className="font-body text-xs text-ink/70 leading-relaxed">
                Exploring internal battles, imposter feelings, and the emotional toll of building.
              </p>
            </div>
            <div className="relative z-10 pt-6 mt-6 border-t border-ink/10 flex items-center justify-between text-xs font-mono text-ink/60 group-hover:text-orange">
              <span>EXPLORE</span>
              <ArrowUpRight className="w-4 h-4 text-orange group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </motion.div>

          {/* Bento Card 2: Tactical Execution */}
          <motion.div
            variants={cardItem}
            className="relative rounded-3xl p-7 bg-white/95 text-ink flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-lg border border-ink/10 group hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8542]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <span className="font-mono text-[10px] uppercase text-orange font-bold tracking-widest block mb-4">
                Pillar // 02
              </span>
              <div className="w-12 h-12 rounded-2xl bg-orange/10 border border-orange/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <IconTacticalExecution className="w-7 h-7" />
              </div>
              <h4 className="font-display text-xl font-bold mb-2 text-ink">Tactical Execution</h4>
              <p className="font-body text-xs text-ink/70 leading-relaxed">
                Concrete decisions made when growth halted, funds dried, or pivots were mandatory.
              </p>
            </div>
            <div className="relative z-10 pt-6 mt-6 border-t border-ink/10 flex items-center justify-between text-xs font-mono text-ink/60 group-hover:text-orange">
              <span>EXPLORE</span>
              <ArrowUpRight className="w-4 h-4 text-orange group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </motion.div>

          {/* Bento Card 3: Sustainable Scale */}
          <motion.div
            variants={cardItem}
            className="relative rounded-3xl p-7 bg-white/95 text-ink flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-lg border border-ink/10 group hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <span className="font-mono text-[10px] uppercase text-orange font-bold tracking-widest block mb-4">
                Pillar // 03
              </span>
              <div className="w-12 h-12 rounded-2xl bg-orange/10 border border-orange/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <IconSustainableScale className="w-7 h-7" />
              </div>
              <h4 className="font-display text-xl font-bold mb-2 text-ink">Sustainable Scale</h4>
              <p className="font-body text-xs text-ink/70 leading-relaxed">
                Building durable organizations without destroying team culture or personal health.
              </p>
            </div>
            <div className="relative z-10 pt-6 mt-6 border-t border-ink/10 flex items-center justify-between text-xs font-mono text-ink/60 group-hover:text-orange">
              <span>EXPLORE</span>
              <ArrowUpRight className="w-4 h-4 text-orange group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </motion.div>

          {/* Bento Card 4: Glowing Editorial Highlight Card */}
          <motion.div
            variants={cardItem}
            className="relative rounded-3xl p-7 bg-gradient-to-br from-orange to-orange-deep text-white flex flex-col justify-between overflow-hidden shadow-xl border border-white/20 group hover:-translate-y-1 transition-all duration-300"
          >
            <div className="relative z-10">
              <span className="font-mono text-[10px] uppercase text-white/90 tracking-widest block mb-4 font-bold">
                Full Access
              </span>
              <h4 className="font-display text-2xl font-bold mb-2 text-white">
                Explore the World’s Leading Minds
              </h4>
              <p className="font-body text-xs text-white/90 leading-relaxed mb-4">
                Access full unedited audio archives, show notes, and transcripts.
              </p>
            </div>
            <a
              href="#episodes"
              className="relative z-10 py-2.5 px-4 rounded-full bg-white text-ink text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-between hover:bg-paper transition-colors shadow-md"
            >
              <span>Explore Now</span>
              <ArrowUpRight className="w-4 h-4 text-orange" />
            </a>
          </motion.div>
        </motion.div>

        {/* 5. METRICS BAR (Staggered Entrance) */}
        <motion.div
          variants={cardContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-12 border-t border-ink/10"
        >
          {STATS_DATA.map((stat, idx) => {
            // Parse numerical configuration for CountUp
            let toVal = 100;
            let decimals = 0;
            let suffix = '';
            if (stat.value.includes('250K+')) {
              toVal = 250;
              suffix = 'K+';
            } else if (stat.value.includes('4.9')) {
              toVal = 4.9;
              decimals = 1;
              suffix = ' ★';
            } else if (stat.value.includes('85+')) {
              toVal = 85;
              suffix = '+';
            } else if (stat.value.includes('100%')) {
              toVal = 100;
              suffix = '%';
            }

            return (
              <motion.div
                key={idx}
                variants={cardItem}
                className="p-6 rounded-2xl bg-white border border-ink/10 shadow-[0_4px_20px_rgba(28,20,15,0.03)] hover:border-orange/40 transition-colors text-center sm:text-left"
              >
                <div className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight">
                  <CountUp
                    to={toVal}
                    decimals={decimals}
                    suffix={suffix}
                    duration={1.8}
                    delay={idx * 0.12}
                  />
                </div>
                <div className="font-mono text-xs uppercase tracking-wider text-orange font-bold mt-1">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
