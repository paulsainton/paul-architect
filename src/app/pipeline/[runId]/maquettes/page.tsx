"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowRight, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { MaquetteComparison } from "@/components/pipeline/maquette-comparison";
import { PreviewModal } from "@/components/pipeline/preview-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePipelineStore } from "@/stores/pipeline-store";

interface MaquetteState {
  refUrl: string;
  refDomain: string;
  maquetteImage?: string;
  stitchProjectId?: string;
  stitchDashboardUrl?: string;
  message?: string;
  status: "generating" | "ready" | "approved" | "rejected" | "fallback";
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

  const [maquettes, setMaquettes] = useState<MaquetteState[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const startedRef = useRef(false);

  // HYDRATATION : rattraper brief, brand, inspirations si store vide (reload direct)
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

  useEffect(() => {
    // Besoin minimal : brief + au moins 1 inspiration. Brand optionnel (fallback default).
    if (startedRef.current || loading || done || !brief || selectedInspirations.length === 0) return;
    startedRef.current = true;
    setLoading(true);

    setMaquettes(
      selectedInspirations.map((insp) => ({
        refUrl: insp.url,
        refDomain: (() => { try { return new URL(insp.url).hostname.replace("www.", ""); } catch { return "unknown"; } })(),
        status: "generating" as const,
      }))
    );

    const effectiveBrand = brand || {
      selectedOption: "A" as const,
      palette: { primary: "#6366F1", secondary: "#8B5CF6", accent: "#F59E0B", background: "#FAFAFA", surface: "#FFFFFF", text: "#0F172A", textSecondary: "#64748B" },
      typography: { heading: "Inter", body: "Inter" },
      borderRadius: "12px",
      source: "stitch-sdk" as const,
      validatedAt: new Date().toISOString(),
    };

    fetch("/api/pipeline/stitch-maquettes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId, inspirations: selectedInspirations, brief, brand: effectiveBrand }),
    })
      .then((r) => r.json())
      .then((data) => {
        setMaquettes((prev) =>
          prev.map((m) => {
            const result = data.find((d: { refUrl: string }) => d.refUrl === m.refUrl);
            if (result) {
              return {
                ...m,
                maquetteImage: result.imageUrl,
                stitchProjectId: result.stitchProjectId,
                stitchDashboardUrl: result.stitchDashboardUrl,
                message: result.message,
                status: result.status === "success" ? "ready" as const : "fallback" as const,
              };
            }
            return { ...m, status: "fallback" as const };
          })
        );
        setDone(true);
      })
      .catch((err) => console.error("[maquettes] error:", err))
      .finally(() => setLoading(false));
  }, [brief, brand, selectedInspirations, runId, loading, done]);

  const approved = maquettes.filter((m) => m.status === "approved").length;
  const total = maquettes.length;

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-5 h-5 text-tunnel-7" />
          <h2 className="text-lg font-semibold">Maquettes Stitch</h2>
          <Badge variant="accent">T7</Badge>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push(`/pipeline/${runId}/analysis`)}>
          <ArrowLeft className="w-3.5 h-3.5" /> Retour Analyse
        </Button>
      </div>

      <p className="text-sm text-text-muted mb-6">
        1 maquette par inspiration, g&eacute;n&eacute;r&eacute;e par Stitch SDK et inspir&eacute;e &agrave; 100% de sa source.
      </p>

      {maquettes.map((m) => (
        <MaquetteComparison
          key={m.refUrl}
          refUrl={m.refUrl}
          refDomain={m.refDomain}
          maquetteImage={m.maquetteImage}
          stitchDashboardUrl={m.stitchDashboardUrl}
          message={m.message}
          status={m.status}
          onApprove={() =>
            setMaquettes((prev) => prev.map((x) => x.refUrl === m.refUrl ? { ...x, status: "approved" as const } : x))
          }
          onReject={() =>
            setMaquettes((prev) => prev.map((x) => x.refUrl === m.refUrl ? { ...x, status: "rejected" as const } : x))
          }
          onZoom={setPreviewUrl}
        />
      ))}

      <PreviewModal imageUrl={previewUrl} onClose={() => setPreviewUrl(null)} />

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
        <p className="text-sm text-text-secondary">
          {done ? `${approved}/${total} maquettes approuv\u00e9es` : "G\u00e9n\u00e9ration en cours en arri\u00e8re-plan"}
        </p>
        <Button onClick={() => router.push(`/pipeline/${runId}/build`)}>
          Passer au code <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
