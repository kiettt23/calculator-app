/* ========== App Entry Point ========== */
import { loadData } from './state.js';
import { renderAllCards, updateSummary } from './render.js';
import { initDatePicker, initIOSKeyboardDismiss, onFieldInput, onEnterKey, addRow, removeRow, clearAll, fillRandomData } from './handlers.js';
import { showHistory, closeHistory, toggleHistoryDetail, loadHistory, deleteHistory } from './history.js';
import { printForm, exportCSV } from './print.js';
import { showToast } from './utils.js';

/* Expose functions for inline HTML event handlers */
window.onFieldInput = onFieldInput;
window.onEnterKey = onEnterKey;
window.addRow = addRow;
window.removeRow = removeRow;
window.clearAll = clearAll;
window.showHistory = showHistory;
window.closeHistory = closeHistory;
window.toggleHistoryDetail = toggleHistoryDetail;
window.loadHistory = loadHistory;
window.deleteHistory = deleteHistory;
window.printForm = printForm;
window.exportCSV = exportCSV;
window.fillRandomData = fillRandomData;

/* ========== PWA Service Worker ========== */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* ignore */ });
  }
}

/* ========== PWA Install Prompt ========== */
let _installPrompt = null;

function installApp() {
  if (_installPrompt) {
    _installPrompt.prompt();
    _installPrompt.userChoice.then(() => { _installPrompt = null; });
    return;
  }
  if (/iP(hone|ad|od)/.test(navigator.userAgent)) {
    showToast('iOS: Nhấn nút Chia sẻ → Thêm vào màn hình chính');
    return;
  }
  showToast('Dùng menu trình duyệt → Cài đặt ứng dụng');
}
window.installApp = installApp;

function initInstallPrompt() {
  /* Đã chạy ở chế độ standalone (installed) → ẩn nút */
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) return;

  const btn = document.getElementById('btnInstall');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _installPrompt = e;
    btn.style.display = 'flex';
  });

  window.addEventListener('appinstalled', () => {
    btn.style.display = 'none';
    _installPrompt = null;
    showToast('Đã cài ứng dụng thành công!');
  });

  /* iOS Safari không có beforeinstallprompt → hiện nút với hướng dẫn thủ công */
  if (/iP(hone|ad|od)/.test(navigator.userAgent)) {
    btn.style.display = 'flex';
  }
}

/* ========== Offline Indicator (Fix #11) ========== */
function initOfflineIndicator() {
  const bar = document.getElementById('offlineBar');
  function update() { bar.classList.toggle('show', !navigator.onLine); }
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}

/* ========== Init ========== */
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  initDatePicker();
  renderAllCards();
  updateSummary();
  initIOSKeyboardDismiss();
  initOfflineIndicator();
  initInstallPrompt();
  registerServiceWorker();
});
