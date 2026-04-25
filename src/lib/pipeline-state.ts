import { PipelineRun, TunnelId, TunnelState, SSEEvent, TUNNEL_LABELS } from "@/types/pipeline";
import { writeFile, readFile, readdir, mkdir, rename } from "fs/promises";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";
import { CONFIG } from "./config";
import { log } from "./logger";

const logger = log.scope("pipeline-state");

type SSEClient = {
  controller: ReadableStreamDefaultController;
  encoder: TextEncoder;
};

const RUNS_DIR = CONFIG.PA_RUNS_DIR;
const runs = new Map<string, PipelineRun>();
const clients = new Map<string, Set<SSEClient>>();
const eventLogs = new Map<string, SSEEvent[]>();
const pendingWrites = new Map<string, ReturnType<typeof setTimeout>>();
let hydrated = false;

// Cr\u00e9er le dir au module load
if (!existsSync(RUNS_DIR)) {
  try { mkdirSync(RUNS_DIR, { recursive: true }); } catch { /* ignore */ }
}

function defaultTunnels(): Record<TunnelId, TunnelState> {
  const ids: TunnelId[] = [1, 2, 3, 4, 5, 6, 7, 8];
  return Object.fromEntries(
    ids.map((id) => [id, { id, label: TUNNEL_LABELS[id], status: "pending" as const }])
  ) as Record<TunnelId, TunnelState>;
}

// ========================================
// PERSISTANCE : WAL append + snapshot debounce 500ms
// ========================================
async function persistRun(runId: string): Promise<void> {
  const run = runs.get(runId);
  if (!run) return;
  const path = join(RUNS_DIR, `${runId}.json`);
  const tmp = `${path}.tmp`;
  try {
    await mkdir(RUNS_DIR, { recursive: true });
    await writeFile(tmp, JSON.stringify(run), "utf-8");
    await rename(tmp, path);
  } catch (err) {
    logger.error("persist fail", { error: err, runId });
  }
}

function schedulePersist(runId: string): void {
  const existing = pendingWrites.get(runId);
  if (existing) clearTimeout(existing);
  pendingWrites.set(runId, setTimeout(() => {
    pendingWrites.delete(runId);
    persistRun(runId).catch(() => {});
  }, 500));
}

async function hydrate(): Promise<void> {
  if (hydrated) return;
  hydrated = true;
  try {
    if (!existsSync(RUNS_DIR)) return;
    const files = await readdir(RUNS_DIR);
    for (const f of files) {
      if (!f.endsWith(".json") || f.endsWith(".tmp")) continue;
      try {
        const raw = await readFile(join(RUNS_DIR, f), "utf-8");
        const run: PipelineRun = JSON.parse(raw);
        if (run.id) {
          runs.set(run.id, run);
          eventLogs.set(run.id, []);
        }
      } catch { /* skip corrupt */ }
    }
    logger.info("hydrated from disk", { count: runs.size });
  } catch (err) {
    logger.error("hydrate fail", { error: err });
  }
}
hydrate();

// ========================================
// TTL JANITOR : 72h pour completed, infini pour running
// ========================================
let janitorTimer: ReturnType<typeof setInterval> | null = null;

export function initJanitor(): void {
  if (janitorTimer) return;
  janitorTimer = setInterval(async () => {
    const now = Date.now();
    const ttl = CONFIG.RUN_TTL_MS;
    for (const [runId, run] of runs) {
      // Ne JAMAIS \u00e9victer si running
      if (run.status === "running") continue;
      const updated = new Date(run.updatedAt).getTime();
      if (now - updated > ttl) {
        runs.delete(runId);
        eventLogs.delete(runId);
        clients.delete(runId);
        // Archive (pas delete) : mv vers .archived
        try {
          const src = join(RUNS_DIR, `${runId}.json`);
          const dst = join(RUNS_DIR, `${runId}.archived.json`);
          if (existsSync(src)) await rename(src, dst);
        } catch { /* ignore */ }
      }
    }
    // LRU : si > MAX_RUNS, drop les plus vieux completed
    if (runs.size > CONFIG.MAX_RUNS_IN_MEMORY) {
      const sorted = Array.from(runs.entries())
        .filter(([, r]) => r.status !== "running")
        .sort((a, b) => new Date(a[1].updatedAt).getTime() - new Date(b[1].updatedAt).getTime());
      const toEvict = sorted.slice(0, runs.size - CONFIG.MAX_RUNS_IN_MEMORY);
      for (const [runId] of toEvict) {
        runs.delete(runId);
        eventLogs.delete(runId);
      }
    }
  }, 5 * 60 * 1000); // 5 min
}
initJanitor();

