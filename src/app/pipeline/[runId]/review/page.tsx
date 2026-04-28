"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Loader2, Rocket, ArrowLeft, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { ScoreCard } from "@/components/pipeline/score-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { usePipelineStore } from "@/stores/pipeline-store";
import type { QAScore } from "@/types/pipeline";
import { toast } from "sonner";

interface DeployStep {
  name: string;
  status: "pending" | "running" | "success" | "skipped" | "failed";
  output?: string;
  duration?: number;
}

interface DeployResult {
  success: boolean;
  steps: DeployStep[];
  commitSha?: string;
  pm2Restarted?: boolean;
  empireUpdated?: boolean;
}

const STEP_LABELS: Record<string, string> = {
  "validate-path": "Vérification du chemin projet",
  "git-status": "Git status",
  "git-add": "Git add",
  "git-commit": "Git commit",
  "git-push": "Git push (origin)",
  "pm2-restart": "PM2 restart",
  "empire-sync": "Sync EmpireDONE",
};

export default function ReviewPage() {
  const params = useParams();
  const runId = params.runId as string;
  const run = usePipelineStore((s) => s.run);

  const [score, setScore] = useState<QAScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<DeployResult | null>(null);

  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current || loading || score) return;
    startedRef.current = true;
    setLoading(true);

    // Compute real progression from store state instead of hardcoded values
    const totalPagesReal = run?.brief?.detected?.pages?.length || 1;
    const totalMaquettesReal = run?.inspirations?.length || 1;
    // pagesValidated/maquettesApproved : best-effort from build SSE events
    // (T6/T7 don't yet persist exact validation counts, fallback prudent : tout=valide si tunnels 6/7 completed)
    const pagesValidatedReal = run?.tunnels?.[6]?.status === "completed" ? totalPagesReal : 0;
    const maquettesApprovedReal = run?.tunnels?.[7]?.status === "completed" ? totalMaquettesReal : 0;

    fetch("/api/pipeline/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runId,
        pagesValidated: pagesValidatedReal,
        totalPages: totalPagesReal,
        maquettesApproved: maquettesApprovedReal,
        totalMaquettes: totalMaquettesReal,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) {
          toast.error("QA review", { description: data.error });
          return;
        }
        setScore(data);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error("QA review indisponible", { description: msg });
      })
      .finally(() => setLoading(false));
  }, [runId, loading, score, run]);

  async function handleDeploy() {
    if (deploying || deployResult?.success) return;
    setDeploying(true);
    try {
      const res = await fetch("/api/pipeline/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || "Deploy a échoué");
        setDeployResult({ success: false, steps: [] });
      } else {
        setDeployResult(data);
        if (data.success) {
          toast.success(
            data.commitSha
              ? `Déployé (${data.commitSha})`
              : "Déploiement réussi"
          );
        } else {
          toast.error("Déploiement partiel — voir détails");
        }
      }
    } catch (err) {
      toast.error("Erreur réseau deploy");
      setDeployResult({ success: false, steps: [] });
    } finally {
      setDeploying(false);
    }
  }

  const projectSlug = run?.projectSlug;

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-tunnel-8" />
          <h2 className="text-lg font-semibold">QA &amp; Deploy</h2>
          <Badge variant="accent">T8</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
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

          {/* Deploy panel */}
          {score.verdict === "PASS" ? (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                {deployResult?.success ? (
                  <Badge variant="success" className="text-sm px-4 py-2">
                    <Rocket className="w-4 h-4 mr-1" /> D&eacute;ploy&eacute; avec succ&egrave;s
                    {deployResult.commitSha && (
                      <span className="ml-2 font-mono text-xs">{deployResult.commitSha}</span>
                    )}
                  </Badge>
                ) : (
                  <Button onClick={handleDeploy} disabled={deploying}>
                    {deploying ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> D&eacute;ploiement en cours...</>
                    ) : (
                      <><Rocket className="w-4 h-4" /> D&eacute;ployer maintenant</>
                    )}
                  </Button>
                )}
                {projectSlug && (
                  <a
                    href={`https://${projectSlug}.ps-tools.dev`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-text-muted hover:text-text-secondary inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Voir le projet
                  </a>
                )}
              </div>

              {/* Steps detail */}
              {deployResult && deployResult.steps.length > 0 && (
                <Card>
                  <p className="text-xs uppercase tracking-wider text-text-muted mb-2">
                    {deployResult.success ? "Déploiement réussi" : "Étapes du déploiement"}
                  </p>
                  <div className="space-y-1.5 text-sm">
                    {deployResult.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        {step.status === "success" && <CheckCircle className="w-3.5 h-3.5 text-status-success mt-0.5 shrink-0" />}
                        {step.status === "failed" && <XCircle className="w-3.5 h-3.5 text-status-error mt-0.5 shrink-0" />}
                        {step.status === "skipped" && <div className="w-3.5 h-3.5 rounded-full border-2 border-border mt-0.5 shrink-0" />}
                        {(step.status === "running" || step.status === "pending") && <Loader2 className="w-3.5 h-3.5 animate-spin text-accent mt-0.5 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={step.status === "skipped" ? "text-text-muted" : "text-text-secondary"}>
                              {STEP_LABELS[step.name] || step.name}
                            </span>
                            {typeof step.duration === "number" && step.duration > 0 && (
                              <span className="text-xs text-text-muted">{step.duration}ms</span>
                            )}
                          </div>
                          {step.output && step.status !== "success" && (
                            <pre className="text-xs text-text-muted mt-1 truncate font-mono">
                              {step.output.slice(0, 160)}
                            </pre>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {deployResult.success && (
                    <div className="mt-3 pt-3 border-t border-border text-xs text-text-muted flex flex-wrap gap-3">
                      {deployResult.commitSha && <span>commit: <code className="font-mono">{deployResult.commitSha}</code></span>}
                      {deployResult.pm2Restarted !== undefined && <span>PM2: {deployResult.pm2Restarted ? "redémarré" : "ignoré"}</span>}
                      {deployResult.empireUpdated !== undefined && <span>Empire: {deployResult.empireUpdated ? "synchronisé" : "ignoré"}</span>}
                    </div>
                  )}
                </Card>
              )}
            </div>
          ) : (
            <div className="mt-6 flex items-center gap-3">
              <Button variant="secondary" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4" /> Retour au Tunnel 6
              </Button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
