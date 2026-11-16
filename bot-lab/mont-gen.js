'use strict';
// Fabrique les niveaux du Mont Yams : positions de fin de partie et seuils d'étoiles,
// tous calculés par le bot. Usage : node mont-gen.js <monde 0..7>  → mont-out/<monde>.json
// puis node mont-gen.js merge  → ../mont-niveaux.js (lu par le jeu).
const fs = require('fs');
const E = require('./engine'), VE = require('./vengine'), VB = require('./vbot');
const { WORLDS } = require('./mont-spec');

const N = +process.env.N || 500;      // parties simulées par force
const NC = 40, NCE = 40;              // fin de partie : candidates, parties d'évaluation par candidate
const FORCES = [50, 25, 10];          // bruit du bot pour 1, 2 et 3 étoiles

const params = {};
function bot(cfg, noise) {
  if (!params[cfg]) params[cfg] = JSON.parse(fs.readFileSync(`vparams/${cfg}.json`));
  return new VB.VBot(VB.variant(cfg), { ...params[cfg], noise });
}
const dIdx = dice => { const c = [0, 0, 0, 0, 0, 0]; for (const v of dice) c[v - 1]++; return E.DIDX[E.code(c)]; };
function keepToMask(dice, kc) {
  const need = kc.slice(), keep = [false, false, false, false, false];
  for (let i = 0; i < 5; i++) if (need[dice[i] - 1] > 0) { need[dice[i] - 1]--; keep[i] = true; }
  return keep;
}
// Joue depuis l'état s0 (copié) jusqu'à stopAt tours joués (par défaut la fin).
function playFrom(b, s0, seed, stopAt) {
  const V = b.V, R = E.rng(seed), s = VE.cloneState(s0);
  if (b.noise) b.rnd = E.rng(seed ^ 0x5bd1e995);
  const end = stopAt ?? V.turns;
  while (s.turn < end) {
    const pool = []; for (let i = 0; i < 15; i++) pool.push(1 + Math.floor(R() * 6));
    const dice = [0, 0, 0, 0, 0]; let keep = [false, false, false, false, false];
    const roll = rn => { for (let i = 0; i < 5; i++) if (!keep[i]) dice[i] = pool[(rn - 1) * 5 + i]; };
    const pl = b.plan(s); roll(1);
    let d = dIdx(dice), sok = true, ann = null, ap = null, done = null, rn = 1;
    const o = b.decide1(s, d, pl);
    if (o.type === 'place') done = o.cell;
    else if (o.type === 'announce') { ann = o.r; ap = o.ap; if (o.now) done = [b.ann, ann, false]; else keep = keepToMask(dice, E.KEEPS[o.k]); }
    else keep = keepToMask(dice, E.KEEPS[o.k]);
    for (rn = 2; rn <= 3 && !done; rn++) {
      sok = keep.every(k => !k); roll(rn); d = dIdx(dice);
      if (ann !== null) {
        if (rn === 3) { done = [b.ann, ann, false]; break; }
        const [k, kv] = b.bestKeep(d, ap.K2);
        if (ap.g[d] >= kv) { done = [b.ann, ann, false]; break; }
        keep = keepToMask(dice, E.KEEPS[k]); continue;
      }
      if (rn === 3) { done = pl.Tf[sok ? 1 : 0].a[d]; break; }
      const T = pl.Tm[sok ? 1 : 0], [k, kv] = b.bestKeep(d, pl.KV2);
      if (T.a[d] && T.v[d] >= kv) { done = T.a[d]; break; }
      keep = keepToMask(dice, E.KEEPS[k]);
    }
    const [c, r, cross] = done;
    VE.place(V, s, c, r, d, rn, cross);
  }
  return s;
}
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
function evalFrom(cfg, s0, noise, n, seed0) {
  const b = typeof cfg === 'function' ? cfg(noise) : bot(cfg, noise), out = [];
  for (let i = 0; i < n; i++) out.push(VE.total(b.V, playFrom(b, s0, seed0 + i)));
  return out;
}
// Mini-grilles (une seule colonne) : la valeur de la grille restante est calculée
// exactement (programmation dynamique sur cases remplies et total du haut plafonné),
// le réseau entraîné sur la grille complète étant hors de son domaine ici.
class TableBot extends VB.VBot {
  constructor(V, solveur, noise) { super(V, { ...VB.defaultParams(V), noise }); this.solveur = solveur || this; this.memo = solveur ? null : new Map(); }
  value(mask, up, turn) {
    if (turn >= this.V.turns) return 0;
    const S = this.solveur, key = mask[0] * 200 + Math.min(up[0], this.V.seuil[0]);
    let v = S.memo.get(key); if (v === undefined) { v = S.resoudre(mask, up, turn); S.memo.set(key, v); }
    return v;
  }
  resoudre(mask, up, turn) {
    const V = this.V;
    for (let r = 0; r < V.NR; r++) if (!(mask[0] >> r & 1)) {
      const m2 = [mask[0] | 1 << r];
      for (const mu of (V.cols[0] === 'double' ? [1, 2] : [1])) for (let n = 0; n <= (r < 6 ? 5 : 0); n++) this.value(m2, [up[0] + n * (r + 1) * mu], turn + 1);
    }
    const s = { mask: mask.slice(), up: up.slice(), turn }, pl = this.plan(s);
    let e = 0; for (let d = 0; d < E.ND; d++) e += P1[d] * this.decide1(s, d, pl).v;
    return e;
  }
}
const P1 = (() => { const p = new Float64Array(E.ND), t = E.KT[E.KEMPTY]; for (let i = 0; i < t.idx.length; i++) p[t.idx[i]] += t.p[i]; return p; })();

