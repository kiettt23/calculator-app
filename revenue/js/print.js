/* ========== Print Module — Sổ Doanh Thu ========== */
import { state } from './state.js';
import { formatVND, escapeHTML, getDaysInMonth, showToast } from './utils.js';

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

/**
 * Encode current month data into a shareable URL and open share sheet.
 */
export function sharePrintLink() {
  const { selectedYear: y, selectedMonth: m, monthEntries } = state;
  if (!monthEntries.length) {
    showToast('Chưa có dữ liệu tháng này');
    return;
  }

  const compact = monthEntries.map(e => ({
    d: parseInt(e.date.split('-')[2], 10),
    c: e.ck || 0,
    t: e.tm || 0,
    n: e.note || ''
  }));

  const json = JSON.stringify(compact);
  const encoded = btoa(unescape(encodeURIComponent(json)));
  const base = location.href.split('#')[0];
  const url = `${base}#print=${y}-${m}&d=${encoded}`;
  const title = `Sổ Doanh Thu — Tháng ${m}/${y}`;

  if (navigator.share) {
    navigator.share({ title, text: 'Mở link trên máy tính để in', url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(
      () => showToast('Đã sao chép link!'),
      () => showToast('Không thể chia sẻ')
    );
  }
}

/**
 * Check URL hash for print data and render print view if found.
 * Called on page load from main.js.
 */
export function handlePrintFromURL() {
  const hash = location.hash;
  if (!hash.startsWith('#print=')) return false;

  const params = hash.slice(1).split('&');
  let year, month, data;

  for (const p of params) {
    if (p.startsWith('print=')) {
      const [y, m] = p.slice(6).split('-');
      year = parseInt(y); month = parseInt(m);
    }
    if (p.startsWith('d=')) {
      try {
        const json = decodeURIComponent(escape(atob(p.slice(2))));
        data = JSON.parse(json);
      } catch { return false; }
    }
  }

  if (!year || !month || !data) return false;

  const mm = String(month).padStart(2, '0');
  const entries = data.map(e => ({
    date: `${year}-${mm}-${String(e.d).padStart(2, '0')}`,
    ck: e.c || 0, tm: e.t || 0, note: e.n || ''
  }));

  generatePrintView(year, month, entries);

  const banner = document.createElement('div');
  banner.className = 'print-instruction';
  banner.textContent = 'Nhấn Ctrl+P (hoặc ⌘+P trên Mac) để in';
  document.body.prepend(banner);

  document.body.classList.add('print-mode');
  return true;
}
