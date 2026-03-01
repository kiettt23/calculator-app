/* ========== State ========== */
const STORAGE_KEY = 'phieu-can-gas-data';
const TARE_DB_KEY = 'phieu-can-gas-tare-db';
const HISTORY_KEY = 'phieu-can-gas-history';
const DEFAULT_ROWS = 40;
const MAX_HISTORY = 50;

let state = {
  date: new Date().toISOString().split('T')[0],
  cylinders: []
};

/* ========== Init ========== */
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  initDatePicker();
  renderAllCards();
  updateSummary();
});

/* ========== Vietnamese Date Picker ========== */
function initDatePicker() {
  const dayEl = document.getElementById('formDay');
  const monthEl = document.getElementById('formMonth');
  const yearEl = document.getElementById('formYear');

  // Populate days 1-31
  for (let d = 1; d <= 31; d++) {
    dayEl.add(new Option(d, d));
  }
  // Populate months in Vietnamese
  const monthNames = [
    'Th\u00e1ng 1','Th\u00e1ng 2','Th\u00e1ng 3','Th\u00e1ng 4',
    'Th\u00e1ng 5','Th\u00e1ng 6','Th\u00e1ng 7','Th\u00e1ng 8',
    'Th\u00e1ng 9','Th\u00e1ng 10','Th\u00e1ng 11','Th\u00e1ng 12'
  ];
  monthNames.forEach((name, i) => {
    monthEl.add(new Option(name, i + 1));
  });
  // Populate years (current year +/- 2)
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 2; y <= currentYear + 1; y++) {
    yearEl.add(new Option(y, y));
  }

  // Set from saved state or today
  const parts = (state.date || '').split('-');
  if (parts.length === 3) {
    yearEl.value = parseInt(parts[0]);
    monthEl.value = parseInt(parts[1]);
    dayEl.value = parseInt(parts[2]);
  } else {
    const today = new Date();
    dayEl.value = today.getDate();
    monthEl.value = today.getMonth() + 1;
    yearEl.value = today.getFullYear();
  }

  const onDateChange = () => {
    const y = yearEl.value;
    const m = String(monthEl.value).padStart(2, '0');
    const d = String(dayEl.value).padStart(2, '0');
    state.date = `${y}-${m}-${d}`;
    autoSave();
  };
  dayEl.addEventListener('change', onDateChange);
  monthEl.addEventListener('change', onDateChange);
  yearEl.addEventListener('change', onDateChange);
}

/* ========== Data Persistence ========== */
function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      state = JSON.parse(saved);
    } else {
      state.cylinders = createEmptyRows(DEFAULT_ROWS);
    }
  } catch {
    state.cylinders = createEmptyRows(DEFAULT_ROWS);
  }
}

function safeSave(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // Storage full — delete oldest history entries and retry
    const history = getHistory();
    if (history.length > 0) {
      history.pop();
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      showToast('B\u1ed9 nh\u1edb \u0111\u1ea7y, \u0111\u00e3 x\u00f3a phi\u1ebfu c\u0169 nh\u1ea5t');
      try {
        localStorage.setItem(key, value);
      } catch { /* give up */ }
    }
  }
}

function saveData() {
  safeSave(STORAGE_KEY, JSON.stringify(state));
}

let autoSaveTimer;
function autoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    safeSave(STORAGE_KEY, JSON.stringify(state));
  }, 800);
}

function createEmptyRows(count) {
  return Array.from({ length: count }, () => ({ seri: '', total: '', tare: '' }));
}

/* ========== Tare Weight Memory ========== */
function saveTareWeight(seri, tare) {
  if (!seri || !tare) return;
  try {
    const db = JSON.parse(localStorage.getItem(TARE_DB_KEY) || '{}');
    db[seri.trim()] = tare;
    localStorage.setItem(TARE_DB_KEY, JSON.stringify(db));
  } catch { /* ignore */ }
}

function getTareWeight(seri) {
  try {
    const db = JSON.parse(localStorage.getItem(TARE_DB_KEY) || '{}');
    return db[seri.trim()] || null;
  } catch { return null; }
}

/* ========== Calculation ========== */
function parseNum(v) {
  if (!v && v !== 0) return NaN;
  return parseFloat(String(v).replace(',', '.'));
}

function calcGas(c) {
  const total = parseNum(c.total);
  const tare = parseNum(c.tare);
  if (isNaN(total) || isNaN(tare)) return null;
  return Math.round((total - tare) * 100) / 100;
}

