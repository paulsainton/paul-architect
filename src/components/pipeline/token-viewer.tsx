"use client";

import type { MergedTokens } from "@/types/pipeline";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  tokens: MergedTokens;
}

export function TokenViewer({ tokens }: Props) {
  return (
    <div className="space-y-6">
      {/* Couleurs */}
      {tokens.colors.length > 0 && (
        <Card>
          <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">Palette consolid&eacute;e</h4>
          <div className="flex flex-wrap gap-2">
            {tokens.colors.slice(0, 12).map((c, i) => (
              <div key={i} className="group relative">
                <div
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                  style={{ background: c.hex }}
                  title={`${c.hex} (${c.frequency}x)`}
                />
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-text-muted opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {c.hex}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Fonts */}
      {tokens.fonts.length > 0 && (
        <Card>
          <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">Typographie</h4>
          <div className="space-y-2">
            {tokens.fonts.map((f, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-text-primary" style={{ fontFamily: f.family }}>
                  {f.family}
                </span>
                <Badge>{f.count}x</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Spacing */}
      {tokens.spacing.length > 0 && (
        <Card>
          <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">Spacing</h4>
          <div className="flex flex-wrap gap-2">
            {tokens.spacing.map((s, i) => (
              <Badge key={i}>{s.value} ({s.count}x)</Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Shadows + Border Radius */}
      {(tokens.shadows.length > 0 || tokens.borderRadius.length > 0) && (
        <Card>
          <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">Effets</h4>
          {tokens.shadows.length > 0 && (
            <div className="mb-3">
              <span className="text-xs text-text-muted">Shadows</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {tokens.shadows.map((s, i) => (
                  <div key={i} className="w-16 h-16 rounded-lg bg-bg-card" style={{ boxShadow: s }} title={s} />
                ))}
              </div>
            </div>
          )}
          {tokens.borderRadius.length > 0 && (
            <div>
              <span className="text-xs text-text-muted">Border Radius</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {tokens.borderRadius.map((r, i) => (
                  <Badge key={i}>{r}</Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
