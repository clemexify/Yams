'use strict';
// Itération de politique approchée : jouer avec V, ajuster V par moindres carrés sur les
// points réellement marqués d'ici la fin (XᵀX et Xᵀy accumulés dans les workers), recommencer.
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os'), fs = require('fs');

if (!isMainThread) {
  const M = require(workerData.botFile);
  const E = require('./engine');
  parentPort.on('message', ({ params, seeds, eps }) => {
    const xr = E.rng(seeds[0] * 7 + 13);
    const bot = new M.Bot(params);
    const P = bot.P, NF = M.NF;
    const XtX = new Float64Array(NF * NF), Xty = new Float64Array(NF);
    const dist = [...Array(5)].map(() => [...Array(6)].map(() => new Array(6).fill(0)));
    const scores = [], cols = [];
    for (const sd of seeds) {
      const snaps = [];
      const g = M.playGame(bot, sd, { explore: eps, xr, onPlace: (s, t) => snaps.push([M.features(s, P), M.shaped(s)]) });
      scores.push(g.score); cols.push([0, 1, 2, 3, 4].map(c => E.colTotal(g.state, c)));
      for (const [f, sh] of snaps) {
        const y = g.score - sh;
        const nz = []; for (let i = 0; i < NF; i++) if (f[i] !== 0) nz.push(i);
        for (const i of nz) { Xty[i] += f[i] * y; for (const j of nz) XtX[i * NF + j] += f[i] * f[j]; }
      }
      for (const x of g.rec) if (x.r < 6) dist[x.c][x.r][x.n]++;
    }
    parentPort.postMessage({ XtX: [...XtX], Xty: [...Xty], dist, scores, cols });
  });
  return;
}

function solve(A, b, n) {
  const M = [...Array(n)].map((_, i) => [...A.slice(i * n, i * n + n), b[i]]);
  for (let i = 0; i < n; i++) {
    let p = i; for (let k = i + 1; k < n; k++) if (Math.abs(M[k][i]) > Math.abs(M[p][i])) p = k;
    [M[i], M[p]] = [M[p], M[i]];
    for (let k = i + 1; k < n; k++) { const f = M[k][i] / M[i][i]; if (f) for (let j = i; j <= n; j++) M[k][j] -= f * M[i][j]; }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = M[i][n]; for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j]; x[i] = s / M[i][i]; }
  return x;
}

const { summary } = require('./pool');
if (require.main === module) (async () => {
  const botFile = process.argv[2] || './bot2', out = process.argv[3] || 'params2.json';
  const iters = +process.argv[4] || 6, N = +process.argv[5] || 3000, lam = +process.argv[6] || 10;
  const eps = +(process.argv[7] ?? 0.1), decay = +(process.argv[8] ?? 0.5);
  let aXtX = null, aXty = null;
  const M = require(botFile);
  let params = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out)) : M.defaultParams();
  const n = os.cpus().length;
  const ws = [...Array(n)].map(() => new Worker(__filename, { workerData: { botFile } }));
  for (let it = 0; it < iters; it++) {
    const seeds = [...Array(N)].map((_, i) => 7e6 + 1e5 * it + i);
    const parts = await Promise.all(ws.map((w, i) => new Promise(res => { w.once('message', res); w.postMessage({ params, eps, seeds: seeds.filter((_, j) => j % n === i) }); })));
    const NF = M.NF, XtX = new Float64Array(NF * NF), Xty = new Float64Array(NF);
    const dist = [...Array(5)].map(() => [...Array(6)].map(() => new Array(6).fill(0)));
    const scores = [], cols = [];
    for (const p of parts) {
      for (let i = 0; i < NF * NF; i++) XtX[i] += p.XtX[i];
      for (let i = 0; i < NF; i++) Xty[i] += p.Xty[i];
      for (let c = 0; c < 5; c++) for (let f = 0; f < 6; f++) for (let k = 0; k < 6; k++) dist[c][f][k] += p.dist[c][f][k];
      scores.push(...p.scores); cols.push(...p.cols);
    }
    const S = summary(scores);
    const cm = [0, 1, 2, 3, 4].map(c => (cols.reduce((a, x) => a + x[c], 0) / cols.length).toFixed(0));
    console.log(`it${it}`, JSON.stringify(S), 'colonnes', cm.join(' '));
    // Données cumulées d'une itération à l'autre (avec oubli), ridge léger
    if (!aXtX) { aXtX = XtX; aXty = Xty; }
    else for (let i = 0; i < NF * NF; i++) aXtX[i] = decay * aXtX[i] + XtX[i];
    if (aXty !== Xty) for (let i = 0; i < NF; i++) aXty[i] = decay * aXty[i] + Xty[i];
    const A = Float64Array.from(aXtX), b = Float64Array.from(aXty);
    for (let i = 0; i < NF; i++) { A[i * NF + i] += lam * N / 1000; b[i] += lam * N / 1000 * params.w[i]; }
    const w = solve(A, b, NF);
    const a = 1;
    params.w = params.w.map((x, i) => (1 - a) * x + a * w[i]);
    if (!process.env.FIXDIST) for (let c = 0; c < 5; c++) for (let f = 0; f < 6; f++) {
      const t = dist[c][f].reduce((x, y) => x + y, 0);
      if (t) params.dist[c][f] = params.dist[c][f].map((p, k) => (1 - a) * p + a * dist[c][f][k] / t);
    }
    fs.writeFileSync(out, JSON.stringify(params));
  }
  ws.forEach(w => w.terminate());
})();
module.exports = { solve };
