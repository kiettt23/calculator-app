# Phase 05: Responsive & Polish (Integration, Responsive CSS, main.js)

## Parallelization
- **Depends on ALL prior phases** (01, 02, 03, 04)
- **Runs AFTER** Phases 01-04 complete
- **Exclusive files:** `css/responsive.css`, `js/main.js`

## Overview
- Priority: P1
- Status: completed
- Estimated effort: 1.5h
- Final integration: wire all modules together in main.js, add responsive breakpoints, polish UX

## Context Links
- Reference: Gas app `js/main.js`, `css/responsive.css`
- All Phase 01-04 outputs

## Key Insights
- main.js is the single entry point that imports all modules and exposes window functions
- Responsive breakpoints follow Gas app pattern: 768px (tablet), 1024px (desktop)
- No 3-column layout needed (revenue app is simpler than Gas app)
- iOS keyboard dismiss, offline indicator, PWA install prompt — same patterns as Gas app

## Related Code Files (to create)
- `revenue/js/main.js`
- `revenue/css/responsive.css`

## Implementation Steps

### Step 1: Create `revenue/js/main.js`
Entry point that wires everything together:

```javascript
/* ========== Revenue App Entry Point ========== */
import { loadEntries } from './state.js';
import { renderSummary, renderEntryList, renderFormForDate } from './render.js';
import {
  initForm, onEditEntry, onDeleteEntry
} from './handlers.js';
import { printMonth } from './print.js';
import { exportExcel } from './export.js';
import { showToast, getTodayISO } from './utils.js';

/* Expose functions for inline HTML onclick handlers */
window.printMonth = printMonth;
window.exportExcel = exportExcel;
window.onEditEntry = onEditEntry;
window.onDeleteEntry = onDeleteEntry;

/* ========== PWA Service Worker ========== */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
  if (isLocal) {
    navigator.serviceWorker.getRegistrations()
      .then(regs => regs.forEach(r => r.unregister()));
    return;
  }
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

/* ========== PWA Install Prompt ========== */
let _installPrompt = null;

function installApp() {
  if (_installPrompt) {
    _installPrompt.prompt();
    _installPrompt.userChoice.then(() => { _installPrompt = null; });
    return;
  }
  if (/iP(hone|ad|od)/.test(navigator.userAgent)) {
    showToast('iOS: Nhan Share > Them vao man hinh chinh');
    return;
  }
  showToast('Menu trinh duyet > Cai dat ung dung');
}
window.installApp = installApp;

function initInstallPrompt() {
  if (window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone) return;
  const btn = document.getElementById('btnInstall');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _installPrompt = e;
    if (btn) btn.style.display = 'flex';
  });
  window.addEventListener('appinstalled', () => {
    if (btn) btn.style.display = 'none';
    _installPrompt = null;
    showToast('Da cai ung dung thanh cong!');
  });
  if (/iP(hone|ad|od)/.test(navigator.userAgent) && btn) {
    btn.style.display = 'flex';
  }
}

/* ========== Offline Indicator ========== */
function initOfflineIndicator() {
  const bar = document.getElementById('offlineBar');
  if (!bar) return;
  function update() { bar.classList.toggle('show', !navigator.onLine); }
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}

/* ========== iOS Keyboard Dismiss ========== */
function initIOSKeyboardDismiss() {
  document.addEventListener('touchend', (e) => {
    if (!e.target.closest('input, select, textarea, button')) {
      document.activeElement.blur();
    }
  }, { passive: true });
}

/* ========== Init ========== */
document.addEventListener('DOMContentLoaded', () => {
  loadEntries();
  initForm();
  renderFormForDate(getTodayISO());
  renderEntryList();
  renderSummary();
  initIOSKeyboardDismiss();
  initOfflineIndicator();
  initInstallPrompt();
  registerServiceWorker();
});
```

### Step 2: Create `revenue/css/responsive.css`
Follow Gas app breakpoint pattern but simpler layout:

