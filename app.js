// SkyAI - Flight Price Comparison Platform
// Prototype Data & Logic

const FLIGHTS = [
  { id:1, airline:'IndiGo', code:'6E-201', icon:'🟦', color:'#1e40af', dep:'06:00', arr:'08:05', duration:'2h 05m', stops:'Direct', price:3450, bag:'15kg', seat:'Middle', aiScore:94, trend:'down', trendPct:12, tag:'Best Value' },
  { id:2, airline:'Air India', code:'AI-101', icon:'🔴', color:'#b91c1c', dep:'08:30', arr:'10:45', duration:'2h 15m', stops:'Direct', price:4200, bag:'25kg', seat:'Aisle', aiScore:88, trend:'up', trendPct:5, tag:'Full Service' },
  { id:3, airline:'SpiceJet', code:'SG-102', icon:'🟠', color:'#c2410c', dep:'11:15', arr:'13:30', duration:'2h 15m', stops:'Direct', price:3750, bag:'15kg', seat:'Window', aiScore:85, trend:'stable', trendPct:0, tag:'' },
  { id:4, airline:'Vistara', code:'UK-801', icon:'🟣', color:'#7e22ce', dep:'14:00', arr:'16:20', duration:'2h 20m', stops:'Direct', price:5100, bag:'20kg', seat:'Aisle', aiScore:91, trend:'up', trendPct:8, tag:'Premium' },
  { id:5, airline:'Go First', code:'G8-301', icon:'🟢', color:'#15803d', dep:'17:30', arr:'19:55', duration:'2h 25m', stops:'Direct', price:3650, bag:'15kg', seat:'Any', aiScore:79, trend:'down', trendPct:3, tag:'' },
  { id:6, airline:'AirAsia', code:'I5-401', icon:'🔴', color:'#dc2626', dep:'05:15', arr:'08:45', duration:'3h 30m', stops:'1 Stop', price:2980, bag:'15kg', seat:'Middle', aiScore:72, trend:'down', trendPct:9, tag:'Lowest Price' },
];

let currentSort = 'price';

function getSortedFlights(mode) {
  const copy = [...FLIGHTS];
  if (mode === 'price') copy.sort((a,b) => a.price - b.price);
  if (mode === 'duration') copy.sort((a,b) => a.duration.localeCompare(b.duration));
  if (mode === 'ai') copy.sort((a,b) => b.aiScore - a.aiScore);
  return copy;
}

function renderFlights(flights) {
  const grid = document.getElementById('flight-grid');
  grid.innerHTML = '';
  flights.forEach((f, i) => {
    const isBest = i === 0 && currentSort === 'price';
    const isAI = i === 0 && currentSort === 'ai';
    const trendIcon = f.trend === 'down' ? '↓' : f.trend === 'up' ? '↑' : '→';
    const trendClass = f.trend === 'down' ? 'trend-down' : f.trend === 'up' ? 'trend-up' : '';
    grid.innerHTML += `
      <div class="flight-card ${isBest ? 'best' : ''}" onclick="this.style.background='#f0f9ff'">
        ${isBest ? '<span class="best-badge">✓ Best Price</span>' : ''}
        ${isAI ? '<span class="ai-badge">🤖 AI Pick</span>' : ''}
        <div class="airline">
          <div class="airline-icon" style="background:${f.color}22;">${f.icon}</div>
          <div>
            <div class="airline-name">${f.airline}</div>
            <div class="airline-code">${f.code}</div>
            ${f.tag ? `<span class="tag">${f.tag}</span>` : ''}
          </div>
        </div>
        <div class="route">
          <div class="times">
            <span class="time">${f.dep}</span>
            <div class="route-line"></div>
            <span class="time">${f.arr}</span>
          </div>
          <div class="duration">${f.duration}</div>
          <div class="stops">${f.stops}</div>
        </div>
        <div class="details">
          <span>🎒 ${f.bag}</span>
          <span>💺 ${f.seat}</span>
          <span>🤖 AI: ${f.aiScore}/100</span>
        </div>
        <div class="price-col">
          <div class="price">₹${f.price.toLocaleString()}</div>
          <div class="price-trend ${trendClass}">${trendIcon} ${f.trendPct > 0 ? f.trendPct + '% vs last week' : 'Stable'}</div>
          <a class="btn-book" href="tracker.html?flight=${f.code}">Book Now</a>
        </div>
      </div>`;
  });
}

function sortBy(mode, btn) {
  currentSort = mode;
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderFlights(getSortedFlights(mode));
}

function searchFlights() {
  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;
  if (!from || !to) return alert('Please enter origin and destination');

  const loading = document.getElementById('loading');
  const results = document.getElementById('results-section');
  loading.classList.add('show');
  results.classList.remove('show');

  setTimeout(() => {
    loading.classList.remove('show');
    results.classList.add('show');
    renderFlights(getSortedFlights('price'));
    renderChart();
    document.getElementById('results-section').scrollIntoView({ behavior:'smooth', block:'start' });
  }, 1600);
}

function renderChart() {
  const ctx = document.getElementById('priceChart');
  if (!ctx) return;
  if (window._chartInstance) window._chartInstance.destroy();

  const labels = [];
  const prices = [];
  const base = 4800;
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString('en-IN', { day:'numeric', month:'short' }));
    prices.push(Math.round(base + Math.sin(i*0.4)*600 + Math.random()*400 - 200));
  }
  // Spike upcoming
  const future = [prices[29]*1.05, prices[29]*1.12, prices[29]*1.18, prices[29]*1.22, prices[29]*1.26];
  const allLabels = [...labels];
  const allPrices = [...prices];
  for (let j = 1; j <= 5; j++) {
    const d = new Date(); d.setDate(d.getDate() + j);
    allLabels.push(d.toLocaleDateString('en-IN', { day:'numeric', month:'short' }) + ' (pred)');
    allPrices.push(Math.round(future[j-1]));
  }

  window._chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: allLabels,
      datasets: [{
        label: 'Avg Price (₹)',
        data: allPrices,
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14,165,233,.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        borderWidth: 2,
        segment: {
          borderColor: ctx => ctx.p0DataIndex >= 29 ? '#f97316' : '#0ea5e9',
          borderDash: ctx => ctx.p0DataIndex >= 29 ? [5,4] : [],
        }
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => '₹' + ctx.parsed.y.toLocaleString() }
        }
      },
      scales: {
        y: { ticks: { callback: v => '₹'+v.toLocaleString() }, grid: { color: '#f1f5f9' } },
        x: { ticks: { maxTicksLimit: 8 }, grid: { display: false } }
      }
    }
  });
}

// Auto-search on load for demo
window.addEventListener('load', () => {
  // slight delay to feel natural
  setTimeout(() => searchFlights(), 400);
});
