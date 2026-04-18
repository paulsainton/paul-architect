"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ExternalLink, Star } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  item: {
    title: string;
    url?: string;
    description?: string;
    mediaUrls?: string[];
    imageUrl?: string;
    tags?: string[];
    visualStyles?: string[];
    colorScheme?: string;
    devices?: string[];
    businessSectors?: string[];
    keyFeatures?: string[];
    detectedTools?: string[];
    detectedWebsites?: string[];
    contentFormat?: string;
    category?: string;
    subCategory?: string;
    score?: number;
  } | null;
}

export function InspirationDetailModal({ open, onClose, item }: Props) {
  const [idx, setIdx] = useState(0);
  if (!item) return null;

  const images = item.mediaUrls && item.mediaUrls.length > 0 ? item.mediaUrls : item.imageUrl ? [item.imageUrl] : [];
  const current = images[Math.min(idx, images.length - 1)];

  return (
    <Modal open={open} onClose={onClose} className="max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Image grande avec carrousel */}
        <div className="lg:col-span-3">
          <div className="relative bg-bg-surface rounded-lg overflow-hidden aspect-square">
            {current && (
              <img src={current} alt={item.title} className="w-full h-full object-contain" />
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIdx((i) => (i + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/60 rounded-full px-3 py-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIdx(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${i === idx ? "bg-white" : "bg-white/40"}`}
                    />
                  ))}
                </div>
                <div className="absolute top-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {idx + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails strip */}
          {images.length > 1 && (
            <div className="flex gap-1 mt-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  className={`shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${i === idx ? "border-accent" : "border-border hover:border-border-hover"}`}
                >
                  <img src={img} alt={`${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* M\u00e9tadonn\u00e9es */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-text-primary">{item.title}</h3>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-1"
              >
                {new URL(item.url).hostname} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {item.score !== undefined && item.score > 0 && (
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-status-warning fill-current" />
              <span className="text-sm text-text-secondary">Quality score : <strong className="text-text-primary">{item.score}/100</strong></span>
            </div>
          )}

          {item.description && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Description</p>
              <p className="text-sm text-text-secondary leading-relaxed">{item.description}</p>
            </div>
          )}

          {item.keyFeatures && item.keyFeatures.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Key features</p>
              <ul className="space-y-1">
                {item.keyFeatures.map((f, i) => (
                  <li key={i} className="text-xs text-text-secondary pl-3 border-l-2 border-border">{f}</li>
                ))}
              </ul>
            </div>
          )}

          {item.visualStyles && item.visualStyles.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Styles visuels</p>
              <div className="flex flex-wrap gap-1">
                {item.visualStyles.map((s) => <Badge key={s} variant="accent">{s}</Badge>)}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs">
            {item.colorScheme && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted">Palette</p>
                <Badge variant="info">{item.colorScheme}</Badge>
              </div>
            )}
            {item.devices && item.devices.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted">Device</p>
                <div className="flex gap-1">
                  {item.devices.map((d) => <Badge key={d}>{d}</Badge>)}
                </div>
              </div>
            )}
            {item.category && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted">Cat&eacute;gorie</p>
                <Badge>{item.category}</Badge>
              </div>
            )}
            {item.contentFormat && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted">Format</p>
                <Badge>{item.contentFormat}</Badge>
              </div>
            )}
          </div>

          {item.businessSectors && item.businessSectors.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Secteurs</p>
              <div className="flex flex-wrap gap-1">
                {item.businessSectors.map((s) => <Badge key={s}>{s}</Badge>)}
              </div>
            </div>
          )}

          {(item.detectedTools?.length || item.detectedWebsites?.length) && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Outils / Sites</p>
              <div className="flex flex-wrap gap-1">
                {item.detectedTools?.map((t) => <Badge key={t} variant="info">{t}</Badge>)}
                {item.detectedWebsites?.map((w) => <Badge key={w} variant="success">{w}</Badge>)}
              </div>
            </div>
          )}

          {item.tags && item.tags.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Tags</p>
              <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 8).map((t) => <Badge key={t}>{t}</Badge>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
