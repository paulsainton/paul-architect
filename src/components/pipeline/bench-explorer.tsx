"use client";

import { useState, useEffect, useCallback } from "react";
import { BenchFilters } from "./bench-filters";
import { InspirationCard } from "./inspiration-card";
import { InspirationDetailModal } from "./inspiration-detail-modal";
import { Skeleton } from "@/components/ui/skeleton";
import type { Inspiration } from "@/types/pipeline";

interface Filters {
  category: string;
  subcategory: string;
  sector: string;
  style: string;
  device: string;
  search: string;
}

interface ExtendedInspiration extends Inspiration {
  contentFormat?: string;
  detectedTools?: string[];
  detectedWebsites?: string[];
  density?: string;
}

interface Props {
  selected: Inspiration[];
  maxSelection: number;
  onToggle: (item: Inspiration) => void;
  defaultSector?: string;
}

export function BenchExplorer({ selected, maxSelection, onToggle, defaultSector }: Props) {
  const [filters, setFilters] = useState<Filters>({
    category: "", subcategory: "", sector: defaultSector || "", style: "", device: "", search: "",
  });
  const [items, setItems] = useState<ExtendedInspiration[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailItem, setDetailItem] = useState<ExtendedInspiration | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.subcategory) params.set("subcategory", filters.subcategory);
    if (filters.sector) params.set("sector", filters.sector);
    if (filters.style) params.set("style", filters.style);
    if (filters.device) params.set("device", filters.device);
    if (filters.search) params.set("search", filters.search);
    params.set("limit", "40");

    try {
      const res = await fetch(`/api/pipeline/inspirations?${params}`);
      const data = await res.json();
      setItems(data);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(fetchItems, 300);
    return () => clearTimeout(t);
  }, [fetchItems]);

  const selectedIds = new Set(selected.map((s) => s.id));
  const benchSelected = selected.filter((s) => s.source === "bench").length;
  const canSelect = benchSelected < maxSelection;

  return (
    <div>
      <BenchFilters filters={filters} onChange={setFilters} />

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-8">Aucun r&eacute;sultat pour ces filtres</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => (
            <InspirationCard
              key={item.id}
              title={item.title}
              url={item.url}
              imageUrl={item.imageUrl}
              mediaUrls={item.mediaUrls}
              tags={item.tags}
              visualStyles={item.visualStyles}
              colorScheme={item.colorScheme}
              devices={item.devices}
              score={item.score}
              checked={selectedIds.has(item.id)}
              onToggle={() => {
                if (!selectedIds.has(item.id) && !canSelect) return;
                onToggle(item);
              }}
              onOpenDetail={() => setDetailItem(item)}
            />
          ))}
        </div>
      )}

      <InspirationDetailModal
        open={!!detailItem}
        onClose={() => setDetailItem(null)}
        item={detailItem}
      />
    </div>
  );
}
