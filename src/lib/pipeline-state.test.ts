import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), "pa-test-"));
  process.env.PA_RUNS_DIR = tmpDir;
  process.env.MAX_EVENTS_PER_RUN = "5";
  process.env.MAX_RUNS_IN_MEMORY = "3";
  process.env.RUN_TTL_MS = "1000"; // 1s pour test
  vi.resetModules();
});

afterEach(() => {
  try { rmSync(tmpDir, { recursive: true, force: true }); } catch { /* */ }
  // Stop timers pour \u00e9viter leak
  vi.resetModules();
});

describe("pipeline-state", () => {
  it("createRun g\u00e9n\u00e8re un ID unique avec status running", async () => {
    const { createRun, stopHeartbeat, stopJanitor } = await import("./pipeline-state");
    const run = createRun("test-project");
    expect(run.id).toMatch(/^run_\d+_[a-z0-9]+$/);
    expect(run.status).toBe("running");
    expect(run.projectSlug).toBe("test-project");
    expect(run.currentTunnel).toBe(1);
    stopHeartbeat();
    stopJanitor();
  });

  it("updateRun met \u00e0 jour et retourne le run", async () => {
    const { createRun, updateRun, getRun, stopHeartbeat, stopJanitor } = await import("./pipeline-state");
    const run = createRun("test");
    const before = run.updatedAt;
    await new Promise((r) => setTimeout(r, 10));
    const updated = updateRun(run.id, { status: "completed" });
    expect(updated?.status).toBe("completed");
    expect(updated?.updatedAt).not.toBe(before);
    expect(getRun(run.id)?.status).toBe("completed");
    stopHeartbeat();
    stopJanitor();
  });

  it("emitSSE respecte le ring buffer MAX_EVENTS_PER_RUN", async () => {
    const { createRun, emitSSE, getEventLog, stopHeartbeat, stopJanitor } = await import("./pipeline-state");
    const run = createRun("test");
    for (let i = 0; i < 10; i++) emitSSE(run.id, "test:event", { i });
    const log = getEventLog(run.id);
    expect(log.length).toBe(5); // cap MAX_EVENTS_PER_RUN
    expect((log[0].data as { i: number }).i).toBe(5); // premiers droppés
    stopHeartbeat();
    stopJanitor();
  });

  it("getRun retourne undefined si run inexistant", async () => {
    const { getRun, stopHeartbeat, stopJanitor } = await import("./pipeline-state");
    expect(getRun("run_fake_xxx")).toBeUndefined();
    stopHeartbeat();
    stopJanitor();
  });

  it("getAllRuns trie par createdAt desc", async () => {
    const { createRun, getAllRuns, stopHeartbeat, stopJanitor } = await import("./pipeline-state");
    const r1 = createRun("first");
    await new Promise((r) => setTimeout(r, 5));
    const r2 = createRun("second");
    const all = getAllRuns();
    expect(all[0].id).toBe(r2.id); // plus r\u00e9cent d'abord
    expect(all[1].id).toBe(r1.id);
    stopHeartbeat();
    stopJanitor();
  });
});
