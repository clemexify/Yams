'use strict';
// Bilan de toutes les configurations : bot final, versions bruitées, ronde 80 (reste-t-il à apprendre ?)
const { Worker, isMainThread, parentPort } = require('worker_threads');
const os = require('os'), fs = require('fs');
const VB = require('./vbot');
if (!isMainThread) {
  parentPort.on('message', ({ id, params, seeds }) => {
    const bot = new VB.VBot(VB.variant(id), params);
    parentPort.postMessage(seeds.map(s => VB.playGame(bot, s).score));
  });
  return;
}
const C = require('./configs');
(async () => {
  const N = +process.argv[2] || 400, n = os.cpus().length;
  const ws = [...Array(n)].map(() => new Worker(__filename));
  const seeds = [...Array(N)].map((_, i) => 4e9 + i);
  const run = (id, params) => Promise.all(ws.map((w, i) => new Promise(res => { w.once('message', res); w.postMessage({ id, params, seeds: seeds.filter((_, j) => j % n === i) }); }))).then(p => p.flat());
  const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
  const rows = [];
  for (const [k, ids] of Object.entries(C.configs)) {
    const fin = JSON.parse(fs.readFileSync(`vparams/${k}.json`));
    const f = await run(k, fin);
    const r80 = mean(await run(k, JSON.parse(fs.readFileSync(`vparams/${k}-r80.json`))));
    const nz = [];
    for (const z of [10, 25, 50]) nz.push(mean(await run(k, { ...fin, noise: z })));
    const sd = Math.sqrt(mean(f.map(x => (x - mean(f)) ** 2)));
    const row = { k, ids: ids.join(' '), fin: +mean(f).toFixed(0), sd: +sd.toFixed(0), r80: +r80.toFixed(0), n10: +nz[0].toFixed(0), n25: +nz[1].toFixed(0), n50: +nz[2].toFixed(0) };
    rows.push(row); console.log(JSON.stringify(row));
  }
  fs.writeFileSync('vsummary.json', JSON.stringify(rows, null, 1));
  ws.forEach(w => w.terminate());
})();
