# ORVA — v1.0.0

Premium clothing brand website. Product showcase + Messenger/WhatsApp order gateway.

---

## Quick Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Environment variables
```bash
cp .env.example .env
# Fill in all values in .env
```

The `VITE_FIREBASE_DATABASE_URL` is found in **Firebase Console → Realtime Database → Data** (the URL at the top, e.g. `https://orva-bd-default-rtdb.asia-southeast1.firebasedatabase.app`).

### 3. Firebase setup
- Enable **Realtime Database** in Firebase Console
- Paste the rules from `.creator/v1.0/firebase-rules_v1.0.json` into **RTDB → Rules**
- Enable **Authentication** → Google provider + Email/Password provider
- Paste the seed data from `.creator/v1.0/rtdb-seed_v1.0.json` into **RTDB → Data** (Import JSON)

### 4. Add your admin UID
After your first login at `/admin`:
1. Open Firebase Console → Authentication → Users
2. Copy your UID
3. In RTDB → Data, navigate to `settings/admin/allowedUids`
4. Add a child: key = your UID, value = `true`

### 5. Cloudflare Worker
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers
2. Edit `setup.hello-orvabd.workers.dev` (or create new)
3. Paste the code from `.creator/v1.0/cloudflare-worker_v1.0.js`
4. Under **Settings → Variables**, add:
   - `ADMIN_PIN` = your 8-digit PIN (e.g. `47291836`)
   - `IMGBB_API_KEY` = key from [imgbb.com/api](https://api.imgbb.com/)
   - `FIREBASE_PROJECT_ID` = `orva-bd`
5. Deploy

### 6. Web3Forms (contact form)
1. Go to [web3forms.com](https://web3forms.com)
2. Enter `hello.orvabd@gmail.com` and get your access key
3. Add `VITE_WEB3FORMS_KEY=your_key` to `.env`

### 7. Run locally
```bash
npm run dev
```

### 8. Deploy to Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Database | Firebase Realtime Database |
| Auth | Firebase Authentication |
| Image hosting | imgbb |
| Secrets | Cloudflare Workers |
| i18n | react-i18next (EN + বাংলা) |
| Search | Fuse.js |
| Animations | Framer Motion |
| SEO | react-helmet-async |
| Contact form | Web3Forms |
| Icons | Lucide React |

---

## Project Structure

```
orva/
├── public/assets/          # Logo, creator photo
├── src/
│   ├── components/
│   │   ├── layout/         # Navbar, Footer, MobileTabBar, CreatorCard
│   │   ├── ui/             # ProductCard, BannerCarousel, ImageLightbox, Skeleton
│   │   └── admin/          # PinWall, AdminLogin, ProductEditor, ProductsTab, SettingsTab
│   ├── context/            # AuthContext
│   ├── hooks/              # useProducts, useProduct, useSettings, useCategories
│   ├── i18n/               # en.json, bn.json
│   ├── lib/                # firebase.js, cloudflare.js, imageProcessor.js, orderBuilder.js
│   ├── pages/              # Home, Products, ProductSlug, About, Admin, NotFound
│   ├── styles/             # tokens.css (theme), typography.css, animations.css
│   └── utils/              # slugify, formatPrice, formatDate, debounce...
├── .creator/v1.0/          # RTDB rules, Cloudflare Worker, seed data, CONTEXT.md
└── .env.example
```

---

## Light Mode (future)

The theme system is ready. To activate:
1. Open `src/styles/tokens.css`
2. Uncomment the `[data-theme='light']` block at the bottom
3. Add a toggle button in `Navbar.jsx` that sets `document.documentElement.dataset.theme`
4. Persist preference with `localStorage.setItem('orva-theme', theme)`

---

## Order Flow

1. Customer browses `/products/:slug`
2. Selects size, color, quantity, fills in name/phone/address/note
3. Clicks "Order via Messenger" or "Order via WhatsApp"
4. Canvas generates a branded dark receipt image (800×800px)
5. Receipt uploads to imgbb via Cloudflare `/upload-order-image`
6. Compact message (order ID, product, customer info, receipt URL) opens in Messenger/WhatsApp
7. Admin receives the message and processes the order manually

Orders are **not saved to the database** — they go directly to social DMs.

---

## Admin Panel

Visit `/admin`:
1. Enter your 8-digit PIN → validated by Cloudflare Worker
2. Sign in with Google or Email/Password
3. Access Products tab (add/edit/delete/publish/pin) and Settings tab

---

*Crafted by [Muhtasim Rahman](https://mdturzo.web.app)*
