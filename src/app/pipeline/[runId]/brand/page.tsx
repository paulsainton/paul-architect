"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowRight, ArrowLeft, Palette, CheckCircle } from "lucide-react";
import { BrandOptionCard } from "@/components/pipeline/brand-option";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { usePipelineStore } from "@/stores/pipeline-store";
import type { BrandOption, Brand } from "@/types/pipeline";

interface ProgressStep {
  label: string;
  status: "pending" | "active" | "done";
  detail?: string;
}

export default function BrandPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.runId as string;
  const brief = usePipelineStore((s) => s.brief);
  const setBrief = usePipelineStore((s) => s.setBrief);
  const setBrand = usePipelineStore((s) => s.setBrand);
  const run = usePipelineStore((s) => s.run);
  const events = usePipelineStore((s) => s.events);

  // Si pas de brief en m\u00e9moire, recharger le run pour avoir brief.project.slug et relancer audit
  useEffect(() => {
    if (brief || !runId) return;
    // Fetch run state
    fetch(`/api/pipeline/run?id=${runId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.brief) setBrief(data.brief);
      })
      .catch(() => {});
  }, [brief, runId, setBrief]);

  const [options, setOptions] = useState<BrandOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([
    { label: "Analyse des tokens extraits", status: "pending" },
    { label: "Option A — Palette dominante", status: "pending" },
    { label: "Option B — Harmonisation", status: "pending" },
    { label: "Option C — Contraste compl\u00e9mentaire", status: "pending" },
  ]);
  const startedRef = useRef(false);

  // SSE events pour la progression
  useEffect(() => {
    for (const event of events) {
      if (event.type === "brand:analyzing-tokens") {
        setProgressSteps((prev) => prev.map((s, i) =>
          i === 0 ? { ...s, status: "active" as const, detail: `${event.data.colorsFound} couleurs, ${event.data.fontsFound} fonts, mood ${event.data.detectedMood}` } : s
        ));
      }
      if (event.type === "brand:generating") {
        const optIdx = { A: 1, B: 2, C: 3 }[event.data.option as "A" | "B" | "C"];
        if (optIdx !== undefined) {
          setProgressSteps((prev) => prev.map((s, i) =>
            i === 0 ? { ...s, status: "done" as const }
            : i === optIdx ? { ...s, status: "active" as const, detail: event.data.label as string }
            : s
          ));
        }
      }
      if (event.type === "brand:ready") {
        const optIdx = { A: 1, B: 2, C: 3 }[event.data.option as "A" | "B" | "C"];
        if (optIdx !== undefined) {
          setProgressSteps((prev) => prev.map((s, i) =>
            i === optIdx ? { ...s, status: "done" as const } : s
          ));
        }
      }
    }
  }, [events]);

  // G\u00e9n\u00e9ration automatique — une seule fois
  // Important : T4 doit marcher m\u00eame sans T3 (Clone pass\u00e9) — fallback tokens vides
  useEffect(() => {
    if (startedRef.current || loading || options.length > 0 || !brief) return;
    startedRef.current = true;
    setLoading(true);

    // Si pas de mergedTokens (T3 pas encore fait), utiliser les tokens du scan initial
    const tokens = run?.mergedTokens || {
      colors: Object.entries(brief.detected.tokens || {})
        .filter(([, v]) => typeof v === "string" && (v as string).startsWith("#"))
        .map(([k, v]) => ({ hex: v as string, frequency: 1, source: k })),
      fonts: [],
      spacing: [],
      shadows: [],
      borderRadius: [],
    };

    fetch("/api/pipeline/brand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId, tokens, brief }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setOptions(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [brief, run, runId, loading, options.length]);

  async function handleValidate() {
    if (!selectedOption) return;
    const chosen = options.find((o) => o.option === selectedOption);
    if (!chosen) return;

    setSubmitting(true);
    const brand: Brand = {
      selectedOption,
      palette: chosen.palette,
      typography: chosen.typography,
      borderRadius: chosen.borderRadius,
      stitchProjectId: chosen.stitchProjectId,
      source: "stitch-sdk",
      validatedAt: new Date().toISOString(),
    };

    await fetch("/api/pipeline/run", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId, brand }),
    });

    setBrand(brand);
    router.push(`/pipeline/${runId}/analysis`);
  }

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Palette className="w-5 h-5 text-tunnel-4" />
          <h2 className="text-lg font-semibold">Identit&eacute; visuelle</h2>
          <Badge variant="accent">T4</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push(`/pipeline/${runId}/extraction`)}>
          <ArrowLeft className="w-3.5 h-3.5" /> Retour Clone
        </Button>
      </div>

      <p className="text-sm text-text-muted mb-6">
        3 propositions g&eacute;n&eacute;r&eacute;es depuis les tokens extraits par Clone Architect. Choisissez celle qui correspond au projet.
      </p>

      {/* \u00c9tat vide : pas de brief, pas de loading */}
      {!brief && !loading && options.length === 0 && (
        <Card className="text-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-accent mx-auto mb-3" />
          <p className="text-sm text-text-secondary">Chargement du brief...</p>
          <p className="text-xs text-text-muted mt-2">Si rien ne se passe, retourne au brief pour le valider.</p>
        </Card>
      )}

      {/* Progress steps pendant g\u00e9n\u00e9ration */}
      {loading && options.length === 0 && (
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Loader2 className="w-4 h-4 animate-spin text-accent" />
            <span className="text-sm font-medium">G&eacute;n&eacute;ration des propositions...</span>
            <span className="text-xs text-text-muted ml-auto">~3 secondes</span>
          </div>
          <div className="space-y-2">
            {progressSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {step.status === "active" && <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />}
                {step.status === "done" && <CheckCircle className="w-3.5 h-3.5 text-status-success" />}
                {step.status === "pending" && <div className="w-3.5 h-3.5 rounded-full border-2 border-border" />}
                <span className={step.status === "pending" ? "text-text-muted" : "text-text-secondary"}>
                  {step.label}
                </span>
                {step.detail && <span className="text-xs text-text-muted ml-auto">{step.detail}</span>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {options.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {options.map((opt) => (
            <BrandOptionCard
              key={opt.option}
              option={opt}
              selected={selectedOption === opt.option}
              onSelect={() => setSelectedOption(opt.option)}
            />
          ))}
        </div>
      )}

      {selectedOption && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Option s&eacute;lectionn&eacute;e : <strong className="text-text-primary">{selectedOption}</strong>
          </p>
          <Button onClick={handleValidate} disabled={submitting}>
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Validation...</>
            ) : (
              <>Valider l&apos;identit&eacute; <ArrowRight className="w-4 h-4" /></>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
