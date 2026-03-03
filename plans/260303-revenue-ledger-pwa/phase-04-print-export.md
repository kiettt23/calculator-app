# Phase 04: Print & Export (print.js + export.js + print CSS + SheetJS)

## Parallelization
- **Runs in parallel** with Phases 01, 02, 03
- **No dependencies** on other phases
- **Exclusive files:** `js/print.js`, `js/export.js`, `css/print.css`, `lib/xlsx.full.min.js`

## Overview
- Priority: P1
- Status: completed
- Estimated effort: 1.5h
- Print-optimized A4 table for all days of month + Excel export via SheetJS

## Context Links
- Research: `research/researcher-01-excel-pwa-report.md` (SheetJS CDN + vendoring)
- Research: `research/researcher-02-print-date-ux-report.md` (print layout, A4 CSS)
- Reference: Gas app `js/print.js`, `css/print.css`

## Key Insights
- Print table shows ALL days of month (28-31 rows), missing days show "---"
- Column structure: STT | Ngay (dd/mm) | Dien giai (note) | CK | TM | Tong
- Totals row at bottom sums CK, TM, Grand Total
- Use serif font (Times New Roman) for print readability
- Headers repeat on each printed page (`thead { display: table-header-group }`)
- SheetJS vendored locally at `lib/xlsx.full.min.js` for offline support
- Excel file name: `doanh-thu-thang-MM-YYYY.xlsx`

## Related Code Files (to create)
- `revenue/js/print.js`
- `revenue/js/export.js`
- `revenue/css/print.css`
- `revenue/lib/xlsx.full.min.js`

## Implementation Steps

### Step 1: Vendor SheetJS
Download `xlsx.full.min.js` from CDN for offline use:
```bash
curl -o revenue/lib/xlsx.full.min.js "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"
```
- Loaded via `<script>` tag in HTML (not ES module) — makes `XLSX` global available
- ~300KB minified, acceptable for PWA

### Step 2: Create `revenue/js/print.js`
Generates print-ready HTML for `#printView` and triggers `window.print()`.

**generatePrintView(year, month, entries)**
Core function. Builds a full-month table:

```javascript
export function generatePrintView(year, month, entries) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const entryMap = {};
  entries.forEach(e => {
    const day = parseInt(e.date.split('-')[2]);
    entryMap[day] = e;
  });

  let rows = '';
  let totalCK = 0, totalTM = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const entry = entryMap[d];
    const dd = String(d).padStart(2, '0');
    const mm = String(month).padStart(2, '0');

    if (entry) {
      const ck = entry.ck || 0;
      const tm = entry.tm || 0;
      const total = ck + tm;
      totalCK += ck;
      totalTM += tm;
      rows += `<tr>
        <td>${d}</td>
        <td>${dd}/${mm}</td>
        <td class="text-left">${escapeHTML(entry.note || '')}</td>
        <td class="text-right">${formatVND(ck)}</td>
        <td class="text-right">${formatVND(tm)}</td>
        <td class="text-right"><strong>${formatVND(total)}</strong></td>
      </tr>`;
    } else {
      rows += `<tr class="empty-day">
        <td>${d}</td><td>${dd}/${mm}</td>
        <td>---</td><td>---</td><td>---</td><td>---</td>
      </tr>`;
    }
  }

  // Totals row
  rows += `<tr class="totals-row">
    <td colspan="3"><strong>TONG CONG</strong></td>
    <td class="text-right"><strong>${formatVND(totalCK)}</strong></td>
    <td class="text-right"><strong>${formatVND(totalTM)}</strong></td>
    <td class="text-right"><strong>${formatVND(totalCK + totalTM)}</strong></td>
  </tr>`;

  // Render into #printView
  document.getElementById('printView').innerHTML = `
    <div class="print-header">
      <h1>SO DOANH THU</h1>
      <p>Thang ${month} nam ${year}</p>
    </div>
    <table class="print-table">
      <thead><tr>
        <th>STT</th><th>Ngay</th><th>Dien giai</th>
        <th>CK (d)</th><th>TM (d)</th><th>Tong (d)</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}
