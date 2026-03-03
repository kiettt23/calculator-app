/* ========== Revenue App — Event Handlers ========== */
import { state, loadEntries, selectMonth, loadEntryForDate } from './state.js';
import { upsertEntry, deleteEntry } from './storage.js';
import { renderSummary, renderEntryList, renderFormForDate, updateFormTotal, updateMonthLabel } from './render.js';
import { parseVND, formatVND, getTodayISO, getDaysInMonth, showToast, showConfirm } from './utils.js';

/* ========== Vietnamese Date Picker ========== */

function updateDaysInMonth() {
  const dayEl = document.getElementById('entryDay');
  const month = parseInt(document.getElementById('entryMonth').value);
  const year = parseInt(document.getElementById('entryYear').value);
  const maxDay = getDaysInMonth(year, month);
  const currentDay = parseInt(dayEl.value) || 1;
  while (dayEl.options.length > maxDay) dayEl.remove(dayEl.options.length - 1);
  while (dayEl.options.length < maxDay) {
    const d = dayEl.options.length + 1;
    dayEl.add(new Option(d, d));
  }
  dayEl.value = Math.min(currentDay, maxDay);
}

function syncDateFromSelects() {
  const y = document.getElementById('entryYear').value;
  const m = String(document.getElementById('entryMonth').value).padStart(2, '0');
  const d = String(document.getElementById('entryDay').value).padStart(2, '0');
  document.getElementById('entryDate').value = `${y}-${m}-${d}`;
}

/** Set the 3 selects from an ISO date string. */
export function setDateSelects(dateISO) {
  const parts = dateISO.split('-');
  if (parts.length !== 3) return;
  document.getElementById('entryYear').value = parseInt(parts[0]);
  document.getElementById('entryMonth').value = parseInt(parts[1]);
  updateDaysInMonth();
  document.getElementById('entryDay').value = parseInt(parts[2]);
  syncDateFromSelects();
}

function onDateSelectChange() {
  updateDaysInMonth();
  syncDateFromSelects();
  const dateISO = document.getElementById('entryDate').value;
  loadEntryForDate(dateISO);
  renderFormForDate(dateISO);
}

function initDatePicker() {
  const dayEl = document.getElementById('entryDay');
  const monthEl = document.getElementById('entryMonth');
  const yearEl = document.getElementById('entryYear');
  for (let d = 1; d <= 31; d++) dayEl.add(new Option(d, d));
  for (let m = 1; m <= 12; m++) monthEl.add(new Option(m, m));
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 2; y <= currentYear + 1; y++) yearEl.add(new Option(y, y));

  const today = new Date();
  yearEl.value = today.getFullYear();
  monthEl.value = today.getMonth() + 1;
  updateDaysInMonth();
  dayEl.value = today.getDate();
  syncDateFromSelects();

  dayEl.addEventListener('change', onDateSelectChange);
  monthEl.addEventListener('change', onDateSelectChange);
  yearEl.addEventListener('change', onDateSelectChange);
}

/* ========== Amount Inputs ========== */

export function onAmountInput(e) {
  const raw = e.target.value.replace(/\D/g, '');
  e.target.value = raw ? formatVND(raw) : '';
  updateFormTotal();
}

/* ========== Save / Update ========== */

export function onSave(e) {
  e.preventDefault();
  const dateISO = document.getElementById('entryDate').value;
  if (!dateISO) { showToast('Vui lòng chọn ngày'); return; }
  const ck = parseVND(document.getElementById('entryCK').value);
  const tm = parseVND(document.getElementById('entryTM').value);
  const note = document.getElementById('entryNote').value.trim();
  if (ck === 0 && tm === 0 && !note) { showToast('Vui lòng nhập số tiền hoặc ghi chú'); return; }

  const isEdit = Boolean(state.currentEntry);
  upsertEntry({ date: dateISO, ck, tm, note });
  loadEntries();
  renderEntryList();
  renderSummary();
  showToast(isEdit ? 'Đã cập nhật!' : 'Đã lưu!');

  document.getElementById('entryNote').value = '';
  loadEntryForDate(dateISO);
  renderFormForDate(dateISO);
}

/* ========== Edit Entry ========== */

export function onEditEntry(dateISO) {
  setDateSelects(dateISO);
  loadEntryForDate(dateISO);
  renderFormForDate(dateISO);
  document.getElementById('entryForm').scrollIntoView({ behavior: 'smooth' });
}

/* ========== Delete Entry ========== */

export async function onDeleteEntry(dateISO) {
  const ok = await showConfirm('Xóa dòng ngày này?');
  if (!ok) return;
  deleteEntry(dateISO);
  loadEntries();
  renderEntryList();
  renderSummary();
  if (state.currentDate === dateISO) {
    loadEntryForDate(dateISO);
    renderFormForDate(dateISO);
  }
  showToast('Đã xóa!');
}

/* ========== Month Navigation ========== */

export function onPrevMonth() {
  let { selectedYear, selectedMonth } = state;
  selectedMonth -= 1;
  if (selectedMonth < 1) { selectedMonth = 12; selectedYear -= 1; }
  selectMonth(selectedYear, selectedMonth);
  renderEntryList();
  renderSummary();
  updateMonthLabel();
}

export function onNextMonth() {
  let { selectedYear, selectedMonth } = state;
  selectedMonth += 1;
  if (selectedMonth > 12) { selectedMonth = 1; selectedYear += 1; }
  selectMonth(selectedYear, selectedMonth);
  renderEntryList();
  renderSummary();
  updateMonthLabel();
}

/* ========== Initialization ========== */

export function initForm() {
  initDatePicker();
  document.getElementById('entryCK').addEventListener('input', onAmountInput);
  document.getElementById('entryTM').addEventListener('input', onAmountInput);
  document.getElementById('entryForm').addEventListener('submit', onSave);
  document.getElementById('btnPrevMonth').addEventListener('click', onPrevMonth);
  document.getElementById('btnNextMonth').addEventListener('click', onNextMonth);

  const today = getTodayISO();
  loadEntryForDate(today);
  renderFormForDate(today);
}
