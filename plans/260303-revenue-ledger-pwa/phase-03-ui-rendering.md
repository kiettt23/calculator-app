# Phase 03: UI & Rendering (HTML + render.js + handlers.js + components CSS)

## Parallelization
- **Runs in parallel** with Phases 01, 02, 04
- **No dependencies** at file level (imports from Phase 02 resolved at runtime)
- **Exclusive files:** `index.html`, `js/render.js`, `js/handlers.js`, `css/components.css`

## Overview
- Priority: P1
- Status: completed
- Estimated effort: 2h
- The visual layer: HTML structure, DOM rendering functions, event handlers, component styles

## Context Links
- Research: `research/researcher-02-print-date-ux-report.md` (date input UX, currency formatting)
- Reference: Gas app `index.html`, `js/render.js`, `js/handlers.js`, `css/components.css`

## Key Insights
- Form is ALWAYS visible at top (not in a modal)
- Date input uses native `type="date"`, defaults to today
- If today already has entry, auto-load into form (edit mode)
- CK + TM inputs use `inputmode="decimal"`, auto-format VND on input
- Ghi chu (note) is optional text field
- Entry list grouped by month, tap to edit (loads into form), swipe/button to delete
- Summary bar shows 3 values: Tong, CK subtotal, TM subtotal for selected month

## Related Code Files (to create)
- `revenue/index.html`
- `revenue/js/render.js`
- `revenue/js/handlers.js`
- `revenue/css/components.css`

## Architecture

### HTML Structure (top to bottom)
```
body
  .offline-bar
  header.app-header — "So Doanh Thu"
  .summary-bar — 3 summary items (Tong | CK | TM)
  .entry-form — date, CK, TM, note, Luu button
  .month-filter — month/year selector
  .entry-list — entries for selected month
  .actions — In phieu + Xuat Excel buttons
  #printView — hidden print container
  #toast — toast notification
  #confirmOverlay — confirm dialog
  script[type=module] src="js/main.js"
```

### Data Flow
1. User changes date -> `handlers.onDateChange()` -> check if entry exists -> populate form or clear
2. User types amount -> `handlers.onAmountInput()` -> auto-format VND -> update form state
3. User clicks Luu -> `handlers.onSave()` -> validate -> `storage.upsertEntry()` -> re-render list + summary
4. User taps entry in list -> `handlers.onEditEntry(date)` -> load into form
5. User clicks delete on entry -> `handlers.onDeleteEntry(date)` -> confirm -> delete -> re-render

## Implementation Steps

### Step 1: Create `revenue/index.html`
Follow Gas app HTML structure pattern:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="format-detection" content="telephone=no">
  <meta name="theme-color" content="#0891B2">
  <link rel="manifest" href="manifest.json">
  <link rel="apple-touch-icon" href="assets/icon-180.png">
  <!-- Google Fonts (shared with Gas app) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">
  <title>So Doanh Thu</title>
  <!-- CSS -->
  <link rel="stylesheet" href="css/variables.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/responsive.css">
  <link rel="stylesheet" href="css/print.css">
</head>
<body>
  <div class="offline-bar" id="offlineBar">Khong co ket noi mang</div>

  <header class="app-header">
    <h1>SO DOANH THU</h1>
  </header>

  <!-- Summary Bar -->
  <div class="summary-bar" id="summaryBar" role="status" aria-live="polite">
    <div class="summary-item">
      <span class="summary-label">Tong</span>
      <span class="summary-value total" id="summaryTotal">0</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">CK</span>
      <span class="summary-value" id="summaryCK">0</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">TM</span>
      <span class="summary-value" id="summaryTM">0</span>
    </div>
  </div>

  <!-- Entry Form (always visible) -->
  <form class="entry-form no-print" id="entryForm" autocomplete="off">
    <div class="form-row">
      <label for="entryDate">Ngay</label>
      <input type="date" id="entryDate" class="date-input" required>
    </div>
    <div class="form-row form-row-split">
      <div class="input-group">
        <label for="entryCK">Chuyen khoan (CK)</label>
        <input type="text" id="entryCK" inputmode="decimal"
               placeholder="0" class="currency-input" autocomplete="off">
      </div>
      <div class="input-group">
        <label for="entryTM">Tien mat (TM)</label>
        <input type="text" id="entryTM" inputmode="decimal"
               placeholder="0" class="currency-input" autocomplete="off">
      </div>
    </div>
    <div class="form-row">
      <label for="entryNote">Ghi chu</label>
      <input type="text" id="entryNote" placeholder="Khong bat buoc"
             class="note-input" autocomplete="off">
    </div>
    <div class="form-row form-total-row">
      <span class="form-total-label">Tong ngay:</span>
      <span class="form-total-value" id="formTotal">0</span>
    </div>
    <button type="submit" class="btn btn-save" id="btnSave">Luu</button>
  </form>

  <!-- Month Filter -->
  <div class="month-filter no-print" id="monthFilter">
    <button class="btn-month-nav" id="btnPrevMonth" type="button">&lt;</button>
    <span class="month-label" id="monthLabel">Thang 3/2026</span>
    <button class="btn-month-nav" id="btnNextMonth" type="button">&gt;</button>
  </div>

  <!-- Entry List -->
  <div class="entry-list" id="entryList" role="list"></div>

  <!-- Action Buttons -->
  <div class="actions no-print">
    <div class="btn-row">
      <button class="btn btn-print" onclick="printMonth()" type="button">In phieu</button>
      <button class="btn btn-export" onclick="exportExcel()" type="button">Xuat Excel</button>
    </div>
    <button class="btn btn-dev" id="btnInstall" onclick="installApp()" type="button"
            style="display:none">Cai ung dung</button>
  </div>

  <!-- Print View (hidden on screen) -->
  <div class="print-view" id="printView"></div>

  <!-- Toast -->
  <div class="toast" id="toast" role="alert" aria-live="assertive"></div>

  <!-- Confirm Modal -->
  <div class="confirm-overlay" id="confirmOverlay" role="dialog" aria-modal="true">
    <div class="confirm-box">
      <p class="confirm-message" id="confirmMessage"></p>
      <div class="confirm-actions">
        <button class="btn-confirm-cancel" id="confirmCancel" type="button">Huy</button>
        <button class="btn-confirm-ok" id="confirmOk" type="button">Dong y</button>
      </div>
    </div>
  </div>

  <!-- SheetJS (vendored for offline) -->
  <script src="lib/xlsx.full.min.js"></script>
  <script type="module" src="js/main.js"></script>
