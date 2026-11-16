'use strict';
// Bot générique (toutes variantes) : calcul exact des lancers + réseau évaluant la grille.
const E = require('./engine');
const VE = require('./vengine');
const { NN } = require('./nn');
const { DICE, ND, KT, SUB, NK, KEMPTY, DSUM } = E;

const VARIANTS = {
  expert: [['normal', 'desc', 'asc', 'seche', 'annonce'], 'base', 'Expert'],
  t1l1: [['normal'], 'base', 'Premiers pas'],
  t2l3: [['desc', 'asc'], 'base', 'Funambule'],
  t4l3b: [['desc', 'asc', 'seche', 'annonce'], 'pb', 'Sans pitié'],
  n1: [['normal', 'desc', 'asc', 'double'], 'base', 'Quitte ou double'],
  n2: [['normal', 'milieu'], 'base', 'Plein centre'],
};
// Une variante se désigne par un nom court (VARIANTS) ou par sa clé « colonnes~lignes »,
// par exemple « normal+desc+asc~pb ».
const variant = id => {
  const [c, r, n] = VARIANTS[id] || [id.split('~')[0].split('+'), id.split('~')[1] || 'base', id];
  const V = VE.makeVariant(c, r, n); V.id = id; return V;
};

const FIX = [0.01, 0.03, 0.10, 0.60, 0.22, 0.04];
const PT = (() => {
  const T = new Float64Array(64 * 61);
  for (let s = 0; s <= 60; s++) T[s] = s >= 60 ? 1 : 0;
  for (let m = 1; m < 64; m++) {
    let f = 0; while (!(m >> f & 1)) f++;
    const rest = m & ~(1 << f);
    for (let s = 0; s <= 60; s++) {
      let p = 0; for (let n = 0; n <= 5; n++) p += FIX[n] * T[rest * 61 + Math.min(60, s + n * (f + 1))];
      T[m * 61 + s] = s >= 60 ? 1 : p;
    }
  }
  return T;
})();
const P1 = (() => { const p = new Float64Array(ND), t = KT[KEMPTY]; for (let i = 0; i < t.idx.length; i++) p[t.idx[i]] += t.p[i]; return p; })();
const SCALE = 100;
const nf = V => V.NC * (V.NR + 4) + 1;

function feat(V, mask, up, turn, x) {
  x.fill(0);
  let o = 0;
  for (let c = 0; c < V.NC; c++) {
    for (let r = 0; r < V.NR; r++) x[o + r] = (mask[c] >> r & 1) ? 0 : 1;
    o += V.NR;
    const m = mask[c] & 63, k = V.seuil[c] / 60, u = up[c] / k; // Double ramenée à l'échelle 60
    if (up[c] >= V.seuil[c]) x[o + 1] = 1;
    else if (m !== 63) {
      let par = 0; for (let f = 0; f < 6; f++) if (m >> f & 1) par += 3 * (f + 1);
      x[o] = u / 60; x[o + 2] = Math.max(-2, Math.min(2, (u - par) / 15));
      x[o + 3] = PT[(~m & 63) * 61 + Math.min(60, Math.floor(u))];
    }
    o += 4;
  }
  x[o] = (V.turns - turn) / V.turns;
  return x;
}

function defaultParams(V, h = [96, 64], seed = 12345) { return { variant: V.id, nn: new NN([nf(V), ...h, 1], seed).toJSON() }; }

