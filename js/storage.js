/* ========== localStorage Operations ========== */
import { TARE_DB_KEY, HISTORY_KEY } from './constants.js';
import { showToast } from './utils.js';

/* Lưu an toàn — tự xóa phiếu cũ nhất nếu localStorage đầy */
export function safeSave(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    const history = getHistory();
    if (history.length > 0) {
      history.pop();
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      showToast('Bộ nhớ đầy, đã xóa phiếu cũ nhất');
      try {
        localStorage.setItem(key, value);
      } catch { /* give up */ }
    }
  }
}

/* ========== History Storage ========== */
export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch { return []; }
}

export function saveHistory(history) {
  safeSave(HISTORY_KEY, JSON.stringify(history));
}

/* ========== Tare Weight DB (memory-cached) ========== */
/* Fix #6: cache in memory — tránh JSON.parse localStorage mỗi lần nhập liệu */
let _tareCache = null;

function getTareCache() {
  if (!_tareCache) {
    try {
      _tareCache = JSON.parse(localStorage.getItem(TARE_DB_KEY) || '{}');
    } catch {
      _tareCache = {};
    }
  }
  return _tareCache;
}

export function saveTareWeight(seri, tare) {
  if (!seri || !tare) return;
  const db = getTareCache();
  db[seri.trim()] = tare;
  try {
    localStorage.setItem(TARE_DB_KEY, JSON.stringify(db));
  } catch { /* ignore */ }
}

export function getTareWeight(seri) {
  const db = getTareCache();
  return db[seri.trim()] || null;
}