</body>
</html>
```

### Step 2: Create `revenue/js/render.js`
DOM rendering functions. Imports from Phase 02 modules (`state`, `utils`).

**renderSummary()**
- Read `state.computeMonthSummary()` or compute from `state.monthEntries`
- Update `#summaryTotal`, `#summaryCK`, `#summaryTM` with `formatVND` values

**renderEntryList()**
- Clear `#entryList`
- For each entry in `state.monthEntries` (sorted by date asc):
  - Create entry row div with: date (dd/mm), CK amount, TM amount, total, note
  - Tap handler -> edit
  - Delete button
- If no entries: show "Chua co du lieu" placeholder

**renderFormForDate(dateISO)**
- Set `#entryDate` value
- If entry exists for date: populate CK, TM, note fields (formatted)
- Else: clear fields
- Update `#formTotal`
- Update save button text: "Cap nhat" (edit) or "Luu" (new)

**updateFormTotal()**
- Read CK + TM input values, parse, sum, display formatted in `#formTotal`

**Entry row HTML template:**
```html
<div class="entry-row" data-date="2026-03-03" role="listitem">
  <div class="entry-date">03/03</div>
  <div class="entry-amounts">
    <span class="entry-ck">CK: 1.500.000</span>
    <span class="entry-tm">TM: 500.000</span>
  </div>
  <div class="entry-total">2.000.000</div>
  <button class="entry-delete" aria-label="Xoa">&times;</button>
</div>
```

### Step 3: Create `revenue/js/handlers.js`
Event handler functions. Imports from Phase 02 modules + render.js.

**onDateChange(e)**
- Get date value from input
- Call `state.loadEntryForDate(date)`
- Call `renderFormForDate(date)`

**onAmountInput(e)**
- Auto-format value with `formatVND` on input event
- Update `#formTotal` in real-time
- Both `#entryCK` and `#entryTM` use this handler

**onSave(e)**
- Prevent default form submit
- Parse CK and TM values
- Validate: at least one amount > 0
- Create entry object: `{ date, ck, tm, note }`
- Call `storage.upsertEntry(entry)`
- Reload state, re-render list + summary
- Show toast: "Da luu!" or "Da cap nhat!"

**onEditEntry(dateISO)**
- Set date input to dateISO
- Trigger `onDateChange` flow
- Scroll form into view

**onDeleteEntry(dateISO)**
- Show confirm dialog
- If confirmed: `storage.deleteEntry(dateISO)`
- Reload state, re-render

**onPrevMonth() / onNextMonth()**
- Navigate month filter backward/forward
- Update state.selectedMonth/Year
- Re-render entry list + summary + month label

**initForm()**
- Set date input to today
- Attach event listeners for date change, CK/TM input, form submit
- Attach month navigation handlers
- Trigger initial load for today's date

### Step 4: Create `revenue/css/components.css`
Component styles for form, entry list, buttons, confirm modal, toast.

