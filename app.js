/* Pocket — personal money tracker. All data stays on this phone (localStorage). */
(function () {
'use strict';

/* =========================================================
   Constants
   ========================================================= */
const KEY = 'pocket.v1';
const WALLS = [
  { name: 'Ocean', base: '#07122B', a: '#1E8C93', b: '#5B4BC4', c: '#2A5BD7' },
  { name: 'Sunset', base: '#1E0E24', a: '#C2536B', b: '#E58F5B', c: '#6B3FA0' },
  { name: 'Forest', base: '#06180F', a: '#1F7A4D', b: '#8BB34A', c: '#1D5E6E' },
  { name: 'Aurora', base: '#050B1A', a: '#2BD9A0', b: '#6A5CFF', c: '#1B8FD1' },
  { name: 'Lavender', base: '#17112A', a: '#9B7BEA', b: '#E7A6D6', c: '#5A6FD8' },
  { name: 'Desert', base: '#1F130A', a: '#D98A4E', b: '#B5543A', c: '#E8C27A' },
  { name: 'Midnight', base: '#04060F', a: '#23305E', b: '#3B2C6B', c: '#12335A' },
  { name: 'Rose', base: '#220A14', a: '#E06A8C', b: '#A33A6B', c: '#F2A38B' },
  { name: 'Mint', base: '#071A18', a: '#4FD1B5', b: '#9BE7C4', c: '#2C8C99' },
  { name: 'Galaxy', base: '#090414', a: '#7A2EB8', b: '#2E3FB8', c: '#C24FA8' },
  { name: 'Lagoon', base: '#031A22', a: '#00A7B5', b: '#3FD6C8', c: '#0F5E8C' },
  { name: 'Ember', base: '#1A0805', a: '#E2552E', b: '#F29B38', c: '#8A2416' }
];
const CATS = [
  { id: 'grocery', name: 'Grocery', short: 'Grocery', color: '#C7F5A8', dark: '#1F7A3A' },
  { id: 'food', name: 'Outside food', short: 'Food out', color: '#FFD1A8', dark: '#A8530E' },
  { id: 'travel', name: 'Travel', short: 'Travel', color: '#A8EEFF', dark: '#0A6F85' },
  { id: 'rent', name: 'Rent', short: 'Rent', color: '#D8C7FF', dark: '#5B3DB0' },
  { id: 'bills', name: 'Bills', short: 'Bills', color: '#FFE58A', dark: '#8A6A00' },
  { id: 'clothes', name: 'Clothes', short: 'Clothes', color: '#FFB8CF', dark: '#B0275A' },
  { id: 'other', name: 'Other', short: 'Other', color: '#E5E5EA', dark: '#55555B' }
];
const BILL_TYPES = ['Utilities', 'Phone', 'Internet', 'Other bill'];
const TILES = {
  left: 'Money left', fund: 'Grocery Fund', utilities: 'Utilities', rent: 'Rent',
  cats: 'Categories', recent: 'Recent purchases', goal: 'Savings goal', owed: 'Owed to me', afford: 'Can I afford it?'
};
const DEFAULT_TILES = ['left', 'fund', 'utilities', 'cats', 'recent', 'rent', 'goal', 'owed', 'afford'];
const DEFAULT_HIDDEN = ['rent', 'goal', 'owed', 'afford'];
const CHALLENGES = {
  nospend5: { name: '5 no-spend days this month', goal: 5 },
  food80: { name: 'Outside food under $80 this month', goal: 80, limit: true, cat: 'food' },
  travel40: { name: 'Travel under $40 this month', goal: 40, limit: true, cat: 'travel' },
  log7: { name: 'Log something 7 days in a row', goal: 7 },
  nofood7: { name: '7 days in a row without outside food', goal: 7 }
};

/* icons (24x24 stroke paths) */
const I = {
  grocery: 'M3 4h2l2.4 11h11l2-8H6.2M8 20h.01M17 20h.01',
  food: 'M7 3v8a2 2 0 0 0 4 0V3M9 13v8M17 21V3c-2.5 1.5-3 5-3 8h3',
  travel: 'M4 8h16v12H4zM9 8V5h6v3M4 13h16',
  rent: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  bills: 'M13 2 4 14h7l-1 8 9-12h-7z',
  clothes: 'M8 3 3 6l2 4 2-1v12h10V9l2 1 2-4-5-3a4 4 0 0 1-8 0z',
  other: 'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10',
  home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  cal: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  plus: 'M12 5v14M5 12h14',
  report: 'M4 20V10M10 20V4M16 20v-8M21 20H3',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M10 17h4',
  gear: 'M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6zM12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 .01 0',
  eyeOff: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM3 3l18 18',
  close: 'M6 6l12 12M18 6 6 18',
  back: 'M15 6l-6 6 6 6',
  next: 'M9 6l6 6-6 6',
  check: 'M5 12l5 5 9-10',
  clock: 'M12 3a9 9 0 1 0 .01 0M12 7v5l3 2',
  trend: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  flame: 'M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 2 1.5 3 2.5 3-1-3 .5-6 .5-8.5z',
  image: 'M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M16 8h.01',
  sun: 'M12 8a4 4 0 1 0 .01 0M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z',
  pen: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4z',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  up: 'M12 19V5M5 12l7-7 7 7',
  down: 'M12 5v14M19 12l-7 7-7-7',
  smile: 'M12 3a9 9 0 1 0 .01 0M8.5 14a4 4 0 0 0 7 0M9 9.5h.01M15 9.5h.01',
  frown: 'M12 3a9 9 0 1 0 .01 0M8.5 16a4 4 0 0 1 7 0M9 9.5h.01M15 9.5h.01',
  medal: 'M8 3h8l-2 6h-4zM12 9a6 6 0 1 0 .01 0M12 12v3',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
  lock: 'M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4',
  cloud: 'M7 18a5 5 0 0 1-.6-9.96A6 6 0 0 1 18 9a4 4 0 0 1 0 9M12 12v8M9 15l3-3 3 3',
  question: 'M12 3a9 9 0 1 0 .01 0M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7M12 17h.01',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  arrowIn: 'M12 4v12M6 10l6 6 6-6M4 20h16',
  refund: 'M4 12a8 8 0 1 0 3-6.2M4 4v4h4',
  user: 'M12 4a4 4 0 1 0 .01 0M4 21a8 8 0 0 1 16 0',
  note: 'M5 3h10l4 4v14H5zM14 3v5h5M8 13h8M8 17h6',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z'
};
const svg = (n, w) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w || 2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${I[n] || n}"/></svg>`;

/* =========================================================
   State
   ========================================================= */
function todayStr() { const d = new Date(); return ymd(d); }
function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function ymOf(s) { return s.slice(0, 7); }
function addMonths(ym, k) { let [y, m] = ym.split('-').map(Number); m += k; while (m > 12) { m -= 12; y++; } while (m < 1) { m += 12; y--; } return y + '-' + String(m).padStart(2, '0'); }
function daysIn(ym) { const [y, m] = ym.split('-').map(Number); return new Date(y, m, 0).getDate(); }
function monthName(ym, short) { const [y, m] = ym.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleString('en-US', { month: short ? 'short' : 'long' }); }
function monthYear(ym) { return monthName(ym) + ' ' + ym.slice(0, 4); }
function dateNice(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function r2(n) { return Math.round(n * 100) / 100; }
function money(n, cents) {
  const neg = n < 0; n = Math.abs(n);
  const s = (cents === false || (cents !== true && Number.isInteger(r2(n)))) ? Math.round(n).toLocaleString('en-US') : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (neg ? '−$' : '$') + s;
}
const $m = (n, c) => `<span class="amt">${money(n, c)}</span>`;

function defaults() {
  return {
    v: 1, setup: false,
    settings: {
      name: '', rent: 538, utilEstimate: 60, startMonth: '2026-12', wall: 0, live: true, react: true,
      theme: 'dark', sounds: true, haptics: true, pin: '', hide: false,
      tiles: DEFAULT_TILES.slice(), hidden: DEFAULT_HIDDEN.slice()
    },
    tx: [], owed: [], notes: {},
    goal: { name: 'Trip home', target: 300, saved: 0, moves: [] },
    challenges: ['nospend5', 'food80', 'log7'],
    flags: {}, seen: { month: '' }, lastBackup: null
  };
}
let S;
function load() {
  try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
  const d = defaults();
  if (!S || typeof S !== 'object') { S = d; return; }
  S.settings = Object.assign(d.settings, S.settings || {});
  for (const k of Object.keys(d)) if (S[k] === undefined) S[k] = d[k];
  for (const t of DEFAULT_TILES) if (!S.settings.tiles.includes(t)) S.settings.tiles.push(t);
  S.goal = Object.assign(d.goal, S.goal || {});
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast('Could not save — your phone storage may be full.'); }
}

/* =========================================================
   Money math
   ========================================================= */
const today = () => todayStr();
function curYM() { const t = ymOf(today()); return t < S.settings.startMonth ? S.settings.startMonth : t; }
function started() { return ymOf(today()) >= S.settings.startMonth; }
function txIn(ym) { return S.tx.filter(t => ymOf(t.date) === ym); }
function isUtil(t) { return t.cat === 'bills' && (t.bill || 'Utilities') === 'Utilities'; }
function sign(t) { return t.type === 'refund' ? -1 : 1; }

const memo = new Map();
function invalidate() { memo.clear(); }

function month(ym) {
  if (memo.has(ym)) return memo.get(ym);
  const start = S.settings.startMonth;
  let prev = null;
  if (ym > start) prev = month(addMonths(ym, -1));
  const list = ym >= start ? txIn(ym) : [];
  const byCat = {}; CATS.forEach(c => byCat[c.id] = 0);
  let received = 0;
  for (const t of list) {
    if (t.type === 'in') received += t.amount;
    else byCat[t.cat] = (byCat[t.cat] || 0) + sign(t) * t.amount;
  }
  const total = CATS.reduce((a, c) => a + byCat[c.id], 0);
  const grocery = Math.max(0, byCat.grocery);
  const fundStart = prev ? prev.fundEnd : 0;
  const goalMoves = S.goal.moves.filter(m => ymOf(m.date) === ym).reduce((a, m) => a + m.amount, 0);
  const fundAvail = Math.max(0, fundStart - goalMoves);
  const groceryFromFund = Math.min(grocery, fundAvail);
  const fundNow = fundAvail - groceryFromFund;
  const spentFromMoney = total - groceryFromFund;
  const debtIn = prev ? prev.debtOut : 0;
  const net = received - spentFromMoney - debtIn;
  const nowYM = ymOf(today());
  const complete = ym < nowYM;
  const rentPaid = list.some(t => t.cat === 'rent' && t.type === 'spent');
  const utilList = list.filter(t => isUtil(t) && t.type === 'spent');
  const utilPaid = utilList.length > 0;
  const utilTotal = utilList.reduce((a, t) => a + t.amount, 0);
  const est = utilEstimate(ym);
  const kept = (complete || received <= 0) ? 0 : (rentPaid ? 0 : S.settings.rent) + (utilPaid ? 0 : est);
  const left = net - kept;
  const leftover = net;
  const fundEnd = complete ? fundNow + Math.max(0, leftover) : fundNow;
  const debtOut = complete && leftover < 0 ? -leftover : 0;
  const discretionary = byCat.grocery + byCat.food + byCat.travel + byCat.clothes + byCat.other;
  const res = { ym, list, byCat, total, received, grocery, fundStart, goalMoves, groceryFromFund, fundNow, fundEnd, spentFromMoney, debtIn, debtOut, net, left, kept, leftover, complete, rentPaid, utilPaid, utilTotal, est, discretionary };
  memo.set(ym, res);
  return res;
}
function completedMonths() {
  const out = []; let m = S.settings.startMonth; const now = ymOf(today());
  while (m < now) { out.push(m); m = addMonths(m, 1); }
  return out;
}
function utilHistory() {
  const out = []; let m = S.settings.startMonth; const now = curYM();
  while (m <= now) {
    const t = S.tx.filter(x => ymOf(x.date) === m && isUtil(x) && x.type === 'spent');
    if (t.length) out.push({ ym: m, amount: t.reduce((a, x) => a + x.amount, 0), day: Math.round(t.reduce((a, x) => a + Number(x.date.slice(8)), 0) / t.length) });
    m = addMonths(m, 1);
  }
  return out;
}
function utilEstimate(ym) {
  const h = utilHistory().filter(x => x.ym < ym).slice(-3);
  return h.length ? r2(h.reduce((a, x) => a + x.amount, 0) / h.length) : S.settings.utilEstimate;
}
function utilUsualDay() { const h = utilHistory(); return h.length ? Math.round(h.reduce((a, x) => a + x.day, 0) / h.length) : null; }
function dayStats(ym) {
  const n = daysIn(ym); const days = Array.from({ length: n }, () => ({ spent: 0, disc: 0, food: 0, logged: false, items: [] }));
  for (const t of txIn(ym)) {
    if (ym < S.settings.startMonth) break;
    const d = days[Number(t.date.slice(8)) - 1]; if (!d) continue;
    d.items.push(t); d.logged = true;
    if (t.type !== 'in') {
      const v = sign(t) * t.amount; d.spent += v;
      if (t.cat !== 'rent' && t.cat !== 'bills') d.disc += v;
      if (t.cat === 'food') d.food += v;
    }
  }
  return days;
}
function info() {
  const ym = curYM(); const M = month(ym);
  const n = daysIn(ym);
  const t = today();
  const dayNum = ymOf(t) === ym ? Number(t.slice(8)) : 1;
  const daysLeft = n - dayNum + 1;
  const perDay = M.left > 0 ? M.left / daysLeft : 0;
  const spentPct = M.received > 0 ? Math.min(100, (M.spentFromMoney + M.debtIn) / M.received * 100) : 0;
  const elapsed = dayNum;
  let forecast = null;
  if (started() && elapsed >= 3 && M.received > 0) {
    const rate = Math.max(0, M.discretionary - M.groceryFromFund) / elapsed;
    forecast = M.left - rate * (daysLeft - 1);
  }
  const budgetDaily = M.received > 0 ? Math.max(0, (M.received - S.settings.rent - M.est)) / n : 0;
  const discSoFar = Math.max(0, M.discretionary);
  const expected = budgetDaily * elapsed;
  const pace = expected > 0 ? discSoFar / expected : 0;
  return { ym, M, n, dayNum, daysLeft, perDay, spentPct, forecast, pace, budgetDaily };
}
function nextPlan(fromYM) {
  const done = completedMonths().filter(m => m <= fromYM).slice(-3);
  const src = done.length ? done.map(month) : [month(fromYM)];
  const avg = f => src.reduce((a, m) => a + f(m), 0) / src.length;
  const other = Math.max(0, avg(m => m.byCat.food + m.byCat.travel + m.byCat.clothes + m.byCat.other + Math.max(0, m.byCat.bills - m.utilTotal)));
  const groc = Math.max(0, avg(m => m.byCat.grocery));
  const cur = month(fromYM);
  const fundNext = cur.complete ? cur.fundEnd : cur.fundNow + Math.max(0, cur.left);
  const util = utilEstimate(addMonths(fromYM, 1));
  const groceryNeed = Math.max(0, groc - fundNext);
  const debt = cur.complete ? cur.debtOut : 0;
  const ask = Math.ceil(S.settings.rent + util + other + groceryNeed + debt);
  return { rent: S.settings.rent, util, other, groc, fundNext, groceryNeed, debt, ask, fundAfter: Math.max(0, fundNext - groc) };
}
function streak() {
  let count = 0; let d = new Date();
  const startDate = S.settings.startMonth + '-01';
  for (let i = 0; i < 400; i++) {
    const s = ymd(d); if (s < startDate) break;
    const ym = ymOf(s); const M = month(ym);
    if (M.received <= 0) { if (i === 0) { d.setDate(d.getDate() - 1); continue; } break; }
    const n = daysIn(ym); const budget = Math.max(0, M.received - S.settings.rent - M.est) / n;
    const ds = dayStats(ym)[Number(s.slice(8)) - 1];
    if (ds.disc <= budget + 0.001) count++; else { if (i === 0) { d.setDate(d.getDate() - 1); continue; } break; }
    d.setDate(d.getDate() - 1);
  }
  return count;
}
function logStreak() {
  let c = 0; const d = new Date(); const startDate = S.settings.startMonth + '-01';
  const logged = new Set(S.tx.map(t => t.date));
  if (!logged.has(ymd(d))) d.setDate(d.getDate() - 1);
  while (ymd(d) >= startDate && logged.has(ymd(d))) { c++; d.setDate(d.getDate() - 1); }
  return c;
}
function noFoodStreak() {
  let c = 0; const d = new Date(); const startDate = S.settings.startMonth + '-01';
  for (let i = 0; i < 60; i++) {
    const s = ymd(d); if (s < startDate) break;
    const food = S.tx.filter(t => t.date === s && t.cat === 'food' && t.type === 'spent').length;
    if (food) break; c++; d.setDate(d.getDate() - 1);
  }
  return started() ? c : 0;
}
function noSpendDays(ym) {
  if (ym < S.settings.startMonth) return 0;
  const ds = dayStats(ym); const t = today(); let c = 0;
  ds.forEach((d, i) => { const s = ym + '-' + String(i + 1).padStart(2, '0'); if (s <= t && d.disc <= 0 && !d.items.some(x => x.type === 'spent' && x.cat !== 'rent' && x.cat !== 'bills')) c++; });
  return c;
}
function regret(ym) { return txIn(ym).filter(t => t.mood === 'regret' && t.type === 'spent').reduce((a, t) => a + t.amount, 0); }

/* =========================================================
   Badges
   ========================================================= */
function badgeList() {
  const done = completedMonths().map(month);
  let askLess = 0, best = 0;
  for (let i = 1; i < done.length; i++) { if (done[i].received > 0 && done[i].received < done[i - 1].received) { askLess++; best = Math.max(best, askLess); } else askLess = 0; }
  const maxNoSpend = Math.max(0, ...[...completedMonths(), curYM()].map(noSpendDays));
  return [
    { id: 'first', name: 'First step', icon: 'sparkle', on: S.tx.length > 0 },
    { id: 'month', name: 'First full month', icon: 'cal', on: done.length >= 1 },
    { id: 'streak7', name: '7-day streak', icon: 'flame', on: (S.flags.bestStreak || 0) >= 7 },
    { id: 'nospend5', name: '5 no-spend days', icon: 'star', on: maxNoSpend >= 5 },
    { id: 'saver', name: 'Saved $100 in a month', icon: 'medal', on: done.some(m => m.leftover >= 100) },
    { id: 'askless', name: 'Asked home for less ×3', icon: 'trend', on: best >= 3 },
    { id: 'nofood', name: 'No food out for a week', icon: 'food', on: (S.flags.bestNoFood || 0) >= 7 },
    { id: 'backup', name: 'Backed up', icon: 'cloud', on: !!S.lastBackup },
    { id: 'goal', name: 'Goal reached', icon: 'trophy', on: S.goal.target > 0 && S.goal.saved >= S.goal.target },
    { id: 'afford', name: 'Checked before buying', icon: 'question', on: !!S.flags.afford },
    { id: 'note', name: 'Wrote a month note', icon: 'note', on: Object.values(S.notes).some(Boolean) },
    { id: 'split', name: 'Split a bill', icon: 'user', on: S.owed.length > 0 }
  ];
}
function checkNewBadges() {
  const st = streak(); if (st > (S.flags.bestStreak || 0)) S.flags.bestStreak = st;
  const nf = noFoodStreak(); if (nf > (S.flags.bestNoFood || 0)) S.flags.bestNoFood = nf;
  const had = S.flags.badges || {};
  let fresh = null;
  for (const b of badgeList()) if (b.on && !had[b.id]) { had[b.id] = today(); fresh = b; }
  S.flags.badges = had; save();
  if (fresh) { setTimeout(() => { toast('New badge: ' + fresh.name); confetti(); ding(2); }, 450); }
}

/* =========================================================
   Feedback: toast, sound, haptics, confetti
   ========================================================= */
let toastT;
function toast(msg) { const el = document.getElementById('toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2600); }
let actx;
function ding(kind) {
  if (S.settings.haptics && navigator.vibrate) { try { navigator.vibrate(kind === 2 ? [20, 40, 30] : 15); } catch (e) {} }
  if (!S.settings.sounds) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = kind === 2 ? [660, 880, 1320] : [880, 1320];
    notes.forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(actx.destination);
      const t0 = actx.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
      o.start(t0); o.stop(t0 + 0.3);
    });
  } catch (e) {}
}
function confetti() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.getElementById('confetti'); const x = c.getContext('2d');
  const W = c.width = innerWidth * devicePixelRatio, H = c.height = innerHeight * devicePixelRatio;
  const cols = ['#FFD36B', '#FF8FB1', '#7DD3FC', '#C6FF3D', '#FFFFFF', '#C4B5FD'];
  const P = Array.from({ length: 120 }, () => ({ x: W / 2, y: H * 0.35, vx: (Math.random() - .5) * 26 * devicePixelRatio, vy: (Math.random() * -18 - 6) * devicePixelRatio, r: (4 + Math.random() * 5) * devicePixelRatio, c: cols[Math.random() * cols.length | 0], a: Math.random() * 6, s: Math.random() * .3 - .15 }));
  let f = 0;
  (function tick() {
    x.clearRect(0, 0, W, H);
    for (const p of P) { p.vy += .6 * devicePixelRatio; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.a += p.s; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); x.restore(); }
    if (++f < 110) requestAnimationFrame(tick); else x.clearRect(0, 0, W, H);
  })();
}

