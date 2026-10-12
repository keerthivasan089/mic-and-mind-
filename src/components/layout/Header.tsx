import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Search } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ searchQuery = '', onSearchChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(Boolean(searchQuery));
  const searchInputRef = useRef<HTMLInputElement>(null);

  const navLinks = [
    { label: 'Manifesto', href: '#manifesto' },
    { label: 'Themes', href: '#themes' },
    { label: 'Episodes', href: '#episodes' },
    { label: 'Hall of Fame', href: '#hall-of-fame' },
    { label: 'Listen', href: '#listen-on' },
  ];

  // Auto-focus input when search is opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Sync if external query is passed
  useEffect(() => {
    if (searchQuery && !isSearchOpen) {
      setIsSearchOpen(true);
    }
  }, [searchQuery]);

  const handleToggleSearch = () => {
    if (isSearchOpen) {
      if (searchQuery) {
        onSearchChange?.('');
      }
      setIsSearchOpen(false);
    } else {
      setIsSearchOpen(true);
    }
  };

  const handleClearSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSearchChange?.('');
    searchInputRef.current?.focus();
  };

  return (
    <header
      id="main-nav-header"
      className="sticky top-0 z-40 w-full bg-paper/85 backdrop-blur-xl border-b border-ink/10 shadow-[0_4px_24px_rgba(28,20,15,0.04)] transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <a
          id="nav-brand-link"
          href="#top"
          className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange rounded-xl py-1 transition-opacity hover:opacity-90 shrink-0"
        >
          <BrandLogo size="md" />
        </a>

        {/* Desktop Search Bar & Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {/* Expanded Inline Search Input or Icon Toggle */}
          <div className="relative flex items-center">
            {isSearchOpen ? (
              <div className="relative flex items-center animate-in fade-in slide-in-from-right-4 duration-200">
                <Search className="absolute left-3.5 w-4 h-4 text-ink/50 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  id="header-episode-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsSearchOpen(false);
                    }
                  }}
                  placeholder="Filter episodes or guests..."
                  className="w-64 lg:w-72 pl-10 pr-9 py-2 rounded-full bg-white/90 border border-orange/40 focus:border-orange focus:ring-2 focus:ring-orange/20 text-ink text-xs font-body placeholder-ink/45 outline-none transition-all shadow-xs"
                  aria-label="Filter episodes by title or guest name"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2.5 p-1 rounded-full text-ink/40 hover:text-ink hover:bg-black/5 transition-colors cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-2.5 p-1 rounded-full text-ink/40 hover:text-ink hover:bg-black/5 transition-colors cursor-pointer"
                    aria-label="Close search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button
                id="header-search-toggle-btn"
                type="button"
                onClick={handleToggleSearch}
                className="w-10 h-10 rounded-full bg-white/70 hover:bg-white border border-ink/15 hover:border-orange/40 flex items-center justify-center text-ink/80 hover:text-orange transition-all shadow-xs cursor-pointer group"
                aria-label="Open episode search"
                title="Search episodes by title or guest"
              >
                <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>

          {/* Desktop Nav Links */}
          <nav className="flex items-center gap-6 lg:gap-8 font-body text-sm font-medium text-ink/80 tracking-normal" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-ink/80 hover:text-orange transition-colors relative py-1"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Mobile Action Controls (Search Button + Hamburger Button) */}
        <div className="flex md:hidden items-center gap-2">
          <button
            id="mobile-search-toggle-btn"
            type="button"
            onClick={handleToggleSearch}
            className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-xs transition-colors cursor-pointer ${
              isSearchOpen || searchQuery
                ? 'bg-orange text-white border-orange'
                : 'bg-white/70 backdrop-blur-md border-ink/15 text-ink hover:bg-white'
            }`}
            aria-label="Toggle mobile episode search"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-ink/15 flex items-center justify-center text-ink shadow-xs hover:bg-white transition-colors cursor-pointer"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Drawer */}
      {isSearchOpen && (
        <div className="md:hidden border-t border-ink/10 bg-white/95 px-6 py-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-ink/50 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search by episode title or guest..."
              className="w-full pl-10 pr-9 py-2.5 rounded-full bg-paper border border-orange/40 focus:border-orange focus:ring-2 focus:ring-orange/20 text-ink text-xs font-body placeholder-ink/45 outline-none"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 p-1 rounded-full text-ink/40 hover:text-ink"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu with Frosted Glassmorphism */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden border-t border-ink/10 bg-paper/95 backdrop-blur-2xl px-6 py-6 space-y-3 shadow-lg"
        >
          <nav className="flex flex-col space-y-2" aria-label="Mobile Navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-body font-medium text-base text-ink hover:text-orange py-2 border-b border-ink/5"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
