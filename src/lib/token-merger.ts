import type { MergedTokens, ExtractionResult } from "@/types/pipeline";

export function mergeTokens(extractions: ExtractionResult[]): MergedTokens {
  const colorMap = new Map<string, { frequency: number; source: string }>();
  const fontMap = new Map<string, number>();
  const spacingMap = new Map<string, number>();
  const shadowSet = new Set<string>();
  const radiusSet = new Set<string>();

  for (const ext of extractions) {
    if (ext.status === "failed") continue;

    for (const c of ext.tokens.colors) {
      const existing = colorMap.get(c.hex);
      if (existing) {
        existing.frequency += c.frequency;
      } else {
        colorMap.set(c.hex, { frequency: c.frequency, source: c.source });
      }
    }

    for (const f of ext.tokens.fonts) {
      fontMap.set(f.family, (fontMap.get(f.family) || 0) + f.count);
    }

    for (const s of ext.tokens.spacing) {
      spacingMap.set(s.value, (spacingMap.get(s.value) || 0) + s.count);
    }

    for (const s of ext.tokens.shadows) shadowSet.add(s);
    for (const r of ext.tokens.borderRadius) radiusSet.add(r);
  }

  return {
    colors: Array.from(colorMap.entries())
      .map(([hex, { frequency, source }]) => ({ hex, frequency, source }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20),
    fonts: Array.from(fontMap.entries())
      .map(([family, count]) => ({ family, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
    spacing: Array.from(spacingMap.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    shadows: Array.from(shadowSet).slice(0, 4),
    borderRadius: Array.from(radiusSet).slice(0, 4),
  };
}
