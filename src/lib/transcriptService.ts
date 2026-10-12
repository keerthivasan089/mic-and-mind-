// Mock Data Service for Episode Transcripts
// Simulates an asynchronous backend API with search, chapters, key quotes, and download utilities.

export interface TranscriptSpeaker {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface TranscriptChapter {
  id: string;
  title: string;
  startSeconds: number;
  timestamp: string;
}

export interface TranscriptSegment {
  id: string;
  speakerId: string;
  speakerName: string;
  speakerRole: string;
  timestamp: string;
  timeSeconds: number;
  text: string;
  isKeyQuote?: boolean;
  chapterId?: string;
  tags?: string[];
}

export interface EpisodeTranscript {
  episodeId: string;
  episodeNumber: string;
  episodeTitle: string;
  recordedDate: string;
  duration: string;
  wordCount: number;
  summary: string;
  keyTakeaways: string[];
  speakers: TranscriptSpeaker[];
  chapters: TranscriptChapter[];
  segments: TranscriptSegment[];
}

const MOCK_TRANSCRIPTS: Record<string, EpisodeTranscript> = {
  'ep-042': {
    episodeId: 'ep-042',
    episodeNumber: 'EP. 042',
    episodeTitle: 'From $0 to $30M: The Unspoken Toll of Hypergrowth',
    recordedDate: 'August 18, 2026',
    duration: '58 min',
    wordCount: 8420,
    summary:
      'Maya Lin, Founder and CEO of Lumina Craft, details the chaotic reality behind rapid DTC expansion, scaling supply chains amidst global shortages, combating CEO isolation, and finding sustainable equilibrium.',
    keyTakeaways: [
      'Hypergrowth amplifies all existing organizational flaws tenfold.',
      'Speed without deliberate operational architecture creates technical and emotional debt.',
      'Delegating executive authority requires trusting people who know more than you do in their domain.',
      'Protecting personal psychological margin is the single highest ROI investment a founder can make.',
    ],
    speakers: [
      {
        id: 'alex',
        name: 'Alex Mercer',
        role: 'Host, Mic & Mind',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      },
      {
        id: 'maya',
        name: 'Maya Lin',
        role: 'Founder & CEO, Lumina Craft',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
      },
    ],
    chapters: [
      { id: 'c1', title: 'The 3:00 AM Viral Catalyst', startSeconds: 0, timestamp: '00:00' },
      { id: 'c2', title: 'Supply Chain Meltdowns & Port Bottlenecks', startSeconds: 740, timestamp: '12:20' },
      { id: 'c3', title: 'Executive Hiring & Psychological Margin', startSeconds: 1680, timestamp: '28:00' },
      { id: 'c4', title: 'Sustaining Humanity at Scale', startSeconds: 2700, timestamp: '45:00' },
    ],
    segments: [
      {
        id: 'seg-1',
        speakerId: 'alex',
        speakerName: 'Alex Mercer',
        speakerRole: 'Host, Mic & Mind',
        timestamp: '00:00',
        timeSeconds: 0,
        chapterId: 'c1',
        text: 'Welcome back to Mic & Mind. Today I am sitting down with Maya Lin, founder of Lumina Craft. Maya, in late 2024 you were doing modest numbers, and within eighteen months you crossed thirty million in annualized revenue. On LinkedIn, that looks like a clean diagonal arrow straight up to the moon. What did it actually feel like on the ground?',
      },
      {
        id: 'seg-2',
        speakerId: 'maya',
        speakerName: 'Maya Lin',
        speakerRole: 'Founder & CEO, Lumina Craft',
        timestamp: '00:45',
        timeSeconds: 45,
        chapterId: 'c1',
        isKeyQuote: true,
        text: 'It felt like running down a steep gravel hill in rollerblades while trying to build a parachute out of dental floss. Everyone congratulates you on the top-line volume, but nobody sees the 3:00 AM panic checks when Stripe halts payouts or customs holds six shipping containers in Long Beach.',
      },
      {
        id: 'seg-3',
        speakerId: 'alex',
        speakerName: 'Alex Mercer',
        speakerRole: 'Host, Mic & Mind',
        timestamp: '02:10',
        timeSeconds: 130,
        chapterId: 'c1',
        text: 'Take us back to that first viral weekend. Was there a specific moment where you realized the system you built was about to break under its own weight?',
      },
      {
        id: 'seg-4',
        speakerId: 'maya',
        speakerName: 'Maya Lin',
        speakerRole: 'Founder & CEO, Lumina Craft',
        timestamp: '02:50',
        timeSeconds: 170,
        chapterId: 'c1',
        text: 'We had an unboxing video hit 14 million views in 48 hours. Our Shopify dashboard chime was firing like a machine gun. By Sunday morning, we had 42,000 unfulfilled backorders and inventory for maybe 4,000. My co-founder and I were in the warehouse taping cardboard boxes until our thumbs bled.',
      },
      {
        id: 'seg-5',
        speakerId: 'alex',
        speakerName: 'Alex Mercer',
        speakerRole: 'Host, Mic & Mind',
        timestamp: '12:20',
        timeSeconds: 740,
        chapterId: 'c2',
        text: 'Let us talk about the supply chain pivot. Most founders panic and compromise quality just to push units out the door. How did you maintain brand integrity when suppliers were threatening 12-week delays?',
      },
      {
        id: 'seg-6',
        speakerId: 'maya',
        speakerName: 'Maya Lin',
        speakerRole: 'Founder & CEO, Lumina Craft',
        timestamp: '13:05',
        timeSeconds: 785,
        chapterId: 'c2',
        isKeyQuote: true,
        text: 'We made the radical decision to email every single customer directly with raw, unvarnished honesty. We didn’t send generic corporate PR jargon. We said: "Here is a picture of our supplier’s factory, here is where your package is, and here is a full refund plus a handwritten gift if you choose to wait." We lost less than 2% of pre-orders.',
      },
      {
        id: 'seg-7',
        speakerId: 'alex',
        speakerName: 'Alex Mercer',
        speakerRole: 'Host, Mic & Mind',
        timestamp: '28:00',
        timeSeconds: 1680,
        chapterId: 'c3',
        text: 'That leads into leadership evolution. At zero to five million, you are a player-coach doing everything. At thirty million, you have to hire veteran leaders who may have run organizations three times your size. How did you navigate that ego shift?',
      },
      {
        id: 'seg-8',
        speakerId: 'maya',
        speakerName: 'Maya Lin',
        speakerRole: 'Founder & CEO, Lumina Craft',
        timestamp: '28:55',
        timeSeconds: 1735,
        chapterId: 'c3',
        isKeyQuote: true,
        text: 'The best hiring advice I ever received was: If you feel like the smartest person in your executive staff meeting, your company is in mortal danger. I had to learn to ask catalytic questions rather than give definitive directives.',
      },
      {
        id: 'seg-9',
        speakerId: 'alex',
        speakerName: 'Alex Mercer',
        speakerRole: 'Host, Mic & Mind',
        timestamp: '45:00',
        timeSeconds: 2700,
        chapterId: 'c4',
        text: 'To close out today, what is the single piece of advice you would hand to a founder in the thick of the storm right now?',
      },
      {
        id: 'seg-10',
        speakerId: 'maya',
        speakerName: 'Maya Lin',
        speakerRole: 'Founder & CEO, Lumina Craft',
        timestamp: '45:40',
        timeSeconds: 2740,
        chapterId: 'c4',
        isKeyQuote: true,
        text: 'Guard your mental margin like your company’s life depends on it — because it literally does. Exhausted founders make reactive, fear-based compromises that take years to unwind. Rest is not a reward for shipping; it is the prerequisite for good judgment.',
      },
    ],
  },
  'ep-041': {
    episodeId: 'ep-041',
    episodeNumber: 'EP. 041',
    episodeTitle: 'Failing in Public: Rebuilding Confidence After a Shut Down',
    recordedDate: 'August 11, 2026',
    duration: '64 min',
    wordCount: 9150,
    summary:
      'Serial founder and author Marcus Vance opens up on the emotional wreckage of liquidating an $8M venture-backed startup, separating identity from metrics, and crafting an authentic second act.',
    keyTakeaways: [
      'Valuation is a financial derivative, not a measurement of personal human dignity.',
      'Unresolved founder grief turns into cynicism unless deliberately processed.',
      'Radical candor with investors during a wind-down builds long-term reputation equity.',
      'The hardest part of starting over is letting go of the narrative of who you used to be.',
    ],
    speakers: [
      {
        id: 'alex',
        name: 'Alex Mercer',
        role: 'Host, Mic & Mind',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      },
      {
        id: 'marcus',
        name: 'Marcus Vance',
        role: 'Serial Founder & Author',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      },
    ],
    chapters: [
      { id: 'c1', title: 'The Anatomy of a Wind-Down', startSeconds: 0, timestamp: '00:00' },
      { id: 'c2', title: 'The Day We Signed the Dissolution Papers', startSeconds: 900, timestamp: '15:00' },
      { id: 'c3', title: 'Detangling Identity from TechCrunch Headlines', startSeconds: 1980, timestamp: '33:00' },
      { id: 'c4', title: 'The Phoenix Blueprint', startSeconds: 3120, timestamp: '52:00' },
    ],
    segments: [
      {
        id: 'seg-201',
        speakerId: 'alex',
        speakerName: 'Alex Mercer',
        speakerRole: 'Host, Mic & Mind',
        timestamp: '00:00',
        timeSeconds: 0,
        chapterId: 'c1',
        text: 'Marcus, two years ago you announced the shutdown of FreightWave after raising eight million dollars from top Silicon Valley funds. You wrote a transparent memo that went viral. How long did it take between knowing the ship was sinking and actually pulling the plug?',
      },
      {
        id: 'seg-202',
        speakerId: 'marcus',
        speakerName: 'Marcus Vance',
        speakerRole: 'Serial Founder & Author',
        timestamp: '00:55',
        timeSeconds: 55,
        chapterId: 'c1',
        isKeyQuote: true,
        text: 'About five months of pure existential denial. When you are the founder, you have trained your brain to believe that sheer grit and charisma can bend reality. Admitting that unit economics won’t work is like mourning a person who is still breathing.',
      },
      {
        id: 'seg-203',
        speakerId: 'marcus',
        speakerName: 'Marcus Vance',
        speakerRole: 'Serial Founder & Author',
        timestamp: '15:00',
        timeSeconds: 900,
        chapterId: 'c2',
        text: 'When we gathered our 38 employees into that all-hands room, I didn’t look at my laptop. I looked everyone in the eyes and took 100% accountability. We helped 34 of them land new roles before their final severance check cleared.',
      },
      {
        id: 'seg-204',
        speakerId: 'alex',
        speakerName: 'Alex Mercer',
        speakerRole: 'Host, Mic & Mind',
        timestamp: '33:00',
        timeSeconds: 1980,
        chapterId: 'c3',
        text: 'What was the psychological toll in the months that followed? When the inbox suddenly goes quiet?',
      },
      {
        id: 'seg-205',
        speakerId: 'marcus',
        speakerName: 'Marcus Vance',
        speakerRole: 'Serial Founder & Author',
        timestamp: '33:45',
        timeSeconds: 2025,
        chapterId: 'c3',
        isKeyQuote: true,
        text: 'The silence was deafening. You realize how much of your social circle was transactional. But that silence is also where you discover who you actually are when the title "CEO" is stripped away. It was painful, but it was the most clarifying gift of my adult life.',
      },
    ],
  },
  'ep-040': {
    episodeId: 'ep-040',
    episodeNumber: 'EP. 040',
    episodeTitle: 'The Discipline of Intuition: How Gut Instincts Win',
    recordedDate: 'August 04, 2026',
    duration: '51 min',
    wordCount: 7890,
    summary:
      'Elena Rostova, world-renowned Brand Strategist and Creative Director, explains why algorithmic homogenization has made human taste and intuitive conviction the ultimate competitive edge.',
    keyTakeaways: [
      'Data reveals where the market was yesterday, not where human desire is heading tomorrow.',
      'Taste is not random whim; it is subconscious pattern recognition developed through deep immersion.',
      'A/B testing leads to local maximums; bold creative leaps unlock global maximums.',
      'The strongest brands are built on polarizing points of view, not appeasement.',
    ],
    speakers: [
      {
        id: 'alex',
        name: 'Alex Mercer',
        role: 'Host, Mic & Mind',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      },
      {
        id: 'elena',
        name: 'Elena Rostova',
        role: 'Creative Director & Brand Strategist',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
      },
    ],
    chapters: [
      { id: 'c1', title: 'The Tyranny of A/B Testing', startSeconds: 0, timestamp: '00:00' },
      { id: 'c2', title: 'Deconstructing Aesthetic Taste', startSeconds: 620, timestamp: '10:20' },
      { id: 'c3', title: 'Building Unforgettable Brands', startSeconds: 1540, timestamp: '25:40' },
      { id: 'c4', title: 'Conviction Over Consensus', startSeconds: 2460, timestamp: '41:00' },
    ],
    segments: [
      {
        id: 'seg-301',
        speakerId: 'alex',
        speakerName: 'Alex Mercer',
        speakerRole: 'Host, Mic & Mind',
        timestamp: '00:00',
        timeSeconds: 0,
        chapterId: 'c1',
        text: 'Elena, everywhere we look in modern software and consumer goods, everything looks identical. Same pastel gradients, same geometric sans-serif fonts, same corporate copy. What happened to original vision?',
      },
      {
        id: 'seg-302',
        speakerId: 'elena',
        speakerName: 'Elena Rostova',
        speakerRole: 'Creative Director & Brand Strategist',
        timestamp: '00:48',
        timeSeconds: 48,
        chapterId: 'c1',
        isKeyQuote: true,
        text: 'Companies optimized for safety instead of resonance. When every decision requires a statistical significance test, you eliminate the risk of catastrophic failure, but you also eliminate any possibility of sublime magic.',
      },
      {
        id: 'seg-303',
        speakerId: 'elena',
        speakerName: 'Elena Rostova',
        speakerRole: 'Creative Director & Brand Strategist',
        timestamp: '10:20',
        timeSeconds: 620,
        chapterId: 'c2',
        isKeyQuote: true,
        text: 'Intuition is not magic or woo-woo mysticism. It is the synthesis of twenty thousand hours of obsessive observation that your subconscious mind processes faster than your analytical spreadsheet can calculate.',
      },
      {
        id: 'seg-304',
        speakerId: 'alex',
        speakerName: 'Alex Mercer',
        speakerRole: 'Host, Mic & Mind',
        timestamp: '25:40',
        timeSeconds: 1540,
        chapterId: 'c3',
        text: 'How do you pitch an intuitive brand overhaul to a risk-averse board of directors?',
      },
      {
        id: 'seg-305',
        speakerId: 'elena',
        speakerName: 'Elena Rostova',
        speakerRole: 'Creative Director & Brand Strategist',
        timestamp: '26:15',
        timeSeconds: 1575,
        chapterId: 'c3',
        text: 'I show them the cost of being invisible. In a noisy world, being safely average is the most dangerous posture imaginable. You don’t get remembered for being inoffensive.',
      },
    ],
  },
  'ep-039': {
    episodeId: 'ep-039',
    episodeNumber: 'EP. 039',
    episodeTitle: 'Radical Candor & Co-Founder Marriages',
    recordedDate: 'July 28, 2026',
    duration: '72 min',
    wordCount: 10400,
    summary:
      'David and Priya Chen, co-founders of Synergize Health, unpack a decade of building together through near-bankruptcy, product pivots, and how they built a bulletproof conflict resolution framework.',
    keyTakeaways: [
      'Unspoken resentment is the silent killer of startup partnerships.',
      'A structured weekly sync dedicated exclusively to emotional alignment prevents catastrophic blowups.',
      'Disagreement is a feature of deep trust, not a bug.',
      'Clear decision rights must be codetermined before crises emerge.',
    ],
    speakers: [
      {
        id: 'alex',
        name: 'Alex Mercer',
        role: 'Host, Mic & Mind',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      },
      {
        id: 'david',
        name: 'David Chen',
        role: 'Co-Founder & CTO, Synergize Health',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
      },
      {
        id: 'priya',
        name: 'Priya Chen',
        role: 'Co-Founder & CEO, Synergize Health',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      },
    ],
    chapters: [
      { id: 'c1', title: 'The 10-Year Co-Founder Compact', startSeconds: 0, timestamp: '00:00' },
      { id: 'c2', title: 'The Red Line Rule & Conflict Protocols', startSeconds: 980, timestamp: '16:20' },
      { id: 'c3', title: 'Separating Marriage from Fiduciary Responsibility', startSeconds: 2100, timestamp: '35:00' },
      { id: 'c4', title: 'Building for the Next Decennium', startSeconds: 3480, timestamp: '58:00' },
    ],
    segments: [
      {
        id: 'seg-401',
        speakerId: 'alex',
        speakerName: 'Alex Mercer',
        speakerRole: 'Host, Mic & Mind',
        timestamp: '00:00',
        timeSeconds: 0,
        chapterId: 'c1',
        text: 'David and Priya, you have been married for twelve years and co-founders for ten. Industry lore always warns against founding companies with your spouse. Why did you decide to do it, and how did you not kill each other in year two?',
      },
      {
        id: 'seg-402',
        speakerId: 'priya',
        speakerName: 'Priya Chen',
        speakerRole: 'Co-Founder & CEO, Synergize Health',
        timestamp: '00:42',
        timeSeconds: 42,
        chapterId: 'c1',
        isKeyQuote: true,
        text: 'In year two, we almost did! We had zero rules. We would argue about technical architecture over dinner and bring domestic chores into executive staff meetings. The breakthrough came when we created our "Red Line Protocol".',
      },
      {
        id: 'seg-403',
        speakerId: 'david',
        speakerName: 'David Chen',
        speakerRole: 'Co-Founder & CTO, Synergize Health',
        timestamp: '16:20',
        timeSeconds: 980,
        chapterId: 'c2',
        isKeyQuote: true,
        text: 'The Red Line Protocol is simple: When the front door closes at 7:00 PM, all company communication stops completely. If an emergency server crash happens, we trigger a formal operational escalation. Otherwise, we are husband and wife, not CEO and CTO.',
      },
      {
        id: 'seg-404',
        speakerId: 'alex',
        speakerName: 'Alex Mercer',
        speakerRole: 'Host, Mic & Mind',
        timestamp: '35:00',
        timeSeconds: 2100,
        chapterId: 'c3',
        text: 'How do you handle board disputes when one of you agrees with an investor and the other doesn’t?',
      },
      {
        id: 'seg-405',
        speakerId: 'priya',
        speakerName: 'Priya Chen',
        speakerRole: 'Co-Founder & CEO, Synergize Health',
        timestamp: '35:40',
        timeSeconds: 2140,
        chapterId: 'c3',
        text: 'We debate fiercely behind closed doors. But once we walk into that boardroom, we present one unified thesis. Alignment in public is non-negotiable.',
      },
    ],
  },
};

/**
 * Simulates an asynchronous backend mock service call to retrieve the full episode transcript.
 * Includes realistic network delay simulation.
 */
const UUID_TO_LEGACY: Record<string, string> = {
  'e0000042-0000-4000-8000-000000000042': 'ep-042',
  'e0000041-0000-4000-8000-000000000041': 'ep-041',
  'e0000040-0000-4000-8000-000000000040': 'ep-040',
  'e0000039-0000-4000-8000-000000000039': 'ep-039',
  'e0000038-0000-4000-8000-000000000038': 'ep-038',
};

export async function fetchEpisodeTranscript(episodeId: string): Promise<EpisodeTranscript> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const key = UUID_TO_LEGACY[episodeId] || episodeId;
      const transcript = MOCK_TRANSCRIPTS[key] || MOCK_TRANSCRIPTS[episodeId];
      if (transcript) {
        resolve({
          ...transcript,
          episodeId,
        });
      } else {
        // Fallback generic transcript if an unknown episode is queried
        const fallback: EpisodeTranscript = {
          episodeId,
          episodeNumber: 'Episode',
          episodeTitle: 'Podcast Discussion',
          recordedDate: 'Recent Broadcast',
          duration: '45 min',
          wordCount: 5200,
          summary: 'Full recorded dialogue covering leadership, innovation, and psychological growth.',
          keyTakeaways: [
            'Foundational insights into strategic leadership and personal transformation.',
            'Actionable frameworks for high-leverage execution.',
          ],
          speakers: [
            { id: 'alex', name: 'Alex Mercer', role: 'Host, Mic & Mind' },
            { id: 'guest', name: 'Featured Guest', role: 'Thought Leader' },
          ],
          chapters: [
            { id: 'c1', title: 'Introduction & Context', startSeconds: 0, timestamp: '00:00' },
            { id: 'c2', title: 'Core Insights', startSeconds: 600, timestamp: '10:00' },
          ],
          segments: [
            {
              id: 'fallback-1',
              speakerId: 'alex',
              speakerName: 'Alex Mercer',
              speakerRole: 'Host, Mic & Mind',
              timestamp: '00:00',
              timeSeconds: 0,
              text: 'Welcome to this special session of Mic & Mind. Today we are diving into pivotal lessons and actionable frameworks with our guest.',
            },
            {
              id: 'fallback-2',
              speakerId: 'guest',
              speakerName: 'Featured Guest',
              speakerRole: 'Thought Leader',
              timestamp: '01:15',
              timeSeconds: 75,
              isKeyQuote: true,
              text: 'The fundamental truth about sustained excellence is that clarity of purpose outperforms fleeting bursts of motivation every single time.',
            },
          ],
        };
        resolve(fallback);
      }
    }, 280); // 280ms realistic network latency
  });
}

