'use strict';
// Joue des parties en parallèle. Chaque worker reçoit (variante, params, graines) et renvoie
// scores + statistiques par case pour réapprendre la fonction de valeur.
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os');
if (!isMainThread) {
  const B = require(workerData.botFile || './bot');
  parentPort.on('message', ({ params, seeds, id }) => {
    const bot = new B.Bot(params); if (params.search) bot.search = params.search;
    const out = { id, scores: [], cols: [], stat: null };
    const NC = 5, NR = 12;
    const sum = [...Array(NC)].map(() => new Float64Array(NR)), cnt = [...Array(NC)].map(() => new Float64Array(NR));
    const dist = [...Array(NC)].map(() => [...Array(6)].map(() => new Float64Array(6)));
    for (const sd of seeds) {
      const g = B.playGame(bot, sd);
      out.scores.push(g.score);
      out.cols.push([0, 1, 2, 3, 4].map(c => require('./engine').colTotal(g.state, c)));
      for (const x of g.rec) {
        const v = x.r === 7 ? -x.pts : x.pts;
        sum[x.c][x.r] += v; cnt[x.c][x.r]++;
        if (x.r < 6) dist[x.c][x.r][x.n]++;
      }
    }
    out.stat = { sum: sum.map(a => [...a]), cnt: cnt.map(a => [...a]), dist: dist.map(a => a.map(b => [...b])) };
    parentPort.postMessage(out);
  });
  return;
}
class Pool {
  constructor(botFile, n = os.cpus().length) {
    this.ws = [...Array(n)].map(() => new Worker(__filename, { workerData: { botFile } }));
  }
  run(params, seeds) {
    const n = this.ws.length, chunks = [...Array(n)].map((_, i) => seeds.filter((_, j) => j % n === i));
    return Promise.all(this.ws.map((w, i) => new Promise(res => {
      w.once('message', res); w.postMessage({ params, seeds: chunks[i], id: i });
    }))).then(parts => {
      const NC = 5, NR = 12;
      const r = { scores: [], cols: [], sum: [...Array(NC)].map(() => new Array(NR).fill(0)), cnt: [...Array(NC)].map(() => new Array(NR).fill(0)), dist: [...Array(NC)].map(() => [...Array(6)].map(() => new Array(6).fill(0))) };
      for (const p of parts) {
        r.scores.push(...p.scores); r.cols.push(...p.cols);
        for (let c = 0; c < NC; c++) for (let k = 0; k < NR; k++) { r.sum[c][k] += p.stat.sum[c][k]; r.cnt[c][k] += p.stat.cnt[c][k]; }
        for (let c = 0; c < NC; c++) for (let f = 0; f < 6; f++) for (let k = 0; k < 6; k++) r.dist[c][f][k] += p.stat.dist[c][f][k];
      }
      return r;
    });
  }
  close() { this.ws.forEach(w => w.terminate()); }
}
function summary(scores) {
  const S = scores.slice().sort((a, b) => a - b), n = S.length, m = S.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(S.reduce((a, b) => a + (b - m) ** 2, 0) / n);
  return { n, mean: +m.toFixed(1), se: +(sd / Math.sqrt(n)).toFixed(1), sd: +sd.toFixed(0), med: S[n >> 1], min: S[0], max: S[n - 1],
    p1000: +(S.filter(x => x >= 1000).length / n * 100).toFixed(1), p1250: +(S.filter(x => x >= 1250).length / n * 100).toFixed(1) };
}
module.exports = { Pool, summary };
