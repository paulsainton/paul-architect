"use client";

import type { QAScore } from "@/types/pipeline";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface Props {
  score: QAScore;
}

const CATEGORIES: { key: keyof Pick<QAScore, "codeQuality" | "technicalRobustness" | "visualFidelity" | "completeness">; label: string; color: string }[] = [
  { key: "codeQuality", label: "Qualit\u00e9 code", color: "bg-tunnel-6" },
  { key: "technicalRobustness", label: "Robustesse technique", color: "bg-tunnel-3" },
  { key: "visualFidelity", label: "Fid\u00e9lit\u00e9 visuelle", color: "bg-tunnel-7" },
  { key: "completeness", label: "Compl\u00e9tude", color: "bg-tunnel-1" },
];

export function ScoreCard({ score }: Props) {
  const isPassing = score.verdict === "PASS";

  return (
    <div className="space-y-4">
      {/* Score principal */}
      <Card className="text-center py-8">
        <div className={`text-6xl font-bold mb-2 ${isPassing ? "text-status-success" : "text-status-error"}`}>
          {score.total}
        </div>
        <p className="text-sm text-text-muted">/100</p>
        <Badge variant={isPassing ? "success" : "error"} className="mt-3 text-sm px-4 py-1">
          {isPassing ? (
            <><CheckCircle className="w-4 h-4 mr-1" /> PASS</>
          ) : (
            <><XCircle className="w-4 h-4 mr-1" /> FAIL</>
          )}
        </Badge>
      </Card>

      {/* Breakdown */}
      <Card>
        <h3 className="text-sm font-semibold mb-4">D&eacute;tail des scores</h3>
        <div className="space-y-3">
          {CATEGORIES.map((cat) => (
            <ProgressBar
              key={cat.key}
              value={score[cat.key]}
              max={25}
              color={cat.color}
              label={`${cat.label} (${score[cat.key]}/25)`}
            />
          ))}
        </div>
      </Card>

      {/* Issues */}
      {score.issues.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold mb-3">Probl&egrave;mes d&eacute;tect&eacute;s</h3>
          <div className="space-y-2">
            {score.issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                {issue.severity === "critical" && <XCircle className="w-3.5 h-3.5 text-status-error shrink-0 mt-0.5" />}
                {issue.severity === "warning" && <AlertTriangle className="w-3.5 h-3.5 text-status-warning shrink-0 mt-0.5" />}
                {issue.severity === "info" && <CheckCircle className="w-3.5 h-3.5 text-status-info shrink-0 mt-0.5" />}
                <div>
                  <span className="text-text-primary">{issue.message}</span>
                  {issue.file && (
                    <span className="text-text-muted ml-1">{issue.file}{issue.line ? `:${issue.line}` : ""}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
