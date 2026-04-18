"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Globe, ArrowRight, ArrowLeft, Search } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompetitorCard } from "@/components/pipeline/competitor-card";
import { BenchExplorer } from "@/components/pipeline/bench-explorer";
import { PreviewModal } from "@/components/pipeline/preview-modal";
import { usePipelineStore } from "@/stores/pipeline-store";
import type { Inspiration } from "@/types/pipeline";
import type { CompetitorResult } from "@/lib/competitor-scraper";

export default function InspirationsPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.runId as string;
  const run = usePipelineStore((s) => s.run);
  const brief = usePipelineStore((s) => s.brief);
  const setBrief = usePipelineStore((s) => s.setBrief);
  const audit = usePipelineStore((s) => s.audit);
  const selectedInspirations = usePipelineStore((s) => s.selectedInspirations);
  const toggleInspiration = usePipelineStore((s) => s.toggleInspiration);
  const setSelectedInspirations = usePipelineStore((s) => s.setSelectedInspirations);

  const [competitors, setCompetitors] = useState<CompetitorResult[]>([]);
  const [loadingComp, setLoadingComp] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // HYDRATATION au mount : r\u00e9cup\u00e9rer brief + inspirations d\u00e9j\u00e0 s\u00e9lectionn\u00e9es depuis run state
  useEffect(() => {
    if (!runId) return;
    fetch(`/api/pipeline/run?id=${runId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.brief && !brief) setBrief(data.brief);
        if (data?.inspirations?.length > 0 && selectedInspirations.length === 0) {
          setSelectedInspirations(data.inspirations);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  // AUTO-PERSIST : sauvegarder les inspirations d\u00e8s qu'elles changent (debounced)
  useEffect(() => {
    if (!runId || selectedInspirations.length === 0) return;
    const t = setTimeout(() => {
      fetch("/api/pipeline/run", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId, inspirations: selectedInspirations, skipTunnelAdvance: true }),
      }).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [selectedInspirations, runId]);

  // Lancer le scraping concurrents automatiquement
  useEffect(() => {
    if (!brief || loadingComp || competitors.length > 0) return;
    setLoadingComp(true);
    fetch("/api/pipeline/scrape-competitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runId,
        sector: brief.project.sector,
        type: brief.project.type,
        projectName: brief.project.name,
        knownCompetitors: audit?.knownCompetitors || [],
        keywords: audit?.suggestedKeywords || [],
      }),
    })
      .then((r) => r.json())
      .then(setCompetitors)
      .catch(() => {})
      .finally(() => setLoadingComp(false));
  }, [brief, runId, loadingComp, competitors.length]);

  const webSelected = selectedInspirations.filter((i) => i.source === "web");
  const benchSelected = selectedInspirations.filter((i) => i.source === "bench");
  const total = selectedInspirations.length;

  async function handleValidate() {
    setSubmitting(true);
    await fetch("/api/pipeline/run", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId, inspirations: selectedInspirations }),
    });
    router.push(`/pipeline/${runId}/extraction`);
  }

  return (
    <div className="px-6 py-8 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-tunnel-2" />
          <h2 className="text-lg font-semibold">Inspirations</h2>
          <Badge variant="accent">T2</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push(`/pipeline/${runId}/brief`)}>
          <ArrowLeft className="w-3.5 h-3.5" /> Retour Brief
        </Button>
      </div>

      <Tabs
        tabs={[
          { id: "web", label: "Concurrents web", count: webSelected.length },
          { id: "bench", label: "Bench Veille", count: benchSelected.length },
        ]}
      >
        {(tab) =>
          tab === "web" ? (
            <div>
              {loadingComp ? (
                <div className="flex items-center gap-2 text-sm text-text-muted py-8 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Recherche de concurrents...
                </div>
              ) : competitors.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-8">
                  <Globe className="w-5 h-5 mx-auto mb-2 opacity-50" />
                  Aucun concurrent trouv&eacute;. Utilisez le Bench.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {competitors.map((comp) => {
                    const asInspiration: Inspiration = {
                      id: comp.id,
                      url: comp.url,
                      title: comp.title,
                      description: comp.description,
                      imageUrl: comp.ogImage,
                      source: "web",
                      score: comp.score,
                      selected: false,
                    };
                    const isSelected = selectedInspirations.some((i) => i.id === comp.id);
                    return (
                      <CompetitorCard
                        key={comp.id}
                        title={comp.title}
                        url={comp.url}
                        description={comp.description}
                        ogImage={comp.ogImage}
                        score={comp.score}
                        checked={isSelected}
                        onToggle={() => toggleInspiration(asInspiration)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <BenchExplorer
              selected={selectedInspirations}
              maxSelection={5}
              onToggle={toggleInspiration}
              defaultSector={brief?.project.sector}
            />
          )
        }
      </Tabs>

      <PreviewModal imageUrl={previewUrl} onClose={() => setPreviewUrl(null)} />

      {/* Barre fixe en bas */}
      <div className="fixed bottom-0 left-56 right-0 border-t border-border bg-bg-primary/90 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-text-muted">
            Web : <strong className="text-text-primary">{webSelected.length}</strong>
          </span>
          <span className="text-text-muted">
            Bench : <strong className="text-text-primary">{benchSelected.length}</strong>
          </span>
          <span className="text-text-secondary">
            Total : <strong className="text-text-primary">{total}/10</strong>
          </span>
        </div>

        <Button size="md" disabled={total === 0 || submitting} onClick={handleValidate}>
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Validation...</>
          ) : (
            <>Valider les inspirations <ArrowRight className="w-4 h-4" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
