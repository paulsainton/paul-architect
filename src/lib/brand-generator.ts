import type { BrandOption, MergedTokens, Brief, BrandPalette } from "@/types/pipeline";

/**
 * G\u00e9n\u00e8re 3 propositions de brand LOCALEMENT depuis les tokens extraits.
 * Preview HTML rendu c\u00f4t\u00e9 frontend — rapide, sans co\u00fbt, 100% fiable.
 * Respecte R16 : pas de g\u00e9n\u00e9ration de design, juste combinaison de tokens extraits.
 */

function darken(hex: string, amount = 0.2): string {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return hex;
  const num = parseInt(m[1], 16);
  const r = Math.max(0, Math.floor(((num >> 16) & 0xff) * (1 - amount)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.floor((num & 0xff) * (1 - amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0").toUpperCase()}`;
}

function lighten(hex: string, amount = 0.2): string {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return hex;
  const num = parseInt(m[1], 16);
  const r = Math.min(255, Math.floor(((num >> 16) & 0xff) + 255 * amount));
  const g = Math.min(255, Math.floor(((num >> 8) & 0xff) + 255 * amount));
  const b = Math.min(255, Math.floor((num & 0xff) + 255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0").toUpperCase()}`;
}

function complementary(hex: string): string {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return hex;
  const num = parseInt(m[1], 16);
  const r = 255 - ((num >> 16) & 0xff);
  const g = 255 - ((num >> 8) & 0xff);
  const b = 255 - (num & 0xff);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0").toUpperCase()}`;
}

function luminance(hex: string): number {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return 0.5;
  const num = parseInt(m[1], 16);
  const r = ((num >> 16) & 0xff) / 255;
  const g = ((num >> 8) & 0xff) / 255;
  const b = (num & 0xff) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function isDark(hex: string): boolean {
  return luminance(hex) < 0.5;
}

function ensureValidHex(hex: string | undefined, fallback: string): string {
  if (!hex) return fallback;
  const clean = hex.startsWith("#") ? hex : `#${hex}`;
  return /^#[0-9a-f]{6}$/i.test(clean) ? clean.toUpperCase() : fallback;
}

function buildPaletteA(colors: string[], isDarkMood: boolean): BrandPalette {
  // Option A : palette dominante (les couleurs les plus fr\u00e9quentes)
  const primary = ensureValidHex(colors[0], "#6366F1");
  const secondary = ensureValidHex(colors[1], darken(primary, 0.15));
  const accent = ensureValidHex(colors[2], lighten(primary, 0.25));
  const background = isDarkMood ? "#08090E" : "#FEFAE0";
  const surface = isDarkMood ? "#10121A" : "#FFFFFF";
  const text = isDarkMood ? "#F0F0F5" : "#1A1A1A";
  const textSecondary = isDarkMood ? "#8B8B9E" : "#5A5A5A";
  return { primary, secondary, accent, background, surface, text, textSecondary };
}

function buildPaletteB(colors: string[], isDarkMood: boolean): BrandPalette {
  // Option B : harmonisation des 3 couleurs les plus fr\u00e9quentes
  const primary = ensureValidHex(colors[0], "#6366F1");
  const secondary = ensureValidHex(colors[1], lighten(primary, 0.15));
  const accent = ensureValidHex(colors[3] || colors[2], "#F59E0B");
  const background = isDarkMood ? darken(primary, 0.85) : lighten(primary, 0.95);
  const surface = isDarkMood ? darken(primary, 0.75) : "#FFFFFF";
  const text = isDarkMood ? "#F5F5F7" : darken(primary, 0.7);
  const textSecondary = isDarkMood ? "#9CA3AF" : "#6B7280";
  return { primary, secondary, accent, background, surface, text, textSecondary };
}

function buildPaletteC(colors: string[], isDarkMood: boolean): BrandPalette {
  // Option C : contraste — compl\u00e9mentaire
  const base = ensureValidHex(colors[0], "#6366F1");
  const primary = complementary(base);
  const secondary = ensureValidHex(colors[1], base);
  const accent = ensureValidHex(colors[2], "#FF6B35");
  const background = isDarkMood ? "#0A0A0F" : "#FAFAFA";
  const surface = isDarkMood ? "#141420" : "#F5F5F7";
  const text = isDarkMood ? "#FFFFFF" : "#0F0F14";
  const textSecondary = isDarkMood ? "#A0A0B8" : "#4A4A5A";
  return { primary, secondary, accent, background, surface, text, textSecondary };
}

function chooseFonts(fonts: string[], brief: Brief): { heading: string; body: string } {
  // Filtrer les fonts valides
  const valid = fonts.filter((f) => f && f.length > 1 && !/serif|sans-serif|monospace|inherit/i.test(f.trim()));
  const mood = brief.paul.mood?.toLowerCase() || "";

  const headingCandidates = valid.length > 0 ? valid : ["Inter"];
  const bodyCandidates = valid.length > 1 ? valid.slice(1) : valid.length > 0 ? valid : ["Inter"];

  // Si mood "\u00e9l\u00e9gant" ou "chaleureux" → privil\u00e9gier une serif heading
  let heading = headingCandidates[0];
  if (/\u00e9l\u00e9gant|chaleureux|premium|luxe/i.test(mood)) {
    const serif = valid.find((f) => /serif|playfair|lora|georgia|merriweather/i.test(f));
    if (serif) heading = serif;
  }

  return {
    heading: heading.replace(/["']/g, "").trim() || "Inter",
    body: bodyCandidates[0].replace(/["']/g, "").trim() || "Inter",
  };
}

export async function generateBrandOptions(
  tokens: MergedTokens,
  brief: Brief,
  onProgress: (option: string, status: string, data?: Record<string, unknown>) => void
): Promise<BrandOption[]> {
  const dominantColors = tokens.colors.slice(0, 8).map((c) => c.hex);
  const dominantFonts = tokens.fonts.slice(0, 5).map((f) => f.family);
  const mood = brief.paul.mood?.toLowerCase() || "";
  const isDarkMood = /dark|sombre|noir|tech|cyberpunk|minimaliste/i.test(mood);
  const typography = chooseFonts(dominantFonts, brief);

  onProgress("setup", "analyzing-tokens", {
    colorsFound: dominantColors.length,
    fontsFound: dominantFonts.length,
    detectedMood: isDarkMood ? "dark" : "light",
  });
  await new Promise((r) => setTimeout(r, 400));

  const options: BrandOption[] = [];
  const builders: { option: "A" | "B" | "C"; label: string; build: () => BrandPalette }[] = [
    { option: "A", label: "Palette dominante", build: () => buildPaletteA(dominantColors, isDarkMood) },
    { option: "B", label: "Harmonisation", build: () => buildPaletteB(dominantColors, isDarkMood) },
    { option: "C", label: "Contraste", build: () => buildPaletteC(dominantColors, isDarkMood) },
  ];

  for (const b of builders) {
    onProgress(b.option, "generating", { label: b.label });
    await new Promise((r) => setTimeout(r, 600));

    const palette = b.build();
    const borderRadius = tokens.borderRadius[0] || "12px";

    options.push({
      option: b.option,
      palette,
      typography,
      borderRadius,
      // Pas d'imageUrl — le preview se fait en HTML/CSS c\u00f4t\u00e9 client
    });

    onProgress(b.option, "ready", { palette, typography });
  }

  return options;
}
