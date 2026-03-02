# Tóm Tắt Codebase

## Cấu Trúc Tệp

```
petrolimex-calculator/
├── index.html              # Cấu trúc HTML (90 LOC)
├── app.js                  # Logic ứng dụng chính (638 LOC)
├── styles.css              # Styling (765 LOC)
├── sw.js                   # Service Worker (36 LOC)
├── manifest.json           # PWA manifest (14 LOC)
├── icon-180.png            # Apple touch icon
├── icon-192.png            # Android home screen icon
├── icon-512.png            # Splash screen icon (Petrolimex 2026 logo)
└── docs/                   # Tài liệu
```

**Tổng LOC**: ~1,543 | **Phụ Thuộc**: 0 | **Framework**: Vanilla JS | **Build**: Không

## app.js (638 LOC) - Logic Chính

### State Management
- `STORAGE_KEY`, `TARE_DB_KEY`, `HISTORY_KEY` - localStorage keys
- `DEFAULT_ROWS` = 40 bình
- `MAX_HISTORY` = 50 phiếu
- `state` = `{ date, cylinders: [] }`

### Initialization
- `DOMContentLoaded` → `loadData()`, `initDatePicker()`, `renderAllCards()`, `updateSummary()`, `registerServiceWorker()`
- Service worker registration
- iOS keyboard dismiss listener

### Data Persistence
**loadData()** - Tải dữ liệu từ localStorage
- Restore state nếu có, nếu không tạo 40 dòng trống

**safeSave(key, value)** - Lưu an toàn
- Try-catch localStorage.setItem
- Nếu quota đầy, xóa phiếu cũ nhất, retry
- Toast "Bộ nhớ đầy"

**autoSave()** - Auto-save debounce 800ms
- Throttle lưu liên tục

**saveData()** - Lưu state hiện tại

### Tare Weight Memory
**saveTareWeight(seri, tare)** - Lưu trọng lượng vỏ theo seri
**getTareWeight(seri)** - Lấy tare nếu seri trùng
- Key: seri, Value: tare number

### Vietnamese Date Picker
**initDatePicker()** - Setup 3 dropdown
- Days 1-31, Months 1-12, Years (current ±2)
- Restore state hoặc set hôm nay
- On change → format YYYY-MM-DD, autoSave

### Calculation
**parseNum(v)** - Parse số, hỗ trợ dấu phẩy/chấm
- "10,5" → 10.5
- "10.5" → 10.5
- Empty → NaN

**calculateGas(total, tare)** - Gas = total - tare
**getFilledCount()** - Đếm bình có seri
**getTotalGas()** - Tổng gas = sum of all (total - tare)

### Rendering
**renderAllCards()** - Render 40 card input
- Inline event handlers
- Uncontrolled inputs
- Gas calculated on blur

**renderCard(cyl, idx)** - HTML template cho 1 bình
- Seri input → saveTare, validate duplicate
- Total input → calculateGas, autoSave
- Tare input → calculateGas, autoSave
- Delete button → removeRow
- Display gas = total - tare

**updateSummary()** - Update sticky bar
- totalGas, filledCount / totalCount

### History
**getHistory()** - Lấy history array từ localStorage
**saveHistory()** - Save phiếu hiện tại vào history
- Thêm `{ date, cylinders, timestamp }`
- Giữ max 50

**showHistory()** - Modal danh sách phiếu cũ
**loadHistory(idx)** - Tải phiếu cũ vào state
**deleteHistory(idx)** - Xóa phiếu từ history
**closeHistory()** - Đóng modal

### Actions
**addRow()** - Thêm bình mới (max 100)
**removeRow(idx)** - Xóa bình
**clearAll()** - Xóa hết, tạo 40 dòng mới, confirm
**printForm()** - In phiếu
**exportCSV()** - Xuất CSV
**showToast(msg)** - Toast notification

### Validation
**validateDuplicate(seri)** - Cảnh báo seri trùng
- Check cylinders array
- Toast warning

### Print & Export
**printForm()** - Render HTML print view
- Layout 2 cột
- Header, date, gas table
- 5 chữ ký box
- CSS `@media print`

**exportCSV()** - CSV UTF-8 BOM
- Headers: Seri, Cân Toàn Bộ, Trọng Lượng Vỏ, Gas Tồn
- BOM: `\uFEFF`
- Download filename: `phieu-can-gas-{date}.csv`

