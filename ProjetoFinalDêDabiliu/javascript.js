'use strict';

const METALS = {
  gold: {
    name:       'Ouro',
    unit:       'por troy oz',
    basePrice:  3215.40,
    idealBuy:   3000.00,
    theme:      'gold-theme',
    volatility: 0.0008,
    expertNote: 'Especialistas recomendam comprar abaixo de $3.000/oz para uma entrada segura a longo prazo.',
  },
  coal: {
    name:       'Carvão',
    unit:       'por tonelada métrica',
    basePrice:  121.80,
    idealBuy:    95.00,
    theme:      'coal-theme',
    volatility: 0.0012,
    expertNote: 'Analistas de commodities indicam $95/ton como zona de suporte forte para entrada.',
  },
  emerald: {
    name:       'Esmeralda',
    unit:       'por quilate',
    basePrice:  835.00,
    idealBuy:   650.00,
    theme:      'emerald-theme',
    volatility: 0.0015,
    expertNote: 'Gemólogos consideram esmeraldas abaixo de $650/ct uma oportunidade rara de compra.',
  },
};

const state = {
  currentMetal: 'gold',

  prices: {
    gold:    3215.40,
    coal:    121.80,
    emerald: 835.00,
  },

  prevMinutePrices: {
    gold:    3215.40,
    coal:    121.80,
    emerald: 835.00,
  },

  dayStats: {
    gold:    { low: 3188.50, high: 3247.20 },
    coal:    { low: 115.40,  high: 128.60  },
    emerald: { low: 810.00,  high: 862.00  },
  },

  history: [],
  lastUpdated: new Date(),
};

const $ = (id) => document.getElementById(id);

const dom = {
  priceCard:        $('priceCard'), 
  currentPrice:     $('currentPrice'),
  metalLabel:       $('metalLabel'),
  priceUnit:        $('priceUnit'),
  minuteBadge:      $('minuteBadge'),
  minuteArrow:      $('minuteArrow'),
  minutePct:        $('minutePct'),
  buySignal:        $('buySignal'),
  buySignalText:    $('buySignalText'),
  idealPrice:       $('idealPrice'),
  priceGap:         $('priceGap'),
  expertNote:       $('expertNote'),
  dayLow:           $('dayLow'),
  dayHigh:          $('dayHigh'),
  updateBtn:        $('updateBtn'),
  updateTime:       $('updateTime'),
  historyToggle:    $('historyToggle'),
  historyPanel:     $('historyPanel'),
  historyList:      $('historyList'),
  historyArrow:     $('historyArrow'),
  historyMetalLabel:$('historyMetalLabel'),
  metalBtns:        document.querySelectorAll('.metal-btn'),
};

