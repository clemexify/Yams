'use strict';
// Petit perceptron multicouche (ReLU, sortie linéaire) avec Adam, sans dépendance.
class NN {
  constructor(sizes, seed = 1) {
    this.sizes = sizes; this.L = sizes.length - 1;
    let a = seed >>> 0;
    const rnd = () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; };
    const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());
    this.W = []; this.b = [];
    for (let l = 0; l < this.L; l++) {
      const n = sizes[l], m = sizes[l + 1], sd = Math.sqrt(2 / n) * (l === this.L - 1 ? 0.1 : 1);
      this.W.push(Float64Array.from({ length: n * m }, () => gauss() * sd));
      this.b.push(new Float64Array(m));
    }
    this.buf = sizes.map(s => new Float64Array(s));
  }
  forward(x) {
    let h = x;
    for (let l = 0; l < this.L; l++) {
      const n = this.sizes[l], m = this.sizes[l + 1], W = this.W[l], b = this.b[l], o = this.buf[l + 1];
      for (let j = 0; j < m; j++) o[j] = b[j];
      for (let i = 0; i < n; i++) { const xi = h[i]; if (xi === 0) continue; const off = i * m; for (let j = 0; j < m; j++) o[j] += xi * W[off + j]; }
      if (l < this.L - 1) for (let j = 0; j < m; j++) if (o[j] < 0) o[j] = 0;
      h = o;
    }
    return h[0];
  }
  toJSON() { return { sizes: this.sizes, W: this.W.map(w => Array.from(w)), b: this.b.map(v => Array.from(v)) }; }
  static from(j) {
    const n = new NN(j.sizes); n.W = j.W.map(w => Float64Array.from(w)); n.b = j.b.map(v => Float64Array.from(v)); return n;
  }
  // Entraînement par mini-lots (perte quadratique), Adam.
  train(X, Y, { epochs = 1, batch = 128, lr = 1e-3, seed = 7 } = {}) {
    const F = this.sizes[0], N = Y.length;
    if (!this.m) { this.m = this.W.map(w => new Float64Array(w.length)); this.v = this.W.map(w => new Float64Array(w.length));
      this.mb = this.b.map(w => new Float64Array(w.length)); this.vb = this.b.map(w => new Float64Array(w.length)); this.t = 0; }
    const gW = this.W.map(w => new Float64Array(w.length)), gb = this.b.map(w => new Float64Array(w.length));
    const acts = this.sizes.map(s => new Float64Array(s)), dl = this.sizes.map(s => new Float64Array(s));
    const idx = Int32Array.from({ length: N }, (_, i) => i);
    let a = seed >>> 0; const rnd = () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; };
    let loss = 0;
    for (let ep = 0; ep < epochs; ep++) {
      for (let i = N - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
      loss = 0;
      for (let s0 = 0; s0 < N; s0 += batch) {
        const s1 = Math.min(N, s0 + batch);
        gW.forEach(g => g.fill(0)); gb.forEach(g => g.fill(0));
        for (let q = s0; q < s1; q++) {
          const k = idx[q];
          for (let i = 0; i < F; i++) acts[0][i] = X[k * F + i];
          for (let l = 0; l < this.L; l++) {
            const n = this.sizes[l], m = this.sizes[l + 1], W = this.W[l], o = acts[l + 1], h = acts[l];
            for (let j = 0; j < m; j++) o[j] = this.b[l][j];
            for (let i = 0; i < n; i++) { const xi = h[i]; if (xi === 0) continue; const off = i * m; for (let j = 0; j < m; j++) o[j] += xi * W[off + j]; }
            if (l < this.L - 1) for (let j = 0; j < m; j++) if (o[j] < 0) o[j] = 0;
          }
          const err = acts[this.L][0] - Y[k]; loss += err * err;
          dl[this.L][0] = err;
          for (let l = this.L - 1; l >= 0; l--) {
            const n = this.sizes[l], m = this.sizes[l + 1], W = this.W[l], h = acts[l], d = dl[l + 1], G = gW[l];
            for (let j = 0; j < m; j++) gb[l][j] += d[j];
            const dn = dl[l];
            for (let i = 0; i < n; i++) {
              const xi = h[i], off = i * m; let s = 0;
              for (let j = 0; j < m; j++) { if (xi !== 0) G[off + j] += xi * d[j]; s += W[off + j] * d[j]; }
              dn[i] = (l > 0 && h[i] <= 0) ? 0 : s;
            }
          }
        }
        this.t++;
        const B = s1 - s0, b1 = 0.9, b2 = 0.999, c1 = 1 - Math.pow(b1, this.t), c2 = 1 - Math.pow(b2, this.t);
        for (let l = 0; l < this.L; l++) {
          const upd = (P, Gr, M, V) => { for (let i = 0; i < P.length; i++) { const g = Gr[i] / B; M[i] = b1 * M[i] + (1 - b1) * g; V[i] = b2 * V[i] + (1 - b2) * g * g; P[i] -= lr * (M[i] / c1) / (Math.sqrt(V[i] / c2) + 1e-8); } };
          upd(this.W[l], gW[l], this.m[l], this.v[l]); upd(this.b[l], gb[l], this.mb[l], this.vb[l]);
        }
      }
    }
    return loss / N;
  }
}
module.exports = { NN };