/* ========== Render ========== */
function renderAllCards() {
  const list = document.getElementById('cylinderList');
  list.innerHTML = '';
  state.cylinders.forEach((_, i) => list.appendChild(createCard(i)));
}

function createCard(index) {
  const c = state.cylinders[index];
  const gas = calcGas(c);
  const card = document.createElement('div');
  card.className = getCardClass(gas);
  card.id = `card-${index}`;
  card.setAttribute('role', 'listitem');
  card.innerHTML = buildCardHTML(index, c, gas);
  return card;
}

function getCardClass(gas) {
  if (gas === null) return 'cylinder-card';
  return 'cylinder-card has-data';
}

function buildCardHTML(index, c, gas) {
  const resultClass = gas === null ? 'empty' : '';
  const resultText = gas === null
    ? '--'
    : `${gas.toFixed(1)} <span class="unit">kg</span>`;
  const isDuplicate = checkDuplicate(c.seri, index);

  return `
    <div class="card-header">
      <div class="card-number" aria-label="B\u00ecnh s\u1ed1 ${index + 1}">${index + 1}</div>
      <div class="card-result ${resultClass}" aria-label="Gas t\u1ed3n">${resultText}</div>
      ${state.cylinders.length > 1
        ? `<button class="card-delete" onclick="removeRow(${index})"
            type="button" aria-label="X\u00f3a b\u00ecnh s\u1ed1 ${index + 1}">&times;</button>`
        : ''}
    </div>
    <div class="input-row">
      <div class="input-group">
        <label for="seri-${index}">S\u1ed1 seri</label>
        <input id="seri-${index}" type="text"
               value="${escapeHTML(c.seri)}"
               oninput="onFieldInput(${index},'seri',this.value)"
               onkeydown="onEnterKey(event,${index},'seri')"
               placeholder="V\u00ed d\u1ee5: 0171"
               autocomplete="off">
        <div class="duplicate-warn ${isDuplicate ? 'show' : ''}">Tr\u00f9ng s\u1ed1 seri!</div>
      </div>
    </div>
    <div class="input-row">
      <div class="input-group">
        <label for="total-${index}">C\u00e2n to\u00e0n b\u1ed9 (kg)</label>
        <input id="total-${index}" type="text" inputmode="decimal"
               value="${c.total}"
               oninput="onFieldInput(${index},'total',this.value)"
               onkeydown="onEnterKey(event,${index},'total')"
               onfocus="this.select()"
               placeholder="V\u00ed d\u1ee5: 53.3"
               autocomplete="off">
      </div>
      <div class="input-group">
        <label for="tare-${index}">TL v\u1ecf chai (kg)</label>
        <input id="tare-${index}" type="text" inputmode="decimal"
               value="${c.tare}"
               oninput="onFieldInput(${index},'tare',this.value)"
               onkeydown="onEnterKey(event,${index},'tare')"
               onfocus="this.select()"
               placeholder="V\u00ed d\u1ee5: 40.2"
               autocomplete="off">
      </div>
    </div>`;
}

/* ========== Event Handlers ========== */
function onFieldInput(index, field, value) {
  state.cylinders[index][field] = value;
  updateCardResult(index);
  updateSummary();
  autoSave();

  if (field === 'tare' && state.cylinders[index].seri) {
    saveTareWeight(state.cylinders[index].seri, value);
  }
  if (field === 'seri' && value) {
    autoFillTare(index, value);
    updateDuplicateWarnings();
  }
}

function onEnterKey(event, index, field) {
  if (event.key !== 'Enter') return;
  event.preventDefault();

  const card = document.getElementById(`card-${index}`);
  const inputs = card.querySelectorAll('input');
  const inputList = Array.from(inputs);
  const currentIdx = inputList.findIndex(inp => inp === event.target);

  if (currentIdx < inputList.length - 1) {
    inputList[currentIdx + 1].focus();
  } else if (index < state.cylinders.length - 1) {
    const nextCard = document.getElementById(`card-${index + 1}`);
    if (nextCard) nextCard.querySelector('input').focus();
  }
}

function autoFillTare(index, seri) {
  const knownTare = getTareWeight(seri);
  if (!knownTare || state.cylinders[index].tare) return;

  state.cylinders[index].tare = knownTare;
  const tareInput = document.getElementById(`tare-${index}`);
  if (tareInput) tareInput.value = knownTare;
  updateCardResult(index);
  updateSummary();
  showToast(`T\u1ef1 \u0111i\u1ec1n TL v\u1ecf: ${knownTare} kg`);
}

