import { cookies } from "next/headers";

const AUTH_COOKIE = "pa-session";
const VALID_USER = "paul.sainton";
const VALID_PASS = "1912";
const MAX_AGE = 30 * 24 * 60 * 60; // 30 jours

export async function login(username: string, password: string): Promise<boolean> {
  if (username === VALID_USER && password === VALID_PASS) {
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
  return false;
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const session = store.get(AUTH_COOKIE);
  if (!session?.value) return false;
  try {
    const decoded = Buffer.from(session.value, "base64").toString("utf-8");
    return decoded.startsWith(VALID_USER + ":");
  } catch {
    return false;
  }
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
}
