/* ========== Print & CSV Export ========== */
import { state } from './state.js';
import { calcGas, escapeHTML, showToast } from './utils.js';

export function generatePrintView() {
  const half = Math.ceil(state.cylinders.length / 2);
  let rows = '';

  for (let i = 0; i < half; i++) {
    const left = state.cylinders[i];
    const right = state.cylinders[i + half];
    const gasL = calcGas(left);
    const gasR = right ? calcGas(right) : null;

    rows += `<tr>
      <td>${i + 1}</td>
      <td>${escapeHTML(left.seri)}</td>
      <td>${left.total || ''}</td>
      <td>${left.tare || ''}</td>
      <td><strong>${gasL !== null ? gasL.toFixed(1) : ''}</strong></td>
      <td class="separator">${right ? i + half + 1 : ''}</td>
      <td>${right ? escapeHTML(right.seri) : ''}</td>
      <td>${right ? (right.total || '') : ''}</td>
      <td>${right ? (right.tare || '') : ''}</td>
      <td><strong>${gasR !== null ? gasR.toFixed(1) : ''}</strong></td>
    </tr>`;
  }

  let totalGas = 0;
  state.cylinders.forEach(c => {
    const g = calcGas(c);
    if (g !== null) totalGas += g;
  });

  const dateStr = state.date
    ? new Date(state.date + 'T00:00:00').toLocaleDateString('vi-VN')
    : '';

  document.getElementById('printView').innerHTML = `
    <div class="print-header">
      <h2>Tổng Công ty Gas Petrolimex-CTCP</h2>
      <h3>Nhà máy LPG Sài Gòn</h3>
      <h1>PHIẾU CÂN TẠI TRẠM NẠP</h1>
      <p>Ngày: ${dateStr}</p>
    </div>
    <div class="print-info">
      <strong>1. Bên bán:</strong> Chi nhánh Tổng Công ty Gas Petrolimex-CTCP - Nhà máy LPG Sài Gòn<br>
      <strong>2. Bên mua:</strong> Công ty TNHH Gas Petrolimex (Sài Gòn)<br>
      Hai bên xác nhận lượng Gas còn tồn trong chai của Bên mua như sau:
    </div>
    <table class="print-table">
      <thead><tr>
        <th>STT</th><th>Số Seri</th><th>Cân TB</th><th>TL Vỏ</th><th>Gas Tồn</th>
        <th class="separator">STT</th><th>Số Seri</th><th>Cân TB</th><th>TL Vỏ</th><th>Gas Tồn</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="print-total">Tổng cộng gas tồn: ${totalGas.toFixed(1)} kg</div>
    <div class="print-signatures">
      <div><div class="sig-title">Bên mua</div><div>(Ký, ghi rõ họ tên)</div></div>
      <div><div class="sig-title">Bên vận chuyển</div><div>(BKS, ký, ghi rõ)</div></div>
      <div><div class="sig-title">Thủ kho</div><div>(Ký, ghi rõ họ tên)</div></div>
      <div><div class="sig-title">Bảo vệ</div><div>(Ký, ghi rõ họ tên)</div></div>
      <div><div class="sig-title">Thủ trưởng đơn vị</div><div>(Ký, ghi rõ)</div></div>
    </div>`;
}

export function printForm() {
  generatePrintView();
  setTimeout(() => window.print(), 200);
}

export function exportCSV() {
  const BOM = '\uFEFF';
  let csv = BOM + 'STT,Số Seri Vỏ chai,Cân toàn bộ,Trọng lượng vỏ chai,Số lượng Gas tồn\n';

  state.cylinders.forEach((c, i) => {
    if (!c.seri && !c.total && !c.tare) return;
    const gas = calcGas(c);
    csv += `${i + 1},"${c.seri}",${c.total || ''},${c.tare || ''},${gas !== null ? gas.toFixed(1) : ''}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `phieu-can-gas-${state.date || 'export'}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Đã xuất file CSV!');
}
