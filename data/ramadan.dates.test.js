// Standalone check for the Ramadan date math in ./ramadan.ts — run: `node data/ramadan.dates.test.js`
// No test runner in this repo, so this mirrors the tabular-Islamic arithmetic and asserts it against
// externally-known Umm al-Qura dates plus the gating behaviour. If you change the algorithm in
// ramadan.ts, keep these anchors passing.
const ISLAMIC_EPOCH = 1948439.5, MS = 86400000, OFFSET = 0, TOTAL = 30;
const islamicToJD = (y, m, d) => d + Math.ceil(29.5 * (m - 1)) + (y - 1) * 354 + Math.floor((3 + 11 * y) / 30) + ISLAMIC_EPOCH - 1;
function jdToDate(jd) {
  const z = Math.floor(jd + 0.5); let a = z;
  if (z >= 2299161) { const al = Math.floor((z - 1867216.25) / 36524.25); a = z + 1 + al - Math.floor(al / 4); }
  const b = a + 1524, c = Math.floor((b - 122.1) / 365.25), dd = Math.floor(365.25 * c), e = Math.floor((b - dd) / 30.6001);
  const day = b - dd - Math.floor(30.6001 * e), month = e < 14 ? e - 1 : e - 13, year = month > 2 ? c - 4716 : c - 4715;
  return new Date(year, month - 1, day);
}
function ramadanFor(hy) {
  const s = jdToDate(islamicToJD(hy, 9, 1)); s.setDate(s.getDate() + OFFSET);
  const e = new Date(s); e.setDate(e.getDate() + TOTAL - 1); e.setHours(23, 59, 59, 999);
  return { hijriYear: hy, start: s, end: e };
}
const mid = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
function period(date) {
  const ap = Math.floor((date.getFullYear() - 622) * 33 / 32) + 1; let next = null;
  for (let hy = ap - 2; hy <= ap + 2; hy++) {
    const p = ramadanFor(hy);
    if (date >= p.start && date <= p.end) return p;
    if (p.start > date && (!next || p.start < next.start)) next = p;
  }
  return next ?? ramadanFor(ap + 1);
}
const dayNum = date => { const p = period(date); return date < p.start || date > p.end ? 0 : Math.floor((mid(date) - mid(p.start)) / MS) + 1; };
const active = date => dayNum(date) > 0;
function season(date) { const p = period(date); const ss = new Date(p.start); ss.setDate(ss.getDate() - 30); return date >= ss && date <= p.end; }
const fmt = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

let fails = 0;
const check = (name, got, exp) => { const ok = got === exp; if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'} ${name}: got=${got} exp=${exp}`); };

// Anchors verified against Umm al-Qura
check('Ramadan 1446 start', fmt(ramadanFor(1446).start), '2025-03-01');
check('Ramadan 1447 start', fmt(ramadanFor(1447).start), '2026-02-18');
check('Ramadan 1448 start', fmt(ramadanFor(1448).start), '2027-02-08');

// Gating: 2026-06-20 is months past Ramadan 1447 → feature disabled, next is 1448 (2027)
check('today disabled (active)', active(new Date(2026, 5, 20)), false);
check('today disabled (season)', season(new Date(2026, 5, 20)), false);
check('today -> next is 1448', period(new Date(2026, 5, 20)).hijriYear, 1448);

// 2027 Ramadan reactivates
check('2027-02-08 active', active(new Date(2027, 1, 8)), true);
check('2027-03-09 last day', dayNum(new Date(2027, 2, 9)), 30);
check('2027-03-10 ended', active(new Date(2027, 2, 10)), false);

// Robustness: across 2027-2050 the chosen period is always active-or-soonest, never skipping a sooner one
for (let y = 2027; y <= 2050; y++) {
  const d = new Date(y, 0, 1), p = period(d), prev = ramadanFor(p.hijriYear - 1);
  const okFuture = (d >= p.start && d <= p.end) || p.start > d;
  const okNoSkip = prev.end < d || (d >= prev.start && d <= prev.end);
  if (!okFuture || !okNoSkip) { fails++; console.log(`FAIL sweep ${y} start=${fmt(p.start)} prevEnd=${fmt(prev.end)}`); }
}
console.log('sweep 2027-2050 done');

console.log(fails === 0 ? '\nALL PASS' : `\n${fails} FAILED`);
process.exit(fails ? 1 : 0);
