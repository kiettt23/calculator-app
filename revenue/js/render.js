/* ========== Revenue App — DOM Rendering ========== */
import { state, computeMonthSummary } from './state.js';
import { formatVND, formatDateShort, escapeHTML, getMonthYearLabel, parseVND } from './utils.js';

/* ========== Summary Bar ========== */

/**
 * Update #summaryTotal, #summaryCK, #summaryTM with computed month totals.
 */
export function renderSummary() {
  const { totalCK, totalTM, grandTotal } = computeMonthSummary();
  document.getElementById('summaryTotal').textContent = formatVND(grandTotal);
  document.getElementById('summaryCK').textContent = formatVND(totalCK);
  document.getElementById('summaryTM').textContent = formatVND(totalTM);
}

/* ========== Entry List ========== */

/**
 * Render all entry rows for the selected month into #entryList.
 * Entries are already sorted ascending by date from state.monthEntries.
 */
export function renderEntryList() {
  const list = document.getElementById('entryList');
  list.innerHTML = '';

  if (!state.monthEntries.length) {
    list.innerHTML = '<div class="entry-empty">Chưa có dữ liệu tháng này</div>';
    return;
  }

  state.monthEntries.forEach(entry => {
    const total = (entry.ck || 0) + (entry.tm || 0);
    const dateLabel = formatDateShort(entry.date);
    const noteHTML = entry.note
      ? `<div class="entry-note">${escapeHTML(entry.note)}</div>`
      : '';

    const row = document.createElement('div');
    row.className = 'entry-row';
    row.setAttribute('role', 'listitem');
    row.setAttribute('onclick', `onEditEntry('${entry.date}')`);
    row.innerHTML = `
      <div class="entry-date">${escapeHTML(dateLabel)}</div>
      <div class="entry-body">
        <div class="entry-amounts">
          <span class="detail-chip chip-ck">CK <b>${formatVND(entry.ck || 0)}</b></span>
          <span class="detail-chip chip-tm">TM <b>${formatVND(entry.tm || 0)}</b></span>
        </div>
        ${noteHTML}
      </div>
      <div class="entry-total">${formatVND(total)}</div>
      <button class="entry-delete"
              onclick="event.stopPropagation();onDeleteEntry('${entry.date}')"
              type="button" aria-label="Xóa">
        <i data-lucide="trash-2"></i>
      </button>
    `;
    list.appendChild(row);
  });

  /* Re-initialize Lucide icons for dynamically added delete buttons */
  if (window.lucide) window.lucide.createIcons();
}

/* ========== Form Population ========== */

/**
 * Populate the entry form with an existing entry or clear it for a new one.
 * Updates button text to "Cập nhật" when editing, "Lưu" for new entry.
 * @param {string} dateISO "YYYY-MM-DD"
 */
export function renderFormForDate(dateISO) {
  document.getElementById('entryDate').value = dateISO;
  const entry = state.currentEntry;
  const btn = document.getElementById('btnSave');

  if (entry) {
    document.getElementById('entryCK').value = entry.ck ? formatVND(entry.ck) : '';
    document.getElementById('entryTM').value = entry.tm ? formatVND(entry.tm) : '';
    document.getElementById('entryNote').value = entry.note || '';
    btn.innerHTML = '<i data-lucide="check" class="btn-icon"></i> Cập nhật';
  } else {
    document.getElementById('entryCK').value = '';
    document.getElementById('entryTM').value = '';
    document.getElementById('entryNote').value = '';
    btn.innerHTML = '<i data-lucide="save" class="btn-icon"></i> Lưu';
  }

  updateFormTotal();
  if (window.lucide) window.lucide.createIcons();
}

/* ========== Form Total ========== */

/**
 * Read CK + TM from inputs and display formatted sum in #formTotal.
 */
export function updateFormTotal() {
  const ck = parseVND(document.getElementById('entryCK').value);
  const tm = parseVND(document.getElementById('entryTM').value);
  document.getElementById('formTotal').textContent = formatVND(ck + tm);
}

/* ========== Month Label ========== */

/**
 * Update #monthLabel with human-readable month/year string.
 */
export function updateMonthLabel() {
  document.getElementById('monthLabel').textContent =
    getMonthYearLabel(state.selectedYear, state.selectedMonth);
}
