import { Link } from "@tanstack/react-router";
import { Formula, Panel } from "@/components/panel";
import { LABS } from "@/lib/labs";

const FLOWS: { from: string; to: string; value: number }[] = [
  { from: "Schrödinger", to: "Unitaries", value: 8 },
  { from: "Unitaries", to: "QFT", value: 3 },
  { from: "Unitaries", to: "Grover iterate", value: 3 },
  { from: "Unitaries", to: "QAOA layers", value: 3 },
  { from: "QFT", to: "Shor", value: 4 },
  { from: "Grover iterate", to: "Search / QRL", value: 3 },
  { from: "QAOA layers", to: "Recursive cut", value: 2 },
  { from: "QAOA layers", to: "Annealing", value: 2 },
  { from: "Unitaries", to: "QCBM / QNN", value: 3 },
  { from: "QCBM / QNN", to: "Kernels", value: 2 },
  { from: "Lindblad", to: "mesolve", value: 3 },
  { from: "Lindblad", to: "QEC", value: 3 },
  { from: "QEC", to: "Logical algorithms", value: 4 },
  { from: "Shor", to: "Logical algorithms", value: 2 },
  { from: "Search / QRL", to: "Logical algorithms", value: 2 },
];

function layout() {
  const cols = [
    ["Schrödinger", "Lindblad"],
    ["Unitaries", "mesolve", "QEC"],
    ["QFT", "Grover iterate", "QAOA layers", "QCBM / QNN"],
    ["Shor", "Search / QRL", "Recursive cut", "Annealing", "Kernels"],
    ["Logical algorithms"],
  ];
  const pos: Record<string, { x: number; y: number }> = {};
  cols.forEach((col, ci) => {
    col.forEach((name, ri) => {
      pos[name] = { x: 48 + ci * 150, y: 36 + ri * (280 / Math.max(col.length, 1)) };
    });
  });
  return { cols, pos };
}

export function AtlasLab() {
  const { pos } = layout();
  const names = Object.keys(pos);

  return (
    <div className="space-y-4">
      <Formula>H → U(t) → {`{QFT, Grover, QAOA, QCBM}`} → applications, with noise handled by Lindblad + QEC</Formula>
      <Panel className="overflow-x-auto">
        <svg viewBox="0 0 760 340" className="h-72 min-w-[640px] w-full">
          {FLOWS.map((f, i) => {
            const a = pos[f.from];
            const b = pos[f.to];
            if (!a || !b) return null;
            return (
              <path
                key={i}
                d={`M ${a.x + 54} ${a.y} C ${a.x + 100} ${a.y}, ${b.x - 40} ${b.y}, ${b.x} ${b.y}`}
                fill="none"
                stroke="var(--color-border-strong)"
                strokeWidth={Math.max(1, f.value * 0.6)}
              />
            );
          })}
          {names.map((n) => {
            const p = pos[n];
            return (
              <g key={n}>
                <rect x={p.x} y={p.y - 12} width={108} height={24} rx="6" fill="var(--color-subtle)" />
                <text
                  x={p.x + 54}
                  y={p.y + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--color-fg)"
                  fontFamily="Figtree"
                >
                  {n}
                </text>
              </g>
            );
          })}
        </svg>
      </Panel>
      <div className="grid gap-2 sm:grid-cols-2">
        {LABS.map((lab) => (
          <Link
            key={lab.id}
            to="/lab/$id"
            params={{ id: lab.id }}
            className="rounded-lg bg-elevated px-4 py-3 shadow-[var(--shadow-border)] transition-shadow duration-150 hover:shadow-[var(--shadow-border-hover)]"
          >
            <p className="font-mono text-[11px] text-faint">{lab.chapter}</p>
            <p className="font-display text-lg">{lab.title}</p>
            <p className="mt-1 text-xs text-muted">{lab.kicker}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