```css
/* ========== Tablet: 768px+ ========== */
@media (min-width: 768px) {
  body { background: #f0f4f8; }

  .app-header {
    max-width: 600px;
    margin: 24px auto 0;
    border-radius: 12px 12px 0 0;
  }
  .summary-bar {
    max-width: 600px;
    margin: 0 auto;
  }
  .entry-form {
    max-width: 576px;
    margin: 16px auto;
  }
  .month-filter {
    max-width: 576px;
    margin: 0 auto;
  }
  .entry-list {
    max-width: 600px;
    margin: 0 auto;
  }
  .actions {
    max-width: 576px;
    margin: 0 auto;
  }
}

/* ========== Desktop: 1024px+ ========== */
@media (min-width: 1024px) {
  .app-header {
    max-width: 720px;
    margin-top: 32px;
  }
  .summary-bar { max-width: 720px; }
  .entry-form {
    max-width: 696px;
    padding: 20px 24px;
  }
  .form-row-split { gap: 16px; }
  .month-filter { max-width: 696px; }
  .entry-list { max-width: 720px; }
  .actions {
    max-width: 696px;
    flex-direction: row;
  }
  .actions .btn-row { flex: 1; }
}

/* ========== Reduced Motion ========== */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

### Step 3: Integration Testing Checklist
After all phases merged, verify end-to-end:

1. **PWA**: manifest loads, SW registers, app installable
2. **Form**: date defaults to today, auto-loads existing entry
3. **CRUD**: save new entry, edit existing, delete with confirm
4. **VND formatting**: amounts format correctly on input and display
5. **Summary**: updates on save/delete/month change
6. **Month nav**: prev/next changes entry list + summary
7. **Print**: all days of month, missing = "---", totals correct
8. **Export**: .xlsx downloads, opens on mobile
9. **Offline**: all features work without network
10. **Responsive**: tablet centered, desktop wider, mobile full-width

### Step 4: Polish UX Details
- Smooth scroll to form on entry tap
- Toast messages for all user actions
- Confirm dialog for delete operations
- Button active states (scale + opacity)
- Focus styles on all inputs (teal glow)
- Auto-format VND on blur (cleanup partial input)

## Todo List
- [ ] Create main.js with all imports, window exports, PWA handlers, init
- [ ] Create responsive.css with 768px + 1024px breakpoints
- [ ] Run full integration test (all 10 checkpoints above)
- [ ] Verify offline mode works (disable network in DevTools)
- [ ] Verify print output (Ctrl+P or window.print())
- [ ] Verify Excel export downloads correctly
- [ ] Test on mobile viewport (Chrome DevTools device mode)
- [ ] Verify WCAG AAA contrast ratios on teal palette

## Success Criteria
- App loads without console errors
- All features work end-to-end (CRUD, print, export)
- PWA installable on Android + iOS
- Offline capable (SW caches all assets)
- Responsive at all breakpoints
- All touch targets >= 44px
- Vietnamese text throughout, no English UI strings

## Conflict Prevention
- main.js only imports from other modules — never modifies their files
- responsive.css only adds `@media` rules — never overrides base component styles
- All Phase 01-04 files frozen at this point

## Risk Assessment
- **Import errors**: If any Phase 01-04 module has export typos, main.js will fail. Verify all exports match.
- **XLSX global timing**: SheetJS `<script>` tag must appear before `<script type="module">` in HTML to ensure XLSX global exists when export.js runs.
- **SW cache staleness**: After integration changes, bump cache version in sw.js (`so-doanh-thu-v2`).

## Security Considerations
- No user auth needed (local-only app)
- localStorage data stays on device
- No external API calls (except Google Fonts CDN + SheetJS if not vendored)
- XSS prevention: all user input escaped via `escapeHTML()` before rendering
- CSP: consider adding `<meta http-equiv="Content-Security-Policy">` in future iteration
