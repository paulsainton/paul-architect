"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles, Layers, Search, Zap, Palette, Brain, Code, Image, CheckCircle,
  Plus, ChevronRight, Home, Wifi, WifiOff,
} from "lucide-react";
import { usePipelineStore } from "@/stores/pipeline-store";
import type { TunnelId } from "@/types/pipeline";

const TUNNEL_NAV: { id: TunnelId; label: string; icon: typeof Layers; path: string; color: string }[] = [
  { id: 1, label: "Brief", icon: Layers, path: "brief", color: "text-tunnel-1" },
  { id: 2, label: "Inspirations", icon: Search, path: "inspirations", color: "text-tunnel-2" },
  { id: 3, label: "Clone", icon: Zap, path: "extraction", color: "text-tunnel-3" },
  { id: 4, label: "Identit\u00e9", icon: Palette, path: "brand", color: "text-tunnel-4" },
  { id: 5, label: "Analyse", icon: Brain, path: "analysis", color: "text-tunnel-5" },
  { id: 6, label: "Code", icon: Code, path: "build", color: "text-tunnel-6" },
  { id: 7, label: "Maquettes", icon: Image, path: "maquettes", color: "text-tunnel-7" },
  { id: 8, label: "QA", icon: CheckCircle, path: "review", color: "text-tunnel-8" },
];

export function Sidebar() {
  const pathname = usePathname();
  const run = usePipelineStore((s) => s.run);
  const isConnected = usePipelineStore((s) => s.isConnected);

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-bg-surface flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm">Paul Architect</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <Link
          href="/"
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === "/" ? "bg-bg-card text-text-primary" : "text-text-secondary hover:text-text-primary hover:bg-bg-card"
          }`}
        >
          <Home className="w-4 h-4" />
          Accueil
        </Link>

        <Link
          href="/pipeline/new"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-accent hover:bg-bg-card transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau pipeline
        </Link>

        {run && (
          <>
            <div className="pt-4 pb-2 px-3">
              <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                Pipeline actif
              </p>
            </div>
            {TUNNEL_NAV.map((t) => {
              const tunnel = run.tunnels[t.id];
              const isActive = pathname.includes(`/${t.path}`);
              const status = tunnel?.status || "pending";
              return (
                <Link
                  key={t.id}
                  href={`/pipeline/${run.id}/${t.path}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-bg-card text-text-primary"
                      : status === "pending"
                        ? "text-text-muted"
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-card"
                  }`}
                >
                  <t.icon className={`w-4 h-4 ${isActive ? t.color : ""}`} />
                  <span className="flex-1">{t.label}</span>
                  {status === "active" && <ChevronRight className="w-3 h-3 text-accent animate-pulse" />}
                  {status === "completed" && <CheckCircle className="w-3 h-3 text-status-success" />}
                  {status === "error" && <span className="w-2 h-2 rounded-full bg-status-error" />}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          {isConnected ? (
            <><Wifi className="w-3 h-3 text-status-success" /> SSE connect&eacute;</>
          ) : (
            <><WifiOff className="w-3 h-3 text-status-error" /> D&eacute;connect&eacute;</>
          )}
        </div>
      </div>
    </aside>
  );
}
