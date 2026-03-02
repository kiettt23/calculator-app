# Hướng Dẫn Design

## Thương Hiệu (Brand)

### Logo & Identity

**Logo**: Petrolimex icon (PNG format - 2026 rebrand)
- **Formats**:
  - icon-180.png (Apple touch icon)
  - icon-192.png (Android home screen)
  - icon-512.png (Splash screen)
- **Color**: Innovative Blue (#1B2469)
- **Usage**: Header, home screen, favicon

**App Name**:
- **Full**: "Phiếu Cân Gas - Petrolimex"
- **Short**: "Cân Gas"
- **Font**: System default, bold

### Màu Sắc (Color Palette)

**Primary Brand Colors** (2026 Rebrand):
```css
--primary: #1B2469;      /* Innovative Blue - Main CTA */
--accent: #E85820;       /* Energetic Orange - Highlights */
--dark: #0d4f66;         /* Dark blue - Text, header */
```

**Neutral Colors**:
```css
--text: #333;            /* Primary text */
--text-light: #666;      /* Secondary text */
--bg: #f0f9fe;           /* Light background */
--bg-alt: #ffffff;       /* Card background */
--border: #ddd;          /* Borders, dividers */
--success: #28a745;      /* Success messages */
--danger: #dc3545;       /* Danger, delete actions */
--warning: #ffc107;      /* Warnings */
```

**Usage Rules**:
- **Primary blue** (#1B2469) - Main buttons, active states
- **Orange** (#E85820) - Secondary buttons, accents
- **Dark** (#0d4f66) - Text, headers, strong emphasis
- **Gray** (#999) - Disabled, secondary text
- **Red** (#dc3545) - Delete, danger actions
- **Green** (#28a745) - Success messages

**Contrast Ratios** (2026 Rebrand):
- Primary blue on white: 6.2:1 (AAA)
- Dark on white: 12.6:1 (AAA)
- Orange on white: 4.1:1 (AA)

### Phông Chữ (Typography)

**Font Stack** (Be Vietnam Pro + system fallback):
```css
font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont,
             'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

**Font Import** (Google Fonts):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Sizes**:
```css
--font-base: 18px;       /* Body text (mobile-first) */
--font-sm: 14px;         /* Small, labels */
--font-lg: 24px;         /* Headings */
--font-xl: 32px;         /* Page title */
```

**Line Heights**:
- Body: 1.6 (26px line)
- Heading: 1.2 (tight)
- Input: 1.5 (touch-friendly)

**Weights**:
- Regular: 400
- Medium: 500 (labels)
- Bold: 700 (headings, buttons)

## Layout & Spacing

### Responsive Breakpoints

```css
/* Mobile (320px+) - Default */
.container { width: 100%; }

/* Tablet (768px+) */
@media (min-width: 768px) {
  .container { display: grid; grid-template-columns: 1fr 1fr; }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .container { grid-template-columns: 1fr 1fr 1fr; }
}

/* Large Desktop (1440px+) */
@media (min-width: 1440px) {
  .container { max-width: 1400px; margin: 0 auto; }
}
```

**Target Devices**:
- iPhone 11: 414px ✓ (primary)
- iPad: 768px (tablet view)
- MacBook: 1440px+ (desktop)

### Spacing Scale

Consistent spacing using 8px base:
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
```

**Usage**:
- Margins: `margin: var(--space-md);` (16px)
- Padding: `padding: var(--space-md);` (16px)
- Gaps: `gap: var(--space-sm);` (8px)

### Grid System

**12-column grid** (for future use):
```css
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-md);
}

.col-6 { grid-column: span 6; }   /* 50% */
.col-4 { grid-column: span 4; }   /* 33% */
.col-3 { grid-column: span 3; }   /* 25% */
```

**Cylinder Cards** (current):
```css
.cylinder-list {
  display: grid;
  grid-template-columns: 1fr;      /* Mobile */
  gap: var(--space-md);
}

@media (min-width: 768px) {
  grid-template-columns: 1fr 1fr;  /* 2 col */
}

@media (min-width: 1024px) {
  grid-template-columns: 1fr 1fr 1fr; /* 3 col */
}
```

## Giao Diện Thành Phần (Components)

### Header
- **Height**: 80px (mobile), 100px (desktop)
- **Background**: Dark blue (#0d4f66)
- **Text**: White, bold
- **Title**: 32px, bold
- **Subtitle**: 14px, regular, lighter
- **Sticky**: Fixed top

```html
<header class="app-header">
  <h1>PHIẾU CÂN GAS</h1>
  <p>Tại trạm nạp - Gas Petrolimex</p>
</header>
```

**CSS**:
```css
.app-header {
  background: #0d4f66;
  color: white;
  padding: var(--space-lg);
  text-align: center;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 100;
}

.app-header h1 {
  font-size: var(--font-xl);
  margin: 0;
}

.app-header p {
  font-size: var(--font-sm);
  margin: var(--space-xs) 0 0;
  opacity: 0.9;
}
```

### Summary Bar (Sticky)
- **Position**: Sticky below header
- **Height**: 60px
- **Background**: Light blue (#f0f9fe)
- **Border**: Bottom 1px solid #ddd
- **Layout**: Flex, space-between

**Elements**:
- Total gas (large, bold)
- Cylinder count (smaller)

**CSS**:
```css
.summary-bar {
  position: sticky;
  top: 80px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  padding: var(--space-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 99;
}

.summary-total {
  text-align: center;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  color: #1B2469;
}

.summary-unit {
  font-size: 12px;
  color: var(--text-light);
}
```

### Input Card (Cylinder)
- **Layout**: 3 column flex or grid
- **Background**: White
- **Border**: 1px solid #ddd
- **Padding**: 12px
- **Border-radius**: 4px
- **Shadow**: 0 1px 3px rgba(0,0,0,0.1)

**Fields**:
1. Seri (input text)
2. Total (input number)
3. Tare (input number)
4. Gas (read-only, calculated)
5. Delete button

**Input Styling**:
```css
input {
  border: 1px solid var(--border);
  padding: 8px;
  border-radius: 4px;
  font-size: 16px;
  min-height: 44px; /* iOS touch target */
}

input:focus {
  outline: none;
  border-color: #1B2469;
  box-shadow: 0 0 0 3px rgba(95, 202, 236, 0.1);
}

input:disabled {
  background: #f5f5f5;
  color: var(--text-light);
}
```

### Buttons

**Primary Button** (Main action - "In phiếu"):
```css
.btn-primary {
  background: #1B2469;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  min-height: 44px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #3fb6d9;
}

.btn-primary:active {
  background: #2a9bc3;
}
```

**Secondary Button** (Secondary action - "Xem phiếu cũ"):
```css
.btn-secondary {
  background: white;
  color: #1B2469;
  border: 2px solid #1B2469;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f0f9fe;
}
```

**Danger Button** (Delete - "Xóa hết"):
```css
.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-danger:active {
  background: #a71d2a;
}
```

**Add Button** (+ Thêm bình):
```css
.btn-add {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-add:hover {
  background: #218838;
}
```

### Modal (History)
- **Overlay**: Black 50% opacity
- **Panel**: White, rounded corners
- **Max-width**: 500px (mobile), 600px (tablet)
- **Position**: Center, fixed

**CSS**:
```css
.history-modal {
  display: none; /* JS toggle */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.history-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.history-panel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}
```

### Toast Notification
- **Position**: Bottom center, fixed
- **Background**: Dark with text
- **Animation**: Slide up, fade out
- **Duration**: 2 seconds

**CSS**:
```css
.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 2000;
}

.toast.show {
  opacity: 1;
}
```

### Auto-save Indicator
- **Dot animation** - Pulse, then hidden
- **Position**: Bottom left, above buttons
- **Text**: "Tự động lưu"

**CSS**:
```css
.auto-save-hint {
  font-size: 12px;
  color: var(--text-light);
  text-align: center;
  margin: var(--space-md) 0;
}

.auto-save-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #28a745;
  border-radius: 50%;
  margin-right: 4px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

## Interaction & Animation

### Transitions
- **Duration**: 200ms (buttons), 300ms (modals)
- **Easing**: ease-out
- **Properties**: background, color, transform

```css
button {
  transition: background 0.2s ease-out;
}

.modal {
  transition: opacity 0.3s ease-out;
}
```

### Focus States
- **Outline**: 2px solid primary blue
- **Offset**: 2px
- **Visible**: On all interactive elements

```css
button:focus,
input:focus,
select:focus {
  outline: 2px solid #1B2469;
  outline-offset: 2px;
}
```

### Hover States
- **Desktop**: Change background/color on hover
- **Mobile**: No hover (touch devices don't support)
- **Active**: Darker/lighter shade on click

```css
@media (hover: hover) {
  button:hover {
    background: darken(current, 10%);
  }
}
```

## Accessibility (a11y)

### Color Contrast
- **Minimum**: 4.5:1 (AA)
- **Enhanced**: 7:1 (AAA preferred)
- **Tool**: Check contrast ratios at WebAIM

### Touch Targets
- **Minimum**: 44x44px (iOS, Android standard)
- **Recommended**: 48x48px
- **Implementation**: `min-height: 44px; min-width: 44px;`

### Semantic HTML
- `<header>`, `<main>`, `<footer>`
- `<button>` for actions (not `<a>` or `<span>`)
- `<label>` for form inputs
- `<fieldset>` for grouped inputs

### ARIA Attributes
- `role="banner"` - Header
- `role="status"` - Summary bar
- `role="list"` - Cylinder list
- `role="dialog"` - Modal
- `role="alert"` - Toast
- `aria-live="polite"` - Dynamic updates
- `aria-label` - Button labels

### Keyboard Navigation
- Tab through all inputs
- Enter to submit forms
- Escape to close modals
- Space to activate buttons

## Print Design

### Page Layout
- **Orientation**: Portrait
- **Margins**: 0.5" (12.7mm)
- **Width**: 8.5" (A4 = 8.27")
- **Height**: 11" (A4 = 11.69")

### Print Stylesheet
```css
@media print {
  /* Hide non-printable elements */
  .no-print { display: none !important; }

  /* Show print-only content */
  .print-only { display: block !important; }

  /* Optimize for paper */
  body {
    font-size: 12pt;
    line-height: 1.4;
    color: black;
    background: white;
  }

  /* Page breaks */
  .page-break { page-break-before: always; }

  /* Prevent breaking content */
  .card { page-break-inside: avoid; }
}
```

### Print View
- **Title**: PHIẾU CÂN GAS
- **Date**: 3 fields (Ngày, Tháng, Năm)
- **Table**: 2 column layout
  - Col 1: Seri, Cân toàn bộ, Tare
  - Col 2: Gas tồn, Ghi chú
- **Signatures**: 5 boxes at bottom

## Export (CSV)

### File Format
- **Format**: CSV (Comma-Separated Values)
- **Encoding**: UTF-8 with BOM (`\uFEFF`)
- **Filename**: `phieu-can-gas-{date}.csv`
- **Line ending**: CRLF (`\r\n`)

### CSV Structure
```
Seri,Cân Toàn Bộ,Trọng Lượng Vỏ,Gas Tồn
ABC123,100,10,90
DEF456,95,12,83
...
```

**Headers**:
- Seri
- Cân Toàn Bộ (Total)
- Trọng Lượng Vỏ (Tare)
- Gas Tồn (Gas residual)

## Dark Mode (Future v1.1)

### Dark Palette
```css
:root[data-theme="dark"] {
  --text: #e0e0e0;
  --bg: #1a1a1a;
  --bg-alt: #2d2d2d;
  --border: #444;
  --primary: #1B2469; /* Keep brand blue */
}
```

### Implementation
- Toggle button in header
- Store preference in localStorage
- Apply to entire app
- High contrast for accessibility

## Internationalization (Future v1.1)

### Current
- **Language**: Vietnamese (vi)
- **Locale**: vi-VN

### Future Support
- **English**: en
- **Numbers**: Format per locale
- **Dates**: DD/MM/YYYY (VI), MM/DD/YYYY (EN)

### Translation Keys
```javascript
const i18n = {
  vi: {
    title: "PHIẾU CÂN GAS",
    addButton: "+ Thêm bình mới",
    printButton: "In phiếu ra giấy",
    ...
  },
  en: {
    title: "GAS WEIGHING FORM",
    addButton: "+ Add New Cylinder",
    printButton: "Print Form",
    ...
  }
};
```

---

## Design Checklist

Before releasing new features:

- [ ] Colors match brand palette
- [ ] Typography follows scale
- [ ] Spacing uses 8px grid
- [ ] Responsive at all breakpoints
- [ ] Touch targets >= 44px
- [ ] Contrast >= 4.5:1
- [ ] Focus states visible
- [ ] Animations < 300ms
- [ ] Print layout works
- [ ] Modal accessible
- [ ] Toast readable
- [ ] Icons have labels

---

**Phiên Bản**: 1.0 | **Cập Nhật**: 02/03/2026
