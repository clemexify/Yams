'use strict';
// Analyse coup par coup : à chaque placement, compare la case choisie par le bot aux autres
// cases candidates en jouant la fin de partie R fois (mêmes dés futurs pour tous les
// candidats). Signale les placements où une autre case rapporte nettement plus.
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os'), fs = require('fs');
const E = require('./engine');

function playFrom(bot, M, s0, seed) {
  // Fin de partie depuis l'état s0 avec la politique du bot
  const s = E.cloneState(s0);
  const g = M.playGame(bot, seed, { start: s });
  return g.score;
}

if (!isMainThread) {
  const M = require(workerData.botFile);
  const bot = new M.Bot(workerData.params);
  parentPort.on('message', ({ state, cands, d, seeds }) => {
    const res = cands.map(([c, r, cross]) => {
      const s = E.cloneState(state); E.place(s, c, r, d, cross);
      return seeds.map(sd => M.playGame(bot, sd, { start: s }).score);
    });
    parentPort.postMessage(res);
  });
  return;
}

(async () => {
  const botFile = process.argv[2], pf = process.argv[3], seed = +process.argv[4] || 42, R = +process.argv[5] || 240;
  const M = require(botFile);
  const params = JSON.parse(fs.readFileSync(pf));
  const bot = new M.Bot(params);
  const n = os.cpus().length;
  const ws = [...Array(n)].map(() => new Worker(__filename, { workerData: { botFile, params } }));
  const cn = ['N', 'D', 'M', 'S', 'A'];
  // Rejoue la partie du bot et intercepte chaque placement
  const decisions = [];
  M.playGame(bot, seed, { onDecide: (s, d, sok, ann, done) => decisions.push({ s: E.cloneState(s), d, sok, ann, done }) });
  let lost = 0;
  for (const [t, x] of decisions.entries()) {
    const { s, d, sok, ann, done } = x;
    let cands;
    if (ann !== null) continue;
    bot.prepare && bot.prepare(s);
    const { base, seche } = bot.legal(s);
    const all = base.concat(sok ? seche : []).filter(([c, r]) => !(c === 3 && E.isFig(r) && E.SC[r][d] === 0 && false));
    cands = all.map(([c, r]) => [bot.pv(s, c, r, d), c, r]).sort((a, b) => b[0] - a[0]).slice(0, 5).map(z => [z[1], z[2], false]);
    if (!cands.some(z => z[0] === done[0] && z[1] === done[1])) cands.unshift([done[0], done[1], done[2]]);
    if (cands.length < 2) continue;
    const seeds = [...Array(R)].map((_, i) => 3e7 + seed * 1000 + t * 7919 + i);
    const parts = await Promise.all(ws.map((w, i) => new Promise(res => { w.once('message', res); w.postMessage({ state: s, cands, d, seeds: seeds.filter((_, j) => j % n === i) }); })));
    const means = cands.map((_, k) => { const a = parts.flatMap(p => p[k]); return a.reduce((x, y) => x + y, 0) / a.length; });
    const chosen = cands.findIndex(z => z[0] === done[0] && z[1] === done[1]);
    const best = means.indexOf(Math.max(...means));
    const gap = means[best] - means[chosen];
    if (best !== chosen) lost += gap;
    const dice = E.DICE[d].flatMap((k, f) => Array(k).fill(f + 1)).join('');
    const fmt = k => `${cn[cands[k][0]]}:${E.ROWS[cands[k][1]]}=${E.SC[cands[k][1]][d]} (${means[k].toFixed(1)})`;
    console.log(`${String(t + 1).padStart(2)} ${dice} ${sok ? 'sec' : '   '} bot ${fmt(chosen)}${best !== chosen ? `  MIEUX ${fmt(best)} +${gap.toFixed(1)}` : ''}`);
  }
  console.log('perte cumulée estimée', lost.toFixed(1));
  ws.forEach(w => w.terminate());
})();
