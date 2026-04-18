"use client";

import { useState } from "react";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { EnrichedBriefSections } from "./enriched-brief-sections";
import type { Brief, ProjectType, DeviceTarget } from "@/types/pipeline";
import type { AuditedBrief } from "@/lib/brief-auditor";

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
  audit: AuditedBrief;
  onSubmit: (brief: Brief) => void;
  loading?: boolean;
}

export function BriefForm({ audit, onSubmit, loading }: Props) {
  const { scan, autofilled } = audit;

  // Pr\u00e9-remplissage depuis l'audit
  const [projectType, setProjectType] = useState<ProjectType>(autofilled.type);
  const [sector, setSector] = useState(autofilled.sector);
  const [excludedPages, setExcludedPages] = useState<string[]>([]);
  const [audience, setAudience] = useState(autofilled.audience);
  const [vision, setVision] = useState(autofilled.vision);
  const [priorities, setPriorities] = useState(autofilled.priorities.join(", "));
  const [mood, setMood] = useState(autofilled.mood);
  const [device, setDevice] = useState<DeviceTarget>(autofilled.device);
  const [constraints, setConstraints] = useState(autofilled.constraints);

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
      enriched: audit.enriched,
      excludedPages,
      validatedAt: new Date().toISOString(),
    };
    onSubmit(brief);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Audit notes */}
      <Card className="bg-accent/5 border-accent/30">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-accent">Audit automatique</h3>
        </div>
        <ul className="space-y-1">
          {audit.auditNotes.map((note, i) => (
            <li key={i} className="text-xs text-text-secondary">{note}</li>
          ))}
        </ul>
        {audit.targetUrl && (
          <p className="text-xs text-text-muted mt-2">
            URL prod : <a href={audit.targetUrl} target="_blank" rel="noopener noreferrer" className="text-accent underline">{audit.targetUrl}</a>
          </p>
        )}
      </Card>

      {/* Section d\u00e9tect\u00e9 */}
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
          <Input label="Secteur" value={sector} onChange={(e) => setSector(e.target.value)} />
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
            <span className="block text-xs text-text-secondary mb-2">Pages d&eacute;tect&eacute;es ({scan.pages.length})</span>
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
            <span className="block text-xs text-text-secondary mb-2">Composants ({scan.components.length})</span>
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
            <span className="block text-xs text-text-secondary mb-2">Tokens CSS ({Object.keys(scan.tokens).length})</span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(scan.tokens).slice(0, 16).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1.5" title={`${key}: ${val}`}>
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

      {/* BRIEF V3 \u2014 Sections enrichies (positionning, personas, journey, etc.) */}
      {audit.enriched && <EnrichedBriefSections {...audit.enriched} />}

      {/* Section Paul (pr\u00e9-rempli synth\u00e9tique) */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Synth&egrave;se brief &mdash; modifiable
          </h3>
        </div>
        <div className="space-y-4">
          <Textarea label="Audience cible" value={audience} onChange={(e) => setAudience(e.target.value)} rows={2} />
          <Input label="Vision en 1 phrase" value={vision} onChange={(e) => setVision(e.target.value)} />
          <Textarea
            label="Fonctionnalit&eacute;s prioritaires (s&eacute;par&eacute;es par virgule)"
            value={priorities}
            onChange={(e) => setPriorities(e.target.value)}
            rows={2}
          />
          <Input label="Mood / ambiance" value={mood} onChange={(e) => setMood(e.target.value)} />

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

          <Textarea label="Contraintes sp&eacute;ciales" value={constraints} onChange={(e) => setConstraints(e.target.value)} rows={2} />
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
