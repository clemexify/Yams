'use strict';
// Moteur générique : toute combinaison de colonnes (normal, desc, asc, milieu, seche, annonce,
// double) et de lignes (base, avec Paire/Brelan, avec petite suite). Règles reprises d'app.js.
const E = require('./engine'); // combinatoire des dés (DICE, KEEPS, KT, SUB...)
const { DICE, ND } = E;

const ROWSETS = {
  base: ['1', '2', '3', '4', '5', '6', 'plus', 'minus', 'full', 'suite', 'carre', 'yams'],
  pb: ['1', '2', '3', '4', '5', '6', 'plus', 'minus', 'paire', 'brelan', 'full', 'suite', 'carre', 'yams'],
  suites: ['1', '2', '3', '4', '5', '6', 'plus', 'minus', 'full', 'psuite', 'suite', 'carre', 'yams'],
};
const FIG = new Set(['paire', 'brelan', 'full', 'psuite', 'suite', 'carre', 'yams']);

function scoreRow(row, c) {
  const s = c.reduce((a, v, i) => a + v * (i + 1), 0);
  if ('123456'.includes(row)) return c[+row - 1] * +row;
  if (row === 'plus' || row === 'minus') return s;
  const mx = Math.max(...c);
  if (row === 'paire') { for (let f = 5; f >= 0; f--) if (c[f] >= 2) return (f + 1) * 2 + 10; return 0; }
  if (row === 'brelan') { for (let f = 5; f >= 0; f--) if (c[f] >= 3) return (f + 1) * 3 + 20; return 0; }
  if (row === 'full') return ((mx === 3 && c.includes(2)) || mx === 5) ? s + 20 : 0;
  if (row === 'suite') {
    const ok = [0, 1, 2, 3, 4].every(i => c[i] === 1) || [1, 2, 3, 4, 5].every(i => c[i] === 1);
    return ok ? s + 30 : 0;
  }
  if (row === 'psuite') return [[0, 1, 2, 3], [1, 2, 3, 4], [2, 3, 4, 5]].some(q => q.every(i => c[i] > 0)) ? 30 : 0;
  if (row === 'carre') { const f = c.findIndex(v => v >= 4); return f < 0 ? 0 : (f + 1) * 4 + 40; }
  if (row === 'yams') return mx === 5 ? s + 50 : 0;
  return 0;
}

// Variante compilée : indices, tables de score, ordres.
function makeVariant(cols, rowset = 'base', name = '') {
  const rows = ROWSETS[rowset];
  const NR = rows.length, NC = cols.length;
  const SC = rows.map(r => Int16Array.from(DICE.map(c => scoreRow(r, c))));
  const isFig = rows.map(r => FIG.has(r));
  const PLUS = rows.indexOf('plus'), MINUS = rows.indexOf('minus');
  const ALL = (1 << NR) - 1;
  return { name, cols, rowset, rows, NR, NC, SC, isFig, PLUS, MINUS, ALL, turns: NR * NC,
    seuil: cols.map(c => c === 'double' ? 120 : 60), prime: cols.map(c => c === 'double' ? 60 : 30) };
}

function newState(V) {
  return { mask: new Array(V.NC).fill(0), up: new Array(V.NC).fill(0), val: V.cols.map(() => new Array(V.NR).fill(null)), turn: 0 };
}
function cloneState(s) { return { mask: s.mask.slice(), up: s.up.slice(), val: s.val.map(v => v.slice()), turn: s.turn }; }

// Cases jouables d'une colonne à contrainte d'ordre (hors Sèche/Annoncée)
function orderedCells(V, kind, m) {
  if (kind === 'desc') { for (let r = 0; r < V.NR; r++) if (!(m >> r & 1)) return [r]; return []; }
  if (kind === 'asc') { for (let r = V.NR - 1; r >= 0; r--) if (!(m >> r & 1)) return [r]; return []; }
  if (kind === 'milieu') {
    if (m === 0) return [V.PLUS, V.MINUS];
    let lo = 99, hi = -1; for (let r = 0; r < V.NR; r++) if (m >> r & 1) { lo = Math.min(lo, r); hi = Math.max(hi, r); }
    const out = []; if (lo - 1 >= 0) out.push(lo - 1); if (hi + 1 < V.NR) out.push(hi + 1); return out;
  }
  const out = []; for (let r = 0; r < V.NR; r++) if (!(m >> r & 1)) out.push(r); return out; // normal, double
}

// Points réellement posés (Double : ×2 aux lancers 1 et 2)
const mult = (V, c, rn) => V.cols[c] === 'double' && rn < 3 ? 2 : 1;
function place(V, s, c, r, d, rn, cross) {
  const pts = cross && r !== V.MINUS ? 0 : V.SC[r][d] * mult(V, c, rn);
  s.val[c][r] = pts; s.mask[c] |= 1 << r;
  if (r < 6) s.up[c] += pts;
  s.turn++;
}
function colTotal(V, s, c) {
  const v = s.val[c]; let up = 0, t = 0;
  for (let r = 0; r < 6; r++) up += v[r] || 0;
  t += up + (up >= V.seuil[c] && v.slice(0, 6).every(x => x !== null) ? V.prime[c] : 0);
  if (v[V.PLUS] !== null && v[V.MINUS] !== null) t += v[V.PLUS] - v[V.MINUS];
  for (let r = 0; r < V.NR; r++) if (V.isFig[r]) t += v[r] || 0;
  return t;
}
const total = (V, s) => V.cols.reduce((a, _, c) => a + colTotal(V, s, c), 0);
// Score au fil de l'eau : bonus dès le seuil, + et − dès qu'ils sont posés
function shaped(V, s) {
  let t = total(V, s);
  for (let c = 0; c < V.NC; c++) {
    if (s.up[c] >= V.seuil[c] && (s.mask[c] & 63) !== 63) t += V.prime[c];
    const v = s.val[c];
    if (v[V.PLUS] !== null && v[V.MINUS] === null) t += v[V.PLUS];
    if (v[V.MINUS] !== null && v[V.PLUS] === null) t -= v[V.MINUS];
  }
  return t;
}

module.exports = { ROWSETS, scoreRow, makeVariant, newState, cloneState, orderedCells, mult, place, colTotal, total, shaped };