/* =========================================================
   Look: wallpaper, theme, privacy
   ========================================================= */
function applyLook() {
  const w = WALLS[S.settings.wall] || WALLS[0]; const r = document.documentElement.style;
  r.setProperty('--base', w.base); r.setProperty('--a', w.a); r.setProperty('--b', w.b); r.setProperty('--c', w.c);
  document.body.classList.toggle('light', S.settings.theme === 'light');
  document.body.classList.toggle('hide', !!S.settings.hide);
  const wall = document.getElementById('wall');
  wall.classList.toggle('still', !S.settings.live);
  let warm = false;
  if (S.settings.react && started() && S.setup) { const n = info(); warm = n.M.received > 0 && (n.M.left < 0 || n.pace > 1.2); }
  wall.classList.toggle('warm', warm);
  const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = S.settings.theme === 'light' ? '#F4F1F6' : w.base;
}

/* =========================================================
   Router
   ========================================================= */
let view = 'home'; let lastView = '';
let calSel = null; let calYM = null; let repYM = null;
function go(v) { view = v; window.scrollTo(0, 0); render(); }
function render() {
  invalidate(); applyLook();
  const app = document.getElementById('app');
  if (!S.setup) { app.innerHTML = vSetup(); renderNav(true); return; }
  const fn = { home: vHome, calendar: vCalendar, report: vReport, progress: vProgress, settings: vSettings, walls: vWalls, tiles: vTiles }[view] || vHome;
  app.innerHTML = fn();
  if (lastView !== view && app.firstElementChild) app.firstElementChild.classList.add('fade-in');
  lastView = view;
  renderNav(['settings', 'walls', 'tiles'].includes(view));
}
function renderNav(hidden) {
  const n = document.getElementById('nav');
  n.classList.toggle('hidden', !!hidden);
  const b = (id, ic, label) => `<button data-go="${id}" class="${view === id ? 'on' : ''}" aria-label="${label}" ${view === id ? 'aria-current="page"' : ''}>${svg(ic, view === id ? 2.3 : 2)}<span>${label}</span></button>`;
  n.innerHTML = b('home', 'home', 'Home') + b('calendar', 'cal', 'Calendar') + `<button class="plus" data-act="add" aria-label="Add a purchase">${svg('plus', 2.6)}</button>` + b('report', 'report', 'Report') + b('progress', 'trophy', 'Progress');
}
function header(sub, title, extra) {
  return `<div class="header"><div class="col"><span class="h-sub">${sub}</span><h1 class="h-title">${title}</h1></div><div class="actions">${extra || ''}</div></div>`;
}
const wallBtn = () => `<button class="iconbtn" data-act="nextwall" aria-label="Next wallpaper (${esc(WALLS[S.settings.wall].name)})">${svg('image')}</button>`;
const eyeBtn = () => `<button class="iconbtn" data-act="hide" aria-label="${S.settings.hide ? 'Show amounts' : 'Hide amounts'}">${svg(S.settings.hide ? 'eyeOff' : 'eye')}</button>`;

