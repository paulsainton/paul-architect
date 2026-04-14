"use client";

import { CheckCircle, XCircle, Loader2, Globe } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress";

export interface ExtractionStep {
  url: string;
  domain: string;
  status: "queued" | "running" | "complete" | "partial" | "failed";
  step?: string;
  percent: number;
  colorsCount?: number;
  fontsCount?: number;
  desktopScreenshot?: string;
  mobileScreenshot?: string;
}

interface Props {
  steps: ExtractionStep[];
}

export function ExtractionTimeline({ steps }: Props) {
  return (
    <div className="space-y-3">
      {steps.map((s) => (
        <div key={s.url} className="flex items-start gap-3 p-3 rounded-lg bg-bg-surface border border-border">
          <div className="mt-0.5">
            {s.status === "running" && <Loader2 className="w-4 h-4 text-accent animate-spin" />}
            {s.status === "complete" && <CheckCircle className="w-4 h-4 text-status-success" />}
            {s.status === "partial" && <CheckCircle className="w-4 h-4 text-status-warning" />}
            {s.status === "failed" && <XCircle className="w-4 h-4 text-status-error" />}
            {s.status === "queued" && <Globe className="w-4 h-4 text-text-muted" />}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{s.domain}</p>
            <p className="text-xs text-text-muted truncate">{s.url}</p>

            {s.status === "running" && (
              <div className="mt-2">
                <ProgressBar value={s.percent} label={s.step} />
              </div>
            )}

            {(s.status === "complete" || s.status === "partial") && (
              <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                {s.colorsCount !== undefined && <span>{s.colorsCount} couleurs</span>}
                {s.fontsCount !== undefined && <span>{s.fontsCount} fonts</span>}
              </div>
            )}

            {(s.desktopScreenshot || s.mobileScreenshot) && (
              <div className="flex gap-2 mt-2">
                {s.desktopScreenshot && (
                  <img src={s.desktopScreenshot} alt="Desktop" className="h-20 rounded border border-border object-cover" />
                )}
                {s.mobileScreenshot && (
                  <img src={s.mobileScreenshot} alt="Mobile" className="h-20 rounded border border-border object-cover" />
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
