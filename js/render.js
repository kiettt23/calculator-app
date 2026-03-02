/* ========== DOM Rendering ========== */
import { state } from './state.js';
import { calcGas, escapeHTML } from './utils.js';

/* ========== Duplicate Check ========== */
export function checkDuplicate(seri, index) {
  if (!seri || !seri.trim()) return false;
  const trimmed = seri.trim();
  return state.cylinders.some((c, i) => i !== index && c.seri.trim() === trimmed);
}

/* Fix #7: O(n) thay vì O(n²) — dùng frequency map */
export function updateDuplicateWarnings() {
  const freq = {};
  state.cylinders.forEach(c => {
    const s = c.seri.trim();
    if (s) freq[s] = (freq[s] || 0) + 1;
  });

  state.cylinders.forEach((c, i) => {
    const card = document.getElementById(`card-${i}`);
    if (!card) return;
    const warn = card.querySelector('.duplicate-warn');
    if (warn) {
      const isDup = c.seri.trim() && freq[c.seri.trim()] > 1;
      warn.className = `duplicate-warn ${isDup ? 'show' : ''}`;
    }
  });
}

/* ========== Card Rendering ========== */

/* Fix #3: phân biệt gas âm (nhập sai) vs bình thường */
function getCardClass(gas) {
  if (gas === null) return 'cylinder-card';
  if (gas < 0) return 'cylinder-card has-data gas-negative';
  return 'cylinder-card has-data';
}

function buildCardHTML(index, c, gas) {
  let resultClass, resultText;
  if (gas === null) {
    resultClass = 'empty';
    resultText = '--';
  } else if (gas < 0) {
    resultClass = 'negative';
    resultText = `${gas.toFixed(1)} <span class="unit">kg</span>`;
  } else {
    resultClass = '';
    resultText = `${gas.toFixed(1)} <span class="unit">kg</span>`;
  }

  const isDuplicate = checkDuplicate(c.seri, index);

  return `
    <div class="card-header">
      <div class="card-number" aria-label="Bình số ${index + 1}">${index + 1}</div>
      <div class="card-result ${resultClass}" aria-label="Gas tồn">${resultText}</div>
      ${state.cylinders.length > 1
        ? `<button class="card-delete" onclick="removeRow(${index})"
            type="button" aria-label="Xóa bình số ${index + 1}">&times;</button>`
        : ''}
    </div>
    ${gas !== null && gas < 0
      ? `<div class="gas-warn">&#9888; Cân toàn bộ nhỏ hơn trọng lượng vỏ!</div>`
      : ''}
    <div class="input-row">
      <div class="input-group">
        <label for="seri-${index}">Số seri</label>
        <input id="seri-${index}" type="text"
               value="${escapeHTML(c.seri)}"
               oninput="onFieldInput(${index},'seri',this.value)"
               onkeydown="onEnterKey(event,${index},'seri')"
               placeholder="Ví dụ: 0171"
               autocomplete="off">
        <div class="duplicate-warn ${isDuplicate ? 'show' : ''}">Trùng số seri!</div>
      </div>
    </div>
    <div class="input-row">
      <div class="input-group">
        <label for="total-${index}">Cân toàn bộ (kg)</label>
        <input id="total-${index}" type="text" inputmode="decimal"
               value="${c.total}"
               oninput="onFieldInput(${index},'total',this.value)"
               onkeydown="onEnterKey(event,${index},'total')"
               onfocus="this.select()"
               placeholder="Ví dụ: 53.3"
               autocomplete="off">
      </div>
      <div class="input-group">
        <label for="tare-${index}">TL vỏ chai (kg)</label>
        <input id="tare-${index}" type="text" inputmode="decimal"
               value="${c.tare}"
               oninput="onFieldInput(${index},'tare',this.value)"
               onkeydown="onEnterKey(event,${index},'tare')"
               onfocus="this.select()"
               placeholder="Ví dụ: 40.2"
               autocomplete="off">
      </div>
    </div>`;
}

export function createCard(index) {
  const c = state.cylinders[index];
  const gas = calcGas(c);
  const card = document.createElement('div');
  card.className = getCardClass(gas);
  card.id = `card-${index}`;
  card.setAttribute('role', 'listitem');
  card.innerHTML = buildCardHTML(index, c, gas);
  return card;
}

export function renderAllCards() {
  const list = document.getElementById('cylinderList');
  list.innerHTML = '';
  state.cylinders.forEach((_, i) => list.appendChild(createCard(i)));
}

export function updateCardResult(index) {
  const gas = calcGas(state.cylinders[index]);
  const card = document.getElementById(`card-${index}`);
  if (!card) return;

  const result = card.querySelector('.card-result');
  card.className = getCardClass(gas);

  if (gas !== null) {
    result.innerHTML = `${gas.toFixed(1)} <span class="unit">kg</span>`;
    result.className = gas < 0 ? 'card-result negative' : 'card-result';
  } else {
    result.innerHTML = '--';
    result.className = 'card-result empty';
  }

  /* Cập nhật cảnh báo gas âm */
  let warn = card.querySelector('.gas-warn');
  if (gas !== null && gas < 0) {
    if (!warn) {
      warn = document.createElement('div');
      warn.className = 'gas-warn';
      warn.textContent = '\u26A0 Cân toàn bộ nhỏ hơn trọng lượng vỏ!';
      card.querySelector('.card-header').after(warn);
    }
  } else if (warn) {
    warn.remove();
  }
}

export function updateSummary() {
  let totalGas = 0;
  let count = 0;
  state.cylinders.forEach(c => {
    const gas = calcGas(c);
    /* Chỉ tính bình có gas hợp lệ (>= 0) vào tổng */
    if (gas !== null && gas >= 0) { totalGas += gas; count++; }
  });
  document.getElementById('totalGas').textContent = totalGas.toFixed(1);
  document.getElementById('filledCount').textContent = count;
  document.getElementById('totalCount').textContent = state.cylinders.length;
}
