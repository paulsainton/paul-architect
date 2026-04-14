import { PipelineRun, TunnelId, TunnelState, SSEEvent, TUNNEL_LABELS } from "@/types/pipeline";

type SSEClient = {
  controller: ReadableStreamDefaultController;
  encoder: TextEncoder;
};

const runs = new Map<string, PipelineRun>();
const clients = new Map<string, Set<SSEClient>>();
const eventLogs = new Map<string, SSEEvent[]>();

function defaultTunnels(): Record<TunnelId, TunnelState> {
  const ids: TunnelId[] = [1, 2, 3, 4, 5, 6, 7, 8];
  return Object.fromEntries(
    ids.map((id) => [id, { id, label: TUNNEL_LABELS[id], status: "pending" as const }])
  ) as Record<TunnelId, TunnelState>;
}

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
  return run;
}

export function getRun(runId: string): PipelineRun | undefined {
  return runs.get(runId);
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
}

export function emitSSE(runId: string, type: string, data: Record<string, unknown> = {}): void {
  const event: SSEEvent = { type, data, timestamp: new Date().toISOString() };
  const log = eventLogs.get(runId);
  if (log) log.push(event);

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

  // Envoyer les events passés au nouveau client
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

// Heartbeat toutes les 15s pour garder les connexions SSE ouvertes
setInterval(() => {
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
