"use client";

import { useState, useCallback, useEffect } from "react";
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

  const runReview = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/pipeline/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId,
          pagesValidated: 0,
          totalPages: 1,
          maquettesApproved: 0,
          totalMaquettes: 1,
        }),
      });
      const data = await res.json();
      setScore(data);
    } catch { /* handled */ }
    setLoading(false);
  }, [loading, runId]);

  useEffect(() => {
    if (!score && !loading) runReview();
  }, [score, loading, runReview]);

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle className="w-5 h-5 text-tunnel-8" />
        <h2 className="text-lg font-semibold">QA &amp; Deploy</h2>
        <Badge variant="accent">T8</Badge>
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
