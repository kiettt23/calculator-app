# Tiêu Chuẩn Code

## Quy Tắc Chung

### 1. Naming Convention

**Variables & Functions**: `camelCase`
```javascript
let state = {};
function saveData() {}
let autoSaveTimer;
```

**Constants**: `UPPER_SNAKE_CASE`
```javascript
const STORAGE_KEY = 'phieu-can-gas-data';
const DEFAULT_ROWS = 40;
const MAX_HISTORY = 50;
```

**localStorage Keys**: `kebab-case` (như URL)
```javascript
const STORAGE_KEY = 'phieu-can-gas-data';
const TARE_DB_KEY = 'phieu-can-gas-tare-db';
const HISTORY_KEY = 'phieu-can-gas-history';
```

**CSS Classes**: `kebab-case`
```css
.app-header
.cylinder-card
.auto-save-hint
```

### 2. File Organization

**Organize by functional sections** với block comments:
```javascript
/* ========== State ========== */
/* ========== Init ========== */
/* ========== Data Persistence ========== */
/* ========== Calculation ========== */
/* ========== Rendering ========== */
```

**Order**: Từ abstract → concrete
1. Constants, config
2. State, type definitions
3. Init, setup
4. Business logic
5. UI rendering
6. Event handlers
7. Utilities

### 3. Code Quality

**Keep functions focused** - 1 trách nhiệm chính
- `loadData()` - chỉ load từ localStorage
- `saveData()` - chỉ save vào localStorage
- `calculateGas(total, tare)` - chỉ tính toán

**Avoid duplication** - DRY principle
- Extract common logic thành function
- Reuse instead of copy-paste
- Ví dụ: `parseNum()` cho tất cả input

**Use meaningful names**
```javascript
// Good
function validateDuplicate(seri) { }
function getTotalGas() { }

// Bad
function check(s) { }
function calc() { }
```

**Keep file size reasonable**
- app.js: ~638 LOC ✓
- styles.css: ~765 LOC ✓
- Nếu vượt 200 LOC (code file) → split module

### 4. Comments & Documentation

**Section headers** - Module boundaries
```javascript
/* ========== Vietnamese Date Picker ========== */
```

**Complex logic** - Giải thích TẠI SAO
```javascript
// safeSave deletes old history if quota full
// to free space for new data before retry
function safeSave(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // Quota exceeded → delete oldest entry
    const history = getHistory();
    if (history.length > 0) {
      history.pop();
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  }
}
```

**Avoid over-commenting** - Code phải tự-giải-thích
```javascript
// Bad: Quá dễ hiểu
const year = new Date().getFullYear(); // Get current year

// Good: Giải thích intention
const year = new Date().getFullYear(); // Current year for dropdown range
```

### 5. Error Handling

**Always wrap localStorage**
```javascript
try {
  localStorage.setItem(key, value);
} catch (e) {
  // Handle quota or other errors
  showToast('Lỗi lưu: ' + e.message);
}
```

**Graceful degradation** - fallback nếu fail
```javascript
function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) state = JSON.parse(saved);
  } catch {
    state.cylinders = createEmptyRows(DEFAULT_ROWS);
  }
}
```

**Use try-catch cho JSON.parse**
```javascript
try {
  const db = JSON.parse(localStorage.getItem(TARE_DB_KEY) || '{}');
  return db[seri.trim()] || null;
} catch {
  return null; // Safe default
}
```

### 6. Input Validation

**Always trim & normalize**
```javascript
seri.trim() // Remove whitespace
total.trim() // User input cleanup
```

**Parse numbers safely**
```javascript
function parseNum(v) {
  if (!v && v !== 0) return NaN;
  const str = String(v).trim().replace(/,/g, '.'); // Comma → dot
  const num = parseFloat(str);
  return isNaN(num) ? NaN : num;
}
```

**Validate before business logic**
```javascript
function calculateGas(total, tare) {
  total = parseNum(total);
  tare = parseNum(tare);
  if (isNaN(total) || isNaN(tare)) return 0;
  return total - tare;
}
```

### 7. Performance

**Debounce auto-save** - Không spam localStorage
```javascript
let autoSaveTimer;
function autoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => saveData(), 800);
}
```

**Surgical updates** - Không re-render toàn bộ
```javascript
// Partial update khi user type
function onTotalInput(idx) {
  updateSummary(); // Only update summary
  autoSave(); // Debounced save
}

// Full re-render khi thêm/xóa
function addRow() {
  state.cylinders.push({...});
  renderAllCards(); // Full re-render
  updateSummary();
}
```

**Avoid unnecessary DOM updates**
```javascript
// Use event delegation nếu có many elements
// Use uncontrolled inputs (form.elements) nếu cần

// Avoid: document.querySelectorAll('input') every time
// Prefer: form.seriInput, form.totalInput direct reference
```

### 8. State Management

**Single source of truth**
```javascript
let state = {
  date: new Date().toISOString().split('T')[0],
  cylinders: []
};
```

**Immutable updates** - Luôn tạo object mới cho array change
```javascript
// Add
state.cylinders.push(newCyl);
state.cylinders = [...state.cylinders, newCyl]; // Preferred

// Remove
state.cylinders.splice(idx, 1);
state.cylinders = state.cylinders.filter((_, i) => i !== idx); // Preferred

// Update
state.cylinders[idx] = { ...state.cylinders[idx], tare: newTare };
```

