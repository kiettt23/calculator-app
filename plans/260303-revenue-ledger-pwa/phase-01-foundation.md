# Phase 01: Foundation (PWA Config + CSS Tokens + Base Styles)

## Parallelization
- **Runs in parallel** with Phases 02, 03, 04
- **No dependencies** on other phases
- **Exclusive files:** `manifest.json`, `sw.js`, `assets/icon-*.png`, `css/variables.css`, `css/base.css`

## Overview
- Priority: P1
- Status: completed
- Estimated effort: 1.5h
- Sets up the PWA shell, design tokens, and base layout styles for the Revenue Ledger app

## Context Links
- Research: `research/researcher-01-excel-pwa-report.md` (PWA subfolder config)
- Reference: Gas app `manifest.json`, `sw.js`, `css/variables.css`, `css/base.css`

## Key Insights
- PWA at `/revenue/` must have `scope: "/revenue/"` and `start_url: "/revenue/index.html"` in manifest
- SW placed at `/revenue/sw.js` auto-scopes to `/revenue/`
- Cache name must be unique per app (prefix `so-doanh-thu`) to avoid collision with Gas app
- Network-first strategy (same as Gas app pattern)
- Teal palette (#0891B2) replaces Petrolimex navy (#1B2469)

## Related Code Files (to create)
- `revenue/manifest.json`
- `revenue/sw.js`
- `revenue/assets/icon-180.png`
- `revenue/assets/icon-192.png`
- `revenue/assets/icon-512.png`
- `revenue/css/variables.css`
- `revenue/css/base.css`

## Implementation Steps

### Step 1: Create `revenue/` directory structure
```bash
mkdir -p revenue/assets revenue/js revenue/css revenue/lib
```

### Step 2: Create `revenue/manifest.json`
```json
{
  "name": "So Doanh Thu",
  "short_name": "Doanh Thu",
  "description": "So ghi doanh thu hang ngay",
  "start_url": "/revenue/index.html",
  "scope": "/revenue/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#0891B2",
  "background_color": "#F8FAFC",
  "icons": [
    { "src": "assets/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "assets/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

### Step 3: Create `revenue/sw.js`
Network-first strategy, same pattern as Gas app. Key differences:
- Cache name: `so-doanh-thu`
- Fonts cache: `so-doanh-thu-fonts`
- File list: only revenue app files
- Filter caches by prefix on activate (delete old versions only)

```javascript
const CACHE_NAME = 'so-doanh-thu-v1';
const FONTS_CACHE = 'so-doanh-thu-fonts';

const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon-180.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './js/constants.js',
  './js/utils.js',
  './js/storage.js',
  './js/state.js',
  './js/render.js',
  './js/handlers.js',
  './js/print.js',
  './js/export.js',
  './js/main.js',
  './css/variables.css',
  './css/base.css',
  './css/components.css',
  './css/responsive.css',
  './css/print.css',
  './lib/xlsx.full.min.js',
];
```

- Install: cache.addAll(FILES_TO_CACHE) + skipWaiting()
- Activate: delete old caches with `so-doanh-thu` prefix + clients.claim()
- Fetch: network-first for app files, network-first with cache fallback for Google Fonts

### Step 4: Generate placeholder icons
Use simple teal-colored PNG placeholders (can be replaced with real icons later):
- `icon-180.png` (180x180 Apple touch)
- `icon-192.png` (192x192 Android)
- `icon-512.png` (512x512 splash)

If ImageMagick available, generate programmatically. Otherwise create minimal valid PNGs.

### Step 5: Create `revenue/css/variables.css`
Teal design system tokens. Follow Gas app pattern but replace palette:

```css
:root {
  /* Primary: Teal */
  --rv-teal: #0891B2;
  --rv-teal-dark: #0E7490;
  --rv-teal-light: #06B6D4;
  --rv-teal-100: #CFFAFE;
  --rv-teal-50: #ECFEFF;

  /* CTA: Green */
  --rv-green: #059669;
  --rv-green-dark: #047857;
  --rv-green-100: #D1FAE5;
  --rv-green-50: #ECFDF5;

  /* Text */
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #94A3B8;

  /* Layout */
  --border: #E2E8F0;
  --border-focus: var(--rv-teal);
  --bg-page: #F8FAFC;
  --bg-card: #FFFFFF;
  --radius: 10px;
  --shadow: 0 1px 4px rgba(0,0,0,0.07);
  --shadow-md: 0 4px 16px rgba(8,145,178,0.10);

  /* Semantic */
  --red-700: #B71C1C;
  --red-100: #FFCDD2;

  /* iOS safe areas */
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-top: env(safe-area-inset-top, 0px);
}
```

### Step 6: Create `revenue/css/base.css`
Follow Gas app `base.css` structure. Key elements:
- Reset + box-sizing
- Body: Be Vietnam Pro font, `--bg-page` background, 18px base font
- Offline bar (hidden by default, `.show` toggles)
- App header: teal background, white text, no logo (text only: "So Doanh Thu")
  - No `::after` orange stripe; instead a subtle teal-dark bottom border
- Summary bar: sticky top, white bg, teal accent border-bottom
  - 3 columns: Tong (total) | CK subtotal | TM subtotal
  - Values in teal color, bold
- `.no-print` utility class

Header HTML structure (for Phase 03 reference):
```css
.app-header {
  background: var(--rv-teal);
  color: white;
  padding: calc(18px + var(--safe-top)) 20px 20px;
  text-align: center;
}
.app-header h1 {
  font-size: 1.33rem;
  font-weight: 700;
  letter-spacing: 1px;
}
```

Summary bar structure:
```css
.summary-bar {
  background: var(--bg-card);
  padding: 14px 20px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 3px solid var(--rv-teal);
}
.summary-item { text-align: center; }
.summary-label { font-size: 0.78rem; color: var(--text-secondary); font-weight: 500; }
.summary-value { font-size: 1.44rem; font-weight: 700; color: var(--rv-teal); }
.summary-value.total { font-size: 1.78rem; }
```

## Todo List
- [ ] Create directory structure
- [ ] Create manifest.json with correct scope/start_url
- [ ] Create sw.js with network-first, versioned cache, prefix filtering
- [ ] Generate placeholder icon PNGs
- [ ] Create variables.css with teal tokens
- [ ] Create base.css with reset, header, summary bar, offline bar

## Success Criteria
- `manifest.json` passes Chrome DevTools Manifest validation
- SW registers at `/revenue/sw.js` scope `/revenue/`
- Cache name starts with `so-doanh-thu` (no collision with Gas app)
- All CSS variables defined, no hardcoded colors in base.css
- Base styles render header + summary bar correctly in isolation (even without HTML from Phase 03)

## Conflict Prevention
- Only touches files listed in ownership matrix for Phase 01
- Does NOT create `index.html` (Phase 03 owns it)
- Does NOT create any JS modules (Phase 02 owns them)
- CSS variables use `--rv-` prefix to avoid any collision with Gas app `--plx-` prefix

## Risk Assessment
- **Icons**: Placeholder PNGs needed for SW to cache successfully; real icons can replace later
- **GitHub Pages path**: Must use relative paths (`./`) in SW file list since `/revenue/` prefix handled by scope
- **Trailing slash**: manifest scope must end with `/` for proper PWA isolation
