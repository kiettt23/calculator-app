# Brainstorm: Revenue Ledger Feature ("So Doanh Thu")

**Date**: 2026-03-03
**Status**: Brainstorm complete, awaiting decision
**Context**: Adding S1a-HKD revenue tracking to existing gas weighing PWA

---

## Problem Statement

The client's wife manually maintains a paper ledger (form S1a-HKD per Circular 152/2025/TT-BTC) tracking daily revenue from gas sales. Pain points: tedious handwriting, manual total calculations, no reporting by period. She wants this digitized within the existing PWA.

## S1a-HKD Form Structure (Official)

The official form is deliberately simple:
- **Column A**: Date (ngay, thang ghi so)
- **Column B**: Description (dien giai -- she uses this for payment method: TK = bank transfer, Tien mat = cash)
- **Column 1**: Amount (so tien ban hang hoa, dich vu)
- **Cumulative revenue** (doanh thu luy ke) tracked per month

The client's wife adds payment method distinction in the description column -- this is a UX enhancement we can formalize.

## Existing Codebase Analysis

### What we have (and can reuse)
| Asset | Reuse potential |
|-------|----------------|
| `showToast()` | Direct reuse -- notifications |
| `showConfirm()` | Direct reuse -- delete confirmations |
| `safeSave()` | Direct reuse -- localStorage with quota handling |
| `formatDateVN()` | Direct reuse -- date formatting |
| Date picker (3-dropdown) | Pattern reuse -- same VN date picker |
| History modal pattern | Pattern reuse -- list + detail + delete |
| CSV export pattern | Pattern reuse -- BOM + Blob + download |
| Print CSS (@media print) | Pattern reuse -- extend for ledger print |
| Card-based UI pattern | Pattern reuse -- entry cards |
| Design tokens (variables.css) | Direct reuse -- all colors, spacing, shadows |
| Confirm modal HTML | Direct reuse -- already in index.html |
| Toast HTML | Direct reuse -- already in index.html |

### Architecture constraints
- Single `index.html` entry point
- Vanilla JS with native ES modules (no build)
- No router library
- All functions exposed on `window` for inline handlers
- Service worker caches file list explicitly
- localStorage only (no IndexedDB)
- Mobile-first, iPhone 11 optimized

---

## Approach A: Tab-Based Single Page (RECOMMENDED)

### Concept
Add a tab bar at the top (below header, above content) with two tabs: "Phieu Can Gas" and "So Doanh Thu". Each tab shows/hides its respective content section. Simple CSS `display: none/block` toggle.

### Architecture
```
index.html
  +-- [header] (shared)
  +-- [tab-bar] (NEW: 2 tabs)
  +-- [section#gasPage] (existing content, wrapped)
  +-- [section#revenuePage] (NEW content)
  +-- [toast, confirm] (shared)
```

### New files needed
```
js/
  revenue-state.js        -- state + persistence for revenue entries
  revenue-render.js       -- DOM rendering for revenue page
  revenue-handlers.js     -- input, CRUD, date filter, export
  revenue-print.js        -- print view + CSV export for revenue

css/
  tabs.css                -- tab bar styling
  revenue.css             -- revenue page components
```

### Pros
- **Simplest architecture change** -- just wrap existing content in a section, add a section
- Shared header, toast, confirm, offline bar -- zero duplication
- One HTML file, one service worker, one manifest
- Tab state can persist in localStorage (remember last tab)
- Existing code untouched -- only `index.html` gets wrapping divs + tab bar
- Fast switch between features (no page reload)

### Cons
- Both pages' HTML in one file (but revenue HTML is small -- just a form + list)
- All JS loads upfront (but total JS is still under 15KB, negligible)
- `main.js` needs to init both modules

### Effort estimate: 2-3 days

---

## Approach B: Separate HTML Page

### Concept
Create `revenue.html` as a separate page. Navigation via link/button in header. Each page is independent with its own JS entry point.

### Architecture
```
index.html       -- gas weighing (unchanged)
revenue.html     -- revenue ledger (new)
js/
  revenue-main.js
  revenue-state.js
  revenue-render.js
  ...
```

