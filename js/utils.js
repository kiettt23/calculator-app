/* ========== Utility Functions ========== */

export function parseNum(v) {
  if (!v && v !== 0) return NaN;
  return parseFloat(String(v).replace(',', '.'));
}

export function calcGas(c) {
  const total = parseNum(c.total);
  const tare = parseNum(c.tare);
  if (isNaN(total) || isNaN(tare)) return null;
  return Math.round((total - tare) * 100) / 100;
}

export function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function formatDateVN(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parseInt(parts[2])}/${parseInt(parts[1])}/${parts[0]}`;
}

export function formatTimeVN(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d)) return '';
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

/* Fix #9: Custom confirm dialog — replaces browser confirm() */
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