function fmtPrice(n) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(pct) {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

function fmtAgo(ms) {
  const mins = Math.floor(ms / 60000);
  if (mins === 0) return 'agora mesmo';
  if (mins === 1) return '1 minuto';
  return `${mins} minutos`;
}

function randomSwing(price, volatility) {
  const u = Math.random() + Math.random() + Math.random() + Math.random() - 2;
  return price * (1 + u * volatility);
}

function tickAllPrices() {
  for (const key of Object.keys(METALS)) {
    const cfg = METALS[key];
    const current = state.prices[key];
    const next = randomSwing(current, cfg.volatility);

    const floor = cfg.basePrice * 0.70;
    const ceil  = cfg.basePrice * 1.40;
    state.prices[key] = Math.min(ceil, Math.max(floor, next));

    if (state.prices[key] < state.dayStats[key].low)  state.dayStats[key].low  = state.prices[key];
    if (state.prices[key] > state.dayStats[key].high) state.dayStats[key].high = state.prices[key];
  }
  renderPrice();
}

function minuteTick() {
  const now = new Date();

  for (const key of Object.keys(METALS)) {
    const prev    = state.prevMinutePrices[key];
    const current = state.prices[key];

    state.history.push({
      metal:     key,
      price:     current,
      prevPrice: prev,
      timestamp: now,
    });

    state.prevMinutePrices[key] = current;
  }

  const cutoff = Date.now() - 35 * 60 * 1000;
  state.history = state.history.filter(h => h.timestamp.getTime() > cutoff);

  renderPrice();

  if (dom.historyPanel.classList.contains('open')) {
    renderHistory();
  }
}

function renderPrice() {
  const metal  = state.currentMetal;
  const cfg    = METALS[metal];
  const price  = state.prices[metal];
  const prev   = state.prevMinutePrices[metal];
  const ideal  = cfg.idealBuy;
  const stats  = state.dayStats[metal];

  dom.metalLabel.textContent = cfg.name;
  dom.priceUnit.textContent  = cfg.unit;
  dom.currentPrice.classList.remove('price-flash');
  void dom.currentPrice.offsetWidth; 
  dom.currentPrice.classList.add('price-flash');
  dom.currentPrice.textContent = fmtPrice(price);
  dom.priceCard.className = `price-card ${cfg.theme}`;

  const pct = ((price - prev) / prev) * 100;

  if (Math.abs(pct) < 0.001) {
    dom.minuteBadge.className = 'minute-change-badge neutral';
    dom.minuteArrow.textContent = '→';
    dom.minutePct.textContent   = '0.00%';
  } else if (pct > 0) {
    dom.minuteBadge.className = 'minute-change-badge up';
    dom.minuteArrow.textContent = '↑';
    dom.minutePct.textContent   = fmtPct(pct);
  } else {
    dom.minuteBadge.className = 'minute-change-badge down';
    dom.minuteArrow.textContent = '↓';
    dom.minutePct.textContent   = fmtPct(pct);
  }


  const diffPct = ((price - ideal) / ideal) * 100;

  if (price <= ideal) {
    dom.buySignal.className     = 'buy-signal buy';
    dom.buySignalText.textContent = `✅ HORA DE COMPRAR! ${Math.abs(diffPct).toFixed(1)}% abaixo do preço ideal`;
  } else if (diffPct < 5) {
    dom.buySignal.className     = 'buy-signal watch';
    dom.buySignalText.textContent = `👀 Fique Atento — apenas ${diffPct.toFixed(1)}% acima do preço ideal`;
  } else {
    dom.buySignal.className     = 'buy-signal wait';
    dom.buySignalText.textContent = `⏳ Aguarde — ${diffPct.toFixed(1)}% acima do preço ideal`;
  }

  dom.idealPrice.textContent = `$${fmtPrice(ideal)}`;

  const gap    = price - ideal;
  const gapAbs = fmtPrice(Math.abs(gap));
  const gapDir = gap >= 0 ? 'acima' : 'abaixo';
  const gapSign = gap >= 0 ? '+' : '−';
  dom.priceGap.textContent = `${gapSign}$${gapAbs} ${gapDir}`;
  dom.priceGap.style.color = gap <= 0
    ? 'var(--green)'
    : diffPct < 5
    ? 'var(--amber)'
    : 'var(--red)';

  dom.expertNote.textContent = cfg.expertNote;

  dom.dayLow.textContent  = `$${fmtPrice(stats.low)}`;
  dom.dayHigh.textContent = `$${fmtPrice(stats.high)}`;
}

function renderUpdateTime() {
  const elapsed = Date.now() - state.lastUpdated.getTime();
  dom.updateTime.textContent = `Atualizado a ${fmtAgo(elapsed)}`;
}

function renderHistory() {
  const metal = state.currentMetal;
  const now   = Date.now();

  dom.historyMetalLabel.textContent = METALS[metal].name;

  const relevant = state.history
    .filter(h => h.metal === metal && (now - h.timestamp.getTime()) <= 30 * 60 * 1000)
    .slice()
    .reverse(); 

  if (relevant.length === 0) {
    dom.historyList.innerHTML = '<p class="history-empty">Nenhum dado nos últimos 30 minutos ainda.</p>';
    return;
  }

  dom.historyList.innerHTML = relevant.map((h, i) => {
    const pct        = ((h.price - h.prevPrice) / h.prevPrice) * 100;
    const minsAgo    = Math.max(1, Math.round((now - h.timestamp.getTime()) / 60000));
    const isUp       = pct >= 0;
    const dirClass   = isUp ? 'up' : 'down';
    const arrow      = isUp ? '↑' : '↓';
    const label      = isUp ? 'Subiu' : 'Caiu';
    const sign       = isUp ? '+' : '';
    const delay      = `animation-delay: ${i * 0.04}s`;

    return `<div class="history-item" style="${delay}">
      <span class="history-dir ${dirClass}">${arrow} ${label} ${sign}${Math.abs(pct).toFixed(2)}%</span>
      <span class="history-time">há ${minsAgo} min</span>
    </div>`;
  }).join('');
}

function handleManualUpdate() {
  state.lastUpdated = new Date();

  dom.updateBtn.classList.remove('spinning');
  void dom.updateBtn.offsetWidth;
  dom.updateBtn.classList.add('spinning');
  tickAllPrices();
  renderUpdateTime();
}

dom.metalBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const metal = btn.dataset.metal;
    if (metal === state.currentMetal) return;

    state.currentMetal = metal;

    dom.metalBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');

    renderPrice();

    if (dom.historyPanel.classList.contains('open')) {
      renderHistory();
    }
  });
});

dom.historyToggle.addEventListener('click', () => {
  const isOpen = dom.historyPanel.classList.contains('open');

  dom.historyPanel.classList.toggle('open');
  dom.historyToggle.classList.toggle('open');
  dom.historyPanel.setAttribute('aria-expanded', String(!isOpen));

  if (!isOpen) {
    renderHistory();
    dom.historyToggle.querySelector('.history-arrow') &&
      (dom.historyArrow.style.transform = 'rotate(180deg)');
  } else {
    dom.historyArrow.style.transform = '';
  }
});
dom.updateBtn.addEventListener('click', handleManualUpdate);
const PORTFOLIO_KEY = 'metalwatch_portfolio';