/* ========== UI Updates ========== */
function updateCardResult(index) {
  const gas = calcGas(state.cylinders[index]);
  const card = document.getElementById(`card-${index}`);
  if (!card) return;

  const result = card.querySelector('.card-result');
  if (gas !== null) {
    result.innerHTML = `${gas.toFixed(1)} <span class="unit">kg</span>`;
    result.className = 'card-result';
    card.className = getCardClass(gas);
  } else {
    result.innerHTML = '--';
    result.className = 'card-result empty';
    card.className = 'cylinder-card';
  }
}

function updateSummary() {
  let totalGas = 0;
  let count = 0;
  state.cylinders.forEach(c => {
    const gas = calcGas(c);
    if (gas !== null) { totalGas += gas; count++; }
  });
  document.getElementById('totalGas').textContent = totalGas.toFixed(1);
  document.getElementById('filledCount').textContent = count;
  document.getElementById('totalCount').textContent = state.cylinders.length;
}

/* ========== Row Management ========== */
function addRow() {
  state.cylinders.push({ seri: '', total: '', tare: '' });
  const list = document.getElementById('cylinderList');
  const newCard = createCard(state.cylinders.length - 1);
  list.appendChild(newCard);
  updateSummary();
  autoSave();
  newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => newCard.querySelector('input').focus(), 350);
}

function removeRow(index) {
  if (state.cylinders.length <= 1) return;
  const c = state.cylinders[index];
  if (c.seri || c.total || c.tare) {
    if (!confirm(`X\u00f3a b\u00ecnh s\u1ed1 ${index + 1}?`)) return;
  }
  state.cylinders.splice(index, 1);
  renderAllCards();
  updateSummary();
  autoSave();
}

function clearAll() {
  if (!confirm('X\u00f3a h\u1ebft d\u1eef li\u1ec7u v\u00e0 t\u1ea1o phi\u1ebfu m\u1edbi?')) return;

  // Auto-archive current form if it has data
  archiveCurrentForm();

  state.cylinders = createEmptyRows(DEFAULT_ROWS);
  state.date = new Date().toISOString().split('T')[0];

  // Update Vietnamese date picker
  const today = new Date();
  document.getElementById('formDay').value = today.getDate();
  document.getElementById('formMonth').value = today.getMonth() + 1;
  document.getElementById('formYear').value = today.getFullYear();

  renderAllCards();
  updateSummary();
  saveData();
  showToast('\u0110\u00e3 t\u1ea1o phi\u1ebfu m\u1edbi!');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ========== History (Lịch sử phiếu) ========== */
function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch { return []; }
}

function saveHistory(history) {
  safeSave(HISTORY_KEY, JSON.stringify(history));
}

function archiveCurrentForm() {
  const hasData = state.cylinders.some(c => c.seri || c.total || c.tare);
  if (!hasData) return;

  const history = getHistory();

  // Count filled cylinders & total gas
  let totalGas = 0;
  let filledCount = 0;
  state.cylinders.forEach(c => {
    const g = calcGas(c);
    if (g !== null) { totalGas += g; filledCount++; }
  });

  history.unshift({
    id: Date.now(),
    date: state.date,
    cylinders: JSON.parse(JSON.stringify(state.cylinders)),
    totalGas: Math.round(totalGas * 10) / 10,
    filledCount: filledCount,
    savedAt: new Date().toISOString()
  });

  // Keep only last MAX_HISTORY entries
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
  saveHistory(history);
}

