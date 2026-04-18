"use client";

import { create } from "zustand";
import type { PipelineRun, SSEEvent, TunnelId, Inspiration, Brief, Brand } from "@/types/pipeline";

interface PipelineStore {
  run: PipelineRun | null;
  events: SSEEvent[];
  eventSource: EventSource | null;
  isConnected: boolean;

  setRun: (run: PipelineRun) => void;
  startSSE: (runId: string) => void;
  stopSSE: () => void;
  addEvent: (event: SSEEvent) => void;

  // Tunnel-specific state
  selectedInspirations: Inspiration[];
  toggleInspiration: (item: Inspiration) => void;
  setSelectedInspirations: (items: Inspiration[]) => void;
  clearInspirations: () => void;

  brief: Brief | null;
  setBrief: (brief: Brief) => void;

  brand: Brand | null;
  setBrand: (brand: Brand) => void;

  // Audit complet (stock\u00e9 pour alimenter les tunnels suivants)
  audit: { knownCompetitors: string[]; suggestedKeywords: string[] } | null;
  setAudit: (audit: { knownCompetitors: string[]; suggestedKeywords: string[] }) => void;
}

export const usePipelineStore = create<PipelineStore>((set, get) => ({
  run: null,
  events: [],
  eventSource: null,
  isConnected: false,

  setRun: (run) => set({ run }),

  startSSE: (runId) => {
    const existing = get().eventSource;
    if (existing) existing.close();

    const es = new EventSource(`/api/pipeline/stream/${runId}`);
    es.onmessage = (e) => {
      try {
        const event: SSEEvent = JSON.parse(e.data);
        get().addEvent(event);
      } catch { /* ignore parse errors */ }
    };
    es.onopen = () => set({ isConnected: true });
    es.onerror = () => set({ isConnected: false });
    set({ eventSource: es });
  },

  stopSSE: () => {
    get().eventSource?.close();
    set({ eventSource: null, isConnected: false });
  },

  addEvent: (event) =>
    set((s) => {
      // Bounded : cap \u00e0 200 events client-side pour \u00e9viter memory bloat
      const MAX_EVENTS = 200;
      const nextEvents = s.events.length >= MAX_EVENTS
        ? [...s.events.slice(-MAX_EVENTS + 1), event]
        : [...s.events, event];
      return {
        events: nextEvents,
        run: s.run ? { ...s.run, updatedAt: event.timestamp } : null,
      };
    }),

  selectedInspirations: [],
  toggleInspiration: (item) =>
    set((s) => {
      const exists = s.selectedInspirations.find((i) => i.id === item.id);
      if (exists) {
        return { selectedInspirations: s.selectedInspirations.filter((i) => i.id !== item.id) };
      }
      if (s.selectedInspirations.length >= 10) return s;
      return { selectedInspirations: [...s.selectedInspirations, { ...item, selected: true }] };
    }),
  setSelectedInspirations: (items) => set({ selectedInspirations: items }),
  clearInspirations: () => set({ selectedInspirations: [] }),

  brief: null,
  setBrief: (brief) => set({ brief }),

  brand: null,
  setBrand: (brand) => set({ brand }),

  audit: null,
  setAudit: (audit) => set({ audit }),
}));
