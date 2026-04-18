"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowRight, ArrowLeft, Brain } from "lucide-react";
import { PersonaPanel } from "@/components/pipeline/persona-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { usePipelineStore } from "@/stores/pipeline-store";
import type { PersonaAnalysis } from "@/types/pipeline";

interface PersonaState {
  name: string;
  role: string;
  text: string;
  status: "pending" | "streaming" | "complete";
}

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.runId as string;
  const brief = usePipelineStore((s) => s.brief);
  const brand = usePipelineStore((s) => s.brand);
  const run = usePipelineStore((s) => s.run);
  const selectedInspirations = usePipelineStore((s) => s.selectedInspirations);
  const events = usePipelineStore((s) => s.events);

  const [personas, setPersonas] = useState<PersonaState[]>([
    { name: "Architecte Info", role: "Architecture de l'information", text: "", status: "pending" },
    { name: "Int\u00e9grateur UI", role: "Organisation des blocs UI", text: "", status: "pending" },
    { name: "Coh\u00e9rence Brand", role: "Coh\u00e9rence de la marque", text: "", status: "pending" },
    { name: "Dev Technique", role: "Architecture technique React", text: "", status: "pending" },
  ]);
  const [results, setResults] = useState<PersonaAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // SSE events
  useEffect(() => {
    for (const event of events) {
      if (event.type === "analysis:persona-start") {
        setPersonas((prev) =>
          prev.map((p) => p.name === event.data.name ? { ...p, status: "streaming" as const } : p)
        );
      }
      if (event.type === "analysis:persona-chunk") {
        setPersonas((prev) =>
          prev.map((p) => p.name === event.data.name ? { ...p, text: event.data.text as string } : p)
        );
      }
      if (event.type === "analysis:persona-complete") {
        setPersonas((prev) =>
          prev.map((p) => p.name === event.data.name ? { ...p, status: "complete" as const } : p)
        );
      }
    }
  }, [events]);

  const startedRef = useRef(false);
  const setBrief = usePipelineStore((s) => s.setBrief);
  const setBrand = usePipelineStore((s) => s.setBrand);

  // Hydrater brief/brand depuis le run state si manquants (refresh direct sur /analysis)
  useEffect(() => {
    if ((brief && brand) || !runId) return;
    fetch(`/api/pipeline/run?id=${runId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.brief && !brief) setBrief(data.brief);
        if (data?.brand && !brand) setBrand(data.brand);
      })
      .catch(() => {});
  }, [brief, brand, runId, setBrief, setBrand]);

  useEffect(() => {
    // Lancer si on a AU MOINS le brief (brand + tokens sont optionnels avec fallback serveur)
    if (startedRef.current || loading || done || !brief) return;
    startedRef.current = true;
    setLoading(true);

    fetch("/api/pipeline/analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runId,
        brief,
        brand: brand || { palette: { primary: "#6366F1" }, typography: { heading: "Inter", body: "Inter" } },
        tokens: run?.mergedTokens || { colors: [], fonts: [], spacing: [], shadows: [], borderRadius: [] },
        inspirationsCount: selectedInspirations.length,
      }),
    })
      .then((r) => r.json())
      .then((data) => { setResults(data); setDone(true); })
      .catch((err) => console.error("[analysis] error:", err))
      .finally(() => setLoading(false));
  }, [brief, brand, run, runId, selectedInspirations.length, loading, done]);

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-tunnel-5" />
          <h2 className="text-lg font-semibold">Analyse multi-persona</h2>
          <Badge variant="accent">T5</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push(`/pipeline/${runId}/brand`)}>
          <ArrowLeft className="w-3.5 h-3.5" /> Retour Identit&eacute;
        </Button>
      </div>

      <p className="text-sm text-text-muted mb-6">
        4 experts analysent les extractions et recommandent la direction design.
      </p>

      {personas.map((p) => (
        <PersonaPanel key={p.name} name={p.name} role={p.role} text={p.text} status={p.status} />
      ))}

      {done && results.length > 0 && (
        <Card className="mt-6">
          <h3 className="text-sm font-semibold mb-3">R&eacute;sum&eacute; des recommandations</h3>
          <div className="space-y-2">
            {results.flatMap((r) =>
              r.recommendations.map((rec, i) => (
                <p key={`${r.name}-${i}`} className="text-xs text-text-secondary pl-3 border-l-2 border-border">
                  <strong className="text-text-primary">{r.name}:</strong> {rec}
                </p>
              ))
            )}
          </div>
        </Card>
      )}

      <div className="mt-6 flex items-center justify-between pt-4 border-t border-border">
        <p className="text-xs text-text-muted">
          {done ? "Analyse termin\u00e9e. Tu peux passer aux maquettes." : "L'analyse continue en arri\u00e8re-plan."}
        </p>
        <Button onClick={() => router.push(`/pipeline/${runId}/maquettes`)}>
          {done ? "Continuer vers les maquettes" : "Passer aux maquettes"} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
