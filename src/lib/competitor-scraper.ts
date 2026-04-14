export interface CompetitorResult {
  id: string;
  url: string;
  title: string;
  description: string;
  ogImage?: string;
  score: number;
}

export function buildQueries(sector: string, type: string, projectName: string): string[] {
  return [
    `best ${sector} ${type} app design 2025 2026`,
    `top ${sector} ${type} UI inspiration`,
    `${sector} app like ${projectName} alternatives`,
  ];
}

export async function scrapeCompetitors(
  sector: string,
  type: string,
  projectName: string
): Promise<CompetitorResult[]> {
  const queries = buildQueries(sector, type, projectName);
  const results: CompetitorResult[] = [];
  const seen = new Set<string>();

  for (const query of queries) {
    try {
      // DuckDuckGo HTML search
      const res = await fetch(
        `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
        {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; PaulArchitect/1.0)" },
          signal: AbortSignal.timeout(10_000),
        }
      );
      const html = await res.text();

      // Extraire les résultats
      const matches = html.matchAll(
        /class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)/g
      );

      for (const m of matches) {
        let url = m[1];
        const title = m[2].trim();

        // DuckDuckGo redirige via //duckduckgo.com/l/?uddg=...
        if (url.includes("uddg=")) {
          const decoded = decodeURIComponent(url.split("uddg=")[1]?.split("&")[0] || "");
          if (decoded) url = decoded;
        }

        if (seen.has(url) || !url.startsWith("http")) continue;
        seen.add(url);

        // Scoring
        let score = 0;
        const lowerUrl = url.toLowerCase();
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes(sector.toLowerCase()) || lowerUrl.includes(sector.toLowerCase())) score += 3;
        if (lowerTitle.includes(type.toLowerCase())) score += 2;
        if (lowerTitle.includes("design") || lowerTitle.includes("ui")) score += 1;

        results.push({
          id: `comp_${results.length}`,
          url,
          title,
          description: "",
          score,
        });
      }
    } catch {
      // Continuer avec les autres queries
    }
  }

  // Trier par score, top 5
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 5);
}

export async function fetchOgMetadata(url: string): Promise<{ title?: string; description?: string; image?: string }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PaulArchitect/1.0)" },
      signal: AbortSignal.timeout(8_000),
      redirect: "follow",
    });
    const html = await res.text();

    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i);
    const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i);
    const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/i);

    return {
      title: titleMatch?.[1],
      description: descMatch?.[1],
      image: imageMatch?.[1],
    };
  } catch {
    return {};
  }
}
