# Research Report: Excel Export & PWA Subfolder Setup
**Date:** 2026-03-03 | **Status:** Complete | **Max Lines:** 150

---

## Topic 1: Excel Export in Vanilla JS

### Best Approach: SheetJS via CDN
**Recommendation: YES, use SheetJS CDN as sole dependency** — only 300KB minified, solves xlsx export reliably.

**Implementation:**
```html
<script src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"></script>
```
- Works instantly in vanilla JS: `XLSX.utils.table_to_book()` + `XLSX.writeFile()`
- Alternative: Use ES Module: `import { read, writeFileXLSX } from "https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs"`
- Can vendor locally by downloading `.min.js` to `/public` for offline resilience

### CSV Alternative
✓ **Pros:** Zero dependencies, UTF-8 BOM adds Vietnamese support, already used in sister app
✗ **Cons:** No formatting, no multi-sheet, less professional, Excel requires extra step (Import dialog on mobile)

### For Vietnamese Non-Tech Users (Mobile)
**Winner: SheetJS .xlsx** — Vietnamese often open files on phones via Files app, which auto-opens .xlsx natively. CSV opens as text-view first (confusing). UTF-8 BOM + native .xlsx file = zero friction.

**Not worth adding CSV complexity if xlsx works.**

---

## Topic 2: PWA Subfolder Setup (/revenue/)

### Critical Config
```json
{
  "scope": "/revenue/",
  "start_url": "/revenue/index.html",
  "display": "standalone"
}
```
⚠️ **Both must include subfolder path** — default scope inferred from manifest location; if manifest in subfolder, scope defaults to that subfolder.

### Service Worker Scope
- File location = scope. Place `sw.js` in `/revenue/sw.js` → scope defaults to `/revenue/`
- Register with: `navigator.serviceWorker.register('/revenue/sw.js')`
- **Optional:** Add HTTP header `Service-Worker-Allowed: /` to broaden scope (rarely needed for single PWA)

### Multiple PWAs Same Domain (/revenue/ + /)
**YES, both installable separately** ✓ with caveats:
- iOS: Install same PWA twice, each gets isolated storage (separate cache, localStorage)
- Android: Same behavior — separate app instances with isolated caches
- **Gotcha:** If outer app (/) scope overlaps inner (/revenue/), links from outer won't deep-link into inner properly. **Keep scopes non-overlapping: `/` and `/revenue/` work fine.**
- **Best practice:** Use subdomains if possible (e.g., `revenue.example.com`), but same domain + non-overlapping paths is acceptable.

### GitHub Pages Subfolder PWAs
⚠️ **Critical Gotchas:**
1. **Trailing slash required:** URLs must be `/revenue/` not `/revenue` — service worker may not register without it
2. **Absolute paths in registration:** Use `navigator.serviceWorker.register('/revenue/sw.js')` — relative paths fail
3. **Cache versioning:** Change cache name every deploy, or users get stale assets
4. **Cache filtering:** If multiple PWAs exist, `caches.keys()` returns ALL caches on domain — filter by app prefix
5. **HTTPS enforced:** GitHub Pages auto-provides HTTPS (✓ benefit for service workers)

### Static Hosting (Vercel/Netlify)
- Same rules apply as GitHub Pages
- Ensure redirects configured properly if using `/revenue` without trailing slash
- Service-Worker-Allowed header useful if you need broader scope than subfolder

---

## Recommendation Summary
1. **Use SheetJS CDN** for .xlsx export (only real dependency needed)
2. **Configure manifest/sw properly** for `/revenue/` subfolder
3. **Test both PWA installations** on real iOS + Android device before release
4. **Always use trailing slashes** in GitHub Pages PWA paths
5. **Version caches aggressively** on each deploy

---

## Sources
- [SheetJS CDN Documentation](https://cdn.sheetjs.com/)
- [SheetJS Standalone Installation](https://docs.sheetjs.com/docs/getting-started/installation/standalone/)
- [Web App Manifest - MDN](https://developer.mozilla.org/en-US/docs/Web/Manifest/start_url)
- [Multiple PWAs Same Domain - web.dev](https://web.dev/articles/building-multiple-pwas-on-the-same-domain)
- [PWA Scope & Service Workers - DEV Community](https://dev.to/devv-romano/how-to-scope-your-pwa-service-workers-1n6m)
- [GitHub Pages PWA Considerations - Christian Heilmann](https://christianheilmann.com/2022/01/13/turning-a-github-page-into-a-progressive-web-app/)
