# Kiến Trúc Hệ Thống

## Tổng Quan Kiến Trúc

```
┌─────────────────────────────────────────────┐
│     Presentation Layer (HTML/CSS)           │
│  - Header, Summary Bar, Input Cards, Modal  │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│     Business Logic Layer (JavaScript)       │
│  - State Management, Calculations, Events   │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│     Data Layer (localStorage)               │
│  - State Persistence, Tare DB, History      │
└─────────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│     Offline Layer (Service Worker)          │
│  - Cache-first Strategy, Offline Support    │
└─────────────────────────────────────────────┘
```

## Component Architecture

### 1. Presentation Layer

**Phần tử chính**:
- `app-header` - Title, subtitle
- `summary-bar` - Sticky bar, total gas + count
- `cylinder-list` - 40 card input
- `history-modal` - Danh sách phiếu cũ
- `toast` - Notification

**Điểm đặc biệt**:
- Semantic HTML với ARIA roles
- Responsive CSS Grid + Flexbox
- Mobile-first design
- No JS framework, pure HTML string render

```
HTML (index.html)
   ↓
CSS (styles.css) - 3 breakpoints (768px, 1024px, 1440px)
   ↓
JavaScript rendering (app.js renderAllCards)
```

### 2. Business Logic Layer

**State Container**:
```javascript
state = {
  date: "2026-03-02",
  cylinders: [
    { seri: "ABC123", total: 100, tare: 10 },
    { seri: "", total: "", tare: "" },
    ...40 items
  ]
}
```

**Core Functions**:

| Hàm | Input | Output | Tác Dụng |
|-----|-------|--------|----------|
| `loadData()` | - | state | Restore từ localStorage |
| `saveData()` | - | - | Lưu state vào localStorage |
| `autoSave()` | - | - | Debounce save 800ms |
| `calculateGas(total, tare)` | numbers | number | Gas = total - tare |
| `getTotalGas()` | - | number | Sum all (total - tare) |
| `getFilledCount()` | - | number | Count bình có seri |
| `parseNum(v)` | string | number | Parse với dấu phẩy/chấm |
| `saveTareWeight(seri, tare)` | string, number | - | Lưu tare theo seri |
| `getTareWeight(seri)` | string | number | Lấy tare nếu seri trùng |

**Event Flow**:
```
User Type Input
   ↓
onChange/onInput event
   ↓
Parse & Validate
   ↓
Update state.cylinders[idx]
   ↓
Render card (updateCard or renderCard)
   ↓
Update summary (updateSummary)
   ↓
Trigger autoSave
   ↓
localStorage.setItem (800ms debounce)
```

### 3. Data Layer - localStorage

**Storage Schema**:

```javascript
// phieu-can-gas-data (State hiện tại)
{
  "date": "2026-03-02",
  "cylinders": [
    { "seri": "ABC123", "total": "100", "tare": "10" },
    ...
  ]
}

// phieu-can-gas-tare-db (Tare Memory)
{
  "ABC123": 10,
  "DEF456": 12,
  ...
}

// phieu-can-gas-history (Lịch sử)
[
  { "date": "2026-02-28", "cylinders": [...], "timestamp": 1234567890 },
  { "date": "2026-03-01", "cylinders": [...], "timestamp": 1234567891 },
  ...max 50
]
```

**Quota Handling**:
```
Try: localStorage.setItem(key, data)
  ├─ Success → Done
  └─ QuotaExceeded → Delete oldest history
                     Retry save
                     Toast: "Bộ nhớ đầy"
```

**Fallback**:
- Nếu localStorage unavailable → in-memory only
- Dữ liệu mất khi reload (acceptable offline-first tradeoff)

### 4. Offline Layer - Service Worker

**Strategy: Cache-First**

```
Request
   ↓
Check Cache
   ├─ Found → Return cached
   └─ Not found → Fetch from network
                  Cache & Return
                  If network fails → offline
```

**Cache Assets** (sw.js):
- index.html
- app.js
- styles.css
- manifest.json
- icon.svg

**Update Strategy**:
- No auto-update (manual refresh required)
- User controls cache expiry
- Simple & predictable

## Data Flow Diagrams

### Initialization Flow
```
DOMContentLoaded
   ├─ registerServiceWorker()
   ├─ loadData() → restore state from localStorage
   ├─ initDatePicker() → populate dropdowns
   ├─ initIOSKeyboardDismiss() → touch listener
   └─ renderAllCards() → render 40 cards + updateSummary()
```

### Input → Save Flow
```
User types in seri input
   ↓
onInput event → saveTareWeight(seri, tare)
   ↓
Validate duplicate → showToast if duplicate
   ↓
state.cylinders[idx].seri = value
   ↓
autoSave() debounce 800ms
   ↓
safeSave(STORAGE_KEY, JSON.stringify(state))
   ↓
localStorage.setItem() || handle QuotaExceeded
```

