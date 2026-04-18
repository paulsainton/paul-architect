import type { BrandOption, MergedTokens, Brief, BrandPalette } from "@/types/pipeline";

/**
 * G\u00e9n\u00e8re 3 propositions de brand LOCALEMENT depuis les tokens extraits.
 * Preview HTML rendu c\u00f4t\u00e9 frontend — rapide, sans co\u00fbt, 100% fiable.
 * Respecte R16 : pas de g\u00e9n\u00e9ration de design, juste combinaison de tokens extraits.
 */

// ========================================
// PALETTES SECTORIELLES (fallback qualitatif si clone fail)
// ========================================
const SECTORAL_PALETTES: Record<string, string[]> = {
  // Productivité (LifeOS, Notion-like)
  productivity: ["#4F46E5", "#7C3AED", "#06B6D4", "#FDE68A", "#F9FAFB", "#111827", "#6B7280"],
  // Cuisine / food (warm, appétissant)
  food: ["#E63946", "#F4A261", "#2D6A4F", "#FFF3E0", "#FEF6E4", "#1A1A1A", "#6B4423"],
  // Nutrition / santé (green fresh)
  health: ["#10B981", "#34D399", "#FBBF24", "#ECFDF5", "#FFFFFF", "#064E3B", "#6B7280"],
  // Trading / crypto (tech dark)
  finance: ["#F59E0B", "#10B981", "#EF4444", "#0A0E1A", "#131A2B", "#F5F5F7", "#9CA3AF"],
  // Marketing / AdTech (bold)
  marketing: ["#EC4899", "#8B5CF6", "#F59E0B", "#FFFBFF", "#FFFFFF", "#1F2937", "#6B7280"],
  // E-commerce (clean)
  ecommerce: ["#111827", "#EF4444", "#F59E0B", "#FAFAFA", "#FFFFFF", "#0F172A", "#64748B"],
  // Sneakers (urban bold)
  sneakers: ["#FF6B35", "#F7B801", "#2E294E", "#F7F7F7", "#FFFFFF", "#0D0C0A", "#525252"],
  // Agence (premium minimal)
  agency: ["#000000", "#FFFFFF", "#FF3D00", "#FAFAFA", "#F5F5F5", "#0A0A0A", "#737373"],
  // CRM (pro bleu)
  crm: ["#2563EB", "#7C3AED", "#F59E0B", "#F8FAFC", "#FFFFFF", "#0F172A", "#64748B"],
  // Freelance (rassurant)
  freelance: ["#0891B2", "#10B981", "#F59E0B", "#F0FDFA", "#FFFFFF", "#134E4A", "#64748B"],
  // Portfolio (editorial)
  portfolio: ["#18181B", "#F59E0B", "#3B82F6", "#FAFAFA", "#FFFFFF", "#09090B", "#71717A"],
  // Design tools (creative)
  design: ["#8B5CF6", "#EC4899", "#06B6D4", "#FAFAFA", "#FFFFFF", "#09090B", "#71717A"],
  // Default (moderne generic)
  default: ["#6366F1", "#8B5CF6", "#EC4899", "#F8FAFC", "#FFFFFF", "#0F172A", "#64748B"],
};

function getSectoralPalette(sector: string): string[] {
  const s = sector.toLowerCase();
  if (/productivit|life.?os|habit|task/.test(s)) return SECTORAL_PALETTES.productivity;
  if (/cuisine|food|recette|meal/.test(s)) return SECTORAL_PALETTES.food;
  if (/nutrition|di\u00e9t|health|fitness/.test(s)) return SECTORAL_PALETTES.health;
  if (/trading|crypto|finance/.test(s)) return SECTORAL_PALETTES.finance;
  if (/marketing|adtech|ad |creative/.test(s)) return SECTORAL_PALETTES.marketing;
  if (/e-?commerce|ecom|shop|retail/.test(s)) return SECTORAL_PALETTES.ecommerce;
  if (/sneaker|streetwear/.test(s)) return SECTORAL_PALETTES.sneakers;
  if (/agence|brand|studio/.test(s)) return SECTORAL_PALETTES.agency;
  if (/crm|relation/.test(s)) return SECTORAL_PALETTES.crm;
  if (/freelance|facture/.test(s)) return SECTORAL_PALETTES.freelance;
  if (/portfolio|vitrine/.test(s)) return SECTORAL_PALETTES.portfolio;
  if (/design tool|stitch|figma/.test(s)) return SECTORAL_PALETTES.design;
  return SECTORAL_PALETTES.default;
}

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