function showHistory() {
  const history = getHistory();
  const modal = document.getElementById('historyModal');
  const list = document.getElementById('historyList');

  if (history.length === 0) {
    list.innerHTML = '<div class="history-empty">Ch\u01b0a c\u00f3 phi\u1ebfu n\u00e0o \u0111\u01b0\u1ee3c l\u01b0u</div>';
  } else {
    list.innerHTML = history.map((item, i) => {
      const dateStr = formatDateVN(item.date);
      const timeStr = formatTimeVN(item.savedAt);
      // Build detail rows for cylinders that have data
      const detailRows = item.cylinders
        .map((c, ci) => {
          if (!c.seri && !c.total && !c.tare) return '';
          const g = calcGas(c);
          return `<tr>
            <td>${ci + 1}</td>
            <td>${escapeHTML(c.seri)}</td>
            <td>${c.total || ''}</td>
            <td>${c.tare || ''}</td>
            <td><strong>${g !== null ? g.toFixed(1) : ''}</strong></td>
          </tr>`;
        })
        .filter(Boolean)
        .join('');

      return `<div class="history-item-wrap">
        <div class="history-item" onclick="toggleHistoryDetail(${i})" role="button" tabindex="0">
          <div class="history-date">
            ${dateStr}
            <span class="history-time">${timeStr}</span>
          </div>
          <div class="history-info">
            <span class="history-gas">${item.totalGas} kg</span>
            <span class="history-count">${item.filledCount} b\u00ecnh</span>
          </div>
          <button class="history-delete" onclick="event.stopPropagation();deleteHistory(${i})"
            type="button" aria-label="X\u00f3a phi\u1ebfu">&times;</button>
        </div>
        <div class="history-detail" id="historyDetail-${i}">
          <table class="history-table">
            <thead><tr>
              <th>STT</th><th>Seri</th><th>C\u00e2n TB</th><th>TL V\u1ecf</th><th>Gas T\u1ed3n</th>
            </tr></thead>
            <tbody>${detailRows}</tbody>
          </table>
          <button class="btn btn-history-load" onclick="loadHistory(${i})" type="button">
            M\u1edf phi\u1ebfu n\u00e0y
          </button>
        </div>
      </div>`;
    }).join('');
  }

  modal.classList.add('show');
}

function toggleHistoryDetail(index) {
  const detail = document.getElementById(`historyDetail-${index}`);
  if (!detail) return;
  detail.classList.toggle('show');
}

function closeHistory() {
  document.getElementById('historyModal').classList.remove('show');
}

