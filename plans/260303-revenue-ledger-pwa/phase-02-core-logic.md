# Phase 02: Core Logic (JS Modules)

## Parallelization
- **Runs in parallel** with Phases 01, 03, 04
- **No dependencies** on other phases
- **Exclusive files:** `js/constants.js`, `js/utils.js`, `js/storage.js`, `js/state.js`

## Overview
- Priority: P1
- Status: completed
- Estimated effort: 1.5h
- Pure data layer: constants, utility functions, localStorage CRUD, app state management

## Context Links
- Reference: Gas app `js/constants.js`, `js/utils.js`, `js/storage.js`, `js/state.js`
- Research: `research/researcher-02-print-date-ux-report.md` (formatVND, date utils)

## Key Insights
- 1 entry per day: date string `YYYY-MM-DD` is the unique key
- Entry shape: `{ date, ck, tm, note }`; total = ck + tm (computed, not stored)
- All entries stored in single array under `so-doanh-thu-entries`
- localStorage key prefix: `so-doanh-thu-`
- VND formatting: dots as thousands separator, no decimals (e.g., `1.500.000`)
- Auto-save on form change (800ms debounce, same pattern as Gas app)

## Related Code Files (to create)
- `revenue/js/constants.js`
- `revenue/js/utils.js`
- `revenue/js/storage.js`
- `revenue/js/state.js`

## Implementation Steps

### Step 1: Create `revenue/js/constants.js`
```javascript
/* ========== Revenue App Constants ========== */
export const STORAGE_KEY = 'so-doanh-thu-entries';
export const CURRENT_KEY = 'so-doanh-thu-current';
export const MONTHS_VI = [
  'Thang 1', 'Thang 2', 'Thang 3', 'Thang 4',
  'Thang 5', 'Thang 6', 'Thang 7', 'Thang 8',
  'Thang 9', 'Thang 10', 'Thang 11', 'Thang 12'
];
```
- `STORAGE_KEY`: all entries array
- `CURRENT_KEY`: current form draft (for auto-save before explicit Luu)
- Keep under 20 lines

### Step 2: Create `revenue/js/utils.js`
Pure functions, no DOM access. Export:

**formatVND(value)**
- Input: raw number or string with digits
- Output: dot-separated thousands string (e.g., `1500000` -> `"1.500.000"`)
- Strip non-digits, apply regex `\B(?=(\d{3})+(?!\d))`

**parseVND(formatted)**
- Input: formatted string like `"1.500.000"`
- Output: integer (1500000) or 0 if invalid

**getTodayISO()**
- Returns `YYYY-MM-DD` string for today

**formatDateVN(isoDate)**
- Input: `"2026-03-03"`
- Output: `"03/03/2026"` (dd/mm/yyyy)

**getDaysInMonth(year, month)**
- Returns number of days in given month (1-indexed month)
- Uses `new Date(year, month, 0).getDate()`

**getMonthYearLabel(year, month)**
- Returns `"Thang 3/2026"` format

**escapeHTML(str)**
- Same pattern as Gas app

**showToast(message)**
- Same pattern as Gas app — targets `#toast` element

**showConfirm(message)**
- Promise-based custom confirm dialog, same pattern as Gas app
- Targets `#confirmOverlay`, `#confirmMessage`, `#confirmOk`, `#confirmCancel`

### Step 3: Create `revenue/js/storage.js`
localStorage operations with same safeSave pattern as Gas app.

**getAllEntries()**
- Parse `STORAGE_KEY` from localStorage, return array or `[]`

**saveAllEntries(entries)**
- safeSave to `STORAGE_KEY`

**getEntryByDate(dateISO)**
- Find entry where `entry.date === dateISO`

**upsertEntry(entry)**
- If entry with same date exists: replace it
- Else: push new entry
- Sort by date descending after upsert
- Save

**deleteEntry(dateISO)**
- Filter out entry with matching date
- Save

**getEntriesByMonth(year, month)**
- Filter entries where date starts with `YYYY-MM`
- Return sorted by date ascending

**safeSave(key, value)**
- Try localStorage.setItem
- On quota error: show toast, no auto-delete (revenue data is precious)

### Step 4: Create `revenue/js/state.js`
App state + reactivity pattern.

```javascript
export const state = {
  currentDate: getTodayISO(),      // date input value
  currentEntry: null,              // entry being edited (or null for new)
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  entries: [],                     // all entries (loaded from storage)
  monthEntries: [],                // filtered for selected month
};
```

**loadEntries()**
- Populate `state.entries` from storage
- Recompute `state.monthEntries`

**selectMonth(year, month)**
- Update `state.selectedMonth`, `state.selectedYear`
- Recompute `state.monthEntries`

**loadEntryForDate(dateISO)**
- Find entry in `state.entries` for given date
- Set `state.currentEntry` (null if not found = new entry mode)
- Set `state.currentDate`

**computeMonthSummary()**
- From `state.monthEntries`, compute: totalCK, totalTM, grandTotal
- Return `{ totalCK, totalTM, grandTotal }`

## Todo List
- [ ] Create constants.js with storage keys and month labels
- [ ] Create utils.js with formatVND, parseVND, date helpers, showToast, showConfirm
- [ ] Create storage.js with CRUD ops (getAllEntries, upsertEntry, deleteEntry, getEntriesByMonth)
- [ ] Create state.js with state object, loadEntries, selectMonth, computeMonthSummary
- [ ] Verify all exports are ES module compatible
- [ ] Verify each file < 200 lines

## Success Criteria
- `formatVND(1500000)` returns `"1.500.000"`
- `parseVND("1.500.000")` returns `1500000`
- `upsertEntry` correctly creates or updates by date
- `getEntriesByMonth(2026, 3)` filters correctly
- `computeMonthSummary()` sums CK + TM correctly
- Each file independently importable (no circular deps)
- All files under 200 lines

## Conflict Prevention
- No DOM manipulation in these files (except showToast/showConfirm which target fixed element IDs)
- Phase 03 imports from these modules but does not modify them
- State shape is the contract: Phase 03 reads `state.*`, Phase 02 defines it

## Risk Assessment
- **Data migration**: No existing data to migrate (new app)
- **parseVND edge cases**: Handle empty string, non-numeric input, return 0
- **Date timezone**: Use `YYYY-MM-DD` string comparison, avoid Date object timezone issues
