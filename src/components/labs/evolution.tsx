import { useMemo, useState } from "react";
import { BlochSphere } from "@/components/bloch-sphere";
import { Field, Formula, Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { QState, evolveBloch } from "@/lib/quantum/engine";

const AXES = ["x", "y", "z"] as const;

export function EvolutionLab() {
  const [axis, setAxis] = useState<(typeof AXES)[number]>("x");
  const [omega, setOmega] = useState(1);
  const [t, setT] = useState(1.2);
  const [gamma, setGamma] = useState(0);
  const [dephasing, setDephasing] = useState(0);
  const [init, setInit] = useState<"0" | "+" | "1">("0");

  const start = init === "0" ? { x: 0, y: 0, z: 1 } : init === "1" ? { x: 0, y: 0, z: -1 } : { x: 1, y: 0, z: 0 };

  const trail = useMemo(
    () => evolveBloch(start.x, start.y, start.z, { omega, axis, gamma, dephasing, t }),
    [start.x, start.y, start.z, omega, axis, gamma, dephasing, t],
  );
  const last = trail[trail.length - 1];

  const exact = useMemo(() => {
    const s = QState.computational(1, init === "1" ? 1 : 0);
    if (init === "+") s.h(0);
    if (axis === "x") s.rx(0, omega * t);
    if (axis === "y") s.ry(0, omega * t);
    if (axis === "z") s.rz(0, omega * t);
    return s.bloch(0);
  }, [axis, omega, t, init]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <Panel className="h-[380px] md:h-[440px]">
        <BlochSphere x={last.x} y={last.y} z={last.z} trail={trail} />
      </Panel>
      <div className="space-y-4">
        <Formula>
          U(t) = exp(−i {axis.toUpperCase()} ω t / 2) · |ψ(0)⟩ = {init === "0" ? "|0⟩" : init === "1" ? "|1⟩" : "|+⟩"}
        </Formula>
        <Panel className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["0", "+", "1"] as const).map((k) => (
              <Button key={k} size="sm" variant={init === k ? "default" : "secondary"} onClick={() => setInit(k)}>
                {k === "0" ? "|0⟩" : k === "1" ? "|1⟩" : "|+⟩"}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {AXES.map((a) => (
              <Button key={a} size="sm" variant={axis === a ? "default" : "ghost"} onClick={() => setAxis(a)}>
                H ∝ {a.toUpperCase()}
              </Button>
            ))}
          </div>
          <Field label="ω  (drive)" value={omega.toFixed(2)}>
            <Slider min={0} max={3} step={0.05} value={[omega]} onValueChange={(v) => setOmega(v[0])} />
          </Field>
          <Field label="t" value={t.toFixed(2)}>
            <Slider min={0} max={Math.PI * 2} step={0.02} value={[t]} onValueChange={(v) => setT(v[0])} />
          </Field>
          <Field label="Amplitude damping γ" value={gamma.toFixed(2)}>
            <Slider min={0} max={1.5} step={0.02} value={[gamma]} onValueChange={(v) => setGamma(v[0])} />
          </Field>
          <Field label="Dephasing Γ" value={dephasing.toFixed(2)}>
            <Slider min={0} max={1.5} step={0.02} value={[dephasing]} onValueChange={(v) => setDephasing(v[0])} />
          </Field>
        </Panel>
        <Panel>
          <p className="text-xs text-muted">Closed-system Bloch (exact unitary)</p>
          <p className="mt-1 font-mono text-sm tabular-nums">
            ⟨X⟩ {exact.x.toFixed(3)} · ⟨Y⟩ {exact.y.toFixed(3)} · ⟨Z⟩ {exact.z.toFixed(3)}
          </p>
          <p className="mt-3 text-xs text-muted">Open-system trail (Lindblad)</p>
          <p className="mt-1 font-mono text-sm tabular-nums">
            ⟨X⟩ {last.x.toFixed(3)} · ⟨Y⟩ {last.y.toFixed(3)} · ⟨Z⟩ {last.z.toFixed(3)}
          </p>
        </Panel>
      </div>
    </div>
  );
}
