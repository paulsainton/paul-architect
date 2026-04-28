import { cookies } from "next/headers";
import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { CONFIG } from "./config";
import { log } from "./logger";

const logger = log.scope("auth");

const AUTH_COOKIE = "pa-session";
const MAX_AGE_S = 30 * 24 * 60 * 60; // 30 jours
const MAX_AGE_MS = MAX_AGE_S * 1000;

/**
 * Secret HMAC. Si AUTH_SECRET absent : fallback déterministe basé sur PA_PASS_HASH
 * (équivalent à un seed serveur). En prod il faudrait AUTH_SECRET dédié et rotation.
 */
function getSecret(): Buffer {
  const explicit = process.env.AUTH_SECRET;
  if (explicit && explicit.length >= 32) return Buffer.from(explicit, "utf-8");
  const seed = `${CONFIG.AUTH_PASS_HASH || "no-hash"}::${CONFIG.AUTH_USER}::pa-architect-v2`;
  return Buffer.from(seed, "utf-8");
}

/**
 * Signe un token : payload base64url + "." + HMAC-SHA256(payload, secret) base64url.
 */
function signToken(payload: string): string {
  const b64 = Buffer.from(payload, "utf-8").toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(b64).digest("base64url");
  return `${b64}.${sig}`;
}

/**
 * Vérifie un token signé. Retourne le payload string si valide + non-expiré, null sinon.
 * timingSafeEqual évite les timing attacks.
 */
function verifyToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [b64, sig] = parts;
  const expected = createHmac("sha256", getSecret()).update(b64).digest("base64url");
  const sigBuf = Buffer.from(sig, "base64url");
  const expBuf = Buffer.from(expected, "base64url");
  if (sigBuf.length !== expBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expBuf)) return null;
  let payload: string;
  try {
    payload = Buffer.from(b64, "base64url").toString("utf-8");
  } catch {
    return null;
  }
  const segments = payload.split(":");
  if (segments.length < 2) return null;
  const ts = parseInt(segments[1], 10);
  if (isNaN(ts) || Date.now() - ts > MAX_AGE_MS) return null;
  return payload;
}

export async function login(username: string, password: string): Promise<boolean> {
  if (username !== CONFIG.AUTH_USER) return false;

  let valid = false;
  if (CONFIG.AUTH_PASS_HASH) {
    try {
      valid = await bcrypt.compare(password, CONFIG.AUTH_PASS_HASH);
    } catch {
      valid = false;
    }
  } else if (CONFIG.AUTH_PASS_PLAIN) {
    valid = password === CONFIG.AUTH_PASS_PLAIN;
  }

  if (!valid) {
    logger.warn("login failed", { username });
    return false;
  }

  const store = await cookies();
  const nonce = randomBytes(8).toString("base64url");
  const payload = `${username}:${Date.now()}:${nonce}`;
  const token = signToken(payload);
  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: MAX_AGE_S,
    path: "/",
  });
  logger.info("login ok", { username });
  return true;
}

/**
 * Vérifie l'auth depuis les cookies Next (server components / API routes).
 */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const session = store.get(AUTH_COOKIE);
  if (!session?.value) return false;
  const payload = verifyToken(session.value);
  if (!payload) return false;
  return payload.startsWith(`${CONFIG.AUTH_USER}:`);
}

/**
 * Helper sync utilisé par le middleware (qui ne peut pas await cookies()).
 */
export function verifyAuthCookie(token: string | undefined): boolean {
  if (!token) return false;
  const payload = verifyToken(token);
  if (!payload) return false;
  return payload.startsWith(`${CONFIG.AUTH_USER}:`);
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
}
