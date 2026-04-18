export interface CompetitorResult {
  id: string;
  url: string;
  title: string;
  description: string;
  ogImage?: string;
  score: number;
  source: "knowledge-base" | "web-search";
}

// Sites \u00e0 IGNORER (articles, listicles, plateformes g\u00e9n\u00e9ralistes)
const BLACKLIST = [
  "designrush.com", "dribbble.com", "behance.net", "pinterest", "awwwards.com",
  "medium.com", "dev.to", "hackernoon.com", "reddit.com", "producthunt.com",
  "wikipedia.org", "youtube.com", "google.com", "bing.com", "duckduckgo.com",
  "htmlburger.com", "seahawkmedia.com", "azurodigital.com", "crazyegg.com",
  "hubspot.com/blog", "wordpress.com/blog", "medium.com", "substack.com",
];

function isBlacklisted(url: string): boolean {
  const lower = url.toLowerCase();
  return BLACKLIST.some((b) => lower.includes(b));
}

async function fetchOgMetadata(url: string): Promise<{ title?: string; description?: string; image?: string }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PaulArchitect/1.0)" },
      signal: AbortSignal.timeout(8_000),
      redirect: "follow",
    });
    const html = await res.text();
    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i)
      || html.match(/<title>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i)
      || html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
    const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/i);
    return {
      title: titleMatch?.[1]?.trim(),
      description: descMatch?.[1]?.trim(),
      image: imageMatch?.[1],
    };
  } catch {
    return {};
  }
}

/**
 * Scrape DuckDuckGo + filtre anti-listicle
 */
async function scrapeDuckDuckGo(query: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
      { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(10_000) }
    );
    const html = await res.text();
    const urls: string[] = [];
    const matches = html.matchAll(/class="result__a"[^>]*href="([^"]+)"/g);
    for (const m of matches) {
      let url = m[1];
      if (url.includes("uddg=")) {
        const decoded = decodeURIComponent(url.split("uddg=")[1]?.split("&")[0] || "");
        if (decoded) url = decoded;
      }
      if (url.startsWith("http") && !isBlacklisted(url)) {
        urls.push(url);
      }
    }
    return urls;
  } catch {
    return [];
  }
}

/**
 * Strat\u00e9gie principale :
 * 1. Utiliser les concurrents CONNUS de la knowledge base (fiables, cibl\u00e9s)
 * 2. Compl\u00e9ter avec recherche web intelligente (non-listicles)
 */
export async function scrapeCompetitors(
  sector: string,
  type: string,
  projectName: string,
  knownCompetitors: string[] = [],
  keywords: string[] = []
): Promise<CompetitorResult[]> {
  const results: CompetitorResult[] = [];
  const seen = new Set<string>();

  // PHASE 1 : concurrents connus (knowledge base) — priorit\u00e9 absolue
  const knownDomains = knownCompetitors.slice(0, 8);
  const fetched = await Promise.allSettled(
    knownDomains.map(async (domain) => {
      const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
      const url = `https://${cleanDomain}`;
      const og = await fetchOgMetadata(url);
      return { url, domain: cleanDomain, og };
    })
  );

  for (const r of fetched) {
    if (r.status !== "fulfilled") continue;
    const { url, domain, og } = r.value;
    if (seen.has(domain)) continue;
    seen.add(domain);

    results.push({
      id: `kb_${results.length}`,
      url,
      title: og.title || domain,
      description: og.description || "",
      ogImage: og.image,
      score: 10, // score max pour concurrents v\u00e9rifi\u00e9s
      source: "knowledge-base",
    });
  }

  // PHASE 2 : compl\u00e9ter avec web search si pas assez
  if (results.length < 5) {
    const queries = [
      // Queries cibl\u00e9es produit, pas listicles
      ...keywords.slice(0, 2).map((kw) => `${kw} app`),
      `${projectName} alternatives`,
      `best ${sector} tool site:producthunt.com OR site:alternativeto.net`,
    ];

    const allUrls = new Set<string>();
    for (const q of queries) {
      const urls = await scrapeDuckDuckGo(q);
      urls.forEach((u) => allUrls.add(u));
    }

    // Enrichir les top non-blacklistes, non-dupliqu\u00e9s
    const candidates = Array.from(allUrls).slice(0, 15);
    for (const url of candidates) {
      if (results.length >= 8) break;
      try {
        const domain = new URL(url).hostname.replace(/^www\./, "");
        if (seen.has(domain)) continue;
        // Filtrer : si le domain est une section blog ou article, skip
        if (/\/blog\/|\/article\/|\/post\/|-article-|-blog-/.test(url)) continue;
        seen.add(domain);

        const og = await fetchOgMetadata(url);

        // Scoring
        let score = 3;
        const lower = (og.title + " " + og.description + " " + url).toLowerCase();
        if (lower.includes(sector.toLowerCase())) score += 2;
        if (lower.includes(type.toLowerCase())) score += 1;
        if (og.image) score += 1;
        if (keywords.some((kw) => lower.includes(kw.toLowerCase()))) score += 2;

        results.push({
          id: `web_${results.length}`,
          url,
          title: og.title || domain,
          description: og.description || "",
          ogImage: og.image,
          score,
          source: "web-search",
        });
      } catch { /* url invalid */ }
    }
  }

  // Trier par score, max 8
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 8);
}

export { fetchOgMetadata };
