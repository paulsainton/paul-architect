"use client";

import { CheckCircle, XCircle, Loader2, Code, AlertTriangle } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface PageBuildState {
  page: string;
  status: "pending" | "generating" | "compiled" | "failed" | "validated" | "revising";
  percent: number;
  step?: string;
  filesChanged?: string[];
  linesAdded?: number;
  errors?: string[];
  reviewScore?: number;
  reviewIssues?: string[];
  screenshotUrl?: string;
}

interface Props {
  pages: PageBuildState[];
  onApprove: (page: string) => void;
  onRevise: (page: string) => void;
}

export function BuildTimeline({ pages, onApprove, onRevise }: Props) {
  return (
    <div className="space-y-3">
      {pages.map((p) => (
        <Card key={p.page}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {p.status === "generating" && <Loader2 className="w-4 h-4 text-accent animate-spin" />}
              {p.status === "compiled" && <Code className="w-4 h-4 text-status-info" />}
              {p.status === "validated" && <CheckCircle className="w-4 h-4 text-status-success" />}
              {p.status === "failed" && <XCircle className="w-4 h-4 text-status-error" />}
              {p.status === "pending" && <Code className="w-4 h-4 text-text-muted" />}
              {p.status === "revising" && <Loader2 className="w-4 h-4 text-status-warning animate-spin" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-medium text-text-primary">{p.page}</h4>
                {p.status === "validated" && <Badge variant="success">Valid&eacute;</Badge>}
                {p.status === "failed" && <Badge variant="error">&Eacute;chec</Badge>}
              </div>

              {p.status === "generating" && (
                <ProgressBar value={p.percent} label={p.step} className="mt-2" />
              )}

              {p.filesChanged && p.filesChanged.length > 0 && (
                <div className="mt-2 text-xs text-text-muted">
                  {p.filesChanged.map((f) => (
                    <code key={f} className="block font-mono">{f}</code>
                  ))}
                  {p.linesAdded ? <span className="text-status-success">+{p.linesAdded} lignes</span> : null}
                </div>
              )}

              {p.errors && p.errors.length > 0 && (
                <div className="mt-2 space-y-1">
                  {p.errors.map((err, i) => (
                    <p key={i} className="text-xs text-status-error flex items-start gap-1">
                      <XCircle className="w-3 h-3 mt-0.5 shrink-0" /> {err}
                    </p>
                  ))}
                </div>
              )}

              {p.reviewIssues && p.reviewIssues.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.reviewIssues.map((issue, i) => (
                    <Badge key={i} variant="warning">
                      <AlertTriangle className="w-3 h-3 mr-1" />{issue}
                    </Badge>
                  ))}
                </div>
              )}

              {p.screenshotUrl && (
                <img src={p.screenshotUrl} alt={p.page} className="mt-2 h-32 rounded-lg border border-border object-cover" />
              )}

              {p.status === "compiled" && (
                <div className="flex items-center gap-2 mt-3">
                  <Button size="sm" onClick={() => onApprove(p.page)}>
                    <CheckCircle className="w-3.5 h-3.5" /> Approuver
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => onRevise(p.page)}>
                    Retoucher
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
