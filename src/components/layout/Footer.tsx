import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';
import { Button } from '../ui/Button';
import { CountUp } from '../ui/CountUp';
import {
  IconSocialYouTube,
  IconSocialTwitter,
  IconSocialInstagram,
  IconSocialLinkedIn,
  IconPlatformRSS,
} from '../ui/BrandIcons';

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setIsSubscribed(true);
    }
  };

  const socialLinks = [
    { name: 'YouTube', icon: IconSocialYouTube, url: 'https://youtube.com' },
    { name: 'Twitter/X', icon: IconSocialTwitter, url: 'https://twitter.com' },
    { name: 'Instagram', icon: IconSocialInstagram, url: 'https://instagram.com' },
    { name: 'LinkedIn', icon: IconSocialLinkedIn, url: 'https://linkedin.com' },
    { name: 'RSS', icon: IconPlatformRSS, url: '#rss' },
  ];

  return (
    <footer id="site-footer" className="bg-cream border-t border-ink/10 text-ink pt-20 pb-14">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-ink/10">
          {/* Brand & Description Column */}
          <div className="md:col-span-6 space-y-6">
            <BrandLogo size="lg" />
            <p className="font-body text-ink/75 text-sm sm:text-base max-w-md leading-relaxed font-normal">
              Intimate, unscripted studio dialogues with founders, thinkers, and innovators exploring resilience, craft, and the human condition.
            </p>

            {/* Newsletter Subscription Box */}
            <div className="pt-2">
              <span className="block font-mono text-xs uppercase tracking-wider font-semibold text-ink/80 mb-3">
                Join <CountUp to={45000} separator="," suffix="+" duration={1.8} /> Friday Thinkers
              </span>
              {isSubscribed ? (
                <div className="p-3.5 bg-orange/10 border border-orange/30 rounded-2xl flex items-center gap-2 text-sm font-medium text-orange">
                  <Check className="w-4 h-4" /> You&apos;re on the list! First issue arrives this Friday.
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-full border border-ink/20 bg-white text-ink text-sm focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 transition-all shadow-xs"
                    aria-label="Newsletter email"
                  />
                  <Button variant="primary" size="sm" type="submit" className="px-5 py-2.5 rounded-full whitespace-nowrap">
                    Join the Conversation
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Explore Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-wider font-semibold text-ink/70">
              Explore
            </h4>
            <ul className="space-y-3 font-body text-sm text-ink/80">
              <li>
                <a href="#manifesto" className="hover:text-orange transition-colors">
                  Manifesto
                </a>
              </li>
              <li>
                <a href="#themes" className="hover:text-orange transition-colors">
                  Themes
                </a>
              </li>
              <li>
                <a href="#episodes" className="hover:text-orange transition-colors">
                  Episodes
                </a>
              </li>
              <li>
                <a href="#hall-of-fame" className="hover:text-orange transition-colors">
                  Hall of Fame
                </a>
              </li>
              <li>
                <a href="#listen-on" className="hover:text-orange transition-colors">
                  Listen
                </a>
              </li>
            </ul>
          </div>

          {/* Connect & Social */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-wider font-semibold text-ink/70">
              Connect
            </h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-xl bg-white border border-ink/10 flex items-center justify-center text-ink/80 hover:bg-orange hover:text-white hover:border-orange transition-all"
                    title={social.name}
                    aria-label={social.name}
                  >
                    <IconComponent className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-ink/60">
          <p>&copy; {new Date().getFullYear()} Mic &amp; Mind Media. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-orange transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-orange transition-colors">Terms of Service</a>
            <a href="#press" className="hover:text-orange transition-colors">Press Inquiries</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