// Seuils lisibles et strictement croissants
function seuils(ms) {
  const big = ms[2] >= 100, rd = x => big ? Math.round(x / 5) * 5 : Math.round(x);
  const s = ms.map(rd);
  for (let i = 1; i < 3; i++) if (s[i] <= s[i - 1]) s[i] = s[i - 1] + (big ? 5 : 1);
  return s;
}
function seuilsGain(ms) {
  const s = ms.map(Math.round);
  for (let i = 1; i < 3; i++) if (s[i] <= s[i - 1]) s[i] = s[i - 1] + 1;
  return s;
}
const appRows = rows => {
  const out = [];
  for (const r of rows) {
    out.push(r);
    if (r === '6' && ['1', '2', '3', '4', '5'].every(x => rows.includes(x))) out.push('bonus');
    if (r === 'minus' && rows.includes('plus')) out.push('diff');
  }
  return out;
};
const stateToSc = (V, s, cols) => {
  const sc = {};
  V.cols.forEach((c, ci) => { if (!cols.includes(c)) return; sc[c] = {};
    V.rows.forEach((r, ri) => { if (s.val[ci][ri] !== null) sc[c][r] = s.val[ci][ri]; }); });
  return sc;
};

function genLevel(lv, wi, j) {
  const V = VB.variant(lv.cfg), id = `${WORLDS[wi].id}-${j + 1}`;
  let s0 = VE.newState(V), cols = V.cols.slice(), rows = V.rows.slice(), prefill = null;
  let sim = lv.cfg;
  if (lv.f === 'mini') {
    cols = lv.cols; rows = V.rows.filter(r => lv.rows.includes(r));
    const V1 = VB.variant(`${cols[0]}~${lv.cfg.split('~')[1]}`);
    s0 = VE.newState(V1);
    V1.rows.forEach((r, ri) => { if (rows.includes(r)) return; s0.val[0][ri] = 0; s0.mask[0] |= 1 << ri; s0.turn++; });
    const solveur = new TableBot(V1);
    sim = z => z ? new TableBot(V1, solveur, z) : solveur;
  }
  if (lv.f === 'fin') {
    const gen = bot(lv.cfg, 25), seedBase = 7e8 + wi * 1e6 + j * 1e4;
    let best = null;
    for (let i = 0; i < NC; i++) {
      const cand = playFrom(gen, VE.newState(V), seedBase + i, V.turns - lv.k);
      const lo = mean(evalFrom(lv.cfg, cand, 50, NCE, 9e8 + i * 100)), hi = mean(evalFrom(lv.cfg, cand, 0, NCE, 9e8 + i * 100));
      const ouvertes = V.cols.flatMap((c, ci) => V.rows.filter((r, ri) => cand.val[ci][ri] === null));
      const figs = ouvertes.filter(r => V.isFig[V.rows.indexOf(r)]).length;
      const interet = hi - lo + (figs ? 4 : 0);
      if (!best || interet > best.interet) best = { s: cand, interet };
    }
    s0 = best.s; prefill = stateToSc(V, s0, cols);
  }
  const ms = FORCES.map((z, k) => mean(evalFrom(sim, s0, z, N, 3e9 + wi * 1e6 + j * 1e4)));
  const top = mean(evalFrom(sim, s0, 0, N, 3e9 + wi * 1e6 + j * 1e4));
  // Fin de partie : les seuils portent sur les points marqués pendant les tours restants
  const dep = prefill ? VE.total(V, s0) : 0;
  const out = { id, f: lv.f, name: lv.name, cols, rows: appRows(rows), turns: s0.mask.length * (lv.f === 'mini' ? VB.variant(`${cols[0]}~${lv.cfg.split('~')[1]}`).NR : V.NR) - s0.turn,
    stars: prefill ? seuilsGain(ms.map(m => m - dep)) : seuils(ms), bot: Math.round(top - dep), moy: ms.map(m => +(m - dep).toFixed(1)) };
  if (prefill) { out.prefill = prefill; out.k = lv.k; out.depart = dep; }
  console.error(`${id} ${lv.f.padEnd(6)} ${lv.cfg.padEnd(38)} étoiles ${out.stars.join(' / ')}  bot ${out.bot}`);
  return out;
}
function genBoss(w, wi) {
  const B = w.boss, V = VB.variant(B.cfg);
  const sc = evalFrom(B.cfg, VE.newState(V), B.noise, N, 5e9 + wi * 1e5);
  const avg = Math.round(mean(sc)), r5 = x => Math.max(5, Math.round(x / 5) * 5);
  const out = { ...B, cols: V.cols, rows: appRows(V.rows), avg, marges: [r5(avg * 0.06), r5(avg * 0.18)] };
  console.error(`boss ${B.id} ${B.cfg} bruit ${B.noise} : moyenne ${avg}, marges ${out.marges}`);
  return out;
}

