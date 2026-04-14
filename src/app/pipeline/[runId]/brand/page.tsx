"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowRight, Palette } from "lucide-react";
import { BrandOptionCard } from "@/components/pipeline/brand-option";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePipelineStore } from "@/stores/pipeline-store";
import type { BrandOption, Brand } from "@/types/pipeline";

export default function BrandPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.runId as string;
  const brief = usePipelineStore((s) => s.brief);
  const setBrand = usePipelineStore((s) => s.setBrand);
  const run = usePipelineStore((s) => s.run);

  const [options, setOptions] = useState<BrandOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const generate = useCallback(async () => {
    if (loading || !brief || !run?.mergedTokens) return;
    setLoading(true);
    try {
      const res = await fetch("/api/pipeline/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId,
          tokens: run.mergedTokens,
          brief,
        }),
      });
      const data = await res.json();
      setOptions(data);
    } catch { /* handled */ }
    setLoading(false);
  }, [loading, brief, run, runId]);

  useEffect(() => {
    if (options.length === 0 && !loading) generate();
  }, [options.length, loading, generate]);

  async function handleValidate() {
    if (!selectedOption) return;
    const chosen = options.find((o) => o.option === selectedOption);
    if (!chosen) return;

    setSubmitting(true);
    const brand: Brand = {
      selectedOption,
      palette: chosen.palette,
      typography: chosen.typography,
      borderRadius: chosen.borderRadius,
      stitchProjectId: chosen.stitchProjectId,
      source: "stitch-sdk",
      validatedAt: new Date().toISOString(),
    };

    await fetch("/api/pipeline/run", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId, brand }),
    });

    setBrand(brand);
    router.push(`/pipeline/${runId}/analysis`);
  }

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Palette className="w-5 h-5 text-tunnel-4" />
        <h2 className="text-lg font-semibold">Identit&eacute; visuelle</h2>
        <Badge variant="accent">T4</Badge>
      </div>

      <p className="text-sm text-text-muted mb-6">
        3 propositions g&eacute;n&eacute;r&eacute;es par Stitch SDK. S&eacute;lectionnez celle qui correspond le mieux au projet.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-text-muted py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          G&eacute;n&eacute;ration des propositions via Stitch SDK...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {options.map((opt) => (
            <BrandOptionCard
              key={opt.option}
              option={opt}
              selected={selectedOption === opt.option}
              onSelect={() => setSelectedOption(opt.option)}
            />
          ))}
        </div>
      )}

      {selectedOption && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Option s&eacute;lectionn&eacute;e : <strong className="text-text-primary">{selectedOption}</strong>
          </p>
          <Button onClick={handleValidate} disabled={submitting}>
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Validation...</>
            ) : (
              <>Valider l&apos;identit&eacute; <ArrowRight className="w-4 h-4" /></>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
