import { useMemo, useState } from "react";
import { AmplitudeBars } from "@/components/amplitude-bars";
import { Field, Formula, Panel } from "@/components/panel";
import { Slider } from "@/components/ui/slider";
import { klDivergence, qcbmProbs } from "@/lib/quantum/engine";

const N = 3;
const TARGET = (() => {
  const t = new Array(8).fill(0.02);
  t[0] = 0.28;
  t[3] = 0.22;
  t[5] = 0.18;
  t[7] = 0.16;
  const s = t.reduce((a, b) => a + b, 0);
  return t.map((p) => p / s);
})();

export function QbmLab() {
  const [a0, setA0] = useState(0.8);
  const [a1, setA1] = useState(1.1);
  const [a2, setA2] = useState(0.4);
  const [b0, setB0] = useState(0.6);
  const [b1, setB1] = useState(0.9);
  const [b2, setB2] = useState(1.3);

  const model = useMemo(
    () => qcbmProbs([[a0, a1, a2], [b0, b1, b2]], N),
    [a0, a1, a2, b0, b1, b2],
  );
  const kl = klDivergence(TARGET, model);

  return (
    <div className="space-y-4">
      <Formula>P_θ(z) = |⟨z| RY⊗³ CZ RY⊗³ |0⟩|² · 3-qubit QCBM vs a multimodal prior</Formula>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel>
          <p className="mb-2 text-xs text-muted">Target</p>
          <AmplitudeBars probs={TARGET} n={N} />
        </Panel>
        <Panel>
          <p className="mb-2 text-xs text-muted">QCBM  KL = {kl.toFixed(3)}</p>
          <AmplitudeBars probs={model} n={N} />
        </Panel>
      </div>
      <Panel className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-faint">Layer 1 · RY</p>
          <Field label="θ₀" value={a0.toFixed(2)}>
            <Slider min={0} max={Math.PI} step={0.02} value={[a0]} onValueChange={(v) => setA0(v[0])} />
          </Field>
          <Field label="θ₁" value={a1.toFixed(2)}>
            <Slider min={0} max={Math.PI} step={0.02} value={[a1]} onValueChange={(v) => setA1(v[0])} />
          </Field>
          <Field label="θ₂" value={a2.toFixed(2)}>
            <Slider min={0} max={Math.PI} step={0.02} value={[a2]} onValueChange={(v) => setA2(v[0])} />
          </Field>
        </div>
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-faint">Layer 2 · RY</p>
          <Field label="φ₀" value={b0.toFixed(2)}>
            <Slider min={0} max={Math.PI} step={0.02} value={[b0]} onValueChange={(v) => setB0(v[0])} />
          </Field>
          <Field label="φ₁" value={b1.toFixed(2)}>
            <Slider min={0} max={Math.PI} step={0.02} value={[b1]} onValueChange={(v) => setB1(v[0])} />
          </Field>
          <Field label="φ₂" value={b2.toFixed(2)}>
            <Slider min={0} max={Math.PI} step={0.02} value={[b2]} onValueChange={(v) => setB2(v[0])} />
          </Field>
        </div>
      </Panel>
      <Panel>
        <p className="text-sm text-muted">
          A quantum Boltzmann machine replaces the Born circuit with an Ising thermal state. On annealers you sample
          the negative phase natively; on gate hardware you train a variational thermal ansatz. Same job as a
          classical RBM, with entanglement in the hidden layer.
        </p>
      </Panel>
    </div>
  );
}
