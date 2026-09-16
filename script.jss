// ====== Ambil elemen dari DOM ======
const currentEl = document.getElementById('current');
const historyEl = document.getElementById('history');
const buttons = document.querySelectorAll('.btn');

// ====== State kalkulator ======
let currentInput = '0';   // angka yang sedang diinput
let previousInput = '';   // angka sebelumnya
let operator = null;      // operator yang aktif
let shouldResetScreen = false; // apakah layar perlu direset saat input angka berikutnya

// ====== Fungsi format angka ======
function formatNumber(num) {
  if (!isFinite(num)) return 'Error';
  // Batasi panjang desimal agar tidak overflow
  const str = num.toString();
  if (str.length > 12 && !str.includes('e')) {
    return parseFloat(num).toPrecision(10).replace(/\.?0+$/, '');
  }
  return str;
}

// ====== Update tampilan ======
function updateDisplay() {
  currentEl.textContent = currentInput;

  if (operator && previousInput !== '') {
    const opSymbol = getOperatorSymbol(operator);
    historyEl.textContent = `${previousInput} ${opSymbol}`;
  } else {
    historyEl.textContent = '';
  }
}

function getOperatorSymbol(op) {
  switch (op) {
    case '+': return '+';
    case '-': return '−';
    case '*': return '×';
    case '/': return '÷';
    default: return '';
  }
}

// ====== Input angka ======
function inputNumber(number) {
  if (shouldResetScreen) {
    currentInput = '0';
    shouldResetScreen = false;
  }

  if (number === '.' ) return; // handled separately

  if (currentInput === '0') {
    currentInput = number;
  } else {
    // Batasi panjang input
    if (currentInput.replace(/[^0-9]/g, '').length >= 12) return;
    currentInput += number;
  }
  updateDisplay();
}

// ====== Input desimal ======
function inputDecimal() {
  if (shouldResetScreen) {
    currentInput = '0';
    shouldResetScreen = false;
  }
  if (!currentInput.includes('.')) {
    currentInput += '.';
  }
  updateDisplay();
}

// ====== Hapus semua (AC) ======
function clearAll() {
  currentInput = '0';
  previousInput = '';
  operator = null;
  shouldResetScreen = false;
  updateDisplay();
}

// ====== Hapus satu karakter (DEL) ======
function deleteLast() {
  if (shouldResetScreen) return;

  if (currentInput.length === 1 || currentInput === 'Error') {
    currentInput = '0';
  } else {
    currentInput = currentInput.slice(0, -1);
    if (currentInput === '' || currentInput === '-') currentInput = '0';
  }
  updateDisplay();
}

// ====== Persen ======
function percent() {
  if (currentInput === 'Error') return;
  const value = parseFloat(currentInput) / 100;
  currentInput = formatNumber(value);
  updateDisplay();
}

// ====== Pilih operator ======
function chooseOperator(op) {
  if (currentInput === 'Error') return;

  // Jika sudah ada operator & user tekan operator lagi → ganti operator
  if (operator && shouldResetScreen) {
    operator = op;
    updateDisplay();
    return;
  }

  // Jika ada operator sebelumnya, hitung dulu (operasi berurutan)
  if (operator && previousInput !== '') {
    calculate();
  }

  previousInput = currentInput;
  operator = op;
  shouldResetScreen = true;
  updateDisplay();
}

// ====== Hitung ======
function calculate() {
  if (!operator || previousInput === '' || currentInput === 'Error') return;

  const prev = parseFloat(previousInput);
  const curr = parseFloat(currentInput);
  let result = 0;

  switch (operator) {
    case '+': result = prev + curr; break;
    case '-': result = prev - curr; break;
    case '*': result = prev * curr; break;
    case '/':
      if (curr === 0) {
        currentInput = 'Error';
        previousInput = '';
        operator = null;
        shouldResetScreen = true;
        currentEl.textContent = 'Error';
        historyEl.textContent = 'Tidak bisa dibagi 0';
        return;
      }
      result = prev / curr;
      break;
    default: return;
  }

  // Bulatkan untuk hindari floating point error
  result = Math.round(result * 1e10) / 1e10;

  currentInput = formatNumber(result);
  previousInput = '';
  operator = null;
  shouldResetScreen = true;
}

// ====== Handle equals ======
function handleEquals() {
  if (!operator || previousInput === '') return;

  const prev = previousInput;
  const op = operator;
  const curr = currentInput;

  calculate();

  // Tampilkan history setelah perhitungan
  historyEl.textContent = `${prev} ${getOperatorSymbol(op)} ${curr} =`;
  currentEl.textContent = currentInput;
}

// ====== Event listener untuk semua tombol ======
buttons.forEach(button => {
  button.addEventListener('click', () => {
    const number = button.dataset.number;
    const op = button.dataset.operator;
    const action = button.dataset.action;

    if (number !== undefined) {
      inputNumber(number);
    } else if (op !== undefined) {
      chooseOperator(op);
    } else if (action === 'decimal') {
      inputDecimal();
    } else if (action === 'clear') {
      clearAll();
    } else if (action === 'delete') {
      deleteLast();
    } else if (action === 'percent') {
      percent();
    } else if (action === 'equals') {
      handleEquals();
    }
  });
});

// ====== Dukungan keyboard (opsional, untuk desktop) ======
document.addEventListener('keydown', (e) => {
  const key = e.key;

  if (/^[0-9]$/.test(key)) {
    inputNumber(key);
  } else if (key === '.' || key === ',') {
    inputDecimal();
  } else if (['+', '-', '*', '/'].includes(key)) {
    chooseOperator(key);
  } else if (key === 'Enter' || key === '=') {
    e.preventDefault();
    handleEquals();
  } else if (key === 'Backspace') {
    deleteLast();
  } else if (key === 'Escape') {
    clearAll();
  } else if (key === '%') {
    percent();
  }
});

// ====== Inisialisasi ======
updateDisplay();