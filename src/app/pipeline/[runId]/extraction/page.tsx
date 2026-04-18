"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowRight, ArrowLeft, Zap } from "lucide-react";
import { ExtractionTimeline, type ExtractionStep } from "@/components/pipeline/extraction-timeline";
import { TokenViewer } from "@/components/pipeline/token-viewer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePipelineStore } from "@/stores/pipeline-store";
import type { MergedTokens } from "@/types/pipeline";

export default function ExtractionPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.runId as string;
  const selectedInspirations = usePipelineStore((s) => s.selectedInspirations);
  const events = usePipelineStore((s) => s.events);

  const [steps, setSteps] = useState<ExtractionStep[]>([]);
  const [merged, setMerged] = useState<MergedTokens | null>(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  // Écouter les SSE events
  useEffect(() => {
    for (const event of events) {
      const url = event.data.url as string;
      if (!url) continue;

      setSteps((prev) => {
        const existing = prev.find((s) => s.url === url);
        const domain = (() => { try { return new URL(url).hostname.replace("www.", ""); } catch { return url; } })();

        if (event.type === "clone:queue" && !existing) {
          return [...prev, { url, domain, status: "queued", percent: 0 }];
        }
        if (event.type === "clone:start" && existing) {
          return prev.map((s) => s.url === url ? { ...s, status: "running" as const, step: "launching" } : s);
        }
        if (event.type === "clone:progress" && existing) {
          return prev.map((s) =>
            s.url === url ? { ...s, step: event.data.step as string, percent: event.data.percent as number } : s
          );
        }
        if (event.type === "clone:screenshot" && existing) {
          return prev.map((s) =>
            s.url === url
              ? { ...s, desktopScreenshot: event.data.desktopUrl as string, mobileScreenshot: event.data.mobileUrl as string }
              : s
          );
        }
        if (event.type === "clone:tokens" && existing) {
          return prev.map((s) =>
            s.url === url
              ? { ...s, colorsCount: event.data.colorsCount as number, fontsCount: event.data.fontsCount as number }
              : s
          );
        }
        if (event.type === "clone:complete" && existing) {
          const status = event.data.status === "partial" ? "partial" as const : "complete" as const;
          return prev.map((s) => s.url === url ? { ...s, status, percent: 100 } : s);
        }
        if (event.type === "clone:error" && existing) {
          return prev.map((s) => s.url === url ? { ...s, status: "failed" as const, percent: 100 } : s);
        }
        return prev;
      });

      if (event.type === "clone:merge-complete") {
        if (event.data.colors || event.data.fonts) {
          setMerged({
            colors: [],
            fonts: [],
            spacing: [],
            shadows: [],
            borderRadius: [],
            // On attend que le store récupère les mergedTokens via le run state
          });
        }
        setDone(true);
        setRunning(false);
      }
    }
  }, [events]);

  // Récupérer mergedTokens du run state dès que disponible (après merge)
  useEffect(() => {
    if (done && !merged?.colors.length) {
      fetch(`/api/pipeline/run?id=${runId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.mergedTokens) setMerged(data.mergedTokens);
        })
        .catch(() => {});
    }
  }, [done, merged, runId]);

  const startedRef = useRef(false);

  // Lancement fire-and-forget — retourne immédiatement, SSE pour progression
  useEffect(() => {
    if (startedRef.current || running || done || selectedInspirations.length === 0) return;
    startedRef.current = true;
    setRunning(true);

    const urls = selectedInspirations.map((i) => i.url).filter(Boolean);
    fetch("/api/pipeline/clone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId, urls }),
    })
      .then((r) => r.json())
      .then((data) => {
        // La route retourne {started: true} immédiatement
        // La complétion arrive via SSE 'clone:merge-complete'
        if (data.error) {
          setRunning(false);
        }
      })
      .catch(() => setRunning(false));
  }, [selectedInspirations, runId, running, done]);

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-tunnel-3" />
          <h2 className="text-lg font-semibold">Clone Architect</h2>
          <Badge variant="accent">T3</Badge>
          {running && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push(`/pipeline/${runId}/inspirations`)}>
          <ArrowLeft className="w-3.5 h-3.5" /> Retour Inspirations
        </Button>
      </div>

      <p className="text-sm text-text-muted mb-6">
        Extraction des tokens, layouts et screenshots de chaque inspiration s&eacute;lectionn&eacute;e.
      </p>

      <ExtractionTimeline steps={steps} />

      {done && merged && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-tunnel-3" />
            Tokens merg&eacute;s depuis {steps.filter((s) => s.status !== "failed").length} sources
          </h3>
          <TokenViewer tokens={merged} />

          <div className="mt-6 flex justify-end">
            <Button onClick={() => router.push(`/pipeline/${runId}/brand`)}>
              Continuer <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {!running && !done && selectedInspirations.length === 0 && (
        <p className="text-sm text-text-muted text-center py-12">
          Aucune inspiration s&eacute;lectionn&eacute;e. Retournez aux inspirations.
        </p>
      )}
    </div>
  );
}
