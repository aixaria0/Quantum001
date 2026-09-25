import { cn } from "@/lib/utils";

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-xl bg-elevated p-4 shadow-[var(--shadow-border)] md:p-5", className)}>
      {children}
    </section>
  );
}

export function Field({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium text-muted">{label}</span>
        {value ? <span className="font-mono text-xs text-fg tabular-nums">{value}</span> : null}
      </div>
      {children}
    </label>
  );
}

export function Formula({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md bg-subtle px-3 py-2 font-mono text-xs text-accent md:text-sm">{children}</p>
  );
}
