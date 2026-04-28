import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { checkRateLimit, getClientKey, getResetSeconds } from "@/lib/rate-limit";
import { loginSchema, validateBody } from "@/lib/schemas";

// Brute-force protection : 8 tentatives par 15 min (sliding)
const AUTH_LIMIT = 8;
const AUTH_WINDOW_MS = 15 * 60_000;

export async function POST(request: NextRequest) {
  const key = getClientKey(request, "auth");
  if (!checkRateLimit(key, AUTH_LIMIT, AUTH_WINDOW_MS)) {
    const reset = getResetSeconds(key, AUTH_WINDOW_MS);
    return NextResponse.json(
      { error: `Trop de tentatives. R\u00e9essayez dans ${reset}s.` },
      { status: 429, headers: { "Retry-After": String(reset) } }
    );
  }

  const parsed = await validateBody(request, loginSchema);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: parsed.status });

  const ok = await login(parsed.data.username, parsed.data.password);
  if (ok) return NextResponse.json({ ok: true });
  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
