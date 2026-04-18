/**
 * Config centralis\u00e9e — source unique de v\u00e9rit\u00e9 pour URLs / paths / credentials.
 * Toutes les URLs hardcod\u00e9es du projet doivent passer par ici.
 */

export const CONFIG = {
  // APIs locales
  BENCH_API: process.env.BENCH_API || "http://localhost:3010",
  STITCH_API: process.env.STITCH_API || "http://localhost:3012",
  EMPIRE_API: process.env.EMPIRE_API || "http://localhost:3060",

  // URLs publiques
  STITCH_PUBLIC_URL: process.env.STITCH_PUBLIC_URL || "https://stitch.ps-tools.dev",

  // Paths
  CLONE_ARCHITECT_DIR: process.env.CLONE_ARCHITECT_DIR || "/home/paul/clone-architect",
  PA_DATA_DIR: process.env.PA_DATA_DIR || "/opt/paul-architect/data",
  PA_RUNS_DIR: process.env.PA_RUNS_DIR || "/opt/paul-architect/data/runs",
  PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH || "/home/paul/.cache/ms-playwright",

  // Auth (les valeurs sensibles sont dans .env.local)
  AUTH_USER: process.env.PA_USER || "paul.sainton",
  AUTH_PASS_HASH: process.env.PA_PASS_HASH || "",  // bcrypt hash, set in Action 7
  AUTH_PASS_PLAIN: process.env.PA_PASS || "",      // fallback plain (d\u00e9pr\u00e9ci\u00e9 \u2014 d\u00e9gag\u00e9 Action 7)

  // TTLs & limits
  RUN_TTL_MS: parseInt(process.env.RUN_TTL_MS || "259200000"),  // 72h pour completed
  MAX_RUNS_IN_MEMORY: parseInt(process.env.MAX_RUNS_IN_MEMORY || "100"),
  MAX_EVENTS_PER_RUN: parseInt(process.env.MAX_EVENTS_PER_RUN || "500"),
  MAX_EVENTS_CLIENT: parseInt(process.env.MAX_EVENTS_CLIENT || "200"),

  // Timeouts
  STITCH_TIMEOUT_MS: parseInt(process.env.STITCH_TIMEOUT_MS || "10000"),
  CLONE_TIMEOUT_MS: parseInt(process.env.CLONE_TIMEOUT_MS || "180000"),
};

// Alias r\u00e9gression pour code legacy
export const BENCH_API = CONFIG.BENCH_API;
export const STITCH_API = CONFIG.STITCH_API;
export const EMPIRE_API = CONFIG.EMPIRE_API;