/* =========================================================
   Views
   ========================================================= */
function vSetup() {
  return `<div class="col" style="gap:16px;padding-top:8vh">
    <div class="col" style="align-items:center;gap:10px;text-align:center">
      <img src="icon-192.png" alt="" width="96" height="96" style="border-radius:24px;box-shadow:0 18px 40px rgba(0,0,0,.4)">
      <h1 class="h-title" style="font-size:34px">Welcome to Pocket</h1>
      <p class="muted" style="margin:0;max-width:300px;line-height:1.45">Track every dollar, save more and ask home for less. Everything stays on your phone.</p>
    </div>
    <div class="glass field">
      <label><span class="k">Your name</span><input id="su-name" placeholder="Optional" autocomplete="given-name" maxlength="24"></label>
      <label><span class="k">Rent / month</span><input id="su-rent" inputmode="decimal" value="${S.settings.rent}"></label>
      <label><span class="k">Utilities guess</span><input id="su-util" inputmode="decimal" value="${S.settings.utilEstimate}"></label>
      <label><span class="k">Start month</span><input id="su-start" type="month" value="${S.settings.startMonth}"></label>
    </div>
    <p class="small muted" style="margin:0 4px;line-height:1.45">The utilities guess is only used until your first real bill comes in. After that, Pocket uses your real average.</p>
    <span class="sec">Pick a wallpaper</span>
    ${wallGrid()}
    <button class="btn" data-act="finishSetup">Start using Pocket</button>
  </div>`;
}

function vHome() {
  const n = info(); const M = n.M; const s = S.settings;
  const name = s.name ? ', ' + esc(s.name) : '';
  const hr = new Date().getHours(); const greet = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  let out = header(greet + name, monthName(n.ym), eyeBtn() + wallBtn() + `<button class="iconbtn" data-go="settings" aria-label="Settings">${svg('gear')}</button>`);
  if (!started()) {
    const d = Math.ceil((new Date(s.startMonth + '-01T00:00:00') - new Date()) / 864e5);
    out += `<div class="glass banner">${svg('sparkle')}<span>Pocket starts on <b>${monthName(s.startMonth)} 1</b> — ${d} day${d === 1 ? '' : 's'} to go. You can already add entries dated from then.</span></div>`;
  } else if (M.received <= 0) {
    out += `<div class="glass banner">${svg('arrowIn')}<span>When money arrives from home, tap <b>+</b> → <b>From home</b> to start the month.</span></div>`;
  }
  const uDay = utilUsualDay();
  if (started() && !M.utilPaid && uDay && n.dayNum >= uDay - 2) out += `<div class="glass banner">${svg('clock')}<span>Your utility bill usually comes around the <b>${ordinal(uDay)}</b>. Add it when it arrives.</span></div>`;
  if (started() && M.received > 0 && n.pace > 1.2 && n.dayNum >= 5) out += `<div class="glass banner">${svg('trend')}<span>Heads up: you're spending a bit faster than usual this month.</span></div>`;
  const st = streak();
  if (st >= 2) out += `<div class="row"><span class="pill glass">${svg('flame')} ${st}-day saving streak</span></div>`;

  out += `<div class="grid2">`;
  for (const id of s.tiles) {
    if (s.hidden.includes(id)) continue;
    out += tile(id, n);
  }
  out += `</div>`;
  return `<div class="col" style="gap:14px">${out}</div>`;
}
function ordinal(d) { const s = ['th', 'st', 'nd', 'rd'], v = d % 100; return d + (s[(v - 20) % 10] || s[v] || s[0]); }
function tile(id, n) {
  const M = n.M;
  switch (id) {
    case 'left': {
      const left = M.left;
      let fc = '';
      if (n.forecast !== null) fc = `<span class="small" style="margin-top:8px;display:flex;gap:6px;align-items:center">${svg('trend')}<span>${n.forecast >= 0 ? 'On pace to end the month with about ' + $m(Math.max(0, Math.round(n.forecast)), false) : 'On pace to run short by about ' + $m(Math.round(-n.forecast), false)}</span></span>`;
      return `<button class="glass tile wide" data-act="explainLeft" style="padding:18px 20px;border-radius:28px">
        <span class="lbl">Money left</span>
        <span class="big amt">${money(left, false)}</span>
        <span class="muted" style="font-size:15px">${left > 0 ? 'About ' + $m(Math.floor(n.perDay), false) + ' a day · ' + n.daysLeft + ' day' + (n.daysLeft === 1 ? '' : 's') + ' to go' : M.received > 0 ? 'You’ve used this month’s money' : 'Waiting for money from home'}</span>
        <span class="bar" style="display:block;margin-top:12px"><i style="width:${n.spentPct}%"></i></span>${fc}
      </button>`;
    }
    case 'fund':
      return `<button class="glass tile" data-go="report"><span class="lbl">Grocery Fund</span><span class="mid amt">${money(M.fundNow, false)}</span><span class="small muted">${M.fundNow > 0 ? 'pays groceries first' : 'savings land here'}</span></button>`;
    case 'utilities':
      return M.utilPaid
        ? `<button class="glass tile" data-act="add" data-cat="bills"><span class="lbl">Utilities</span><span class="mid">Paid</span><span class="small muted amt">${money(M.utilTotal)} this month</span></button>`
        : `<button class="glass tile" data-act="add" data-cat="bills"><span class="lbl">Utilities</span><span class="mid">Waiting</span><span class="small muted">${$m(M.est, false)} kept aside</span></button>`;
    case 'rent':
      return M.rentPaid
        ? `<button class="glass tile" data-act="add" data-cat="rent"><span class="lbl">Rent</span><span class="mid">Paid</span><span class="small muted amt">${money(M.byCat.rent)}</span></button>`
        : `<button class="glass tile" data-act="add" data-cat="rent" data-amount="${S.settings.rent}"><span class="lbl">Rent</span><span class="mid">Not paid</span><span class="small muted">${$m(S.settings.rent)} kept aside · tap to log</span></button>`;
    case 'goal': {
      const p = S.goal.target > 0 ? Math.min(100, S.goal.saved / S.goal.target * 100) : 0;
      return `<button class="glass tile" data-go="progress"><span class="lbl">${esc(S.goal.name)}</span><span class="mid amt">${money(S.goal.saved, false)}</span><span class="small muted">of ${$m(S.goal.target, false)} · ${Math.round(p)}%</span><span class="bar" style="display:block;margin-top:6px"><i style="width:${p}%"></i></span></button>`;
    }
    case 'owed': {
      const open = S.owed.filter(o => !o.paid); const sum = open.reduce((a, o) => a + o.amount, 0);
      return `<button class="glass tile" data-go="progress"><span class="lbl">Owed to me</span><span class="mid amt">${money(sum)}</span><span class="small muted">${open.length ? esc(open[0].name) + (open.length > 1 ? ' + ' + (open.length - 1) + ' more' : '') : 'nobody owes you'}</span></button>`;
    }
    case 'afford':
      return `<button class="glass tile wide" data-act="afford" style="min-height:56px;flex-direction:row;align-items:center;justify-content:space-between;border-radius:28px;padding:0 20px"><span class="row" style="font-weight:700;font-size:15px">${svg('question')} Can I afford it?</span>${svg('next')}</button>`;
    case 'cats': {
      const show = CATS.filter(c => c.id !== 'rent' && c.id !== 'bills');
      return `<div class="tile wide" style="min-height:0;padding:4px 2px"><span class="sec" style="margin:0 0 8px">This month</span><div class="cats">${show.map(c => `<button class="cat" data-act="catlist" data-cat="${c.id}" aria-label="${c.name}: ${money(M.byCat[c.id])}"><span class="bub glass" style="color:${catColor(c)}">${svg(c.id)}</span><span>${c.short}</span><b class="amt">${money(M.byCat[c.id], false)}</b></button>`).join('')}</div></div>`;
    }
    case 'recent': {
      const list = S.tx.slice().sort((a, b) => b.date.localeCompare(a.date) || b.t - a.t).slice(0, 3);
      return `<div class="tile wide" style="min-height:0;padding:0"><span class="sec" style="margin:4px 4px 8px">Recent</span><div class="glass card list" style="padding:2px 16px">${list.length ? list.map(txRow).join('') : '<div class="empty">Nothing yet. Tap + to add your first entry.</div>'}</div></div>`;
    }
  }
  return '';
}
function catOf(id) { return CATS.find(c => c.id === id) || CATS[6]; }
function catColor(c) { return S.settings.theme === 'light' ? c.dark : c.color; }
function txRow(t) {
  const c = catOf(t.cat);
  const isIn = t.type === 'in'; const isRef = t.type === 'refund';
  const title = t.note ? esc(t.note) : isIn ? 'From home' : (t.cat === 'bills' ? esc(t.bill || 'Utilities') : c.name);
  const sub = (isIn ? 'Money in' : isRef ? 'Refund · ' + c.name : c.name + (t.cat === 'bills' && t.note ? ' · ' + esc(t.bill || 'Utilities') : '')) + ' · ' + dateNice(t.date) + (t.mood === 'regret' ? ' · Regret' : t.mood === 'worth' ? ' · Worth it' : '');
  return `<button class="item" data-act="edit" data-id="${t.id}"><span class="ic" style="color:${isIn ? 'var(--text)' : catColor(c)}">${svg(isIn ? 'arrowIn' : isRef ? 'refund' : c.id)}</span><span class="col" style="flex:1;min-width:0"><span style="font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${title}</span><span class="small muted">${sub}</span></span><span style="font-size:15px;font-weight:700" class="amt">${isIn || isRef ? '+' : ''}${money(t.amount)}</span></button>`;
}

