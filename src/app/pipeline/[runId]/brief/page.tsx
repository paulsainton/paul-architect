"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";
import { BriefForm } from "@/components/pipeline/brief-form";
import { usePipelineStore } from "@/stores/pipeline-store";
import { Badge } from "@/components/ui/badge";
import type { Brief } from "@/types/pipeline";
import type { ProjectScan } from "@/lib/project-analyzer";

export default function BriefPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.runId as string;
  const run = usePipelineStore((s) => s.run);
  const setBrief = usePipelineStore((s) => s.setBrief);
  const events = usePipelineStore((s) => s.events);

  const [scan, setScan] = useState<ProjectScan | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanSteps, setScanSteps] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Lancer le scan automatique
  useEffect(() => {
    if (!run || scan || scanning) return;
    const projectPath = `/opt/${run.projectSlug}`;
    setScanning(true);

    fetch("/api/pipeline/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId, projectPath }),
    })
      .then((r) => r.json())
      .then((data) => {
        setScan(data);
        setScanning(false);
      })
      .catch(() => setScanning(false));
  }, [run, scan, scanning, runId]);

  // SSE events pour les étapes de scan
  useEffect(() => {
    const scanEvents = events.filter((e) => e.type === "collect:scanning");
    setScanSteps(scanEvents.map((e) => e.data.source as string));
  }, [events]);

  async function handleSubmit(brief: Brief) {
    setSubmitting(true);
    try {
      await fetch("/api/pipeline/run", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId, brief }),
      });
      setBrief(brief);
      router.push(`/pipeline/${runId}/inspirations`);
    } catch {
      setSubmitting(false);
    }
  }

  if (scanning) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-6">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
          <h2 className="text-lg font-semibold">Analyse du projet en cours...</h2>
        </div>
        <div className="space-y-2">
          {scanSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-3.5 h-3.5 text-status-success" />
              <span className="text-text-secondary">{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-text-muted">En attente du scan...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-lg font-semibold">Brief &mdash; {scan.name}</h2>
          <Badge variant="info">T1</Badge>
        </div>
        <p className="text-sm text-text-muted">
          Informations d&eacute;tect&eacute;es automatiquement. Compl&eacute;tez le brief pour passer aux inspirations.
        </p>
      </div>

      <BriefForm scan={scan} onSubmit={handleSubmit} loading={submitting} />
    </div>
  );
}
