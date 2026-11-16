'use strict';
const E = require('./engine');
const { NR, PLUS, MINUS, NORMAL, DESC, ASC, SECHE, ANN, NC, DICE, ND, KT, SUB, NK, KEMPTY, SC, DSUM, isFig } = E;
const P1 = (() => { const p = new Float64Array(ND), t = KT[KEMPTY]; for (let i = 0; i < t.idx.length; i++) p[t.idx[i]] += t.p[i]; return p; })();

// ── Paramètres de la fonction de valeur ─────────────────
// ev[c][r] (r >= 6) : valeur espérée d'une case laissée ouverte (− compté négativement).
// dist[c][f][n] : loi du nombre de dés n posés dans la case chiffre f+1.
function defaultParams() {
  const ev = [], dist = [];
  for (let c = 0; c < NC; c++) {
    ev.push([0, 0, 0, 0, 0, 0, 23, -10, 32, 38, 45, 20]);
    dist.push([0, 1, 2, 3, 4, 5].map(() => [0.02, 0.08, 0.25, 0.45, 0.17, 0.03]));
  }
  return { ev, dist };
}

// U[c][mask*61+s] : points chiffres à venir + 30 x P(bonus), mask = chiffres encore ouverts.
function buildU(params) {
  const U = [];
  for (let c = 0; c < NC; c++) {
    const P = new Float64Array(64 * 61), Ex = new Float64Array(64);
    const dist = params.dist[c];
    const eF = dist.map((d, f) => d.reduce((a, p, n) => a + p * n * (f + 1), 0));
    for (let m = 0; m < 64; m++) for (let f = 0; f < 6; f++) if (m >> f & 1) Ex[m] += eF[f];
    for (let s = 0; s <= 60; s++) P[s] = s >= 60 ? 1 : 0;
    for (let m = 1; m < 64; m++) {
      let f = 0; while (!(m >> f & 1)) f++;
      const rest = m & ~(1 << f);
      for (let s = 0; s <= 60; s++) {
        let p = 0;
        for (let n = 0; n <= 5; n++) p += dist[f][n] * P[rest * 61 + Math.min(60, s + n * (f + 1))];
        P[m * 61 + s] = p;
      }
    }
    const u = new Float64Array(64 * 61);
    for (let m = 0; m < 64; m++) for (let s = 0; s <= 60; s++) u[m * 61 + s] = Ex[m] + 30 * P[m * 61 + s];
    U.push(u);
  }
  return U;
}

class Bot {
  constructor(params) { this.params = params; if (params.dist && params.dist[0] && params.dist[0].length) this.U = buildU(params); }

  // Valeur d'un placement : points marqués + variation de la valeur des cases restantes.
  pv(s, c, r, d, cross) {
    if (r < 6) {
      const pts = cross ? 0 : SC[r][d];
      const m = ~s.mask[c] & 63, u = this.U[c];
      return pts + u[(m & ~(1 << r)) * 61 + Math.min(60, s.up[c] + pts)] - u[m * 61 + Math.min(60, s.up[c])];
    }
    const ev = this.params.ev[c][r];
    if (r === MINUS) return -DSUM[d] - ev;
    return (cross ? 0 : SC[r][d]) - ev;
  }

  // Cases jouables hors Annoncée : [c, r, figureSèche]
  legal(s) {
    const base = [], seche = [], barr = [];
    for (let r = 0; r < NR; r++) if (!(s.mask[NORMAL] >> r & 1)) base.push([NORMAL, r]);
    const nd = E.nextDesc(s.mask[DESC]); if (nd >= 0) base.push([DESC, nd]);
    const na = E.nextAsc(s.mask[ASC]); if (na >= 0) base.push([ASC, na]);
    for (let r = 0; r < NR; r++) if (!(s.mask[SECHE] >> r & 1)) seche.push([SECHE, r]);
    for (let r = 0; r < NR; r++) if (!(s.mask[ANN] >> r & 1)) barr.push([ANN, r]);
    return { base, seche, barr };
  }

