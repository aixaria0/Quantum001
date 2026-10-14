/** Compact n-qubit statevector engine. n ≤ 6 is comfortable in the browser. */

export type Complex = { re: number; im: number };

export function c(re: number, im = 0): Complex {
  return { re, im };
}

export function mulRe(ar: number, ai: number, br: number, bi: number) {
  return ar * br - ai * bi;
}
export function mulIm(ar: number, ai: number, br: number, bi: number) {
  return ar * bi + ai * br;
}

export function bitstring(index: number, n: number) {
  return index.toString(2).padStart(n, "0");
}

export class QState {
  n: number;
  re: Float64Array;
  im: Float64Array;

  constructor(n: number, re?: Float64Array, im?: Float64Array) {
    this.n = n;
    const dim = 1 << n;
    this.re = re ?? new Float64Array(dim);
    this.im = im ?? new Float64Array(dim);
  }

  get dim() {
    return 1 << this.n;
  }

  static computational(n: number, index = 0) {
    const s = new QState(n);
    s.re[index] = 1;
    return s;
  }

  static plus(n: number) {
    const s = new QState(n);
    const a = 1 / Math.sqrt(s.dim);
    s.re.fill(a);
    return s;
  }

  clone() {
    return new QState(this.n, this.re.slice(), this.im.slice());
  }

  /** Apply a 2×2 complex matrix to one qubit (qubit 0 = LSB). */
  apply1(
    qubit: number,
    u00r: number,
    u00i: number,
    u01r: number,
    u01i: number,
    u10r: number,
    u10i: number,
    u11r: number,
    u11i: number,
  ) {
    const dim = this.dim;
    const bit = 1 << qubit;
    const nr = new Float64Array(dim);
    const ni = new Float64Array(dim);
    const re = this.re;
    const im = this.im;
    for (let i = 0; i < dim; i++) {
      if (i & bit) continue;
      const j = i | bit;
      const ar = re[i];
      const ai = im[i];
      const br = re[j];
      const bi = im[j];
      nr[i] = mulRe(u00r, u00i, ar, ai) + mulRe(u01r, u01i, br, bi);
      ni[i] = mulIm(u00r, u00i, ar, ai) + mulIm(u01r, u01i, br, bi);
      nr[j] = mulRe(u10r, u10i, ar, ai) + mulRe(u11r, u11i, br, bi);
      ni[j] = mulIm(u10r, u10i, ar, ai) + mulIm(u11r, u11i, br, bi);
    }
    this.re = nr;
    this.im = ni;
    return this;
  }

  h(q: number) {
    const s = Math.SQRT1_2;
    return this.apply1(q, s, 0, s, 0, s, 0, -s, 0);
  }
  x(q: number) {
    return this.apply1(q, 0, 0, 1, 0, 1, 0, 0, 0);
  }
  y(q: number) {
    return this.apply1(q, 0, 0, 0, -1, 0, 1, 0, 0);
  }
  z(q: number) {
    return this.apply1(q, 1, 0, 0, 0, 0, 0, -1, 0);
  }
  s(q: number) {
    return this.apply1(q, 1, 0, 0, 0, 0, 0, 0, 1);
  }
  t(q: number) {
    const c = Math.SQRT1_2;
    return this.apply1(q, 1, 0, 0, 0, 0, 0, c, c);
  }
  rx(q: number, th: number) {
    const c = Math.cos(th / 2);
    const s = Math.sin(th / 2);
    return this.apply1(q, c, 0, 0, -s, 0, -s, c, 0);
  }
  ry(q: number, th: number) {
    const c = Math.cos(th / 2);
    const s = Math.sin(th / 2);
    return this.apply1(q, c, 0, -s, 0, s, 0, c, 0);
  }
  rz(q: number, th: number) {
    const hr = Math.cos(th / 2);
    const hi = Math.sin(th / 2);
    return this.apply1(q, hr, -hi, 0, 0, 0, 0, hr, hi);
  }
  phase(q: number, phi: number) {
    const cr = Math.cos(phi);
    const ci = Math.sin(phi);
    return this.apply1(q, 1, 0, 0, 0, 0, 0, cr, ci);
  }

