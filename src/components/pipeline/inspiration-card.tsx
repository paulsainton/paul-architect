"use client";

import { useState } from "react";
import { ExternalLink, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  title: string;
  url: string;
  imageUrl?: string;
  mediaUrls?: string[];
  tags?: string[];
  visualStyles?: string[];
  colorScheme?: string;
  devices?: string[];
  score?: number;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  onZoom?: (imageUrl: string) => void;
}

export function InspirationCard({
  title, url, imageUrl, mediaUrls, tags, visualStyles, colorScheme, devices, score, checked, onToggle, onZoom,
}: Props) {
  const images = (mediaUrls && mediaUrls.length > 0 ? mediaUrls : imageUrl ? [imageUrl] : []).filter(Boolean);
  const [imgIdx, setImgIdx] = useState(0);
  const currentImage = images[imgIdx];
  const isCarousel = images.length > 1;

  return (
    <Card selected={checked} className={`overflow-hidden p-0 transition-opacity ${checked ? "opacity-100" : "opacity-85 hover:opacity-100"}`}>
      {/* Image principale : visuel en premier, gros */}
      {currentImage && (
        <div
          className="relative aspect-[4/3] bg-bg-surface cursor-pointer group overflow-hidden"
          onClick={() => onZoom?.(currentImage)}
        >
          <img
            src={currentImage}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />

          {/* Overlay au hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Carousel controls */}
          {isCarousel && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setImgIdx((i) => (i - 1 + images.length) % images.length); }}
                className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setImgIdx((i) => (i + 1) % images.length); }}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? "bg-white" : "bg-white/40"}`}
                  />
                ))}
              </div>
              <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded">
                {imgIdx + 1}/{images.length}
              </div>
            </>
          )}

          {/* Score badge */}
          {score !== undefined && score > 0 && (
            <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/70 text-white text-[10px] font-medium rounded">
              {score}
            </div>
          )}

          {/* Checkbox overlay */}
          <div
            className="absolute top-2 right-2 bg-black/70 rounded p-1"
            onClick={(e) => e.stopPropagation()}
            style={{ display: isCarousel ? "none" : "block" }}
          >
            <Checkbox checked={checked} onChange={onToggle} />
          </div>
        </div>
      )}

      {/* Meta sous l'image */}
      <div className="p-3 space-y-2">
        <div className="flex items-start gap-2">
          <Checkbox checked={checked} onChange={onToggle} />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-text-primary line-clamp-1">{title}</h4>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent mt-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                Voir l&apos;original <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Tags visuels */}
        {(visualStyles?.length || colorScheme || devices?.length) && (
          <div className="flex flex-wrap gap-1">
            {visualStyles?.slice(0, 2).map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
            {colorScheme && <Badge variant="info">{colorScheme}</Badge>}
            {devices?.slice(0, 1).map((d) => <Badge key={d} variant="accent">{d}</Badge>)}
          </div>
        )}

        {/* Tags m\u00e9tier (fallback) */}
        {!visualStyles?.length && tags?.length && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((t) => <Badge key={t}>{t}</Badge>)}
          </div>
        )}
      </div>
    </Card>
  );
}
