/* ========== Print Module — Sổ Doanh Thu ========== */
import { state } from './state.js';
import { formatVND, escapeHTML, getDaysInMonth } from './utils.js';

/**
 * Builds a full-month A4-ready table into #printView.
 * Shows all days (28–31 rows). Days without entries show "—".
 * @param {number} year
 * @param {number} month  1-indexed
 * @param {Array}  entries  array of entry objects from state
 */
function generatePrintView(year, month, entries) {
  const daysInMonth = getDaysInMonth(year, month);
  const mm = String(month).padStart(2, '0');

  // Map day number → entry for O(1) lookup
  const entryMap = {};
  entries.forEach(e => {
    const day = parseInt(e.date.split('-')[2], 10);
    entryMap[day] = e;
  });

  let totalCK = 0;
  let totalTM = 0;
  let rows = '';

  for (let d = 1; d <= daysInMonth; d++) {
    const entry = entryMap[d];
    const dd = String(d).padStart(2, '0');

    if (entry) {
      const ck = entry.ck || 0;
      const tm = entry.tm || 0;
      totalCK += ck;
      totalTM += tm;

      rows += `<tr>
  <td>${d}</td>
  <td>${dd}/${mm}</td>
  <td class="text-left">${escapeHTML(entry.note || '')}</td>
  <td class="text-right">${formatVND(ck)}</td>
  <td class="text-right">${formatVND(tm)}</td>
  <td class="text-right"><strong>${formatVND(ck + tm)}</strong></td>
</tr>`;
    } else {
      rows += `<tr class="empty-day">
  <td>${d}</td><td>${dd}/${mm}</td>
  <td>—</td><td>—</td><td>—</td><td>—</td>
</tr>`;
    }
  }

  const grandTotal = totalCK + totalTM;

  rows += `<tr class="totals-row">
  <td colspan="3"><strong>TỔNG CỘNG</strong></td>
  <td class="text-right"><strong>${formatVND(totalCK)}</strong></td>
  <td class="text-right"><strong>${formatVND(totalTM)}</strong></td>
  <td class="text-right"><strong>${formatVND(grandTotal)}</strong></td>
</tr>`;

  document.getElementById('printView').innerHTML = `
<div class="print-header">
  <h1>SỔ DOANH THU</h1>
  <p>Tháng ${month} năm ${year}</p>
</div>
<table class="print-table">
  <thead><tr>
    <th>STT</th>
    <th>Ngày</th>
    <th>Diễn giải</th>
    <th>CK (đ)</th>
    <th>TM (đ)</th>
    <th>Tổng (đ)</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>`;
}

/**
 * Renders the print view for the currently selected month and triggers print.
 */
export function printMonth() {
  generatePrintView(state.selectedYear, state.selectedMonth, state.monthEntries);
  setTimeout(() => window.print(), 200);
}
