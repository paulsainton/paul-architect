import { NextRequest, NextResponse } from "next/server";

const BENCH_API = "http://localhost:3010";

interface BenchItem {
  id: string;
  url?: string;
  title?: string;
  thumbnail?: string;
  mediaUrls?: string[];
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
}

function proxyUrl(path: string | undefined): string | undefined {
  if (!path) return undefined;
  // Passer par le proxy pour \u00e9viter mixed content + localhost
  if (path.startsWith("/") || path.startsWith(BENCH_API)) {
    return `/api/pipeline/bench-media?url=${encodeURIComponent(path)}`;
  }
  // URL externe (ex: instagram) \u2014 garder telle quelle
  return path;
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
  const limit = params.get("limit") || "30";

  try {
    const urls: string[] = [];

    if (search) {
      urls.push(`${BENCH_API}/api/items?search=${encodeURIComponent(search)}&limit=${limit}`);
    } else {
      // Endpoint principal : /api/inspiration
      const qp = new URLSearchParams();
      if (sector) qp.set("sector", sector);
      if (device) qp.set("device", device);
      if (color) qp.set("color", color);
      if (style) qp.set("style", style);
      qp.set("limit", limit);
      urls.push(`${BENCH_API}/api/inspiration?${qp}`);

      // Fallback browse si filtres avanc\u00e9s
      if (category || subcategory) {
        const qp2 = new URLSearchParams();
        if (category) qp2.set("category", category);
        if (subcategory) qp2.set("tag", subcategory);
        qp2.set("smart", "maquettes-with-preview");
        qp2.set("limit", limit);
        urls.push(`${BENCH_API}/api/browse?${qp2}`);
      }
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

        // Absolutiser les URLs (thumbnail + mediaUrls)
        const thumbnail = proxyUrl(item.thumbnail);
        const mediaUrls = (item.mediaUrls || []).map((u) => proxyUrl(u)).filter(Boolean) as string[];
        const imageUrl = mediaUrls[0] || thumbnail || "";

        items.push({
          id: item.id || `bench_${items.length}`,
          url: item.url || "",
          title: item.title || "Sans titre",
          description: item.summaryFr || "",
          imageUrl,
          thumbnail: thumbnail || imageUrl,
          mediaUrls,
          source: "bench",
          tags: item.tags || item.visualStyles || [],
          category: item.category || "",
          subCategory: item.subCategory || "",
          visualStyles: item.visualStyles || [],
          colorScheme: item.colorScheme || "",
          devices: item.devices || [],
          businessSectors: item.businessSectors || [],
          score: item.qualityScore || 0,
          keyFeatures: item.keyFeatures || [],
          selected: false,
        });
      }
    }

    // Trier par qualityScore
    items.sort((a, b) => (b.score as number) - (a.score as number));

    return NextResponse.json(items);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
