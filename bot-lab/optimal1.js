'use strict';
// Stratégie optimale exacte pour 1 colonne Normale (règles de base) : programmation dynamique
// sur (cases remplies, somme des chiffres plafonnée à 60). + et − comptent dès leur pose.
const E = require('./engine');
const { DICE, ND, KT, SUB, NK, KEMPTY, SC, DSUM } = E;
const NR = 12, ALL = 4095;
const P1 = new Float64Array(ND); { const t = KT[KEMPTY]; for (let i = 0; i < t.idx.length; i++) P1[t.idx[i]] += t.p[i]; }
const V = new Float64Array(4096 * 61); // V[mask*61+s] : espérance des points restants
const popc = x => { let n = 0; while (x) { x &= x - 1; n++; } return n; };
const masks = [...Array(4096).keys()].sort((a, b) => popc(b) - popc(a));

function reward(r, d, s) {
  if (r < 6) { const p = SC[r][d]; return p + (s < 60 && s + p >= 60 ? 30 : 0); }
  if (r === 7) return -DSUM[d];
  return SC[r][d];
}
function next(r, d, s) { return r < 6 ? Math.min(60, s + SC[r][d]) : s; }

// Valeur d'un tour depuis (mask, s) ; renvoie aussi les tables si demandé
function turn(mask, s, keep) {
  const T = new Float64Array(ND), A = new Int8Array(ND);
  for (let d = 0; d < ND; d++) {
    let b = -Infinity, a = -1;
    for (let r = 0; r < NR; r++) if (!(mask >> r & 1)) {
      const v = reward(r, d, s) + V[(mask | 1 << r) * 61 + next(r, d, s)];
      if (v > b) { b = v; a = r; }
    }
    T[d] = b; A[d] = a;
  }
  const K2 = new Float64Array(NK);
  for (let k = 0; k < NK; k++) { const t = KT[k]; let e = 0; for (let i = 0; i < t.idx.length; i++) e += t.p[i] * T[t.idx[i]]; K2[k] = e; }
  const E2 = new Float64Array(ND);
  for (let d = 0; d < ND; d++) { let b = T[d]; for (const k of SUB[d]) if (K2[k] > b) b = K2[k]; E2[d] = b; }
  const K1 = new Float64Array(NK);
  for (let k = 0; k < NK; k++) { const t = KT[k]; let e = 0; for (let i = 0; i < t.idx.length; i++) e += t.p[i] * E2[t.idx[i]]; K1[k] = e; }
  let ev = 0;
  for (let d = 0; d < ND; d++) { let b = E2[d]; for (const k of SUB[d]) if (K1[k] > b) b = K1[k]; ev += P1[d] * b; }
  return keep ? { ev, T, A, K2, K1, E2 } : ev;
}

function solve() {
  const t0 = Date.now();
  for (const m of masks) {
    if (m === ALL) continue;
    const upperDone = (m & 63) === 63;
    for (let s = 0; s <= 60; s++) {
      if (upperDone && s > 0) { V[m * 61 + s] = V[m * 61]; continue; }
      V[m * 61 + s] = turn(m, s);
    }
  }
  return (Date.now() - t0) / 1000;
}

// Partie jouée avec la stratégie optimale (mêmes tirages que vbot.playGame)
function playGame(seed) {
  const R = E.rng(seed); let mask = 0, s = 0, score = 0;
  const vals = new Array(NR).fill(null);
  for (let t = 0; t < 12; t++) {
    const pool = []; for (let i = 0; i < 15; i++) pool.push(1 + Math.floor(R() * 6));
    const dice = [0, 0, 0, 0, 0]; let keep = [false, false, false, false, false];
    const roll = rn => { for (let i = 0; i < 5; i++) if (!keep[i]) dice[i] = pool[(rn - 1) * 5 + i]; };
    const dI = () => { const c = [0, 0, 0, 0, 0, 0]; for (const v of dice) c[v - 1]++; return E.DIDX[E.code(c)]; };
    const toMask = kc => { const need = kc.slice(), k = [false, false, false, false, false]; for (let i = 0; i < 5; i++) if (need[dice[i] - 1] > 0) { need[dice[i] - 1]--; k[i] = true; } return k; };
    const tb = turn(mask, s, true);
    let d; roll(1); d = dI();
    for (let rn = 1; rn < 3; rn++) {
      const KV = rn === 1 ? tb.K1 : tb.K2, stop = rn === 1 ? tb.E2[d] : tb.T[d];
      let bk = -1, bv = -Infinity; for (const k of SUB[d]) if (KV[k] > bv) { bv = KV[k]; bk = k; }
      if (rn === 1 ? tb.T[d] >= bv : tb.T[d] >= bv) break;
      keep = toMask(E.KEEPS[bk]); roll(rn + 1); d = dI();
    }
    const r = tb.A[d];
    vals[r] = r === 7 ? DSUM[d] : SC[r][d];
    score += reward(r, d, s) - (r < 6 && s < 60 && s + SC[r][d] >= 60 ? 30 : 0);
    s = next(r, d, s); mask |= 1 << r;
  }
  let up = 0; for (let r = 0; r < 6; r++) up += vals[r];
  let tot = up + (up >= 60 ? 30 : 0) + vals[6] - vals[7]; for (let r = 8; r < 12; r++) tot += vals[r];
  return tot;
}

if (require.main === module) {
  const sec = solve();
  console.log(`résolu en ${sec.toFixed(0)} s ; espérance optimale = ${V[0].toFixed(1)}`);
  const N = +process.argv[2] || 2000; let S = [];
  for (let i = 0; i < N; i++) S.push(playGame(4e9 + i));
  S.sort((a, b) => a - b);
  console.log(`parties jouées (mêmes graines que veval) : moy ${(S.reduce((a, b) => a + b) / N).toFixed(1)} med ${S[N >> 1]} min ${S[0]} max ${S[N - 1]}`);
  require('fs').writeFileSync('vparams/optimal1.bin', Buffer.from(V.buffer));
}
module.exports = { solve, V, turn, playGame };