/* ---------- Calendar ---------- */
function vCalendar() {
  calYM = calYM || curYM();
  const ym = calYM; const ds = dayStats(ym); const t = today();
  const max = Math.max(1, ...ds.map(d => d.disc));
  const first = new Date(Number(ym.slice(0, 4)), Number(ym.slice(5)) - 1, 1).getDay();
  const n = daysIn(ym);
  let cells = 'SMTWTFS'.split('').map((d, i) => `<span class="dow" aria-hidden="true">${d}</span>`).join('');
  for (let i = 0; i < first; i++) cells += '<span></span>';
  const light = S.settings.theme === 'light';
  for (let d = 1; d <= n; d++) {
    const s = ym + '-' + String(d).padStart(2, '0'); const st = ds[d - 1];
    const future = s > t; const before = ym < S.settings.startMonth;
    const lv = st.disc <= 0 ? 0 : Math.min(4, 1 + Math.floor(st.disc / max * 3.999));
    const fills = light ? ['rgba(20,18,28,.05)', 'rgba(20,18,28,.14)', 'rgba(20,18,28,.3)', 'rgba(20,18,28,.55)', 'rgba(20,18,28,.85)'] : ['rgba(255,255,255,.08)', 'rgba(255,255,255,.2)', 'rgba(255,255,255,.36)', 'rgba(255,255,255,.58)', 'rgba(255,255,255,.88)'];
    const fg = lv >= 3 ? (light ? '#fff' : '#111') : 'var(--text)';
    const star = !future && !before && st.disc <= 0 && !st.items.some(x => x.type === 'spent' && x.cat !== 'rent' && x.cat !== 'bills');
    cells += `<button ${future || before ? 'disabled' : ''} data-act="calday" data-d="${s}" class="${calSel === s ? 'sel' : ''} ${s === t ? 'today' : ''}" style="${future || before ? '' : `background:${fills[lv]};color:${fg}`}" aria-label="${dateNice(s)}${st.disc > 0 ? ', spent ' + money(st.disc) : star ? ', no-spend day' : ''}">${d}${star ? '<span class="star">★</span>' : ''}</button>`;
  }
  let day = '';
  if (calSel && ymOf(calSel) === ym) {
    const st = ds[Number(calSel.slice(8)) - 1];
    day = `<div class="glass card"><div class="between" style="min-height:40px"><b>${dateNice(calSel)}</b><b class="amt">${money(Math.max(0, st.spent))}</b></div><div class="list">${st.items.length ? st.items.map(txRow).join('') : '<div class="empty">No entries on this day.</div>'}</div></div>`;
  }
  const note = S.notes[ym] || '';
  return `<div class="col" style="gap:14px">
    ${header('Calendar', monthYear(ym), `<button class="iconbtn" data-act="calmove" data-k="-1" aria-label="Previous month">${svg('back')}</button><button class="iconbtn" data-act="calmove" data-k="1" aria-label="Next month">${svg('next')}</button>`)}
    <div class="glass card"><div class="cal">${cells}</div>
      <div class="row small muted" style="justify-content:flex-end;margin-top:10px;gap:6px"><span>★ no-spend day</span><span style="margin-left:8px">Brighter = spent more</span></div></div>
    ${day}
    <button class="glass card row" data-act="note" data-ym="${ym}" style="text-align:left;color:var(--text);border-radius:20px">${svg('pen')}<span class="col" style="flex:1"><b style="font-size:14px">Month note</b><span class="small muted" style="line-height:1.4">${note ? esc(note) : 'Tap to write why this month was different.'}</span></span></button>
  </div>`;
}

/* ---------- Report ---------- */
function vReport() {
  repYM = repYM || curYM();
  const ym = repYM; const M = month(ym); const P = month(addMonths(ym, -1));
  const hasPrev = addMonths(ym, -1) >= S.settings.startMonth;
  const cats = CATS.filter(c => c.id !== 'rent');
  const max = Math.max(1, ...cats.map(c => Math.max(M.byCat[c.id], hasPrev ? P.byCat[c.id] : 0)));
  const rows = cats.map(c => {
    const now = M.byCat[c.id], pr = hasPrev ? P.byCat[c.id] : 0; const d = now - pr;
    return `<div class="cmp col" style="gap:4px"><div class="between" style="font-size:13px"><span class="row" style="gap:8px"><span style="width:9px;height:9px;border-radius:5px;background:${catColor(c)}"></span>${c.name}</span><span><b class="amt">${money(now, false)}</b>${hasPrev ? ` <span class="muted amt">· ${d > 0 ? '+' : d < 0 ? '−' : '±'}${money(Math.abs(d), false)}</span>` : ''}</span></div><div class="bar cb1"><i style="width:${now / max * 100}%;background:${catColor(c)}"></i></div>${hasPrev ? `<div class="bar cb2"><i style="width:${pr / max * 100}%"></i></div>` : ''}</div>`;
  }).join('');
  const ins = insights(ym);
  const uh = utilHistory().slice(-6);
  const umax = Math.max(1, ...uh.map(u => u.amount));
  const ubars = uh.length ? `<div class="bars" style="grid-template-columns:repeat(${uh.length},minmax(0,1fr))">${uh.map(u => `<div class="bc"><span class="amt">${money(u.amount, false)}</span><i style="height:${u.amount / umax * 54}px"></i><span class="muted">${monthName(u.ym, true)}</span></div>`).join('')}</div>` : '<div class="empty">Your utility bills will show up here, starting with your first one.</div>';
  const plan = nextPlan(curYM());
  return `<div class="col" style="gap:14px">
    ${header('Report', monthYear(ym), `<button class="iconbtn" data-act="repmove" data-k="-1" aria-label="Previous month">${svg('back')}</button><button class="iconbtn" data-act="repmove" data-k="1" aria-label="Next month">${svg('next')}</button>`)}
    <div class="grid2">
      <div class="glass tile" style="min-height:0"><span class="lbl">Spent</span><span class="mid amt">${money(Math.max(0, M.total), false)}</span><span class="small muted">${M.complete ? 'whole month' : 'so far'}</span></div>
      <div class="glass tile" style="min-height:0"><span class="lbl">From home</span><span class="mid amt">${money(M.received, false)}</span><span class="small muted">${hasPrev ? 'last month ' + $m(P.received, false) : 'this month'}</span></div>
      ${M.complete ? `<div class="glass tile wide" style="min-height:0"><span class="lbl">${M.leftover >= 0 ? 'Saved this month' : 'Went over by'}</span><span class="mid amt">${money(Math.abs(M.leftover), false)}</span><span class="small muted">${M.leftover >= 0 ? 'moved to your Grocery Fund' : 'taken from next month'}</span></div>` : ''}
    </div>
    <div class="glass card col" style="gap:12px"><div class="between"><b>By category</b>${hasPrev ? `<span class="small muted">bar = ${monthName(ym, true)}, thin = ${monthName(addMonths(ym, -1), true)}</span>` : ''}</div>${rows}</div>
    ${ins.length ? `<div class="glass card col" style="gap:10px">${ins.map(i => `<div class="row" style="font-size:13px;line-height:1.4;align-items:flex-start">${svg(i.icon)}<span>${i.text}</span></div>`).join('')}</div>` : ''}
    <div class="glass card col" style="gap:10px"><div class="between"><b>Utility bills</b><span class="small muted">${uh.length ? 'average ' + $m(utilEstimate(addMonths(curYM(), 1)), false) : ''}</span></div>${ubars}</div>
    <div class="glass card col" style="gap:10px"><div class="between"><b>Next month</b><span class="small muted">estimate</span></div>
      <div class="between" style="font-size:14px"><span class="muted">Ask home for about</span><span class="mid amt">${money(plan.ask, false)}</span></div>
      <div class="row" style="gap:8px"><button class="btn small" data-act="newmonth" data-ym="${curYM()}">See plan &amp; message</button>${completedMonths().length ? `<button class="btn small ghost" data-act="recap" data-ym="${completedMonths().slice(-1)[0]}">Last recap</button>` : ''}</div>
    </div>
  </div>`;
}
function insights(ym) {
  const out = []; const M = month(ym); const prevYM = addMonths(ym, -1);
  if (prevYM >= S.settings.startMonth) {
    const P = month(prevYM); let best = null;
    for (const c of CATS) { if (c.id === 'rent') continue; const d = M.byCat[c.id] - P.byCat[c.id]; if (!best || Math.abs(d) > Math.abs(best.d)) best = { c, d }; }
    if (best && Math.abs(best.d) >= 5) out.push({ icon: 'trend', text: `${best.c.name} is <b>${best.d > 0 ? 'up' : 'down'} ${$m(Math.abs(best.d), false)}</b> compared with ${monthName(prevYM)}.` });
  }
  const ds = dayStats(ym); const wd = [0, 0, 0, 0, 0, 0, 0];
  ds.forEach((d, i) => { const dt = new Date(Number(ym.slice(0, 4)), Number(ym.slice(5)) - 1, i + 1); wd[dt.getDay()] += Math.max(0, d.disc); });
  const top = wd.indexOf(Math.max(...wd));
  if (wd[top] > 0) out.push({ icon: 'cal', text: `<b>${['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'][top]}</b> are your biggest spending days.` });
  const ns = noSpendDays(ym); if (ns) out.push({ icon: 'star', text: `You had <b>${ns} no-spend day${ns === 1 ? '' : 's'}</b>.` });
  const rg = regret(ym); if (rg > 0) out.push({ icon: 'frown', text: `${$m(rg)} went to purchases you tagged <b>Regret</b>.` });
  if (ym === curYM()) { const n = info(); if (n.forecast !== null) out.push({ icon: 'sparkle', text: n.forecast >= 0 ? `At this pace you'll end the month with about <b>${$m(Math.round(n.forecast), false)}</b> left.` : `At this pace you'll be short by about <b>${$m(Math.round(-n.forecast), false)}</b>.` }); }
  return out;
}

/* ---------- Progress ---------- */
function vProgress() {
  const g = S.goal; const p = g.target > 0 ? Math.min(100, g.saved / g.target * 100) : 0;
  const M = month(curYM());
  let eta = '';
  const done = completedMonths().map(month).slice(-3);
  if (g.saved < g.target && done.length) { const avg = done.reduce((a, m) => a + Math.max(0, m.leftover), 0) / done.length; if (avg > 0) { const k = Math.ceil((g.target - g.saved) / avg); eta = `If you moved all your savings here, you’d reach it in about ${k} month${k === 1 ? '' : 's'}.`; } }
  const ch = S.challenges.map(id => challengeState(id)).filter(Boolean);
  const bl = badgeList(); const earned = bl.filter(b => b.on).length;
  const owed = S.owed.filter(o => !o.paid);
  const months = []; let m = S.settings.startMonth; const now = curYM();
  while (m <= now) { months.push(month(m)); m = addMonths(m, 1); }
  const shown = months.slice(-12);
  const smax = Math.max(1, ...shown.map(x => x.complete ? Math.max(0, x.leftover) : 0));
  return `<div class="col" style="gap:14px">
    ${header('Progress', 'Goals &amp; fun', '')}
    <div class="glass card col" style="gap:6px">
      <div class="between"><b>${esc(g.name)}</b><button class="link" data-act="editgoal" style="min-height:0;padding:0">Edit</button></div>
      <span class="mid amt" style="font-size:30px">${money(g.saved, false)} <span class="muted" style="font-size:15px;font-weight:600">of ${money(g.target, false)}</span></span>
      <div class="bar" style="height:8px"><i style="width:${p}%"></i></div>
      <span class="small muted">${eta || 'Move money from your Grocery Fund whenever you like.'}</span>
      <div class="row" style="gap:8px;margin-top:6px"><button class="btn small" data-act="togoal" ${M.fundNow <= 0 ? 'disabled style="opacity:.5"' : ''}>Add from Grocery Fund</button>${g.saved > 0 ? '<button class="btn small ghost" data-act="usegoal">Use savings</button>' : ''}</div>
    </div>
    <div class="glass card col" style="gap:12px">
      <div class="between"><b>Challenges</b><button class="link" data-act="pickch" style="min-height:0;padding:0">Change</button></div>
      ${ch.length ? ch.map(c => `<div class="col" style="gap:5px"><div class="between" style="font-size:13px"><span>${c.done ? '✓ ' : ''}${c.name}</span><b>${c.label}</b></div><div class="bar"><i style="width:${c.pct}%;${c.bad ? 'background:#FF8A65' : ''}"></i></div></div>`).join('') : '<div class="empty">Pick a challenge to make saving a game.</div>'}
    </div>
    <div class="glass card col" style="gap:8px">
      <div class="between"><b>Owed to me</b><span class="small muted amt">${money(owed.reduce((a, o) => a + o.amount, 0))}</span></div>
      <div class="list">${owed.length ? owed.map(o => `<div class="item"><span class="ic">${svg('user')}</span><span class="col" style="flex:1"><span style="font-weight:600">${esc(o.name)}</span><span class="small muted">${esc(o.note || '')} · ${dateNice(o.date)}</span></span><b class="amt">${money(o.amount)}</b><button class="btn small ghost" data-act="paidback" data-id="${o.id}" style="margin-left:6px">Paid</button></div>`).join('') : '<div class="empty">When you split a bill, it shows up here until they pay you back.</div>'}</div>
    </div>
    <div class="glass card col" style="gap:14px">
      <div class="between"><b>Badges</b><span class="small muted">${earned} of ${bl.length}</span></div>
      <div class="badges">${bl.map(b => `<div class="badge ${b.on ? '' : 'off'}"><span class="bi">${svg(b.icon)}</span><span>${b.name}</span></div>`).join('')}</div>
    </div>
    <div class="glass card col" style="gap:10px">
      <div class="between"><b>Saved each month</b><span class="small muted amt">${money(months.filter(x => x.complete).reduce((a, x) => a + Math.max(0, x.leftover), 0), false)} total</span></div>
      <div class="bars" style="grid-template-columns:repeat(${Math.max(shown.length, 1)},minmax(0,1fr))">${shown.map(x => `<div class="bc"><span class="amt">${x.complete ? money(Math.max(0, x.leftover), false) : '…'}</span><i class="${x.complete && x.leftover > 0 ? '' : 'empty'}" style="height:${x.complete ? Math.max(3, Math.max(0, x.leftover) / smax * 54) : 3}px"></i><span class="muted">${monthName(x.ym, true)}</span></div>`).join('')}</div>
      <span class="small muted" style="line-height:1.5">From home: ${months.map(x => monthName(x.ym, true) + ' ' + $m(x.received, false)).join(' · ')}</span>
    </div>
  </div>`;
}
function challengeState(id) {
  const c = CHALLENGES[id]; if (!c) return null; const ym = curYM(); const M = month(ym);
  if (id === 'nospend5') { const v = noSpendDays(ym); return { name: c.name, label: v + ' / 5', pct: Math.min(100, v / 5 * 100), done: v >= 5 }; }
  if (c.limit) { const v = Math.max(0, M.byCat[c.cat]); return { name: c.name, label: money(v, false) + ' / ' + money(c.goal, false), pct: Math.min(100, v / c.goal * 100), bad: v > c.goal, done: M.complete && v <= c.goal }; }
  if (id === 'log7') { const v = logStreak(); return { name: c.name, label: Math.min(v, 7) + ' / 7', pct: Math.min(100, v / 7 * 100), done: v >= 7 }; }
  if (id === 'nofood7') { const v = noFoodStreak(); return { name: c.name, label: Math.min(v, 7) + ' / 7', pct: Math.min(100, v / 7 * 100), done: v >= 7 }; }
  return null;
}

