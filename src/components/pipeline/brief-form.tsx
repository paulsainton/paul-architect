"use client";

import { useState } from "react";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import type { Brief, ProjectType, DeviceTarget } from "@/types/pipeline";
import type { ProjectScan } from "@/lib/project-analyzer";

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: "website", label: "Site web" },
  { value: "webapp", label: "Web app" },
  { value: "mobile", label: "Mobile" },
  { value: "landing", label: "Landing page" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "dashboard", label: "Dashboard" },
  { value: "saas", label: "SaaS" },
];

interface Props {
  scan: ProjectScan;
  onSubmit: (brief: Brief) => void;
  loading?: boolean;
}

export function BriefForm({ scan, onSubmit, loading }: Props) {
  const [projectType, setProjectType] = useState<ProjectType>("webapp");
  const [sector, setSector] = useState(scan.claudeMdSummary.match(/Secteur\s*:\s*(.+)/i)?.[1] || "");
  const [excludedPages, setExcludedPages] = useState<string[]>([]);
  const [audience, setAudience] = useState("");
  const [vision, setVision] = useState("");
  const [priorities, setPriorities] = useState("");
  const [mood, setMood] = useState("");
  const [device, setDevice] = useState<DeviceTarget>("both");
  const [constraints, setConstraints] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const brief: Brief = {
      project: { slug: scan.slug, name: scan.name, type: projectType, sector },
      stack: scan.stack,
      detected: {
        pages: scan.pages.filter((p) => !excludedPages.includes(p)),
        components: scan.components,
        tokens: scan.tokens,
        features: scan.features,
      },
      paul: {
        audience,
        vision,
        priorities: priorities.split(",").map((s) => s.trim()).filter(Boolean),
        mood,
        device,
        constraints,
      },
      excludedPages,
      validatedAt: new Date().toISOString(),
    };
    onSubmit(brief);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section auto-détectée */}
      <Card>
        <h3 className="text-sm font-semibold mb-4 text-text-secondary uppercase tracking-wider">
          D&eacute;tect&eacute; automatiquement
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nom du projet" value={scan.name} readOnly />
          <Select
            label="Type"
            options={PROJECT_TYPES}
            value={projectType}
            onChange={(e) => setProjectType((e.target as HTMLSelectElement).value as ProjectType)}
          />
          <Input label="Secteur" value={sector} onChange={(e) => setSector(e.target.value)} placeholder="ex: Recettes cuisine" />
          <div>
            <span className="block text-xs text-text-secondary mb-1.5">Stack</span>
            <div className="flex flex-wrap gap-1.5">
              {[scan.stack.framework, scan.stack.ui, scan.stack.state].filter(Boolean).map((t) => (
                <Badge key={t} variant="info">{t}</Badge>
              ))}
            </div>
          </div>
        </div>

        {scan.pages.length > 0 && (
          <div className="mt-4">
            <span className="block text-xs text-text-secondary mb-2">Pages d&eacute;tect&eacute;es</span>
            <div className="flex flex-wrap gap-2">
              {scan.pages.map((p) => (
                <Checkbox
                  key={p}
                  checked={!excludedPages.includes(p)}
                  onChange={(checked) => {
                    setExcludedPages((prev) =>
                      checked ? prev.filter((x) => x !== p) : [...prev, p]
                    );
                  }}
                  label={p}
                />
              ))}
            </div>
          </div>
        )}

        {scan.components.length > 0 && (
          <div className="mt-4">
            <span className="block text-xs text-text-secondary mb-2">Composants</span>
            <div className="flex flex-wrap gap-1.5">
              {scan.components.slice(0, 20).map((c) => (
                <Badge key={c}>{c}</Badge>
              ))}
              {scan.components.length > 20 && (
                <Badge variant="accent">+{scan.components.length - 20}</Badge>
              )}
            </div>
          </div>
        )}

        {Object.keys(scan.tokens).length > 0 && (
          <div className="mt-4">
            <span className="block text-xs text-text-secondary mb-2">Tokens CSS</span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(scan.tokens).slice(0, 12).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1.5">
                  {val.startsWith("#") && (
                    <span className="w-4 h-4 rounded border border-border" style={{ background: val }} />
                  )}
                  <span className="text-xs text-text-muted">{key}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Section Paul */}
      <Card>
        <h3 className="text-sm font-semibold mb-4 text-text-secondary uppercase tracking-wider">
          Compl&eacute;ter le brief
        </h3>
        <div className="space-y-4">
          <Textarea label="Audience cible" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Jeunes adultes 25-35 qui cuisinent..." />
          <Input label="Vision en 1 phrase" value={vision} onChange={(e) => setVision(e.target.value)} placeholder="L'app cuisine qui donne envie de cuisiner" />
          <Input label="Fonctionnalit&eacute;s prioritaires (s&eacute;par&eacute;es par virgule)" value={priorities} onChange={(e) => setPriorities(e.target.value)} placeholder="UX page recette, Mode cuisson, Meal planning" />
          <Input label="Mood / ambiance" value={mood} onChange={(e) => setMood(e.target.value)} placeholder="Chaleureux, app\u00e9tissant, simple" />

          <div>
            <span className="block text-xs text-text-secondary mb-1.5">Device prioritaire</span>
            <div className="flex gap-3">
              {(["desktop", "mobile", "both"] as DeviceTarget[]).map((d) => (
                <label key={d} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="device"
                    value={d}
                    checked={device === d}
                    onChange={() => setDevice(d)}
                    className="accent-accent"
                  />
                  <span className="text-sm text-text-primary capitalize">{d === "both" ? "Les deux" : d}</span>
                </label>
              ))}
            </div>
          </div>

          <Textarea label="Contraintes sp&eacute;ciales" value={constraints} onChange={(e) => setConstraints(e.target.value)} placeholder="Pas de vid\u00e9os, images statiques uniquement..." />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Validation..." : "Valider le brief"}
        </Button>
      </div>
    </form>
  );
}