class VBot {
  constructor(V, params) {
    this.V = V; this.params = params;
    this.nn = NN.from(params.nn); this.extra = (params.ens || []).map(j => NN.from(j));
    this.x = new Float64Array(nf(V));
    this.ann = V.cols.indexOf('annonce'); this.sec = V.cols.indexOf('seche');
    this.noise = params.noise || 0; // affaiblissement : bruit sur l'évaluation des cases
  }
  value(mask, up, turn) {
    if (turn >= this.V.turns) return 0;
    const x = feat(this.V, mask, up, turn, this.x);
    let v = this.nn.forward(x); for (const n of this.extra) v += n.forward(x);
    return v / (1 + this.extra.length) * SCALE;
  }
  prepare(s) {
    const V = this.V; this.cache = [];
    for (let c = 0; c < V.NC; c++) {
      const row = [];
      for (let r = 0; r < V.NR; r++) {
        if (s.mask[c] >> r & 1) { row.push(null); continue; }
        const mask = s.mask.slice(); mask[c] |= 1 << r;
        if (r < 6) {
          const ms = V.cols[c] === 'double' ? [1, 2] : [1];
          row.push(ms.map(m => [0, 1, 2, 3, 4, 5].map(n => { const up = s.up.slice(); up[c] += n * (r + 1) * m; return this.value(mask, up, s.turn + 1); })));
        } else row.push(this.value(mask, s.up, s.turn + 1));
      }
      this.cache.push(row);
    }
    if (this.noise) { this.nz = this.cache.map(r => r.map(() => (this.rnd() - 0.5) * 2 * this.noise)); }
  }
  pv(s, c, r, d, rn, cross) {
    const V = this.V, m = V.cols[c] === 'double' && rn < 3 ? 2 : 1;
    let v;
    if (r < 6) {
      const n = cross ? 0 : DICE[d][r], pts = n * (r + 1) * m;
      const bon = s.up[c] < V.seuil[c] && s.up[c] + pts >= V.seuil[c] ? V.prime[c] : 0;
      v = pts + bon + this.cache[c][r][m - 1][n];
    } else if (r === V.MINUS) v = this.cache[c][r] - DSUM[d] * m;
    else v = this.cache[c][r] + (cross ? 0 : V.SC[r][d] * m);
    return this.noise ? v + this.nz[c][r] : v;
  }
  legal(s) {
    const V = this.V, base = [], seche = [], barr = [];
    for (let c = 0; c < V.NC; c++) {
      const k = V.cols[c];
      if (k === 'seche') { for (let r = 0; r < V.NR; r++) if (!(s.mask[c] >> r & 1)) seche.push([c, r]); }
      else if (k === 'annonce') { for (let r = 0; r < V.NR; r++) if (!(s.mask[c] >> r & 1)) barr.push([c, r]); }
      else for (const r of VE.orderedCells(V, k, s.mask[c])) base.push([c, r]);
    }
    return { base, seche, barr };
  }
  plan(s) {
    const V = this.V; this.prepare(s);
    const { base, seche, barr } = this.legal(s);
    const mk = () => ({ v: new Float64Array(ND).fill(-Infinity), a: new Array(ND).fill(null) });
    const Tm0 = mk(), Tf0 = mk(), Tm1 = mk(), Tf1 = mk();
    const upd = (T, d, val, cell) => { if (val > T.v[d]) { T.v[d] = val; T.a[d] = cell; } };
    for (let d = 0; d < ND; d++) {
      for (const [c, r] of base) {
        const vm = this.pv(s, c, r, d, 1), vf = this.pv(s, c, r, d, 3), cell = [c, r, false];
        upd(Tm0, d, vm, cell); upd(Tm1, d, vm, cell); upd(Tf0, d, vf, cell); upd(Tf1, d, vf, cell);
      }
      for (const [c, r] of seche) {
        const v = this.pv(s, c, r, d, 3), cell = [c, r, false];
        upd(Tf1, d, v, cell);
        if (!V.isFig[r] || V.SC[r][d] > 0) upd(Tm1, d, v, cell);
      }
      if (base.length === 0) { // barrage forcé au 3e lancer
        for (const [c, r] of seche.concat(barr)) upd(Tf0, d, this.pv(s, c, r, d, 3, true), [c, r, true]);
        if (!seche.length) for (const [c, r] of barr) upd(Tf1, d, this.pv(s, c, r, d, 3, true), [c, r, true]);
      }
    }
    const KV2 = new Float64Array(NK);
    for (let k = 0; k < NK; k++) { const T = k === KEMPTY ? Tf1.v : Tf0.v, t = KT[k]; let e = 0; for (let i = 0; i < t.idx.length; i++) e += t.p[i] * T[t.idx[i]]; KV2[k] = e; }
    const E2 = [new Float64Array(ND), new Float64Array(ND)];
    for (let d = 0; d < ND; d++) { let b = -Infinity; for (const k of SUB[d]) if (KV2[k] > b) b = KV2[k]; E2[0][d] = Math.max(Tm0.v[d], b); E2[1][d] = Math.max(Tm1.v[d], b); }
    const KV1 = new Float64Array(NK);
    for (let k = 0; k < NK; k++) { const T = k === KEMPTY ? E2[1] : E2[0], t = KT[k]; let e = 0; for (let i = 0; i < t.idx.length; i++) e += t.p[i] * T[t.idx[i]]; KV1[k] = e; }
    return { Tm: [Tm0, Tm1], Tf: [Tf0, Tf1], KV2, KV1 };
  }
  annPlan(s, r) {
    const g = new Float64Array(ND);
    for (let d = 0; d < ND; d++) g[d] = this.pv(s, this.ann, r, d, 3);
    const K2 = new Float64Array(NK);
    for (let k = 0; k < NK; k++) { const t = KT[k]; let e = 0; for (let i = 0; i < t.idx.length; i++) e += t.p[i] * g[t.idx[i]]; K2[k] = e; }
    const G2 = new Float64Array(ND);
    for (let d = 0; d < ND; d++) { let b = g[d]; for (const k of SUB[d]) if (K2[k] > b) b = K2[k]; G2[d] = b; }
    const K1 = new Float64Array(NK);
    for (let k = 0; k < NK; k++) { const t = KT[k]; let e = 0; for (let i = 0; i < t.idx.length; i++) e += t.p[i] * G2[t.idx[i]]; K1[k] = e; }
    return { r, g, K2, K1 };
  }
  bestKeep(d, KV) { let bk = -1, bv = -Infinity; for (const k of SUB[d]) if (KV[k] > bv) { bv = KV[k]; bk = k; } return [bk, bv]; }
  decide1(s, d, pl) {
    const V = this.V, opts = [];
    const onlyAnn = V.NC === 1 && this.ann === 0; // app.js : il faut annoncer avant de relancer
    const left = s.mask.reduce((a, m) => a + V.NR - E.popc(m), 0);
    const annOpen = [];
    if (this.ann >= 0) for (let r = 0; r < V.NR; r++) if (!(s.mask[this.ann] >> r & 1)) annOpen.push(r);
    if (!onlyAnn && !(left === 1 && annOpen.length === 1)) {
      if (pl.Tm[1].a[d]) opts.push({ type: 'place', v: pl.Tm[1].v[d], cell: pl.Tm[1].a[d] });
      const [k, kv] = this.bestKeep(d, pl.KV1); opts.push({ type: 'keep', v: kv, k });
    }
    for (const r of annOpen) {
      const ap = this.annPlan(s, r), [ak, akv] = this.bestKeep(d, ap.K1);
      opts.push({ type: 'announce', r, v: Math.max(ap.g[d], akv), ap, now: ap.g[d] >= akv, k: ak });
    }
    opts.sort((a, b) => b.v - a.v);
    return opts[0];
  }
}

