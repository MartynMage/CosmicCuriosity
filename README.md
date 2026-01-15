# 🌌 CosmicCuriosity

**Your Complete Window to the Universe**

A comprehensive, beautifully-designed astronomy web application featuring 80+ interactive tools for stargazers, astrophotographers, and space enthusiasts. Built with pure vanilla JavaScript for maximum performance and zero dependencies.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## 🌟 Live Demo

**[→ Visit CosmicCuriosity.com](https://cosmiccuriosity.com)**

---

## ✨ Features Overview (80+ Tools)

### 🔭 Core Astronomy (20 features)
- **Interactive Star Map** — Full-sky view with constellation lines, stars to magnitude 6
- **Moon Phase Tracker** — Current phase, illumination %, rise/set times, lunar calendar
- **Planet Tracker** — Real-time positions for all 8 planets with visibility status
- **Meteor Shower Radar** — Active showers, ZHR rates, radiant positions
- **Aurora Forecast** — Kp index, probability calculator based on latitude
- **Constellation Guide** — All 88 constellations with mythology
- **Eclipse Tracker** — Upcoming solar/lunar eclipses with countdowns
- **Light Pollution Map** — Bortle scale estimator
- **ISS & Satellite Tracker** — Real-time position and pass predictions
- **Comet Watch** — Current bright comets
- **Deep Sky Objects** — Messier & NGC catalog
- **And more...**

### 📊 Data & Calculations (18 features)
- **Annual Sky Calendar** — 2026 celestial events month-by-month
- **Golden Hour Calculator** — Photography times with current phase display
- **Seeing Conditions Forecast** — Atmospheric stability predictions
- **This Day in Space History** — Historical events from space exploration
- **Live Sun Data** — Sunspot number, solar flux, solar wind
- **Tide Integration** — Lunar-influenced predictions
- **And more...**

### 🚀 Space News & Media (15 features)
- **NASA APOD** — Astronomy Picture of the Day
- **Space News Feed** — Latest headlines
- **Rocket Launch Schedule** — SpaceX, NASA, ESA launches
- **Artemis Mission Tracker** — Lunar program progress
- **Webb Telescope Gallery** — Latest JWST images
- **And more...**

### 🛠️ Tools & Utilities (12 features)
- **Observation Log** — Digital notebook
- **Equipment Manager** — Telescope inventory
- **Target Planner** — Observing lists
- **Star Chart Generator** — Printable maps
- **Dark Adaptation Timer** — Red-light mode
- **And more...**

### 🎨 UI & Experience (15 features)
- **5 Theme Options** — Dark, Midnight, Nebula, Light, Night Vision
- **Animated Star Background** — Parallax twinkling stars
- **Sound Design** — Optional ambient sounds
- **PWA Support** — Install as standalone app
- **Offline Mode** — Core features work without internet
- **Keyboard Shortcuts** — T=Theme, S=Sound, ?=Help
- **And more...**

### 🔬 Advanced Features (6 features)
- **Telescope Control Interface** — ASCOM/INDI GoTo mount integration
- **Live Remote Telescope Feeds** — Slooh, Virtual Telescope links
- **Exoplanet Explorer** — Interactive database of known exoplanets
- **And more...**

---

## 🚀 Getting Started

### Quick Start (No Build Required!)

```bash
# Clone the repository
git clone https://github.com/your-username/cosmic-curiosity.git
cd cosmic-curiosity

# Open in browser
open index.html
```

That's it! No npm install, no build step, no dependencies.

### Optional: Local Server

```bash
python -m http.server 8000
# Visit http://localhost:8000
```

---

## 📁 Project Structure

```
cosmic-curiosity/
├── index.html           # Main application
├── astro-engine.js      # Core astronomical calculations
├── starmap.js           # Interactive star map
├── features.js          # News, launches, APOD modules
├── astro-features.js    # Planets, meteors, aurora, etc.
├── data-features.js     # Calendar, golden hour, history
├── ui-advanced.js       # Themes, sounds, telescope control
├── sw.js                # Service worker (offline support)
├── manifest.json        # PWA manifest
├── assets/              # Logos and images
└── ...config files
```

---

## 🛠️ Technical Details

### Astronomy Engine Features
- **Planet Positions**: VSOP87 simplified (< 1° accuracy)
- **Moon Phase**: Meeus algorithms
- **Coordinate Transforms**: Equatorial ↔ Horizontal
- **Time Functions**: Julian date, sidereal time

### Design Principles
1. **Zero Dependencies** — Pure vanilla JS
2. **Privacy First** — All calculations local, nothing stored
3. **Offline Ready** — Service worker caching
4. **Performance** — <100KB total JavaScript

---

## 🌐 Deployment

Works on any static host:
- **Netlify**: `netlify deploy --prod`
- **Vercel**: `vercel --prod`
- **GitHub Pages**: Settings → Pages → Deploy from main

---

## 🎨 Customization

### Adding Themes

```javascript
// In ui-advanced.js
ThemeManager.themes.yourTheme = {
    name: 'Your Theme',
    bgDeep: '#yourcolor',
    bgCard: '#yourcolor',
    accentGlow: '#yourcolor',
    textPrimary: '#yourcolor',
    textSecondary: '#yourcolor'
};
```

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Ideas:**
- 🐛 Bug fixes
- 🌍 Translations
- 🔭 New calculations
- 🎨 New themes

---

## 📜 License

MIT License — see [LICENSE](LICENSE)

---

## 🙏 Acknowledgments

- **NASA** — APOD API and imagery
- **Stellarium** — Star map inspiration
- **The Astronomy Community** — Making the universe accessible

---

<p align="center">
  <strong>🌟 Clear skies and happy stargazing! 🌟</strong>
</p>

<p align="center">
  Made with ❤️ for the astronomy community
</p>
