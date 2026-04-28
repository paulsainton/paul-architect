import { z } from "zod";

// ========================================
// SCHEMAS de validation runtime des routes POST
// ========================================

export const loginSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(200),
});

// Slugs réservés interdits comme cible (auto-écrasement / système)
const RESERVED_SLUG_SET = new Set([
  "paul-architect", "orchestrator", "orchestrator-mcp", "orchestrator-dashboard",
  "empiredone", "nginx", "root", "etc", "bin", "usr", "var", "lib", "boot", "sys", "proc", "tmp",
]);

export const createRunSchema = z.object({
  projectSlug: z.string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/, "Slug invalide")
    .refine((s) => !RESERVED_SLUG_SET.has(s.toLowerCase().trim()), {
      message: "Slug réservé (paul-architect, orchestrator, root, etc.) interdit",
    }),
});

export const patchRunSchema = z.object({
  runId: z.string().min(1).max(100),
  skipTunnelAdvance: z.boolean().optional(),
  brief: z.unknown().optional(),
  inspirations: z.array(z.unknown()).optional(),
  brand: z.unknown().optional(),
  analysis: z.unknown().optional(),
  mergedTokens: z.unknown().optional(),
});

export const analyzeSchema = z.object({
  runId: z.string().min(1).max(100),
  projectPath: z.string().optional(),
});

export const cloneSchema = z.object({
  runId: z.string().min(1).max(100),
  urls: z.array(z.string().url()).min(1).max(15),
});

export const brandSchema = z.object({
  runId: z.string().min(1).max(100),
  tokens: z.unknown(),
  brief: z.unknown(),
});

export const analysisSchema = z.object({
  runId: z.string().min(1).max(100),
  brief: z.unknown(),
  brand: z.unknown().optional(),
  tokens: z.unknown().optional(),
  inspirationsCount: z.number().int().min(0).max(50).optional(),
});

export const stitchInstantSchema = z.object({
  projectName: z.string().min(1).max(150),
  prompt: z.string().min(10).max(4000),
  device: z.enum(["DESKTOP", "MOBILE", "TABLET"]).optional(),
});

export const stitchMaquettesSchema = z.object({
  runId: z.string().min(1).max(100),
  inspirations: z.array(z.unknown()).min(1).max(10),
  brief: z.unknown(),
  brand: z.unknown(),
});

export const scrapeCompetitorsSchema = z.object({
  runId: z.string().min(1).max(100),
  sector: z.string().max(200).optional(),
  type: z.string().max(50).optional(),
  projectName: z.string().max(150).optional(),
  knownCompetitors: z.array(z.string()).max(20).optional(),
  keywords: z.array(z.string()).max(20).optional(),
});

export const generateCodeSchema = z.object({
  runId: z.string().min(1).max(100),
  context: z.object({
    brief: z.unknown(),
    brand: z.unknown(),
    tokens: z.unknown().optional(),
    analysis: z.array(z.unknown()).optional(),
    pages: z.array(z.string()).min(1).max(30),
  }),
});

export const reviewSchema = z.object({
  runId: z.string().min(1).max(100),
  pagesValidated: z.number().int().min(0).max(100).optional(),
  totalPages: z.number().int().min(1).max(100).optional(),
  maquettesApproved: z.number().int().min(0).max(50).optional(),
  totalMaquettes: z.number().int().min(1).max(50).optional(),
});

export const deploySchema = z.object({
  runId: z.string().min(1).max(100),
  commitMessage: z.string().min(1).max(500).optional(),
});

/**
 * Helper : valide un body JSON et retourne {success, data, error}
 */
export async function validateBody<T>(
  request: Request,
  schema: z.ZodType<T>
): Promise<{ success: true; data: T } | { success: false; error: string; status: number }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { success: false, error: "Invalid JSON body", status: 400 };
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    const msg = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return { success: false, error: msg, status: 400 };
  }
  return { success: true, data: result.data };
}
