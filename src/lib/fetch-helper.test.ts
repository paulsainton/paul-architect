import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

describe("fetchJson", () => {
  beforeEach(() => vi.resetModules());

  it("retourne le JSON parse si 200 OK", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ foo: "bar" }),
    }) as unknown as typeof fetch;
    const { fetchJson } = await import("./fetch-helper");
    const result = await fetchJson<{ foo: string }>("/api/test");
    expect(result?.foo).toBe("bar");
  });

  it("retourne null + toast si status >= 400", async () => {
    const { toast } = await import("sonner");
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => JSON.stringify({ error: "Server crashed" }),
    }) as unknown as typeof fetch;
    const { fetchJson } = await import("./fetch-helper");
    const result = await fetchJson("/api/test");
    expect(result).toBeNull();
    expect(toast.error).toHaveBeenCalled();
  });

  it("silent:true ne toast pas", async () => {
    const { toast } = await import("sonner");
    (toast.error as unknown as { mockClear: () => void }).mockClear();
    global.fetch = vi.fn().mockResolvedValue({
      ok: false, status: 500, text: async () => "error",
    }) as unknown as typeof fetch;
    const { fetchJson } = await import("./fetch-helper");
    await fetchJson("/api/test", {}, { silent: true });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("catch network error avec toast", async () => {
    const { toast } = await import("sonner");
    (toast.error as unknown as { mockClear: () => void }).mockClear();
    global.fetch = vi.fn().mockRejectedValue(new Error("Network fail")) as unknown as typeof fetch;
    const { fetchJson } = await import("./fetch-helper");
    const result = await fetchJson("/api/test");
    expect(result).toBeNull();
    expect(toast.error).toHaveBeenCalled();
  });
});
