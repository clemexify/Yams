'use strict';
// Apprentissage TD(λ) d'un bot pour une variante. Usage : node vtrain.js <variante> <rondes>
// Sauvegarde vparams/<variante>.json et des instantanés vparams/<variante>-r<N>.json (bots faibles).
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os'), fs = require('fs');
const E = require('./engine'), VE = require('./vengine'), VB = require('./vbot');
if (!isMainThread) {
  const V = VB.variant(workerData.id);
  parentPort.on('message', ({ params, seeds, eps, lam }) => {
    const bot = new VB.VBot(V, params), xr = E.rng(seeds[0] * 31 + 7);
    const F = VB.nf(V), X = [], Y = [], scores = [];
    for (const sd of seeds) {
      const fs_ = [], vs = [], sh = [];
      const g = VB.playGame(bot, sd, { explore: eps, xr, onPlace: s => {
        fs_.push(VB.feat(V, s.mask, s.up, s.turn, new Float64Array(F))); sh.push(VE.shaped(V, s)); vs.push(bot.value(s.mask, s.up, s.turn));
      } });
      scores.push(g.score);
      const n = fs_.length, G = new Float64Array(n);
      for (let t = n - 2; t >= 0; t--) G[t] = (sh[t + 1] - sh[t]) + (1 - lam) * vs[t + 1] + lam * G[t + 1];
      for (let t = 0; t < n; t++) { X.push(fs_[t]); Y.push(G[t] / VB.SCALE); }
    }
    const Xf = new Float32Array(X.length * F); X.forEach((x, i) => Xf.set(x, i * F));
    parentPort.postMessage({ X: Xf, Y: Float32Array.from(Y), scores });
  });
  return;
}
const { summary } = require('./pool');
const { NN } = require('./nn');
(async () => {
  const id = process.argv[2], rounds = +process.argv[3] || 200;
  const V = VB.variant(id), F = VB.nf(V);
  fs.mkdirSync('vparams', { recursive: true });
  const out = `vparams/${id}.json`;
  const params = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out)) : VB.defaultParams(V);
  const net = NN.from(params.nn), n = os.cpus().length;
  const gpw = Math.max(4, Math.round(20 * 60 / V.turns)); // ~1200 coups par worker et par ronde
  const ws = [...Array(n)].map(() => new Worker(__filename, { workerData: { id } }));
  const CAP = 150000, BX = new Float32Array(CAP * F), BY = new Float32Array(CAP); let bn = 0, bp = 0;
  let seed = 1e9, hist = [];
  const t0 = Date.now();
  for (let rd = 0; rd < rounds; rd++) {
    const cur = { variant: id, nn: net.toJSON() };
    const parts = await Promise.all(ws.map((w, i) => new Promise(res => {
      w.once('message', res); w.postMessage({ params: cur, seeds: [...Array(gpw)].map((_, k) => seed + i * gpw + k), eps: 0.05, lam: 0.7 });
    })));
    seed += n * gpw;
    let newN = 0;
    for (const p of parts) { for (let i = 0; i < p.Y.length; i++) { BX.set(p.X.subarray(i * F, i * F + F), bp * F); BY[bp] = p.Y[i]; bp = (bp + 1) % CAP; bn = Math.min(CAP, bn + 1); } newN += p.Y.length; hist.push(...p.scores); }
    const k = Math.min(bn, newN * 2), X = new Float64Array(k * F), Y = new Float64Array(k);
    for (let i = 0; i < k; i++) { const j = Math.floor(Math.random() * bn); for (let f = 0; f < F; f++) X[i * F + f] = BX[j * F + f]; Y[i] = BY[j]; }
    net.train(X, Y, { epochs: 1, batch: 64, lr: 1e-3, seed: rd });
    if (hist.length > 1500) hist = hist.slice(-1500);
    const p = { variant: id, nn: net.toJSON() };
    fs.writeFileSync(out, JSON.stringify(p));
    if (!process.env.NOSNAP && [2, 5, 10, 20, 40, 80].includes(rd)) fs.writeFileSync(`vparams/${id}-r${rd}.json`, JSON.stringify(p));
    if (rd % 10 === 0 || rd === rounds - 1) console.log(`${id} r${rd} parties=${seed - 1e9} moy=${summary(hist).mean} t=${((Date.now() - t0) / 60000).toFixed(1)}min`);
  }
  ws.forEach(w => w.terminate());
})();
