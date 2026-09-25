import { Formula, Panel } from "@/components/panel";

const ROWS = [
  {
    domain: "Quantum chemistry",
    claim: "Hamiltonian simulation / SQD on small molecules",
    honest: "Useful on tens of logical qubits; industrial catalysis still needs fault tolerance.",
  },
  {
    domain: "Combinatorial optimization",
    claim: "QAOA / annealing on Ising / MaxCut / QUBO",
    honest: "Competitive on structured graphs today as a heuristic, not a proven exponential win.",
  },
  {
    domain: "Unstructured search",
    claim: "Grover √N",
    honest: "Quadratic only. AES-128 → 2⁶⁴ — still astronomical without huge fault-tolerant machines.",
  },
  {
    domain: "Integer factoring",
    claim: "Shor polynomial time",
    honest: "The cryptographic breaker. Needs thousands of clean logical qubits, not NISQ.",
  },
  {
    domain: "Quantum ML kernels",
    claim: "Hilbert feature maps",
    honest: "Proven separation exists for contrived data; real tabular datasets rarely show it yet.",
  },
  {
    domain: "Sensing / metrology",
    claim: "Heisenberg-limited phase estimation",
    honest: "Already shipping in magnetometry and clocks — the quiet industrial win.",
  },
  {
    domain: "Open-system dynamics",
    claim: "Lindblad simulation of noisy matter",
    honest: "A natural match: the hardware is already open. Encoding the right Lₖ is the art.",
  },
];

export function AdvantageLab() {
  return (
    <div className="space-y-4">
      <Formula>Advantage is a workload, not a headline. Match the algorithm to the Hamiltonian.</Formula>
      <div className="grid gap-3">
        {ROWS.map((row) => (
          <Panel key={row.domain} className="grid gap-2 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="font-display text-lg">{row.domain}</p>
              <p className="mt-1 text-sm text-muted">{row.claim}</p>
            </div>
            <p className="text-sm text-fg/90">{row.honest}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