  // Tables terminales et espérances pour un tour sans annonce.
  plan(s) {
    if (this.prepare) this.prepare(s);
    const { base, seche, barr } = this.legal(s);
    const mk = () => ({ v: new Float64Array(ND).fill(-Infinity), a: new Array(ND).fill(null) });
    const Tm0 = mk(), Tf0 = mk(), Tm1 = mk(), Tf1 = mk();
    const upd = (T, d, val, cell) => { if (val > T.v[d]) { T.v[d] = val; T.a[d] = cell; } };
    for (let d = 0; d < ND; d++) {
      for (const [c, r] of base) {
        const v = this.pv(s, c, r, d);
        const cell = [c, r, false];
        upd(Tm0, d, v, cell); upd(Tf0, d, v, cell); upd(Tm1, d, v, cell); upd(Tf1, d, v, cell);
      }
      for (const [c, r] of seche) {
        const v = this.pv(s, c, r, d);
        const cell = [c, r, false];
        upd(Tf1, d, v, cell);
        if (!isFig(r) || SC[r][d] > 0) upd(Tm1, d, v, cell);
      }
      // Barrage forcé : au 3e lancer, rien de jouable sauf Sèche/Annoncée
      if (base.length === 0) {
        const pool = seche.length ? (Tf0.a[d] ? [] : seche.concat(barr)) : barr;
        for (const [c, r] of pool) upd(Tf0, d, this.pv(s, c, r, d, true), [c, r, true]);
        if (!seche.length) for (const [c, r] of barr) upd(Tf1, d, this.pv(s, c, r, d, true), [c, r, true]);
      }
    }
    const KV2 = new Float64Array(NK);
    for (let k = 0; k < NK; k++) {
      const T = k === KEMPTY ? Tf1.v : Tf0.v, t = KT[k];
      let e = 0; for (let i = 0; i < t.idx.length; i++) e += t.p[i] * T[t.idx[i]];
      KV2[k] = e;
    }
    const E2 = [new Float64Array(ND), new Float64Array(ND)];
    for (let d = 0; d < ND; d++) {
      let b = -Infinity; for (const k of SUB[d]) if (KV2[k] > b) b = KV2[k];
      E2[0][d] = Math.max(Tm0.v[d], b); E2[1][d] = Math.max(Tm1.v[d], b);
    }
    const KV1 = new Float64Array(NK);
    for (let k = 0; k < NK; k++) {
      const T = k === KEMPTY ? E2[1] : E2[0], t = KT[k];
      let e = 0; for (let i = 0; i < t.idx.length; i++) e += t.p[i] * T[t.idx[i]];
      KV1[k] = e;
    }
    return { Tm: [Tm0, Tm1], Tf: [Tf0, Tf1], KV2, KV1, E2 };
  }

  // Chaîne d'espérance pour une case Annoncée r.
  annPlan(s, r) {
    const g = new Float64Array(ND);
    for (let d = 0; d < ND; d++) g[d] = this.pv(s, ANN, r, d);
    const K2 = new Float64Array(NK);
    for (let k = 0; k < NK; k++) { const t = KT[k]; let e = 0; for (let i = 0; i < t.idx.length; i++) e += t.p[i] * g[t.idx[i]]; K2[k] = e; }
    const G2 = new Float64Array(ND);
    for (let d = 0; d < ND; d++) { let b = g[d]; for (const k of SUB[d]) if (K2[k] > b) b = K2[k]; G2[d] = b; }
    const K1 = new Float64Array(NK);
    for (let k = 0; k < NK; k++) { const t = KT[k]; let e = 0; for (let i = 0; i < t.idx.length; i++) e += t.p[i] * G2[t.idx[i]]; K1[k] = e; }
    return { r, g, K2, K1 };
  }

