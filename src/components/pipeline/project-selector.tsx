"use client";

import { useState, useEffect } from "react";
import { Folder, ChevronDown, Loader2 } from "lucide-react";

interface Project {
  slug: string;
  name: string;
  path: string;
  hasClaudeMd: boolean;
  type?: string;
  sector?: string;
}

interface Props {
  onSelect: (project: Project) => void;
  selected?: Project | null;
}

export function ProjectSelector({ onSelect, selected }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-bg-surface border border-border hover:border-border-hover transition-colors text-left"
      >
        <Folder className="w-4 h-4 text-text-muted shrink-0" />
        <div className="flex-1 min-w-0">
          {loading ? (
            <span className="text-sm text-text-muted flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" /> Chargement...
            </span>
          ) : selected ? (
            <div>
              <p className="text-sm font-medium text-text-primary truncate">{selected.name}</p>
              <p className="text-xs text-text-muted truncate">{selected.path}</p>
            </div>
          ) : (
            <span className="text-sm text-text-muted">S&eacute;lectionner un projet</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-bg-surface shadow-lg max-h-64 overflow-y-auto">
          {projects.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => { onSelect(p); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-bg-card transition-colors"
            >
              <Folder className="w-4 h-4 text-text-muted shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary truncate">{p.name}</p>
                <p className="text-[11px] text-text-muted truncate">
                  {p.type || "Projet"} {p.sector ? `\u00b7 ${p.sector}` : ""}
                </p>
              </div>
              {p.hasClaudeMd && (
                <span className="text-[10px] bg-accent/15 text-accent px-1.5 py-0.5 rounded">CLAUDE.md</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
