import { describe, it, expect, beforeEach, vi } from "vitest";

describe("config", () => {
  beforeEach(() => { vi.resetModules(); });

  it("expose les URLs par d\u00e9faut si pas d'env", async () => {
    delete process.env.BENCH_API;
    delete process.env.STITCH_API;
    const { CONFIG } = await import("./config");
    expect(CONFIG.BENCH_API).toBe("http://localhost:3010");
    expect(CONFIG.STITCH_API).toBe("http://localhost:3012");
    expect(CONFIG.EMPIRE_API).toBe("http://localhost:3060");
  });

  it("override via env vars", async () => {
    process.env.BENCH_API = "http://custom:9000";
    process.env.STITCH_API = "http://custom:9001";
    vi.resetModules();
    const { CONFIG } = await import("./config");
    expect(CONFIG.BENCH_API).toBe("http://custom:9000");
    expect(CONFIG.STITCH_API).toBe("http://custom:9001");
  });

  it("parse les limits en number", async () => {
    process.env.MAX_RUNS_IN_MEMORY = "50";
    process.env.MAX_EVENTS_PER_RUN = "300";
    vi.resetModules();
    const { CONFIG } = await import("./config");
    expect(CONFIG.MAX_RUNS_IN_MEMORY).toBe(50);
    expect(CONFIG.MAX_EVENTS_PER_RUN).toBe(300);
    expect(typeof CONFIG.MAX_RUNS_IN_MEMORY).toBe("number");
  });

  it("fallback TTL 72h par d\u00e9faut", async () => {
    delete process.env.RUN_TTL_MS;
    vi.resetModules();
    const { CONFIG } = await import("./config");
    expect(CONFIG.RUN_TTL_MS).toBe(72 * 60 * 60 * 1000);
  });
});