/* ---------- Settings ---------- */
function vSettings() {
  const s = S.settings;
  const sw = (key, label, sub) => `<div class="frow"><span class="col" style="flex:1"><span>${label}</span>${sub ? `<span class="small muted">${sub}</span>` : ''}</span><button class="switch ${s[key] ? 'on' : ''}" role="switch" aria-checked="${!!s[key]}" aria-label="${label}" data-act="toggle" data-key="${key}"></button></div>`;
  return `<div class="col" style="gap:14px">
    <div class="header"><button class="iconbtn" data-go="home" aria-label="Back">${svg('back')}</button><h1 class="h-title" style="font-size:22px">Settings</h1><span style="width:44px"></span></div>
    <span class="sec">Look</span>
    <div class="glass field">
      <button class="frow" data-go="walls" style="width:100%;background:none;border:0;border-bottom:1px solid var(--line);text-align:left"><span style="flex:1">Wallpaper</span><span class="muted">${esc(WALLS[s.wall].name)}</span>${svg('next')}</button>
      ${sw('live', 'Live motion', 'Wallpaper colors gently move')}
      ${sw('react', 'Wallpaper reacts', 'Turns warmer when money runs low')}
      <div class="frow"><span style="flex:1">Theme</span><div class="seg glass" style="width:170px"><button class="${s.theme === 'dark' ? 'on' : ''}" data-act="theme" data-v="dark">Dark</button><button class="${s.theme === 'light' ? 'on' : ''}" data-act="theme" data-v="light">Light</button></div></div>
      <button class="frow" data-go="tiles" style="width:100%;background:none;border:0;text-align:left"><span style="flex:1">Home screen tiles</span>${svg('next')}</button>
    </div>
    <span class="sec">Feel</span>
    <div class="glass field">${sw('sounds', 'Sounds')}${sw('haptics', 'Vibration')}</div>
    <span class="sec">Money</span>
    <div class="glass field">
      <label><span class="k">Your name</span><input data-set="name" value="${esc(s.name)}" maxlength="24" placeholder="Optional"></label>
      <label><span class="k">Rent / month</span><input data-set="rent" inputmode="decimal" value="${s.rent}"></label>
      <label><span class="k">Utilities guess</span><input data-set="utilEstimate" inputmode="decimal" value="${s.utilEstimate}"></label>
      <label><span class="k">Start month</span><input data-set="startMonth" type="month" value="${s.startMonth}"></label>
    </div>
    <span class="sec">Privacy</span>
    <div class="glass field">
      ${sw('hide', 'Hide amounts', 'Blurs numbers until you tap the eye')}
      <button class="frow" data-act="pinset" style="width:100%;background:none;border:0;text-align:left"><span style="flex:1">${s.pin ? 'Change or remove PIN' : 'Set a PIN lock'}</span>${svg('lock')}</button>
    </div>
    <span class="sec">Backup</span>
    <div class="glass card col" style="gap:10px">
      <span class="small muted" style="line-height:1.45">Your data lives only on this phone. Save a backup file every month (to Files, Google Drive or email) so you never lose it. ${S.lastBackup ? 'Last backup: ' + dateNice(S.lastBackup) + '.' : 'No backup yet.'}</span>
      <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn small" data-act="backup">Save backup</button><button class="btn small ghost" data-act="restore">Restore from file</button></div>
      <input type="file" id="restore-file" accept=".json,application/json" hidden>
    </div>
    <span class="sec">Danger zone</span>
    <button class="btn ghost" data-act="reset" style="color:#FF8A8A">Erase everything</button>
    <p class="small faint" style="text-align:center;margin:4px 0 20px">Pocket · made just for you</p>
  </div>`;
}
function wallGrid() {
  return `<div class="walls">${WALLS.map((w, i) => `<button class="wt ${S.settings.wall === i ? 'on' : ''}" data-act="setwall" data-i="${i}" aria-label="${w.name} wallpaper" aria-pressed="${S.settings.wall === i}" style="background:${w.base}"><span class="mb" style="width:90px;height:90px;left:-24px;top:-18px;background:${w.a}"></span><span class="mb" style="width:100px;height:100px;right:-36px;top:36px;background:${w.b}"></span><span class="mb" style="width:80px;height:80px;left:4px;bottom:-26px;background:${w.c}"></span><span class="nm">${w.name}${S.settings.wall === i ? ' ✓' : ''}</span></button>`).join('')}</div>`;
}
function vWalls() {
  return `<div class="col" style="gap:14px">
    <div class="header"><button class="iconbtn" data-go="settings" aria-label="Back">${svg('back')}</button><h1 class="h-title" style="font-size:22px">Wallpaper</h1><span style="width:44px"></span></div>
    <div class="glass field"><div class="frow"><span class="col" style="flex:1"><span>Live motion</span><span class="small muted">${S.settings.live ? 'Colors gently move' : 'Still picture (saves battery)'}</span></span><button class="switch ${S.settings.live ? 'on' : ''}" role="switch" aria-checked="${S.settings.live}" aria-label="Live motion" data-act="toggle" data-key="live"></button></div></div>
    ${wallGrid()}
  </div>`;
}
function vTiles() {
  const s = S.settings;
  return `<div class="col" style="gap:14px">
    <div class="header"><button class="iconbtn" data-go="settings" aria-label="Back">${svg('back')}</button><h1 class="h-title" style="font-size:22px">Home tiles</h1><span style="width:44px"></span></div>
    <p class="small muted" style="margin:0 4px">Move tiles up or down and choose which ones show on your home screen.</p>
    <div class="glass card" style="padding:4px 14px">${s.tiles.map((id, i) => `<div class="tilerow"><span style="flex:1;font-weight:600">${TILES[id]}</span>
      <button class="mv" data-act="tmove" data-i="${i}" data-k="-1" aria-label="Move ${TILES[id]} up" ${i === 0 ? 'disabled style="opacity:.3"' : ''}>${svg('up')}</button>
      <button class="mv" data-act="tmove" data-i="${i}" data-k="1" aria-label="Move ${TILES[id]} down" ${i === s.tiles.length - 1 ? 'disabled style="opacity:.3"' : ''}>${svg('down')}</button>
      <button class="switch ${s.hidden.includes(id) ? '' : 'on'}" role="switch" aria-checked="${!s.hidden.includes(id)}" aria-label="Show ${TILES[id]}" data-act="tshow" data-id="${id}"></button></div>`).join('')}</div>
  </div>`;
}

/* =========================================================
   Sheets
   ========================================================= */
function openSheet(html, opts) {
  opts = opts || {};
  const root = document.getElementById('sheet-root');
  root.innerHTML = (opts.full ? '' : '<div class="sheet-bg" data-act="close"></div>') + `<div class="sheet ${opts.full ? 'full' : ''}" role="dialog" aria-modal="true" aria-label="${opts.label || 'Panel'}">${opts.full ? '' : '<div class="grab"></div>'}${html}</div>`;
  document.body.style.overflow = 'hidden';
  if (opts.full) document.getElementById('nav').classList.add('hidden');
  const f = root.querySelector('[autofocus]'); if (f) setTimeout(() => f.focus(), 350);
}
function closeSheet() {
  document.getElementById('sheet-root').innerHTML = '';
  document.body.style.overflow = '';
  render();
}