function loadHistory(index) {
  const history = getHistory();
  const item = history[index];
  if (!item) return;

  if (state.cylinders.some(c => c.seri || c.total || c.tare)) {
    if (!confirm('Phi\u1ebfu hi\u1ec7n t\u1ea1i s\u1ebd b\u1ecb thay th\u1ebf. Ti\u1ebfp t\u1ee5c?')) return;
    archiveCurrentForm();
  }

  state.date = item.date;
  state.cylinders = JSON.parse(JSON.stringify(item.cylinders));

  // Update date picker
  const parts = (item.date || '').split('-');
  if (parts.length === 3) {
    document.getElementById('formYear').value = parseInt(parts[0]);
    document.getElementById('formMonth').value = parseInt(parts[1]);
    document.getElementById('formDay').value = parseInt(parts[2]);
  }

  renderAllCards();
  updateSummary();
  saveData();
  closeHistory();
  showToast('\u0110\u00e3 t\u1ea3i phi\u1ebfu c\u0169!');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteHistory(index) {
  if (!confirm('X\u00f3a phi\u1ebfu n\u00e0y kh\u1ecfi l\u1ecbch s\u1eed?')) return;
  const history = getHistory();
  history.splice(index, 1);
  saveHistory(history);
  showHistory(); // refresh list
  showToast('\u0110\u00e3 x\u00f3a!');
}

function formatDateVN(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parseInt(parts[2])}/${parseInt(parts[1])}/${parts[0]}`;
}

function formatTimeVN(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d)) return '';
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/* ========== Duplicate Check ========== */
function checkDuplicate(seri, index) {
  if (!seri || !seri.trim()) return false;
  const trimmed = seri.trim();
  return state.cylinders.some((c, i) => i !== index && c.seri.trim() === trimmed);
}

function updateDuplicateWarnings() {
  state.cylinders.forEach((c, i) => {
    const card = document.getElementById(`card-${i}`);
    if (!card) return;
    const warn = card.querySelector('.duplicate-warn');
    if (warn) {
      warn.className = `duplicate-warn ${checkDuplicate(c.seri, i) ? 'show' : ''}`;
    }
  });
}

/* ========== Print ========== */
function printForm() {
  generatePrintView();
  setTimeout(() => window.print(), 200);
}

function generatePrintView() {
  const half = Math.ceil(state.cylinders.length / 2);
  let rows = '';

  for (let i = 0; i < half; i++) {
    const left = state.cylinders[i];
    const right = state.cylinders[i + half];
    const gasL = calcGas(left);
    const gasR = right ? calcGas(right) : null;

    rows += `<tr>
      <td>${i + 1}</td>
      <td>${escapeHTML(left.seri)}</td>
      <td>${left.total || ''}</td>
      <td>${left.tare || ''}</td>
      <td><strong>${gasL !== null ? gasL.toFixed(1) : ''}</strong></td>
      <td class="separator">${right ? i + half + 1 : ''}</td>
      <td>${right ? escapeHTML(right.seri) : ''}</td>
      <td>${right ? (right.total || '') : ''}</td>
      <td>${right ? (right.tare || '') : ''}</td>
      <td><strong>${gasR !== null ? gasR.toFixed(1) : ''}</strong></td>
    </tr>`;
  }

  let totalGas = 0;
  state.cylinders.forEach(c => {
    const g = calcGas(c);
    if (g !== null) totalGas += g;
  });

  const dateStr = state.date
    ? new Date(state.date + 'T00:00:00').toLocaleDateString('vi-VN')
    : '';

  document.getElementById('printView').innerHTML = `
    <div class="print-header">
      <h2>T\u1ed5ng C\u00f4ng ty Gas Petrolimex-CTCP</h2>
      <h3>Nh\u00e0 m\u00e1y LPG S\u00e0i G\u00f2n</h3>
      <h1>PHI\u1EEAU C\u00c2N T\u1ea0I TR\u1ea0M N\u1ea0P</h1>
      <p>Ng\u00e0y: ${dateStr}</p>
    </div>
    <div class="print-info">
      <strong>1. B\u00ean b\u00e1n:</strong> Chi nh\u00e1nh T\u1ed5ng C\u00f4ng ty Gas Petrolimex-CTCP - Nh\u00e0 m\u00e1y LPG S\u00e0i G\u00f2n<br>
      <strong>2. B\u00ean mua:</strong> C\u00f4ng ty TNHH Gas Petrolimex (S\u00e0i G\u00f2n)<br>
      Hai b\u00ean x\u00e1c nh\u1eadn l\u01b0\u1ee3ng Gas c\u00f2n t\u1ed3n trong chai c\u1ee7a B\u00ean mua nh\u01b0 sau:
    </div>
    <table class="print-table">
      <thead><tr>
        <th>STT</th><th>S\u1ed1 Seri</th><th>C\u00e2n TB</th><th>TL V\u1ecf</th><th>Gas T\u1ed3n</th>
        <th class="separator">STT</th><th>S\u1ed1 Seri</th><th>C\u00e2n TB</th><th>TL V\u1ecf</th><th>Gas T\u1ed3n</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="print-total">T\u1ed5ng c\u1ed9ng gas t\u1ed3n: ${totalGas.toFixed(1)} kg</div>
    <div class="print-signatures">
      <div><div class="sig-title">B\u00ean mua</div><div>(K\u00fd, ghi r\u00f5 h\u1ecd t\u00ean)</div></div>
      <div><div class="sig-title">B\u00ean v\u1eadn chuy\u1ec3n</div><div>(BKS, k\u00fd, ghi r\u00f5)</div></div>
      <div><div class="sig-title">Th\u1ee7 kho</div><div>(K\u00fd, ghi r\u00f5 h\u1ecd t\u00ean)</div></div>
      <div><div class="sig-title">B\u1ea3o v\u1ec7</div><div>(K\u00fd, ghi r\u00f5 h\u1ecd t\u00ean)</div></div>
      <div><div class="sig-title">Th\u1ee7 tr\u01b0\u1edfng \u0111\u01a1n v\u1ecb</div><div>(K\u00fd, ghi r\u00f5)</div></div>
    </div>`;
}

/* ========== Export CSV ========== */
function exportCSV() {
  const BOM = '\uFEFF';
  let csv = BOM + 'STT,S\u1ed1 Seri V\u1ecf chai,C\u00e2n to\u00e0n b\u1ed9,Tr\u1ecdng l\u01b0\u1ee3ng v\u1ecf chai,S\u1ed1 l\u01b0\u1ee3ng Gas t\u1ed3n\n';

  state.cylinders.forEach((c, i) => {
    if (!c.seri && !c.total && !c.tare) return;
    const gas = calcGas(c);
    csv += `${i + 1},"${c.seri}",${c.total || ''},${c.tare || ''},${gas !== null ? gas.toFixed(1) : ''}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `phieu-can-gas-${state.date || 'export'}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('\u0110\u00e3 xu\u1ea5t file CSV!');
}

/* ========== Utilities ========== */
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}