**Persist after every change**
```javascript
// Sau mỗi state change, gọi autoSave()
function onInputChange() {
  updateState();
  autoSave(); // Schedule save
}
```

### 9. HTML Generation

**Use template literals** cho HTML strings
```javascript
const html = `
  <div class="card">
    <input type="text" value="${seri}">
    <button onclick="removeRow(${idx})">Delete</button>
  </div>
`;
```

**Escape user input** để prevent XSS
```javascript
// Using textContent để tránh injection
const div = document.createElement('div');
div.textContent = userInput; // Safe
element.appendChild(div);

// Hoặc escape manually
const escaped = seri.replace(/[&<>"']/g, char => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[char]));
```

### 10. Event Handlers

**Use inline for simple logic**
```html
<button onclick="addRow()">Add</button>
<button onclick="removeRow(${idx})">Delete</button>
```

**Use addEventListener for complex**
```javascript
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  initDatePicker();
  renderAllCards();
});
```

**Event delegation cho dynamic content**
```javascript
// Thay vì addEventListener cho mỗi card
// Delegate từ parent
document.getElementById('cylinderList').addEventListener('change', (e) => {
  if (e.target.matches('input.seri')) {
    onSeriChange(e.target.value);
  }
});
```

## CSS Standards

### 1. Organization

**Order properties logically**
1. Layout (display, position, width, height)
2. Spacing (margin, padding)
3. Typography (font, color, text-align)
4. Background & borders
5. Effects (box-shadow, transform)
6. Transitions & animations

```css
.btn {
  /* Layout */
  display: inline-block;
  width: 100%;
  min-height: 44px; /* iOS touch target */

  /* Spacing */
  margin: 0.5rem 0;
  padding: 0.75rem 1rem;

  /* Typography */
  font-size: 1.125rem;
  font-weight: 600;
  text-align: center;

  /* Appearance */
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;

  /* Interaction */
  cursor: pointer;
  transition: background 0.2s;
}

.btn:active {
  background: var(--primary-dark);
}
```

### 2. Responsive Design

**Mobile-first breakpoints**
```css
/* Base: Mobile (320px+) */
.card { grid-template-columns: 1fr; }

/* Tablet (768px+) */
@media (min-width: 768px) {
  .container { display: grid; grid-template-columns: 1fr 1fr; }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .container { grid-template-columns: 1fr 1fr 1fr; }
}

/* Large desktop (1440px+) */
@media (min-width: 1440px) {
  .container { max-width: 1400px; }
}
```

### 3. Variables & Colors

**Define color variables** (2026 Rebrand):
```css
:root {
  --primary: #1B2469; /* Innovative Blue */
  --accent: #E85820; /* Energetic Orange */
  --dark: #0d4f66; /* Dark */
  --text: #333;
  --bg: #f0f9fe;
  --border: #ddd;
}
```

**Use variables consistently**
```css
/* Good */
.btn-primary { background: var(--primary); }
.input { border-color: var(--border); }

/* Bad - hardcoded colors */
.btn { background: #5FCAEC; }
```

### 4. Accessibility

**Touch targets >= 44px**
```css
button, input, select {
  min-height: 44px; /* iOS, Android */
  min-width: 44px;
}
```

**Color contrast >= 4.5:1**
```css
body {
  color: #333; /* dark on light */
  background: #fff;
  /* Contrast ratio: 12.6:1 ✓ */
}
```

**Focus visibility**
```css
button:focus,
input:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### 5. Print Styles

**Optimize for print**
```css
@media print {
  /* Hide interactive elements */
  .no-print { display: none; }

  /* Show print-only content */
  .print-only { display: block; }

  /* Optimize layout */
  body { font-size: 12pt; }

  /* Page breaks */
  .page-break { page-break-before: always; }
}
```

## JavaScript Best Practices

### 1. Use const/let, avoid var
```javascript
// Good
const CONSTANT = 100;
let variable = 'value';
let state = {};

// Bad
var x = 5; // Function-scoped, confusing
```

### 2. Arrow functions for callbacks
```javascript
// Good
setTimeout(() => saveData(), 800);
[1, 2, 3].map(n => n * 2);

// Also ok for simple functions
function calculateGas(total, tare) {
  return total - tare;
}
```

### 3. Template literals for strings
```javascript
// Good
const html = `<div class="card">${content}</div>`;
const msg = `Gas: ${gas}kg`;

// Ok
const msg = 'Gas: ' + gas + 'kg';
```

### 4. Destructuring
```javascript
// Good
const { date, cylinders } = state;
const [day, month, year] = dateString.split('-');

// Ok for simple cases
const date = state.date;
const cylinders = state.cylinders;
```

## Testing

### Unit Test Standards

**Test critical functions**
```javascript
// Test: parseNum
assert(parseNum('10.5') === 10.5);
assert(parseNum('10,5') === 10.5);
assert(isNaN(parseNum('')));

// Test: calculateGas
assert(calculateGas(100, 10) === 90);
assert(calculateGas(10, 20) === -10);
```

**Test edge cases**
```javascript
// Empty input
calculateGas('', '') // → 0

// Negative
calculateGas(-10, 5) // → -15

// Very large
calculateGas(999999, 1) // → 999998
```

---

**Phiên Bản**: 1.3 | **Cập Nhật**: 03/03/2026 | **Note**: Chuẩn này áp dụng cho cả Gas app và Revenue app
