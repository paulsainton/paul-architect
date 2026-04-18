import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, getResetSeconds } from "./rate-limit";

describe("rate-limit", () => {
  it("accepte jusqu'\u00e0 la limite", () => {
    const key = `test-${Date.now()}-1`;
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key, 5, 60_000)).toBe(true);
    }
    expect(checkRateLimit(key, 5, 60_000)).toBe(false);
  });

  it("sliding window : reset apr\u00e8s expiration", async () => {
    const key = `test-${Date.now()}-2`;
    expect(checkRateLimit(key, 2, 50)).toBe(true);
    expect(checkRateLimit(key, 2, 50)).toBe(true);
    expect(checkRateLimit(key, 2, 50)).toBe(false);
    await new Promise((r) => setTimeout(r, 60));
    expect(checkRateLimit(key, 2, 50)).toBe(true);
  });

  it("getResetSeconds retourne un entier >= 0", () => {
    const key = `test-${Date.now()}-3`;
    checkRateLimit(key, 5, 60_000);
    const reset = getResetSeconds(key, 60_000);
    expect(reset).toBeGreaterThanOrEqual(0);
    expect(reset).toBeLessThanOrEqual(60);
  });

  it("keys diff\u00e9rents sont ind\u00e9pendants", () => {
    const k1 = `test-${Date.now()}-a`;
    const k2 = `test-${Date.now()}-b`;
    expect(checkRateLimit(k1, 1, 60_000)).toBe(true);
    expect(checkRateLimit(k1, 1, 60_000)).toBe(false);
    expect(checkRateLimit(k2, 1, 60_000)).toBe(true); // k2 pas bloqu\u00e9
  });
});
