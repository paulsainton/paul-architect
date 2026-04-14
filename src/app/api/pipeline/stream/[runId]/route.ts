import { NextRequest } from "next/server";
import { addClient, getRun } from "@/lib/pipeline-state";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const run = getRun(runId);

  if (!run) {
    return new Response(JSON.stringify({ error: "Run not found" }), { status: 404 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      // Envoyer l'état initial du run
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "pipeline:state", data: run, timestamp: new Date().toISOString() })}\n\n`));

      const cleanup = addClient(runId, controller);

      request.signal.addEventListener("abort", () => {
        cleanup();
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
