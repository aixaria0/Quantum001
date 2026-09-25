import { useMemo, useState } from "react";
import { AmplitudeBars } from "@/components/amplitude-bars";
import { Field, Formula, Panel } from "@/components/panel";
import { Slider } from "@/components/ui/slider";
import { type Edge, maxcutValue, qaoaP1, qaoaSweep } from "@/lib/quantum/engine";

const N = 4;
const EDGES: Edge[] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
];

function GraphCut({ bits }: { bits: number }) {
  const pos = [
    { x: 40, y: 40 },
    { x: 160, y: 40 },
    { x: 160, y: 140 },
    { x: 40, y: 140 },
  ];
  return (
    <svg viewBox="0 0 200 180" className="h-44 w-full">
      {EDGES.map(([i, j], k) => {
        const cut = ((bits >> i) & 1) !== ((bits >> j) & 1);
        return (
          <line
            key={k}
            x1={pos[i].x}
            y1={pos[i].y}
            x2={pos[j].x}
            y2={pos[j].y}
            stroke={cut ? "var(--color-accent)" : "var(--color-faint)"}
            strokeWidth={cut ? 2.5 : 1}
          />
        );
      })}
      {pos.map((p, i) => {
        const on = (bits >> i) & 1;
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={14} fill={on ? "var(--color-fg)" : "var(--color-subtle)"} />
            <text
              x={p.x}
              y={p.y + 4}
              textAnchor="middle"
              fontSize="11"
              fill={on ? "var(--color-bg)" : "var(--color-muted)"}
              fontFamily="IBM Plex Mono"
            >
              {i}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function QaoaLab() {
  const [gamma, setGamma] = useState(0.4);
  const [beta, setBeta] = useState(0.35);
  const [threshold, setThreshold] = useState(0.35);

  const result = useMemo(() => qaoaP1(N, EDGES, gamma, beta), [gamma, beta]);
  const sweep = useMemo(() => qaoaSweep(N, EDGES, 16), []);
  const bestIdx = result.probs.reduce((b, p, i) => (p > result.probs[b] ? i : b), 0);
  const cut = maxcutValue(bestIdx, EDGES);
  const fixed = result.polarizations.map((z, i) => (Math.abs(z) >= threshold ? { i, sign: z > 0 ? 1 : -1 } : null)).filter(Boolean);

  return (
    <div className="space-y-4">
      <Formula>|γ,β⟩ = exp(-iβ ΣX) exp(-iγ H_C) |+⟩^4 on C4 (optimal cut = 4)</Formula>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <GraphCut bits={bestIdx} />
          <p className="mt-2 font-mono text-xs text-muted tabular-nums">
            Sampled cut {cut} · ⟨H_C⟩ {result.expectation.toFixed(3)} · landscape max {sweep.best.expectation.toFixed(3)}
          </p>
        </Panel>
        <Panel className="space-y-4">
          <Field label="γ  cost" value={gamma.toFixed(2)}>
            <Slider min={0} max={Math.PI} step={0.02} value={[gamma]} onValueChange={(v) => setGamma(v[0])} />
          </Field>
          <Field label="β  mixer" value={beta.toFixed(2)}>
            <Slider min={0} max={Math.PI} step={0.02} value={[beta]} onValueChange={(v) => setBeta(v[0])} />
          </Field>
          <button
            type="button"
            className="text-left text-xs text-muted underline-offset-2 hover:text-fg hover:underline"
            onClick={() => {
              setGamma(sweep.best.gamma);
              setBeta(sweep.best.beta);
            }}
          >
            Snap to landscape optimum γ={sweep.best.gamma.toFixed(2)} β={sweep.best.beta.toFixed(2)}
          </button>
        </Panel>
      </div>
      <Panel>
        <p className="mb-2 text-xs text-muted">Bitstring probabilities after p = 1</p>
        <AmplitudeBars probs={result.probs} n={N} highlight={bestIdx} />
      </Panel>
      <Panel className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-faint">Recursive reduction</p>
        <Field label="Fix |⟨Zᵢ⟩| above" value={threshold.toFixed(2)}>
          <Slider min={0.1} max={0.9} step={0.01} value={[threshold]} onValueChange={(v) => setThreshold(v[0])} />
        </Field>
        <div className="grid grid-cols-4 gap-2">
          {result.polarizations.map((z, i) => (
            <div key={i} className="rounded-md bg-subtle px-2 py-2 text-center">
              <p className="font-mono text-xs text-faint">q{i}</p>
              <p className="font-mono text-sm tabular-nums">{z.toFixed(2)}</p>
              <p className="text-[11px] text-muted">{Math.abs(z) >= threshold ? (z > 0 ? "fix +1" : "fix −1") : "keep"}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted">
          {fixed.length === 0
            ? "No qubit is polarized enough — deepen p or retune γ, β."
            : `Fix ${fixed.length} qubit${fixed.length > 1 ? "s" : ""}, drop incident edges, and rerun a shallow QAOA on the remainder.`}
        </p>
      </Panel>
    </div>
  );
}
