<p align="center">
  <img src="public/assets/thumbnail.webp" alt="ORVA — Premium Clothing" width="100%" style="border-radius:8px" />
</p>

<h1 align="center">ORVA</h1>
<p align="center"><em>Premium clothing, curated with intent.</em></p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white&labelColor=20232a" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white&labelColor=20232a" />
  <img src="https://img.shields.io/badge/Firebase-RTDB-FFCA28?style=flat-square&logo=firebase&logoColor=black&labelColor=20232a" />
  <img src="https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white&labelColor=20232a" />
  <img src="https://img.shields.io/badge/i18n-EN%20%2B%20বাং-22C55E?style=flat-square&labelColor=20232a" />
  <img src="https://img.shields.io/badge/version-1.1.0-c9b89a?style=flat-square&labelColor=20232a" />
</p>

---

## About

**ORVA** is the official web presence for a Bangladeshi clothing brand founded by [Badhon Kumar Roy](https://www.facebook.com/profile.php?id=61590608312590). The site serves as a premium product showcase and seamless order gateway — customers browse products, configure their order, and are forwarded to Messenger or WhatsApp for fulfillment. No payment gateway, no bloat.

This project is also a showcase of full-stack React architecture — real-time database, secure admin auth, canvas receipt generation, and a clean bilingual design system built entirely in the browser.

---

## Features

- **Dark editorial UI** — minimal black & white design, Cormorant Garamond typography, no light mode clutter
- **Bilingual** — full English + বাংলা (Bengali) support, URL-linked (`?lang=bn`), Noto Sans Bengali font
- **Product catalog** — grid/list view, Fuse.js fuzzy search, category filter, price sort — all URL-synced
- **Smart product pages** — image carousel + fullscreen lightbox (zoom, pan, pinch), dynamic variant pricing, related products
- **Order receipt system** — Canvas API generates branded order card → uploads to imgbb → compact message sent to Messenger/WhatsApp
- **Secure admin panel** — 2-step auth: Cloudflare emergency PIN + Firebase Auth; plus changeable custom PIN stored as SHA-256 hash in RTDB
- **Image pipeline** — browser-side compress → WebP conversion → imgbb upload (key fetched securely from Cloudflare)
- **Mobile-first** — bottom tab bar navigation, fully responsive grid/list layouts
- **SEO-ready** — react-helmet-async, JSON-LD structured data, OG/Twitter cards, per-product meta images

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Routing | React Router v6 |
| Database | Firebase Realtime Database |
| Auth | Firebase Authentication |
| Secrets | Cloudflare Workers |
| Image CDN | imgbb |
| Search | Fuse.js |
| Animations | Framer Motion |
| i18n | react-i18next |
| SEO | react-helmet-async |
| Contact | Web3Forms |
| Icons | Lucide React |

---

## Project Structure

```
orva/
├── public/assets/        # logo-white.webp · thumbnail.webp · muhtasim.webp
├── src/
│   ├── components/
│   │   ├── layout/       # Navbar · Footer · MobileTabBar · CreatorCard
│   │   ├── ui/           # ProductCard · BannerCarousel · ImageLightbox · Skeleton
│   │   └── admin/        # PinWall · AdminLogin · ProductEditor · ProductsTab · SettingsTab
│   ├── context/          # AuthContext (2-step auth + isAdminChecking)
│   ├── hooks/            # useProducts · useProduct · useSettings · useCategories
│   ├── i18n/             # en.json · bn.json
│   ├── lib/              # firebase.js · cloudflare.js · imageProcessor.js · orderBuilder.js
│   ├── pages/            # Home · Products · ProductSlug · About · Admin · NotFound
│   └── styles/           # tokens.css · typography.css · animations.css
└── .creator/
    ├── v1.0/             # Initial build artifacts
    └── v1.1/             # Cloudflare worker · RTDB rules · Context
```

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env
# Fill in VITE_FIREBASE_DATABASE_URL from Firebase Console

# 3. Dev server
npm run dev

# 4. Production build
npm run build && firebase deploy
```

Full setup guide → [`README-SETUP.md`](.creator/v1.1/) *(see `.creator` folder)*

---

## Order Flow

```
Customer selects product options
         ↓
Fills in name · phone · address · note
         ↓
Canvas API generates branded 800×800 receipt
         ↓
Receipt uploads to imgbb via Cloudflare (rate-limited)
         ↓
Compact message (order ID + details + receipt URL)
opens in Messenger or WhatsApp
         ↓
Admin processes order via social DM
```

No server. No database writes. No payment gateway. Pure UX.

---

## Brand

**ORVA** is a clothing brand by **Badhon Kumar Roy**, based in Saidpur, Nilphamari, Bangladesh.
The brand primarily operates through [Facebook](https://www.facebook.com/profile.php?id=61590608312590), with this website serving as a curated product showcase.

---

## Developer

Built by **Muhtasim Rahman** — [mdturzo.web.app](https://mdturzo.web.app) · [GitHub @muhtasim-rahman](https://github.com/muhtasim-rahman)

---

<p align="center">
  <sub>© 2025 ORVA · v1.1.0</sub>
</p>