function loadPortfolio() {
  try {
    const raw = localStorage.getItem(PORTFOLIO_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) { /* ignorar */ }
  return {
    gold:    { units: 0, totalCost: 0 },
    coal:    { units: 0, totalCost: 0 },
    emerald: { units: 0, totalCost: 0 },
  };
}

function savePortfolio() {
  try {
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio));
  } catch (_) { /* ignorar */ }
}

const portfolio = loadPortfolio();
const goalsBtn     = $('goalsBtn');
const goalsOverlay = $('goalsOverlay');
const goalsClose   = $('goalsClose');
const modalToast   = $('modalToast');

let toastTimer = null;

function showToast(msg, type = 'info') {
  clearTimeout(toastTimer);
  modalToast.textContent = msg;
  modalToast.className   = `modal-toast show ${type}`;
  toastTimer = setTimeout(() => {
    modalToast.className = 'modal-toast';
  }, 4000);
}

const metalKey = { gold: 'Gold', coal: 'Coal', emerald: 'Emerald' };

function renderPortfolio() {
  for (const key of Object.keys(METALS)) {
    const cap      = metalKey[key];
    const pos      = portfolio[key];
    const price    = state.prices[key];
    const units    = pos.units;
    const avg      = units > 0 ? pos.totalCost / units : 0;
    const currVal  = price * units;
    const pnl      = currVal - pos.totalCost;

    $(`pcPrice${cap}`).textContent = `$${fmtPrice(price)}/un.`;
    $(`pcUnits${cap}`).textContent = units;
    $(`pcAvg${cap}`).textContent = units > 0 ? `$${fmtPrice(avg)}` : '—';
    const resultEl = $(`pcResult${cap}`);
    if (units === 0) {
      resultEl.textContent = '—';
      resultEl.className   = 'pc-stat-value';
    } else {
      const sign = pnl >= 0 ? '+' : '−';
      resultEl.textContent = `${sign}$${fmtPrice(Math.abs(pnl))}`;
      resultEl.className   = `pc-stat-value ${pnl >= 0 ? 'profit' : 'loss'}`;
    }
    const sellBtn = document.querySelector(`.pc-sell-btn[data-metal="${key}"]`);
    if (sellBtn) sellBtn.disabled = units === 0;
  }
}

function handleBuy(metal) {
  const price = state.prices[metal];
  portfolio[metal].units     += 1;
  portfolio[metal].totalCost += price;

  const cfg = METALS[metal];
  showToast(`✅ Comprou 1 ${cfg.name} por $${fmtPrice(price)}`, 'info');
  renderPortfolio();
}

function handleSell(metal) {
  const pos   = portfolio[metal];
  if (pos.units === 0) return;

  const price    = state.prices[metal];
  const cfg      = METALS[metal];
  const currVal  = price * pos.units;
  const pnl      = currVal - pos.totalCost;
  const sign     = pnl >= 0 ? '+' : '−';
  const type     = pnl >= 0 ? 'profit' : 'loss';
  const word     = pnl >= 0 ? 'Lucro' : 'Prejuízo';

  const msg = `${pnl >= 0 ? '📈' : '📉'} Vendeu ${pos.units} ${cfg.name} — ${word}: ${sign}$${fmtPrice(Math.abs(pnl))}`;

  portfolio[metal].units     = 0;
  portfolio[metal].totalCost = 0;

  showToast(msg, type);
  renderPortfolio();
}

document.querySelectorAll('.pc-buy-btn').forEach(btn => {
  btn.addEventListener('click', () => handleBuy(btn.dataset.metal));
});

document.querySelectorAll('.pc-sell-btn').forEach(btn => {
  btn.addEventListener('click', () => handleSell(btn.dataset.metal));
});

function openGoals() {
  renderPortfolio();
  goalsOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeGoals() {
  goalsOverlay.classList.remove('open');
  document.body.style.overflow = '';
  savePortfolio();
}

goalsBtn.addEventListener('click', openGoals);
goalsClose.addEventListener('click', closeGoals);

goalsOverlay.addEventListener('click', (e) => {
  if (e.target === goalsOverlay) closeGoals();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && goalsOverlay.classList.contains('open')) closeGoals();
});

setInterval(() => {
  if (goalsOverlay.classList.contains('open')) renderPortfolio();
}, 3000);
(function seedHistory() {
  const now = Date.now();

  for (const key of Object.keys(METALS)) {
    const cfg = METALS[key];
    let runningPrice = cfg.basePrice;

    for (let i = 10; i >= 1; i--) {
      const prevPrice = runningPrice;
      runningPrice = randomSwing(runningPrice, cfg.volatility * 60);
      runningPrice = Math.min(cfg.basePrice * 1.4, Math.max(cfg.basePrice * 0.7, runningPrice));

      state.history.push({
        metal:     key,
        price:     runningPrice,
        prevPrice: prevPrice,
        timestamp: new Date(now - i * 60 * 1000),
      });
    }
    state.prices[key]            = runningPrice;
    state.prevMinutePrices[key]  = runningPrice;
  }
})();
setInterval(tickAllPrices, 3000);

setInterval(minuteTick, 60000);

setInterval(renderUpdateTime, 30000);
renderPrice();
renderUpdateTime();
