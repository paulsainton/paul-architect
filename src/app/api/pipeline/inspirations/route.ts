import { NextRequest, NextResponse } from "next/server";

const BENCH_API = "http://localhost:3010";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const category = params.get("category") || "";
  const subcategory = params.get("subcategory") || "";
  const sector = params.get("sector") || "";
  const style = params.get("style") || "";
  const device = params.get("device") || "";
  const search = params.get("search") || "";
  const limit = params.get("limit") || "30";

  try {
    // Essayer d'abord browse/smart pour les maquettes avec preview
    const urls: string[] = [];

    if (search) {
      urls.push(`${BENCH_API}/api/items?search=${encodeURIComponent(search)}&limit=${limit}`);
    }

    if (category || subcategory || sector) {
      const qp = new URLSearchParams();
      if (category) qp.set("category", category);
      if (subcategory) qp.set("tag", subcategory);
      if (sector) qp.set("sector", sector);
      if (style) qp.set("style", style);
      if (device) qp.set("device", device);
      qp.set("limit", limit);
      urls.push(`${BENCH_API}/api/browse?${qp}`);
    }

    if (urls.length === 0) {
      urls.push(`${BENCH_API}/api/items?category=BENCH+UI&limit=${limit}`);
    }

    const responses = await Promise.allSettled(
      urls.map((u) => fetch(u, { signal: AbortSignal.timeout(8_000) }).then((r) => r.json()))
    );

    // Merger + dédupliquer
    const seen = new Set<string>();
    const items: Record<string, unknown>[] = [];

    for (const res of responses) {
      if (res.status !== "fulfilled") continue;
      const data = Array.isArray(res.value) ? res.value : res.value?.items || res.value?.data || [];
      for (const item of data) {
        const key = item.url || item.link || item.id || JSON.stringify(item);
        if (seen.has(key)) continue;
        seen.add(key);
        items.push({
          id: item.id || `bench_${items.length}`,
          url: item.url || item.link || "",
          title: item.title || item.name || "",
          description: item.description || item.summary || "",
          imageUrl: item.imageUrl || item.preview || item.thumbnail || item.og_image || "",
          source: "bench",
          tags: item.tags || [],
          category: item.category || "",
          score: item.score || item.quality || 0,
          selected: false,
        });
      }
    }

    return NextResponse.json(items);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
