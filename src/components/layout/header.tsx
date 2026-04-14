"use client";

import { usePathname } from "next/navigation";
import { usePipelineStore } from "@/stores/pipeline-store";
import { ChevronRight } from "lucide-react";

const PATH_LABELS: Record<string, string> = {
  brief: "Brief",
  inspirations: "Inspirations",
  extraction: "Clone Architect",
  brand: "Identit\u00e9 visuelle",
  analysis: "Analyse",
  build: "Code",
  maquettes: "Maquettes",
  review: "QA & Deploy",
  new: "Nouveau pipeline",
};

export function Header() {
  const pathname = usePathname();
  const run = usePipelineStore((s) => s.run);
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  const label = PATH_LABELS[lastSegment] || "";

  return (
    <header className="h-12 shrink-0 border-b border-border bg-bg-surface/50 backdrop-blur-sm flex items-center px-4 gap-2">
      <span className="text-xs text-text-muted">Paul Architect</span>
      {run && (
        <>
          <ChevronRight className="w-3 h-3 text-text-muted" />
          <span className="text-xs text-text-secondary truncate max-w-48">{run.projectSlug}</span>
        </>
      )}
      {label && (
        <>
          <ChevronRight className="w-3 h-3 text-text-muted" />
          <span className="text-xs font-medium text-text-primary">{label}</span>
        </>
      )}
      <div className="flex-1" />
      {run && (
        <span className="text-[10px] font-mono text-text-muted">
          {run.id.slice(0, 16)}
        </span>
      )}
    </header>
  );
}
