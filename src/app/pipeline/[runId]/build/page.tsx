"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowRight, Code } from "lucide-react";
import { BuildTimeline, type PageBuildState } from "@/components/pipeline/build-timeline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePipelineStore } from "@/stores/pipeline-store";

export default function BuildPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.runId as string;
  const brief = usePipelineStore((s) => s.brief);
  const brand = usePipelineStore((s) => s.brand);
  const run = usePipelineStore((s) => s.run);
  const events = usePipelineStore((s) => s.events);

  const [pages, setPages] = useState<PageBuildState[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // SSE events
  useEffect(() => {
    for (const event of events) {
      const page = event.data.page as string;
      if (!page) continue;

      setPages((prev) => {
        if (event.type === "build:page-start") {
          const exists = prev.find((p) => p.page === page);
          if (!exists) return [...prev, { page, status: "generating" as const, percent: 0 }];
        }
        if (event.type === "build:generating") {
          return prev.map((p) =>
            p.page === page ? { ...p, percent: event.data.percent as number, step: event.data.status as string } : p
          );
        }
        if (event.type === "build:compiled") {
          const success = event.data.success as boolean;
          return prev.map((p) =>
            p.page === page
              ? { ...p, status: success ? "compiled" as const : "failed" as const, errors: (event.data.errors as string[]) || [] }
              : p
          );
        }
        if (event.type === "build:review") {
          return prev.map((p) =>
            p.page === page
              ? { ...p, reviewScore: event.data.score as number, reviewIssues: (event.data.issues as string[]) || [] }
              : p
          );
        }
        return prev;
      });
    }
  }, [events]);

  const startBuild = useCallback(async () => {
    if (loading || !brief || !brand) return;
    setLoading(true);

    const targetPages = brief.detected.pages.length > 0 ? brief.detected.pages : ["home"];

    try {
      const res = await fetch("/api/pipeline/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId,
          context: {
            brief,
            brand,
            tokens: run?.mergedTokens || { colors: [], fonts: [], spacing: [], shadows: [], borderRadius: [] },
            analysis: [],
            pages: targetPages,
          },
        }),
      });
      await res.json();
      setDone(true);
    } catch { /* handled by SSE */ }
    setLoading(false);
  }, [loading, brief, brand, run, runId]);

  useEffect(() => {
    if (!done && !loading && pages.length === 0) startBuild();
  }, [done, loading, pages.length, startBuild]);

  const validated = pages.filter((p) => p.status === "validated").length;

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Code className="w-5 h-5 text-tunnel-6" />
        <h2 className="text-lg font-semibold">G&eacute;n&eacute;ration de code</h2>
        <Badge variant="accent">T6</Badge>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
      </div>

      <p className="text-sm text-text-muted mb-6">
        Claude g&eacute;n&egrave;re le code section par section, bas&eacute; sur tout le contexte accumul&eacute;.
      </p>

      <BuildTimeline
        pages={pages}
        onApprove={(page) =>
          setPages((prev) => prev.map((p) => p.page === page ? { ...p, status: "validated" as const } : p))
        }
        onRevise={(page) =>
          setPages((prev) => prev.map((p) => p.page === page ? { ...p, status: "revising" as const } : p))
        }
      />

      {done && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            {validated}/{pages.length} pages valid&eacute;es
          </p>
          <Button onClick={() => router.push(`/pipeline/${runId}/review`)}>
            Passer au QA <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