/* ---------- Add / edit ---------- */
let draft = null;
function openAdd(pre) {
  const t = pre && pre.id ? S.tx.find(x => x.id === pre.id) : null;
  const minDate = S.settings.startMonth + '-01';
  const d0 = today() < minDate ? minDate : today();
  draft = t ? JSON.parse(JSON.stringify(t)) : Object.assign({ type: 'spent', cat: 'grocery', amount: '', note: '', date: d0, mood: '', bill: 'Utilities', split: false, splitName: '', splitAmt: '' }, pre || {});
  draft.editing = !!t;
  drawAdd();
}
function drawAdd() {
  const d = draft; const isIn = d.type === 'in';
  const amt = parseFloat(d.amount) || 0;
  const fundNote = `<span id="fund-note" class="small muted" style="text-align:center">${fundNoteText()}</span>`;
  const html = `
    <div class="between"><button class="iconbtn" data-act="close" aria-label="Close">${svg('close')}</button><b>${d.editing ? 'Edit entry' : 'New entry'}</b>${d.editing ? `<button class="iconbtn" data-act="del" aria-label="Delete entry" style="color:#FF8A8A">${svg('trash')}</button>` : `<button class="link" data-act="afford" style="padding:0">Just checking?</button>`}</div>
    <div class="seg glass">${[['spent', 'Spent'], ['in', 'From home'], ['refund', 'Refund']].map(([v, l]) => `<button class="${d.type === v ? 'on' : ''}" data-act="dtype" data-v="${v}" aria-pressed="${d.type === v}">${l}</button>`).join('')}</div>
    <div class="col" style="align-items:center;gap:6px">
      <label for="amt" class="small muted">${isIn ? 'Money received from home' : d.type === 'refund' ? 'Money coming back to you' : 'How much?'}</label>
      <div class="row" style="justify-content:center;gap:0;width:100%"><span style="font-size:44px;font-weight:800;opacity:.7">$</span><input id="amt" class="amount-in" inputmode="decimal" placeholder="0" value="${esc(d.amount)}" data-draft="amount" autocomplete="off" style="width:70%" autofocus></div>
      ${fundNote}
    </div>
    ${isIn ? '' : `<div class="catgrid">${CATS.map(c => `<button class="cattile ${d.cat === c.id ? 'on' : ''}" data-act="dcat" data-v="${c.id}" aria-pressed="${d.cat === c.id}"><span style="color:${d.cat === c.id ? 'inherit' : catColor(c)}">${svg(c.id)}</span>${c.name}</button>`).join('')}</div>`}
    ${!isIn && d.cat === 'bills' ? `<div class="row" style="flex-wrap:wrap;gap:8px">${BILL_TYPES.map(b => `<button class="chip ${d.bill === b ? 'on' : ''}" data-act="dbill" data-v="${b}">${b}</button>`).join('')}</div>` : ''}
    <div class="glass field">
      <label><span class="k">Note</span><input data-draft="note" value="${esc(d.note)}" placeholder="${isIn ? 'Optional' : 'e.g. Trader Joe’s'}" maxlength="60"></label>
      <label><span class="k">Date</span><input type="date" data-draft="date" value="${d.date}" min="${S.settings.startMonth}-01"></label>
    </div>
    ${d.type === 'spent' ? `<div class="col" style="gap:8px"><span class="small muted" style="margin-left:4px">How do you feel about it? (optional)</span><div class="grid2">${[['worth', 'Worth it', 'smile'], ['regret', 'Regret', 'frown']].map(([v, l, ic]) => `<button class="chip ${d.mood === v ? 'on' : ''}" data-act="dmood" data-v="${v}" style="justify-content:center;height:50px;border-radius:25px">${svg(ic)}${l}</button>`).join('')}</div></div>
      ${d.editing ? '' : `<div class="glass field"><div class="frow"><span class="col" style="flex:1"><span>Split with a friend</span><span class="small muted">They’ll show up in “Owed to me”</span></span><button class="switch ${d.split ? 'on' : ''}" role="switch" aria-checked="${!!d.split}" aria-label="Split with a friend" data-act="dsplit"></button></div>
      ${d.split ? `<label><span class="k">Friend</span><input data-draft="splitName" value="${esc(d.splitName)}" placeholder="Name" maxlength="24"></label><label><span class="k">They owe</span><input data-draft="splitAmt" inputmode="decimal" value="${esc(d.splitAmt)}" placeholder="${amt ? r2(amt / 2) : 'Half'}"></label>` : ''}</div>`}` : ''}
    <button class="btn" data-act="saveTx">${d.editing ? 'Save changes' : isIn ? 'Add money received' : d.type === 'refund' ? 'Add refund' : 'Save'}</button>`;
  const root = document.getElementById('sheet-root');
  if (root.querySelector('.sheet') && !root.querySelector('.sheet.full')) { const sh = root.querySelector('.sheet'); const y = sh.scrollTop; sh.innerHTML = '<div class="grab"></div>' + html; sh.scrollTop = y; }
  else openSheet(html, { label: 'Add an entry' });
}
function fundNoteText() {
  const d = draft; if (!d || d.type !== 'spent' || d.cat !== 'grocery' || d.editing) return '';
  const ym = ymOf(d.date || today()) < S.settings.startMonth ? S.settings.startMonth : ymOf(d.date || today());
  const f = month(ym).fundNow; if (f <= 0) return '';
  const amt = parseFloat(d.amount) || 0;
  return `Paid from Grocery Fund · ${$m(f)} → ${$m(Math.max(0, f - amt))}`;
}
function saveTx() {
  const d = draft; const amount = r2(parseFloat(String(d.amount).replace(/[^0-9.]/g, '')));
  if (!amount || amount <= 0) { const el = document.getElementById('amt'); el && el.parentElement.classList.add('shake'); setTimeout(() => el && el.parentElement.classList.remove('shake'), 400); toast('Type an amount first'); return; }
  if (!d.date || d.date < S.settings.startMonth + '-01') { toast('Pick a date from ' + monthName(S.settings.startMonth) + ' 1 on'); return; }
  const rec = { id: d.editing ? d.id : uid(), t: d.editing ? d.t : Date.now(), type: d.type, cat: d.type === 'in' ? 'in' : d.cat, amount, note: (d.note || '').trim(), date: d.date };
  if (rec.cat === 'bills') rec.bill = d.bill || 'Utilities';
  if (d.type === 'spent' && d.mood) rec.mood = d.mood;
  if (d.editing) { const i = S.tx.findIndex(x => x.id === d.id); if (i >= 0) S.tx[i] = rec; }
  else S.tx.push(rec);
  if (!d.editing && d.type === 'spent' && d.split) {
    const owe = r2(parseFloat(d.splitAmt) || amount / 2);
    S.owed.push({ id: uid(), name: (d.splitName || 'Friend').trim(), amount: owe, note: rec.note || catOf(rec.cat).name, date: rec.date, cat: rec.cat, paid: false });
  }
  save(); invalidate();
  document.getElementById('sheet-root').innerHTML = ''; document.body.style.overflow = '';
  ding(1);
  if (rec.type === 'in') { toast('Added ' + money(amount) + ' from home'); confetti(); }
  else toast(d.editing ? 'Saved' : rec.type === 'refund' ? 'Refund added' : 'Saved ' + money(amount) + ' · ' + catOf(rec.cat).name);
  render(); checkNewBadges();
}

/* ---------- Afford check ---------- */
let aff = null;
function openAfford(pre) { aff = Object.assign({ amount: '', what: '', split: false }, pre || {}); S.flags.afford = true; save(); drawAfford(); }
function affVerdict() {
  const n = info(); const amt = parseFloat(aff.amount) || 0; const mine = aff.split ? amt / 2 : amt;
  const after = n.M.left - mine; const perAfter = after > 0 ? after / n.daysLeft : 0;
  let verdict = '';
  if (amt > 0) {
    const ok = after >= 0; const tight = ok && perAfter < n.perDay * 0.5;
    verdict = `<div class="glass card col" style="gap:10px">
      <div class="row"><span class="ic" style="background:var(--btn);color:var(--btn-text)">${svg(ok ? 'check' : 'close')}</span><span style="font-size:20px;font-weight:800">${!ok ? 'Not this month' : tight ? 'Yes, but it’s tight' : 'Yes, you can'}</span></div>
      <span style="font-size:14px;line-height:1.45">${ok ? `Your daily budget goes from <b class="amt">${money(Math.floor(n.perDay), false)}</b> to <b class="amt">${money(Math.floor(perAfter), false)}</b> for the next ${n.daysLeft} day${n.daysLeft === 1 ? '' : 's'}.` : `That’s ${$m(Math.ceil(-after), false)} more than what’s left this month.`}</span>
      <div class="col" style="gap:5px"><div class="between small muted"><span>Now</span><span class="amt">${money(Math.floor(n.perDay), false)} a day</span></div><div class="bar"><i style="width:100%;opacity:.45"></i></div><div class="between small muted"><span>After this</span><span class="amt">${money(Math.floor(perAfter), false)} a day</span></div><div class="bar"><i style="width:${n.perDay > 0 ? Math.max(0, Math.min(100, perAfter / n.perDay * 100)) : 0}%"></i></div></div>
    </div>`;
  }
  return verdict;
}
function drawAfford() {
  const verdict = affVerdict();
  const html = `<div class="between"><button class="iconbtn" data-act="close" aria-label="Close">${svg('close')}</button><b>Can I afford it?</b><span style="width:44px"></span></div>
    <div class="col" style="align-items:center;gap:4px"><div class="row" style="justify-content:center;gap:0;width:100%"><span style="font-size:44px;font-weight:800;opacity:.7">$</span><input id="aamt" class="amount-in" inputmode="decimal" placeholder="0" value="${esc(aff.amount)}" data-aff="amount" style="width:70%" aria-label="Price" autofocus></div>
    <input data-aff="what" value="${esc(aff.what)}" placeholder="What is it? (optional)" style="border:0;background:transparent;text-align:center;font-size:15px;outline:none;color:var(--text);min-height:44px" maxlength="40" aria-label="What is it"></div>
    <div class="glass field"><div class="frow"><span class="col" style="flex:1"><span>Split with a friend</span><span class="small muted">${aff.split ? 'You pay half' : 'You pay the full amount'}</span></span><button class="switch ${aff.split ? 'on' : ''}" role="switch" aria-checked="${aff.split}" aria-label="Split with a friend" data-act="asplit"></button></div></div>
    <div id="aff-result">${verdict}</div>
    <div class="col" style="gap:10px"><button class="btn" data-act="affadd">Add as a purchase</button><button class="btn ghost" data-act="close">Just checking</button></div>`;
  const root = document.getElementById('sheet-root');
  if (root.querySelector('.sheet')) { root.querySelector('.sheet').innerHTML = '<div class="grab"></div>' + html; }
  else openSheet(html, { label: 'Can I afford it' });
}

/* ---------- Month note, goal, challenges, PIN ---------- */
function openNote(ym) {
  openSheet(`<div class="between"><button class="iconbtn" data-act="close" aria-label="Close">${svg('close')}</button><b>${monthName(ym)} note</b><span style="width:44px"></span></div>
    <div class="glass field"><textarea id="note-text" placeholder="Anything special this month? e.g. Friend’s birthday dinner." maxlength="300" aria-label="Month note" autofocus>${esc(S.notes[ym] || '')}</textarea></div>
    <button class="btn" data-act="savenote" data-ym="${ym}">Save note</button>`, { label: 'Month note' });
}
function openGoal() {
  openSheet(`<div class="between"><button class="iconbtn" data-act="close" aria-label="Close">${svg('close')}</button><b>Savings goal</b><span style="width:44px"></span></div>
    <div class="glass field"><label><span class="k">Name</span><input id="g-name" value="${esc(S.goal.name)}" maxlength="30"></label><label><span class="k">Target</span><input id="g-target" inputmode="decimal" value="${S.goal.target}"></label></div>
    <button class="btn" data-act="savegoal">Save goal</button>`, { label: 'Savings goal' });
}
function openMoveGoal(dir) {
  const M = month(curYM()); const max = dir > 0 ? M.fundNow : S.goal.saved;
  openSheet(`<div class="between"><button class="iconbtn" data-act="close" aria-label="Close">${svg('close')}</button><b>${dir > 0 ? 'Add to ' + esc(S.goal.name) : 'Use goal savings'}</b><span style="width:44px"></span></div>
    <p class="small muted" style="margin:0;text-align:center">${dir > 0 ? 'Moves money from your Grocery Fund (' + $m(max) + ' available).' : 'Moves money back to your Grocery Fund (' + $m(max) + ' saved).'}</p>
    <div class="row" style="justify-content:center;gap:0"><span style="font-size:44px;font-weight:800;opacity:.7">$</span><input id="mv-amt" class="amount-in" inputmode="decimal" placeholder="0" style="width:70%" aria-label="Amount" autofocus></div>
    <button class="btn" data-act="domove" data-dir="${dir}">Move money</button>`, { label: 'Move money' });
}
function openChallenges() {
  openSheet(`<div class="between"><button class="iconbtn" data-act="close" aria-label="Close">${svg('close')}</button><b>Pick challenges</b><span style="width:44px"></span></div>
    <div class="glass field">${Object.entries(CHALLENGES).map(([id, c]) => `<div class="frow"><span style="flex:1">${c.name}</span><button class="switch ${S.challenges.includes(id) ? 'on' : ''}" role="switch" aria-checked="${S.challenges.includes(id)}" aria-label="${c.name}" data-act="chtoggle" data-id="${id}"></button></div>`).join('')}</div>
    <button class="btn" data-act="close">Done</button>`, { label: 'Challenges' });
}
let pinBuf = ''; let pinMode = null; let pinFirst = '';
function hashPin(p) { let h = 5381; for (const ch of 'pocket:' + p) h = ((h << 5) + h + ch.charCodeAt(0)) | 0; return String(h); }
function drawPin(msg) {
  const root = document.getElementById('sheet-root');
  const title = pinMode === 'unlock' ? 'Enter your PIN' : pinMode === 'confirm' ? 'Type it again' : 'Choose a 4-digit PIN';
  root.innerHTML = `<div class="pin" style="background:var(--base)"><div class="wall" style="position:absolute" aria-hidden="true"><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div><div class="tint"></div></div>
    <div class="col" style="align-items:center;gap:8px;position:relative">${svg('lock')}<b style="font-size:20px">${msg || title}</b></div>
    <div class="dots" id="pin-dots" style="position:relative">${[0, 1, 2, 3].map(i => `<i class="${i < pinBuf.length ? 'f' : ''}"></i>`).join('')}</div>
    <div class="pad" style="position:relative">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => `<button class="glass" data-act="pinkey" data-k="${k}" aria-label="${k}">${k}</button>`).join('')}${pinMode === 'unlock' ? '<span></span>' : `<button class="glass" data-act="pincancel" aria-label="Cancel" style="font-size:14px">Cancel</button>`}<button class="glass" data-act="pinkey" data-k="0" aria-label="0">0</button><button class="glass" data-act="pinkey" data-k="del" aria-label="Delete">⌫</button></div>
    ${pinMode === 'set' && S.settings.pin ? '<button class="link" data-act="pinremove" style="position:relative">Remove PIN</button>' : ''}</div>`;
  document.getElementById('nav').classList.add('hidden');
}
function pinKey(k) {
  if (k === 'del') { pinBuf = pinBuf.slice(0, -1); drawPin(); return; }
  if (pinBuf.length >= 4) return;
  pinBuf += k; drawPin();
  if (pinBuf.length < 4) return;
  const p = pinBuf; pinBuf = '';
  setTimeout(() => {
    if (pinMode === 'unlock') {
      if (hashPin(p) === S.settings.pin) { document.getElementById('sheet-root').innerHTML = ''; afterUnlock(); }
      else { drawPin('Wrong PIN, try again'); const d = document.getElementById('pin-dots'); d && d.classList.add('shake'); if (navigator.vibrate) try { navigator.vibrate(80); } catch (e) {} }
    } else if (pinMode === 'set') { pinFirst = p; pinMode = 'confirm'; drawPin(); }
    else if (pinMode === 'confirm') {
      if (p === pinFirst) { S.settings.pin = hashPin(p); save(); document.getElementById('sheet-root').innerHTML = ''; toast('PIN set'); render(); }
      else { pinMode = 'set'; drawPin('Didn’t match — choose again'); }
    }
  }, 120);
}

