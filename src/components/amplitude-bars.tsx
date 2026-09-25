import { bitstring } from "@/lib/quantum/engine";
import { cn } from "@/lib/utils";

export function AmplitudeBars({
  probs,
  n,
  highlight,
  maxBars = 16,
}: {
  probs: number[];
  n: number;
  highlight?: number;
  maxBars?: number;
}) {
  const shown = probs.slice(0, Math.min(probs.length, maxBars));
  const peak = Math.max(1e-9, ...shown);
  return (
    <div className="flex h-44 items-end gap-1">
      {shown.map((p, i) => (
        <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <div
            className={cn(
              "w-full rounded-t-xs transition-[height] duration-200",
              i === highlight ? "bg-accent" : "bg-accent/35",
            )}
            style={{ height: `${Math.max(2, (p / peak) * 100)}%` }}
            title={`${bitstring(i, n)}  ${(p * 100).toFixed(1)}%`}
          />
          <span className="font-mono text-[9px] text-faint tabular-nums">
            {n <= 3 ? bitstring(i, n) : i}
          </span>
        </div>
      ))}
    </div>
  );
}
