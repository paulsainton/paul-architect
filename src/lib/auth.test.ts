import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock next/headers avant l'import
vi.mock("next/headers", () => ({
  cookies: async () => {
    const store = new Map<string, { value: string }>();
    return {
      get: (name: string) => store.get(name),
      set: (name: string, value: string) => store.set(name, { value }),
      delete: (name: string) => store.delete(name),
    };
  },
}));

describe("auth bcrypt", () => {
  beforeEach(() => {
    // Hash de "test-password"
    process.env.PA_USER = "test-user";
    process.env.PA_PASS_HASH = "$2b$10$ocSTsIABewfPPb1e7EI/Ouuei/bd4IUKIhN.v7js6J43utfFY5P/2";
    process.env.PA_PASS = "";
    // Nettoyer les imports du cache
    vi.resetModules();
  });

  it("accepte les bons credentials via bcrypt", async () => {
    const { login } = await import("./auth");
    const ok = await login("test-user", "test-password");
    expect(ok).toBe(true);
  });

  it("rejette le mauvais password", async () => {
    const { login } = await import("./auth");
    const ok = await login("test-user", "wrong-password");
    expect(ok).toBe(false);
  });

  it("rejette le mauvais user", async () => {
    const { login } = await import("./auth");
    const ok = await login("other-user", "test-password");
    expect(ok).toBe(false);
  });

  it("fallback plain password si pas de hash", async () => {
    process.env.PA_PASS_HASH = "";
    process.env.PA_PASS = "plain-fallback";
    vi.resetModules();
    const { login } = await import("./auth");
    const ok = await login("test-user", "plain-fallback");
    expect(ok).toBe(true);
  });
});
