"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, ArrowLeft, Layers } from "lucide-react";
import { toast } from "sonner";
import { BriefForm } from "@/components/pipeline/brief-form";
import { usePipelineStore } from "@/stores/pipeline-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Brief } from "@/types/pipeline";
import type { AuditedBrief } from "@/lib/brief-auditor";

interface ScanStep {
  label: string;
  key: string;
  status: "pending" | "active" | "done";
}

export default function BriefPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.runId as string;
  const run = usePipelineStore((s) => s.run);
  const setBrief = usePipelineStore((s) => s.setBrief);
  const setAuditStore = usePipelineStore((s) => s.setAudit);
  const events = usePipelineStore((s) => s.events);

  const [audit, setAudit] = useState<AuditedBrief | null>(null);
  const [scanning, setScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scanSteps, setScanSteps] = useState<ScanStep[]>([]);
  const startedRef = useRef(false);

  // Lancer le scan automatique une seule fois
  useEffect(() => {
    if (!run || audit || scanning || startedRef.current) return;
    startedRef.current = true;
    setScanning(true);

    fetch("/api/pipeline/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          console.error("Audit error:", data.error);
          setScanning(false);
          return;
        }
        setAudit(data);
        setAuditStore({
          knownCompetitors: data.knownCompetitors || [],
          suggestedKeywords: data.suggestedKeywords || [],
        });
        setScanning(false);
      })
      .catch(() => setScanning(false));
  }, [run, audit, scanning, runId]);

  // SSE events pour les \u00e9tapes de scan
  useEffect(() => {
    for (const ev of events) {
      if (ev.type === "collect:scanning") {
        const key = ev.data.key as string;
        const label = ev.data.source as string;
        setScanSteps((prev) => {
          const exists = prev.find((s) => s.key === key);
          if (exists) return prev.map((s) => s.key === key ? { ...s, status: "active" as const } : s);
          // Mettre les pr\u00e9c\u00e9dents en "done"
          const updated = prev.map((s) => s.status === "active" ? { ...s, status: "done" as const } : s);
          return [...updated, { key, label, status: "active" }];
        });
      }
      if (ev.type === "collect:complete") {
        setScanSteps((prev) => prev.map((s) => ({ ...s, status: "done" as const })));
      }
    }
  }, [events]);

  async function handleSubmit(brief: Brief) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/pipeline/run", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId, brief }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error("Enregistrement brief impossible", { description: err?.error || `HTTP ${res.status}` });
        return;
      }
      setBrief(brief);
      router.push(`/pipeline/${runId}/inspirations`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Erreur réseau brief", { description: msg });
    } finally {
      setSubmitting(false);
    }
  }

  if (scanning || !audit) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-6">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
          <h2 className="text-lg font-semibold">Audit complet du projet en cours...</h2>
        </div>
        <p className="text-sm text-text-muted mb-6">
          Scan local + EmpireDONE + inf&eacute;rences m&eacute;tier. ~2 secondes.
        </p>
        <div className="space-y-2">
          {scanSteps.map((step) => (
            <div key={step.key} className="flex items-center gap-2 text-sm">
              {step.status === "active" && <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />}
              {step.status === "done" && <CheckCircle className="w-3.5 h-3.5 text-status-success" />}
              {step.status === "pending" && <div className="w-3.5 h-3.5 rounded-full border-2 border-border" />}
              <span className={step.status === "pending" ? "text-text-muted" : "text-text-secondary"}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-tunnel-1" />
          <h2 className="text-lg font-semibold">Brief &mdash; {audit.scan.name}</h2>
          <Badge variant="accent">T1</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push("/pipeline/new")}>
          <ArrowLeft className="w-3.5 h-3.5" /> Changer de projet
        </Button>
      </div>
      <p className="text-sm text-text-muted mb-6">
        Le brief a &eacute;t&eacute; g&eacute;n&eacute;r&eacute; automatiquement depuis l&apos;audit. V&eacute;rifie et modifie si besoin avant de valider.
      </p>

      <BriefForm audit={audit} onSubmit={handleSubmit} loading={submitting} />
    </div>
  );
}
