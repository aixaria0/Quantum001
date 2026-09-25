import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { LABS } from "@/lib/labs";
import { completionCount, useProgress } from "@/store/progress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Shell({
  children,
  activeId,
}: {
  children: React.ReactNode;
  activeId?: string;
}) {
  const seen = useProgress((s) => s.seen);
  const done = completionCount(seen);
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-bg/90 px-4 backdrop-blur-sm md:px-6">
        <Link to="/" className="flex items-baseline gap-3">
          <span className="font-display text-xl tracking-tight">Aether</span>
          <span className="hidden text-xs text-muted sm:inline">Quantum Laboratory</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted tabular-nums">
            {done}/{LABS.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <nav
          className={cn(
            "border-border bg-bg md:sticky md:top-14 md:flex md:h-[calc(100dvh-3.5rem)] md:w-60 md:shrink-0 md:flex-col md:overflow-y-auto md:border-r md:px-3 md:py-4",
            open ? "fixed inset-x-0 top-14 z-20 max-h-[70vh] overflow-y-auto border-b px-3 py-3" : "hidden md:flex",
          )}
        >
          <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-faint">Chapters</p>
          {LABS.map((lab) => (
            <Link
              key={lab.id}
              to="/lab/$id"
              params={{ id: lab.id }}
              onClick={() => setOpen(false)}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors duration-150",
                activeId === lab.id ? "bg-subtle text-fg" : "text-muted hover:bg-subtle/70 hover:text-fg",
              )}
            >
              <span className="font-mono text-[11px] text-faint tabular-nums">{lab.chapter}</span>
              <span className="truncate">{lab.title}</span>
              {seen[lab.id] ? <span className="ml-auto size-1.5 rounded-full bg-ok" /> : null}
            </Link>
          ))}
        </nav>
        <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-10">{children}</main>
      </div>
    </div>
  );
}