if (process.argv[2] === 'merge') {
  const worlds = WORLDS.map((w, wi) => JSON.parse(fs.readFileSync(`mont-out/${wi}.json`)));
  // Niveau à dés préparés (le tout premier) : seuils et réserve de dés fixés dans la spécification
  worlds.forEach((w, wi) => w.levels.forEach((lv, j) => {
    const sp = WORLDS[wi].levels[j];
    if (sp.des) { lv.des = sp.des; lv.stars = sp.stars; lv.bot = null; }
  }));
  const js = `// Fichier généré par bot-lab/mont-gen.js : ne pas modifier à la main.\n` +
    `// Niveaux du Mont Yams. Seuils d'étoiles = moyenne du bot à trois forces (bruit 50, 25, 10).\n` +
    `const MONT_MONDES=${JSON.stringify(worlds)};\n`;
  fs.writeFileSync('../mont-niveaux.js', js);
  console.log('../mont-niveaux.js', js.length, 'octets');
} else {
  // node mont-gen.js <monde> [boss | 1,2,...] : tout le monde, ou seulement le boss ou certains niveaux
  const wi = +process.argv[2], w = WORLDS[wi], quoi = process.argv[3];
  fs.mkdirSync('mont-out', { recursive: true });
  const prev = quoi && fs.existsSync(`mont-out/${wi}.json`) ? JSON.parse(fs.readFileSync(`mont-out/${wi}.json`)) : null;
  const refaire = quoi && quoi !== 'boss' ? quoi.split(',').map(x => +x - 1) : null;
  const levels = w.levels.map((lv, j) => prev && (quoi === 'boss' || !refaire.includes(j)) ? prev.levels[j] : genLevel(lv, wi, j));
  const boss = prev && quoi !== 'boss' ? prev.boss : genBoss(w, wi);
  const { levels: _, boss: __, ...meta } = w;
  fs.writeFileSync(`mont-out/${wi}.json`, JSON.stringify({ ...meta, levels, boss }));
}
