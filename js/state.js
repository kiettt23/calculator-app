/* ========== App State & Persistence ========== */
import { STORAGE_KEY, DEFAULT_ROWS } from './constants.js';
import { safeSave } from './storage.js';

/* State object — export const để các module khác mutate properties trực tiếp */
export const state = {
  date: new Date().toISOString().split('T')[0],
  cylinders: []
};

export function createEmptyRows(count) {
  return Array.from({ length: count }, () => ({ seri: '', total: '', tare: '' }));
}

export function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state.date = parsed.date;
      state.cylinders = parsed.cylinders;
    } else {
      state.cylinders = createEmptyRows(DEFAULT_ROWS);
    }
  } catch {
    state.cylinders = createEmptyRows(DEFAULT_ROWS);
  }
}

export function saveData() {
  safeSave(STORAGE_KEY, JSON.stringify(state));
}

let autoSaveTimer;
export function autoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    safeSave(STORAGE_KEY, JSON.stringify(state));
  }, 800);
}
