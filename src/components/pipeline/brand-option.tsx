"use client";

import type { BrandOption } from "@/types/pipeline";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  option: BrandOption;
  selected: boolean;
  onSelect: () => void;
}

const LABELS: Record<string, string> = {
  A: "Palette dominante",
  B: "Harmonisation",
  C: "Contraste compl\u00e9mentaire",
};

export function BrandOptionCard({ option, selected, onSelect }: Props) {
  const { palette, typography } = option;

  // Preview HTML rendu en direct avec la palette
  return (
    <Card selected={selected} hover onClick={onSelect} className="cursor-pointer overflow-hidden p-0">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <Badge variant={selected ? "accent" : "default"}>Option {option.option}</Badge>
          <p className="text-xs text-text-muted mt-1">{LABELS[option.option]}</p>
        </div>
        <input
          type="radio"
          checked={selected}
          onChange={onSelect}
          className="accent-accent w-4 h-4"
        />
      </div>

      {/* Preview rendu en CSS direct */}
      <div
        className="p-5"
        style={{
          background: palette.background,
          color: palette.text,
          fontFamily: typography.body,
        }}
      >
        <div
          className="mb-3"
          style={{
            fontFamily: typography.heading,
            fontSize: "1.5rem",
            fontWeight: 700,
            color: palette.text,
          }}
        >
          Aa Heading
        </div>
        <p style={{ color: palette.textSecondary, fontSize: "0.85rem", marginBottom: "1rem" }}>
          Body text sample avec la palette appliqu&eacute;e
        </p>
        <div className="flex gap-2 flex-wrap">
          <span
            style={{
              background: palette.primary,
              color: "#fff",
              padding: "6px 14px",
              borderRadius: option.borderRadius,
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            Primary
          </span>
          <span
            style={{
              background: palette.secondary,
              color: "#fff",
              padding: "6px 14px",
              borderRadius: option.borderRadius,
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            Secondary
          </span>
          <span
            style={{
              background: palette.accent,
              color: "#fff",
              padding: "6px 14px",
              borderRadius: option.borderRadius,
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            Accent
          </span>
        </div>

        <div
          className="mt-3 p-3 text-xs"
          style={{
            background: palette.surface,
            color: palette.text,
            borderRadius: option.borderRadius,
            border: `1px solid ${palette.textSecondary}22`,
          }}
        >
          Surface card — {typography.heading} / {typography.body}
        </div>
      </div>

      {/* Palette complete en bas */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-1">
          {Object.entries(palette).map(([key, val]) => (
            <div key={key} className="group relative flex-1" title={`${key}: ${val}`}>
              <div className="h-6 rounded" style={{ background: val }} />
              <span className="hidden group-hover:block absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono bg-bg-surface px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                {val}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
