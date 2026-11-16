'use strict';
// Bot à fonction de valeur linéaire apprise par régression sur les retours réels.
// V(s) = Σ w_open[c][r]·ouverte + Σ w_t[c][r]·ouverte·(tours restants/60) + Σ w_p[c]·P(bonus c)
const E = require('./engine');
const B = require('./bot');
const { NR, MINUS, NC, DSUM, SC } = E;

const NF = NC * NR * 2 + NC;
function defaultParams() {
  const p = B.defaultParams();
  const w = new Array(NF).fill(0);
  for (let c = 0; c < NC; c++) for (let r = 0; r < NR; r++) {
    w[c * NR + r] = r < 6 ? 2.6 * (r + 1) : p.ev[c][r];
  }
  for (let c = 0; c < NC; c++) w[NC * NR * 2 + c] = 30;
  return { w, dist: p.dist };
}

function buildP(dist) {
  const out = [];
  for (let c = 0; c < NC; c++) {
    const P = new Float64Array(64 * 61);
    for (let s = 0; s <= 60; s++) P[s] = s >= 60 ? 1 : 0;
    for (let m = 1; m < 64; m++) {
      let f = 0; while (!(m >> f & 1)) f++;
      const rest = m & ~(1 << f);
      for (let s = 0; s <= 60; s++) {
        let p = 0;
        for (let n = 0; n <= 5; n++) p += dist[c][f][n] * P[rest * 61 + Math.min(60, s + n * (f + 1))];
        P[m * 61 + s] = s >= 60 ? 1 : p;
      }
    }
    out.push(P);
  }
  return out;
}

// Probabilité d'atteindre le bonus, 0 si déjà acquis (il est alors compté dans le score).
function pBonus(P, s, c) {
  if (s.up[c] >= 60) return 0;
  return P[c][(~s.mask[c] & 63) * 61 + s.up[c]];
}
function features(s, P) {
  const f = new Float64Array(NF);
  const tl = (60 - s.turn) / 60;
  for (let c = 0; c < NC; c++) for (let r = 0; r < NR; r++) if (!(s.mask[c] >> r & 1)) {
    f[c * NR + r] = 1; f[NC * NR + c * NR + r] = tl;
  }
  for (let c = 0; c < NC; c++) f[NC * NR * 2 + c] = pBonus(P, s, c);
  return f;
}
// Score avec le bonus compté dès que les 60 points sont atteints.
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

class Bot2 extends B.Bot {
  constructor(params) {
    super({ ev: [], dist: params.dist });
    this.params = params; this.w = params.w; this.P = buildP(params.dist);
  }
  // Partie structurelle de V(s') − V(s) pour chaque case, calculée une fois par tour.
  prepare(s) {
    const w = this.w, tl = (60 - s.turn) / 60, tl2 = (60 - s.turn - 1) / 60;
    let shift = 0;
    for (let c = 0; c < NC; c++) for (let r = 0; r < NR; r++) if (!(s.mask[c] >> r & 1)) shift += w[NC * NR + c * NR + r] * (tl2 - tl);
    this.delta = [];
    for (let c = 0; c < NC; c++) {
      const row = new Float64Array(NR);
      for (let r = 0; r < NR; r++) row[r] = shift - w[c * NR + r] - w[NC * NR + c * NR + r] * tl2;
      this.delta.push(row);
    }
    this.pOld = [0, 1, 2, 3, 4].map(c => pBonus(this.P, s, c));
  }
  pv(s, c, r, d, cross) {
    let v = this.delta[c][r];
    if (r < 6) {
      const pts = cross ? 0 : SC[r][d];
      const up = s.up[c], nu = up + pts;
      v += pts + (up < 60 && nu >= 60 ? 30 : 0);
      const m = (~s.mask[c] & 63) & ~(1 << r);
      const pNew = nu >= 60 ? 0 : (m === 0 ? 0 : this.P[c][m * 61 + nu]);
      v += this.w[NC * NR * 2 + c] * (pNew - this.pOld[c]);
      return v;
    }
    if (r === MINUS) return v - DSUM[d];
    return v + (cross ? 0 : SC[r][d]);
  }
}

module.exports = { Bot: Bot2, defaultParams, playGame: B.playGame, features, shaped, buildP, NF };
