"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Rocket, Loader2 } from "lucide-react";
import { ProjectSelector } from "@/components/pipeline/project-selector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePipelineStore } from "@/stores/pipeline-store";

interface Project {
  slug: string;
  name: string;
  path: string;
  hasClaudeMd: boolean;
  type?: string;
  sector?: string;
}

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
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-2">Nouveau pipeline</h1>
        <p className="text-sm text-text-muted">
          S&eacute;lectionnez un projet pour lancer le pipeline de design complet.
        </p>
      </div>

      <Card className="mb-6">
        <label className="block text-xs text-text-secondary mb-2">Projet cible</label>
        <ProjectSelector onSelect={setSelected} selected={selected} />

        {selected && (
          <div className="mt-4 p-3 rounded-lg bg-bg-surface text-xs text-text-secondary space-y-1">
            <p><strong>Chemin :</strong> {selected.path}</p>
            {selected.type && <p><strong>Stack :</strong> {selected.type}</p>}
            {selected.sector && <p><strong>Secteur :</strong> {selected.sector}</p>}
          </div>
        )}
      </Card>

      <Button size="lg" disabled={!selected || loading} onClick={handleLaunch} className="w-full">
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Lancement...</>
        ) : (
          <><Rocket className="w-4 h-4" /> Lancer le pipeline</>
        )}
      </Button>
    </div>
  );
}
