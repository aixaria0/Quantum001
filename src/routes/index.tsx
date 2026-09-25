import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { LABS } from "@/lib/labs";
import { completionCount, useProgress } from "@/store/progress";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const seen = useProgress((s) => s.seen);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const done = hydrated ? completionCount(seen) : 0;

  return (
    <Shell>
      <div className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-faint">Observatory</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Twelve labs. One Hilbert space.</h1>
        <p className="mt-4 max-w-xl text-muted">
          From the Schrödinger equation to Shor, Grover, QAOA, knitting, annealing, error correction, quantum machine
          learning, Born machines, and Lindblad dynamics — every chapter is a working simulator, not a slide.
        </p>
        <p className="mt-4 font-mono text-xs text-faint tabular-nums">{done} of {LABS.length} visited</p>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {LABS.map((lab) => (
          <Link
            key={lab.id}
            to="/lab/$id"
            params={{ id: lab.id }}
            className="group flex flex-col rounded-xl bg-elevated p-5 shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-200 ease-[var(--ease-out)] hover:shadow-[var(--shadow-border-hover)]"
          >
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[11px] text-faint tabular-nums">{lab.chapter}</span>
              {hydrated && seen[lab.id] ? <span className="size-1.5 rounded-full bg-ok" /> : null}
            </div>
            <h2 className="mt-3 font-display text-2xl">{lab.title}</h2>
            <p className="mt-1 text-xs text-muted">{lab.kicker}</p>
            <p className="mt-3 flex-1 text-sm text-muted">{lab.summary}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs text-fg">
              Open lab
              <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
