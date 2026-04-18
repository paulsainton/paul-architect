import { NextRequest } from "next/server";

const BENCH_API = "http://localhost:3010";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return new Response("Missing url", { status: 400 });

  // S\u00e9curit\u00e9 : accepter uniquement les URLs bench
  let targetUrl: string;
  if (url.startsWith("/")) {
    targetUrl = `${BENCH_API}${url}`;
  } else if (url.startsWith(BENCH_API)) {
    targetUrl = url;
  } else {
    return new Response("Invalid url", { status: 400 });
  }

  try {
    const res = await fetch(targetUrl, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return new Response("Not found", { status: res.status });

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const body = await res.arrayBuffer();

    return new Response(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new Response("Fetch failed", { status: 502 });
  }
}
