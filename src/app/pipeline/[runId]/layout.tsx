"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { usePipelineStore } from "@/stores/pipeline-store";

export default function PipelineLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const runId = params.runId as string;
  const run = usePipelineStore((s) => s.run);
  const setRun = usePipelineStore((s) => s.setRun);
  const startSSE = usePipelineStore((s) => s.startSSE);
  const stopSSE = usePipelineStore((s) => s.stopSSE);
  const loadedRef = useRef<string | null>(null);

  // Charger l'état du run une seule fois
  useEffect(() => {
    if (!runId || loadedRef.current === runId) return;
    if (!run || run.id !== runId) {
      loadedRef.current = runId;
      fetch(`/api/pipeline/run?id=${runId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data && !data.error) setRun(data);
          else if (data?.error) console.warn("[pipeline-layout] run not loaded:", data.error);
        })
        .catch((err) => {
          console.error("[pipeline-layout] hydrate failed:", err);
          loadedRef.current = null;
        });
    }
  }, [runId, run, setRun]);

  // Connecter SSE séparément
  useEffect(() => {
    if (!runId) return;
    startSSE(runId);
    return () => stopSSE();
  }, [runId, startSSE, stopSSE]);

  return <>{children}</>;
}
