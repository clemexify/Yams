'use strict';
// Apprentissage TD(λ) du réseau par auto-jeu. Les workers jouent, renvoient (état après
// placement, cible λ-retour) ; le fil principal entraîne le réseau et le redistribue.
// Phase 0 facultative : imitation des retours d'un bot « professeur » (bot2).
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os'), fs = require('fs');
const E = require('./engine');
const M = require('./bot3');

if (!isMainThread) {
  parentPort.on('message', ({ mode, params, seeds, eps, lam, teacher }) => {
    let bot, T = null;
    if (mode === 'teacher') { T = require('./bot2'); bot = new T.Bot(teacher); }
    else bot = new M.Bot(params);
    const xr = E.rng(seeds[0] * 31 + 7);
    const X = [], Y = [], scores = [], cols = [];
    const tid = require('worker_threads').threadId;
    for (const sd of seeds) {
      require('fs').writeFileSync('trace-w' + tid + '.txt', JSON.stringify({ sd, seeds, eps }));
      const fs_ = [], vs = [], sh = [];
      const g = (T || M).playGame(bot, sd, { explore: eps, xr, onPlace: s => {
        fs_.push(M.featS(s)); sh.push(M.shaped(s));
        if (mode === 'teacher' || s.turn === 60) vs.push(0);
        else { const x = M.featS(s); let v = bot.nn.forward(x); for (const e of bot.extra) v += e.forward(x); vs.push(v / (1 + bot.extra.length) * M.SCALE); }
      } });
      scores.push(g.score); cols.push([0, 1, 2, 3, 4].map(c => E.colTotal(g.state, c)));
      const n = fs_.length, G = new Float64Array(n);
      for (let t = n - 2; t >= 0; t--) {
        const r = sh[t + 1] - sh[t];
        G[t] = mode === 'teacher' ? g.score - sh[t] : r + (1 - lam) * vs[t + 1] + lam * G[t + 1];
      }
      for (let t = 0; t < n; t++) { X.push(fs_[t]); Y.push(G[t] / M.SCALE); }
    }
    const F = M.NF, Xf = new Float32Array(X.length * F);
    X.forEach((x, i) => Xf.set(x, i * F));
    parentPort.postMessage({ X: Xf, Y: Float32Array.from(Y), scores, cols });
  });
  return;
}

const { summary } = require('./pool');
const { NN } = require('./nn');
(async () => {
  const out = process.argv[2] || 'params-nn.json';
  const rounds = +process.argv[3] || 200, gpw = +process.argv[4] || 20;
  const lam = +(process.env.LAM ?? 0.7), eps = +(process.env.EPS ?? 0.05);
  let lr = +(process.env.LR ?? 1e-3);
  const params = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out)) : M.defaultParams(process.env.ARCH ? process.env.ARCH.split(',').map(Number) : undefined);
  // Distillation : pendant PRE rondes, on joue avec le réseau professeur et on apprend ses λ-retours
  // Membres fixes : la partie est jouée par la moyenne (réseau entraîné + membres fixes)
  const fixedEns = process.env.ENS ? process.env.ENS.split(',').map(f => JSON.parse(fs.readFileSync(f)).nn) : [];
  const teachNN = process.env.TEACHNN ? JSON.parse(fs.readFileSync(process.env.TEACHNN)) : null;
  const net = NN.from(params.nn);
  const n = os.cpus().length;
  const ws = [...Array(n)].map(() => new Worker(__filename));
  const F = M.NF, CAP = 150000;
  let BX = new Float32Array(CAP * F), BY = new Float32Array(CAP), bn = 0, bpos = 0;
  const addBuf = (X, Y) => { for (let i = 0; i < Y.length; i++) { BX.set(X.subarray(i * F, i * F + F), bpos * F); BY[bpos] = Y[i]; bpos = (bpos + 1) % CAP; bn = Math.min(CAP, bn + 1); } };
  const teacher = process.env.TEACHER ? JSON.parse(fs.readFileSync(process.env.TEACHER)) : null;
  let seedBase = +(process.env.SEED ?? 1e7), hist = [];
  const pretrain = (teacher || teachNN) ? +(process.env.PRE ?? 10) : 0;
  for (let rd = 0; rd < pretrain + rounds; rd++) {
    const mode = rd < pretrain && teacher ? 'teacher' : 'self';
    const cur = rd < pretrain && teachNN ? teachNN : { nn: net.toJSON(), ens: fixedEns, tweak: process.env.TWEAK ? JSON.parse(process.env.TWEAK) : undefined };
    const parts = await Promise.all(ws.map((w, i) => new Promise(res => {
      const seeds = [...Array(gpw)].map((_, k) => seedBase + i * gpw + k);
      w.once('message', res); w.postMessage({ mode, params: cur, seeds, eps: mode === 'teacher' ? 0.1 : eps, lam, teacher });
    })));
    seedBase += n * gpw;
    const scores = [];
    for (const p of parts) { addBuf(p.X, p.Y); scores.push(...p.scores); }
    // Entraînement : nouvelles données + autant d'échantillons tirés du tampon
    const newN = parts.reduce((a, p) => a + p.Y.length, 0), k = Math.min(bn, newN * 2);
    const X = new Float64Array(k * F), Y = new Float64Array(k);
    for (let i = 0; i < k; i++) { const j = Math.floor(Math.random() * bn); for (let f = 0; f < F; f++) X[i * F + f] = BX[j * F + f]; Y[i] = BY[j]; }
    const loss = net.train(X, Y, { epochs: rd < pretrain ? 3 : 1, batch: 64, lr, seed: rd });
    hist.push(...scores); if (hist.length > 1200) hist = hist.slice(-1200);
    fs.writeFileSync(out + '.last', JSON.stringify({ nn: cur.nn, rd }));
    if (rd % 5 === 0 || rd === pretrain + rounds - 1) {
      const S = summary(hist);
      console.log(`${mode} r${rd} parties=${seedBase - +(process.env.SEED ?? 1e7)} moy(glissante)=${S.mean} p1000=${S.p1000} perte=${loss.toFixed(4)} lr=${lr}`);
      fs.writeFileSync(out, JSON.stringify({ nn: net.toJSON() }));
    }
    if (rd === pretrain - 1) hist = [];
    if (process.env.DECAY && rd > pretrain && rd % +process.env.DECAY === 0) lr *= 0.7;
  }
  ws.forEach(w => w.terminate());
})();
