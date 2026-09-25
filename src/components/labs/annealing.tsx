import { useMemo, useState } from "react";
import { Field, Formula, Panel } from "@/components/panel";
import { Slider } from "@/components/ui/slider";

function energy(spins: number[], J: number) {
  let e = 0;
  for (let i = 0; i < spins.length; i++) {
    e += J * spins[i] * spins[(i + 1) % spins.length];
  }
  return e;
}

function annealStep(spins: number[], s: number, T: number) {
  const next = spins.slice();
  const i = Math.floor(Math.random() * next.length);
  const trial = next.slice();
  trial[i] *= -1;
  const dE = energy(trial, -s) - energy(next, -s);
  if (dE < 0 || Math.random() < Math.exp(-dE / Math.max(T, 1e-6))) next[i] *= -1;
  return next;
}

export function AnnealingLab() {
  const [s, setS] = useState(0.4);
  const [nodes, setNodes] = useState(8);
  const spins = useMemo(() => {
    let state: number[] = Array.from({ length: nodes }, () => (Math.random() < 0.5 ? 1 : -1));
    const T = Math.max(0.05, 1.2 * (1 - s));
    for (let k = 0; k < 80; k++) state = annealStep(state, s, T);
    return state;
  }, [s, nodes]);

  const e = energy(spins, -s);

  return (
    <div className="space-y-4">
      <Formula>H(s) = (1−s) Σ Xᵢ + s Σ Jᵢⱼ Zᵢ Zⱼ · 1D ring, {nodes} spins</Formula>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <svg viewBox={`0 0 320 180`} className="h-44 w-full">
            {spins.map((spin, i) => {
              const ang = (i / spins.length) * Math.PI * 2 - Math.PI / 2;
              const x = 160 + 70 * Math.cos(ang);
              const y = 90 + 62 * Math.sin(ang);
              const j = (i + 1) % spins.length;
              const ang2 = (j / spins.length) * Math.PI * 2 - Math.PI / 2;
              const x2 = 160 + 70 * Math.cos(ang2);
              const y2 = 90 + 62 * Math.sin(ang2);
              return (
                <g key={i}>
                  <line x1={x} y1={y} x2={x2} y2={y2} stroke="var(--color-border-strong)" />
                  <circle cx={x} cy={y} r={10} fill={spin > 0 ? "var(--color-fg)" : "var(--color-subtle)"} />
                </g>
              );
            })}
          </svg>
          <p className="font-mono text-xs text-muted tabular-nums">⟨H⟩ ~ {e.toFixed(2)} · T ~ {(1.2 * (1 - s)).toFixed(2)}</p>
        </Panel>
        <Panel className="space-y-4">
          <Field label="Anneal fraction s" value={s.toFixed(2)}>
            <Slider min={0} max={1} step={0.01} value={[s]} onValueChange={(v) => setS(v[0])} />
          </Field>
          <Field label="Spins" value={String(nodes)}>
            <Slider min={6} max={16} step={1} value={[nodes]} onValueChange={(v) => setNodes(v[0])} />
          </Field>
          <p className="text-sm text-muted">
            At s = 0 the mixer dominates (paramagnet). At s = 1 the problem Hamiltonian freezes the ring. Slow s(t) is
            annealing; a short alternating pulse sequence with variational angles is QAOA.
          </p>
        </Panel>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-faint">
            <tr>
              <th className="py-2 pr-4 font-medium">Axis</th>
              <th className="py-2 pr-4 font-medium">Annealing</th>
              <th className="py-2 font-medium">QAOA</th>
            </tr>
          </thead>
          <tbody className="text-muted">
            {[
              ["Hardware", "Analog couplers (Pegasus / Zephyr)", "Universal gates (heavy-hex, all-to-all ions)"],
              ["Native problem", "Quadratic Ising / QUBO", "Any Pauli Hamiltonian"],
              ["Path", "Adiabatic H(s)", "Layered U_C(γ) U_B(β)"],
              ["Failure mode", "Minigaps freeze the evolution", "Barren plateaus, shot noise"],
              ["Depth analog", "Anneal time", "p layers"],
            ].map((row) => (
              <tr key={row[0]} className="border-t border-border">
                <td className="py-3 pr-4 text-fg">{row[0]}</td>
                <td className="py-3 pr-4">{row[1]}</td>
                <td className="py-3">{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
