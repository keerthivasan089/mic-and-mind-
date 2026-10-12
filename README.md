# Mic & Mind — Official Podcast Marketing Website

A production-ready marketing website for **Mic & Mind**, a podcast featuring entrepreneurs, creators, and changemakers sharing authentic stories about growth, failure, and ambition.

---

## 🎨 Brand & Design Tokens

### Color Palette
- **Orange (Primary)**: `#DD5A1F`
- **Orange Deep**: `#A8391A`
- **Cream**: `#F4ECD9`
- **Paper**: `#FBF6EB`
- **Ink (Near-Black)**: `#1C140F`

### Typography
- **Display / Headings**: `Fredoka` (Chunky, rounded, toy-like lettering style)
- **Body Text**: `Inter`
- **Labels / Eyebrows / Small Caps**: `Space Mono`

### Visual Style
- Bold black outlines (`border-2 border-[#1C140F]`)
- Comic / sticker offset drop shadows (`shadow-[4px_4px_0px_#1C140F]`)
- High contrast between cream backgrounds and orange accents
- Outlined stroke typography in the *Feeling* section

---

## 📁 Project Structure

```
├── public/
│   └── assets/
│       ├── logo.png               # Brand logo (referenced in header & hero)
│       └── studio-intro.mp4       # Video hero background (autoplay, 100svh)
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx         # Sticky navigation bar with guest CTA
│   │   │   └── Footer.tsx         # Brand footer with newsletter & social links
│   │   ├── sections/
│   │   │   ├── VideoHero.tsx      # 1. Full-viewport video intro with delayed overlay
│   │   │   ├── Manifesto.tsx      # 3. Brand story & highlight text
│   │   │   ├── Themes.tsx         # 4. 4-column responsive grid
│   │   │   ├── Episodes.tsx       # 5. Filterable episodes with interactive audio player
│   │   │   ├── Feeling.tsx        # 6. Full-width dark ink outlined word effect
│   │   │   ├── ListenOn.tsx       # 7. Platform buttons inverting to orange on hover
│   │   │   └── GuestCTA.tsx       # 8. Full-width orange guest pitch banner
│   │   └── ui/
│   │       ├── Button.tsx         # Sticker-style accessible button
│   │       ├── Card.tsx           # Reusable container with bold offset shadow
│   │       ├── SectionHeading.tsx # Space Mono eyebrow + Fredoka heading
│   │       ├── BrandLogo.tsx      # Brand mark with fallback mascot
│   │       ├── GuestModal.tsx     # Interactive pitch application modal
│   │       └── AudioPlayerBar.tsx # Sticky bottom audio player with scrubber
│   ├── lib/
│   │   └── data.ts                # Mock data for episodes, themes, platforms
│   ├── styles/
│   │   └── tokens.ts              # TypeScript constants for design tokens
│   ├── types.ts                   # TypeScript interfaces
│   ├── App.tsx                    # Main homepage assembly
│   ├── main.tsx                   # React root entry point
│   └── index.css                  # Tailwind CSS tokens, theme & utilities
├── index.html                     # HTML shell loading Google Fonts
├── vite.config.ts                 # Vite bundler configuration
└── package.json
```

---

## 🚀 Getting Started Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📹 Asset Integration

- **Logo**: Place your logo file in `/public/assets/logo.png`.
- **Intro Video**: Place your studio animation video in `/public/assets/studio-intro.mp4`.
- **Graceful Fallback**: If the video is missing or loading, the Hero automatically shows an ambient studio gradient background and reveals the hero overlay after the delay.
- **Accessibility**: Respects `prefers-reduced-motion` by disabling delays and bouncing keyframe animations.
