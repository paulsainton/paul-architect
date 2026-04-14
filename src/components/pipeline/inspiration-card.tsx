"use client";

import { ExternalLink, ZoomIn } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  title: string;
  url: string;
  imageUrl?: string;
  tags?: string[];
  score?: number;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  onZoom?: () => void;
}

export function InspirationCard({ title, url, imageUrl, tags, score, checked, onToggle, onZoom }: Props) {
  return (
    <Card selected={checked} hover className={`transition-opacity ${checked ? "opacity-100" : "opacity-60"}`}>
      {imageUrl && (
        <div
          className="relative mb-3 rounded-lg overflow-hidden bg-bg-surface aspect-video cursor-pointer group"
          onClick={onZoom}
        >
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      )}

      <div className="flex items-start gap-2">
        <Checkbox checked={checked} onChange={onToggle} />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-text-primary truncate">{title}</h4>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent mt-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              Ouvrir <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {(tags?.length || score) && (
            <div className="flex flex-wrap items-center gap-1 mt-2">
              {score !== undefined && score > 0 && <Badge variant="accent">{score}</Badge>}
              {tags?.slice(0, 3).map((tag) => <Badge key={tag}>{tag}</Badge>)}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
