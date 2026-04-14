"use client";

import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  title: string;
  url: string;
  description?: string;
  ogImage?: string;
  score: number;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}

export function CompetitorCard({ title, url, description, ogImage, score, checked, onToggle }: Props) {
  const domain = new URL(url).hostname.replace("www.", "");

  return (
    <Card selected={checked} hover className={`transition-opacity ${checked ? "opacity-100" : "opacity-60"}`}>
      <div className="flex items-start gap-3">
        <Checkbox checked={checked} onChange={onToggle} />

        <div className="flex-1 min-w-0">
          {ogImage && (
            <div className="mb-3 rounded-lg overflow-hidden bg-bg-surface aspect-video">
              <img src={ogImage} alt={title} className="w-full h-full object-cover" loading="lazy" />
            </div>
          )}

          <h4 className="text-sm font-medium text-text-primary truncate">{title}</h4>
          <p className="text-xs text-text-muted mt-0.5 truncate">{domain}</p>
          {description && (
            <p className="text-xs text-text-secondary mt-1 line-clamp-2">{description}</p>
          )}

          <div className="flex items-center gap-2 mt-2">
            <Badge variant={score >= 4 ? "success" : score >= 2 ? "warning" : "default"}>
              Score {score}
            </Badge>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Ouvrir <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
}
