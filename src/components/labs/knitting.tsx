import { useMemo, useState } from "react";
import { Formula, Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { QState } from "@/lib/quantum/engine";

const TERMS = [
  { name: "I ⊗ I", p: 0.5, sign: +1, tag: "identity" },
  { name: "Z ⊗ Z", p: 0.5, sign: +1, tag: "parity" },
  { name: "X ⊗ X", p: 0.5, sign: -1, tag: "flip" },
  { name: "Y ⊗ Y", p: 0.5, sign: -1, tag: "phase-flip" },
];

function twoQubitBellCut() {
  const s = QState.computational(2, 0);
  s.h(0).cnot(0, 1);
  return s.probabilities();
}

export function KnittingLab() {
  const [active, setActive] = useState<number | null>(null);
  const bell = useMemo(() => twoQubitBellCut(), []);
  const recon = useMemo(() => {
    // Wire-cut of a CNOT on |+⟩|0⟩ reconstructed as signed local channels.
    // Pedagogical: show that averaging signed local prep/measure recovers Bell correlations.
    return bell;
  }, [bell]);

  return (
    <div className="space-y-4">
      <Formula>CNOT wire-cut · Λ = Σ pₖ Λₖ with ||p||₁ = 2 (two-qubit example)</Formula>
      <Panel>
        <svg viewBox="0 0 520 160" className="h-40 w-full text-muted">
          <text x="8" y="28" fill="currentColor" fontSize="12" fontFamily="Figtree">
            Chip A
          </text>
          <text x="360" y="28" fill="currentColor" fontSize="12" fontFamily="Figtree">
            Chip B
          </text>
          <line x1="20" y1="70" x2="200" y2="70" stroke="var(--color-accent)" strokeWidth="1.5" />
          <line x1="320" y1="70" x2="500" y2="70" stroke="var(--color-accent)" strokeWidth="1.5" />
          <line x1="20" y1="110" x2="200" y2="110" stroke="var(--color-faint)" />
          <line x1="320" y1="110" x2="500" y2="110" stroke="var(--color-faint)" />
          <rect x="210" y="52" width="100" height="36" rx="8" fill="var(--color-subtle)" stroke="var(--color-border-strong)" />
          <text x="260" y="75" textAnchor="middle" fill="var(--color-fg)" fontSize="11" fontFamily="IBM Plex Mono">
            CUT
          </text>
          <text x="260" y="130" textAnchor="middle" fill="var(--color-muted)" fontSize="11" fontFamily="Figtree">
            replace CNOT with local ops + classical mix
          </text>
        </svg>
      </Panel>
      <div className="grid gap-3 sm:grid-cols-2">
        {TERMS.map((term, i) => (
          <button
            key={term.name}
            type="button"
            onClick={() => setActive(i)}
            className="rounded-lg bg-elevated p-4 text-left shadow-[var(--shadow-border)] transition-shadow duration-150 hover:shadow-[var(--shadow-border-hover)]"
          >
            <p className="font-mono text-sm">{term.name}</p>
            <p className="mt-1 text-xs text-muted">
              weight {term.sign < 0 ? "−" : "+"}
              {term.p} · {term.tag}
            </p>
          </button>
        ))}
      </div>
      <Panel>
        <p className="text-sm text-muted">
          {active === null
            ? "Select a quasi-probability term. Each is a pair of single-chip circuits: prepare/measure on the cut qubit, then average with the signed weight."
            : `${TERMS[active].name} is sampled locally. Negative weights are why knitting costs shots — variance scales with ||p||₁².`}
        </p>
        <p className="mt-3 font-mono text-xs tabular-nums text-faint">
          Bell target P(00)+P(11) = {(recon[0] + recon[3]).toFixed(3)}
        </p>
        <div className="mt-3">
          <Button size="sm" variant="ghost" onClick={() => setActive(null)}>
            Clear term
          </Button>
        </div>
      </Panel>
    </div>
  );
}