function keepToMask(dice, kc) {
  const need = kc.slice(), keep = [false, false, false, false, false];
  for (let i = 0; i < 5; i++) if (need[dice[i] - 1] > 0) { need[dice[i] - 1]--; keep[i] = true; }
  return keep;
}
const dIdx = dice => { const c = [0, 0, 0, 0, 0, 0]; for (const v of dice) c[v - 1]++; return E.DIDX[E.code(c)]; };

// Partie complète. 15 dés tirés par tour (mêmes lancers pour deux bots de même graine).
function playGame(bot, seed, opt = {}) {
  const V = bot.V, R = E.rng(seed), s = VE.newState(V);
  if (bot.noise) bot.rnd = E.rng(seed ^ 0x5bd1e995);
  const log = opt.log ? [] : null;
  for (let t = 0; t < V.turns; t++) {
    const pool = []; for (let i = 0; i < 15; i++) pool.push(1 + Math.floor(R() * 6));
    const dice = [0, 0, 0, 0, 0]; let keep = [false, false, false, false, false];
    const roll = rn => { for (let i = 0; i < 5; i++) if (!keep[i]) dice[i] = pool[(rn - 1) * 5 + i]; };
    const pl = bot.plan(s);
    roll(1);
    let d = dIdx(dice), sok = true, ann = null, ap = null, done = null, rn = 1;
    const L = log ? { t: t + 1, rolls: [dice.slice()] } : null;
    const b = bot.decide1(s, d, pl);
    if (b.type === 'place') done = b.cell;
    else if (b.type === 'announce') { ann = b.r; ap = b.ap; if (b.now) done = [bot.ann, ann, false]; else keep = keepToMask(dice, E.KEEPS[b.k]); }
    else keep = keepToMask(dice, E.KEEPS[b.k]);
    for (rn = 2; rn <= 3 && !done; rn++) {
      sok = keep.every(k => !k); roll(rn); d = dIdx(dice);
      if (L) L.rolls.push(dice.slice());
      if (ann !== null) {
        if (rn === 3) { done = [bot.ann, ann, false]; break; }
        const [k, kv] = bot.bestKeep(d, ap.K2);
        if (ap.g[d] >= kv) { done = [bot.ann, ann, false]; break; }
        keep = keepToMask(dice, E.KEEPS[k]);
        continue;
      }
      if (rn === 3) { done = pl.Tf[sok ? 1 : 0].a[d]; break; }
      const T = pl.Tm[sok ? 1 : 0], [k, kv] = bot.bestKeep(d, pl.KV2);
      if (T.a[d] && T.v[d] >= kv) { done = T.a[d]; break; }
      keep = keepToMask(dice, E.KEEPS[k]);
    }
    const rnPlaced = rn;
    if (opt.explore && opt.xr() < opt.explore && ann === null && !done[2]) {
      const { base, seche } = bot.legal(s);
      const cand = base.concat(sok ? seche.filter(([, r]) => rnPlaced === 3 || !V.isFig[r] || V.SC[r][d] > 0) : []);
      if (cand.length > 1) {
        const sc = cand.map(([c, r]) => [bot.pv(s, c, r, d, rnPlaced), c, r]).sort((a, b) => b[0] - a[0]);
        const p = sc[Math.floor(opt.xr() * Math.min(3, sc.length))]; done = [p[1], p[2], false];
      }
    }
    const [c, r, cross] = done;
    if (opt.onDecide) opt.onDecide(s, d, sok, ann, done, rnPlaced);
    VE.place(V, s, c, r, d, rnPlaced, cross);
    if (L) { L.cell = [V.cols[c], V.rows[r]]; L.pts = s.val[c][r]; L.ann = ann; L.rn = rnPlaced; log.push(L); }
    if (opt.onPlace) opt.onPlace(s);
  }
  return { score: VE.total(V, s), state: s, log };
}

module.exports = { VARIANTS, variant, VBot, defaultParams, playGame, feat, nf, SCALE };