  hAll() {
    for (let q = 0; q < this.n; q++) this.h(q);
    return this;
  }
  xAll() {
    for (let q = 0; q < this.n; q++) this.x(q);
    return this;
  }

  cnot(control: number, target: number) {
    const dim = this.dim;
    const cbit = 1 << control;
    const tbit = 1 << target;
    const re = this.re;
    const im = this.im;
    for (let i = 0; i < dim; i++) {
      if ((i & cbit) !== 0 && (i & tbit) === 0) {
        const j = i | tbit;
        const tr = re[i];
        const ti = im[i];
        re[i] = re[j];
        im[i] = im[j];
        re[j] = tr;
        im[j] = ti;
      }
    }
    return this;
  }

  cz(a: number, b: number) {
    const abit = 1 << a;
    const bbit = 1 << b;
    for (let i = 0; i < this.dim; i++) {
      if ((i & abit) && (i & bbit)) {
        this.re[i] = -this.re[i];
        this.im[i] = -this.im[i];
      }
    }
    return this;
  }

  /** exp(-i θ/2 Z⊗Z) */
  rzz(a: number, b: number, theta: number) {
    const hr = Math.cos(theta / 2);
    const hi = Math.sin(theta / 2);
    const abit = 1 << a;
    const bbit = 1 << b;
    for (let i = 0; i < this.dim; i++) {
      const same = ((i & abit) === 0) === ((i & bbit) === 0);
      // ZZ = +1 if bits equal, -1 if different
      // multiply by e^{-i θ/2 * zz} = (hr - i hi * zz)
      const zr = same ? hr : hr;
      const zi = same ? -hi : hi;
      const r = this.re[i];
      const im = this.im[i];
      this.re[i] = mulRe(zr, zi, r, im);
      this.im[i] = mulIm(zr, zi, r, im);
    }
    return this;
  }

  mcx(controls: number[], target: number) {
    const mask = controls.reduce((m, q) => m | (1 << q), 0);
    const tbit = 1 << target;
    const re = this.re;
    const im = this.im;
    for (let i = 0; i < this.dim; i++) {
      if ((i & mask) === mask && (i & tbit) === 0) {
        const j = i | tbit;
        const tr = re[i];
        const ti = im[i];
        re[i] = re[j];
        im[i] = im[j];
        re[j] = tr;
        im[j] = ti;
      }
    }
    return this;
  }

  qft(qubits?: number[]) {
    const qs = qubits ?? [...Array(this.n).keys()].reverse();
    const m = qs.length;
    for (let i = 0; i < m; i++) {
      this.h(qs[i]);
      for (let j = 1; j < m - i; j++) {
        const phi = Math.PI / (1 << j);
        // controlled phase from qs[i+j] onto qs[i]
        this.cphase(qs[i + j], qs[i], phi);
      }
    }
    for (let i = 0; i < Math.floor(m / 2); i++) this.swap(qs[i], qs[m - 1 - i]);
    return this;
  }

  iqft(qubits?: number[]) {
    const qs = qubits ?? [...Array(this.n).keys()].reverse();
    const m = qs.length;
    for (let i = 0; i < Math.floor(m / 2); i++) this.swap(qs[i], qs[m - 1 - i]);
    for (let i = m - 1; i >= 0; i--) {
      for (let j = m - i - 1; j >= 1; j--) {
        this.cphase(qs[i + j], qs[i], -Math.PI / (1 << j));
      }
      this.h(qs[i]);
    }
    return this;
  }

