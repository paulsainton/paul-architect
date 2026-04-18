import { NextRequest, NextResponse } from "next/server";

const BENCH_API = "http://localhost:3010";

interface BenchItem {
  id: string;
  url?: string;
  title?: string;
  thumbnail?: string;
  localThumbnail?: string;
  previewUrl?: string;
  mediaUrls?: string[];
  carouselImages?: Array<{ index: number; path: string; size: number }>;
  category?: string;
  subCategory?: string;
  resourceType?: string;
  visualStyles?: string[];
  colorScheme?: string;
  density?: string;
  businessSectors?: string[];
  devices?: string[];
  qualityScore?: number;
  summaryFr?: string;
  keyFeatures?: string[];
  tags?: string[];
  detectedTools?: string[];
  detectedWebsites?: string[];
  contentFormat?: string;
  priority?: string;
  hasPreview?: boolean;
}

function proxyUrl(path: string | undefined): string | undefined {
  if (!path) return undefined;
  // URLs bench locales : passer par proxy
  if (path.startsWith("/media/") || path.startsWith("/api/")) {
    return `/api/pipeline/bench-media?url=${encodeURIComponent(path)}`;
  }
  if (path.startsWith(BENCH_API)) {
    return `/api/pipeline/bench-media?url=${encodeURIComponent(path.replace(BENCH_API, ""))}`;
  }
  // URL externe (Instagram, Dribbble, etc.) \u2014 garder directe (HTTPS OK)
  if (path.startsWith("https://")) return path;
  return undefined;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const category = params.get("category") || "";
  const subcategory = params.get("subcategory") || "";
  const sector = params.get("sector") || "";
  const style = params.get("style") || "";
  const device = params.get("device") || "";
  const color = params.get("color") || "";
  const search = params.get("search") || "";
  const limit = params.get("limit") || "40";

  try {
    // Privil\u00e9gier /api/browse?smart=maquettes-with-preview (items qui ont des previews)
    const urls: string[] = [];

    if (search) {
      urls.push(`${BENCH_API}/api/items?search=${encodeURIComponent(search)}&limit=${limit}`);
    } else {
      const qp = new URLSearchParams();
      qp.set("smart", "maquettes-with-preview");
      qp.set("limit", limit);
      if (sector) qp.set("sector", sector);
      if (style) qp.set("style", style);
      if (device) qp.set("device", device);
      if (color) qp.set("color", color);
      if (category) qp.set("category", category);
      if (subcategory) qp.set("tag", subcategory);
      urls.push(`${BENCH_API}/api/browse?${qp}`);

      // Fallback sur inspiration (sans filtre smart)
      const qp2 = new URLSearchParams();
      qp2.set("limit", limit);
      if (sector) qp2.set("sector", sector);
      if (style) qp2.set("style", style);
      if (device) qp2.set("device", device);
      urls.push(`${BENCH_API}/api/inspiration?${qp2}`);
    }

    const responses = await Promise.allSettled(
      urls.map((u) => fetch(u, { signal: AbortSignal.timeout(8_000) }).then((r) => r.json()))
    );

    const seen = new Set<string>();
    const items: Array<Record<string, unknown>> = [];

    for (const res of responses) {
      if (res.status !== "fulfilled") continue;
      const raw = res.value;
      const list: BenchItem[] = Array.isArray(raw) ? raw : raw?.items || raw?.data || [];

      for (const item of list) {
        const key = item.id || item.url || JSON.stringify(item);
        if (seen.has(key)) continue;
        seen.add(key);

        // Priorit\u00e9 images : localThumbnail > previewUrl > thumbnail (externe)
        const mainImage = proxyUrl(item.localThumbnail || item.previewUrl) || proxyUrl(item.thumbnail);

        // Carrousels : utiliser carouselImages (nouveau format) en priorit\u00e9
        let carousel: string[] = [];
        if (item.carouselImages && item.carouselImages.length > 0) {
          carousel = item.carouselImages
            .sort((a, b) => a.index - b.index)
            .map((c) => proxyUrl(c.path))
            .filter(Boolean) as string[];
        } else if (item.mediaUrls && item.mediaUrls.length > 0) {
          // Fallback mediaUrls (ancien format \u2014 peut \u00eatre cass\u00e9)
          carousel = item.mediaUrls.map((u) => proxyUrl(u)).filter(Boolean) as string[];
        }

        // Si pas de carousel, utiliser le main comme seule image
        if (carousel.length === 0 && mainImage) carousel = [mainImage];

        items.push({
          id: item.id || `bench_${items.length}`,
          url: item.url || "",
          title: item.title || "Sans titre",
          description: item.summaryFr || "",
          imageUrl: mainImage || carousel[0] || "",
          thumbnail: mainImage || carousel[0] || "",
          mediaUrls: carousel,
          source: "bench",
          tags: item.tags || item.visualStyles || [],
          category: item.category || "",
          subCategory: item.subCategory || "",
          visualStyles: item.visualStyles || [],
          colorScheme: item.colorScheme || "",
          density: item.density || "",
          devices: item.devices || [],
          businessSectors: item.businessSectors || [],
          contentFormat: item.contentFormat || "",
          score: item.qualityScore || 0,
          keyFeatures: item.keyFeatures || [],
          detectedTools: item.detectedTools || [],
          detectedWebsites: item.detectedWebsites || [],
          selected: false,
        });
      }
    }

    items.sort((a, b) => (b.score as number) - (a.score as number));

    return NextResponse.json(items);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