/* ---------- New month + recap ---------- */
function openNewMonth(ym, ahead) {
  const prevYM = addMonths(ym, -1);
  const hasPrev = !ahead && prevYM >= S.settings.startMonth && ymOf(today()) > prevYM;
  const P = hasPrev ? month(prevYM) : null;
  const plan = nextPlan(hasPrev ? prevYM : ym);
  const planFor = hasPrev ? ym : addMonths(ym, 1);
  const msg = `Hi! For ${monthName(planFor)} I need about ${money(plan.ask, false)}: rent ${money(plan.rent, false)}, utilities ~${money(plan.util, false)}${plan.other > 0 ? ' and daily things ~' + money(Math.round(plan.other), false) : ''}.${plan.groc > 0 && plan.groceryNeed <= 0 ? ' Groceries are covered by what I saved.' : plan.groceryNeed > 0 ? ' Groceries ~' + money(Math.round(plan.groceryNeed), false) + '.' : ''}${plan.debt > 0 ? ' Plus ' + money(Math.round(plan.debt), false) + ' I went over last month.' : ''}`;
  const html = `<div class="between"><span class="h-sub">${hasPrev ? monthName(ym) + ' 1' : 'Plan ahead'}</span><button class="iconbtn" data-act="close" aria-label="Close">${svg('close')}</button></div>
    <h1 class="h-title">${hasPrev ? 'New month' : 'Plan for ' + monthName(planFor)}</h1>
    ${P ? `<div class="glass card col" style="gap:4px;border-radius:28px;padding:20px"><span class="lbl">${monthName(prevYM)} is done</span><span style="font-size:38px;font-weight:800;letter-spacing:-1.5px;line-height:1.1" class="amt">${P.leftover >= 0 ? 'You saved ' + money(P.leftover, false) : 'Over by ' + money(-P.leftover, false)}</span><span class="muted">${P.leftover >= 0 ? 'Added to your Grocery Fund · now ' + $m(P.fundEnd, false) : 'It’s added to this month’s plan.'}</span></div>` : ''}
    <div class="glass card col" style="padding:8px 18px 14px"><b style="padding:8px 0">Plan for ${monthName(planFor)}</b>
      ${[['Rent', plan.rent], [utilHistory().length ? 'Utilities (your average)' : 'Utilities (your guess)', plan.util], ['Food out, travel, other (usual)', plan.other], ['Groceries' + (plan.groceryNeed <= 0 && plan.groc > 0 ? ' · paid by Grocery Fund' : ''), plan.groceryNeed]].concat(plan.debt > 0 ? [['Went over last month', plan.debt]] : []).map(([k, v]) => `<div class="between" style="min-height:40px;border-bottom:1px solid var(--line);font-size:14px"><span class="muted">${k}</span><b class="amt">${money(Math.round(v), false)}</b></div>`).join('')}
      <div class="between" style="padding-top:12px"><b>Ask home for about</b><span class="amt" style="font-size:34px;font-weight:800;letter-spacing:-1px">${money(plan.ask, false)}</span></div>
      ${plan.fundAfter > 0 ? `<span class="small muted">Your Grocery Fund keeps about ${$m(Math.round(plan.fundAfter), false)} after groceries.</span>` : ''}
    </div>
    <div class="glass card col" style="gap:12px"><b>Message for home</b><div class="msg" id="home-msg">${esc(msg)}</div>
      <div class="grid2"><button class="btn small ghost" data-act="copymsg" style="width:100%">${svg('copy')} Copy</button><button class="btn small" data-act="sharemsg" style="width:100%">${svg('send')} Send</button></div></div>
    <div class="glass card between"><span class="col"><b style="font-size:14px">Monthly backup</b><span class="small muted">${S.lastBackup ? 'Last: ' + dateNice(S.lastBackup) : 'Not backed up yet'}</span></span><button class="btn small" data-act="backup">Back up</button></div>
    <button class="btn" data-act="close" style="margin-bottom:12px">Let’s go</button>`;
  openSheet(html, { full: true, label: 'New month' });
  window.__msg = msg;
}
let rec = null;
function openRecap(ym, then) {
  const M = month(ym); const ds = dayStats(ym);
  let big = 0, bigDay = null; ds.forEach((d, i) => { if (d.disc > big) { big = d.disc; bigDay = ym + '-' + String(i + 1).padStart(2, '0'); } });
  const top = CATS.filter(c => c.id !== 'rent' && c.id !== 'bills').map(c => ({ c, v: M.byCat[c.id] })).sort((a, b) => b.v - a.v)[0];
  const P = addMonths(ym, -1) >= S.settings.startMonth ? month(addMonths(ym, -1)) : null;
  const earned = Object.entries(S.flags.badges || {}).filter(([, d]) => ymOf(d) === ym).map(([id]) => badgeList().find(b => b.id === id)).filter(Boolean);
  const slides = [
    `<span class="h-sub">${monthName(ym)} recap</span><span style="font-size:18px;font-weight:600">${M.leftover >= 0 ? 'You saved' : 'You went over by'}</span><span class="huge amt">${money(Math.abs(M.leftover), false)}</span><span class="muted">${P ? (M.leftover - P.leftover >= 0 ? money(M.leftover - P.leftover, false) + ' more than ' + monthName(P.ym) : money(P.leftover - M.leftover, false) + ' less than ' + monthName(P.ym)) : 'Your first month with Pocket!'}</span>`,
    `<span class="h-sub">Top category (after rent)</span><span class="huge" style="font-size:56px">${top && top.v > 0 ? top.c.name : '—'}</span><span class="muted amt">${top && top.v > 0 ? money(top.v) + ' this month' : 'Barely any spending!'}</span>`,
    `<span class="h-sub">Biggest day</span><span class="huge" style="font-size:52px">${bigDay ? dateNice(bigDay) : '—'}</span><span class="muted amt">${bigDay ? money(big) : 'No big days at all'}</span>`,
    `<span class="h-sub">No-spend days</span><span class="huge">${noSpendDays(ym)}</span><span class="muted">${regret(ym) > 0 ? $m(regret(ym)) + ' went to purchases tagged Regret' : 'No regret purchases — nice!'}</span>`,
    `<span class="h-sub">Badges this month</span>${earned.length ? `<div class="badges" style="width:100%;max-width:340px">${earned.map(b => `<div class="badge"><span class="bi">${svg(b.icon)}</span><span>${b.name}</span></div>`).join('')}</div>` : `<span class="huge" style="font-size:52px">Keep going</span><span class="muted">New badges are waiting for you</span>`}<span class="muted" style="margin-top:12px">From home: ${$m(M.received, false)}</span>`
  ];
  rec = { ym, i: 0, slides, then };
  drawRecap();
}
function drawRecap() {
  const root = document.getElementById('sheet-root');
  root.innerHTML = `<div class="story" role="dialog" aria-modal="true" aria-label="Monthly recap">
    <div class="prog">${rec.slides.map((s, i) => `<i class="${i <= rec.i ? 'on' : ''}"></i>`).join('')}</div>
    <div class="between" style="margin-top:8px"><b>${monthName(rec.ym)} recap</b><button class="iconbtn" data-act="recapclose" aria-label="Close recap">${svg('close')}</button></div>
    <button class="slide fade-in" data-act="recapnext" style="background:none;border:0;color:var(--text)">${rec.slides[rec.i]}</button>
    <div class="grid2"><button class="btn ghost" data-act="recapshare">${svg('send')} Share</button><button class="btn" data-act="recapnext">${rec.i === rec.slides.length - 1 ? 'Done' : 'Next'}</button></div></div>`;
  document.getElementById('nav').classList.add('hidden');
  if (rec.i === 0) { confetti(); ding(2); }
}

/* ---------- Backup / restore ---------- */
function backup() {
  const data = JSON.stringify(S, null, 1);
  const name = 'pocket-backup-' + today() + '.json';
  const blob = new Blob([data], { type: 'application/json' });
  const file = (typeof File !== 'undefined') ? new File([blob], name, { type: 'application/json' }) : null;
  const done = () => { S.lastBackup = today(); save(); toast('Backup saved'); checkNewBadges(); render(); };
  if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
    navigator.share({ files: [file], title: 'Pocket backup' }).then(done).catch(() => {});
    return;
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); done();
}
function restore(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!d || !Array.isArray(d.tx) || !d.settings) throw new Error('bad');
      if (!confirmBox('Replace everything on this phone with this backup?')) return;
      localStorage.setItem(KEY, JSON.stringify(d)); load(); toast('Backup restored'); go('home');
    } catch (e) { toast('That file isn’t a Pocket backup'); }
  };
  r.readAsText(file);
}
function confirmBox(msg) { return window.confirm(msg); }

/* =========================================================
   Events
   ========================================================= */