function buildPaletteA(colors: string[]): BrandPalette {
  // Option A : LIGHT MODE dominant — fond clair, primary vibrant
  const primary = ensureValidHex(colors[0], "#6366F1");
  const secondary = ensureValidHex(colors[1], darken(primary, 0.15));
  const accent = ensureValidHex(colors[2], lighten(primary, 0.25));
  return {
    primary,
    secondary,
    accent,
    background: ensureValidHex(colors[3], "#FAFAFA"),
    surface: "#FFFFFF",
    text: "#0F172A",
    textSecondary: "#64748B",
  };
}

function buildPaletteB(colors: string[]): BrandPalette {
  // Option B : DARK MODE premium — fond sombre, accent chaud
  const primary = ensureValidHex(colors[0], "#6366F1");
  const secondary = ensureValidHex(colors[1], lighten(primary, 0.2));
  const accent = ensureValidHex(colors[2], "#F59E0B");
  return {
    primary: lighten(primary, 0.1),
    secondary,
    accent,
    background: "#0A0E1A",
    surface: "#131A2B",
    text: "#F5F5F7",
    textSecondary: "#9CA3AF",
  };
}

function buildPaletteC(colors: string[]): BrandPalette {
  // Option C : MONO + 1 ACCENT — minimaliste radical, 1 seule couleur forte
  const accent = ensureValidHex(colors[0], "#EC4899");
  return {
    primary: "#000000",
    secondary: "#1A1A1A",
    accent,
    background: "#FAFAFA",
    surface: "#FFFFFF",
    text: "#000000",
    textSecondary: "#525252",
  };
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
  // TOUJOURS partir de la palette SECTORIELLE (pas du design system du projet cible, souvent sobre)
  // Les tokens extraits du clone servent \u00e0 enrichir / varier, mais la base sectorielle domine
  const sectoral = getSectoralPalette(brief.project.sector);
  const cloneColors = tokens.colors.slice(0, 8).map((c) => c.hex);

  // Merge : sectoriel en priorit\u00e9, tokens du clone en compl\u00e9ment
  let dominantColors = [...sectoral];
  if (cloneColors.length >= 3) {
    // Mix : 4 premi\u00e8res sectorielles + 4 du clone
    dominantColors = [...sectoral.slice(0, 4), ...cloneColors.slice(0, 4)];
  }

  const dominantFonts = tokens.fonts.slice(0, 5).map((f) => f.family);
  const mood = brief.paul.mood?.toLowerCase() || "";
  // Dark mood seulement si mention explicite dark/sombre/tech/cyberpunk (pas juste "minimaliste")
  const isDarkMood = /\bdark\b|sombre|noir\b|cyberpunk|tech dark/i.test(mood);
  const typography = chooseFonts(dominantFonts, brief);

  onProgress("setup", "analyzing-tokens", {
    colorsFound: dominantColors.length,
    fontsFound: dominantFonts.length,
    detectedMood: isDarkMood ? "dark" : "light",
  });
  await new Promise((r) => setTimeout(r, 400));

  const options: BrandOption[] = [];
  const builders: { option: "A" | "B" | "C"; label: string; build: () => BrandPalette }[] = [
    { option: "A", label: "Light mode vibrant", build: () => buildPaletteA(dominantColors) },
    { option: "B", label: "Dark mode premium", build: () => buildPaletteB(dominantColors) },
    { option: "C", label: "Minimaliste radical", build: () => buildPaletteC(dominantColors) },
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
