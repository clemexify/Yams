'use strict';
// Exporte les réseaux des boss du Mont Yams vers ../bots/<boss>.json (poids arrondis),
// puis vérifie que mont-bot.js (version navigateur) joue comme vbot.js sur les mêmes dés.
const fs = require('fs');
const E = require('./engine'), VB = require('./vbot');
const MB = require('../mont-bot.js');
const { WORLDS } = require('./mont-spec');
const DEC = +process.env.DEC || 4, NG = +process.env.NG || 200;
const rd = x => +x.toFixed(DEC);

fs.mkdirSync('../bots', { recursive: true });
for (const w of WORLDS) {
  const B = w.boss, p = JSON.parse(fs.readFileSync(`vparams/${B.cfg}.json`));
  const out = { cle: B.cfg, sizes: p.nn.sizes, W: p.nn.W.map(a => a.map(rd)), b: p.nn.b.map(a => a.map(rd)) };
  const txt = JSON.stringify(out);
  fs.writeFileSync(`../bots/${B.id}.json`, txt);
  // Comparaison sans bruit, mêmes réserves de dés
  const ref = new VB.VBot(VB.variant(B.cfg), p), V = MB.variante(B.cfg), mb = new MB.Bot(V, out, 0);
  let a = 0, b = 0, diff = 0;
  for (let g = 0; g < NG; g++) {
    const seed = 6e9 + g;
    a += VB.playGame(ref, seed).score;
    const R = E.rng(seed), s = MB.etatVide(V);
    for (let t = 0; t < V.turns; t++) { const pool = []; for (let i = 0; i < 15; i++) pool.push(1 + Math.floor(R() * 6)); MB.jouerTour(mb, s, pool); }
    const sc = MB.total(V, s); b += sc;
  }
  console.log(`${B.id.padEnd(9)} ${String(txt.length).padStart(7)} octets  vbot ${(a / NG).toFixed(1)}  navigateur ${(b / NG).toFixed(1)}`);
}
