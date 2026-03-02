/* ========== History (Lịch sử phiếu) ========== */
import { MAX_HISTORY } from './constants.js';
import { state, saveData } from './state.js';
import { getHistory, saveHistory } from './storage.js';
import { calcGas, formatDateVN, formatTimeVN, escapeHTML, showToast, showConfirm } from './utils.js';
import { renderAllCards, updateSummary } from './render.js';

export function archiveCurrentForm() {
  const hasData = state.cylinders.some(c => c.seri || c.total || c.tare);
  if (!hasData) return;

  /* Dedup: skip if identical to latest entry */
  const history = getHistory();
  const snapshot = JSON.stringify(state.cylinders);
  if (history.length > 0 && history[0].date === state.date &&
      JSON.stringify(history[0].cylinders) === snapshot) return;

  let totalGas = 0;
  let filledCount = 0;
  state.cylinders.forEach(c => {
    const g = calcGas(c);
    if (g !== null) { totalGas += g; filledCount++; }
  });

  history.unshift({
    id: Date.now(),
    date: state.date,
    cylinders: JSON.parse(snapshot),
    totalGas: Math.round(totalGas * 10) / 10,
    filledCount,
    savedAt: new Date().toISOString()
  });

  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
  saveHistory(history);
  return true;
}

export function showHistory() {
  const saved = archiveCurrentForm();
  if (saved) showToast('Đã lưu phiếu hiện tại vào lịch sử');
  const history = getHistory();
  const modal = document.getElementById('historyModal');
  const list = document.getElementById('historyList');

  if (history.length === 0) {
    list.innerHTML = '<div class="history-empty">Chưa có phiếu nào được lưu</div>';
  } else {
    list.innerHTML = history.map((item, i) => {
      const dateStr = formatDateVN(item.date);
      const timeStr = formatTimeVN(item.savedAt);
      const detailRows = item.cylinders
        .map((c, ci) => {
          if (!c.seri && !c.total && !c.tare) return '';
          const g = calcGas(c);
          return `<tr>
            <td>${ci + 1}</td>
            <td>${escapeHTML(c.seri)}</td>
            <td>${c.total || ''}</td>
            <td>${c.tare || ''}</td>
            <td><strong>${g !== null ? g.toFixed(1) : ''}</strong></td>
          </tr>`;
        })
        .filter(Boolean)
        .join('');

      return `<div class="history-item-wrap">
        <div class="history-item" onclick="toggleHistoryDetail(${i})" role="button" tabindex="0">
          <div class="history-date">
            ${dateStr}
            <span class="history-time">${timeStr}</span>
          </div>
          <div class="history-info">
            <span class="history-gas">${item.totalGas} kg</span>
            <span class="history-count">${item.filledCount} bình</span>
          </div>
          <button class="history-delete" onclick="event.stopPropagation();deleteHistory(${i})"
            type="button" aria-label="Xóa phiếu">&times;</button>
        </div>
        <div class="history-detail" id="historyDetail-${i}">
          <table class="history-table">
            <thead><tr>
              <th>STT</th><th>Seri</th><th>Cân TB</th><th>TL Vỏ</th><th>Gas Tồn</th>
            </tr></thead>
            <tbody>${detailRows}</tbody>
          </table>
          <button class="btn btn-history-load" onclick="loadHistory(${i})" type="button">
            Mở phiếu này
          </button>
        </div>
      </div>`;
    }).join('');
  }

  modal.classList.add('show');
}

export function toggleHistoryDetail(index) {
  const detail = document.getElementById(`historyDetail-${index}`);
  if (!detail) return;
  detail.classList.toggle('show');
}

export function closeHistory() {
  document.getElementById('historyModal').classList.remove('show');
}

export async function loadHistory(index) {
  const history = getHistory();
  const item = history[index];
  if (!item) return;

  if (state.cylinders.some(c => c.seri || c.total || c.tare)) {
    if (!(await showConfirm('Phiếu hiện tại sẽ bị thay thế. Tiếp tục?'))) return;
    archiveCurrentForm();
  }

  state.date = item.date;
  state.cylinders = JSON.parse(JSON.stringify(item.cylinders));

  const parts = (item.date || '').split('-');
  if (parts.length === 3) {
    document.getElementById('formYear').value = parseInt(parts[0]);
    document.getElementById('formMonth').value = parseInt(parts[1]);
    document.getElementById('formDay').value = parseInt(parts[2]);
  }

  renderAllCards();
  updateSummary();
  saveData();
  closeHistory();
  showToast('Đã tải phiếu cũ!');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export async function deleteHistory(index) {
  if (!(await showConfirm('Xóa phiếu này khỏi lịch sử?'))) return;
  const history = getHistory();
  history.splice(index, 1);
  saveHistory(history);
  showHistory();
  showToast('Đã xóa!');
}