### Utils
**showToast(msg)** - Toast 2 giây
**initIOSKeyboardDismiss()** - Tap ngoài dismiss keyboard

## styles.css (765 LOC) - Styling

### Variables & Reset
- CSS variables: `--primary`, `--accent`, `--text`, `--bg`
- Petrolimex colors (2026 rebrand): Innovative Blue #1B2469, Orange #E85820, Dark #0d4f66
- Reset margin/padding, box-sizing: border-box

### Layout
**Mobile-first responsive**
- 320px base (mobile)
- 768px breakpoint (tablet 1 col)
- 1024px breakpoint (desktop 2 col grid)
- 1440px breakpoint (3 col grid)

**Sticky header** - app-header fixed
**Sticky summary bar** - summary-bar sticky top
**Auto-save indicator** - dot animation
**Toast** - fixed position, animation slide-in/out

### Components
- Header - title, subtitle
- Summary bar - total gas, count
- Date picker - 3 select boxes
- Cylinder card - input layout
- Buttons - primary, secondary, danger, add
- Modal - history panel
- Print view - 2 column layout

### Print Styles
`@media print`
- Hide buttons, modal, toast
- Show print view
- Page break rules
- Optimize for paper

### Responsive Design
- **Mobile (320px)**: 1 column, single-column layout
- **Tablet (768px)**: 2 col grid, larger touch targets
- **Desktop (1024px+)**: 3 col grid, optimize screen space

## index.html (87 LOC) - Structure

### Semantic HTML
- `<header role="banner">` - App header
- `<div role="status">` - Summary bar
- `<div role="list">` - Cylinder list
- `<div role="dialog">` - History modal
- `<div role="alert">` - Toast

### Accessibility
- `aria-label`, `aria-live`, `aria-label` attributes
- `role` attributes cho context
- Semantic form elements

### PWA Meta Tags
- `<meta name="apple-mobile-web-app-capable">`
- `<meta name="theme-color">`
- `<meta name="viewport">`
- `<link rel="manifest">`
- `<link rel="apple-touch-icon">`

## sw.js (36 LOC) - Service Worker

**Strategy**: Cache-first
- Cache assets on install
- Serve from cache first
- Fall back to network
- No cache updates (manual refresh)

**Cache List**:
- index.html
- app.js
- styles.css
- manifest.json
- icon-180.png
- icon-192.png
- icon-512.png

## manifest.json (14 LOC) - PWA

```json
{
  "name": "Phiếu Cân Gas - Petrolimex",
  "short_name": "Cân Gas",
  "start_url": "./",
  "display": "standalone",
  "theme_color": "#0d4f66",
  "background_color": "#f0f9fe",
  "icons": [
    { "src": "icon-180.png", "sizes": "180x180" },
    { "src": "icon-192.png", "sizes": "192x192" },
    { "src": "icon-512.png", "sizes": "512x512" }
  ]
}
```

**Purpose**: Make it installable on home screen

## Data Flow

```
User Input (seri, total)
       ↓
onChange Event Handler
       ↓
parseNum() → calculateGas()
       ↓
Update DOM + state
       ↓
autoSave() (debounce 800ms)
       ↓
localStorage safeSave()
       ↓
updateSummary()
```

## Key Design Patterns

| Pattern | Lokasi | Tujng |
|---------|--------|-------|
| Full Re-render | renderAllCards() | Thay đổi structure |
| Surgical Patch | renderCard() update | Input thường xuyên |
| Debounce | autoSave() 800ms | Giảm I/O |
| Try-Catch | safeSave(), getTareWeight() | Error handling |
| Inline Handlers | HTML string events | Simplicity |
| Section Comments | `/* ===== ... =====` | Module boundaries |

## Performance Considerations

- **No framework overhead** - Vanilla JS lightweight
- **No build step** - Direct execution
- **Debounce auto-save** - No spam I/O
- **CSS Grid/Flex** - GPU-accelerated layout
- **Uncontrolled inputs** - Skip synthetic events
- **Service worker cache** - Instant offline load

## Browser Support

- iOS 12+
- Android 4.4+
- Chrome 40+
- Firefox 25+
- Safari 6+

## Known Limitations

- No server sync
- Single device only
- localStorage 5MB limit
- No encryption
- No authentication

---

---

**Phiên Bản**: 1.0 | **Cập Nhật**: 02/03/2026
**Repo**: kiettt23/petrolimex-calculator
