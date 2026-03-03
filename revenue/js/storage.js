/* ========== Revenue App localStorage Operations ========== */
import { STORAGE_KEY } from './constants.js';
import { showToast } from './utils.js';

/**
 * Safely save a value to localStorage.
 * On quota error, shows toast — revenue data is precious, no auto-delete.
 * @param {string} key
 * @param {string} value
 */
export function safeSave(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    showToast('Bộ nhớ đầy, không thể lưu dữ liệu. Vui lòng xóa bớt mục cũ.');
  }
}

/**
 * Get all revenue entries from localStorage.
 * @returns {Array<{date: string, ck: number, tm: number, note: string}>}
 */
export function getAllEntries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

/**
 * Overwrite all entries in localStorage.
 * @param {Array} entries
 */
export function saveAllEntries(entries) {
  safeSave(STORAGE_KEY, JSON.stringify(entries));
}

/**
 * Find a single entry by exact ISO date.
 * @param {string} dateISO "YYYY-MM-DD"
 * @returns {{date: string, ck: number, tm: number, note: string}|null}
 */
export function getEntryByDate(dateISO) {
  const entries = getAllEntries();
  return entries.find(e => e.date === dateISO) || null;
}

/**
 * Insert or update an entry (matched by date). Keeps array sorted by date ascending.
 * @param {{date: string, ck: number, tm: number, note: string}} entry
 */
export function upsertEntry(entry) {
  const entries = getAllEntries();
  const idx = entries.findIndex(e => e.date === entry.date);
  if (idx >= 0) entries[idx] = entry;
  else entries.push(entry);
  entries.sort((a, b) => a.date.localeCompare(b.date));
  saveAllEntries(entries);
}

/**
 * Delete an entry by date.
 * @param {string} dateISO "YYYY-MM-DD"
 */
export function deleteEntry(dateISO) {
  const entries = getAllEntries().filter(e => e.date !== dateISO);
  saveAllEntries(entries);
}

/**
 * Get all entries for a specific month, sorted by date ascending.
 * @param {number} year
 * @param {number} month 1-indexed
 * @returns {Array}
 */
export function getEntriesByMonth(year, month) {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return getAllEntries()
    .filter(e => e.date.startsWith(prefix))
    .sort((a, b) => a.date.localeCompare(b.date));
}
