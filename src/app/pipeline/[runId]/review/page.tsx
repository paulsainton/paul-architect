"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Loader2, Rocket, ArrowLeft, CheckCircle } from "lucide-react";
import { ScoreCard } from "@/components/pipeline/score-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePipelineStore } from "@/stores/pipeline-store";
import type { QAScore } from "@/types/pipeline";

export default function ReviewPage() {
  const params = useParams();
  const runId = params.runId as string;
  const run = usePipelineStore((s) => s.run);

  const [score, setScore] = useState<QAScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [deployed, setDeployed] = useState(false);

  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current || loading || score) return;
    startedRef.current = true;
    setLoading(true);

    fetch("/api/pipeline/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId, pagesValidated: 0, totalPages: 1, maquettesApproved: 0, totalMaquettes: 1 }),
    })
      .then((r) => r.json())
      .then((data) => setScore(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [runId, loading, score]);

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-tunnel-8" />
          <h2 className="text-lg font-semibold">QA &amp; Deploy</h2>
          <Badge variant="accent">T8</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => {
          const router = (window as unknown as { location: { pathname: string } });
          window.history.back();
        }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Retour
        </Button>
      </div>

      {loading && !score ? (
        <div className="flex items-center gap-2 text-sm text-text-muted py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          Review en cours...
        </div>
      ) : score ? (
        <>
          <ScoreCard score={score} />

          <div className="mt-6 flex items-center gap-3">
            {score.verdict === "PASS" ? (
              <>
                {deployed ? (
                  <Badge variant="success" className="text-sm px-4 py-2">
                    <Rocket className="w-4 h-4 mr-1" /> D&eacute;ploy&eacute; avec succ&egrave;s
                  </Badge>
                ) : (
                  <Button onClick={() => setDeployed(true)}>
                    <Rocket className="w-4 h-4" /> D&eacute;ployer
                  </Button>
                )}
              </>
            ) : (
              <Button variant="secondary" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4" /> Retour au Tunnel 6
              </Button>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
