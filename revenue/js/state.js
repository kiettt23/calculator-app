/* ========== Revenue App State Management ========== */
import { getAllEntries, getEntriesByMonth, getEntryByDate } from './storage.js';
import { getTodayISO } from './utils.js';

/**
 * Global app state.
 * Entry shape: { date: "YYYY-MM-DD", ck: number, tm: number, note: string }
 * ck (chuyển khoản) and tm (tiền mặt) are raw integers; total is computed on demand.
 */
export const state = {
  currentDate: getTodayISO(),
  currentEntry: null,             // entry being edited, or null for a new entry
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  entries: [],                    // all entries across all months
  monthEntries: [],               // entries filtered for selectedYear/selectedMonth
};

/**
 * Load all entries from storage and refresh the current month slice.
 */
export function loadEntries() {
  state.entries = getAllEntries();
  refreshMonthEntries();
}

/**
 * Re-filter monthEntries from the full entries array using current selectedYear/Month.
 */
export function refreshMonthEntries() {
  state.monthEntries = getEntriesByMonth(state.selectedYear, state.selectedMonth);
}

/**
 * Switch the selected month/year and refresh the month slice.
 * @param {number} year
 * @param {number} month 1-indexed
 */
export function selectMonth(year, month) {
  state.selectedYear = year;
  state.selectedMonth = month;
  refreshMonthEntries();
}

/**
 * Set currentDate and load its entry (or null if no entry exists for that date).
 * @param {string} dateISO "YYYY-MM-DD"
 */
export function loadEntryForDate(dateISO) {
  state.currentDate = dateISO;
  state.currentEntry = getEntryByDate(dateISO);
}

/**
 * Compute aggregated totals for the currently selected month.
 * @returns {{ totalCK: number, totalTM: number, grandTotal: number }}
 */
export function computeMonthSummary() {
  let totalCK = 0, totalTM = 0;
  state.monthEntries.forEach(e => {
    totalCK += (e.ck || 0);
    totalTM += (e.tm || 0);
  });
  return { totalCK, totalTM, grandTotal: totalCK + totalTM };
}