  cphase(control: number, target: number, phi: number) {
    const cr = Math.cos(phi);
    const ci = Math.sin(phi);
    const cbit = 1 << control;
    const tbit = 1 << target;
    for (let i = 0; i < this.dim; i++) {
      if ((i & cbit) && (i & tbit)) {
        const r = this.re[i];
        const im = this.im[i];
        this.re[i] = mulRe(cr, ci, r, im);
        this.im[i] = mulIm(cr, ci, r, im);
      }
    }
    return this;
  }

  swap(a: number, b: number) {
    if (a === b) return this;
    this.cnot(a, b).cnot(b, a).cnot(a, b);
    return this;
  }

  probabilities() {
    const p = new Array<number>(this.dim);
    for (let i = 0; i < this.dim; i++) {
      p[i] = this.re[i] * this.re[i] + this.im[i] * this.im[i];
    }
    return p;
  }

  /** Reduced Bloch vector for one qubit. */
  bloch(qubit: number) {
    const bit = 1 << qubit;
    let rho00 = 0;
    let rho11 = 0;
    let rho01r = 0;
    let rho01i = 0;
    for (let i = 0; i < this.dim; i++) {
      if (i & bit) continue;
      const j = i | bit;
      const a0r = this.re[i];
      const a0i = this.im[i];
      const a1r = this.re[j];
      const a1i = this.im[j];
      rho00 += a0r * a0r + a0i * a0i;
      rho11 += a1r * a1r + a1i * a1i;
      rho01r += a0r * a1r + a0i * a1i;
      rho01i += a0i * a1r - a0r * a1i;
    }
    return {
      x: 2 * rho01r,
      y: -2 * rho01i,
      z: rho00 - rho11,
    };
  }

  expectZ(qubit: number) {
    return this.bloch(qubit).z;
  }

  mostProbable() {
    const p = this.probabilities();
    let best = 0;
    for (let i = 1; i < p.length; i++) if (p[i] > p[best]) best = i;
    return { index: best, bits: bitstring(best, this.n), p: p[best] };
  }
}

export function groverOracle(s: QState, marked: number) {
  const n = s.n;
  for (let q = 0; q < n; q++) {
    if (((marked >> q) & 1) === 0) s.x(q);
  }
  s.h(n - 1);
  s.mcx([...Array(n - 1).keys()], n - 1);
  s.h(n - 1);
  for (let q = 0; q < n; q++) {
    if (((marked >> q) & 1) === 0) s.x(q);
  }
  return s;
}

export function groverDiffuser(s: QState) {
  s.hAll().xAll();
  s.h(s.n - 1);
  s.mcx([...Array(s.n - 1).keys()], s.n - 1);
  s.h(s.n - 1);
  s.xAll().hAll();
  return s;
}

export function groverOptimalIters(n: number, m = 1) {
  const N = 1 << n;
  return Math.max(1, Math.round((Math.PI / 4) * Math.sqrt(N / m)));
}

export function runGrover(n: number, marked: number, iters?: number) {
  const k = iters ?? groverOptimalIters(n);
  const s = QState.computational(n, 0).hAll();
  const history: number[][] = [s.probabilities()];
  for (let i = 0; i < k; i++) {
    groverOracle(s, marked);
    groverDiffuser(s);
    history.push(s.probabilities());
  }
  return { state: s, history, iters: k };
}

export function gcd(a: number, b: number) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export function modPow(base: number, exp: number, mod: number) {
  let result = 1 % mod;
  base %= mod;
  while (exp > 0) {
    if (exp & 1) result = (result * base) % mod;
    base = (base * base) % mod;
    exp >>= 1;
  }
  return result;
}

export function continuedFraction(y: number, Q: number, maxDen: number) {
  const convergents: { p: number; q: number }[] = [];
  let n = y;
  let d = Q;
  let p0 = 0,
    p1 = 1,
    q0 = 1,
    q1 = 0;
  for (let i = 0; i < 32; i++) {
    const a = Math.floor(n / d);
    const p = a * p1 + p0;
    const q = a * q1 + q0;
    convergents.push({ p, q });
    if (q >= maxDen) break;
    const rem = n - a * d;
    if (rem === 0) break;
    n = d;
    d = rem;
    p0 = p1;
    p1 = p;
    q0 = q1;
    q1 = q;
  }
  return convergents;
}

