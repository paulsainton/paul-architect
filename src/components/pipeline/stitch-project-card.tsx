"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Image as ImageIcon, Loader2, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STITCH_URL = "https://stitch.ps-tools.dev";

interface Screen {
  id: string;
  name?: string;
  imageUrl?: string;
  previewUrl?: string;
  html?: string;
  validated?: boolean;
}

interface StitchProject {
  slug: string;
  name: string;
  type?: string;
  sector?: string;
  pipelineState?: {
    currentStep?: string;
    steps?: Array<{ id: string; label: string; status: string }>;
  };
}

interface StitchData {
  project: StitchProject;
  maquettes?: {
    screens?: Screen[];
  };
}

interface Props {
  slug: string;
  stitchRunId?: string;
  refDomain: string;
  onScreensLoaded?: (screens: Screen[]) => void;
}

export function StitchProjectCard({ slug, stitchRunId, refDomain, onScreensLoaded }: Props) {
  const [data, setData] = useState<StitchData | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/stitch/projects/${slug}`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
        if (onScreensLoaded) onScreensLoaded(d?.maquettes?.screens || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // Auto-refresh toutes les 10s si pas encore de screens
    const t = setInterval(() => {
      if (!data?.maquettes?.screens?.length) load();
    }, 10_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const screens = data?.maquettes?.screens || [];
  const currentStep = data?.project?.pipelineState?.currentStep;
  const steps = data?.project?.pipelineState?.steps || [];
  const dashboardUrl = `${STITCH_URL}/project/${slug}${stitchRunId ? `?run=${stitchRunId}` : ""}`;

  return (
    <Card className="mb-3">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-tunnel-7/20 flex items-center justify-center shrink-0">
          <ImageIcon className="w-4 h-4 text-tunnel-7" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{data?.project?.name || slug}</p>
          <p className="text-xs text-text-muted">Inspir&eacute; de <strong>{refDomain}</strong></p>
        </div>
        <Button size="sm" variant="ghost" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
        </Button>
        <a
          href={dashboardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent hover:underline flex items-center gap-1"
        >
          Stitch <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Pipeline steps status */}
      {steps.length > 0 && (
        <div className="flex gap-1 mb-3">
          {steps.map((step) => {
            const isActive = step.status === "active" || step.id === currentStep;
            const isDone = step.status === "completed" || step.status === "done";
            return (
              <div
                key={step.id}
                className={`flex-1 h-1.5 rounded-full ${
                  isDone ? "bg-status-success" : isActive ? "bg-accent animate-pulse" : "bg-bg-card"
                }`}
                title={`${step.label}: ${step.status}`}
              />
            );
          })}
        </div>
      )}

      {/* Screens grid */}
      {screens.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {screens.slice(0, 6).map((screen) => (
            <a
              key={screen.id}
              href={`${STITCH_URL}/project/${slug}/screens/${screen.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-lg overflow-hidden bg-bg-surface aspect-video border border-border hover:border-border-hover"
            >
              {screen.imageUrl || screen.previewUrl ? (
                <img
                  src={screen.imageUrl || screen.previewUrl}
                  alt={screen.name || screen.id}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
                </div>
              )}
              {screen.validated && (
                <CheckCircle className="absolute top-1 right-1 w-3.5 h-3.5 text-status-success bg-black/80 rounded-full" />
              )}
            </a>
          ))}
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-bg-surface text-xs text-text-muted text-center">
          {currentStep ? `\u23f3 Pipeline Stitch en cours : ${currentStep}` : "En attente des premiers screens Stitch..."}
          <div className="mt-2">
            <a href={dashboardUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              Ouvrir dans Stitch pour continuer &rarr;
            </a>
          </div>
        </div>
      )}

      {screens.length > 6 && (
        <p className="mt-2 text-[11px] text-text-muted text-right">
          +{screens.length - 6} autres screens \u2014{" "}
          <a href={dashboardUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            voir tout
          </a>
        </p>
      )}
    </Card>
  );
}
