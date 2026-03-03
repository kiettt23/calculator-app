/* ========== Revenue App Entry Point ========== */
import { loadEntries } from './state.js';
import { renderSummary, renderEntryList, updateMonthLabel } from './render.js';
import { initForm, onEditEntry, onDeleteEntry } from './handlers.js';
import { printMonth } from './print.js';
import { exportExcel } from './export.js';
import { showToast, getTodayISO } from './utils.js';

/* Expose functions for inline HTML onclick handlers */
window.printMonth = printMonth;
window.exportExcel = exportExcel;
window.onEditEntry = onEditEntry;
window.onDeleteEntry = onDeleteEntry;

/* ========== PWA Service Worker ========== */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
  if (isLocal) {
    navigator.serviceWorker.getRegistrations()
      .then(regs => regs.forEach(r => r.unregister()));
    return;
  }
  navigator.serviceWorker.register('./sw.js').catch(() => {});
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
    showToast('iOS: Nhấn Share > Thêm vào màn hình chính');
    return;
  }
  showToast('Menu trình duyệt > Cài đặt ứng dụng');
}
window.installApp = installApp;

function initInstallPrompt() {
  if (window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone) return;
  const btn = document.getElementById('btnInstall');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _installPrompt = e;
    if (btn) btn.style.display = 'flex';
  });
  window.addEventListener('appinstalled', () => {
    if (btn) btn.style.display = 'none';
    _installPrompt = null;
    showToast('Đã cài ứng dụng thành công!');
  });
  if (/iP(hone|ad|od)/.test(navigator.userAgent) && btn) {
    btn.style.display = 'flex';
  }
}

/* ========== Offline Indicator ========== */
function initOfflineIndicator() {
  const bar = document.getElementById('offlineBar');
  if (!bar) return;
  function update() { bar.classList.toggle('show', !navigator.onLine); }
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}

/* ========== iOS Keyboard Dismiss ========== */
function initIOSKeyboardDismiss() {
  document.addEventListener('touchend', (e) => {
    if (!e.target.closest('input, select, textarea, button, label')) {
      document.activeElement.blur();
    }
  }, { passive: true });
}

/* ========== Init ========== */
document.addEventListener('DOMContentLoaded', () => {
  loadEntries();
  initForm();
  updateMonthLabel();
  renderEntryList();
  renderSummary();
  initIOSKeyboardDismiss();
  initOfflineIndicator();
  initInstallPrompt();
  registerServiceWorker();

  /* Initialize Lucide icons after all DOM is ready */
  if (window.lucide) window.lucide.createIcons();
});
