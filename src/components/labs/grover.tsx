import { useMemo, useState } from "react";
import { AmplitudeBars } from "@/components/amplitude-bars";
import { Field, Formula, Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { groverOptimalIters, runGrover } from "@/lib/quantum/engine";

export function GroverLab() {
  const [n, setN] = useState(3);
  const N = 1 << n;
  const [marked, setMarked] = useState(5);
  const [step, setStep] = useState(0);
  const opt = groverOptimalIters(n);
  const safeMarked = marked % N;

  const run = useMemo(() => runGrover(n, safeMarked, opt + 2), [n, safeMarked, opt]);
  const idx = Math.min(step, run.history.length - 1);
  const probs = run.history[idx];
  const success = probs[safeMarked] ?? 0;

  return (
    <div className="space-y-4">
      <Formula>
        N = {N} · marked = |{safeMarked.toString(2).padStart(n, "0")}⟩ · k* = {opt}
      </Formula>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel className="space-y-4">
          <Field label="Qubits n" value={String(n)}>
            <Slider
              min={2}
              max={4}
              step={1}
              value={[n]}
              onValueChange={(v) => {
                setN(v[0]);
                setStep(0);
                setMarked((m) => m % (1 << v[0]));
              }}
            />
          </Field>
          <Field label="Marked item" value={`|${safeMarked.toString(2).padStart(n, "0")}⟩`}>
            <Slider
              min={0}
              max={N - 1}
              step={1}
              value={[safeMarked]}
              onValueChange={(v) => {
                setMarked(v[0]);
                setStep(0);
              }}
            />
          </Field>
          <Field label="Grover iterations" value={`${idx} / ${opt} optimal`}>
            <Slider min={0} max={run.history.length - 1} step={1} value={[idx]} onValueChange={(v) => setStep(v[0])} />
          </Field>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setStep(0)}>
              Reset
            </Button>
            <Button size="sm" onClick={() => setStep((s) => Math.min(run.history.length - 1, s + 1))}>
              Iterate
            </Button>
          </div>
        </Panel>
        <Panel>
          <p className="mb-2 text-xs text-muted">P(marked) = {(success * 100).toFixed(1)}%</p>
          <AmplitudeBars probs={probs} n={n} highlight={safeMarked} />
        </Panel>
      </div>
      <Panel>
        <p className="text-sm text-muted">
          Each Grover iterate is oracle (phase flip on the marked basis state) then diffuser (inversion about the mean).
          Past k* the state rotates past the target and success probability falls — over-rotation is the usual trap.
        </p>
      </Panel>
    </div>
  );
}
