import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { checkRateLimit, getClientKey, getResetSeconds } from "@/lib/rate-limit";

const AUTH_LIMIT = 10;        // 10 tentatives
const AUTH_WINDOW_MS = 60_000; // par minute

export async function POST(request: NextRequest) {
  const key = getClientKey(request, "auth");
  if (!checkRateLimit(key, AUTH_LIMIT, AUTH_WINDOW_MS)) {
    const reset = getResetSeconds(key, AUTH_WINDOW_MS);
    return NextResponse.json(
      { error: `Trop de tentatives. R\u00e9essayez dans ${reset}s.` },
      { status: 429, headers: { "Retry-After": String(reset) } }
    );
  }

  const { username, password } = await request.json();
  const ok = await login(username, password);
  if (ok) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
