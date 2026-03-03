/* ========== Revenue App Utility Functions ========== */

/**
 * Format a number to Vietnamese currency string (dot-separated thousands).
 * @param {number|string} value
 * @returns {string} e.g. "1.500.000" or "0"
 */
export function formatVND(value) {
  if (!value && value !== 0) return '0';
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '0';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Parse a VND-formatted string back to an integer.
 * @param {string} formatted e.g. "1.500.000"
 * @returns {number} e.g. 1500000
 */
export function parseVND(formatted) {
  if (!formatted) return 0;
  const raw = String(formatted).replace(/\./g, '');
  const n = parseInt(raw, 10);
  return isNaN(n) ? 0 : n;
}

/**
 * Returns today's date as ISO string "YYYY-MM-DD".
 * @returns {string}
 */
export function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Format ISO date to Vietnamese full date string.
 * @param {string} isoDate "2026-03-03"
 * @returns {string} "03/03/2026"
 */
export function formatDateVN(isoDate) {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Format ISO date to short dd/mm label (used in entry list).
 * @param {string} isoDate "2026-03-03"
 * @returns {string} "03/03"
 */
export function formatDateShort(isoDate) {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}`;
}

/**
 * Get number of days in a month.
 * @param {number} year
 * @param {number} month 1-indexed
 * @returns {number}
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * Get a human-readable month/year label.
 * @param {number} year
 * @param {number} month 1-indexed
 * @returns {string} e.g. "Tháng 3/2026"
 */
export function getMonthYearLabel(year, month) {
  return `Tháng ${month}/${year}`;
}

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
export function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Show a toast notification for 2.5 seconds.
 * Targets #toast element in DOM.
 * @param {string} message
 */
export function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

/**
 * Promise-based custom confirm dialog.
 * Targets #confirmOverlay, #confirmMessage, #confirmOk, #confirmCancel.
 * @param {string} message
 * @returns {Promise<boolean>}
 */
export function showConfirm(message) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('confirmOverlay');
    document.getElementById('confirmMessage').textContent = message;
    overlay.classList.add('show');

    function onOk() { cleanup(true); }
    function onCancel() { cleanup(false); }

    function cleanup(result) {
      overlay.classList.remove('show');
      document.getElementById('confirmOk').removeEventListener('click', onOk);
      document.getElementById('confirmCancel').removeEventListener('click', onCancel);
      resolve(result);
    }

    document.getElementById('confirmOk').addEventListener('click', onOk);
    document.getElementById('confirmCancel').addEventListener('click', onCancel);
  });
}