/**
 * Formats transcript as a clean downloadable plaintext file
 */
export function formatTranscriptForExport(transcript: EpisodeTranscript): string {
  let output = `=======================================================\n`;
  output += `MIC & MIND PODCAST - OFFICIAL TRANSCRIPT\n`;
  output += `${transcript.episodeNumber}: ${transcript.episodeTitle}\n`;
  output += `Recorded: ${transcript.recordedDate} | Duration: ${transcript.duration}\n`;
  output += `=======================================================\n\n`;

  output += `SUMMARY:\n${transcript.summary}\n\n`;

  output += `KEY TAKEAWAYS:\n`;
  transcript.keyTakeaways.forEach((k, i) => {
    output += `${i + 1}. ${k}\n`;
  });
  output += `\n-------------------------------------------------------\n`;
  output += `CHAPTERS:\n`;
  transcript.chapters.forEach((c) => {
    output += `[${c.timestamp}] ${c.title}\n`;
  });
  output += `\n-------------------------------------------------------\n`;
  output += `TRANSCRIPT DIALOGUE:\n\n`;

  transcript.segments.forEach((seg) => {
    output += `[${seg.timestamp}] ${seg.speakerName.toUpperCase()} (${seg.speakerRole}):\n`;
    output += `${seg.text}\n\n`;
  });

  output += `\n(c) Mic & Mind Podcast. All rights reserved.\n`;
  return output;
}