  // Espérance de la meilleure suite de décisions sur un tour complet, depuis l'état s.
  turnValue(s) {
    const pl = this.plan(s);
    const aps = [];
    for (let r = 0; r < NR; r++) if (!(s.mask[ANN] >> r & 1)) aps.push(this.annPlan(s, r));
    const left = s.mask.reduce((a, m) => a + 12 - E.popc(m), 0);
    const forced = left === 1 && aps.length === 1;
    let ev = 0;
    for (let d = 0; d < ND; d++) {
      let b = -Infinity;
      if (!forced) {
        if (pl.Tm[1].a[d]) b = pl.Tm[1].v[d];
        for (const k of SUB[d]) if (pl.KV1[k] > b) b = pl.KV1[k];
      }
      for (const ap of aps) { let v = ap.g[d]; for (const k of SUB[d]) if (ap.K1[k] > v) v = ap.K1[k]; if (v > b) b = v; }
      ev += P1[d] * b;
    }
    return ev;
  }

  // Choix final à deux tours : récompense immédiate + espérance exacte du tour suivant.
  searchPick(s, d, sok, final, done, K) {
    this.prepare(s);
    const { base, seche } = this.legal(s);
    let cand = base.concat(sok ? seche.filter(([c, r]) => final || !isFig(r) || SC[r][d] > 0) : []);
    if (cand.length < 2 || s.turn >= 59) return done;
    cand = cand.map(([c, r]) => [this.pv(s, c, r, d), c, r]).sort((a, b) => b[0] - a[0]).slice(0, K);
    let best = null, bv = -Infinity;
    for (const [, c, r] of cand) {
      const s2 = E.cloneState(s); E.place(s2, c, r, d, false);
      const rew = this.reward(s, c, r, d);
      const v = rew + this.turnValue(s2);
      if (v > bv) { bv = v; best = [c, r, false]; }
    }
    this.prepare(s);
    return best;
  }

  reward(s, c, r, d) {
    if (r < 6) { const pts = SC[r][d]; return pts + (s.up[c] < 60 && s.up[c] + pts >= 60 ? 30 : 0); }
    return r === MINUS ? -DSUM[d] : SC[r][d];
  }

  bestKeep(d, KV) {
    let bk = -1, bv = -Infinity;
    for (const k of SUB[d]) if (KV[k] > bv) { bv = KV[k]; bk = k; }
    return [bk, bv];
  }

  // Décision au 1er lancer : { type:'place'|'keep'|'announce', ... }
  decide1(s, d, pl) {
    const opts = [];
    if (pl.Tm[1].a[d]) opts.push({ type: 'place', v: pl.Tm[1].v[d], cell: pl.Tm[1].a[d] });
    const [k, kv] = this.bestKeep(d, pl.KV1);
    opts.push({ type: 'keep', v: kv, k });
    const annOpen = [];
    for (let r = 0; r < NR; r++) if (!(s.mask[ANN] >> r & 1)) annOpen.push(r);
    const left = s.mask.reduce((a, m) => a + 12 - E.popc(m), 0);
    if (left === 1 && annOpen.length === 1) opts.length = 0;
    for (const r of annOpen) {
      const ap = this.annPlan(s, r);
      const [ak, akv] = this.bestKeep(d, ap.K1);
      const v = Math.max(ap.g[d], akv);
      opts.push({ type: 'announce', r, v, ap, now: ap.g[d] >= akv, k: ak });
    }
    opts.sort((a, b) => b.v - a.v);
    return { best: opts[0], opts };
  }
}

// ── Partie complète ─────────────────────────────────────
// Chaque tour tire 15 dés à l'avance (comme le Défi) : deux bots joués avec la même
// graine voient les mêmes lancers, ce qui réduit fortement le bruit des comparaisons.
function keepToMask(dice, kc) {
  const need = kc.slice(), keep = [false, false, false, false, false];
  for (let i = 0; i < 5; i++) if (need[dice[i] - 1] > 0) { need[dice[i] - 1]--; keep[i] = true; }
  return keep;
}
const countsOf = dice => { const c = [0, 0, 0, 0, 0, 0]; for (const v of dice) c[v - 1]++; return c; };
const dIdx = dice => E.DIDX[E.code(countsOf(dice))];

