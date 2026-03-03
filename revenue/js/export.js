/* ========== Excel Export Module — Sổ Doanh Thu ========== */
// XLSX is loaded via <script> tag (vendored at revenue/lib/xlsx.full.min.js)
// It exposes the global `XLSX` object — not an ES module import.
import { state } from './state.js';
import { getDaysInMonth, showToast } from './utils.js';

/**
 * Exports the currently selected month's entries as an .xlsx file.
 * Produces one worksheet with all days (empty rows for days without data).
 * Requires the global `XLSX` object to be present (SheetJS).
 */
export function exportExcel() {
  if (typeof XLSX === 'undefined') {
    showToast('Lỗi: Thư viện Excel chưa sẵn sàng');
    return;
  }

  const { selectedYear, selectedMonth, monthEntries } = state;
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);

  // Header row
  const headers = ['STT', 'Ngày', 'Diễn giải', 'CK (đ)', 'TM (đ)', 'Tổng (đ)'];
  const data = [headers];

  // Map day number → entry for O(1) lookup
  const entryMap = {};
  monthEntries.forEach(e => {
    const day = parseInt(e.date.split('-')[2], 10);
    entryMap[day] = e;
  });

  let totalCK = 0;
  let totalTM = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const entry = entryMap[d];
    const dd = String(d).padStart(2, '0');
    const mm = String(selectedMonth).padStart(2, '0');
    const dateLabel = `${dd}/${mm}/${selectedYear}`;

    if (entry) {
      const ck = entry.ck || 0;
      const tm = entry.tm || 0;
      totalCK += ck;
      totalTM += tm;
      data.push([d, dateLabel, entry.note || '', ck, tm, ck + tm]);
    } else {
      data.push([d, dateLabel, '', '', '', '']);
    }
  }

  // Totals row
  data.push(['', '', 'TỔNG CỘNG', totalCK, totalTM, totalCK + totalTM]);

  // Build worksheet with column widths
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 5 },   // STT
    { wch: 12 },  // Ngày
    { wch: 25 },  // Diễn giải
    { wch: 15 },  // CK (đ)
    { wch: 15 },  // TM (đ)
    { wch: 18 },  // Tổng (đ)
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Tháng ${selectedMonth}`);

  const fileName = `doanh-thu-thang-${String(selectedMonth).padStart(2, '0')}-${selectedYear}.xlsx`;
  XLSX.writeFile(wb, fileName);
  showToast('Đã xuất file Excel!');
}