document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]');
  if (g && !e.target.closest('[data-act]')) { if (document.querySelector('#sheet-root .sheet')) closeSheetQuiet(); go(g.dataset.go); return; }
  const el = e.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act; const ds = el.dataset;
  switch (a) {
    case 'add': openAdd(Object.assign({}, ds.cat ? { cat: ds.cat } : {}, ds.amount ? { amount: ds.amount } : {})); break;
    case 'close': closeSheet(); break;
    case 'dtype': draft.type = ds.v; if (ds.v !== 'in' && draft.cat === 'in') draft.cat = 'grocery'; drawAdd(); break;
    case 'dcat': draft.cat = ds.v; if (ds.v === 'rent' && !draft.amount) draft.amount = String(S.settings.rent); drawAdd(); break;
    case 'dbill': draft.bill = ds.v; drawAdd(); break;
    case 'dmood': draft.mood = draft.mood === ds.v ? '' : ds.v; drawAdd(); break;
    case 'dsplit': draft.split = !draft.split; drawAdd(); break;
    case 'saveTx': saveTx(); break;
    case 'edit': openAdd({ id: ds.id }); break;
    case 'del': if (confirmBox('Delete this entry?')) { S.tx = S.tx.filter(x => x.id !== draft.id); save(); toast('Deleted'); closeSheet(); } break;
    case 'afford': openAfford(draft && document.querySelector('#sheet-root .sheet') ? { amount: draft.amount, what: draft.note } : {}); break;
    case 'asplit': aff.split = !aff.split; drawAfford(); break;
    case 'affadd': { const amt = aff.amount; const what = aff.what; const sp = aff.split; document.getElementById('sheet-root').innerHTML = ''; openAdd({ amount: amt, note: what, split: sp, cat: 'food' }); break; }
    case 'hide': S.settings.hide = !S.settings.hide; save(); render(); break;
    case 'nextwall': S.settings.wall = (S.settings.wall + 1) % WALLS.length; save(); applyLook(); toast(WALLS[S.settings.wall].name); el.setAttribute('aria-label', 'Next wallpaper (' + WALLS[S.settings.wall].name + ')'); break;
    case 'setwall': S.settings.wall = Number(ds.i); save(); if (!S.setup) { applyLook(); document.querySelectorAll('.wt').forEach((b, i) => { b.classList.toggle('on', i === S.settings.wall); b.setAttribute('aria-pressed', i === S.settings.wall); b.querySelector('.nm').textContent = WALLS[i].name + (i === S.settings.wall ? ' ✓' : ''); }); } else render(); break;
    case 'toggle': S.settings[ds.key] = !S.settings[ds.key]; save(); render(); break;
    case 'theme': S.settings.theme = ds.v; save(); render(); break;
    case 'tmove': { const t = S.settings.tiles; const i = Number(ds.i), j = i + Number(ds.k); if (j < 0 || j >= t.length) break; [t[i], t[j]] = [t[j], t[i]]; save(); render(); break; }
    case 'tshow': { const h = S.settings.hidden; const i = h.indexOf(ds.id); if (i >= 0) h.splice(i, 1); else h.push(ds.id); save(); render(); break; }
    case 'calmove': { const n = addMonths(calYM, Number(ds.k)); if (n < S.settings.startMonth || n > curYM()) { toast(n < S.settings.startMonth ? 'Pocket starts in ' + monthName(S.settings.startMonth) : 'That month hasn’t started'); break; } calYM = n; calSel = null; render(); break; }
    case 'calday': calSel = calSel === ds.d ? null : ds.d; render(); break;
    case 'repmove': { const n = addMonths(repYM, Number(ds.k)); if (n < S.settings.startMonth || n > curYM()) { toast(n < S.settings.startMonth ? 'Pocket starts in ' + monthName(S.settings.startMonth) : 'That month hasn’t started'); break; } repYM = n; render(); break; }
    case 'catlist': { const c = catOf(ds.cat); const list = txIn(curYM()).filter(t => t.cat === ds.cat).sort((a, b) => b.date.localeCompare(a.date)); openSheet(`<div class="between"><button class="iconbtn" data-act="close" aria-label="Close">${svg('close')}</button><b>${c.name} · ${monthName(curYM())}</b><span style="width:44px"></span></div><div class="glass card list" style="padding:2px 16px">${list.length ? list.map(txRow).join('') : '<div class="empty">Nothing here yet this month.</div>'}</div><button class="btn" data-act="add" data-cat="${c.id}">Add ${c.name.toLowerCase()}</button>`, { label: c.name }); break; }
    case 'explainLeft': { const n = info(); const M = n.M; openSheet(`<div class="between"><button class="iconbtn" data-act="close" aria-label="Close">${svg('close')}</button><b>How “Money left” works</b><span style="width:44px"></span></div><div class="glass card col" style="padding:6px 18px">${[['From home', M.received], ['Spent from your money', -M.spentFromMoney], ['Groceries paid by Grocery Fund', M.groceryFromFund, true], ...(M.debtIn ? [['Over last month', -M.debtIn]] : []), ['Kept aside for bills not paid yet', -M.kept]].map(([k, v, info]) => `<div class="between" style="min-height:44px;border-bottom:1px solid var(--line);font-size:14px"><span class="muted">${k}</span><b class="amt">${info ? '(' + money(v) + ')' : money(v)}</b></div>`).join('')}<div class="between" style="min-height:52px"><b>Money left</b><b class="amt" style="font-size:20px">${money(M.left)}</b></div></div><p class="small muted" style="margin:0 4px;line-height:1.45">Groceries come out of your Grocery Fund first, so they only reduce “Money left” once the fund is empty. Rent and utilities are kept aside until you log them.</p>`, { label: 'Money left' }); break; }
    case 'note': openNote(ds.ym); break;
    case 'savenote': { const v = document.getElementById('note-text').value.trim(); if (v) S.notes[ds.ym] = v; else delete S.notes[ds.ym]; save(); toast('Note saved'); closeSheet(); checkNewBadges(); break; }
    case 'editgoal': openGoal(); break;
    case 'savegoal': { S.goal.name = document.getElementById('g-name').value.trim() || 'My goal'; S.goal.target = Math.max(0, parseFloat(document.getElementById('g-target').value) || 0); save(); closeSheet(); break; }
    case 'togoal': openMoveGoal(1); break;
    case 'usegoal': openMoveGoal(-1); break;
    case 'domove': {
      const v = r2(parseFloat(document.getElementById('mv-amt').value) || 0); const dir = Number(ds.dir); const M = month(curYM());
      const max = dir > 0 ? M.fundNow : S.goal.saved; if (v <= 0 || v > max + 0.001) { toast('Enter up to ' + money(max)); break; }
      S.goal.moves.push({ date: today() < S.settings.startMonth + '-01' ? S.settings.startMonth + '-01' : today(), amount: dir * v }); S.goal.saved = r2(S.goal.saved + dir * v); save();
      toast(dir > 0 ? 'Moved ' + money(v) + ' to ' + S.goal.name : 'Moved ' + money(v) + ' back to Grocery Fund'); if (dir > 0) ding(1);
      closeSheet(); checkNewBadges(); if (S.goal.saved >= S.goal.target && S.goal.target > 0) confetti(); break;
    }
    case 'pickch': openChallenges(); break;
    case 'chtoggle': { const i = S.challenges.indexOf(ds.id); if (i >= 0) S.challenges.splice(i, 1); else S.challenges.push(ds.id); save(); openChallenges(); break; }
    case 'paidback': { const o = S.owed.find(x => x.id === ds.id); if (!o) break; o.paid = true; S.tx.push({ id: uid(), t: Date.now(), type: 'refund', cat: o.cat || 'other', amount: o.amount, note: o.name + ' paid back', date: today() < S.settings.startMonth + '-01' ? S.settings.startMonth + '-01' : today() }); save(); toast(o.name + ' paid you back ' + money(o.amount)); ding(1); render(); break; }
    case 'pinset': pinMode = 'set'; pinBuf = ''; drawPin(); break;
    case 'pinkey': pinKey(ds.k); break;
    case 'pincancel': document.getElementById('sheet-root').innerHTML = ''; render(); break;
    case 'pinremove': S.settings.pin = ''; save(); document.getElementById('sheet-root').innerHTML = ''; toast('PIN removed'); render(); break;
    case 'backup': backup(); break;
    case 'restore': document.getElementById('restore-file').click(); break;
    case 'reset': if (confirmBox('Erase ALL your Pocket data on this phone? Make a backup first if you might need it.') && confirmBox('Are you really sure? This can’t be undone.')) { localStorage.removeItem(KEY); load(); go('home'); toast('Everything erased'); } break;
    case 'finishSetup': {
      S.settings.name = document.getElementById('su-name').value.trim();
      S.settings.rent = Math.max(0, parseFloat(document.getElementById('su-rent').value) || 0);
      S.settings.utilEstimate = Math.max(0, parseFloat(document.getElementById('su-util').value) || 0);
      S.settings.startMonth = document.getElementById('su-start').value || S.settings.startMonth;
      S.setup = true; S.seen.month = curYM(); save(); ding(2); confetti(); go('home'); break;
    }
    case 'newmonth': openNewMonth(ds.ym, true); break;
    case 'recap': openRecap(ds.ym); break;
    case 'recapnext': if (rec.i < rec.slides.length - 1) { rec.i++; drawRecap(); } else endRecap(); break;
    case 'recapclose': endRecap(); break;
    case 'recapshare': { const M = month(rec.ym); const t = `My ${monthName(rec.ym)} with Pocket: ${M.leftover >= 0 ? 'saved ' + money(M.leftover, false) : 'went over by ' + money(-M.leftover, false)}, ${noSpendDays(rec.ym)} no-spend days.`; shareText(t); break; }
    case 'copymsg': copyText(window.__msg); break;
    case 'sharemsg': shareText(window.__msg); break;
  }
});
function closeSheetQuiet() { document.getElementById('sheet-root').innerHTML = ''; document.body.style.overflow = ''; }
function endRecap() { const then = rec && rec.then; rec = null; document.getElementById('sheet-root').innerHTML = ''; if (then) then(); else render(); }
function copyText(t) {
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(() => toast('Copied — paste it in your chat'), () => fallbackCopy(t));
  else fallbackCopy(t);
}
function fallbackCopy(t) { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast('Copied'); } catch (e) { toast('Could not copy'); } ta.remove(); }
function shareText(t) { if (navigator.share) navigator.share({ text: t }).catch(() => {}); else copyText(t); }

document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.draft && draft) {
    draft[el.dataset.draft] = el.value;
    if (el.dataset.draft === 'amount' || el.dataset.draft === 'date') { const fn = document.getElementById('fund-note'); if (fn) fn.innerHTML = fundNoteText(); }
    if (el.dataset.draft === 'amount' && draft.split) { const sa = document.querySelector('[data-draft="splitAmt"]'); if (sa) sa.placeholder = (parseFloat(el.value) || 0) ? String(r2(parseFloat(el.value) / 2)) : 'Half'; }
  }
  if (el.dataset.aff && aff) {
    aff[el.dataset.aff] = el.value;
    if (el.dataset.aff === 'amount') { const r = document.getElementById('aff-result'); if (r) r.innerHTML = affVerdict(); }
  }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.set) {
    const k = el.dataset.set; let v = el.value;
    if (k === 'rent' || k === 'utilEstimate') v = Math.max(0, parseFloat(v) || 0);
    if (k === 'startMonth' && !v) return;
    S.settings[k] = v; save(); invalidate(); toast('Saved'); applyLook();
  }
  if (el.id === 'restore-file' && el.files && el.files[0]) restore(el.files[0]);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.querySelector('#sheet-root .sheet')) closeSheet();
  if (e.key === 'Enter' && e.target.matches('[data-draft="amount"],[data-draft="note"]')) saveTx();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && S && S.setup) { invalidate(); if (!document.querySelector('#sheet-root .sheet, #sheet-root .story, #sheet-root .pin')) { render(); maybeMonthStart(); } }
});

/* =========================================================
   Start
   ========================================================= */
function maybeMonthStart() {
  if (!S.setup) return;
  const now = ymOf(today()); const prev = addMonths(now, -1);
  if (S.seen.month === now) return;
  S.seen.month = now; save();
  if (prev >= S.settings.startMonth) openRecap(prev, () => openNewMonth(now));
}
function afterUnlock() { render(); maybeMonthStart(); checkNewBadges(); }
function fitScreen() {
  // iPhone home-screen apps that draw under the Dynamic Island can report a screen that is too short.
  // Measure the missing strip and let the layout stretch over it.
  let g = 0;
  if (window.navigator.standalone === true) {
    const full = Math.max(screen.height, screen.width) > innerHeight && innerWidth < innerHeight ? Math.max(screen.height, screen.width) : innerHeight;
    g = Math.max(0, Math.round(full - innerHeight));
    if (g > 140) g = 0;
  }
  document.documentElement.style.setProperty('--gap', g + 'px');
}
function start() {
  fitScreen(); addEventListener('resize', fitScreen); addEventListener('orientationchange', () => setTimeout(fitScreen, 300));
  load(); render();
  if (S.setup && S.settings.pin) { pinMode = 'unlock'; pinBuf = ''; drawPin(); }
  else if (S.setup) { maybeMonthStart(); checkNewBadges(); }
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
}
start();
})();
