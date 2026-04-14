"use client";

import type { BrandOption } from "@/types/pipeline";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  option: BrandOption;
  selected: boolean;
  onSelect: () => void;
}

export function BrandOptionCard({ option, selected, onSelect }: Props) {
  const { palette, typography } = option;

  return (
    <Card selected={selected} hover onClick={onSelect} className="cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <Badge variant={selected ? "accent" : "default"}>Option {option.option}</Badge>
        <input
          type="radio"
          checked={selected}
          onChange={onSelect}
          className="accent-accent w-4 h-4"
        />
      </div>

      {/* Preview image */}
      {option.imageUrl && (
        <div className="mb-3 rounded-lg overflow-hidden bg-bg-surface aspect-video">
          <img src={option.imageUrl} alt={`Option ${option.option}`} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Palette */}
      <div className="mb-3">
        <span className="text-[10px] text-text-muted uppercase tracking-wider">Palette</span>
        <div className="flex gap-1 mt-1">
          {Object.entries(palette).map(([key, val]) => (
            <div key={key} className="group relative flex-1">
              <div className="h-8 rounded" style={{ background: val }} title={`${key}: ${val}`} />
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-mono text-text-muted opacity-0 group-hover:opacity-100 whitespace-nowrap">
                {val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Typo */}
      <div className="mt-5">
        <span className="text-[10px] text-text-muted uppercase tracking-wider">Typographie</span>
        <div className="mt-1 space-y-1">
          <p className="text-sm" style={{ fontFamily: typography.heading, color: palette.text }}>
            <strong>Heading:</strong> {typography.heading}
          </p>
          <p className="text-xs" style={{ fontFamily: typography.body, color: palette.textSecondary }}>
            Body: {typography.body}
          </p>
        </div>
      </div>
    </Card>
  );
}
