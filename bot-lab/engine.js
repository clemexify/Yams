'use strict';
// Moteur de Yams Expert (5 colonnes) pour la R&D du bot. Règles reprises d'app.js :
// lignes 1..6, +, −, Full, Suite, Carré, Yams ; bonus +30 si 1..6 >= 60 ; Diff = + − −.
// Colonnes : normal (libre), desc (1 -> Yams), asc (Yams -> 1), seche (dés issus d'un
// lancer des 5 dés), annonce (annonce au 1er lancer, puis placement obligatoire là).

const ROWS = ['1', '2', '3', '4', '5', '6', 'plus', 'minus', 'full', 'suite', 'carre', 'yams'];
const NR = 12, PLUS = 6, MINUS = 7, FULL = 8, SUITE = 9, CARRE = 10, YAMS = 11;
const COLS = ['normal', 'desc', 'asc', 'seche', 'annonce'];
const NORMAL = 0, DESC = 1, ASC = 2, SECHE = 3, ANN = 4, NC = 5;
const ALL = (1 << NR) - 1;

// ── Combinatoire des dés ────────────────────────────────
const code = c => c[0] + 6 * c[1] + 36 * c[2] + 216 * c[3] + 1296 * c[4] + 7776 * c[5];
function multisets(n) {
  const out = [];
  const rec = (i, left, cur) => {
    if (i === 5) { cur[5] = left; out.push(cur.slice()); return; }
    for (let k = left; k >= 0; k--) { cur[i] = k; rec(i + 1, left - k, cur); }
  };
  rec(0, n, [0, 0, 0, 0, 0, 0]);
  return out;
}
const fact = [1, 1, 2, 6, 24, 120];
const DICE = multisets(5);                       // 252 tirages finaux (comptes par face)
const ND = DICE.length;
const DIDX = new Int16Array(46656).fill(-1);
DICE.forEach((c, i) => DIDX[code(c)] = i);
const KEEPS = [];                                // 462 sous-ensembles gardés
for (let n = 0; n <= 5; n++) KEEPS.push(...multisets(n));
const NK = KEEPS.length;
const KIDX = new Int16Array(46656).fill(-1);
KEEPS.forEach((c, i) => KIDX[code(c)] = i);
const KSIZE = KEEPS.map(c => c.reduce((a, b) => a + b, 0));
const KEMPTY = KIDX[0];
// Transitions : garder K puis relancer 5-|K| dés
const KT = KEEPS.map(kc => {
  const m = 5 - kc.reduce((a, b) => a + b, 0);
  const idx = [], p = [];
  for (const r of multisets(m)) {
    let w = fact[m] / Math.pow(6, m);
    for (const x of r) w /= fact[x];
    idx.push(DIDX[code(kc.map((v, i) => v + r[i]))]); p.push(w);
  }
  return { idx: Int16Array.from(idx), p: Float64Array.from(p) };
});
// Sous-ensembles gardables de chaque tirage
const SUB = DICE.map(c => {
  const out = [];
  const rec = (i, cur) => {
    if (i === 6) { out.push(KIDX[code(cur)]); return; }
    for (let k = 0; k <= c[i]; k++) { cur[i] = k; rec(i + 1, cur); }
  };
  rec(0, [0, 0, 0, 0, 0, 0]);
  return Int16Array.from(out);
});

// ── Score des figures ───────────────────────────────────
function scoreOf(row, c) {
  const s = c.reduce((a, v, i) => a + v * (i + 1), 0);
  if (row < 6) return c[row] * (row + 1);
  if (row === PLUS) return s;
  if (row === MINUS) return s;               // compté en négatif dans la Diff
  const mx = Math.max(...c);
  if (row === FULL) return ((mx === 3 && c.includes(2)) || mx === 5) ? s + 20 : 0;
  if (row === SUITE) {
    const ok = (c[0] === 1 && c[1] === 1 && c[2] === 1 && c[3] === 1 && c[4] === 1) ||
               (c[1] === 1 && c[2] === 1 && c[3] === 1 && c[4] === 1 && c[5] === 1);
    return ok ? s + 30 : 0;
  }
  if (row === CARRE) { const f = c.findIndex(v => v >= 4); return f < 0 ? 0 : (f + 1) * 4 + 40; }
  if (row === YAMS) return mx === 5 ? s + 50 : 0;
  return 0;
}
const SC = ROWS.map((_, r) => Int16Array.from(DICE.map(c => scoreOf(r, c))));
const DSUM = Int16Array.from(DICE.map(c => c.reduce((a, v, i) => a + v * (i + 1), 0)));
const FIGS = [FULL, SUITE, CARRE, YAMS];
const isFig = r => r >= FULL;

// ── Hasard reproductible ────────────────────────────────
function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

// ── État d'une partie ───────────────────────────────────
function newState() {
  return { mask: [0, 0, 0, 0, 0], up: [0, 0, 0, 0, 0], val: COLS.map(() => new Array(NR).fill(null)), turn: 0 };
}
function cloneState(s) {
  return { mask: s.mask.slice(), up: s.up.slice(), val: s.val.map(v => v.slice()), turn: s.turn };
}
const popc = x => { let n = 0; while (x) { x &= x - 1; n++; } return n; };
function nextDesc(m) { for (let r = 0; r < NR; r++) if (!(m >> r & 1)) return r; return -1; }
function nextAsc(m) { for (let r = NR - 1; r >= 0; r--) if (!(m >> r & 1)) return r; return -1; }
function colTotal(s, c) {
  const v = s.val[c]; let t = 0, up = 0;
  for (let r = 0; r < 6; r++) up += v[r] || 0;
  t += up + (up >= 60 && v.slice(0, 6).every(x => x !== null) ? 30 : 0);
  if (v[PLUS] !== null && v[MINUS] !== null) t += v[PLUS] - v[MINUS];
  for (const r of FIGS) t += v[r] || 0;
  return t;
}
const total = s => COLS.reduce((a, _, c) => a + colTotal(s, c), 0);
function place(s, c, r, d, cross) {
  // Un − barré compte comme rempli avec la somme : on n'exploite pas le barrage forcé.
  const pts = cross && r !== 7 ? 0 : SC[r][d];
  s.val[c][r] = pts; s.mask[c] |= 1 << r;
  if (r < 6) s.up[c] += pts;
  s.turn++;
}

module.exports = {
  ROWS, NR, PLUS, MINUS, FULL, SUITE, CARRE, YAMS, COLS, NORMAL, DESC, ASC, SECHE, ANN, NC, ALL,
  DICE, ND, DIDX, KEEPS, NK, KIDX, KSIZE, KEMPTY, KT, SUB, SC, DSUM, FIGS, isFig, code,
  rng, newState, cloneState, popc, nextDesc, nextAsc, colTotal, total, place,
};
