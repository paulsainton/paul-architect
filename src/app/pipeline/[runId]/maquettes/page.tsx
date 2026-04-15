"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowRight, Image as ImageIcon } from "lucide-react";
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
  status: "generating" | "ready" | "approved" | "rejected" | "fallback";
}

export default function MaquettesPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.runId as string;
  const brief = usePipelineStore((s) => s.brief);
  const brand = usePipelineStore((s) => s.brand);
  const selectedInspirations = usePipelineStore((s) => s.selectedInspirations);

  const [maquettes, setMaquettes] = useState<MaquetteState[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current || loading || done || !brief || !brand || selectedInspirations.length === 0) return;
    startedRef.current = true;
    setLoading(true);

    // Init state
    setMaquettes(
      selectedInspirations.map((insp) => ({
        refUrl: insp.url,
        refDomain: (() => { try { return new URL(insp.url).hostname.replace("www.", ""); } catch { return "unknown"; } })(),
        status: "generating" as const,
      }))
    );

    fetch("/api/pipeline/stitch-maquettes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId, inspirations: selectedInspirations, brief, brand }),
    })
      .then((r) => r.json())
      .then((data) => {
        setMaquettes((prev) =>
          prev.map((m) => {
            const result = data.find((d: { refUrl: string }) => d.refUrl === m.refUrl);
            if (result) {
              return { ...m, maquetteImage: result.imageUrl, stitchProjectId: result.stitchProjectId,
                status: result.status === "success" ? "ready" as const : "fallback" as const };
            }
            return { ...m, status: "fallback" as const };
          })
        );
        setDone(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [brief, brand, selectedInspirations, runId, loading, done]);

  const approved = maquettes.filter((m) => m.status === "approved").length;
  const total = maquettes.length;

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ImageIcon className="w-5 h-5 text-tunnel-7" />
        <h2 className="text-lg font-semibold">Maquettes Stitch</h2>
        <Badge variant="accent">T7</Badge>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
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

      {done && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-text-secondary">
            {approved}/{total} maquettes approuv&eacute;es
          </p>
          <Button onClick={() => router.push(`/pipeline/${runId}/build`)}>
            Passer au code <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