### Print/Export Flow
```
User clicks "In phiếu"
   ↓
printForm()
   ├─ Render HTML print-view
   ├─ Populate date, cylinders, gas values
   └─ CSS @media print { .no-print { display:none } }
   ↓
window.print() → Browser print dialog
```

## State Mutation Patterns

### Full Re-render (Structural Changes)
Khi thêm/xóa bình → render lại tất cả:
```javascript
addRow() {
  state.cylinders.push({ seri: '', total: '', tare: '' });
  renderAllCards(); // Full re-render
  updateSummary();
  autoSave();
}

removeRow(idx) {
  state.cylinders.splice(idx, 1);
  renderAllCards(); // Full re-render
  updateSummary();
  autoSave();
}
```

### Surgical Update (Input Changes)
Khi user type → update card riêng:
```javascript
function onSeriChange(idx, value) {
  state.cylinders[idx].seri = value;
  // Có thể update only card thay vì full render
  updateSummary();
  autoSave();
}
```

**Note**: Hiện tại dùng full render cho simplicity.
Nếu performance issue → optimize với updateCard(idx)

## Module Boundaries

| Module | Dòng | Trách Nhiệm |
|--------|------|------------|
| State | 1-20 | Constants, state definition |
| Init | 14-21 | Setup, DOMContentLoaded |
| PWA | 24-28 | Service worker registration |
| iOS | 31-37 | Keyboard dismiss |
| DatePicker | 40-82 | 3 dropdown initialization |
| DataPersistence | 84-147 | Load/save, localStorage |
| Tare | 131-146 | saveTareWeight, getTareWeight |
| Calculation | 148-170 | parseNum, calculateGas |
| Rendering | 172-250 | renderAllCards, renderCard |
| Summary | 252-270 | updateSummary |
| History | 272-350 | getHistory, saveHistory, showHistory |
| Actions | 352-450 | addRow, removeRow, clearAll |
| Print/Export | 452-550 | printForm, exportCSV |
| Validation | 552-580 | validateDuplicate |
| Utils | 582-638 | showToast, initIOSKeyboardDismiss |

## Performance Optimization

### 1. Debounced Auto-save
```javascript
let autoSaveTimer;
function autoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => saveData(), 800);
}
// Effect: Reduce localStorage writes from 40/s → 1.25/s on fast typing
```

### 2. Vanilla JS (No Framework)
- No React/Vue overhead
- Direct DOM manipulation
- Faster initial load

### 3. CSS GPU Acceleration
```css
.summary-bar {
  position: sticky; /* Hardware accelerated */
  will-change: transform; /* Hint to browser */
}
```

### 4. Lazy Service Worker
- Async registration
- Non-blocking
- Doesn't delay app load

## Error Handling Strategy

### localStorage Quota Exceeded
```javascript
safeSave(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // Delete oldest history, retry
    if (getHistory().length > 0) {
      history.pop();
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      safeSave(key, value); // Retry
    }
  }
}
```

### JSON Parse Errors
```javascript
try {
  const db = JSON.parse(localStorage.getItem(TARE_DB_KEY) || '{}');
  return db[seri.trim()] || null;
} catch {
  return null; // Safe fallback
}
```

### Invalid Input
```javascript
function parseNum(v) {
  if (!v && v !== 0) return NaN;
  const num = parseFloat(String(v).trim().replace(/,/g, '.'));
  return isNaN(num) ? NaN : num;
}
```

## Scalability Considerations

### Current Limitations
- Max 40 cylinders (configurable DEFAULT_ROWS)
- Max 50 history (configurable MAX_HISTORY)
- 5MB localStorage limit (browser limit)
- Single device, no sync

### If Need to Scale
1. **More data** → Server backend + sync
2. **Multiple users** → Authentication + multi-device
3. **Richer features** → Consider framework (React/Vue)
4. **Offline-first** → Encrypt + replicate localStorage

## Accessibility (a11y)

**Semantic HTML**:
- `role="banner"` header
- `role="status"` summary bar
- `role="list"` cylinder list
- `role="dialog"` modal
- `role="alert"` toast

**ARIA Live Regions**:
```html
<div role="status" aria-live="polite">
  Tự động lưu
</div>
```

**Touch Targets**: >= 44px (iOS/Android standard)

**Keyboard Navigation**: Tab through inputs, form.submit

## Monitoring & Logging

**No built-in monitoring**. To add:
- Browser console.log (dev)
- Error tracking (Sentry, LogRocket)
- Analytics (Google Analytics)
- localStorage usage monitor

## Technology Decisions

| Decision | Rationale |
|----------|-----------|
| Vanilla JS | No framework overhead, simple offline-first |
| localStorage | Built-in browser API, no server dependency |
| Service Worker cache-first | Instant offline, predictable |
| CSS Grid | Modern, responsive, no library needed |
| HTML string render | Simpler than shadow DOM or components |
| No build step | Direct execution, no dev environment |

---

**Phiên Bản**: 1.0 | **Cập Nhật**: 02/03/2026
