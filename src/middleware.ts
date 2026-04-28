import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth/login"];
const AUTH_USER = process.env.PA_USER || "paul.sainton";
const AUTH_PASS_HASH = process.env.PA_PASS_HASH || "";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Edge-runtime safe : utilise Web Crypto SubtleCrypto (pas le module Node 'crypto').
 */
async function hmacSha256(secret: string, message: string): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return new Uint8Array(sig);
}

function base64urlDecode(s: string): Uint8Array {
  // base64url → base64
  const padded = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(s.length + ((4 - (s.length % 4)) % 4), "=");
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bufferToString(buf: Uint8Array): string {
  let out = "";
  for (let i = 0; i < buf.length; i++) out += String.fromCharCode(buf[i]);
  return out;
}

function bufferToBase64url(buf: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Comparaison constant-time (Edge ne fournit pas timingSafeEqual).
 * Itère sur la longueur max des deux buffers — XOR cumulatif → 0 si match.
 */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function verifyToken(token: string): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [b64, sig] = parts;
  const explicit = process.env.AUTH_SECRET;
  const secret = explicit && explicit.length >= 32
    ? explicit
    : `${AUTH_PASS_HASH || "no-hash"}::${AUTH_USER}::pa-architect-v2`;
  const expected = await hmacSha256(secret, b64);
  const expectedB64 = bufferToBase64url(expected);
  // constant-time on base64url strings (alphabet borné)
  const expBuf = new TextEncoder().encode(expectedB64);
  const sigBuf = new TextEncoder().encode(sig);
  if (!constantTimeEqual(expBuf, sigBuf)) return false;
  let payload: string;
  try {
    payload = bufferToString(base64urlDecode(b64));
  } catch {
    return false;
  }
  if (!payload.startsWith(`${AUTH_USER}:`)) return false;
  const ts = parseInt(payload.split(":")[1] || "0", 10);
  if (isNaN(ts) || Date.now() - ts > MAX_AGE_MS) return false;
  return true;
}

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https: wss:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
    ].join("; ")
  );
  return res;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    const res = NextResponse.next();
    if (pathname.startsWith("/login")) {
      res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    }
    return applySecurityHeaders(res);
  }

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return applySecurityHeaders(NextResponse.next());
  }

  const session = request.cookies.get("pa-session");
  if (!session?.value) {
    return applySecurityHeaders(NextResponse.redirect(new URL("/login", request.url)));
  }

  const valid = await verifyToken(session.value);
  if (!valid) {
    return applySecurityHeaders(NextResponse.redirect(new URL("/login", request.url)));
  }

  const res = NextResponse.next();
  if (pathname.startsWith("/api/")) {
    res.headers.set("Cache-Control", "no-store");
  }
  return applySecurityHeaders(res);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
