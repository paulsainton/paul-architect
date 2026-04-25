/**
 * Config centralis\u00e9e \u2014 lecture env \u00e0 CHAQUE acc\u00e8s (pas bundle time).
 * Next.js inline les const env \u00e0 build-time si on fait `process.env.X || "default"`.
 * Pour lire \u00e0 runtime, on utilise un proxy avec getters.
 */

function read(key: string, fallback = ""): string {
  return process.env[key] || fallback;
}

function readInt(key: string, fallback: number): number {
  const v = process.env[key];
  if (!v) return fallback;
  const n = parseInt(v, 10);
  return isNaN(n) ? fallback : n;
}

export const CONFIG = {
  get BENCH_API() { return read("BENCH_API", "http://localhost:3010"); },
  get STITCH_API() { return read("STITCH_API", "http://localhost:3012"); },
  get EMPIRE_API() { return read("EMPIRE_API", "http://localhost:3060"); },
  get STITCH_PUBLIC_URL() { return read("STITCH_PUBLIC_URL", "https://stitch.ps-tools.dev"); },

  get CLONE_ARCHITECT_DIR() { return read("CLONE_ARCHITECT_DIR", "/home/paul/clone-architect"); },
  get PA_DATA_DIR() { return read("PA_DATA_DIR", "/opt/paul-architect/data"); },
  get PA_RUNS_DIR() { return read("PA_RUNS_DIR", "/opt/paul-architect/data/runs"); },
  get PLAYWRIGHT_BROWSERS_PATH() { return read("PLAYWRIGHT_BROWSERS_PATH", "/home/paul/.cache/ms-playwright"); },

  get AUTH_USER() { return read("PA_USER", "paul.sainton"); },
  get AUTH_PASS_HASH() { return read("PA_PASS_HASH"); },
  get AUTH_PASS_PLAIN() { return read("PA_PASS"); },

  get RUN_TTL_MS() { return readInt("RUN_TTL_MS", 259200000); },
  get MAX_RUNS_IN_MEMORY() { return readInt("MAX_RUNS_IN_MEMORY", 100); },
  get MAX_EVENTS_PER_RUN() { return readInt("MAX_EVENTS_PER_RUN", 500); },
  get MAX_EVENTS_CLIENT() { return readInt("MAX_EVENTS_CLIENT", 200); },

  get STITCH_TIMEOUT_MS() { return readInt("STITCH_TIMEOUT_MS", 10000); },
  get CLONE_TIMEOUT_MS() { return readInt("CLONE_TIMEOUT_MS", 180000); },

  // Anthropic SDK (T6 — code generation)
  get ANTHROPIC_API_KEY() { return read("ANTHROPIC_API_KEY"); },
  get ANTHROPIC_MODEL() { return read("ANTHROPIC_MODEL", "claude-sonnet-4-5-20250929"); },
  get ANTHROPIC_MAX_TOKENS() { return readInt("ANTHROPIC_MAX_TOKENS", 8192); },
  get ANTHROPIC_TIMEOUT_MS() { return readInt("ANTHROPIC_TIMEOUT_MS", 90000); },
};

// Alias r\u00e9gression
export const BENCH_API = CONFIG.BENCH_API;
export const STITCH_API = CONFIG.STITCH_API;
export const EMPIRE_API = CONFIG.EMPIRE_API;