export function stopJanitor(): void {
  if (janitorTimer) {
    clearInterval(janitorTimer);
    janitorTimer = null;
  }
}

// ========================================
// API publique
// ========================================
export function createRun(projectSlug: string): PipelineRun {
  const id = `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  const run: PipelineRun = {
    id,
    projectSlug,
    status: "running",
    currentTunnel: 1,
    tunnels: defaultTunnels(),
    createdAt: now,
    updatedAt: now,
  };
  runs.set(id, run);
  eventLogs.set(id, []);
  schedulePersist(id);
  return run;
}

export function getRun(runId: string): PipelineRun | undefined {
  // Fallback : si pas en m\u00e9moire mais sur disque, charger \u00e0 la demande
  const run = runs.get(runId);
  if (run) return run;
  const path = join(RUNS_DIR, `${runId}.json`);
  if (existsSync(path)) {
    try {
      const raw = readFileSync(path, "utf-8");
      const loaded: PipelineRun = JSON.parse(raw);
      runs.set(runId, loaded);
      if (!eventLogs.has(runId)) eventLogs.set(runId, []);
      return loaded;
    } catch { /* ignore */ }
  }
  return undefined;
}

export function getAllRuns(): PipelineRun[] {
  return Array.from(runs.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function updateRun(runId: string, updates: Partial<PipelineRun>): PipelineRun | undefined {
  const run = runs.get(runId);
  if (!run) return undefined;
  Object.assign(run, updates, { updatedAt: new Date().toISOString() });
  schedulePersist(runId);
  return run;
}

export function setTunnelStatus(runId: string, tunnelId: TunnelId, status: TunnelState["status"]): void {
  const run = runs.get(runId);
  if (!run) return;
  const tunnel = run.tunnels[tunnelId];
  tunnel.status = status;
  if (status === "active") {
    tunnel.startedAt = new Date().toISOString();
    run.currentTunnel = tunnelId;
  } else if (status === "completed") {
    tunnel.completedAt = new Date().toISOString();
  }
  run.updatedAt = new Date().toISOString();
  schedulePersist(runId);
}

export function emitSSE(runId: string, type: string, data: Record<string, unknown> = {}): void {
  const event: SSEEvent = { type, data, timestamp: new Date().toISOString() };
  const log = eventLogs.get(runId);
  if (log) {
    log.push(event);
    // Ring buffer : cap \u00e0 MAX_EVENTS_PER_RUN
    if (log.length > CONFIG.MAX_EVENTS_PER_RUN) {
      log.splice(0, log.length - CONFIG.MAX_EVENTS_PER_RUN);
    }
  }

  const sseClients = clients.get(runId);
  if (!sseClients) return;

  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of sseClients) {
    try {
      client.controller.enqueue(client.encoder.encode(payload));
    } catch {
      sseClients.delete(client);
    }
  }
}

export function addClient(runId: string, controller: ReadableStreamDefaultController): () => void {
  if (!clients.has(runId)) clients.set(runId, new Set());
  const encoder = new TextEncoder();
  const client: SSEClient = { controller, encoder };
  clients.get(runId)!.add(client);

  const log = eventLogs.get(runId) || [];
  for (const event of log) {
    try {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
    } catch {
      break;
    }
  }

  return () => {
    clients.get(runId)?.delete(client);
  };
}

export function getEventLog(runId: string): SSEEvent[] {
  return eventLogs.get(runId) || [];
}

// ========================================
// HEARTBEAT SSE : init contr\u00f4l\u00e9
// ========================================
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

export function initHeartbeat(): void {
  if (heartbeatTimer) return;
  heartbeatTimer = setInterval(() => {
    for (const [runId, sseClients] of clients) {
      for (const client of sseClients) {
        try {
          client.controller.enqueue(client.encoder.encode(`: heartbeat\n\n`));
        } catch {
          sseClients.delete(client);
        }
      }
      if (sseClients.size === 0) clients.delete(runId);
    }
  }, 15_000);
}

export function stopHeartbeat(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

initHeartbeat();