export function factorFromPeriod(N: number, a: number, r: number) {
  if (r % 2 !== 0 || r <= 0) return null;
  const x = modPow(a, r / 2, N);
  const f1 = gcd(x + 1, N);
  const f2 = gcd(x - 1, N);
  if (f1 > 1 && f1 < N) return [f1, N / f1].sort((x, y) => x - y);
  if (f2 > 1 && f2 < N) return [f2, N / f2].sort((x, y) => x - y);
  return null;
}

/** Analytic QFT period-finding histogram (exact for coprime a). */
export function shorHistogram(N: number, a: number, t: number) {
  const Q = 1 << t;
  const period = (() => {
    let x = 1;
    for (let r = 1; r <= N; r++) {
      x = (x * a) % N;
      if (x === 1) return r;
    }
    return N;
  })();
  const bins = new Array<number>(Q).fill(0);
  const copies = Math.max(1, Math.floor(Q / period));
  for (let k = 0; k < period; k++) {
    const center = (k * Q) / period;
    for (let y = 0; y < Q; y++) {
      const d = y - center;
      const wrapped = ((d + Q / 2) % Q) - Q / 2;
      const denom = period * Math.sin((Math.PI * wrapped) / Q);
      const val =
        Math.abs(wrapped) < 1e-9
          ? 1 / period
          : (Math.sin((Math.PI * wrapped * copies) / Q) / (denom || 1)) ** 2;
      bins[y] += Math.max(0, val);
    }
  }
  const sum = bins.reduce((a, b) => a + b, 0) || 1;
  return { period, probs: bins.map((p) => p / sum), Q };
}

export type Edge = [number, number];

export function maxcutValue(bits: number, edges: Edge[]) {
  let cut = 0;
  for (const [i, j] of edges) {
    const bi = (bits >> i) & 1;
    const bj = (bits >> j) & 1;
    if (bi !== bj) cut++;
  }
  return cut;
}

export function qaoaP1(n: number, edges: Edge[], gamma: number, beta: number) {
  const s = QState.plus(n);
  for (const [i, j] of edges) {
    // e^{-i γ (1-ZiZj)/2} ≡ RZZ(-γ) up to global phase
    s.rzz(i, j, -gamma);
  }
  for (let q = 0; q < n; q++) s.rx(q, 2 * beta);
  const p = s.probabilities();
  let exp = 0;
  for (let i = 0; i < p.length; i++) exp += p[i] * maxcutValue(i, edges);
  const polarizations = Array.from({ length: n }, (_, q) => s.expectZ(q));
  return { state: s, expectation: exp, probs: p, polarizations };
}

export function qaoaSweep(n: number, edges: Edge[], steps = 24) {
  let best = { gamma: 0, beta: 0, expectation: -Infinity };
  const heat: number[][] = [];
  for (let gi = 0; gi < steps; gi++) {
    const row: number[] = [];
    const gamma = (gi / (steps - 1)) * Math.PI;
    for (let bi = 0; bi < steps; bi++) {
      const beta = (bi / (steps - 1)) * Math.PI;
      const { expectation } = qaoaP1(n, edges, gamma, beta);
      row.push(expectation);
      if (expectation > best.expectation) best = { gamma, beta, expectation };
    }
    heat.push(row);
  }
  return { best, heat };
}

/**
 * 1-qubit Lindblad evolution in Bloch form.
 * H = (ω/2) n̂ · σ, amplitude damping γ, dephasing Γ.
 */
