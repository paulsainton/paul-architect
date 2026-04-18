export type TunnelId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type TunnelStatus = "pending" | "active" | "completed" | "error" | "skipped";
export type PipelineStatus = "running" | "paused" | "completed" | "failed";
export type ProjectType = "website" | "webapp" | "mobile" | "landing" | "ecommerce" | "dashboard" | "saas";
export type DeviceTarget = "desktop" | "mobile" | "both";

export interface TunnelState {
  id: TunnelId;
  label: string;
  status: TunnelStatus;
  startedAt?: string;
  completedAt?: string;
}

export interface PipelineRun {
  id: string;
  projectSlug: string;
  status: PipelineStatus;
  currentTunnel: TunnelId;
  tunnels: Record<TunnelId, TunnelState>;
  brief?: Brief;
  inspirations?: Inspiration[];
  mergedTokens?: MergedTokens;
  brand?: Brand;
  createdAt: string;
  updatedAt: string;
}

export interface Brief {
  project: {
    slug: string;
    name: string;
    type: ProjectType;
    sector: string;
  };
  stack: {
    framework: string;
    ui: string;
    state: string;
  };
  detected: {
    pages: string[];
    components: string[];
    tokens: Record<string, string>;
    features: string[];
  };
  paul: {
    audience: string;
    vision: string;
    priorities: string[];
    mood: string;
    device: DeviceTarget;
    constraints: string;
  };
  excludedPages: string[];
  validatedAt: string;
}

export interface Inspiration {
  id: string;
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  thumbnail?: string;
  mediaUrls?: string[];
  source: "web" | "bench";
  score?: number;
  tags?: string[];
  category?: string;
  subCategory?: string;
  visualStyles?: string[];
  colorScheme?: string;
  devices?: string[];
  businessSectors?: string[];
  keyFeatures?: string[];
  selected: boolean;
}

export interface MergedTokens {
  colors: { hex: string; frequency: number; source: string }[];
  fonts: { family: string; count: number }[];
  spacing: { value: string; count: number }[];
  shadows: string[];
  borderRadius: string[];
}

export interface ExtractionResult {
  url: string;
  domain: string;
  tokens: MergedTokens;
  screenshots: { desktop?: string; mobile?: string };
  designMd?: string;
  layoutAnalysis?: string;
  status: "complete" | "partial" | "failed";
}

export interface BrandOption {
  option: "A" | "B" | "C";
  palette: BrandPalette;
  typography: { heading: string; body: string };
  borderRadius: string;
  imageUrl?: string;
  stitchProjectId?: string;
}

export interface BrandPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

export interface Brand {
  selectedOption: "A" | "B" | "C";
  palette: BrandPalette;
  typography: { heading: string; body: string };
  borderRadius: string;
  stitchProjectId?: string;
  source: "stitch-sdk";
  validatedAt: string;
}

export interface PersonaAnalysis {
  name: string;
  role: string;
  summary: string;
  recommendations: string[];
}

export interface QAScore {
  codeQuality: number;
  technicalRobustness: number;
  visualFidelity: number;
  completeness: number;
  total: number;
  verdict: "PASS" | "FAIL";
  issues: { severity: "critical" | "warning" | "info"; message: string; file?: string; line?: number }[];
}

export interface SSEEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export const TUNNEL_LABELS: Record<TunnelId, string> = {
  1: "Collecte",
  2: "Inspirations",
  3: "Clone",
  4: "Identit\u00e9",
  5: "Analyse",
  6: "Code",
  7: "Maquettes",
  8: "QA",
};
