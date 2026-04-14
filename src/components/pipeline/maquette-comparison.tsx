"use client";

import { CheckCircle, XCircle, Edit3, ExternalLink, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  refUrl: string;
  refDomain: string;
  refScreenshot?: string;
  maquetteImage?: string;
  status: "generating" | "ready" | "approved" | "rejected" | "fallback";
  onApprove: () => void;
  onReject: () => void;
  onZoom: (url: string) => void;
}

export function MaquetteComparison({
  refUrl, refDomain, refScreenshot, maquetteImage, status, onApprove, onReject, onZoom,
}: Props) {
  return (
    <Card className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="info">Inspir&eacute; de {refDomain}</Badge>
        {status === "approved" && <Badge variant="success">Approuv&eacute;</Badge>}
        {status === "rejected" && <Badge variant="error">Rejet&eacute;</Badge>}
        {status === "fallback" && <Badge variant="warning">Fallback</Badge>}
        {status === "generating" && <Badge variant="accent"><Loader2 className="w-3 h-3 animate-spin mr-1" />G&eacute;n&eacute;ration</Badge>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Ref screenshot */}
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">R&eacute;f&eacute;rence</p>
          {refScreenshot ? (
            <div
              className="rounded-lg overflow-hidden bg-bg-surface aspect-video cursor-pointer border border-border hover:border-border-hover"
              onClick={() => onZoom(refScreenshot)}
            >
              <img src={refScreenshot} alt={refDomain} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="rounded-lg bg-bg-surface aspect-video flex items-center justify-center border border-border">
              <a href={refUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent flex items-center gap-1">
                Voir le site <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Maquette Stitch */}
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Maquette Stitch</p>
          {maquetteImage ? (
            <div
              className="rounded-lg overflow-hidden bg-bg-surface aspect-video cursor-pointer border border-border hover:border-border-hover"
              onClick={() => onZoom(maquetteImage)}
            >
              <img src={maquetteImage} alt="Maquette" className="w-full h-full object-cover" />
            </div>
          ) : status === "generating" ? (
            <div className="rounded-lg bg-bg-surface aspect-video flex items-center justify-center border border-border">
              <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
            </div>
          ) : (
            <div className="rounded-lg bg-bg-surface aspect-video flex items-center justify-center border border-border">
              <p className="text-xs text-text-muted">Non disponible</p>
            </div>
          )}
        </div>
      </div>

      {status === "ready" && (
        <div className="flex items-center gap-2 mt-3">
          <Button size="sm" variant="primary" onClick={onApprove}>
            <CheckCircle className="w-3.5 h-3.5" /> Approuver
          </Button>
          <Button size="sm" variant="danger" onClick={onReject}>
            <XCircle className="w-3.5 h-3.5" /> Rejeter
          </Button>
        </div>
      )}
    </Card>
  );
}
