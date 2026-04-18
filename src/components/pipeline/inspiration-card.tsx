"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  onOpenDetail?: () => void;
}

export function InspirationCard({
  title, imageUrl, mediaUrls, visualStyles, colorScheme, devices, score, checked, onToggle, onOpenDetail,
}: Props) {
  const images = (mediaUrls && mediaUrls.length > 0 ? mediaUrls : imageUrl ? [imageUrl] : []).filter(Boolean);
  const [imgIdx, setImgIdx] = useState(0);
  const currentImage = images[imgIdx];
  const isCarousel = images.length > 1;

  return (
    <div
      className={`group rounded-xl overflow-hidden border transition-all ${
        checked ? "border-accent ring-2 ring-accent/30" : "border-border hover:border-border-hover"
      }`}
    >
      {/* Image XXL — focus visuel total */}
      <div className="relative aspect-square bg-bg-surface overflow-hidden cursor-pointer" onClick={onOpenDetail}>
        {currentImage ? (
          <img
            src={currentImage}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.background = "var(--color-bg-card)";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
            Pas d&apos;image
          </div>
        )}

        {/* Overlay hover \u2014 pointer-events-none pour ne pas bloquer le click */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <div className="flex items-center gap-2 text-white">
            <Maximize2 className="w-4 h-4" />
            <span className="text-xs">Voir les d&eacute;tails</span>
          </div>
        </div>

        {/* Carousel controls */}
        {isCarousel && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setImgIdx((i) => (i - 1 + images.length) % images.length); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/90 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setImgIdx((i) => (i + 1) % images.length); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/90 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute top-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
              {imgIdx + 1}/{images.length}
            </div>
          </>
        )}

        {/* Score badge */}
        {score !== undefined && score > 0 && (
          <div className="absolute top-2 left-2 bg-black/80 text-white text-[11px] px-2 py-0.5 rounded font-semibold">
            {score}
          </div>
        )}

        {/* Checkbox overlay prominent */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggle(!checked); }}
          className={`absolute bottom-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            checked
              ? "bg-accent text-white scale-110"
              : "bg-black/60 text-white/80 hover:bg-black/80 opacity-0 group-hover:opacity-100"
          }`}
        >
          <Check className="w-4 h-4" />
        </button>
      </div>

      {/* Meta ultra-compacte sous l'image */}
      <div className="p-2.5 bg-bg-card">
        <h4 className="text-xs font-medium text-text-primary line-clamp-1 mb-1">{title}</h4>
        <div className="flex flex-wrap gap-1">
          {visualStyles?.slice(0, 2).map((s) => <Badge key={s}>{s}</Badge>)}
          {colorScheme && <Badge variant="info">{colorScheme}</Badge>}
          {devices?.[0] && <Badge variant="accent">{devices[0]}</Badge>}
        </div>
      </div>
    </div>
  );
}
