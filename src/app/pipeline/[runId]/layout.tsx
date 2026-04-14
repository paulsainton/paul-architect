"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { usePipelineStore } from "@/stores/pipeline-store";

export default function PipelineLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const runId = params.runId as string;
  const run = usePipelineStore((s) => s.run);
  const setRun = usePipelineStore((s) => s.setRun);
  const startSSE = usePipelineStore((s) => s.startSSE);
  const stopSSE = usePipelineStore((s) => s.stopSSE);

  useEffect(() => {
    if (!runId) return;

    // Charger l'état du run si pas encore chargé
    if (!run || run.id !== runId) {
      fetch(`/api/pipeline/run?id=${runId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data && !data.error) setRun(data);
        })
        .catch(() => {});
    }

    // Connecter SSE
    startSSE(runId);
    return () => stopSSE();
  }, [runId, run, setRun, startSSE, stopSSE]);

  return <>{children}</>;
}
