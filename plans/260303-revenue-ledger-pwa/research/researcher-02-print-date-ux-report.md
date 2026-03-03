# Research Report: Print Layout & Date Input UX for Vietnamese Revenue Ledger

**Report Date:** 2026-03-03
**Target:** Elderly Non-Tech Vietnamese Users
**Scope:** Vanilla JS Mobile-First PWA

---

## Topic 1: Print Layout for Monthly Revenue Table

### CSS @media Print Best Practices

**Page Setup:**
```css
@media print {
  @page {
    size: A4;
    margin: 10mm;
  }
  body { font-family: 'Times New Roman', serif; }
  table { width: 100%; border-collapse: collapse; }
  tr { page-break-inside: avoid; } /* Keep rows together */
}
```

**Key Findings:**
- Use `@page` rule for A4 sizing (Paper CSS library recommends A4 for financial documents)
- Set `page-break-inside: avoid` on table rows to prevent splitting entries across pages
- Use `border-collapse: collapse` for cleaner table rendering in print
- Font: serif fonts (Times, Georgia) print better than sans-serif for elderly reading

### Handling Full-Month Calendar Table (28-31 days)

**Column Structure (Vietnam-specific):**
```
| STT | Ngày (dd/mm) | Diễn giải | CK | TM | Tổng (₫) |
```

**Displaying Missing Days:** Use empty rows with "—" dash for clarity:
```html
<tr class="empty-day">
  <td>15</td>
  <td>15/02/2026</td>
  <td>—</td>
  <td>—</td>
  <td>—</td>
  <td>—</td>
</tr>
```

**Page Break Handling:**
- Tables with 30+ entries: use `page-break-after: auto` on table sections
- Group 15 entries per "page section" visually with subtle dividers
- Use sub-table sections: `<thead>` (sticky), then `<tbody>` per week

```css
@media print {
  thead { display: table-header-group; /* Repeat header on each page */ }
  tbody { display: table-row-group; }
  tr.week-break { page-break-after: always; } /* Force page break after week */
}
```

**Date Formatting (Vietnamese):**
- Format: `dd/mm/yyyy` (e.g., `03/03/2026`)
- Use `toLocaleDateString('vi-VN')` in JavaScript for consistency
- Print filter: strip leading zeros only if needed for brevity

### Print-Specific CSS Rules
```css
@media print {
  /* Hide screen-only elements */
  .no-print { display: none; }

  /* Remove backgrounds to save ink */
  table, tr, td { background: white !important; }

  /* Ensure borders print */
  table { border: 1px solid black; }
  td { border: 1px solid #ddd; padding: 4pt; }

  /* Font size for elderly readability: 11-12pt minimum */
  body { font-size: 12pt; line-height: 1.5; }
  table { font-size: 11pt; }
}
```

---

## Topic 2: Date Input UX for Elderly Users

### Best Input Pattern for Mobile

**Recommendation: Native `type="date"` Picker**

**Why for elderly users:**
- No custom interaction learning required
- Large default picker on iOS/Android
- Accessibility built-in (screen readers)
- Reduces typos in date entry

```html
<input
  type="date"
  id="revenue-date"
  value="2026-03-03"  <!-- auto-default to today -->
  class="date-input"
/>
```

**Fallback for unsupported browsers:**
```html
<input
  type="text"
  placeholder="dd/mm/yyyy"
  pattern="\d{2}/\d{2}/\d{4}"
  required
/>
```

### Auto-Default to Today + Load Existing Entry

```javascript
const today = new Date().toISOString().split('T')[0]; // "2026-03-03"
document.getElementById('revenue-date').value = today;

// Auto-load existing entry on date change
document.getElementById('revenue-date').addEventListener('change', async (e) => {
  const date = e.target.value; // "2026-03-03"
  const entry = await loadEntryByDate(date);
  if (entry) {
    populateFormFields(entry);
  }
});
```

### Currency Input UX (Vietnamese Format)

**For iOS/Android auto-numeric keyboard:**
```html
<!-- Amount fields -->
<input
  type="text"
  inputmode="decimal"
  placeholder="0"
  id="amount-field"
  class="currency-input"
/>
```

**JavaScript formatting (no decimal, thousands separator with dot):**
```javascript
function formatVND(value) {
  return value.replace(/\D/g, '')  // Remove non-digits
              .replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Add dots
}

function unformatVND(formatted) {
  return formatted.replace(/\./g, ''); // Remove dots to get raw number
}

// Usage:
const input = document.getElementById('amount-field');
input.addEventListener('input', (e) => {
  e.target.value = formatVND(e.target.value);
});
```

**Example:** `1500000` → displays as `1.500.000` ₫

### inputmode Behavior

| inputmode | iOS | Android | Use Case |
|-----------|-----|---------|----------|
| `decimal` | Numeric + decimal point | Numeric keyboard | Currency (Vietnamese: no decimals shown) |
| `numeric` | Numeric 0-9 only | Numeric keyboard | Pure integers |
| `tel` | Phone keyboard (+, -, space) | Phone keyboard | Avoid for currency |

**Best for Vietnamese PWA:**
```html
<!-- Safest: type="date" + inputmode="decimal" for amounts -->
<input type="date" id="date"> <!-- Native picker -->
<input inputmode="decimal" type="text" id="amount"> <!-- Numeric keyboard, no decimals -->
```

### UX Checklist for Elderly Users

- ✓ Large touch targets (min 44x44px for buttons/inputs)
- ✓ High contrast labels (black text on white background)
- ✓ Default value = today's date
- ✓ Avoid custom date pickers (use native `type="date"`)
- ✓ Currency auto-formats with comma/dot thousands separator
- ✓ No decimal places shown (VND standard)
- ✓ Clear button labels in Vietnamese (Lưu, Xóa, Quay lại)
- ✓ Confirmation dialogs for destructive actions

---

## Key Implementation Notes

1. **Print Layout:** Use Paper CSS + `page-break-inside: avoid` on rows + sticky headers
2. **Date Input:** Native `type="date"` + `inputmode="decimal"` for amounts
3. **Format:** Vietnamese date `dd/mm/yyyy`, currency `1.500.000₫` (no decimals)
4. **Auto-load:** Trigger entry load on date change after `toLocaleDateString('vi-VN')`
5. **Accessibility:** Always include form labels, avoid custom JS date pickers

---

**Sources:**
- Paper CSS GitHub (https://github.com/cognitom/paper-css)
- Modern CSS Patterns (https://modern-css.com)
- HTML5 Native Inputs Best Practices
- WCAG Accessibility Guidelines (Mobile Forms)
