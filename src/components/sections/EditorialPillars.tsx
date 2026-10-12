import { useScroll } from "motion/react";
import React, { useRef } from "react";
import { LinePath } from "../ui/svg-follow-scroll";

export default function EditorialPillars() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });

  return (
    <section
      ref={ref}
      id="editorial-pillars"
      aria-label="Philosophy of Unvarnished Truth"
      className="relative mx-auto flex w-full flex-col items-center overflow-hidden bg-paper px-4 pt-24 pb-36 text-ink"
    >
      <div className="relative flex w-full max-w-5xl flex-col items-center justify-start text-center">
        <h2 className="font-mono text-sm tracking-widest text-[#DD5A1F] uppercase relative z-10 font-semibold">
          Philosophy of Unvarnished Truth
        </h2>
        <h1
          className="font-display relative z-10 text-5xl lg:text-7xl tracking-tight leading-tight mt-4"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Everything Leaders Need <br /> To Navigate Uncertainty
        </h1>

        {/* The Animated Line Background */}
        <LinePath
          className="absolute -right-[20%] top-32 z-0 opacity-40 pointer-events-none w-[1000px] lg:w-[1278px] h-auto"
          scrollYProgress={scrollYProgress}
        />

        {/* Pillar 1 */}
        <div className="relative z-10 mt-16 sm:mt-20 max-w-lg text-left self-start bg-[#F4ECD9]/95 backdrop-blur-md p-8 sm:p-9 border border-[#1C140F]/10 shadow-xl">
          <span className="text-[#DD5A1F] font-mono text-xs sm:text-sm tracking-widest uppercase font-semibold">Phase 01</span>
          <h3 className="font-display text-3xl sm:text-4xl mt-2 text-[#1C140F]">Psychological Depth</h3>
          <p className="mt-3 text-[#1C140F]/80 leading-relaxed text-base sm:text-lg">
            Exploring the internal battles, imposter syndrome, and the unseen emotional toll of building a legacy. We strip away the PR polish to reveal the raw human experience behind the visionary.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="relative z-10 mt-12 sm:mt-16 max-w-lg text-left self-end bg-[#F4ECD9]/95 backdrop-blur-md p-8 sm:p-9 border border-[#1C140F]/10 shadow-xl">
          <span className="text-[#DD5A1F] font-mono text-xs sm:text-sm tracking-widest uppercase font-semibold">Phase 02</span>
          <h3 className="font-display text-3xl sm:text-4xl mt-2 text-[#1C140F]">Tactical Execution</h3>
          <p className="mt-3 text-[#1C140F]/80 leading-relaxed text-base sm:text-lg">
            Concrete, unvarnished decisions made when growth halted, funds dried up, or aggressive pivots were mandatory. These are true playbooks, not post-rationalized success stories.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="relative z-10 mt-12 sm:mt-16 max-w-lg text-left self-start bg-[#F4ECD9]/95 backdrop-blur-md p-8 sm:p-9 border border-[#1C140F]/10 shadow-xl">
          <span className="text-[#DD5A1F] font-mono text-xs sm:text-sm tracking-widest uppercase font-semibold">Phase 03</span>
          <h3 className="font-display text-3xl sm:text-4xl mt-2 text-[#1C140F]">Radical Vulnerability</h3>
          <p className="mt-3 text-[#1C140F]/80 leading-relaxed text-base sm:text-lg">
            A dedicated sanctuary for unfiltered honesty, mental wellness, and genuine reflection. This is where founders confess the critical mistakes that nearly cost them everything.
          </p>
        </div>

        {/* Pillar 4 */}
        <div className="relative z-10 mt-12 sm:mt-16 max-w-lg text-left self-end bg-[#F4ECD9]/95 backdrop-blur-md p-8 sm:p-9 border border-[#1C140F]/10 shadow-xl">
          <span className="text-[#DD5A1F] font-mono text-xs sm:text-sm tracking-widest uppercase font-semibold">Phase 04</span>
          <h3 className="font-display text-3xl sm:text-4xl mt-2 text-[#1C140F]">The Crucible of Crisis</h3>
          <p className="mt-3 text-[#1C140F]/80 leading-relaxed text-base sm:text-lg">
            Navigating the existential threats that define leadership. We deconstruct how to maintain cognitive stamina and resolve co-founder disputes when the stakes are absolute.
          </p>
        </div>

        {/* Pillar 5 */}
        <div className="relative z-10 mt-12 sm:mt-16 max-w-lg text-left self-start bg-[#F4ECD9]/95 backdrop-blur-md p-8 sm:p-9 border border-[#1C140F]/10 shadow-xl">
          <span className="text-[#DD5A1F] font-mono text-xs sm:text-sm tracking-widest uppercase font-semibold">Phase 05</span>
          <h3 className="font-display text-3xl sm:text-4xl mt-2 text-[#1C140F]">Sustainable Scale</h3>
          <p className="mt-3 text-[#1C140F]/80 leading-relaxed text-base sm:text-lg">
            Building durable, generation-defining organizations without destroying team culture, personal health, or the foundational vision that sparked the journey in the first place.
          </p>
        </div>
      </div>
    </section>
  );
}

export { EditorialPillars };