```

**printMonth()**
```javascript
export function printMonth() {
  const { selectedYear, selectedMonth, monthEntries } = state;
  generatePrintView(selectedYear, selectedMonth, monthEntries);
  setTimeout(() => window.print(), 200);
}
```

### Step 3: Create `revenue/js/export.js`
Excel export using global `XLSX` object (loaded via script tag).

**exportExcel()**
```javascript
export function exportExcel() {
  if (typeof XLSX === 'undefined') {
    showToast('Loi: Thu vien Excel chua san sang');
    return;
  }

  const { selectedYear, selectedMonth, monthEntries } = state;
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  // Build data array for worksheet
  const headers = ['STT', 'Ngay', 'Dien giai', 'CK', 'TM', 'Tong'];
  const data = [headers];

  const entryMap = {};
  monthEntries.forEach(e => {
    const day = parseInt(e.date.split('-')[2]);
    entryMap[day] = e;
  });

  let totalCK = 0, totalTM = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const entry = entryMap[d];
    const dd = String(d).padStart(2, '0');
    const mm = String(selectedMonth).padStart(2, '0');

    if (entry) {
      const ck = entry.ck || 0;
      const tm = entry.tm || 0;
      totalCK += ck;
      totalTM += tm;
      data.push([d, `${dd}/${mm}/${selectedYear}`, entry.note || '', ck, tm, ck + tm]);
    } else {
      data.push([d, `${dd}/${mm}/${selectedYear}`, '', '', '', '']);
    }
  }

  // Totals row
  data.push(['', '', 'TONG CONG', totalCK, totalTM, totalCK + totalTM]);

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 5 },   // STT
    { wch: 12 },  // Ngay
    { wch: 25 },  // Dien giai
    { wch: 15 },  // CK
    { wch: 15 },  // TM
    { wch: 18 },  // Tong
  ];

  const wb = XLSX.utils.book_new();
  const sheetName = `Thang ${selectedMonth}`;
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const fileName = `doanh-thu-thang-${String(selectedMonth).padStart(2,'0')}-${selectedYear}.xlsx`;
  XLSX.writeFile(wb, fileName);
  showToast('Da xuat file Excel!');
}
```

### Step 4: Create `revenue/css/print.css`
A4 optimized print styles:

```css
@media print {
  /* Hide all screen elements */
  body {
    background: white;
    font-family: 'Times New Roman', serif;
    font-size: 12pt;
    line-height: 1.5;
    padding: 0;
  }
  .no-print,
  .app-header,
  .summary-bar,
  .entry-form,
  .month-filter,
  .entry-list,
  .actions,
  .toast,
  .confirm-overlay,
  .offline-bar { display: none !important; }

  .print-view { display: block !important; padding: 10mm; }

  /* Page setup */
  @page { size: A4; margin: 10mm; }

  /* Print header */
  .print-header { text-align: center; margin-bottom: 20pt; }
  .print-header h1 { font-size: 18pt; margin-bottom: 6pt; }
  .print-header p { font-size: 12pt; }

  /* Print table */
  .print-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11pt;
    margin-bottom: 10pt;
  }
  .print-table th,
  .print-table td {
    border: 1px solid #333;
    padding: 4pt 6pt;
    text-align: center;
  }
  .print-table th {
    background: #eee !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    font-weight: 700;
  }
  .print-table .text-left { text-align: left; }
  .print-table .text-right { text-align: right; }

  /* Repeat header on each page */
  thead { display: table-header-group; }
  tbody { display: table-row-group; }
  tr { page-break-inside: avoid; }

  /* Empty day styling */
  .empty-day td { color: #999; }

  /* Totals row */
  .totals-row td {
    border-top: 2px solid #333;
    font-weight: 700;
    background: #f5f5f5 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
```

## Todo List
- [ ] Download and vendor SheetJS to lib/xlsx.full.min.js
- [ ] Create print.js with generatePrintView and printMonth
- [ ] Create export.js with exportExcel
- [ ] Create print.css with A4-optimized print styles
- [ ] Verify all-days-of-month table renders correctly (28, 29, 30, 31 day months)
- [ ] Verify empty days show "---" placeholders
- [ ] Verify totals row sums correctly
- [ ] Verify Excel file opens correctly on mobile (Files app)

## Success Criteria
- Print view shows table with ALL days of selected month
- Missing days display "---" in all amount columns
- Totals row at bottom sums correctly
- Header repeats on each printed page
- Excel file downloads with correct filename format
- Excel columns have proper widths
- Both print and export work offline (SheetJS vendored)

## Conflict Prevention
- print.js and export.js import from Phase 02 modules (state, utils) — read-only
- `#printView` HTML element defined in Phase 03's index.html — only this phase writes to it
- print.css uses `@media print` — cannot conflict with screen-only CSS from other phases
- SheetJS loaded via `<script>` tag (global), not ES module import

## Risk Assessment
- **SheetJS download**: If CDN unreachable during build, vendor from alternative mirror or commit pre-downloaded file
- **Print page breaks**: Tables with 31 rows may split across pages. `page-break-inside: avoid` on `<tr>` mitigates but test with real printer/PDF
- **XLSX global**: Must verify `<script src="lib/xlsx.full.min.js">` loads before ES module `export.js` runs. Script tags without `type=module` execute first (blocking), so order is correct.
- **Large month data**: Max 31 entries per month, negligible performance concern
