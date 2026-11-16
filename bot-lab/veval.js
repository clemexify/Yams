'use strict';
// Évalue, pour une variante, le bot final, ses instantanés et des versions bruitées (mêmes dés).
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os'), fs = require('fs');
const VB = require('./vbot');
if (!isMainThread) {
  parentPort.on('message', ({ id, params, seeds }) => {
    const bot = new VB.VBot(VB.variant(id), params);
    parentPort.postMessage(seeds.map(s => VB.playGame(bot, s).score));
  });
  return;
}
const { summary } = require('./pool');
(async () => {
  const id = process.argv[2], N = +process.argv[3] || 600;
  const n = os.cpus().length, ws = [...Array(n)].map(() => new Worker(__filename));
  const seeds = [...Array(N)].map((_, i) => 4e9 + i);
  const run = params => Promise.all(ws.map((w, i) => new Promise(res => { w.once('message', res); w.postMessage({ id, params, seeds: seeds.filter((_, j) => j % n === i) }); }))).then(p => p.flat());
  const fin = JSON.parse(fs.readFileSync(`vparams/${id}.json`));
  const list = [['final', fin]];
  for (const r of [2, 5, 10, 20, 40, 80]) { const f = `vparams/${id}-r${r}.json`; if (fs.existsSync(f)) list.push([`ronde ${r}`, JSON.parse(fs.readFileSync(f))]); }
  for (const z of [10, 25, 50]) list.push([`final+bruit ${z}`, { ...fin, noise: z }]);
  console.log(`== ${VB.variant(id).name} (${id}) ==`);
  for (const [lbl, p] of list) { const S = summary(await run(p)); console.log(lbl.padEnd(16), `moy ${S.mean}  med ${S.med}  min ${S.min}  max ${S.max}  sd ${S.sd}`); }
  ws.forEach(w => w.terminate());
})();