### Pros
- Complete isolation -- zero risk of breaking existing gas weighing
- Each page loads only its own JS/CSS
- Clean separation of concerns

### Cons
- **Duplicated boilerplate**: header, offline bar, toast, confirm modal -- all copied
- Navigation causes full page reload (bad UX on mobile PWA)
- Service worker needs to cache revenue.html + all new files
- manifest.json start_url ambiguity -- which page opens first?
- Shared utilities (toast, confirm, storage) must be imported in both entry points but HTML elements duplicated
- Maintaining two HTML files with identical header/toast/confirm is a DRY violation

### Effort estimate: 3-4 days (more due to duplication management)

---

## Approach C: Hash-Based Router

### Concept
Use `#/gas` and `#/revenue` URL hashes. A minimal router in main.js listens to `hashchange` and swaps content. Content rendered dynamically via JS (no HTML sections pre-built).

### Architecture
```
index.html       -- shell only (header + container)
js/
  router.js      -- hash router (20-30 lines)
  gas-page.js    -- renders gas content into container
  revenue-page.js -- renders revenue content into container
```

### Pros
- Clean URL-based navigation
- Content rendered on demand (slightly less initial DOM)
- Extensible for future pages

### Cons
- **Over-engineered for 2 pages** -- YAGNI violation
- Must refactor existing gas weighing to render dynamically instead of static HTML
- Breaking change to existing working code
- Router adds complexity with no real benefit for 2 pages
- Hash URLs not needed when there's no deep linking requirement

### Effort estimate: 4-5 days (refactoring existing + new)

---

## Recommendation: Approach A (Tab-Based)

**Why**: It is the simplest change that delivers the feature. The existing codebase stays untouched except for wrapping the current body content in a `<section id="gasPage">`. A new `<section id="revenuePage">` sits alongside. A 2-tab bar switches visibility. KISS wins.

---

## Data Model

### Revenue Entry
```javascript
{
  id: 1709472000000,        // Date.now() timestamp
  date: "2026-03-03",       // YYYY-MM-DD
  description: "Ban gas",   // Free text
  method: "cash",           // "cash" | "transfer"
  amount: 1500000           // Number (VND, no decimals)
}
```

### localStorage Keys (new)
```javascript
'so-doanh-thu-entries'   // Array of revenue entries
'so-doanh-thu-filter'    // Current filter state { month, year }
```

### Why separate from gas weighing keys
- Independent data lifecycle
- Gas history max 50, revenue entries could be 365+/year
- Different backup/clear semantics
- `safeSave()` quota handler already handles overflow

### Storage sizing estimate
- One entry ~120 bytes JSON
- 30 entries/month = 3,600 bytes/month
- 12 months = 43,200 bytes/year
- localStorage 5MB limit = room for 100+ years
- **Verdict: localStorage is perfectly fine**

---

## Feature Scope (MVP)

### Must Have
1. **Add entry**: Date, description, payment method (cash/transfer), amount
2. **Entry list**: Scrollable list of entries for selected month, newest first
3. **Edit entry**: Tap to edit inline
4. **Delete entry**: Swipe or button, with confirm
5. **Monthly summary**: Total revenue, cash subtotal, transfer subtotal
6. **Month/year filter**: Dropdown to select which month to view
7. **Auto-save**: Same 800ms debounce pattern as gas weighing

### Should Have
8. **Export CSV**: Same pattern as gas weighing, with S1a-HKD column format
9. **Print view**: Formatted as official S1a-HKD ledger for filing

### Could Have (YAGNI -- skip for now)
- ~~Yearly summary~~
- ~~Charts/graphs~~
- ~~Categories beyond payment method~~
- ~~Photo attachment of receipts~~
- ~~Cloud sync~~
- ~~Multi-user~~

---

## UX Design

### Tab Bar
- Position: below header, above content
- 2 tabs: "Phieu Can" (gas icon) | "So Doanh Thu" (ledger icon)
- Active tab: navy background, white text, orange bottom border
- Inactive tab: white background, navy text
- Sticky alongside summary bar (or replaces it depending on active tab)

