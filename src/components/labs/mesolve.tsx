import { useMemo, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BlochSphere } from "@/components/bloch-sphere";
import { Field, Formula, Panel } from "@/components/panel";
import { Slider } from "@/components/ui/slider";
import { evolveBloch } from "@/lib/quantum/engine";

export function MesolveLab() {
  const [omega, setOmega] = useState(2);
  const [gamma, setGamma] = useState(0.4);
  const [deph, setDeph] = useState(0.15);
  const [t, setT] = useState(6);

  const trail = useMemo(
    () => evolveBloch(1, 0, 0, { omega, axis: "z", gamma, dephasing: deph, t, steps: 180 }),
    [omega, gamma, deph, t],
  );
  const last = trail[trail.length - 1];
  const data = trail.filter((_, i) => i % 3 === 0).map((p) => ({
    t: Number(p.t.toFixed(2)),
    X: p.x,
    Y: p.y,
    Z: p.z,
    r: Math.hypot(p.x, p.y, p.z),
  }));

  return (
    <div className="space-y-4">
      <Formula>dρ/dt = −i[ (ω/2)Z , ρ ] + γ 𝒟[σ₋]ρ + Γ 𝒟[σ_z]ρ</Formula>
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel className="h-72">
          <BlochSphere x={last.x} y={last.y} z={last.z} trail={trail} />
        </Panel>
        <Panel className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="t" stroke="#5c5c64" fontSize={11} />
              <YAxis domain={[-1, 1]} stroke="#5c5c64" fontSize={11} />
              <Tooltip
                contentStyle={{ background: "#121214", border: "1px solid rgb(240 240 242 / 0.12)", fontSize: 12 }}
              />
              <Line type="monotone" dataKey="X" stroke="#c8ccd4" dot={false} strokeWidth={1.5} />
              <Line type="monotone" dataKey="Z" stroke="#8a8a92" dot={false} strokeWidth={1.5} />
              <Line type="monotone" dataKey="r" stroke="#7d9b86" dot={false} strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>
      <Panel className="grid gap-4 md:grid-cols-2">
        <Field label="ω  (Z drive)" value={omega.toFixed(2)}>
          <Slider min={0} max={4} step={0.05} value={[omega]} onValueChange={(v) => setOmega(v[0])} />
        </Field>
        <Field label="Horizon t" value={t.toFixed(1)}>
          <Slider min={1} max={12} step={0.1} value={[t]} onValueChange={(v) => setT(v[0])} />
        </Field>
        <Field label="Amplitude damping γ" value={gamma.toFixed(2)}>
          <Slider min={0} max={2} step={0.02} value={[gamma]} onValueChange={(v) => setGamma(v[0])} />
        </Field>
        <Field label="Dephasing Γ" value={deph.toFixed(2)}>
          <Slider min={0} max={2} step={0.02} value={[deph]} onValueChange={(v) => setDeph(v[0])} />
        </Field>
      </Panel>
      <Panel>
        <p className="text-sm text-muted">
          This is the same ODE QuTiP integrates with zvode inside mesolve. Purity Tr(ρ²) is the squared Bloch radius.
          When r → 0 the state is fully mixed; γ pulls it toward |0⟩ instead.
        </p>
      </Panel>
    </div>
  );
}
