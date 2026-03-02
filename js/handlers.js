/* ========== Event Handlers & Row Management ========== */
import { DEFAULT_ROWS } from './constants.js';
import { state, autoSave, saveData, createEmptyRows } from './state.js';
import { saveTareWeight, getTareWeight } from './storage.js';
import { showToast, showConfirm } from './utils.js';
import { renderAllCards, updateSummary, updateCardResult, updateDuplicateWarnings, createCard } from './render.js';
import { archiveCurrentForm } from './history.js';

const MAX_CYLINDERS = 100;

/* ========== Field Input ========== */
export function onFieldInput(index, field, value) {
  state.cylinders[index][field] = value;
  updateCardResult(index);
  updateSummary();
  autoSave();

  if (field === 'tare' && state.cylinders[index].seri) {
    saveTareWeight(state.cylinders[index].seri, value);
  }
  if (field === 'seri' && value) {
    autoFillTare(index, value);
    updateDuplicateWarnings();
  }
}

/* ========== Enter Key Navigation ========== */
export function onEnterKey(event, index, field) {
  if (event.key !== 'Enter') return;
  event.preventDefault();

  const card = document.getElementById(`card-${index}`);
  const inputs = Array.from(card.querySelectorAll('input'));
  const currentIdx = inputs.findIndex(inp => inp === event.target);

  if (currentIdx < inputs.length - 1) {
    inputs[currentIdx + 1].focus();
  } else if (index < state.cylinders.length - 1) {
    const nextCard = document.getElementById(`card-${index + 1}`);
    if (nextCard) nextCard.querySelector('input').focus();
  }
}

/* ========== Tare Auto-fill ========== */
export function autoFillTare(index, seri) {
  const knownTare = getTareWeight(seri);
  if (!knownTare || state.cylinders[index].tare) return;

  state.cylinders[index].tare = knownTare;
  const tareInput = document.getElementById(`tare-${index}`);
  if (tareInput) tareInput.value = knownTare;
  updateCardResult(index);
  updateSummary();
  showToast(`Tự điền TL vỏ: ${knownTare} kg`);
}

/* ========== Row Management ========== */
export function addRow() {
  /* Fix #5: giới hạn max 100 bình */
  if (state.cylinders.length >= MAX_CYLINDERS) {
    showToast(`Tối đa ${MAX_CYLINDERS} bình`);
    return;
  }
  state.cylinders.push({ seri: '', total: '', tare: '' });
  const list = document.getElementById('cylinderList');
  const newCard = createCard(state.cylinders.length - 1);
  list.appendChild(newCard);
  updateSummary();
  autoSave();
  newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => newCard.querySelector('input').focus(), 350);
}

export async function removeRow(index) {
  if (state.cylinders.length <= 1) return;
  const c = state.cylinders[index];
  if (c.seri || c.total || c.tare) {
    if (!(await showConfirm(`Xóa bình số ${index + 1}?`))) return;
  }
  state.cylinders.splice(index, 1);
  renderAllCards();
  updateSummary();
  autoSave();
}

export async function clearAll() {
  if (!(await showConfirm('Xóa hết dữ liệu và tạo phiếu mới?'))) return;
  archiveCurrentForm();

  /* Fix #10: giữ số bình hiện tại, không reset về DEFAULT_ROWS */
  const rowCount = state.cylinders.length;
  state.cylinders = createEmptyRows(rowCount || DEFAULT_ROWS);
  state.date = new Date().toISOString().split('T')[0];

  const today = new Date();
  document.getElementById('formDay').value = today.getDate();
  document.getElementById('formMonth').value = today.getMonth() + 1;
  document.getElementById('formYear').value = today.getFullYear();
  updateDaysInMonth();

  renderAllCards();
  updateSummary();
  saveData();
  showToast('Đã tạo phiếu mới!');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ========== Date Picker ========== */

/* Fix #2: cập nhật số ngày hợp lệ theo tháng/năm đã chọn */
function updateDaysInMonth() {
  const dayEl = document.getElementById('formDay');
  const monthEl = document.getElementById('formMonth');
  const yearEl = document.getElementById('formYear');

  const year = parseInt(yearEl.value);
  const month = parseInt(monthEl.value);
  /* Date(year, month, 0) = ngày cuối cùng của tháng trước → tức ngày cuối tháng hiện tại */
  const maxDay = new Date(year, month, 0).getDate();
  const currentDay = parseInt(dayEl.value);

  /* Xóa và tạo lại options để khớp với số ngày của tháng */
  dayEl.innerHTML = '';
  for (let d = 1; d <= maxDay; d++) {
    dayEl.add(new Option(d, d));
  }
  /* Clamp ngày nếu đang chọn ngày không hợp lệ (vd: 30/02) */
  dayEl.value = Math.min(currentDay, maxDay);
}

export function initDatePicker() {
  const dayEl = document.getElementById('formDay');
  const monthEl = document.getElementById('formMonth');
  const yearEl = document.getElementById('formYear');

  for (let d = 1; d <= 31; d++) dayEl.add(new Option(d, d));
  for (let m = 1; m <= 12; m++) monthEl.add(new Option(m, m));
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 2; y <= currentYear + 1; y++) yearEl.add(new Option(y, y));

  /* Restore saved date */
  const parts = (state.date || '').split('-');
  if (parts.length === 3) {
    yearEl.value = parseInt(parts[0]);
    monthEl.value = parseInt(parts[1]);
    dayEl.value = parseInt(parts[2]);
  } else {
    const today = new Date();
    dayEl.value = today.getDate();
    monthEl.value = today.getMonth() + 1;
    yearEl.value = today.getFullYear();
  }

  /* Sync days for initial month/year */
  updateDaysInMonth();

  const onDateChange = () => {
    updateDaysInMonth();
    const y = yearEl.value;
    const m = String(monthEl.value).padStart(2, '0');
    const d = String(dayEl.value).padStart(2, '0');
    state.date = `${y}-${m}-${d}`;
    autoSave();
  };
  dayEl.addEventListener('change', onDateChange);
  monthEl.addEventListener('change', onDateChange);
  yearEl.addEventListener('change', onDateChange);
}

/* ========== Dev: Random Test Data ========== */
export function fillRandomData() {
  const usedSeris = new Set();
  state.cylinders.forEach((_, i) => {
    let seri;
    do { seri = String(Math.floor(1000 + Math.random() * 9000)); }
    while (usedSeris.has(seri));
    usedSeris.add(seri);

    const tare = +(10 + Math.random() * 2).toFixed(1);
    const gas  = +(3  + Math.random() * 9).toFixed(1);
    const total = +(tare + gas).toFixed(1);
    state.cylinders[i] = { seri, total: String(total), tare: String(tare) };
    saveTareWeight(seri, String(tare));
  });
  renderAllCards();
  updateSummary();
  autoSave();
  showToast('Đã điền dữ liệu test!');
}

/* ========== iOS Keyboard Dismiss ========== */
export function initIOSKeyboardDismiss() {
  document.addEventListener('touchend', (e) => {
    if (!e.target.closest('input, select, textarea')) {
      document.activeElement.blur();
    }
  }, { passive: true });
}
