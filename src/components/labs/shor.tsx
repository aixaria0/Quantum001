import { useMemo, useState } from "react";
import { AmplitudeBars } from "@/components/amplitude-bars";
import { Field, Formula, Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  continuedFraction,
  factorFromPeriod,
  gcd,
  modPow,
  shorHistogram,
} from "@/lib/quantum/engine";

const PRESETS = [
  { N: 15, a: 7 },
  { N: 15, a: 4 },
  { N: 21, a: 2 },
  { N: 33, a: 5 },
];

export function ShorLab() {
  const [preset, setPreset] = useState(0);
  const [tBits, setTBits] = useState(6);
  const { N, a } = PRESETS[preset];
  const coprime = gcd(a, N) === 1;

  const table = useMemo(() => {
    const rows = [];
    let x = 1;
    for (let k = 0; k < Math.min(N, 16); k++) {
      rows.push({ k, ax: x });
      x = (x * a) % N;
    }
    return rows;
  }, [N, a]);

  const hist = useMemo(() => (coprime ? shorHistogram(N, a, tBits) : null), [N, a, tBits, coprime]);

  const readout = useMemo(() => {
    if (!hist) return null;
    const y = hist.probs.reduce((best, p, i) => (p > hist.probs[best] ? i : best), 0);
    const conv = continuedFraction(y, hist.Q, N);
    const r = conv.map((c) => c.q).filter((q) => q > 0 && q <= N && modPow(a, q, N) === 1)[0] ?? hist.period;
    const factors = factorFromPeriod(N, a, r);
    return { y, r, factors, conv };
  }, [hist, N, a]);

  return (
    <div className="space-y-4">
      <Formula>f(x) = {a}ˣ mod {N} · QFT on {tBits} counting qubits</Formula>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p, i) => (
          <Button key={i} size="sm" variant={preset === i ? "default" : "secondary"} onClick={() => setPreset(i)}>
            N={p.N}, a={p.a}
          </Button>
        ))}
      </div>
      <Field label="Counting qubits t" value={`${tBits}  (Q = ${1 << tBits})`}>
        <Slider min={4} max={8} step={1} value={[tBits]} onValueChange={(v) => setTBits(v[0])} />
      </Field>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-faint">Modular powers</p>
          <div className="grid grid-cols-4 gap-2 font-mono text-xs tabular-nums">
            {table.map((row) => (
              <div key={row.k} className="rounded-sm bg-subtle px-2 py-1.5">
                {a}^{row.k}={row.ax}
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">
            Period r = {hist?.period ?? "—"} · gcd({a},{N}) = {gcd(a, N)}
          </p>
        </Panel>
        <Panel>
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-faint">QFT peaks</p>
          {hist ? (
            <AmplitudeBars probs={hist.probs} n={tBits} maxBars={Math.min(32, hist.Q)} />
          ) : (
            <p className="text-sm text-warn">a shares a factor with N — factoring is already classical.</p>
          )}
        </Panel>
      </div>

      {readout ? (
        <Panel>
          <p className="text-xs font-medium uppercase tracking-wider text-faint">Continued fractions</p>
          <p className="mt-2 font-mono text-sm tabular-nums">
            y = {readout.y} / {1 << tBits} → candidates {readout.conv.map((c) => c.q).join(", ")}
          </p>
          <p className="mt-2 text-sm">
            Recovered period r = <span className="font-mono">{readout.r}</span>
            {readout.factors ? (
              <>
                {" "}
                → {N} = {readout.factors[0]} × {readout.factors[1]}
              </>
            ) : (
              " — odd period or spurious; retry another a."
            )}
          </p>
        </Panel>
      ) : null}
    </div>
  );
}
