import { useMemo, useState } from "react";
import { Field, Formula, Panel } from "@/components/panel";
import { Slider } from "@/components/ui/slider";
import { quantumKernel } from "@/lib/quantum/engine";

type Pt = { x: number; y: number; label: 1 | -1 };

function makeData(sep: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI;
    pts.push({ x: 0.55 + 0.35 * Math.cos(a) + sep * 0.15, y: 0.45 + 0.28 * Math.sin(a), label: 1 });
    pts.push({ x: 2.4 - 0.35 * Math.cos(a) - sep * 0.15, y: 2.5 - 0.28 * Math.sin(a), label: -1 });
  }
  return pts;
}

function kernelSVM(data: Pt[], query: [number, number]) {
  let score = 0;
  for (const p of data) {
    score += p.label * quantumKernel(query, [p.x, p.y]);
  }
  return score;
}

export function QmlLab() {
  const [sep, setSep] = useState(1);
  const [qx, setQx] = useState(1.5);
  const [qy, setQy] = useState(1.5);
  const data = useMemo(() => makeData(sep), [sep]);
  const score = kernelSVM(data, [qx, qy]);
  const pred = score >= 0 ? 1 : -1;

  return (
    <div className="space-y-4">
      <Formula>φ(x) = RY(x₀)⊗RY(x₁) · CNOT · RY(x₀x₁) · K = |⟨φ(x)|φ(x′)⟩|²</Formula>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel>
          <svg viewBox="0 0 320 320" className="h-72 w-full">
            {data.map((p, i) => (
              <circle
                key={i}
                cx={40 + p.x * 80}
                cy={280 - p.y * 80}
                r={5}
                fill={p.label > 0 ? "var(--color-fg)" : "var(--color-muted)"}
              />
            ))}
            <circle cx={40 + qx * 80} cy={280 - qy * 80} r={8} fill="none" stroke="var(--color-accent)" strokeWidth="2" />
          </svg>
        </Panel>
        <Panel className="space-y-4">
          <Field label="Class separation" value={sep.toFixed(2)}>
            <Slider min={0} max={2} step={0.05} value={[sep]} onValueChange={(v) => setSep(v[0])} />
          </Field>
          <Field label="Query x" value={qx.toFixed(2)}>
            <Slider min={0} max={3} step={0.05} value={[qx]} onValueChange={(v) => setQx(v[0])} />
          </Field>
          <Field label="Query y" value={qy.toFixed(2)}>
            <Slider min={0} max={3} step={0.05} value={[qy]} onValueChange={(v) => setQy(v[0])} />
          </Field>
          <p className="font-mono text-sm tabular-nums">
            kernel score {score.toFixed(3)} → class {pred > 0 ? "+1" : "−1"}
          </p>
          <p className="text-sm text-muted">
            QNNs replace the kernel with a variational circuit trained by SPSA. QRL uses the same ansatz as a policy,
            with Grover-like amplitude tricks only when an oracle exists.
          </p>
        </Panel>
      </div>
    </div>
  );
}
