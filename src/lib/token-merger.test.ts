import { describe, it, expect } from "vitest";
import { mergeTokens } from "./token-merger";
import type { ExtractionResult } from "@/types/pipeline";

describe("mergeTokens", () => {
  it("merge les couleurs et incr\u00e9mente la fr\u00e9quence", () => {
    const extractions: ExtractionResult[] = [
      {
        url: "https://a.com", domain: "a.com", status: "complete", screenshots: {},
        tokens: {
          colors: [{ hex: "#FF0000", frequency: 2, source: "a.com" }],
          fonts: [], spacing: [], shadows: [], borderRadius: [],
        },
      },
      {
        url: "https://b.com", domain: "b.com", status: "complete", screenshots: {},
        tokens: {
          colors: [{ hex: "#FF0000", frequency: 3, source: "b.com" }, { hex: "#00FF00", frequency: 1, source: "b.com" }],
          fonts: [], spacing: [], shadows: [], borderRadius: [],
        },
      },
    ];
    const merged = mergeTokens(extractions);
    expect(merged.colors[0].hex).toBe("#FF0000");
    expect(merged.colors[0].frequency).toBe(5); // 2 + 3
    expect(merged.colors[1].hex).toBe("#00FF00");
  });

  it("skip les extractions failed", () => {
    const extractions: ExtractionResult[] = [
      {
        url: "https://fail.com", domain: "fail.com", status: "failed", screenshots: {},
        tokens: { colors: [{ hex: "#FF0000", frequency: 100, source: "fail" }], fonts: [], spacing: [], shadows: [], borderRadius: [] },
      },
    ];
    const merged = mergeTokens(extractions);
    expect(merged.colors.length).toBe(0);
  });

  it("cap le r\u00e9sultat \u00e0 20 couleurs", () => {
    const manyColors = Array.from({ length: 30 }, (_, i) => ({
      hex: `#${i.toString(16).padStart(6, "0")}`,
      frequency: 30 - i,
      source: "test",
    }));
    const merged = mergeTokens([
      {
        url: "x", domain: "x", status: "complete", screenshots: {},
        tokens: { colors: manyColors, fonts: [], spacing: [], shadows: [], borderRadius: [] },
      },
    ]);
    expect(merged.colors.length).toBe(20);
  });

  it("merge les fonts par fr\u00e9quence", () => {
    const extractions: ExtractionResult[] = [
      {
        url: "a", domain: "a", status: "complete", screenshots: {},
        tokens: {
          colors: [],
          fonts: [{ family: "Inter", count: 2 }, { family: "Roboto", count: 1 }],
          spacing: [], shadows: [], borderRadius: [],
        },
      },
      {
        url: "b", domain: "b", status: "complete", screenshots: {},
        tokens: {
          colors: [],
          fonts: [{ family: "Inter", count: 3 }],
          spacing: [], shadows: [], borderRadius: [],
        },
      },
    ];
    const merged = mergeTokens(extractions);
    expect(merged.fonts[0].family).toBe("Inter");
    expect(merged.fonts[0].count).toBe(5);
  });
});
