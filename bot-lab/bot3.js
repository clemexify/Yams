'use strict';
// Bot à réseau de neurones : V(état après placement) ≈ points restant à marquer.
// Les décisions de garde restent exactes (espérance sur les 252 tirages), seul
// l'évaluateur des cases change.
const E = require('./engine');
const B = require('./bot');
const { NN } = require('./nn');
const { NR, MINUS, NC, DSUM, SC } = E;

const FIX_DIST = [0.01, 0.03, 0.10, 0.60, 0.22, 0.04];
const P = (() => { // P(bonus) avec une loi fixe, sert d'indice au réseau
  const T = new Float64Array(64 * 61);
  for (let s = 0; s <= 60; s++) T[s] = s >= 60 ? 1 : 0;
  for (let m = 1; m < 64; m++) {
    let f = 0; while (!(m >> f & 1)) f++;
    const rest = m & ~(1 << f);
    for (let s = 0; s <= 60; s++) {
      let p = 0; for (let n = 0; n <= 5; n++) p += FIX_DIST[n] * T[rest * 61 + Math.min(60, s + n * (f + 1))];
      T[m * 61 + s] = s >= 60 ? 1 : p;
    }
  }
  return T;
})();

const NF = 60 + 4 * NC + 1;
function feat(mask, up, turn, x = new Float64Array(NF)) {
  x.fill(0);
  for (let c = 0; c < NC; c++) for (let r = 0; r < NR; r++) if (!(mask[c] >> r & 1)) x[c * NR + r] = 1;
  for (let c = 0; c < NC; c++) {
    const m = mask[c] & 63, o = 60 + 4 * c;
    if (up[c] >= 60) { x[o + 1] = 1; continue; }
    if (m === 63) continue;
    let par = 0; for (let f = 0; f < 6; f++) if (m >> f & 1) par += 3 * (f + 1);
    x[o] = up[c] / 60;
    x[o + 2] = Math.max(-2, Math.min(2, (up[c] - par) / 15));
    x[o + 3] = P[(~m & 63) * 61 + up[c]];
  }
  x[NF - 1] = (60 - turn) / 60;
  return x;
}
const featS = s => feat(s.mask, s.up, s.turn);
// Score « au fil de l'eau » : bonus dès 60 points, + et − comptés dès qu'ils sont posés
// (la vraie Diff n'apparaît qu'avec les deux, ce qui faussait l'apprentissage du −).
function shaped(s) {
  let t = E.total(s);
  for (let c = 0; c < NC; c++) {
    const v = s.val[c];
    if (v[6] !== null && v[7] === null) t += v[6];
    if (v[7] !== null && v[6] === null) t -= v[7];
  }
  for (let c = 0; c < NC; c++) if (s.up[c] >= 60 && (s.mask[c] & 63) !== 63) t += 30;
  return t;
}
const SCALE = 100;

function defaultParams(h = [96, 64]) { return { nn: new NN([NF, ...h, 1], +(process.env.NNSEED || 12345)).toJSON() }; }

class Bot3 extends B.Bot {
  constructor(params) {
    super({ ev: [], dist: [[], [], [], [], []] });
    this.params = params; this.nn = NN.from(params.nn);
    this.extra = (params.ens || []).map(j => NN.from(j));
    this.x = new Float64Array(NF);
  }
  vAfter(s, c, r, n) {
    const mask = s.mask.slice(), up = s.up.slice();
    mask[c] |= 1 << r; if (r < 6) up[c] += n * (r + 1);
    if (mask.every(m => m === E.ALL)) return 0;
    const x = feat(mask, up, s.turn + 1, this.x);
    let v = this.nn.forward(x);
    for (const n of this.extra) v += n.forward(x);
    return v / (1 + this.extra.length) * SCALE;
  }
  prepare(s) {
    this.cache = [];
    for (let c = 0; c < NC; c++) {
      const row = [];
      for (let r = 0; r < NR; r++) {
        if (s.mask[c] >> r & 1) { row.push(null); continue; }
        if (r < 6) row.push([0, 1, 2, 3, 4, 5].map(n => this.vAfter(s, c, r, n)));
        else row.push(this.vAfter(s, c, r, 0));
      }
      this.cache.push(row);
    }
  }
  pv(s, c, r, d, cross) {
    if (r < 6) {
      const n = cross ? 0 : E.DICE[d][r], pts = n * (r + 1);
      const bon = s.up[c] < 60 && s.up[c] + pts >= 60 ? 30 : 0;
      let tw = 0;
      const T = this.params.tweak;
      if (T && T.secheUp && c === 3) tw = n >= 3 ? T.secheUp : -T.secheUp;
      if (T && T.ordUp && (c === 1 || c === 2)) tw = n >= 3 ? T.ordUp : -T.ordUp;
      return pts + bon + this.cache[c][r][n] + tw;
    }
    const v = this.cache[c][r];
    if (r === MINUS) return v - DSUM[d];
    return v + (cross ? 0 : SC[r][d]);
  }
}

module.exports = { Bot: Bot3, defaultParams, playGame: B.playGame, feat, featS, shaped, NF, SCALE };