**Entry Form:**
```css
.entry-form {
  padding: 16px 12px;
  background: var(--bg-card);
  margin: 12px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
.form-row { margin-bottom: 12px; }
.form-row-split { display: flex; gap: 10px; }
.form-row label {
  display: block;
  font-size: 0.83rem;
  color: var(--text-secondary);
  font-weight: 600;
  margin-bottom: 6px;
}
.currency-input, .date-input, .note-input {
  width: 100%;
  padding: 14px 12px;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 1.11rem;
  min-height: 52px;
  font-family: inherit;
  color: var(--text-primary);
  background: var(--bg-card);
}
.currency-input:focus, .date-input:focus, .note-input:focus {
  outline: none;
  border-color: var(--rv-teal);
  background: var(--rv-teal-50);
  box-shadow: 0 0 0 3px rgba(8,145,178,0.12);
}
.currency-input { text-align: right; font-weight: 600; }
```

**Save Button (green CTA):**
```css
.btn-save {
  width: 100%;
  padding: 16px;
  background: var(--rv-green);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.11rem;
  font-weight: 700;
  min-height: 54px;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 14px rgba(5,150,105,0.28);
}
```

**Form Total Row:**
```css
.form-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid var(--border);
}
.form-total-label { font-weight: 600; color: var(--text-secondary); }
.form-total-value { font-size: 1.33rem; font-weight: 700; color: var(--rv-teal); }
```

**Month Filter:**
```css
.month-filter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 12px;
}
.btn-month-nav {
  width: 44px; height: 44px;
  border: 2px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card);
  font-size: 1.11rem;
  cursor: pointer;
  font-family: inherit;
  display: flex; align-items: center; justify-content: center;
}
.month-label { font-size: 1rem; font-weight: 600; color: var(--text-primary); }
```

**Entry List:**
```css
.entry-list { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 8px; }
.entry-row {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 14px 16px;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  border-left: 4px solid var(--rv-teal);
  transition: background 0.15s;
}
.entry-row:active { background: var(--rv-teal-50); }
.entry-date { font-weight: 700; color: var(--rv-teal); min-width: 50px; }
.entry-amounts { flex: 1; font-size: 0.89rem; color: var(--text-secondary); }
.entry-total { font-weight: 700; font-size: 1rem; color: var(--text-primary); }
.entry-delete {
  width: 44px; height: 44px; border: none; background: none;
  color: var(--text-muted); font-size: 1.33rem; cursor: pointer;
  border-radius: 8px; display: flex; align-items: center; justify-content: center;
}
.entry-empty { text-align: center; padding: 32px; color: var(--text-muted); }
```

**Confirm Modal + Toast:**
- Reuse same pattern/CSS from Gas app `confirm.css` and `toast.css`
- Inline in components.css to keep file count minimal
- Confirm overlay: fixed, centered, backdrop blur
- Toast: fixed bottom, slide up animation

**Action Buttons:**
```css
.btn-print {
  flex: 1; background: var(--rv-teal); color: white;
  border: none; border-radius: 8px; padding: 14px; font-weight: 600;
  min-height: 50px; cursor: pointer; font-family: inherit;
}
.btn-export {
  flex: 1; background: white; color: var(--rv-teal);
  border: 2px solid var(--rv-teal-100); border-radius: 8px; padding: 14px;
  font-weight: 600; min-height: 50px; cursor: pointer; font-family: inherit;
}
```

## Todo List
- [ ] Create index.html with full structure
- [ ] Create render.js (renderSummary, renderEntryList, renderFormForDate, updateFormTotal)
- [ ] Create handlers.js (onDateChange, onAmountInput, onSave, onEditEntry, onDeleteEntry, month nav)
- [ ] Create components.css (form, entries, buttons, confirm, toast)
- [ ] Verify all DOM IDs match between HTML and JS
- [ ] Verify touch targets >= 44px
- [ ] Verify Vietnamese labels throughout

## Success Criteria
- Form visible on load with today's date pre-filled
- CK/TM inputs trigger numeric keyboard on mobile
- VND auto-formatting works on input (1500000 -> 1.500.000)
- Tong ngay updates in real-time as user types
- Luu saves entry and shows in list below
- Tapping entry in list loads it into form
- Delete with confirmation works
- Month navigation prev/next works
- Summary bar updates for selected month

## Conflict Prevention
- HTML references CSS class names defined in Phase 01 (base.css) and this phase (components.css)
- HTML references JS modules only via `js/main.js` (Phase 05)
- render.js and handlers.js import from Phase 02 modules but don't modify them
- onclick handlers on HTML use `window.` functions exposed by main.js (Phase 05)

## Risk Assessment
- **Runtime dependency on Phase 02**: JS imports will fail until Phase 02 files exist. During parallel dev, stub files can be used. At integration (Phase 05), all modules exist.
- **VND formatting cursor position**: Auto-formatting may move cursor. Use `selectionStart` save/restore if needed.
- **Date input iOS**: Native date picker on iOS works well but displays in device locale. `type="date"` value is always `YYYY-MM-DD` regardless of display.
