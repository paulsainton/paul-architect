/**
 * Logger structur\u00e9 l\u00e9ger (sans d\u00e9pendance pino pour \u00e9viter bundle overhead).
 * Format JSON en prod, coloris\u00e9 en dev.
 */

type Level = "debug" | "info" | "warn" | "error";

const LEVELS: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN_LEVEL: Level = (process.env.LOG_LEVEL as Level) || (process.env.NODE_ENV === "production" ? "info" : "debug");
const IS_PROD = process.env.NODE_ENV === "production";

interface LogContext {
  module?: string;
  runId?: string;
  url?: string;
  error?: unknown;
  [key: string]: unknown;
}

function format(level: Level, msg: string, ctx: LogContext = {}): string {
  if (IS_PROD) {
    return JSON.stringify({
      t: new Date().toISOString(),
      level,
      msg,
      ...ctx,
      ...(ctx.error instanceof Error ? { error: ctx.error.message, stack: ctx.error.stack } : {}),
    });
  }
  // Dev : format lisible + colors
  const colors = { debug: "\x1b[90m", info: "\x1b[36m", warn: "\x1b[33m", error: "\x1b[31m" };
  const reset = "\x1b[0m";
  const prefix = `${colors[level]}[${level.toUpperCase()}]${reset}`;
  const mod = ctx.module ? `\x1b[35m[${ctx.module}]${reset}` : "";
  const extras = Object.entries(ctx)
    .filter(([k]) => k !== "module" && k !== "error")
    .map(([k, v]) => `${k}=${typeof v === "string" ? v : JSON.stringify(v)}`)
    .join(" ");
  const err = ctx.error instanceof Error ? `\n  \u2192 ${ctx.error.message}` : "";
  return `${prefix} ${mod} ${msg} ${extras}${err}`;
}

function shouldLog(level: Level): boolean {
  return LEVELS[level] >= LEVELS[MIN_LEVEL];
}

export const log = {
  debug: (msg: string, ctx?: LogContext) => shouldLog("debug") && console.log(format("debug", msg, ctx)),
  info: (msg: string, ctx?: LogContext) => shouldLog("info") && console.log(format("info", msg, ctx)),
  warn: (msg: string, ctx?: LogContext) => shouldLog("warn") && console.warn(format("warn", msg, ctx)),
  error: (msg: string, ctx?: LogContext) => shouldLog("error") && console.error(format("error", msg, ctx)),

  // Factory pour logger scoped par module
  scope: (module: string) => ({
    debug: (msg: string, ctx?: Omit<LogContext, "module">) => log.debug(msg, { ...ctx, module }),
    info: (msg: string, ctx?: Omit<LogContext, "module">) => log.info(msg, { ...ctx, module }),
    warn: (msg: string, ctx?: Omit<LogContext, "module">) => log.warn(msg, { ...ctx, module }),
    error: (msg: string, ctx?: Omit<LogContext, "module">) => log.error(msg, { ...ctx, module }),
  }),
};
