/* =====================================================================
   LB CAPITAL CAMPAIGN 2026 — DASHBOARD DATA
   ---------------------------------------------------------------------
   ⬇⬇⬇  EDIT THE NUMBERS IN THIS BLOCK TO UPDATE THE DASHBOARD  ⬇⬇⬇
   - All dollar amounts are plain numbers (no $ or commas).
   - "raised" per project = how much has been raised toward that project.
     (These per-project splits are PLACEHOLDERS — replace with real
      figures. They currently add up to the overall "raised" total.)
   ===================================================================== */
const CAMPAIGN = {
  goal: 500000,        // overall campaign goal
  raised: 185000,      // overall raised so far  (PLACEHOLDER)
  donorTotal: 189,     // total number of donors
  eagleFoundation: 75000, // EAGLE Foundation commitments + cash

  // The six 2026 projects: target = full cost, raised = funded so far
  projects: [
    { name: "Stadium LED Lighting",            target: 250000, raised: 90000, flagship: true },
    { name: "Weight Room Equipment & Expansion", target: 100000, raised: 25000 },
    { name: "Field House Batting Cage",        target: 50000,  raised: 25000 },
    { name: "Outdoor Batting Cage",            target: 50000,  raised: 20000 },
    { name: "EAGLE Foundation Donation",       target: 50000,  raised: 10000 },
    { name: "Stadium Sound Upgrade",           target: 40000,  raised: 15000 }
  ],

  // Donor giving levels (counts). Colors are brand-accessible & labeled.
  tiers: [
    { name: "Cornerstone",              count: 6,  color: "#0a1c40" },
    { name: "Legacy",                   count: 23, color: "#102c63" },
    { name: "Foundational",             count: 61, color: "#1b4799" },
    { name: "Friends of the Fieldhouse",count: 82, color: "#4f79c7" },
    { name: "Corporate Donors",         count: 17, color: "#c7202f" }
  ]
};
/* =====================  END EDITABLE DATA  ===========================  */


// ---------- helpers ----------
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt$ = (n) => '$' + Math.round(n).toLocaleString('en-US');
const fmtK = (n) => n >= 1000 ? '$' + Math.round(n / 1000) + 'K' : '$' + n;

function countUp(el, target, render, dur = 1300) {
  if (reduceMotion) { el.textContent = render(target); return; }
  el.textContent = render(0);
  const start = performance.now();
  let done = false;
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = render(target * eased);
    if (p < 1) requestAnimationFrame(tick); else done = true;
  }
  requestAnimationFrame(tick);
  // Guarantee the final value even if rAF is throttled (background/hidden tab)
  setTimeout(() => { if (!done) el.textContent = render(target); }, dur + 250);
}

// CSS-transition kicker that runs regardless of tab visibility
function transitionTo(fn) { setTimeout(fn, 70); }

// ---------- KPIs ----------
const pctToGoal = Math.min(Math.round((CAMPAIGN.raised / CAMPAIGN.goal) * 100), 100);

function fillKpis() {
  countUp(document.getElementById('kpiRaised'), CAMPAIGN.raised, (v) => fmt$(v));
  countUp(document.getElementById('kpiPct'), pctToGoal, (v) => Math.round(v) + '%');
  countUp(document.getElementById('kpiDonors'), CAMPAIGN.donorTotal, (v) => Math.round(v).toString());
  countUp(document.getElementById('kpiEagle'), CAMPAIGN.eagleFoundation, (v) => fmtK(v) + '+');
  document.getElementById('kpiRaisedFoot').textContent = 'of ' + fmt$(CAMPAIGN.goal) + ' goal';
  document.getElementById('kpiPctFoot').textContent = fmt$(CAMPAIGN.goal - CAMPAIGN.raised) + ' to go';
}

// ---------- Overall gauge (SVG ring) ----------
function renderGauge() {
  const fill = document.getElementById('gaugeFill');
  const C = parseFloat(fill.getAttribute('data-circ'));
  const offset = C * (1 - pctToGoal / 100);
  // set starting state then animate
  fill.style.strokeDashoffset = reduceMotion ? offset : C;
  document.getElementById('gaugeRaised').textContent = fmt$(CAMPAIGN.raised);
  document.getElementById('gaugeRemaining').textContent = fmt$(CAMPAIGN.goal - CAMPAIGN.raised);
  const pctEl = document.getElementById('gaugePct');
  // trigger (transitions when visible, jumps to final when hidden)
  transitionTo(() => { fill.style.strokeDashoffset = offset; });
  countUp(pctEl, pctToGoal, (v) => Math.round(v) + '%');
}

