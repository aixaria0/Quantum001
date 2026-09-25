import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { LAB_VIEWS } from "@/components/labs/registry";
import { Shell } from "@/components/shell";
import { Formula } from "@/components/panel";
import { labById, nextLab, prevLab } from "@/lib/labs";
import { useProgress } from "@/store/progress";

export const Route = createFileRoute("/lab/$id")({
  component: LabPage,
  notFoundComponent: LabMissing,
});

function LabPage() {
  const { id } = Route.useParams();
  const lab = labById(id);
  const View = LAB_VIEWS[id];
  const mark = useProgress((s) => s.mark);

  useEffect(() => {
    if (lab) mark(lab.id);
  }, [lab, mark]);

  if (!lab || !View) throw notFound();

  const prev = prevLab(lab.id);
  const next = nextLab(lab.id);

  return (
    <Shell activeId={lab.id}>
      <div className="mb-8 max-w-2xl">
        <p className="font-mono text-xs text-faint tabular-nums">Chapter {lab.chapter}</p>
        <h1 className="mt-2 font-display text-4xl">{lab.title}</h1>
        <p className="mt-3 text-muted">{lab.summary}</p>
        <div className="mt-4">
          <Formula>{lab.formula}</Formula>
        </div>
      </div>
      <View />
      <div className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6">
        <Link
          to="/lab/$id"
          params={{ id: prev.id }}
          className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-fg"
        >
          <ArrowLeft className="size-4" />
          {prev.title}
        </Link>
        <Link
          to="/lab/$id"
          params={{ id: next.id }}
          className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-fg"
        >
          {next.title}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </Shell>
  );
}

function LabMissing() {
  return (
    <Shell>
      <h1 className="font-display text-4xl">This bench is empty.</h1>
      <p className="mt-3 max-w-md text-muted">That lab id is not on the atlas. Return to the observatory and pick a numbered chapter.</p>
      <Link to="/" className="mt-6 inline-flex min-h-11 items-center text-sm text-fg">
        Back to Aether
      </Link>
    </Shell>
  );
}