function playGame(bot, seed, opt = {}) {
  const R = E.rng(seed);
  const s = opt.start ? E.cloneState(opt.start) : E.newState();
  const log = opt.log ? [] : null;
  const rec = [];
  for (let t = s.turn; t < 60; t++) {
    const pool = []; for (let i = 0; i < 15; i++) pool.push(1 + Math.floor(R() * 6));
    const dice = [0, 0, 0, 0, 0];
    let keep = [false, false, false, false, false];
    const roll = rn => { for (let i = 0; i < 5; i++) if (!keep[i]) dice[i] = pool[(rn - 1) * 5 + i]; };
    const L = log ? { t: t + 1, rolls: [] } : null;
    const pl = bot.plan(s);
    roll(1);
    let d = dIdx(dice), sok = true, ann = null, ap = null, done = null, fin = false;
    const dec = bot.decide1(s, d, pl);
    if (L) L.rolls.push({ dice: dice.slice(), opts: dec.opts.slice(0, 6).map(o => ({ type: o.type, v: +o.v.toFixed(2), r: o.r, cell: o.cell, k: o.k !== undefined ? E.KEEPS[o.k] : undefined })) });
    const b = dec.best;
    if (b.type === 'place') done = b.cell;
    else if (b.type === 'announce') { ann = b.r; ap = b.ap; if (b.now) done = [ANN, ann, false]; else keep = keepToMask(dice, E.KEEPS[b.k]); }
    else keep = keepToMask(dice, E.KEEPS[b.k]);
    for (let rn = 2; rn <= 3 && !done; rn++) {
      sok = keep.every(k => !k);
      roll(rn); d = dIdx(dice);
      if (ann !== null) {
        if (rn === 3) { done = [ANN, ann, false]; break; }
        const [k, kv] = bot.bestKeep(d, ap.K2);
        if (L) L.rolls.push({ dice: dice.slice(), ann: ann, stop: +ap.g[d].toFixed(2), keepV: +kv.toFixed(2), k: E.KEEPS[k] });
        if (ap.g[d] >= kv) done = [ANN, ann, false]; else keep = keepToMask(dice, E.KEEPS[k]);
        continue;
      }
      if (rn === 3) { done = pl.Tf[sok ? 1 : 0].a[d]; fin = true; break; }
      const T = pl.Tm[sok ? 1 : 0];
      const [k, kv] = bot.bestKeep(d, pl.KV2);
      if (L) L.rolls.push({ dice: dice.slice(), sok, stop: T.a[d] ? +T.v[d].toFixed(2) : null, cell: T.a[d], keepV: +kv.toFixed(2), k: E.KEEPS[k] });
      if (T.a[d] && T.v[d] >= kv) done = T.a[d]; else keep = keepToMask(dice, E.KEEPS[k]);
    }
    if (opt.explore && opt.xr() < opt.explore && ann === null) {
      const sk = sok;
      const { base, seche } = bot.legal(s);
      const cand = base.concat(sk ? seche.filter(([c2, r2]) => !E.isFig(r2) || SC[r2][d] > 0) : []);
      if (cand.length > 1) {
        const sc = cand.map(([c2, r2]) => [bot.pv(s, c2, r2, d), c2, r2]).sort((a, b) => b[0] - a[0]);
        const pick = sc[Math.floor(opt.xr() * Math.min(3, sc.length))];
        done = [pick[1], pick[2], false];
      }
    }
    if (bot.search && ann === null && !done[2]) done = bot.searchPick(s, d, sok, fin, done, bot.search);
    if (opt.onDecide) opt.onDecide(s, d, sok, ann, done);
    const [c, r, cross] = done;
    const pts = cross ? (r === MINUS ? SC[r][d] : 0) : SC[r][d];
    rec.push({ c, r, pts, n: r < 6 ? DICE[d][r] : null, t });
    if (L) { L.final = dice.slice().sort(); L.cell = [E.COLS[c], E.ROWS[r]]; L.pts = pts; L.ann = ann; L.cross = !!cross; log.push(L); }
    E.place(s, c, r, d, cross);
    if (opt.onPlace) opt.onPlace(s, E.total(s));
  }
  return { score: E.total(s), state: s, rec, log };
}

module.exports = { Bot, defaultParams, buildU, playGame, dIdx, countsOf, keepToMask };