export function evolveBloch(
  x0: number,
  y0: number,
  z0: number,
  opts: { omega: number; axis: "x" | "y" | "z"; gamma: number; dephasing: number; t: number; steps?: number },
) {
  const steps = opts.steps ?? 160;
  const dt = opts.t / steps;
  let x = x0,
    y = y0,
    z = z0;
  const trail: { t: number; x: number; y: number; z: number }[] = [{ t: 0, x, y, z }];
  for (let i = 1; i <= steps; i++) {
    const ox = opts.axis === "x" ? opts.omega : 0;
    const oy = opts.axis === "y" ? opts.omega : 0;
    const oz = opts.axis === "z" ? opts.omega : 0;
    // dS/dt = ω × S  (S × B with B = -ω?  precession: dS/dt = ω_vec × S)
    const dxp = oy * z - oz * y;
    const dyp = oz * x - ox * z;
    const dzp = ox * y - oy * x;
    // amplitude damping toward |0⟩ (z=+1) plus T2 dephasing
    const g = opts.gamma;
    const G = opts.dephasing;
    const dx = dxp - (g / 2 + G) * x;
    const dy = dyp - (g / 2 + G) * y;
    const dz = dzp - g * (z - 1);
    x += dx * dt;
    y += dy * dt;
    z += dz * dt;
    const n = Math.hypot(x, y, z);
    if (n > 1) {
      x /= n;
      y /= n;
      z /= n;
    }
    trail.push({ t: i * dt, x, y, z });
  }
  return trail;
}

export function encodeBitFlip(bit: 0 | 1) {
  const s = QState.computational(3, bit);
  s.cnot(0, 1).cnot(0, 2);
  return s;
}

export function bitFlipSyndrome(s: QState) {
  // Measure Z0Z1 and Z1Z2 on a copy's probabilities (ideal)
  const p = s.probabilities();
  let s1 = 0;
  let s2 = 0;
  let w = 0;
  for (let i = 0; i < 8; i++) {
    const b0 = i & 1;
    const b1 = (i >> 1) & 1;
    const b2 = (i >> 2) & 1;
    s1 += p[i] * (b0 === b1 ? 1 : -1);
    s2 += p[i] * (b1 === b2 ? 1 : -1);
    w += p[i];
  }
  const syn = [s1 < 0 ? 1 : 0, s2 < 0 ? 1 : 0] as [number, number];
  const flip = syn[0] === 1 && syn[1] === 0 ? 0 : syn[0] === 1 && syn[1] === 1 ? 1 : syn[0] === 0 && syn[1] === 1 ? 2 : -1;
  return { syn, flip, p };
}

export function quantumKernel(x: [number, number], y: [number, number]) {
  const a = QState.computational(2, 0);
  a.ry(0, x[0]).ry(1, x[1]);
  a.cnot(0, 1);
  a.ry(0, x[0] * x[1]).ry(1, x[0] + x[1]);
  const b = QState.computational(2, 0);
  b.ry(0, y[0]).ry(1, y[1]);
  b.cnot(0, 1);
  b.ry(0, y[0] * y[1]).ry(1, y[0] + y[1]);
  let re = 0;
  let im = 0;
  for (let i = 0; i < 4; i++) {
    re += a.re[i] * b.re[i] + a.im[i] * b.im[i];
    im += a.im[i] * b.re[i] - a.re[i] * b.im[i];
  }
  return re * re + im * im;
}

export function qcbmProbs(params: number[][], n: number) {
  const s = QState.computational(n, 0);
  for (const layer of params) {
    for (let q = 0; q < n; q++) s.ry(q, layer[q] ?? 0);
    for (let q = 0; q < n - 1; q++) s.cz(q, q + 1);
  }
  return s.probabilities();
}

export function klDivergence(p: number[], q: number[]) {
  let s = 0;
  for (let i = 0; i < p.length; i++) {
    if (p[i] > 1e-12) s += p[i] * Math.log(p[i] / Math.max(q[i], 1e-12));
  }
  return s;
}