// ---------- Project bars ----------
function renderProjects() {
  const list = document.getElementById('projList');
  let rows = '';
  CAMPAIGN.projects.forEach((p, i) => {
    const pct = Math.min(Math.round((p.raised / p.target) * 100), 100);
    const outside = pct < 14; // show % outside the bar if too narrow
    rows += `
      <div class="proj-row">
        <div class="proj-top">
          <span class="proj-name">${p.name}${p.flagship ? '<span class="proj-flag">Priority</span>' : ''}</span>
          <span class="proj-figs tnum"><b>${fmt$(p.raised)}</b> of ${fmt$(p.target)}</span>
        </div>
        <div class="proj-track" role="img" aria-label="${p.name}: ${fmt$(p.raised)} raised of ${fmt$(p.target)}, ${pct} percent funded">
          <div class="proj-fill ${p.flagship ? 'flagship' : ''}" data-pct="${pct}">
            ${outside ? '' : `<span class="proj-pct tnum">${pct}%</span>`}
          </div>
          ${outside ? `<span class="proj-pct outside tnum" style="position:absolute;left:0;top:0;height:100%;display:flex;align-items:center;padding-left:calc(${pct}% + 6px);">${pct}%</span>` : ''}
        </div>
      </div>`;
  });
  list.innerHTML = rows;

  // animate fills (guaranteed via setTimeout even in hidden tabs)
  transitionTo(() => {
    list.querySelectorAll('.proj-fill').forEach((el) => {
      el.style.width = el.getAttribute('data-pct') + '%';
    });
  });
}

// ---------- Donor donut (SVG segments) ----------
function renderDonut() {
  const total = CAMPAIGN.tiers.reduce((s, t) => s + t.count, 0);
  const svg = document.getElementById('donutSvg');
  const r = 70, cx = 94, cy = 94;
  const C = 2 * Math.PI * r;
  let acc = 0;
  const ns = 'http://www.w3.org/2000/svg';

  CAMPAIGN.tiers.forEach((t) => {
    const frac = t.count / total;
    const circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('class', 'donut-seg');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('stroke', t.color);
    const len = frac * C;
    // small gap between segments for clarity
    const gap = total > 1 ? 2 : 0;
    circle.setAttribute('stroke-dasharray', reduceMotion ? `${Math.max(len - gap, 0)} ${C - Math.max(len - gap, 0)}` : `0 ${C}`);
    circle.setAttribute('stroke-dashoffset', `${-acc * C}`);
    circle.dataset.len = Math.max(len - gap, 0);
    circle.dataset.circ = C;
    svg.appendChild(circle);
    acc += frac;
  });

  // animate segments in (guaranteed via setTimeout even in hidden tabs)
  if (!reduceMotion) {
    transitionTo(() => {
      svg.querySelectorAll('.donut-seg').forEach((el) => {
        const len = el.dataset.len, c = el.dataset.circ;
        el.setAttribute('stroke-dasharray', `${len} ${c - len}`);
      });
    });
  }

  // center + legend
  countUp(document.getElementById('donutNum'), total, (v) => Math.round(v).toString());
  const legend = document.getElementById('donutLegend');
  legend.innerHTML = CAMPAIGN.tiers.map((t) => {
    const pct = Math.round((t.count / total) * 100);
    return `<li>
      <span class="dl-swatch" style="background:${t.color}"></span>
      <span class="dl-name">${t.name}</span>
      <span class="dl-count tnum">${t.count}</span>
      <span class="dl-pct tnum">${pct}%</span>
    </li>`;
  }).join('');
}

// ---------- Scroll reveal ----------
function setupReveal() {
  const els = document.querySelectorAll('.reveal');
  if (reduceMotion) { els.forEach((e) => e.classList.add('in')); return; }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach((e) => obs.observe(e));
}

// ---------- init ----------
document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());
fillKpis();
renderGauge();
renderProjects();
renderDonut();
setupReveal();
