"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowRight, ArrowLeft, Image as ImageIcon, ExternalLink, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { usePipelineStore } from "@/stores/pipeline-store";

interface InstantMaquette {
  refUrl: string;
  refDomain: string;
  refTitle: string;
  refInspiration: {
    visualStyles?: string[];
    colorScheme?: string;
    keyFeatures?: string[];
    description?: string;
  };
  projectId?: string;
  projectName?: string;
  screenId?: string;
  imageUrl?: string;
  stitchUrl?: string;
  promptUsed?: string;
  status: "pending" | "generating" | "ready" | "failed";
  error?: string;
}

export default function MaquettesPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.runId as string;
  const brief = usePipelineStore((s) => s.brief);
  const setBrief = usePipelineStore((s) => s.setBrief);
  const brand = usePipelineStore((s) => s.brand);
  const setBrand = usePipelineStore((s) => s.setBrand);
  const selectedInspirations = usePipelineStore((s) => s.selectedInspirations);
  const setSelectedInspirations = usePipelineStore((s) => s.setSelectedInspirations);

  const [maquettes, setMaquettes] = useState<InstantMaquette[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const startedRef = useRef(false);

  // HYDRATATION depuis run state
  useEffect(() => {
    if (!runId) return;
    const missing = !brief || !brand || selectedInspirations.length === 0;
    if (!missing) return;
    fetch(`/api/pipeline/run?id=${runId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.brief && !brief) setBrief(data.brief);
        if (data?.brand && !brand) setBrand(data.brand);
        if (data?.inspirations?.length > 0 && selectedInspirations.length === 0) {
          setSelectedInspirations(data.inspirations);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  // G\u00e9n\u00e9ration instantan\u00e9e : 1 \u00e9cran par inspiration, en parall\u00e8le
  useEffect(() => {
    if (startedRef.current || !brief || selectedInspirations.length === 0) return;
    startedRef.current = true;

    const initialMaquettes: InstantMaquette[] = selectedInspirations.map((insp) => ({
      refUrl: insp.url,
      refDomain: (() => { try { return new URL(insp.url).hostname.replace("www.", ""); } catch { return "unknown"; } })(),
      refTitle: insp.title,
      refInspiration: {
        visualStyles: insp.visualStyles,
        colorScheme: insp.colorScheme,
        keyFeatures: insp.keyFeatures,
        description: insp.description,
      },
      status: "pending",
    }));
    setMaquettes(initialMaquettes);

    // Lancer toutes les g\u00e9n\u00e9rations en parall\u00e8le
    selectedInspirations.forEach((insp, idx) => {
      const domain = initialMaquettes[idx].refDomain;
      setMaquettes((prev) => prev.map((m, i) => i === idx ? { ...m, status: "generating" } : m));

      const effectiveBrand = brand || {
        palette: { primary: "#6366F1", secondary: "#8B5CF6", accent: "#F59E0B", background: "#FAFAFA", surface: "#FFFFFF", text: "#0F172A", textSecondary: "#64748B" },
        typography: { heading: "Inter", body: "Inter" },
        borderRadius: "12px",
      };

      const projectName = `${brief.project.name} \u00d7 ${domain.replace(/\..+$/, "")} \u2014 ${brief.project.sector.split(" ")[0]}`;
      const styles = (insp.visualStyles || []).slice(0, 3).join(", ");
      const features = (insp.keyFeatures || []).slice(0, 3).join(", ");

      const prompt = `${brief.project.name} \u2014 1 page ${brief.paul.device === "mobile" ? "mobile" : "desktop"}, inspir\u00e9e de ${insp.url} (${insp.title}).
Secteur : ${brief.project.sector}. Audience : ${brief.paul.audience.slice(0, 200)}.
Styles visuels de la r\u00e9f\u00e9rence : ${styles || "moderne"}. Color scheme : ${insp.colorScheme || "light"}.
Features inspirantes : ${features || brief.paul.priorities.slice(0, 3).join(", ")}.
Palette STRICT : primary ${effectiveBrand.palette.primary}, secondary ${effectiveBrand.palette.secondary}, accent ${effectiveBrand.palette.accent}, background ${effectiveBrand.palette.background}, text ${effectiveBrand.palette.text}.
Typography : heading ${effectiveBrand.typography.heading}, body ${effectiveBrand.typography.body}.
Mood : ${brief.paul.mood}.
Produis UNE page complete (hero + sections) qui reprend la structure layout de ${insp.url}.`;

      fetch("/api/pipeline/stitch-instant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: projectName.slice(0, 100),
          prompt: prompt.slice(0, 3800),
          device: brief.paul.device === "mobile" ? "MOBILE" : "DESKTOP",
        }),
        signal: AbortSignal.timeout(120_000),
      })
        .then((r) => r.json())
        .then((data) => {
          setMaquettes((prev) => prev.map((m, i) =>
            i === idx ? {
              ...m,
              projectId: data.projectId,
              projectName: data.projectName,
              screenId: data.screenId,
              imageUrl: data.imageUrl,
              stitchUrl: data.stitchUrl,
              promptUsed: prompt,
              status: data.imageUrl ? "ready" : "failed",
              error: data.error,
            } : m
          ));
        })
        .catch((err) => {
          setMaquettes((prev) => prev.map((m, i) =>
            i === idx ? { ...m, status: "failed", error: String(err).slice(0, 200) } : m
          ));
        });
    });
  }, [brief, brand, selectedInspirations]);

  const current = maquettes[activeTab];
  const readyCount = maquettes.filter((m) => m.status === "ready").length;

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-5 h-5 text-tunnel-7" />
          <h2 className="text-lg font-semibold">Maquettes Stitch instantan&eacute;es</h2>
          <Badge variant="accent">T7</Badge>
          <span className="text-xs text-text-muted">{readyCount}/{maquettes.length} g&eacute;n&eacute;r&eacute;es</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push(`/pipeline/${runId}/analysis`)}>
          <ArrowLeft className="w-3.5 h-3.5" /> Retour Analyse
        </Button>
      </div>

      <p className="text-sm text-text-muted mb-6">
        1 page g&eacute;n&eacute;r&eacute;e par inspiration, en direct via Stitch SDK. Clique entre les projets pour les comparer.
      </p>

      {/* Tabs projets */}
      {maquettes.length > 0 && (
        <div className="flex gap-1 border-b border-border mb-4 overflow-x-auto">
          {maquettes.map((m, i) => (
            <button
              key={m.refUrl}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px shrink-0 ${
                activeTab === i
                  ? "border-accent text-text-primary"
                  : "border-transparent text-text-muted hover:text-text-secondary"
              }`}
            >
              <span className="flex items-center gap-2">
                {m.refDomain}
                {m.status === "generating" && <Loader2 className="w-3 h-3 animate-spin text-accent" />}
                {m.status === "ready" && <span className="w-2 h-2 rounded-full bg-status-success" />}
                {m.status === "failed" && <span className="w-2 h-2 rounded-full bg-status-error" />}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Contenu du tab actif */}
      {current && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Maquette XXL (2/3) */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden p-0">
              {current.status === "generating" && (
                <div className="aspect-video bg-bg-surface flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                  <p className="text-sm text-text-secondary">G&eacute;n&eacute;ration Stitch SDK...</p>
                  <p className="text-xs text-text-muted">~60-90 secondes</p>
                </div>
              )}

              {current.status === "ready" && current.imageUrl && (
                <div>
                  <img
                    src={current.imageUrl}
                    alt={current.refDomain}
                    className="w-full"
                  />
                  <div className="p-3 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-accent" />
                      <p className="text-xs text-text-secondary">
                        G&eacute;n&eacute;r&eacute; par Stitch SDK &middot; Projet <code className="text-[10px]">{current.projectId}</code>
                      </p>
                    </div>
                    {current.stitchUrl && (
                      <a
                        href={current.stitchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent hover:underline flex items-center gap-1"
                      >
                        Ouvrir dans Stitch <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {current.status === "failed" && (
                <div className="aspect-video bg-bg-surface flex flex-col items-center justify-center gap-2 p-4">
                  <p className="text-sm text-status-error">Erreur de g&eacute;n&eacute;ration</p>
                  <p className="text-xs text-text-muted text-center">{current.error || "Inconnu"}</p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => { startedRef.current = false; setMaquettes([]); }}
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> R&eacute;essayer
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Panel infos inspiration (1/3) */}
          <div className="space-y-3">
            <Card>
              <div className="flex items-start gap-2 mb-3">
                <Badge variant="info">R&eacute;f&eacute;rence</Badge>
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">{current.refTitle}</h3>
              <a
                href={current.refUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:underline flex items-center gap-1 mb-3"
              >
                {current.refDomain} <ExternalLink className="w-3 h-3" />
              </a>

              {current.refInspiration.description && (
                <p className="text-xs text-text-secondary mb-3">{current.refInspiration.description.slice(0, 200)}</p>
              )}

              {current.refInspiration.visualStyles && current.refInspiration.visualStyles.length > 0 && (
                <div className="mb-2">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Styles visuels</p>
                  <div className="flex flex-wrap gap-1">
                    {current.refInspiration.visualStyles.map((s) => <Badge key={s} variant="accent">{s}</Badge>)}
                  </div>
                </div>
              )}

              {current.refInspiration.colorScheme && (
                <div className="mb-2">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Palette</p>
                  <Badge variant="info">{current.refInspiration.colorScheme}</Badge>
                </div>
              )}

              {current.refInspiration.keyFeatures && current.refInspiration.keyFeatures.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Features cl&eacute;s</p>
                  <ul className="space-y-1">
                    {current.refInspiration.keyFeatures.slice(0, 4).map((f, i) => (
                      <li key={i} className="text-xs text-text-secondary flex gap-1">
                        <span className="text-accent">&rarr;</span> <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            {current.promptUsed && (
              <Card>
                <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Prompt Stitch utilis&eacute;</p>
                <pre className="text-[10px] text-text-secondary whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                  {current.promptUsed.slice(0, 800)}
                </pre>
              </Card>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between pt-4 border-t border-border">
        <p className="text-xs text-text-muted">
          {readyCount > 0
            ? `${readyCount} maquette(s) pr\u00eate(s). Continue vers le code.`
            : "G\u00e9n\u00e9ration en cours..."}
        </p>
        <Button onClick={() => router.push(`/pipeline/${runId}/build`)}>
          Passer au code <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
