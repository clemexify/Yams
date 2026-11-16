'use strict';
// Itération de point fixe : jouer, mesurer la valeur moyenne de chaque case et la loi des
// chiffres, réinjecter ces mesures comme fonction de valeur, recommencer.
const fs = require('fs');
const { Pool, summary } = require('./pool');
const botFile = process.argv[2] || './bot';
const out = process.argv[3] || 'params.json';
const iters = +process.argv[4] || 8, N = +process.argv[5] || 3000;
const B = require(botFile);
(async () => {
  let params = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out)) : B.defaultParams();
  const pool = new Pool(botFile);
  for (let it = 0; it < iters; it++) {
    const seeds = [...Array(N)].map((_, i) => 1e6 * (it + 1) + i);
    const r = await pool.run(params, seeds);
    const S = summary(r.scores);
    const cm = [0, 1, 2, 3, 4].map(c => (r.cols.reduce((a, x) => a + x[c], 0) / r.cols.length).toFixed(0));
    console.log(`it${it}`, JSON.stringify(S), 'colonnes', cm.join(' '));
    const a = 0.6; // amortissement
    for (let c = 0; c < 5; c++) {
      for (let k = 6; k < 12; k++) if (r.cnt[c][k]) params.ev[c][k] = (1 - a) * params.ev[c][k] + a * r.sum[c][k] / r.cnt[c][k];
      for (let f = 0; f < 6; f++) { const t = r.dist[c][f].reduce((x, y) => x + y, 0); if (t) params.dist[c][f] = params.dist[c][f].map((p, n) => (1 - a) * p + a * r.dist[c][f][n] / t); }
    }
    fs.writeFileSync(out, JSON.stringify(params));
  }
  pool.close();
})();
