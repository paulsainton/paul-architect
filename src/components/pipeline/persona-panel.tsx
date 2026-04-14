"use client";

import { Brain, CheckCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  name: string;
  role: string;
  text: string;
  status: "pending" | "streaming" | "complete";
}

const AVATARS: Record<string, { emoji: string; color: string }> = {
  "Architecte Info": { emoji: "\ud83c\udfd7\ufe0f", color: "bg-tunnel-1" },
  "Int\u00e9grateur UI": { emoji: "\ud83e\udde9", color: "bg-tunnel-2" },
  "Coh\u00e9rence Brand": { emoji: "\ud83c\udfa8", color: "bg-tunnel-4" },
  "Dev Technique": { emoji: "\u2699\ufe0f", color: "bg-tunnel-6" },
};

export function PersonaPanel({ name, role, text, status }: Props) {
  const avatar = AVATARS[name] || { emoji: "\ud83e\udde0", color: "bg-accent" };

  return (
    <Card className="mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 rounded-lg ${avatar.color} flex items-center justify-center text-sm`}>
          {avatar.emoji}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">{name}</p>
          <p className="text-xs text-text-muted">{role}</p>
        </div>
        {status === "streaming" && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
        {status === "complete" && <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Termin&eacute;</Badge>}
      </div>

      {text ? (
        <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{text}</p>
      ) : status === "pending" ? (
        <p className="text-sm text-text-muted italic">En attente...</p>
      ) : null}
    </Card>
  );
}
