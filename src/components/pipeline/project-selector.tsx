"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Folder, Search, Loader2, Check, Globe } from "lucide-react";

export interface Project {
  slug: string;
  name: string;
  path: string;
  hasClaudeMd: boolean;
  description?: string;
  type?: string;
  sector?: string;
  stack?: string;
  port?: number;
  url?: string;
  lastCommit?: string;
  keywords: string[];
}

interface Props {
  onSelect: (project: Project) => void;
  selected?: Project | null;
}

function matchScore(project: Project, query: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  let score = 0;
  if (project.slug.toLowerCase() === q) score += 100;
  if (project.slug.toLowerCase().includes(q)) score += 50;
  if (project.name.toLowerCase().includes(q)) score += 40;
  if (project.description?.toLowerCase().includes(q)) score += 30;
  if (project.sector?.toLowerCase().includes(q)) score += 20;
  if (project.stack?.toLowerCase().includes(q)) score += 10;
  project.keywords.forEach((k) => { if (k.includes(q)) score += 15; });
  return score;
}

export function ProjectSelector({ onSelect, selected }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!query) return projects;
    return projects
      .map((p) => ({ ...p, _score: matchScore(p, query) }))
      .filter((p) => p._score > 0)
      .sort((a, b) => b._score - a._score);
  }, [projects, query]);

  return (
    <div className="space-y-3">
      {/* Input search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un projet (tape son nom, secteur, stack...)"
          className="w-full pl-10 pr-4 py-3 rounded-lg bg-bg-surface border border-border focus:outline-none focus:border-accent text-sm text-text-primary placeholder:text-text-muted"
          autoFocus
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-text-muted" />
        )}
      </div>

      {/* Liste des projets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
        {loading && projects.length === 0 && (
          <div className="col-span-2 text-sm text-text-muted text-center py-8">
            Chargement des projets...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="col-span-2 text-sm text-text-muted text-center py-8">
            Aucun projet trouv&eacute; pour &laquo; {query} &raquo;
          </div>
        )}

        {filtered.map((p) => {
          const isSelected = selected?.slug === p.slug;
          return (
            <button
              key={p.slug}
              type="button"
              onClick={() => onSelect(p)}
              className={`text-left p-3 rounded-lg border transition-all ${
                isSelected
                  ? "border-accent bg-accent/10"
                  : "border-border bg-bg-surface hover:border-border-hover hover:bg-bg-card"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? "bg-accent text-white" : "bg-bg-card text-text-muted"
                }`}>
                  {isSelected ? <Check className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-medium text-text-primary truncate">{p.name}</p>
                    {p.hasClaudeMd && (
                      <span className="text-[9px] bg-accent/15 text-accent px-1.5 py-0.5 rounded">CLAUDE.md</span>
                    )}
                  </div>
                  {p.description && (
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{p.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[10px] text-text-muted">
                    {p.type && <span className="uppercase">{p.type}</span>}
                    {p.sector && <>&middot; <span>{p.sector}</span></>}
                    {p.port && <>&middot; <span>:{p.port}</span></>}
                    {p.lastCommit && <>&middot; <span>{p.lastCommit}</span></>}
                  </div>
                  {p.url && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-accent">
                      <Globe className="w-3 h-3" />
                      <span className="truncate">{p.url.replace(/^https?:\/\//, "")}</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