### Revenue Page Layout
```
[Month/Year Filter]        -- 2 dropdowns (month, year)
[Summary Card]             -- Total | Cash | Transfer
[Entry List]               -- Cards, sorted by date desc
  [Entry Card]             -- Date | Description | Method badge | Amount
  [Entry Card]             -- ...
[+ Add Entry FAB/Button]   -- Fixed bottom or inline
```

### Entry Form
- Inline form at top (not modal) -- faster for repeated entry
- Date: defaults to today, same 3-dropdown picker
- Description: text input with common presets (dropdown suggestions)
- Payment method: 2-option toggle (Cash / Transfer)
- Amount: numeric input with VND formatting
- Save button OR auto-save on blur

### Monthly Summary Card
- Styled like the existing summary-bar
- Shows: Tong doanh thu | Tien mat | Chuyen khoan
- Sticky or at top of list

---

## Reusable Patterns

| Pattern | Source | Reuse in Revenue |
|---------|--------|-----------------|
| Card UI | `components.css` `.cylinder-card` | Entry cards |
| Toast | `utils.js` `showToast()` | Save/delete feedback |
| Confirm | `utils.js` `showConfirm()` | Delete confirmation |
| Date picker | `handlers.js` `initDatePicker()` | Entry date + filter |
| CSV export | `print.js` `exportCSV()` | Revenue CSV |
| Print view | `print.js` `generatePrintView()` | S1a-HKD print |
| Safe storage | `storage.js` `safeSave()` | Revenue persistence |
| Auto-save | `state.js` `autoSave()` | Revenue auto-save |
| Offline bar | `main.js` `initOfflineIndicator()` | Shared, no change |
| Install prompt | `main.js` `initInstallPrompt()` | Shared, no change |

---

## Implementation Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Breaking existing gas weighing | High | Wrap in section, no logic changes |
| Service worker cache stale | Medium | Bump CACHE_NAME, add new files to cache list |
| localStorage quota with many entries | Low | Already handled by safeSave(); 1yr ~43KB |
| Tab state lost on reload | Low | Persist active tab in localStorage |
| Print CSS conflicts | Low | Scope with page-specific class |
| Mobile keyboard pushing tabs up | Medium | Test on real device, sticky behavior |

---

## Changes to Existing Files

| File | Change | Risk |
|------|--------|------|
| `index.html` | Add tab bar, wrap existing content in section, add revenue section | Low (additive) |
| `sw.js` | Add new JS/CSS files to FILES_TO_CACHE | Low |
| `manifest.json` | Update app name if needed | None |
| `js/main.js` | Import + init revenue module, add tab switching | Low |
| `css/base.css` | None (tab CSS in separate file) | None |
| All other existing files | **No changes** | None |

---

## Success Criteria

1. User can add daily revenue entries with date, description, payment method, amount
2. Entries persist across sessions (localStorage)
3. Monthly view shows entries and totals (total, cash, transfer)
4. Can switch between gas weighing and revenue ledger without data loss
5. Can export revenue to CSV in S1a-HKD format
6. Can print revenue ledger matching official form layout
7. Works fully offline
8. Existing gas weighing feature is completely unaffected

---

## Next Steps

1. Decide on approach (A recommended)
2. Create implementation plan with phases
3. Phase 1: Tab bar + page switching infrastructure
4. Phase 2: Revenue data model + CRUD
5. Phase 3: Monthly summary + filter
6. Phase 4: Export CSV + Print view
7. Phase 5: Polish + test on real device

---

## References

- [Mau so S1a-HKD - MISA eShop](https://www.misaeshop.vn/36415/mau-so-s1a-hkd/)
- [Thong tu 152/2025/TT-BTC - Thu vien phap luat](https://thuvienphapluat.vn/phap-luat/mau-so-s1ahkd-theo-thong-tu-1522025ttbtc-mau-so-doanh-thu-ban-hang-hoa-dich-vu-moi-nhat-2026-ra-sao-250054.html)
- [Ke toan Bach Khoa - Excel template](https://ketoanbachkhoa.vn/tai-ve-excel-mau-so-s1a-hkd/)
