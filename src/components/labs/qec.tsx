import { useMemo, useState } from "react";
import { AmplitudeBars } from "@/components/amplitude-bars";
import { Formula, Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { bitFlipSyndrome, bitstring, encodeBitFlip, QState } from "@/lib/quantum/engine";

export function QecLab() {
  const [logical, setLogical] = useState<0 | 1>(1);
  const [errorQ, setErrorQ] = useState<number | null>(null);

  const encoded = useMemo(() => encodeBitFlip(logical), [logical]);
  const noisy = useMemo(() => {
    const s = encoded.clone();
    if (errorQ !== null) s.x(errorQ);
    return s;
  }, [encoded, errorQ]);
  const syn = bitFlipSyndrome(noisy);
  const corrected = useMemo(() => {
    const s = noisy.clone();
    if (syn.flip >= 0) s.x(syn.flip);
    return s;
  }, [noisy, syn.flip]);

  const decode = (s: QState) => {
    const p = s.probabilities();
    return p[0] + p[1] > 0.5 ? 0 : 1;
  };

  return (
    <div className="space-y-4">
      <Formula>|ψ⟩_L = α|000⟩ + β|111⟩ · syndrome (Z₀Z₁, Z₁Z₂)</Formula>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={logical === 0 ? "default" : "secondary"} onClick={() => setLogical(0)}>
          Encode |0⟩
        </Button>
        <Button size="sm" variant={logical === 1 ? "default" : "secondary"} onClick={() => setLogical(1)}>
          Encode |1⟩
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {[0, 1, 2].map((q) => (
          <Button key={q} size="sm" variant={errorQ === q ? "default" : "outline"} onClick={() => setErrorQ(q)}>
            Inject X on q{q}
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={() => setErrorQ(null)}>
          No error
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Panel>
          <p className="text-xs text-faint">Encoded</p>
          <AmplitudeBars probs={encoded.probabilities()} n={3} highlight={logical === 0 ? 0 : 7} />
        </Panel>
        <Panel>
          <p className="text-xs text-faint">After error</p>
          <AmplitudeBars
            probs={noisy.probabilities()}
            n={3}
            highlight={noisy.mostProbable().index}
          />
        </Panel>
        <Panel>
          <p className="text-xs text-faint">Corrected</p>
          <AmplitudeBars probs={corrected.probabilities()} n={3} highlight={logical === 0 ? 0 : 7} />
        </Panel>
      </div>
      <Panel>
        <p className="font-mono text-sm tabular-nums">
          Syndrome {syn.syn[0]}
          {syn.syn[1]} · flip qubit {syn.flip < 0 ? "none" : syn.flip} · decoded {decode(corrected)} · peak |
          {bitstring(corrected.mostProbable().index, 3)}⟩
        </p>
        <p className="mt-2 text-sm text-muted">
          Stabilizers commute with the logical Z_L = ZZZ, so the data is never directly measured. Two errors still
          defeat this code — that is why distance-3 is a teaching code, not a factory.
        </p>
      </Panel>
    </div>
  );
}
