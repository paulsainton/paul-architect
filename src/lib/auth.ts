import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { CONFIG } from "./config";

const AUTH_COOKIE = "pa-session";
const MAX_AGE = 30 * 24 * 60 * 60; // 30 jours

export async function login(username: string, password: string): Promise<boolean> {
  if (username !== CONFIG.AUTH_USER) return false;

  // Priorit\u00e9 : bcrypt hash, fallback plain pour compat r\u00e9trograde
  let valid = false;
  if (CONFIG.AUTH_PASS_HASH) {
    try {
      valid = await bcrypt.compare(password, CONFIG.AUTH_PASS_HASH);
    } catch {
      valid = false;
    }
  } else if (CONFIG.AUTH_PASS_PLAIN) {
    // Deprecated : pass en clair (migration p\u00e9riode)
    valid = password === CONFIG.AUTH_PASS_PLAIN;
  }

  if (!valid) return false;

  const store = await cookies();
  const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");
  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
  return true;
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const session = store.get(AUTH_COOKIE);
  if (!session?.value) return false;
  try {
    const decoded = Buffer.from(session.value, "base64").toString("utf-8");
    return decoded.startsWith(CONFIG.AUTH_USER + ":");
  } catch {
    return false;
  }
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
}
