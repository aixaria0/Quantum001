                   
             
                  
                
                 
                  
                  
  

export const LABS        = [
  {
    id: "evolution",
    chapter: "01",
    title: "Time Evolution",
    kicker: "Schrödinger → unitaries",
    summary:
      "States evolve as |ψ(t)⟩ = e^{−iHt/ℏ}|ψ(0)⟩. Drive a qubit with X, Y, or Z and watch the Bloch vector precess.",
    formula: "U(t) = exp(−iHt/ℏ)",
  },
  {
    id: "shor",
    chapter: "02",
    title: "Shor’s Algorithm",
    kicker: "Period finding → factoring",
    summary:
      "Factoring reduces to finding the period of aˣ mod N. The QFT turns that period into sharp peaks you can read classically.",
    formula: "aʳ ≡ 1 (mod N)",
  },
  {
    id: "grover",
    chapter: "03",
    title: "Grover Search",
    kicker: "Amplitude amplification",
    summary:
      "Unstructured search in √N queries. Each oracle + diffuser rotates the state 2θ toward the marked item.",
    formula: "k ≈ (π/4) √(N/M)",
  },
  {
    id: "qaoa",
    chapter: "04",
    title: "QAOA & Recursion",
    kicker: "Combinatorial optimization",
    summary:
      "Alternate cost and mixer unitaries. Sweep γ, β for MaxCut, then fix polarized qubits the way recursive QAOA shrinks instances.",
    formula: "|γ,β⟩ = U_B(β) U_C(γ) |+⟩^n",
  },
  {
    id: "knitting",
    chapter: "05",
    title: "Circuit Knitting",
    kicker: "Cut, sample, reconstruct",
    summary:
      "A non-local wire becomes a signed sum of local channels. Quasi-probability reconstruction stitches subcircuits back together.",
    formula: "Λ(ρ) = Σₖ pₖ Λₖ(ρ)",
  },
  {
    id: "annealing",
    chapter: "06",
    title: "Annealing vs QAOA",
    kicker: "Analog and gate-model",
    summary:
      "Adiabatic evolution vs a variational alternating ansatz. Same Ising target, different hardware and failure modes.",
    formula: "H(s) = (1−s)H_B + s H_C",
  },
  {
    id: "qec",
    chapter: "07",
    title: "Error Correction",
    kicker: "Logical qubits",
    summary:
      "The three-qubit bit-flip code encodes one logical bit, measures a syndrome, and corrects without reading the data.",
    formula: "|0⟩_L = |000⟩,  |1⟩_L = |111⟩",
  },
  {
    id: "advantage",
    chapter: "08",
    title: "Quantum Advantage",
    kicker: "Where it actually bites",
    summary:
      "Chemistry, optimization, sensing, and sampling — honest about NISQ limits and where quadratic or exponential leverage appears.",
    formula: "T_classical / T_quantum",
  },
  {
    id: "qml",
    chapter: "09",
    title: "Quantum ML",
    kicker: "Kernels, QNNs, QRL",
    summary:
      "A two-qubit feature map turns 2D points into a Hilbert kernel. Compare with variational circuits and policy-gradient sketches.",
    formula: "K(x,x′) = |⟨φ(x)|φ(x′)⟩|²",
  },
  {
    id: "qbm",
    chapter: "10",
    title: "Born Machines",
    kicker: "QCBM & QBM priors",
    summary:
      "A hardware-efficient circuit as a generative model. Tune RY layers and compare the Born distribution to a target histogram.",
    formula: "P(z) = |⟨z|U(θ)|0⟩|²",
  },
  {
    id: "mesolve",
    chapter: "11",
    title: "Open Systems",
    kicker: "Lindblad / mesolve",
    summary:
      "QuTiP’s mesolve integrates dρ/dt = −i[H,ρ] + Σ 𝒟[Lₖ]ρ. Add amplitude damping and dephasing and watch purity collapse.",
    formula: "dρ/dt = −i[H,ρ] + 𝒟[L]ρ",
  },
  {
    id: "atlas",
    chapter: "12",
    title: "Algorithm Atlas",
    kicker: "The full map",
    summary:
      "A Sankey of every lab in this studio — from the Schrödinger equation through search, optimization, learning, and noise.",
    formula: "H → U(t) → {Shor, Grover, QAOA, …}",
  },
];

export function labById(id        ) {
  return LABS.find((l) => l.id === id);
}

export function nextLab(id        ) {
  const i = LABS.findIndex((l) => l.id === id);
  return LABS[(i + 1) % LABS.length];
}

export function prevLab(id        ) {
  const i = LABS.findIndex((l) => l.id === id);
  return LABS[(i - 1 + LABS.length) % LABS.length];
}
