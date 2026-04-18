"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Rocket, Loader2, Sparkles } from "lucide-react";
import { ProjectSelector, type Project } from "@/components/pipeline/project-selector";
import { Button } from "@/components/ui/button";
import { usePipelineStore } from "@/stores/pipeline-store";

export default function NewPipelinePage() {
  const router = useRouter();
  const setRun = usePipelineStore((s) => s.setRun);
  const [selected, setSelected] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLaunch() {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch("/api/pipeline/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectSlug: selected.slug }),
      });
      const run = await res.json();
      setRun(run);
      router.push(`/pipeline/${run.id}/brief`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <h1 className="text-xl font-bold">Nouveau pipeline</h1>
        </div>
        <p className="text-sm text-text-muted">
          S&eacute;lectionnez un projet. Paul Architect va auditer le code, chercher des r&eacute;f&eacute;rences,
          extraire les tokens et pr&eacute;parer le brief.
        </p>
      </div>

      <div className="mb-6">
        <ProjectSelector onSelect={setSelected} selected={selected} />
      </div>

      {selected && (
        <div className="sticky bottom-0 bg-bg-primary/90 backdrop-blur-sm border-t border-border pt-4 -mx-6 px-6 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted">Projet s&eacute;lectionn&eacute;</p>
              <p className="text-sm font-medium text-text-primary">{selected.name}</p>
              <p className="text-[11px] text-text-muted font-mono">{selected.path}</p>
            </div>
            <Button size="lg" disabled={loading} onClick={handleLaunch}>
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Lancement...</>
              ) : (
                <><Rocket className="w-4 h-4" /> Lancer le pipeline</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
