"use client";

import { Target, Users, Sparkles, Map, Megaphone, Layers, TrendingUp, AlertTriangle, Calendar, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Persona, ValueProp, FeatureTier, UserJourneyStep, MarketingAngle, Risk, RoadmapPhase } from "@/types/pipeline";

interface Props {
  positioning: string;
  uniqueSellingPoint: string;
  valueProps: ValueProp[];
  personas: Persona[];
  userJourney: UserJourneyStep[];
  marketingAngles: MarketingAngle[];
  features: FeatureTier[];
  kpis: string[];
  risks: Risk[];
  roadmap: RoadmapPhase[];
}

export function EnrichedBriefSections(props: Props) {
  return (
    <div className="space-y-6">
      {/* POSITIONING + USP */}
      <Card className="border-accent/30 bg-accent/5">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-accent uppercase tracking-wider">Positionnement &amp; USP</h3>
        </div>
        <p className="text-sm text-text-primary leading-relaxed mb-3">{props.positioning}</p>
        <div className="p-3 rounded-lg bg-bg-surface border border-accent/40">
          <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Unique Selling Point</p>
          <p className="text-sm font-medium text-text-primary italic">&laquo; {props.uniqueSellingPoint} &raquo;</p>
        </div>
      </Card>

      {/* VALUE PROPS */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-tunnel-4" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">Propositions de valeur</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {props.valueProps.map((vp, i) => (
            <div key={i} className="p-3 rounded-lg bg-bg-surface border border-border">
              <p className="text-sm font-semibold text-text-primary mb-1">{vp.title}</p>
              <p className="text-xs text-text-secondary leading-relaxed">{vp.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* PERSONAS */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-tunnel-2" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">Personas cibles</h3>
        </div>
        <div className="space-y-4">
          {props.personas.map((p, i) => (
            <div key={i} className="p-4 rounded-lg bg-bg-surface border border-border">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tunnel-2 to-tunnel-4 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {p.name.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{p.name} &mdash; {p.age}</p>
                  <p className="text-xs text-text-muted">{p.role}</p>
                </div>
                <Badge variant="accent">Persona {i + 1}</Badge>
              </div>

              <div className="mb-3 pl-4 border-l-2 border-accent/50">
                <Quote className="w-3 h-3 text-accent mb-1" />
                <p className="text-xs italic text-text-secondary">{p.quote}</p>
              </div>

              <div className="mb-3">
                <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1.5">Pain points</p>
                <ul className="space-y-1">
                  {p.painPoints.map((pp, j) => (
                    <li key={j} className="text-xs text-text-secondary flex gap-1.5">
                      <span className="text-status-error mt-0.5">&bull;</span>
                      <span>{pp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted">Budget</p>
                  <p className="text-text-secondary">{p.budget}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted">D&eacute;couverte</p>
                  <p className="text-text-secondary">{p.discoveryChannel}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* USER JOURNEY */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Map className="w-4 h-4 text-tunnel-5" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">Parcours utilisateur</h3>
        </div>
        <div className="space-y-2">
          {props.userJourney.map((step, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-bg-surface border border-border">
              <div className="w-6 h-6 rounded-full bg-tunnel-5/20 text-tunnel-5 flex items-center justify-center text-xs font-bold shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-text-primary">{step.label}</p>
                  <Badge variant="info">{step.stage}</Badge>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* MARKETING ANGLES */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-4 h-4 text-tunnel-7" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">Angles marketing</h3>
        </div>
        <div className="space-y-3">
          {props.marketingAngles.map((m, i) => (
            <div key={i} className="p-3 rounded-lg bg-bg-surface border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="accent">#{i + 1} {m.angle}</Badge>
                <span className="text-[10px] text-text-muted">&rarr; {m.channel}</span>
              </div>
              <p className="text-sm text-text-primary italic">&laquo; {m.hook} &raquo;</p>
            </div>
          ))}
        </div>
      </Card>

      {/* FEATURES P0/P1/P2 */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-tunnel-6" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">Scope priorisation</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {props.features.map((tier, i) => {
            const colors = ["bg-tunnel-6/10 border-tunnel-6/40", "bg-tunnel-4/10 border-tunnel-4/40", "bg-text-muted/10 border-text-muted/40"];
            return (
              <div key={i} className={`p-3 rounded-lg border ${colors[i]}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={i === 0 ? "success" : i === 1 ? "accent" : "default"}>{tier.tier}</Badge>
                  <span className="text-[10px] text-text-muted">{tier.label}</span>
                </div>
                <ul className="space-y-1">
                  {tier.features.map((f, j) => (
                    <li key={j} className="text-xs text-text-secondary flex gap-1.5">
                      <span className="text-accent mt-0.5">&rarr;</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Card>

      {/* KPIs */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-tunnel-1" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">KPIs &agrave; suivre</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {props.kpis.map((k, i) => (
            <Badge key={i} variant="info">{k}</Badge>
          ))}
        </div>
      </Card>

      {/* RISQUES */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-status-warning" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">Risques &amp; mitigation</h3>
        </div>
        <div className="space-y-2">
          {props.risks.map((r, i) => (
            <div key={i} className="p-3 rounded-lg bg-bg-surface border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={r.category === "tech" ? "info" : r.category === "legal" ? "error" : r.category === "market" ? "warning" : "default"}>
                  {r.category}
                </Badge>
                <p className="text-xs text-text-primary">{r.description}</p>
              </div>
              <p className="text-[10px] text-text-muted pl-1">
                <strong>Mitigation :</strong> {r.mitigation}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* ROADMAP */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-tunnel-3" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">Roadmap</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {props.roadmap.map((phase, i) => (
            <div key={i} className="p-3 rounded-lg bg-bg-surface border border-border">
              <Badge variant="accent" className="mb-2">{phase.horizon === "3mo" ? "3 mois" : phase.horizon === "6mo" ? "6 mois" : "12 mois"}</Badge>
              <ul className="space-y-1 mt-2">
                {phase.goals.map((g, j) => (
                  <li key={j} className="text-xs text-text-secondary flex gap-1.5">
                    <span className="text-accent mt-0.5">&rarr;</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
